import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type {
  EventoOrganizadorDetalle,
  PersonalLogisticaItem,
} from "@eventos/shared";
import { ArrowLeft } from "lucide-react";
import { FormField } from "../../../components/molecules/FormField";
import { Input } from "../../../components/atoms/Input/Input";
import { Button } from "../../../components/atoms/Button/Button";
import { TextLink } from "../../../components/atoms/TextLink/TextLink";
import { Modal } from "../../../components/molecules/Modal";
import { apiRequest } from "../../../lib/apiClient";

interface PersonalLogisticaCard {
  id: number;
  correo: string;
  estado?: "pendiente" | "registrado" | "no_registrado" | "invitado";
  error?: string;
  enviando?: boolean;
}

interface RespuestaAgregarLogistica {
  asignadoDirecto: boolean;
  invitacionEnviada?: boolean;
  mensaje: string;
}

const LIMITE_LOGISTICA = 10;

export function AgregarLogistica() {
  const { idEvento } = useParams();
  const navigate = useNavigate();

  const [nombreEvento, setNombreEvento] = useState("");
  const [tieneSubeventos, setTieneSubeventos] = useState(false);
  const [personalRegistrado, setPersonalRegistrado] = useState<
    PersonalLogisticaItem[]
  >([]);

  const [modalYaRegistrado, setModalYaRegistrado] = useState(false);
  const [cardParaRegistro, setCardParaRegistro] =
    useState<PersonalLogisticaCard | null>(null);
  const [enviandoInvitacion, setEnviandoInvitacion] = useState(false);
  const [modalResgistro, setModalRegistro] = useState(false);
  const [modalAdvertencia, setModalAdvertencia] = useState(false);
  const [cargandoEvento, setCargandoEvento] = useState(true);
  const [errorModal, setErrorModal] = useState<string | null>(null);
  const [modalExito, setModalExito] = useState(false);
  const [guardandoTodo, setGuardandoTodo] = useState(false);

  const [personalList, setPersonalList] = useState<PersonalLogisticaCard[]>([
    { id: 1, correo: "", estado: "pendiente" },
  ]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const cargarDetalleEvento = async () => {
      if (!idEvento || !/^\d+$/.test(idEvento)) {
        setErrorModal("El ID del evento no es válido.");
        setCargandoEvento(false);
        return;
      }

      try {
        setCargandoEvento(true);
        const detalle = await apiRequest<EventoOrganizadorDetalle>(
          `eventos/${idEvento}/detalle-organizador`,
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;

        setNombreEvento(detalle.nombre);
        setPersonalRegistrado(detalle.personalLogistica ?? []);
        setTieneSubeventos((detalle.subEventos?.length ?? 0) > 1);
      } catch (err) {
        if (!controller.signal.aborted) {
          setErrorModal(
            err instanceof Error
              ? err.message
              : "No se pudo cargar la información del evento.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargandoEvento(false);
        }
      }
    };

    void cargarDetalleEvento();
    return () => controller.abort();
  }, [idEvento]);

  const agregadosEnTarjetas = personalList.filter(
    (item) => item.estado === "registrado" || item.estado === "invitado",
  ).length;
  const totalPersonalActual = personalRegistrado.length + agregadosEnTarjetas;
  const tarjetasDisponibles = LIMITE_LOGISTICA - personalRegistrado.length;

  const handleAgregarCard = () => {
    if (personalList.length >= tarjetasDisponibles) {
      setErrorModal(
        "No es posible registrar más personal de logística. El evento ha alcanzado el límite máximo de 10 integrantes.",
      );
      return;
    }
    setPersonalList((prev) => [
      ...prev,
      { id: Date.now(), correo: "", estado: "pendiente" },
    ]);
  };

  const handleActualizarCorreo = (id: number, correo: string) => {
    setPersonalList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, correo, error: undefined, estado: "pendiente" }
          : item,
      ),
    );
  };

  const handleEliminarCard = (id: number) => {
    if (deletingId !== null || personalList.length <= 1) return;
    setDeletingId(id);

    timeoutRef.current = setTimeout(() => {
      setPersonalList((prev) => prev.filter((item) => item.id !== id));
      setDeletingId(null);
    }, 350);
  };

  const enviarCorreoLogistica = async (
    card: PersonalLogisticaCard,
  ): Promise<boolean> => {
    const correoLimpio = card.correo.trim().toLowerCase();

    if (!correoLimpio) {
      setPersonalList((prev) =>
        prev.map((item) =>
          item.id === card.id
            ? { ...item, error: "El correo electrónico es obligatorio." }
            : item,
        ),
      );
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      setPersonalList((prev) =>
        prev.map((item) =>
          item.id === card.id
            ? { ...item, error: "El formato del correo eléctronico es válido." }
            : item,
        ),
      );
      return false;
    }

    if (
      personalRegistrado.some(
        (p) => p.correo.trim().toLowerCase() === correoLimpio,
      )
    ) {
      setPersonalList((prev) =>
        prev.map((item) =>
          item.id === card.id
            ? {
                ...item,
                error:
                  "El personal de logística ya se encuentra asignado al evento seleccionado.",
              }
            : item,
        ),
      );
      return false;
    }

    setPersonalList((prev) =>
      prev.map((item) =>
        item.id === card.id
          ? { ...item, enviando: true, error: undefined }
          : item,
      ),
    );

    try {
      const respuesta = await apiRequest<RespuestaAgregarLogistica>(
        `eventos/${idEvento}/personal-logistica`,
        {
          method: "POST",
          body: JSON.stringify({ correo: correoLimpio, soloVerificar: true }),
        },
      );

      setPersonalList((prev) =>
        prev.map((item) =>
          item.id === card.id
            ? {
                ...item,
                enviando: false,
                estado: respuesta.asignadoDirecto
                  ? "registrado"
                  : "no_registrado",
              }
            : item,
        ),
      );

      if (respuesta.asignadoDirecto) {
        setModalYaRegistrado(true);
      }

      return true;
    } catch (err) {
      const mensajeError =
        err instanceof Error
          ? err.message
          : "No se pudo agregar el personal de logística.";
      setPersonalList((prev) =>
        prev.map((item) =>
          item.id === card.id
            ? { ...item, enviando: false, error: mensajeError }
            : item,
        ),
      );
      return false;
    }
  };

  const confirmarInvitacionTemporal = async () => {
    if (!cardParaRegistro) return;
    const correoLimpio = cardParaRegistro.correo.trim().toLowerCase();

    try {
      setEnviandoInvitacion(true);
      await apiRequest<RespuestaAgregarLogistica>(
        `eventos/${idEvento}/personal-logistica`,
        {
          method: "POST",
          body: JSON.stringify({ correo: correoLimpio }),
        },
      );

      setPersonalList((prev) =>
        prev.map((item) =>
          item.id === cardParaRegistro.id
            ? { ...item, estado: "invitado" }
            : item,
        ),
      );
      setModalAdvertencia(false);
      setModalRegistro(true);
    } catch (err) {
      setModalAdvertencia(false);
      setErrorModal(
        err instanceof Error
          ? err.message
          : "No se pudo enviar la invitación de logística.",
      );
    } finally {
      setEnviandoInvitacion(false);
    }
  };

  const handleGuardarTodo = async () => {
    const pendientes = personalList.filter(
      (item) =>
        item.estado !== "registrado" &&
        item.estado !== "no_registrado" &&
        item.estado !== "invitado" &&
        item.correo.trim() !== "",
    );

    if (pendientes.length === 0) {
      if (agregadosEnTarjetas > 0) {
        setModalExito(true);
        return;
      }

      const primera = personalList[0];
      if (primera && primera.correo.trim() !== "") {
        await enviarCorreoLogistica(primera);
      } else {
        navigate(rutaRegreso);
      }
      return;
    }

    setGuardandoTodo(true);
    let todosExitosos = true;

    for (const card of pendientes) {
      const exito = await enviarCorreoLogistica(card);
      if (!exito) {
        todosExitosos = false;
      }
    }

    setGuardandoTodo(false);

    if (todosExitosos) {
      setModalExito(true);
    }
  };

  const rutaRegreso = tieneSubeventos
    ? `/organizador/administrar-evento-subeventos/${idEvento}`
    : `/organizador/administrar-evento/${idEvento}`;

  if (cargandoEvento) {
    return (
      <p role="status" className="py-6 text-gray-600">
        Cargando información del evento...
      </p>
    );
  }

  return (
    <section id="seccionLogistica" className="space-y-10">
      <button
        type="button"
        onClick={() => navigate(rutaRegreso)}
        className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-900 hover:text-eventos-primary"
      >
        <ArrowLeft size={20} />
        <span>Volver</span>
      </button>

      <div id="contenedorTitulos" className="space-y-5">
        <h1 className="font-merriweather text-4xl font-bold">
          Agregar personal de logística
        </h1>
        <h2 className="font-merriweather text-[20px]">
          Agrega el correo del personal de logística para el control de acceso
        </h2>
        <div
          id="contenedorSubtitulo"
          className="flex flex-col gap-2 sm:flex-row sm:justify-between"
        >
          <span className="font-merriweather text-[16px]">
            <strong>Evento:</strong> {nombreEvento || "No disponible"}
          </span>
          <span className="font-merriweather text-[16px]">
            <strong>Número de personal de logística agregado:</strong>{" "}
            {totalPersonalActual} / {LIMITE_LOGISTICA}
          </span>
        </div>
      </div>

      <section className="flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-4">
          {personalList.map((personal, index) => {
            const isDeleting = deletingId === personal.id;
            const yaProcesado =
              personal.estado === "registrado" ||
              personal.estado === "no_registrado";

            return (
              <div
                key={personal.id}
                className={`grid transition-all duration-300 ease-in-out motion-reduce:transition-none ${
                  isDeleting
                    ? "grid-rows-[0fr] opacity-0 scale-[0.98] -translate-y-2 pointer-events-none !mt-0"
                    : "grid-rows-[1fr] opacity-100 scale-100 translate-y-0"
                }`}
              >
                <div className="min-h-0">
                  <div
                    id={`contenedorCardAgregar-${personal.id}`}
                    className="w-full space-y-3 bg-eventos-primary-light p-6 rounded-md shadow-md"
                  >
                    <div id="contenedorInput">
                      <FormField
                        label="Correo electrónico"
                        htmlFor={`campoCorreo-${index}`}
                        errorMessage={personal.error}
                      >
                        <Input
                          id={`campoCorreo-${index}`}
                          type="email"
                          value={personal.correo}
                          disabled={
                            yaProcesado ||
                            personal.enviando ||
                            personal.estado === "invitado"
                          }
                          hasError={Boolean(personal.error)}
                          onChange={(e) =>
                            handleActualizarCorreo(personal.id, e.target.value)
                          }
                          maxLength={150}
                          placeholder="johndoe@alumno.ipn.mx"
                        />
                      </FormField>
                    </div>

                    {personal.estado === "registrado" && (
                      <div>
                        <Modal
                          mostrarModal={modalYaRegistrado}
                          titulo="Usuario asignado"
                          contenido="El usuario ha sido agregado éxitosamente como personal de logística"
                          cerrarModal={() => setModalYaRegistrado(false)}
                        >
                          <div>
                            <Button
                              text="Aceptar"
                              variant="primary"
                              type="button"
                              onClick={() => setModalYaRegistrado(false)}
                            />
                          </div>
                        </Modal>

                        <p className="border border-green-500 bg-green-200 p-3 rounded-md shadow-md text-sm text-green-950">
                          El usuario ya se encuentra registrado en el sistema y
                          fue asignado al evento.
                        </p>
                      </div>
                    )}

                    {personal.estado === "no_registrado" && (
                      <div
                        id="contenedorAdvertencia"
                        className="flex flex-wrap items-center gap-2 border border-amber-300 bg-amber-100 p-3 rounded-md shadow-md text-sm text-amber-950"
                      >
                        <p>El usuario aún no está registrado</p>
                        <TextLink
                          className="font-merriweather text-sm font-semibold underline"
                          to="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCardParaRegistro(personal);
                            setModalAdvertencia(true);
                          }}
                        >
                          Registrar aquí
                        </TextLink>
                      </div>
                    )}

                    {personal.estado === "invitado" && (
                      <p className="border border-green-500 bg-green-200 p-3 rounded-md shadow-md text-sm text-green-950">
                        Invitación temporal enviada por correo electrónico.
                      </p>
                    )}

                    <div
                      id="contenedorBotones"
                      className="flex justify-end gap-3"
                    >
                      {personalList.length > 1 && !isDeleting && (
                        <Button
                          text="Eliminar"
                          variant="danger"
                          type="button"
                          disabled={personal.enviando}
                          onClick={() => handleEliminarCard(personal.id)}
                        />
                      )}

                      <Button
                        text={personal.enviando ? "Verificando..." : "Agregar"}
                        variant="primary"
                        type="button"
                        disabled={
                          personal.enviando || personal.estado === "invitado"
                        }
                        onClick={() => void enviarCorreoLogistica(personal)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {modalAdvertencia && (
            <Modal
              mostrarModal={modalAdvertencia}
              titulo="Advertencia"
              contenido=""
              cerrarModal={() => setModalAdvertencia(false)}
            >
              <p>
                El correo <strong>{cardParaRegistro?.correo}</strong> tendrá un
                permiso de acceso temporal a Event-OS hasta que su evento
                finalice, después de eso su acceso a la plataforma caducara.
              </p>
              <div
                id="contenedorBotonesRegistro"
                className="flex justify-end gap-3"
              >
                <Button
                  text="Volver"
                  variant="secondary"
                  type="button"
                  disabled={enviandoInvitacion}
                  onClick={() => setModalAdvertencia(false)}
                />
                <Button
                  text={enviandoInvitacion ? "Enviando..." : "Aceptar"}
                  variant="success"
                  type="button"
                  disabled={enviandoInvitacion}
                  onClick={() => void confirmarInvitacionTemporal()}
                />
              </div>
            </Modal>
          )}

          {modalResgistro && (
            <Modal
              mostrarModal={modalResgistro}
              titulo="Activación de acceso"
              contenido="El usuario ha sido registrado exitosamente de forma temporal"
              cerrarModal={() => setModalRegistro(false)}
            >
              <p>
                Se envió un correo electrónico a{" "}
                <strong>{cardParaRegistro?.correo}</strong>, con un token de
                acceso a la plataforma.
              </p>
              <div
                id="contenedorBotonesRegistro"
                className="flex justify-end gap-3"
              >
                <Button
                  text="Aceptar"
                  variant="success"
                  type="button"
                  onClick={() => {
                    setModalRegistro(false);
                  }}
                />
              </div>
            </Modal>
          )}

          <div id="contenedorBotonPersonal" className="flex justify-end">
            <Button
              text="Agregar otro personal"
              variant="primary"
              type="button"
              disabled={
                personalList.length >= tarjetasDisponibles ||
                totalPersonalActual >= LIMITE_LOGISTICA
              }
              onClick={handleAgregarCard}
            />
          </div>
        </div>
      </section>

      <div>
        <Button
          text={guardandoTodo ? "Guardando..." : "Guardar"}
          variant="primary"
          type="button"
          disabled={guardandoTodo}
          onClick={() => void handleGuardarTodo()}
        />
      </div>

      {errorModal && (
        <Modal
          mostrarModal={Boolean(errorModal)}
          titulo="Error"
          contenido={errorModal}
          cerrarModal={() => setErrorModal(null)}
        >
          <div className="flex justify-end">
            <Button
              text="Cerrar"
              variant="primary"
              type="button"
              onClick={() => setErrorModal(null)}
            />
          </div>
        </Modal>
      )}

      {modalExito && (
        <Modal
          mostrarModal={modalExito}
          titulo="Operación exitosa"
          contenido="El personal de logística se procesó correctamente."
          cerrarModal={() => navigate(rutaRegreso)}
        >
          <div className="flex justify-end">
            <Button
              text="Aceptar"
              variant="primary"
              type="button"
              onClick={() => navigate(rutaRegreso)}
            />
          </div>
        </Modal>
      )}
    </section>
  );
}
