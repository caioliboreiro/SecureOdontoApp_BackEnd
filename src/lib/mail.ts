// import nodemailer from 'nodemailer'
// import { env } from '@/env'

// const transport = nodemailer.createTransport({
//   host: env.SMTP_HOST,
//   port: env.SMTP_PORT,
//   auth: {
//     user: env.SMTP_USER,
//     pass: env.SMTP_PASS,
//   },
// })

export interface SendMailData {
  to: string
  subject: string
  html: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendMail({ to, subject, html }: SendMailData) {
  if (process.env.NODE_ENV === 'test') {
    return
  }

  // await transport.sendMail({
  //   from: env.SMTP_FROM,
  //   to,
  //   subject,
  //   html,
  // })
}
