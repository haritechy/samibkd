// config/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Verify SMTP connection on startup
 */
const verifyMailer = async () => {
  try {
    await transporter.verify();
    console.log('✅ SMTP Mailer Ready');
  } catch (err) {
    console.warn('⚠️  SMTP not configured:', err.message);
  }
};

/**
 * Send contact form notification email
 */
const sendContactEmail = async ({ name, phone, email, message }) => {
  const fromLabel = `"${process.env.SMTP_FROM_NAME || 'Sami Medicals'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`;
  const toEmail  = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER;

  // ── Email to admin ──────────────────────────────────────────────────────────
  const adminMailOptions = {
    from: fromLabel,
    to: toEmail,
    subject: `📩 New Contact Form Submission – ${name}`,
    html: `
      <div style="font-family:'Poppins',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        
        <div style="background:linear-gradient(135deg,#C8000A,#8B0000);padding:30px 40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:2px;text-transform:uppercase;">Sami Medicals</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:12px;letter-spacing:1px;">New Contact Form Submission</p>
        </div>
        
        <div style="padding:36px 40px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;width:30%;">
                <span style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Name</span>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                <span style="font-size:14px;font-weight:600;color:#111827;">${name}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                <span style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Phone</span>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                <span style="font-size:14px;font-weight:600;color:#111827;">${phone || 'Not provided'}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                <span style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Email</span>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                <span style="font-size:14px;font-weight:600;color:#111827;">${email || 'Not provided'}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 0 0;" colspan="2">
                <span style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Message</span>
                <div style="margin-top:10px;padding:16px;background:#f9fafb;border-left:3px solid #C8000A;border-radius:4px;">
                  <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${message}</p>
                </div>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">This email was sent from the Sami Medicals website contact form.</p>
        </div>
      </div>
    `,
  };

  // ── Auto-reply to visitor (only if they provided email) ────────────────────
  let autoReply = null;
  if (email) {
    autoReply = {
      from: fromLabel,
      to: email,
      subject: 'Thank you for contacting Sami Medicals 🙏',
      html: `
        <div style="font-family:'Poppins',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <div style="background:linear-gradient(135deg,#C8000A,#8B0000);padding:30px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:2px;text-transform:uppercase;">Sami Medicals</h1>
          </div>
          <div style="padding:36px 40px;">
            <p style="font-size:15px;color:#111827;">Dear <strong>${name}</strong>,</p>
            <p style="font-size:14px;color:#374151;line-height:1.7;">Thank you for reaching out to us! We have received your message and our team will get back to you shortly.</p>
            <p style="font-size:14px;color:#374151;line-height:1.7;">For urgent queries, feel free to call us at <strong>+91 94423 34527</strong> or WhatsApp us.</p>
            <p style="font-size:14px;color:#374151;">Warm regards,<br/><strong style="color:#C8000A;">Sami Medicals Team</strong></p>
          </div>
          <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">Karaikudi, Tamil Nadu | +91 94423 34527</p>
          </div>
        </div>
      `,
    };
  }

  // Send both
  await transporter.sendMail(adminMailOptions);
  if (autoReply) await transporter.sendMail(autoReply);
};

module.exports = { transporter, verifyMailer, sendContactEmail };
