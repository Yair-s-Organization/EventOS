import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import {
  AlcanceEvento,
  EstadoEvento,
  type ActualizarInfoGeneralPayload,
  type EventoOrganizadorDetalle,
  type ModificarLogisticaPayload,
  type PersonalLogisticaItem,
  type InvitadoEventoItem,
  type Recinto,
} from "@eventos/shared";
import { ArrowLeft, Pencil } from "lucide-react";
import { Input } from "../../components/atoms/Input/Input";
import { TextArea } from "../../components/atoms/TextArea/TextArea";
import { Table } from "../../components/organisms/Table/Table";
import type { Columna } from "../../components/organisms/Table/Table";
import Button from "../../components/atoms/Button/Button";
import { EditLogisticsSection } from "./organism/EditLogisticsSection";
import type {
  EditLogisticsErrors,
  EditLogisticsValues,
  HorarioOcupado,
} from "./organism/EditLogisticsSection";
import { apiRequest } from "../../lib/apiClient";
import { EventBanner } from "../event-details/components/molecules/EventBanner";
import Badge from "../../components/atoms/Badge/Badge";
import { FormField } from "../../components/molecules/FormField";
import { Modal } from "../../components/molecules/Modal";
import { MARCADOR_MOTIVO_URGENCIA, ModalMotivo } from "./organism/ModalMotivo";
import { ModalMotivoUrgente } from "../../components/organisms/ModalMotivoUrgente/ModalMotivoUrgente";
import { ModalPonentes } from "./organism/ModalPonentes";
import {
  ModalInvitados,
  type TablaInvitados as TablaInvitadosModal,
} from "./organism/ModalInvitados";
import type { TablaPonente } from "./organism/ModalPonentes";

function separarMotivoUrgencia(motivo: string) {
  const indice = motivo.lastIndexOf(MARCADOR_MOTIVO_URGENCIA);
  if (indice < 0) {
    return { motivoModificacion: motivo, motivoUrgente: "" };
  }

  return {
    motivoModificacion: motivo.slice(0, indice),
    motivoUrgente: motivo.slice(indice + MARCADOR_MOTIVO_URGENCIA.length),
  };
}

function diasHastaFecha(fecha: string): number | null {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  if (!anio || !mes || !dia) return null;

  const hoy = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .split("-")
    .map(Number);

  const fechaUTC = Date.UTC(anio, mes - 1, dia);
  const hoyUTC = Date.UTC(hoy[0], hoy[1] - 1, hoy[2]);
  return (fechaUTC - hoyUTC) / 86_400_000;
}

function crearColumnasLogistica(
  onEliminar: (personal: PersonalLogisticaItem) => void,
): Columna<PersonalLogisticaItem>[] {
  return [
    {
      id: "correo",
      encabezado: "Correo",
      render: (personal) => personal.correo,
      className: "min-w-[12rem] break-all px-3",
    },
    {
      id: "acciones",
      encabezado: "Acción",
      render: (personal) => {
        return (
          <Button
            text="Eliminar"
            variant="danger"
            type="button"
            onClick={() => onEliminar(personal)}
          />
        );
      },
      className: "text-center min-w-[8rem] max-w-[8rem] break-all px-3",
    },
  ];
}

type TablaInvitados = InvitadoEventoItem;

function obtenerMensajeError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Ocurrió un error inesperado.";
}

function obtenerValoresLogistica(
  evento: EventoOrganizadorDetalle,
  idSubEvento?: number,
): EditLogisticsValues {
  const subevento = idSubEvento
    ? evento.subEventos.find((item) => item.idSubEvento === idSubEvento)
    : evento.subEventos[0];
  if (!subevento) {
    throw new Error("El evento no tiene un subevento que se pueda modificar.");
  }
  const propuesta =
    evento.solicitudModificacionPendiente?.subeventosPropuestos.find(
      (item) => item.idSubEvento === subevento.idSubEvento,
    );

  return {
    idRecinto: String(
      propuesta?.idRecinto ?? subevento.recinto?.idRecinto ?? "",
    ),
    fecha: propuesta?.fecha ?? subevento.fecha?.fecha.slice(0, 10) ?? "",
    horaInicio:
      propuesta?.horaInicio.slice(0, 5) ??
      subevento.fecha?.horaInicio.slice(0, 5) ??
      "",
    horaFin:
      propuesta?.horaFin.slice(0, 5) ??
      subevento.fecha?.horaFin.slice(0, 5) ??
      "",
    accesoQR: String(propuesta?.accesoQR ?? subevento.accesoQR),
    motivoModificacion:
      evento.solicitudModificacionPendiente?.motivoModificacion ?? "",
  };
}

