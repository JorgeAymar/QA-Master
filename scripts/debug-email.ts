import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

async function debugEmail() {
    console.log('--- Debugging Email Sending ---');

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM;

    console.log('Config:');
    console.log(`Host: ${host}`);
    console.log(`Port: ${port}`);
    console.log(`User: ${user}`);
    console.log(`Pass: ${pass ? '******' : 'MISSING'}`);
    console.log(`From: ${from}`);

    if (!host || !user || !pass) {
        console.error('ERROR: Missing configuration values.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
        debug: true, // Enable debug output from nodemailer
        logger: true // Log to console
    });

    try {
        console.log('\n1. Verifying SMTP Connection...');
        await transporter.verify();
        console.log('✅ Connection Verified!');

        console.log('\n2. Sending Test Email...');
        const info = await transporter.sendMail({
            from,
            to: user, // Send to self for testing
            subject: 'QA Master Debug Email',
            text: 'If you receive this, the email configuration is working correctly.',
            html: '<h1>It Works!</h1><p>If you receive this, the email configuration is working correctly.</p>'
        });

        console.log('✅ Email Sent!');
        console.log('Message ID:', info.messageId);

        if (host.includes('ethereal.email')) {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

    } catch (error) {
        console.error('\n❌ FAILED:');
        console.error(error);
    }
}

debugEmail();
