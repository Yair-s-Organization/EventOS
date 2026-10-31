import Button from "../../atoms/Button/Button";
import { Table } from "../Table/Table";
import { Columna } from "../Table/Table";

type SolicitudTabla = {
  id: number;
  nombre: string;
  nombreSolicitante: string;
  fechaInicio: string;
  fechaFin: string;
};

const solicitud: SolicitudTabla[] = [
  {
    id: 1,
    nombre: "Ada Lovelace",
    nombreSolicitante: "Edgardo Adrian",
    fechaInicio: "26/10/2026",
    fechaFin: "26/10/2026",
  },
  {
    id: 2,
    nombre: "Ada Lovelace",
    nombreSolicitante: "Edgardo Adrian",
    fechaInicio: "26/10/2026",
    fechaFin: "26/10/2026",
  },
  {
    id: 3,
    nombre: "Ada Lovelace",
    nombreSolicitante: "Edgardo Adrian",
    fechaInicio: "26/10/2026",
    fechaFin: "26/10/2026",
  },
];

export function SeccionSolicitudesPendientes() {
  const columnas: Columna<SolicitudTabla>[] = [
    {
      id: "nombre",
      encabezado: "Nombre del evento",
      render: (solicitud) => solicitud.nombre,
      className: "min-w-[12rem] px-4",
    },
    {
      id: "nombreSolicitante",
      encabezado: "Nombre del solicitante",
      render: (solicitud) => solicitud.nombreSolicitante,
      className: "min-w-[14rem] px-4",
    },
    {
      id: "fechaInicio",
      encabezado: "Fecha inicio",
      render: (solicitud) => solicitud.fechaInicio,
      className: "min-w-[10rem] px-4",
    },

    {
      id: "fechaFin",
      encabezado: "Fecha fin",
      render: (solicitud) => solicitud.fechaFin,
      className: "min-w-[10rem] px-4",
    },
    
    {
      id:"detalles",
      encabezado: "Detalles",
      render: (solicitud) => {
        return <Button text="Ver detalles" variant="primary"/>
      },
      className: "min-w-[12rem] px-4",
    }
  
  ];

  return (
    <div id="contenedorSeccionTabla" className="mx-auto w-full max-w-7xl overflow-x-auto">
    <Table
      columnas={columnas}
      filas={solicitud}
      obtenerClave={(solicitud) => solicitud.id}
      className="table-auto min-w-full text-center [&_tbody_tr]:h-20 [&_thead_tr]:h-[80px]"
    />
    </div>
  );
}
