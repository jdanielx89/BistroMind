import React, { useState, useEffect } from 'react';
import { Search, Trophy, Phone, MessageSquare } from 'lucide-react';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const API_URL = "https://bistromind.onrender.com/api/clientes";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setClientes(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error:", err));
  }, []);

  const filtrados = clientes.filter(c => 
    c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono?.includes(busqueda)
  );

  return (
    <div className="p-6 md:p-10 text-white min-h-screen bg-[#0a0f14] space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl font-black italic tracking-tighter uppercase text-[#00b4d8]">Fidelización</h2>
          <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Base de Datos de Huéspedes</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input 
            type="text" 
            placeholder="BUSCAR POR NOMBRE O TEL..." 
            className="w-full bg-[#1b262f] border border-white/5 p-5 pl-14 rounded-2xl outline-none font-bold focus:border-[#00b4d8]/50"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-[#1b262f] rounded-[3.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">
              <th className="p-8">Nombre del Cliente</th>
              <th className="p-8">Contacto</th>
              <th className="p-8 text-center">Frecuencia</th>
              <th className="p-8">Preferencias / Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtrados.map(c => (
              <tr key={c.id} className="hover:bg-white/[0.02] transition-all group">
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00b4d8] to-blue-600 rounded-2xl flex items-center justify-center font-black text-black text-xl">
                      {c.nombre?.charAt(0)}
                    </div>
                    <div className="font-black text-2xl uppercase italic group-hover:text-[#00b4d8] transition-colors">{c.nombre}</div>
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex items-center gap-2 text-[#00b4d8] font-black italic">
                    <Phone size={14} /> {c.telefono}
                  </div>
                </td>
                <td className="p-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 bg-[#00b4d8]/10 text-[#00b4d8] px-5 py-2 rounded-full font-black text-sm">
                      <Trophy size={14} /> {c.total_visitas} Visitas
                    </div>
                    {c.total_visitas > 5 && <span className="text-[9px] font-black text-yellow-500 uppercase mt-2 tracking-widest">Cliente Platino</span>}
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 italic text-gray-400 text-sm">
                    <MessageSquare size={16} className="text-gray-600 mt-1 shrink-0" />
                    {c.notas_frecuentes || "No hay preferencias registradas aún."}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <div className="p-20 text-center text-gray-600 font-black uppercase italic tracking-widest">No se encontraron clientes con esos datos</div>
        )}
      </div>
    </div>
  );
};

export default Clientes;