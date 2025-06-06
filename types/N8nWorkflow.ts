export interface N8nWorkflow {
  id?: string;
  name: string;
  active: boolean;
  nodes: N8nNode[];
  connections: N8nConnections;
  settings?: N8nWorkflowSettings;
  staticData?: Record<string, any>;
  tags?: string[];
  meta?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  webhookId?: string;
  continueOnFail?: boolean;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  notes?: string;
  color?: string;
  disabled?: boolean;
}

export interface N8nConnections {
  [sourceNodeName: string]: {
    [outputType: string]: Array<{
      node: string;
      type: string;
      index: number;
    }>;
  };
}

export interface N8nWorkflowSettings {
  executionOrder?: 'v0' | 'v1';
  saveManualExecutions?: boolean;
  callerPolicy?: 'workflowsFromSameOwner' | 'workflowsFromAList' | 'any';
  callerIds?: string;
  errorWorkflow?: string;
  timezone?: string;
  saveExecutionProgress?: boolean;
  saveDataErrorExecution?: 'all' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
  executionTimeout?: number;
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  mode: 'manual' | 'trigger' | 'webhook' | 'error' | 'retry';
  startedAt: string;
  stoppedAt?: string;
  finished: boolean;
  retryOf?: string;
  retrySuccessId?: string;
  status: 'new' | 'running' | 'success' | 'error' | 'canceled' | 'crashed' | 'waiting';
  data?: N8nExecutionData;
}

export interface N8nExecutionData {
  resultData: {
    runData: Record<string, N8nNodeRunData[]>;
    pinData?: Record<string, any>;
    lastNodeExecuted?: string;
    error?: N8nExecutionError;
  };
  executionData?: {
    contextData: Record<string, any>;
    nodeExecutionStack: any[];
    metadata: Record<string, any>;
    waitingExecution: Record<string, any>;
    waitingExecutionSource: Record<string, any>;
  };
}

export interface N8nNodeRunData {
  startTime: number;
  executionTime: number;
  data?: {
    main?: any[][];
  };
  error?: N8nExecutionError;
  source?: any[];
}

export interface N8nExecutionError {
  message: string;
  name: string;
  stack?: string;
  node?: {
    name: string;
    type: string;
  };
  timestamp: number;
  context?: Record<string, any>;
}

export interface N8nCredential {
  id: string;
  name: string;
  type: string;
  data: Record<string, any>;
  nodesAccess: Array<{
    nodeType: string;
  }>;
  sharedWith?: Array<{
    id: string;
    email: string;
    role: string;
  }>;
}

export interface N8nWebhook {
  id: string;
  workflowId: string;
  node: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  path: string;
  isFullPath: boolean;
  responseMode: 'onReceived' | 'lastNode' | 'responseNode';
  responseData?: string;
}

export interface N8nClientConfig {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
  timeout?: number;
  retries?: number;
}

export interface N8nWorkflowTemplate {
  name: string;
  description: string;
  category: string;
  nodes: Partial<N8nNode>[];
  connections: Partial<N8nConnections>;
  variables: Record<string, any>;
  requiredCredentials: string[];
}
