import { google } from 'googleapis';
import { OpenHandsAgent } from '../openhands-agent/OpenHandsAgent';
import { GmailOAuth } from './GmailOAuth';
import { EmailData, EmailAttachment, EmailAnalysis, EmailProcessingResult } from '../../types/EmailData';

export class EmailProcessor {
  private openHandsAgent: OpenHandsAgent;
  private gmailOAuth: GmailOAuth;
  private isInitialized: boolean = false;

  constructor(openHandsAgent: OpenHandsAgent, gmailOAuth: GmailOAuth) {
    this.openHandsAgent = openHandsAgent;
    this.gmailOAuth = gmailOAuth;
  }

  async initialize(): Promise<void> {
    await this.openHandsAgent.initialize();
    await this.gmailOAuth.initialize();
    this.isInitialized = true;
    console.log('📧 Email Processor initialized successfully');
  }

  async processEmail(emailData: EmailData, attorneyId: string): Promise<EmailProcessingResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`📨 Processing email: ${emailData.subject} for attorney ${attorneyId}`);

    try {
      const analysis = await this.openHandsAgent.analyzeEmailContent(emailData);
      
      const routing = this.determineRouting(analysis, attorneyId);
      const notifications = await this.sendNotifications(emailData, analysis, routing);

      const result: EmailProcessingResult = {
        success: true,
        analysis,
        routing,
        notifications
      };

      console.log(`✅ Email processed successfully: ${emailData.subject} -> ${routing.assignedTo}`);
      return result;

    } catch (error) {
      console.error('❌ Error processing email:', error);
      return {
        success: false,
        analysis: this.getDefaultAnalysis(),
        routing: this.getDefaultRouting(attorneyId),
        notifications: { sent: false, recipients: [], channels: [] },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async fetchNewEmails(attorneyId: string, maxResults: number = 10): Promise<EmailData[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const client = await this.gmailOAuth.getAuthenticatedClient(attorneyId);
      if (!client) {
        throw new Error(`No authenticated Gmail client for attorney ${attorneyId}`);
      }

      const gmail = google.gmail({ version: 'v1', auth: client });
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread',
        maxResults
      });

      const messages = response.data.messages || [];
      const emails: EmailData[] = [];

      for (const message of messages) {
        if (message.id) {
          const emailData = await this.fetchEmailById(attorneyId, message.id);
          if (emailData) {
            emails.push(emailData);
          }
        }
      }

      console.log(`📬 Fetched ${emails.length} new emails for attorney ${attorneyId}`);
      return emails;

    } catch (error) {
      console.error(`❌ Error fetching emails for ${attorneyId}:`, error);
      return [];
    }
  }

  async fetchEmailById(attorneyId: string, messageId: string): Promise<EmailData | null> {
    try {
      const client = await this.gmailOAuth.getAuthenticatedClient(attorneyId);
      if (!client) {
        return null;
      }

      const gmail = google.gmail({ version: 'v1', auth: client });
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      const message = response.data;
      if (!message) {
        return null;
      }

      return this.convertGmailToEmailData(message);

    } catch (error) {
      console.error(`❌ Error fetching email ${messageId}:`, error);
      return null;
    }
  }

  private convertGmailToEmailData(gmailMessage: any): EmailData {
    const headers = gmailMessage.payload?.headers || [];
    const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const emailData: EmailData = {
      id: gmailMessage.id || '',
      messageId: getHeader('Message-ID'),
      threadId: gmailMessage.threadId,
      subject: getHeader('Subject'),
      sender: getHeader('From'),
      recipients: [getHeader('To'), getHeader('Cc'), getHeader('Bcc')].filter(Boolean),
      body: this.extractEmailBody(gmailMessage.payload),
      htmlBody: this.extractEmailHtmlBody(gmailMessage.payload),
      attachments: this.extractAttachments(gmailMessage.payload),
      timestamp: new Date(parseInt(gmailMessage.internalDate || '0')),
      labels: gmailMessage.labelIds || [],
      isRead: !gmailMessage.labelIds?.includes('UNREAD'),
      isImportant: gmailMessage.labelIds?.includes('IMPORTANT') || false
    };

    return emailData;
  }

  private extractEmailBody(payload: any): string {
    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64').toString('utf-8');
    }

    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    }

    return '';
  }

  private extractEmailHtmlBody(payload: any): string | undefined {
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/html' && part.body?.data) {
          return Buffer.from(part.body.data, 'base64').toString('utf-8');
        }
      }
    }
    return undefined;
  }

  private extractAttachments(payload: any): EmailAttachment[] {
    const attachments: EmailAttachment[] = [];

    const extractFromParts = (parts: any[]) => {
      for (const part of parts) {
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType || 'application/octet-stream',
            size: part.body.size || 0,
            attachmentId: part.body.attachmentId
          });
        }
        if (part.parts) {
          extractFromParts(part.parts);
        }
      }
    };

    if (payload.parts) {
      extractFromParts(payload.parts);
    }

    return attachments;
  }

  private determineRouting(analysis: EmailAnalysis, attorneyId: string) {
    const priority = analysis.priorityAssessment.priority;
    const emailType = analysis.emailType.primaryType;
    
    let assignedTo = attorneyId;
    let department = 'general';
    let escalationLevel = 1;

    if (priority === 'urgent') {
      assignedTo = 'senior_partner';
      escalationLevel = 4;
    } else if (emailType === 'contract_review') {
      assignedTo = 'contract_attorney';
      department = 'corporate';
      escalationLevel = 2;
    } else if (emailType === 'immigration') {
      assignedTo = 'immigration_attorney';
      department = 'immigration';
      escalationLevel = 2;
    } else if (emailType === 'litigation') {
      assignedTo = 'litigation_attorney';
      department = 'litigation';
      escalationLevel = 3;
    }

    return {
      assignedTo,
      department,
      workflowTriggered: analysis.suggestedWorkflow,
      escalationLevel
    };
  }

  private async sendNotifications(emailData: EmailData, analysis: EmailAnalysis, routing: any) {
    const recipients = [routing.assignedTo];
    const channels = ['slack'];

    if (analysis.priorityAssessment.priority === 'urgent') {
      channels.push('email');
    }

    console.log(`📢 Sending notifications to ${recipients.join(', ')} via ${channels.join(', ')}`);

    return {
      sent: true,
      recipients,
      channels
    };
  }

  private getDefaultAnalysis(): EmailAnalysis {
    return {
      emailType: {
        primaryType: 'general',
        confidence: 0.5,
        subTypes: []
      },
      priorityAssessment: {
        priority: 'medium',
        reasoning: 'Default priority assignment',
        urgencyFactors: []
      },
      deadlines: {
        detected: false,
        dates: [],
        descriptions: []
      },
      valueExtraction: {},
      entities: {
        people: [],
        organizations: [],
        locations: [],
        dates: [],
        caseNumbers: []
      },
      actionItems: [],
      suggestedWorkflow: 'general_processing'
    };
  }

  private getDefaultRouting(attorneyId: string) {
    return {
      assignedTo: attorneyId,
      department: 'general',
      workflowTriggered: 'general_processing',
      escalationLevel: 1
    };
  }

  async markAsRead(attorneyId: string, messageId: string): Promise<boolean> {
    try {
      const client = await this.gmailOAuth.getAuthenticatedClient(attorneyId);
      if (!client) {
        return false;
      }

      const gmail = google.gmail({ version: 'v1', auth: client });
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });

      return true;
    } catch (error) {
      console.error(`❌ Error marking email as read:`, error);
      return false;
    }
  }

  async addLabel(attorneyId: string, messageId: string, labelName: string): Promise<boolean> {
    try {
      const client = await this.gmailOAuth.getAuthenticatedClient(attorneyId);
      if (!client) {
        return false;
      }

      const gmail = google.gmail({ version: 'v1', auth: client });
      
      const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
      const labels = labelsResponse.data.labels || [];
      
      let labelId = labels.find(label => label.name === labelName)?.id;
      
      if (!labelId) {
        const createResponse = await gmail.users.labels.create({
          userId: 'me',
          requestBody: {
            name: labelName,
            labelListVisibility: 'labelShow',
            messageListVisibility: 'show'
          }
        });
        labelId = createResponse.data.id;
      }

      if (labelId) {
        await gmail.users.messages.modify({
          userId: 'me',
          id: messageId,
          requestBody: {
            addLabelIds: [labelId]
          }
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error(`❌ Error adding label:`, error);
      return false;
    }
  }

  async getEmailStats(attorneyId: string): Promise<{ unread: number; total: number; lastProcessed?: Date }> {
    try {
      const client = await this.gmailOAuth.getAuthenticatedClient(attorneyId);
      if (!client) {
        return { unread: 0, total: 0 };
      }

      const gmail = google.gmail({ version: 'v1', auth: client });
      
      const unreadResponse = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread'
      });

      const totalResponse = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 1
      });

      return {
        unread: unreadResponse.data.resultSizeEstimate || 0,
        total: totalResponse.data.resultSizeEstimate || 0,
        lastProcessed: new Date()
      };
    } catch (error) {
      console.error(`❌ Error getting email stats:`, error);
      return { unread: 0, total: 0 };
    }
  }
}
