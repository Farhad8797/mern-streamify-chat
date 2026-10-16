import resend from "../config/resend.js";

export async function sendEmailChangeVerification(
  newEmail: string,
  token: string,
) {
  const frotendUrl = process.env.FRONTEND_URL || "http://localhost:8000";
  const verificationUrl = `${frotendUrl}/verify-email-change?token=${token}`;

  await resend.emails.send({
    from: "Your App Name <support@yourdomain.com>",
    to: [newEmail],
    subject: "Verify your new email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
        <h2 style="color: #1e293b; text-align: center;">Verify Your New Email</h2>
        <p style="color: #475569; font-size: 16px;">You requested to change the email address for your account. Please click the button below to confirm this change:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">This link will expire in 15 minutes. If you did not request this change, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendEmailChangeAlert(oldEmail: string) {
  await resend.emails.send({
    from: "Your App Name <security@yourdomain.com>",
    to: [oldEmail],
    subject: "Security Alert: Email change requested",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
        <h2 style="color: #dc2626; text-align: center;">Security Alert</h2>
        <p style="color: #475569; font-size: 16px;">We received a request to change the email address associated with your account.</p>
        <p style="color: #475569; font-size: 16px;">If you initiated this change, please check your <strong>new inbox</strong> to complete the verification process.</p>
        <p style="color: #dc2626; font-size: 14px; font-weight: bold;">If you did NOT make this request, please secure your account immediately.</p>
      </div>
    `,
  });
}

export async function sendProfileUpdateNotification(email: string) {
  await resend.emails.send({
    from: "Your App Name <security@yourdomain.com>",
    to: [email],
    subject: "Security Notification: Profile Updated",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f8fafc;">
        <h2 style="color: #2563eb; text-align: center;">Profile Updated</h2>
        <p style="color: #475569; font-size: 16px;">Your account profile information (such as your name or avatar) was recently updated.</p>
        <p style="color: #64748b; font-size: 14px;">If you made this change, you can safely ignore this email. If you did not make this change, please secure your account immediately.</p>
      </div>
    `,
  });
}
