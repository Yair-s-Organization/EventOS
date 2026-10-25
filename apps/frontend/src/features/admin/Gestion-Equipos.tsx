import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/atoms/Button/Button";
import { Modal } from "../../components/molecules/Modal";

interface Equipo {
  id: number;
  nombre: string;
  disponible: boolean;
}

export function GestionEquipos() {
  const navigate = useNavigate();

  // Lista simulada de equipos
  const [equipos, setEquipos] = useState<Equipo[]>([
    { id: 1, nombre: "Equipo 1", disponible: true },
    { id: 2, nombre: "Equipo 2", disponible: true },
    { id: 3, nombre: "Equipo 3", disponible: true },
    { id: 4, nombre: "Equipo 4", disponible: true },
    { id: 5, nombre: "Equipo 5", disponible: true },
    { id: 6, nombre: "Equipo 6", disponible: true },
    { id: 7, nombre: "Equipo 7", disponible: true },
    { id: 8, nombre: "Equipo 8", disponible: true },
    { id: 9, nombre: "Equipo 9", disponible: true },
    { id: 10, nombre: "Equipo 10", disponible: true },
    { id: 11, nombre: "Equipo 11", disponible: true },
    { id: 12, nombre: "Equipo 12", disponible: true },
    { id: 13, nombre: "Equipo 13", disponible: true },
    { id: 14, nombre: "Equipo 14", disponible: true },
  ]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [equipoPendiente, setEquipoPendiente] = useState<Equipo | null>(null);

  const totalEquipos = equipos.length;
  const equiposDisponibles = equipos.filter((e) => e.disponible).length;
  const equiposFueraDeServicio = totalEquipos - equiposDisponibles;

  const handleToggleClick = (equipo: Equipo) => {
    setEquipoPendiente(equipo);
    setModalAbierto(true);
  };

  const handleConfirmarCambio = () => {
    if (equipoPendiente) {
      setEquipos((prev) =>
        prev.map((eq) =>
          eq.id === equipoPendiente.id
            ? { ...eq, disponible: !eq.disponible }
            : eq
        )
      );
    }
    setModalAbierto(false);
    setEquipoPendiente(null);
  };

  return (
    <div className="space-y-6 font-merriweather text-gray-800">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Mapa visual de inventario
        </h1>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Laboratorio:</span> Laboratorio de sistemas 1
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-800">
            Selecciona el equipo de cómputo
          </p>

          <div className="bg-white p-5 rounded-md border border-gray-300 shadow-sm space-y-2 text-sm font-merriweather">
            <p><span className="font-semibold">Total de equipos:</span> {totalEquipos}</p>
            <p><span className="font-semibold">Equipos disponibles:</span> {equiposDisponibles}</p>
            <p><span className="font-semibold">Equipos fuera de servicio:</span> {equiposFueraDeServicio}</p>
          </div>

          <div className="pt-2">
            <Button
              text="Regresar"
              variant="primary"
              size="sm"
              className="bg-[#5c1d33] hover:bg-[#4a1c2d] text-white px-6 py-2 rounded"
              onClick={() => navigate("/gestion-espacios")}
            />
          </div>
        </div>

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
              <div
                key={equipo.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 max-w-md"
              >
                <span className="text-sm font-medium text-gray-800 w-32">
                  {equipo.nombre}
                </span>

                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-600">Inhabilitar</span>
                  
                  <button
                    type="button"
                    onClick={() => handleToggleClick(equipo)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      !equipo.disponible ? "bg-[#5c1d33]" : "bg-gray-300"
                    }`}
                    role="switch"
                    aria-checked={!equipo.disponible}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        !equipo.disponible ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        titulo="Advertencia"
        contenido=""
        mostrarModal={modalAbierto}
        cerrarModal={() => setModalAbierto(false)}
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-700 font-merriweather">
            ¿Estás seguro que quieres {equipoPendiente?.disponible ? "inhabilitar" : "habilitar"} al {equipoPendiente?.nombre.toLowerCase()}?
          </p>

          <div className="flex items-center justify-end space-x-3">
            <Button
              text="Cancelar"
              type="button"
              onClick={() => setModalAbierto(false)}
              className="bg-[#5c1d33] hover:bg-[#4a1c2d] text-white font-merriweather text-sm px-6 py-2.5 rounded-md transition-colors shadow"
            />
            <Button
              text="Aceptar"
              type="button"
              onClick={handleConfirmarCambio}
              className="bg-[#5c1d33] hover:bg-[#4a1c2d] text-white font-merriweather text-sm px-6 py-2.5 rounded-md transition-colors shadow"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
}

export default GestionEquipos;