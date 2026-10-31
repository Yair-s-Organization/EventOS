import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../../components/atoms/Button/Button";
import { EspacioCard } from "../../components/organisms/EspacioCard/EspacioCard";
import { Modal } from "../../components/molecules/Modal";

interface Espacio {
  idRecinto: number;
  nombre: string;
  tipo?: string;
  aforo: number;
  computadorasDisponibles?: number;
  idEstadoRecinto: number;
}

export function GestionEspacios() {
  const navigate = useNavigate();
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [espacioSeleccionado, setEspacioSeleccionado] = useState<Espacio | null>(null);

  const getToken = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    return usuario.token || localStorage.getItem("token") || "";
  };

  const fetchEspacios = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/espacios", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || "No se pudieron obtener los espacios."}`);
      }

      const data = await response.json();
      setEspacios(data);
    } catch (err: any) {
      setError(err.message || "Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspacios();
  }, []);

  const handlePreToggle = (espacio: Espacio) => {
    setEspacioSeleccionado(espacio);
    setModalAbierto(true);
  };

  const handleConfirmToggle = async () => {
    if (!espacioSeleccionado) return;
    const nuevoEstadoRecinto = espacioSeleccionado.idEstadoRecinto === 1 ? 2 : 1;

    try {
      const response = await fetch(`http://localhost:3000/api/espacios/${espacioSeleccionado.idRecinto}/estado`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ idEstadoRecinto: nuevoEstadoRecinto }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo actualizar el estado del recinto.");
      }

      setModalAbierto(false);
      setEspacioSeleccionado(null);
      await fetchEspacios();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isInhabilitando = espacioSeleccionado?.idEstadoRecinto === 1;

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

      {loading && <p className="text-sm text-gray-600">Cargando espacios...</p>}
      {error && <p className="text-sm text-eventos-error">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {!loading && espacios.map((espacio) => (
          <EspacioCard key={espacio.idRecinto} espacio={espacio} onToggleEstado={handlePreToggle} onGestionarEquipos={(id) => navigate(`/gestion-equipos/${id}`)}/>))}
      </div>

      <div className="flex justify-end pt-6">
        <Button text="Regresar" variant="primary" size="sm" className="px-6 py-2 rounded" onClick={() => navigate(-1)}/>
      </div>

      <Modal titulo={isInhabilitando ? "Inhabilitar espacio físico" : "Habilitar espacio físico"} contenido="" mostrarModal={modalAbierto} cerrarModal={() => setModalAbierto(false)}>
        <div className="space-y-4 font-merriweather text-sm text-gray-700">
          <p>
            {isInhabilitando 
              ? "¿Estas seguro de inhabilitar este espacio físico? Los eventos programados podrían verse afectados."
              : "El espacio volverá a estar disponible para la programación de eventos."}
          </p>
          <div className="flex justify-end space-x-3 pt-2">
            <Button text="Cancelar" variant="outline" type="button" onClick={() => setModalAbierto(false)} className="px-5 py-2 rounded-md transition-colors shadow"/>
            <Button text={isInhabilitando ? "Inhabilitar" : "Habilitar"} type="button" onClick={handleConfirmToggle} className={`px-5 py-2 rounded-md transition-colors shadow`}/>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default GestionEspacios;