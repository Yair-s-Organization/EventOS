import { useState } from "react";
import Button from "../../../components/atoms/Button/Button";
import { Input } from "../../../components/atoms/Input/Input";
import { Modal } from "../../../components/molecules/Modal";
import { FormField } from "../../../components/molecules/FormField";
import { Table } from "../../../components/organisms/Table/Table";
import type { Columna } from "../../../components/organisms/Table/Table";
import { useNavigate } from "react-router";

export interface TablaInvitados {
  id: number;
  nombre: string;
  correo: string;
}

interface ModalInvitadosProps {
  mostrarModal: boolean;
  cerrarModal: () => void;
  guardar: (ModalInvitados: TablaInvitados[]) => void;
}

export function ModalInvitados({
  mostrarModal,
  cerrarModal,
  guardar: guardar,
}: ModalInvitadosProps) {
  const [nombreInvitado, setNombreInvitado] = useState("");
  const [correoInvitado, setCorreoInvitado] = useState("");
  const [errorInvitado, setErrorInvitado] = useState<string | null>(null);
  const [errorCorreo, setErrorCorreo] = useState<string | null>(null);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const navigate = useNavigate();

  const [invitadosTemporales, setInvitadosTemporales] = useState<
    TablaInvitados[]
  >([]);
  const handleAgregarInvitadoTemporal = () => {
    let hayError = false;
    /*    if (!nombrePonente.trim()) {
      setErrorPonente("El nombre del ponente no puede estar vacío");
      hayError = true;
    } else {
      setErrorPonente(null);
    } */
    const correoLimpio = correoInvitado.trim();
    if (!correoLimpio) {
      setErrorCorreo("El correo no puede estar vacío");
      hayError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
      setErrorCorreo("El formato del correo electrónico no es válido.");
      hayError = true;
    } else {
      setErrorCorreo(null);
    }
    if (hayError) return;
    const nuevo: TablaInvitados = {
      id: Date.now(),
      nombre: nombreInvitado.trim(),
      correo: correoLimpio,
    };
    setInvitadosTemporales((prev) => [...prev, nuevo]);
    setNombreInvitado("");
    setCorreoInvitado("");
    setErrorInvitado(null);
    setErrorCorreo(null);
  };
  const handleEliminarInvitadoTemporal = (id: number) => {
    setInvitadosTemporales((prev) => prev.filter((p) => p.id !== id));
  };

  const handleGuardar = () => {
    guardar(invitadosTemporales);
    handleCerrar();
  };

  const handleSolicitarCerrar = () => {
    if (invitadosTemporales.length > 0) {
      setModalConfirmar(true);
    } else {
      handleCerrar();
    }
  };

  const handleCerrar = () => {
    setInvitadosTemporales([]);
    setNombreInvitado("");
    setCorreoInvitado("");
    setErrorInvitado(null);
    setErrorCorreo(null);
    setModalConfirmar(false);
    cerrarModal();
  };

  const columnasInvitadoModal: Columna<TablaInvitados>[] = [
    {
      id: "correo",
      encabezado: "Correo",
      render: (p) => p.correo,
      className: "px-3 py-2",
    },
    {
      id: "acciones",
      encabezado: "Acción",
      render: (p) => (
        <Button
          text="Quitar"
          variant="danger"
          type="button"
          onClick={() => handleEliminarInvitadoTemporal(p.id)}
        />
      ),
      className: "w-24 px-3 py-2 text-center",
    },
  ];

  return (
    <>
      <Modal
        mostrarModal={mostrarModal && !modalConfirmar}
        titulo="Agregar invitados"
        contenido="Agrega el nombre y el correo del invitado"
        cerrarModal={handleCerrar}
      >
        <div className="mt-4">
          <h4 className="mb-2 text-sm">
            Invitados agregados ({invitadosTemporales.length})
          </h4>
          {invitadosTemporales.length > 0 ? (
            <div className="max-h-52 overflow-y-auto rounded-md border border-gray-200">
              <Table
                columnas={columnasInvitadoModal}
                filas={invitadosTemporales}
                obtenerClave={(p) => p.id}
                className="table-auto min-w-full bg-white text-left text-sm [&_tbody_tr]:h-12 [&_thead_tr]:h-10 [&_th]:py-2 [&_td]:py-2table-auto min-w-full bg-white text-left text-sm"
              />
            </div>
          ) : (
            <p className="rounded-md border border py-3 text-center text-sm  text-gray-500">
              Aún no has añadido invitados a la lista.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            {/*             <FormField
              htmlFor="campoNombre"
              label="Nombre del ponente"
              errorMessage={errorPonente ?? undefined}
            >
              <Input
                id="campoNombre"
                value={nombrePonente}
                onChange={(e) => {
                  setNombrePonente(e.target.value);
                  if (errorPonente) {
                    setErrorPonente(null);
                  }
                }}
                maxLength={150}
                placeholder="Ej. Dr. Juan Pérez"
              />
            </FormField> */}
            <FormField
              htmlFor="campoCorreo"
              label="Correo electrónico"
              errorMessage={errorCorreo ?? undefined}
            >
              <Input
                id="campoCorreo"
                type="email"
                value={correoInvitado}
                onChange={(e) => {
                  setCorreoInvitado(e.target.value);
                  if (errorCorreo) {
                    setErrorCorreo(null);
                  }
                }}
                maxLength={150}
                placeholder="ejemplo@ipn.mx"
              />
            </FormField>
          </div>

          <div className="flex justify-between gap-2 border-t border-gray-100 pt-4">
            <div className="flex justify-end">
              <Button
                text="Agregar invitado"
                variant="primary"
                type="button"
                className="cursor-pointer"
                onClick={handleAgregarInvitadoTemporal}
              />
            </div>
            <div className="flex gap-3">
              <Button
                text="Volver"
                variant="secondary"
                type="button"
                className="cursor-pointer"
                onClick={handleSolicitarCerrar}
              />
              <Button
                text="Guardar"
                variant="success"
                type="button"
                className="cursor-pointer"
                onClick={handleGuardar}
                disabled={invitadosTemporales.length === 0}
              />
            </div>
          </div>
        </div>
      </Modal>

      {modalConfirmar && (
        <Modal
          mostrarModal={modalConfirmar}
          titulo="Advertencia"
          contenido="¿Estás seguro que deseas salir? Los invitados que agregaste a la lista se perderán."
          cerrarModal={() => setModalConfirmar(false)}
        >
          <div className="flex justify-end gap-3 pt-2">
            <Button
              text="Cancelar"
              variant="secondary"
              type="button"
              onClick={() => setModalConfirmar(false)}
            />
            <Button
              text="Descartar y salir"
              variant="danger"
              type="button"
              onClick={handleCerrar}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
