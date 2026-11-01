import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
  titulo: string;
  contenido?: string;
  children?: ReactNode;
  mostrarModal: boolean;
  cerrarModal: () => void;
  ancho?: "normal" | "amplio";
}

export function Modal({
  titulo,
  contenido,
  children,
  mostrarModal,
  cerrarModal,
  ancho = "normal",
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const tituloId = useId();
  const contenidoId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (mostrarModal && !dialog.open) {
      dialog.showModal();
    } else if (!mostrarModal && dialog.open) {
      dialog.close();
    }
  }, [mostrarModal]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={tituloId}
      aria-describedby={contenidoId}
      onCancel={cerrarModal}
      onClick={(event) => {
        if (event.target === event.currentTarget) cerrarModal();
      }}
      className={`rounded-md m-auto w-[calc(100%-2rem)] ${
        ancho === "amplio" ? "max-w-2xl" : "max-w-lg"
      } border-0 bg-gray p-0 text-gray-900 backdrop:bg-black/50`}
    >
      <div className="bg-white p-6 shadow-xl sm:p-8">
        <h2 id={tituloId} className="mb-3 font-merriweather font-bold">
          {titulo}
        </h2>
        <p id={contenidoId} className="mb-6 font-merriweather">
          {contenido}
        </p>
        {children}
      </div>
    </dialog>
  );
}
