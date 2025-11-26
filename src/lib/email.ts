import nodemailer from 'nodemailer';

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM;

    console.log('--- Email Configuration Debug ---');
    console.log('Host:', host);
    console.log('Port:', port);
    console.log('User:', user);
    console.log('Pass:', pass ? '******' : '(missing)');
    console.log('From:', from);
    console.log('---------------------------------');

    if (!host || !user || !pass) {
        throw new Error('Missing SMTP configuration. Please check your .env file.');
    }

    if (host === 'smtp.example.com') {
        throw new Error('SMTP configuration is still using default example values. Please update .env with real credentials.');
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user,
            pass,
        },
        tls: {
            rejectUnauthorized: false // Fix for self-signed certificates or strict firewalls
        }
    });

    try {
        // Verify connection configuration
        await transporter.verify();
        console.log('SMTP Connection verified successfully');

        const info = await transporter.sendMail({
            from,
            to,
            subject,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

export function generateInvitationHtml(name: string | null, email: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const loginUrl = `${appUrl}/login`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to QA Master</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background-color: #2563eb; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; color: #334155; line-height: 1.6; }
        .content h2 { color: #1e293b; font-size: 20px; margin-top: 0; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; transition: background-color 0.2s; }
        .button:hover { background-color: #1d4ed8; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .credentials { background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .credentials p { margin: 5px 0; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>QA Master</h1>
        </div>
        <div class="content">
            <h2>Hello ${name || 'User'},</h2>
            <p>Welcome to <strong>QA Master</strong>! Your account has been successfully created and activated by an administrator.</p>
            <p>You can now access the platform to manage your QA projects and automated tests.</p>
            
            <div class="credentials">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Status:</strong> Active</p>
            </div>

            <div class="button-container">
                <a href="${loginUrl}" class="button">Login to Dashboard</a>
            </div>
            
            <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
            <p><a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a></p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} QA Master. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>
    `;
}
