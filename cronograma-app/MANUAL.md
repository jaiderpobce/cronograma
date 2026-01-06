# Manual de Usuario: Generador de Cronograma de Supervisores

## Introducción
Bienvenido al **Generador de Cronograma de Supervisores**. Esta aplicación web está diseñada para automatizar la planificación de turnos de perforación, asegurando el cumplimiento de las reglas críticas de cobertura (siempre 2 supervisores perforando) y gestionando los ciclos de trabajo, descanso e inducción.

## Interfaz Principal

La pantalla se divide en tres secciones principales:

1.  **Panel de Configuración (Izquierda):** Donde se definen los parámetros del régimen.
2.  **Leyenda (Izquierda):** Referencia rápida de los colores y códigos utilizados.
3.  **Visualizador de Cronograma (Centro/Derecha):** Tabla interactiva donde se muestra el resultado.

## Instrucciones de Uso

### 1. Configurar Parámetros
En el panel de configuración, ingrese los valores según su régimen de trabajo:

*   **Días Trabajo (N):** Cantidad total de días que el supervisor está en faena (incluye subida, inducción y perforación). Ejemplo común: 14.
*   **Días Descanso (M):** Cantidad total de días libres (incluye bajada y días en casa). Ejemplo común: 7.
*   **Días Inducción:** Número de días dedicados a capacitación antes de empezar a perforar.
*   **Total Días a Visualizar:** Cantidad de días que desea proyectar en el calendario (ej. 30, 60, 90).

### 2. Generar el Cronograma
Una vez definidos los parámetros, haga clic en el botón negro **"Generar Cronograma"**.

### 3. Interpretar el Resultado
El sistema calculará automáticamente los turnos para el **Supervisor 1**, **Supervisor 2** y **Supervisor 3**.

#### Códigos y Colores
*   **S (Azul):** Subida. Día de viaje hacia la mina.
*   **I (Amarillo):** Inducción. Días de capacitación.
*   **P (Verde):** Perforación. Trabajo efectivo en campo.
*   **B (Naranja):** Bajada. Día de retorno a casa.
*   **D (Gris):** Descanso. Días libres.

### 4. Validación de Cobertura
En la parte inferior de la tabla encontrará una fila llamada **"# Perforando"**.
*   Esta fila cuenta cuántos supervisores están en estado **'P'** (Perforación) simultáneamente.
*   **Número Verde (2):** Indica que el turno cumple con la regla ideal (2 supervisores).
*   **Número Rojo (1 o 3):** Indica una alerta. El sistema tratará de evitar esto, pero puede ocurrir en los días de transición inicial o si los parámetros son inviables.

## Preguntas Frecuentes

**¿Por qué el Supervisor 1 siempre sigue el mismo patrón?**
El Supervisor 1 actúa como el "Marcapasos" del sistema. Su turno es fijo y respeta estrictamente el régimen NxM. Los Supervisores 2 y 3 se ajustan dinámicamente para cubrir los huecos de S1.

**¿Puedo exportar el cronograma?**
Actualmente la herramienta es de visualización. Puede tomar una captura de pantalla de la tabla generada para sus reportes.
