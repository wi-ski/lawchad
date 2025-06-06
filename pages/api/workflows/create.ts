import { NextApiRequest, NextApiResponse } from 'next';
import { OpenHandsAgent } from '../../../lib/openhands-agent/OpenHandsAgent';
import { WorkflowConfig } from '../../../types/WorkflowConfig';

const openHandsAgent = new OpenHandsAgent();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { workflowType, parameters, attorneyId, name, description } = req.body;
    
    if (!workflowType || !attorneyId) {
      return res.status(400).json({ error: 'Missing required fields: workflowType, attorneyId' });
    }

    const workflowSteps = await openHandsAgent.generateWorkflowSteps(workflowType, parameters || {});
    
    const workflowConfig: Partial<WorkflowConfig> = {
      id: `workflow_${Date.now()}_${attorneyId}`,
      name: name || `${workflowType} Workflow`,
      description: description || `Auto-generated ${workflowType} workflow`,
      attorneyId: attorneyId,
      version: '1.0.0',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      triggers: [
        {
          type: 'email_received',
          conditions: [
            {
              field: 'subject',
              operator: 'contains',
              value: workflowType
            }
          ],
          priority: 1
        }
      ],
      steps: workflowSteps.map((action, index) => ({
        id: `step_${index + 1}`,
        name: `${action.type} Step`,
        type: 'routing',
        action: action.type,
        parameters: action.parameters,
        onSuccess: index < workflowSteps.length - 1 ? `step_${index + 2}` : undefined,
        onFailure: 'error_handler'
      })),
      routing: [
        {
          id: 'default_route',
          name: 'Default Routing',
          conditions: [],
          target: {
            type: 'attorney',
            identifier: attorneyId
          },
          priority: 1
        }
      ],
      notifications: [
        {
          id: 'workflow_start',
          trigger: 'workflow_started',
          channels: ['slack'],
          recipients: [attorneyId],
          template: 'workflow_notification',
          priority: 'medium'
        }
      ],
      customRules: [],
      metadata: {
        tags: [workflowType],
        category: workflowType,
        practiceArea: workflowType,
        complexity: 'medium',
        requiredApprovals: []
      }
    };

    console.log(`Created workflow: ${workflowConfig.id} for attorney ${attorneyId}`);
    
    res.status(201).json({
      success: true,
      workflow: workflowConfig,
      message: 'Workflow created successfully'
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create workflow' 
    });
  }
}
