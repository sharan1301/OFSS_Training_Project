// ------------------- Transactions -------------------
// 20 dummy transactions
let transactions = [
  { date: '2025-09-10', desc: 'Grocery Store', type: 'Debit', amount: '₹ 2,500' },
  { date: '2025-09-09', desc: 'Salary', type: 'Credit', amount: '₹ 75,000' },
  { date: '2025-09-08', desc: 'Electricity Bill', type: 'Debit', amount: '₹ 1,200' },
  { date: '2025-09-07', desc: 'Restaurant', type: 'Debit', amount: '₹ 800' },
  { date: '2025-09-06', desc: 'Interest', type: 'Credit', amount: '₹ 1,000' },
  { date: '2025-09-05', desc: 'Fuel', type: 'Debit', amount: '₹ 1,500' },
  { date: '2025-09-04', desc: 'Gym Membership', type: 'Debit', amount: '₹ 2,000' },
  { date: '2025-09-03', desc: 'Freelance Payment', type: 'Credit', amount: '₹ 15,000' },
  { date: '2025-09-02', desc: 'Mobile Recharge', type: 'Debit', amount: '₹ 600' },
  { date: '2025-09-01', desc: 'Dividend', type: 'Credit', amount: '₹ 2,500' },
  { date: '2025-08-31', desc: 'Restaurant', type: 'Debit', amount: '₹ 950' },
  { date: '2025-08-30', desc: 'Salary', type: 'Credit', amount: '₹ 75,000' },
  { date: '2025-08-29', desc: 'Electricity Bill', type: 'Debit', amount: '₹ 1,100' },
  { date: '2025-08-28', desc: 'Fuel', type: 'Debit', amount: '₹ 1,400' },
  { date: '2025-08-27', desc: 'Interest', type: 'Credit', amount: '₹ 900' },
  { date: '2025-08-26', desc: 'Groceries', type: 'Debit', amount: '₹ 3,000' },
  { date: '2025-08-25', desc: 'Freelance Payment', type: 'Credit', amount: '₹ 12,000' },
  { date: '2025-08-24', desc: 'Gym Membership', type: 'Debit', amount: '₹ 2,000' },
  { date: '2025-08-23', desc: 'Dividend', type: 'Credit', amount: '₹ 2,200' },
  { date: '2025-08-22', desc: 'Mobile Recharge', type: 'Debit', amount: '₹ 500' },
];

const txBody = document.getElementById('txBody');

function displayTransactions(filtered = transactions) {
  txBody.innerHTML = '';
  filtered.slice(0, 10).forEach(tx => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${tx.date}</td><td>${tx.desc}</td><td class="${tx.type.toLowerCase()}">${tx.type}</td><td>${tx.amount}</td>`;
    txBody.appendChild(row);
  });
}

displayTransactions();

// Filter by type
document.getElementById('txFilter').addEventListener('change', e => {
  const val = e.target.value;
  const filtered = val === 'all' ? transactions : transactions.filter(tx => tx.type.toLowerCase() === val);
  displayTransactions(filtered);
});

// Search by description or amount
document.getElementById('txSearch').addEventListener('input', e => {
  const val = e.target.value.toLowerCase();
  const filtered = transactions.filter(tx => tx.desc.toLowerCase().includes(val) || tx.amount.includes(val));
  displayTransactions(filtered);
});

document.getElementById('downloadCsv').addEventListener('click', () => {
  const csvField = (val) => {
    if (val === null || val === undefined) return '""';
    let s = (typeof val === 'number') ? val.toLocaleString('en-IN') : String(val);
    s = s.replace(/"/g, '""'); 
    return `"${s}"`;
  };

  const headers = ['Date', 'Description', 'Type', 'Amount'];
  const rows = transactions.slice(0, 10).map(tx => {
    return [
      csvField(tx.date),
      csvField(tx.desc),
      csvField(tx.type),
      csvField(tx.amount)
    ].join(',');
  });

  const csvContent = '\ufeff' + headers.map(h => `"${h}"`).join(',') + '\r\n' + rows.join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'latest_transactions.csv';
  a.click();
  URL.revokeObjectURL(url);
});



// ------------------- Notifications -------------------
const notifications = [
  'Your Home Loan EMI is due on 2025-09-25',
  'New message from bank support',
];

const notifBody = document.getElementById('notifications');
const notifCount = document.getElementById('notifCount');

function showNotifications() {
  notifBody.innerHTML = '';
  notifications.forEach(note => {
    const li = document.createElement('li');
    li.textContent = note;
    notifBody.appendChild(li);
  });
  notifCount.textContent = notifications.length;
}

showNotifications();

function clearNotifications() {
  notifBody.innerHTML = '';
  notifCount.textContent = '0';
}

// ------------------- Accounts Overview -------------------
const accounts = [
  { type: "Savings", balance: 125000 },
  { type: "Current", balance: 54000 },
  { type: "Fixed Deposit", balance: 200000 }
];

const accountsContainer = document.getElementById("accountsOverview");
if(accountsContainer) {
  accounts.forEach(acc => {
    const accDiv = document.createElement("div");
    accDiv.className = "account-card";
    accDiv.innerHTML = `
      <div class="acc-type">${acc.type}</div>
      <div class="acc-balance">₹${acc.balance.toLocaleString()}</div>
    `;
    accountsContainer.appendChild(accDiv);
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalDiv = document.createElement("div");
  totalDiv.className = "account-total";
  totalDiv.innerHTML = `<strong>Total Balance: ₹${totalBalance.toLocaleString()}</strong>`;
  accountsContainer.appendChild(totalDiv);
}

// ------------------- Loan Progress -------------------
function setLoanProgress(circle, percent) {
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
  circle.style.transform = "rotate(-90deg)";
  circle.style.transformOrigin = "50% 50%";
}

document.querySelectorAll('.loan-circle').forEach(loan => {
  const paid = parseInt(loan.dataset.paid);
  const total = parseInt(loan.dataset.total);
  const next = loan.dataset.nextemi;
  const due = loan.dataset.due;
  const percent = total ? Math.round((paid / total) * 100) : 0;

  const circle = loan.querySelector('.progress-ring__circle');
  const amountLabel = loan.querySelector('.loan-amount');
  const nextLabel = loan.querySelector('.loan-next');

  amountLabel.textContent = `₹${paid.toLocaleString()} / ₹${total.toLocaleString()}`;
  /*nextLabel.textContent = `Next EMI: ₹${parseInt(next).toLocaleString()} • Due: ${due}`;*/

  setLoanProgress(circle, percent);
});

function formatDateTime() {
    const now = new Date();

    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    };

    return now.toLocaleString("en-GB", options).replace(",", "");
  }

  document.getElementById("datetime").textContent = formatDateTime();

// ------------------- Logout -------------------
document.getElementById("logoutBtn").addEventListener("click", function (e) {
  e.preventDefault(); 
  const confirmed = confirm("Do you want to logout?");
  if (confirmed) window.location.href = "custLogin.html";
});

