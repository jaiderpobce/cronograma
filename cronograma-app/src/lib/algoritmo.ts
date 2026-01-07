/**
 * src/lib/algoritmo.ts
 * Lógica de generación automática de cronogramas para supervisores de minería.
 * Implementa el patrón de "Supervisor Marcapasos (S1)" y "Supervisores de Cobertura (S2, S3)".
 * 
 * Programador: Ing. Jaider Ponce
 */

// Tipos para el cronograma (Estados posibles de un día)
export type TipoDia = 'S' | 'I' | 'P' | 'B' | 'D';

export interface SupervisorState {
  id: number;
  nombre: string;
  cronograma: TipoDia[];
}

export interface CronogramaConfig {
  diasTrabajo: number;
  diasDescanso: number;
  diasInduccion: number;
  fechaInicio: string; 
  totalDias: number;
}

export class CronogramaGenerator {
  private config: CronogramaConfig;

  constructor(config: CronogramaConfig) {
    this.config = config;
  }

  // Genera el ciclo base para S1 (Marcapasos)
  // S1 tiene un ciclo fijo e inamovible que dicta el ritmo de los demás.
  private generarCicloS1(): TipoDia[] {
    const { diasTrabajo, diasDescanso, diasInduccion } = this.config;
    const ciclo: TipoDia[] = [];
    
    // Subida
    ciclo.push('S');
    
    // Inducción (si aplica)
    for (let i = 0; i < diasInduccion; i++) {
      ciclo.push('I');
    }
    
    // Perforación
    // N = S + I + P  =>  P = N - S - I
    // S es siempre 1 dia
    const diasPerforacion = diasTrabajo - 1 - diasInduccion;
    for (let i = 0; i < diasPerforacion; i++) {
        ciclo.push('P');
    }

    // Bajada
    ciclo.push('B');

    // Descanso
    // M = B + D => D = M - B
    // B es siempre 1 dia
    const diasDescansoReal = diasDescanso - 1;
    for (let i = 0; i < diasDescansoReal; i++) {
        ciclo.push('D');
    }

    return ciclo;
  }

  public generar(): SupervisorState[] {
    // 1. Generar la línea base completa para S1
    const cicloS1 = this.generarCicloS1();
    const cronogramaS1: TipoDia[] = [];
    
    // Repetir el ciclo lo suficiente para cubrir el total de dias
    while (cronogramaS1.length < this.config.totalDias) {
        cronogramaS1.push(...cicloS1);
    }
    // Recortar al total exacto
    const s1Final = cronogramaS1.slice(0, this.config.totalDias);

    // Inicializar arrays de resultado para S2 y S3 con null (para saber qué días no hemos asignado)
    const s2Final: (TipoDia | null)[] = new Array(this.config.totalDias).fill(null);
    const s3Final: (TipoDia | null)[] = new Array(this.config.totalDias).fill(null);

    // --- Definir Hitos ---
    const eventosP: number[] = [];
    const eventosB: number[] = [];
    
    let enP = false;
    for(let i=0; i<s1Final.length; i++) {
        if(s1Final[i] === 'P' && !enP) {
            eventosP.push(i);
            enP = true;
        }
        if(s1Final[i] === 'B' && enP) {
            eventosB.push(i);
            enP = false;
        }
    }
    
    // --- Definir Tramos de Requerimiento ---
    interface Tramo { inicio: number, fin: number, agente: 'S2' | 'S3' }
    const tramosRequeridos: Tramo[] = [];
    
    // Tramo 0: Inicio
    const finTramo0 = eventosP.length > 1 ? eventosP[1] : this.config.totalDias;
    tramosRequeridos.push({ inicio: 0, fin: this.prevDia(finTramo0), agente: 'S2' });
    
    // Tramos Ciclicos
    for(let k=0; k < eventosB.length; k++) {
        const inicioP = eventosB[k];
        const idxPFuturo = k + 2;
        const finP = idxPFuturo < eventosP.length ? eventosP[idxPFuturo] : this.config.totalDias;
        const agente = (k % 2 === 0) ? 'S3' : 'S2';
        
        tramosRequeridos.push({ inicio: inicioP, fin: this.prevDia(finP), agente });
    }
    
    // --- Aplicar Tramos ---
    tramosRequeridos.forEach(tramo => {
        const target = tramo.agente === 'S2' ? s2Final : s3Final;
        
        // Rellenar P
        for(let i=tramo.inicio; i<=tramo.fin && i<target.length; i++) {
             target[i] = 'P';
        }
        
        // Rellenar B (post-P)
        const diaBajada = tramo.fin + 1;
        if(diaBajada < target.length) target[diaBajada] = 'B';
        
         // Rellenar Viaje (pre-P)
         if (tramo.inicio > 0) {
             let cursor = tramo.inicio - 1;
             // Induccion
             for(let k=0; k<this.config.diasInduccion && cursor >=0; k++) {
                 if(target[cursor] === null || target[cursor] === 'D') target[cursor] = 'I';
                 cursor--;
             }
             // Subida
             if(cursor >= 0 && (target[cursor] === null || target[cursor] === 'D')) {
                 target[cursor] = 'S';
             }
         } else {
             // Caso Dia 0 (Arranque) - Copiar estructura de S1 para alinear
             const inicioRealP = s1Final.indexOf('P');
             
             // Limpiar
             for(let z=0; z<inicioRealP; z++) {
                 if(target[z] === 'P') target[z] = null;
             }
             
             // Reconstruir
             let c = inicioRealP - 1;
             for(let k=0; k<this.config.diasInduccion && c>=0; c--) target[c] = 'I';
             if(c>=0) target[c] = 'S';
         }
    });
    
    // --- Limpieza Final ---
    // Convertir nulls restantes en 'D'
    for(let i=0; i<this.config.totalDias; i++) {
        if(s2Final[i] === null) s2Final[i] = 'D';
        if(s3Final[i] === null) s3Final[i] = 'D';
    }

    return [
      { id: 1, nombre: 'Supervisor 1', cronograma: s1Final },
      { id: 2, nombre: 'Supervisor 2', cronograma: s2Final as TipoDia[] },
      { id: 3, nombre: 'Supervisor 3', cronograma: s3Final as TipoDia[] },
    ];
  }

  private prevDia(dia: number): number {
    return dia > 0 ? dia - 1 : 0;
  }
}
