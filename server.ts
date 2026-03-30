import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";

async function getAccessToken() {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const resource = (process.env.DATAVERSE_URL || "").replace(/\/$/, "");

  if (!tenantId || !clientId || !clientSecret || !resource) {
    const missing = [];
    if (!tenantId) missing.push("MICROSOFT_TENANT_ID");
    if (!clientId) missing.push("MICROSOFT_CLIENT_ID");
    if (!clientSecret) missing.push("MICROSOFT_CLIENT_SECRET");
    if (!resource) missing.push("DATAVERSE_URL");
    
    console.error(`Missing Dataverse configuration: ${missing.join(", ")}`);
    return { error: `Missing configuration: ${missing.join(", ")}` };
  }

  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("scope", `${resource}/.default`);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "client_credentials");

  try {
    const response = await axios.post(url, params);
    return { token: response.data.access_token };
  } catch (error: any) {
    console.error("Error getting access token:", error.response?.data || error.message);
    return { error: `Token acquisition failed: ${error.response?.data?.error_description || error.message}` };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Diagnostic endpoint to check Dataverse configuration
  app.get("/api/health", async (req, res) => {
    const config = {
      tenantId: !!process.env.MICROSOFT_TENANT_ID,
      clientId: !!process.env.MICROSOFT_CLIENT_ID,
      clientSecret: !!process.env.MICROSOFT_CLIENT_SECRET,
      dataverseUrl: !!process.env.DATAVERSE_URL,
      nodeEnv: process.env.NODE_ENV || "development"
    };
    
    const isConfigured = config.tenantId && config.clientId && config.clientSecret && config.dataverseUrl;
    let tableStatus = "unknown";
    let tableError = null;
    let choiceMetadata: any = {};

    if (isConfigured) {
      const result = await getAccessToken();
      if (result.token) {
        try {
          const resource = (process.env.DATAVERSE_URL || "").replace(/\/$/, "");
          // Try to fetch the entity definition to see if the table exists
          const url1 = `${resource}/api/data/v9.2/EntityDefinitions(LogicalName='new_requests')?$select=EntitySetName,LogicalName`;
          const url2 = `${resource}/api/data/v9.2/EntityDefinitions(LogicalName='new_requestactivities')?$select=EntitySetName,LogicalName`;
          
          const [resp1, resp2] = await Promise.all([
            axios.get(url1, { headers: { Authorization: `Bearer ${result.token}`, Accept: "application/json" } }),
            axios.get(url2, { headers: { Authorization: `Bearer ${result.token}`, Accept: "application/json" } }).catch(() => ({ data: { EntitySetName: "not_found" } }))
          ]);

          tableStatus = "found";
          tableError = `Requests: ${resp1.data.EntitySetName}, Activities: ${resp2.data.EntitySetName}`;

          // Fetch Choice Metadata for new_type and new_priority
          const fetchChoice = async (attrName: string) => {
            try {
              const metaUrl = `${resource}/api/data/v9.2/EntityDefinitions(LogicalName='new_requests')/Attributes(LogicalName='${attrName}')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet($select=Options)`;
              const metaResp = await axios.get(metaUrl, { headers: { Authorization: `Bearer ${result.token}`, Accept: "application/json" } });
              return metaResp.data.OptionSet.Options.map((opt: any) => ({
                label: opt.Label.UserLocalizedLabel.Label,
                value: opt.Value
              }));
            } catch (e) {
              return `Error fetching ${attrName}: ${e instanceof Error ? e.message : String(e)}`;
            }
          };

          choiceMetadata.new_type = await fetchChoice('new_type');
          choiceMetadata.new_priority = await fetchChoice('new_priority');
          choiceMetadata.new_status = await fetchChoice('new_status');

        } catch (error: any) {
          tableStatus = "not_found";
          tableError = error.response?.data?.error?.message || error.message;
        }
      } else {
        tableStatus = "auth_failed";
        tableError = result.error;
      }
    }
    
    res.json({
      status: isConfigured ? "configured" : "missing_config",
      config,
      tableCheck: {
        status: tableStatus,
        details: tableError
      },
      choiceMetadata
    });
  });

  // API Routes for Dataverse
  app.get("/api/requests", async (req, res) => {
    const result = await getAccessToken();
    if (result.error) return res.status(500).json({ error: result.error });
    const token = result.token;

    const resource = (process.env.DATAVERSE_URL || "").replace(/\/$/, "");
    const url = `${resource}/api/data/v9.2/new_requestses?$select=new_requestid,new_title,new_type,new_status,new_priority,new_submittedon,new_description`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
          Accept: "application/json",
          "Prefer": "odata.include-annotations=\"*\"" // Include labels
        },
      });

      const requests = response.data.value.map((item: any) => ({
        id: item.new_requestid,
        title: item.new_title,
        type: item["new_type@OData.Community.Display.V1.FormattedValue"] || item.new_type,
        status: item["new_status@OData.Community.Display.V1.FormattedValue"] || item.new_status,
        priority: item["new_priority@OData.Community.Display.V1.FormattedValue"] || item.new_priority,
        submittedOn: item.new_submittedon,
        description: item.new_description,
      }));

      res.json(requests);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.error("Error fetching requests from Dataverse:", errorMsg);
      res.status(500).json({ error: `Dataverse API Error: ${errorMsg}` });
    }
  });

  app.post("/api/requests", async (req, res) => {
    const result = await getAccessToken();
    if (result.error) return res.status(500).json({ error: result.error });
    const token = result.token;

    const { title, type, priority, description } = req.body;
    const resource = (process.env.DATAVERSE_URL || "").replace(/\/$/, "");
    const url = `${resource}/api/data/v9.2/new_requestses`;

    console.log("Incoming request body:", req.body);

    // Default mappings - these should ideally be replaced by dynamic ones or verified
    // Based on common Dataverse patterns, custom options often start with 100000000
    const typeMap: Record<string, number> = { 
      "Pricing": 100000000, 
      "Material Info": 100000001, 
      "Spares": 100000002, 
      "Catalog": 100000003 
    };
    const priorityMap: Record<string, number> = { 
      "Low": 100000000, 
      "Medium": 100000001, 
      "High": 100000002 
    };
    const statusMap: Record<string, number> = { 
      "Sent": 100000000, 
      "In Progress": 100000001, 
      "Completed": 100000002 
    };

    const payload = {
      new_title: title,
      new_type: typeMap[type] || 100000000,
      new_priority: priorityMap[priority] || 100000001,
      new_description: description,
      new_status: statusMap["Sent"] || 100000000,
      new_submittedon: new Date().toISOString(),
    };

    console.log("Sending payload to Dataverse:", JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post(
        url,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      res.status(201).json({ message: "Request created in Dataverse", data: response.data });
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorMsg = errorData?.error?.message || error.message;
      console.error("Error creating request in Dataverse:", JSON.stringify(errorData, null, 2));
      res.status(500).json({ error: `Dataverse API Error: ${errorMsg}`, details: errorData });
    }
  });

  app.get("/api/requests/:id", async (req, res) => {
    const result = await getAccessToken();
    if (result.error) return res.status(500).json({ error: result.error });
    const token = result.token;

    const { id } = req.params;
    const resource = (process.env.DATAVERSE_URL || "").replace(/\/$/, "");
    const url = `${resource}/api/data/v9.2/new_requestses(${id})?$select=new_requestid,new_title,new_type,new_status,new_priority,new_submittedon,new_description`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
          Accept: "application/json",
          "Prefer": "odata.include-annotations=\"*\""
        },
      });

      const item = response.data;
      const request = {
        id: item.new_requestid,
        title: item.new_title,
        type: item["new_type@OData.Community.Display.V1.FormattedValue"] || item.new_type,
        status: item["new_status@OData.Community.Display.V1.FormattedValue"] || item.new_status,
        priority: item["new_priority@OData.Community.Display.V1.FormattedValue"] || item.new_priority,
        submittedOn: item.new_submittedon,
        description: item.new_description,
      };

      res.json(request);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.error("Error fetching request from Dataverse:", errorMsg);
      res.status(500).json({ error: `Dataverse API Error: ${errorMsg}` });
    }
  });

  app.get("/api/requests/:id/activities", async (req, res) => {
    const result = await getAccessToken();
    if (result.error) return res.status(500).json({ error: result.error });
    const token = result.token;

    const { id } = req.params;
    const resource = (process.env.DATAVERSE_URL || "").replace(/\/$/, "");
    // Filter activities by the lookup field 'new_request'
    const url = `${resource}/api/data/v9.2/new_requestactivitieses?$filter=_new_request_value eq ${id}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
          Accept: "application/json",
        },
      });

      const activities = response.data.value.map((item: any) => ({
        type: item.new_activitytype,
        desc: item.new_activitydesc,
        date: item.new_activitydate,
      }));

      res.json(activities);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.error("Error fetching activities from Dataverse:", errorMsg);
      res.status(500).json({ error: `Dataverse API Error: ${errorMsg}` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
