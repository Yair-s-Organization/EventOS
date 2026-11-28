import { FeedbackNotice } from "../../../components/molecules/FeedbackNotice";
import { FormField } from "../../../components/molecules/FormField";
import { Modal } from "../../../components/molecules/Modal";
import { TextArea } from "../../../components/atoms/TextArea/TextArea";
import { Button } from "../../../components/atoms/Button/Button";

import type { EditLogisticsValues } from "./EditLogisticsSection";

export const MARCADOR_MOTIVO_URGENCIA = "\n\nMotivo de urgencia: ";

export interface ModalMotivoProps {
  mostrarModal: boolean;
  mostrarModalAviso: boolean;
  intentoMotivo: boolean;
  esUrgente: boolean;
  avisoImpacto?: string | null;
  logistica: EditLogisticsValues;
  nombre?: string;
  onCerrar: () => void;
  onCerrarAviso: () => void;
  onCambioMotivo: (motivo: string) => void;
  onSolicitarConfirmacion: () => void;
  onConfirmar: () => void;
}
export function ModalMotivo({
  mostrarModal,
  mostrarModalAviso,
  intentoMotivo,
  esUrgente,
  avisoImpacto = null,
  logistica,
  onCerrar,
  onCerrarAviso,
  onCambioMotivo,
  onSolicitarConfirmacion,
  onConfirmar,
  nombre,
}: ModalMotivoProps) {
  return (
    <>
      <Modal
        mostrarModal={mostrarModal}
        titulo="Motivo de modificación"
        contenido={`Ingresa el motivo de la modificación para el evento: ${nombre}`}
        cerrarModal={onCerrar}
      >
        <FormField label="Motivo de modificación" required>
          <span className="text-xs text-gray-500">
            Máximo 500 caracteres y mínimo 10 caracteres
          </span>
          <TextArea
            id="contenedorMotivo"
            className="h-50 resize-none"
            value={logistica.motivoModificacion}
            maxLength={
              esUrgente ? 500 - MARCADOR_MOTIVO_URGENCIA.length - 1 : 500
            }
            onChange={(event) => {
              onCambioMotivo(event.currentTarget.value);
            }}
          />
        </FormField>
        {esUrgente && (
          <p className="text-sm text-amber-800" role="status">
            La fecha propuesta está dentro de los próximos 7 días; se solicitará
            una justificación de urgencia antes de enviar.
          </p>
        )}
        <div className="flex justify-end gap-3">
          <Button
            text="Volver"
            variant="secondary"
            type="button"
            onClick={onCerrar}
          />
          <Button
            text="Continuar"
            variant="primary"
            type="button"
            disabled={logistica.motivoModificacion.trim().length < 10}
            onClick={onSolicitarConfirmacion}
          />
        </div>
      </Modal>

      <Modal
        mostrarModal={mostrarModalAviso}
        titulo="Confirmar modificación de evento"
        contenido="Los cambios que desea realizar requieren una nueva revisión, su evento pasara a pendiente, hasta que subdirección lo vuelva a autorizar"
        cerrarModal={onCerrarAviso}
      >
        {avisoImpacto && (
          <FeedbackNotice
            variant="warning"
            title="Impacto en boletos o registros actuales"
          >
            {avisoImpacto}
          </FeedbackNotice>
        )}
        <div className="flex justify-end gap-3">
          <Button
            text="Volver"
            variant="secondary"
            type="button"
            onClick={onCerrarAviso}
          />
          <Button
            text="Confirmar envío"
            variant="primary"
            type="button"
            onClick={onConfirmar}
          />
        </div>
      </Modal>
    </>
  );
}
