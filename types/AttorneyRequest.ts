export interface AttorneyRequest {
  id: string;
  attorneyId: string;
  requestText: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'contract_review' | 'immigration' | 'litigation' | 'compliance' | 'real_estate' | 'employment' | 'general';
  metadata?: {
    clientId?: string;
    caseId?: string;
    deadline?: Date;
    value?: number;
    jurisdiction?: string;
  };
}

export interface AttorneyResponse {
  requestId: string;
  response: string;
  actionsTaken: string[];
  workflowsTriggered: string[];
  nextSteps: string[];
  timestamp: Date;
}

export interface AttorneyProfile {
  id: string;
  name: string;
  email: string;
  specializations: string[];
  seniorityLevel: 'junior' | 'mid' | 'senior' | 'partner';
  workloadCapacity: number;
  currentCaseload: number;
}

export interface WorkflowAction {
  type: 'email_route' | 'document_review' | 'calendar_schedule' | 'notification_send' | 'approval_request';
  target: string;
  parameters: Record<string, any>;
  priority: number;
  deadline?: Date;
}
