/* ============================================================
   TradeFi - Calculator Module
   ============================================================ */

window.Calculator = (function () {

  function getExchangeRate(from, to) {
    if (!window.MockData) return 1;
    const rates = window.MockData.exchangeRates;
    const fromRate = rates[from] || 1;
    const toRate   = rates[to]   || 1;
    return toRate / fromRate;
  }

  function calculateFX(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    const rate = getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }

  function calculateFee(amount, method) {
    const rates = { ACH: 0.005, WIRE: 0.012 };
    const feeRate = rates[method] || 0;
    return amount * feeRate;
  }

  function calculateTotal(amount, method) {
    return amount + calculateFee(amount, method);
  }

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

  function formatNumber(amount, decimals) {
    decimals = decimals !== undefined ? decimals : 2;
    return Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function formatCompactCurrency(amount, currency) {
    if (amount >= 1_000_000) return `${currency} ${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000)     return `${currency} ${(amount / 1_000).toFixed(1)}K`;
    return formatCurrency(amount, currency);
  }

  function calculateMonthlyPayment(principal, termMonths, annualRate) {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / termMonths;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
           (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

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
