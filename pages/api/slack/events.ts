import { NextApiRequest, NextApiResponse } from 'next';
import { OpenHandsAgent } from '../../../lib/openhands-agent/OpenHandsAgent';
import { SlackEvent } from '../../../types/SlackEvent';

const openHandsAgent = new OpenHandsAgent();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, challenge, event } = req.body as SlackEvent & { challenge?: string };

    if (type === 'url_verification') {
      return res.status(200).json({ challenge });
    }

    if (type === 'event_callback' && event) {
      await handleSlackEvent(event, res);
    } else {
      res.status(200).json({ status: 'ok' });
    }
  } catch (error) {
    console.error('Error handling Slack event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleSlackEvent(event: any, res: NextApiResponse) {
  try {
    if (event.type === 'message' && !event.bot_id) {
      const response = await openHandsAgent.processAttorneyRequest(
        event.text || '',
        event.user || 'unknown'
      );
      
      console.log('Processed Slack message:', response.requestId);
    }
    
    res.status(200).json({ status: 'processed' });
  } catch (error) {
    console.error('Error processing Slack event:', error);
    res.status(500).json({ error: 'Failed to process event' });
  }
}
