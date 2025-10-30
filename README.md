# JobParty — Frontend (Demo)

Este repositorio contiene un frontend estático de ejemplo para la plataforma JobParty. Está diseñado como un prototipo moderno, minimalista y profesional, preparado para conectarse con un backend o con Firebase en el futuro.

Contenido:
- `index.html` — Página de inicio con hero y buscador.
- `dashboard.html` — Panel con listado de empleos y filtros.
- `register.html` — Formulario de registro.
- `login.html` — Formulario de login.
- `profile.html` — Perfil de usuario editable (simulado).
- `main.css` — Estilos globales responsivos.
- `main.js` — Lógica de UI: validación, simulación de auth, render y filtros.

Cómo probarlo
1. Abrir `index.html` en un navegador (doble clic o "Abrir con" -> navegador).
2. Navegar a `dashboard.html` para ver el listado de empleos.

Notas técnicas
- Los datos son simulados (array `jobs` en `main.js`).
- Autenticación demo usando `localStorage`.
- Preparado para integrarse con Firebase: añadir funciones de auth y base de datos en `main.js` o en módulos separados.
- Buenas prácticas de accesibilidad: labels, aria-* y contraste razonable.

Siguientes pasos sugeridos
- Integrar Firebase Auth y Firestore.
- Añadir subida de CV y gestión de postulaciones.
- API real para búsqueda avanzada y paginación.

Licencia
Este código es un prototipo; ajústalo a tus necesidades.

