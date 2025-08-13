# Notes Signals

Aplicación Angular 20 (standalone) con arquitectura signal-first para gestionar notas. Sirve como base de referencia 2025 para proyectos pequeños/medianos.

## Requisitos

- Node 20+
- Angular CLI 20+

## Scripts

- `npm start` — servidor de desarrollo en `http://localhost:4200`
- `npm run build` — build de producción
- `npm run watch` — build en modo watch (dev)

## Arquitectura

- Standalone components (sin NgModules)
- Signal-first en servicios: `signal` para estado, `computed` para derivados, `effect` para side-effects
- RxJS solo en IO (datos) y puente `toSignal/toObservable` cuando aplica
- Organización por features en `src/app/features/*` y capa `core` para servicios/modelos
- Aliases: `@app`, `@core`, `@shared`, `@features`

### Estructura

```
src/app/
├─ core/
│  ├─ models/
│  └─ services/
│     └─ notes/
├─ shared/
│  ├─ ui/
│  └─ design-tokens/
└─ features/
   ├─ home/
   └─ notes/
      ├─ containers/
      └─ components/
```

## Patrón Container/Presentational

- Contenedores: inyectan la fachada de dominio (`NotesService`), coordinan flujos y manejan side-effects.
- Presentacionales: solo `input()` y `output()`, sin inyectar servicios de negocio. Ej.: `note-modal` y `note-form`.

## Facade signal-first (Notas)

- `NotesService` (facade): expone signals readonly del `NotesStateService`, define `computed` derivados, orquesta CRUD delegando a `NotesDataService`, y efectos de carga/auto-guardado.
- `NotesStateService`: única fuente de verdad del estado (signals + `asReadonly()`), derivados (`allTags`, contadores) y mutadores dedicados.
- `NotesFilterService`: lógica de filtrado/orden y stats; normaliza búsqueda (trim/diacríticos) y optimiza escaneos.
- `NotesDataService`: datos de ejemplo + persistencia `localStorage`.

## Guía Signal-First rápida

- Do: Derivados con `computed()`; side-effects con `effect()`.
- Do: Signals privados + `.asReadonly()` público.
- Do: RxJS solo en capa de datos; puente con signals cuando haga falta.
- Don’t: Inyectar servicios de dominio en componentes presentacionales.
- Don’t: Mezclar filtros/orden en el componente; manténlos en el servicio.

## Estilos y budgets

- Presupuesto por estilo de componente ajustado a `8kB` (warning) y `12kB` (error) en `angular.json`.
- Preferir tokens desde `shared/design-tokens` y estilos globales en `src/styles.css` para reutilización.

## Desarrollo

1. `npm install`
2. `npm start`
3. Abre `http://localhost:4200`

## Testing

- Specs pausados. El `tsconfig.app.json` excluye `*.spec.ts` del build.

# NotesSignals

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
