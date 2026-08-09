const appState = {
  formData: {
    reportingMonth: '',
    financialYear: '',
    conferenceName: '',
    openingBalance: 0,
  },
  receipts: [],
  payments: [],
};


const elements = {
  // Form inputs
  reportingMonth: document.getElementById('reportingMonth'),
  financialYear: document.getElementById('financialYear'),
  conferenceName: document.getElementById('conferenceName'),
  openingBalance: document.getElementById('openingBalance'),

  // Overview cards
  openingBalanceCard: document.getElementById('openingBalanceValue'),
  totalReceiptsCard: document.getElementById('totalReceiptsValue'),
  totalPaymentsCard: document.getElementById('totalPaymentsValue'),
  closingBalanceCard: document.getElementById('closingBalanceValue'),
  closingBalanceContainer: document.getElementById('closingBalanceContainer'),

  // Table containers
  receiptsTableBody: document.getElementById('receiptsTableBody'),
  paymentsTableBody: document.getElementById('paymentsTableBody'),

  // Buttons
  addReceiptBtn: document.getElementById('addReceiptBtn'),
  addPaymentBtn: document.getElementById('addPaymentBtn'),
  submitBtn: document.getElementById('submitBtn'),
  resetBtn: document.getElementById('resetBtn'),

  // Modal elements
  successModal: document.getElementById('successModal'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  modalTitle: document.getElementById('modalTitle'),
  referenceId: document.getElementById('referenceId'),
  modalBreakdown: document.getElementById('modalBreakdown'),
  downloadBtn: document.getElementById('downloadBtn'),
  printBtn: document.getElementById('printBtn'),
  newReturnBtn: document.getElementById('newReturnBtn'),

  // Auto-save indicator
  autoSaveIndicator: document.getElementById('autoSaveIndicator'),
  autoSaveDot: document.getElementById('autoSaveDot'),

  // Theme
  themeToggle: document.getElementById('themeToggle'),

  // Navigation / Menu controls
  mobileMenuBtn: document.getElementById('mobileMenuBtn'),
  sidebar: document.getElementById('sidebar'),
  sidebarNav: document.getElementById('sidebarNav'),
  dashboardNav: document.getElementById('dashboardNav'),
};


const sampleReceipts = [
  { head: 'Conference Registration', amount: '5000' },
  { head: 'Sponsorships', amount: '8000' },
  { head: 'Merchandise Sales', amount: '2000' },
];

const samplePayments = [
  { head: 'Venue Rental', amount: '3000' },
  { head: 'Catering', amount: '4000' },
  { head: 'Speaker Honorarium', amount: '5000' },
];


document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupEventListeners();
  loadFromLocalStorage();
  applyTheme();
});

function initializeApp() {
  // Initialize with sample data if empty
  if (appState.receipts.length === 0) {
    appState.receipts = [...sampleReceipts];
  }
  if (appState.payments.length === 0) {
    appState.payments = [...samplePayments];
  }

  // Render tables
  renderReceiptsTable();
  renderPaymentsTable();

  // Calculate and display
  recalculateBalance();
}

