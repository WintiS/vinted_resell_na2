import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a purchase confirmation email to the customer
 * @param {string} customerEmail - The customer's email address
 * @param {string} productNames - Product names separated by " | " (e.g., "Product 1 | Product 2")
 * @param {string} sessionId - Stripe checkout session ID
 * @param {{lang?: 'cs'|'en', tutorialUrl?: string, items?: Array<{id?: any, title?: string, documentLink?: string, isFreeBonus?: boolean}>}} [options]
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendPurchaseConfirmationEmail(customerEmail, productNames, sessionId, options) {
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is not configured');
        return { success: false, error: 'Email service not configured' };
    }

    if (!customerEmail) {
        console.error('❌ No customer email provided');
        return { success: false, error: 'No customer email' };
    }

    try {
        const lang = options?.lang === 'cs' ? 'cs' : 'en';
        const tutorialUrl = typeof options?.tutorialUrl === 'string' ? options.tutorialUrl : '';
        const items = Array.isArray(options?.items) ? options.items : [];

        const t = {
            en: {
                emailTitle: 'Purchase Confirmation',
                subjectSinglePrefix: 'Purchase Confirmation:',
                subjectMulti: (count) => `Purchase Confirmation: ${count} Products`,
                h1: 'Thank You for Your Purchase!',
                intro: `We're excited to confirm your purchase. Your order has been successfully processed.`,
                purchasedProducts: 'Purchased Products:',
                accessLinksTitle: 'Get your item:',
                accessLinksNote: 'Use the links below to access what you bought.',
                tutorialTitle: 'Tutorial:',
                tutorialCta: 'Watch the tutorial here',
                outro: `You will receive access to your purchased products shortly. If you have any questions, please don't hesitate to contact our support team.`,
                orderId: 'Order ID:',
                automated: 'This is an automated confirmation email.',
            },
            cs: {
                emailTitle: 'Potvrzení nákupu',
                subjectSinglePrefix: 'Potvrzení nákupu:',
                subjectMulti: (count) => `Potvrzení nákupu: ${count} produktů`,
                h1: 'Děkujeme za nákup!',
                intro: 'S radostí potvrzujeme váš nákup. Objednávka byla úspěšně zpracována.',
                purchasedProducts: 'Zakoupené produkty:',
                accessLinksTitle: 'Odkazy k vašemu nákupu:',
                accessLinksNote: 'Pomocí odkazů níže získáte přístup k tomu, co jste zakoupili.',
                tutorialTitle: 'Video návod:',
                tutorialCta: 'Zobrazit návod',
                outro: 'Přístup k zakoupeným produktům obdržíte krátce po nákupu. Pokud máte jakýkoli dotaz, napište nám.',
                orderId: 'ID objednávky:',
                automated: 'Toto je automatický potvrzovací e-mail.',
            },
        }[lang];

        const escapeHtml = (value) => {
            const s = String(value ?? '');
            return s
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        // Parse product names (format: "Product 1 | Product 2 | Product 3")
        const products = productNames ? productNames.split(' | ').filter(Boolean) : ['Unknown Product'];
        const productCount = products.length;
        
        // Determine sender email (use Resend default or configured sender)
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
        
        // Create email subject
        const subject = productCount === 1
            ? `${t.subjectSinglePrefix} ${products[0]}`
            : t.subjectMulti(productCount);

        // Create email HTML content
        const productListHtml = products
            .map((product, index) => `<li style="margin: 8px 0; padding-left: 8px;">${index + 1}. ${escapeHtml(product)}</li>`)
            .join('');

        const accessItems = items
            .filter((it) => !it?.isFreeBonus)
            .map((it) => ({
                title: typeof it?.title === 'string' && it.title.trim() ? it.title.trim() : '',
                documentLink: typeof it?.documentLink === 'string' ? it.documentLink.trim() : '',
            }))
            .filter((it) => it.title && it.documentLink);

        const accessLinksHtml = accessItems.length
            ? `
        <div style="background-color: #f9f9f9; border-left: 4px solid #9d34da; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h2 style="color: #333; font-size: 20px; margin-top: 0; margin-bottom: 12px;">${escapeHtml(t.accessLinksTitle)}</h2>
            <p style="margin: 0 0 12px; color: #555; font-size: 14px;">${escapeHtml(t.accessLinksNote)}</p>
            <ul style="margin: 0; padding-left: 20px; color: #444; font-size: 16px;">
                ${accessItems
                    .map(
                        (it, index) =>
                            `<li style="margin: 10px 0; padding-left: 8px;">
                                ${index + 1}. ${escapeHtml(it.title)}<br/>
                                <a href="${escapeHtml(it.documentLink)}" style="display: inline-block; margin-top: 6px; background: #9d34da; color: #fff; text-decoration: none; padding: 10px 14px; border-radius: 10px; font-weight: 700;">
                                    ${lang === 'cs' ? 'Získat produkt' : 'Get your item'}
                                </a>
                            </li>`
                    )
                    .join('')}
            </ul>
        </div>
        `.trim()
            : '';

        const tutorialHtml = tutorialUrl
            ? `
        <div style="background-color: #ffffff; border: 1px solid #eaeaea; padding: 16px; margin: 20px 0; border-radius: 8px;">
            <h2 style="color: #333; font-size: 18px; margin: 0 0 10px;">${escapeHtml(t.tutorialTitle)}</h2>
            <a href="${escapeHtml(tutorialUrl)}" style="color: #9d34da; font-weight: 700; text-decoration: underline;">${escapeHtml(t.tutorialCta)}</a>
        </div>
        `.trim()
            : '';

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(t.emailTitle)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #9d34da; margin-top: 0; font-size: 28px; font-weight: bold;">${escapeHtml(t.h1)}</h1>
        
        <p style="font-size: 16px; color: #555; margin: 20px 0;">
            ${escapeHtml(t.intro)}
        </p>
        
        <div style="background-color: #f9f9f9; border-left: 4px solid #9d34da; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h2 style="color: #333; font-size: 20px; margin-top: 0; margin-bottom: 15px;">${escapeHtml(t.purchasedProducts)}</h2>
            <ul style="margin: 0; padding-left: 20px; color: #444; font-size: 16px;">
                ${productListHtml}
            </ul>
        </div>

        ${accessLinksHtml}
        ${tutorialHtml}
        
        <p style="font-size: 16px; color: #555; margin: 20px 0;">
            ${escapeHtml(t.outro)}
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 14px; color: #888; margin: 5px 0;">
                <strong>${escapeHtml(t.orderId)}</strong> ${escapeHtml(sessionId)}
            </p>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px; padding: 15px; color: #888; font-size: 12px;">
        <p style="margin: 5px 0;">${escapeHtml(t.automated)}</p>
    </div>
</body>
</html>
        `.trim();

        // Plain text version for email clients that don't support HTML
        const accessLinksText = accessItems.length
            ? `\n\n${lang === 'cs' ? 'Odkazy k vašemu nákupu:' : 'Get your item links:'}\n${accessItems
                  .map((it, index) => `${index + 1}. ${it.title}\n${it.documentLink}`)
                  .join('\n\n')}`
            : '';

        const tutorialText = tutorialUrl
            ? `\n\n${lang === 'cs' ? 'Video návod:' : 'Tutorial:'}\n${tutorialUrl}`
            : '';

        const textContent = `
${t.h1}

${t.intro}

${t.purchasedProducts}
${products.map((product, index) => `${index + 1}. ${product}`).join('\n')}${accessLinksText}${tutorialText}

${t.outro}

${t.orderId} ${sessionId}

${t.automated}
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


