import { useState } from "react";
import { Button } from "../../../components/atoms/Button/Button";
import { ReservationPage } from "./ReservationPage";

import type { SeatMapItem } from "../components/organisms/SeatMap";

async function simulateAutomaticReservation(): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 800);
  });
}

function createMockSeats(): SeatMapItem[] {
  const seats: SeatMapItem[] = [];

  const rows = "KJIHGFEDCBA".split("");

  const occupiedSeats = new Set([
    "A3",
    "B2",
    "F16",
    "J7",
    "C20",
  ]);

  let nextSeatId = 1;

  for (const fila of rows) {
    for (let numero = 1; numero <= 23; numero++) {
      const label = `${fila}${numero}`;

      seats.push({
        idAsiento: nextSeatId,
        fila,
        numero,
        occupied: occupiedSeats.has(label),
      });

      nextSeatId++;
    }
  }

  return seats;
}

const mockSeats = createMockSeats();

async function simulateReservation(
  idAsiento: number,
): Promise<void> {
  console.log("Reserving seat:", idAsiento);

  await new Promise<void>((resolve) => {
    setTimeout(resolve, 800);
  });

  const selectedSeat = mockSeats.find(
    (seat) => seat.idAsiento === idAsiento,
  );

  if (selectedSeat?.fila === "B" && selectedSeat.numero === 3) {
    throw new Error("Simulated reservation failure");
  }
}

export function ReservationDemoPage() {
  const [mode, setMode] = useState<"manual" | "automatic">(
    "manual",
  );

  return (
    <div>
      <div className="mx-auto flex max-w-6xl flex-wrap gap-3 px-4 pt-6">
        <Button
          text="Probar Auditorio"
          variant={mode === "manual" ? "primary" : "outline"}
          onClick={() => setMode("manual")}
        />

        <Button
          text="Probar Sala 14"
          variant={mode === "automatic" ? "primary" : "outline"}
          onClick={() => setMode("automatic")}
        />
      </div>

      {mode === "manual" ? (
        <ReservationPage
          key="manual"
          mode="manual"
          eventName="Conferencia de Inteligencia Artificial"
          date="2026-11-05"
          startTime="10:00"
          endTime="12:00"
          venue="Auditorio ESCOM"
          seats={mockSeats}
          aisleAfter={[6, 17]}
          onReserve={simulateReservation}
        />
      ) : (
        <ReservationPage
          key="automatic"
          mode="automatic"
          eventName="Taller de Programación"
          date="2026-11-06"
          startTime="11:00"
          endTime="13:00"
          venue="Sala 14"
          onReserve={simulateAutomaticReservation}
        />
      )}
    </div>
  );
}
