import resend from "../config/resend.js";

async function sendEmailChangeVerification(newEmail: string, token: string) {
  const frotendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verificationUrl = `${frotendUrl}/verify-email-change?token=${token}`;

  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
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

async function sendEmailChangeAlert(oldEmail: string) {
  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
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

async function sendProfileUpdateNotification(receiver: string) {
  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [receiver],
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

async function sendPasswordRecoveryEmail(receiver: string, resetUrl: string) {
  await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: [receiver],
    subject: "Reset your password",
    html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f8fafc; padding: 20px;">
          <tr>
            <td align="center">
              <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                
                <!-- App Header / Logo -->
                <tr>
                  <td align="center" style="padding-bottom: 24px;">
                    <h1 style="color: #1e293b; font-size: 24px; margin: 0;">Your App Name</h1>
                  </td>
                </tr>

                <!-- Main Heading -->
                <tr>
                  <td>
                    <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 16px;">Password Reset Request</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                      We received a request to reset your password. Click the button below to choose a new one. This link will expire in <strong>15 minutes</strong>.
                    </p>
                  </td>
                </tr>

                <!-- Call-to-Action Button -->
                <tr>
                  <td align="center" style="padding: 10px 0 30px 0;">
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" bgcolor="#2563eb" style="border-radius: 6px;">
                          <a href="${resetUrl}" target="_blank" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; border: 1px solid #2563eb; display: inline-block; font-weight: bold;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Fallback Text / Link -->
                <tr>
                  <td style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                    <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0 0 12px 0;">
                      If the button above doesn't work, copy and paste this URL into your web browser:
                    </p>
                    <p style="color: #2563eb; font-size: 13px; word-break: break-all; margin: 0;">
                      <a href="${resetUrl}" target="_blank" style="color: #2563eb; text-decoration: underline;">${resetUrl}</a>
                    </p>
                  </td>
                </tr>

                <!-- Security Footer -->
                <tr>
                  <td style="padding-top: 30px;">
                    <p style="color: #94a3b8; font-size: 13px; line-height: 18px; margin: 0;">
                      If you did not request a password reset, please ignore this email or contact support if you have concerns. Your password will remain unchanged.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `,
  });
}

export {
  sendPasswordRecoveryEmail,
  sendEmailChangeAlert,
  sendEmailChangeVerification,
  sendProfileUpdateNotification,
};
