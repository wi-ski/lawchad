import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { WorkflowConfig, WorkflowTrigger, WorkflowStep, RoutingRule, NotificationConfig } from '../../types/WorkflowConfig';
import { N8nWorkflow, N8nNode, N8nConnections } from '../../types/N8nWorkflow';

export class ConfigParser {
  private processor: any;

  constructor() {
    this.processor = remark()
      .use(remarkParse)
      .use(remarkStringify)
      .use(remarkFrontmatter, ['yaml', 'toml'])
      .use(remarkGfm);
  }

  async parseMarkdownToWorkflow(markdownContent: string): Promise<Partial<WorkflowConfig>> {
    try {
      console.log('📝 Parsing markdown workflow configuration...');
      
      const sections = this.extractSections(markdownContent);
      const frontmatter = this.extractFrontmatter(markdownContent);
      
      const workflow: Partial<WorkflowConfig> = {
        id: frontmatter.id,
        name: frontmatter.name,
        description: frontmatter.description,
        attorneyId: frontmatter.attorneyId,
        version: frontmatter.version || '1.0.0',
        isActive: frontmatter.isActive !== false,
        createdAt: frontmatter.createdAt ? new Date(frontmatter.createdAt) : new Date(),
        updatedAt: frontmatter.updatedAt ? new Date(frontmatter.updatedAt) : new Date(),
        triggers: this.parseTriggers(sections.triggers || ''),
        steps: this.parseSteps(sections.steps || ''),
        routing: this.parseRouting(sections.routing || ''),
        notifications: this.parseNotifications(sections.notifications || ''),
        customRules: [],
        metadata: {
          tags: frontmatter.tags || [],
          category: frontmatter.category || 'general',
          practiceArea: frontmatter.practiceArea || frontmatter.category || 'general',
          complexity: frontmatter.complexity || 'medium',
          requiredApprovals: frontmatter.requiredApprovals || []
        }
      };

      console.log(`✅ Parsed workflow: ${workflow.name} (${workflow.id})`);
      return workflow;

    } catch (error) {
      console.error('❌ Error parsing markdown workflow:', error);
      throw new Error(`Failed to parse workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async convertToN8nWorkflow(workflowConfig: Partial<WorkflowConfig>, workflowName: string): Promise<N8nWorkflow> {
    try {
      console.log(`⚙️ Converting workflow to n8n format: ${workflowName}`);
      
      const nodes: N8nNode[] = [];
      const connections: N8nConnections = {};
      
      let nodeIndex = 0;
      
      const triggerNode = this.createTriggerNode(workflowConfig.triggers || [], nodeIndex++);
      nodes.push(triggerNode);
      
      const analysisNode = this.createAnalysisNode(nodeIndex++);
      nodes.push(analysisNode);
      
      const routingNodes = this.createRoutingNodes(workflowConfig.routing || [], nodeIndex);
      nodes.push(...routingNodes);
      nodeIndex += routingNodes.length;
      
      const notificationNodes = this.createNotificationNodes(workflowConfig.notifications || [], nodeIndex);
      nodes.push(...notificationNodes);
      
      this.createConnections(nodes, connections);
      
      const n8nWorkflow: N8nWorkflow = {
        name: workflowName,
        active: workflowConfig.isActive || true,
        nodes: nodes,
        connections: connections,
        settings: {
          executionOrder: 'v1',
          saveManualExecutions: true,
          callerPolicy: 'workflowsFromSameOwner'
        },
        tags: workflowConfig.metadata?.tags || [],
        meta: {
          attorneyId: workflowConfig.attorneyId,
          originalWorkflowId: workflowConfig.id,
          practiceArea: workflowConfig.metadata?.practiceArea
        }
      };

      console.log(`✅ Generated n8n workflow with ${nodes.length} nodes`);
      return n8nWorkflow;

    } catch (error) {
      console.error('❌ Error converting to n8n workflow:', error);
      throw new Error(`Failed to convert workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateWorkflowConfig(workflowConfig: Partial<WorkflowConfig>): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (!workflowConfig.id) {
      errors.push('Workflow ID is required');
    }

    if (!workflowConfig.name) {
      errors.push('Workflow name is required');
    }

    if (!workflowConfig.attorneyId) {
      errors.push('Attorney ID is required');
    }

    if (!workflowConfig.triggers || workflowConfig.triggers.length === 0) {
      warnings.push('No triggers defined - workflow will not activate automatically');
    }

    if (!workflowConfig.routing || workflowConfig.routing.length === 0) {
      warnings.push('No routing rules defined - emails may not be properly assigned');
    }

    if (!workflowConfig.notifications || workflowConfig.notifications.length === 0) {
      suggestions.push('Consider adding notifications to keep attorneys informed');
    }

    if (workflowConfig.triggers) {
      for (const trigger of workflowConfig.triggers) {
        if (!trigger.conditions || trigger.conditions.length === 0) {
          warnings.push(`Trigger ${trigger.type} has no conditions`);
        }
      }
    }

    const valid = errors.length === 0;

    console.log(`🔍 Validation complete: ${valid ? 'VALID' : 'INVALID'} (${errors.length} errors, ${warnings.length} warnings)`);

    return { valid, errors, warnings, suggestions };
  }

  private extractSections(markdownContent: string): Record<string, string> {
    const sections: Record<string, string> = {};
    
    const sectionRegex = /^## (.+)$/gm;
    const matches = [...markdownContent.matchAll(sectionRegex)];
    
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const sectionName = match[1].toLowerCase().replace(/\s+/g, '_');
      const startIndex = match.index! + match[0].length;
      const endIndex = i < matches.length - 1 ? matches[i + 1].index! : markdownContent.length;
      
      sections[sectionName] = markdownContent.slice(startIndex, endIndex).trim();
    }
    
    return sections;
  }

  private extractFrontmatter(markdownContent: string): Record<string, any> {
    const frontmatterMatch = markdownContent.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
      return {};
    }

    const frontmatter: Record<string, any> = {};
    const lines = frontmatterMatch[1].split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        try {
          frontmatter[key] = JSON.parse(value);
        } catch {
          frontmatter[key] = value.replace(/^["']|["']$/g, '');
        }
      }
    }
    
    return frontmatter;
  }

