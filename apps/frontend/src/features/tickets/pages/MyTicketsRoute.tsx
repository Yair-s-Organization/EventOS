import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../../components/atoms/Button/Button";
import { useMyTickets } from "../hooks/useMyTickets";
import { ticketsService } from "../services/tickets.service";
import { mapTicketToCard } from "../utils/mapTicketToCard";
import { MyTicketsPage } from "./MyTicketsPage";
import { PageState } from "../../../components/organisms/PageState/PageState";
import { PageContainer } from "../../../components/templates/PageContainer";

export function MyTicketsRoute() {
  const navigate = useNavigate();
  const { tickets, status, error, errorStatus, refresh } = useMyTickets();
  const items = useMemo(() => {
    const priority = { active: 0, "checked-in": 1, cancelled: 2 };
    return tickets.map(mapTicketToCard).sort((a, b) => {
      const difference = priority[a.status] - priority[b.status];
      if (difference !== 0) return difference;
      const dateA = `${a.dateIso ?? ""}T${a.startTime}`;
      const dateB = `${b.dateIso ?? ""}T${b.startTime}`;
      return a.status === "active"
        ? dateA.localeCompare(dateB)
        : dateB.localeCompare(dateA);
    });
  }, [tickets]);

  const cancelTicket = async (id: string) => {
    await ticketsService.cancelTicket(Number(id));
    refresh();
  };

  if (status === "loading") {
    return (
      <PageContainer>
        <PageState
          variant="loading"
          title="Cargando tus boletos..."
        />
      </PageContainer>
    );
  }

  if (status === "error") {
    const requiereLogin =
      errorStatus === 401 ||
      (errorStatus === 403 && !localStorage.getItem("token"));

    return (
      <PageContainer>
        <PageState
          variant="error"
          title={
            requiereLogin
              ? "No se pudo verificar tu sesión"
              : "No se pudieron cargar tus boletos"
          }
          description={error}
          action={
            <>
              <Button text="Reintentar" onClick={refresh} />

              {requiereLogin ? (
                <Link
                  to="/login"
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-eventos-primary px-4 py-2 font-semibold text-eventos-primary hover:bg-eventos-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary"
                >
                  Iniciar sesión
                </Link>
              ) : (
                <Link
                  to="/menu-asistente"
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-eventos-primary px-4 py-2 font-semibold text-eventos-primary hover:bg-eventos-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eventos-primary"
                >
                  Volver al menú
                </Link>
              )}
            </>
          }
        />
      </PageContainer>
    );
  }

  return (
    <MyTicketsPage
      tickets={items}
      onCancelTicket={cancelTicket}
      onViewQr={(id) => navigate(`/asistente/boletos/${id}`)}
    />
  );
}
