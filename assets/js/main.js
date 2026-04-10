/* ============================================================
   TradeFi - Main Application Module
   ============================================================ */

(function () {
  'use strict';

  /* ---- Session Check ---- */
  var isLoginPage = window.location.pathname.endsWith('login.html') ||
                    window.location.pathname.endsWith('index.html') ||
                    window.location.pathname === '/' ||
                    window.location.pathname === '';

  if (!isLoginPage) {
    var session = localStorage.getItem('tradefi_user');
    if (!session) {
      window.location.href = 'login.html';
      return;
    }
  }

  /* ---- DOM Ready ---- */
  document.addEventListener('DOMContentLoaded', function () {
    loadUser();
    initSidebar();
    initTopNav();
    UI.initDropdowns();
    dispatchPageInit();
    initCloseButtons();
  });

  /* ---- Load User ---- */
  function loadUser() {
    try {
      var raw  = localStorage.getItem('tradefi_user');
      var user = raw ? JSON.parse(raw) : MockData.currentUser;

      var nameEls     = document.querySelectorAll('[data-user-name]');
      var emailEls    = document.querySelectorAll('[data-user-email]');
      var initialsEls = document.querySelectorAll('[data-user-initials]');
      var companyEls  = document.querySelectorAll('[data-user-company]');

      nameEls.forEach(function (el) { el.textContent = user.name || ''; });
      emailEls.forEach(function (el) { el.textContent = user.email || ''; });
      companyEls.forEach(function (el) { el.textContent = user.company || ''; });

      var initials = user.initials || (user.name || '').split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
      initialsEls.forEach(function (el) { el.textContent = initials; });
    } catch (e) { /* silent */ }
  }

  /* ---- Sidebar ---- */
  var sidebarOpen = window.innerWidth > 767;

  function initSidebar() {
    highlightActiveLink();
    var hamburgersBtn = document.querySelectorAll('.hamburger-btn');
    hamburgersBtn.forEach(function (btn) {
      btn.addEventListener('click', toggleSidebar);
    });

    var overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', function () {
        if (window.innerWidth <= 767) closeMobileSidebar();
      });
    }
  }

  function toggleSidebar() {
    if (window.innerWidth <= 767) {
      var sidebar = document.getElementById('sidebar');
      var overlay = document.getElementById('sidebar-overlay');
      if (sidebar) {
        var isOpen = sidebar.classList.contains('mobile-open');
        if (isOpen) {
          closeMobileSidebar();
        } else {
          sidebar.classList.add('mobile-open');
          if (overlay) { overlay.classList.add('active'); overlay.style.display = 'block'; }
        }
      }
    } else {
      sidebarOpen = !sidebarOpen;
      var bodyEl = document.body;
      if (sidebarOpen) {
        bodyEl.classList.remove('sidebar-collapsed');
      } else {
        bodyEl.classList.add('sidebar-collapsed');
      }
    }
  }

  function closeMobileSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (overlay) { overlay.classList.remove('active'); overlay.style.display = 'none'; }
  }

  function highlightActiveLink() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var links = document.querySelectorAll('.sidebar-link');
    links.forEach(function (link) {
      link.classList.remove('active');
      var href = (link.getAttribute('href') || '').split('/').pop();
      if (href === path) link.classList.add('active');
    });
  }

  /* ---- Top Nav ---- */
  function initTopNav() {
    var userBtn  = document.getElementById('user-dropdown-btn');
    var userMenu = document.getElementById('user-dropdown-menu');

    if (userBtn && userMenu) {
      userBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        userMenu.classList.toggle('open');
      });

      document.addEventListener('click', function () {
        if (userMenu) userMenu.classList.remove('open');
      });
    }

    var logoutBtns = document.querySelectorAll('[data-logout]');
    logoutBtns.forEach(function (btn) {
      btn.addEventListener('click', logout);
    });
  }

  function logout() {
    localStorage.removeItem('tradefi_user');
    window.location.href = 'login.html';
  }

  /* ---- Modal close buttons ---- */
  function initCloseButtons() {
    document.querySelectorAll('[data-modal-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var modal = btn.closest('.modal-backdrop');
        if (modal) UI.closeModal(modal.id);
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) UI.closeModal(backdrop.id);
      });
    });
  }

  /* ---- Page Router ---- */
  function dispatchPageInit() {
    var page = window.location.pathname.split('/').pop();

    switch (page) {
      case 'dashboard.html': initDashboard(); break;
      case 'operations.html': initOperations(); break;
      case 'credits.html': initCredits(); break;
      case 'documents.html': initDocuments(); break;
      case 'reports.html': initReports(); break;
      case 'settings.html': initSettings(); break;
    }
  }

  /* ===========================================================
     DASHBOARD
     =========================================================== */
  function initDashboard() {
    loadDashboardMetrics();
    loadRecentTransactions();

    document.querySelectorAll('[data-quick-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-quick-action');
        switch (action) {
          case 'new-operation': window.location.href = 'operations.html'; break;
          case 'request-credit': window.location.href = 'credits.html'; break;
          case 'upload-document': window.location.href = 'documents.html'; break;
        }
      });
    });
  }

  function loadDashboardMetrics() {
    var m = MockData.metrics;
    setText('metric-total-ops', m.totalOperations);
    setText('metric-total-amount', m.totalAmount);
    setText('metric-pending-credits', m.pendingCredits);
    setText('metric-pending-docs', m.pendingDocuments);

    var greetingEl = document.getElementById('welcome-greeting');
    if (greetingEl) {
      var hour = new Date().getHours();
      var greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
      var raw  = localStorage.getItem('tradefi_user');
      var user = raw ? JSON.parse(raw) : MockData.currentUser;
      var firstName = (user.name || 'Usuario').split(' ')[0];
      greetingEl.textContent = greeting + ', ' + firstName;
    }
  }

  function loadRecentTransactions() {
    var tbody = document.getElementById('recent-transactions-body');
    if (!tbody) return;

    var recent = MockData.transactions.slice(0, 5);

    if (!recent.length) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state" style="padding:40px 24px;"><h3>Sin transacciones</h3><p>No hay transacciones recientes.</p></div></td></tr>';
      return;
    }

    tbody.innerHTML = recent.map(function (txn) {
      var amt = txn.amount < 0 ? '- ' + Calculator.formatCurrency(Math.abs(txn.amount), txn.currency) :
                                 '+ ' + Calculator.formatCurrency(txn.amount, txn.currency);
      var amtColor = txn.amount < 0 ? 'var(--error)' : 'var(--success)';
      return `<tr>
        <td style="color:var(--text-secondary);font-size:var(--font-size-xs);">${UI.formatDate(txn.date)}</td>
        <td><span class="td-reference">${txn.reference}</span></td>
        <td style="color:var(--text-secondary);">${txn.type}</td>
        <td style="font-weight:600;color:${amtColor};">${amt}</td>
        <td>${UI.renderStatusBadge(txn.status)}</td>
      </tr>`;
    }).join('');
  }

  /* ===========================================================
     OPERATIONS
     =========================================================== */
  var operationsData = [];
  var operationsFiltered = [];

  function initOperations() {
    operationsData = MockData.operations.slice();
    operationsFiltered = operationsData.slice();

    renderOperationsTable(operationsFiltered);

    var searchInput = document.getElementById('ops-search');
    var statusFilter = document.getElementById('ops-status-filter');

    if (searchInput) {
      searchInput.addEventListener('input', filterOperations);
    }
    if (statusFilter) {
      statusFilter.addEventListener('change', filterOperations);
    }

    var newOpBtn = document.querySelectorAll('[data-open-modal="new-operation-modal"]');
    newOpBtn.forEach(function (btn) {
      btn.addEventListener('click', function () {
        Forms.resetForm('new-operation-form');
        UI.openModal('new-operation-modal');
      });
    });

    var form = document.getElementById('new-operation-form');
    if (form) {
      var methodSelect = document.getElementById('op-method');
      var amountInput  = document.getElementById('op-amount');
      var currSelect   = document.getElementById('op-currency');
      var feeDisplay   = document.getElementById('op-fee-display');

      function updateFeeDisplay() {
        if (!feeDisplay) return;
        var amount = parseFloat((amountInput || {}).value) || 0;
        var method = (methodSelect || {}).value || 'WIRE';
        var currency = (currSelect || {}).value || 'USD';
        if (amount > 0) {
          var fee = Calculator.calculateFee(amount, method);
          feeDisplay.textContent = 'Comisión estimada: ' + Calculator.formatCurrency(fee, currency);
          feeDisplay.style.display = 'block';
        } else {
          feeDisplay.style.display = 'none';
        }
      }

      if (methodSelect) methodSelect.addEventListener('change', updateFeeDisplay);
      if (amountInput)  amountInput.addEventListener('input', updateFeeDisplay);
      if (currSelect)   currSelect.addEventListener('change', updateFeeDisplay);

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var required = [
          { id: 'op-origin-company',  message: 'Empresa de origen requerida' },
          { id: 'op-dest-country',    message: 'País de destino requerido' },
          { id: 'op-currency',        message: 'Selecciona una moneda' },
          { id: 'op-amount',          message: 'Ingresa un monto válido', type: 'amount' },
          { id: 'op-method',          message: 'Selecciona método de pago' },
          { id: 'op-recipient-name',  message: 'Nombre del destinatario requerido' },
          { id: 'op-recipient-acct',  message: 'Cuenta del destinatario requerida' }
        ];

        if (!Forms.validateRequired(required)) return;

        Forms.showLoadingState('submit-new-op', 'Enviando...');
        setTimeout(function () {
          var newOp = {
            id: 'op_' + Date.now(),
            reference: 'TF-2024-' + String(Date.now()).slice(-6),
            originCompany: document.getElementById('op-origin-company').value,
            destinationCountry: document.getElementById('op-dest-country').value,
            currency: document.getElementById('op-currency').value,
            amount: parseFloat(document.getElementById('op-amount').value),
            method: document.getElementById('op-method').value,
            status: 'pending',
            createdAt: new Date().toISOString(),
            recipient: document.getElementById('op-recipient-name').value,
            recipientAccount: document.getElementById('op-recipient-acct').value,
            description: (document.getElementById('op-description') || {}).value || ''
          };

          operationsData.unshift(newOp);
          operationsFiltered = operationsData.slice();
          renderOperationsTable(operationsFiltered);

          Forms.hideLoadingState('submit-new-op', 'Enviar Operación');
          UI.closeModal('new-operation-modal');
          Forms.resetForm('new-operation-form');
          UI.showToast('Operación creada exitosamente', 'success');
        }, 1200);
      });
    }
  }

  function filterOperations() {
    var search  = (document.getElementById('ops-search') || {}).value || '';
    var status  = (document.getElementById('ops-status-filter') || {}).value || '';

    operationsFiltered = operationsData.filter(function (op) {
      var matchSearch = !search ||
        op.reference.toLowerCase().includes(search.toLowerCase()) ||
        op.destinationCountry.toLowerCase().includes(search.toLowerCase()) ||
        (op.recipient || '').toLowerCase().includes(search.toLowerCase());
      var matchStatus = !status || op.status === status;
      return matchSearch && matchStatus;
    });

    renderOperationsTable(operationsFiltered);
  }

  function renderOperationsTable(data) {
    var tbody = document.getElementById('operations-tbody');
    if (!tbody) return;

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        </div><h3>Sin operaciones</h3><p>No hay operaciones que coincidan con los filtros.</p></div></td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(function (op) {
      return `<tr>
        <td><span class="td-reference">${escapeHtml(op.reference)}</span></td>
        <td>${escapeHtml(op.destinationCountry)}</td>
        <td><span style="font-weight:600;">${escapeHtml(op.currency)}</span></td>
        <td style="font-weight:600;">${escapeHtml(Calculator.formatCurrency(op.amount, op.currency))}</td>
        <td><span class="badge ${op.method === 'WIRE' ? 'badge-processing' : 'badge-approved'}" style="font-size:10px;">${escapeHtml(op.method)}</span></td>
        <td>${UI.renderStatusBadge(op.status)}</td>
        <td style="color:var(--text-secondary);font-size:var(--font-size-xs);">${escapeHtml(UI.formatDate(op.createdAt))}</td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn" title="Ver detalle" onclick="window._viewOperation('${escapeHtml(op.id)}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  window._viewOperation = function (id) {
    var op = MockData.operations.find(function (o) { return o.id === id; }) ||
             operationsData.find(function (o) { return o.id === id; });
    if (!op) return;

    var modal = document.getElementById('op-detail-modal');
    if (!modal) return;

    setText('op-detail-ref',         op.reference);
    setText('op-detail-origin',      op.originCompany);
    setText('op-detail-dest',        op.destinationCountry);
    setText('op-detail-currency',    op.currency);
    setText('op-detail-amount',      Calculator.formatCurrency(op.amount, op.currency));
    setText('op-detail-method',      op.method);
    setText('op-detail-recipient',   op.recipient);
    setText('op-detail-acct',        op.recipientAccount || '—');
    setText('op-detail-description', op.description || '—');
    setText('op-detail-date',        UI.formatDate(op.createdAt));

    var statusEl = document.getElementById('op-detail-status');
    if (statusEl) statusEl.innerHTML = UI.renderStatusBadge(op.status);

    var feeEl = document.getElementById('op-detail-fee');
    if (feeEl) {
      var fee = Calculator.calculateFee(op.amount, op.method);
      feeEl.textContent = Calculator.formatCurrency(fee, op.currency);
    }

    UI.openModal('op-detail-modal');
  };

  /* ===========================================================
     CREDITS
     =========================================================== */
  var creditsData = [];

  function initCredits() {
    creditsData = MockData.credits.slice();
    renderCreditsTable(creditsData);

    var searchInput  = document.getElementById('cr-search');
    var statusFilter = document.getElementById('cr-status-filter');

    if (searchInput)  searchInput.addEventListener('input', filterCredits);
    if (statusFilter) statusFilter.addEventListener('change', filterCredits);

    var newCrBtns = document.querySelectorAll('[data-open-modal="new-credit-modal"]');
    newCrBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        Forms.resetForm('new-credit-form');
        UI.openModal('new-credit-modal');
        updateCreditCalc();
      });
    });

    var amountInput = document.getElementById('cr-amount');
    var termSelect  = document.getElementById('cr-term');
    var currSelect  = document.getElementById('cr-currency');

    function updateCreditCalc() {
      var amount   = parseFloat((amountInput || {}).value) || 0;
      var term     = parseInt((termSelect || {}).value)    || 12;
      var currency = (currSelect || {}).value              || 'USD';
      var rate     = 8.5;

      var monthlyPayment = amount > 0 ? Calculator.calculateMonthlyPayment(amount, term, rate) : 0;
      var totalInterest  = amount > 0 ? Calculator.calculateTotalInterest(amount, term, rate)  : 0;

      setText('cr-calc-monthly',  amount > 0 ? Calculator.formatCurrency(monthlyPayment, currency) : '—');
      setText('cr-calc-interest', amount > 0 ? Calculator.formatCurrency(totalInterest, currency)  : '—');
      setText('cr-calc-total',    amount > 0 ? Calculator.formatCurrency(amount + totalInterest, currency) : '—');
    }

    if (amountInput) amountInput.addEventListener('input', updateCreditCalc);
    if (termSelect)  termSelect.addEventListener('change', updateCreditCalc);
    if (currSelect)  currSelect.addEventListener('change', updateCreditCalc);

    var form = document.getElementById('new-credit-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var required = [
          { id: 'cr-amount',   message: 'Ingresa un monto válido', type: 'amount' },
          { id: 'cr-currency', message: 'Selecciona una moneda' },
          { id: 'cr-term',     message: 'Selecciona un plazo' },
          { id: 'cr-purpose',  message: 'Describe el propósito del crédito' }
        ];
        if (!Forms.validateRequired(required)) return;

        Forms.showLoadingState('submit-new-cr', 'Enviando...');
        setTimeout(function () {
          var newCr = {
            id: 'cr_' + Date.now(),
            reference: 'CRD-2024-' + String(Date.now()).slice(-4),
            amount: parseFloat(document.getElementById('cr-amount').value),
            currency: document.getElementById('cr-currency').value,
            loanTerm: parseInt(document.getElementById('cr-term').value),
            purpose: document.getElementById('cr-purpose').value,
            interestRate: 8.5,
            status: 'pending',
            nextPaymentDate: null,
            remainingBalance: parseFloat(document.getElementById('cr-amount').value),
            payments: []
          };

          creditsData.unshift(newCr);
          renderCreditsTable(creditsData);

          Forms.hideLoadingState('submit-new-cr', 'Solicitar Crédito');
          UI.closeModal('new-credit-modal');
          Forms.resetForm('new-credit-form');
          UI.showToast('Solicitud de crédito enviada exitosamente', 'success');
        }, 1400);
      });
    }

    var fileArea = document.getElementById('cr-file-area');
    initFileUpload(fileArea, 'cr-file-preview');
  }

  function filterCredits() {
    var search = (document.getElementById('cr-search') || {}).value || '';
    var status = (document.getElementById('cr-status-filter') || {}).value || '';
    var filtered = creditsData.filter(function (cr) {
      var matchSearch = !search || cr.reference.toLowerCase().includes(search.toLowerCase()) || (cr.purpose || '').toLowerCase().includes(search.toLowerCase());
      var matchStatus = !status || cr.status === status;
      return matchSearch && matchStatus;
    });
    renderCreditsTable(filtered);
  }

  function renderCreditsTable(data) {
    var tbody = document.getElementById('credits-tbody');
    if (!tbody) return;

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        </div><h3>Sin créditos</h3><p>No hay créditos que coincidan con los filtros.</p></div></td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(function (cr) {
      var nextPmt = cr.nextPaymentDate ? UI.formatDate(cr.nextPaymentDate) : '—';
      return `<tr>
        <td><span class="td-reference">${escapeHtml(cr.reference)}</span></td>
        <td style="font-weight:600;">${escapeHtml(Calculator.formatCurrency(cr.amount, cr.currency))}</td>
        <td style="color:var(--text-secondary);">${escapeHtml(String(cr.loanTerm))} meses</td>
        <td style="color:var(--text-secondary);">${escapeHtml(String(cr.interestRate))}%</td>
        <td style="color:var(--text-secondary);font-size:var(--font-size-xs);">${escapeHtml(nextPmt)}</td>
        <td>${UI.renderStatusBadge(cr.status)}</td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn" title="Ver detalle" onclick="window._viewCredit('${escapeHtml(cr.id)}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  window._viewCredit = function (id) {
    var cr = creditsData.find(function (c) { return c.id === id; });
    if (!cr) return;

    setText('cr-detail-ref',      cr.reference);
    setText('cr-detail-amount',   Calculator.formatCurrency(cr.amount, cr.currency));
    setText('cr-detail-currency', cr.currency);
    setText('cr-detail-term',     cr.loanTerm + ' meses');
    setText('cr-detail-rate',     cr.interestRate + '% anual');
    setText('cr-detail-purpose',  cr.purpose || '—');
    setText('cr-detail-balance',  Calculator.formatCurrency(cr.remainingBalance || 0, cr.currency));
    setText('cr-detail-next-pmt', cr.nextPaymentDate ? UI.formatDate(cr.nextPaymentDate) : '—');

    var statusEl = document.getElementById('cr-detail-status');
    if (statusEl) statusEl.innerHTML = UI.renderStatusBadge(cr.status);

    var monthly = Calculator.calculateMonthlyPayment(cr.amount, cr.loanTerm, cr.interestRate);
    setText('cr-detail-monthly', Calculator.formatCurrency(monthly, cr.currency));

    renderAmortizationTable(cr);
    UI.openModal('cr-detail-modal');
  };

  function renderAmortizationTable(cr) {
    var tbody = document.getElementById('amort-tbody');
    if (!tbody) return;

    var schedule = Calculator.generateAmortizationSchedule(cr.amount, cr.loanTerm, cr.interestRate);
    tbody.innerHTML = schedule.map(function (row) {
      return `<tr>
        <td style="font-weight:600;color:var(--primary);">${escapeHtml(String(row.month))}</td>
        <td style="color:var(--text-secondary);font-size:11px;">${escapeHtml(row.date)}</td>
        <td style="font-weight:600;">${escapeHtml(Calculator.formatCurrency(row.payment, cr.currency))}</td>
        <td>${escapeHtml(Calculator.formatCurrency(row.principal, cr.currency))}</td>
        <td style="color:var(--accent);">${escapeHtml(Calculator.formatCurrency(row.interest, cr.currency))}</td>
        <td style="color:var(--text-secondary);">${escapeHtml(Calculator.formatCurrency(row.balance, cr.currency))}</td>
      </tr>`;
    }).join('');
  }

  /* ===========================================================
     DOCUMENTS
     =========================================================== */
  var documentsData = [];

  function initDocuments() {
    documentsData = MockData.documents.slice();
    renderDocumentsTable(documentsData);

    var searchInput  = document.getElementById('doc-search');
    var statusFilter = document.getElementById('doc-status-filter');
    var typeFilter   = document.getElementById('doc-type-filter');

    if (searchInput)  searchInput.addEventListener('input', filterDocuments);
    if (statusFilter) statusFilter.addEventListener('change', filterDocuments);
    if (typeFilter)   typeFilter.addEventListener('change', filterDocuments);

    var uploadBtns = document.querySelectorAll('[data-open-modal="upload-doc-modal"]');
    uploadBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        Forms.resetForm('upload-doc-form');
        UI.openModal('upload-doc-modal');
      });
    });

    var fileArea = document.getElementById('doc-file-area');
    initFileUpload(fileArea, 'doc-file-preview');

    var form = document.getElementById('upload-doc-form');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var required = [
          { id: 'doc-type', message: 'Selecciona el tipo de documento' }
        ];
        if (!Forms.validateRequired(required)) return;

        var filePreview = document.getElementById('doc-file-preview');
        if (!filePreview || !filePreview.dataset.filename) {
          UI.showToast('Por favor selecciona un archivo', 'warning');
          return;
        }

        Forms.showLoadingState('submit-upload-doc', 'Subiendo...');
        setTimeout(function () {
          var newDoc = {
            id: 'doc_' + Date.now(),
            name: filePreview.dataset.filename,
            type: document.getElementById('doc-type').value,
            status: 'pending',
            uploadDate: new Date().toISOString().split('T')[0],
            size: filePreview.dataset.filesize || 'N/A',
            uploader: 'Alejandro Martínez'
          };

          documentsData.unshift(newDoc);
          renderDocumentsTable(documentsData);

          Forms.hideLoadingState('submit-upload-doc', 'Subir Documento');
          UI.closeModal('upload-doc-modal');
          Forms.resetForm('upload-doc-form');
          UI.showToast('Documento subido exitosamente', 'success');
        }, 1300);
      });
    }
  }

  function filterDocuments() {
    var search = (document.getElementById('doc-search') || {}).value || '';
    var status = (document.getElementById('doc-status-filter') || {}).value || '';
    var type   = (document.getElementById('doc-type-filter') || {}).value || '';

    var filtered = documentsData.filter(function (doc) {
      var matchSearch = !search || doc.name.toLowerCase().includes(search.toLowerCase());
      var matchStatus = !status || doc.status === status;
      var matchType   = !type   || doc.type === type;
      return matchSearch && matchStatus && matchType;
    });

    renderDocumentsTable(filtered);
  }

  function renderDocumentsTable(data) {
    var tbody = document.getElementById('docs-tbody');
    if (!tbody) return;

    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div><h3>Sin documentos</h3><p>No hay documentos que coincidan con los filtros.</p></div></td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(function (doc) {
      var ext = doc.name.split('.').pop().toLowerCase();
      var iconClass = ext === 'pdf' ? 'pdf' : ['jpg','jpeg','png'].includes(ext) ? 'img' : ext === 'xlsx' || ext === 'xls' ? 'xls' : ext === 'doc' || ext === 'docx' ? 'doc' : 'other';
      var iconLabel = ext.toUpperCase().substring(0, 3);

      return `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="doc-icon ${iconClass}">${escapeHtml(iconLabel)}</div>
            <span style="font-size:var(--font-size-sm);font-weight:500;">${escapeHtml(doc.name)}</span>
          </div>
        </td>
        <td style="color:var(--text-secondary);">${escapeHtml(doc.type)}</td>
        <td>${UI.renderStatusBadge(doc.status)}</td>
        <td style="color:var(--text-secondary);font-size:var(--font-size-xs);">${escapeHtml(UI.formatDate(doc.uploadDate))}</td>
        <td style="color:var(--text-secondary);font-size:var(--font-size-xs);">${escapeHtml(doc.size)}</td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn" title="Descargar" onclick="window.UI.showToast('Descarga iniciada', 'info')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
            <button class="table-action-btn danger" title="Eliminar" onclick="window._deleteDocument('${escapeHtml(doc.id)}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join('');
  }

  window._deleteDocument = function (id) {
    UI.confirm('¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.', function () {
      documentsData = documentsData.filter(function (d) { return d.id !== id; });
      renderDocumentsTable(documentsData);
      UI.showToast('Documento eliminado correctamente', 'success');
    }, { title: 'Eliminar documento', danger: true, confirmText: 'Eliminar', cancelText: 'Cancelar' });
  };

  /* ===========================================================
     REPORTS
     =========================================================== */
  var reportsPage = 1;
  var reportsData = [];
  var reportsFiltered = [];
  var reportsPerPage = 8;

  function initReports() {
    reportsData     = MockData.transactions.slice();
    reportsFiltered = reportsData.slice();

    renderReportsSummary(reportsData);
    renderReportsTable();

    var fromDate   = document.getElementById('rp-from-date');
    var toDate     = document.getElementById('rp-to-date');
    var statusFilt = document.getElementById('rp-status-filter');
    var searchInp  = document.getElementById('rp-search');

    [fromDate, toDate, statusFilt, searchInp].forEach(function (el) {
      if (el) el.addEventListener('change', filterReports);
      if (el && el.tagName === 'INPUT') el.addEventListener('input', filterReports);
    });

    document.querySelectorAll('[data-export]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        UI.showToast('Función disponible próximamente', 'info');
      });
    });
  }

  function filterReports() {
    var search = (document.getElementById('rp-search') || {}).value || '';
    var status = (document.getElementById('rp-status-filter') || {}).value || '';
    var from   = (document.getElementById('rp-from-date') || {}).value || '';
    var to     = (document.getElementById('rp-to-date') || {}).value || '';

    reportsFiltered = reportsData.filter(function (txn) {
      var matchSearch = !search || txn.reference.toLowerCase().includes(search.toLowerCase()) || txn.description.toLowerCase().includes(search.toLowerCase());
      var matchStatus = !status || txn.status === status;
      var matchFrom   = !from   || txn.date >= from;
      var matchTo     = !to     || txn.date <= to;
      return matchSearch && matchStatus && matchFrom && matchTo;
    });

    reportsPage = 1;
    renderReportsSummary(reportsFiltered);
    renderReportsTable();
  }

  function renderReportsSummary(data) {
    var totalVol  = data.reduce(function (acc, t) { return acc + Math.abs(t.amount); }, 0);
    var completed = data.filter(function (t) { return t.status === 'completed'; }).length;
    var rate      = data.length ? Math.round((completed / data.length) * 100) : 0;
    var avg       = data.length ? totalVol / data.length : 0;

    setText('rp-total-volume',  Calculator.formatCurrency(totalVol, 'USD'));
    setText('rp-total-count',   data.length + ' transacciones');
    setText('rp-success-rate',  rate + '%');
    setText('rp-avg-amount',    Calculator.formatCurrency(avg, 'USD'));
  }

  function renderReportsTable() {
    var tbody = document.getElementById('reports-tbody');
    if (!tbody) return;

    var start = (reportsPage - 1) * reportsPerPage;
    var slice = reportsFiltered.slice(start, start + reportsPerPage);

    if (!slice.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div><h3>Sin transacciones</h3><p>No se encontraron transacciones con los filtros seleccionados.</p></div></td></tr>`;
    } else {
      tbody.innerHTML = slice.map(function (txn) {
        var amt = Calculator.formatCurrency(Math.abs(txn.amount), txn.currency);
        var sign = txn.amount < 0 ? '-' : '+';
        return `<tr>
          <td style="color:var(--text-secondary);font-size:var(--font-size-xs);">${escapeHtml(UI.formatDate(txn.date))}</td>
          <td><span class="td-reference">${escapeHtml(txn.reference)}</span></td>
          <td style="color:var(--text-secondary);">${escapeHtml(txn.type)}</td>
          <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary);">${escapeHtml(txn.description)}</td>
          <td style="font-weight:600;color:${txn.amount < 0 ? 'var(--error)' : 'var(--success)'};">${escapeHtml(sign + amt)}</td>
          <td>${UI.renderStatusBadge(txn.status)}</td>
        </tr>`;
      }).join('');
    }

    UI.renderPagination('reports-pagination', reportsFiltered.length, reportsPage, reportsPerPage, function (p) {
      reportsPage = p;
      renderReportsTable();
    }.toString());
  }

  /* ===========================================================
     SETTINGS
     =========================================================== */
  function initSettings() {
    var raw  = localStorage.getItem('tradefi_user');
    var user = raw ? JSON.parse(raw) : MockData.currentUser;

    Forms.setFieldValue('set-name',    user.name    || '');
    Forms.setFieldValue('set-email',   user.email   || '');
    Forms.setFieldValue('set-phone',   user.phone   || '');
    Forms.setFieldValue('set-company', user.company || '');
    Forms.setFieldValue('set-address', user.address || '');
    Forms.setFieldValue('set-tax-id',  user.taxId   || '');

    var apiKeyEl = document.getElementById('api-key-value');
    if (apiKeyEl) {
      apiKeyEl.textContent = (user.apiKey || 'tf_live_sk_••••••••••••••••').replace(/(?<=.{12}).+(?=.{4})/, '••••••••••');
    }

    var profileForm = document.getElementById('settings-profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var required = [
          { id: 'set-name',  message: 'El nombre es requerido' },
          { id: 'set-email', message: 'El correo es requerido', type: 'email' },
          { id: 'set-phone', message: 'El teléfono es requerido' }
        ];
        if (!Forms.validateRequired(required)) return;

        Forms.showLoadingState('save-profile-btn', 'Guardando...');
        setTimeout(function () {
          user.name  = document.getElementById('set-name').value;
          user.email = document.getElementById('set-email').value;
          user.phone = document.getElementById('set-phone').value;
          localStorage.setItem('tradefi_user', JSON.stringify(user));
          loadUser();
          Forms.hideLoadingState('save-profile-btn', 'Guardar Cambios');
          UI.showToast('Perfil actualizado correctamente', 'success');
        }, 800);
      });
    }

    var companyForm = document.getElementById('settings-company-form');
    if (companyForm) {
      companyForm.addEventListener('submit', function (e) {
        e.preventDefault();
        Forms.showLoadingState('save-company-btn', 'Guardando...');
        setTimeout(function () {
          user.company = document.getElementById('set-company').value;
          user.address = document.getElementById('set-address').value;
          user.taxId   = document.getElementById('set-tax-id').value;
          localStorage.setItem('tradefi_user', JSON.stringify(user));
          Forms.hideLoadingState('save-company-btn', 'Guardar Cambios');
          UI.showToast('Datos de empresa actualizados', 'success');
        }, 800);
      });
    }

    var passwordForm = document.getElementById('settings-password-form');
    if (passwordForm) {
      passwordForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var newPwd    = (document.getElementById('set-new-password') || {}).value || '';
        var confirmPwd = (document.getElementById('set-confirm-password') || {}).value || '';

        Forms.clearAllErrors('settings-password-form');

        if (newPwd.length < 6) {
          Forms.showFieldError('set-new-password', 'La contraseña debe tener al menos 6 caracteres');
          return;
        }

        if (newPwd !== confirmPwd) {
          Forms.showFieldError('set-confirm-password', 'Las contraseñas no coinciden');
          return;
        }

        Forms.showLoadingState('save-password-btn', 'Actualizando...');
        setTimeout(function () {
          Forms.hideLoadingState('save-password-btn', 'Actualizar Contraseña');
          Forms.resetForm('settings-password-form');
          UI.showToast('Contraseña actualizada correctamente', 'success');
        }, 900);
      });
    }

    var regenBtn = document.getElementById('regen-api-key-btn');
    if (regenBtn) {
      regenBtn.addEventListener('click', function () {
        UI.confirm('¿Generar una nueva API key? La clave actual dejará de funcionar inmediatamente.', function () {
          var array = new Uint8Array(20);
          window.crypto.getRandomValues(array);
          var hex = Array.from(array).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
          var newKey = 'tf_live_sk_' + hex;
          user.apiKey = newKey;
          localStorage.setItem('tradefi_user', JSON.stringify(user));
          if (apiKeyEl) apiKeyEl.textContent = newKey.replace(/(?<=.{12}).+(?=.{4})/, '••••••••••');
          UI.showToast('Nueva API key generada', 'success');
        }, { title: 'Regenerar API Key', confirmText: 'Regenerar', cancelText: 'Cancelar' });
      });
    }
  }

  /* ===========================================================
     HELPERS
     =========================================================== */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function initFileUpload(area, previewId) {
    if (!area) return;

    var fileInput = area.querySelector('input[type="file"]');
    if (!fileInput) return;

    area.addEventListener('dragover', function (e) {
      e.preventDefault();
      area.classList.add('drag-over');
    });

    area.addEventListener('dragleave', function () {
      area.classList.remove('drag-over');
    });

    area.addEventListener('drop', function (e) {
      e.preventDefault();
      area.classList.remove('drag-over');
      var files = e.dataTransfer.files;
      if (files.length > 0) handleFileSelect(files[0], previewId);
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files.length > 0) handleFileSelect(fileInput.files[0], previewId);
    });
  }

  function handleFileSelect(file, previewId) {
    var preview = document.getElementById(previewId);
    if (!preview) return;

    var size = file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB';
    preview.dataset.filename = file.name;
    preview.dataset.filesize = size;

    var safeName = escapeHtml(file.name);
    var safeSize = escapeHtml(size);
    var safeId   = escapeHtml(previewId);

    preview.innerHTML = `
      <div class="uploaded-file">
        <div class="uploaded-file-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="uploaded-file-info">
          <div class="uploaded-file-name">${safeName}</div>
          <div class="uploaded-file-size">${safeSize}</div>
        </div>
        <button type="button" class="table-action-btn danger" onclick="document.getElementById('${safeId}').innerHTML='';document.getElementById('${safeId}').removeAttribute('data-filename');">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;
    preview.style.display = 'block';
  }

  /* Expose logout globally */
  window.logout = logout;

})();
