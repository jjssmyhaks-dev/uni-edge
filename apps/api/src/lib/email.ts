import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM || 'Uni-Edge <noreply@uni-edge.app>';

interface EmailOpts {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOpts) {
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error('[Email] Error:', error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('[Email] Exception:', err);
    return { success: false, error: err };
  }
}

export function offerLetterEmail(studentName: string, program: string, deadline: string) {
  return {
    subject: `Offer of Admission — ${program}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#1e293b">Congratulations, ${studentName}!</h2>
      <p>You have been offered admission to the <strong>${program}</strong> program.</p>
      <p>Please confirm your seat by paying the admission fee before <strong>${deadline}</strong>.</p>
      <p>Log in to your student portal to complete the confirmation process.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <p style="color:#64748b;font-size:12px">This is an automated email from Uni-Edge. Do not reply.</p>
    </div>`,
  };
}

export function examScheduleEmail(studentName: string, examName: string, date: string, time: string, venue: string) {
  return {
    subject: `Exam Schedule — ${examName}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#1e293b">Exam Schedule Update</h2>
      <p>Dear ${studentName},</p>
      <p>Your exam <strong>${examName}</strong> is scheduled as follows:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;color:#64748b">Date</td><td style="padding:8px;font-weight:bold">${date}</td></tr>
        <tr><td style="padding:8px;color:#64748b">Time</td><td style="padding:8px;font-weight:bold">${time}</td></tr>
        <tr><td style="padding:8px;color:#64748b">Venue</td><td style="padding:8px;font-weight:bold">${venue}</td></tr>
      </table>
      <p>Please download your hall ticket from the student portal.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <p style="color:#64748b;font-size:12px">This is an automated email from Uni-Edge.</p>
    </div>`,
  };
}

export function gradePublishedEmail(studentName: string, courseName: string, grade: string, cgpa: number) {
  return {
    subject: `Results Published — ${courseName}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#1e293b">Results Published</h2>
      <p>Dear ${studentName},</p>
      <p>Your results for <strong>${courseName}</strong> have been published.</p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0">Grade: <strong>${grade}</strong></p>
        <p style="margin:8px 0 0">CGPA: <strong>${cgpa.toFixed(2)}</strong></p>
      </div>
      <p>Log in to your student portal to view detailed marks.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <p style="color:#64748b;font-size:12px">This is an automated email from Uni-Edge.</p>
    </div>`,
  };
}

export function feeReminderEmail(studentName: string, feeType: string, amount: number, dueDate: string) {
  return {
    subject: `Fee Payment Reminder — ${feeType}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#1e293b">Fee Payment Reminder</h2>
      <p>Dear ${studentName},</p>
      <p>This is a reminder that your <strong>${feeType}</strong> fee of <strong>₹${amount.toLocaleString('en-IN')}</strong> is due by <strong>${dueDate}</strong>.</p>
      <p>Please log in to the student portal and upload your SBI Collect payment receipt to complete the payment.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <p style="color:#64748b;font-size:12px">This is an automated email from Uni-Edge.</p>
    </div>`,
  };
}

export function grievanceReplyEmail(studentName: string, subject: string, message: string) {
  return {
    subject: `Grievance Update — ${subject}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#1e293b">Grievance Update</h2>
      <p>Dear ${studentName},</p>
      <p>There is an update on your grievance: <strong>${subject}</strong></p>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0;white-space:pre-wrap">${message}</p>
      </div>
      <p>Log in to your student portal to view the full conversation and reply.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <p style="color:#64748b;font-size:12px">This is an automated email from Uni-Edge.</p>
    </div>`,
  };
}

export function registrationConfirmationEmail(studentName: string, courses: string[]) {
  return {
    subject: 'Semester Registration Confirmed',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <h2 style="color:#1e293b">Registration Confirmed</h2>
      <p>Dear ${studentName},</p>
      <p>Your semester registration has been confirmed. You are enrolled in the following courses:</p>
      <ul style="padding-left:20px">${courses.map(c => `<li style="margin:4px 0">${c}</li>`).join('')}</ul>
      <p>You can view your full schedule on the student portal.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <p style="color:#64748b;font-size:12px">This is an automated email from Uni-Edge.</p>
    </div>`,
  };
}
