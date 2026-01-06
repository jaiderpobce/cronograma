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

    // Inicializar arrays de resultado
    const s2Final: TipoDia[] = new Array(this.config.totalDias).fill(null);
    const s3Final: TipoDia[] = new Array(this.config.totalDias).fill(null);

    // VARIABLES DE ESTADO
    // Rastreamos en qué dia de su "fase" está cada uno.
    // Fase 0: En Casa (Descanso)
    // Fase 1: Viajando a Campo (Subida)
    // Fase 2: Inducción
    // Fase 3: Perforando
    // Fase 4: Viajando a Casa (Bajada)

    // Necesitamos predecir el futuro. S1 es fijo.
    // Regla de oro: Count(P) == 2.
    // S1[i] es conocido.
    // Si S1[i] == 'P', necesitamos 1 más (S2 o S3).
    // Si S1[i] != 'P', necesitamos 2 más (S2 y S3).

    // Simulación día a día
    let estadoS2 = { fase: 'D', diasEnFase: 0 }; // Empezamos asumiendo listo para subir
    let estadoS3 = { fase: 'D', diasEnFase: 0 }; // S3 empieza en espera

    // Helper para determinar el estado de un supervisor flexible
    // La estrategia es: Priorizar S2 para acompañar a S1 al inicio.
    // S3 entra cuando S1 o S2 tienen que bajar.

    // APROXIMACIÓN ALGORÍTMICA:
    // No podemos decidir día a día ciegamente porque las acciones 'S', 'I', 'B' toman tiempo
    // y bloquean al supervisor. Hay que planificar con antelación.
    
    // Vamos a proyectar los requerimientos de "Perforadores Necesarios"
    const perforadoresNecesarios = s1Final.map(d => (d === 'P' ? 1 : 2));

    // Llenamos S2 y S3 intentando cubrir 'perforadoresNecesarios'
    // S2 intenta cubrir el primer hueco siempre.
    // S3 intenta cubrir el segundo hueco si existe.

    // Implementaremos una lógica reactiva con planificación look-ahead (mirar hacia adelante)
    
    // Función auxiliar para rellenar un tramo
    const planificarSupervisor = (
        targetArray: TipoDia[], 
        diaInicio: number,
        diasInduccion: number,
        duracionP: number,
        forzarInicio: boolean = false
    ) => {
        let cursor = diaInicio;
        
        // Si no forzamos inicio inmediato (porque venía de descanso), 
        // asumimos que el día de inicio es el día 'S'
        
        if (cursor >= targetArray.length) return cursor;

        // 1. Subida
        if (cursor < targetArray.length) targetArray[cursor++] = 'S';
        
        // 2. Inducción
        for(let k=0; k<diasInduccion && cursor < targetArray.length; k++) {
            targetArray[cursor++] = 'I';
        }

        // 3. Perforación
        for(let k=0; k<duracionP && cursor < targetArray.length; k++) {
            targetArray[cursor++] = 'P';
        }

        // 4. Bajada
        if (cursor < targetArray.length) targetArray[cursor++] = 'B';

        // 5. Descanso (Mínimo lógico para poder volver a subir si se requiere pronto)
        // Dejaremos el descanso "abierto" hasta la próxima llamada
        
        return cursor; // Retorna el día donde quedó disponible (en descanso)
    };

    // LÓGICA ESPECÍFICA PARA S2 (El compañero principal de S1)
    // S2 debe reflejar a S1 pero desplazado o complementario.
    // Al principio (Día 0), S2 sube junto con S1.
    
    // Ciclo 1 de S2:
    // Debe empezar igual que S1 para cubrir el requerimiento de 2P inicial si S1 también empieza.
    // Pero S2 debe bajar ANTES para que S3 pueda subir y relevarlo sin que haya 3P.
    // O S3 debe subir para relevar a S1?
    
    // Analicemos el gap:
    // S1: S I I P P P P P P ... B
    // Req: 2 2 2 1 1 1 1 1 1 ... 2  (Perforadores Extra Necesarios)
    // Dia: 0 1 2 3 4 5 6 7 8 ... N
    
    // Estrategia Robusta:
    // Determinar los intervalos exactos donde se necesitan coberturas.
    
    // Simplificación para la prueba técnica basada en la Casuística 1:
    // S1: Baja día 15.
    // S3: Debe entrar día 9 para estar listo el 15.
    // S2: Debe cubrir hasta que S3 esté listo, y luego bajar.
    
    // Vamos a implementar la lógica de "Relevo Anticipado".
    // Un supervisor (El "Saliente") planea su Bajada (B) el día que el "Entrante" tiene su primer P.
    
    // S1 es fijo. Sus fechas de 'P' son inamovibles.
    
    // Punteros de disponibilidad
    let dispS2 = 0;
    let dispS3 = 0; // S3 entra retardado

    // Ciclo 1: Arranque
    // S1 arranca en dia 0.
    // S2 arranca en dia 0 para acompañar.
    // S2 debe quedarse hasta que S3 lo releve.
    
    // ¿Cuándo entra S3?
    // S3 entra para cubrir la bajada de S1.
    // S1 termina P en el día X. S3 debe empezar P en el día X+1 (o X si S1 baja en X+1).
    // S1: ... P B
    // S3: ... I P
    // El dia que S1 hace 'B', S3 ya debe hacer 'P'.
    
    // Encontremos el primer día de Bajada de S1.
    const primerBajadaS1 = s1Final.indexOf('B');
    // S3 debe empezar a perforar ese día 'primerBajadaS1'.
    // Por tanto, S3 debe iniciar su ciclo (S) días antes: 1 (S) + Inducción.
    const diasPreparacion = 1 + this.config.diasInduccion;
    const inicioS3 = primerBajadaS1 - diasPreparacion;
    
    // Llenamos S3 (Ciclo 1)
    // Duración P de S3: Hasta que S2 vuelva? No, S3 se queda un rato.
    // S3 cubre el hueco de S1.
    // S2 cubre el hueco de S3?
    
    // Esta lógica es circular. Usemos una simulación discreta de eventos.
    
    // EVENTO 1: Inicio
    // S1 y S2 inician juntos.
    // Tarea: Calcular duración del primer P de S2.
    // S2 debe bajar exactamente cuando S3 empieza a perforar.
    // S3 empieza a perforar en 'primerBajadaS1'.
    // Entonces S2 baja en 'primerBajadaS1' también?
    // Si S2 baja en T, S3 empieza P en T. => Hay 1P (S1) + 1P (S3). S2 ya no es P. Correcto.
    
    // Entonces:
    // S2.Bajada = S1.Bajada
    // S3.PrimerP = S1.Bajada
    
    // Corrección Casuistica 1:
    // S1 Baja dia 15.
    // S3 empieza P dia 15. (S3.S = 15 - 5 - 1 = 9).
    // S2 Baja dia 15.
    
    // Implementación Ciclo 1 S2:
    // Inicio: 0.
    // Fin P: Dia 14. (Dia 15 es B).
    // Duracion P = 15 - (Dia Inicio P).
    // Dia Inicio P de S2 = 1 (S) + Induccion.
    
    // GENERACIÓN
    
    // --- S2 CICLO 1 ---
    const inicioP_S2 = 1 + this.config.diasInduccion;
    const finP_S2 = primerBajadaS1 - 1; // El ultimo dia de P
    const duracionP_S2 = finP_S2 - inicioP_S2 + 1;
    
    dispS2 = planificarSupervisor(s2Final, 0, this.config.diasInduccion, duracionP_S2 > 0 ? duracionP_S2 : 0);
    
    // --- S3 CICLO 1 ---
    // Inicia para relevar a S1 y S2 que bajan el mismo dia (aprox).
    // S3 debe empezar P el día 'primerBajadaS1'.
    const inicioViajeS3 = primerBajadaS1 - diasPreparacion;
    
    // Rellenar días anteriores de S3 con '-' (espera/descanso forzado inicial)
    // Ojo: s3Final ya está en null/D. 
    // Indicar espera inicial explicita si se quiere
    
    // ¿Cuánto dura el P de S3?
    // S3 se queda solo con el que vuelva (S1 o S2).
    // S1 volverá despues de su descanso.
    // S2 volverá despues de su descanso.
    // Quien vuelve primero? S1 tiene régimen fijo.
    // S1 vuelve: B + Descanso + S + I.
    // S1.ProxP = primerBajadaS1 + 1 (B) + (DescansoReal) + 1 (S) + Induccion (¿aplica induccion cada vez? NO)
    // REGLA: "Inducción (capacitación) - configurable". Usualmente solo al inicio o tras largas ausencias.
    // ASUMIREMOS: Inducción aplica en CADA subida según el diagrama "S - I - I ...".
    // El diagrama muestra I en cada ciclo.
    
    // Calculamos cuando vuelve S1 a estado P
    // Buscamos el siguiente 'P' en S1 después de la bajada.
    const siguienteP_S1 = s1Final.indexOf('P', primerBajadaS1 + 1);
    
    // S3 debe perforar al menos hasta 'siguienteP_S1'.
    // En ese momento (siguienteP_S1), S1 vuelve a P.
    // Tendriamos S3(P) y S1(P). OK.
    
    // ¿Quién acompaña a S1 y S3?
    // Cuando S1 vuelve, tenemos S1 y S3.
    // S3 debe quedarse hasta que S2 vuelva?
    // O S2 vuelve para relevar a S3?
    
    // Este patrón se repite.
    // Es un relevo de 3 personas para 2 puestos.
    // Siempre hay 1 descansando y 2 trabajando.
    // Cuando uno de los 2 trabajando se va (B), el que descansa debe llegar y entrar (P) EXACTAMENTE ese dia.
    
    // ALGORITMO GENÉRICO DE RELEVO:
    // Eventos críticos: Alguien deja de perforar (Final de P, día antes de B).
    // Acción: Alguien nuevo debe empezar a perforar (Inicio de P).
    
    // Iteramos sobre los días buscando caídas en la cobertura.
    
    // Reiniciamos arrays para usar el algoritmo genérico
    s2Final.fill('D');
    s3Final.fill(null); // Null indica "no asignado", D es descanso asignado
    
    // Marcamos S3 inicial como 'Vacío' hasta que se necesite
    for(let i=0; i<this.config.totalDias; i++) s3Final[i] = '-'; 

    let diaActual = 0;
    
    // Estado interno de S2 y S3
    // Necesitamos saber cuándo están "Libres" para subir.
    // Un supervisor está libre si no está asignado a nada futuro y ya cumplió su descanso mínimo.
    let disponibilidadS2 = 0; // Día a partir del cual puede empezar un viaje (S)
    let disponibilidadS3 = 0;

    // S2 arranca junto con S1
    let inicioS2 = 0;
    // S2 debe terminar su P justo cuando S3 esté listo para entrar.
    // S3 entra para cubrir la bajada de S1.
    // Bajada de S1 es el evento crítico #1.
    
    const momentosDeRelevo: number[] = [];
    // Detectar transiciones de S1 (de P a B)
    for(let i=0; i<s1Final.length-1; i++) {
        if(s1Final[i] === 'P' && s1Final[i+1] === 'B') {
            momentosDeRelevo.push(i+1); // El día de la Bajada es el día que falta cobertura
        }
    }

    // Un relevo implica:
    // El entrante debe empezar P el día del relevo.
    // El saliente (si no es S1) debe bajar el día del relevo.
    
    // Supervisor A (S1): P P B
    // Supervisor B (Entrante): S I I P
    // Coordinación: B coincide con P.
    
    // Vamos a ir "agendando" ciclos de trabajo a S2 y S3 para cubrir los huecos.
    
    // HUECO 1: Cubrir a S1 desde el inicio.
    // S1 tiene P desde (1 + Ind).
    // Necesitamos alguien más. S2.
    // S2 debe empezar P igual que S1.
    // S2 Inicio = 0.
    // ¿Hasta cuándo dura S2?
    // Hasta que alguien lo releve. ¿Quién? S3.
    // ¿Cuándo entra S3?
    // S3 DEBE entrar cuando S1 se vaya (Relevo Obligatorio por reglas de S1).
    // Entonces Relevo 1 es en: s1Final.indexOf('B').
    // S3 empieza P en Relevo 1.
    // Por tanto S2 debe irse en Relevo 1 también?
    // Si S2 se va en Relevo 1, y S3 entra en Relevo 1, y S1 se va en Relevo 1...
    // Dia R-1: S1(P), S2(P), S3(I). Total P=2. OK.
    // Dia R: S1(B), S2(B), S3(P). Total P=1. ERROR.
    
    // REGLA CRÍTICA:
    // "NUNCA debe haber solo 1 supervisor perforando"
    // Si S1 y S2 bajan el mismo día, solo queda S3. -> 1 perforando.
    // SOLUCION: S2 debe quedarse unos días más. O S2 debió irse antes.
    
    // Si S2 se queda más:
    // Dia R: S1(B), S2(P), S3(P). Total P=2. OK!
    // Entonces S2 releva a S1.
    // S3 releva a S2 más tarde.
    
    // ESTRATEGIA DE CARRUSEL:
    // Orden de relevos: S1 -> S2 -> S3 -> S1 -> ...
    // S1 baja. S2 sigue. S3 entra para reemplazar a S1.
    // -> Quedan S2 y S3.
    // S2 baja. S3 sigue. S1 (o quien esté libre) entra para reemplazar a S2.
    // -> Quedan S3 y S1.
    // S3 baja. S1 sigue. S2 entra para reemplazar a S3.
    
    // IMPLEMENTACIÓN DEL CARRUSEL
    
    // Definir tiempos de ciclo "ideales" para mantener el ritmo
    // Pero S1 es fijo rígido. Eso distorsiona el carrusel perfecto.
    // Adaptaremos la duración de S2 y S3 para encajar con los eventos de S1.
    
    // Eventos donde se NECESITA un nuevo P:
    // 1. Inicio del tiempo (necesitamos 2, tenemos 0). -> Entran S1 y S2.
    // 2. S1 baja (necesitamos reemplazarlo). -> Entra S3.
    // 3. S2 baja (necesitamos reemplazarlo). -> Entra S1 (si ya descansó) o esperamos?
    
    // Vamos a simular día a día y tomar decisiones.
    
    // Rellenamos S2 y S3 con 'Descanso' por defecto para simplificar sobrescritura
    s2Final.fill('D'); 
    s3Final.fill('-'); // S3 inactivo al inicio
    
    // Estado actual detallado
    // fase: 0=Inactivo/Descanso, 1=Subida/Induccion, 2=Perforacion, 3=Bajada
    let agenteS2 = { estado: 'P', diasRestantesP: 999, diaInicioViaje: 0 }; 
    // S2 empieza simulado como que ya está listo para perforar o subiendo
    
    // Vamos a construir los arrays directamente con lógica procedural.
    // Ya tenemos S1.
    
    // PASO 1: Agendar S2 inicial.
    // Debe empezar P el dia que S1 empieza P.
    const primerP_S1 = s1Final.indexOf('P');
    // S2 Viaje inicia en 0.
    const duracionInduccion = this.config.diasInduccion;
    
    // Escribir S2 inicial
    let cursorS2 = 0;
    s2Final[cursorS2++] = 'S';
    for(let k=0; k<duracionInduccion; k++) s2Final[cursorS2++] = 'I';
    // Ahora S2 está en P.
    
    // PASO 2: Determinar hasta cuándo perfora S2 (Ciclo 1)
    // S2 debe cubrir junto a S3 cuando S1 baje.
    // S1 baja en 'primerBajadaS1'.
    // En ese dia, S1 desaparece. Queda S2. Necesitamos a S3.
    // S3 debe empezar P en 'primerBajadaS1'.
    
    // Agendar S3 Ciclo 1
    let viajeS3 = primerBajadaS1 - 1 - duracionInduccion;
    // (Dia P) - 1(S) - I = Dia inicio Viaje
    
    // Rellenar S3 antes del viaje con '-'
    for(let k=0; k<viajeS3; k++) s3Final[k] = '-';
    let cursorS3 = viajeS3;
    s3Final[cursorS3++] = 'S';
    for(let k=0; k<duracionInduccion; k++) s3Final[cursorS3++] = 'I';
    // Ahora S3 está en P (dia primerBajadaS1).
    
    // En dia 'primerBajadaS1':
    // S1 = B
    // S3 = P
    // S2 = ? -> Debe ser P para tener 2P.
    
    // S2 sigue perforando... ¿Hasta cuándo?
    // Hasta que S1 vuelva.
    // S1 recupera su puesto.
    // Ciclo S1: S I .. P ... B ... D ... S I ... P
    // Busquemos el 2do inicio de P de S1.
    const segundoP_S1 = s1Final.indexOf('P', primerBajadaS1 + 1);
    
    // El dia 'segundoP_S1', S1 entra a perforar.
    // Quién sale? S2 o S3?
    // S2 lleva perforando mucho tiempo (desde el inicio). S3 acaba de entrar.
    // Lógico: S2 sale.
    // S2 debe Bajar el día que S1 empieza P.
    
    const bajadaS2 = segundoP_S1;
    
    // Rellenar P de S2 hasta bajadaS2
    while(cursorS2 < bajadaS2) {
        if (cursorS2 < s2Final.length) s2Final[cursorS2] = 'P';
        cursorS2++;
    }
    // Agendar bajada S2
    if (cursorS2 < s2Final.length) s2Final[cursorS2++] = 'B';
    
    // Y luego S2 descansa...
    
    // Ahora estamos en dia 'segundoP_S1'.
    // S1 = P (Entrando)
    // S2 = B (Saliendo)
    // S3 = ? -> Debe seguir P.
    
    // Estado P:
    // Periodo 1 (Inicio -> BajadaS1): S1(P) + S2(P).
    // Periodo 2 (BajadaS1 -> BajadaS2): S2(P) + S3(P).
    // Periodo 3 (BajadaS2 -> ?): S3(P) + S1(P).
    
    // S3 sigue perforando junto a S1 (Ciclo 2).
    // ¿Hasta cuándo? Hasta que S2 vuelva.
    // ¿Cuándo vuelve S2? Cuando haya descansado y esté listo.
    
    // Pero S2 debe volver cuando S1 o S3 bajen?
    // S1 es el marcapasos. S1 bajará en su segunda Bajada.
    const segundaBajadaS1 = s1Final.indexOf('B', segundoP_S1);
    
    // El dia 'segundaBajadaS1', S1 se va.
    // Queda S3.
    // Necesitamos que entre S2.
    // S2 debe volver y EMPEZAR P el dia 'segundaBajadaS1'.
    
    // Verificar si S2 tuvo tiempo de descansar.
    // S2 bajó en 'bajadaS2'.
    // S2 P inicia en 'segundaBajadaS1'.
    // Tiempo disponible: (segundaBajadaS1) - (bajadaS2 + 1 B).
    // Viaje toma: 1(S) + Induccion.
    // Descanso neto = TiempoTotal - Viaje.
    // Si Descanso neto >= MinimoLegal, OK.
    
    // Agendar S2 Ciclo 2
    let viajeS2_2 = segundaBajadaS1 - 1 - duracionInduccion;
    
    // Rellenar hueco de S2 con D
    while(cursorS2 < viajeS2_2) {
         if (cursorS2 < s2Final.length) s2Final[cursorS2] = 'D';
         cursorS2++;
    }
    
    // Iniciar S2 Ciclo 2
    if(cursorS2 < s2Final.length) s2Final[cursorS2++] = 'S';
    for(let k=0; k<duracionInduccion && cursorS2 < s2Final.length; k++) s2Final[cursorS2++] = 'I';
    // S2 listo en P para dia segundaBajadaS1.
    
    // En dia 'segundaBajadaS1':
    // S1 = B
    // S2 = P (Entrando)
    // S3 = ? (Sigue P desde periodo anterior?)
    
    // Analicemos S3.
    // S3 empezó en primerBajadaS1.
    // Lleva perforando todo el Periodo 2 (con S2) y Periodo 3 (con S1).
    // Ahora empieza Periodo 4 (con S2).
    // S3 lleva mucho tiempo. ¿Debería haber bajado antes?
    // Si S3 baja, quién cubre?
    // Solo tenemos 3 agentes.
    // Si S3 baja, debe entrar S1 o S2.
    // S1 acaba de bajar. S2 acaba de subir.
    // NADIE puede relevar a S3 ahora mismo.
    // S3 DEBE aguantar hasta que S1 vuelva de nuevo (3er ciclo S1).
    
    // Esto sugiere que S3 hace turnos MUY largos o el esquema NxM debe permitir descansos cortos.
    // OJO: En la Casuística 1, S3 trabaja:
    // P desde dia 15 hasta dia 24 (B). Total 9 dias.
    // S1 bajó dia 15. S1 vuelve dia 21 (S) -> 22 (P) ?? No.
    // Veamos Casuistica 1:
    // S1: 14x7. Baja 15. Descansa 16-20. Sube 21. P empieza 22? No, Induccion 5 dias.
    // S1: S(21) I(22-26) P(27).
    // S1 vuelve a P el dia 27.
    
    // S3 empezó P el 15. Hasta el 27 son 12 días. Es razonable (Regimen 14).
    // Entonces S3 Bajaría cuando S1 vuelve a P (Dia 27).
    // Y ahi queda S2 y S1.
    
    // PARECE QUE EL PATRÓN ESTABLE ES:
    // Quien entra (X) releva al que SE VA (Y). El tercero (Z) se queda.
    // Evento: Y baja. -> X empieza P. Z continúa.
    
    // Ciclo continuo de relevos:
    // 1. S1 Baja. -> Entra S3. (Quedan S2, S3)
    // 2. S2 Baja. -> Entra S1. (Quedan S3, S1) -- Imposible porque S1 tiene su propio ritmo.
    
    // AQUI ESTÁ EL CONFLICTO: 
    // S1 NO obedece al relevo. S1 entra y sale cuando quiere.
    // S2 y S3 deben bailar alrededor de S1.
    
    // Replantear estrategia "Acompañante + Relevo":
    // S1 siempre está presente o ausente.
    // Cuando S1 ESTAT (P): Necesitamos 1 acompañante (S2 o S3).
    // Cuando S1 NO ESTA (NP): Necesitamos 2 acompañantes (S2 y S3).
    
    // Transiciones de S1:
    // P -> NP (Bajada): Pasamos de necesitar 1 a necesitar 2.
    //   El supervisor que estaba descansando debe entrar justo aquí.
    
    // NP -> P (Subida/Inicio P): Pasamos de necesitar 2 a necesitar 1.
    //   Uno de los dos que estaba trabajando debe irse a descansar justo aquí.
    
    // ESTA ES LA CLAVE.
    // El ritmo lo dicta S1.
    
    // Algoritmo Final:
    // Iteración 1: Calcular necesidades día a día.
    // Dia i: S1 es P? -> Need = 1. Else -> Need = 2.
    
    // Asignación de recursos (S2, S3) para cubrir Need.
    // Prioridad: Mantener continuidad. Evitar cambios bruscos.
    
    // Rellenamos S3 (Ciclo 1)
    // Ya determinamos S3 Entra cuando S1 Baja.
    // S3 sigue P hasta que S1 Vuelve a P (o S2 Baja, pero S2 debe esperar a S1).
    // Evento: S1 vuelve a P (Dia 'segundoP_S1').
    // Necesidad baja de 2 a 1.
    // Tenemos S2(P) y S3(P). Uno debe irse.
    // Quién lleva más tiempo? S2 empezó en dia 0. S3 empezó en dia 15.
    // S2 debe irse.
    
    // Entonces: S2 Baja en 'segundoP_S1'. (Coincide con mi calculo anterior).
    // Quedan S1(P nuevo) y S3(P antiguo).
    
    // Siguiente evento: S1 Baja de nuevo (3er evento).
    // Necesidad sube de 1 a 2.
    // Tenemos S1(B), S3(P).
    // Necesitamos que alguien entre. S2.
    // S2 debe entrar P en este día.
    
    // Siguiente evento: S1 Vuelve a P (4to evento).
    // Necesidad baja de 2 a 1.
    // Tenemos S2(P nuevo), S3(P muy antiguo).
    // S3 debe irse.
    
    // RESUMEN LÓGICA:
    // S2 y S3 se alternan para cubrir los huecos de S1.
    // Entra S_X cuando S1 se va.
    // Sale S_Y (el más antiguo) cuando S1 vuelve.
    
    // IMPLEMENTACIÓN AUTOMATIZADA:
    // Rellenar S3:
    // P desde 'primerBajadaS1' hasta 'tercerP_S1' (cuando S1 vuelve por 2da vez).
    // Ojo: S3 cubrió todo el hueco de S1 (Periodo 2) y acompañó a S1 todo el Periodo 3.
    // Cuando S1 se va de nuevo (Fin Periodo 3), S3 sigue?
    // No, entra S2. Tenemos S3 y S2.
    // S3 se va cuando S1 vuelve (Inicio Periodo 5).
    
    // Generalizando:
    // Supervisor "Comodín A" (S2): Cubre Hueco 0, Acompaña Ciclo 1 S1. (Sale al volver S1) -> NO, S1 ya está.
    // Corrijo orden.
    
    // Ciclo S1:
    // [P1] ... [Intervalo Descanso 1] ... [P2] ... [Intervalo Descanso 2] ... [P3]
    
    // Actores:
    // S2: Cubre P1 (acompaña). Cubre Descanso 1. Se va al iniciar P2.
    // S3: Entra al iniciar Descanso 1. Cubre P2 (acompaña). Cubre Descanso 2. Se va al iniciar P3.
    // S2: Entra al iniciar Descanso 2. Cubre P3...
    
    // Patrón Alternancia:
    // S2 Activo: Inicio -> Inicio P2.
    // S3 Activo: Inicio Descanso 1 -> Inicio P3.
    // S2 Activo: Inicio Descanso 2 -> Inicio P4.
    
    // Validemos solapamiento para asegurar 2P siempre.
    // Fase 1 (S1=P): S2(P), S3(Off). Total 2. OK.
    // Fase 2 (S1=Off): S2(P), S3(P). Total 2. OK.
    // Fase 3 (S1=P): S2(Off), S3(P). Total 2. OK.
    // Fase 4 (S1=Off): S2(P), S3(P). Total 2. OK.
    // Fase 5 (S1=P): S2(P), S3(Off). Total 2. OK.
    
    // ¡EUREKA! Este es el patrón estable.
    // S2 y S3 se turnan "fases largas".
    // Una fase de trabajo de S2/S3 dura: Duracion(Descanso S1) + Duracion(Trabajo S1).
    // Es aprox el doble de S1? No, se solapan.
    
    // Vamos a codificar este patrón de "Turnos Extendidos".
    
    // Necesitamos identificar los hitos de S1:
    // Hito A: Inicio P
    // Hito B: Inicio Bajada (Fin P + 1)
    
    // Loop principal
    let turno = 0; // 0 = S2, 1 = S3
    let nextS2 = 0; // Puntero de escritura
    let nextS3 = 0;
    
    // Hack: S2 empieza activo en t=0.
    // Definimos los tramos de "Actividad P" requerida.
    // Tramo 0: Desde inicio hasta comienzo de P2 de S1. (Asignado a S2)
    // Tramo 1: Desde comienzo B1 de S1 hasta comienzo de P3 de S1. (Asignado a S3)
    // Tramo 2: Desde comienzo B2 de S1 hasta comienzo de P4 de S1. (Asignado a S2)
    
    // Generalizando:
    // Tramo K: [Inicio Bajada K de S1] -> [Inicio Perforación K+2 de S1]
    // Excepción Tramo 0: [Inicio 0] -> [Inicio Perforación 2 de S1]
    
    // Indices de eventos S1
    // Inicio P1 = primerP usando s1.indexOf('P')
    // Inicio B1 = s1.indexOf('B')
    // Inicio P2 = s1.indexOf('P', despues de B1)
    // Inicio B2 = s1.indexOf('B', despues de P2)
    
    const eventosP: number[] = [];
    const eventosB: number[] = [];
    
    // Escanear S1
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
    
    // Procesar Tramos
    const tramosRequeridos: { inicio: number, fin: number, agente:  'S2' | 'S3' }[] = [];
    
    // Tramo Inicial (Especial)
    // Va desde 0 hasta el inicio del 2do periodo P de S1 (eventosP[1]).
    // Si no hay 2do periodo P, hasta el final.
    const finTramo0 = eventosP.length > 1 ? eventosP[1] : this.config.totalDias;
    tramosRequeridos.push({ inicio: 0, fin: prevDia(finTramo0), agente: 'S2' });
    
    // Tramos Siguientes
    for(let k=0; k < eventosB.length; k++) {
        // El relevo debe estar LISTO (P) el día de la Bajada (eventosB[k]).
        const inicioP = eventosB[k];
        
        // Debe terminar (Bajar) el día que S1 vuelve para su K+2 periodo.
        // K=0 (Primer bajada) -> Cubre hasta P3? No.
        // Hito B1 -> Cubre hasta P3 No. Cubre hasta P2? No, se solapa con P2.
        // Cubre hasta P3.
        // El tramo cubre el hueco de S1 Y el siguiente periodo de S1.
        
        // Indice de P futuro: Para Bajada K, el periodo P actual era K+1 (base 1).
        // Queremos cubrir hasta P (K+2).
        // Array eventosP: [P1, P2, P3...]
        // Bajada K es fin de P(K+1). -> eventosB[0] es fin de P1.
        // El relevo cubre hueco post-P1 y acompaña P2.
        // Sale al inicio de P3. (eventosP[2]).
        
        const idxPFuturo = k + 2;
        const finP = idxPFuturo < eventosP.length ? eventosP[idxPFuturo] : this.config.totalDias;
        
        // Alternar agente
        // Tramo 0 fue S2.
        // Tramo 1 (asociado a Bajada 1) debe ser S3.
        // Tramo i+1
        const agente = (k % 2 === 0) ? 'S3' : 'S2';
        
        tramosRequeridos.push({ inicio: inicioP, fin: prevDia(finP), agente });
    }
    
    // Aplicar Tramos a los Cronogramas
    // Un tramo define [Dia Inicio P, Dia Fin P].
    // Hay que calcular hacia atrás S y I. Y hacia adelante B y D.
    
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
         // OJO: Si inicio es 0, logicamente empezamos antes, pero recortamos.
         // Si inicio > 0, calculamos fechas.
         if (tramo.inicio > 0) {
             let cursor = tramo.inicio - 1;
             // Induccion
             for(let k=0; k<this.config.diasInduccion && cursor >=0; k++) {
                 // Check colision: No sobrescribir B o P de un ciclo anterior si se solapan mucho (error de diseño)
                 // Asumimos que hay espacio (Descanso suficiente).
                 if(target[cursor] === 'D' || target[cursor] === null) target[cursor] = 'I';
                 cursor--;
             }
             // Subida
             if(cursor >= 0 && (target[cursor] === 'D' || target[cursor] === null)) {
                 target[cursor] = 'S';
             }
         } else {
             // Caso Dia 0: Si empieza P en 0 (improbable con induccion dada las reglas normales, 
             // pero Tramo 0 de S2 asi lo pide para simplificar, aunque S2 realmente hace S I P).
             // Ajuste: El Tramo define "Cobertura".
             // Si el tramo empieza en 0, asumimos que hicimos S/I en el pasado (-N).
             // O simplemente forzamos S/I al inicio desplazando el P?
             // No, S2 debe estar P cuando S1 está P.
             // S1 hace S I P.
             // S2 hace S I P.
             // Coinciden.
             // Mi logica de tramo para S2 Tramo 0 dice "Inicio 0".
             // Realmente S2 empieza P en eventosP[0] + induccion?
             // No, S2 acompaña. S1 empieza P el dia X. S2 debe empezar P el dia X.
             
             // CORRECCIÓN FINA TRAMO 0:
             // El inicio P de S2 no es 0. Es eventosP[0].
             // Antes de eso es I y S.
             
             // Borrar P erroneos antes del primer P real del tramo?
             // Re-simular inicio S2 correctamente.
             const inicioRealP = s1Final.indexOf('P'); // S1 manda
             
             // Limpiar P falsos antes de inicioRealP en S2
             for(let z=0; z<inicioRealP; z++) {
                 if(target[z] === 'P') target[z] = null; // Reset
             }
             
             let c = inicioRealP - 1;
             for(let k=0; k<this.config.diasInduccion && c>=0; c--) target[c] = 'I';
             if(c>=0) target[c] = 'S';
         }
    });
    
    // Rellenar huecos restantes con D
    for(let i=0; i<this.config.totalDias; i++) {
        if(s2Final[i] === null) s2Final[i] = 'D';
        if(s3Final[i] === null && typeof s3Final[i] !== 'string') s3Final[i] = 'D'; // Fix typing check
        if(s3Final[i] === '-') s3Final[i] = 'D'; // Convertir espera inicial a D o mantener indicador visual? D es mejor.
        if(s3Final[i] === null) s3Final[i] = 'D';
    }

    return [
      { id: 1, nombre: 'Supervisor 1', cronograma: s1Final },
      { id: 2, nombre: 'Supervisor 2', cronograma: s2Final },
      { id: 3, nombre: 'Supervisor 3', cronograma: s3Final },
    ];
  }
}

// Helper para restar dia
function prevDia(dia: number): number {
    return dia - 1;
}

