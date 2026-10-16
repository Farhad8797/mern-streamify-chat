import resend from "../config/resend.js";

export default async function signUpEmail(
  receiver: string,
  verificationUrl: string,
) {
  await resend.emails.send({
    from: "Your App <onboarding@yourdomain.com>",
    to: [receiver],
    subject: "Verify your email address",
    html: `
    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
      <h2>Welcome, ${receiver}!</h2>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Verify Email
      </a>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">This link will expire in 24 hours.</p>
    </div>
  `,
  });
}
