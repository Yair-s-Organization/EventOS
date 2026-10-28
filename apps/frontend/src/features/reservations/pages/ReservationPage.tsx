
import { ReservationPanel } from "../components/organisms/ReservationPanel";
import { AutomaticReservationPanel } from "../components/organisms/AutomaticReservationPanel";
import type { SeatMapItem } from "../components/organisms/SeatMap";

interface ReservationDetails {
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
}

interface ManualReservationProps extends ReservationDetails {
  mode: "manual";
  seats: SeatMapItem[];
  aisleAfter?: number[];
  onReserve: (idAsiento: number) => Promise<void>;
}

interface AutomaticReservationProps extends ReservationDetails {
  mode: "automatic";
  onReserve: () => Promise<void>;
}

export type ReservationPageProps =
  | ManualReservationProps
  | AutomaticReservationProps;

export function ReservationPage(props: ReservationPageProps) {
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="font-merriweather text-3xl font-bold">
          Reservar lugar
        </h1>

        <p className="text-lg text-gray-700">
          {props.eventName}
        </p>
      </header>

      {props.mode === "manual" ? (
        <ReservationPanel
          eventName={props.eventName}
          date={props.date}
          startTime={props.startTime}
          endTime={props.endTime}
          venue={props.venue}
          seats={props.seats}
          aisleAfter={props.aisleAfter}
          onReserve={props.onReserve}
        />
      ) : (
        <AutomaticReservationPanel
          eventName={props.eventName}
          date={props.date}
          startTime={props.startTime}
          endTime={props.endTime}
          venue={props.venue}
          onReserve={props.onReserve}
        />
      )}
    </main>
  );
}

export default ReservationPage;
