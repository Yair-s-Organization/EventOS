import { useState } from "react";
import { Table } from "../Table/Table";
import { Columna } from "../Table/Table";
import { Button } from "../../atoms/Button/Button";

type eventoAgenda = {
  id: number;
  nombre: string;
  horaInicio: string;
  horaFin: string;
};

const evento: eventoAgenda[] = [
  {
    id: 1,
    nombre: "Ada Lovelace",
    horaInicio: "10:00",
    horaFin: "13:30",
  },
  {
    id: 2,
    nombre: "Becas",
    horaInicio: "16:00",
    horaFin: "17:30",
  },
];

export interface AgendaRecintoProps{
    titulo: string;
}

export function AgendaRecinto({titulo} : AgendaRecintoProps) {
  const [mostrar, setMostrar] = useState(false);
  const columnas: Columna<eventoAgenda>[] = [
    {
      id: "nombre",
      encabezado: "Nombre evento",
      render: (evento) => evento.nombre,
      className: "w-1/3",
    },
    {
      id: "horaInicio",
      encabezado: "Hora inicio",
      render: (evento) => evento.horaInicio,
      className: "w-1/4",
    },
    {
      id: "horaFin",
      encabezado: "Hora Fin",
      render: (evento) => evento.horaFin,
      className: "w-1/4",
    },
  ];

  return (
    <div className={`relative w-sm rounded-md border ${mostrar ? "z-10" : ""}`}>
      <div className="relative w-full">
        <span className="block text-center text-merriweather font-medium text-2xl">
          {titulo}
        </span>
        {mostrar == false ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            onClick={() => setMostrar(true)}
            className="lucide lucide-chevron-down preview-icon absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            onClick={() => setMostrar(false)}
            className="lucide lucide-chevron-up preview-icon absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2">
            <path d="m18 15-6-6-6 6" />
          </svg>
        )}
      </div>
      {mostrar && (
        <div className="w-full rounded-md border p-2 shadow-lg">
          <Table
            columnas={columnas}
            filas={evento}
            obtenerClave={(evento) => evento.id}
            className="w-full table-fixed text-center [&_thead_tr]:h-12 [&_thead_tr]:border-0 [&_tbody_tr]:h-12 [&_tbody_td]:border-0 [&_th]:font-normal"
          />
        </div>
      )}
    </div>
  );
}
