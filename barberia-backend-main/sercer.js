const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 1. CONEXIÓN A MONGOOSE
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_EMAILS = new Set(
    (process.env.ADMIN_EMAILS || '')
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(Boolean)
);
if (!MONGO_URI || !JWT_SECRET) {
    console.error('❌ Configura MONGO_URI y JWT_SECRET en el archivo .env.');
    process.exit(1);
}
// 2. MODELOS DE LA BASE DE DATOS (Se crean solos en MongoDB)
const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

async function requireAdmin(req, res, next) {
    if (ADMIN_EMAILS.size === 0) {
        return res.status(503).json({ error: 'La administración no está configurada en el servidor' });
    }

    const authorization = req.get('authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token) {
        return res.status(401).json({ error: 'Inicia sesión con una cuenta administradora' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const usuario = typeof payload === 'object' && payload.id
            ? await User.findById(payload.id).select('email').lean()
            : null;
        if (!usuario) {
            return res.status(401).json({ error: 'La sesión ya no es válida' });
        }
        if (!ADMIN_EMAILS.has(usuario.email.toLowerCase())) {
            return res.status(403).json({ error: 'Esta cuenta no tiene acceso administrativo' });
        }
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'La sesión ya no es válida' });
        }
        console.error('Error al validar acceso administrativo:', error.name);
        res.status(500).json({ error: 'No se pudo validar el acceso administrativo' });
    }
}

const CitaSchema = new mongoose.Schema({
    clienteNombre: { type: String, required: true },
    barbero: { type: String, required: true },
    servicio: { type: String, required: true },
    fecha: { type: String, required: true }, // Ej: "2026-11-20"
    hora: { type: String, required: true },   // Ej: "14:00"
    estado: { type: String, enum: ['reservada', 'realizada'], default: 'reservada' }
});
// Regla de oro: Evita que agenden al mismo barbero a la misma fecha y hora
CitaSchema.index({ barbero: 1, fecha: 1, hora: 1 }, { unique: true });
const Cita = mongoose.model('Cita', CitaSchema);

const BARBER_EMAIL_KEYS = {
    'Samuel Bolaños': 'samuel',
    'Luis David Jimenes': 'luis',
    'Johan Rojas': 'johan'
};
const SERVICE_DURATIONS = {
    'Corte clásico': 40,
    'Corte degradado': 50,
    'Corte y barba': 75,
    'Arreglo de barba': 30,
    'Diseño y asesoría de estilo': 60
};

async function sendCalendarInvitation(cita) {
    const { GOOGLE_CALENDAR_ID, GOOGLE_SERVICE_ACCOUNT_JSON, BARBER_EMAILS_JSON } = process.env;
    if (!GOOGLE_CALENDAR_ID || !GOOGLE_SERVICE_ACCOUNT_JSON || !BARBER_EMAILS_JSON) {
        return { enviada: false, mensaje: 'Google Calendar aún no está configurado en el servidor.' };
    }

    try {
        const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
        const barberEmails = JSON.parse(BARBER_EMAILS_JSON);
        const emailKey = BARBER_EMAIL_KEYS[cita.barbero];
        const barberEmail = emailKey && barberEmails[emailKey];
        const duration = SERVICE_DURATIONS[cita.servicio];
        if (!barberEmail || !duration) {
            console.error('Falta el correo del barbero o la duración del servicio para la invitación de Calendar.');
            return { enviada: false, mensaje: 'No se pudo identificar al barbero o la duración para enviar la invitación.' };
        }

        const start = new Date(`${cita.fecha}T${cita.hora}:00-05:00`);
        if (Number.isNaN(start.getTime())) {
            return { enviada: false, mensaje: 'La fecha u hora de la cita no es válida para Google Calendar.' };
        }
        const end = new Date(start.getTime() + duration * 60_000);
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/calendar']
        });
        const calendar = google.calendar({ version: 'v3', auth });
        await calendar.events.insert({
            calendarId: GOOGLE_CALENDAR_ID,
            sendUpdates: 'all',
            requestBody: {
                summary: `${cita.servicio} con ${cita.barbero}`,
                description: `Cita de ${cita.clienteNombre} en EL BORO BARBER SHOP.`,
                start: { dateTime: start.toISOString(), timeZone: 'America/Bogota' },
                end: { dateTime: end.toISOString(), timeZone: 'America/Bogota' },
                attendees: [{ email: barberEmail }]
            }
        });
        return { enviada: true, mensaje: `Invitación enviada a ${barberEmail}.` };
    } catch (error) {
        console.error('No se pudo enviar la invitación de Google Calendar:', error.message);
        return { enviada: false, mensaje: 'La cita quedó guardada, pero no se pudo enviar la invitación de Google Calendar.' };
    }
}


