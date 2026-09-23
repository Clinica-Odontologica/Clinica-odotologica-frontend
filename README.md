
# 🦷 Sistema de Gestión - Clínica Odontológica (Frontend)

Este es el frontend del Sistema de Gestión para Clínica Odontológica, una aplicación web SPA (Single Page Application) diseñada con altos estándares de UI/UX, arquitectura responsiva y enfocada en la experiencia del usuario (Recepcionistas, Odontólogos y Administradores)[cite: 2].

## 🚀 Tecnologías Principales

* **Framework:** [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/)[cite: 2]
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)[cite: 2]
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)[cite: 2]
* **Gráficos e Indicadores:** [Recharts](https://recharts.org/)[cite: 2]
* **Iconografía:** [Lucide React](https://lucide.dev/)[cite: 2]
* **Notificaciones:** [Sonner](https://sonner.emilkowal.ski/)[cite: 2]
* **Package Manager:** [Bun](https://bun.sh/) ⚡[cite: 2]
* **Despliegue:** Docker + Docker Compose + Nginx[cite: 2]

## 📁 Arquitectura del Proyecto

El proyecto sigue una arquitectura modular y escalable, separando claramente la lógica de negocio de la vista[cite: 2]:

* **`assets/`**: Imágenes, iconos estáticos y variables CSS globales[cite: 2].
* **`components/`**: Componentes reutilizables (Botones, Tarjetas, Layouts, Gráficos)[cite: 2].
* **`context/`**: Estado global (AuthContext para manejo de sesiones)[cite: 2].
* **`models/`**: Interfaces y DTOs tipados (TypeScript)[cite: 2].
* **`pages/`**: Vistas de la aplicación (Dashboard, Login, Gestión)[cite: 2].
* **`services/`**: Lógica de peticiones HTTP (Axios/Fetch) a la API Rest[cite: 2].
* **`utils/`**: Constantes, rutas y funciones auxiliares[cite: 2].

## ✨ Características Destacadas

* **Diseño 100% Responsivo:** Interfaz adaptativa con protección anti-desbordamiento para dispositivos móviles, tablets y escritorio.
* **Dashboards Interactivos:** Visualización de KPIs financieros, estado de turnos y rendimiento de doctores en tiempo real.
* **Seguridad y Roles:** Protección de rutas mediante JSON Web Tokens (JWT) y renderizado dinámico según el perfil (`ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_RECEPTIONIST`).
* **Modales Optimizados:** Formularios flotantes con control de capas (`z-index: 60`) y validaciones en tiempo real para evitar pérdida de datos.

## 🛠️ Instalación y Desarrollo Local

1. **Clonar el repositorio:** Descarga el código fuente en tu máquina local.
2. **Instalar dependencias:** Ejecuta `bun install` para descargar los paquetes necesarios aprovechando la velocidad de Bun.
3. **Configurar entorno:** Crea un archivo `.env` en la raíz y define la variable con el nombre correcto:
   ```env
   VITE_URL_API=http://localhost:8080/api/v1

```

4. **Iniciar el servidor:** Ejecuta `bun run dev` para levantar el entorno de desarrollo con Vite.

## 🐳 Despliegue con Docker y Docker Compose

El repositorio incluye un `Dockerfile` multi-stage, una configuración `nginx.conf` optimizada y un archivo `docker-compose.yml` para simplificar la puesta en marcha.

Para desplegar la aplicación en producción de forma rápida y limpia, ejecuta en la raíz del proyecto:

```bash
docker compose up -d --build

```

Esto construirá la imagen y levantará el contenedor en el puerto `80`. Para detener el servicio, utiliza:
```

```bash
docker compose down
```


*(Nota: Asegúrate de configurar tu archivo `.env.production` con la IP o dominio del servidor backend antes de compilar para producción).*

