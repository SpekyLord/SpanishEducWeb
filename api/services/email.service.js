// Email service using Resend - To be fully implemented when needed
// Resend free tier: 100 emails/day

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@spanishconnect.com'

async function sendEmail({ to, subject, html, text }) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email')
    return { success: false, error: 'Email not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
        text,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Resend API error:', error)
      return { success: false, error: error.message }
    }

    const data = await response.json()
    return { success: true, id: data.id }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error.message }
  }
}

export async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`

  return sendEmail({
    to: email,
    subject: 'Verify your SpanishConnect email',
    html: `
      <h1>Welcome to SpanishConnect!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `,
    text: `Welcome to SpanishConnect! Verify your email: ${verificationUrl}`,
  })
}

export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`

  return sendEmail({
    to: email,
    subject: 'Reset your SpanishConnect password',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
    text: `Reset your SpanishConnect password: ${resetUrl}`,
  })
}

export async function sendNotificationEmail(email, notification) {
  // Future implementation for email notifications
  return { success: false, error: 'Not implemented' }
}

export default { sendEmail, sendVerificationEmail, sendPasswordResetEmail }
