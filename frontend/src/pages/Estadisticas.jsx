import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { TrendingUp, Users, CheckCircle, PieChart } from 'lucide-react';

const Estadisticas = () => {
  const [stats, setStats] = useState(null);
  const API_URL = "https://bistromind.onrender.com/api/stats";

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Error:", err));
  }, []);

  if (!stats) return (
    <div className="h-screen flex items-center justify-center bg-[#0a0f14]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#00b4d8] font-black italic animate-pulse tracking-widest uppercase">Analizando Cerebro BistroMind...</p>
      </div>
    </div>
  );

  const chartData = Object.keys(stats.mapaHoras || {}).map(hora => ({
    hora,
    reservas: stats.mapaHoras[hora]
  })).sort((a, b) => a.hora.localeCompare(b.hora));

  return (
    <div className="p-6 md:p-10 text-white min-h-screen bg-[#0a0f14] space-y-10">
      <div>
        <h2 className="text-5xl font-black italic tracking-tighter uppercase text-[#00b4d8]">Analytics</h2>
        <p className="text-gray-500 font-bold mt-2 uppercase text-[10px] tracking-[0.2em]">Rendimiento Operativo Global</p>
      </div>
      
      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1b262f] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <TrendingUp className="absolute right-6 top-6 text-white/5 group-hover:text-[#00b4d8]/20 transition-colors" size={60} />
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">Reservas Históricas</p>
          <h3 className="text-6xl font-black text-white">{stats.totalReservas}</h3>
        </div>
        <div className="bg-[#1b262f] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <Users className="absolute right-6 top-6 text-white/5 group-hover:text-[#00b4d8]/20 transition-colors" size={60} />
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">Pax Acumulados</p>
          <h3 className="text-6xl font-black text-[#00b4d8]">{stats.totalPax}</h3>
        </div>
        <div className="bg-[#1b262f] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <CheckCircle className="absolute right-6 top-6 text-white/5 group-hover:text-green-500/20 transition-colors" size={60} />
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">Tasa de Efectividad</p>
          <h3 className="text-6xl font-black text-green-500">
            {stats.totalReservas > 0 ? Math.round((stats.exito / stats.totalReservas) * 100) : 0}%
          </h3>
        </div>
        <div className="bg-[#1b262f] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
          <PieChart className="absolute right-6 top-6 text-white/5 group-hover:text-red-500/20 transition-colors" size={60} />
          <p className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-widest">Cancelaciones</p>
          <h3 className="text-6xl font-black text-red-500">{stats.canceladas}</h3>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#1b262f] p-10 rounded-[3.5rem] border border-white/5 shadow-2xl">
          <h3 className="text-2xl font-black uppercase mb-10 italic flex items-center gap-3">
            <Clock className="text-[#00b4d8]" /> Flujo de Horas Pico
          </h3>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="hora" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{backgroundColor: '#1b262f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', fontWeight: 'bold'}} />
                <Bar dataKey="reservas" radius={[15, 15, 15, 15]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.reservas > 5 ? '#00b4d8' : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1b262f] p-10 rounded-[3.5rem] border border-white/5">
          <h3 className="text-2xl font-black uppercase mb-10 italic">Top Mesas</h3>
          <div className="space-y-6">
            {Object.entries(stats.mesasTop || {}).sort((a,b) => b[1]-a[1]).slice(0, 5).map(([mesa, cant], idx) => (
              <div key={mesa} className="flex justify-between items-center bg-white/5 p-5 rounded-2xl hover:bg-[#00b4d8]/10 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-[#00b4d8] font-black text-xl">#0{idx+1}</span>
                  <span className="font-black uppercase tracking-widest text-sm">{mesa}</span>
                </div>
                <span className="bg-[#00b4d8] text-black px-4 py-1 rounded-full font-black text-xs">{cant} Res</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;