import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Estadisticas = () => {
  const [stats, setStats] = useState(null);
  const API_URL = "https://bistromind.onrender.com/api/stats";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error en estadísticas:", err));
  }, []);

  if (!stats) return <div className="p-10 text-white font-black italic">CARGANDO CEREBRO BISTROMIND...</div>;

  const chartData = Object.keys(stats.mapaHoras || {}).map(hora => ({
    hora,
    reservas: stats.mapaHoras[hora]
  })).sort((a, b) => a.hora.localeCompare(b.hora));

  return (
    <div className="p-10 text-white space-y-8">
      <h2 className="text-4xl font-black italic tracking-tighter uppercase text-[#00b4d8]">Inteligencia de Datos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1b262f] p-8 rounded-[2rem] border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2">Total Reservas</p>
          <h3 className="text-5xl font-black text-[#00b4d8]">{stats.totalReservas}</h3>
        </div>
        <div className="bg-[#1b262f] p-8 rounded-[2rem] border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2">Total Comensales</p>
          <h3 className="text-5xl font-black text-white">{stats.totalPax}</h3>
        </div>
        <div className="bg-[#1b262f] p-8 rounded-[2rem] border border-white/5">
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2">Tasa de Éxito</p>
          <h3 className="text-5xl font-black text-green-500">
            {stats.totalReservas > 0 ? Math.round((stats.exito / stats.totalReservas) * 100) : 0}%
          </h3>
        </div>
      </div>

      <div className="bg-[#1b262f] p-10 rounded-[3rem] border border-white/5">
        <h3 className="text-xl font-black uppercase mb-8 italic">Mapa de Calor (Horas Pico)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="hora" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0b1118', border: 'none', borderRadius: '15px', fontWeight: 'bold'}} />
              <Bar dataKey="reservas" radius={[10, 10, 10, 10]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.reservas > 3 ? '#00b4d8' : '#1e293b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;