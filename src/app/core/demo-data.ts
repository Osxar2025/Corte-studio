/** CONTENIDO DE DEMOSTRACIÓN. Reemplazar por datos reales cuando exista el backend. */
export interface Service { id: string; name: string; description: string; minutes: number; price: number; }
export interface Barber { id: string; name: string; specialty: string; bio: string; photoLabel: string; }

export const DEMO_SERVICES: Service[] = [
  { id: 'clasico', name: 'Corte clásico', minutes: 40, price: 35000, description: 'Tijera y máquina con acabado limpio. Lo que pidas, bien hecho, con la toalla caliente de rigor.' },
  { id: 'degradado', name: 'Corte degradado', minutes: 50, price: 42000, description: 'Transiciones medidas a la milésima, del cero al largo que elijas, con línea definida.' },
  { id: 'corte-barba', name: 'Corte y barba', minutes: 75, price: 65000, description: 'Cabello y barba pensados como un solo diseño: proporciones, perfilado y aceite al final.' },
  { id: 'barba', name: 'Arreglo de barba', minutes: 30, price: 28000, description: 'Perfilado con navaja, vapor y bálsamo. Ideal para mantener la forma entre cortes.' },
  { id: 'asesoria', name: 'Diseño y asesoría de estilo', minutes: 60, price: 55000, description: 'Conversamos sobre tu rostro, tu cabello y tu rutina, y salimos con un corte y un plan de cuidado.' }
];

export const DEMO_BARBERS: Barber[] = [
  { id: 'mateo', name: 'Mateo Rivas', specialty: 'Degradados', bio: 'Doce años afinando transiciones. Prefiere pocas palabras y líneas exactas.', photoLabel: 'Retrato vertical · Mateo' },
  { id: 'camila', name: 'Camila Ortega', specialty: 'Diseño y textura', bio: 'Trabaja el cabello como material: corte seco, textura y estilos que se sostienen solos.', photoLabel: 'Retrato vertical · Camila' },
  { id: 'andres', name: 'Andrés Beltrán', specialty: 'Barba y navaja', bio: 'Maestro de la navaja. Sus perfilados duran la semana entera.', photoLabel: 'Retrato vertical · Andrés' }
];

export const DEMO_TIMES = ['09:00', '10:00', '11:30', '14:00', '15:30', '17:00', '18:30'];

export const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
