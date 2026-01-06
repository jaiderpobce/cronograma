/**
 * src/App.tsx
 * Componente principal de la aplicación.
 * Programador: Ing. Jaider Ponce
 */

import './index.css'
import { useState } from 'react'
import { ParametrosForm } from '@/components/ParametrosForm'
import { CronogramaDisplay } from '@/components/CronogramaDisplay'
import { Leyenda } from '@/components/Leyenda'
import type { SupervisorState } from '@/lib/algoritmo'

function App() {
  const [datosCronograma, setDatosCronograma] = useState<SupervisorState[]>([]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Generador de Cronograma de Supervisores</h1>
          <p className="text-muted-foreground">Sistema de planificación automática de turnos de perforación.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <ParametrosForm onGenerar={setDatosCronograma} />
            <Leyenda />
          </div>
          
          <div className="lg:col-span-3">
             <CronogramaDisplay datos={datosCronograma} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
