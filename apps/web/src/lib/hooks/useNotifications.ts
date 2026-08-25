'use client';

import { useMutation } from '@tanstack/react-query';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

interface SendSMSParams {
  phone: string;
  templateId: string;
  variables: Record<string, string>;
}

// Email templates
export const emailTemplates = {
  offerLetter: (studentName: string, programName: string, institutionName: string) => ({
    subject: `Offer Letter - ${programName} at ${institutionName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Offer Letter</h2>
        <p>Dear ${studentName},</p>
        <p>Congratulations! We are pleased to offer you admission to <strong>${programName}</strong> at <strong>${institutionName}</strong>.</p>
        <p>Please log in to your applicant portal to accept this offer and complete the enrollment process.</p>
        <p>If you have any questions, please contact the admissions office.</p>
        <br>
        <p>Best regards,<br>Admissions Team<br>${institutionName}</p>
      </div>
    `,
  }),

  hallTicket: (studentName: string, examName: string, date: string, time: string, room: string, seat: number) => ({
    subject: `Hall Ticket - ${examName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Hall Ticket</h2>
        <p>Dear ${studentName},</p>
        <p>Your hall ticket for <strong>${examName}</strong> has been generated.</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Exam:</strong> ${examName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Room:</strong> ${room}</p>
          <p><strong>Seat:</strong> ${seat}</p>
        </div>
        <p>Please carry a valid photo ID along with this hall ticket to the exam center.</p>
        <br>
        <p>Best regards,<br>Examination Team</p>
      </div>
    `,
  }),

  noticeNotification: (title: string, content: string, institutionName: string) => ({
    subject: `New Notice - ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">${title}</h2>
        <p>${content}</p>
        <br>
        <p>Best regards,<br>${institutionName}</p>
      </div>
    `,
  }),
};

export function useSendEmail() {
  return useMutation({
    mutationFn: async (params: SendEmailParams) => {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Failed to send email');
      return response.json();
    },
  });
}

export function useSendSMS() {
  return useMutation({
    mutationFn: async (params: SendSMSParams) => {
      const response = await fetch('/api/notifications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) throw new Error('Failed to send SMS');
      return response.json();
    },
  });
}
