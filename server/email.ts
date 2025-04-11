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
 * @param savingsPercentage Optional percentage savings achieved
 * @param nextSteps Optional specific next steps
 * @param proposalCount Optional number of proposals exchanged
 * @returns Promise resolving to true if email was sent, false otherwise
 */
export async function sendNegotiationConclusion({
  supplierEmail,
  supplierName,
  categoryName,
  outcome,
  savingsPercentage,
  nextSteps,
  proposalCount,
}: {
  supplierEmail: string;
  supplierName: string;
  categoryName: string;
  outcome: string;
  savingsPercentage?: number;
  nextSteps?: string[];
  proposalCount?: number;
}): Promise<boolean> {
  const subject = `Negotiation Concluded: ${categoryName}`;
  
  // Generate outcome-specific text
  let resultText = "The negotiation has concluded.";
  let detailText = "";
  let ctaText = "";
  
  if (outcome === "success") {
    resultText = "We're pleased to inform you that the negotiation was successful.";
    detailText = "We've reached an agreement that meets our requirements and look forward to working with you.";
    ctaText = "Our procurement team will be in touch to finalize the contract details.";
  } else if (outcome === "partial") {
    resultText = "The negotiation has concluded with partial agreement.";
    detailText = "We've made progress on some key points, but there are still items that need further discussion.";
    ctaText = "A member of our team will contact you to schedule a follow-up discussion.";
  } else if (outcome === "failure") {
    resultText = "Unfortunately, we could not reach an agreement through this negotiation.";
    detailText = "Despite our best efforts, we weren't able to align on the key requirements for this procurement.";
    ctaText = "A member of our team may reach out if circumstances change.";
  }
  
  // Create a formatted date
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Build the next steps section if provided
  let nextStepsHtml = '';
  let nextStepsText = '';
  
  if (nextSteps && nextSteps.length > 0) {
    nextStepsText = "\nNext Steps:\n" + nextSteps.map(step => `- ${step}`).join("\n");
    nextStepsHtml = `
    <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #4285f4; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #4285f4;">Next Steps</h3>
      <ul>
        ${nextSteps.map(step => `<li>${step}</li>`).join("")}
      </ul>
    </div>`;
  }
  
  // Include savings information if available
  let savingsHtml = '';
  let savingsText = '';
  
  if (typeof savingsPercentage === 'number') {
    const savingsColor = savingsPercentage > 0 ? '#2e7d32' : '#c62828';
    const savingsSign = savingsPercentage > 0 ? '+' : '';
    savingsText = `\nEstimated Savings: ${savingsSign}${savingsPercentage.toFixed(2)}%`;
    savingsHtml = `
    <div style="margin: 15px 0;">
      <span style="display: inline-block; padding: 5px 10px; background-color: ${savingsColor}; color: white; border-radius: 15px; font-weight: bold;">
        Savings: ${savingsSign}${savingsPercentage.toFixed(2)}%
      </span>
    </div>`;
  }
  
  // Include proposal count if available
  let proposalText = '';
  let proposalHtml = '';
  
  if (proposalCount) {
    proposalText = `\nNumber of Proposals Exchanged: ${proposalCount}`;
    proposalHtml = `<p><strong>Proposals Exchanged:</strong> ${proposalCount}</p>`;
  }
  
  const text = `
Dear ${supplierName},

${resultText}
${detailText}

Category: ${categoryName}
Date Concluded: ${formattedDate}
Outcome: ${outcome}${savingsText}${proposalText}

${ctaText}
${nextStepsText}

Thank you for your participation in our AI-powered negotiation process.

Regards,
Procurement AI Negotiator
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Negotiation Conclusion</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f5f5f5; padding: 20px; border-bottom: 3px solid #ddd; }
    .content { padding: 20px; }
    .success { color: #2e7d32; }
    .partial { color: #f57c00; }
    .failure { color: #c62828; }
    .footer { margin-top: 40px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
    .info-box { background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; padding: 15px; margin: 15px 0; }
    .cta-button { display: inline-block; padding: 10px 20px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 4px; margin-top: 15px; }
    @media only screen and (max-width: 480px) {
      .container { width: 100%; padding: 10px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0; color: #444;">Negotiation Concluded</h2>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">${formattedDate}</p>
    </div>
    <div class="content">
      <p>Dear ${supplierName},</p>
      <p class="${outcome}"><strong>${resultText}</strong></p>
      <p>${detailText}</p>
      
      <div class="info-box">
        <p><strong>Category:</strong> ${categoryName}</p>
        <p><strong>Outcome:</strong> <span class="${outcome}">${outcome.charAt(0).toUpperCase() + outcome.slice(1)}</span></p>
        ${proposalHtml}
        ${savingsHtml}
      </div>
      
      <p>${ctaText}</p>
      
      ${nextStepsHtml}
      
      <p>Thank you for your participation in our AI-powered negotiation process.</p>
      
      <p>Regards,<br>Procurement AI Negotiator</p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>© ${new Date().getFullYear()} Procurement AI. All rights reserved.</p>
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