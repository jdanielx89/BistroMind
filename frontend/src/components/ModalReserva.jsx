import React, { useState } from 'react';
import { X, Calendar, Users, Clock, User } from 'lucide-react';

const ModalReserva = ({ onClose }) => {
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    num_personas: 2,
    fecha: '',
    hora: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('¡Reserva creada!');
        onClose(); 
      } else {
        const errorData = await response.json();
        alert('Error: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-[#1b262f] w-full max-w-md rounded-[2.5rem] border border-white/10 p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h3 className="text-2xl font-black italic mb-6 text-[#00b4d8] uppercase">Nueva Reserva</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-2">Cliente</label>
            <div className="relative">
              <User className="absolute left-4 top-3 text-gray-500" size={18} />
              <input 
                type="text" required
                className="w-full bg-[#0f171e] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#00b4d8] outline-none"
                placeholder="Nombre completo"
                onChange={(e) => setFormData({...formData, nombre_cliente: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-2">Personas</label>
              <input 
                type="number" min="1" required
                className="w-full bg-[#0f171e] border border-white/5 rounded-xl py-3 px-4 text-white focus:border-[#00b4d8] outline-none"
                value={formData.num_personas}
                onChange={(e) => setFormData({...formData, num_personas: e.target.value})}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase ml-2">Hora</label>
              <input 
                type="time" required
                className="w-full bg-[#0f171e] border border-white/5 rounded-xl py-3 px-4 text-white focus:border-[#00b4d8] outline-none"
                onChange={(e) => setFormData({...formData, hora: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase ml-2">Fecha</label>
            <input 
              type="date" required
              className="w-full bg-[#0f171e] border border-white/5 rounded-xl py-3 px-4 text-white focus:border-[#00b4d8] outline-none"
              onChange={(e) => setFormData({...formData, fecha: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-[#00b4d8] text-white font-black italic py-4 rounded-xl mt-4 hover:scale-[1.02] transition">
            CONFIRMAR RESERVA
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalReserva;