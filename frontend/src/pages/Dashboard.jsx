import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Clock, Edit3, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const [reservas, setReservas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('Pendiente');
  const hoyStr = new Date().toISOString().split('T')[0];
  const [fechaFiltro, setFechaFiltro] = useState(hoyStr);

  const API_URL = "https://bistromind.onrender.com/api/reservas";
  const usuarioActivo = JSON.parse(localStorage.getItem('user_bistro'));

  const [nuevaReserva, setNuevaReserva] = useState({
    nombre_cliente: '', num_personas: '', fecha: hoyStr, hora: '12:00', 
    notas: '', creado_por: usuarioActivo?.nombre || '', telefono: '', mesa: '', estado: 'Pendiente'
  });

  const listaMesas = [...Array.from({ length: 18 }, (_, i) => `Mesa ${i + 1}`), "Achiote 1", "Achiote 2", "Galería", "Guacamaya"];
  
  // Intervalos de 30 minutos para el selector
  const intervalosHora = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

  useEffect(() => { obtenerDatos(); }, []);

  const obtenerDatos = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setReservas(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Error:", e); }
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    const url = editandoId ? `${API_URL}/${editandoId}` : API_URL;
    try {
      const response = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaReserva)
      });
      if (response.ok) { cerrarModal(); obtenerDatos(); }
    } catch (error) { alert("Error al conectar con Render"); }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
    } catch (e) { console.error(e); }
  };

  const eliminarReserva = async (id) => {
    if (!usuarioActivo?.puedeEliminar) return alert("No tienes permisos.");
    if (window.confirm("¿Eliminar reserva?")) {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      obtenerDatos();
    }
  };

  const abrirEditar = (res) => { setEditandoId(res.id); setNuevaReserva({ ...res }); setMostrarModal(true); };
  const cerrarModal = () => { setMostrarModal(false); setEditandoId(null); setNuevaReserva({ nombre_cliente: '', num_personas: '', fecha: hoyStr, hora: '12:00', notas: '', creado_por: usuarioActivo?.nombre || '', telefono: '', mesa: '', estado: 'Pendiente' }); };

  const filtradas = reservas.filter(r => 
    r.fecha === fechaFiltro && 
    r.estado === filtroEstado && 
    (r.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()) || r.telefono?.includes(busqueda))
  );

  return (
    <div className="p-10 text-white animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <h2 className="text-5xl font-black italic tracking-tighter uppercase text-[#00b4d8]">BistroMind</h2>
          <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} className="bg-[#1b262f] p-3 rounded-xl text-[#00b4d8] font-black border border-white/5 outline-none shadow-lg" />
        </div>
        <button onClick={() => setMostrarModal(true)} className="bg-[#00b4d8] px-8 py-4 rounded-2xl font-black shadow-lg uppercase text-sm hover:scale-105 transition-all text-black">+ Nueva Reserva</button>
      </div>

      {/* FILTROS Y BUSCADOR (POSICIÓN SOLICITADA) */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input type="text" placeholder="Buscar por nombre o teléfono..." className="w-full bg-[#1b262f] border border-white/5 p-4 pl-14 rounded-2xl outline-none font-bold" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        
        <div className="flex bg-[#1b262f] p-1.5 rounded-[1.5rem] border border-white/5">
          {['Pendiente', 'Llego', 'No llego', 'Cancelo'].map(est => (
            <button key={est} onClick={() => setFiltroEstado(est)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filtroEstado === est ? 'bg-[#00b4d8] text-black' : 'text-gray-500'}`}>
              {est === 'Llego' ? 'En Mesa' : est}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#1b262f] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-[10px] text-gray-500 font-black uppercase tracking-widest">
              <th className="p-8">Detalle del Cliente</th>
              <th className="p-8 text-center">Mesa</th>
              <th className="p-8">Pax / Hora</th>
              <th className="p-8 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtradas.map(res => (
              <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-8">
                  <div className="font-black text-2xl uppercase italic leading-none mb-2">{res.nombre_cliente}</div>
                  <div className="flex items-center gap-3">
                    <a href={`https://wa.me/${res.telefono}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#00b4d8] bg-[#00b4d8]/10 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-tighter">
                      <MessageSquare size={14} /> {res.telefono || 'Sin número'}
                    </a>
                  </div>
                  {res.notas && <div className="mt-3 text-[11px] text-gray-400 italic bg-black/20 p-3 rounded-xl border-l-2 border-[#00b4d8]">"{res.notas}"</div>}
                  <div className="text-[9px] text-gray-600 font-black uppercase mt-3 tracking-widest">Registrado por: {res.creado_por || 'Admin'}</div>
                </td>
                <td className="p-8 text-center">
                  <div className="bg-[#00b4d8]/10 text-[#00b4d8] px-6 py-3 rounded-2xl inline-block font-black border border-[#00b4d8]/20 text-lg uppercase italic">{res.mesa || 'S/A'}</div>
                </td>
                <td className="p-8">
                  <div className="font-black text-3xl">{res.num_personas} <span className="text-xs text-gray-500 font-black uppercase tracking-tighter">Pax</span></div>
                  <div className="font-bold text-[#00b4d8] flex items-center gap-1 uppercase tracking-widest text-xs mt-1"><Clock size={14} /> {res.hora}</div>
                </td>
                <td className="p-8">
                  <div className="flex justify-center gap-3 items-center">
                    <select value={res.estado} onChange={(e) => cambiarEstado(res.id, e.target.value)} className="p-3 rounded-xl text-[10px] font-black uppercase bg-black/40 border border-white/10 outline-none focus:border-[#00b4d8]">
                      <option value="Pendiente">Pendiente</option>
                      <option value="Llego">En Mesa</option>
                      <option value="No llego">No llego</option>
                      <option value="Cancelo">Cancelo</option>
                    </select>
                    <button onClick={() => abrirEditar(res)} className="p-3 bg-white/5 rounded-xl text-blue-400 hover:bg-[#00b4d8] hover:text-black transition-all"><Edit3 size={18}/></button>
                    <button onClick={() => eliminarReserva(res.id)} className={`p-3 rounded-xl transition-all ${usuarioActivo?.puedeEliminar ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'opacity-10 cursor-not-allowed'}`}><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CORREGIDO: NOTAS Y SELECT DE HORA */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1b262f] w-full max-w-lg rounded-[3rem] p-10 border border-white/10 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#00b4d8]"></div>
            <h2 className="text-2xl font-black mb-8 text-center text-[#00b4d8] uppercase italic">{editandoId ? 'Editar' : 'Nueva'} Reserva</h2>
            <form onSubmit={manejarGuardar} className="space-y-4">
              <input required placeholder="NOMBRE DEL CLIENTE" className="w-full bg-[#0a0f14] p-5 rounded-2xl border border-white/5 outline-none font-bold uppercase" value={nuevaReserva.nombre_cliente} onChange={e => setNuevaReserva({...nuevaReserva, nombre_cliente: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="COMENSALES" className="bg-[#0a0f14] p-5 rounded-2xl border border-white/5 font-bold" value={nuevaReserva.num_personas} onChange={e => setNuevaReserva({...nuevaReserva, num_personas: e.target.value})} />
                <input placeholder="TELÉFONO" className="bg-[#0a0f14] p-5 rounded-2xl border border-white/5 font-bold" value={nuevaReserva.telefono} onChange={e => setNuevaReserva({...nuevaReserva, telefono: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required type="date" className="bg-[#0a0f14] p-5 rounded-2xl border border-white/5 text-white" value={nuevaReserva.fecha} onChange={e => setNuevaReserva({...nuevaReserva, fecha: e.target.value})} />
                <select required className="bg-[#0a0f14] p-5 rounded-2xl border border-white/5 text-[#00b4d8] font-black" value={nuevaReserva.hora} onChange={e => setNuevaReserva({...nuevaReserva, hora: e.target.value})}>
                  {intervalosHora.map(h => <option key={h} value={h}>{h} HS</option>)}
                </select>
              </div>
              <select required className="w-full bg-[#0a0f14] p-5 rounded-2xl border border-white/5 text-white font-bold" value={nuevaReserva.mesa} onChange={e => setNuevaReserva({...nuevaReserva, mesa: e.target.value})}>
                <option value="">SELECCIONAR MESA...</option>
                {listaMesas.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <textarea placeholder="NOTAS (EJ: ALERGIAS, CUMPLEAÑOS, UBICACIÓN PREFERIDA...)" className="w-full bg-[#0a0f14] p-5 rounded-2xl border border-white/5 outline-none font-bold h-24" value={nuevaReserva.notas} onChange={e => setNuevaReserva({...nuevaReserva, notas: e.target.value})} />
              <button type="submit" className="w-full bg-[#00b4d8] p-6 rounded-[2rem] font-black uppercase text-black hover:scale-105 transition-all mt-4 italic shadow-xl">Guardar en Agenda</button>
              <button type="button" onClick={cerrarModal} className="w-full text-gray-500 uppercase font-black text-[10px] mt-4 tracking-widest">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;