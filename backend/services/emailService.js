import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    logger.error(
      "Email configuration missing: EMAIL_USER or EMAIL_PASSWORD not set"
    );
    throw new Error("Email service not configured properly");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000, 
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    return transporter;
  } catch (error) {
    logger.error("Failed to create email transporter:", error);
    throw error;
  }
};

export const sendShareInvitation = async (
  ownerEmail,
  ownerName,
  recipientEmail,
  documentTitle,
  shareLink,
  permission
) => {
  try {
    if (
      !ownerEmail ||
      !ownerName ||
      !recipientEmail ||
      !documentTitle ||
      !shareLink
    ) {
      throw new Error("Missing required parameters for email invitation");
    }

    const transporter = createTransporter();
    const permissionText =
      permission === "editor" ? "edit this document" : "view this document";

    const mailOptions = {
      from: `"${ownerName}" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      replyTo: ownerEmail,
      subject: `${ownerName} shared "${documentTitle}" with you`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white !important;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
            .info-box {
              background: #f0f0f0;
              padding: 15px;
              border-left: 4px solid #667eea;
              margin: 20px 0;
            }
            code {
              background: #f4f4f4;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 12px;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📄 CollabWrite AI</h1>
              <p>Collaborative Document Sharing</p>
            </div>
            <div class="content">
              <h2>Hello! 👋</h2>
              <p><strong>${ownerName}</strong> has invited you to collaborate on a document.</p>
              
              <div class="info-box">
                <p><strong>Document:</strong> ${documentTitle}</p>
                <p><strong>Permission:</strong> You can ${permissionText}</p>
                <p><strong>Shared by:</strong> ${ownerName} (${ownerEmail})</p>
              </div>

              <p>Click the button below to access the document:</p>
              
              <center>
                <a href="${shareLink}" class="button">Open Document</a>
              </center>

              <p>Or copy this link: <br><code>${shareLink}</code></p>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>CollabWrite AI - Real-time Collaborative Writing Platform</p>
              <p>This is an automated email, please do not reply directly to this message.</p>
              <p style="margin-top: 10px;">
                Questions? Contact ${ownerEmail}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello!

${ownerName} has invited you to collaborate on a document.

Document: ${documentTitle}
Permission: You can ${permissionText}
Shared by: ${ownerName} (${ownerEmail})

Access the document here: ${shareLink}

If you didn't expect this invitation, you can safely ignore this email.

---
CollabWrite AI - Real-time Collaborative Writing Platform
Questions? Contact ${ownerEmail}
      `,
    };

    logger.info(`Attempting to send email to ${recipientEmail}...`);

    const info = await transporter.sendMail(mailOptions);

    logger.success(`✅ Email sent successfully: ${info.messageId}`);
    logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    logger.error("❌ Email sending error:", error);

    if (error.code === "EAUTH") {
      logger.error("Authentication failed. Please check:");
      logger.error("1. EMAIL_USER is correct");
      logger.error(
        "2. EMAIL_PASSWORD is an App Password (not regular password)"
      );
      logger.error("3. 2-Step Verification is enabled in Gmail");
    } else if (error.code === "ESOCKET" || error.code === "ETIMEDOUT") {
      logger.error(
        "Network/timeout error. Check your internet connection and firewall settings"
      );
    } else if (error.code === "EENVELOPE") {
      logger.error("Invalid email addresses provided");
    }

    throw new Error(`Failed to send invitation email: ${error.message}`);
  }
};

// Test email configuration
export const testEmailConfiguration = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.success("✅ Email configuration is valid");
    return { success: true, message: "Email service is working" };
  } catch (error) {
    logger.error("❌ Email configuration test failed:", error);
    return { success: false, message: error.message };
  }
};

export default { sendShareInvitation, testEmailConfiguration };