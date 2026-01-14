import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  // --- ESTADOS ---
  const [reservas, setReservas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('Pendiente');
  const hoyStr = new Date().toISOString().split('T')[0];
  const [fechaFiltro, setFechaFiltro] = useState(hoyStr);

  // Recuperamos el usuario de BistroMind para los permisos
  const usuarioActivo = JSON.parse(localStorage.getItem('user_bistro'));

  const [nuevaReserva, setNuevaReserva] = useState({
    nombre_cliente: '', num_personas: '', fecha: hoyStr, hora: '12:00', 
    notas: '', creado_por: usuarioActivo?.nombre || '', telefono: '', mesa: '', estado: 'Pendiente'
  });

  const listaMesas = [...Array.from({ length: 18 }, (_, i) => `Mesa ${i + 1}`), "Achiote 1", "Achiote 2", "Galería", "Guacamaya"];

  // --- EFECTOS Y DATOS ---
  useEffect(() => { obtenerDatos(); }, []);

  const obtenerDatos = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reservas');
      const data = await res.json();
      setReservas(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Error:", e); }
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    const url = editandoId ? `http://localhost:5000/api/reservas/${editandoId}` : 'http://localhost:5000/api/reservas';
    try {
      const response = await fetch(url, {
        method: editandoId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaReserva)
      });
      if (response.ok) { cerrarModal(); obtenerDatos(); }
    } catch (error) { alert("Error de conexión"); }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reservas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) { setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r)); }
    } catch (e) { console.error(e); }
  };

  const eliminarReserva = async (id) => {
    if (!usuarioActivo?.puedeEliminar) return alert("Acceso denegado: Tu perfil no permite eliminar.");
    if (window.confirm("¿Eliminar reserva?")) {
      await fetch(`http://localhost:5000/api/reservas/${id}`, { method: 'DELETE' });
      obtenerDatos();
    }
  };

  const abrirEditar = (res) => { setEditandoId(res.id); setNuevaReserva({ ...res }); setMostrarModal(true); };
  const cerrarModal = () => { setMostrarModal(false); setEditandoId(null); setNuevaReserva({ nombre_cliente: '', num_personas: '', fecha: hoyStr, hora: '12:00', notas: '', creado_por: usuarioActivo?.nombre || '', telefono: '', mesa: '', estado: 'Pendiente' }); };

  // --- FILTRADO ---
  const filtradas = reservas.filter(r => 
    r.fecha === fechaFiltro && 
    r.estado === filtroEstado && 
    r.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-10 text-white animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase">BistroMind</h2>
          <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} className="bg-[#1b262f] p-2 rounded-xl text-[#00b4d8] font-black border border-white/5 outline-none" />
        </div>
        <button onClick={() => setMostrarModal(true)} className="bg-[#00b4d8] px-8 py-4 rounded-2xl font-black shadow-lg uppercase text-sm hover:scale-105 transition-all">+ Nueva Reserva</button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input type="text" placeholder="🔍 Buscar cliente..." className="flex-1 bg-[#1b262f] border border-white/5 p-4 rounded-2xl outline-none" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        <div className="flex bg-[#1b262f] p-1.5 rounded-2xl border border-white/5">
          {['Pendiente', 'Llego', 'No llego', 'Cancelo'].map(est => (
            <button key={est} onClick={() => setFiltroEstado(est)} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filtroEstado === est ? 'bg-[#00b4d8] text-black' : 'text-gray-500'}`}>{est === 'Llego' ? 'En Mesa' : est}</button>
          ))}
        </div>
      </div>

      <div className="bg-[#1b262f] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5 text-[10px] text-gray-500 font-black uppercase tracking-widest">
              <th className="p-6">Cliente</th><th className="p-6 text-center">Mesa</th><th className="p-6">Pax / Hora</th><th className="p-6">Estado</th><th className="p-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map(res => (
              <tr key={res.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-6">
                  <div className="font-black text-xl mb-1">{res.nombre_cliente}</div>
                  <div className="text-[12px] text-[#00b4d8] font-bold">📞 {res.telefono || 'Sin número'}</div>
                  <div className="text-[9px] text-gray-500 font-black uppercase mt-2">POR: {res.creado_por}</div>
                </td>
                <td className="p-6 text-center"><div className="bg-[#00b4d8]/10 text-[#00b4d8] px-4 py-3 rounded-2xl inline-block font-black">{res.mesa || 'S/A'}</div></td>
                <td className="p-6"><div className="font-black text-2xl text-gray-400">{res.num_personas} Pax</div><div className="font-bold text-[#00b4d8]">{res.hora}</div></td>
                <td className="p-6">
                  <select value={res.estado} onChange={(e) => cambiarEstado(res.id, e.target.value)} className="p-3 rounded-xl text-[10px] font-black uppercase bg-black/40 border border-white/10 outline-none">
                    <option value="Pendiente">Pendiente</option><option value="Llego">Llego</option><option value="No llego">No llego</option><option value="Cancelo">Cancelo</option>
                  </select>
                </td>
                <td className="p-6">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => abrirEditar(res)} className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">✏️</button>
                    <button onClick={() => eliminarReserva(res.id)} className={`p-3 rounded-xl transition-all ${usuarioActivo?.puedeEliminar ? 'bg-red-500/10 text-red-500' : 'opacity-10 grayscale cursor-not-allowed'}`}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL SIMPLIFICADO */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#1b262f] w-full max-w-lg rounded-[3rem] p-10 border border-white/10">
            <h2 className="text-2xl font-black mb-8 text-center text-[#00b4d8] uppercase italic">{editandoId ? 'Editar' : 'Nueva'} Reserva</h2>
            <form onSubmit={manejarGuardar} className="space-y-4">
              <input required placeholder="Cliente" className="w-full bg-[#0a0f14] p-5 rounded-2xl border border-white/5 outline-none" value={nuevaReserva.nombre_cliente} onChange={e => setNuevaReserva({...nuevaReserva, nombre_cliente: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Pax" className="bg-[#0a0f14] p-5 rounded-2xl border border-white/5" value={nuevaReserva.num_personas} onChange={e => setNuevaReserva({...nuevaReserva, num_personas: e.target.value})} />
                <input placeholder="Teléfono" className="bg-[#0a0f14] p-5 rounded-2xl border border-white/5" value={nuevaReserva.telefono} onChange={e => setNuevaReserva({...nuevaReserva, telefono: e.target.value})} />
              </div>
              <select required className="w-full bg-[#0a0f14] p-5 rounded-2xl border border-white/5 text-[#00b4d8] font-bold" value={nuevaReserva.mesa} onChange={e => setNuevaReserva({...nuevaReserva, mesa: e.target.value})}>
                <option value="">Mesa...</option>{listaMesas.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input required type="date" className="bg-[#0a0f14] p-5 rounded-2xl border border-white/5" value={nuevaReserva.fecha} onChange={e => setNuevaReserva({...nuevaReserva, fecha: e.target.value})} />
                <input required type="time" className="bg-[#0a0f14] p-5 rounded-2xl border border-white/5" value={nuevaReserva.hora} onChange={e => setNuevaReserva({...nuevaReserva, hora: e.target.value})} />
              </div>
              <button type="submit" className="w-full bg-[#00b4d8] p-5 rounded-2xl font-black uppercase text-white">{editandoId ? 'Guardar' : 'Confirmar'}</button>
              <button type="button" onClick={cerrarModal} className="w-full text-gray-500 uppercase font-black text-[10px]">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;