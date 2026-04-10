/* ============================================================
   TradeFi - Mock Data Module
   ============================================================
   Propósito: Única fuente de verdad de todos los datos de la app.
   Cuando se integre un back-end real, SOLO este archivo debe cambiar.

   Patrón: IIFE que expone un objeto público. Las constantes internas
   son privadas (no accesibles desde la consola del navegador).

   Ver docs/ARCHITECTURE.md §4.1 para detalles de estructura de datos.
   ============================================================ */

window.MockData = (function () {

  const currentUser = {
    id: 'usr_001',
    name: 'Alejandro Martínez',
    email: 'demo@example.com',
    company: 'Grupo Comercial Martínez S.A.',
    phone: '+52 55 1234 5678',
    address: 'Av. Paseo de la Reforma 250, Col. Juárez, CDMX 06600',
    taxId: 'GCM201005HX2',
    role: 'Admin',
    apiKey: 'tf_live_sk_8f2a1c9b4e7d3f0a6c2e8b5d',
    initials: 'AM',
    joinDate: '2023-03-15'
  };

  const operations = [
    {
      id: 'op_001', reference: 'TF-2024-001247', originCompany: 'Grupo Comercial Martínez S.A.',
      destinationCountry: 'China', currency: 'USD', amount: 285000, method: 'WIRE',
      status: 'completed', createdAt: '2024-11-15T09:32:00Z',
      recipient: 'Shenzhen Electronics Co. Ltd.', recipientAccount: 'CN890285716493827364',
      description: 'Importación de componentes electrónicos Q4 2024'
    },
    {
      id: 'op_002', reference: 'TF-2024-001248', originCompany: 'Grupo Comercial Martínez S.A.',
      destinationCountry: 'Germany', currency: 'EUR', amount: 124500, method: 'WIRE',
      status: 'approved', createdAt: '2024-11-18T14:15:00Z',
      recipient: 'Munich Machinery GmbH', recipientAccount: 'DE89370400440532013000',
      description: 'Compra de maquinaria industrial CNC'
    },
    {
      id: 'op_003', reference: 'TF-2024-001249', originCompany: 'Grupo Comercial Martínez S.A.',
      destinationCountry: 'United States', currency: 'USD', amount: 56750, method: 'ACH',
      status: 'pending', createdAt: '2024-11-20T10:00:00Z',
      recipient: 'Texas Trade Partners LLC', recipientAccount: 'US1234567890123456',
      description: 'Servicios de consultoría logística'
    },
    {
      id: 'op_004', reference: 'TF-2024-001250', originCompany: 'Grupo Comercial Martínez S.A.',
      destinationCountry: 'Japan', currency: 'JPY', amount: 18500000, method: 'WIRE',
      status: 'completed', createdAt: '2024-11-12T07:45:00Z',
      recipient: 'Osaka Components Corp.', recipientAccount: 'JP1234567890123456789',
      description: 'Piezas de precisión para ensamblaje'
    },
    {
      id: 'op_005', reference: 'TF-2024-001251', originCompany: 'Grupo Comercial Martínez S.A.',
      destinationCountry: 'United Kingdom', currency: 'GBP', amount: 89200, method: 'WIRE',
      status: 'rejected', createdAt: '2024-11-10T11:20:00Z',
      recipient: 'London Trading House Ltd.', recipientAccount: 'GB29NWBK60161331926819',
      description: 'Adquisición de licencias de software ERP'
    },
    {
      id: 'op_006', reference: 'TF-2024-001252', originCompany: 'Grupo Comercial Martínez S.A.',
      destinationCountry: 'Canada', currency: 'CAD', amount: 43800, method: 'ACH',
      status: 'pending', createdAt: '2024-11-21T15:30:00Z',
      recipient: 'Toronto Supplies Inc.', recipientAccount: 'CA123456789012345678',
      description: 'Suministros de oficina y papelería'
    },
    {
      id: 'op_007', reference: 'TF-2024-001253', originCompany: 'Grupo Comercial Martínez S.A.',
      destinationCountry: 'Spain', currency: 'EUR', amount: 67300, method: 'WIRE',
      status: 'approved', createdAt: '2024-11-19T08:00:00Z',
      recipient: 'Barcelona Textiles S.L.', recipientAccount: 'ES9121000418450200051332',
      description: 'Importación de telas y textiles premium'
    },
    {
      id: 'op_008', reference: 'TF-2024-001254', originCompany: 'Grupo Comercial Martínez S.A.',
      destinationCountry: 'Brazil', currency: 'USD', amount: 32100, method: 'WIRE',
      status: 'completed', createdAt: '2024-11-08T13:00:00Z',
      recipient: 'São Paulo Imports Ltda.', recipientAccount: 'BR1500000000000010932840814P2',
      description: 'Exportación de productos manufacturados'
    },
    {
      id: 'op_009', reference: 'TF-2024-001255', originCompany: 'Grupo Comercial Martínez S.A.',
      destinationCountry: 'France', currency: 'EUR', amount: 155000, method: 'WIRE',
      status: 'pending', createdAt: '2024-11-22T09:45:00Z',
      recipient: 'Paris Luxury Goods S.A.S.', recipientAccount: 'FR7630006000011234567890189',
      description: 'Artículos de lujo para temporada navideña'
    },
    {
      id: 'op_010', reference: 'TF-2024-001256', originCompany: 'Grupo Comercial Martínez S.A.',
      destinationCountry: 'South Korea', currency: 'USD', amount: 198500, method: 'WIRE',
      status: 'approved', createdAt: '2024-11-17T16:00:00Z',
      recipient: 'Seoul Tech Industries', recipientAccount: 'KR1002701234567890',
      description: 'Semiconductores y chips electrónicos'
    },
    {
      id: 'op_011', reference: 'TF-2024-001257', originCompany: 'Grupo Comercial Martínez S.A.',
      destinationCountry: 'India', currency: 'USD', amount: 47200, method: 'ACH',
      status: 'completed', createdAt: '2024-11-05T10:30:00Z',
      recipient: 'Mumbai Software Solutions Pvt. Ltd.', recipientAccount: 'IN00000000001234567890',
      description: 'Desarrollo de software personalizado'
    },
    {
      id: 'op_012', reference: 'TF-2024-001258', originCompany: 'Grupo Comercial Martínez S.A.',
      destinationCountry: 'Netherlands', currency: 'EUR', amount: 88700, method: 'WIRE',
      status: 'pending', createdAt: '2024-11-23T11:00:00Z',
      recipient: 'Amsterdam Logistics B.V.', recipientAccount: 'NL91ABNA0417164300',
      description: 'Servicios de almacenamiento y distribución EU'
    }
  ];

  const credits = [
    {
      id: 'cr_001', reference: 'CRD-2024-0081', amount: 500000, currency: 'USD',
      loanTerm: 24, purpose: 'Expansión de capacidad productiva en planta Monterrey. Adquisición de línea de ensamblaje automatizada.',
      interestRate: 8.5, status: 'active',
      startDate: '2024-01-15', nextPaymentDate: '2024-12-15',
      remainingBalance: 398450.75,
      disbursedAt: '2024-01-20',
      monthlyPayment: 22682.17,
      payments: [
        { date: '2024-02-15', amount: 22682.17, principal: 19265.84, interest: 3416.33, balance: 480734.16 },
        { date: '2024-03-15', amount: 22682.17, principal: 19401.87, interest: 3280.30, balance: 461332.29 },
        { date: '2024-04-15', amount: 22682.17, principal: 19539.22, interest: 3142.95, balance: 441793.07 }
      ]
    },
    {
      id: 'cr_002', reference: 'CRD-2024-0082', amount: 150000, currency: 'USD',
      loanTerm: 12, purpose: 'Capital de trabajo para temporada alta Q4 2024.',
      interestRate: 9.2, status: 'active',
      startDate: '2024-06-01', nextPaymentDate: '2024-12-01',
      remainingBalance: 79854.30,
      disbursedAt: '2024-06-05',
      monthlyPayment: 13132.45,
      payments: []
    },
    {
      id: 'cr_003', reference: 'CRD-2024-0083', amount: 75000, currency: 'EUR',
      loanTerm: 6, purpose: 'Financiamiento de importaciones desde Europa.',
      interestRate: 7.8, status: 'completed',
      startDate: '2024-04-01', nextPaymentDate: null,
      remainingBalance: 0,
      disbursedAt: '2024-04-03',
      monthlyPayment: 12920.00,
      payments: []
    },
    {
      id: 'cr_004', reference: 'CRD-2024-0084', amount: 250000, currency: 'USD',
      loanTerm: 18, purpose: 'Adquisición de terreno industrial en Querétaro para nueva bodega.',
      interestRate: 8.0, status: 'pending',
      startDate: null, nextPaymentDate: null,
      remainingBalance: 250000,
      disbursedAt: null,
      monthlyPayment: 15320.50,
      payments: []
    },
    {
      id: 'cr_005', reference: 'CRD-2024-0085', amount: 90000, currency: 'MXN',
      loanTerm: 3, purpose: 'Pago de nómina y gastos operativos diciembre.',
      interestRate: 12.0, status: 'rejected',
      startDate: null, nextPaymentDate: null,
      remainingBalance: 90000,
      disbursedAt: null,
      monthlyPayment: 30900.00,
      payments: []
    },
    {
      id: 'cr_006', reference: 'CRD-2024-0086', amount: 320000, currency: 'USD',
      loanTerm: 24, purpose: 'Inversión en tecnología y transformación digital.',
      interestRate: 8.5, status: 'review',
      startDate: null, nextPaymentDate: null,
      remainingBalance: 320000,
      disbursedAt: null,
      monthlyPayment: 14534.28,
      payments: []
    }
  ];

  const documents = [
    {
      id: 'doc_001', name: 'Factura Importación China Q4.pdf', type: 'Invoice',
      status: 'approved', uploadDate: '2024-11-15', size: '2.4 MB',
      relatedOperation: 'TF-2024-001247', uploader: 'Alejandro Martínez'
    },
    {
      id: 'doc_002', name: 'Contrato Proveedor Munich Machinery.pdf', type: 'Contract',
      status: 'review', uploadDate: '2024-11-18', size: '1.8 MB',
      relatedOperation: 'TF-2024-001248', uploader: 'Alejandro Martínez'
    },
    {
      id: 'doc_003', name: 'Identificación Oficial - Pasaporte.jpg', type: 'ID',
      status: 'approved', uploadDate: '2024-10-01', size: '890 KB',
      relatedOperation: null, uploader: 'Alejandro Martínez'
    },
    {
      id: 'doc_004', name: 'Comprobante de Domicilio Fiscal Oct 2024.pdf', type: 'Proof of Address',
      status: 'approved', uploadDate: '2024-10-15', size: '320 KB',
      relatedOperation: null, uploader: 'Alejandro Martínez'
    },
    {
      id: 'doc_005', name: 'Factura Servicios Texas Trade Partners.pdf', type: 'Invoice',
      status: 'pending', uploadDate: '2024-11-20', size: '1.1 MB',
      relatedOperation: 'TF-2024-001249', uploader: 'Alejandro Martínez'
    },
    {
      id: 'doc_006', name: 'Estado de Cuenta Bancario Nov 2024.pdf', type: 'Other',
      status: 'approved', uploadDate: '2024-11-05', size: '650 KB',
      relatedOperation: null, uploader: 'Alejandro Martínez'
    },
    {
      id: 'doc_007', name: 'Certificado de Origen Osaka Components.pdf', type: 'Other',
      status: 'review', uploadDate: '2024-11-12', size: '430 KB',
      relatedOperation: 'TF-2024-001254', uploader: 'Alejandro Martínez'
    },
    {
      id: 'doc_008', name: 'Carta de Crédito Documentaria CRD-2024-0081.pdf', type: 'Contract',
      status: 'approved', uploadDate: '2024-01-18', size: '3.2 MB',
      relatedOperation: null, uploader: 'Alejandro Martínez'
    },
    {
      id: 'doc_009', name: 'Póliza de Seguro de Carga Internacional.pdf', type: 'Other',
      status: 'pending', uploadDate: '2024-11-22', size: '780 KB',
      relatedOperation: 'TF-2024-001252', uploader: 'Alejandro Martínez'
    },
    {
      id: 'doc_010', name: 'Acta Constitutiva Grupo Comercial Martínez.pdf', type: 'Contract',
      status: 'approved', uploadDate: '2023-03-15', size: '5.1 MB',
      relatedOperation: null, uploader: 'Alejandro Martínez'
    }
  ];

  const transactions = [
    { id: 'txn_001', date: '2024-11-23', reference: 'TF-2024-001258', type: 'Transfer', description: 'Amsterdam Logistics B.V.', amount: -88700, currency: 'EUR', status: 'pending' },
    { id: 'txn_002', date: '2024-11-22', reference: 'TF-2024-001257', type: 'Transfer', description: 'Paris Luxury Goods S.A.S.', amount: -155000, currency: 'EUR', status: 'pending' },
    { id: 'txn_003', date: '2024-11-21', reference: 'TF-2024-001256', type: 'Transfer', description: 'Toronto Supplies Inc.', amount: -43800, currency: 'CAD', status: 'pending' },
    { id: 'txn_004', date: '2024-11-20', reference: 'TF-2024-001249', type: 'Transfer', description: 'Texas Trade Partners LLC', amount: -56750, currency: 'USD', status: 'pending' },
    { id: 'txn_005', date: '2024-11-19', reference: 'TF-2024-001253', type: 'Transfer', description: 'Barcelona Textiles S.L.', amount: -67300, currency: 'EUR', status: 'approved' },
    { id: 'txn_006', date: '2024-11-18', reference: 'TF-2024-001248', type: 'Transfer', description: 'Munich Machinery GmbH', amount: -124500, currency: 'EUR', status: 'approved' },
    { id: 'txn_007', date: '2024-11-17', reference: 'TF-2024-001252', type: 'Transfer', description: 'Seoul Tech Industries', amount: -198500, currency: 'USD', status: 'approved' },
    { id: 'txn_008', date: '2024-11-15', reference: 'TF-2024-001247', type: 'Transfer', description: 'Shenzhen Electronics Co. Ltd.', amount: -285000, currency: 'USD', status: 'completed' },
    { id: 'txn_009', date: '2024-11-12', reference: 'TF-2024-001250', type: 'Transfer', description: 'Osaka Components Corp.', amount: -18500000, currency: 'JPY', status: 'completed' },
    { id: 'txn_010', date: '2024-11-10', reference: 'TF-2024-001251', type: 'Transfer', description: 'London Trading House Ltd.', amount: -89200, currency: 'GBP', status: 'rejected' },
    { id: 'txn_011', date: '2024-11-08', reference: 'TF-2024-001254', type: 'Transfer', description: 'São Paulo Imports Ltda.', amount: -32100, currency: 'USD', status: 'completed' },
    { id: 'txn_012', date: '2024-11-05', reference: 'TF-2024-001257', type: 'Transfer', description: 'Mumbai Software Solutions Pvt. Ltd.', amount: -47200, currency: 'USD', status: 'completed' },
    { id: 'txn_013', date: '2024-12-15', reference: 'CRD-2024-0081', type: 'Credit Payment', description: 'Pago cuota crédito CRD-0081', amount: -22682.17, currency: 'USD', status: 'pending' },
    { id: 'txn_014', date: '2024-11-01', reference: 'CRD-2024-0081', type: 'Credit Payment', description: 'Pago cuota crédito CRD-0081', amount: -22682.17, currency: 'USD', status: 'completed' },
    { id: 'txn_015', date: '2024-11-01', reference: 'CRD-2024-0082', type: 'Credit Payment', description: 'Pago cuota crédito CRD-0082', amount: -13132.45, currency: 'USD', status: 'completed' },
    { id: 'txn_016', date: '2024-10-15', reference: 'TF-2024-001230', type: 'Transfer', description: 'Hong Kong Trade Group Ltd.', amount: -212000, currency: 'USD', status: 'completed' },
    { id: 'txn_017', date: '2024-10-10', reference: 'TF-2024-001225', type: 'Transfer', description: 'Italy Premium Foods S.p.A.', amount: -45600, currency: 'EUR', status: 'completed' },
    { id: 'txn_018', date: '2024-09-28', reference: 'TF-2024-001210', type: 'Transfer', description: 'Dubai Commodities LLC', amount: -178000, currency: 'USD', status: 'completed' }
  ];

  const metrics = {
    totalOperations: 47,
    totalAmount: '$2,847,350 USD',
    pendingCredits: 2,
    pendingDocuments: 3,
    totalAmountRaw: 2847350,
    successRate: 87.5,
    avgTransactionAmount: 64712
  };

  const exchangeRates = {
    // Tasas respecto al USD (USD = 1).
    // Para convertir A→B: resultado = monto * (rates[B] / rates[A])
    // Actualizar estos valores cuando se integre una API de divisas real.
    USD: 1,
    EUR: 0.9218,
    GBP: 0.7891,
    CNY: 7.2456,
    JPY: 149.52,
    CAD: 1.3614,
    CHF: 0.8975,
    MXN: 17.1340,
    BRL: 5.0432,
    KRW: 1329.15,
    INR: 83.42,
    AUD: 1.5390,
    SGD: 1.3441,
    HKD: 7.8235,
    AED: 3.6724,
    ARS: 986.50
  };

  const countries = [
    'Argentina', 'Australia', 'Brazil', 'Canada', 'Chile', 'China', 'Colombia',
    'France', 'Germany', 'Hong Kong', 'India', 'Italy', 'Japan', 'Mexico',
    'Netherlands', 'New Zealand', 'Peru', 'Portugal', 'Singapore', 'South Korea',
    'Spain', 'Sweden', 'Switzerland', 'Taiwan', 'United Arab Emirates',
    'United Kingdom', 'United States', 'Uruguay', 'Vietnam'
  ];

  const statusOptions = ['pending', 'approved', 'completed', 'rejected', 'review'];

  const paymentMethods = [
    { value: 'WIRE', label: 'WIRE Transfer', fee: 1.2, minAmount: 1000 },
    { value: 'ACH',  label: 'ACH Transfer',  fee: 0.5, minAmount: 100  }
  ];

  return {
    currentUser,
    operations,
    credits,
    documents,
    transactions,
    metrics,
    exchangeRates,
    countries,
    statusOptions,
    paymentMethods
  };

})();
