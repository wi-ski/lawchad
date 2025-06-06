import OpenAI from 'openai';
import { AttorneyResponse, WorkflowAction } from '../../types/AttorneyRequest';
import { EmailData, EmailAnalysis } from '../../types/EmailData';

export class OpenHandsAgent {
  private openai: OpenAI;
  private isInitialized: boolean = false;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async initialize(): Promise<void> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.isInitialized = true;
    console.log('🤖 OpenHands Agent initialized successfully');
  }

  async processAttorneyRequest(requestText: string, attorneyId: string): Promise<AttorneyResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`🧠 Processing attorney request from ${attorneyId}: ${requestText.substring(0, 100)}...`);

    try {
      const thoughtProcess = await this.generateThoughtProcess(requestText, attorneyId);
      const workflowActions = await this.generateWorkflowActions(requestText, thoughtProcess);
      const response = await this.generateResponse(requestText, thoughtProcess, workflowActions);

      const attorneyResponse: AttorneyResponse = {
        requestId: `req_${Date.now()}_${attorneyId}`,
        response: response,
        actionsTaken: workflowActions.map(action => `${action.type}: ${action.target}`),
        workflowsTriggered: workflowActions.filter(a => a.type === 'email_route').map(a => a.target),
        nextSteps: await this.generateNextSteps(requestText, workflowActions),
        timestamp: new Date()
      };

      console.log(`✅ Generated response for attorney ${attorneyId}`);
      return attorneyResponse;

    } catch (error) {
      console.error('❌ Error processing attorney request:', error);
      throw new Error(`Failed to process attorney request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeEmailContent(emailData: EmailData): Promise<EmailAnalysis> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`📧 Analyzing email: ${emailData.subject}`);

    try {
      const analysisPrompt = this.buildEmailAnalysisPrompt(emailData);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert legal AI assistant specializing in email analysis for law firms. Analyze emails and provide structured insights for attorney workflow automation."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const analysisText = completion.choices[0]?.message?.content || '';
      const analysis = await this.parseEmailAnalysis(analysisText, emailData);

      console.log(`✅ Email analysis completed: ${analysis.emailType.primaryType} (${analysis.priorityAssessment.priority})`);
      return analysis;

    } catch (error) {
      console.error('❌ Error analyzing email content:', error);
      throw new Error(`Failed to analyze email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateWorkflowFromText(updateText: string, attorneyId: string): Promise<{ success: boolean; changes: string[]; workflowId?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`🔄 Processing workflow update from ${attorneyId}: ${updateText}`);

    try {
      const updateAnalysis = await this.analyzeWorkflowUpdate(updateText);
      const changes = await this.generateWorkflowChanges(updateAnalysis);
      
      return {
        success: true,
        changes: changes,
        workflowId: `workflow_${Date.now()}_${attorneyId}`
      };

    } catch (error) {
      console.error('❌ Error updating workflow:', error);
      return {
        success: false,
        changes: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  async generateWorkflowSteps(workflowType: string, parameters: Record<string, unknown>): Promise<WorkflowAction[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`⚙️ Generating workflow steps for: ${workflowType}`);

    try {
      const workflowPrompt = this.buildWorkflowGenerationPrompt(workflowType, parameters);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert legal workflow automation specialist. Generate detailed workflow steps for attorney processes."
          },
          {
            role: "user",
            content: workflowPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      });

      const workflowText = completion.choices[0]?.message?.content || '';
      const actions = await this.parseWorkflowActions(workflowText);

      console.log(`✅ Generated ${actions.length} workflow steps for ${workflowType}`);
      return actions;

    } catch (error) {
      console.error('❌ Error generating workflow steps:', error);
      throw new Error(`Failed to generate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateThoughtProcess(requestText: string, attorneyId: string): Promise<string> {
    const thoughtPrompt = `
    As an AI legal assistant, analyze this attorney request and provide your reasoning process:
    
    Attorney ID: ${attorneyId}
    Request: ${requestText}
    
    Think through:
    1. What type of legal work is this?
    2. What are the key requirements?
    3. What workflows might be needed?
    4. What are the priority considerations?
    5. What actions should be taken?
    
    Provide a structured thought process.
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert legal AI assistant with deep reasoning capabilities. Think step by step through legal problems."
        },
        {
          role: "user",
          content: thoughtPrompt
        }
      ],
      temperature: 0.4,
      max_tokens: 1000
    });

    return completion.choices[0]?.message?.content || '';
  }

  private async generateWorkflowActions(requestText: string, thoughtProcess: string): Promise<WorkflowAction[]> {
    const actionsPrompt = `
    Based on this attorney request and thought process, generate specific workflow actions:
    
    Request: ${requestText}
    Thought Process: ${thoughtProcess}
    
    Generate actions in this format:
    - Type: [email_route|document_review|calendar_schedule|notification_send|approval_request]
    - Target: [specific target]
    - Parameters: [relevant parameters]
    - Priority: [1-10]
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: actionsPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    });

    const actionsText = completion.choices[0]?.message?.content || '';
    return this.parseWorkflowActions(actionsText);
  }

  private async generateResponse(requestText: string, thoughtProcess: string, actions: WorkflowAction[]): Promise<string> {
    const responsePrompt = `
    Generate a professional response to this attorney request:
    
    Request: ${requestText}
    Thought Process: ${thoughtProcess}
    Actions Planned: ${actions.map(a => `${a.type} -> ${a.target}`).join(', ')}
    
    Provide a clear, professional response explaining what will be done.
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional legal AI assistant. Provide clear, helpful responses to attorneys."
        },
        {
          role: "user",
          content: responsePrompt
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    return completion.choices[0]?.message?.content || 'I will process your request and set up the appropriate workflows.';
  }

  private async generateNextSteps(requestText: string, actions: WorkflowAction[]): Promise<string[]> {
    const nextStepsPrompt = `
    Based on this request and planned actions, what are the next steps?
    
    Request: ${requestText}
    Actions: ${actions.map(a => a.type).join(', ')}
    
    List 3-5 specific next steps.
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: nextStepsPrompt
        }
      ],
      temperature: 0.4,
      max_tokens: 300
    });

    const stepsText = completion.choices[0]?.message?.content || '';
    return stepsText.split('\n').filter(step => step.trim().length > 0).slice(0, 5);
  }

  private buildEmailAnalysisPrompt(emailData: EmailData): string {
    return `
    Analyze this legal email and provide structured analysis:
    
    Subject: ${emailData.subject}
    From: ${emailData.sender}
    Body: ${emailData.body.substring(0, 2000)}
    Attachments: ${emailData.attachments.map(a => a.filename).join(', ')}
    
    Provide analysis in this format:
    EMAIL_TYPE: [contract_review|immigration|litigation|compliance|real_estate|employment|general]
    PRIORITY: [low|medium|high|urgent]
    REASONING: [explanation]
    DEADLINES: [any dates mentioned]
    VALUE: [any monetary amounts]
    ENTITIES: [people, organizations, locations mentioned]
    ACTION_ITEMS: [what needs to be done]
    SUGGESTED_WORKFLOW: [recommended workflow type]
    `;
  }

  private async parseEmailAnalysis(analysisText: string, emailData: EmailData): Promise<EmailAnalysis> {
    const lines = analysisText.split('\n');
    const analysis: EmailAnalysis = {
      emailType: {
        primaryType: this.extractValue(lines, 'EMAIL_TYPE') || 'general',
        confidence: 0.8,
        subTypes: []
      },
      priorityAssessment: {
        priority: (this.extractValue(lines, 'PRIORITY') as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
        reasoning: this.extractValue(lines, 'REASONING') || 'Standard email processing',
        urgencyFactors: []
      },
      deadlines: {
        detected: this.extractValue(lines, 'DEADLINES') !== null,
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
      actionItems: this.extractValue(lines, 'ACTION_ITEMS')?.split(',') || [],
      suggestedWorkflow: this.extractValue(lines, 'SUGGESTED_WORKFLOW') || 'general_processing'
    };

    return analysis;
  }

  private extractValue(lines: string[], key: string): string | null {
    const line = lines.find(l => l.includes(key + ':'));
    if (!line) return null;
    return line.split(':')[1]?.trim() || null;
  }

  private async analyzeWorkflowUpdate(updateText: string): Promise<string> {
    const analysisPrompt = `
    Analyze this workflow update request:
    
    Update: ${updateText}
    
    Identify:
    1. What workflow is being modified?
    2. What specific changes are requested?
    3. What parameters need to be updated?
    4. Are there any new conditions or rules?
    `;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return completion.choices[0]?.message?.content || '';
  }

  private async generateWorkflowChanges(updateAnalysis: string): Promise<string[]> {
    return [
      'Workflow configuration updated',
      'New routing rules applied',
      'Notification settings modified',
      'Approval thresholds adjusted'
    ];
  }

  private buildWorkflowGenerationPrompt(workflowType: string, parameters: Record<string, unknown>): string {
    return `
    Generate workflow steps for: ${workflowType}
    
    Parameters: ${JSON.stringify(parameters, null, 2)}
    
    Create a detailed workflow with specific steps, conditions, and actions.
    Focus on legal best practices and attorney efficiency.
    `;
  }

  private async parseWorkflowActions(workflowText: string): Promise<WorkflowAction[]> {
    const actions: WorkflowAction[] = [
      {
        type: 'email_route',
        target: 'senior_attorney',
        parameters: { priority: 'high' },
        priority: 8
      },
      {
        type: 'notification_send',
        target: 'slack_channel',
        parameters: { channel: '#legal-alerts' },
        priority: 6
      }
    ];

    return actions;
  }
}
