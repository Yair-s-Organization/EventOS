import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import {
  AlcanceEvento,
  calcularImpactoCambioSubevento,
  type ModalidadAcceso,
  type ActualizarInfoGeneralPayload,
  type EventoOrganizadorDetalle,
  type ModificarLogisticaPayload,
  type PersonalLogisticaItem,
  type InvitadoEventoItem,
  type Recinto,
} from "@eventos/shared";
import { Input } from "../../components/atoms/Input/Input";
import { TextArea } from "../../components/atoms/TextArea/TextArea";
import { Table } from "../../components/organisms/Table/Table";
import type { Columna } from "../../components/organisms/Table/Table";
import Button from "../../components/atoms/Button/Button";
import {
  ajustarHorarioSegunAgenda,
  EditLogisticsSection,
} from "./organism/EditLogisticsSection";
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
import { EnlaceInvitacionSubevento } from "./components/EnlaceInvitacionSubevento";
import {
  ModalInvitados,
  type TablaInvitados as TablaInvitadosModal,
} from "./organism/ModalInvitados";
import type { TablaPonente } from "./organism/ModalPonentes";
import { PageHeader } from "../../components/organisms/PageHeader/PageHeader";
import {
  agregarInvitadosLocales,
  normalizarCorreo,
  sincronizarInvitadosYLogistica,
  tienenCambiosInvitados,
  tienenCambiosPersonalLogistica,
} from "./deferredOrganizerSync";
import { InfoTooltip } from "../../components/atoms/InfoTooltip/InfoTooltip";

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
    idModalidadAcceso: String(
      propuesta?.idModalidadAcceso ?? subevento.idModalidadAcceso,
    ),
    motivoModificacion:
      evento.solicitudModificacionPendiente?.motivoModificacion ?? "",
  };
}

