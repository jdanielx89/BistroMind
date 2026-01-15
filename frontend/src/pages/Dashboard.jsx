import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Clock, Edit3, Trash2, Phone, Menu, X as CloseIcon } from 'lucide-react';

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
    } catch (error) { alert("Error al conectar"); }
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
    if (!usuarioActivo?.puedeEliminar) return alert("Sin permisos");
    if (window.confirm("¿Eliminar?")) {
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
    <div className="p-4 md:p-10 text-white animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      
      {/* HEADER RESPONSIVE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-[#00b4d8]">BistroMind</h2>
          <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} className="w-full sm:w-auto bg-[#1b262f] p-3 rounded-xl text-[#00b4d8] font-black border border-white/5 outline-none shadow-lg" />
        </div>
        <button onClick={() => setMostrarModal(true)} className="w-full md:w-auto bg-[#00b4d8] px-8 py-4 rounded-2xl font-black shadow-lg uppercase text-sm text-black hover:scale-105 transition-all">
          + Nueva Reserva
        </button>
      </div>

      {/* BUSCADOR Y FILTROS RESPONSIVE */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-center justify-between">
        <div className="relative w-full lg:w-1/2">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input type="text" placeholder="BUSCAR CLIENTE..." className="w-full bg-[#1b262f] border border-white/5 p-4 pl-14 rounded-2xl outline-none font-bold" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        
        <div className="flex bg-[#1b262f] p-1.5 rounded-2xl border border-white/5 w-full lg:w-auto overflow-x-auto no-scrollbar">
          {['Pendiente', 'Llego', 'No llego', 'Cancelo'].map(est => (
            <button key={est} onClick={() => setFiltroEstado(est)} className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all whitespace-nowrap ${filtroEstado === est ? 'bg-[#00b4d8] text-black' : 'text-gray-500'}`}>
              {est === 'Llego' ? 'En Mesa' : est}
            </button>
          ))}
        </div>
      </div>

      {/* TABLA DESKTOP / VISTA TARJETAS MÓVIL */}
      <div className="bg-[#1b262f] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
        
        {/* Vista para Tablet/PC */}
        <div className="hidden md:block">
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
                    <div className="text-[#00b4d8] text-[11px] font-black uppercase tracking-tighter flex items-center gap-2"><Phone size={12} /> {res.telefono}</div>
                    {res.notas && <div className="mt-3 text-[11px] text-gray-400 italic bg-black/20 p-3 rounded-xl border-l-2 border-[#00b4d8]">"{res.notas}"</div>}
                  </td>
                  <td className="p-8 text-center">
                    <div className="bg-[#00b4d8]/10 text-[#00b4d8] px-6 py-3 rounded-2xl inline-block font-black border border-[#00b4d8]/20 text-lg uppercase italic">{res.mesa || 'S/A'}</div>
                  </td>
                  <td className="p-8">
                    <div className="font-black text-3xl">{res.num_personas} <span className="text-xs text-gray-500 font-black uppercase">Pax</span></div>
                    <div className="font-bold text-[#00b4d8] flex items-center gap-1 uppercase tracking-widest text-xs mt-1"><Clock size={14} /> {res.hora}</div>
                  </td>
                  <td className="p-8">
                    <div className="flex justify-center gap-3">
                      <select value={res.estado} onChange={(e) => cambiarEstado(res.id, e.target.value)} className="p-3 rounded-xl text-[10px] font-black uppercase bg-black/40 border border-white/10 outline-none">
                        <option value="Pendiente">Pendiente</option>
                        <option value="Llego">En Mesa</option>
                        <option value="No llego">No llego</option>
                        <option value="Cancelo">Cancelo</option>
                      </select>
                      <a href={`https://wa.me/${res.telefono}`} target="_blank" rel="noreferrer" className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500"><MessageSquare size={18}/></a>
                      <button onClick={() => abrirEditar(res)} className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500"><Edit3 size={18}/></button>
                      <button onClick={() => eliminarReserva(res.id)} className={`p-3 rounded-xl ${usuarioActivo?.puedeEliminar ? 'bg-red-500/10 text-red-500 hover:bg-red-500' : 'opacity-10 cursor-not-allowed'}`}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vista para Móvil (Tarjetas) */}
        <div className="md:hidden divide-y divide-white/5">
          {filtradas.length > 0 ? filtradas.map(res => (
            <div key={res.id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-black text-xl uppercase italic leading-none mb-1">{res.nombre_cliente}</div>
                  <div className="text-[#00b4d8] text-[10px] font-black uppercase"><Phone size={10} className="inline mr-1" />{res.telefono}</div>
                </div>
                <div className="bg-[#00b4d8]/10 text-[#00b4d8] px-4 py-2 rounded-xl font-black text-xs uppercase border border-[#00b4d8]/20">
                  {res.mesa || 'S/A'}
                </div>
              </div>
              
              <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl">
                <div>
                  <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Comensales</div>
                  <div className="font-black text-lg">{res.num_personas} Pax</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Hora</div>
                  <div className="font-black text-lg text-[#00b4d8]">{res.hora}</div>
                </div>
              </div>

              {res.notas && <div className="text-[11px] text-gray-400 italic bg-black/20 p-3 rounded-xl border-l-2 border-[#00b4d8]">"{res.notas}"</div>}

              <div className="flex flex-wrap gap-2 pt-2">
                <select value={res.estado} onChange={(e) => cambiarEstado(res.id, e.target.value)} className="flex-1 p-3 rounded-xl text-[10px] font-black uppercase bg-black/40 border border-white/10 outline-none">
                  <option value="Pendiente">Pendiente</option>
                  <option value="Llego">En Mesa</option>
                  <option value="No llego">No llego</option>
                  <option value="Cancelo">Cancelo</option>
                </select>
                <div className="flex gap-2 w-full sm:w-auto">
                  <a href={`https://wa.me/${res.telefono}`} className="flex-1 sm:flex-none p-3 bg-green-500/10 text-green-500 rounded-xl flex justify-center"><MessageSquare size={18}/></a>
                  <button onClick={() => abrirEditar(res)} className="flex-1 sm:flex-none p-3 bg-blue-500/10 text-blue-500 rounded-xl flex justify-center"><Edit3 size={18}/></button>
                  <button onClick={() => eliminarReserva(res.id)} className="flex-1 sm:flex-none p-3 bg-red-500/10 text-red-500 rounded-xl flex justify-center"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-10 text-center text-gray-600 font-black uppercase text-xs italic tracking-widest">No hay reservas para este día</div>
          )}
        </div>
      </div>

      {/* MODAL RESPONSIVE */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#1b262f] w-full max-w-lg rounded-[2.5rem] p-6 md:p-10 border border-white/10 my-auto shadow-2xl">
            <h2 className="text-xl md:text-2xl font-black mb-6 text-center text-[#00b4d8] uppercase italic">{editandoId ? 'Editar' : 'Nueva'} Reserva</h2>
            <form onSubmit={manejarGuardar} className="space-y-4">
              <input required placeholder="CLIENTE" className="w-full bg-[#0a0f14] p-4 md:p-5 rounded-2xl border border-white/5 outline-none font-bold uppercase text-sm" value={nuevaReserva.nombre_cliente} onChange={e => setNuevaReserva({...nuevaReserva, nombre_cliente: e.target.value})} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="number" placeholder="PAX" className="bg-[#0a0f14] p-4 md:p-5 rounded-2xl border border-white/5 font-bold text-sm" value={nuevaReserva.num_personas} onChange={e => setNuevaReserva({...nuevaReserva, num_personas: e.target.value})} />
                <input placeholder="TELÉFONO" className="bg-[#0a0f14] p-4 md:p-5 rounded-2xl border border-white/5 font-bold text-sm" value={nuevaReserva.telefono} onChange={e => setNuevaReserva({...nuevaReserva, telefono: e.target.value})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required type="date" className="bg-[#0a0f14] p-4 md:p-5 rounded-2xl border border-white/5 text-white text-sm" value={nuevaReserva.fecha} onChange={e => setNuevaReserva({...nuevaReserva, fecha: e.target.value})} />
                <select required className="bg-[#0a0f14] p-4 md:p-5 rounded-2xl border border-white/5 text-[#00b4d8] font-black text-sm" value={nuevaReserva.hora} onChange={e => setNuevaReserva({...nuevaReserva, hora: e.target.value})}>
                  {intervalosHora.map(h => <option key={h} value={h}>{h} HS</option>)}
                </select>
              </div>
              <select required className="w-full bg-[#0a0f14] p-4 md:p-5 rounded-2xl border border-white/5 text-white font-bold text-sm" value={nuevaReserva.mesa} onChange={e => setNuevaReserva({...nuevaReserva, mesa: e.target.value})}>
                <option value="">SELECCIONAR MESA...</option>
                {listaMesas.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <textarea placeholder="NOTAS..." className="w-full bg-[#0a0f14] p-4 md:p-5 rounded-2xl border border-white/5 outline-none font-bold h-20 text-sm" value={nuevaReserva.notas} onChange={e => setNuevaReserva({...nuevaReserva, notes: e.target.value})} />
              <button type="submit" className="w-full bg-[#00b4d8] p-5 rounded-[1.5rem] font-black uppercase text-black hover:scale-105 transition-all italic shadow-xl">Guardar</button>
              <button type="button" onClick={cerrarModal} className="w-full text-gray-500 uppercase font-black text-[10px] mt-2">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;