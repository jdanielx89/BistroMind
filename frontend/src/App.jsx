import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, LayoutDashboard, BarChart3, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard'; 
import Clientes from './pages/Clientes';
import Estadisticas from './pages/Estadisticas';
import Login from './pages/Login';

const Sidebar = ({ usuario, onLogout }) => {
  const location = useLocation();
  const menuItems = [
    { name: 'Panel', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Clientes', path: '/clientes', icon: <Users size={20} /> },
    { name: 'Estadísticas', path: '/estadisticas', icon: <BarChart3 size={20} /> },
  ];

  return (
    <aside className="w-64 bg-[#0b1118] border-r border-gray-800 p-6 flex flex-col h-screen sticky top-0">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-[#00b4d8] italic tracking-tighter uppercase">BistroMind</h1>
        <div className="w-8 h-1 bg-[#00b4d8] mt-1 rounded-full opacity-40"></div>
        <p className="text-[10px] text-gray-500 font-black mt-4 uppercase">Turno Actual: <span className="text-white ml-1">{usuario.nombre}</span></p>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <Link key={item.name} to={item.path} className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${location.pathname === item.path ? 'bg-[#00b4d8]/10 text-[#00b4d8] shadow-lg shadow-cyan-900/10' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
            {item.icon} {item.name}
          </Link>
        ))}
      </nav>

      <button onClick={onLogout} className="mt-auto flex items-center gap-4 p-4 rounded-2xl font-bold text-red-500 hover:bg-red-500/10 transition-all">
        <LogOut size={20} /> Salir
      </button>
    </aside>
  );
};

function App() {
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('user_bistro')));
  if (!usuario) return <Login onLogin={setUsuario} />;
  const cerrarSesion = () => { localStorage.removeItem('user_bistro'); setUsuario(null); };

  return (
    <Router>
      <div className="flex h-screen w-screen bg-[#0f171e] overflow-hidden"> 
        <Sidebar usuario={usuario} onLogout={cerrarSesion} /> 
        <main className="flex-1 h-full overflow-y-auto bg-[#0f171e]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/estadisticas" element={<Estadisticas />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;