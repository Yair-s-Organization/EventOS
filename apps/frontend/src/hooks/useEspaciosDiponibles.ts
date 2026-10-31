import { useState, useEffect } from "react";

export interface EspacioDisponible {
  id: number;
  nombre: string;
  tipo: string;
  aforo: string;
  estado: string;
}

export function useEspaciosDisponibles() {
  const [espacios, setEspacios] = useState<EspacioDisponible[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEspacios = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:3000/api/espacios/disponibles", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("No se pudo obtener el listado de espacios disponibles.");
        }

        const data = await response.json();
        
        const listaEspacios = Array.isArray(data) ? data : data.espacios || [];
        const espaciosHabilitados = listaEspacios.filter(
          (espacio: EspacioDisponible) => espacio.estado === "Habilitado"
        );

        setEspacios(espaciosHabilitados);
      } catch (err: any) {
        setError(err.message || "Error al conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchEspacios();
  }, []);

  return { espacios, loading, error };
}