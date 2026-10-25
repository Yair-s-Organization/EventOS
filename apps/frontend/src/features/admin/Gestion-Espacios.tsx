import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/atoms/Button/Button";
import { Modal } from "../../components/molecules/Modal";

interface Espacio {
  id: number;
  nombre: string;
  tipo: string;
  aforo: string;
  computadoras?: string;
  estado: "Habilitado" | "Inhabilitado" | "En mantenimiento";
}

export function GestionEspacios() {
  const navigate = useNavigate();

  const [espacios, setEspacios] = useState<Espacio[]>([
    {
      id: 1,
      nombre: "Auditorio",
      tipo: "Auditorio",
      aforo: "XX",
      estado: "Habilitado",
    },
    {
      id: 2,
      nombre: "Sala 14",
      tipo: "Sala",
      aforo: "XX",
      estado: "Habilitado",
    },
    {
      id: 3,
      nombre: "Laboratorio",
      tipo: "Laboratorio",
      aforo: "XX",
      computadoras: "XX",
      estado: "Inhabilitado",
    },
  ]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [espacioActivo, setEspacioActivo] = useState<Espacio | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<"Habilitado" | "Inhabilitado" | "En mantenimiento">("Habilitado");

  const abrirModalEstado = (espacio: Espacio) => {
    setEspacioActivo(espacio);
    setNuevoEstado(espacio.estado);
    setModalAbierto(true);
  };

  const handleGuardarEstado = () => {
    if (espacioActivo) {
      setEspacios((prev) =>
        prev.map((item) =>
          item.id === espacioActivo.id ? { ...item, estado: nuevoEstado } : item
        )
      );
    }
    setModalAbierto(false);
    setEspacioActivo(null);
  };

  return (
    <div className="space-y-6 font-merriweather text-gray-800">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Gestión de espacios físicos
        </h1>
        <p className="text-sm text-gray-600">
          Administra los recintos de ESCOM
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {espacios.map((espacio) => (
          <div
            key={espacio.id}
            className="bg-white rounded-md border border-gray-300 shadow-sm p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-center mb-6 text-gray-900">
                {espacio.tipo === "Auditorio" && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-6 9 6H3zm2.25 1.5h13.5M6 10.5v7.5m3-7.5v7.5m3-7.5v7.5m3-7.5v7.5M3 19.5h18" />
                  </svg>
                )}
                {espacio.tipo === "Sala" && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 7h1v1h-1V7zm3 0h1v1h-1V7zm-3 4h1v1h-1v-1zm3 0h1v1h-1v-1zm-3 4h1v1h-1v-1zm3 0h1v1h-1v-1z" />
                  </svg>
                )}
                {espacio.tipo === "Laboratorio" && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.5-3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v11.25A2.25 2.25 0 004.5 20.25z" />
                  </svg>
                )}
              </div>

              <h3 className="font-bold text-xl text-gray-900 mb-4 font-merriweather">
                {espacio.nombre}
              </h3>

              <div className="text-sm text-gray-700 space-y-1 mb-6 font-merriweather">
                <p><span className="font-medium">Tipo:</span> {espacio.tipo}</p>
                <p><span className="font-medium">Aforo máximo:</span> {espacio.aforo}</p>
                {espacio.computadoras && (
                  <p><span className="font-medium">Computadoras disponibles:</span> {espacio.computadoras}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 mb-6">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    espacio.estado === "Habilitado"
                      ? "bg-emerald-600"
                      : espacio.estado === "Inhabilitado"
                      ? "bg-red-800"
                      : "bg-amber-500"
                  }`}
                />
                <span className="text-sm font-medium text-gray-800">
                  {espacio.estado}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {espacio.tipo === "Laboratorio" && (
                <Button
                  text="Gestionar equipos"
                  variant="primary"
                  size="sm"
                  className="w-full bg-[#5c1d33] hover:bg-[#4a1c2d] text-white text-xs py-2 rounded"
                  onClick={() => navigate("/gestion-equipos")}
                />
              )}
              <Button
                text="Inhabilitar"
                variant="primary"
                size="sm"
                className="w-full bg-[#5c1d33] hover:bg-[#4a1c2d] text-white text-xs py-2 rounded"
                onClick={() => abrirModalEstado(espacio)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6">
        <Button
          text="Regresar"
          variant="primary"
          size="sm"
          className="bg-[#5c1d33] hover:bg-[#4a1c2d] text-white px-6 py-2 rounded"
          onClick={() => navigate(-1)} //modificar por el menu principal (pendiente)
        />
      </div>

      <Modal
        titulo="Estado del recinto"
        contenido=""
        mostrarModal={modalAbierto}
        cerrarModal={() => setModalAbierto(false)}
      >
        <div className="space-y-6">
          <div>
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md text-gray-800 font-merriweather focus:outline-none focus:ring-2 focus:ring-[#5c1d33]"
            >
              <option value="Habilitado">Habilitado</option>
              <option value="Inhabilitado">Inhabilitado</option>
              <option value="En mantenimiento">En mantenimiento</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button
              text="Cancelar"
              type="button"
              variant="outline"
              onClick={() => setModalAbierto(false)}
              className="bg-[#5c1d33] hover:bg-[#4a1c2d] text-black px-6 py-2 rounded"
            />

            <Button
              text="Aceptar"
              type="button"
              onClick={handleGuardarEstado}
              className="bg-[#5c1d33] hover:bg-[#4a1c2d] text-white px-6 py-2 rounded"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}

export default GestionEspacios;