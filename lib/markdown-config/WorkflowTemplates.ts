import { promises as fs } from 'fs';
import path from 'path';
import { remark } from 'remark';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { WorkflowConfig, WorkflowTemplate } from '../../types/WorkflowConfig';

export class WorkflowTemplates {
  private templatesDir: string;
  private configsDir: string;
  private processor: any;
  private isInitialized: boolean = false;

  constructor(baseDir: string = './workflow-data') {
    this.templatesDir = path.join(baseDir, 'templates');
    this.configsDir = path.join(baseDir, 'configs');
    
    this.processor = remark()
      .use(remarkParse)
      .use(remarkStringify)
      .use(remarkFrontmatter, ['yaml', 'toml'])
      .use(remarkGfm);
  }

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.templatesDir, { recursive: true });
      await fs.mkdir(this.configsDir, { recursive: true });
      
      await this.createDefaultTemplates();
      this.isInitialized = true;
      
      console.log('📝 Workflow Templates initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing WorkflowTemplates:', error);
      throw error;
    }
  }

  async createDefaultTemplates(): Promise<void> {
    const templates = [
      this.getContractReviewTemplate(),
      this.getImmigrationCaseTemplate(),
      this.getLitigationSupportTemplate(),
      this.getCorporateComplianceTemplate(),
      this.getRealEstateTemplate()
    ];

    for (const template of templates) {
      const templatePath = path.join(this.templatesDir, `${template.id}.md`);
      const templateContent = this.generateTemplateMarkdown(template);
      
      try {
        await fs.access(templatePath);
        console.log(`📄 Template ${template.id} already exists, skipping...`);
      } catch {
        await fs.writeFile(templatePath, templateContent, 'utf-8');
        console.log(`✅ Created template: ${template.id}`);
      }
    }
  }

  async createWorkflowConfig(
    templateId: string,
    attorneyId: string,
    description: string,
    parameters: Record<string, any>
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const template = await this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      const config = this.generateConfigFromTemplate(template, attorneyId, description, parameters);
      const configContent = this.generateConfigMarkdown(config);
      
      const configFilename = `${templateId}_${attorneyId}_${Date.now()}.md`;
      const configPath = path.join(this.configsDir, configFilename);
      
      await fs.writeFile(configPath, configContent, 'utf-8');
      
      console.log(`📋 Created workflow config: ${configFilename}`);
      return configPath;

    } catch (error) {
      console.error('❌ Error creating workflow config:', error);
      throw error;
    }
  }

  async getTemplate(templateId: string): Promise<WorkflowTemplate | null> {
    try {
      const templatePath = path.join(this.templatesDir, `${templateId}.md`);
      const content = await fs.readFile(templatePath, 'utf-8');
      return this.parseTemplateMarkdown(content);
    } catch (error) {
      console.error(`❌ Error loading template ${templateId}:`, error);
      return null;
    }
  }

  async listTemplates(): Promise<WorkflowTemplate[]> {
    try {
      const files = await fs.readdir(this.templatesDir);
      const templates: WorkflowTemplate[] = [];
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const templateId = file.replace('.md', '');
          const template = await this.getTemplate(templateId);
          if (template) {
            templates.push(template);
          }
        }
      }
      
      return templates;
    } catch (error) {
      console.error('❌ Error listing templates:', error);
      return [];
    }
  }

  async listAttorneyWorkflows(attorneyId: string): Promise<Array<{ filename: string; config: Partial<WorkflowConfig> }>> {
    try {
      const files = await fs.readdir(this.configsDir);
      const workflows: Array<{ filename: string; config: Partial<WorkflowConfig> }> = [];
      
      for (const file of files) {
        if (file.includes(`_${attorneyId}_`) && file.endsWith('.md')) {
          const configPath = path.join(this.configsDir, file);
          const content = await fs.readFile(configPath, 'utf-8');
          const config = this.parseConfigMarkdown(content);
          
          workflows.push({ filename: file, config });
        }
      }
      
      return workflows;
    } catch (error) {
      console.error(`❌ Error listing workflows for ${attorneyId}:`, error);
      return [];
    }
  }

  async updateWorkflowConfig(configPath: string, updates: Partial<WorkflowConfig>): Promise<boolean> {
    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const config = this.parseConfigMarkdown(content);
      
      const updatedConfig = { ...config, ...updates, updatedAt: new Date() };
      const updatedContent = this.generateConfigMarkdown(updatedConfig);
      
      await fs.writeFile(configPath, updatedContent, 'utf-8');
      
      console.log(`🔄 Updated workflow config: ${path.basename(configPath)}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating workflow config:', error);
      return false;
    }
  }

  private getContractReviewTemplate(): WorkflowTemplate {
    return {
      id: 'contract_review',
      name: 'Contract Review Workflow',
      description: 'Automated contract review and approval workflow with value-based routing',
      category: 'corporate',
      template: {
        name: 'Contract Review Workflow',
        description: 'Automated contract review process',
        triggers: [
          {
            type: 'email_received',
            conditions: [
              { field: 'subject', operator: 'contains', value: 'contract' },
              { field: 'attachments', operator: 'contains', value: '.pdf' }
            ],
            priority: 1
          }
        ],
        routing: [
          {
            id: 'high_value_route',
            name: 'High Value Contract Route',
            conditions: [
              { field: 'contract_value', operator: 'greater_than', value: 50000 }
            ],
            target: { type: 'attorney', identifier: 'senior_partner' },
            priority: 1
          }
        ]
      },
      variables: [
        {
          name: 'value_threshold',
          type: 'number',
          description: 'Minimum contract value for senior partner review',
          required: true,
          defaultValue: 50000
        },
        {
          name: 'senior_partner',
          type: 'string',
          description: 'Senior partner attorney ID',
          required: true,
          defaultValue: 'senior_partner'
        }
      ]
    };
  }

  private getImmigrationCaseTemplate(): WorkflowTemplate {
    return {
      id: 'immigration_case',
      name: 'Immigration Case Management',
      description: 'H1B, L1, and O1 visa case management with priority handling',
      category: 'immigration',
      template: {
        name: 'Immigration Case Workflow',
        description: 'Immigration case processing and tracking',
        triggers: [
          {
            type: 'email_received',
            conditions: [
              { field: 'subject', operator: 'regex_match', value: '(H1B|L1|O1|RFE|USCIS)' }
            ],
            priority: 1
          }
        ]
      },
      variables: [
        {
          name: 'case_types',
          type: 'list',
          description: 'Supported visa case types',
          required: true,
          defaultValue: ['H1B', 'L1', 'O1'],
          options: ['H1B', 'L1', 'O1', 'EB1', 'EB2', 'EB3']
        },
        {
          name: 'priority_attorney',
          type: 'string',
          description: 'Immigration specialist attorney ID',
          required: true,
          defaultValue: 'immigration_specialist'
        }
      ]
    };
  }

  private getLitigationSupportTemplate(): WorkflowTemplate {
    return {
      id: 'litigation_support',
      name: 'Litigation Support Workflow',
      description: 'Court deadline tracking and litigation document management',
      category: 'litigation',
      template: {
        name: 'Litigation Support Workflow',
        description: 'Litigation case management and deadline tracking'
      },
      variables: [
        {
          name: 'court_types',
          type: 'list',
          description: 'Supported court types',
          required: true,
          defaultValue: ['Federal', 'State', 'Appeals'],
          options: ['Federal', 'State', 'Appeals', 'Supreme']
        }
      ]
    };
  }

  private getCorporateComplianceTemplate(): WorkflowTemplate {
    return {
      id: 'corporate_compliance',
      name: 'Corporate Compliance Workflow',
      description: 'SEC reporting and regulatory compliance management',
      category: 'compliance',
      template: {
        name: 'Corporate Compliance Workflow',
        description: 'Regulatory compliance and reporting'
      },
      variables: [
        {
          name: 'compliance_types',
          type: 'list',
          description: 'Compliance areas to monitor',
          required: true,
          defaultValue: ['SEC', 'SOX', 'GDPR'],
          options: ['SEC', 'SOX', 'GDPR', 'CCPA', 'HIPAA']
        }
      ]
    };
  }

  private getRealEstateTemplate(): WorkflowTemplate {
    return {
      id: 'real_estate',
      name: 'Real Estate Transaction Workflow',
      description: 'Property transaction and closing coordination',
      category: 'real_estate',
      template: {
        name: 'Real Estate Workflow',
        description: 'Real estate transaction management'
      },
      variables: [
        {
          name: 'transaction_types',
          type: 'list',
          description: 'Types of real estate transactions',
          required: true,
          defaultValue: ['Purchase', 'Sale', 'Lease'],
          options: ['Purchase', 'Sale', 'Lease', 'Refinance']
        }
      ]
    };
  }

  private generateTemplateMarkdown(template: WorkflowTemplate): string {
    return `---
id: ${template.id}
name: ${template.name}
description: ${template.description}
category: ${template.category}
---

# ${template.name}

${template.description}

## Variables

${template.variables.map(variable => `
### ${variable.name}
- **Type**: ${variable.type}
- **Description**: ${variable.description}
- **Required**: ${variable.required}
- **Default**: ${JSON.stringify(variable.defaultValue)}
${variable.options ? `- **Options**: ${variable.options.join(', ')}` : ''}
`).join('\n')}

## Template Configuration

\`\`\`json
${JSON.stringify(template.template, null, 2)}
\`\`\`
`;
  }

  private generateConfigMarkdown(config: Partial<WorkflowConfig>): string {
    return `---
id: ${config.id}
name: ${config.name}
description: ${config.description}
attorneyId: ${config.attorneyId}
version: ${config.version}
isActive: ${config.isActive}
createdAt: ${config.createdAt?.toISOString()}
updatedAt: ${config.updatedAt?.toISOString()}
---

# ${config.name}

${config.description}

## Triggers

${config.triggers?.map(trigger => `
### ${trigger.type}
- **Priority**: ${trigger.priority}
- **Conditions**:
${trigger.conditions.map(condition => `  - ${condition.field} ${condition.operator} ${JSON.stringify(condition.value)}`).join('\n')}
`).join('\n') || 'No triggers defined'}

## Routing Rules

${config.routing?.map(rule => `
### ${rule.name}
- **Target**: ${rule.target.type} - ${rule.target.identifier}
- **Priority**: ${rule.priority}
- **Conditions**:
${rule.conditions.map(condition => `  - ${condition.field} ${condition.operator} ${JSON.stringify(condition.value)}`).join('\n')}
`).join('\n') || 'No routing rules defined'}

## Workflow Steps

${config.steps?.map((step, index) => `
### Step ${index + 1}: ${step.name}
- **Type**: ${step.type}
- **Action**: ${step.action}
- **Parameters**: ${JSON.stringify(step.parameters, null, 2)}
`).join('\n') || 'No workflow steps defined'}

## Notifications

${config.notifications?.map(notification => `
### ${notification.id}
- **Trigger**: ${notification.trigger}
- **Channels**: ${notification.channels.join(', ')}
- **Recipients**: ${notification.recipients.join(', ')}
- **Priority**: ${notification.priority}
`).join('\n') || 'No notifications configured'}
`;
  }

  private parseTemplateMarkdown(content: string): WorkflowTemplate | null {
    try {
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        throw new Error('No frontmatter found');
      }

      const frontmatter = this.parseFrontmatter(frontmatterMatch[1]);
      
      return {
        id: frontmatter.id as string,
        name: frontmatter.name as string,
        description: frontmatter.description as string,
        category: frontmatter.category as string,
        template: {},
        variables: []
      };
    } catch (error) {
      console.error('❌ Error parsing template markdown:', error);
      return null;
    }
  }

  private parseConfigMarkdown(content: string): Partial<WorkflowConfig> {
    try {
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (!frontmatterMatch) {
        throw new Error('No frontmatter found');
      }

      const frontmatter = this.parseFrontmatter(frontmatterMatch[1]);
      
      return {
        id: frontmatter.id as string,
        name: frontmatter.name as string,
        description: frontmatter.description as string,
        attorneyId: frontmatter.attorneyId as string,
        version: frontmatter.version as string,
        isActive: frontmatter.isActive as boolean,
        createdAt: frontmatter.createdAt ? new Date(frontmatter.createdAt as string) : undefined,
        updatedAt: frontmatter.updatedAt ? new Date(frontmatter.updatedAt as string) : undefined
      };
    } catch (error) {
      console.error('❌ Error parsing config markdown:', error);
      return {};
    }
  }

  private parseFrontmatter(frontmatter: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = frontmatter.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        try {
          result[key] = JSON.parse(value);
        } catch {
          result[key] = value;
        }
      }
    }
    
    return result;
  }

  private generateConfigFromTemplate(
    template: WorkflowTemplate,
    attorneyId: string,
    description: string,
    parameters: Record<string, any>
  ): Partial<WorkflowConfig> {
    return {
      id: `${template.id}_${attorneyId}_${Date.now()}`,
      name: `${template.name} - ${attorneyId}`,
      description: description,
      attorneyId: attorneyId,
      version: '1.0.0',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      triggers: template.template.triggers || [],
      steps: [],
      routing: template.template.routing || [],
      notifications: [],
      customRules: [],
      metadata: {
        tags: [template.category],
        category: template.category,
        practiceArea: template.category,
        complexity: 'medium',
        requiredApprovals: []
      }
    };
  }
}
