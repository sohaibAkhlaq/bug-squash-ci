const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendTestNotification(to, testCase) {
        try {
            const info = await this.transporter.sendMail({
                from: '"BugSquash CI" <notifications@bugsquash.com>',
                to: to,
                subject: `📢 Test Case Update: ${testCase.testId}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #4f46e5;">Test Case Notification</h2>
                        <p>The following test case has been updated:</p>
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                            <p><strong>ID:</strong> ${testCase.testId}</p>
                            <p><strong>Title:</strong> ${testCase.title}</p>
                            <p><strong>Status:</strong> ${testCase.status}</p>
                            <p><strong>Priority:</strong> ${testCase.priority}</p>
                        </div>
                        <p style="margin-top: 20px;">
                            <a href="${process.env.CLIENT_URL}/test-cases/${testCase._id}" 
                               style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                               View Test Case
                            </a>
                        </p>
                    </div>
                `
            });
            console.log('✉️ Email sent: %s', info.messageId);
            return info;
        } catch (error) {
            console.error('❌ Email failed:', error.message);
        }
    }
}

module.exports = new EmailService();
