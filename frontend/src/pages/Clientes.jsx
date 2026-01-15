import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Calendar, Users, X, Star } from 'lucide-react';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const [cargando, setCargando] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const API_BASE = "https://bistromind.onrender.com/api/clientes";

  const obtenerClientes = async () => {
    setCargando(true);
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setCargando(false); }
  };

  useEffect(() => { obtenerClientes(); }, []);

  const abrirDetalle = async (cliente) => {
    setClienteSeleccionado(cliente);
    setCargandoHistorial(true);
    try {
      const res = await fetch(`${API_BASE}/${cliente.telefono}/historial`);
      const data = await res.json();
      setHistorial(Array.isArray(data) ? data : []);
    } catch (e) { setHistorial([]); } finally { setCargandoHistorial(false); }
  };

  const filtrados = clientes.filter(cli => {
    const nombreValido = cli.nombre || "";
    const telefonoValido = cli.telefono || "";
    const match = nombreValido.toLowerCase().includes(busqueda.toLowerCase()) || telefonoValido.includes(busqueda);
    return filtroActivo === 'Todos' ? match : (match && cli.total_visitas >= 5);
  });

  return (
    <div className="p-4 md:p-10 bg-[#0f171e] min-h-screen text-white animate-in fade-in duration-500">
      <h1 className="text-3xl md:text-5xl font-black italic uppercase mb-8 tracking-tighter text-[#00b4d8]">Inteligencia de Clientes</h1>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input type="text" placeholder="BUSCAR..." className="w-full bg-[#1b262f] p-4 pl-12 rounded-2xl border border-white/5 outline-none font-bold text-sm" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
        {['Todos', 'VIP'].map(f => (
          <button key={f} onClick={() => setFiltroActivo(f)} className={`px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all whitespace-nowrap ${filtroActivo === f ? 'bg-[#00b4d8] text-black' : 'bg-[#1b262f] text-gray-500'}`}>
            {f === 'VIP' ? '💎 VIP' : '👥 Todos'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map(cli => (
          <div key={cli.id || cli.telefono} onClick={() => abrirDetalle(cli)} className="bg-[#1b262f] p-4 rounded-[2rem] border border-white/5 flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center text-[#00b4d8] font-black border border-white/5 group-hover:bg-[#00b4d8] group-hover:text-black transition-all">
                {cli.nombre?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="font-black text-lg uppercase italic leading-none truncate max-w-[150px]">{cli.nombre}</h4>
                <p className="text-xs text-gray-500 mt-1 font-bold">{cli.telefono}</p>
                <span className="text-[8px] bg-[#00b4d8]/10 text-[#00b4d8] px-2 py-0.5 rounded-full font-black uppercase mt-1 inline-block">{cli.total_visitas} Visitas</span>
              </div>
            </div>
            <ChevronRight className="text-gray-700" size={20} />
          </div>
        ))}
      </div>

      {clienteSeleccionado && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setClienteSeleccionado(null)} />
          <div className="relative w-full md:max-w-md bg-[#0f171e] h-full shadow-2xl p-6 md:p-10 overflow-y-auto border-l border-[#00b4d8]/20 animate-in slide-in-from-right duration-300">
            <button onClick={() => setClienteSeleccionado(null)} className="absolute top-6 right-6 text-gray-500"><X size={24}/></button>
            <div className="mt-8">
              <div className="w-20 h-20 bg-[#00b4d8] rounded-[2rem] flex items-center justify-center text-black text-4xl font-black mb-6 italic">{clienteSeleccionado.nombre.charAt(0).toUpperCase()}</div>
              <h2 className="text-3xl font-black italic uppercase leading-none">{clienteSeleccionado.nombre}</h2>
              <p className="text-[#00b4d8] font-black text-xl mt-1 mb-8">{clienteSeleccionado.telefono}</p>

              <div className="bg-[#1b262f] p-6 rounded-2xl border border-white/5 mb-8">
                <p className="text-[8px] text-gray-500 font-black uppercase mb-2">Preferencias</p>
                <p className="text-sm italic text-gray-300 leading-relaxed">{clienteSeleccionado.notas_frecuentes || "Sin requerimientos."}</p>
              </div>

              <h3 className="text-[10px] font-black uppercase text-gray-500 mb-4 flex items-center gap-2"><Calendar size={12}/> Historial</h3>
              <div className="space-y-3">
                {historial.map((res, i) => (
                  <div key={i} className="bg-[#1b262f] p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between font-black text-sm italic">
                      <span>{new Date(res.fecha).toLocaleDateString()}</span>
                      <span className="text-[#00b4d8]">{res.hora}</span>
                    </div>
                    <div className="flex gap-4 text-[9px] text-gray-500 font-black uppercase mt-1">
                      <span className="flex items-center gap-1"><Users size={12}/> {res.num_personas} Pax</span>
                      <span className="flex items-center gap-1"><Star size={12}/> {res.mesa}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;