// ===========================
// Event Listeners Setup
// ===========================
function setupEventListeners() {
  // Form inputs - auto-save and recalculate
  elements.reportingMonth?.addEventListener('change', (e) => {
    appState.formData.reportingMonth = e.target.value;
    saveToLocalStorage();
    validateForm();
  });

  elements.financialYear?.addEventListener('change', (e) => {
    appState.formData.financialYear = e.target.value;
    saveToLocalStorage();
    validateForm();
  });

  elements.conferenceName?.addEventListener('input', (e) => {
    appState.formData.conferenceName = e.target.value;
    saveToLocalStorage();
    validateForm();
  });

  elements.openingBalance?.addEventListener('input', (e) => {
    appState.formData.openingBalance = parseFloat(e.target.value) || 0;
    saveToLocalStorage();
    recalculateBalance();
    validateForm();
  });

  // Add row buttons
  elements.addReceiptBtn?.addEventListener('click', () => addReceiptRow());
  elements.addPaymentBtn?.addEventListener('click', () => addPaymentRow());

  // Submit and reset buttons
  elements.submitBtn?.addEventListener('click', handleSubmit);
  elements.resetBtn?.addEventListener('click', handleReset);

  // Modal close
  elements.closeModalBtn?.addEventListener('click', closeModal);

  // Modal action buttons
  elements.downloadBtn?.addEventListener('click', downloadReport);
  elements.printBtn?.addEventListener('click', printReport);
  elements.newReturnBtn?.addEventListener('click', () => {
    closeModal();
    handleReset();
  });

  // Theme toggle
  elements.themeToggle?.addEventListener('click', toggleTheme);

  // Mobile menu button (left side): toggle sidebar visibility and ensure nav items (Dashboard, Monthly Returns, etc.) are visible
  elements.mobileMenuBtn?.addEventListener('click', () => {
    const sidebar = elements.sidebar || document.querySelector('.sidebar');
    const main = document.querySelector('.main-content');
    if (!sidebar) return;

    const isHidden = sidebar.classList.contains('hidden');
    if (isHidden) {
      sidebar.classList.remove('hidden');
      if (main) main.classList.remove('fullwidth');
      // Ensure nav items are visible
      const dashboard = elements.dashboardNav || document.getElementById('dashboardNav');
      if (dashboard) dashboard.style.display = 'block';
      // Also ensure other nav items are visible (if they were hidden previously)
      const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
      navItems.forEach((n) => (n.style.display = 'block'));
    } else {
      sidebar.classList.add('hidden');
      if (main) main.classList.add('fullwidth');
    }
  });

  // Modal close on background click
  elements.successModal?.addEventListener('click', (e) => {
    if (e.target === elements.successModal) {
      closeModal();
    }
  });
}
function renderReceiptsTable() {
  if (!elements.receiptsTableBody) return;

  if (appState.receipts.length === 0) {
    elements.receiptsTableBody.innerHTML = `
      <tr>
        <td colspan="3" class="empty-table">
          No receipt entries yet. Click "+ Add Income Head" to get started.
        </td>
      </tr>
    `;
    return;
  }

  elements.receiptsTableBody.innerHTML = appState.receipts
    .map(
      (receipt, index) => `
    <tr>
      <td>
        <input
          type="text"
          value="${receipt.head}"
          class="receipt-head"
          data-index="${index}"
          placeholder="Income Head (e.g., Registration Fees)"
        />
      </td>
      <td>
        <input
          type="number"
          value="${receipt.amount}"
          class="receipt-amount"
          data-index="${index}"
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </td>
      <td>
        <button class="delete-btn" onclick="deleteReceiptRow(${index})">
          Delete
        </button>
      </td>
    </tr>
  `
    )
    .join('');

  attachReceiptInputListeners();
}

function renderPaymentsTable() {
  if (!elements.paymentsTableBody) return;

  if (appState.payments.length === 0) {
    elements.paymentsTableBody.innerHTML = `
      <tr>
        <td colspan="3" class="empty-table">
          No payment entries yet. Click "+ Add Expense Head" to get started.
        </td>
      </tr>
    `;
    return;
  }

  elements.paymentsTableBody.innerHTML = appState.payments
    .map(
      (payment, index) => `
    <tr>
      <td>
        <input
          type="text"
          value="${payment.head}"
          class="payment-head"
          data-index="${index}"
          placeholder="Expense Head (e.g., Venue Rental)"
        />
      </td>
      <td>
        <input
          type="number"
          value="${payment.amount}"
          class="payment-amount"
          data-index="${index}"
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </td>
      <td>
        <button class="delete-btn" onclick="deletePaymentRow(${index})">
          Delete
        </button>
      </td>
    </tr>
  `
    )
    .join('');

  attachPaymentInputListeners();
}

