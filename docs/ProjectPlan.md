🎨 Colorama - Projekt Plan
Projekt-Übersicht
Name: Creative CanvasTagline: "Your offline-first creative playground"Tech Stack: SvelteKit, Canvas API, Dexie.js, Supabase (optional), Vite PWADeployment: Vercel/Netlify mit PWA-Support

Phase 1: Foundation (Woche 1-2)
Setup & Architektur

creative-canvas/
├── src/
│ ├── lib/
│ │ ├── canvas/
│ │ │ ├── engines/
│ │ │ │ ├── PixelEngine.js
│ │ │ │ ├── DrawEngine.js
│ │ │ │ └── MandalaEngine.js
│ │ │ ├── tools/
│ │ │ │ ├── Brush.js
│ │ │ │ ├── ColorPicker.js
│ │ │ │ └── History.js
│ │ │ └── utils/
│ │ │ ├── colors.js
│ │ │ └── geometry.js
│ │ ├── stores/
│ │ │ ├── canvas.js
│ │ │ ├── settings.js
│ │ │ └── user.js
│ │ ├── db/
│ │ │ ├── schema.js
│ │ │ └── sync.js
│ │ └── components/
│ │ ├── Toolbar.svelte
│ │ ├── ColorPalette.svelte
│ │ ├── Canvas.svelte
│ │ └── ModeSelector.svelte
│ ├── routes/
│ │ ├── +layout.svelte
│ │ ├── +page.svelte
│ │ ├── pixel/+page.svelte
│ │ ├── draw/+page.svelte
│ │ └── mandala/+page.svelte
│ └── app.html
├── static/
│ ├── manifest.json
│ └── icons/
└── package.json
Core Features

- SvelteKit Projekt Setup mit TypeScript
- PWA Configuration (Vite PWA Plugin)
- Service Worker für Offline-First
- Dexie.js Schema für lokale Speicherung
- Base Canvas Component
- Responsive Layout (Mobile-First)
- Navigation zwischen Modi
  Datenbank Schema (Dexie.js)

javascript
// db/schema.js
export const db = new Dexie('CreativeCanvas');

db.version(1).stores({
projects: '++id, name, mode, created, modified, thumbnail',
projectData: '++id, projectId, canvasData, settings',
preferences: 'key, value',
syncQueue: '++id, action, data, synced'
});

Phase 2: Die 3 Zeichen-Modi (Woche 3-5)

1. Pixel Art Mode 🟦
   Features:

- Grid-System (8x8 bis 128x128)
- Pixel-perfektes Zeichnen
- Symmetrie-Optionen
- Farbpaletten (Retro, Modern, Custom)
- Onion Skinning für Animationen
- Export als PNG oder Sprite Sheet
  UI Elemente:

┌─────────────────────────────────┐
│ [Grid Size] [Zoom] [Grid On/Off]│
├─────────────────────────────────┤
│ │
│ 📋 Canvas mit Grid │
│ │
├─────────────────────────────────┤
│ 🎨 Palette | Tools | History │
└─────────────────────────────────┘
Technische Details:

- Canvas mit imageSmoothingEnabled = false
- Grid-Overlay als separate Canvas-Layer
- Flood-Fill Algorithmus
- Pixel-Preview bei Hover

2. Free Draw Mode ✏️
   Features:

- Verschiedene Pinsel (Pencil, Marker, Airbrush, Calligraphy)
- Drucksensitivität (Pointer Events API)
- Smoothing-Algorithmus für flüssige Linien
- Ebenen-System (3-5 Ebenen)
- Blend-Modi
- Quick-Undo mit Gesture
  Pinsel-Engine:


javascript
class BrushEngine {

- Bezier-Kurven für Smoothing
- Velocity-based Breite
- Texture-Support
- Stabilizer Option
  }
  Tools:

* Radierer
* Smudge/Verwischen
* Pipette
* Linie/Form Tools
* Text-Tool (Basic)

3. Mandala Mode 🔮
   Features:

- Symmetrie-Achsen (4, 6, 8, 12, 16)
- Echtzeit-Spiegelung
- Kaleidoskop-Effekt Option
- Guide-Lines (Radial/Circular)
- Pattern-Fill Optionen
- Animations-Export als GIF
  Mathematik:

