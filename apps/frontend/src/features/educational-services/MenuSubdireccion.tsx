import Button from "../../components/atoms/Button/Button";
import { SeccionEventosProximos } from "../../components/organisms/MenuSubdireccion/SeccionEventosProximos";
import { SeccionMisEventos} from "../../components/organisms/MenuSubdireccion/SeccionMisEventos"

export function MenuSubdireccion() {
  return (
    <section className="space-y-5">
      <h1 className="font-merriweather font-bold text-[36px]">
        Menú principal
      </h1>
      <h2 className="font-merriweather font-semibold text-[24px]">
        Eventos Próximos
      </h2>
      <SeccionEventosProximos />
      <h2 className="font-merriweather font-semibold text-[24px]">
        Mis eventos
      </h2>
      <SeccionMisEventos />
      <Button text="Ver todos mis eventos" variant="primary" type="button"></Button>
    </section>
  );
}
