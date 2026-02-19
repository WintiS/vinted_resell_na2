import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a purchase confirmation email to the customer
 * @param {string} customerEmail - The customer's email address
 * @param {string} productNames - Product names separated by " | " (e.g., "Product 1 | Product 2")
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendPurchaseConfirmationEmail(customerEmail, productNames, sessionId) {
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is not configured');
        return { success: false, error: 'Email service not configured' };
    }

    if (!customerEmail) {
        console.error('❌ No customer email provided');
        return { success: false, error: 'No customer email' };
    }

    try {
        // Parse product names (format: "Product 1 | Product 2 | Product 3")
        const products = productNames ? productNames.split(' | ').filter(Boolean) : ['Unknown Product'];
        const productCount = products.length;
        
        // Determine sender email (use Resend default or configured sender)
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        
        // Create email subject
        const subject = productCount === 1 
            ? `Purchase Confirmation: ${products[0]}`
            : `Purchase Confirmation: ${productCount} Products`;

        // Create email HTML content
        const productListHtml = products
            .map((product, index) => `<li style="margin: 8px 0; padding-left: 8px;">${index + 1}. ${product}</li>`)
            .join('');

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Purchase Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #9d34da; margin-top: 0; font-size: 28px; font-weight: bold;">Thank You for Your Purchase!</h1>
        
        <p style="font-size: 16px; color: #555; margin: 20px 0;">
            We're excited to confirm your purchase. Your order has been successfully processed.
        </p>
        
        <div style="background-color: #f9f9f9; border-left: 4px solid #9d34da; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h2 style="color: #333; font-size: 20px; margin-top: 0; margin-bottom: 15px;">Purchased Products:</h2>
            <ul style="margin: 0; padding-left: 20px; color: #444; font-size: 16px;">
                ${productListHtml}
            </ul>
        </div>
        
        <p style="font-size: 16px; color: #555; margin: 20px 0;">
            You will receive access to your purchased products shortly. If you have any questions, please don't hesitate to contact our support team.
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 14px; color: #888; margin: 5px 0;">
                <strong>Order ID:</strong> ${sessionId}
            </p>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px; padding: 15px; color: #888; font-size: 12px;">
        <p style="margin: 5px 0;">This is an automated confirmation email.</p>
    </div>
</body>
</html>
        `.trim();

        // Plain text version for email clients that don't support HTML
        const textContent = `
Thank You for Your Purchase!

We're excited to confirm your purchase. Your order has been successfully processed.

Purchased Products:
${products.map((product, index) => `${index + 1}. ${product}`).join('\n')}

You will receive access to your purchased products shortly. If you have any questions, please don't hesitate to contact our support team.

Order ID: ${sessionId}

This is an automated confirmation email.
        `.trim();

        // Send email via Resend
        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: customerEmail,
            subject: subject,
            html: htmlContent,
            text: textContent,
        });

        if (error) {
            console.error('❌ Resend API error:', error);
            return { success: false, error: error.message || 'Failed to send email' };
        }

        console.log(`✅ Purchase confirmation email sent to ${customerEmail} (ID: ${data?.id || 'unknown'})`);
        return { success: true, emailId: data?.id };
    } catch (error) {
        console.error('❌ Error sending purchase confirmation email:', error);
        return { success: false, error: error.message || 'Unknown error occurred' };
    }
}


