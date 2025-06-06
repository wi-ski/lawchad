import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { N8nWorkflow, N8nExecutionData } from '../../types/N8nWorkflow';

export class N8nClient {
  private apiClient: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;
  private isInitialized: boolean = false;

  constructor(baseUrl?: string, apiKey?: string) {
    this.baseUrl = baseUrl || process.env.N8N_BASE_URL || 'http://localhost:5678';
    this.apiKey = apiKey || process.env.N8N_API_KEY || '';
    
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.apiKey
      },
      timeout: 30000
    });
  }

  async initialize(): Promise<void> {
    try {
      await this.testConnection();
      this.isInitialized = true;
      console.log('🔗 N8n Client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize N8n Client:', error);
      throw new Error(`N8n initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.apiClient.get('/rest/active');
      console.log('✅ N8n connection test successful');
      return response.status === 200;
    } catch (error) {
      console.error('❌ N8n connection test failed:', error);
      throw error;
    }
  }

  async createWorkflow(workflow: N8nWorkflow): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🔧 Creating n8n workflow: ${workflow.name}`);
      
      const response: AxiosResponse = await this.apiClient.post('/rest/workflows', workflow);
      
      if (response.status === 201 || response.status === 200) {
        const workflowId = response.data.id;
        console.log(`✅ Workflow created successfully: ${workflowId}`);
        
        if (workflow.active) {
          await this.activateWorkflow(workflowId);
        }
        
        return { success: true, workflowId };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error creating workflow:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async updateWorkflow(workflowId: string, workflow: Partial<N8nWorkflow>): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🔄 Updating n8n workflow: ${workflowId}`);
      
      const response = await this.apiClient.patch(`/rest/workflows/${workflowId}`, workflow);
      
      if (response.status === 200) {
        console.log(`✅ Workflow updated successfully: ${workflowId}`);
        return { success: true };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error updating workflow:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async deleteWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🗑️ Deleting n8n workflow: ${workflowId}`);
      
      await this.deactivateWorkflow(workflowId);
      
      const response = await this.apiClient.delete(`/rest/workflows/${workflowId}`);
      
      if (response.status === 200) {
        console.log(`✅ Workflow deleted successfully: ${workflowId}`);
        return { success: true };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error deleting workflow:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async activateWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`▶️ Activating workflow: ${workflowId}`);
      
      const response = await this.apiClient.patch(`/rest/workflows/${workflowId}/activate`);
      
      if (response.status === 200) {
        console.log(`✅ Workflow activated: ${workflowId}`);
        return { success: true };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error activating workflow:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async deactivateWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`⏸️ Deactivating workflow: ${workflowId}`);
      
      const response = await this.apiClient.patch(`/rest/workflows/${workflowId}/deactivate`);
      
      if (response.status === 200) {
        console.log(`✅ Workflow deactivated: ${workflowId}`);
        return { success: true };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error deactivating workflow:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async executeWorkflow(workflowId: string, inputData?: Record<string, unknown>): Promise<{ success: boolean; executionId?: string; data?: Record<string, unknown>; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🚀 Executing workflow: ${workflowId}`);
      
      const payload = {
        workflowData: inputData || {}
      };
      
      const response = await this.apiClient.post(`/rest/workflows/${workflowId}/execute`, payload);
      
      if (response.status === 200 || response.status === 201) {
        const executionId = response.data.executionId;
        console.log(`✅ Workflow execution started: ${executionId}`);
        
        const executionResult = await this.waitForExecution(executionId);
        
        return { 
          success: true, 
          executionId, 
          data: executionResult.data 
        };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error executing workflow:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getWorkflow(workflowId: string): Promise<{ success: boolean; workflow?: N8nWorkflow; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await this.apiClient.get(`/rest/workflows/${workflowId}`);
      
      if (response.status === 200) {
        return { success: true, workflow: response.data };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error getting workflow ${workflowId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async listWorkflows(): Promise<{ success: boolean; workflows?: N8nWorkflow[]; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await this.apiClient.get('/rest/workflows');
      
      if (response.status === 200) {
        return { success: true, workflows: response.data.data || [] };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error listing workflows:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getExecutionStatus(executionId: string): Promise<{ success: boolean; status?: string; data?: Record<string, unknown>; error?: string }> {
    try {
      const response = await this.apiClient.get(`/rest/executions/${executionId}`);
      
      if (response.status === 200) {
        const execution = response.data;
        return { 
          success: true, 
          status: execution.finished ? 'completed' : 'running',
          data: execution.data 
        };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error getting execution status ${executionId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async waitForExecution(executionId: string, timeoutMs: number = 60000): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
    const startTime = Date.now();
    const pollInterval = 2000;
    
    while (Date.now() - startTime < timeoutMs) {
      const statusResult = await this.getExecutionStatus(executionId);
      
      if (!statusResult.success) {
        return { success: false, error: statusResult.error };
      }
      
      if (statusResult.status === 'completed') {
        console.log(`✅ Execution completed: ${executionId}`);
        return { success: true, data: statusResult.data };
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    return { success: false, error: 'Execution timeout' };
  }

  async triggerWebhook(webhookPath: string, data: Record<string, unknown>): Promise<{ success: boolean; response?: Record<string, unknown>; error?: string }> {
    try {
      console.log(`🔗 Triggering webhook: ${webhookPath}`);
      
      const webhookUrl = `${this.baseUrl}/webhook/${webhookPath}`;
      const response = await axios.post(webhookUrl, data, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      });
      
      if (response.status === 200) {
        console.log(`✅ Webhook triggered successfully: ${webhookPath}`);
        return { success: true, response: response.data };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error triggering webhook ${webhookPath}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async createCredentials(name: string, type: string, data: Record<string, unknown>): Promise<{ success: boolean; credentialId?: string; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`🔐 Creating credentials: ${name} (${type})`);
      
      const payload = {
        name,
        type,
        data
      };
      
      const response = await this.apiClient.post('/rest/credentials', payload);
      
      if (response.status === 201 || response.status === 200) {
        const credentialId = response.data.id;
        console.log(`✅ Credentials created: ${credentialId}`);
        return { success: true, credentialId };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error creating credentials:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getWorkflowExecutions(workflowId: string, limit: number = 10): Promise<{ success: boolean; executions?: N8nExecutionData[]; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await this.apiClient.get(`/rest/executions`, {
        params: {
          filter: JSON.stringify({ workflowId }),
          limit
        }
      });
      
      if (response.status === 200) {
        return { success: true, executions: response.data.data || [] };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error getting executions for workflow ${workflowId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getSystemInfo(): Promise<{ success: boolean; info?: Record<string, unknown>; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await this.apiClient.get('/rest/settings');
      
      if (response.status === 200) {
        return { success: true, info: response.data };
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error getting system info:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async validateWorkflow(workflow: N8nWorkflow): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!workflow.name || workflow.name.trim() === '') {
      errors.push('Workflow name is required');
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      errors.push('Workflow must have at least one node');
    }

    if (workflow.nodes) {
      const nodeNames = new Set<string>();
      
      for (const node of workflow.nodes) {
        if (!node.name || node.name.trim() === '') {
          errors.push('All nodes must have a name');
        }
        
        if (nodeNames.has(node.name)) {
          errors.push(`Duplicate node name: ${node.name}`);
        }
        nodeNames.add(node.name);
        
        if (!node.type || node.type.trim() === '') {
          errors.push(`Node ${node.name} must have a type`);
        }
      }
    }

    if (workflow.connections) {
      for (const [nodeName, connections] of Object.entries(workflow.connections)) {
        if (!workflow.nodes?.find(n => n.name === nodeName)) {
          errors.push(`Connection references non-existent node: ${nodeName}`);
        }
        
        if (connections.main) {
          for (const connection of connections.main) {
            if (!workflow.nodes?.find(n => n.name === connection.node)) {
              errors.push(`Connection references non-existent target node: ${connection.node}`);
            }
          }
        }
      }
    }

    const valid = errors.length === 0;
    
    console.log(`🔍 Workflow validation: ${valid ? 'VALID' : 'INVALID'} (${errors.length} errors, ${warnings.length} warnings)`);
    
    return { valid, errors, warnings };
  }

  getApiClient(): AxiosInstance {
    return this.apiClient;
  }

  isConnected(): boolean {
    return this.isInitialized;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}
