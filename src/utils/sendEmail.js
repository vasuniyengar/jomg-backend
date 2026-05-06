import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  console.log(process.env.EMAIL_USER);
  console.log(process.env.EMAIL_PASS);
  console.log(process.env.EMAIL_HOST);
  console.log(process.env.EMAIL_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    debug: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"DRIVEPB" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  };

  try {
    console.log(
      `[sendEmail] Attempting to send email via Nodemailer to ${options.to}...`
    );
    let info = await transporter.sendMail(mailOptions);
    console.log(
      `[sendEmail] Nodemailer success! Message ID: ${info.messageId}`
    );
  } catch (nodemailerError) {
    console.error(
      `[sendEmail] Nodemailer FAILED to send email to ${options.to}:`,
      nodemailerError
    );
    throw nodemailerError;
  }
};

export default sendEmail;