function attachReceiptInputListeners() {
  document.querySelectorAll('.receipt-head').forEach((input) => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      appState.receipts[index].head = e.target.value;
      saveToLocalStorage();
      validateForm();
    });
  });

  document.querySelectorAll('.receipt-amount').forEach((input) => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      appState.receipts[index].amount = e.target.value;
      saveToLocalStorage();
      recalculateBalance();
      validateForm();
    });
  });
}

function attachPaymentInputListeners() {
  document.querySelectorAll('.payment-head').forEach((input) => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      appState.payments[index].head = e.target.value;
      saveToLocalStorage();
      validateForm();
    });
  });

  document.querySelectorAll('.payment-amount').forEach((input) => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      appState.payments[index].amount = e.target.value;
      saveToLocalStorage();
      recalculateBalance();
      validateForm();
    });
  });
}

// ===========================
// Add/Delete Rows
// ===========================
function addReceiptRow() {
  appState.receipts.push({ head: '', amount: '' });
  renderReceiptsTable();
  saveToLocalStorage();
  validateForm();
}

function addPaymentRow() {
  appState.payments.push({ head: '', amount: '' });
  renderPaymentsTable();
  saveToLocalStorage();
  validateForm();
}

function deleteReceiptRow(index) {
  appState.receipts.splice(index, 1);
  renderReceiptsTable();
  saveToLocalStorage();
  recalculateBalance();
  validateForm();
}

function deletePaymentRow(index) {
  appState.payments.splice(index, 1);
  renderPaymentsTable();
  saveToLocalStorage();
  recalculateBalance();
  validateForm();
}

// ===========================
// Calculations
// ===========================
function getTotalReceipts() {
  return appState.receipts.reduce((sum, receipt) => {
    return sum + (parseFloat(receipt.amount) || 0);
  }, 0);
}

function getTotalPayments() {
  return appState.payments.reduce((sum, payment) => {
    return sum + (parseFloat(payment.amount) || 0);
  }, 0);
}

function getClosingBalance() {
  return (
    appState.formData.openingBalance +
    getTotalReceipts() -
    getTotalPayments()
  );
}

function recalculateBalance() {
  const totalReceipts = getTotalReceipts();
  const totalPayments = getTotalPayments();
  const closingBalance = getClosingBalance();

  // Update cards
  if (elements.openingBalanceCard) {
    elements.openingBalanceCard.textContent = formatCurrency(
      appState.formData.openingBalance
    );
  }

  if (elements.totalReceiptsCard) {
    elements.totalReceiptsCard.textContent = formatCurrency(totalReceipts);
  }

  if (elements.totalPaymentsCard) {
    elements.totalPaymentsCard.textContent = formatCurrency(totalPayments);
  }

  if (elements.closingBalanceCard) {
    const isPositive = closingBalance >= 0;
    elements.closingBalanceCard.textContent = formatCurrency(closingBalance);
    elements.closingBalanceCard.classList.toggle('positive', isPositive);
    elements.closingBalanceCard.classList.toggle('negative', !isPositive);
  }

  if (elements.closingBalanceContainer) {
    const isPositive = closingBalance >= 0;
    elements.closingBalanceContainer.classList.toggle('positive', isPositive);
    elements.closingBalanceContainer.classList.toggle('negative', !isPositive);
  }
}

// ===========================
// Form Validation
// ===========================
function validateForm() {
  const isValid =
    appState.formData.reportingMonth &&
    appState.formData.financialYear &&
    appState.formData.conferenceName &&
    appState.formData.openingBalance !== '' &&
    appState.receipts.length > 0 &&
    appState.payments.length > 0 &&
    appState.receipts.every((r) => r.head && r.amount) &&
    appState.payments.every((p) => p.head && p.amount);

  if (elements.submitBtn) {
    elements.submitBtn.disabled = !isValid;
  }

  return isValid;
}