// 3. RUTAS DEL SISTEMA (API ENDPOINTS)

// Ruta de prueba inicial
app.get('/', (req, res) => {
    res.send('Servidor de la Barbería en línea y funcionando.');
});

app.get('/api/health', (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;
    res.status(databaseConnected ? 200 : 503).json({
        api: 'online',
        database: databaseConnected ? 'connected' : 'disconnected'
    });
});

app.use('/api', (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ error: 'La base de datos no está disponible' });
    }
    next();
});

// A. RUTA: REGISTRO DE USUARIOS
app.post('/api/auth/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        // Encriptar la contraseña por seguridad
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const nuevoUsuario = new User({ nombre, email, password: hashedPassword });
        await nuevoUsuario.save();
        res.status(201).json({ mensaje: 'Usuario registrado con éxito' });
    } catch (error) {
        res.status(400).json({ error: 'El correo ya está registrado o faltan datos' });
    }
});

// B. RUTA: LOGIN DE USUARIOS
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await User.findOne({ email });
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const passwordValido = await bcrypt.compare(password, usuario.password);
        if (!passwordValido) return res.status(401).json({ error: 'Contraseña incorrecta' });

        // Crear token de sesión seguro
        const token = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            usuario: {
                nombre: usuario.nombre,
                email: usuario.email,
                esAdministrador: ADMIN_EMAILS.has(usuario.email.toLowerCase())
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// C. RUTA: AGENDAR UNA CITA
app.post('/api/citas/agendar', async (req, res) => {
    try {
        const { clienteNombre, barbero, servicio, fecha, hora } = req.body;
        const nuevaCita = new Cita({ clienteNombre, barbero, servicio, fecha, hora });
        await nuevaCita.save();
        const notificacionCalendar = await sendCalendarInvitation(nuevaCita);
        res.status(201).json({ mensaje: '¡Cita agendada con éxito!', cita: nuevaCita, notificacionCalendar });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Ese horario ya está ocupado por otro cliente con ese barbero' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: 'Los datos de la cita no son válidos' });
        }
        console.error('Error al guardar la cita:', error.name, error.code || 'sin código');
        res.status(500).json({ error: 'No se pudo guardar la cita' });
    }
});

// D. RUTA: CONSULTAR HORAS OCUPADAS sin exponer los datos de los clientes
app.get('/api/citas/disponibilidad', async (req, res) => {
    const { fecha, barbero } = req.query;
    if (typeof fecha !== 'string' || typeof barbero !== 'string') {
        return res.status(400).json({ error: 'Indica una fecha y un barbero válidos' });
    }

    try {
        const citas = await Cita.find({ fecha, barbero }).select('hora -_id').lean();
        res.json({ horariosOcupados: citas.map((cita) => cita.hora) });
    } catch (error) {
        console.error('Error al consultar disponibilidad:', error.name, error.code || 'sin código');
        res.status(500).json({ error: 'Error al consultar la disponibilidad' });
    }
});

// E. RUTAS: CONSULTA Y ACTUALIZACIÓN ADMINISTRATIVA DE CITAS
app.get('/api/citas', requireAdmin, async (req, res) => {
    try {
        const citas = await Cita.find().sort({ fecha: 1, hora: 1 }).lean();
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener las citas:', error.name, error.code || 'sin código');
        res.status(500).json({ error: 'Error al obtener las citas' });
    }
});

app.patch('/api/citas/:id/estado', requireAdmin, async (req, res) => {
    const { estado } = req.body;
    if (!mongoose.isValidObjectId(req.params.id) || !['reservada', 'realizada'].includes(estado)) {
        return res.status(400).json({ error: 'La cita o el estado indicados no son válidos' });
    }

    try {
        const cita = await Cita.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true, runValidators: true }
        ).lean();
        if (!cita) return res.status(404).json({ error: 'No se encontró la cita' });
        res.json(cita);
    } catch (error) {
        console.error('Error al actualizar el estado de la cita:', error.name, error.code || 'sin código');
        res.status(500).json({ error: 'No se pudo actualizar la cita' });
    }
});


// 4. PUERTO DINÁMICO PARA RENDER
const PORT = process.env.PORT || 3000;
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('🚀 ¡Conexión exitosa a MongoDB Atlas!');
        app.listen(PORT, () => {
            console.log(`🌍 Servidor escuchando en el puerto ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ No se puede iniciar la API sin MongoDB:', error.message);
        process.exit(1);
    });
