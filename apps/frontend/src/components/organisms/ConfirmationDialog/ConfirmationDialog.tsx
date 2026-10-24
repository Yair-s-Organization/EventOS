
import { useEffect, useId, useRef } from "react";
import { Button } from "../../atoms/Button/Button";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
                                     isOpen,
                                     title,
                                     description,
                                     confirmText = "Confirmar",
                                     cancelText = "Cancelar",
                                     variant = "primary",
                                     isLoading = false,
                                     onConfirm,
                                     onCancel,
                                   }: ConfirmationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    dialog.setAttribute(
      "closedby",
      isLoading ? "none" : "closerequest"
    );

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen, isLoading]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={() => {
        if (isOpen) {
          onCancel();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();

        if (!isLoading) {
          onCancel();
        }
      }}
      className="
        m-auto w-full max-w-md
        rounded-xl border-0 bg-white p-6
        text-gray-900 shadow-xl
        backdrop:bg-black/50
      "
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <h2
            id={titleId}
            className="font-merriweather text-xl font-bold"
          >
            {title}
          </h2>

          <p
            id={descriptionId}
            className="font-merriweather text-sm"
          >
            {description}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Button
            text={cancelText}
            variant="outline"
            disabled={isLoading}
            onClick={onCancel}
          />

          <Button
            text={confirmText}
            variant={variant}
            loading={isLoading}
            disabled={isLoading}
            onClick={onConfirm}
          />
        </div>
      </div>
    </dialog>
  );
}

export default ConfirmationDialog;
