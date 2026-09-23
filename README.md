# 🦷 Sistema de Gestión - Clínica Odontológica (Frontend)


Este es el frontend del Sistema de Gestión para Clínica Odontológica, una aplicación web SPA (Single Page Application) diseñada con altos estándares de UI/UX, arquitectura responsiva y enfocada en la experiencia del usuario (Recepcionistas, Odontólogos y Administradores).

## 🚀 Tecnologías Principales



* **Framework:** [React 18](https://reactjs.org/?utm_source=gemini) + [Vite](https://vitejs.dev/?utm_source=gemini)

* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/?utm_source=gemini)

* **Estilos:** [Tailwind CSS](https://tailwindcss.com/?utm_source=gemini)

* **Gráficos e Indicadores:** [Recharts](https://recharts.org/?utm_source=gemini)

* **Iconografía:** [Lucide React](https://lucide.dev/?utm_source=gemini)

* **Notificaciones:** [Sonner](https://www.google.com/search?q=https://sonner.emilkowal.ski/&utm_source=gemini)

* **Package Manager:** [Bun](https://bun.sh/?utm_source=gemini) ⚡


* **Despliegue:** Docker + Nginx



## 📁 Arquitectura del Proyecto



El proyecto sigue una arquitectura modular y escalable, separando claramente la lógica de negocio de la vista:

* **`assets/`**: Imágenes, iconos estáticos y variables CSS globales.


* **`components/`**: Componentes reutilizables (Botones, Tarjetas, Layouts, Gráficos).


* **`context/`**: Estado global (AuthContext para manejo de sesiones).


* **`models/`**: Interfaces y DTOs tipados (TypeScript).


* **`pages/`**: Vistas de la aplicación (Dashboard, Login, Gestión).


* **`services/`**: Lógica de peticiones HTTP (Axios/Fetch) a la API Rest.


* **`utils/`**: Constantes, rutas y funciones auxiliares.



## ✨ Características Destacadas

* **Diseño 100% Responsivo:** Interfaz adaptativa con protección anti-desbordamiento para dispositivos móviles, tablets y escritorio.
* **Dashboards Interactivos:** Visualización de KPIs financieros, estado de turnos y rendimiento de doctores en tiempo real.
* **Seguridad y Roles:** Protección de rutas mediante JSON Web Tokens (JWT) y renderizado dinámico según el perfil (`ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_RECEPTIONIST`).
* **Modales Optimizados:** Formularios flotantes con control de capas (`z-index: 60`) y validaciones en tiempo real para evitar pérdida de datos.

## 🛠️ Instalación y Desarrollo Local

1. **Clonar el repositorio:** Descarga el código fuente en tu máquina local.
2. **Instalar dependencias:** Ejecuta `bun install` para descargar los paquetes necesarios aprovechando la velocidad de Bun.
3. **Configurar entorno:** Crea un archivo `.env` basado en la configuración de ejemplo y define la variable `VITE_API_URL` apuntando a tu backend.
4. **Iniciar el servidor:** Ejecuta `bun run dev` para levantar el entorno de desarrollo con Vite.

## 🐳 Despliegue con Docker

El repositorio incluye un `Dockerfile` y la configuración `nginx.conf` listos para contenerizar la aplicación. Para desplegar en producción, construye la imagen con `docker build -t clinica-frontend:latest .` y levanta el contenedor mapeando los puertos correspondientes (ej. `docker run -d -p 80:80 clinica-frontend:latest`).