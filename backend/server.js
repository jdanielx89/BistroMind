import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();

// CORRECCIÓN DE CORS: Esto permite que Vercel y tu celular se conecten sin errores
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// CONFIGURACIÓN DE SUPABASE
const supabaseUrl = process.env.SUPABASE_URL || 'https://lyofalqibzkqjrvlliwd.supabase.co'; 
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5b2ZhbHFpYnprcWpydmxsaXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNzU5ODgsImV4cCI6MjA4Mzg1MTk4OH0.AfZhiwDVr7bJM-dm1DOUnGFfOarCLAAxyRZk9LYGPqg'; 
const supabase = createClient(supabaseUrl, supabaseKey);

// --- RUTAS DE RESERVAS ---

app.get('/api/reservas', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reservas', async (req, res) => {
  try {
    const { nombre_cliente, num_personas, fecha, hora, notas, creado_por, telefono, mesa } = req.body;
    const { data: reserva, error: resErr } = await supabase
      .from('reservas')
      .insert([{ nombre_cliente, num_personas, fecha, hora, notas, creado_por, telefono, mesa, estado: 'Pendiente' }])
      .select();

    if (resErr) throw resErr;

    if (telefono) {
      const telLimpio = telefono.toString().replace(/\D/g, ''); 
      const { data: clientesExistentes } = await supabase.from('clientes').select('*').eq('telefono', telLimpio);

      if (clientesExistentes && clientesExistentes.length > 0) {
        const existente = clientesExistentes[0];
        await supabase.from('clientes').update({ 
          total_visitas: (existente.total_visitas || 0) + 1,
          notas_frecuentes: notas || existente.notas_frecuentes
        }).eq('id', existente.id);
      } else {
        await supabase.from('clientes').insert([{ 
          nombre: nombre_cliente, telefono: telLimpio, total_visitas: 1, notas_frecuentes: notas 
        }]);
      }
    }
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reservas/:id', async (req, res) => {
  try {
    const { nombre_cliente, num_personas, fecha, hora, notas, creado_por, telefono, mesa, estado } = req.body;
    const { data, error } = await supabase
      .from('reservas')
      .update({ nombre_cliente, num_personas, fecha, hora, notas, creado_por, telefono, mesa, estado })
      .eq('id', req.params.id).select();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/reservas/:id', async (req, res) => {
  try {
    const { estado } = req.body;
    const { error } = await supabase.from('reservas').update({ estado }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ mensaje: 'Estado actualizado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/reservas/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('reservas').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ mensaje: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CLIENTES Y ESTADÍSTICAS ---

app.get('/api/clientes', async (req, res) => {
  try {
    const { data, error } = await supabase.from('clientes').select('*').order('total_visitas', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NUEVA RUTA: Obtener historial detallado de un cliente por su teléfono
app.get('/api/clientes/:telefono/historial', async (req, res) => {
  try {
    const { telefono } = req.params;
    // Aplicamos la misma lógica de limpieza que usas al crear reservas
    const telBusqueda = telefono.toString().replace(/\D/g, ''); 

    const { data, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('telefono', telBusqueda)
      .order('fecha', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const { data, error } = await supabase.from('reservas').select('fecha, num_personas, estado, mesa, hora');
    if (error) throw error;

    const mapaHoras = data.reduce((acc, r) => {
      if (r.hora) {
        const bloqueHora = r.hora.split(':')[0] + ':00';
        acc[bloqueHora] = (acc[bloqueHora] || 0) + 1;
      }
      return acc;
    }, {});

    res.json({
      totalReservas: data.length,
      totalPax: data.reduce((acc, r) => acc + Number(r.num_personas || 0), 0),
      exito: data.filter(r => r.estado === 'Llego').length,
      canceladas: data.filter(r => r.estado === 'Cancelo' || r.estado === 'No llego').length,
      mesasTop: data.reduce((acc, r) => {
        if (r.mesa) acc[r.mesa] = (acc[r.mesa] || 0) + 1;
        return acc;
      }, {}),
      mapaHoras
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🧠 BISTROMIND ENGINE ONLINE EN PUERTO ${PORT}`);
});