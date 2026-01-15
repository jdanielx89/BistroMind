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
    } catch (e) { 
      console.error("Error cargando clientes:", e); 
    } finally { 
      setCargando(false); 
    }
  };

  useEffect(() => { obtenerClientes(); }, []);

  const abrirDetalle = async (cliente) => {
    setClienteSeleccionado(cliente);
    setHistorial([]); 
    setCargandoHistorial(true);
    
    try {
      // INTENTO 1: Con el formato original (ej: +57...)
      const telOriginal = encodeURIComponent(cliente.telefono.trim());
      let res = await fetch(`${API_BASE}/${telOriginal}/historial`);
      let data = await res.json();
      
      // INTENTO 2: Si falló, intentamos solo números (ej: 57...)
      if (!Array.isArray(data) || data.length === 0) {
        const telSoloNumeros = cliente.telefono.replace(/\D/g, '');
        const res2 = await fetch(`${API_BASE}/${telSoloNumeros}/historial`);
        const data2 = await res2.json();
        if (Array.isArray(data2) && data2.length > 0) data = data2;
      }
      
      setHistorial(Array.isArray(data) ? data : []);
    } catch (e) { 
      console.error("Error historial:", e);
      setHistorial([]);
    } finally { 
      setCargandoHistorial(false); 
    }
  };

  const filtrados = clientes.filter(cli => {
    const nombreValido = cli.nombre || "";
    const telefonoValido = cli.telefono || "";
    const match = nombreValido.toLowerCase().includes(busqueda.toLowerCase()) || telefonoValido.includes(busqueda);
    return filtroActivo === 'Todos' ? match : (match && (cli.total_visitas || 0) >= 5);
  });

  return (
    <div className="p-4 md:p-10 bg-[#0f171e] min-h-screen text-white font-sans">
      <h1 className="text-3xl md:text-5xl font-black italic uppercase mb-8 tracking-tighter text-[#00b4d8]">Inteligencia de Clientes</h1>

      {/* BUSCADOR */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input 
          type="text" 
          placeholder="BUSCAR POR NOMBRE O TELÉFONO..." 
          className="w-full bg-[#1b262f] p-4 pl-12 rounded-2xl border border-white/5 outline-none font-bold text-sm focus:border-[#00b4d8]/50 transition-all" 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)} 
        />
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        {['Todos', 'VIP'].map(f => (
          <button 
            key={f} 
            onClick={() => setFiltroActivo(f)} 
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase transition-all shadow-lg ${filtroActivo === f ? 'bg-[#00b4d8] text-black scale-105' : 'bg-[#1b262f] text-gray-500'}`}
          >
            {f === 'VIP' ? '💎 Clientes VIP' : '👥 Todos'}
          </button>
        ))}
      </div>

      {/* GRID DE CLIENTES REFECHO */}
      {cargando ? (
        <div className="text-center py-20 text-[#00b4d8] font-black uppercase italic animate-pulse">Sincronizando con Supabase...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(cli => (
            <div 
              key={cli.id || cli.telefono} 
              onClick={() => abrirDetalle(cli)} 
              className="bg-[#1b262f] p-4 rounded-[2rem] border border-white/5 flex justify-between items-center group hover:border-[#00b4d8]/40 transition-all cursor-pointer active:scale-95 shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center text-[#00b4d8] font-black italic text-xl border border-white/5 group-hover:bg-[#00b4d8] group-hover:text-black transition-all">
                  {cli.nombre?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-black text-lg uppercase italic leading-none truncate max-w-[150px]">{cli.nombre}</h4>
                  <p className="text-xs text-gray-500 mt-1 font-bold">{cli.telefono}</p>
                  {/* RECUPERADO: Contador de visitas */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[9px] bg-[#00b4d8]/10 text-[#00b4d8] px-2 py-0.5 rounded-full font-black uppercase border border-[#00b4d8]/20">
                      {cli.total_visitas || 0} Visitas
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-gray-700 group-hover:text-[#00b4d8] transition-all" size={24} />
            </div>
          ))}
        </div>
      )}

      {/* MODAL DETALLE COMPLETO */}
      {clienteSeleccionado && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setClienteSeleccionado(null)} />
          <div className="relative w-full md:max-w-md bg-[#0f171e] h-full p-6 md:p-10 overflow-y-auto border-l border-[#00b4d8]/20 animate-in slide-in-from-right duration-300 shadow-2xl">
            
            <button onClick={() => setClienteSeleccionado(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white bg-white/5 p-2 rounded-full">
              <X size={24}/>
            </button>

            <div className="mt-8">
              <div className="w-20 h-20 bg-[#00b4d8] rounded-[2rem] flex items-center justify-center text-black text-4xl font-black mb-6 italic shadow-xl shadow-[#00b4d8]/20">
                {clienteSeleccionado.nombre.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-4xl font-black italic uppercase leading-none tracking-tighter">{clienteSeleccionado.nombre}</h2>
              <p className="text-[#00b4d8] font-black text-xl mt-1 mb-8">{clienteSeleccionado.telefono}</p>

              {/* NOTAS RECUPERADAS */}
              <div className="bg-[#1b262f] p-6 rounded-2xl border border-white/5 mb-8 shadow-inner">
                <p className="text-[8px] text-[#00b4d8] font-black uppercase tracking-widest mb-2">Preferencias del Cliente</p>
                <p className="text-sm italic text-gray-300 font-medium">
                  {clienteSeleccionado.notas_frecuentes || "Sin requerimientos especiales."}
                </p>
              </div>

              <h3 className="text-[10px] font-black uppercase text-gray-500 mb-6 flex items-center gap-2 tracking-[0.2em] border-b border-white/5 pb-2">
                <Calendar size={14} className="text-[#00b4d8]"/> Historial de Visitas
              </h3>

              <div className="space-y-4">
                {cargandoHistorial ? (
                  <div className="text-center py-10 text-[#00b4d8] font-black uppercase text-[10px] animate-pulse">Buscando en registros pasados...</div>
                ) : historial.length > 0 ? (
                  historial.map((res, i) => (
                    <div key={i} className="bg-[#1b262f] p-5 rounded-2xl border border-white/5 shadow-lg">
                      <div className="flex justify-between font-black text-sm italic mb-3">
                        <span className="text-white uppercase">
                          {new Date(res.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="text-[#00b4d8]">{res.hora} HS</span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 font-black uppercase">
                        <span className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md">
                          <Users size={12} className="text-[#00b4d8]"/> {res.num_personas} Pax
                        </span>
                        <span className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md">
                          <Star size={12} className="text-[#00b4d8]"/> Mesa {res.mesa || 'S/A'}
                        </span>
                        <span className={`ml-auto italic ${res.estado === 'Llego' ? 'text-green-500' : 'text-gray-600'}`}>
                           {res.estado === 'Llego' ? '● ASISTIÓ' : `● ${res.estado}`}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-700 text-center py-16 px-4 font-bold italic uppercase text-[10px] border-2 border-dashed border-white/5 rounded-[2rem]">
                    No se encontraron visitas previas para este número.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;