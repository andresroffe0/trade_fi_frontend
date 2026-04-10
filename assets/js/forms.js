/* ============================================================
   TradeFi - Forms Module
   ============================================================
   Propósito: Helpers para formularios que evitan duplicar la lógica
   de validación, estados de carga y manejo de errores en cada página.

   Patrón de uso típico:
     1. Forms.clearAllErrors('mi-form')
     2. if (!Forms.validateRequired([...])) return;
     3. Forms.showLoadingState('mi-btn', 'Procesando...')
     4. // ... lógica async ...
     5. Forms.hideLoadingState('mi-btn', 'Texto original')

   Ver docs/ARCHITECTURE.md §4.3 para ejemplos detallados.
   ============================================================ */

window.Forms = (function () {

  /**
   * Valida formato de email con expresión regular básica.
   * @param {string} email
   * @returns {boolean}
   */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  /**
   * Valida que el valor sea un número positivo.
   * @param {string|number} value
   * @returns {boolean}
   */
  function validateAmount(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  }

  /**
   * Valida formato de número telefónico (7–20 caracteres, permite +, espacios, guiones).
   * @param {string} phone
   * @returns {boolean}
   */
  function validatePhone(phone) {
    return /^[+]?[\d\s\-().]{7,20}$/.test(phone.trim());
  }

  /**
   * Muestra un mensaje de error debajo de un campo de formulario.
   * Agrega la clase 'is-invalid' al campo y crea/actualiza un elemento .form-error.
   * Si el elemento .form-error ya existe (del HTML estático), lo reutiliza.
   * @param {string} fieldId - ID del campo con error
   * @param {string} message - Mensaje de error a mostrar
   */
  function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.add('is-invalid');

    let errorEl = field.parentElement.querySelector('.form-error[data-field="' + fieldId + '"]');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      errorEl.setAttribute('data-field', fieldId);
      field.parentElement.appendChild(errorEl);
    }

    errorEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>${message}`;
  }

  /**
   * Limpia el estado de error de un campo específico.
   * @param {string} fieldId - ID del campo a limpiar
   */
  function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.remove('is-invalid');

    const errorEl = field.parentElement.querySelector('.form-error[data-field="' + fieldId + '"]');
    if (errorEl) errorEl.innerHTML = '';
  }

  /**
   * Limpia todos los errores de un formulario completo.
   * @param {string} formId - ID del elemento <form>
   */
  function clearAllErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.form-error').forEach(el => { el.innerHTML = ''; });
  }

  /**
   * Valida un array de campos requeridos y muestra errores inline.
   * Devuelve true solo si todos los campos son válidos.
   * Soporta validación de tipo 'email' y 'amount' además de requerido.
   *
   * @param {Array<{id: string, message?: string, type?: string}>} fields
   *   - id: ID del campo en el DOM
   *   - message: mensaje si está vacío (default: 'Este campo es requerido')
   *   - type: 'email' | 'amount' para validación adicional de formato
   * @returns {boolean} true si todos los campos son válidos
   */
  function validateRequired(fields) {
    let isValid = true;
    fields.forEach(function (field) {
      const el = document.getElementById(field.id);
      if (!el) return;

      clearFieldError(field.id);
      const value = el.value ? el.value.trim() : '';

      if (!value) {
        showFieldError(field.id, field.message || 'Este campo es requerido');
        isValid = false;
      } else if (field.type === 'email' && !validateEmail(value)) {
        showFieldError(field.id, 'Ingresa un correo electrónico válido');
        isValid = false;
      } else if (field.type === 'amount' && !validateAmount(value)) {
        showFieldError(field.id, 'Ingresa un monto válido mayor a 0');
        isValid = false;
      }
    });
    return isValid;
  }

  /**
   * Adjunta un listener de submit a un formulario previniendo el comportamiento por defecto.
   * @param {string} formId   - ID del formulario
   * @param {Function} callback - Función a ejecutar en el submit (recibe el evento)
   */
  function handleSubmit(formId, callback) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      callback(e);
    });
  }

  /**
   * Muestra el estado de carga en un botón: lo deshabilita y muestra un spinner.
   * El HTML original se guarda en btn._originalHTML para poder restaurarlo después.
   * @param {string} buttonId    - ID del botón
   * @param {string} [loadingText] - Texto a mostrar junto al spinner
   */
  function showLoadingState(buttonId, loadingText) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    btn.disabled = true;
    btn._originalHTML = btn.innerHTML;
    btn.innerHTML = `
      <span class="btn-spinner" style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.35);border-top-color:white;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span>
      ${loadingText || 'Procesando...'}
    `;
  }

  /**
   * Restaura un botón a su estado normal después de una carga.
   * Si existe btn._originalHTML lo usa; si no, establece el texto proporcionado.
   * @param {string} buttonId - ID del botón
   * @param {string} [text]   - Texto de fallback si no hay HTML guardado
   */
  function hideLoadingState(buttonId, text) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    btn.disabled = false;
    if (btn._originalHTML) {
      btn.innerHTML = btn._originalHTML;
      delete btn._originalHTML;
    } else if (text) {
      btn.innerHTML = text;
    }
  }

  /**
   * Extrae todos los valores de un formulario en un objeto plano {name/id: value}.
   * Maneja correctamente checkboxes (boolean) y radio buttons (solo el seleccionado).
   * @param {string} formId - ID del formulario
   * @returns {Object} Datos del formulario
   */
  function getFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};

    const data = {};
    const elements = form.querySelectorAll('input, select, textarea');
    elements.forEach(function (el) {
      if (!el.name && !el.id) return;
      const key = el.name || el.id;
      if (el.type === 'checkbox') {
        data[key] = el.checked;
      } else if (el.type === 'radio') {
        if (el.checked) data[key] = el.value;
      } else {
        data[key] = el.value;
      }
    });
    return data;
  }

  /**
   * Resetea un formulario a su estado inicial y limpia todos los errores.
   * @param {string} formId - ID del formulario
   */
  function resetForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.reset();
    clearAllErrors(formId);
  }

  /**
   * Establece el valor de un campo por su ID. Útil para pre-rellenar formularios.
   * @param {string} fieldId - ID del campo
   * @param {string} value   - Valor a establecer
   */
  function setFieldValue(fieldId, value) {
    const el = document.getElementById(fieldId);
    if (el) el.value = value;
  }

  return {
    validateEmail,
    validateAmount,
    validatePhone,
    showFieldError,
    clearFieldError,
    clearAllErrors,
    validateRequired,
    handleSubmit,
    showLoadingState,
    hideLoadingState,
    getFormData,
    resetForm,
    setFieldValue
  };

})();

