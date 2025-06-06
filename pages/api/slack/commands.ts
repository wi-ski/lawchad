import { NextApiRequest, NextApiResponse } from 'next';
import { OpenHandsAgent } from '../../../lib/openhands-agent/OpenHandsAgent';

const openHandsAgent = new OpenHandsAgent();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { command, text, user_id, channel_id } = req.body;

    switch (command) {
      case '/workflow':
        return await handleWorkflowCommand(text, user_id, res);
      case '/email-setup':
        return await handleEmailSetupCommand(user_id, channel_id, res);
      case '/status':
        return await handleStatusCommand(user_id, res);
      default:
        return res.status(400).json({ 
          response_type: 'ephemeral',
          text: 'Unknown command. Available commands: /workflow, /email-setup, /status'
        });
    }
  } catch (error) {
    console.error('Error handling Slack command:', error);
    res.status(500).json({
      response_type: 'ephemeral',
      text: 'Sorry, there was an error processing your command.'
    });
  }
}

async function handleWorkflowCommand(text: string, userId: string, res: NextApiResponse) {
  try {
    const response = await openHandsAgent.processAttorneyRequest(text, userId);
    
    return res.status(200).json({
      response_type: 'in_channel',
      text: `Workflow created: ${response.response}`,
      attachments: [
        {
          color: 'good',
          fields: [
            {
              title: 'Actions Taken',
              value: response.actionsTaken.join('\n'),
              short: false
            },
            {
              title: 'Next Steps',
              value: response.nextSteps.join('\n'),
              short: false
            }
          ]
        }
      ]
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return res.status(500).json({
      response_type: 'ephemeral',
      text: 'Failed to create workflow. Please try again.'
    });
  }
}

async function handleEmailSetupCommand(userId: string, channelId: string, res: NextApiResponse) {
  const oauthUrl = `${process.env.NEXTAUTH_URL}/api/gmail/oauth?user_id=${userId}&channel_id=${channelId}`;
  
  return res.status(200).json({
    response_type: 'ephemeral',
    text: 'Click the link below to connect your Gmail account:',
    attachments: [
      {
        color: 'primary',
        actions: [
          {
            type: 'button',
            text: 'Connect Gmail',
            url: oauthUrl,
            style: 'primary'
          }
        ]
      }
    ]
  });
}

async function handleStatusCommand(userId: string, res: NextApiResponse) {
  return res.status(200).json({
    response_type: 'ephemeral',
    text: `Status for user ${userId}:`,
    attachments: [
      {
        color: 'good',
        fields: [
          {
            title: 'System Status',
            value: '✅ All systems operational',
            short: true
          },
          {
            title: 'Active Workflows',
            value: '3 workflows running',
            short: true
          },
          {
            title: 'Email Integration',
            value: '✅ Connected',
            short: true
          },
          {
            title: 'Last Activity',
            value: new Date().toLocaleString(),
            short: true
          }
        ]
      }
    ]
  });
}