export function EditarEvento() {
  const navigate = useNavigate();
  const { idEvento, idSubEvento } = useParams();
  const idSubEventoSeleccionado = idSubEvento ? Number(idSubEvento) : undefined;
  const rutaAdministracion = idSubEventoSeleccionado
    ? `/organizador/administrar-evento-subeventos/${idEvento}`
    : `/organizador/administrar-evento/${idEvento}`;
  const [evento, setEvento] = useState<EventoOrganizadorDetalle | null>(null);
  const [recintos, setRecintos] = useState<Recinto[]>([]);
  const [agendaOcupada, setAgendaOcupada] = useState<HorarioOcupado[]>([]);
  const [cargandoAgenda, setCargandoAgenda] = useState(false);
  const [errorAgenda, setErrorAgenda] = useState<string | null>(null);
  const [errorRecintos, setErrorRecintos] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [intentoGuardar, setIntentoGuardar] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [alcance, setAlcance] = useState<AlcanceEvento | "">("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalAviso, setMostrarModalAviso] = useState(false);
  const [mostrarModalUrgente, setMostrarModalUrgente] = useState(false);
  const [mostrarModalRegreso, setMostrarModalRegreso] = useState(false);
  const [intentoMotivo, setIntentoMotivo] = useState(false);
  const [motivoUrgente, setMotivoUrgente] = useState("");
  const [modalPontente, setModalPonente] = useState(false);
  const [modalInvitados, setModalinvitados] = useState(false);
  const [logistica, setLogistica] = useState<EditLogisticsValues>({
    idRecinto: "",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    accesoQR: "",
    motivoModificacion: "",
  });
  const [logisticaInicial, setLogisticaInicial] =
    useState<EditLogisticsValues | null>(null);
  const [invitados, setInvitados] = useState<InvitadoEventoItem[]>([]);
  const [invitadosIniciales, setInvitadosIniciales] = useState<
    InvitadoEventoItem[]
  >([]);
  const [archivoPoster, setArchivoPoster] = useState<File | null>(null);
  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const esSubdireccion = usuarioGuardado?.tipoCuenta === "Subdirección";
  const [ponentes, setPonentes] = useState<TablaPonente[]>([]);
  const [ponentesIniciales, setPonentesIniciales] = useState<TablaPonente[]>(
    [],
  );
  const [ponenteAEliminar, setPonenteAEliminar] = useState<TablaPonente | null>(
    null,
  );
  const [personalAEliminar, setPersonalAEliminar] =
    useState<PersonalLogisticaItem | null>(null);
  const [eliminandoPersonal, setEliminandoPersonal] = useState(false);

  const columnasLogistica = useMemo(
    () => crearColumnasLogistica(setPersonalAEliminar),
    [],
  );

  const handleEliminarPersonalLogistica = async () => {
    if (!personalAEliminar || !idEvento) return;
    try {
      setEliminandoPersonal(true);
      await apiRequest(
        `eventos/${idEvento}/personal-logistica/${personalAEliminar.idUsuario}`,
        { method: "DELETE" },
      );
      setEvento((prev) =>
        prev
          ? {
              ...prev,
              personalLogistica: (prev.personalLogistica ?? []).filter(
                (p) => p.idUsuario !== personalAEliminar.idUsuario,
              ),
            }
          : prev,
      );
      setPersonalAEliminar(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar al personal de logística.",
      );
    } finally {
      setEliminandoPersonal(false);
    }
  };

  const handleGuardarInvitados = async (
    nuevosInvitados: TablaInvitadosModal[],
  ) => {
    const nuevosFormateados: InvitadoEventoItem[] = [];
    const errores: string[] = [];
    setError(null);

    if (idEvento) {
      for (const inv of nuevosInvitados) {
        try {
          const res = await apiRequest<{
            mensaje: string;
            invitado: InvitadoEventoItem;
          }>(`eventos/${idEvento}/invitados`, {
            method: "POST",
            body: JSON.stringify({ correo: inv.correo }),
          });
          if (res?.invitado) {
            nuevosFormateados.push(res.invitado);
          }
        } catch (err) {
          errores.push(`${inv.correo}: ${obtenerMensajeError(err)}`);
        }
      }
    }

    if (errores.length > 0) {
      setError(errores.join(". "));
    }

    if (nuevosFormateados.length > 0) {
      setInvitados((prev) => [...prev, ...nuevosFormateados]);
      setEvento((prev) =>
        prev
          ? {
              ...prev,
              invitados: [...(prev.invitados ?? []), ...nuevosFormateados],
            }
          : prev,
      );
      setMensaje("Invitación enviada y registrada correctamente.");
    }
  };

  const handleEliminarInvitado = async (invitado: InvitadoEventoItem) => {
    if (idEvento && invitado.idInvitacionEvento) {
      try {
        await apiRequest(
          `eventos/${idEvento}/invitados/${invitado.idInvitacionEvento}`,
          { method: "DELETE" },
        );
      } catch (err) {
        console.warn("No se pudo eliminar el invitado en el servidor:", err);
      }
    }
    setInvitados((prev) =>
      prev.filter(
        (i) =>
          (i.idInvitacionEvento ?? i.idUsuario) !==
            (invitado.idInvitacionEvento ?? invitado.idUsuario) &&
          i.correo !== invitado.correo,
      ),
    );
    setEvento((prev) =>
      prev
        ? {
            ...prev,
            invitados: (prev.invitados ?? []).filter(
              (i) =>
                (i.idInvitacionEvento ?? i.idUsuario) !==
                  (invitado.idInvitacionEvento ?? invitado.idUsuario) &&
                i.correo !== invitado.correo,
            ),
          }
        : prev,
    );
  };

  const handleReenviarInvitado = async (invitado: InvitadoEventoItem) => {
    if (!idEvento) return;
    setError(null);
    try {
      if (invitado.idInvitacionEvento) {
        await apiRequest(
          `eventos/${idEvento}/invitados/${invitado.idInvitacionEvento}/reenviar`,
          { method: "POST" },
        );
        setMensaje(`Invitación reenviada correctamente a ${invitado.correo}.`);
        setInvitados((prev) =>
          prev.map((i) =>
            i.idInvitacionEvento === invitado.idInvitacionEvento
              ? { ...i, puedeReenviar: false, horasRestantesCooldown: 8 }
              : i,
          ),
        );
      }
    } catch (err) {
      setError(obtenerMensajeError(err));
    }
  };

  const columnasInvitados: Columna<InvitadoEventoItem>[] = useMemo(
    () => [
      {
        id: "correo",
        encabezado: "Correo",
        render: (invitado) => (
          <span className="font-medium text-gray-800">{invitado.correo}</span>
        ),
        className: "min-w-[12rem] px-4 py-3",
      },
      {
        id: "acciones",
        encabezado: "Acciones",
        render: (invitado) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              text={
                invitado.puedeReenviar
                  ? "Reenviar invitación"
                  : `Reenviar (${invitado.horasRestantesCooldown ?? 8}h)`
              }
              variant={invitado.puedeReenviar ? "primary" : "secondary"}
              disabled={!invitado.puedeReenviar}
              type="button"
              onClick={() => handleReenviarInvitado(invitado)}
            />
            <Button
              text="Eliminar"
              variant="danger"
              type="button"
              onClick={() => handleEliminarInvitado(invitado)}
            />
          </div>
        ),
        className: "w-fit px-4 py-3 text-center whitespace-nowrap",
      },
    ],
    [idEvento],
  );

  useEffect(() => {
    const controller = new AbortController();

    const cargar = async () => {
      setCargando(true);
      setEvento(null);
      setError(null);
      setMensaje(null);
      setErrorRecintos(null);
      setRecintos([]);

      if (!idEvento || !/^\d+$/.test(idEvento) || Number(idEvento) < 1) {
        setError("El ID del evento no es válido.");
        setCargando(false);
        return;
      }
      if (
        idSubEvento !== undefined &&
        (!/^\d+$/.test(idSubEvento) || Number(idSubEvento) < 1)
      ) {
        setError("El ID del subevento no es válido.");
        setCargando(false);
        return;
      }
      if (!localStorage.getItem("token")) {
        setError("Sesión no iniciada.");
        setCargando(false);
        return;
      }

      const resultadoRecintos = apiRequest<Recinto[]>("espacios/disponibles", {
        signal: controller.signal,
      }).then(
        (lista) => setRecintos(lista),
        (errorRecinto: unknown) => {
          if (!controller.signal.aborted) {
            setErrorRecintos(obtenerMensajeError(errorRecinto));
          }
        },
      );

      try {
        const detalle = await apiRequest<EventoOrganizadorDetalle>(
          `eventos/${idEvento}/detalle-organizador`,
          { signal: controller.signal },
        );
        if (controller.signal.aborted) return;
        if (
          idSubEventoSeleccionado !== undefined &&
          !detalle.subEventos.some(
            (item) => item.idSubEvento === idSubEventoSeleccionado,
          )
        ) {
          throw new Error("El subevento no pertenece a este evento.");
        }

        setEvento(detalle);
        const subeventoSeleccionado =
          idSubEventoSeleccionado !== undefined
            ? detalle.subEventos.find(
                (item) => item.idSubEvento === idSubEventoSeleccionado,
              )
            : undefined;
        const propuestaSubevento =
          subeventoSeleccionado &&
          detalle.solicitudModificacionPendiente?.subeventosPropuestos.find(
            (item) => item.idSubEvento === subeventoSeleccionado.idSubEvento,
          );
        setNombre(
          propuestaSubevento?.nombre ??
            subeventoSeleccionado?.nombre ??
            detalle.nombre,
        );
        setDescripcion(
          propuestaSubevento?.descripcion ??
            subeventoSeleccionado?.descripcion ??
            detalle.descripcion,
        );
        setJustificacion(detalle.justificacion ?? "");
        setAlcance(detalle.idAlcance ?? "");
        setInvitados(detalle.invitados ?? []);
        setInvitadosIniciales(detalle.invitados ?? []);
        const valoresLogistica = obtenerValoresLogistica(
          detalle,
          idSubEventoSeleccionado,
        );
        const motivos = separarMotivoUrgencia(
          valoresLogistica.motivoModificacion,
        );
        const valoresConMotivo = {
          ...valoresLogistica,
          motivoModificacion: motivos.motivoModificacion,
        };
        setLogistica(valoresConMotivo);
        setLogisticaInicial(valoresConMotivo);
        setMotivoUrgente(motivos.motivoUrgente);
        setArchivoPoster(null);

        const subeventoActual =
          idSubEventoSeleccionado !== undefined
            ? detalle.subEventos.find(
                (item) => item.idSubEvento === idSubEventoSeleccionado,
              )
            : detalle.subEventos[0];

        const ponentesIniciales: TablaPonente[] =
          subeventoActual?.ponentes.map((ponente) => ({
            id: ponente.idPonente,
            nombre: [ponente.nombre, ponente.apellidoPa, ponente.apellidoMa]
              .filter(Boolean)
              .join(" "),
            correo: ponente.correo,
          })) ?? [];

        setPonentes(ponentesIniciales);
        setPonentesIniciales(ponentesIniciales);
      } catch (errorCarga) {
        if (!controller.signal.aborted) {
          setError(obtenerMensajeError(errorCarga));
        }
      } finally {
        await resultadoRecintos;
        if (!controller.signal.aborted) {
          setCargando(false);
        }
      }
    };

    void cargar();
    return () => controller.abort();
  }, [idEvento, idSubEvento, idSubEventoSeleccionado]);

  useEffect(() => {
    if (!logistica.idRecinto || !logistica.fecha) {
      setAgendaOcupada([]);
      setCargandoAgenda(false);
      setErrorAgenda(null);
      return;
    }

    const controller = new AbortController();
    setAgendaOcupada([]);
    setCargandoAgenda(true);
    setErrorAgenda(null);

    const consultarAgenda = async () => {
      try {
        const respuesta = await apiRequest<{ agenda: HorarioOcupado[] }>(
          `espacios/${logistica.idRecinto}/horarios-disponibles?fecha=${encodeURIComponent(logistica.fecha)}`,
          { signal: controller.signal },
        );
        if (!controller.signal.aborted) {
          setAgendaOcupada(
            respuesta.agenda.filter(
              (horario) => horario.idEvento !== Number(idEvento),
            ),
          );
        }
      } catch (errorConsulta) {
        if (!controller.signal.aborted) {
          setErrorAgenda(obtenerMensajeError(errorConsulta));
        }
      } finally {
        if (!controller.signal.aborted) {
          setCargandoAgenda(false);
        }
      }
    };

    void consultarAgenda();
    return () => controller.abort();
  }, [idEvento, logistica.fecha, logistica.idRecinto]);

  const subevento = idSubEventoSeleccionado
    ? (evento?.subEventos.find(
        (item) => item.idSubEvento === idSubEventoSeleccionado,
      ) ?? null)
    : (evento?.subEventos[0] ?? null);
  const subeventoPropuesto = idSubEventoSeleccionado
    ? evento?.solicitudModificacionPendiente?.subeventosPropuestos.find(
        (item) => item.idSubEvento === idSubEventoSeleccionado,
      )
    : undefined;

  const ponentesModificados = Boolean(
    ponentes.length !== ponentesIniciales.length ||
    ponentes.some(
      (p, i) =>
        p.correo !== ponentesIniciales[i]?.correo ||
        p.nombre !== ponentesIniciales[i]?.nombre,
    ),
  );

  const invitadosModificados = Boolean(
    invitados.length !== invitadosIniciales.length ||
    invitados.some((inv, i) => inv.correo !== invitadosIniciales[i]?.correo),
  );

  const columnasPonente: Columna<TablaPonente>[] = [
    {
      id: "nombre",
      encabezado: "Nombre",
      render: (ponente) => ponente.nombre,
      className: "min-w-[5rem] break-all px-3",
    },
    {
      id: "correo",
      encabezado: "Correo",
      render: (ponente) => ponente.correo,
      className: "min-w-[5rem] break-all px-3",
    },
    {
      id: "acciones",
      encabezado: "Acción",
      render: (ponente) => {
        return (
          <Button
            text="Eliminar"
            variant="danger"
            type="button"
            onClick={() => setPonenteAEliminar(ponente)}
          />
        );
      },
      className: "min-w-[8rem] max-w-[8rem] break-all px-3",
    },
  ];

  const personalLogistica = evento?.personalLogistica ?? [];
  const recintoActual =
    recintos.find(
      (recinto) => String(recinto.idRecinto) === logistica.idRecinto,
    ) ??
    subevento?.recinto ??
    null;
  const informacionGeneralModificada = Boolean(
    evento &&
    (idSubEventoSeleccionado === undefined
      ? nombre !== evento.nombre ||
        descripcion !== evento.descripcion ||
        justificacion !== (evento.justificacion ?? "") ||
        alcance !== (evento.idAlcance ?? "") ||
        archivoPoster ||
        ponentesModificados ||
        invitadosModificados
      : subevento &&
        (nombre !== (subeventoPropuesto?.nombre ?? subevento.nombre) ||
          descripcion !==
            (subeventoPropuesto?.descripcion ?? subevento.descripcion) ||
          ponentesModificados ||
          invitadosModificados)),
  );
  const camposLogisticosModificados = Boolean(
    subevento &&
    logisticaInicial &&
    (logistica.idRecinto !== logisticaInicial.idRecinto ||
      logistica.fecha !== logisticaInicial.fecha ||
      logistica.horaInicio !== logisticaInicial.horaInicio ||
      logistica.horaFin !== logisticaInicial.horaFin ||
      logistica.accesoQR !== logisticaInicial.accesoQR),
  );
  const cambioLogisticoOperativo = Boolean(
    subevento &&
    logisticaInicial &&
    (logistica.idRecinto !== logisticaInicial.idRecinto ||
      logistica.fecha !== logisticaInicial.fecha ||
      logistica.horaInicio !== logisticaInicial.horaInicio ||
      logistica.horaFin !== logisticaInicial.horaFin),
  );
  const diasParaFechaPropuesta = diasHastaFecha(logistica.fecha);
  const esModificacionUrgente =
    cambioLogisticoOperativo &&
    diasParaFechaPropuesta !== null &&
    diasParaFechaPropuesta >= 0 &&
    diasParaFechaPropuesta <= 7;
  const logisticaModificada =
    camposLogisticosModificados ||
    Boolean(
      evento?.solicitudModificacionPendiente &&
      logisticaInicial &&
      logistica.motivoModificacion !== logisticaInicial.motivoModificacion,
    );

  function cambiarLogistica<K extends keyof EditLogisticsValues>(
    campo: K,
    valor: EditLogisticsValues[K],
  ) {
    if (campo === "idRecinto" || campo === "fecha") {
      const idRecinto =
        campo === "idRecinto" ? String(valor) : logistica.idRecinto;
      const fecha = campo === "fecha" ? String(valor) : logistica.fecha;
      setAgendaOcupada([]);
      setErrorAgenda(null);
      setCargandoAgenda(Boolean(idRecinto && fecha));
    }
    setLogistica((actual) => ({ ...actual, [campo]: valor }));
  }

  async function obtenerDetalleActualizado(): Promise<EventoOrganizadorDetalle> {
    if (!idEvento) throw new Error("El ID del evento no es válido.");
    return apiRequest<EventoOrganizadorDetalle>(
      `eventos/${idEvento}/detalle-organizador`,
    );
  }

  function solicitarConfirmacionLogistica() {
    setIntentoMotivo(true);
    if (
      !logistica.motivoModificacion.trim() ||
      logistica.motivoModificacion.trim().length > 500
    ) {
      return;
    }

    setMostrarModal(false);
    if (esModificacionUrgente) {
      setMostrarModalUrgente(true);
    } else {
      setMostrarModalAviso(true);
    }
  }

  function confirmarEnvioLogistica() {
    setMostrarModalAviso(false);
    void guardarCambios(true);
  }

  const erroresLogistica: EditLogisticsErrors = {
    idRecinto: !logistica.idRecinto
      ? "Selecciona un espacio para el evento"
      : undefined,
    fecha: !logistica.fecha ? "Selecciona la fecha del evento" : undefined,
    horaInicio: !logistica.horaInicio
      ? "Selecciona la hora de inicio"
      : undefined,
    horaFin: !logistica.horaFin
      ? "Selecciona la hora final"
      : logistica.horaInicio &&
          logistica.horaFin &&
          logistica.horaInicio >= logistica.horaFin
        ? "La hora de finalización debe ser posterior a la de inicio"
        : undefined,
  };
  const hayErroresLogistica = Boolean(
    erroresLogistica.idRecinto ||
    erroresLogistica.fecha ||
    erroresLogistica.horaInicio ||
    erroresLogistica.horaFin,
  );
  const hayErroresGenerales = Boolean(
    !nombre.trim() ||
    nombre.trim().length > 150 ||
    !descripcion.trim() ||
    descripcion.trim().length > 500 ||
    (idSubEventoSeleccionado === undefined &&
      (!justificacion.trim() || justificacion.trim().length > 500)),
  );

  useEffect(() => {
    const hayErrores =
      intentoGuardar &&
      (hayErroresGenerales ||
        (camposLogisticosModificados && hayErroresLogistica));

    if (mensaje || hayErrores) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [
    mensaje,
    intentoGuardar,
    hayErroresGenerales,
    camposLogisticosModificados,
    hayErroresLogistica,
  ]);

  async function guardarCambios(confirmarMotivoLogistica = false) {
    setIntentoGuardar(true);
    if (!evento || !subevento || !idEvento) return;

    setError(null);
    setMensaje(null);

    if (
      hayErroresGenerales ||
      (camposLogisticosModificados && hayErroresLogistica)
    ) {
      return;
    }

    if (!informacionGeneralModificada && !logisticaModificada) {
      setMensaje("No hay cambios para guardar.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const motivoModificacionCompleto = esSubdireccion
      ? undefined
      : esModificacionUrgente
        ? `${logistica.motivoModificacion.trim()}${MARCADOR_MOTIVO_URGENCIA}${motivoUrgente.trim()}`
        : logistica.motivoModificacion.trim();
    if (logisticaModificada) {
      if (cargandoAgenda || errorAgenda) {
        setError(
          cargandoAgenda
            ? "Espera a que termine la consulta de disponibilidad del espacio."
            : `No se pudo comprobar la disponibilidad del espacio: ${errorAgenda}`,
        );
        return;
      }
      if (!confirmarMotivoLogistica && !esSubdireccion) {
        setIntentoMotivo(false);
        setMostrarModal(true);
        return;
      }
      if (!esSubdireccion) {
        setIntentoMotivo(true);
        if (
          !logistica.motivoModificacion.trim() ||
          logistica.motivoModificacion.trim().length > 500
        ) {
          return;
        }
        if (esModificacionUrgente && !motivoUrgente.trim()) {
          setError("Escribe el motivo de urgencia para continuar.");
          return;
        }
        if (
          motivoModificacionCompleto &&
          motivoModificacionCompleto.length > 500
        ) {
          setError(
            "Reduce el motivo de modificación o el de urgencia para que ambos no excedan 500 caracteres en total.",
          );
          return;
        }
      }
    }

    setMostrarModal(false);
    setGuardando(true);
    let informacionGuardada = false;
    let logisticaEnviada = false;
    try {
      if (informacionGeneralModificada) {
        const payload: ActualizarInfoGeneralPayload = {};

        if (idSubEventoSeleccionado === undefined) {
          if (nombre !== evento.nombre) payload.nombre = nombre.trim();
          if (descripcion !== evento.descripcion)
            payload.descripcion = descripcion.trim();
          if (justificacion !== (evento.justificacion ?? "")) {
            payload.justificacion = justificacion.trim();
          }
          if (alcance !== (evento.idAlcance ?? "") && alcance !== "") {
            payload.idAlcance = alcance;
          }
        } else {
          payload.idSubEvento = idSubEventoSeleccionado;
          if (nombre !== (subeventoPropuesto?.nombre ?? subevento.nombre)) {
            payload.nombre = nombre.trim();
          }
          if (
            descripcion !==
            (subeventoPropuesto?.descripcion ?? subevento.descripcion)
          ) {
            payload.descripcion = descripcion.trim();
          }
        }

        if (ponentesModificados) {
          payload.ponentes = ponentes.map((p) => {
            const partes = p.nombre.trim().split(/\s+/);
            const primerNombre = partes[0] || "";
            const apellidoPaterno = partes[1] || primerNombre;
            const apellidoMaterno = partes.slice(2).join(" ") || null;

            return {
              idPonente: p.id > 1_000_000_000 ? undefined : p.id,
              nombre: primerNombre,
              apellidoPa: apellidoPaterno,
              apellidoMa: apellidoMaterno,
              correo: p.correo.trim().toLowerCase(),
              idSubEvento: subevento.idSubEvento,
            };
          });
        }

        if (archivoPoster) {
          const datos = new FormData();
          for (const [campo, valor] of Object.entries(payload)) {
            if (valor !== undefined) {
              if (campo === "ponentes") {
                datos.append(campo, JSON.stringify(valor));
              } else {
                datos.append(campo, String(valor));
              }
            }
          }
          datos.append("poster", archivoPoster);
          await apiRequest(`eventos/${idEvento}/info-general`, {
            method: "PATCH",
            body: datos,
          });
        } else {
          await apiRequest(`eventos/${idEvento}/info-general`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        }
        informacionGuardada = true;
      }

      if (invitadosModificados && idEvento) {
        const invitadosNuevos = invitados.filter(
          (inv) => !invitadosIniciales.some((ini) => ini.correo === inv.correo),
        );
        for (const inv of invitadosNuevos) {
          try {
            await apiRequest(`eventos/${idEvento}/invitados`, {
              method: "POST",
              body: JSON.stringify({ correo: inv.correo }),
            });
          } catch (err) {
            console.warn(
              "Error al registrar invitado en el guardado general:",
              err,
            );
          }
        }

        const invitadosEliminados = invitadosIniciales.filter(
          (ini) => !invitados.some((inv) => inv.correo === ini.correo),
        );
        for (const inv of invitadosEliminados) {
          if (inv.idInvitacionEvento) {
            try {
              await apiRequest(
                `eventos/${idEvento}/invitados/${inv.idInvitacionEvento}`,
                { method: "DELETE" },
              );
            } catch (err) {
              console.warn(
                "Error al revocar invitado en el guardado general:",
                err,
              );
            }
          }
        }
        informacionGuardada = true;
      }

      if (logisticaModificada) {
        const subeventosAEnviar = evento.subEventos.map((otroSub) => {
          if (otroSub.idSubEvento === subevento.idSubEvento) {
            return {
              idSubEvento: subevento.idSubEvento,
              nombre:
                idSubEventoSeleccionado !== undefined
                  ? nombre.trim()
                  : subevento.nombre,
              descripcion:
                idSubEventoSeleccionado !== undefined
                  ? descripcion.trim()
                  : subevento.descripcion,
              idRecinto: Number(logistica.idRecinto),
              accesoQR: logistica.accesoQR === "true",
              fecha: logistica.fecha,
              horaInicio: logistica.horaInicio,
              horaFin: logistica.horaFin,
            };
          }

          const propuesta =
            evento.solicitudModificacionPendiente?.subeventosPropuestos.find(
              (p) => p.idSubEvento === otroSub.idSubEvento,
            );

          return {
            idSubEvento: otroSub.idSubEvento,
            nombre: propuesta?.nombre ?? otroSub.nombre,
            descripcion: propuesta?.descripcion ?? otroSub.descripcion,
            idRecinto: propuesta?.idRecinto ?? otroSub.recinto?.idRecinto ?? 0,
            accesoQR: propuesta?.accesoQR ?? otroSub.accesoQR,
            fecha: propuesta?.fecha ?? otroSub.fecha?.fecha.slice(0, 10) ?? "",
            horaInicio:
              propuesta?.horaInicio.slice(0, 5) ??
              otroSub.fecha?.horaInicio.slice(0, 5) ??
              "",
            horaFin:
              propuesta?.horaFin.slice(0, 5) ??
              otroSub.fecha?.horaFin.slice(0, 5) ??
              "",
          };
        });

        const payload: ModificarLogisticaPayload = {
          motivoModificacion: motivoModificacionCompleto,
          subeventos: subeventosAEnviar,
        };
        await apiRequest(`eventos/${idEvento}/logistica`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        logisticaEnviada = true;
      }

      const detalleActualizado = await obtenerDetalleActualizado();
      const valoresLogisticaActualizados = obtenerValoresLogistica(
        detalleActualizado,
        idSubEventoSeleccionado,
      );
      const motivosActualizados = separarMotivoUrgencia(
        valoresLogisticaActualizados.motivoModificacion,
      );
      const valoresActualizadosConMotivo = {
        ...valoresLogisticaActualizados,
        motivoModificacion: motivosActualizados.motivoModificacion,
      };
      const subeventoActualizado = idSubEventoSeleccionado
        ? detalleActualizado.subEventos.find(
            (item) => item.idSubEvento === idSubEventoSeleccionado,
          )
        : undefined;
      const propuestaActualizada =
        subeventoActualizado &&
        detalleActualizado.solicitudModificacionPendiente?.subeventosPropuestos.find(
          (item) => item.idSubEvento === subeventoActualizado.idSubEvento,
        );
      setEvento(detalleActualizado);
      setInvitados(detalleActualizado.invitados ?? []);
      setInvitadosIniciales(detalleActualizado.invitados ?? []);
      setNombre(
        propuestaActualizada?.nombre ??
          subeventoActualizado?.nombre ??
          detalleActualizado.nombre,
      );
      setDescripcion(
        propuestaActualizada?.descripcion ??
          subeventoActualizado?.descripcion ??
          detalleActualizado.descripcion,
      );
      setJustificacion(detalleActualizado.justificacion ?? "");
      setAlcance(detalleActualizado.idAlcance ?? "");
      setLogistica(valoresActualizadosConMotivo);
      setLogisticaInicial(valoresActualizadosConMotivo);
      setMotivoUrgente(motivosActualizados.motivoUrgente);
      setArchivoPoster(null);

      const ponentesGuardados: TablaPonente[] =
        subeventoActualizado?.ponentes.map((ponente) => ({
          id: ponente.idPonente,
          nombre: [ponente.nombre, ponente.apellidoPa, ponente.apellidoMa]
            .filter(Boolean)
            .join(" "),
          correo: ponente.correo,
        })) ?? [];
      setPonentes(ponentesGuardados);
      setPonentesIniciales(ponentesGuardados);

      setMensaje(
        logisticaModificada
          ? esSubdireccion
            ? "Los cambios se aplicaron directamente con éxito."
            : informacionGeneralModificada
              ? "La información general se guardó y la modificación logística fue enviada a revisión."
              : "La modificación logística fue enviada a revisión."
          : "Los cambios se guardaron correctamente.",
      );
    } catch (errorOperacion) {
      const detalleError = obtenerMensajeError(errorOperacion);
      if (logisticaEnviada) {
        setError(
          `La solicitud logística se envió${informacionGuardada ? " y la información general se guardó" : ""}, pero no se pudieron recargar los datos: ${detalleError}`,
        );
      } else if (informacionGuardada) {
        setError(
          logisticaModificada
            ? `La información general se guardó, pero no se pudo enviar la modificación logística: ${detalleError}`
            : `La información general se guardó, pero no se pudieron recargar los datos: ${detalleError}`,
        );
      } else {
        setError(detalleError);
      }
    } finally {
      setGuardando(false);
    }
  }

  function manejarEnvio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void guardarCambios();
  }

  if (cargando) {
    return (
      <p role="status" className="mx-auto max-w-7xl px-4 py-8 text-gray-600">
        Cargando datos del evento...
      </p>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:space-y-10 lg:px-8">
      <button
        type="button"
        className="flex cursor-pointer items-center gap-2"
        onClick={
          logisticaModificada || informacionGeneralModificada
            ? () => setMostrarModalRegreso(true)
            : () => navigate(rutaAdministracion)
        }
      >
        <ArrowLeft size={20} aria-hidden="true" />
        <span>Volver</span>
      </button>

      {mostrarModalRegreso && (
        <Modal
          mostrarModal={mostrarModalRegreso}
          titulo="Advertencia"
          contenido="¿Estás seguro que deseas regresar? Los cambios realizados se perderán"
          cerrarModal={() => setMostrarModal(false)}
        >
          <div className="flex justify-end gap-3">
            <Button
              text="Cancelar"
              variant="secondary"
              type="button"
              onClick={() => setMostrarModalRegreso(false)}
            />
            <Button
              text="Aceptar"
              variant="success"
              type="button"
              onClick={() => navigate(rutaAdministracion)}
            />
          </div>
        </Modal>
      )}

      <div id="contenedorTituloBanner" className="space-y-4 sm:space-y-5">
        <h1 className="font-merriweather text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
          {idSubEventoSeleccionado !== undefined
            ? "Modificar detalles de la actividad"
            : "Modificar detalles del evento"}
        </h1>
        {evento?.posterUrl && (
          <EventBanner eventName={evento.nombre} posterUrl={evento.posterUrl} />
        )}
      </div>

      {error && (
        <Modal
          titulo="Error"
          contenido={error}
          mostrarModal={Boolean(error)}
          cerrarModal={() => setError(null)}
        >
          <Button
            text="Cerrar"
            variant="primary"
            type="button"
            onClick={() => setError(null)}
          />
        </Modal>
      )}

      {mensaje && (
        <div>
          <Badge variant="success">{mensaje}</Badge>
        </div>
      )}

      {intentoGuardar &&
        (hayErroresGenerales ||
          (camposLogisticosModificados && hayErroresLogistica)) && (
          <div
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-800"
          >
            Por favor, completa todos los campos obligatorios resaltados para
            continuar
          </div>
        )}

      {evento && (
        <>
          {evento.solicitudModificacionPendiente && (
            <div
              role="status"
              className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-950 shadow-md"
            >
              <div className="flex flex-row justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="warning">Solicitud en revisión</Badge>
                  <h2 className="text-base font-bold text-amber-950">
                    Modificación logística pendiente de evaluación por
                    Subdirección
                  </h2>
                </div>
              </div>
              <p className="text-base text-amber-900">
                <span className="font-semibold">Motivo registrado:</span>{" "}
                {evento.solicitudModificacionPendiente.motivoModificacion}
              </p>
              <p className="text-sm text-amber-800">
                Mientras Subdirección dictamina esta solicitud, se conservan
                vigentes las fechas y espacios originales. Cualquier nuevo
                cambio logístico actualizará esta misma solicitud sin generar
                duplicados.
              </p>
            </div>
          )}

          <form onSubmit={manejarEnvio} className="space-y-8">
            <fieldset disabled={guardando} className="space-y-8 border-0 p-0">
              <div
                id="contenedorDatosIniciales"
                className="space-y-2 border border-gray-200 bg-white p-5 shadow-md"
              >
                <div className="relative">
                  <label htmlFor="campoNombre" className="sr-only">
                    Nombre del evento
                  </label>
                  <span className="text-xs">Máximo 150 caracteres</span>
                  <div className="relative">
                    <Pencil
                      size={18}
                      aria-hidden="true"
                      className="absolute right-3 top-4 text-gray-500"
                    />
                    <FormField
                      errorMessage={
                        !nombre.trim()
                          ? "El nombre del evento es obligatorio"
                          : ""
                      }
                    >
                      <Input
                        id="campoNombre"
                        className="pr-10 font-merriweather text-xl font-bold text-secondary sm:text-2xl"
                        value={nombre}
                        hasError={intentoGuardar && !nombre.trim()}
                        aria-errormessage="El nombre del evento es obligatorio"
                        maxLength={150}
                        onChange={(event) =>
                          setNombre(event.currentTarget.value)
                        }
                      />
                    </FormField>
                  </div>
                </div>
                <div>
                  <label htmlFor="campoDescripcion" className="sr-only">
                    Descripción del evento
                  </label>
                  <span className="text-xs">Máximo 500 caracteres</span>
                  <div className="relative">
                    <Pencil
                      size={18}
                      aria-hidden="true"
                      className="absolute right-3 top-4 text-gray-500"
                    />
                    <FormField
                      errorMessage={
                        !descripcion.trim()
                          ? "La descripción es obligatoria"
                          : ""
                      }
                    >
                      <TextArea
                        id="campoDescripcion"
                        value={descripcion}
                        maxLength={500}
                        hasError={intentoGuardar && !descripcion.trim()}
                        onChange={(event) =>
                          setDescripcion(event.currentTarget.value)
                        }
                        className="resize-none"
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)] xl:gap-12">
                <div className="w-full min-w-0 space-y-6">
                  <div id="contenedorPonentes" className="space-y-5">
                    <h2 className="text-xl font-bold sm:text-2xl">Ponentes</h2>
                    {ponentes.length > 0 ? (
                      <div className="mt-4 w-full min-w-0 overflow-x-auto rounded-md border border-gray-200 shadow-md">
                        <Table
                          columnas={columnasPonente}
                          filas={ponentes}
                          obtenerClave={(ponente) => ponente.id}
                          className="table-auto min-w-full bg-white text-left text-sm [&_tbody_tr]:h-12 [&_thead_tr]:h-10 [&_th]:py-2 [&_td]:py-2"
                        />
                      </div>
                    ) : (
                      <p className="mt-3 text-gray-600">
                        No hay ponentes registrados para este evento.
                      </p>
                    )}
                    <Button
                      text="Agregar ponente"
                      variant="primary"
                      type="button"
                      onClick={() => setModalPonente(true)}
                    />
                  </div>

                  {modalPontente && (
                    <ModalPonentes
                      mostrarModal={modalPontente}
                      cerrarModal={() => setModalPonente(false)}
                      guardar={(nuevosPonentes) => {
                        setPonentes((prev) => [...prev, ...nuevosPonentes]);
                      }}
                    />
                  )}

                  {ponenteAEliminar && (
                    <Modal
                      mostrarModal={Boolean(ponenteAEliminar)}
                      titulo="Confirmar eliminación"
                      cerrarModal={() => setPonenteAEliminar(null)}
                    >
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          ¿Estás seguro de que deseas eliminar al ponente{" "}
                          <strong className="text-gray-900">
                            {ponenteAEliminar.nombre}
                          </strong>
                          ?
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                          <Button
                            text="Cancelar"
                            variant="secondary"
                            type="button"
                            onClick={() => setPonenteAEliminar(null)}
                          />
                          <Button
                            text="Eliminar"
                            variant="danger"
                            type="button"
                            onClick={() => {
                              setPonentes((actuales) =>
                                actuales.filter(
                                  (p) => p.id !== ponenteAEliminar.id,
                                ),
                              );
                              setPonenteAEliminar(null);
                            }}
                          />
                        </div>
                      </div>
                    </Modal>
                  )}

                  {personalAEliminar && (
                    <Modal
                      mostrarModal={Boolean(personalAEliminar)}
                      titulo="Confirmar eliminación"
                      cerrarModal={() => {
                        if (!eliminandoPersonal) setPersonalAEliminar(null);
                      }}
                    >
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          ¿Estás seguro que deseas eliminar al personal
                          <strong className="text-gray-900">
                            {personalAEliminar.correo}
                          </strong>
                          ?
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                          <Button
                            text="Cancelar"
                            variant="secondary"
                            type="button"
                            disabled={eliminandoPersonal}
                            onClick={() => setPersonalAEliminar(null)}
                          />
                          <Button
                            text={
                              eliminandoPersonal ? "Eliminando..." : "Eliminar"
                            }
                            variant="danger"
                            type="button"
                            disabled={eliminandoPersonal}
                            onClick={() =>
                              void handleEliminarPersonalLogistica()
                            }
                          />
                        </div>
                      </div>
                    </Modal>
                  )}

                  {idSubEventoSeleccionado === undefined && (
                    <div id="contenedorLogistica" className="space-y-5">
                      <h2 className="text-xl font-bold sm:text-2xl">
                        Personal de logística
                      </h2>
                      {personalLogistica.length > 0 ? (
                        <div className="mt-4 w-full min-w-0 overflow-x-auto rounded-md border border-gray-200 shadow-md">
                          <Table
                            columnas={columnasLogistica}
                            filas={personalLogistica}
                            obtenerClave={(personal) => personal.idUsuario}
                            className="table-auto min-w-full bg-white text-left text-sm [&_tbody_tr]:h-12 [&_thead_tr]:h-10 [&_th]:py-2 [&_td]:py-2"
                          />
                        </div>
                      ) : (
                        <p className="mt-3 text-gray-600">
                          No hay personal de logística registrado para este
                          evento.
                        </p>
                      )}
                      <Button
                        text="Agregar personal de logística"
                        variant="primary"
                        type="button"
                        onClick={() => {
                          navigate(
                            `/organizador/administrar-evento/${idEvento}/agregar-logistica`,
                          );
                        }}
                      />
                    </div>
                  )}
                  {alcance === AlcanceEvento.PRIVADO && (
                    <div id="contenedorInvitados" className="space-y-5">
                      <h2 className="text-xl font-bold sm:text-2xl">
                        Tus invitados
                      </h2>
                      {invitados.length > 0 ? (
                        <div className="mt-4 w-full min-w-0 overflow-x-auto rounded-md border border-gray-200 shadow-md">
                          <Table
                            columnas={columnasInvitados}
                            filas={invitados}
                            obtenerClave={(invitado) =>
                              invitado.idUsuario ??
                              invitado.idInvitacionEvento ??
                              invitado.correo
                            }
                            className="table-auto min-w-full bg-white text-left text-sm [&_tbody_tr]:h-12 [&_thead_tr]:h-10 [&_th]:py-2 [&_td]:py-2"
                          />
                        </div>
                      ) : (
                        <p className="mt-3 text-gray-600">
                          No hay invitados registrados para este evento.
                        </p>
                      )}
                      <Button
                        text="Agregar invitados"
                        variant="primary"
                        type="button"
                        onClick={() => setModalinvitados(true)}
                      />
                    </div>
                  )}
                  {modalInvitados && (
                    <ModalInvitados
                      mostrarModal={modalInvitados}
                      cerrarModal={() => setModalinvitados(false)}
                      guardar={handleGuardarInvitados}
                    />
                  )}
                </div>

                <EditLogisticsSection
                  valores={logistica}
                  alcance={alcance}
                  justificacion={justificacion}
                  posterUrl={evento.posterUrl}
                  archivoPoster={archivoPoster}
                  recintos={recintos}
                  recintoActual={recintoActual}
                  errorRecintos={errorRecintos}
                  agendaOcupada={agendaOcupada}
                  cargandoAgenda={cargandoAgenda}
                  errorAgenda={errorAgenda}
                  deshabilitado={guardando}
                  mostrarBanner={idSubEventoSeleccionado === undefined}
                  errores={erroresLogistica}
                  intentoGuardar={intentoGuardar}
                  onCambioLogistica={cambiarLogistica}
                  onCambioAlcance={setAlcance}
                  onCambioJustificacion={setJustificacion}
                  onCambioPoster={setArchivoPoster}
                />
              </div>
            </fieldset>
            <div className="flex justify-end">
              <Button
                text="Confirmar cambios"
                type="submit"
                loading={guardando}
              />
            </div>
            {(mostrarModal || mostrarModalAviso) && (
              <ModalMotivo
                mostrarModal={mostrarModal}
                mostrarModalAviso={mostrarModalAviso}
                intentoMotivo={intentoMotivo}
                esUrgente={esModificacionUrgente}
                logistica={logistica}
                onCerrar={() => setMostrarModal(false)}
                onCerrarAviso={() => {
                  setMostrarModalAviso(false);
                  if (esModificacionUrgente) {
                    setMostrarModalUrgente(true);
                  } else {
                    setMostrarModal(true);
                  }
                }}
                onCambioMotivo={(motivo) =>
                  cambiarLogistica("motivoModificacion", motivo)
                }
                onSolicitarConfirmacion={solicitarConfirmacionLogistica}
                onConfirmar={confirmarEnvioLogistica}
              />
            )}
            <ModalMotivoUrgente
              mostrar={mostrarModalUrgente}
              motivo={motivoUrgente}
              maxLength={500}
              contenido="La fecha propuesta está dentro de los próximos 7 días. Explica por qué la modificación se solicita con carácter urgente."
              cerrar={() => {
                setMostrarModalUrgente(false);
                setMostrarModal(true);
              }}
              onMotivoChange={setMotivoUrgente}
              continuar={() => {
                setMostrarModalUrgente(false);
                setMostrarModalAviso(true);
              }}
            />
          </form>
        </>
      )}
    </section>
  );
}
