const nodemailer = require('nodemailer');

// Verify environment variables are loaded
const verifyEmailConfig = () => {
  console.log('🔍 Checking email configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Found' : '❌ Missing');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Found' : '❌ Missing');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials missing!');
    throw new Error('Email credentials not properly configured. Please check your .env file.');
  }
  
  console.log('✅ Email configuration verified');
  console.log('Using email:', process.env.EMAIL_USER);
};

// Only verify on module load if environment variables are expected to be loaded
try {
  verifyEmailConfig();
} catch (error) {
  console.warn('⚠️ Email configuration will be verified when first used');
}

// Create transporter with better configuration
let transporter = null;

const createTransporter = () => {
  if (!transporter) {
    verifyEmailConfig(); // Verify again when creating transporter
    
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return transporter;
};

// Test the connection
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error.message);
    throw error;
  }
};

// Export the sendVerificationEmail function
const sendVerificationEmail = async (email, otp) => {
  try {
    console.log('📧 Preparing to send verification email to:', email);
    
    const transporter = createTransporter();
    
    // Test connection first
    await testEmailConnection();
    
    const mailOptions = {
      from: `"Memora" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Memora - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">Welcome to Memora!</h2>
          <p style="color: #34495e;">Please use the following OTP to verify your email address:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; letter-spacing: 2px;">
            ${otp}
          </div>
          <p style="color: #34495e;">This code will expire in 10 minutes.</p>
          <p style="color: #7f8c8d; font-size: 12px;">If you didn't request this verification, please ignore this email.</p>
        </div>
      `
    };
    
    console.log('📤 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    
    // Provide more specific error information
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your email credentials.');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('Email server not found. Please check your internet connection.');
    } else {
      throw error;
    }
  }
};

module.exports = { sendVerificationEmail, testEmailConnection };