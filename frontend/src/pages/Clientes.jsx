import React, { useState, useEffect } from 'react';
import { Search, User, ChevronRight, Plus, Calendar, Users, X, Star } from 'lucide-react';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState('Todos');
  const [cargando, setCargando] = useState(false);
  
  // Estados para el Detalle
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // URL de tu API en Render
  const API_BASE = "https://bistromind.onrender.com/api/clientes";

  const obtenerClientes = async () => {
    setCargando(true);
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (e) { 
      console.error("Error cargando clientes:", e); 
    } finally { 
      setCargando(false); 
    }
  };

  useEffect(() => { obtenerClientes(); }, []);

  const abrirDetalle = async (cliente) => {
    setClienteSeleccionado(cliente);
    setCargandoHistorial(true);
    try {
      // Endpoint para el historial basado en el teléfono
      const res = await fetch(`${API_BASE}/${cliente.telefono}/historial`);
      const data = await res.json();
      setHistorial(Array.isArray(data) ? data : []);
    } catch (e) { 
      console.error("Error cargando historial:", e); 
      setHistorial([]);
    } finally { 
      setCargandoHistorial(false); 
    }
  };

  const filtrados = clientes.filter(cli => {
    const nombreValido = cli.nombre || "";
    const telefonoValido = cli.telefono || "";
    const match = nombreValido.toLowerCase().includes(busqueda.toLowerCase()) || telefonoValido.includes(busqueda);
    
    if (filtroActivo === 'Todos') return match;
    if (filtroActivo === 'VIP') return match && cli.total_visitas >= 5;
    return match;
  });

  return (
    <div className="p-8 bg-[#0f171e] min-h-screen text-white relative animate-in fade-in duration-500">
      <h1 className="text-4xl font-black italic uppercase mb-8 tracking-tighter text-[#00b4d8]">Inteligencia de Clientes</h1>

      {/* BUSCADOR */}
      <div className="relative mb-6">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="BUSCAR POR NOMBRE O CELULAR..." 
          className="w-full bg-[#1b262f] p-5 pl-14 rounded-2xl border border-white/5 outline-none focus:border-[#00b4d8] font-bold shadow-xl"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {['Todos', 'VIP'].map(f => (
          <button 
            key={f} 
            onClick={() => setFiltroActivo(f)}
            className={`px-10 py-3 rounded-full text-[10px] font-black uppercase transition-all shadow-lg ${filtroActivo === f ? 'bg-[#00b4d8] text-black scale-105' : 'bg-[#1b262f] text-gray-500 hover:text-white'}`}
          >
            {f === 'VIP' ? '💎 Clientes VIP' : '👥 Todos'}
          </button>
        ))}
      </div>

      {/* GRID DE TARJETAS */}
      {cargando ? (
        <div className="text-center py-20 text-[#00b4d8] font-black uppercase italic animate-pulse">Sincronizando Base de Datos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(cli => (
            <div 
              key={cli.id || cli.telefono} 
              onClick={() => abrirDetalle(cli)}
              className="bg-[#1b262f] p-6 rounded-[2.5rem] border border-white/5 hover:border-[#00b4d8]/40 transition-all cursor-pointer flex justify-between items-center group shadow-md hover:shadow-[#00b4d8]/5"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-black/40 rounded-[1.5rem] flex items-center justify-center text-[#00b4d8] text-2xl font-black border border-white/5 group-hover:bg-[#00b4d8] group-hover:text-black transition-all">
                  {cli.nombre?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-xl uppercase italic leading-none">{cli.nombre}</h4>
                  <p className="text-sm text-gray-500 mt-1 font-bold">{cli.telefono}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-[#00b4d8]/10 text-[#00b4d8] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                      {cli.total_visitas} Visitas
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-gray-700 group-hover:text-[#00b4d8] group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      )}

      {/* MODAL LATERAL (DETALLE) */}
      {clienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setClienteSeleccionado(null)} />
          <div className="relative w-full max-w-md bg-[#0f171e] h-full shadow-2xl p-10 overflow-y-auto border-l border-[#00b4d8]/20 animate-in slide-in-from-right duration-300">
            <button onClick={() => setClienteSeleccionado(null)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"><X size={28}/></button>
            
            <div className="mt-10">
              <div className="w-24 h-24 bg-[#00b4d8] rounded-[2.5rem] flex items-center justify-center text-black text-5xl font-black mb-8 shadow-2xl shadow-[#00b4d8]/20 italic">
                {clienteSeleccionado.nombre.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight">{clienteSeleccionado.nombre}</h2>
              <p className="text-[#00b4d8] font-black text-2xl mt-1 mb-10 tracking-tighter">{clienteSeleccionado.telefono}</p>

              <div className="bg-[#1b262f] p-8 rounded-[2rem] border border-white/5 mb-10 shadow-inner">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-3">Notas de Preferencia</p>
                <p className="text-md italic text-gray-300 leading-relaxed">
                  {clienteSeleccionado.notas_frecuentes ? `"${clienteSeleccionado.notas_frecuentes}"` : "Este cliente no tiene requerimientos especiales registrados aún."}
                </p>
              </div>

              <h3 className="text-xs font-black uppercase text-gray-500 mb-6 tracking-[0.3em] flex items-center gap-3">
                <Calendar size={14}/> Historial de Reservas
              </h3>
              
              {cargandoHistorial ? (
                <div className="text-center py-10 animate-pulse text-[#00b4d8] font-black uppercase text-[10px] tracking-widest">Escaneando Registros...</div>
              ) : (
                <div className="space-y-4">
                  {historial.length > 0 ? historial.map((res, i) => (
                    <div key={i} className="bg-[#1b262f] p-5 rounded-2xl border border-white/5 hover:border-[#00b4d8]/20 transition-all shadow-lg">
                      <div className="flex justify-between font-black text-lg mb-2 italic">
                        <span className="text-white">{new Date(res.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-[#00b4d8] uppercase">{res.hora}</span>
                      </div>
                      <div className="flex gap-5 text-[10px] text-gray-500 font-black uppercase tracking-tighter">
                        <span className="flex items-center gap-1.5"><Users size={14} className="text-[#00b4d8]"/> {res.num_personas} Pax</span>
                        <span className="flex items-center gap-1.5"><Star size={14} className="text-[#00b4d8]"/> {res.mesa}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-gray-700 text-center py-10 font-bold italic uppercase text-sm border-2 border-dashed border-white/5 rounded-3xl">No hay registros previos</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;