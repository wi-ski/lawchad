export interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  attorneyId: string;
  version: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  triggers: WorkflowTrigger[];
  steps: WorkflowStep[];
  routing: RoutingRule[];
  notifications: NotificationConfig[];
  customRules: CustomRule[];
  metadata: WorkflowMetadata;
}

export interface WorkflowTrigger {
  type: 'email_received' | 'slack_message' | 'calendar_event' | 'document_upload' | 'manual_trigger';
  conditions: TriggerCondition[];
  priority: number;
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex_match' | 'in_list';
  value: any;
  caseSensitive?: boolean;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'analysis' | 'routing' | 'notification' | 'document_processing' | 'approval' | 'integration';
  action: string;
  parameters: Record<string, any>;
  conditions?: TriggerCondition[];
  onSuccess?: string;
  onFailure?: string;
  timeout?: number;
}

export interface RoutingRule {
  id: string;
  name: string;
  conditions: TriggerCondition[];
  target: {
    type: 'attorney' | 'department' | 'external_system';
    identifier: string;
  };
  priority: number;
  escalationRules?: EscalationRule[];
}

export interface EscalationRule {
  condition: string;
  delay: number;
  target: string;
  action: string;
}

export interface NotificationConfig {
  id: string;
  trigger: string;
  channels: ('slack' | 'email' | 'sms' | 'calendar')[];
  recipients: string[];
  template: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  parameters: Record<string, any>;
  isActive: boolean;
}

export interface WorkflowMetadata {
  tags: string[];
  category: string;
  jurisdiction?: string;
  practiceArea: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedDuration?: number;
  requiredApprovals: string[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: Partial<WorkflowConfig>;
  variables: TemplateVariable[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'list';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: any[];
}
