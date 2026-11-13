import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Clock, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import { Button } from "../../components/atoms/Button/Button";
import { Modal } from "../../components/molecules/Modal";
import { API_BASE_URL } from "../../lib/apiClient";
import type { SolicitudVerificacionItem } from "@eventos/shared";

function formatearFechaSolicitud(fechaStr?: string | Date | null): string {
  if (!fechaStr) return "-";
  if (typeof fechaStr === "string" && fechaStr.includes("T")) {
    const soloFecha = fechaStr.split("T")[0];
    const partes = soloFecha.split("-");
    if (partes.length === 3) {
      const [anio, mes, dia] = partes;
      return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${anio.slice(-2)}`;
    }
  }
  if (typeof fechaStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    const partes = fechaStr.split("-");
    const [anio, mes, dia] = partes;
    return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${anio.slice(-2)}`;
  }
  const d = new Date(fechaStr);
  if (isNaN(d.getTime())) return String(fechaStr);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const anio = String(d.getFullYear()).slice(-2);
  return `${dia}/${mes}/${anio}`;
}

export function DetalleVerificacion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [solicitud, setSolicitud] = useState<SolicitudVerificacionItem | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [procesando, setProcesando] = useState(false);
  const [mostrarModalRechazar, setMostrarModalRechazar] = useState(false);
  const [mostrarModalAprobar, setMostrarModalAprobar] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [detalleRechazo, setDetalleRechazo] = useState("");
  const [errorRechazo, setErrorRechazo] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const getToken = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    return usuario.token || localStorage.getItem("token") || "";
  };

  const cargarDetalle = useCallback(async () => {
    if (!id) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/usuarios/verificaciones/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) {
        throw new Error("No se pudo cargar la información de la solicitud.");
      }

      const data = await res.json();
      setSolicitud(data);
    } catch (err: any) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]);

  const handleConfirmarAprobar = async () => {
    if (!solicitud) return;
    setProcesando(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/usuarios/verificaciones/${solicitud.idVerificacion}/aprobar`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Error al aprobar la verificación.");
      }

      setMensajeExito("¡Usuario verificado con éxito!");
      setMostrarModalAprobar(false);
      setSolicitud((prev) => (prev ? { ...prev, estado: "Verificado" } : null));

      setTimeout(() => {
        navigate("/subdireccion/verificaciones");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "No se pudo aprobar la verificación.");
      setMostrarModalAprobar(false);
    } finally {
      setProcesando(false);
    }
  };

  const handleConfirmarRechazo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!solicitud) return;
    setErrorRechazo(null);

    if (!motivoRechazo) {
      setErrorRechazo("Por favor selecciona un motivo de rechazo.");
      return;
    }

    if (motivoRechazo === "Otro motivo" && !detalleRechazo.trim()) {
      setErrorRechazo("Debes escribir el detalle u observaciones adicionales cuando seleccionas Otro motivo.");
      return;
    }

    setProcesando(true);
    try {
      const payload = {
        motivo: motivoRechazo,
        detalle: detalleRechazo.trim() || null,
      };

      const res = await fetch(
        `${API_BASE_URL}/usuarios/verificaciones/${solicitud.idVerificacion}/rechazar`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Error al rechazar la solicitud.");
      }

      setMensajeExito("Solicitud de verificación rechazada correctamente.");
      setMostrarModalRechazar(false);

      setTimeout(() => {
        navigate("/subdireccion/verificaciones");
      }, 1500);
    } catch (err: any) {
      setErrorRechazo(err.message || "Error al procesar el rechazo.");
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex min-h-100 items-center justify-center font-merriweather text-gray-600 gap-3">
        <Clock className="w-6 h-6 animate-spin text-[#5F1B36]" />
        <span>Cargando datos de la verificación...</span>
      </div>
    );
  }

  if (error || !solicitud) {
    return (
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 space-y-4 font-merriweather pt-6">
        <button
          onClick={() => navigate("/subdireccion/verificaciones")}
          className="flex items-center text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Volver a solicitudes</span>
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
          <p className="font-semibold text-lg">Error al cargar la solicitud</p>
          <p className="text-sm mt-1">{error || "No se encontró la solicitud de verificación especificada."}</p>
        </div>
      </div>
    );
  }

  const esPendiente = solicitud.estado === "Pendiente";

  const renderDatoEspecifico = () => {
    const rol = (solicitud.perfilSolicita || "").toLowerCase();
    if (rol.includes("estudiante")) {
      return (
        <p>
          <span className="font-bold">Número de boleta:</span>{" "}
          <span>{solicitud.numeroBoleta || solicitud.informacionAdicional || "-"}</span>
        </p>
      );
    }
    if (rol.includes("docente") || rol.includes("profesor")) {
      return (
        <p>
          <span className="font-bold">Número de empleado:</span>{" "}
          <span>{solicitud.informacionAdicional || solicitud.numeroBoleta || "-"}</span>
        </p>
      );
    }
    if (rol.includes("empresa")) {
      return (
        <p>
          <span className="font-bold">Nombre de empresa o dependencia:</span>{" "}
          <span>{solicitud.informacionAdicional || "-"}</span>
        </p>
      );
    }
    return (
      <p>
        <span className="font-bold">Información adicional:</span>{" "}
        <span>{solicitud.informacionAdicional || "Identificación oficial"}</span>
      </p>
    );
  };

  return (
    <section className="max-w-full sm:px-10 lg:px-12 space-y-4 font-merriweather pb-10 pt-2">
      <div>
        <button
          onClick={() => navigate("/subdireccion/verificaciones")}
          className="flex items-center text-[20px] font-semibold text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Volver a solicitudes</span>
        </button>
      </div>

      {mensajeExito && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span className="font-semibold">{mensajeExito}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-merriweather font-bold text-3xl md:text-[34px] text-gray-900 leading-tight">
            Verificación de usuario
          </h1>
          <p className="font-merriweather text-sm md:text-base text-gray-600 mt-1">
            Evalúa los datos y el documento probatorio para validar la cuenta
          </p>
        </div>

        <div>
          {esPendiente ? (
            <span className="inline-flex items-center justify-center rounded-md bg-[#B59A2A] px-6 py-1.5 text-sm font-semibold text-white shadow-sm font-merriweather">
              Pendiente
            </span>
          ) : (
            <span className="inline-flex items-center justify-center rounded-md bg-[#2D6A28] px-6 py-1.5 text-sm font-semibold text-white shadow-sm font-merriweather">
              Verificado
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <h2 className="font-merriweather font-bold text-xl text-gray-900">
              Datos del solicitante
            </h2>

            <div className="space-y-2.5 font-merriweather text-[18px] text-gray-800">
              <p>
                <span className="font-bold">Fecha de solicitud:</span>{" "}
                <span>{formatearFechaSolicitud(solicitud.fechaSolicitud)}</span>
              </p>

              <p>
                <span className="font-bold">Perfil que solicita:</span>{" "}
                <span>{solicitud.perfilSolicita}</span>
              </p>

              <p>
                <span className="font-bold">Nombre:</span>{" "}
                <span>{solicitud.nombre}</span>
              </p>

              <p>
                <span className="font-bold">Correo:</span>{" "}
                <span>{solicitud.correo}</span>
              </p>

              {renderDatoEspecifico()}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setMostrarModalAprobar(true)}
              disabled={procesando || !esPendiente}
              className="rounded-md bg-[#2D6A28] hover:bg-[#255721] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50 font-merriweather"
            >
              Verificar usuario
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorRechazo(null);
                setMotivoRechazo("");
                setDetalleRechazo("");
                setMostrarModalRechazar(true);
              }}
              disabled={procesando || !esPendiente}
              className="rounded-md bg-[#9A2633] hover:bg-[#801f2a] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50 font-merriweather"
            >
              Rechazar
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 w-full min-h-130 bg-eventos-divider rounded-2xl border border-gray-300 shadow-inner flex flex-col justify-center items-center overflow-hidden">
          {solicitud.archivo ? (
            solicitud.archivo.startsWith("data:application/pdf") ||
            solicitud.archivo.toLowerCase().includes(".pdf") ? (
              <iframe
                src={solicitud.archivo}
                title="Documento probatorio adjunto"
                className="w-full h-full min-h-130 border-0 bg-white"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-0 text-center">
                <img
                  src={solicitud.archivo}
                  alt="Comprobante probatorio"
                  className="max-h-120 w-auto object-contain rounded-xl shadow-md"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 p-8 text-center space-y-2">
              <FileText className="w-16 h-16 text-gray-400" />
              <p className="font-merriweather font-medium text-base text-gray-700">
                Documento probatorio adjunto
              </p>
              <p className="text-sm text-gray-500 max-w-xs">
                No se encontró un documento probatorio legible en esta solicitud.
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal
        titulo="Rechazar verificación de usuario"
        contenido="Indica el motivo por el cual se rechaza la verificación de la cuenta."
        mostrarModal={mostrarModalRechazar}
        cerrarModal={() => {
          if (!procesando) {
            setMostrarModalRechazar(false);
            setErrorRechazo(null);
          }
        }}
      >
        <form onSubmit={handleConfirmarRechazo} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="motivoRechazo"
              className="font-merriweather text-sm font-bold text-gray-800"
            >
              Motivo de rechazo <span className="text-eventos-error">*</span>
            </label>
            <select
              id="motivoRechazo"
              value={motivoRechazo}
              onChange={(e) => {
                setMotivoRechazo(e.target.value);
                if (errorRechazo) setErrorRechazo(null);
              }}
              className="w-full rounded-md border border-gray-400 bg-white p-2.5 text-sm font-merriweather text-gray-900 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option value="" disabled>
                Selecciona un motivo...
              </option>
              <option value="Documento probatorio ilegible o incompleto">
                Documento probatorio ilegible o incompleto
              </option>
              <option value="Credencial/Comprobante no vigente">
                Credencial/Comprobante no vigente
              </option>
              <option value="Numero de boleta no coincide con el documento">
                Número de boleta no coincide con el documento
              </option>
              <option value="El archivo adjunto no corresponde a un documento oficial">
                El archivo adjunto no corresponde a un documento oficial
              </option>
              <option value="Otro motivo">Otro motivo</option>
            </select>
          </div>

          {motivoRechazo === "Otro motivo" && (
            <div className="flex flex-col gap-1">
              <label
                htmlFor="detalleRechazo"
                className="font-merriweather text-sm font-bold text-gray-800"
              >
                Detalle u observaciones adicionales <span className="text-eventos-error">*</span>
              </label>
              <textarea
                id="detalleRechazo"
                rows={4}
                value={detalleRechazo}
                onChange={(e) => {
                  setDetalleRechazo(e.target.value);
                  if (errorRechazo) setErrorRechazo(null);
                }}
                placeholder="Escribe las razones específicas del rechazo..."
                className="w-full rounded-md border border-gray-400 bg-white p-2.5 text-sm font-merriweather text-gray-900 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
          )}

          {errorRechazo && (
            <div className="flex items-center gap-2 text-sm font-merriweather text-eventos-error bg-red-50 p-2.5 rounded border border-red-200">
              <AlertCircle size={16} />
              <span>{errorRechazo}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              text="Cancelar"
              type="button"
              variant="primary"
              className="px-5 py-2"
              disabled={procesando}
              onClick={() => {
                setMostrarModalRechazar(false);
                setErrorRechazo(null);
              }}
            />
            <Button
              text="Confirmar rechazo"
              type="submit"
              variant="primary"
              className="px-5 py-2"
              loading={procesando}
              loadingText="Rechazando..."
            />
          </div>
        </form>
      </Modal>

      <Modal
        titulo="Confirmar verificación"
        contenido={`¿Deseas aprobar la verificación para ${solicitud.nombre} con el perfil de ${solicitud.perfilSolicita}?`}
        mostrarModal={mostrarModalAprobar}
        cerrarModal={() => {
          if (!procesando) setMostrarModalAprobar(false);
        }}
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button
            text="Cancelar"
            type="button"
            variant="outline"
            className="px-5 py-2"
            disabled={procesando}
            onClick={() => setMostrarModalAprobar(false)}
          />
          <Button
            text="Aprobar usuario"
            type="button"
            variant="success"
            className="bg-[#2D6A28] hover:bg-[#255721] text-white px-5 py-2"
            loading={procesando}
            loadingText="Aprobando..."
            onClick={handleConfirmarAprobar}
          />
        </div>
      </Modal>
    </section>
  );
}

export default DetalleVerificacion;