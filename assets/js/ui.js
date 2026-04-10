/* ============================================================
   TradeFi - UI Module
   ============================================================
   Propósito: Componentes dinámicos de interfaz reutilizables en
   todas las páginas: notificaciones toast, modales, tablas,
   paginación, dropdowns y diálogos de confirmación.

   No contiene lógica de negocio; solo manipulación del DOM.
   Ver docs/ARCHITECTURE.md §4.4 para ejemplos de uso.
   ============================================================ */

window.UI = (function () {

  /* ---- Toast ---- */
  /**
   * Muestra una notificación flotante (toast) en la esquina superior derecha.
   * Se apila verticalmente si hay múltiples toasts activos.
   * Se auto-destruye después de `duration` milisegundos con animación.
   * @param {string} message   - Mensaje a mostrar
   * @param {'success'|'error'|'warning'|'info'} [type='info'] - Tipo de notificación
   * @param {number} [duration=4000] - Milisegundos antes de desaparecer
   */
  function showToast(message, type, duration) {
    type     = type     || 'info';
    duration = duration || 4000;

    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info:    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    const titles = { success: 'Éxito', error: 'Error', warning: 'Advertencia', info: 'Información' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-body">
        <div class="toast-title">${titles[type] || 'Notificación'}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.closest('.toast').remove()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    container.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      setTimeout(function () { toast.remove(); }, 300);
    }, duration);
  }

  /* ---- Modals ---- */
  /**
   * Abre un modal agregando la clase 'open' y bloqueando el scroll del body.
   * Adjunta un listener para cerrar si se hace clic en el backdrop (fuera del contenido).
   * @param {string} modalId - ID del elemento .modal-backdrop
   */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal(modalId);
    });
  }

  /**
   * Cierra un modal quitando la clase 'open' y restaurando el scroll del body.
   * @param {string} modalId - ID del elemento .modal-backdrop
   */
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  /** Cierra todos los modales abiertos en la página. */
  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop.open').forEach(function (modal) {
      modal.classList.remove('open');
    });
    document.body.style.overflow = '';
  }

  /* ---- Status Badge ---- */
  /**
   * Genera el HTML de un badge de estado con la clase CSS y el texto en español correctos.
   * Si el estado no está en el mapa, usa 'badge-pending' como fallback.
   * @param {string} status - Código de estado (ej. 'pending', 'completed', 'rejected')
   * @returns {string} HTML del badge
   */
  function renderStatusBadge(status) {
    const map = {
      pending:    { class: 'badge-pending',   label: 'Pendiente' },
      approved:   { class: 'badge-approved',  label: 'Aprobado' },
      completed:  { class: 'badge-completed', label: 'Completado' },
      rejected:   { class: 'badge-rejected',  label: 'Rechazado' },
      active:     { class: 'badge-active',    label: 'Activo' },
      review:     { class: 'badge-review',    label: 'En Revisión' },
      processing: { class: 'badge-processing',label: 'Procesando' },
      cancelled:  { class: 'badge-cancelled', label: 'Cancelado' }
    };
    const info = map[status] || { class: 'badge-pending', label: status };
    return `<span class="badge ${info.class}">${info.label}</span>`;
  }

  /* ---- Tables ---- */
  /**
   * Renderiza encabezados y cuerpo completo de una tabla a partir de datos y columnas.
   * Crea <thead> y <tbody> si no existen en el DOM.
   * @param {string} tableId  - ID del elemento <table>
   * @param {Array} data      - Array de objetos de datos
   * @param {Array<{key:string, label:string, render?:Function}>} columns - Definición de columnas
   */
  function renderTable(tableId, data, columns) {
    const table = document.getElementById(tableId);
    if (!table) return;

    let thead = table.querySelector('thead');
    let tbody = table.querySelector('tbody');

    if (!thead) { thead = document.createElement('thead'); table.appendChild(thead); }
    if (!tbody) { tbody = document.createElement('tbody'); table.appendChild(tbody); }

    // Headers
    const headerRow = columns.map(function (col) {
      return `<th data-col="${col.key}">${col.label}</th>`;
    }).join('');
    thead.innerHTML = `<tr>${headerRow}</tr>`;

    renderTableBody(tableId, data, columns);
  }

  /**
   * Actualiza solo el cuerpo (<tbody>) de una tabla existente.
   * Más eficiente que renderTable cuando los encabezados no cambian.
   * Muestra un estado vacío si no hay datos.
   * @param {string} tableId  - ID del elemento <table>
   * @param {Array} data      - Array de objetos de datos
   * @param {Array} columns   - Definición de columnas (igual que renderTable)
   */
  function renderTableBody(tableId, data, columns) {
    const table = document.getElementById(tableId);
    if (!table) return;

    let tbody = table.querySelector('tbody');
    if (!tbody) { tbody = document.createElement('tbody'); table.appendChild(tbody); }

    if (!data || data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${columns ? columns.length : 8}" style="padding:0;">
            <div class="empty-state">
              <div class="empty-state-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <h3>Sin registros</h3>
              <p>No se encontraron registros que coincidan con los filtros aplicados.</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = data.map(function (row) {
      const cells = columns.map(function (col) {
        const value = col.render ? col.render(row[col.key], row) : (row[col.key] !== undefined ? row[col.key] : '—');
        return `<td>${value}</td>`;
      }).join('');
      return `<tr data-id="${row.id || ''}">${cells}</tr>`;
    }).join('');
  }

  /**
   * Filtra filas visibles de una tabla mostrando/ocultando según texto de búsqueda.
   * Busca en el textContent completo de cada fila (todas las columnas).
   * @param {string} tableId    - ID del elemento <table>
   * @param {string} searchTerm - Texto a buscar (case-insensitive)
   * @returns {number} Cantidad de filas visibles después del filtro
   */
  function filterTable(tableId, searchTerm) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const term  = searchTerm.toLowerCase().trim();
    const rows  = table.querySelectorAll('tbody tr');
    let visible = 0;

    rows.forEach(function (row) {
      const text = row.textContent.toLowerCase();
      const show = !term || text.includes(term);
      row.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    return visible;
  }

  /**
   * Ordena las filas de una tabla por una columna. Detecta si los valores son numéricos.
   * @param {string} tableId      - ID del elemento <table>
   * @param {number} columnIndex  - Índice de la columna a ordenar (0-based)
   * @param {boolean} asc         - true para ascendente, false para descendente
   */
  function sortTable(tableId, columnIndex, asc) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const rows  = Array.from(tbody.querySelectorAll('tr'));

    rows.sort(function (a, b) {
      const aText = (a.cells[columnIndex] || {}).textContent || '';
      const bText = (b.cells[columnIndex] || {}).textContent || '';
      const aNum  = parseFloat(aText.replace(/[^0-9.-]/g, ''));
      const bNum  = parseFloat(bText.replace(/[^0-9.-]/g, ''));
      let cmp;
      if (!isNaN(aNum) && !isNaN(bNum)) {
        cmp = aNum - bNum;
      } else {
        cmp = aText.localeCompare(bText);
      }
      return asc ? cmp : -cmp;
    });

    rows.forEach(function (row) { tbody.appendChild(row); });
  }

  /* ---- Pagination ---- */
  /**
   * Genera controles de paginación con botones de página, anterior/siguiente e info.
   * El callback se serializa con .toString() porque se inyecta en onclick HTML.
   * Muestra "..." para saltos grandes entre páginas.
   * @param {string} containerId  - ID del contenedor donde insertar la paginación
   * @param {number} total        - Total de elementos
   * @param {number} current      - Página actual (1-based)
   * @param {number} perPage      - Elementos por página
   * @param {string} callback     - Función serializada que recibe el número de página
   */
  function renderPagination(containerId, total, current, perPage, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPages = Math.ceil(total / perPage);
    const start = (current - 1) * perPage + 1;
    const end   = Math.min(current * perPage, total);

    let pagesHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - current) <= 2) {
        pagesHTML += `<button class="pagination-btn${i === current ? ' active' : ''}" onclick="(${callback})(${i})">${i}</button>`;
      } else if (Math.abs(i - current) === 3) {
        pagesHTML += `<span style="padding:0 4px;color:var(--text-muted);">…</span>`;
      }
    }

    container.innerHTML = `
      <div class="pagination">
        <span class="pagination-info">Mostrando ${start}–${end} de ${total} registros</span>
        <div class="pagination-controls">
          <button class="pagination-btn" onclick="(${callback})(${current - 1})" ${current <= 1 ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          ${pagesHTML}
          <button class="pagination-btn" onclick="(${callback})(${current + 1})" ${current >= totalPages ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>`;
  }

  /* ---- Dropdowns ---- */
  /**
   * Inicializa todos los dropdowns de la página con atributo [data-dropdown-toggle].
   * Cierra cualquier dropdown abierto al hacer clic fuera de él.
   * Debe llamarse una vez por página (main.js lo hace en DOMContentLoaded).
   */
  function initDropdowns() {
    document.addEventListener('click', function (e) {
      document.querySelectorAll('.dropdown-menu.open').forEach(function (menu) {
        if (!menu.closest('.dropdown').contains(e.target)) {
          menu.classList.remove('open');
        }
      });
    });

    document.querySelectorAll('[data-dropdown-toggle]').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        e.stopPropagation();
        const targetId = trigger.getAttribute('data-dropdown-toggle');
        const menu     = document.getElementById(targetId);
        if (menu) menu.classList.toggle('open');
      });
    });
  }

  /* ---- Date Formatter ---- */
  /**
   * Formatea una fecha ISO/string a texto legible en español mexicano.
   * Devuelve el string original si no puede parsearlo.
   * @param {string} dateString - Fecha en formato ISO, YYYY-MM-DD, etc.
   * @param {string} [locale='es-MX'] - Locale para el formato
   * @returns {string} Fecha formateada (ej. 'nov. 15, 2024')
   */
  function formatDate(dateString, locale) {
    locale = locale || 'es-MX';
    try {
      const d = new Date(dateString);
      if (isNaN(d)) return dateString;
      return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  }

  /* ---- Confirm Dialog ---- */
  /**
   * Muestra un modal de confirmación completamente dinámico (creado en el DOM).
   * Se destruye automáticamente al cerrarse (no persiste en el HTML).
   * @param {string} message        - Pregunta o descripción de la acción a confirmar
   * @param {Function} onConfirm    - Callback ejecutado si el usuario confirma
   * @param {Object} [options]
   * @param {string}  [options.title='Confirmar acción']  - Título del modal
   * @param {boolean} [options.danger=false]              - true para botón rojo de confirmación
   * @param {string}  [options.confirmText='Confirmar']   - Texto del botón de confirmación
   * @param {string}  [options.cancelText='Cancelar']     - Texto del botón de cancelación
   */
  function confirm(message, onConfirm, options) {
    options = options || {};
    const modalId = 'confirm-modal-' + Date.now();
    const modal   = document.createElement('div');
    modal.id      = modalId;
    modal.className = 'modal-backdrop open';
    modal.innerHTML = `
      <div class="modal-dialog modal-sm" style="text-align:center;">
        <div class="modal-header" style="border:none;padding-bottom:0;">
          <div style="flex:1;text-align:center;padding-top:8px;">
            <div style="width:48px;height:48px;border-radius:50%;background:${options.danger ? 'rgba(239,68,68,0.1)' : 'rgba(25,28,70,0.08)'};display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:${options.danger ? 'var(--error)' : 'var(--primary)'}">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="modal-title">${options.title || 'Confirmar acción'}</div>
          </div>
          <button class="modal-close" onclick="document.getElementById('${modalId}').remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body" style="padding-top:12px;padding-bottom:20px;">
          <p style="font-size:var(--font-size-sm);color:var(--text-secondary);line-height:1.6;">${message}</p>
        </div>
        <div class="modal-footer" style="justify-content:center;gap:12px;">
          <button class="btn btn-secondary" onclick="document.getElementById('${modalId}').remove()">${options.cancelText || 'Cancelar'}</button>
          <button class="btn ${options.danger ? 'btn-danger' : 'btn-primary'}" id="${modalId}-confirm">${options.confirmText || 'Confirmar'}</button>
        </div>
      </div>`;

    document.body.appendChild(modal);

    document.getElementById(modalId + '-confirm').addEventListener('click', function () {
      document.getElementById(modalId).remove();
      if (onConfirm) onConfirm();
    });

    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.remove();
    });
  }

  return {
    showToast,
    openModal,
    closeModal,
    closeAllModals,
    renderStatusBadge,
    renderTable,
    renderTableBody,
    filterTable,
    sortTable,
    renderPagination,
    initDropdowns,
    formatDate,
    confirm
  };

})();
