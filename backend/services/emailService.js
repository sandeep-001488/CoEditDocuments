import nodemailer from "nodemailer";
import logger from "../utils/logger.js";



const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, 
    },
  });
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
    const transporter = createTransporter();
    const permissionText =
      permission === "editor" ? "edit this document" : "view this document";

    const mailOptions = {
      from: `"${ownerName}" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `${ownerName} shared "${documentTitle}" with you`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
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
              color: white;
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

              <p style="margin-top: 30px;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>CollabWrite AI - Real-time Collaborative Writing Platform</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.success(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error("Email sending error:", error);
    throw new Error("Failed to send invitation email");
  }
};

export default { sendShareInvitation };
