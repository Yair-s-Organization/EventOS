import { useNavigate } from "react-router";

import { DigitalTicketView } from "../components/organisms/DigitalTicketView";

export function DigitalTicketDemoPage() {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-8">
      <DigitalTicketView
        eventName="Conferencia de Inteligencia Artificial"
        date="05/11/2026"
        startTime="10:00"
        endTime="12:00"
        venue="Auditorio ESCOM"
        attendeeName="Persona de prueba"
        status="active"
        assignment={{
          kind: "seat",
          label: "G12",
        }}
        onBack={() => navigate("/demo-boletos")}
      />
    </div>
  );
}

export default DigitalTicketDemoPage;