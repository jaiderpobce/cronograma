# Script de despliegue manual para evitar errores de ruta larga en Windows

$ErrorActionPreference = "Stop"

Write-Host "1. Generando versión de producción..."
npm run build

# Obtener la URL del repositorio remoto configurado actualmente
$remoteUrl = git remote get-url origin
if (-not $remoteUrl) {
    Write-Error "No se encontró un repositorio remoto configurado (origin). Asegúrate de haber hecho 'git remote add origin ...'"
    exit 1
}

Write-Host "2. Preparando archivos para subir a: $remoteUrl"

# Entrar a la carpeta de distribución
Set-Location dist

# Inicializar un repositorio git temporal
git init
git checkout -b gh-pages

# Añadir todos los archivos
git add -A
git commit -m 'deploy: actualización automática'

# Subir forzadamente a la rama gh-pages
Write-Host "3. Subiendo a GitHub Pages..."
git push -f $remoteUrl gh-pages

# Volver a la carpeta raíz
Set-Location ..

Write-Host "✅ ¡Despliegue completado exitosamente!"