javascript
// Spiegelung berechnen
function mirrorPoints(x, y, centerX, centerY, segments) {
const angle = 360 / segments;
const points = [];

for(let i = 0; i < segments; i++) {
const rotated = rotatePoint(x, y, centerX, centerY, angle \* i);
points.push(rotated);
if(mirrorMode) {
const mirrored = mirrorPoint(rotated.x, rotated.y, centerX, centerY);
points.push(mirrored);
}
}
return points;
}

Phase 3: State Management & Storage (Woche 6)
Store-Struktur

javascript
// stores/canvas.js
export const canvasState = writable({
mode: 'pixel', // pixel | draw | mandala
tool: 'brush',
color: '#000000',
brushSize: 5,
opacity: 1,
history: [],
historyStep: -1
});

// stores/project.js  
export const currentProject = writable({
id: null,
name: 'Untitled',
modified: false,
autoSave: true
});
Offline Storage Strategy

1. Auto-Save alle 30 Sekunden
2. Canvas-to-Blob Konvertierung
3. IndexedDB via Dexie.js
4. Kompression für große Projekte
5. Export-Queue für Sync

Phase 4: UI/UX & Polish (Woche 7-8)
Component Library

- Toolbar: Floating oder Fixed
- Palette: Expandable, Drag-to-reorder
- Settings: Modal oder Sidebar
- Gallery: Grid-View der Projekte
- Shortcuts: Customizable Keybindings
  Accessibility
- Keyboard Navigation
- ARIA Labels
- High Contrast Mode
- Touch-Gestures für Mobile
- Haptic Feedback (Vibration API)
  Performance Optimizations
- RequestAnimationFrame für Drawing
- OffscreenCanvas für Heavy Operations
- Web Workers für Filter/Effects
- Virtual Scrolling in Gallery
- Lazy Loading von Projekten

Phase 5: Supabase Integration (Woche 9)
Features

- Auth (Email/Magic Link)
- Cloud Backup
- Projekt Sharing
- Public Gallery
- Collaboration (später)
  Sync-Strategie

javascript
// Offline-First mit Eventual Consistency
class SyncManager {

- Queue lokale Änderungen
- Sync bei Connection
- Conflict Resolution (Last-Write-Wins)
- Batch Updates
  }

Phase 6: Export & Share (Woche 10)
Export-Formate

- PNG/JPG - Standard Export
- SVG - Für Vektor-kompatible Zeichnungen
- GIF - Animierte Mandalas
- MP4 - Timelapse via MediaRecorder API
- Project File - JSON mit allen Daten
  Share-Features
- Link-Sharing (Public Gallery)
- Social Media Cards
- QR-Code Generation
- Embed-Widget

Testing & Deployment (Woche 11-12)
Testing

- Unit Tests für Canvas-Engines
- E2E Tests mit Playwright
- PWA Tests (Lighthouse)
- Cross-Browser Testing
- Performance Profiling
  Deployment

yaml

# Vercel Config

- PWA Headers
- Edge Functions für API
- Image Optimization
- CDN Setup

MVP Milestones
✅ Milestone 1 (Ende Woche 2)

- Basis-App läuft offline
- Navigation funktioniert
- Canvas rendert
  ✅ Milestone 2 (Ende Woche 5)
- Alle 3 Modi funktional
- Lokales Speichern works
- Basic Tools implementiert
  ✅ Milestone 3 (Ende Woche 8)
- Polished UI
- Smooth Performance
- Mobile-Ready
  ✅ Milestone 4 (Ende Woche 12)
- Supabase Optional integriert
- Export funktioniert
- Production-Ready

Post-MVP Features
Version 1.1:

- Weitere Modi (Particle, Flow-Field)
- Advanced Color Tools (Gradients, Patterns)
- Plugin-System
  Version 1.2:
- Collaboration
- AI-Integration (Stable Diffusion API)
- Community Features
  Version 2.0:
- Native Apps via Capacitor
- Marketplace für Brushes/Assets
- Tutorial-System
