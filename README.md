# Portfolio de Rui De Castro

Portfolio personal de Rui De Castro, desarrollador full-stack especializado en frontend y QA Automation Engineer. Presenta proyectos propios mediante casos de estudio centrados en la experiencia de usuario, la arquitectura y la calidad.

## Contenido

- **Inicio:** presentación, perfil profesional y proyectos destacados.
- **Avoid Guild Web:** primer caso de estudio, con contexto, solución, arquitectura, calidad y resultado.
- **Estructura ampliable:** cada futuro proyecto puede tener su propia página dentro de `dist/proyectos/`.

## Tecnologías

El portfolio es un sitio estático construido con HTML y CSS. No necesita un framework, dependencias de producción ni un proceso de compilación. `preview-server.mjs` utiliza Node.js únicamente para verlo en local. El despliegue actual se gestiona con Sites.

La implementación utiliza HTML semántico, navegación por teclado, diseño adaptable y metadatos específicos para cada página.

## Verlo en local

Con Node.js instalado, ejecuta:

```bash
node preview-server.mjs
```

Después abre `http://127.0.0.1:4173`.

## Estructura

```text
dist/
  index.html                         Página principal
  styles.css                         Estilos compartidos
  assets/                            Imágenes del portfolio
  proyectos/avoid-guild-web/         Caso de estudio
.openai/hosting.json                 Configuración del despliegue en Sites
preview-server.mjs                   Servidor local de vista previa
```

Para añadir un proyecto, crea `dist/proyectos/<nombre>/index.html` y enlázalo desde la sección de proyectos de `dist/index.html`. Los estilos comunes se encuentran en `dist/styles.css`.

## Publicación

El contenido que se publica está en `dist/`. El repositorio de GitHub sirve para conservar y compartir el código; enviar cambios a GitHub no actualiza automáticamente la web alojada en Sites.

## Enlaces

- [Portfolio](https://rui-de-castro-portfolio.srstrider.chatgpt.site/)
- [Avoid Guild Web](https://www.avoid-guild-eu-sanguino.es/)
- [GitHub](https://github.com/shodawsito)
- [LinkedIn](https://www.linkedin.com/in/rui-nuno-de-castro-tendeiro/)

© Rui De Castro. No se ha incluido una licencia de reutilización del código.
