import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

export interface DatosCorreoBoleto {
  destinatario: string;
  nombreAsistente: string;
  idBoleto: number;
  nombreEvento: string;
  nombreSubEvento: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  nombreRecinto: string;
  asiento?: { fila: string; numero: number } | null;
  qrBase64?: string;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    const port = Number(process.env.SMTP_PORT) || 465;
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Generación del PDF con diseño idéntico al HTML
  private async generarPDFBoleto(datos: DatosCorreoBoleto): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'LETTER', margin: 0 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const startX = 40;
      let y = 40;
      const width = 532; 


      const heightContenedor = datos.qrBase64 ? 660 : 420;
      
      doc.save();
      doc.roundedRect(startX, y, width, heightContenedor, 12).clip();

      doc.rect(startX, y, width, 70).fill('#6b1d2f');
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#ffffff');
      doc.text('Confirmación de Reserva - EventOS', startX, y + 25, { width: width, align: 'center' });

      doc.restore();
      doc.roundedRect(startX, y, width, heightContenedor, 12).lineWidth(1).strokeColor('#e2e8f0').stroke();

      y += 100;


      doc.font('Helvetica').fontSize(14).fillColor('#334155');
      doc.text(`Hola `, startX + 30, y, { continued: true })
         .font('Helvetica-Bold').text(`${datos.nombreAsistente},`);
      
      y += 25;
      doc.font('Helvetica').fontSize(12);
      doc.text('Tu lugar ha sido reservado exitosamente. A continuación encontrarás los detalles de tu boleto:', startX + 30, y, { width: width - 60 });

      y += 40;

      const tableY = y;
      doc.roundedRect(startX + 30, tableY, width - 60, 170, 8).fill('#f8fafc');
      
      y += 20;
      const col1X = startX + 45;
      const col2X = startX + 140;
      const rowHeight = 24;

      const textoAsiento = datos.asiento ? `Fila ${datos.asiento.fila}, Asiento ${datos.asiento.numero}` : 'Entrada General (Sin asiento numerado)';

      const fields = [
          { label: 'Folio:', value: `#${datos.idBoleto}` },
          { label: 'Evento:', value: datos.nombreEvento },
          { label: 'Actividad:', value: datos.nombreSubEvento },
          { label: 'Horario:', value: `${datos.fecha} (${datos.horaInicio} - ${datos.horaFin})` },
          { label: 'Recinto:', value: datos.nombreRecinto },
          { label: 'Lugar:', value: textoAsiento },
      ];

      fields.forEach(f => {
          doc.font('Helvetica-Bold').fillColor('#1e293b').text(f.label, col1X, y);
          doc.font('Helvetica').fillColor('#334155').text(f.value, col2X, y);
          y += rowHeight;
      });

      y = tableY + 170 + 30;


      if (datos.qrBase64) {
          doc.font('Helvetica-Bold').fillColor('#1e293b').text('Presenta este código QR en el acceso:', startX, y, { width: width, align: 'center' });
          y += 25;
          
          const base64Data = datos.qrBase64.replace(/^data:image\/png;base64,/, '');
          const imageBuffer = Buffer.from(base64Data, 'base64');
          const qrSize = 180;
          const qrX = startX + (width - qrSize) / 2;
          

          doc.rect(qrX - 5, y - 5, qrSize + 10, qrSize + 10).lineWidth(1).strokeColor('#e2e8f0').stroke();
          doc.image(imageBuffer, qrX, y, { width: qrSize, height: qrSize });
          
          y += qrSize + 40;
      } else {
          doc.font('Helvetica-Oblique').fillColor('#64748b')
             .text('Esta actividad es de acceso libre y no requiere presentar código QR en la entrada.', startX, y, { width: width, align: 'center' });
          y += 50;
      }


      doc.moveTo(startX + 30, y).lineTo(startX + width - 30, y).lineWidth(1).strokeColor('#e2e8f0').stroke();
      y += 15;
      doc.font('Helvetica').fontSize(10).fillColor('#64748b');
      doc.text('Si no puedes asistir, recuerda cancelar tu reservación desde la sección "Mis Boletos" en la plataforma.', startX + 30, y, { width: width - 60, align: 'center' });

