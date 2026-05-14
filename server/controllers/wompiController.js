const crypto = require('crypto');
const { sequelize, Pedido, DetallePedido, Producto, HistorialEnvio } = require('../models');

// POST /api/wompi/firma — genera firma de integridad para el widget
const generarFirma = (req, res) => {
  const { referencia, monto, moneda = 'COP' } = req.body;

  if (!referencia || !monto) {
    return res.status(400).json({ error: 'referencia y monto son requeridos' });
  }

  const montoEnCentavos = Math.round(Number(monto) * 100);
  // SHA256(referencia + montoEnCentavos + moneda + WOMPI_INTEGRITY_SECRET)
  // WOMPI_INTEGRITY_SECRET nunca sale del servidor
  const cadena = `${referencia}${montoEnCentavos}${moneda}${process.env.WOMPI_INTEGRITY_SECRET}`;
  const firma = crypto.createHash('sha256').update(cadena).digest('hex');

  return res.json({ firma, montoEnCentavos, referencia });
};

// POST /api/webhooks/wompi — recibe eventos de Wompi
const webhookWompi = async (req, res) => {
  // Wompi requiere 200 inmediato para confirmar recepción
  res.status(200).json({ received: true });

  try {
    const { event, data, signature } = req.body;

    if (event !== 'transaction.updated' || !data?.transaction) return;

    const { id, status, amount_in_cents, currency, reference } = data.transaction;

    // Verificar firma: SHA256(id + status + amountInCents + currency + WOMPI_EVENTS_SECRET)
    const cadena = `${id}${status}${amount_in_cents}${currency}${process.env.WOMPI_EVENTS_SECRET}`;
    const expected = crypto.createHash('sha256').update(cadena).digest('hex');

    if (!signature?.checksum || signature.checksum !== expected) {
      console.warn('⚠️  Firma de webhook Wompi inválida — ignorando evento');
      return;
    }

    const pedido = await Pedido.findOne({ where: { numero_pedido: reference } });
    if (!pedido) {
      console.warn(`⚠️  Pedido no encontrado para referencia Wompi: ${reference}`);
      return;
    }

    if (status === 'APPROVED') {
      await pedido.update({ estado: 'en_preparacion' });
      await HistorialEnvio.create({
        pedido_id: pedido.id,
        estado: 'en_preparacion',
        descripcion: 'Pago confirmado por Wompi.',
      });
      console.log(`✅ Pedido ${reference} aprobado por Wompi`);

    } else if (status === 'DECLINED' || status === 'ERROR') {
      const t = await sequelize.transaction();
      try {
        await pedido.update({ estado: 'cancelado' }, { transaction: t });

        const detalles = await DetallePedido.findAll({
          where: { pedido_id: pedido.id },
          transaction: t,
        });
        for (const detalle of detalles) {
          await Producto.increment('stock', {
            by: detalle.cantidad,
            where: { id: detalle.producto_id },
            transaction: t,
          });
        }

        await HistorialEnvio.create({
          pedido_id: pedido.id,
          estado: 'cancelado',
          descripcion: `Pago ${status === 'DECLINED' ? 'rechazado' : 'fallido'} por Wompi.`,
        }, { transaction: t });

        await t.commit();
        console.log(`❌ Pedido ${reference} cancelado por Wompi (${status})`);
      } catch (err) {
        await t.rollback();
        console.error('Error al cancelar pedido por webhook:', err);
      }
    }
  } catch (err) {
    console.error('Error procesando webhook Wompi:', err);
  }
};

module.exports = { generarFirma, webhookWompi };
