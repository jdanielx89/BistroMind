import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const usuarios = [
    { nombre: 'Ana', pin: '1010', puedeEliminar: true },
    { nombre: 'Julieth', pin: '2020', puedeEliminar: true },
    { nombre: 'Luis', pin: '3030', puedeEliminar: true },
    { nombre: 'Daniel', pin: '4040', puedeEliminar: true },
    { nombre: 'Puerta', pin: '5050', puedeEliminar: false }
  ];

  const manejarLogin = (e) => {
    e.preventDefault();
    const encontrado = usuarios.find(u => u.pin === pin);
    if (encontrado) {
      localStorage.setItem('user_bistro', JSON.stringify(encontrado));
      onLogin(encontrado);
    } else {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0f171e] flex items-center justify-center p-4">
      <div className="bg-[#1b262f] p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border border-white/5 shadow-2xl w-full max-w-md text-center">
        <h1 className="text-4xl md:text-5xl font-black italic text-[#00b4d8] mb-1 uppercase tracking-tighter">BistroMind</h1>
        <p className="text-gray-500 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mb-10">Inteligencia para Restaurantes</p>
        
        <form onSubmit={manejarLogin} className="space-y-6">
          <input 
            type="password" 
            placeholder="INGRESA TU PIN" 
            maxLength={4}
            className={`w-full bg-black/40 p-5 rounded-2xl border-2 text-center text-3xl font-black tracking-[1em] outline-none transition-all ${error ? 'border-red-500 animate-shake' : 'border-white/5 focus:border-[#00b4d8]'}`}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          />
          <button type="submit" className="w-full bg-[#00b4d8] p-5 rounded-2xl text-black font-black uppercase italic hover:scale-105 transition-all shadow-lg">Acceder</button>
        </form>
        {error && <p className="text-red-500 text-[10px] font-black uppercase mt-4 animate-pulse">PIN INCORRECTO</p>}
      </div>
    </div>
  );
};

export default Login;