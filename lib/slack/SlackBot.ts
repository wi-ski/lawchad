import { WebClient } from '@slack/web-api';
import { OpenHandsAgent } from '../openhands-agent/OpenHandsAgent';
import { SlackEvent, SlackMessage, SlackInteractivePayload } from '../../types/SlackEvent';

export class SlackBot {
  private client: WebClient;
  private openHandsAgent: OpenHandsAgent;
  private isInitialized: boolean = false;

  constructor() {
    this.client = new WebClient(process.env.SLACK_BOT_TOKEN);
    this.openHandsAgent = new OpenHandsAgent();
  }

  async initialize(): Promise<void> {
    if (!process.env.SLACK_BOT_TOKEN) {
      throw new Error('SLACK_BOT_TOKEN environment variable is required');
    }
    
    if (!process.env.SLACK_SIGNING_SECRET) {
      throw new Error('SLACK_SIGNING_SECRET environment variable is required');
    }

    await this.openHandsAgent.initialize();
    this.isInitialized = true;
    console.log('🤖 Slack Bot initialized successfully');
  }

  async handleEvent(event: SlackEvent): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      switch (event.event.type) {
        case 'message':
          await this.handleMessage(event.event as unknown as Record<string, unknown>);
          break;
        case 'app_mention':
          await this.handleMention(event.event as unknown as Record<string, unknown>);
          break;
        default:
          console.log(`Unhandled event type: ${event.event.type}`);
      }
    } catch (error) {
      console.error('Error handling Slack event:', error);
    }
  }

  async handleMessage(messageEvent: Record<string, unknown>): Promise<void> {
    if (messageEvent.bot_id || messageEvent.subtype) {
      return;
    }

    const { channel, user, text, ts } = messageEvent;
    const channelStr = channel as string;
    const userStr = user as string;
    const textStr = text as string;
    const tsStr = ts as string;
    
    if (!textStr || !userStr) {
      return;
    }

    console.log(`📨 Processing message from ${userStr}: ${textStr.substring(0, 100)}...`);

    try {
      const response = await this.openHandsAgent.processAttorneyRequest(textStr, userStr);
      
      await this.sendMessage({
        channel: channelStr,
        text: response.response,
        thread_ts: tsStr,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: response.response
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Actions Taken:*\n${response.actionsTaken.join('\n')}`
              },
              {
                type: 'mrkdwn',
                text: `*Next Steps:*\n${response.nextSteps.join('\n')}`
              }
            ]
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Workflow'
                },
                action_id: 'view_workflow',
                value: response.requestId
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Modify Request'
                },
                action_id: 'modify_request',
                value: response.requestId
              }
            ]
          }
        ]
      });

    } catch (error) {
      console.error('Error processing message:', error);
      await this.sendMessage({
        channel: channelStr,
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        thread_ts: tsStr
      });
    }
  }

  async handleMention(mentionEvent: Record<string, unknown>): Promise<void> {
    const { channel, user, text, ts } = mentionEvent;
    const channelStr = channel as string;
    const userStr = user as string;
    const textStr = text as string;
    const tsStr = ts as string;
    
    const cleanText = textStr.replace(/<@[^>]+>/g, '').trim();
    
    console.log(`🔔 Handling mention from ${userStr}: ${cleanText}`);

    try {
      const response = await this.openHandsAgent.processAttorneyRequest(cleanText, userStr);
      
      await this.sendMessage({
        channel: channelStr,
        text: `Hi <@${userStr}>! ${response.response}`,
        thread_ts: tsStr,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Hi <@${userStr}>! ${response.response}`
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Workflows Triggered:* ${response.workflowsTriggered.join(', ') || 'None'}`
            }
          }
        ]
      });

    } catch (error) {
      console.error('Error handling mention:', error);
      await this.sendMessage({
        channel: channelStr,
        text: `Hi <@${userStr}>! I encountered an error processing your request. Please try again.`,
        thread_ts: tsStr
      });
    }
  }

  async handleInteractivePayload(payload: SlackInteractivePayload): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (payload.type === 'block_actions' && payload.actions) {
        for (const action of payload.actions) {
          await this.handleButtonAction(action as unknown as Record<string, unknown>, payload);
        }
      }
    } catch (error) {
      console.error('Error handling interactive payload:', error);
    }
  }

  async handleButtonAction(action: Record<string, unknown>, payload: SlackInteractivePayload): Promise<void> {
    const { action_id, value } = action;
    const { user, channel } = payload;

    console.log(`🔘 Button action: ${action_id} by ${user.id}`);

    switch (action_id) {
      case 'view_workflow':
        await this.handleViewWorkflow(value as string, channel?.id, user.id);
        break;
      case 'modify_request':
        await this.handleModifyRequest(value as string, channel?.id, user.id);
        break;
      case 'approve_workflow':
        await this.handleApproveWorkflow(value as string, channel?.id, user.id);
        break;
      case 'reject_workflow':
        await this.handleRejectWorkflow(value as string, channel?.id, user.id);
        break;
      default:
        console.log(`Unhandled button action: ${action_id}`);
    }
  }

  async handleViewWorkflow(requestId: string, channelId?: string, userId?: string): Promise<void> {
    if (!channelId || !userId) return;

    await this.sendMessage({
      channel: channelId,
      text: `Workflow details for request ${requestId}:`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Workflow Details*\nRequest ID: ${requestId}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '*Status:* Active'
            },
            {
              type: 'mrkdwn',
              text: '*Created:* Just now'
            },
            {
              type: 'mrkdwn',
              text: '*Type:* Attorney Workflow'
            },
            {
              type: 'mrkdwn',
              text: '*Priority:* Medium'
            }
          ]
        }
      ]
    });
  }

  async handleModifyRequest(requestId: string, channelId?: string, userId?: string): Promise<void> {
    if (!channelId || !userId) return;

    await this.sendMessage({
      channel: channelId,
      text: 'To modify your request, please send a new message with your updated requirements.',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Modify Request ${requestId}*\n\nTo update your workflow request, simply send a new message describing the changes you'd like to make. I'll analyze your request and update the workflow accordingly.`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Example:*\n"Change the contract workflow so that contracts over $100k need partner approval instead of $50k"'
          }
        }
      ]
    });
  }

  async handleApproveWorkflow(workflowId: string, channelId?: string, userId?: string): Promise<void> {
    if (!channelId || !userId) return;

    await this.sendMessage({
      channel: channelId,
      text: `✅ Workflow ${workflowId} has been approved and activated.`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `✅ *Workflow Approved*\n\nWorkflow ${workflowId} is now active and will begin processing emails and requests according to your specifications.`
          }
        }
      ]
    });
  }

  async handleRejectWorkflow(workflowId: string, channelId?: string, userId?: string): Promise<void> {
    if (!channelId || !userId) return;

    await this.sendMessage({
      channel: channelId,
      text: `❌ Workflow ${workflowId} has been rejected.`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `❌ *Workflow Rejected*\n\nWorkflow ${workflowId} has been deactivated. Please provide feedback on what needs to be changed.`
          }
        }
      ]
    });
  }

  async sendMessage(message: SlackMessage): Promise<void> {
    try {
      const messageArgs: Record<string, unknown> = {
        channel: message.channel,
        text: message.text
      };
      
      if (message.blocks) messageArgs.blocks = message.blocks;
      if (message.attachments) messageArgs.attachments = message.attachments;
      if (message.thread_ts) messageArgs.thread_ts = message.thread_ts;
      if (message.reply_broadcast) messageArgs.reply_broadcast = message.reply_broadcast;
      if (message.unfurl_links !== undefined) messageArgs.unfurl_links = message.unfurl_links;
      if (message.unfurl_media !== undefined) messageArgs.unfurl_media = message.unfurl_media;
      
      await this.client.chat.postMessage(messageArgs as any);
    } catch (error) {
      console.error('Error sending Slack message:', error);
      throw error;
    }
  }

  async sendNotification(channelId: string, message: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium'): Promise<void> {
    const priorityEmojis = {
      low: '🔵',
      medium: '🟡',
      high: '🟠',
      urgent: '🔴'
    };

    await this.sendMessage({
      channel: channelId,
      text: `${priorityEmojis[priority]} ${message}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${priorityEmojis[priority]} *${priority.toUpperCase()} PRIORITY*\n\n${message}`
          }
        }
      ]
    });
  }

  async sendWorkflowUpdate(channelId: string, workflowId: string, changes: string[]): Promise<void> {
    await this.sendMessage({
      channel: channelId,
      text: `Workflow ${workflowId} has been updated.`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🔄 *Workflow Updated*\n\nWorkflow ${workflowId} has been successfully updated with the following changes:`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: changes.map(change => `• ${change}`).join('\n')
          }
        }
      ]
    });
  }

  async sendEmailAlert(channelId: string, emailSubject: string, priority: string, assignedTo: string): Promise<void> {
    await this.sendMessage({
      channel: channelId,
      text: `New email requires attention: ${emailSubject}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📧 *New Email Alert*\n\n*Subject:* ${emailSubject}\n*Priority:* ${priority}\n*Assigned to:* ${assignedTo}`
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'View Email'
              },
              action_id: 'view_email',
              style: 'primary'
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Reassign'
              },
              action_id: 'reassign_email'
            }
          ]
        }
      ]
    });
  }
}
