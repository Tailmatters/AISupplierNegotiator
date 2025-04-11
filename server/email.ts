import sgMail from '@sendgrid/mail';

// Configure SendGrid if API key is available
let sendgridEnabled = false;
try {
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sendgridEnabled = true;
    console.log('SendGrid configured successfully');
  } else {
    console.log('SendGrid API key not found. Email functionality will be simulated.');
  }
} catch (error) {
  console.error('Error configuring SendGrid:', error);
}

/**
 * Send an email using SendGrid
 * @param to Recipient email address
 * @param subject Email subject line
 * @param text Plain text email content
 * @param html HTML email content (optional)
 * @param from Sender email address (defaults to a generic address)
 * @returns Promise resolving to true if email was sent, false otherwise
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
  from = 'noreply@procurement-ai.com'
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
}): Promise<boolean> {
  try {
    // If SendGrid is configured, send the email
    if (sendgridEnabled) {
      await sgMail.send({
        to,
        from,
        subject,
        text,
        html: html || text,
      });
      console.log(`Email sent to ${to}`);
      return true;
    } else {
      // Log the email content for debugging/development
      console.log('============ EMAIL SIMULATION ============');
      console.log(`From: ${from}`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${text}`);
      console.log('=========================================');
      console.log('Email would have been sent if SENDGRID_API_KEY was configured.');
      return true; // Return true to simulate successful sending
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send an invitation email to a supplier for negotiation
 * @param supplierEmail Supplier's email address
 * @param supplierName Supplier's name
 * @param invitationLink URL for the supplier to access the negotiation
 * @param categoryName Name of the category being negotiated
 * @returns Promise resolving to true if email was sent, false otherwise
 */
export async function sendNegotiationInvitation({
  supplierEmail,
  supplierName,
  invitationLink,
  categoryName,
}: {
  supplierEmail: string;
  supplierName: string;
  invitationLink: string;
  categoryName: string;
}): Promise<boolean> {
  const subject = `Invitation to negotiate: ${categoryName}`;
  const text = `
Dear ${supplierName},

You have been invited to participate in an AI-powered negotiation for ${categoryName}.

Please click the link below to join the negotiation:
${invitationLink}

This link is unique to you and should not be shared.

Regards,
Procurement AI Negotiator
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
    .footer { margin-top: 40px; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Negotiation Invitation</h2>
    <p>Dear ${supplierName},</p>
    <p>You have been invited to participate in an AI-powered negotiation for <strong>${categoryName}</strong>.</p>
    <p><a href="${invitationLink}" class="button">Join Negotiation</a></p>
    <p>Or copy and paste this link in your browser: ${invitationLink}</p>
    <p>This link is unique to you and should not be shared.</p>
    <p>Regards,<br>Procurement AI Negotiator</p>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to: supplierEmail,
    subject,
    text,
    html,
  });
}

/**
 * Send a notification email about negotiation conclusion
 * @param supplierEmail Supplier's email address
 * @param supplierName Supplier's name
 * @param categoryName Name of the category being negotiated
 * @param outcome Result of the negotiation (success, partial, failure)
 * @returns Promise resolving to true if email was sent, false otherwise
 */
export async function sendNegotiationConclusion({
  supplierEmail,
  supplierName,
  categoryName,
  outcome,
}: {
  supplierEmail: string;
  supplierName: string;
  categoryName: string;
  outcome: string;
}): Promise<boolean> {
  const subject = `Negotiation Concluded: ${categoryName}`;
  
  let resultText = "The negotiation has concluded.";
  if (outcome === "success") {
    resultText = "We're pleased to inform you that the negotiation was successful.";
  } else if (outcome === "partial") {
    resultText = "The negotiation has concluded with partial agreement.";
  } else if (outcome === "failure") {
    resultText = "Unfortunately, we could not reach an agreement through this negotiation.";
  }
  
  const text = `
Dear ${supplierName},

${resultText}

Category: ${categoryName}

Our procurement team will follow up with next steps shortly.

Regards,
Procurement AI Negotiator
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .success { color: #2e7d32; }
    .partial { color: #f57c00; }
    .failure { color: #c62828; }
    .footer { margin-top: 40px; font-size: 12px; color: #777; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Negotiation Concluded</h2>
    <p>Dear ${supplierName},</p>
    <p class="${outcome}"><strong>${resultText}</strong></p>
    <p><strong>Category:</strong> ${categoryName}</p>
    <p>Our procurement team will follow up with next steps shortly.</p>
    <p>Regards,<br>Procurement AI Negotiator</p>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to: supplierEmail,
    subject,
    text,
    html,
  });
}