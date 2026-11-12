import { useEffect, useState } from "react";
import Button from "../../components/atoms/Button/Button";
import { Table } from "../../components/organisms/Table/Table";
import type { Columna } from "../../components/organisms/Table/Table";
import { Modal } from "../../components/molecules/Modal";
import { TextArea } from "../../components/atoms/TextArea/TextArea";
import { FormField } from "../../components/molecules/FormField";
import { useNavigate } from "react-router";
import { SearchBar } from "../../components/molecules/SearchBar";
import { apiRequest } from "../../lib/apiClient";
import { formatearFechaDdMmAaaa } from "../../utils/fechaHorario";

type SolicitudesAprobadas = {
  idEvento: number;
  nombre: string;
  nombreSolicitante: string;
  fechaInicio: string | null;
  fechaFin: string | null;
};

const MAX_MOTIVO = 500;

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null;
}

function obtenerNumero(
  registro: Record<string, unknown>,
  campo: string,
): number {
  const valor = registro[campo];
  if (typeof valor !== "number") {
    throw new Error(
      `La respuesta no contiene un número válido para "${campo}".`,
    );
  }
  return valor;
}

function obtenerTexto(
  registro: Record<string, unknown>,
  campo: string,
): string {
  const valor = registro[campo];
  if (typeof valor !== "string") {
    throw new Error(
      `La respuesta no contiene un texto válido para "${campo}".`,
    );
  }
  return valor;
}

function convertirFecha(valor: unknown): string | null {
  if (valor === null) {
    return null;
  }
  if (!esRegistro(valor)) {
    throw new Error("La respuesta contiene una fecha de subevento inválida.");
  }

  const fecha = obtenerTexto(valor, "fecha");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    throw new Error("La respuesta contiene una fecha con formato inválido.");
  }
  return fecha;
}

function convertirSolicitud(valor: unknown): SolicitudesAprobadas {
  if (!esRegistro(valor)) {
    throw new Error("La respuesta contiene una solicitud inválida.");
  }
  if (!Array.isArray(valor.subEventos)) {
    throw new Error("La respuesta no contiene una lista válida de subeventos.");
  }

  const fechas = valor.subEventos
    .map((subevento: unknown) => {
      if (!esRegistro(subevento)) {
        throw new Error("La respuesta contiene un subevento inválido.");
      }
      return convertirFecha(subevento.fecha);
    })
    .filter((fecha: string | null): fecha is string => fecha !== null)
    .sort();

  const solicitante = valor.solicitante;
  let nombreSolicitante = "No disponible";

  if (solicitante !== null && solicitante !== undefined) {
    if (!esRegistro(solicitante)) {
      throw new Error("La respuesta contiene datos de solicitante inválidos.");
    }
    nombreSolicitante = obtenerTexto(solicitante, "nombreCompleto");
  }

  return {
    idEvento: obtenerNumero(valor, "idEvento"),
    nombre: obtenerTexto(valor, "nombre"),
    nombreSolicitante,
    fechaInicio: fechas[0] ?? null,
    fechaFin: fechas[fechas.length - 1] ?? null,
  };
}

function convertirSolicitudes(valor: unknown): SolicitudesAprobadas[] {
  if (!Array.isArray(valor)) {
    throw new Error(
      "La respuesta del servidor no contiene una lista de solicitudes.",
    );
  }
  return valor.map(convertirSolicitud);
}

function mostrarFecha(fecha: string | null): string {
  return formatearFechaDdMmAaaa(fecha, "No disponible");
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-MX");
}

