const { Resend } = require('resend');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://strooke.vercel.app';

// T-076
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY no configurada — correo omitido');
    return;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  // Plan gratuito de Resend solo permite enviar al email registrado
  const isProd = process.env.NODE_ENV === 'production';
  const recipient = isProd ? process.env.EMAIL_USER : to;
  const finalSubject = isProd && to !== process.env.EMAIL_USER
    ? `[Para: ${to}] ${subject}`
    : subject;

  await resend.emails.send({
    from: 'Strooke <onboarding@resend.dev>',
    to: recipient,
    subject: finalSubject,
    html,
  });
};

const fmt = (n) =>
  Number(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

const htmlBase = (contenido) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff">
        <tr>
          <td style="background:#111;padding:28px;text-align:center">
            <span style="color:#fff;font-size:28px;font-weight:bold;letter-spacing:0.4em;text-transform:uppercase">STROOKE</span>
          </td>
        </tr>
        <tr><td style="padding:32px 28px">${contenido}</td></tr>
        <tr>
          <td style="background:#111;padding:20px;text-align:center">
            <span style="color:#888;font-size:12px;letter-spacing:0.15em;text-transform:uppercase">Strooke — Ibagué, Colombia</span>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const boton = (texto, url) =>
  `<a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:14px 28px;text-decoration:none;letter-spacing:0.15em;font-size:13px;text-transform:uppercase;margin-top:24px">${texto}</a>`;

// T-077
const generarEmailConfirmacion = ({ usuario, pedido, detalles }) => {
  const subtotal = detalles.reduce((acc, d) => acc + Number(d.subtotal), 0);

  const filasProductos = detalles
    .map(
      (d) => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;vertical-align:middle">
        ${
          d.imagen_url
            ? `<img src="${d.imagen_url}" width="56" height="56" style="object-fit:cover;display:block" alt="${d.nombre}">`
            : `<div style="width:56px;height:56px;background:#eee"></div>`
        }
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;color:#111">${d.nombre}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;color:#555;text-align:center">${d.cantidad}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;color:#555;text-align:right">${fmt(d.precio_unitario)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;font-weight:bold;color:#111;text-align:right">${fmt(d.subtotal)}</td>
    </tr>`
    )
    .join('');

  const contenido = `
    <p style="color:#111;font-size:16px;margin:0 0 8px">Hola <strong>${usuario.nombre}</strong>,</p>
    <p style="color:#111;font-size:16px;margin:0 0 24px">Tu pedido fue confirmado exitosamente.</p>

    <div style="background:#111;color:#fff;padding:16px 20px;margin-bottom:28px">
      <span style="letter-spacing:0.15em;font-size:12px;text-transform:uppercase">Número de pedido</span><br>
      <span style="font-size:22px;font-weight:bold;letter-spacing:0.2em">${pedido.numero_pedido}</span>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-collapse:collapse">
      <thead>
        <tr style="background:#f4f4f4">
          <th style="padding:10px 8px;font-size:11px;text-align:left;letter-spacing:0.1em;text-transform:uppercase;color:#555" colspan="2">Producto</th>
          <th style="padding:10px 8px;font-size:11px;text-align:center;letter-spacing:0.1em;text-transform:uppercase;color:#555">Cant.</th>
          <th style="padding:10px 8px;font-size:11px;text-align:right;letter-spacing:0.1em;text-transform:uppercase;color:#555">Precio</th>
          <th style="padding:10px 8px;font-size:11px;text-align:right;letter-spacing:0.1em;text-transform:uppercase;color:#555">Subtotal</th>
        </tr>
      </thead>
      <tbody>${filasProductos}</tbody>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#555">Subtotal</td>
        <td style="padding:6px 0;font-size:14px;color:#111;text-align:right">${fmt(subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#555">Envío</td>
        <td style="padding:6px 0;font-size:14px;color:#111;text-align:right">Gratis</td>
      </tr>
      <tr>
        <td style="padding:10px 0 4px;font-size:16px;font-weight:bold;color:#111;text-transform:uppercase;letter-spacing:0.1em;border-top:2px solid #111">Total</td>
        <td style="padding:10px 0 4px;font-size:16px;font-weight:bold;color:#111;text-align:right;border-top:2px solid #111">${fmt(pedido.total)}</td>
      </tr>
    </table>

    <div style="text-align:center">
      ${boton('VER MI PEDIDO', `${FRONTEND_URL}/seguimiento/${pedido.numero_pedido}`)}
    </div>`;

  return htmlBase(contenido);
};

// T-078
const MENSAJES_ESTADO = {
  en_preparacion: { emoji: '🎉', texto: 'Tu pedido está siendo preparado' },
  enviado:        { emoji: '📦', texto: 'Tu pedido está en camino' },
  en_camino:      { emoji: '🚚', texto: 'Tu pedido está cerca' },
  entregado:      { emoji: '✅', texto: 'Tu pedido fue entregado' },
};

const generarEmailEstado = ({ usuario, pedido, nuevoEstado }) => {
  const { emoji, texto } = MENSAJES_ESTADO[nuevoEstado] || { emoji: '', texto: nuevoEstado };

  const contenido = `
    <p style="color:#111;font-size:16px;margin:0 0 8px">Hola <strong>${usuario.nombre}</strong>,</p>
    <p style="color:#111;font-size:22px;font-weight:bold;margin:0 0 24px">${emoji} ${texto}</p>

    <div style="background:#111;color:#fff;padding:16px 20px;margin-bottom:24px">
      <span style="letter-spacing:0.15em;font-size:12px;text-transform:uppercase">Número de pedido</span><br>
      <span style="font-size:22px;font-weight:bold;letter-spacing:0.2em">${pedido.numero_pedido}</span>
    </div>

    ${
      nuevoEstado === 'enviado' && pedido.numero_guia
        ? `<p style="color:#555;font-size:14px;margin:0 0 24px">
             Número de guía: <strong style="color:#111">${pedido.numero_guia}</strong>
           </p>`
        : ''
    }

    <div style="text-align:center">
      ${boton('RASTREAR PEDIDO', `${FRONTEND_URL}/seguimiento/${pedido.numero_pedido}`)}
    </div>`;

  return htmlBase(contenido);
};

module.exports = { sendEmail, generarEmailConfirmacion, generarEmailEstado };
