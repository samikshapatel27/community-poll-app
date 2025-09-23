const nodemailer = require('nodemailer');

// Email service configuration with lazy initialization
let transporter;
let isTransporterReady = false;
let transporterReadyPromise = null;

// Function to get a ready-to-use email transporter
const getReadyTransporter = async () => {
  if (!process.env.EMAIL_USER || !process.env.APP_PASSWORD) {
    throw new Error('Email credentials not configured in environment variables');
  }
  
  // Create transporter instance if it doesn't exist
  if (!transporter) {
    console.log('Creating email transporter for:', process.env.EMAIL_USER);
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD,
      },
      debug: true,
      logger: true
    });
  }

  // Return immediately if already verified
  if (isTransporterReady) {
    return transporter;
  }
  
  // Verify connection and cache the promise
  if (!transporterReadyPromise) {
    transporterReadyPromise = transporter.verify()
      .then(() => {
        console.log('Email server connection verified successfully');
        isTransporterReady = true;
        return transporter;
      })
      .catch(error => {
        console.error('Email transporter verification failed:', error);
        transporterReadyPromise = null; // Reset on error
        throw error;
      });
  }
  
  return transporterReadyPromise;
};

module.exports = getReadyTransporter;