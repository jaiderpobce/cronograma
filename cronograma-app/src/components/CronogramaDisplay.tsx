/**
 * src/components/CronogramaDisplay.tsx
 * Visualizador del grid de turnos.
 * Programador: Ing. Jaider Ponce
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { SupervisorState, TipoDia } from "@/lib/algoritmo"

interface CronogramaDisplayProps {
  datos: SupervisorState[];
}

export function CronogramaDisplay({ datos }: CronogramaDisplayProps) {
  if (datos.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Cronograma Generado</CardTitle>
          <CardDescription>Visualización de los turnos por supervisor.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed">
            <p>Configura los parámetros y haz clic en "Generar Cronograma"</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calcular totales diarios de perforación
  const diasTotales = datos[0].cronograma.length;
  const perforadoresPorDia: number[] = new Array(diasTotales).fill(0);
  
  for (let i = 0; i < diasTotales; i++) {
    let count = 0;
    datos.forEach(sup => {
      if (sup.cronograma[i] === 'P') count++;
    });
    perforadoresPorDia[i] = count;
  }

  const getCellColor = (tipo: TipoDia) => {
    switch (tipo) {
      case 'S': return "bg-blue-100 text-blue-800 border-blue-200";
      case 'I': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'P': return "bg-green-100 text-green-800 border-green-200";
      case 'B': return "bg-orange-100 text-orange-800 border-orange-200";
      case 'D': return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-50 text-gray-400";
    }
  };

  return (
    <Card className="h-full overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
             <div>
                <CardTitle>Cronograma Generado</CardTitle>
                <CardDescription>Ciclos optimizados para cobertura doble.</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
            <div className="min-w-[800px]">
                {/* Cabecera de Días */}
                <div className="flex mb-2">
                    <div className="w-32 flex-shrink-0 font-bold text-sm flex items-center">Día</div>
                    <div className="flex-1 flex gap-1">
                        {Array.from({ length: diasTotales }).map((_, i) => (
                            <div key={i} className="w-8 flex-shrink-0 text-center text-xs text-muted-foreground">
                                {i}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Filas de Supervisores */}
                <div className="space-y-2">
                    {datos.map((sup) => (
                        <div key={sup.id} className="flex items-center">
                            <div className="w-32 flex-shrink-0 font-medium text-sm text-foreground/80">
                                {sup.nombre}
                            </div>
                            <div className="flex-1 flex gap-1">
                                {sup.cronograma.map((dia, index) => (
                                    <div 
                                        key={index} 
                                        className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded border text-xs font-bold transition-all hover:scale-110 cursor-default ${getCellColor(dia)}`}
                                        title={`Día ${index}: ${dia}`}
                                    >
                                        {dia}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Fila de Validación (#P) */}
                <div className="flex items-center mt-4 pt-4 border-t">
                     <div className="w-32 flex-shrink-0 font-bold text-sm text-foreground/80">
                        # Perforando
                    </div>
                    <div className="flex-1 flex gap-1">
                        {perforadoresPorDia.map((count, i) => (
                            <div key={i} className={`w-8 flex-shrink-0 text-center text-xs font-bold ${count === 2 ? 'text-green-600' : 'text-red-500 bg-red-50 rounded'}`}>
                                {count}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
  )
}
