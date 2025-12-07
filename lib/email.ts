import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export async function sendAppointmentConfirmation({
  to,
  userName,
  date,
  time,
}: {
  to: string
  userName: string
  date: string
  time: string
}) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: '✅ Confirmación de Turno - Consultorio Odontológico Laura Bertoni',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #B8D8E8 0%, #8BC4DD 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #B8D8E8; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🦷 Confirmación de Turno</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              <p>Tu turno ha sido confirmado con éxito.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #4A90A4;">Detalles del Turno</h3>
                <p><strong>📅 Fecha:</strong> ${date}</p>
                <p><strong>🕐 Hora:</strong> ${time}</p>
                <p><strong>📍 Lugar:</strong> Consultorio Odontológico Laura Bertoni</p>
              </div>

              <p><strong>Recomendaciones:</strong></p>
              <ul>
                <li>Llega 10 minutos antes de tu turno</li>
                <li>Trae tu DNI y obra social (si corresponde)</li>
                <li>Si necesitas cancelar o reprogramar, hazlo con 24hs de anticipación</li>
              </ul>

              <p>¡Te esperamos!</p>
              <p><strong>Consultorio Odontológico Laura Bertoni</strong></p>
            </div>
            <div class="footer">
              <p>Este es un correo automático, por favor no responder.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error enviando email:', error)
    return { success: false, error }
  }
}

export async function sendAppointmentCancellation({
  to,
  userName,
  date,
  time,
}: {
  to: string
  userName: string
  date: string
  time: string
}) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: '❌ Cancelación de Turno - Consultorio Odontológico Laura Bertoni',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #e74c3c; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>❌ Cancelación de Turno</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              <p>Tu turno ha sido cancelado.</p>
              
              <div class="info-box">
                <h3 style="margin-top: 0; color: #e74c3c;">Turno Cancelado</h3>
                <p><strong>📅 Fecha:</strong> ${date}</p>
                <p><strong>🕐 Hora:</strong> ${time}</p>
              </div>

              <p>Si necesitas agendar un nuevo turno, puedes hacerlo desde nuestra plataforma.</p>
              
              <p>Saludos cordiales,</p>
              <p><strong>Consultorio Odontológico Laura Bertoni</strong></p>
            </div>
            <div class="footer">
              <p>Este es un correo automático, por favor no responder.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Error enviando email:', error)
    return { success: false, error }
  }
}