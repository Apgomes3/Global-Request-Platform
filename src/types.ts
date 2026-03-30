export type RequestStatus = 'Sent' | 'In Progress' | 'Received' | 'Completed';

export interface RequestItem {
  id: string;
  title: string;
  type: string;
  status: RequestStatus;
  submittedOn: string;
  requester?: string;
  requesterRole?: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
}

export const MOCK_REQUESTS: RequestItem[] = [
  {
    id: '#PRC-9021',
    title: 'Executive Pricing Review',
    type: 'Pricing',
    status: 'In Progress',
    submittedOn: '2023-10-22T09:00:00Z',
    requester: 'Johnathan Doe',
    requesterRole: 'Pricing Analyst',
    description: 'Quarterly pricing review for the European market segments.',
    priority: 'High'
  },
  {
    id: '#MAT-4432',
    title: 'Raw Material Inventory',
    type: 'Material Info',
    status: 'Received',
    submittedOn: '2023-10-20T10:30:00Z',
    requester: 'Sarah Miller',
    requesterRole: 'Procurement Specialist',
    description: 'Detailed breakdown of raw material availability for Q4 production.',
    priority: 'Medium'
  },
  {
    id: '#SPR-1108',
    title: 'Critical Spares Procurement',
    type: 'Spares',
    status: 'Completed',
    submittedOn: '2023-10-18T14:15:00Z',
    requester: 'Alex Kumar',
    requesterRole: 'Maintenance Lead',
    description: 'Emergency procurement of turbine blades for the main generator.',
    priority: 'High'
  },
  {
    id: '#CAT-5590',
    title: 'Product Catalog Update',
    type: 'Catalog',
    status: 'Sent',
    submittedOn: '2023-10-15T11:45:00Z',
    requester: 'Elena Lopez',
    requesterRole: 'Marketing Manager',
    description: 'Annual update to the enterprise product catalog.',
    priority: 'Low'
  },
  {
    id: '#PRC-8812',
    title: 'Vendor Pricing Audit',
    type: 'Pricing',
    status: 'Completed',
    submittedOn: '2023-10-12T16:20:00Z',
    requester: 'Robert Hart',
    requesterRole: 'Financial Auditor',
    description: 'Audit of vendor pricing agreements for compliance.',
    priority: 'Medium'
  }
];
