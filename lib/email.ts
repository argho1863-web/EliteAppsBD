// lib/email.ts — Brevo API (Edge Runtime compatible)

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: process.env.BREVO_FROM_NAME || 'EliteApps BD', email: process.env.BREVO_FROM_EMAIL! },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) { const err = await res.text(); console.error('Email error:', err); throw new Error(`Email failed: ${err}`); }
  return res.json();
}

export async function sendVerificationEmail(email: string, name: string, code: string) {
  await sendEmail(email, `${code} — Your EliteApps BD Verification Code`, `
    <!DOCTYPE html><html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;margin:0;padding:40px 20px;">
      <div style="max-width:480px;margin:0 auto;background:#12121e;border-radius:16px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#F0A500,#C47D00);padding:32px;text-align:center;">
          <h1 style="color:#0A0A14;font-size:22px;font-weight:800;margin:0;">⚡ EliteApps BD</h1>
          <p style="color:#1a1a2e;margin:6px 0 0;font-size:13px;">Email Verification</p>
        </div>
        <div style="padding:32px;color:#e2e8f0;">
          <p style="font-size:15px;">Hi <strong>${name}</strong>,</p>
          <p style="color:#94a3b8;font-size:14px;">Your verification code is:</p>
          <div style="text-align:center;margin:28px 0;">
            <div style="display:inline-block;background:#0A0A14;border:2px solid rgba(240,165,0,0.3);border-radius:12px;padding:20px 40px;">
              <span style="color:#F0A500;font-size:36px;font-weight:900;letter-spacing:10px;font-family:monospace;">${code}</span>
            </div>
          </div>
          <p style="color:#64748b;font-size:13px;text-align:center;">Expires in <strong>10 minutes</strong>.</p>
        </div>
        <div style="background:#0a0a14;padding:16px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="color:#475569;font-size:12px;margin:0;">EliteApps BD • Premium Digital Products</p>
        </div>
      </div>
    </body></html>
  `);
}

