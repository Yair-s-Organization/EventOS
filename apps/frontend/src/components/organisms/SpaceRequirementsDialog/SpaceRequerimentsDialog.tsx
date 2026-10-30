import { useEffect, useState } from "react";
import Badge from "../../atoms/Badge/Badge";
import Button from "../../atoms/Button/Button";
import { Modal } from "../../molecules/Modal";
import { Table } from "../Table/Table";
import { Columna } from "../Table/Table";

export interface SpaceRequerimentsDialogProps {
  mostrar: boolean;
  laboratorio: string;
  id: number;
  cerrar: () => void;
}

type Equipo = {
  numeroEquipo: number;
  estado: boolean;
};

function esEquipo(valor: unknown): valor is Equipo {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "numeroEquipo" in valor &&
    typeof valor.numeroEquipo === "number" &&
    "estado" in valor &&
    typeof valor.estado === "boolean"
  );
}

function convertirEquipos(valor: unknown): Equipo[] {
  if (!Array.isArray(valor)) {
    throw new Error("La respuesta no contiene una lista de equipos.");
  }

  return valor.map((equipo: unknown) => {
    if (!esEquipo(equipo)) {
      throw new Error("La respuesta contiene un equipo con formato inválido.");
    }
    return equipo;
  });
}

export function SpaceRequerimentsDialog({
  mostrar,
  cerrar,
  laboratorio,
  id,
}: SpaceRequerimentsDialogProps) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mostrar) return;

    const controller = new AbortController();

    const cargarEquipos = async () => {
      setCargando(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Sesión no iniciada");
        setCargando(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3000/api/espacios/${id}/equipos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          throw new Error(
            `No se pudieron cargar las solicitudes (HTTP ${response.status}).`,
          );
        }
        const respuesta: unknown = await response.json();
        setEquipos(convertirEquipos(respuesta));
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar los equipos.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };
    void cargarEquipos();
    return () => controller.abort();
  }, [mostrar, id]);

  const columnas: Columna<Equipo>[] = [
    {
      id: "equipo",
      encabezado: "Numero de equipo",
      render: (equipo) => equipo.numeroEquipo,
    },
    {
      id: "estado",
      encabezado: "Estado",
      render: (equipo) => {
        return equipo.estado === true ? (
          <Badge variant="success">Habilitado</Badge>
        ) : (
          <Badge variant="warning">Inhabilitado</Badge>
        );
      },
    },
  ];

  const equiposHabilitados = equipos.filter((equipo) => equipo.estado).length;
  const equiposDeshabilitados = equipos.filter(
    (equipo) => !equipo.estado,
  ).length;

  return (
    <Modal
      titulo="Detalles del espacio solicitado"
      contenido={laboratorio}
      mostrarModal={mostrar}
      cerrarModal={cerrar}
      ancho="amplio">
      {cargando && <p role="status">Cargando equipos...</p>}
      {error && <p role="alert">{error}</p>}
      {!cargando && !error && equipos.length === 0 && (
        <p>Error: no hay equipos disponibles</p>
      )}
      {!cargando && !error && equipos.length > 0 && (
        <div>
          <div
            id="contenedorModal"
            className="grid grid-cols-[2fr_3fr] gap-5 items-start">
            <div id="contendorInformacion" className="">
              <p>Total de equipos: {equipos.length}</p>
              <p>Equipos habilitados: {equiposHabilitados} </p>
              <p>Equipos deshabilitados: {equiposDeshabilitados}</p>
            </div>
            <div id="contenedorTabla" className="min-w-0 overflow-x-auto">
              <Table
                columnas={columnas}
                filas={equipos}
                obtenerClave={(equipo) => equipo.numeroEquipo}
                className="w-full min-w-[300px] table-fixed text-left text-sm [&_thead_tr]:h-8 [&_tbody_tr]:h-10 divide-y [&_th]:align-top [&_th]:px-2 [&_td]:px-2 [&_td]:py-2"
              />
            </div>
          </div>
          <div id="contenedorBoton" className="flex justify-end">
            <Button variant="primary" text="Salir" onClick={cerrar}></Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
