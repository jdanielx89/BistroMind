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

  const obtenerClientes = async () => {
    setCargando(true);
    try {
      const res = await fetch('http://localhost:5000/api/clientes');
      const data = await res.json();
      setClientes(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setCargando(false); }
  };

  useEffect(() => { obtenerClientes(); }, []);

  const abrirDetalle = async (cliente) => {
    setClienteSeleccionado(cliente);
    setCargandoHistorial(true);
    try {
      const res = await fetch(`http://localhost:5000/api/clientes/${cliente.telefono}/historial`);
      const data = await res.json();
      setHistorial(data);
    } catch (e) { console.error(e); } finally { setCargandoHistorial(false); }
  };

  const filtrados = clientes.filter(cli => {
    const match = cli.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || cli.telefono?.includes(busqueda);
    if (filtroActivo === 'Todos') return match;
    if (filtroActivo === 'VIP') return match && cli.total_visitas >= 5;
    return match;
  });

  return (
    <div className="p-8 bg-[#0f171e] min-h-screen text-white relative">
      <h1 className="text-3xl font-bold italic uppercase mb-6 tracking-tighter">Inteligencia de Clientes</h1>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-3 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nombre o celular..." 
          className="w-full bg-[#1b262f] p-4 pl-12 rounded-2xl border border-white/5 outline-none focus:border-[#00b4d8]"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['Todos', 'VIP'].map(f => (
          <button 
            key={f} 
            onClick={() => setFiltroActivo(f)}
            className={`px-8 py-2 rounded-full text-xs font-black uppercase transition-all ${filtroActivo === f ? 'bg-[#00b4d8] text-black' : 'bg-[#1b262f] text-gray-500'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtrados.map(cli => (
          <div 
            key={cli.id} 
            onClick={() => abrirDetalle(cli)}
            className="bg-[#1b262f] p-6 rounded-[2rem] border border-white/5 hover:border-[#00b4d8]/50 transition-all cursor-pointer flex justify-between items-center group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center text-[#00b4d8] font-black border border-white/5 group-hover:bg-[#00b4d8] group-hover:text-black">
                {cli.nombre?.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-lg leading-none">{cli.nombre}</h4>
                <p className="text-sm text-gray-500 mt-1">{cli.telefono}</p>
                <span className="text-[10px] text-[#00b4d8] font-black uppercase mt-2 block tracking-widest">
                  {cli.total_visitas} Visitas
                </span>
              </div>
            </div>
            <ChevronRight className="text-gray-700 group-hover:text-[#00b4d8]" />
          </div>
        ))}
      </div>

      {/* MODAL LATERAL (DETALLE) */}
      {clienteSeleccionado && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setClienteSeleccionado(null)} />
          <div className="relative w-full max-w-md bg-[#161f27] h-full shadow-2xl p-8 overflow-y-auto border-l border-white/10 animate-in slide-in-from-right duration-300">
            <button onClick={() => setClienteSeleccionado(null)} className="absolute top-6 right-6 text-gray-500"><X size={24}/></button>
            
            <div className="mt-12">
              <div className="w-20 h-20 bg-[#00b4d8] rounded-[2rem] flex items-center justify-center text-black text-4xl font-black mb-6">
                {clienteSeleccionado.nombre.charAt(0)}
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-tight">{clienteSeleccionado.nombre}</h2>
              <p className="text-[#00b4d8] font-bold text-xl mb-8">{clienteSeleccionado.telefono}</p>

              <div className="bg-black/20 p-6 rounded-3xl border border-white/5 mb-8">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Preferencia General</p>
                <p className="text-sm italic text-gray-300">"{clienteSeleccionado.notas_frecuentes || 'Sin preferencias registradas'}"</p>
              </div>

              <h3 className="text-xs font-black uppercase text-gray-500 mb-4 tracking-widest border-b border-white/5 pb-2">Línea de Tiempo</h3>
              
              {cargandoHistorial ? (
                <div className="text-center py-10 animate-pulse text-gray-600 font-black uppercase text-xs">Consultando Archivos...</div>
              ) : (
                <div className="space-y-4">
                  {historial.map((res, i) => (
                    <div key={i} className="bg-white/5 p-4 rounded-2xl border-l-2 border-[#00b4d8]">
                      <div className="flex justify-between font-black text-sm mb-2">
                        <span>{res.fecha}</span>
                        <span className="text-[#00b4d8]">{res.hora}</span>
                      </div>
                      <div className="flex gap-4 text-[10px] text-gray-400 font-bold">
                        <span className="flex items-center gap-1 uppercase"><Users size={12}/> {res.num_personas} Pax</span>
                        <span className="flex items-center gap-1 uppercase"><Star size={12}/> {res.mesa}</span>
                      </div>
                    </div>
                  ))}
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