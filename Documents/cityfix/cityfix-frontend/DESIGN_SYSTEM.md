# 🎨 Sistema de Diseño CityFix

## Principios de Diseño (Reglas Doradas de Shneiderman)

### ✅ 1. Consistencia
- **Colores**: Paleta institucional azul (#2563eb) con grises neutros
- **Tipografía**: Inter como fuente principal, jerarquía clara
- **Componentes**: Botones, cards y formularios estandarizados
- **Espaciado**: Sistema de 8px (Tailwind spacing)

### ✅ 2. Feedback Visual
- **Estados de carga**: Spinners y estados disabled
- **Validación**: Errores en tiempo real con colores y mensajes
- **Confirmaciones**: Alerts de éxito/error/advertencia
- **Hover states**: Transiciones suaves en todos los elementos interactivos

### ✅ 3. Control del Usuario
- **Navegación**: Breadcrumbs y botones de retroceso
- **Cancelación**: Botones de cancelar en formularios
- **Confirmaciones**: Modales para acciones destructivas
- **Filtros**: Control total sobre la visualización de datos

### ✅ 4. Reducción de Carga Cognitiva
- **Iconos**: Representaciones visuales claras
- **Agrupación**: Información relacionada agrupada
- **Jerarquía**: Tamaños de texto y espaciado lógicos
- **Simplicidad**: Interfaces limpias sin elementos innecesarios

### ✅ 5. Manejo de Errores
- **Prevención**: Validación en tiempo real
- **Mensajes claros**: Explicaciones específicas de errores
- **Recuperación**: Sugerencias para corregir errores
- **Estados de error**: Indicadores visuales claros

## Componentes del Sistema

### 🔘 Botones
```jsx
<Button variant="primary" size="md" loading={false} icon="🚀">
  Texto del Botón
</Button>
```

**Variantes:**
- `primary`: Azul principal (#2563eb)
- `secondary`: Gris claro
- `danger`: Rojo para acciones destructivas
- `success`: Verde para confirmaciones
- `outline`: Borde azul, fondo transparente

### 📋 Cards
```jsx
<Card hover>
  <Card.Header>Título</Card.Header>
  <Card.Body>Contenido</Card.Body>
</Card>
```

### 🏷️ Status Badges
```jsx
<StatusBadge status="Pendiente" size="md" />
```

**Estados:**
- Pendiente: Amarillo con ⏳
- En Proceso: Azul con 🔄
- Resuelto: Verde con ✅
- Rechazado: Rojo con ❌

### ⚠️ Alerts
```jsx
<Alert type="success" title="Éxito" message="Operación completada" onClose={handleClose} />
```

## Paleta de Colores

### Colores Principales
- **Azul Principal**: #2563eb (primary-600)
- **Azul Claro**: #3b82f6 (primary-500)
- **Azul Oscuro**: #1d4ed8 (primary-700)

### Colores de Estado
- **Éxito**: #10b981 (green-500)
- **Advertencia**: #f59e0b (yellow-500)
- **Error**: #ef4444 (red-500)
- **Información**: #3b82f6 (blue-500)

### Grises
- **Texto Principal**: #111827 (gray-900)
- **Texto Secundario**: #6b7280 (gray-500)
- **Bordes**: #e5e7eb (gray-200)
- **Fondos**: #f9fafb (gray-50)

## Tipografía

### Jerarquía
- **H1**: text-3xl font-bold (30px)
- **H2**: text-2xl font-semibold (24px)
- **H3**: text-xl font-semibold (20px)
- **Body**: text-base (16px)
- **Small**: text-sm (14px)
- **Caption**: text-xs (12px)

### Fuente
- **Principal**: Inter (system-ui fallback)
- **Peso**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

## Espaciado

### Sistema de 8px
- **xs**: 4px (1)
- **sm**: 8px (2)
- **md**: 16px (4)
- **lg**: 24px (6)
- **xl**: 32px (8)
- **2xl**: 48px (12)

## Responsive Design

### Breakpoints
- **sm**: 640px (móvil grande)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (desktop grande)

### Estrategia Mobile-First
1. Diseño base para móvil
2. Adaptaciones progresivas para pantallas más grandes
3. Navegación colapsible en móvil
4. Cards apilables en columnas

## Accesibilidad

### Contraste
- **Texto normal**: Mínimo 4.5:1
- **Texto grande**: Mínimo 3:1
- **Elementos interactivos**: Mínimo 3:1

### Navegación
- **Focus visible**: Anillos azules en elementos focusables
- **Tamaño mínimo**: 44px para elementos táctiles
- **Labels**: Todos los inputs tienen labels asociados
- **Alt text**: Imágenes con texto alternativo

### Semántica
- **HTML semántico**: header, nav, main, section, article
- **ARIA labels**: Para elementos complejos
- **Roles**: Definidos donde sea necesario

## Animaciones

### Transiciones
- **Duración**: 200ms para hover, 300ms para modales
- **Easing**: ease-out para entradas, ease-in para salidas
- **Propiedades**: transform, opacity, colors

### Estados de Carga
- **Spinners**: Animación de rotación suave
- **Skeleton**: Placeholders animados
- **Progress**: Barras de progreso fluidas

## Iconografía

### Sistema de Iconos
- **Emojis**: Para elementos visuales rápidos
- **SVG**: Para iconos de interfaz
- **Tamaños**: 16px, 20px, 24px, 32px

### Significados
- 🏠 Dashboard/Inicio
- 📋 Listados/Reclamos
- ➕ Crear/Agregar
- ⚙️ Configuración
- 👤 Usuario/Perfil
- 🔍 Búsqueda
- ✅ Éxito/Completado
- ⚠️ Advertencia
- ❌ Error/Rechazado

## Mejores Prácticas

### Performance
- **Lazy loading**: Imágenes y componentes pesados
- **Optimización**: Imágenes comprimidas
- **Caching**: Estrategias de cache para assets

### Mantenibilidad
- **Componentes reutilizables**: DRY principle
- **Props consistentes**: Interfaces predecibles
- **Documentación**: Comentarios en código complejo

### Testing
- **Accesibilidad**: Tests automáticos de a11y
- **Responsive**: Tests en múltiples dispositivos
- **Usabilidad**: Tests de usuario regulares