# Generador de Cronograma de Supervisores

## 🚀 [Ver la aplicación desplegada](https://jaiderpobce.github.io/cronograma/) 🚀

Este proyecto es una aplicación web moderna construida con React y TypeScript para automatizar la planificación de turnos en minería, asegurando una cobertura constante de 2 supervisores en perforación.

## 🚀 Características

*   **Generación Algorítmica:** Motor de cálculo que ajusta automáticamente los turnos de S2 y S3 basándose en el ciclo fijo de S1.
*   **Interfaz Moderna:** Construida con `shadcn/ui` y Tailwind CSS v4 para una experiencia de usuario limpia y profesional.
*   **Validación en Tiempo Real:** Indicadores visuales instantáneos del cumplimiento de las reglas de cobertura.
*   **Totalmente Configurable:** Soporta regímenes variables (14x7, 21x7, etc.) y días de inducción ajustables.

## 🛠️ Tecnologías Utilizadas

*   [React 19](https://react.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Vite](https://vitejs.dev/)
*   [Tailwind CSS v4](https://tailwindcss.com/)
*   [Shadcn/ui](https://ui.shadcn.com/) (Componentes)

## 📋 Requisitos Previos

*   Node.js (v18 o superior)
*   npm (incluido con Node.js)

## 🔧 Instalación

1.  Clona el repositorio o navega a la carpeta del proyecto:
    ```bash
    cd cronograma-app
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

## ▶️ Ejecución en Desarrollo

Para iniciar el servidor local y ver la aplicación:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173/`.

## 📦 Construcción para Producción

Para generar los archivos estáticos optimizados para despliegue:

```bash
npm run build
```

Los archivos generados estarán en la carpeta `dist/`.

## 📚 Documentación de Usuario

Puedes encontrar el manual de uso detallado en:
*   [MANUAL.md](./MANUAL.md) (Versión Markdown)
*   [MANUAL.html](./MANUAL.html) (Versión Web)

## 📄 Licencia

Este proyecto es de uso privado para la planificación de turnos.
