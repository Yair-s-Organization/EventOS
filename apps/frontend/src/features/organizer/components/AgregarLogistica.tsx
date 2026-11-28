import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
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
import { PageHeader } from "../../../components/organisms/PageHeader/PageHeader";

type EstadoTarjeta = "pendiente" | "registrado" | "no_registrado" | "invitado";

interface PersonalLogisticaCard {
  id: number;
  correo: string;
  estado?: EstadoTarjeta;
  error?: string;
  enviando?: boolean;
}

interface RespuestaAgregarLogistica {
  asignadoDirecto: boolean;
  invitacionEnviada?: boolean;
  mensaje: string;
}

const LIMITE_LOGISTICA = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function AgregarLogistica() {
  const { idEvento } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;

  const [nombreEvento, setNombreEvento] = useState("");
  const [tieneSubeventos, setTieneSubeventos] = useState(false);
  const [personalRegistrado, setPersonalRegistrado] = useState<
    PersonalLogisticaItem[]
  >([]);

  const [cardParaRegistro, setCardParaRegistro] =
    useState<PersonalLogisticaCard | null>(null);
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

  const actualizarTarjeta = (
    id: number,
    patch: Partial<PersonalLogisticaCard>,
  ) => {
    setPersonalList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

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
    actualizarTarjeta(id, {
      correo,
      error: undefined,
      estado: "pendiente",
    });
  };

  const handleEliminarCard = (id: number) => {
    if (deletingId !== null || personalList.length <= 1 || guardandoTodo) {
      return;
    }
    setDeletingId(id);

    timeoutRef.current = setTimeout(() => {
      setPersonalList((prev) => prev.filter((item) => item.id !== id));
      setDeletingId(null);
    }, 350);
  };

  const prevalidarTarjeta = async (
    card: PersonalLogisticaCard,
  ): Promise<"registrado" | "no_registrado" | "error"> => {
    const correoLimpio = card.correo.trim().toLowerCase();

    if (!correoLimpio) {
      actualizarTarjeta(card.id, {
        error: "El correo electrónico es obligatorio.",
      });
      return "error";
    }

    if (!EMAIL_REGEX.test(correoLimpio)) {
      actualizarTarjeta(card.id, {
        error: "Advertencia: Ingrese un correo válido.",
      });
      return "error";
    }

    if (
      personalRegistrado.some(
        (p) => p.correo.trim().toLowerCase() === correoLimpio,
      )
    ) {
      actualizarTarjeta(card.id, {
        error:
          "El personal de logística ya se encuentra asignado al evento seleccionado.",
      });
      return "error";
    }

    if (
      personalList.some(
        (item) =>
          item.id !== card.id &&
          item.correo.trim().toLowerCase() === correoLimpio,
      )
    ) {
      actualizarTarjeta(card.id, {
        error: "Este correo ya se encuentra ingresado en otra tarjeta.",
      });
      return "error";
    }

    actualizarTarjeta(card.id, { enviando: true, error: undefined });

    try {
      const respuesta = await apiRequest<RespuestaAgregarLogistica>(
        `eventos/${idEvento}/personal-logistica`,
        {
          method: "POST",
          body: JSON.stringify({ correo: correoLimpio, soloVerificar: true }),
        },
      );

      const nuevoEstado: EstadoTarjeta = respuesta.asignadoDirecto
        ? "registrado"
        : "no_registrado";

      actualizarTarjeta(card.id, {
        enviando: false,
        estado: nuevoEstado,
      });

      return nuevoEstado;
    } catch (err) {
      const mensajeError =
        err instanceof Error
          ? err.message
          : "No se pudo verificar el personal de logística.";
      actualizarTarjeta(card.id, {
        enviando: false,
        error: mensajeError,
      });
      return "error";
    }
  };

  const confirmarInvitacionTemporal = () => {
    if (!cardParaRegistro) return;

    actualizarTarjeta(cardParaRegistro.id, {
      estado: "invitado",
      error: undefined,
    });
    setModalAdvertencia(false);
    setCardParaRegistro(null);
  };

  const handleGuardarTodo = async () => {
    const cardsConCorreo = personalList.filter(
      (item) => item.correo.trim() !== "",
    );

    if (cardsConCorreo.length === 0) {
      navigate(rutaRegreso);
      return;
    }

    const correosVistos = new Set<string>();
    let hayDuplicados = false;
    for (const card of cardsConCorreo) {
      const correoLimpio = card.correo.trim().toLowerCase();
      if (correosVistos.has(correoLimpio)) {
        actualizarTarjeta(card.id, {
          error: "Este correo ya se encuentra ingresado en otra tarjeta.",
        });
        hayDuplicados = true;
      } else {
        correosVistos.add(correoLimpio);
      }
    }
    if (hayDuplicados) return;

    setGuardandoTodo(true);

    const estadosResueltos = new Map<number, EstadoTarjeta | "error">();
    for (const card of cardsConCorreo) {
      if (
        !card.error &&
        (card.estado === "registrado" ||
          card.estado === "invitado" ||
          card.estado === "no_registrado")
      ) {
        estadosResueltos.set(card.id, card.estado);
        continue;
      }

      const resultado = await prevalidarTarjeta(card);
      estadosResueltos.set(card.id, resultado);
    }

    const huboErroresPrevalidacion = Array.from(estadosResueltos.values()).some(
      (estado) => estado === "error",
    );
    if (huboErroresPrevalidacion) {
      setGuardandoTodo(false);
      return;
    }

    const primeraSinConfirmar = cardsConCorreo.find(
      (card) => estadosResueltos.get(card.id) === "no_registrado",
    );
    if (primeraSinConfirmar) {
      setCardParaRegistro(primeraSinConfirmar);
      setModalAdvertencia(true);
      setGuardandoTodo(false);
      return;
    }

    const idsGuardados: number[] = [];
    let huboErrorEnvio = false;

    for (const card of cardsConCorreo) {
      const correoLimpio = card.correo.trim().toLowerCase();
      actualizarTarjeta(card.id, { enviando: true, error: undefined });

      try {
        await apiRequest<RespuestaAgregarLogistica>(
          `eventos/${idEvento}/personal-logistica`,
          {
            method: "POST",
            body: JSON.stringify({
              correo: correoLimpio,
              soloVerificar: false,
            }),
          },
        );
        idsGuardados.push(card.id);
        actualizarTarjeta(card.id, { enviando: false });
      } catch (err) {
        huboErrorEnvio = true;
        const mensajeError =
          err instanceof Error
            ? err.message
            : "No se pudo guardar el personal de logística.";
        actualizarTarjeta(card.id, {
          enviando: false,
          error: mensajeError,
        });
      }
    }

    if (huboErrorEnvio) {
      if (idsGuardados.length > 0) {
        setPersonalList((prev) =>
          prev.filter((item) => !idsGuardados.includes(item.id)),
        );
        try {
          const detalle = await apiRequest<EventoOrganizadorDetalle>(
            `eventos/${idEvento}/detalle-organizador`,
          );
          setPersonalRegistrado(detalle.personalLogistica ?? []);
        } catch {
          // Si falla la recarga, el usuario conserva en pantalla las tarjetas con error
        }
      }
      setGuardandoTodo(false);
      return;
    }

    setGuardandoTodo(false);
    setModalExito(true);
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

  const ruta =
    returnTo ??
    (tieneSubeventos
      ? `/organizador/editar-evento-subeventos/${idEvento}`
      : `/organizador/editar-evento/${idEvento}`);

  return (
    <section id="seccionLogistica" className="space-y-10">
      <div id="contenedorTitulos" className="space-y-4 sm:space-y-5">
        <PageHeader
          title="Agregar personal de logística"
          back={{ to: ruta, label: "Volver a edición de mi evento" }}
        />
        <h2 className="font-merriweather text-sm lg:text-[16px]">
          Agrega el correo del personal de logística para el control de acceso
        </h2>
        <div
          id="contenedorSubtitulo"
          className="flex flex-col gap-2 sm:flex-row sm:justify-between"
        >
          <span className="font-merriweather text-sm lg:text-[16px]">
            <strong>Evento:</strong> {nombreEvento || "No disponible"}
          </span>
          <span className="font-merriweather text-sm lg:text-[16px]">
            <strong>Número de personal de logística agregado:</strong>{" "}
            {totalPersonalActual} / {LIMITE_LOGISTICA}
          </span>
        </div>
      </div>

      <section className="flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-4">
          {personalList.map((personal, index) => {
            const isDeleting = deletingId === personal.id;
            const bloqueadoAgregar =
              Boolean(personal.enviando) ||
              guardandoTodo ||
              personal.estado === "registrado" ||
              personal.estado === "invitado";

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
                    className="w-full space-y-3 bg-white border border-gray-200 p-6 rounded-md shadow-md"
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
                          disabled={Boolean(personal.enviando) || guardandoTodo}
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
                      <p className="border border-green-500 bg-green-200 p-3 rounded-md shadow-md text-sm text-green-950">
                        El usuario ya se encuentra registrado en el sistema.
                        Presiona &ldquo;Guardar&rdquo; para asignarlo y enviar
                        la notificación.
                      </p>
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
                        Invitación temporal preparada. Se enviará por correo
                        electrónico al presionar &ldquo;Guardar&rdquo;.
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
                          disabled={Boolean(personal.enviando) || guardandoTodo}
                          onClick={() => handleEliminarCard(personal.id)}
                        />
                      )}

                      <Button
                        text={personal.enviando ? "Verificando..." : "Agregar"}
                        variant="primary"
                        type="button"
                        disabled={bloqueadoAgregar}
                        onClick={() => void prevalidarTarjeta(personal)}
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
              titulo="Enviar invitación de registro"
              contenido=""
              cerrarModal={() => {
                setModalAdvertencia(false);
                setCardParaRegistro(null);
              }}
            >
              <p>
                El correo <strong>{cardParaRegistro?.correo}</strong> aún no
                tiene una cuenta en EventOS. Se le enviará una invitación por
                correo (vigente por 48 horas) al guardar los cambios para que
                complete su registro y quede asignado como Personal de Logística
                de este evento. Sus permisos de logística aplicarán únicamente
                durante este evento.
              </p>
              <div
                id="contenedorBotonesRegistro"
                className="flex justify-end gap-3"
              >
                <Button
                  text="Volver"
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setModalAdvertencia(false);
                    setCardParaRegistro(null);
                  }}
                />
                <Button
                  text="Aceptar"
                  variant="success"
                  type="button"
                  onClick={confirmarInvitacionTemporal}
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
                totalPersonalActual >= LIMITE_LOGISTICA ||
                guardandoTodo
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