// ===========================
// Form Submission
// ===========================
function handleSubmit(e) {
  e.preventDefault();

  if (!validateForm()) {
    alert('Please fill in all required fields correctly.');
    return;
  }

  // Generate reference ID
  const referenceId = generateReferenceId();

  // Show success modal
  showSuccessModal(referenceId);

  // Save to local storage with timestamp
  const submission = {
    referenceId,
    timestamp: new Date().toISOString(),
    data: JSON.parse(JSON.stringify(appState)),
  };

  const submissions =
    JSON.parse(localStorage.getItem('submissions') || '[]');
  submissions.push(submission);
  localStorage.setItem('submissions', JSON.stringify(submissions));
}

function generateReferenceId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MR-${timestamp}-${random}`;
}

// ===========================
// Modal Functions
// ===========================
function showSuccessModal(referenceId) {
  if (!elements.successModal) return;

  const closingBalance = getClosingBalance();

  // Populate modal
  if (elements.referenceId) {
    elements.referenceId.textContent = referenceId;
  }

  // Build breakdown
  const breakdown = `
    <div class="breakdown-item">
      <span>Opening Balance:</span>
      <span>${formatCurrency(appState.formData.openingBalance)}</span>
    </div>
    <div class="breakdown-item">
      <span>Total Receipts:</span>
      <span class="positive">${formatCurrency(getTotalReceipts())}</span>
    </div>
    <div class="breakdown-item">
      <span>Total Payments:</span>
      <span class="negative">-${formatCurrency(getTotalPayments())}</span>
    </div>
    <div class="breakdown-item total">
      <span>Closing Balance:</span>
      <span class="${closingBalance >= 0 ? 'positive' : 'negative'}">
        ${formatCurrency(closingBalance)}
      </span>
    </div>
  `;

  if (elements.modalBreakdown) {
    elements.modalBreakdown.innerHTML = breakdown;
  }

  // Show modal
  elements.successModal.classList.add('show');
}

function closeModal() {
  if (elements.successModal) {
    elements.successModal.classList.remove('show');
  }
}

function downloadReport() {
  const closingBalance = getClosingBalance();
  const report = `
MONTHLY RETURNS REPORT
Reference ID: ${elements.referenceId?.textContent || 'N/A'}

Report Details:
- Reporting Month: ${appState.formData.reportingMonth}
- Financial Year: ${appState.formData.financialYear}
- Conference: ${appState.formData.conferenceName}

Opening Balance: ${formatCurrency(appState.formData.openingBalance)}

RECEIPTS:
${appState.receipts.map((r) => `- ${r.head}: ${formatCurrency(r.amount)}`).join('\n')}
Total Receipts: ${formatCurrency(getTotalReceipts())}

PAYMENTS:
${appState.payments.map((p) => `- ${p.head}: ${formatCurrency(p.amount)}`).join('\n')}
Total Payments: ${formatCurrency(getTotalPayments())}

CLOSING BALANCE: ${formatCurrency(closingBalance)}