  private parseTriggers(triggersSection: string): WorkflowTrigger[] {
    const triggers: WorkflowTrigger[] = [];
    
    const triggerBlocks = triggersSection.split(/^### /m).filter(block => block.trim());
    
    for (const block of triggerBlocks) {
      const lines = block.split('\n');
      const triggerType = lines[0].trim() as any;
      
      const trigger: WorkflowTrigger = {
        type: triggerType,
        conditions: [],
        priority: 1
      };
      
      for (const line of lines) {
        if (line.includes('Priority:')) {
          const priority = parseInt(line.split(':')[1].trim());
          if (!isNaN(priority)) {
            trigger.priority = priority;
          }
        } else if (line.trim().startsWith('- ')) {
          const conditionText = line.trim().substring(2);
          const condition = this.parseCondition(conditionText);
          if (condition) {
            trigger.conditions.push(condition);
          }
        }
      }
      
      triggers.push(trigger);
    }
    
    return triggers;
  }

  private parseSteps(stepsSection: string): WorkflowStep[] {
    const steps: WorkflowStep[] = [];
    
    const stepBlocks = stepsSection.split(/^### Step \d+:/m).filter(block => block.trim());
    
    for (let i = 0; i < stepBlocks.length; i++) {
      const block = stepBlocks[i];
      const lines = block.split('\n');
      const stepName = lines[0].trim();
      
      const step: WorkflowStep = {
        id: `step_${i + 1}`,
        name: stepName,
        type: 'analysis',
        action: 'process',
        parameters: {}
      };
      
      for (const line of lines) {
        if (line.includes('Type:')) {
          step.type = line.split(':')[1].trim() as any;
        } else if (line.includes('Action:')) {
          step.action = line.split(':')[1].trim();
        }
      }
      
      steps.push(step);
    }
    
    return steps;
  }

  private parseRouting(routingSection: string): RoutingRule[] {
    const rules: RoutingRule[] = [];
    
    const ruleBlocks = routingSection.split(/^### /m).filter(block => block.trim());
    
    for (let i = 0; i < ruleBlocks.length; i++) {
      const block = ruleBlocks[i];
      const lines = block.split('\n');
      const ruleName = lines[0].trim();
      
      const rule: RoutingRule = {
        id: `rule_${i + 1}`,
        name: ruleName,
        conditions: [],
        target: { type: 'attorney', identifier: 'default' },
        priority: 1
      };
      
      for (const line of lines) {
        if (line.includes('Target:')) {
          const targetText = line.split(':')[1].trim();
          const [type, identifier] = targetText.split(' - ');
          rule.target = { type: type as any, identifier };
        } else if (line.includes('Priority:')) {
          const priority = parseInt(line.split(':')[1].trim());
          if (!isNaN(priority)) {
            rule.priority = priority;
          }
        } else if (line.trim().startsWith('- ')) {
          const conditionText = line.trim().substring(2);
          const condition = this.parseCondition(conditionText);
          if (condition) {
            rule.conditions.push(condition);
          }
        }
      }
      
      rules.push(rule);
    }
    
    return rules;
  }

  private parseNotifications(notificationsSection: string): NotificationConfig[] {
    const notifications: NotificationConfig[] = [];
    
    const notificationBlocks = notificationsSection.split(/^### /m).filter(block => block.trim());
    
    for (let i = 0; i < notificationBlocks.length; i++) {
      const block = notificationBlocks[i];
      const lines = block.split('\n');
      const notificationId = lines[0].trim();
      
      const notification: NotificationConfig = {
        id: notificationId,
        trigger: 'workflow_started',
        channels: ['slack'],
        recipients: [],
        template: 'default',
        priority: 'medium'
      };
      
      for (const line of lines) {
        if (line.includes('Trigger:')) {
          notification.trigger = line.split(':')[1].trim();
        } else if (line.includes('Channels:')) {
          notification.channels = line.split(':')[1].trim().split(',').map(c => c.trim()) as any;
        } else if (line.includes('Recipients:')) {
          notification.recipients = line.split(':')[1].trim().split(',').map(r => r.trim());
        } else if (line.includes('Priority:')) {
          notification.priority = line.split(':')[1].trim() as any;
        }
      }
      
      notifications.push(notification);
    }
    
    return notifications;
  }

  private parseCondition(conditionText: string): any {
    const parts = conditionText.split(' ');
    if (parts.length >= 3) {
      return {
        field: parts[0],
        operator: parts[1] as any,
        value: parts.slice(2).join(' ').replace(/^["']|["']$/g, '')
      };
    }
    return null;
  }

  private createTriggerNode(triggers: WorkflowTrigger[], index: number): N8nNode {
    return {
      id: `trigger_${index}`,
      name: 'Email Trigger',
      type: 'n8n-nodes-base.emailReadImap',
      typeVersion: 1,
      position: [100, 100],
      parameters: {
        protocol: 'imap',
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
        format: 'simple'
      },
      credentials: {
        imap: 'gmail_credentials'
      }
    };
  }

  private createAnalysisNode(index: number): N8nNode {
    return {
      id: `analysis_${index}`,
      name: 'Email Analysis',
      type: 'n8n-nodes-base.openAi',
      typeVersion: 1,
      position: [300, 100],
      parameters: {
        operation: 'chat',
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Analyze this legal email and extract key information.'
          },
          {
            role: 'user',
            content: '{{ $json.body }}'
          }
        ]
      },
      credentials: {
        openAiApi: 'openai_credentials'
      }
    };
  }

  private createRoutingNodes(routingRules: RoutingRule[], startIndex: number): N8nNode[] {
    const nodes: N8nNode[] = [];
    
    for (let i = 0; i < routingRules.length; i++) {
      const rule = routingRules[i];
      
      nodes.push({
        id: `routing_${startIndex + i}`,
        name: `Route: ${rule.name}`,
        type: 'n8n-nodes-base.if',
        typeVersion: 1,
        position: [500 + (i * 200), 100],
        parameters: {
          conditions: {
            string: rule.conditions.map(condition => ({
              value1: `{{ $json.${condition.field} }}`,
              operation: this.mapOperatorToN8n(condition.operator),
              value2: condition.value
            }))
          }
        }
      });
    }
    
    return nodes;
  }

  private createNotificationNodes(notifications: NotificationConfig[], startIndex: number): N8nNode[] {
    const nodes: N8nNode[] = [];
    
    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i];
      
      if (notification.channels.includes('slack')) {
        nodes.push({
          id: `slack_${startIndex + i}`,
          name: `Slack: ${notification.id}`,
          type: 'n8n-nodes-base.slack',
          typeVersion: 1,
          position: [700 + (i * 200), 200],
          parameters: {
            operation: 'postMessage',
            channel: '#legal-alerts',
            text: `New email requires attention: {{ $json.subject }}`
          },
          credentials: {
            slackApi: 'slack_credentials'
          }
        });
      }
    }
    
    return nodes;
  }

  private createConnections(nodes: N8nNode[], connections: N8nConnections): void {
    for (let i = 0; i < nodes.length - 1; i++) {
      const currentNode = nodes[i];
      const nextNode = nodes[i + 1];
      
      connections[currentNode.name] = {
        main: [
          {
            node: nextNode.name,
            type: 'main',
            index: 0
          }
        ]
      };
    }
  }

  private mapOperatorToN8n(operator: string): string {
    const mapping: Record<string, string> = {
      'equals': 'equal',
      'contains': 'contains',
      'greater_than': 'larger',
      'less_than': 'smaller',
      'regex_match': 'regex',
      'in_list': 'contains'
    };
    
    return mapping[operator] || 'equal';
  }
}