export async function sendOrderNotificationToAdmin(data: {
  orderId: string; customerName: string; customerEmail: string;
  productNames: string[]; totalAmount: number;
  paymentMethod: string; transactionId: string;
  customerDetails?: Record<string, string>;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const approveUrl = `${appUrl}/api/orders/${data.orderId}/approve?secret=${process.env.NEXTAUTH_SECRET}`;
  const cancelUrl = `${appUrl}/api/orders/${data.orderId}/cancel?secret=${process.env.NEXTAUTH_SECRET}`;

  const detailsHtml = data.customerDetails && Object.keys(data.customerDetails).length > 0
    ? `<div style="background:#1a1a2e;border-radius:8px;padding:16px;margin-bottom:12px;border-left:3px solid #f0a500;">
        <p style="color:#f0a500;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;font-weight:700;">📋 Customer Details</p>
        ${Object.entries(data.customerDetails).map(([key, value]) =>
          `<p style="margin:4px 0;font-size:13px;"><span style="color:#94a3b8;">${key}:</span> <strong style="color:#f0a500;">${value}</strong></p>`
        ).join('')}
      </div>`
    : '';

  await sendEmail(
    process.env.EMAIL_ADMIN!,
    `🛒 New Order #${data.orderId.slice(-8).toUpperCase()} from ${data.customerName}`,
    `<!DOCTYPE html><html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#0a0a14;margin:0;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#12121e;border-radius:12px;overflow:hidden;border:1px solid #1a1a2e;">
        <div style="background:linear-gradient(135deg,#f0a500,#c47d00);padding:24px;text-align:center;">
          <h1 style="color:#0a0a14;font-size:20px;font-weight:800;margin:0;">⚡ EliteApps BD — New Order</h1>
        </div>
        <div style="padding:24px;color:#e2e8f0;">
          <div style="background:#1a1a2e;border-radius:8px;padding:16px;margin-bottom:12px;border-left:3px solid #f0a500;">
            <p style="color:#f0a500;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;font-weight:700;">👤 Customer</p>
            <p style="margin:4px 0;font-size:13px;">Name: <strong>${data.customerName}</strong></p>
            <p style="margin:4px 0;font-size:13px;">Email: <strong>${data.customerEmail}</strong></p>
          </div>
          ${detailsHtml}
          <div style="background:#1a1a2e;border-radius:8px;padding:16px;margin-bottom:12px;border-left:3px solid #f0a500;">
            <p style="color:#f0a500;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;font-weight:700;">📦 Order</p>
            <p style="margin:4px 0;font-size:13px;">ID: <strong>#${data.orderId.slice(-8).toUpperCase()}</strong></p>
            <p style="margin:4px 0;font-size:13px;">Products: <strong>${data.productNames.join(', ')}</strong></p>
            <p style="margin:4px 0;font-size:22px;color:#f0a500;font-weight:900;">৳${data.totalAmount.toFixed(2)}</p>
          </div>
          <div style="background:#1a1a2e;border-radius:8px;padding:16px;margin-bottom:20px;border-left:3px solid #f0a500;">
            <p style="color:#f0a500;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;font-weight:700;">💳 Payment</p>
            <p style="margin:4px 0;font-size:13px;">Method: <strong>${data.paymentMethod.toUpperCase()}</strong></p>
            <p style="margin:4px 0;font-size:13px;">TrxID: <strong>${data.transactionId}</strong></p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:6px;"><a href="${approveUrl}" style="display:block;background:linear-gradient(135deg,#10b981,#059669);color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">✅ Approve Order</a></td>
            <td style="padding-left:6px;"><a href="${cancelUrl}" style="display:block;background:linear-gradient(135deg,#ef4444,#dc2626);color:white;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">❌ Cancel Order</a></td>
          </tr></table>
        </div>
      </div>
    </body></html>`
  );
}

export async function sendOrderApprovalToCustomer(customerEmail: string, customerName: string, orderId: string) {
  await sendEmail(customerEmail, `✅ Your Order #${orderId.slice(-8).toUpperCase()} Has Been Approved!`, `
    <!DOCTYPE html><html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;margin:0;padding:40px 20px;">
      <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#10b981,#059669);padding:40px;text-align:center;">
          <div style="font-size:52px;margin-bottom:10px;">✅</div>
          <h1 style="color:white;font-size:22px;font-weight:800;margin:0;">Order Approved!</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#374151;font-size:15px;">Hi <strong>${customerName}</strong>,</p>
          <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:22px;margin:20px 0;text-align:center;">
            <p style="color:#166534;font-weight:700;margin:0;font-size:16px;line-height:1.7;">
              🎉 Your Order Has Been Approved!<br/>
              The Credentials Will Be Sent To Your Email Within 48 Hours.
            </p>
          </div>
          <p style="color:#6b7280;font-size:13px;">Order: <strong>#${orderId.slice(-8).toUpperCase()}</strong></p>
          <div style="margin-top:20px;padding:18px;background:#f9fafb;border-radius:10px;">
            <p style="color:#374151;font-size:13px;font-weight:600;margin:0 0 8px;">Need help?</p>
            <p style="color:#6b7280;font-size:13px;margin:4px 0;">📱 WhatsApp: <a href="https://wa.me/8801707776676" style="color:#10b981;">WhatsApp Support</a></p>
            <p style="color:#6b7280;font-size:13px;margin:4px 0;">✉️ <a href="mailto:help@eliteappsbd.qzz.io" style="color:#10b981;">help@eliteappsbd.qzz.io</a></p>
          </div>
        </div>
        <div style="background:#f0fdf4;padding:14px;text-align:center;border-top:2px solid #bbf7d0;">
          <p style="color:#166534;font-size:12px;margin:0;font-weight:600;">Thank you for shopping with EliteApps BD ⚡</p>
        </div>
      </div>
    </body></html>
  `);
}

export async function sendOrderCancellationToCustomer(customerEmail: string, customerName: string, orderId: string) {
  await sendEmail(customerEmail, `❌ Order #${orderId.slice(-8).toUpperCase()} Has Been Cancelled`, `
    <!DOCTYPE html><html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;margin:0;padding:40px 20px;">
      <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:40px;text-align:center;">
          <div style="font-size:52px;margin-bottom:10px;">❌</div>
          <h1 style="color:white;font-size:22px;font-weight:800;margin:0;">Order Cancelled</h1>
        </div>
        <div style="padding:32px;">
          <p style="color:#374151;font-size:15px;">Hi <strong>${customerName}</strong>,</p>
          <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:12px;padding:22px;margin:20px 0;text-align:center;">
            <p style="color:#991b1b;font-weight:700;margin:0;font-size:15px;line-height:1.7;">
              Order Canceled. You will Get Your Money Back Within 48 Hours.<br/><br/>
              If you don't get your money, message on WhatsApp<br/>
              <a href="https://wa.me/8801707776676" style="color:#dc2626;font-size:18px;font-weight:800;">WhatsApp Support</a><br/>
              or email <a href="mailto:help@eliteappsbd.qzz.io" style="color:#dc2626;">help@eliteappsbd.qzz.io</a>
            </p>
          </div>
          <p style="color:#6b7280;font-size:13px;">Order: <strong>#${orderId.slice(-8).toUpperCase()}</strong></p>
        </div>
        <div style="background:#fef2f2;padding:14px;text-align:center;border-top:2px solid #fecaca;">
          <p style="color:#991b1b;font-size:12px;margin:0;font-weight:600;">We apologize — EliteApps BD ⚡</p>
        </div>
      </div>
    </body></html>
  `);
}
