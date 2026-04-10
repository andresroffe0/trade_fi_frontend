/* ============================================================
   TradeFi - Forms Module
   ============================================================ */

window.Forms = (function () {

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  function validateAmount(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  }

  function validatePhone(phone) {
    return /^[+]?[\d\s\-().]{7,20}$/.test(phone.trim());
  }

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

  function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    field.classList.remove('is-invalid');

    const errorEl = field.parentElement.querySelector('.form-error[data-field="' + fieldId + '"]');
    if (errorEl) errorEl.innerHTML = '';
  }

  function clearAllErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.form-error').forEach(el => { el.innerHTML = ''; });
  }

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

  function handleSubmit(formId, callback) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      callback(e);
    });
  }

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

  function resetForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.reset();
    clearAllErrors(formId);
  }

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
