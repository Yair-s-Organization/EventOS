import React, { useState, useEffect } from "react";
import { Button } from "../../components/atoms/Button/Button";

export function MenuAsistente() {
  const [eventosProximos, setEventosProximos] = useState<any[]>([]);
  const [miAgenda, setMiAgenda] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Prueba con datos precargados
    setTimeout(() => {
      setEventosProximos([
        {
          id: 1,
          titulo: "Numeros Complejos",
          imagen: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&auto=format&fit=crop&q=60",
          fecha: "28/10/2026",
          horario: "10:00-12:00hrs",
          espacio: "Auditorio",
          tipo: "Público",
        },
        {
            id: 2,
            titulo: "Economía Circular",
            imagen: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&auto=format&fit=crop&q=60",
            fecha: "29/10/2026",
            horario: "15:00-19:00hrs",
            espacio: "Sala 14",
            tipo: "Público",
        },
        {
            id: 3,
            titulo: "Taller de Computación",
            imagen: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60",
            fecha: "30/10/2026",
            horario: "10:00-13:00hrs",
            espacio: "Laboratorio 1105",
            tipo: "Público",
        },    
      ]);
      
      setMiAgenda([
        {
            id: 1,
            subtitulo: "Feria de Sistemas Computacionales",
            titulo: "Taller IA",
            imagen: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&auto=format&fit=crop&q=60",
            fecha: "28/10/2026",
            horario: "17:00-18:00 hrs",
            espacio: "Laboratorio 1104",
            tipo: "Público",
            estado: "Activo",
        },
      ]); 
      
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return <div className="p-8 text-center font-merriweather text-gray-600">Cargando menú...</div>;
  }

  return (
    <div className="space-y-10 font-merriweather text-gray-800">
      
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-merriweather">
          Eventos Próximos
        </h2>

        {eventosProximos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosProximos.map((evento) => (
              <div 
                key={evento.id} 
                className="bg-white rounded-md border border-gray-300 shadow-sm overflow-hidden flex flex-col justify-between p-4"
              >
                <div>
                  <div className="h-40 w-full mb-4 overflow-hidden rounded bg-gray-100">
                    <img src={evento.imagen} alt={evento.titulo} className="w-full h-full object-cover" />
                  </div>
                  <div className="mb-2">
                    <span className="inline-block bg-[#f9ebee] text-[#8a3b53] text-xs font-semibold px-2.5 py-0.5 rounded border border-[#e6d0d5]">
                      {evento.tipo}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3 font-merriweather">
                    {evento.titulo}
                  </h3>
                  <div className="text-xs text-gray-600 space-y-1 mb-6">
                    <p><span className="font-semibold">Fecha:</span> {evento.fecha}</p>
                    <p><span className="font-semibold">Horario:</span> {evento.horario}</p>
                    <p><span className="font-semibold">Espacio:</span> {evento.espacio}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    text="Ver detalles" 
                    variant="primary" 
                    size="sm"
                    className="bg-[#5c1d33] hover:bg-[#4a1c2d] text-white text-xs px-4 py-2 rounded"
                    onClick={() => console.log(`Ver detalles de ${evento.titulo}`)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-dashed border-gray-300 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-14 h-14 text-gray-700 mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p className="font-bold text-lg text-gray-900 font-merriweather">Sin eventos próximos</p>
          </div>
        )}
      </section>

      <section className="pt-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6 font-merriweather">
          Mi Agenda
        </h2>

        {miAgenda.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {miAgenda.map((agenda) => (
              <div 
                key={agenda.id} 
                className="bg-white rounded-md border border-gray-300 shadow-sm overflow-hidden flex flex-col justify-between p-4"
              >
                <div>
                  <div className="h-40 w-full mb-4 overflow-hidden rounded bg-gray-100">
                    <img src={agenda.imagen} alt={agenda.titulo} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block bg-[#f9ebee] text-[#8a3b53] text-xs font-semibold px-2.5 py-0.5 rounded border border-[#e6d0d5]">
                      {agenda.tipo}
                    </span>
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-emerald-200">
                      {agenda.estado}
                    </span>
                  </div>

                  <p className="text-xs text-teal-800 font-medium mb-1">{agenda.subtitulo}</p>
                  <h3 className="font-bold text-lg text-gray-900 mb-3 font-merriweather">
                    {agenda.titulo}
                  </h3>
                  <div className="text-xs text-gray-600 space-y-1 mb-6">
                    <p><span className="font-semibold">Fecha:</span> {agenda.fecha}</p>
                    <p><span className="font-semibold">Horario:</span> {agenda.horario}</p>
                    <p><span className="font-semibold">Espacio:</span> {agenda.espacio}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <Button 
                    text="Ver QR" 
                    variant="primary" 
                    size="sm"
                    className="bg-[#5c1d33] hover:bg-[#4a1c2d] text-white text-xs px-3 py-1.5 rounded w-auto"
                    onClick={() => console.log("Ver QR")}
                  />
                  <Button 
                    text="Cancelar Asistencia" 
                    variant="primary" 
                    size="sm"
                    className="bg-[#5c1d33] hover:bg-[#4a1c2d] text-white text-xs px-3 py-1.5 rounded w-auto"
                    onClick={() => console.log("Cancelar Asistencia")}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-dashed border-gray-300 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-14 h-14 text-gray-700 mb-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p className="font-bold text-lg text-gray-900 font-merriweather">Sin eventos agendados</p>
            <p className="text-xs text-gray-500 mt-1 font-merriweather">Explora los eventos disponibles y regístrate</p>
          </div>
        )}
      </section>

    </div>
  );
}

export default MenuAsistente;