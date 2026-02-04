// Email notification utilities

const API_URL = '/api/send-email';

interface EmailData {
  type: 'new_message' | 'job_application' | 'interview_scheduled' | 'assessment_passed';
  to?: string;
  toUserId?: string;
  data: Record<string, any>;
}

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });
    
    if (!response.ok) {
      console.error('Email send failed:', await response.text());
      return false;
    }
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export async function notifyNewMessage(params: {
  recipientUserId: string;
  recipientName: string;
  senderName: string;
  preview: string;
  conversationId: string;
}): Promise<boolean> {
  return sendEmail({
    type: 'new_message',
    toUserId: params.recipientUserId,
    data: {
      recipientName: params.recipientName,
      senderName: params.senderName,
      preview: params.preview.substring(0, 200) + (params.preview.length > 200 ? '...' : ''),
      conversationId: params.conversationId,
    },
  });
}

export async function notifyJobApplication(params: {
  clientUserId: string;
  clientName: string;
  applicantName: string;
  jobTitle: string;
  jobId: string;
  proposedRate: number | null;
}): Promise<boolean> {
  return sendEmail({
    type: 'job_application',
    toUserId: params.clientUserId,
    data: {
      clientName: params.clientName,
      applicantName: params.applicantName,
      jobTitle: params.jobTitle,
      jobId: params.jobId,
      proposedRate: params.proposedRate || 'Not specified',
    },
  });
}

export async function notifyInterviewScheduled(params: {
  recipientUserId: string;
  recipientName: string;
  otherPartyName: string;
  date: string;
  time: string;
  duration: number;
}): Promise<boolean> {
  return sendEmail({
    type: 'interview_scheduled',
    toUserId: params.recipientUserId,
    data: {
      recipientName: params.recipientName,
      otherPartyName: params.otherPartyName,
      date: params.date,
      time: params.time,
      duration: params.duration,
    },
  });
}

export async function notifyAssessmentPassed(params: {
  vaUserId: string;
  vaName: string;
  skillName: string;
  score: number;
}): Promise<boolean> {
  return sendEmail({
    type: 'assessment_passed',
    toUserId: params.vaUserId,
    data: {
      vaName: params.vaName,
      skillName: params.skillName,
      score: params.score,
    },
  });
}
