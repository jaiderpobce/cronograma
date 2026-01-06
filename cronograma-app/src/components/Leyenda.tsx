/**
 * src/components/Leyenda.tsx
 * Leyenda explicativa de los colores del cronograma.
 * Programador: Ing. Jaider Ponce
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Leyenda() {
  const items = [
    { code: "S", label: "Subida", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { code: "I", label: "Inducción", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { code: "P", label: "Perforación", color: "bg-green-100 text-green-800 border-green-200" },
    { code: "B", label: "Bajada", color: "bg-orange-100 text-orange-800 border-orange-200" },
    { code: "D", label: "Descanso", color: "bg-gray-100 text-gray-800 border-gray-200" },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Leyenda</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {items.map((item) => (
          <div key={item.code} className="flex items-center gap-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-bold ${item.color}`}>
              {item.code}
            </span>
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
