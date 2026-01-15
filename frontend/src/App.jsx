import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, LayoutDashboard, BarChart3, LogOut, Menu, X } from 'lucide-react';
import Dashboard from './pages/Dashboard'; 
import Clientes from './pages/Clientes';
import Estadisticas from './pages/Estadisticas';
import Login from './pages/Login';

const Sidebar = ({ usuario, onLogout, isOpen, toggleMenu }) => {
  const location = useLocation();
  const menuItems = [
    { name: 'Panel', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Clientes', path: '/clientes', icon: <Users size={20} /> },
    { name: 'Estadísticas', path: '/estadisticas', icon: <BarChart3 size={20} /> },
  ];

  // Estilos para ocultar/mostrar en móvil y fijar en PC
  const sidebarStyles = `
    fixed inset-y-0 left-0 z-50 w-64 bg-[#0b1118] border-r border-gray-800 p-6 flex flex-col h-screen transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
    md:relative md:translate-x-0
  `;

  return (
    <>
      {/* Overlay para cerrar el menú al tocar fuera (solo móvil) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={toggleMenu}
        />
      )}

      <aside className={sidebarStyles}>
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-[#00b4d8] italic tracking-tighter uppercase">BistroMind</h1>
            <div className="w-8 h-1 bg-[#00b4d8] mt-1 rounded-full opacity-40"></div>
          </div>
          {/* Botón para cerrar en móvil */}
          <button onClick={toggleMenu} className="md:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <p className="text-[10px] text-gray-500 font-black mb-6 uppercase">
          Turno: <span className="text-white ml-1">{usuario.nombre}</span>
        </p>

        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path} 
              onClick={() => { if(window.innerWidth < 768) toggleMenu(); }} // Cerrar al clickear en móvil
              className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${location.pathname === item.path ? 'bg-[#00b4d8]/10 text-[#00b4d8] shadow-lg shadow-cyan-900/10' : 'text-gray-500 hover:text-white hover:bg-gray-800'}`}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>

        <button onClick={onLogout} className="mt-auto flex items-center gap-4 p-4 rounded-2xl font-bold text-red-500 hover:bg-red-500/10 transition-all">
          <LogOut size={20} /> Salir
        </button>
      </aside>
    </>
  );
};

function App() {
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('user_bistro')));
  const [menuAbierto, setMenuAbierto] = useState(false);

  if (!usuario) return <Login onLogin={setUsuario} />;
  
  const cerrarSesion = () => { 
    localStorage.removeItem('user_bistro'); 
    setUsuario(null); 
  };

  const toggleMenu = () => setMenuAbierto(!menuAbierto);

  return (
    <Router>
      <div className="flex h-screen w-screen bg-[#0f171e] overflow-hidden"> 
        
        {/* Sidebar con lógica de apertura */}
        <Sidebar 
          usuario={usuario} 
          onLogout={cerrarSesion} 
          isOpen={menuAbierto} 
          toggleMenu={toggleMenu} 
        /> 

        <main className="flex-1 h-full overflow-y-auto bg-[#0f171e] relative">
          {/* BOTÓN HAMBURGUESA (Solo visible en móviles) */}
          <div className="md:hidden p-4 sticky top-0 bg-[#0f171e]/80 backdrop-blur-md z-30 flex items-center border-b border-white/5">
            <button onClick={toggleMenu} className="p-2 text-[#00b4d8] bg-[#1b262f] rounded-xl">
              <Menu size={24} />
            </button>
            <span className="ml-4 font-black italic uppercase tracking-tighter text-[#00b4d8]">BistroMind</span>
          </div>

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