import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3001/api',
});

export const getReservas = () => API.get('/reservas');
export const createReserva = (data) => API.post('/reservas', data);
// Aquí puedes agregar funciones para clientes más adelante