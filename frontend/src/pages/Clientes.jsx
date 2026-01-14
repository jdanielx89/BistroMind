import React, { useState, useEffect } from 'react';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const API_URL = "https://bistromind.onrender.com/api/clientes";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setClientes(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error cargando clientes:", err));
  }, []);

  return (
    <div className="p-10 text-white">
      <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-10 text-[#00b4d8]">Fidelización</h2>
      <div className="bg-[#1b262f] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] text-gray-500 font-black uppercase">
            <tr>
              <th className="p-6">Nombre Cliente</th>
              <th className="p-6">Teléfono</th>
              <th className="p-6 text-center">Visitas Totales</th>
              <th className="p-6">Últimas Notas</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                <td className="p-6 font-black text-xl">{c.nombre}</td>
                <td className="p-6 text-[#00b4d8] font-bold">{c.telefono}</td>
                <td className="p-6 text-center">
                  <span className="bg-[#00b4d8]/10 text-[#00b4d8] px-4 py-2 rounded-full font-black">
                    {c.total_visitas} {c.total_visitas === 1 ? 'visita' : 'visitas'}
                  </span>
                </td>
                <td className="p-6 text-gray-400 italic text-sm">{c.notas_frecuentes || "Sin comentarios previos"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clientes;