# Attorney Workflow Platform - TypeScript/Next.js Implementation

## Overview

This platform provides AI-powered workflow automation for attorneys, integrating OpenHands AI agent, n8n workflow engine, Slack communication, and Gmail processing with markdown-based configuration management.

## 🎯 User Stories

### 1. **New Case Email Processing**
**As an attorney, I want emails about new immigration cases to be automatically routed to the appropriate team member based on case complexity and workload.**

**User Journey:**
1. Attorney receives email with subject "New H1B Application - Tech Company XYZ"
2. Gmail integration detects new email via webhook
3. OpenHands AI agent analyzes email content and determines it's a complex H1B case
4. System checks knowledge base rules: "H1B cases with tech companies → Senior Immigration Attorney"
5. N8n workflow automatically:
   - Creates case folder in shared drive
   - Assigns to Sarah (Senior Immigration Attorney)
   - Sends Slack notification to Sarah with case details
   - Updates case tracking dashboard
6. Sarah receives Slack notification: "New H1B case assigned: Tech Company XYZ - Priority: High"

**Architecture Flow:**
```
Gmail Webhook → EmailProcessor → OpenHands Agent → Knowledge Base Lookup → N8n Workflow → Slack Notification
```

### 2. **Workflow Creation via Slack**
**As an attorney, I want to create new automation workflows using natural language commands in Slack.**

**User Journey:**
1. Attorney types in Slack: `/workflow create "Route contract reviews over $50k to senior partner"`
2. Slack bot receives command and forwards to OpenHands agent
3. OpenHands agent parses intent and generates workflow specification
4. System creates markdown configuration file in knowledge base
5. N8n workflow is automatically generated and deployed
6. Slack confirms: "✅ Workflow created: High-value contracts now route to senior partner"
7. System tests workflow with sample data and reports success

**Architecture Flow:**
```
Slack Command → SlackBot → OpenHands Agent → Markdown Config Generator → N8n Workflow Creation → Confirmation
```

### 3. **Knowledge Base Updates**
**As an attorney, I want to update workflow rules by editing simple text descriptions that automatically update the automation behavior.**

**User Journey:**
1. Attorney navigates to dashboard at `http://localhost:3000/dashboard`
2. Clicks "Knowledge Base" tab
3. Sees current rule: "Immigration cases → Route to Sarah"
4. Edits to: "Immigration cases under $5k → Route to Junior Attorney, Over $5k → Route to Sarah"
5. Clicks "Save Changes"
6. OpenHands agent processes the natural language update
7. System automatically updates N8n workflows
8. Slack notification sent: "Workflow updated: Immigration case routing now considers case value"

**Architecture Flow:**
```
Dashboard Edit → ConfigParser → OpenHands Agent → N8n Workflow Update → Slack Notification
```

### 4. **Gmail OAuth Setup**
**As an attorney, I want to securely connect my Gmail account so the system can process my emails automatically.**

**User Journey:**
1. Attorney logs into dashboard
2. Clicks "Connect Gmail" in integrations panel
3. Redirected to Google OAuth consent screen
4. Grants permissions for email access
5. Returns to dashboard with "Gmail Connected ✅" status
6. System immediately begins monitoring inbox
7. Test email processed within 30 seconds
8. Slack notification: "Gmail integration active - monitoring inbox"

**Architecture Flow:**
```
Dashboard → OAuth URL Generation → Google OAuth → Token Storage → Gmail API Setup → Webhook Registration
```

### 5. **PDF Document Processing**
**As an attorney, I want the system to automatically extract data from immigration forms and populate case management systems.**

**User Journey:**
1. Client emails I-130 form as PDF attachment
2. Gmail integration detects PDF attachment
3. OpenHands agent extracts key data: applicant name, case type, filing deadline
4. System checks knowledge base for I-130 processing rules
5. N8n workflow automatically:
   - Creates case in management system
   - Schedules deadline reminders
   - Assigns to appropriate attorney based on workload
   - Generates client acknowledgment email
6. Attorney receives Slack summary: "New I-130 case: John Doe - Deadline: 30 days - Assigned to you"

**Architecture Flow:**
```
Gmail PDF → Document Parser → OpenHands Agent → Knowledge Base Rules → N8n Case Creation → Multi-system Updates
```

### 6. **Quality Control Workflow**
**As a senior attorney, I want all completed documents to go through an automated quality check before client delivery.**

**User Journey:**
1. Junior attorney completes immigration petition document
2. Uploads to shared folder with tag "ready-for-review"
3. System detects new document via file watcher
4. OpenHands agent performs automated checks:
   - Required fields completed
   - Signature blocks present
   - Compliance with current regulations
5. If issues found: Slack message to junior attorney with specific feedback
6. If clean: Routes to senior attorney for final approval
7. Senior attorney receives Slack notification with document preview link
8. One-click approval triggers client delivery workflow

**Architecture Flow:**
```
File Upload → Document Analyzer → OpenHands QC Agent → Knowledge Base Compliance Rules → Approval Routing → Client Delivery
```

## 🏗️ Architecture Integration Details

### Dashboard Integration Flow
```
Next.js Dashboard → API Routes → OpenHands Agent → N8n Workflows → External Services
                ↓
            Real-time Updates via WebSocket/Polling
```

### Gmail Integration with N8n
1. **OAuth Setup**: Dashboard generates Google OAuth URL → User authorizes → Tokens stored securely
2. **Webhook Registration**: System registers Gmail push notifications → Google sends real-time email events
3. **Processing Pipeline**: Gmail Webhook → EmailProcessor → OpenHands Analysis → N8n Trigger → Action Execution
4. **N8n Workflow**: Email node → Content analysis → Decision logic → Multiple output actions (Slack, file creation, case assignment)

