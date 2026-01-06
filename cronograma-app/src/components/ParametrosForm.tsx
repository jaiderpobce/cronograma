/**
 * src/components/ParametrosForm.tsx
 * Formulario para la configuración de parámetros del cronograma.
 * Programador: Ing. Jaider Ponce
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CronogramaGenerator } from "@/lib/algoritmo"
import type { SupervisorState } from "@/lib/algoritmo"

interface ParametrosFormProps {
  onGenerar: (data: SupervisorState[]) => void;
}

export function ParametrosForm({ onGenerar }: ParametrosFormProps) {
  const [diasTrabajo, setDiasTrabajo] = useState(14)
  const [diasDescanso, setDiasDescanso] = useState(7)
  const [diasInduccion, setDiasInduccion] = useState(5)
  const [totalDias, setTotalDias] = useState(30)

  const handleGenerar = () => {
    // Instanciar generador con los parámetros ingresados
    const generator = new CronogramaGenerator({
      diasTrabajo,
      diasDescanso,
      diasInduccion,
      fechaInicio: new Date().toISOString(),
      totalDias
    })

    const resultado = generator.generar()
    onGenerar(resultado)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuración</CardTitle>
        <CardDescription>Parámetros para generar el turno.<br/>Desarrollado por: Ing. Jaider Ponce</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="diasTrabajo">Días Trabajo (N)</Label>
            <Input 
              id="diasTrabajo" 
              type="number" 
              value={diasTrabajo}
              onChange={(e) => setDiasTrabajo(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="diasDescanso" className="text-xs">Días Descanso (M)</Label>
            <Input 
              id="diasDescanso" 
              type="number" 
              value={diasDescanso}
              onChange={(e) => setDiasDescanso(Number(e.target.value))}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="diasInduccion">Días Inducción</Label>
          <Input 
            id="diasInduccion" 
            type="number" 
            value={diasInduccion}
            onChange={(e) => setDiasInduccion(Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalDias">Total Días a Visualizar</Label>
          <Input 
            id="totalDias" 
            type="number" 
            value={totalDias}
            onChange={(e) => setTotalDias(Number(e.target.value))}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg h-12 shadow-md transition-all hover:scale-[1.02] active:scale-95" 
          onClick={handleGenerar}
        >
          Generar Cronograma
        </Button>
      </CardFooter>
    </Card>
  )
}
