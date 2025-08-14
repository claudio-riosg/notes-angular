# Notes App - Angular 20 Signal-First Architecture

Una aplicación de notas construida con **Angular 20** y **arquitectura signal-first**,
con componentes standalone, control de flujo actular (@if, @for) y programación reactiva basada en signals.

## 🚀 Stack Tecnológico

- **Angular 20.1.0** - Componentes standalone + directivas de control de flujo modernas
- **TypeScript 5.8.2** - Modo estricto con path aliases
- **RxJS 7.8.0** - Solo para HTTP y casos específicos de reactivos
- **CSS Custom Properties** - Variables CSS nativas sin preprocesadores
- **Jest** - Framework de testing
- **Node.js HTTP Server** - Mock server para desarrollo

## 🏗️ Arquitectura Signal-First

### Patrones Principales

**1. Gestión de Estado Reactivo**
```typescript
// Estado centralizado con signals
@Injectable({ providedIn: 'root' })
export class NotesStateService {
  private notesSignal = signal<Note[]>([]);
  readonly notes = this.notesSignal.asReadonly();
  
  // Estado derivado automático
  readonly allTags = computed(() => {
    return this.notes().flatMap(note => note.tags);
  });
}
```

**2. Facade de Dominio**
```typescript
// Orquestación signal-first
@Injectable({ providedIn: 'root' })
export class NotesService {
  // Conversión RxJS → Signal con optimizaciones
  private notesData = toSignal(
    toObservable(this.notesStateService.filter).pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(() => this.notesApiClient.getNotes()),
    ),
    { initialValue: [] }
  );
}
```

**3. Container-Presentational Pattern**
```typescript
// Container: lógica de negocio
@Component({
  selector: 'notes',
  imports: [NotesGrid, SearchBar],
  template: `
    @if (notesService.isLoading()) {
      <div>Loading...</div>
    }
    <notes-grid 
      [notes]="notesService.filteredNotes()"
      (noteClick)="selectNote($event)">
    </notes-grid>
  `
})
export class Notes {
  notesService = inject(NotesService);
}

// Presentational: UI pura
@Component({
  selector: 'notes-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (note of notes(); track note.id) {
      <note-card [note]="note" (click)="noteClick.emit(note)">
    }
  `
})
export class NotesGrid {
  notes = input.required<Note[]>();
  noteClick = output<Note>();
}
```

### Arquitectura de Servicios

```
src/app/core/services/notes/
├── notes-facade.ts       # 🎯 Orquestador principal
├── notes-state.ts        # 📊 Estado centralizado
├── notes-api-client.ts   # 🌐 Cliente HTTP REST
└── notes-filter.ts       # 🔍 Lógica de filtrado
```

**Responsabilidades:**
- **NotesService** - Facade reactiva que orquesta estado, HTTP y filtros
- **NotesStateService** - Estado único con signals + computed derivados
- **NotesApiClient** - Comunicación HTTP (Observable → toSignal)
- **NotesFilterService** - Filtrado, ordenamiento y estadísticas

## 🎨 Sistema de Estilos

**CSS Custom Properties**:
```css
:root {
  /* Colores semánticos */
  --color-primary: #10b981;
  --color-primaryHover: #059669;
  
  /* Sistema de espaciado */
  --spacing-sm: 8px;
  --spacing-lg: 16px;
  
  /* Tipografía */
  --font-size-base: 16px;
  --font-weight-medium: 500;

}
```

## 📁 Organización por Features

```
src/app/
├── core/                    # Servicios singleton + modelos
│   ├── services/notes/     # 4 servicios especializados  
│   └── models/            # Interfaces TypeScript
├── shared/ui/             # Componentes reutilizables
└── features/              # Lazy loading por características
    ├── home/             # Landing page
    └── notes/            # Sistema de notas
        ├── containers/   # Componentes inteligentes
        └── components/   # Componentes presentacionales
```

## 🔄 Desarrollo Dual (Mock + Angular)

**Terminal 1: Mock Server**
```bash
npm run mock:server  # Puerto 3000
```

**Terminal 2: Angular App**  
```bash
npm start           # Puerto 4200 con proxy
```

## 📋 Scripts Disponibles

### Desarrollo
- `npm start` - Servidor Angular con proxy HTTP (puerto 4200)
- `npm run mock:server` - Servidor mock HTTP (puerto 3000)  
- `npm run build` - Build de producción
- `npm run watch` - Build de desarrollo con watch

### Testing
- `npm test` - Ejecutar todos los tests con Jest
- `npm run test:watch` - Tests en modo watch
- `npm run test:coverage` - Tests con coverage

## 🎯 Características Implementadas

**Funcionalidades Core:**
- ✅ CRUD completo de notas con API REST
- ✅ Sistema de etiquetas con autocompletado
- ✅ Filtrado avanzado (búsqueda, tags, colores, pinned)
- ✅ Sistema de pinning con ordenamiento automático
- ✅ Modal reactivo con validación de formularios
- ✅ Context menu con acciones rápidas
- ✅ Persistencia con mock server HTTP

**Optimizaciones de UX:**
- ✅ Estados granulares por operación (`isUpdating(id)`, `isDeleting(id)`)
- ✅ Debounce inteligente en búsquedas (200ms)
- ✅ Loading states con `@defer` viewport
- ✅ Feedback visual inmediato en todas las acciones
- ✅ Responsive design con CSS Grid/Flexbox

## 🧪 Principios Signal-First

**Do's ✅**
- Estado con `signal()` privado + `.asReadonly()` público
- Derivados automáticos con `computed()`
- Side-effects con `effect()` para auto-guardado
- RxJS solo en capa IO (HTTP) + puente `toSignal()`
- Componentes presentacionales sin servicios de dominio

**Don'ts ❌**
- No mezclar lógica de filtros en componentes
- No usar RxJS para estado (usar signals)
- No inyectar facade en componentes presentacionales
- No usar CommonModule (eliminado en Angular 20)
- No usar *ngIf/*ngFor (usar @if/@for)

**Optimizaciones de Rendimiento:**
- OnPush change detection en todos los componentes
- Lazy loading con code splitting automático
- Tree shaking para eliminación de código no usado
- CSS variables más eficientes que preprocesadores

## 🔧 Setup Inicial

```bash
# Instalar dependencias
npm install

# Desarrollo completo (2 terminales)
npm run mock:server  # Terminal 1
npm start           # Terminal 2

# Abrir navegador
open http://localhost:4200
