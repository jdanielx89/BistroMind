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
    <div className="h-screen w-screen bg-[#0f171e] flex items-center justify-center text-white">
      <div className="bg-[#1b262f] p-12 rounded-[3rem] border border-white/5 shadow-2xl w-full max-w-md text-center">
        <h1 className="text-4xl font-black italic text-[#00b4d8] mb-1 uppercase tracking-tighter">BistroMind</h1>
        <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.3em] mb-10">Intelligent Management</p>
        <form onSubmit={manejarLogin} className="space-y-6">
          <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" className={`w-full bg-black/40 border ${error ? 'border-red-500' : 'border-white/10'} p-6 rounded-2xl text-center text-2xl tracking-[1em] outline-none focus:border-[#00b4d8] transition-all`} maxLength={4} />
          <button type="submit" className="w-full bg-[#00b4d8] text-black font-black p-5 rounded-2xl uppercase tracking-widest hover:scale-105 transition-all">Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;