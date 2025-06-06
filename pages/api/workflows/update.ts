import { NextApiRequest, NextApiResponse } from 'next';
import { OpenHandsAgent } from '../../../lib/openhands-agent/OpenHandsAgent';

const openHandsAgent = new OpenHandsAgent();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { workflowId, updateText, attorneyId } = req.body;
    
    if (!workflowId || !updateText || !attorneyId) {
      return res.status(400).json({ error: 'Missing required fields: workflowId, updateText, attorneyId' });
    }

    const updateResult = await openHandsAgent.updateWorkflowFromText(updateText, attorneyId);
    
    if (updateResult.success) {
      console.log(`Updated workflow ${workflowId} for attorney ${attorneyId}`);
      
      res.status(200).json({
        success: true,
        workflowId: updateResult.workflowId,
        changes: updateResult.changes,
        message: 'Workflow updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to update workflow',
        details: updateResult.changes
      });
    }
  } catch (error) {
    console.error('Error updating workflow:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update workflow' 
    });
  }
}
