import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button } from "../../components/atoms/Button/Button";
import { Modal } from "../../components/molecules/Modal";
import { ListaEquiposTable } from "../admin/organism/ListaEquiposTable";

interface Equipo {
  idEstadoEquipo: number;
  numeroEquipo: number;
  estado: boolean;
  idRecinto: number;
}

export function GestionEquipos() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [equipoPendiente, setEquipoPendiente] = useState<Equipo | null>(null);

  const getToken = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    return usuario.token || localStorage.getItem("token") || "";
  };

  const fetchEquipos = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/espacios/${id}/equipos`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("No se pudieron cargar los equipos de este laboratorio.");
      }

      const data = await response.json();
      setEquipos(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, [id]);

  const totalEquipos = equipos.length;
  const equiposDisponibles = equipos.filter((e) => e.estado).length;
  const equiposFueraDeServicio = totalEquipos - equiposDisponibles;

  const handleToggleClick = (equipo: Equipo) => {
    setEquipoPendiente(equipo);
    setModalAbierto(true);
  };

  const handleConfirmarCambio = async () => {
    if (!equipoPendiente) return;

    const nuevoEstado = !equipoPendiente.estado;

    try {
      const response = await fetch(`http://localhost:3000/api/espacios/${id}/equipos/${equipoPendiente.idEstadoEquipo}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar el estado del equipo.");
      }

      await fetchEquipos();
      setModalAbierto(false);
      setEquipoPendiente(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 font-merriweather text-gray-800">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Mapa visual de inventario
        </h1>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">Laboratorio ID:</span> {id}
        </p>
      </div>

      {loading && <p className="text-sm text-gray-600">Cargando equipos...</p>}

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
            <Button text="Regresar" variant="primary" size="sm" className="px-6 py-2 rounded" onClick={() => navigate("/gestion-espacios")}/>
          </div>
        </div>

        <ListaEquiposTable equipos={equipos} onToggleEquipo={handleToggleClick}/>
      </div>

      <Modal titulo="Advertencia" contenido="" mostrarModal={modalAbierto} cerrarModal={() => setModalAbierto(false)}>
        <div className="space-y-6">
          <p className="text-sm text-gray-700 font-merriweather">
            ¿Estás seguro que quieres {equipoPendiente?.estado ? "inhabilitar" : "habilitar"} el Equipo {equipoPendiente?.numeroEquipo}?
          </p>

          <div className="flex items-center justify-end space-x-3">
            <Button text="Cancelar" type="button" variant="outline" onClick={() => setModalAbierto(false)}
              className="font-merriweather text-sm px-6 py-2.5 rounded-md transition-colors"
            />
            <Button text="Aceptar" type="button" onClick={handleConfirmarCambio}
              className="font-merriweather text-sm px-6 py-2.5 rounded-md transition-colors shadow"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default GestionEquipos;