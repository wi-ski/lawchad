import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { workflowId, data, attorneyId } = req.body;
    
    if (!workflowId) {
      return res.status(400).json({ error: 'Missing required field: workflowId' });
    }

    const n8nUrl = process.env.N8N_API_URL;
    const n8nApiKey = process.env.N8N_API_KEY;
    
    if (!n8nUrl || !n8nApiKey) {
      return res.status(500).json({ error: 'N8N configuration missing' });
    }

    const triggerResponse = await axios.post(
      `${n8nUrl}/api/v1/workflows/${workflowId}/execute`,
      {
        data: {
          ...data,
          attorneyId,
          timestamp: new Date().toISOString()
        }
      },
      {
        headers: {
          'X-N8N-API-KEY': n8nApiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log(`Triggered n8n workflow ${workflowId} for attorney ${attorneyId}`);
    
    res.status(200).json({
      success: true,
      executionId: triggerResponse.data.executionId,
      status: triggerResponse.data.status,
      message: 'Workflow triggered successfully'
    });
  } catch (error) {
    console.error('Error triggering n8n workflow:', error);
    
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).json({
        success: false,
        error: 'Failed to trigger workflow',
        details: error.response?.data || error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to trigger workflow'
      });
    }
  }
}
