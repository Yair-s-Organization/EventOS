import type { Evento } from '@eventoos/shared';

export default function App() {
  const ejemplo: Evento = { id: '1', nombre: 'EventOS' };
  return <h1>{ejemplo.nombre}</h1>;
}