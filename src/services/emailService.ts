import sgEmail from '@sendgrid/mail';

sgEmail.setApiKey(process.env.SENDGRID_API_KEY!);

interface SendEmailInterface {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = ({ to, subject, text, html }: SendEmailInterface) => {
  const msg = {
    to,
    from: process.env.SENDGRID_EMAIL!,
    subject,
    text,
    html,
  };
  sgEmail.send(msg);
};
