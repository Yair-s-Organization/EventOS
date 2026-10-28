
import { useEffect, useId, useRef } from "react";
import { Button } from "../../../../components/atoms/Button/Button";

export interface ReservationSuccessDialogProps {
  isOpen: boolean;
  eventName: string;
  seatLabel?: string | null;
  onClose: () => void;
  onViewTicket?: () => void;
}

export function ReservationSuccessDialog({
                                           isOpen,
                                           eventName,
                                           seatLabel,
                                           onClose,
                                           onViewTicket,
                                         }: ReservationSuccessDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="
        m-auto w-full max-w-md rounded-xl
        border-0 bg-white p-6 text-gray-900
        shadow-xl backdrop:bg-black/50
      "
    >
      <div className="space-y-5">
        <div className="space-y-3 text-center">
          <div
            aria-hidden="true"
            className="
              mx-auto flex h-14 w-14
              items-center justify-center rounded-full
              bg-eventos-secondary-light
              text-2xl text-secondary
            "
          >
            ✓
          </div>

          <h2
            id={titleId}
            className="font-merriweather text-xl font-bold"
          >
            Lugar asignado
          </h2>

          <p
            id={descriptionId}
            className="font-merriweather text-sm"
          >
            Tu reservación para {eventName} se
            registró correctamente.
            {seatLabel && (
              <span className="mt-2 block font-semibold">
                Asiento: {seatLabel}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {onViewTicket && (
            <Button
              text="Ver código QR"
              variant="outline"
              onClick={onViewTicket}
            />
          )}

          <Button
            text="Aceptar"
            onClick={onClose}
          />
        </div>
      </div>
    </dialog>
  );
}

export default ReservationSuccessDialog;
