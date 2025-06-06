import { NextApiRequest, NextApiResponse } from 'next';
import { OpenHandsAgent } from '../../../lib/openhands-agent/OpenHandsAgent';
import { EmailData, EmailAnalysis } from '../../../types/EmailData';

const openHandsAgent = new OpenHandsAgent();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const emailData: EmailData = req.body;
    
    if (!emailData.id || !emailData.subject || !emailData.sender) {
      return res.status(400).json({ error: 'Invalid email data' });
    }

    const analysis = await openHandsAgent.analyzeEmailContent(emailData);
    
    const processingResult = {
      success: true,
      analysis: analysis,
      routing: {
        assignedTo: determineAssignment(analysis),
        department: determineDepartment(analysis),
        workflowTriggered: analysis.suggestedWorkflow,
        escalationLevel: determineEscalationLevel(analysis)
      },
      notifications: {
        sent: true,
        recipients: ['attorney@firm.com'],
        channels: ['slack', 'email']
      }
    };

    console.log(`Processed email: ${emailData.subject} -> ${processingResult.routing.assignedTo}`);
    
    res.status(200).json(processingResult);
  } catch (error) {
    console.error('Error processing email:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process email' 
    });
  }
}

function determineAssignment(analysis: EmailAnalysis): string {
  const priority = analysis.priorityAssessment?.priority;
  const emailType = analysis.emailType?.primaryType;
  
  if (priority === 'urgent') {
    return 'senior_partner';
  } else if (emailType === 'contract_review') {
    return 'contract_attorney';
  } else if (emailType === 'immigration') {
    return 'immigration_attorney';
  } else {
    return 'general_attorney';
  }
}

function determineDepartment(analysis: EmailAnalysis): string {
  const emailType = analysis.emailType?.primaryType;
  
  switch (emailType) {
    case 'contract_review':
      return 'corporate';
    case 'immigration':
      return 'immigration';
    case 'litigation':
      return 'litigation';
    case 'compliance':
      return 'compliance';
    default:
      return 'general';
  }
}

function determineEscalationLevel(analysis: EmailAnalysis): number {
  const priority = analysis.priorityAssessment?.priority;
  
  switch (priority) {
    case 'urgent':
      return 4;
    case 'high':
      return 3;
    case 'medium':
      return 2;
    default:
      return 1;
  }
}
