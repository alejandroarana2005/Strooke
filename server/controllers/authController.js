const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');
const { Usuario } = require('../models');

const MAX_INTENTOS = 5;
const BLOQUEO_MINUTOS = 15;

const register = async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
    }

    const existente = await Usuario.findOne({ where: { correo } });
    if (existente) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, correo, password_hash });

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar bloqueo temporal
    if (usuario.bloqueado_hasta && new Date() < new Date(usuario.bloqueado_hasta)) {
      const minutosRestantes = Math.ceil(
        (new Date(usuario.bloqueado_hasta) - new Date()) / 60000
      );
      return res.status(423).json({
        error: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${minutosRestantes} minuto(s).`,
      });
    }

    const valid = await bcrypt.compare(password, usuario.password_hash);

    if (!valid) {
      const nuevosIntentos = (usuario.login_intentos || 0) + 1;
      const actualizacion = { login_intentos: nuevosIntentos };

      if (nuevosIntentos >= MAX_INTENTOS) {
        actualizacion.bloqueado_hasta = new Date(Date.now() + BLOQUEO_MINUTOS * 60000);
        actualizacion.login_intentos = 0;
        await usuario.update(actualizacion);
        return res.status(423).json({
          error: `Demasiados intentos fallidos. Cuenta bloqueada por ${BLOQUEO_MINUTOS} minutos.`,
        });
      }

      await usuario.update(actualizacion);
      const restantes = MAX_INTENTOS - nuevosIntentos;
      return res.status(401).json({
        error: `Credenciales inválidas. ${restantes} intento(s) restante(s) antes del bloqueo.`,
      });
    }

    // Login exitoso: resetear contadores
    await usuario.update({ login_intentos: 0, bloqueado_hasta: null });

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login exitoso',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { correo } = req.body;

    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.json({ message: 'Si el correo existe, recibirás instrucciones' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000);

    await usuario.update({ reset_token: token, reset_token_expiry: expiry });

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: correo,
        subject: 'Recuperación de contraseña — Strooke',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#111;color:#fff;padding:24px;text-align:center">
              <h2 style="letter-spacing:0.3em;margin:0">STROOKE</h2>
            </div>
            <div style="padding:32px">
              <p>Recibimos una solicitud para restablecer tu contraseña.</p>
              <a href="${resetUrl}"
                style="display:inline-block;background:#111;color:#fff;padding:12px 24px;text-decoration:none;letter-spacing:0.1em;margin:20px 0">
                RESTABLECER CONTRASEÑA
              </a>
              <p style="color:#666;font-size:12px">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
            </div>
          </div>
        `,
      });
    }

    return res.json({ message: 'Si el correo existe, recibirás instrucciones' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener mínimo 8 caracteres' });
    }

    const usuario = await Usuario.findOne({
      where: {
        reset_token: token,
        reset_token_expiry: { [Op.gt]: new Date() },
      },
    });

    if (!usuario) {
      return res.status(400).json({ error: 'El enlace es inválido o ha expirado' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await usuario.update({
      password_hash,
      reset_token: null,
      reset_token_expiry: null,
      login_intentos: 0,
      bloqueado_hasta: null,
    });

    return res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
