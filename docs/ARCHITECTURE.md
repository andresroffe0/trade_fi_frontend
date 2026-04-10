# TradeFi Frontend — Arquitectura y Guía de Cambios

> Documento de referencia técnica para programadores e IAs que necesiten entender,
> mantener o extender la aplicación. Explica el **por qué** detrás de cada decisión
> de diseño, no solo el qué.

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Estructura de Archivos](#2-estructura-de-archivos)
3. [Flujo de la Aplicación](#3-flujo-de-la-aplicación)
4. [Módulos JavaScript](#4-módulos-javascript)
   - [MockData](#41-mockdata--assets-jsmock-datajs)
   - [Calculator](#42-calculator--assets-jscalculatorjs)
   - [Forms](#43-forms--assets-jsformsjs)
   - [UI](#44-ui--assets-jsuijs)
   - [Main](#45-main--assets-jsmainjs)
5. [Sistema de Diseño CSS](#5-sistema-de-diseño-css)
6. [Páginas y su Lógica](#6-páginas-y-su-lógica)
7. [Autenticación](#7-autenticación)
8. [Patrones Comunes](#8-patrones-comunes)
9. [Cómo Hacer Cambios](#9-cómo-hacer-cambios)
   - [Agregar una nueva página](#91-agregar-una-nueva-página)
   - [Agregar un nuevo campo a una tabla](#92-agregar-un-nuevo-campo-a-una-tabla)
   - [Cambiar colores o tipografía](#93-cambiar-colores-o-tipografía)
   - [Reemplazar datos mock con una API real](#94-reemplazar-datos-mock-con-una-api-real)
   - [Agregar un nuevo modal](#95-agregar-un-nuevo-modal)
10. [Limitaciones y Deuda Técnica](#10-limitaciones-y-deuda-técnica)

---

## 1. Visión General

TradeFi es un **dashboard de finanzas comerciales (trade finance)** orientado a empresas
que realizan transferencias internacionales, créditos y gestión documental. Es una
aplicación de demostración front-end sin back-end real.

**Decisión de arquitectura clave: sin frameworks.**
Se eligió HTML + CSS + JavaScript vanilla para que cualquier programador pueda entenderla
y editarla sin necesidad de conocer React, Vue, Angular ni ninguna cadena de compilación.
No hay `npm install`, no hay bundler, no hay transpilación. Abrir `index.html` en el
navegador es suficiente para correrla.

**Consecuencia de esa decisión:**
Los módulos JS no usan `import/export` de ES Modules, sino que se adjuntan al objeto
`window` (`window.MockData`, `window.Calculator`, etc.). Esto asegura que funcionen
sin servidor ni bundler, cargando los scripts directamente con `<script src="...">`.

---

## 2. Estructura de Archivos

```
trade_fi_frontend/
├── index.html          # Punto de entrada: redirige a login o dashboard según sesión
├── login.html          # Pantalla de autenticación (única página pública)
├── dashboard.html      # Resumen general: métricas KPI y transacciones recientes
├── operations.html     # Gestión de transferencias internacionales
├── credits.html        # Solicitud y seguimiento de créditos/préstamos
├── documents.html      # Carga y gestión de documentos
├── reports.html        # Historial de transacciones con filtros y paginación
├── settings.html       # Configuración de perfil, empresa, API keys y seguridad
├── docs/
│   └── ARCHITECTURE.md # Este archivo
└── assets/
    ├── css/
    │   ├── style.css       # Variables globales (design tokens) y layout base
    │   ├── components.css  # Biblioteca de componentes reutilizables
    │   └── responsive.css  # Media queries para adaptabilidad móvil/tablet/escritorio
    └── js/
        ├── mock-data.js    # Datos estáticos de demostración (window.MockData)
        ├── calculator.js   # Cálculos financieros (window.Calculator)
        ├── forms.js        # Validación y helpers de formularios (window.Forms)
        ├── ui.js           # Utilidades de interfaz: toasts, modales, tablas (window.UI)
        └── main.js         # Inicialización de la app y lógica específica por página
```

### Por qué esta separación de archivos

| Archivo | Razón de ser |
|---------|--------------|
| `mock-data.js` | Centraliza todos los datos de prueba. Cuando se conecte a una API real, **solo este archivo cambia**. |
| `calculator.js` | Lógica financiera pura sin dependencias de DOM. Puede probarse aisladamente y reutilizarse. |
| `forms.js` | Formularios tienen patrones repetitivos (validar, mostrar error, spinner). Evita duplicar ese código en cada página. |
| `ui.js` | Componentes dinámicos (toasts, modales, tablas) que se reutilizan en todas las páginas. |
| `main.js` | Orquesta todo: verifica sesión, inicializa el sidebar/navbar y delega a la función de la página actual. |
| `style.css` | Solo variables CSS y layout. Cambiar un color aquí afecta toda la app. |
| `components.css` | Clases de componentes (`.btn`, `.badge`, `.modal-*`). Agregar un componente aquí lo hace disponible globalmente. |
| `responsive.css` | Separado para que sea fácil ajustar breakpoints sin tocar los estilos base. |

---

## 3. Flujo de la Aplicación

```
Usuario abre el navegador
        │
        ▼
   index.html
        │ ¿Existe 'tradefi_user' en localStorage?
        ├── SÍ ──► dashboard.html
        └── NO ──► login.html
                        │
                        ▼
              El usuario ingresa credenciales
              (demo@example.com / demo123)
                        │
                        ▼
              Se guarda el objeto usuario en
              localStorage('tradefi_user')
                        │
                        ▼
               dashboard.html
                        │
                        ▼
            main.js se carga en cada página
                        │
            1. Verifica sesión (si no hay sesión → login.html)
            2. loadUser() — rellena nombre/email/iniciales en el navbar
            3. initSidebar() — activa el enlace de la página actual
            4. initTopNav() — dropdown de usuario y logout
            5. UI.initDropdowns() — menús desplegables genéricos
            6. dispatchPageInit() — llama a la función init de la página
            7. initCloseButtons() — cierra modales con [data-modal-close]
```

### Por qué no hay router (SPA)

Cada página es un archivo `.html` independiente. Esto simplifica enormemente el código:
no hay estado de navegación, no hay history API, no hay componentes que se monten/desmonten.
La "navegación" son simplemente `<a href="...">` normales. El costo es que el sidebar y
el navbar se repiten en cada HTML, pero ese es un compromiso aceptable para un proyecto
de esta escala sin build step.

---

## 4. Módulos JavaScript

Todos los scripts se cargan en este orden al final del `<body>` de cada página:

```html
<script src="assets/js/mock-data.js"></script>
<script src="assets/js/calculator.js"></script>
<script src="assets/js/forms.js"></script>
<script src="assets/js/ui.js"></script>
<script src="assets/js/main.js"></script>
```

El orden importa: `calculator.js` depende de `mock-data.js` (para las tasas de cambio),
y `main.js` depende de todos los anteriores.

---

### 4.1 MockData — `assets/js/mock-data.js`

**Propósito:** Única fuente de verdad de todos los datos de la aplicación mientras no
exista un back-end real.

**Patrón:** IIFE (Immediately Invoked Function Expression) que devuelve un objeto público.
Las variables internas son privadas; solo se expone lo que está en el `return`.

```js
window.MockData = (function () {
  const datos = [...];   // privado
  return { datos };      // público
})();
```

**Datos expuestos:**

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `currentUser` | Object | Datos del usuario autenticado (nombre, email, empresa, etc.) |
| `operations` | Array | 12 transferencias internacionales de muestra |
| `credits` | Array | 6 créditos en distintos estados |
| `documents` | Array | 10 documentos de muestra |
| `transactions` | Array | 18 transacciones para reportes |
| `metrics` | Object | KPIs del dashboard (totales, tasas de éxito) |
| `exchangeRates` | Object | Tasas de cambio respecto al USD (USD=1) |
| `countries` | Array | Lista de países para el selector de destino |
| `statusOptions` | Array | Estados posibles de operaciones/créditos |
| `paymentMethods` | Array | Métodos de pago con comisión y monto mínimo |

**Estructura de una operación:**
```js
{
  id: 'op_001',               // identificador único
  reference: 'TF-2024-001247', // código visible al usuario
  originCompany: 'Grupo...',  // empresa que envía
  destinationCountry: 'China',
  currency: 'USD',
  amount: 285000,
  method: 'WIRE',             // 'WIRE' o 'ACH'
  status: 'completed',        // ver statusOptions
  createdAt: '2024-11-15T09:32:00Z',
  recipient: 'Shenzhen Electronics Co. Ltd.',
  recipientAccount: 'CN890...',
  description: 'Importación de componentes...'
}
```

**Estructura de un crédito:**
```js
{
  id: 'cr_001',
  reference: 'CRD-2024-0081',
  amount: 500000,
  currency: 'USD',
  loanTerm: 24,               // meses
  purpose: 'Expansión de...',
  interestRate: 8.5,          // % anual
  status: 'active',           // active | pending | completed | rejected | review
  startDate: '2024-01-15',
  nextPaymentDate: '2024-12-15',
  remainingBalance: 398450.75,
  disbursedAt: '2024-01-20',
  monthlyPayment: 22682.17,
  payments: [...]             // historial de pagos realizados
}
```

---

### 4.2 Calculator — `assets/js/calculator.js`

**Propósito:** Todas las operaciones matemáticas financieras en un solo lugar.
No toca el DOM; recibe números y devuelve números o strings formateados.

**Por qué separarlo:** La lógica financiera tiende a ser compleja y propensa a errores.
Tenerla aislada facilita su revisión, prueba y reuso.

**Funciones públicas:**

| Función | Parámetros | Retorna | Descripción |
|---------|-----------|---------|-------------|
| `getExchangeRate(from, to)` | strings de moneda | número | Tasa de conversión entre dos monedas usando USD como pivote |
| `calculateFX(amount, from, to)` | número, string, string | número | Convierte un monto de una moneda a otra |
| `calculateFee(amount, method)` | número, 'WIRE'\|'ACH' | número | Calcula la comisión: WIRE=1.2%, ACH=0.5% |
| `calculateTotal(amount, method)` | número, string | número | Monto + comisión |
| `generateAmortizationSchedule(principal, termMonths, annualRate)` | números | Array | Tabla completa de amortización mes a mes |
| `formatCurrency(amount, currency, locale)` | número, string, string | string | Formatea con símbolo de moneda (usa `Intl.NumberFormat`) |
| `formatNumber(amount, decimals)` | número, número | string | Formatea con separadores de miles |
| `formatCompactCurrency(amount, currency)` | número, string | string | Abrevia grandes cantidades (1.2M, 450K) |
| `calculateMonthlyPayment(principal, termMonths, annualRate)` | números | número | Cuota mensual con fórmula de amortización francesa |
| `calculateTotalInterest(principal, termMonths, annualRate)` | números | número | Total de intereses a pagar durante el plazo |

**Fórmula de amortización francesa** (usada en créditos):
```
cuota = P × [r(1+r)^n] / [(1+r)^n - 1]

donde:
  P = capital principal
  r = tasa mensual (tasa anual / 12 / 100)
  n = número de cuotas (meses)
```

---

### 4.3 Forms — `assets/js/forms.js`

**Propósito:** Evitar repetir la misma lógica de validación y estados de carga en cada
formulario de la app. Actúa como helper de DOM para formularios.

**Funciones públicas:**

| Función | Descripción |
|---------|-------------|
| `validateEmail(email)` | Retorna `true` si el email tiene formato válido |
| `validateAmount(value)` | Retorna `true` si es un número positivo |
| `validatePhone(phone)` | Retorna `true` si tiene formato de teléfono válido |
| `showFieldError(fieldId, message)` | Agrega clase `is-invalid` al campo y muestra mensaje de error |
| `clearFieldError(fieldId)` | Elimina estado de error de un campo |
| `clearAllErrors(formId)` | Limpia todos los errores de un formulario |
| `validateRequired(fields)` | Valida un array de campos obligatorios; retorna `true` si todos son válidos |
| `handleSubmit(formId, callback)` | Adjunta listener de submit previniendo el comportamiento por defecto |
| `showLoadingState(buttonId, text)` | Deshabilita el botón y muestra spinner + texto |
| `hideLoadingState(buttonId, text)` | Restaura el botón a su estado original |
| `getFormData(formId)` | Devuelve un objeto `{campo: valor}` con todos los campos del formulario |
| `resetForm(formId)` | Limpia el formulario y borra todos los errores |
| `setFieldValue(fieldId, value)` | Establece el valor de un campo por su id |

**Cómo usar `validateRequired`:**
```js
var required = [
  { id: 'nombre',  message: 'El nombre es requerido' },
  { id: 'email',   message: 'Ingresa un email', type: 'email' },
  { id: 'monto',   message: 'Ingresa un monto', type: 'amount' }
];
if (!Forms.validateRequired(required)) return; // detiene si hay errores
```

**Cómo funciona `showLoadingState`:**
El HTML original del botón se guarda en `btn._originalHTML` para poder restaurarlo exactamente
después. Esto preserva iconos SVG y cualquier contenido adicional del botón.

---

### 4.4 UI — `assets/js/ui.js`

**Propósito:** Componentes dinámicos de interfaz que se reutilizan en todas las páginas.

**Funciones públicas:**

#### Toasts (notificaciones flotantes)

```js
UI.showToast(message, type, duration)
// type: 'success' | 'error' | 'warning' | 'info'
// duration: milisegundos (default 4000)
```

Crea un contenedor `#toast-container` en el DOM si no existe. Los toasts se apilan
verticalmente y desaparecen con una animación de fade + slide después de `duration` ms.

#### Modales

```js
UI.openModal('id-del-modal')   // agrega clase 'open' y bloquea scroll del body
UI.closeModal('id-del-modal')  // quita clase 'open' y restaura scroll
UI.closeAllModals()             // cierra todos los modales abiertos
```

Los modales usan la clase `.modal-backdrop` en el HTML. Cuando se abre un modal,
se adjunta un listener para cerrarlo si el usuario hace clic en el backdrop (fuera
del contenido del modal).

**Por qué `body.style.overflow = 'hidden'`:** Evita que el scroll de la página sea
visible detrás del modal, lo cual se ve mal y es molesto en móviles.

#### Badges de estado

```js
UI.renderStatusBadge('pending')
// Retorna: '<span class="badge badge-pending">Pendiente</span>'
```

Centraliza la traducción de códigos de estado a texto en español y la clase CSS correcta.

#### Tablas

```js
// Renderiza encabezados + cuerpo
UI.renderTable('id-tabla', datos, columnas)

// Solo actualiza el cuerpo (más eficiente si los encabezados no cambian)
UI.renderTableBody('id-tabla', datos, columnas)

// Oculta filas que no coincidan con el texto buscado
UI.filterTable('id-tabla', 'texto de búsqueda')

// Ordena por columna (índice 0-based)
UI.sortTable('id-tabla', indiceColumna, ascendente)
```

**Definición de columnas:**
```js
var columnas = [
  { key: 'reference', label: 'Referencia' },
  { key: 'amount',    label: 'Monto', render: function(val, row) {
    return Calculator.formatCurrency(val, row.currency);
  }},
  { key: 'status',    label: 'Estado', render: function(val) {
    return UI.renderStatusBadge(val);
  }}
];
```
Si se provee `render`, se usa esa función para generar el HTML de la celda.
Si no, se usa el valor directo.

#### Paginación

```js
UI.renderPagination('id-contenedor', total, paginaActual, elementosPorPagina, callback)
```

`callback` es una función que recibe el número de página nueva. Se serializa con
`.toString()` porque se inyecta en el HTML del botón mediante `onclick`.

#### Diálogo de confirmación

```js
UI.confirm('¿Seguro que deseas eliminar esto?', function() {
  // se ejecuta si el usuario confirma
}, {
  title: 'Eliminar elemento',
  danger: true,          // botón rojo de confirmación
  confirmText: 'Eliminar',
  cancelText: 'Cancelar'
});
```

Crea un modal temporal en el DOM, completamente dinámico. Se destruye al cerrarse.

#### Otros helpers

```js
UI.formatDate('2024-11-15')         // → 'nov. 15, 2024' (locale es-MX)
UI.initDropdowns()                  // inicializa menús con [data-dropdown-toggle]
```

---

### 4.5 Main — `assets/js/main.js`

**Propósito:** Punto de entrada de la lógica de la aplicación. Se carga en todas las
páginas protegidas. Inicializa los componentes compartidos y delega la lógica específica
a cada función de página.

**Estructura general:**

```
IIFE anónimo (evita contaminar el scope global)
│
├── Verificación de sesión (bloque antes de DOMContentLoaded)
│
└── DOMContentLoaded
    ├── loadUser()           — rellena datos del usuario en el navbar
    ├── initSidebar()        — resalta el enlace activo, maneja hamburguesa
    ├── initTopNav()         — dropdown de usuario, logout
    ├── UI.initDropdowns()   — cualquier otro dropdown en la página
    ├── dispatchPageInit()   — router por pathname
    └── initCloseButtons()  — cierra modales con [data-modal-close]
```

**Por qué un IIFE:** Para que las variables locales de `main.js` no sean accesibles desde
la consola del navegador ni otros scripts. Las únicas cosas expuestas en `window` son
`window._viewOperation`, `window._viewCredit`, `window._deleteDocument`, y `window.logout`,
que necesitan serlo porque se invocan desde `onclick` en el HTML generado dinámicamente.

**Router (dispatchPageInit):**
```js
switch (page) {
  case 'dashboard.html':   initDashboard();   break;
  case 'operations.html':  initOperations();  break;
  case 'credits.html':     initCredits();     break;
  case 'documents.html':   initDocuments();   break;
  case 'reports.html':     initReports();     break;
  case 'settings.html':    initSettings();    break;
}
```
Es un simple switch sobre el nombre del archivo HTML. No existe un router más sofisticado
porque no es necesario; cada página es un HTML distinto.

**Helpers internos (privados, no en `window`):**

| Helper | Descripción |
|--------|-------------|
| `escapeHtml(str)` | Escapa caracteres HTML especiales para prevenir XSS al insertar datos en el DOM |
| `setText(id, value)` | Atajo para `document.getElementById(id).textContent = value` |
| `initFileUpload(area, previewId)` | Inicializa drag-and-drop y selección de archivo para un área de carga |
| `handleFileSelect(file, previewId)` | Muestra la vista previa del archivo seleccionado |

**Seguridad — escapeHtml:**
Todos los datos que provienen de `MockData` (o en el futuro de una API) se pasan por
`escapeHtml()` antes de insertarse en el DOM con `innerHTML`. Esto previene ataques XSS.
Los datos que solo se asignan vía `textContent` no necesitan ser escapados porque el
navegador los trata automáticamente como texto plano.

---

## 5. Sistema de Diseño CSS

### Variables (design tokens)

Definidas en `:root` dentro de `style.css`. **Cambiar cualquier valor aquí afecta
toda la aplicación automáticamente.**

```css
:root {
  /* Identidad de marca */
  --primary: #191C46;        /* Azul marino oscuro — color principal */
  --accent:  #D05C46;        /* Coral — acción, énfasis, CTAs */

  /* Textos */
  --text-primary:   #191C46;
  --text-secondary: #5C5C73;
  --text-muted:     #9494A8;

  /* Fondos */
  --bg-white:   #FFFFFF;
  --bg-light:   #F7F8FC;

  /* Estados */
  --success: #10B981;  --success-light: rgba(16,185,129,0.12);
  --warning: #F59E0B;  --warning-light: rgba(245,158,11,0.12);
  --error:   #EF4444;  --error-light:   rgba(239,68,68,0.12);
  --info:    #3B82F6;  --info-light:    rgba(59,130,246,0.12);

  /* Tipografía */
  --font-family: 'Outfit', system-ui, -apple-system, sans-serif;
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  /* ... hasta --font-size-4xl: 2.25rem */

  /* Layout */
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 72px;
  --topnav-height: 64px;
}
```

### Jerarquía de archivos CSS

1. **`style.css`** — variables, reset, layout shell (sidebar + topnav + main content),
   clases de utilidad básicas. No contiene estilos de componentes específicos.

2. **`components.css`** — biblioteca de componentes:
   - `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-outline`
   - `.badge`, `.badge-pending`, `.badge-approved`, `.badge-completed`, etc.
   - `.form-group`, `.form-label`, `.form-control`, `.form-error`, `.input-wrapper`
   - `.card`, `.card-header`, `.card-body`
   - `.modal-backdrop`, `.modal-dialog`, `.modal-header`, `.modal-body`, `.modal-footer`
   - `.toast`, `.toast-container`, `.toast-success`, `.toast-error`, etc.
   - `.table`, `.table-actions`, `.table-action-btn`
   - `.empty-state`

3. **`responsive.css`** — media queries exclusivamente. Sobreescribe estilos de los
   dos archivos anteriores en viewports específicos.

### Breakpoints

| Breakpoint | Comportamiento |
|-----------|----------------|
| `< 480px` | Nombre de marca oculto, botones compactos |
| `< 768px` | Sidebar se convierte en drawer off-canvas (requiere hamburguesa para abrir) |
| `768–1024px` | Sidebar de 220px, grillas de 2 columnas |
| `> 1024px` | Sidebar completo de 260px, grillas de 4 columnas |
| `> 1440px` | Padding adicional, columnas completas en grilla |

### Por qué no hay utility classes al estilo Tailwind

Para mantener la consistencia con la arquitectura sin build step. Utility classes
generadas por Tailwind requieren PostCSS y purgeCSS para no pesar demasiado. Las clases
de componentes de `components.css` son suficientes para esta escala de proyecto.

---

## 6. Páginas y su Lógica

### `index.html`
Script inline que redirige inmediatamente. No tiene DOM visible. Funciona como guardia
de ruta de entrada.

### `login.html`
- Único HTML con estilos inline (el fondo degradado y el layout del card de login son
  específicos de esta página y no se reutilizan en ningún otro lugar).
- Carga los 4 módulos JS pero **no** carga `main.js` para no activar el guard de sesión.
- La lógica de autenticación está inline en un `<script>` al final del body.
- Credenciales hardcodeadas: `demo@example.com` / `demo123`. Para conectar a API real,
  este `setTimeout` se reemplaza por un `fetch`.

### `dashboard.html`
- KPIs: 4 tarjetas con métricas de `MockData.metrics`.
- Tabla de transacciones recientes: primeras 5 de `MockData.transactions`.
- Accesos directos (quick actions) que navegan a otras páginas.
- El saludo personalizado (Buenos días/tardes/noches + nombre) se calcula en tiempo real.

### `operations.html`
- Tabla de operaciones con filtro por texto y por estado.
- Modal "Nueva Operación": formulario con validación, cálculo en vivo de comisión,
  y simulación de envío con `setTimeout(1200ms)`.
- Modal "Detalle": muestra toda la info de una operación existente (solo lectura).
- Las operaciones nuevas se agregan al array local `operationsData` (no persisten al recargar).
- `window._viewOperation(id)`: expuesta en `window` porque se llama desde `onclick` en HTML dinámico.

### `credits.html`
- Tabla de créditos con filtro.
- Modal "Nuevo Crédito": calcula en vivo cuota mensual, total de intereses y costo total.
- Modal "Detalle": muestra resumen del crédito + tabla de amortización completa generada
  por `Calculator.generateAmortizationSchedule`.
- Tasa de interés fija en 8.5% para nuevas solicitudes (simplificación de demo).

### `documents.html`
- Tabla de documentos con filtro por texto, estado y tipo.
- Modal "Subir Documento": drag-and-drop de archivos + selección por click.
- El archivo no se sube realmente a ningún servidor; se simula con datos locales.
- Eliminar documento: usa `UI.confirm` para pedir confirmación antes de borrar.

### `reports.html`
- Historial completo de transacciones con paginación (8 por página).
- Filtros: texto libre, estado, fecha desde/hasta.
- Resumen estadístico calculado dinámicamente sobre los datos filtrados.
- Botones de exportar muestran toast "próximamente" (funcionalidad no implementada).

### `settings.html`
- **Perfil**: pre-rellena los campos con datos del localStorage; al guardar, actualiza el
  localStorage y recarga los datos en el navbar.
- **Empresa**: similar a perfil, persiste en localStorage.
- **API Key**: muestra la clave enmascarada; el botón "Regenerar" genera una clave
  criptográficamente segura usando `window.crypto.getRandomValues`.
- **Contraseña**: valida que la nueva contraseña tenga al menos 6 caracteres y que
  coincida con la confirmación. No persiste porque es un demo.
- **Notificaciones**: los toggles no tienen lógica de persistencia real (solo UX visual).

---

## 7. Autenticación

El sistema de autenticación es intencional simplificado para una aplicación de demo:

```
localStorage['tradefi_user'] = JSON.stringify(userObject)
```

- **Login:** Si email = `demo@example.com` y password = `demo123`, guarda el objeto
  `MockData.currentUser` en localStorage y redirige a `dashboard.html`.
- **Guard:** `main.js` verifica al inicio (antes del DOMContentLoaded) si existe la clave
  en localStorage. Si no existe y la página no es login/index, redirige a `login.html`.
- **Logout:** Elimina la clave de localStorage y redirige a `login.html`.
- **Persistencia:** La sesión persiste entre pestañas y recargas (localStorage es
  persistente) pero no entre perfiles de navegador.

**Para reemplazar con autenticación real:** Ver sección [9.4](#94-reemplazar-datos-mock-con-una-api-real).

---

## 8. Patrones Comunes

### Patrón: módulo IIFE con API pública

Todos los módulos (`MockData`, `Calculator`, `Forms`, `UI`) siguen este patrón:

```js
window.NombreModulo = (function () {
  // Variables y funciones privadas
  var privado = 'solo visible aquí';

  function funcionPrivada() { ... }

  function funcionPublica() {
    return funcionPrivada();
  }

  // Solo se expone lo necesario
  return {
    funcionPublica
  };
})();
```

**Por qué:** Encapsulación sin ES Modules. Evita que variables internas sean accesibles
o modificables desde la consola del navegador.

### Patrón: render de tabla manual

En lugar de usar `UI.renderTable` (que es genérico), las páginas como Operations y Credits
tienen su propia función `renderOperationsTable` / `renderCreditsTable`. Esto es porque
las celdas tienen HTML complejo (badges, botones de acción, iconos) que es más claro
escribir directamente que configurar con columnas.

```js
// Render manual (preferido cuando las celdas tienen HTML complejo)
tbody.innerHTML = data.map(function(item) {
  return `<tr>
    <td>${escapeHtml(item.campo)}</td>
    <td>${UI.renderStatusBadge(item.status)}</td>
    <td><button onclick="window._ver('${item.id}')">Ver</button></td>
  </tr>`;
}).join('');
```

### Patrón: simulación de async con setTimeout

Todas las acciones que en producción serían llamadas a API se simulan con `setTimeout`:

```js
Forms.showLoadingState('submit-btn', 'Procesando...');
setTimeout(function () {
  // Lógica que normalmente sería en el .then() de un fetch
  UI.showToast('Operación exitosa', 'success');
  Forms.hideLoadingState('submit-btn', 'Texto original');
  UI.closeModal('mi-modal');
}, 1200); // simula ~1.2 segundos de latencia de red
```

**Para reemplazar con fetch real:**
```js
Forms.showLoadingState('submit-btn', 'Procesando...');
fetch('/api/operations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(datos)
})
.then(function(res) { return res.json(); })
.then(function(data) {
  UI.showToast('Operación exitosa', 'success');
  Forms.hideLoadingState('submit-btn', 'Texto original');
  UI.closeModal('mi-modal');
})
.catch(function(err) {
  UI.showToast('Error al procesar la solicitud', 'error');
  Forms.hideLoadingState('submit-btn', 'Texto original');
});
```

### Patrón: atributos data-* para comportamiento

Los elementos HTML usan atributos `data-*` para conectar con JavaScript sin acoplar
el código a IDs o clases CSS:

```html
<!-- Estos atributos son leídos por main.js -->
<span data-user-name>Cargando...</span>
<span data-user-initials>AM</span>
<button data-logout>Cerrar Sesión</button>
<button data-open-modal="nueva-operacion-modal">Nueva Operación</button>
<button data-quick-action="new-operation">Ir a Operaciones</button>
<button data-modal-close>Cerrar</button>
```

Esto permite que el HTML sea modificable (cambiar clases CSS) sin romper el JS.

---

## 9. Cómo Hacer Cambios

### 9.1 Agregar una nueva página

1. Copiar `dashboard.html` como punto de partida (tiene el layout completo: sidebar, topnav, etc.).
2. Cambiar el `<title>` y el contenido del `<main>`.
3. Agregar el enlace en el sidebar de **todas** las páginas existentes (dashboard, operations, credits, documents, reports, settings).
4. En `main.js`, agregar el caso en `dispatchPageInit`:
   ```js
   case 'nueva-pagina.html': initNuevaPagina(); break;
   ```
5. Implementar la función `initNuevaPagina()` en `main.js`.
6. Si la página tiene datos propios, agregarlos a `MockData` en `mock-data.js`.

### 9.2 Agregar un nuevo campo a una tabla

1. Agregar el campo al objeto correspondiente en `mock-data.js`.
2. En la función de render de la tabla (`renderOperationsTable`, etc.) en `main.js`,
   agregar la celda `<td>` en el HTML del `map`.
3. Agregar el `<th>` correspondiente en el HTML de la página (el `<thead>` está hardcodeado en el HTML, no generado por JS).

### 9.3 Cambiar colores o tipografía

Editar únicamente `assets/css/style.css`, sección `:root`:

```css
:root {
  --primary: #TU_COLOR;   /* cambia el color principal en toda la app */
  --accent:  #TU_COLOR;   /* cambia el color de énfasis/acción */
}
```

Para cambiar la fuente:
1. Reemplazar el `@import` de Google Fonts en `style.css`.
2. Actualizar `--font-family` en `:root`.

### 9.4 Reemplazar datos mock con una API real

El objetivo del diseño de `MockData` es que sea el único lugar que cambia cuando se
integra un back-end real.

**Opción A — Reemplazar MockData completamente:**

Crear un nuevo `api-client.js` que haga `fetch` y exponga la misma interfaz:

```js
window.MockData = (function () {
  // Las funciones retornan Promises en lugar de valores síncronos
  async function getOperations() {
    const res = await fetch('/api/operations', {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    return res.json();
  }

  function getToken() {
    const user = JSON.parse(localStorage.getItem('tradefi_user') || '{}');
    return user.token || '';
  }

  return { getOperations, ... };
})();
```

Luego actualizar `main.js` para usar `await` o `.then()` donde antes era síncrono:

```js
// Antes (síncrono)
operationsData = MockData.operations.slice();

// Después (asíncrono)
MockData.getOperations().then(function(data) {
  operationsData = data;
  renderOperationsTable(operationsData);
});
```

**Para la autenticación real:**
En `login.html`, reemplazar la comparación hardcodeada:

```js
// Antes
if (email === 'demo@example.com' && password === 'demo123') {
  localStorage.setItem('tradefi_user', JSON.stringify(MockData.currentUser));
  window.location.href = 'dashboard.html';
}

// Después
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
.then(res => res.json())
.then(data => {
  if (data.user) {
    localStorage.setItem('tradefi_user', JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  } else {
    // mostrar error
  }
});
```

### 9.5 Agregar un nuevo modal

1. En el HTML de la página, agregar la estructura del modal:
   ```html
   <div class="modal-backdrop" id="mi-nuevo-modal">
     <div class="modal-dialog">
       <div class="modal-header">
         <h2 class="modal-title">Título</h2>
         <button class="modal-close" data-modal-close>
           <svg ...>...</svg>
         </button>
       </div>
       <div class="modal-body">
         <!-- contenido -->
       </div>
       <div class="modal-footer">
         <button class="btn btn-secondary" data-modal-close>Cancelar</button>
         <button class="btn btn-primary" id="mi-modal-submit">Confirmar</button>
       </div>
     </div>
   </div>
   ```

2. El atributo `data-modal-close` en cualquier botón dentro del modal lo cerrará
   automáticamente (lo maneja `initCloseButtons` en `main.js`).

3. Para abrir el modal desde un botón:
   ```js
   document.getElementById('mi-btn').addEventListener('click', function() {
     UI.openModal('mi-nuevo-modal');
   });
   ```
   O usando el atributo `data-open-modal` (si se agrega soporte en `main.js`):
   ```html
   <button data-open-modal="mi-nuevo-modal">Abrir</button>
   ```

---

## 10. Limitaciones y Deuda Técnica

| Limitación | Impacto | Solución sugerida |
|------------|---------|-------------------|
| No hay persistencia real | Nuevas operaciones/créditos desaparecen al recargar | Conectar a API o usar IndexedDB |
| Autenticación trivial | No es segura para producción | Implementar JWT + back-end |
| Sidebar duplicado en cada HTML | Difícil de mantener si cambia la navegación | Usar un web component o template de servidor |
| Sin TypeScript | Errores de tipo solo visibles en tiempo de ejecución | Migrar a TypeScript o agregar JSDoc con `@ts-check` |
| Sin tests | Cambios pueden romper funcionalidad silenciosamente | Agregar Jest para `calculator.js` al menos |
| `escapeHtml` manual | Propenso a olvidos | Usar una librería como DOMPurify o migrar a template engine |
| Tasas de cambio estáticas | No reflejan el mercado real | Integrar API de divisas (ej. Open Exchange Rates) |
| Tasa de interés fija (8.5%) | No permite personalización por producto | Agregar campo de tasa en el formulario y en MockData |
| Paginación serializa callbacks como string | Frágil si la función tiene closures complejos | Mantener estado de página en el scope del módulo y registrar el listener una sola vez |

---

*Última actualización: 2026-04-10*