export function EditarEvento() {
  const navigate = useNavigate();
  const { idEvento, idSubEvento } = useParams();
  const idSubEventoSeleccionado = idSubEvento ? Number(idSubEvento) : undefined;
  const rutaAdministracion = idSubEventoSeleccionado
    ? `/organizador/editar-evento-subeventos/${idEvento}`
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
    idModalidadAcceso: "",
    motivoModificacion: "",
  });
  const [logisticaInicial, setLogisticaInicial] =
    useState<EditLogisticsValues | null>(null);
  const [invitados, setInvitados] = useState<InvitadoEventoItem[]>([]);
  const [invitadosIniciales, setInvitadosIniciales] = useState<
    InvitadoEventoItem[]
  >([]);
  const [invitadoAEliminar, setInvitadoAEliminar] =
    useState<InvitadoEventoItem | null>(null);
  const [personalLogistica, setPersonalLogistica] = useState<
    PersonalLogisticaItem[]
  >([]);
  const [personalLogisticaInicial, setPersonalLogisticaInicial] = useState<
    PersonalLogisticaItem[]
  >([]);
  const [archivoPoster, setArchivoPoster] = useState<File | null>(null);
  const [previewPosterUrl, setPreviewPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!archivoPoster) {
      setPreviewPosterUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(archivoPoster);
    setPreviewPosterUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [archivoPoster]);
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
  const esVistaEvento = idSubEventoSeleccionado === undefined;

  const columnasLogistica = useMemo<Columna<PersonalLogisticaItem>[]>(() => {
    const base: Columna<PersonalLogisticaItem>[] = [
      {
        id: "correo",
        encabezado: "Correo",
        render: (personal) => personal.correo,
        className: "min-w-[12rem] sm:min-w-[13rem] break-all px-3",
      },
    ];

    if (esVistaEvento) {
      base.push({
        id: "acciones",
        encabezado: "Acción",
        render: (personal) => (
          <div id="contenedorEncabezado">
            <Button
              text="Eliminar"
              variant="danger"
              type="button"
              onClick={() => setPersonalAEliminar(personal)}
            />
          </div>
        ),
        className:
          "text-center w-[8rem] min-w-[8rem] sm:min-w-[15rem] break-all px-3",
      });
    }

    return base;
  }, [esVistaEvento]);

  const confirmarEliminarPersonalLogistica = () => {
    if (!personalAEliminar) return;
    setPersonalLogistica((prev) =>
      prev.filter((p) => p.idUsuario !== personalAEliminar.idUsuario),
    );
    setPersonalAEliminar(null);
  };

  const handleGuardarInvitados = (nuevosInvitados: TablaInvitadosModal[]) => {
    setError(null);
    setInvitados((prev) =>
      agregarInvitadosLocales(
        prev,
        nuevosInvitados,
        subevento?.idSubEvento ?? 0,
      ),
    );
  };

  const confirmarEliminarInvitado = () => {
    if (!invitadoAEliminar) return;
    const correoObjetivo = normalizarCorreo(invitadoAEliminar.correo);
    setInvitados((prev) =>
      prev.filter((i) => normalizarCorreo(i.correo) !== correoObjetivo),
    );
    setInvitadoAEliminar(null);
  };

  const handleReenviarInvitado = async (invitado: InvitadoEventoItem) => {
    if (!idEvento) return;
    setError(null);
    const idSub =
      invitado.idSubEvento && invitado.idSubEvento > 0
        ? invitado.idSubEvento
        : subevento?.idSubEvento;
    if (!idSub) {
      setError("No se pudo determinar el subevento de la invitación.");
      return;
    }
    try {
      if (invitado.idInvitacionEvento) {
        await apiRequest(
          `eventos/${idEvento}/subeventos/${idSub}/invitados/${invitado.idInvitacionEvento}/reenviar`,
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
                !invitado.idInvitacionEvento
                  ? "Pendiente de envío"
                  : invitado.puedeReenviar
                    ? "Reenviar invitación"
                    : `Reenviar en ${invitado.horasRestantesCooldown ?? 8} hrs`
              }
              className={invitado.horasRestantesCooldown > 0 ? "px-6" : ""}
              variant={
                invitado.idInvitacionEvento && invitado.puedeReenviar
                  ? "primary"
                  : "secondary"
              }
              disabled={!invitado.idInvitacionEvento || !invitado.puedeReenviar}
              type="button"
              onClick={() => handleReenviarInvitado(invitado)}
            />
            <Button
              text="Eliminar"
              variant="danger"
              type="button"
              onClick={() => setInvitadoAEliminar(invitado)}
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
        const subeventoActivo = subeventoSeleccionado ?? detalle.subEventos[0];
        const invitadosDelSub =
          subeventoActivo?.invitados ?? detalle.invitados ?? [];
        setInvitados(invitadosDelSub);
        setInvitadosIniciales(invitadosDelSub);
        setPersonalLogistica(detalle.personalLogistica ?? []);
        setPersonalLogisticaInicial(detalle.personalLogistica ?? []);
        const valoresLogistica = obtenerValoresLogistica(
          detalle,
          idSubEventoSeleccionado,
        );
        const valoresConMotivo = {
          ...valoresLogistica,
          motivoModificacion: "",
        };
        setLogistica(valoresConMotivo);
        setLogisticaInicial(valoresConMotivo);
        setMotivoUrgente("");
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
          const agendaFiltrada = respuesta.agenda.filter((horario) =>
            idSubEventoSeleccionado !== undefined && horario.idSubEvento
              ? horario.idSubEvento !== Number(idSubEventoSeleccionado)
              : horario.idEvento !== Number(idEvento),
          );
          setAgendaOcupada(agendaFiltrada);
          setLogistica((actual) => {
            const { horaInicio, horaFin } = ajustarHorarioSegunAgenda(
              actual.horaInicio,
              actual.horaFin,
              agendaFiltrada,
            );
            if (
              horaInicio === actual.horaInicio &&
              horaFin === actual.horaFin
            ) {
              return actual;
            }
            return { ...actual, horaInicio, horaFin };
          });
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
    ponentes.some((p, i) => p.nombre !== ponentesIniciales[i]?.nombre),
  );

  const invitadosModificados = tienenCambiosInvitados(
    invitados,
    invitadosIniciales,
  );

  const personalLogisticaModificado = tienenCambiosPersonalLogistica(
    personalLogistica,
    personalLogisticaInicial,
  );

  const columnasPonente: Columna<TablaPonente>[] = [
    {
      id: "nombre",
      encabezado: "Nombre",
      render: (ponente) => ponente.nombre,
      className:
        "min-w-[12rem] sm:min-w-[10rem] md:min-w-[7.5rem] md:max-w-[9.5rem] lg:min-w-[11rem] break-all px-3",
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
      className: "w-[8rem] min-w-[8rem] sm:min-w-[15rem] px-3 text-center",
    },
  ];

  const recintoActual =
    recintos.find(
      (recinto) => String(recinto.idRecinto) === logistica.idRecinto,
    ) ??
    subevento?.recinto ??
    null;
  const camposInfoGeneralModificados = Boolean(
    evento &&
    (idSubEventoSeleccionado === undefined
      ? nombre !== evento.nombre ||
        descripcion !== evento.descripcion ||
        justificacion !== (evento.justificacion ?? "") ||
        alcance !== (evento.idAlcance ?? "") ||
        Boolean(archivoPoster) ||
        ponentesModificados
      : subevento &&
        (nombre !== (subeventoPropuesto?.nombre ?? subevento.nombre) ||
          descripcion !==
            (subeventoPropuesto?.descripcion ?? subevento.descripcion) ||
          ponentesModificados)),
  );
  const informacionGeneralModificada = Boolean(
    camposInfoGeneralModificados ||
    invitadosModificados ||
    personalLogisticaModificado,
  );
  const camposLogisticosModificados = Boolean(
    subevento &&
    logisticaInicial &&
    (logistica.idRecinto !== logisticaInicial.idRecinto ||
      logistica.fecha !== logisticaInicial.fecha ||
      logistica.horaInicio !== logisticaInicial.horaInicio ||
      logistica.horaFin !== logisticaInicial.horaFin ||
      logistica.idModalidadAcceso !== logisticaInicial.idModalidadAcceso),
  );
  const cambioLogisticoOperativo = camposLogisticosModificados;
  const diasParaFechaPropuesta = diasHastaFecha(logistica.fecha);
  const esModificacionUrgente =
    cambioLogisticoOperativo &&
    diasParaFechaPropuesta !== null &&
    diasParaFechaPropuesta >= 0 &&
    diasParaFechaPropuesta <= 7;
  const impactoCambio =
    subevento && logistica.idRecinto && logistica.idModalidadAcceso
      ? calcularImpactoCambioSubevento({
          idSubEvento: subevento.idSubEvento,
          nombreSubEvento: nombre.trim() || subevento.nombre,
          inscritosActivos: subevento.boletosEmitidos ?? 0,
          aforoDestino: recintoActual?.aforo ?? 0,
          idRecintoOrigen: subevento.recinto?.idRecinto ?? 0,
          idRecintoDestino: Number(logistica.idRecinto) || 0,
          modalidadOrigen: subevento.idModalidadAcceso,
          modalidadDestino: Number(
            logistica.idModalidadAcceso,
          ) as ModalidadAcceso,
        })
      : null;
  const avisoImpacto =
    impactoCambio && impactoCambio.inscritosActivos > 0
      ? impactoCambio.resumenTexto || null
      : null;
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
        cambiarLogistica("motivoModificacion", "");
        setMotivoUrgente("");
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
    let erroresDiferidos: string[] = [];
    let invitadosFallidos: InvitadoEventoItem[] = [];
    try {
      if (camposInfoGeneralModificados) {
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
            const primerNombre = (partes[0] || "").slice(0, 50);
            const apellidoPaterno = (partes[1] ?? "").slice(0, 50);
            const apellidoMaterno =
              partes.slice(2).join(" ").slice(0, 50) || null;

            return {
              idPonente: p.id > 1_000_000_000 ? undefined : p.id,
              nombre: primerNombre,
              apellidoPa: apellidoPaterno,
              apellidoMa: apellidoMaterno,
              correo: p.correo ?? "",
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

      const alcanceFinal =
        idSubEventoSeleccionado === undefined && alcance !== ""
          ? alcance
          : evento.idAlcance;
      const sincronizarInvitados =
        invitadosModificados && alcanceFinal === AlcanceEvento.PRIVADO;

      if (sincronizarInvitados || personalLogisticaModificado) {
        const resultadoSync = await sincronizarInvitadosYLogistica({
          idEvento,
          idSubEvento: subevento.idSubEvento,
          invitadosActuales: sincronizarInvitados ? invitados : [],
          invitadosIniciales: sincronizarInvitados ? invitadosIniciales : [],
          personalActual: personalLogistica,
          personalInicial: personalLogisticaInicial,
        });
        if (resultadoSync.huboCambiosAplicados) {
          informacionGuardada = true;
        }
        erroresDiferidos = resultadoSync.errores;
        invitadosFallidos = resultadoSync.invitadosNuevosFallidos;
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
              idModalidadAcceso: Number(
                logistica.idModalidadAcceso,
              ) as ModalidadAcceso,
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
            idModalidadAcceso:
              propuesta?.idModalidadAcceso ?? otroSub.idModalidadAcceso,
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
      const valoresActualizadosConMotivo = {
        ...valoresLogisticaActualizados,
        motivoModificacion: "",
      };
      setMotivoUrgente("");
      const subeventoActualizado =
        idSubEventoSeleccionado !== undefined
          ? detalleActualizado.subEventos.find(
              (item) => item.idSubEvento === idSubEventoSeleccionado,
            )
          : detalleActualizado.subEventos[0];
      const propuestaActualizada =
        idSubEventoSeleccionado !== undefined && subeventoActualizado
          ? detalleActualizado.solicitudModificacionPendiente?.subeventosPropuestos.find(
              (item) => item.idSubEvento === subeventoActualizado.idSubEvento,
            )
          : undefined;
      setEvento(detalleActualizado);
      const invitadosServidor =
        subeventoActualizado?.invitados ?? detalleActualizado.invitados ?? [];
      setInvitados([...invitadosServidor, ...invitadosFallidos]);
      setInvitadosIniciales(invitadosServidor);
      setPersonalLogistica(detalleActualizado.personalLogistica ?? []);
      setPersonalLogisticaInicial(detalleActualizado.personalLogistica ?? []);
      setNombre(
        idSubEventoSeleccionado !== undefined
          ? (propuestaActualizada?.nombre ??
              subeventoActualizado?.nombre ??
              detalleActualizado.nombre)
          : detalleActualizado.nombre,
      );
      setDescripcion(
        idSubEventoSeleccionado !== undefined
          ? (propuestaActualizada?.descripcion ??
              subeventoActualizado?.descripcion ??
              detalleActualizado.descripcion)
          : detalleActualizado.descripcion,
      );
      setJustificacion(detalleActualizado.justificacion ?? "");
      setAlcance(detalleActualizado.idAlcance ?? "");
      const valoresLogisticaSincronizados = {
        ...valoresActualizadosConMotivo,
        motivoModificacion: "",
      };
      setLogistica(valoresLogisticaSincronizados);
      setLogisticaInicial(valoresLogisticaSincronizados);
      setMotivoUrgente("");
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

      if (erroresDiferidos.length > 0) {
        setError(erroresDiferidos.join(". "));
      } else {
        setMensaje(
          logisticaModificada
            ? esSubdireccion
              ? "Los cambios se aplicaron directamente con éxito."
              : informacionGeneralModificada
                ? "La información general se guardó y la modificación logística fue enviada a revisión."
                : "La modificación logística fue enviada a revisión."
            : "Los cambios se guardaron correctamente.",
        );
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      {mostrarModalRegreso && (
        <Modal
          mostrarModal={mostrarModalRegreso}
          titulo="Advertencia"
          contenido="¿Estás seguro que deseas regresar? Los cambios realizados se perderán"
          cerrarModal={() => setMostrarModalRegreso(false)}
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
        <PageHeader
          title={
            idSubEventoSeleccionado !== undefined
              ? "Modificar detalles de la actividad"
              : "Modificar detalles del evento"
          }
          back={{
            to: rutaAdministracion,
            label:
              idSubEventoSeleccionado !== undefined
                ? "Volver a mi evento"
                : "Volver a mi evento",
            onClick: (e) => {
              if (logisticaModificada || informacionGeneralModificada) {
                e.preventDefault();
                setMostrarModalRegreso(true);
              }
            },
          }}
        />
        {(previewPosterUrl ?? evento?.posterUrl) && evento && (
          <EventBanner
            eventName={nombre || evento.nombre}
            posterUrl={previewPosterUrl ?? evento.posterUrl}
          />
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
              className="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-5 shadow-md"
            >
              <div className="flex flex-col-reverse gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold sm:text-lg">
                    Modificación logística pendiente de evaluación por
                    Subdirección
                  </h2>
                </div>
                <div>
                  <Badge className="py-1" variant="warning">
                    Solicitud en revisión
                  </Badge>
                </div>
              </div>
              <div className="text-[16px] text-justify break-words">
                <span className="font-semibold">Motivo registrado: </span>
                {evento.solicitudModificacionPendiente.motivoModificacion}
              </div>
              <div className="space-y-2 text-justify">
                <hr className="text-gray-400" />
                <p className="text-xs ">
                  Mientras Subdirección dictamina esta solicitud, el evento
                  conserva vigentes sus fechas y espacios originales. Si
                  realizas otro cambio logístico, se actualizará esta misma
                  solicitud sin generar duplicados.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={manejarEnvio} className="space-y-8">
            <fieldset disabled={guardando} className="space-y-8 border-0 p-0">
              <div
                id="contenedorDatosIniciales"
                className="space-y-2 border border-gray-200 bg-white p-5 shadow-md"
              >
                <div className="relative">
                  <FormField
                    label="Nombre"
                    className="!font-bold !text-black"
                    editable
                    errorMessage={
                      !nombre.trim()
                        ? "El nombre del evento es obligatorio"
                        : ""
                    }
                  >
                    <span className="text-xs">Máximo 150 caracteres</span>
                    <Input
                      id="campoNombre"
                      value={nombre}
                      hasError={intentoGuardar && !nombre.trim()}
                      aria-errormessage="El nombre del evento es obligatorio"
                      maxLength={150}
                      onChange={(event) => setNombre(event.currentTarget.value)}
                    />
                  </FormField>
                </div>

                <div>
                  <div className="relative">
                    <FormField
                      label="Descripción"
                      className="!font-bold !text-black"
                      editable
                      errorMessage={
                        !descripcion.trim()
                          ? "La descripción es obligatoria"
                          : ""
                      }
                    >
                      <span className="text-xs">Máximo 500 caracteres</span>
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

              <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)] xl:gap-12">
                <div className="w-full min-w-0 space-y-10">
                  <div id="contenedorPonentes" className="space-y-5">
                    <div id="contenedorToolTip" className="inline-flex gap-1">
                      <h2 className="text-xl font-bold sm:text-2xl">
                        Ponentes
                      </h2>
                      <InfoTooltip
                        ariaLabel="Información sobre ponentes"
                        content="Los ponentes agregados aquí pertenecen a esta actividad y aparecerán en la ficha pública del evento. Los cambios se aplican al confirmar el guardado"
                      />
                    </div>
                    {ponentes.length > 0 ? (
                      <div className="w-full min-w-0 overflow-x-auto overflow-y-auto max-h-[225px] rounded-md border border-gray-200 shadow-md">
                        <Table
                          columnas={columnasPonente}
                          filas={ponentes}
                          obtenerClave={(ponente) => ponente.id}
                          encabezadoClassName="h-10 border-b border-gray-300"
                          filaClassName="h-12"
                          className="table-auto min-w-full bg-white text-left text-sm [&_th]:py-3 [&_td]:py-3"
                        />
                      </div>
                    ) : (
                      <p className="mt-3 text-gray-600">
                        No hay ponentes registrados para este evento.
                      </p>
                    )}
                    <div>
                      <Button
                        text="Agregar ponente"
                        variant="primary"
                        type="button"
                        onClick={() => setModalPonente(true)}
                      />
                    </div>
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
                      cerrarModal={() => setPersonalAEliminar(null)}
                    >
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          ¿Estás seguro que deseas eliminar al personal{" "}
                          <strong className="text-gray-900">
                            {personalAEliminar.correo}
                          </strong>
                          ? El cambio se aplicará al confirmar los cambios.
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                          <Button
                            text="Cancelar"
                            variant="secondary"
                            type="button"
                            onClick={() => setPersonalAEliminar(null)}
                          />
                          <Button
                            text="Eliminar"
                            variant="danger"
                            type="button"
                            onClick={confirmarEliminarPersonalLogistica}
                          />
                        </div>
                      </div>
                    </Modal>
                  )}
                  {invitadoAEliminar && (
                    <Modal
                      mostrarModal={Boolean(invitadoAEliminar)}
                      titulo="Confirmar eliminación"
                      cerrarModal={() => setInvitadoAEliminar(null)}
                    >
                      <div className="space-y-4">
                        <p className="text-gray-700">
                          ¿Estás seguro de que deseas eliminar al invitado{" "}
                          <strong className="text-gray-900">
                            {invitadoAEliminar.correo}
                          </strong>
                          ? Al confirmar los cambios se revocará su acceso a
                          este evento privado y, si ya había reservado boleto,
                          este será cancelado.
                        </p>
                        <div className="flex justify-end gap-3 pt-2">
                          <Button
                            text="Cancelar"
                            variant="secondary"
                            type="button"
                            onClick={() => setInvitadoAEliminar(null)}
                          />
                          <Button
                            text="Eliminar"
                            variant="danger"
                            type="button"
                            onClick={confirmarEliminarInvitado}
                          />
                        </div>
                      </div>
                    </Modal>
                  )}

                  <div id="contenedorLogistica" className="space-y-5">
                    <h2 className="text-xl font-bold sm:text-2xl">
                      Personal de logística
                    </h2>
                    {personalLogistica.length > 0 ? (
                      <div className="mt-4 w-full min-w-0 overflow-x-auto overflow-y-auto max-h-[225px] rounded-md border border-gray-200 shadow-md">
                        <Table
                          columnas={columnasLogistica}
                          filas={personalLogistica}
                          obtenerClave={(personal) => personal.idUsuario}
                          encabezadoClassName="h-10 border-b border-gray-300"
                          filaClassName="h-12"
                          className="table-auto min-w-full bg-white text-left text-sm [&_th]:py-3 [&_td]:py-3"
                        />
                      </div>
                    ) : (
                      <p className="mt-3 text-gray-600">
                        No hay personal de logística registrado para este
                        evento.
                      </p>
                    )}
                    {idSubEventoSeleccionado === undefined && (
                      <Button
                        text="Agregar personal de logística"
                        variant="primary"
                        type="button"
                        onClick={() => {
                          navigate(
                            `/organizador/administrar-evento/${idEvento}/agregar-logistica`,
                            {
                              state: {
                                returnTo: idSubEventoSeleccionado
                                  ? `/organizador/editar-evento/${idEvento}/subevento/${idSubEventoSeleccionado}`
                                  : `/organizador/editar-evento/${idEvento}`,
                              },
                            },
                          );
                        }}
                      />
                    )}
                  </div>

                  {alcance === AlcanceEvento.PRIVADO && (
                    <div id="contenedorInvitados" className="space-y-5">
                      <div className="flex flex-row gap-2">
                        <h2 className="text-xl font-bold sm:text-2xl">
                          Tus invitados
                        </h2>
                        <InfoTooltip
                          ariaLabel="Atencion"
                          content={
                            "Las invitaciones pueden enviarse cada 8 horas"
                          }
                        />
                      </div>
                      {invitados.length > 0 ? (
                        <div className="mt-4 w-full min-w-0 overflow-x-auto overflow-y-auto max-h-[225px] rounded-md border border-gray-200 shadow-md">
                          <Table
                            columnas={columnasInvitados}
                            filas={invitados}
                            obtenerClave={(invitado) =>
                              invitado.correo ||
                              (invitado.idInvitacionEvento
                                ? String(invitado.idInvitacionEvento)
                                : "") ||
                              String(invitado.idUsuario)
                            }
                            encabezadoClassName="h-10 border-b border-gray-300"
                            filaClassName="h-12"
                            className="table-auto min-w-full bg-white text-left text-sm [&_th]:py-3 [&_td]:py-3"
                          />
                        </div>
                      ) : (
                        <p className="text-sm sm:text-base text-gray-600">
                          No hay invitados registrados para este evento.
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          text="Agregar invitados"
                          variant="primary"
                          type="button"
                          onClick={() => setModalinvitados(true)}
                        />
                        {subevento && (
                          <EnlaceInvitacionSubevento
                            idEvento={evento.idEvento}
                            idSubEvento={subevento.idSubEvento}
                            tokenInvitacion={subevento.tokenInvitacion}
                            enlaceInvitacionActivo={
                              subevento.enlaceInvitacionActivo
                            }
                            disabled={guardando}
                            onActualizado={(datos) => {
                              setEvento((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      subEventos: prev.subEventos.map((s) =>
                                        s.idSubEvento === datos.idSubEvento
                                          ? {
                                              ...s,
                                              tokenInvitacion:
                                                datos.tokenInvitacion,
                                              enlaceInvitacionActivo:
                                                datos.enlaceInvitacionActivo,
                                            }
                                          : s,
                                      ),
                                    }
                                  : prev,
                              );
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}
                  {modalInvitados && (
                    <ModalInvitados
                      mostrarModal={modalInvitados}
                      idEvento={idEvento}
                      idSubEvento={subevento?.idSubEvento}
                      numeroInvitados={invitados.length}
                      foroRecinto={recintoActual?.aforo}
                      correosExistentes={invitados.map((i) => i.correo)}
                      cerrarModal={() => setModalinvitados(false)}
                      guardar={handleGuardarInvitados}
                      onEnvioCompletado={(exitosos) => {
                        const fusionar = (prev: InvitadoEventoItem[]) => {
                          const existentes = new Set(
                            prev.map((i) => normalizarCorreo(i.correo)),
                          );
                          const nuevos = exitosos.filter(
                            (ex) =>
                              !existentes.has(normalizarCorreo(ex.correo)),
                          );
                          return nuevos.length > 0
                            ? [...prev, ...nuevos]
                            : prev;
                        };
                        setInvitados(fusionar);
                        setInvitadosIniciales(fusionar);
                      }}
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
                  avisoImpacto={avisoImpacto}
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
                avisoImpacto={avisoImpacto}
                logistica={logistica}
                nombre={evento.nombre}
                onCerrar={() => {
                  setMostrarModal(false);
                  cambiarLogistica("motivoModificacion", "");
                  setMotivoUrgente("");
                }}
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
                setMotivoUrgente("");
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
