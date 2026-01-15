import React, { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, XCircle, Clock, Trash2, Edit3, Search } from 'lucide-react';

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
    } catch (error) { alert("Error al guardar"); }
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

  const abrirEditar = (res) => { setEditandoId(res.id); setNuevaReserva({ ...res }); setMostrarModal(true); };
  const cerrarModal = () => { setMostrarModal(false); setEditandoId(null); setNuevaReserva({ nombre_cliente: '', num_personas: '', fecha: hoyStr, hora: '12:00', notas: '', creado_por: usuarioActivo?.nombre || '', telefono: '', mesa: '', estado: 'Pendiente' }); };

  const filtradas = reservas.filter(r => 
    r.fecha === fechaFiltro && 
    r.estado === filtroEstado && 
    r.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Estadísticas rápidas para el Dashboard
  const statsHoy = {
    total: reservas.filter(r => r.fecha === fechaFiltro).length,
    pax: reservas.filter(r => r.fecha === fechaFiltro).reduce((acc, r) => acc + Number(r.num_personas), 0),
    cancelados: reservas.filter(r => r.fecha === fechaFiltro && (r.estado === 'Cancelo' || r.estado === 'No llego')).length
  };

  return (
    <div className="p-6 md:p-10 text-white min-h-screen bg-[#0a0f14]">
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-5xl font-black italic tracking-tighter uppercase text-[#00b4d8] leading-none">Dashboard</h2>
          <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Gestión de Piso en Tiempo Real</p>
        </div>
        <div className="flex gap-3">
          <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} className="bg-[#1b262f] p-4 rounded-2xl text-[#00b4d8] font-black border border-white/5 outline-none shadow-xl" />
          <button onClick={() => setMostrarModal(true)} className="bg-[#00b4d8] text-black px-8 py-4 rounded-2xl font-black shadow-lg uppercase text-sm hover:scale-105 active:scale-95 transition-all">+ Nueva Reserva</button>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-[#1b262f] p-6 rounded-[2rem] border border-white/5 flex items-center gap-5">
          <div className="bg-[#00b4d8]/10 p-4 rounded-2xl text-[#00b4d8]"><Clock size={24} /></div>
          <div><p className="text-[10px] font-black uppercase text-gray-500 text-nowrap">Reservas Hoy</p><h4 className="text-2xl font-black">{statsHoy.total}</h4></div>
        </div>
        <div className="bg-[#1b262f] p-6 rounded-[2rem] border border-white/5 flex items-center gap-5">
          <div className="bg-green-500/10 p-4 rounded-2xl text-green-500"><Users size={24} /></div>
          <div><p className="text-[10px] font-black uppercase text-gray-500">Total Pax</p><h4 className="text-2xl font-black">{statsHoy.pax}</h4></div>
        </div>
        <div className="bg-[#1b262f] p-6 rounded-[2rem] border border-white/5 flex items-center gap-5">
          <div className="bg-red-500/10 p-4 rounded-2xl text-red-500"><XCircle size={24} /></div>
          <div><p className="text-[10px] font-black uppercase text-gray-500 text-nowrap">No Show / Canc</p><h4 className="text-2xl font-black">{statsHoy.cancelados}</h4></div>
        </div>
        <div className="relative group flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input type="text" placeholder="BUSCAR CLIENTE..." className="w-full h-full bg-[#1b262f] border border-white/5 p-6 pl-14 rounded-[2rem] outline-none font-bold focus:border-[#00b4d8]/50 transition-all" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
      </div>

      {/* FILTROS DE ESTADO TIPO APP */}
      <div className="flex bg-[#1b262f] p-2 rounded-[2rem] border border-white/5 mb-8 w-fit mx-auto md:mx-0">
        {['Pendiente', 'Llego', 'No llego', 'Cancelo'].map(est => (
          <button key={est} onClick={() => setFiltroEstado(est)} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${filtroEstado === est ? 'bg-[#00b4d8] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            {est === 'Llego' ? 'En Mesa' : est}
          </button>
        ))}
      </div>

      {/* TABLA DE DISEÑO LIMPIO */}
      <div className="bg-[#1b262f] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
              <th className="p-8 text-nowrap">Detalles Cliente</th>
              <th className="p-8 text-center">Asignación</th>
              <th className="p-8">Configuración</th>
              <th className="p-8 text-center">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtradas.map(res => (
              <tr key={res.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-8">
                  <div className="font-black text-2xl group-hover:text-[#00b4d8] transition-colors uppercase italic">{res.nombre_cliente}</div>
                  <div className="flex items-center gap-3 mt-1 text-gray-400 font-bold text-sm">
                    <span className="text-[#00b4d8] bg-[#00b4d8]/10 px-2 py-0.5 rounded text-[10px]">VIP</span>
                    {res.telefono || 'Sin teléfono'}
                  </div>
                </td>
                <td className="p-8 text-center">
                  <span className="bg-[#00b4d8] text-black px-6 py-3 rounded-2xl font-black text-sm shadow-inner italic">
                    {res.mesa || 'POR ASIGNAR'}
                  </span>
                </td>
                <td className="p-8">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black">{res.num_personas} <small className="text-xs uppercase text-gray-500 font-black">Pax</small></span>
                    <span className="text-[#00b4d8] font-black flex items-center gap-1"><Clock size={14}/> {res.hora} HS</span>
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex justify-center items-center gap-3">
                    <select value={res.estado} onChange={(e) => cambiarEstado(res.id, e.target.value)} className="bg-black/40 border border-white/10 p-3 rounded-xl text-[10px] font-black uppercase outline-none focus:border-[#00b4d8]">
                      <option value="Pendiente">Pendiente</option>
                      <option value="Llego">En Mesa</option>
                      <option value="No llego">No Llego</option>
                      <option value="Cancelo">Canceló</option>
                    </select>
                    <button onClick={() => abrirEditar(res)} className="p-3 bg-white/5 hover:bg-[#00b4d8] hover:text-black rounded-xl transition-all"><Edit3 size={18}/></button>
                    <button onClick={() => eliminarReserva(res.id)} className={`p-3 rounded-xl transition-all ${usuarioActivo?.puedeEliminar ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' : 'opacity-10 cursor-not-allowed'}`}><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtradas.length === 0 && (
          <div className="p-20 text-center text-gray-600 font-black uppercase tracking-widest italic">No hay reservas en este estado para hoy</div>
        )}
      </div>

      {/* MODAL REDISEÑADO */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#1b262f] w-full max-w-lg rounded-[3.5rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#00b4d8]"></div>
            <h2 className="text-3xl font-black mb-10 text-center text-[#00b4d8] uppercase italic tracking-tighter">Detalles de Reserva</h2>
            <form onSubmit={manejarGuardar} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-4">Nombre del Cliente</label>
                <input required className="w-full bg-[#0a0f14] p-5 rounded-2xl border border-white/5 outline-none focus:border-[#00b4d8]/50 font-bold" value={nuevaReserva.nombre_cliente} onChange={e => setNuevaReserva({...nuevaReserva, nombre_cliente: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-4">Comensales</label>
                  <input required type="number" className="w-full bg-[#0a0f14] p-5 rounded-2xl border border-white/5 font-bold" value={nuevaReserva.num_personas} onChange={e => setNuevaReserva({...nuevaReserva, num_personas: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-4">Teléfono</label>
                  <input className="w-full bg-[#0a0f14] p-5 rounded-2xl border border-white/5 font-bold" value={nuevaReserva.telefono} onChange={e => setNuevaReserva({...nuevaReserva, telefono: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-4">Asignar Ubicación</label>
                <select required className="w-full bg-[#0a0f14] p-5 rounded-2xl border border-white/5 text-[#00b4d8] font-black" value={nuevaReserva.mesa} onChange={e => setNuevaReserva({...nuevaReserva, mesa: e.target.value})}>
                  <option value="">Seleccionar Mesa...</option>
                  {listaMesas.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required type="date" className="bg-[#0a0f14] p-5 rounded-2xl border border-white/5 font-bold" value={nuevaReserva.fecha} onChange={e => setNuevaReserva({...nuevaReserva, fecha: e.target.value})} />
                <input required type="time" className="bg-[#0a0f14] p-5 rounded-2xl border border-white/5 font-bold" value={nuevaReserva.hora} onChange={e => setNuevaReserva({...nuevaReserva, hora: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-[#00b4d8] p-6 rounded-[2rem] font-black uppercase text-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl mt-4">
                {editandoId ? 'Actualizar Reserva' : 'Confirmar en Agenda'}
              </button>
              <button type="button" onClick={cerrarModal} className="w-full text-gray-600 uppercase font-black text-[10px] tracking-widest mt-4 hover:text-white transition-colors">Cerrar Ventana</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;