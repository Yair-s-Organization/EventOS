import React from "react";
import { EquipoItem } from "../../../components/molecules/equipoItem";

interface Equipo {
  idEstadoEquipo: number;
  numeroEquipo: number;
  estado: boolean;
  idRecinto: number;
}

interface ListaEquiposTableProps {
  equipos: Equipo[];
  onToggleEquipo: (equipo: Equipo) => void;
}

export function ListaEquiposTable({ equipos, onToggleEquipo }: ListaEquiposTableProps) {
  return (
    <div className="lg:col-span-2 bg-white rounded-md border border-gray-300 shadow-sm p-7 max-w-md">
      <div className="border-b border-gray-300 pb-3 mb-4 flex justify-between items-center font-semibold text-sm text-gray-900 max-w-md">
        <span className="w-32">Número de equipo</span>
        <div className="flex items-center space-x-3">
            <span>Inhabilitar</span>
            <div className="w-13"/>
        </div>   
      </div>

      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
        {equipos.map((equipo) => (
          <EquipoItem key={equipo.idEstadoEquipo} equipo={equipo} onToggle={onToggleEquipo}/>
        ))}
      </div>
    </div>
  );
}