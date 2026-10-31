import Button from "../../components/atoms/Button/Button";
import { SeccionSolicitudesPendientes } from "../../components/organisms/MenuSubdireccion/SeccionSolicitudesPendientes";
import { AgendaRecinto } from "../../components/organisms/AgendaRecinto/AgendaRecinto";
import { CardMetricas } from "../../components/molecules/CardMetricas";

export function MenuSubdireccion() {
  return (
    <section className="space-y-5">
      <h1 className="font-merriweather font-bold text-[36px]">
        Menú principal
      </h1>
      <h2 className="font-merriweather text-[24px]">Metricas</h2>
      <div
        id="contenedorMetricas"
        className="grid grid-cols-3 justify-items-center">
        <CardMetricas titulo="Solicitudes pendientes" variant="primary">
          <span className="text-merriweather font-bold text-3xl">3</span>
        </CardMetricas>
        <CardMetricas titulo="Eventos del mes" variant="primary">
          <span className="text-merriweather font-bold text-3xl">6</span>{" "}
        </CardMetricas>
        <CardMetricas titulo="Cuentas por verificar" variant="primary">
          <span className="text-merriweather font-bold text-3xl">0</span>{" "}
        </CardMetricas>
      </div>
      <h2 className="font-merriweather text-[24px]">
        Agenda de los recintos del día de hoy
      </h2>
      <div
        id="contenedorAgendaRecintos"
        className="grid grid-cols-1 items-start justify-items-center gap-[60px] md:grid-cols-2">
        <div className="flex flex-col gap-[60px]">
          <AgendaRecinto titulo="Auditorio" />
          <AgendaRecinto titulo="Laboratorio 1103" />
        </div>
        <div className="flex flex-col gap-[60px]">
          <AgendaRecinto titulo="Sala 14" />
          <AgendaRecinto titulo="Laboratorio 1104" />
        </div>
      </div>
      <h2 className="font-merriweather text-[24px]">
        Solicitudes pendientes recientes
      </h2>
      <SeccionSolicitudesPendientes />
      <Button
        text="Ver todos mis eventos"
        variant="primary"
        type="button"></Button>
    </section>
  );
}
