// Vercel Serverless Function for sending emails via Resend
// Deploy to /api/send-email

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface EmailRequest {
  type: 'new_message' | 'job_application' | 'interview_scheduled' | 'assessment_passed';
  toUserId?: string;  // Look up email from user ID
  to?: string;        // Or provide email directly
  data: Record<string, any>;
}

const templates = {
  new_message: (data: any) => ({
    subject: `New message from ${data.senderName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 2px; border-radius: 16px;">
          <div style="background: #111827; padding: 32px; border-radius: 14px;">
            <h2 style="color: #10b981; margin: 0 0 24px 0; font-size: 24px;">New Message</h2>
            <p style="color: #d1d5db; margin: 0 0 16px 0;">Hi ${data.recipientName},</p>
            <p style="color: #d1d5db; margin: 0 0 16px 0;"><strong style="color: #f3f4f6;">${data.senderName}</strong> sent you a message:</p>
            <div style="background: #1f2937; padding: 16px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; color: #e5e7eb; font-style: italic;">"${data.preview}"</p>
            </div>
            <a href="https://verifiedva.vercel.app/#/messages/${data.conversationId}" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: #111827; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 8px;">
              View Message
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #374151;">
              — VA Marketplace
            </p>
          </div>
        </div>
      </div>
    `
  }),
  
  job_application: (data: any) => ({
    subject: `New application for "${data.jobTitle}"`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 2px; border-radius: 16px;">
          <div style="background: #111827; padding: 32px; border-radius: 14px;">
            <h2 style="color: #10b981; margin: 0 0 24px 0; font-size: 24px;">New Job Application</h2>
            <p style="color: #d1d5db; margin: 0 0 16px 0;">Hi ${data.clientName},</p>
            <p style="color: #d1d5db; margin: 0 0 16px 0;"><strong style="color: #f3f4f6;">${data.applicantName}</strong> applied for your job posting:</p>
            <div style="background: #1f2937; padding: 20px; border-radius: 12px; margin: 24px 0;">
              <h3 style="margin: 0 0 8px 0; color: #f3f4f6; font-size: 18px;">${data.jobTitle}</h3>
              <p style="margin: 0; color: #10b981; font-weight: 600;">Proposed rate: $${data.proposedRate}/hr</p>
            </div>
            <a href="https://verifiedva.vercel.app/#/jobs/${data.jobId}" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: #111827; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 8px;">
              Review Application
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #374151;">
              — VA Marketplace
            </p>
          </div>
        </div>
      </div>
    `
  }),
  
  interview_scheduled: (data: any) => ({
    subject: `Interview scheduled with ${data.otherPartyName}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 2px; border-radius: 16px;">
          <div style="background: #111827; padding: 32px; border-radius: 14px;">
            <h2 style="color: #10b981; margin: 0 0 24px 0; font-size: 24px;">📅 Interview Scheduled</h2>
            <p style="color: #d1d5db; margin: 0 0 16px 0;">Hi ${data.recipientName},</p>
            <p style="color: #d1d5db; margin: 0 0 16px 0;">Your interview with <strong style="color: #f3f4f6;">${data.otherPartyName}</strong> has been scheduled:</p>
            <div style="background: #1f2937; padding: 20px; border-radius: 12px; margin: 24px 0;">
              <p style="margin: 0 0 8px 0; color: #e5e7eb;"><strong>Date:</strong> ${data.date}</p>
              <p style="margin: 0 0 8px 0; color: #e5e7eb;"><strong>Time:</strong> ${data.time}</p>
              <p style="margin: 0; color: #e5e7eb;"><strong>Duration:</strong> ${data.duration} minutes</p>
            </div>
            <a href="https://verifiedva.vercel.app/#/my-interviews" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: #111827; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 8px;">
              View Interview Details
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #374151;">
              — VA Marketplace
            </p>
          </div>
        </div>
      </div>
    `
  }),
  
  assessment_passed: (data: any) => ({
    subject: `🎉 You passed the ${data.skillName} assessment!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 2px; border-radius: 16px;">
          <div style="background: #111827; padding: 32px; border-radius: 14px;">
            <h2 style="color: #10b981; margin: 0 0 24px 0; font-size: 24px;">🎉 Congratulations!</h2>
            <p style="color: #d1d5db; margin: 0 0 16px 0;">Hi ${data.vaName},</p>
            <p style="color: #d1d5db; margin: 0 0 16px 0;">You've successfully passed the <strong style="color: #f3f4f6;">${data.skillName}</strong> assessment!</p>
            <div style="background: #1f2937; padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #e5e7eb; font-size: 14px;">Your Score</p>
              <p style="margin: 0; color: #10b981; font-size: 48px; font-weight: bold;">${data.score}%</p>
              <p style="margin: 16px 0 0 0; color: #10b981;">✓ Verified badge added to your profile</p>
            </div>
            <p style="color: #d1d5db; margin: 0 0 16px 0;">Clients can now see your verified skill, which helps you stand out from other VAs!</p>
            <a href="https://verifiedva.vercel.app/#/dashboard" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: #111827; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 8px;">
              View Your Profile
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #374151;">
              — VA Marketplace
            </p>
          </div>
        </div>
      </div>
    `
  })
};

async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error || !data?.user?.email) return null;
    return data.user.email;
  } catch {
    return null;
  }
}

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { type, to, toUserId, data } = req.body as EmailRequest;
    
    if (!type || (!to && !toUserId) || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const template = templates[type];
    if (!template) {
      return res.status(400).json({ error: 'Invalid email type' });
    }
    
    // Get email address
    let recipientEmail = to;
    if (!recipientEmail && toUserId) {
      recipientEmail = await getUserEmail(toUserId);
    }
    
    if (!recipientEmail) {
      console.log('No email found for user:', toUserId);
      return res.status(200).json({ success: false, reason: 'no_email' });
    }
    
    const { subject, html } = template(data);
    
    const result = await resend.emails.send({
      from: 'VA Marketplace <notifications@verifiedva.app>',
      to: recipientEmail,
      subject,
      html
    });
    
    return res.status(200).json({ success: true, id: result.data?.id });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: error.message });
  }
}
