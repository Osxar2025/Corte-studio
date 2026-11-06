/** CONTENIDO DE DEMOSTRACIÓN. Reemplazar por datos reales cuando exista el backend. */
export interface Service { id: string; name: string; description: string; minutes: number; price: number; }
export interface Barber { id: string; name: string; specialty: string; bio: string; photoLabel: string; photoSrc: string; }

export const DEMO_SERVICES: Service[] = [
  { id: 'clasico', name: 'Corte clásico', minutes: 40, price: 35000, description: 'Tijera y máquina con acabado limpio. Lo que pidas, bien hecho, con la toalla caliente de rigor.' },
  { id: 'degradado', name: 'Corte degradado', minutes: 50, price: 42000, description: 'Transiciones medidas a la milésima, del cero al largo que elijas, con línea definida.' },
  { id: 'corte-barba', name: 'Corte y barba', minutes: 75, price: 65000, description: 'Cabello y barba pensados como un solo diseño: proporciones, perfilado y aceite al final.' },
  { id: 'barba', name: 'Arreglo de barba', minutes: 30, price: 28000, description: 'Perfilado con navaja, vapor y bálsamo. Ideal para mantener la forma entre cortes.' },
  { id: 'asesoria', name: 'Diseño y asesoría de estilo', minutes: 60, price: 55000, description: 'Conversamos sobre tu rostro, tu cabello y tu rutina, y salimos con un corte y un plan de cuidado.' }
];

export const DEMO_BARBERS: Barber[] = [
  { id: 'mateo', name: 'Samuel Bolaños', specialty: 'Degradados', bio: 'Dos años afinando estilos. Prefiere pocas palabras y líneas exactas.', photoLabel: 'Retrato de Samuel Bolaños', photoSrc: '/images/barberos/samuel.png' },
  { id: 'camila', name: 'Luis David Jimenes', specialty: 'Diseño y textura', bio: 'Trabaja el cabello como material: corte seco, textura y estilos que se sostienen solos.', photoLabel: 'Retrato de Luis David Jimenes', photoSrc: '/images/barberos/luis.jpg' },
  { id: 'andres', name: 'Johan Rojas', specialty: 'Barba y navaja', bio: 'Maestro de la navaja. Sus perfilados bien trabajados que destacan tu corte.', photoLabel: 'Retrato de Johan Rojas', photoSrc: '/images/barberos/johan.png' }
];

export const DEMO_TIMES = ['09:00', '10:00', '11:30', '14:00', '15:30', '17:00', '18:30'];

export const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
