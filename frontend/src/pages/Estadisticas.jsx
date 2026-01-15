import React, { useState, useEffect } from 'react';
import { BarChart3, Users, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

const Estadisticas = () => {
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // URL Actualizada a Render
    fetch('https://bistromind.onrender.com/api/stats')
      .then(res => res.json())
      .then(data => {
        // Validamos que la data tenga la estructura necesaria para evitar errores
        const dataSegura = {
          totalReservas: data.totalReservas || 0,
          totalPax: data.totalPax || 0,
          exito: data.exito || 0,
          canceladas: data.canceladas || 0,
          mapaHoras: data.mapaHoras || {},
          mesasTop: data.mesasTop || {}
        };
        setStats(dataSegura);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error cargando estadísticas:", err);
        setCargando(false);
      });
  }, []);

  if (cargando) return (
    <div className="h-screen flex items-center justify-center bg-[#0f171e]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#00b4d8] font-black uppercase italic tracking-widest animate-pulse">Analizando Datos de Piso...</p>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="p-10 text-center text-gray-500 font-black uppercase italic">
      No se pudieron sincronizar las estadísticas. Reintenta en unos minutos.
    </div>
  );

  return (
    <div className="p-10 text-white animate-in fade-in duration-700 bg-[#0f171e] min-h-screen">
      <h2 className="text-5xl font-black italic tracking-tighter uppercase mb-10 text-[#00b4d8]">Métricas de Negocio</h2>

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Reservas" value={stats.totalReservas} icon={<BarChart3 className="text-[#00b4d8]" />} color="border-[#00b4d8]" />
        <StatCard title="Total Clientes (Pax)" value={stats.totalPax} icon={<Users className="text-purple-500" />} color="border-purple-500" />
        <StatCard title="Atendidos con Éxito" value={stats.exito} icon={<CheckCircle2 className="text-green-500" />} color="border-green-500" />
        <StatCard title="Cancelados/Bajas" value={stats.canceladas} icon={<XCircle className="text-red-500" />} color="border-red-500" />
      </div>

      {/* MAPA DE CALOR POR HORAS (DENSIDAD) */}
      <div className="bg-[#1b262f] p-10 rounded-[3rem] border border-white/5 mb-8 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-black uppercase italic leading-none">Mapa de Calor: Ocupación</h3>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">Franjas horarias con mayor volumen acumulado</p>
          </div>
          <div className="flex gap-2 items-center text-[9px] font-black uppercase text-gray-500 bg-black/20 p-3 rounded-full border border-white/5">
            <span>Bajo</span>
            <div className="w-3 h-3 bg-white/5 rounded-sm"></div>
            <div className="w-3 h-3 bg-[#00b4d8]/30 rounded-sm"></div>
            <div className="w-3 h-3 bg-[#00b4d8]/70 rounded-sm"></div>
            <div className="w-3 h-3 bg-[#00b4d8] rounded-sm shadow-[0_0_10px_#00b4d8]"></div>
            <span>Alto</span>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-12 gap-4">
          {["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"].map((hora) => {
            const cantidad = stats.mapaHoras[hora] || 0;
            const intensidad = cantidad === 0 ? 'bg-white/5 text-gray-600' :
                              cantidad < 5 ? 'bg-[#00b4d8]/20 text-[#00b4d8]' :
                              cantidad < 15 ? 'bg-[#00b4d8]/50 text-white' : 
                              'bg-[#00b4d8] text-black shadow-[0_0_25px_rgba(0,180,216,0.4)] font-black scale-105';

            return (
              <div key={hora} className={`${intensidad} p-5 rounded-[1.5rem] flex flex-col items-center justify-center transition-all hover:scale-110 border border-white/5`}>
                <span className="text-[10px] uppercase font-black opacity-70 mb-1">{hora}</span>
                <span className="text-2xl font-black italic">{cantidad}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* RANKING DE MESAS MÁS PEDIDAS */}
      <div className="bg-[#1b262f] p-10 rounded-[3rem] border border-white/5 shadow-2xl">
        <h3 className="text-2xl font-black uppercase italic mb-8">Top Performance: Mesas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(stats.mesasTop).length > 0 ? 
            Object.entries(stats.mesasTop)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([mesa, total], index) => (
              <div key={mesa} className="flex items-center justify-between p-6 bg-black/40 rounded-[2rem] border border-white/5 hover:border-[#00b4d8]/30 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#00b4d8]/10 flex items-center justify-center text-[#00b4d8] font-black italic border border-[#00b4d8]/20 group-hover:bg-[#00b4d8] group-hover:text-black transition-all">
                    #{index + 1}
                  </div>
                  <span className="font-black uppercase text-lg italic tracking-tight">{mesa}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-black text-xl italic">{total}</div>
                  <div className="text-[9px] text-gray-500 font-black uppercase">Visitas</div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-10 text-center text-gray-700 italic font-bold border-2 border-dashed border-white/5 rounded-[2rem]">
                Sin datos de mesas suficientes para generar ranking
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-[#1b262f] p-8 rounded-[2.5rem] border-l-[12px] ${color} shadow-2xl transition-transform hover:scale-105`}>
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-black/20 rounded-2xl border border-white/5">{icon}</div>
      <TrendingUp size={20} className="text-gray-700" />
    </div>
    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{title}</p>
    <p className="text-5xl font-black italic tracking-tighter">{value}</p>
  </div>
);

export default Estadisticas;