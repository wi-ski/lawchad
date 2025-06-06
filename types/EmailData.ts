export interface EmailData {
  id: string;
  messageId: string;
  threadId?: string;
  subject: string;
  sender: string;
  recipients: string[];
  body: string;
  htmlBody?: string;
  attachments: EmailAttachment[];
  timestamp: Date;
  labels: string[];
  isRead: boolean;
  isImportant: boolean;
}

export interface EmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
  content?: Buffer;
}

export interface EmailAnalysis {
  emailType: {
    primaryType: string;
    confidence: number;
    subTypes: string[];
  };
  priorityAssessment: {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    reasoning: string;
    urgencyFactors: string[];
  };
  deadlines: {
    detected: boolean;
    dates: Date[];
    descriptions: string[];
  };
  valueExtraction: {
    monetaryValue?: number;
    currency?: string;
    contractValue?: number;
    caseValue?: number;
  };
  entities: {
    people: string[];
    organizations: string[];
    locations: string[];
    dates: Date[];
    caseNumbers: string[];
  };
  actionItems: string[];
  suggestedWorkflow: string;
}

export interface EmailProcessingResult {
  success: boolean;
  analysis: EmailAnalysis;
  routing: {
    assignedTo: string;
    department: string;
    workflowTriggered: string;
    escalationLevel: number;
  };
  notifications: {
    sent: boolean;
    recipients: string[];
    channels: string[];
  };
  error?: string;
}

export interface GmailCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
  expiryDate?: number;
}