      doc.end();
    });
  }

  async enviarCorreoConfirmacionReserva(datos: DatosCorreoBoleto): Promise<void> {
    const attachments: nodemailer.SendMailOptions['attachments'] = [];
    const timestamp = new Date().getTime();
    
    let seccionQrHtml = `
      <p style="color: #555; font-size: 14px; margin-top: 16px;">
        <em>Esta actividad es de acceso libre y no requiere presentar código QR en la entrada.</em>
      </p>
    `;


    if (datos.qrBase64) {
      const base64Data = datos.qrBase64.replace(/^data:image\/png;base64,/, '');
      const uniqueCid = `qr-${datos.idBoleto}-${timestamp}@eventos.escom`; 
      
      attachments.push({
        filename: `qr-acceso.png`,
        content: base64Data,
        encoding: 'base64',
        cid: uniqueCid,
        contentType: 'image/png',
        contentDisposition: 'inline'
      });

      seccionQrHtml = `
        <div style="text-align: center; margin: 24px 0;">
          <p style="margin-bottom: 8px; font-weight: bold; color: #1e293b;">Presenta este código QR en el acceso:</p>
          <img src="cid:${uniqueCid}" alt="Código QR del Boleto" style="width: 220px; height: 220px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px;" />
        </div>
      `;
    }

    try {
      const pdfBuffer = await this.generarPDFBoleto(datos);
      attachments.push({
        filename: `Boleto_EventOS_${datos.idBoleto}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      });
    } catch (error) {
      this.logger.error('Error al generar el PDF del boleto', error);
    }

    const textoAsiento = datos.asiento
      ? `Fila ${datos.asiento.fila}, Asiento ${datos.asiento.numero}`
      : 'Entrada General (Sin asiento numerado)';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <span style="display:none; color:transparent; font-size:1px;">Ref: ${timestamp}</span>
        
        <div style="background-color: #6b1d2f; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Confirmación de Reserva - EventOS</h2>
        </div>
        
        <div style="padding: 24px; color: #334155;">
          <p>Hola <strong>${datos.nombreAsistente}</strong>,</p>
          <p>Tu lugar ha sido reservado exitosamente. Hemos adjuntado a este correo tu boleto oficial en formato <strong>PDF</strong> para que puedas descargarlo.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; background-color: #f8fafc; border-radius: 8px; padding: 12px;">
            <tr><td style="padding: 8px 12px; font-weight: bold;">Folio:</td><td style="padding: 8px 12px;">#${datos.idBoleto}</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold;">Evento:</td><td style="padding: 8px 12px;">${datos.nombreEvento}</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold;">Actividad:</td><td style="padding: 8px 12px;">${datos.nombreSubEvento}</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold;">Horario:</td><td style="padding: 8px 12px;">${datos.fecha} (${datos.horaInicio} - ${datos.horaFin})</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold;">Recinto:</td><td style="padding: 8px 12px;">${datos.nombreRecinto}</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold;">Lugar:</td><td style="padding: 8px 12px;">${textoAsiento}</td></tr>
          </table>

          ${seccionQrHtml}

          <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            ID Transacción: ${timestamp} <br>
            Si no puedes asistir, recuerda cancelar tu reservación desde la plataforma.
          </p>
        </div>
      </div>
    `;

    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: datos.destinatario,
      subject: `Tu boleto: ${datos.nombreSubEvento} [Folio #${datos.idBoleto}-${randomSuffix}]`,
      html,
      attachments,
    });

    this.logger.log(`Correo con PDF enviado a ${datos.destinatario} (Boleto #${datos.idBoleto})`);
  }

  /** Escapa caracteres HTML especiales en texto ingresado por usuarios. */
  private escaparHtml(texto: string): string {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async enviarNotificacionCambioRecinto(datos: {
    destinatario: string;
    nombreAsistente: string;
    nombreEvento: string;
    nombreSubEvento: string;
    nuevoRecinto: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
  }): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #6b1d2f; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Actualización de Recinto - EventOS</h2>
        </div>
        
        <div style="padding: 24px; color: #334155;">
          <p>Hola <strong>${this.escaparHtml(datos.nombreAsistente)}</strong>,</p>
          <p>Te informamos que la logística del evento <strong>${this.escaparHtml(datos.nombreEvento)}</strong> ha sido actualizada. La actividad en la que estás inscrito ha sido reubicada de espacio físico:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px; background-color: #f8fafc; border-radius: 8px; padding: 12px;">
            <tr><td style="padding: 8px 12px; font-weight: bold;">Actividad:</td><td style="padding: 8px 12px;">${this.escaparHtml(datos.nombreSubEvento)}</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold;">Nuevo Recinto:</td><td style="padding: 8px 12px;"><strong>${this.escaparHtml(datos.nuevoRecinto)}</strong></td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold;">Horario:</td><td style="padding: 8px 12px;">${this.escaparHtml(datos.fecha)} (${this.escaparHtml(datos.horaInicio)} - ${this.escaparHtml(datos.horaFin)})</td></tr>
            <tr><td style="padding: 8px 12px; font-weight: bold;">Modalidad:</td><td style="padding: 8px 12px;">Entrada General (Asiento libre al ingresar)</td></tr>
          </table>

          <div style="margin-top: 20px; padding: 12px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #334155; line-height: 1.5;">
            <strong>Nota importante:</strong> Tu boleto digital continúa <strong>100% activo y válido</strong> con el mismo código QR. Debido a la reubicación, tu acceso será bajo la modalidad de <strong>admisión general</strong> sin butaca numerada específica.
          </div>

          <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            Puedes consultar tus boletos vigentes en la sección "Mis Boletos" dentro de EventOS.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: datos.destinatario,
        subject: `Reubicación de espacio: ${datos.nombreSubEvento} - EventOS`,
        html,
      });
      this.logger.log(`Aviso de cambio de recinto enviado a ${datos.destinatario}`);
    } catch (error) {
      this.logger.error(`Fallo al enviar notificación de cambio de recinto a ${datos.destinatario}`, error);
    }
  }

  async enviarInvitacionLogistica(datos: {
    destinatario: string;
    nombreEvento: string;
    organizador: string;
    enlaceActivacion: string;
  }): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #6b1d2f; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Invitación a Personal de Logística - EventOS</h2>
        </div>
        
        <div style="padding: 24px; color: #334155;">
          <p>Hola,</p>
          <p>El organizador <strong>${datos.organizador}</strong> te ha invitado a formar parte del <strong>Personal de Logística</strong> para el evento institucional:</p>
          
          <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #6b1d2f; font-size: 18px;">${datos.nombreEvento}</h3>
          </div>

          <p>Como colaborador de logística, podrás validar los accesos de los asistentes mediante escaneo de código QR durante la realización de las actividades.</p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${datos.enlaceActivacion}" style="background-color: #6b1d2f; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Activar mi cuenta y unirme al equipo
            </a>
          </div>

          <p style="font-size: 13px; color: #dc2626; text-align: center;">
            * Este enlace es de un solo uso y expirará en <strong>48 horas naturales</strong>.
          </p>

          <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            Si no reconoces esta invitación, puedes ignorar este mensaje con seguridad.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: datos.destinatario,
        subject: `Invitación al Personal de Logística: ${datos.nombreEvento} - EventOS`,
        html,
      });
      this.logger.log(`Invitación de logística enviada a ${datos.destinatario}`);
    } catch (error) {
      this.logger.error(`Fallo al enviar invitación de logística a ${datos.destinatario}`, error);
    }
  }

  async enviarConfirmacionAsignacionLogistica(datos: {
    destinatario: string;
    nombreUsuario: string;
    nombreEvento: string;
  }): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #6b1d2f; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Asignación a Personal de Logística - EventOS</h2>
        </div>
        
        <div style="padding: 24px; color: #334155;">
          <p>Hola <strong>${datos.nombreUsuario}</strong>,</p>
          <p>Te confirmamos que has sido asignado como <strong>Personal de Logística</strong> para el evento:</p>
          
          <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0; color: #6b1d2f; font-size: 18px;">${datos.nombreEvento}</h3>
          </div>

          <p>Ya puedes consultar las actividades programadas en tu panel de eventos asignados y utilizar el escáner QR de acceso durante la fecha del evento.</p>

          <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            EventOS — Escuela Superior de Cómputo (IPN).
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: datos.destinatario,
        subject: `Asignación a Personal de Logística: ${datos.nombreEvento} - EventOS`,
        html,
      });
      this.logger.log(`Confirmación de asignación enviada a ${datos.destinatario}`);
    } catch (error) {
      this.logger.error(`Fallo al enviar confirmación de asignación a ${datos.destinatario}`, error);
    }
  }

  async enviarNotificacionOrganizadorLogisticaAceptada(datos: {
    destinatario: string;
    nombreOrganizador: string;
    nombreColaborador: string;
    correoColaborador: string;
    nombreEvento: string;
  }): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #6b1d2f; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Nuevo Integrante de Logística - EventOS</h2>
        </div>
        
        <div style="padding: 24px; color: #334155;">
          <p>Hola <strong>${datos.nombreOrganizador}</strong>,</p>
          <p>Te informamos que un colaborador ha aceptado la invitación y activado su cuenta como <strong>Personal de Logística</strong> para tu evento:</p>
          
          <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p style="margin: 0 0 8px 0;"><strong>Evento:</strong> ${datos.nombreEvento}</p>
            <p style="margin: 0 0 8px 0;"><strong>Colaborador:</strong> ${datos.nombreColaborador}</p>
            <p style="margin: 0;"><strong>Correo:</strong> ${datos.correoColaborador}</p>
          </div>

          <p>El colaborador ya cuenta con acceso para escanear boletos y validar entradas en las actividades programadas de tu evento.</p>

          <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            Puedes gestionar y consultar a tu equipo de logística en cualquier momento desde el panel de administración del evento.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: datos.destinatario,
        subject: `Nuevo integrante de logística confirmado: ${datos.nombreEvento} - EventOS`,
        html,
      });
      this.logger.log(`Notificación enviada al organizador ${datos.destinatario}`);
    } catch (error) {
      this.logger.error(`Fallo al enviar notificación al organizador ${datos.destinatario}`, error);
    }
  }

  async enviarInvitacionEventoPrivado(datos: {
    destinatario: string;
    nombreUsuario: string;
    nombreEvento: string;
    descripcionEvento: string;
    organizador: string;
    enlaceEvento: string;
  }): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #6b1d2f; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Invitación a Evento Privado - EventOS</h2>
        </div>
        
        <div style="padding: 24px; color: #334155;">
          <p>Hola <strong>${datos.nombreUsuario}</strong>,</p>
          <p>El organizador <strong>${datos.organizador}</strong> te ha invitado a participar en el siguiente evento privado institucional:</p>
          
          <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="margin: 0 0 8px 0; color: #6b1d2f; font-size: 18px;">${datos.nombreEvento}</h3>
            <p style="margin: 0; color: #475569; font-size: 14px;">${datos.descripcionEvento}</p>
          </div>

          <p>Al estar registrado en la lista de invitados, este evento ahora se encuentra disponible en tu cartelera para que puedas consultar sus actividades y reservar tu lugar.</p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${datos.enlaceEvento}" style="background-color: #6b1d2f; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Ver detalles y reservar mi lugar
            </a>
          </div>

          <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            Inicia sesión con tu cuenta en EventOS para acceder a la cartelera y tramitar tu boleto digital.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: datos.destinatario,
        subject: `Invitación al evento: ${datos.nombreEvento} - EventOS`,
        html,
      });
      this.logger.log(`Invitación a evento privado enviada a ${datos.destinatario}`);
    } catch (error) {
      this.logger.error(
        `Fallo al enviar invitación a evento privado a ${datos.destinatario}`,
        error,
      );
    }
  }

  async enviarCorreoRecuperacionContrasena(datos: {
    destinatario: string;
    nombreUsuario: string;
    enlaceRecuperacion: string;
  }): Promise<void> {
    const timestamp = new Date().getTime();
    const randomSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <span style="display:none; color:transparent; font-size:1px;">Ref: ${timestamp}</span>
        <div style="background-color: #6b1d2f; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Recuperación de Contraseña - EventOS</h2>
        </div>
        
        <div style="padding: 24px; color: #334155;">
          <p>Hola <strong>${datos.nombreUsuario}</strong>,</p>
          <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>EventOS</strong>.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${datos.enlaceRecuperacion}" style="background-color: #6b1d2f; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Restablecer mi contraseña
            </a>
          </div>

          <p style="font-size: 13px; color: #dc2626; text-align: center;">
            * Este enlace es de un solo uso y expirará en <strong>15 minutos</strong>.
          </p>

          <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            ID Solicitud: ${timestamp} <br>
            Si tú no solicitaste este cambio, puedes ignorar este correo con seguridad; tu contraseña actual no será modificada.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: datos.destinatario,
        subject: `Restablecer contraseña - EventOS [Ref #${randomSuffix}]`,
        html,
      });
      this.logger.log(
        `Correo de recuperación de contraseña enviado a ${datos.destinatario}`,
      );
    } catch (error) {
      this.logger.error(
        `Fallo al enviar correo de recuperación a ${datos.destinatario}`,
        error,
      );
      throw error;
    }
  }

  async enviarCorreoConfirmacionRegistro(datos: {
    destinatario: string;
    nombreUsuario: string;
    tipoCuenta: string;
    enlaceConfirmacion: string;
  }): Promise<void> {
    const timestamp = new Date().getTime();
    const randomSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <span style="display:none; color:transparent; font-size:1px;">Ref: ${timestamp}</span>
        <div style="background-color: #6b1d2f; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Confirma tu correo electrónico - EventOS</h2>
        </div>
        
        <div style="padding: 24px; color: #334155;">
          <p>Hola <strong>${datos.nombreUsuario}</strong>,</p>
          <p>Gracias por iniciar tu registro en <strong>EventOS</strong> con el perfil de <strong>${datos.tipoCuenta}</strong>.</p>
          <p>Para completar la creación de tu cuenta y poder iniciar sesión en el sistema, confirma tu correo electrónico haciendo clic en el siguiente botón:</p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${datos.enlaceConfirmacion}" style="background-color: #6b1d2f; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Verificar mi correo y activar cuenta
            </a>
          </div>

          <p style="font-size: 13px; color: #dc2626; text-align: center;">
            * Este enlace es de un solo uso y expirará en <strong>15 minutos</strong>.
          </p>

          <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            ID Solicitud: ${timestamp} <br>
            Si tú no solicitaste este registro, puedes ignorar este mensaje y la cuenta no será creada.
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: datos.destinatario,
        subject: `Verifica tu correo para completar tu registro - EventOS [Ref #${randomSuffix}]`,
        html,
      });
      this.logger.log(
        `Correo de confirmación de registro enviado a ${datos.destinatario}`,
      );
    } catch (error) {
      this.logger.error(
        `Fallo al enviar correo de confirmación de registro a ${datos.destinatario}`,
        error,
      );
      throw error;
    }
  }

  /** Envía aviso por cancelación de evento completo o subevento individual. */
  async enviarNotificacionCancelacionEvento(datos: {
    destinatario: string;
    nombreDestinatario: string;
    destinatarioRol: 'asistente' | 'organizador';
    nombreEvento: string;
    motivo: string;
    nombreSubEvento?: string;
  }): Promise<void> {
    const esSubevento = Boolean(datos.nombreSubEvento);
    const nombreDestinatario = this.escaparHtml(datos.nombreDestinatario || 'Usuario');
    const nombreEvento = this.escaparHtml(datos.nombreEvento);
    const nombreSubEvento = datos.nombreSubEvento
      ? this.escaparHtml(datos.nombreSubEvento)
      : '';
    const motivoHtml = this.escaparHtml(datos.motivo).replace(/\r?\n/g, '<br>');

    const titulo = esSubevento
      ? 'Actividad Cancelada - EventOS'
      : 'Evento Cancelado - EventOS';
    const subject = esSubevento
      ? `Actividad cancelada: ${datos.nombreSubEvento} - EventOS`
      : `Evento cancelado: ${datos.nombreEvento} - EventOS`;

    let mensajePrincipal = `Te informamos que el evento <strong>${nombreEvento}</strong> ha sido cancelado, por lo que los boletos asociados quedaron invalidados.`;
    if (datos.destinatarioRol === 'organizador') {
      mensajePrincipal = `Te informamos que la Subdirección de Servicios Educativos ha cancelado tu evento <strong>${nombreEvento}</strong>. Los espacios asignados fueron liberados y los boletos emitidos quedaron invalidados.`;
    } else if (esSubevento) {
      mensajePrincipal = `Te informamos que la actividad <strong>${nombreSubEvento}</strong> del evento <strong>${nombreEvento}</strong> ha sido cancelada, por lo que tu boleto correspondiente a esta actividad quedó invalidado.`;
    }

    const textoPie =
      datos.destinatarioRol === 'organizador'
        ? 'Puedes consultar el estado actualizado de tus eventos en la sección "Mis Eventos" dentro de EventOS.'
        : 'Puedes consultar el estado de tus reservaciones en la sección "Mis Boletos" dentro de EventOS.';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #6b1d2f; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">${titulo}</h2>
        </div>

        <div style="padding: 24px; color: #334155;">
          <p>Hola <strong>${nombreDestinatario}</strong>,</p>
          <p>${mensajePrincipal}</p>

          <div style="margin-top: 20px; padding: 12px 14px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #334155; line-height: 1.5;">
            <strong>Motivo de cancelación:</strong><br>
            ${motivoHtml}
          </div>

          <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            ${textoPie}
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: datos.destinatario,
        subject,
        html,
      });
      this.logger.log(
        `Aviso de cancelación (${datos.destinatarioRol}) enviado a ${datos.destinatario}`,
      );
    } catch (error) {
      this.logger.error(
        `Fallo al enviar aviso de cancelación a ${datos.destinatario}`,
        error,
      );
    }
  }

  async enviarCorreoVerificacionAprobada(datos: {
    destinatario: string;
    nombreUsuario: string;
    perfilVerificado: string;
  }): Promise<void> {
    const timestamp = new Date().getTime();
    const randomSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <span style="display:none; color:transparent; font-size:1px;">Ref: ${timestamp}</span>
        <div style="background-color: #6b1d2f; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Verificación de Cuenta Aprobada - EventOS</h2>
        </div>
        
        <div style="padding: 24px; color: #334155;">
          <p>Hola <strong>${datos.nombreUsuario}</strong>,</p>
          <p>Te informamos que Subdirección ha revisado tu documentación probatoria y tu solicitud de verificación de identidad ha sido <strong>aprobada</strong>.</p>
          
          <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
            <p style="margin: 0 0 8px 0;"><strong>Estado de la cuenta:</strong> Verificado</p>
            <p style="margin: 0 0 8px 0;"><strong>Perfil validado:</strong> ${datos.perfilVerificado}</p>
            <p style="margin: 0;"><strong>Vigencia:</strong> 3 meses (90 días naturales)</p>
          </div>

          <p>Ya puedes ingresar a tu cuenta en EventOS y hacer uso de todas las funciones correspondientes a tu perfil verificado.</p>

          <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            ID Solicitud: ${timestamp} <br>
            EventOS — Escuela Superior de Cómputo (IPN).
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: datos.destinatario,
        subject: `Tu solicitud de verificación de cuenta ha sido aprobada - EventOS [Ref #${randomSuffix}]`,
        html,
      });
      this.logger.log(
        `Correo de verificación aprobada enviado a ${datos.destinatario}`,
      );
    } catch (error) {
      this.logger.error(
        `Fallo al enviar correo de verificación aprobada a ${datos.destinatario}`,
        error,
      );
    }
  }

  async enviarCorreoVerificacionRechazada(datos: {
    destinatario: string;
    nombreUsuario: string;
    perfilSolicitado: string;
    motivoRechazo: string;
  }): Promise<void> {
    const timestamp = new Date().getTime();
    const randomSuffix = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <span style="display:none; color:transparent; font-size:1px;">Ref: ${timestamp}</span>
        <div style="background-color: #6b1d2f; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Resultado de Solicitud de Verificación - EventOS</h2>
        </div>
        
        <div style="padding: 24px; color: #334155;">
          <p>Hola <strong>${datos.nombreUsuario}</strong>,</p>
          <p>Te informamos que Subdirección ha revisado tu solicitud de verificación para el perfil de <strong>${datos.perfilSolicitado}</strong> y en esta ocasión ha sido <strong>rechazada</strong>.</p>
          
          <div style="margin: 20px 0; padding: 16px; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px; color: #991b1b;">
            <p style="margin: 0 0 6px 0; font-weight: bold;">Motivo del rechazo:</p>
            <p style="margin: 0;">${datos.motivoRechazo}</p>
          </div>

          <p>Puedes ingresar nuevamente a la sección de <strong>Mi Perfil</strong> en EventOS para enviar una nueva solicitud adjuntando tu documento probatorio corregido en formato PDF.</p>

          <p style="font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
            ID Solicitud: ${timestamp} <br>
            EventOS — Escuela Superior de Cómputo (IPN).
          </p>
        </div>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: datos.destinatario,
        subject: `Actualización sobre tu solicitud de verificación de cuenta - EventOS [Ref #${randomSuffix}]`,
        html,
      });
      this.logger.log(
        `Correo de verificación rechazada enviado a ${datos.destinatario}`,
      );
    } catch (error) {
      this.logger.error(
        `Fallo al enviar correo de verificación rechazada a ${datos.destinatario}`,
        error,
      );
    }
  }
}