import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Clock, Edit3, Trash2, Phone, Users } from 'lucide-react';

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

  const eliminarReserva = async (id) => {
    if (!usuarioActivo?.puedeEliminar) return alert("Sin permisos");
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
    <div className="p-3 md:p-10 text-white animate-in fade-in duration-500 max-w-[1600px] mx-auto overflow-x-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-[#00b4d8]">BistroMind</h2>
          <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} className="bg-[#1b262f] p-2 rounded-xl text-[#00b4d8] font-black border border-white/5 text-sm outline-none" />
        </div>
        <button onClick={() => setMostrarModal(true)} className="w-full md:w-auto bg-[#00b4d8] py-4 md:px-8 rounded-2xl font-black uppercase text-xs text-black shadow-lg">
          + Nueva Reserva
        </button>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input type="text" placeholder="BUSCAR..." className="w-full bg-[#1b262f] border border-white/5 p-4 pl-12 rounded-2xl outline-none font-bold text-sm" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
        
        <div className="flex bg-[#1b262f] p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar whitespace-nowrap">
          {['Pendiente', 'Llego', 'No llego', 'Cancelo'].map(est => (
            <button key={est} onClick={() => setFiltroEstado(est)} className={`flex-1 px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${filtroEstado === est ? 'bg-[#00b4d8] text-black' : 'text-gray-500'}`}>
              {est === 'Llego' ? 'En Mesa' : est}
            </button>
          ))}
        </div>
      </div>

      {/* VISTA DE TARJETAS (MOVIL Y PC) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtradas.length > 0 ? filtradas.map(res => (
          <div key={res.id} className="bg-[#1b262f] p-5 rounded-[2rem] border border-white/5 shadow-xl hover:border-[#00b4d8]/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="max-w-[70%]">
                <div className="font-black text-xl uppercase italic leading-none truncate">{res.nombre_cliente}</div>
                <div className="text-[#00b4d8] text-[10px] font-bold mt-1 tracking-tighter flex items-center gap-1"><Phone size={10}/> {res.telefono}</div>
              </div>
              <div className="bg-[#00b4d8]/10 text-[#00b4d8] px-3 py-1.5 rounded-xl font-black text-[10px] border border-[#00b4d8]/20 italic">
                {res.mesa || 'S/A'}
              </div>
            </div>

            <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl mb-4">
              <div className="flex-1 flex flex-col">
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Personas</span>
                <span className="font-black text-lg">{res.num_personas} Pax</span>
              </div>
              <div className="w-px h-8 bg-white/5"></div>
              <div className="flex-1 flex flex-col">
                <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Hora</span>
                <span className="font-black text-lg text-[#00b4d8]">{res.hora}</span>
              </div>
            </div>

            {res.notas && <div className="text-[10px] text-gray-400 italic mb-4 line-clamp-2 bg-white/5 p-2 rounded-lg">"{res.notas}"</div>}

            <div className="flex gap-2">
              <select value={res.estado} onChange={(e) => cambiarEstado(res.id, e.target.value)} className="flex-1 bg-black/40 p-3 rounded-xl text-[9px] font-black uppercase border border-white/10 outline-none text-[#00b4d8]">
                <option value="Pendiente">Pendiente</option>
                <option value="Llego">En Mesa</option>
                <option value="No llego">No llego</option>
                <option value="Cancelo">Cancelo</option>
              </select>
              <div className="flex gap-1">
                <a href={`https://wa.me/${res.telefono}`} target="_blank" rel="noreferrer" className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all"><MessageSquare size={16}/></a>
                <button onClick={() => abrirEditar(res)} className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Edit3 size={16}/></button>
                {usuarioActivo?.puedeEliminar && (
                  <button onClick={() => eliminarReserva(res.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center text-gray-700 font-black uppercase text-xs italic">Sin registros para mostrar</div>
        )}
      </div>

      {/* MODAL */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-[#1b262f] w-full max-w-lg rounded-[2.5rem] p-6 border border-white/10 my-auto shadow-2xl">
            <h2 className="text-xl font-black mb-6 text-center text-[#00b4d8] uppercase italic">{editandoId ? 'Editar' : 'Nueva'} Reserva</h2>
            <form onSubmit={manejarGuardar} className="space-y-4">
              <input required placeholder="CLIENTE" className="w-full bg-[#0a0f14] p-4 rounded-2xl border border-white/5 outline-none font-bold uppercase text-xs" value={nuevaReserva.nombre_cliente} onChange={e => setNuevaReserva({...nuevaReserva, nombre_cliente: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="PAX" className="bg-[#0a0f14] p-4 rounded-2xl border border-white/5 font-bold text-xs outline-none" value={nuevaReserva.num_personas} onChange={e => setNuevaReserva({...nuevaReserva, num_personas: e.target.value})} />
                <input placeholder="TELÉFONO" className="bg-[#0a0f14] p-4 rounded-2xl border border-white/5 font-bold text-xs outline-none" value={nuevaReserva.telefono} onChange={e => setNuevaReserva({...nuevaReserva, telefono: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required type="date" className="bg-[#0a0f14] p-4 rounded-2xl border border-white/5 text-white text-xs outline-none" value={nuevaReserva.fecha} onChange={e => setNuevaReserva({...nuevaReserva, fecha: e.target.value})} />
                <select required className="bg-[#0a0f14] p-4 rounded-2xl border border-white/5 text-[#00b4d8] font-black text-xs outline-none" value={nuevaReserva.hora} onChange={e => setNuevaReserva({...nuevaReserva, hora: e.target.value})}>
                  {intervalosHora.map(h => <option key={h} value={h}>{h} HS</option>)}
                </select>
              </div>
              <select required className="w-full bg-[#0a0f14] p-4 rounded-2xl border border-white/5 text-white font-bold text-xs outline-none" value={nuevaReserva.mesa} onChange={e => setNuevaReserva({...nuevaReserva, mesa: e.target.value})}>
                <option value="">SELECCIONAR MESA...</option>
                {listaMesas.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <textarea placeholder="NOTAS..." className="w-full bg-[#0a0f14] p-4 rounded-2xl border border-white/5 outline-none font-bold h-20 text-xs" value={nuevaReserva.notas} onChange={e => setNuevaReserva({...nuevaReserva, notas: e.target.value})} />
              <button type="submit" className="w-full bg-[#00b4d8] p-5 rounded-2xl font-black uppercase text-black hover:scale-105 transition-all italic shadow-xl">Guardar Reserva</button>
              <button type="button" onClick={cerrarModal} className="w-full text-gray-500 uppercase font-black text-[9px] mt-2">Cerrar Ventana</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;