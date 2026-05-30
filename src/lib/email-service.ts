// import nodemailer from 'nodemailer'
// import { env } from '../env'

// export class EmailService {
//   private transporter: nodemailer.Transporter

//   constructor() {
//     this.transporter = nodemailer.createTransport({
//       host: env.SMTP_HOST,
//       port: env.SMTP_PORT,
//       secure: false,
//       auth: {
//         user: env.SMTP_USER,
//         pass: env.SMTP_PASS,
//       },
//     })
//   }

//   async sendConsultationReminder(
//     to: string,
//     clientName: string,
//     professionalName: string,
//     treatmentName: string,
//     dateTime: Date,
//   ) {
//     const formattedDate = new Date(dateTime).toLocaleDateString('pt-BR', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     })

//     await this.transporter.sendMail({
//       from: env.SMTP_FROM,
//       to,
//       subject: 'Lembrete de Consulta - OdontoApp',
//       html: `
//         <h1>Olá, ${clientName}!</h1>
//         <p>Este é um lembrete da sua consulta agendada para amanhã.</p>
//         <p><strong>Detalhes da consulta:</strong></p>
//         <ul>
//           <li>Profissional: ${professionalName}</li>
//           <li>Tratamento: ${treatmentName}</li>
//           <li>Data e Hora: ${formattedDate}</li>
//         </ul>
//         <p>Por favor, chegue com 15 minutos de antecedência.</p>
//         <p>Atenciosamente,<br>Equipe OdontoApp</p>
//       `,
//     })
//   }
// }
