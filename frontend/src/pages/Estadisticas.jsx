import React, { useState, useEffect } from 'react';
import { BarChart3, Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

const Estadisticas = () => {
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setCargando(false);
      })
      .catch(err => console.error("Error:", err));
  }, []);

  if (cargando) return (
    <div className="h-full flex items-center justify-center text-[#00b4d8] font-black animate-pulse">
      CARGANDO INTELIGENCIA DE DATOS...
    </div>
  );

  return (
    <div className="p-10 text-white animate-in fade-in duration-700">
      <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-10">Estadísticas de Negocio</h2>

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Reservas" value={stats.totalReservas} icon={<BarChart3 className="text-[#00b4d8]" />} color="border-[#00b4d8]" />
        <StatCard title="Total Clientes (Pax)" value={stats.totalPax} icon={<Users className="text-purple-500" />} color="border-purple-500" />
        <StatCard title="Atendidos con Éxito" value={stats.exito} icon={<CheckCircle2 className="text-green-500" />} color="border-green-500" />
        <StatCard title="Cancelados/Bajas" value={stats.canceladas} icon={<XCircle className="text-red-500" />} color="border-red-500" />
      </div>

      {/* MAPA DE CALOR POR HORAS (DENSIDAD) */}
      <div className="bg-[#1b262f] p-10 rounded-[3rem] border border-white/5 mb-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black uppercase italic">Mapa de Calor: Ocupación</h3>
            <p className="text-gray-500 text-xs">Franjas horarias con mayor volumen de reservas acumuladas</p>
          </div>
          <div className="flex gap-2 items-center text-[9px] font-black uppercase text-gray-500">
            <span>Bajo</span>
            <div className="w-3 h-3 bg-white/5 rounded-sm"></div>
            <div className="w-3 h-3 bg-[#00b4d8]/30 rounded-sm"></div>
            <div className="w-3 h-3 bg-[#00b4d8]/70 rounded-sm"></div>
            <div className="w-3 h-3 bg-[#00b4d8] rounded-sm"></div>
            <span>Alto</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-3">
          {["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"].map((hora) => {
            const cantidad = stats.mapaHoras[hora] || 0;
            // Cálculo de intensidad visual
            const intensidad = cantidad === 0 ? 'bg-white/5 text-gray-600' :
                              cantidad < 5 ? 'bg-[#00b4d8]/20 text-[#00b4d8]' :
                              cantidad < 15 ? 'bg-[#00b4d8]/50 text-white' : 
                              'bg-[#00b4d8] text-black shadow-[0_0_20px_rgba(0,180,216,0.3)] font-black scale-105';

            return (
              <div key={hora} className={`${intensidad} p-4 rounded-2xl flex flex-col items-center justify-center transition-all hover:scale-110 border border-white/5`}>
                <span className="text-[9px] uppercase font-bold opacity-70">{hora}</span>
                <span className="text-xl font-black">{cantidad}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* RANKING DE MESAS MÁS PEDIDAS */}
      <div className="bg-[#1b262f] p-10 rounded-[3rem] border border-white/5">
        <h3 className="text-xl font-black uppercase italic mb-6">Ranking de Mesas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(stats.mesasTop)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([mesa, total], index) => (
              <div key={mesa} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4">
                  <span className="text-[#00b4d8] font-black text-lg">#{index + 1}</span>
                  <span className="font-bold uppercase text-sm">{mesa}</span>
                </div>
                <div className="text-gray-400 font-bold">{total} Visitas</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Componente pequeño para las tarjetas superiores
const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-[#1b262f] p-8 rounded-[2.5rem] border-l-8 ${color} shadow-xl`}>
    <div className="flex justify-between items-start mb-4">
      {icon}
      <TrendingUp size={16} className="text-gray-700" />
    </div>
    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
    <p className="text-4xl font-black">{value}</p>
  </div>
);

export default Estadisticas;