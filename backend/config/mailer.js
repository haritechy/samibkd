// config/mailer.js

const nodemailer = require("nodemailer");

/**
 * Escape HTML to prevent XSS in email
 */
const escapeHtml = (text = "") =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),

  // true => 465
  // false => 587
  secure: process.env.SMTP_SECURE === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,

  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Verify SMTP
 */
const verifyMailer = async () => {
  try {
    await transporter.verify();

    console.log("====================================");
    console.log("✅ SMTP Connected Successfully");
    console.log("Host :", process.env.SMTP_HOST);
    console.log("Port :", process.env.SMTP_PORT);
    console.log("User :", process.env.SMTP_USER);
    console.log("====================================");
  } catch (err) {
    console.error("====================================");
    console.error("❌ SMTP Connection Failed");
    console.error(err);
    console.error("====================================");
  }
};

/**
 * Contact Form
 */
const sendContactEmail = async ({
  name,
  phone,
  email,
  message,
}) => {
  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  const fromLabel = `"${process.env.SMTP_FROM_NAME || "Sami Medicals"}" <${
    process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
  }>`;

  const adminEmail =
    process.env.CONTACT_RECEIVER_EMAIL ||
    process.env.SMTP_USER;

  /**
   * ADMIN EMAIL
   */

  const adminMail = {
    from: fromLabel,

    to: adminEmail,

    replyTo: email || process.env.SMTP_USER,

    subject: `📩 New Contact Form Submission - ${safeName}`,

    html: `
<div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;border:1px solid #ddd;border-radius:10px;overflow:hidden;">

<div style="background:#C8000A;color:#fff;padding:25px;text-align:center;">
<h2>Sami Medicals</h2>
<p>New Contact Form Submission</p>
</div>

<div style="padding:30px;">

<table style="width:100%;border-collapse:collapse;">

<tr>
<td style="padding:10px;font-weight:bold;width:130px;">Name</td>
<td style="padding:10px;">${safeName}</td>
</tr>

<tr>
<td style="padding:10px;font-weight:bold;">Phone</td>
<td style="padding:10px;">${safePhone || "-"}</td>
</tr>

<tr>
<td style="padding:10px;font-weight:bold;">Email</td>
<td style="padding:10px;">${safeEmail || "-"}</td>
</tr>

<tr>
<td style="padding:10px;font-weight:bold;">Message</td>
<td style="padding:10px;">
${safeMessage}
</td>
</tr>

</table>

</div>

<div style="background:#f5f5f5;padding:20px;text-align:center;font-size:12px;">
Generated automatically from Sami Medicals Website
</div>

</div>
`,
  };

  /**
   * AUTO REPLY
   */

  let autoReply = null;

  if (email) {
    autoReply = {
      from: fromLabel,

      to: email,

      subject: "Thank you for contacting Sami Medicals",

      html: `
<div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;border:1px solid #ddd;border-radius:10px;overflow:hidden;">

<div style="background:#C8000A;color:white;padding:30px;text-align:center;">
<h2>Sami Medicals</h2>
</div>

<div style="padding:30px;">

<p>Hello <b>${safeName}</b>,</p>

<p>
Thank you for contacting Sami Medicals.
</p>

<p>
We have received your enquiry successfully.
</p>

<p>
Our team will contact you shortly.
</p>

<br>

<p>
Regards,<br>
<b>Sami Medicals Team</b>
</p>

</div>

<div style="background:#f5f5f5;padding:20px;text-align:center;">
Karaikudi, Tamil Nadu<br>
📞 +91 94423 34527
</div>

</div>
`,
    };
  }

  try {
    await transporter.sendMail(adminMail);

    console.log("✅ Admin Email Sent");

    if (autoReply) {
      await transporter.sendMail(autoReply);

      console.log("✅ Auto Reply Sent");
    }

    return true;
  } catch (err) {
    console.error("❌ Email Send Failed");
    console.error(err);

    throw err;
  }
};

module.exports = {
  transporter,
  verifyMailer,
  sendContactEmail,
};