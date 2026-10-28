import type { ReactNode } from "react";

export type Columna<T> = {
  id: string;
  encabezado: string;
  render: (fila: T) => ReactNode;
  resaltar?: boolean;
};

type TableProps<T> = {
  columnas: Columna<T>[];
  filas: T[];
  obtenerClave: (fila: T) => string | number;
  className?: string;
};

export function Table<T>({
  columnas,
  filas,
  obtenerClave,
  className = "",
}: TableProps<T>) {
  return (
    <table className={className}>
      <thead>
        <tr className="h-[120px]">
          {columnas.map((columna) => (
            <th key={columna.id}>{columna.encabezado}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y">
        {filas.map((fila) => (
          <tr className="h-[120px]" key={obtenerClave(fila)}>
            {columnas.map((columna) => (
              <td key={columna.id}>
                {columna.resaltar ? (
                  <div className="inline-block max-w-full rounded-md bg-gray-100 px-4 py-3">
                    {columna.render(fila)}
                  </div>
                ) : (
                  columna.render(fila)
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
