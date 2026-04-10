/* ============================================================
   TradeFi - Calculator Module
   ============================================================
   Propósito: Centraliza toda la lógica matemática financiera.
   No toca el DOM; recibe números y devuelve números o strings.
   Esto facilita pruebas unitarias y reutilización.

   Dependencia: window.MockData (para tasas de cambio)
   Ver docs/ARCHITECTURE.md §4.2 para fórmulas y detalles.
   ============================================================ */

window.Calculator = (function () {

  /**
   * Obtiene la tasa de conversión entre dos monedas usando USD como pivote.
   * Ejemplo: getExchangeRate('EUR', 'MXN') → cuántos MXN vale 1 EUR.
   * @param {string} from - Código ISO de la moneda origen (ej. 'USD')
   * @param {string} to   - Código ISO de la moneda destino (ej. 'EUR')
   * @returns {number} Tasa de conversión
   */
  function getExchangeRate(from, to) {
    if (!window.MockData) return 1;
    const rates = window.MockData.exchangeRates;
    const fromRate = rates[from] || 1;
    const toRate   = rates[to]   || 1;
    return toRate / fromRate;
  }

  /**
   * Convierte un monto de una moneda a otra.
   * Si ambas monedas son iguales, devuelve el monto sin cambios.
   * @param {number} amount       - Monto a convertir
   * @param {string} fromCurrency - Moneda origen
   * @param {string} toCurrency   - Moneda destino
   * @returns {number} Monto convertido
   */
  function calculateFX(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    const rate = getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  /**
   * Calcula la comisión por método de pago.
   * Comisiones actuales: WIRE = 1.2%, ACH = 0.5%
   * @param {number} amount - Monto base
   * @param {string} method - 'WIRE' o 'ACH'
   * @returns {number} Monto de la comisión
   */
  function calculateFee(amount, method) {
    const rates = { ACH: 0.005, WIRE: 0.012 };
    const feeRate = rates[method] || 0;
    return amount * feeRate;
  }

  /**
   * Calcula el monto total incluyendo comisión.
   * @param {number} amount - Monto base
   * @param {string} method - 'WIRE' o 'ACH'
   * @returns {number} Monto + comisión
   */
  function calculateTotal(amount, method) {
    return amount + calculateFee(amount, method);
  }

  /**
   * Genera la tabla de amortización completa para un crédito.
   * Usa la fórmula de amortización francesa (cuota fija).
   * Fórmula: cuota = P × [r(1+r)^n] / [(1+r)^n - 1]
   *   donde r = tasa mensual, n = número de cuotas.
   * Si la tasa es 0, divide el capital en cuotas iguales sin interés.
   * @param {number} principal   - Capital inicial
   * @param {number} termMonths  - Plazo en meses
   * @param {number} annualRate  - Tasa anual en porcentaje (ej. 8.5 para 8.5%)
   * @returns {Array<{month, date, payment, principal, interest, balance}>}
   */
  function generateAmortizationSchedule(principal, termMonths, annualRate) {
    const monthlyRate = annualRate / 100 / 12;
    let schedule = [];

    if (monthlyRate === 0) {
      const payment = principal / termMonths;
      for (let i = 1; i <= termMonths; i++) {
        schedule.push({ month: i, payment, principal: payment, interest: 0, balance: principal - payment * i });
      }
      return schedule;
    }

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
                           (Math.pow(1 + monthlyRate, termMonths) - 1);

    let balance = principal;
    const startDate = new Date();

    for (let i = 1; i <= termMonths; i++) {
      const interest  = balance * monthlyRate;
      const principalPaid = monthlyPayment - interest;
      balance -= principalPaid;

      const paymentDate = new Date(startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);

      schedule.push({
        month:     i,
        date:      paymentDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }),
        payment:   monthlyPayment,
        principal: principalPaid,
        interest:  interest,
        balance:   Math.max(balance, 0)
      });
    }

    return schedule;
  }

  /**
   * Formatea un número como moneda usando Intl.NumberFormat.
   * Fallback manual si la moneda no es soportada por el navegador.
   * @param {number} amount   - Monto a formatear
   * @param {string} currency - Código ISO de moneda (ej. 'USD', 'EUR')
   * @param {string} [locale] - Locale para el formato (default: 'en-US')
   * @returns {string} Monto formateado (ej. '$1,234.56')
   */
  function formatCurrency(amount, currency, locale) {
    locale = locale || 'en-US';
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (e) {
      return `${currency || 'USD'} ${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }
  }

  /**
   * Formatea un número con separadores de miles.
   * @param {number} amount    - Número a formatear
   * @param {number} [decimals=2] - Decimales a mostrar
   * @returns {string} Número formateado (ej. '1,234.56')
   */
  function formatNumber(amount, decimals) {
    decimals = decimals !== undefined ? decimals : 2;
    return Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /**
   * Formatea un monto abreviándolo si es grande (1M, 450K).
   * Útil para dashboards donde el espacio es limitado.
   * @param {number} amount   - Monto a formatear
   * @param {string} currency - Código ISO de moneda
   * @returns {string} Monto compacto (ej. 'USD 2.8M', 'EUR 450.0K')
   */
  function formatCompactCurrency(amount, currency) {
    if (amount >= 1_000_000) return `${currency} ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000)     return `${currency} ${(amount / 1_000).toFixed(1)}K`;
    return formatCurrency(amount, currency);
  }

  /**
   * Calcula la cuota mensual fija de un crédito (amortización francesa).
   * @param {number} principal  - Capital inicial
   * @param {number} termMonths - Plazo en meses
   * @param {number} annualRate - Tasa anual en porcentaje
   * @returns {number} Cuota mensual
   */
  function calculateMonthlyPayment(principal, termMonths, annualRate) {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / termMonths;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
           (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  /**
   * Calcula el total de intereses pagados durante toda la vida del crédito.
   * @param {number} principal  - Capital inicial
   * @param {number} termMonths - Plazo en meses
   * @param {number} annualRate - Tasa anual en porcentaje
   * @returns {number} Total de intereses
   */
  function calculateTotalInterest(principal, termMonths, annualRate) {
    const monthlyPayment = calculateMonthlyPayment(principal, termMonths, annualRate);
    return (monthlyPayment * termMonths) - principal;
  }

  return {
    getExchangeRate,
    calculateFX,
    calculateFee,
    calculateTotal,
    generateAmortizationSchedule,
    formatCurrency,
    formatNumber,
    formatCompactCurrency,
    calculateMonthlyPayment,
    calculateTotalInterest
  };

})();

