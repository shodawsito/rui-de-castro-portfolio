# Portfolio de Rui De Castro

Portfolio estático de Rui De Castro. Las páginas se generan a partir de contenido en JSON y se publican en Vercel. El navegador recibe HTML, CSS e imágenes; no necesita un framework ni dependencias de producción.

## Desarrollo local

Requiere Node.js 20 o posterior. Desde la raíz del proyecto:

```bash
npm run build
node preview-server.mjs
```

Abre `http://127.0.0.1:4173`. Vuelve a ejecutar `npm run build` después de cambiar contenido o estilos y recarga la página.

`npm run check` comprueba el orden de dos proyectos, la generación del caso, la exclusión de borradores, la navegación entre secciones y la validación del contenido; al terminar reconstruye la versión normal de `dist/`.

## Estructura

```text
src/
  content/site.es.json                 Textos comunes, navegación y metadatos
  content/projects/*.es.json           Un archivo por proyecto
  styles.css                           Estilos compartidos
  menu.js                              Cierre del menú móvil
  assets/                              Imágenes
scripts/build.mjs                      Validación y generación de páginas
scripts/validate.mjs                   Reglas del contenido y de los proyectos
scripts/render.mjs                     Plantillas HTML compartidas
scripts/check-build.mjs                Comprobación del flujo de proyectos
examples/project-template.es.json      Plantilla mínima para nuevos casos
dist/                                  Resultado generado; no se versiona
vercel.json                            Configuración de publicación
```

## Añadir o actualizar un proyecto

1. Copia `examples/project-template.es.json` a `src/content/projects/<slug>.es.json` y adapta los campos. El nombre del archivo debe coincidir con `slug`. Usa el caso de Avoid Guild Web como ejemplo de una página más extensa.
2. Coloca la imagen en `src/assets/` y actualiza `image.src`, su tamaño, los textos alternativos y el pie.
3. Escribe el resumen para la tarjeta, metadatos SEO y las secciones del caso de estudio. Los bloques disponibles son `lead`, `paragraph`, `cards`, `features`, `architecture`, `stats`, `subheading` y `quote`. El diagrama `architecture`, si se usa, lleva tres columnas. El menú del caso enlaza a la primera sección; añade `case.navigationSectionId` para elegir otra por su `id`. `liveUrl` es opcional: omítelo si el proyecto aún no tiene una web pública.
4. Define `displayOrder` para ordenar el catálogo. Añade `featuredRank` para mostrarlo en la portada; los números menores aparecen primero. Omite `featuredRank` si solo debe salir en el catálogo.
5. Usa `status: "draft"` mientras preparas el proyecto. Cambia a `"published"` cuando esté listo. Los borradores no generan páginas públicas.
6. Ejecuta `npm run build` y revisa `/`, `/proyectos/` y `/proyectos/<slug>/` en la vista local.

Las tarjetas, el catálogo, las rutas de casos y el enlace al siguiente proyecto se generan automáticamente a partir de los archivos publicados. Cambia los textos compartidos en `src/content/site.es.json`; no edites `dist/`.

## Publicación

Vercel ejecuta `npm run build` y publica `dist/` desde la rama principal. El dominio principal es [rui-de-castro-portfolio.es](https://rui-de-castro-portfolio.es/); `www` redirige al dominio raíz. La URL canónica se define en `src/content/site.es.json`.

© Rui De Castro. No se ha incluido una licencia de reutilización del código.
