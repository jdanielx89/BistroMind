import React, { useState, useEffect } from 'react';
import { BarChart3, Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

const Estadisticas = () => {
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('https://bistromind.onrender.com/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats({
          totalReservas: data.totalReservas || 0,
          totalPax: data.totalPax || 0,
          exito: data.exito || 0,
          canceladas: data.canceladas || 0,
          mapaHoras: data.mapaHoras || {},
          mesasTop: data.mesasTop || {}
        });
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  if (cargando) return <div className="h-screen flex items-center justify-center bg-[#0f171e] text-[#00b4d8] font-black uppercase italic animate-pulse">Analizando Datos...</div>;

  return (
    <div className="p-4 md:p-10 text-white animate-in fade-in duration-700 bg-[#0f171e] min-h-screen">
      <h2 className="text-3xl md:text-5xl font-black italic uppercase mb-10 text-[#00b4d8]">Métricas</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-8">
        <StatCard title="Reservas" value={stats.totalReservas} icon={<BarChart3 size={18} />} color="border-[#00b4d8]" />
        <StatCard title="Pax" value={stats.totalPax} icon={<Users size={18} />} color="border-purple-500" />
        <StatCard title="Éxito" value={stats.exito} icon={<CheckCircle2 size={18} />} color="border-green-500" />
        <StatCard title="Bajas" value={stats.canceladas} icon={<XCircle size={18} />} color="border-red-500" />
      </div>

      <div className="bg-[#1b262f] p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 mb-8">
        <h3 className="text-xl md:text-2xl font-black uppercase italic mb-6">Mapa de Calor</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-12 gap-2 md:gap-4">
          {["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"].map((hora) => {
            const cantidad = stats.mapaHoras[hora] || 0;
            const intensidad = cantidad === 0 ? 'bg-white/5 text-gray-600' :
                              cantidad < 5 ? 'bg-[#00b4d8]/20 text-[#00b4d8]' :
                              cantidad < 15 ? 'bg-[#00b4d8]/50 text-white' : 
                              'bg-[#00b4d8] text-black font-black';

            return (
              <div key={hora} className={`${intensidad} p-3 md:p-5 rounded-2xl flex flex-col items-center justify-center border border-white/5`}>
                <span className="text-[7px] md:text-[9px] uppercase font-black mb-1">{hora}</span>
                <span className="text-xl md:text-2xl font-black italic">{cantidad}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#1b262f] p-6 md:p-10 rounded-[2rem] border border-white/5">
        <h3 className="text-xl font-black uppercase italic mb-6">Top Mesas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats.mesasTop).sort((a,b) => b[1]-a[1]).slice(0,6).map(([mesa, total], i) => (
            <div key={mesa} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
              <span className="font-black uppercase italic text-sm">#{i+1} {mesa}</span>
              <span className="font-black text-[#00b4d8]">{total} Visitas</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-[#1b262f] p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-l-4 md:border-l-[12px] ${color} shadow-2xl`}>
    <div className="flex justify-between items-start mb-2 md:mb-6">
      <div className="text-gray-400">{icon}</div>
    </div>
    <p className="text-gray-500 text-[8px] md:text-[10px] font-black uppercase mb-1">{title}</p>
    <p className="text-2xl md:text-5xl font-black italic tracking-tighter">{value}</p>
  </div>
);

export default Estadisticas;