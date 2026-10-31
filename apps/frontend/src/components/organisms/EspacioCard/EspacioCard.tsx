import React from "react";
import { Button } from "../../atoms/Button/Button";

interface Espacio {
  idRecinto: number;
  nombre: string;
  tipo?: string;
  aforo: number;
  computadorasDisponibles?: number;
  idEstadoRecinto: number;
}

interface EspacioCardProps {
  espacio: Espacio;
  onToggleEstado: (espacio: Espacio) => void;
  onGestionarEquipos: (idRecinto: number) => void;
}

export function EspacioCard({ espacio, onToggleEstado, onGestionarEquipos }: EspacioCardProps) {
  const esLaboratorio = espacio.nombre.toLowerCase().includes("laboratorio");
  const estaHabilitado = espacio.idEstadoRecinto === 1;
  const estadoTexto = estaHabilitado ? "Habilitado" : "Inhabilitado";

  return (
    <div className="bg-white rounded-md border border-gray-300 shadow-sm p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-center mb-6 text-gray-900">
          {espacio.nombre.toLowerCase().includes("auditorio") && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-6 9 6H3zm2.25 1.5h13.5M6 10.5v7.5m3-7.5v7.5m3-7.5v7.5m3-7.5v7.5M3 19.5h18" />
            </svg>
          )}
          {espacio.nombre.toLowerCase().includes("sala") && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 7h1v1h-1V7zm3 0h1v1h-1V7zm-3 4h1v1h-1v-1zm3 0h1v1h-1v-1zm-3 4h1v1h-1v-1zm3 0h1v1h-1v-1z" />
            </svg>
          )}
          {esLaboratorio && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.5-3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v11.25A2.25 2.25 0 004.5 20.25z" />
            </svg>
          )}
        </div>

        <h3 className="font-bold text-xl text-gray-900 mb-4 font-merriweather">
          {espacio.nombre}
        </h3>

        <div className="text-sm text-gray-700 space-y-1 mb-6 font-merriweather">
          <p><span className="font-medium">Aforo máximo:</span> {espacio.aforo}</p>
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <span
            className={`w-2.5 h-2.5 rounded-full ${estaHabilitado ? "bg-eventos-success" : "bg-eventos-error"}`}
          />
          <span className={`text-sm font-medium ${estaHabilitado ? "text-eventos-success" : "text-eventos-error"}`}>
            {estadoTexto}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {esLaboratorio && (
          <Button text="Gestionar equipos" variant="primary" size="sm"
            className="w-full text-xs py-2 rounded"
            onClick={() => onGestionarEquipos(espacio.idRecinto)}
          />
        )}
        <Button text={estaHabilitado ? "Inhabilitar" : "Habilitar"} variant="primary" size="sm"
          className="w-full text-xs py-2 rounded"
          onClick={() => onToggleEstado(espacio)}
        />
      </div>
    </div>
  );
}