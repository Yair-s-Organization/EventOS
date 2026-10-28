import React from "react";

interface Equipo {
  idEstadoEquipo: number;
  numeroEquipo: number;
  estado: boolean;
  idRecinto: number;
}

interface EquipoItemProps {
  equipo: Equipo;
  onToggle: (equipo: Equipo) => void;
}

export function EquipoItem({ equipo, onToggle }: EquipoItemProps) {
  const estaInhabilitado = !equipo.estado;

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 max-w-md">
      <span className="text-sm font-medium text-gray-800 w-32">
        Equipo {equipo.numeroEquipo}
      </span>

      <div className="flex items-center space-x-3">
        <span className="text-xs text-gray-600">Inhabilitar</span>
        
        <button type="button" onClick={() => onToggle(equipo)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${estaInhabilitado ? "bg-[#5c1d33]" : "bg-gray-300"}`}
          role="switch"
          aria-checked={estaInhabilitado}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${estaInhabilitado ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>
    </div>
  );
}