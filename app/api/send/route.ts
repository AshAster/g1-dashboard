import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Configure your SMTP settings here
    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 1. Send welcome message to the user
    const mailOptionsUser = {
      from: `"G1 Universe" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to G1 Universe! 🚀',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; color: #ffffff; border-radius: 10px;">
          <h1 style="color: #ff3366; text-align: center;">Welcome to the Universe!</h1>
          <p style="font-size: 16px; line-height: 1.5; text-align: center; color: #e5e5e5;">
            Thank you for subscribing, explorer! We're thrilled to have you join the G1 Universe.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <span style="background: linear-gradient(135deg, #ff3366, #ff9933); padding: 12px 24px; border-radius: 8px; font-weight: bold; color: white; display: inline-block;">
              Your Journey Begins
            </span>
          </div>
        </div>
      `,
    };

    // 2. Send notification to admin
    const mailOptionsAdmin = {
      from: `"G1 Universe System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'New Subscriber to G1 Universe! 🎉',
      text: `A new member has just subscribed!\n\nEmail: ${email}\nTime: ${new Date().toLocaleString()}`,
    };

    // Send both emails
    await transporter.sendMail(mailOptionsUser);
    await transporter.sendMail(mailOptionsAdmin);

    return NextResponse.json({ success: true, message: 'Emails sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Failed to send emails. Please ensure environment variables are set.' }, { status: 500 });
  }
}