export function SolicitudesAprobadas() {
  const [solicitudes, setSolicitudes] = useState<SolicitudesAprobadas[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<SolicitudesAprobadas | null>(null);
  const [motivo, setMotivo] = useState("");
  const [errorCancelacion, setErrorCancelacion] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const longitudMotivo = motivo.trim().length;
  const [mostrarModalCancelacion, setMostrarModalCancelacion] = useState(false);
  const [mostrarModalConfirmacion, setModalConfirmacion] = useState(false);
  const [mostrarModalExito, setModalExito] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
  const busquedaNormalizada = normalizarTexto(busqueda.trim());
  const solicitudesFiltradas = solicitudes.filter((solicitud) => {
    if (!busquedaNormalizada) {
      return true;
    }

    return [solicitud.nombre, solicitud.nombreSolicitante].some((texto) =>
      normalizarTexto(texto).includes(busquedaNormalizada),
    );
  });

  useEffect(() => {
    const controller = new AbortController();

    const cargarSolicitudes = async () => {
      setCargando(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Debes iniciar sesión para ver las solicitudes.");
        setCargando(false);
        return;
      }

      try {
        const respuesta = await apiRequest<unknown>(
          "/solicitudes?estado=Aprobado",
          {
            signal: controller.signal,
          },
        );
        setSolicitudes(convertirSolicitudes(respuesta));
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar las solicitudes.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    void cargarSolicitudes();
    return () => controller.abort();
  }, []);

  const cerrarModalCancelacion = () => {
    setMostrarModalCancelacion(false);
    setModalConfirmacion(false);
    setSolicitudSeleccionada(null);
    setMotivo("");
    setErrorCancelacion(null);
  };

  const abrirConfirmacionCancelacion = () => {
    if (!motivo.trim()) {
      setErrorCancelacion("El motivo de cancelación es obligatorio.");
      return;
    }

    setErrorCancelacion(null);
    setMostrarModalCancelacion(false);
    setModalConfirmacion(true);
  };

  const cerrarModalConfirmacion = () => {
    setModalConfirmacion(false);
    setMostrarModalCancelacion(true);
  };

  const confirmarCancelacion = async () => {
    if (!solicitudSeleccionada) return;

    if (!motivo.trim()) {
      setErrorCancelacion("El motivo de cancelación es obligatorio.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setErrorCancelacion("Debes iniciar sesión para cancelar el evento.");
      return;
    }

    setCancelando(true);
    setErrorCancelacion(null);

    try {
      await apiRequest(
        `/solicitudes/${solicitudSeleccionada.idEvento}/cancelar`,
        {
          method: "PATCH",
          body: JSON.stringify({ motivo: motivo.trim() }),
        },
      );

      const idCancelado = solicitudSeleccionada.idEvento;
      setSolicitudes((actuales) =>
        actuales.filter((solicitud) => solicitud.idEvento !== idCancelado),
      );
      cerrarModalCancelacion();
      setModalExito(true);
    } catch (error) {
      setErrorCancelacion(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al cancelar el evento.",
      );
      setMostrarModalCancelacion(true);
    } finally {
      setCancelando(false);
    }
  };

  const columnas: Columna<SolicitudesAprobadas>[] = [
    {
      id: "nombre",
      encabezado: "Nombre del evento",
      render: (solicitud) => solicitud.nombre,
      className: "min-w-[12rem] max-w-[18rem] px-4",
    },
    {
      id: "solicitante",
      encabezado: "Nombre del solicitante",
      render: (solicitud) => solicitud.nombreSolicitante,
      className: "min-w-[12rem] max-w-[12rem] px-4",
    },
    {
      id: "fechaInicio",
      encabezado: "Fecha inicio",
      render: (solicitud) => mostrarFecha(solicitud.fechaInicio),
      className: "min-w-[8rem] px-4 text-center",
    },
    {
      id: "fechaFin",
      encabezado: "Fecha Fin",
      render: (solicitud) => mostrarFecha(solicitud.fechaFin),
      className: "min-w-[8rem] px-4 text-center",
    },
    {
      id: "acciones",
      encabezado: "Acciones",
      className: "text-center",
      render: (solicitud) => {
        return (
          <div
            id="contenedorCeldaBotones"
            className="flex gap-2 justify-center">
            <Button
              text="Detalles"
              variant="primary"
              type="button"
              onClick={() =>
                navigate(`/detalles-solicitud/${solicitud.idEvento}`, {
                  state: { from: "aprobadas" },
                })
              }
            />
            <Button
              text="Cancelar"
              variant="danger"
              type="button"
              onClick={() => {
                setMotivo("");
                setErrorCancelacion(null);
                setSolicitudSeleccionada(solicitud);
                setMostrarModalCancelacion(true);
              }}
            />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <section className="space-y-5">
        <div id="contenedorSuperior" className="mx-auto flex justify-between">
          <div id="contenedorTitulo">
            <h1 className="font-merriweather text-[36px] font-bold">
              Solicitudes aprobadas
            </h1>
          </div>
          <div id="contenedor Filtrado">
            <SearchBar
              value={busqueda}
              texto="Buscar por nombre o solicitante"
              onChangeEvent={(e) => setBusqueda(e.target.value)}
              handle={(event) => event.preventDefault()}
            />
          </div>
        </div>
        {cargando && <p role="status">Cargando solicitudes...</p>}
        {error && <p role="alert">{error}</p>}
        {!cargando && !error && solicitudes.length === 0 && (
          <div
            id="contenederIcono"
            className="flex min-h-[50vh] flex-col items-center justify-center text-center space-y-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              className="lucide lucide-calendar preview-icon">
              <path d="M8 2v3" />
              <path d="M16 2v3" />
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
            </svg>
            <p className="merriweather text-[24px] font-semibold">
              Sin eventos aprobados
            </p>
            <p></p>
          </div>
        )}
        {!cargando &&
          !error &&
          solicitudes.length > 0 &&
          solicitudesFiltradas.length === 0 && (
            <div
              id="contenederIcono"
              className="flex min-h-[50vh] flex-col items-center justify-center text-center space-y-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                className="lucide lucide-x preview-icon">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
              <p className="merriweather text-[24px] font-semibold">
                Parece que no hay coincidencias
              </p>
              <p></p>
            </div>
          )}
        {!cargando && !error && solicitudesFiltradas.length > 0 && (
          <div
            id="contenedorTabla"
            className="rounded-md mx-auto w-full max-w-7xl overflow-x-auto shadow-md p-5 border border-gray-200 bg-white">
            <Table
              columnas={columnas}
              filas={solicitudesFiltradas}
              obtenerClave={(solicitud) => solicitud.idEvento}
              className="table-auto min-w-full text-left [&_tbody_tr]:h-20 [&_thead_tr]:h-[80px]"
            />
          </div>
        )}
        <Modal
          titulo="Cancelación de evento"
          contenido={`Evento: ${solicitudSeleccionada?.nombre ?? ""}.`}
          mostrarModal={mostrarModalCancelacion}
          cerrarModal={cerrarModalCancelacion}>
          <div id="conetenedorMotivo" className="flex flex-col gap-5">
            <FormField
              htmlFor="campoMotivo"
              errorMessage={
                longitudMotivo >= 500
                  ? "El motivo no debe ser mayor a 500 caracteres"
                  : longitudMotivo < 10 && longitudMotivo > 0
                    ? "El motivo de cancelación es muy corto"
                    : ""
              }>
              <TextArea
                id="campoMotivo"
                placeholder="Ingresa el motivo de cancelación"
                className="resize-none h-40"
                value={motivo}
                hasError={longitudMotivo >= 500}
                onChange={(event) => {
                  setMotivo(event.target.value);
                  setErrorCancelacion(null);
                }}
                maxLength={MAX_MOTIVO}
              />
            </FormField>
          </div>
          <div id="contenedorBotones" className="flex gap-2 justify-end">
            <Button
              text="Volver"
              variant="primary"
              disabled={cancelando}
              onClick={cerrarModalCancelacion}
            />
            <Button
              text="Cancelar evento"
              variant="danger"
              onClick={abrirConfirmacionCancelacion}
              disabled={longitudMotivo < 10}
            />
          </div>
        </Modal>
        {mostrarModalConfirmacion && (
          <Modal
            titulo="Confirmacion"
            contenido="¿Desea cancelar el evento?"
            mostrarModal={mostrarModalConfirmacion}
            cerrarModal={cerrarModalConfirmacion}>
            <div
              id="contendorBotonesConfirmacion"
              className="flex gap-2 justify-end">
              <Button
                text="Cancelar"
                variant="danger"
                disabled={cancelando}
                onClick={cerrarModalConfirmacion}
              />
              <Button
                text="Aceptar"
                variant="success"
                loading={cancelando}
                loadingText="Cancelando..."
                onClick={() => {
                  setModalConfirmacion(false);
                  void confirmarCancelacion();
                }}
              />
            </div>
          </Modal>
        )}
        {mostrarModalExito && (
          <Modal
            titulo="Operación exitosa"
            contenido="Se ha cancelado exitosamente el evento"
            mostrarModal={mostrarModalExito}
            cerrarModal={() => setModalExito(false)}>
            <div className="flex justify-end">
              <Button
                text="Aceptar"
                variant="primary"
                type="button"
                onClick={() => setModalExito(false)}
              />
            </div>
          </Modal>
        )}
      </section>
    </>
  );
}