Generated on: ${new Date().toLocaleString()}
  `;

  // Create blob and download
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `monthly-returns-${elements.referenceId?.textContent || 'report'}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function printReport() {
  const closingBalance = getClosingBalance();
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Monthly Returns Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          .section { margin-bottom: 20px; }
          .item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
          .item.total { font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
          .positive { color: green; }
          .negative { color: red; }
        </style>
      </head>
      <body>
        <h1>Monthly Returns Report</h1>
        <div class="section">
          <strong>Reference ID:</strong> ${elements.referenceId?.textContent || 'N/A'}<br>
          <strong>Reporting Month:</strong> ${appState.formData.reportingMonth}<br>
          <strong>Financial Year:</strong> ${appState.formData.financialYear}<br>
          <strong>Conference:</strong> ${appState.formData.conferenceName}
        </div>

        <div class="section">
          <div class="item">
            <span>Opening Balance:</span>
            <span>${formatCurrency(appState.formData.openingBalance)}</span>
          </div>
        </div>

        <div class="section">
          <h3>Receipts</h3>
          ${appState.receipts.map((r) => `<div class="item"><span>${r.head}</span><span>${formatCurrency(r.amount)}</span></div>`).join('')}
          <div class="item total positive">
            <span>Total Receipts:</span>
            <span>${formatCurrency(getTotalReceipts())}</span>
          </div>
        </div>

        <div class="section">
          <h3>Payments</h3>
          ${appState.payments.map((p) => `<div class="item"><span>${p.head}</span><span>${formatCurrency(p.amount)}</span></div>`).join('')}
          <div class="item total negative">
            <span>Total Payments:</span>
            <span>${formatCurrency(getTotalPayments())}</span>
          </div>
        </div>

        <div class="section">
          <div class="item total ${closingBalance >= 0 ? 'positive' : 'negative'}">
            <span>Closing Balance:</span>
            <span>${formatCurrency(closingBalance)}</span>
          </div>
        </div>

        <hr>
        <small>Generated on: ${new Date().toLocaleString()}</small>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}

// ===========================
// Form Reset
// ===========================
function handleReset() {
  if (!confirm('Are you sure you want to clear all data?')) {
    return;
  }

  appState.formData = {
    reportingMonth: '',
    financialYear: '',
    conferenceName: '',
    openingBalance: 0,
  };
  appState.receipts = [...sampleReceipts];
  appState.payments = [...samplePayments];

  // Reset form inputs
  if (elements.reportingMonth) elements.reportingMonth.value = '';
  if (elements.financialYear) elements.financialYear.value = '';
  if (elements.conferenceName) elements.conferenceName.value = '';
  if (elements.openingBalance) elements.openingBalance.value = '';

  // Re-render
  renderReceiptsTable();
  renderPaymentsTable();
  recalculateBalance();
  validateForm();

  saveToLocalStorage();
}

// ===========================
// LocalStorage Persistence
// ===========================
function saveToLocalStorage() {
  const dataToSave = {
    formData: appState.formData,
    receipts: appState.receipts,
    payments: appState.payments,
    timestamp: new Date().toISOString(),
  };

  localStorage.setItem('monthlyReturnsData', JSON.stringify(dataToSave));
  updateAutoSaveIndicator();
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('monthlyReturnsData');

  if (saved) {
    try {
      const data = JSON.parse(saved);
      appState.formData = data.formData || appState.formData;
      appState.receipts = data.receipts || appState.receipts;
      appState.payments = data.payments || appState.payments;

      // Restore form inputs
      if (elements.reportingMonth)
        elements.reportingMonth.value =
          appState.formData.reportingMonth || '';
      if (elements.financialYear)
        elements.financialYear.value = appState.formData.financialYear || '';
      if (elements.conferenceName)
        elements.conferenceName.value = appState.formData.conferenceName || '';
      if (elements.openingBalance)
        elements.openingBalance.value =
          appState.formData.openingBalance || '';

      // Re-render tables
      renderReceiptsTable();
      renderPaymentsTable();
      recalculateBalance();
      validateForm();
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }
}

function updateAutoSaveIndicator() {
  if (!elements.autoSaveIndicator) return;

  elements.autoSaveIndicator.textContent = 'Draft auto-saved';
  elements.autoSaveIndicator.classList.add('saved');

  // Reset after 2 seconds
  setTimeout(() => {
    elements.autoSaveIndicator.classList.remove('saved');
  }, 2000);
}

// ===========================
// Theme Management
// ===========================
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeIcon();
}

function applyTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.body.classList.contains('dark-theme');
  if (elements.themeToggle) {
    elements.themeToggle.textContent = isDark ? '☀️' : '🌙';
  }
}

// ===========================
// Utility Functions
// ===========================
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}
