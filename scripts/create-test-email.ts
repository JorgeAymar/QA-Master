import nodemailer from 'nodemailer';

async function createTestAccount() {
    try {
        const testAccount = await nodemailer.createTestAccount();

        console.log('--- Ethereal Email Credentials ---');
        console.log('User:', testAccount.user);
        console.log('Pass:', testAccount.pass);
        console.log('Smtp:', testAccount.smtp.host);
        console.log('Port:', testAccount.smtp.port);
        console.log('----------------------------------');
        console.log('Preview URL: https://ethereal.email/messages');
    } catch (error) {
        console.error('Failed to create test account:', error);
    }
}

createTestAccount();