### Slack Integration with N8n
1. **Bot Setup**: Slack app configured with slash commands and event subscriptions
2. **Command Processing**: `/workflow` command → SlackBot → OpenHands parsing → N8n workflow generation
3. **Notification System**: N8n workflows trigger Slack messages via webhook nodes
4. **Interactive Elements**: Slack buttons/modals for approvals → N8n webhook triggers → Workflow continuation

### Knowledge Base Update System
1. **Markdown Storage**: Human-readable workflow rules stored as `.md` files
2. **Version Control**: Git-based versioning of knowledge base changes
3. **Parser Integration**: ConfigParser converts markdown → structured data → N8n workflow JSON
4. **Live Updates**: File changes trigger workflow regeneration without system restart

## 🔄 N8n Integration Architecture

### Workflow Generation Process
```typescript
// OpenHands generates this structure
const workflowSpec = {
  trigger: "gmail_webhook",
  conditions: [
    { field: "subject", contains: "immigration" },
    { field: "sender", domain: "lawfirm.com" }
  ],
  actions: [
    { type: "slack_notify", channel: "#immigration-team" },
    { type: "create_case", system: "clio" },
    { type: "assign_attorney", criteria: "workload_balanced" }
  ]
};

// N8nClient converts to n8n workflow JSON
const n8nWorkflow = N8nClient.generateWorkflow(workflowSpec);
```

### Hidden N8n Complexity
- **Attorneys see**: "Route immigration emails to Sarah"
- **N8n executes**: 15-node workflow with error handling, retries, and logging
- **System manages**: Webhook endpoints, credential rotation, workflow versioning

## 📚 Knowledge Base Management

### Structure
```
knowledge-base/
├── workflows/
│   ├── email-routing.md
│   ├── document-processing.md
│   └── quality-control.md
├── templates/
│   ├── immigration-workflows.md
│   └── contract-workflows.md
└── rules/
    ├── attorney-assignments.md
    └── compliance-checks.md
```

### Update Process
1. **Natural Language Input**: "Route contracts over $50k to senior partner"
2. **OpenHands Processing**: Converts to structured workflow specification
3. **Markdown Generation**: Creates human-readable rule documentation
4. **N8n Deployment**: Automatically generates and deploys workflow
5. **Version Control**: Git commit with change description
6. **Notification**: Slack alert about rule change

### Template System
```markdown
# Immigration Case Processing Template

## Trigger Conditions
- Email contains: "immigration", "visa", "green card"
- Attachment types: PDF, DOC, DOCX

## Processing Rules
- H1B cases → Senior Immigration Attorney
- Family-based → Immigration Specialist
- Urgent (deadline < 30 days) → Immediate Slack alert

## Quality Checks
- Required documents present
- Filing deadlines calculated
- Client contact information verified
```

## 🚨 Potential Missing Components

### 1. **Document Storage Integration**
- **Current**: Basic file handling
- **Missing**: Integration with legal document management systems (NetDocuments, iManage)
- **Solution**: Add document management API connectors

### 2. **Client Portal Integration**
- **Current**: Internal attorney workflows
- **Missing**: Client-facing status updates and document requests
- **Solution**: Client portal API integration with automated status updates

### 3. **Billing System Integration**
- **Current**: Case creation and assignment
- **Missing**: Automatic time tracking and billing code assignment
- **Solution**: Integration with legal billing systems (Clio, TimeSolv)

### 4. **Advanced Document Analysis**
- **Current**: Basic PDF text extraction
- **Missing**: Form field recognition, signature detection, compliance checking
- **Solution**: OCR and document AI services integration

### 5. **Audit Trail and Compliance**
- **Current**: Basic logging
- **Missing**: Comprehensive audit trails for legal compliance
- **Solution**: Detailed logging system with retention policies

### 6. **Multi-Tenant Architecture**
- **Current**: Single law firm setup
- **Missing**: Support for multiple law firms with isolated data
- **Solution**: Tenant-based data separation and configuration

### 7. **Mobile Application**
- **Current**: Web dashboard only
- **Missing**: Mobile app for attorneys on-the-go
- **Solution**: React Native app with core functionality

### 8. **Advanced Analytics**
- **Current**: Basic workflow monitoring
- **Missing**: Performance analytics, bottleneck identification, ROI metrics
- **Solution**: Analytics dashboard with business intelligence

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- N8n instance running on localhost:5678
- OpenAI API key
- Google OAuth credentials
- Slack app credentials

### Installation
```bash
git clone https://github.com/wi-ski/lawchad.git
cd lawchad
npm install
cp .env.example .env.local
# Configure API keys in .env.local
npm run dev
```

### Initial Setup
1. **Configure N8n**: Set up n8n instance with webhook endpoints
2. **Gmail OAuth**: Complete OAuth flow in dashboard
3. **Slack Integration**: Install Slack app in workspace
4. **Knowledge Base**: Upload initial workflow templates
5. **Test Workflows**: Send test emails to verify automation

## 🔧 Development

### Testing
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:integration   # Integration tests
```

### Architecture Principles
- **AI-First**: OpenHands agent handles all natural language processing
- **No-Code Hidden**: N8n complexity completely abstracted from users
- **Markdown-Driven**: Human-readable configuration files
- **Event-Driven**: Webhook-based real-time processing
- **Type-Safe**: Full TypeScript implementation

This platform transforms legal workflow automation from a technical challenge into a conversational experience, where attorneys describe what they want in plain English and the system handles all the complex automation behind the scenes.
