let transactions = []; 
let defaultFromAccount = null;

// Fetch account by custId
async function fetchAccountByCustId() {
  const custId = localStorage.getItem("custId");
  if (!custId) {
    alert("User not logged in.");
    return null;
  }

  try {
    const token = localStorage.getItem("userToken");
    const encodedCustId = encodeURIComponent(custId);

    const res = await fetch(`http://localhost:8080/users/accounts/by-custid/${encodedCustId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) throw new Error('Failed to fetch account');

    const accountData = await res.json();
    defaultFromAccount = accountData.accountNumber;

    return accountData;
  } catch (err) {
    console.error(err);
    alert("Error fetching account details.");
    return null;
  }
}

// Fetch transactions for account
async function fetchTransactionsByAccount(accountId) {
  try {
    const token = localStorage.getItem("userToken");
    const res = await fetch(`http://localhost:8080/users/transfers/transactions/account/${accountId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) throw new Error("Failed to fetch transactions");

    transactions = await res.json(); 
    renderTable(transactions);
    updateSummary(transactions);

  } catch (err) {
    console.error(err);
    alert("Error fetching transactions.");
  }
}

// Initialize page
async function initStatementPage() {
  const accountData = await fetchAccountByCustId();
  if (accountData && accountData.accountId) {
    await fetchTransactionsByAccount(accountData.accountId);
  }
}

// Render table
function renderTable(data) {
  const tbody = document.getElementById("statementTable");
  tbody.innerHTML = "";

  data.forEach(tx => {
    const date = tx.transactionDate ? new Date(tx.transactionDate).toLocaleString() : "—";
    const description = tx.description || `${tx.transactionMode} ${tx.transactionType}`;
    const type = tx.transactionType || "Unknown";
    const mode = tx.transactionMode || "—";
    const amount = tx.amount != null ? `₹${tx.amount}` : "₹0";
    const balance = tx.balanceAfter != null ? `₹${tx.balanceAfter}` : "₹0";
    const status = tx.status || "PENDING";

    // Updated: account → sender, recvAcc → receiver
    const fromAcc = tx.account?.accountNumber || "—";
    const toAcc = tx.recvAcc?.accountNumber || "—";

    const tr = document.createElement("tr");
    
    tr.innerHTML = `
      <td>${date}</td>
      <td>${type}</td>
      <td>${mode}</td>
      <td>${status}</td>
      <td>${amount}</td>
      <td>${balance}</td>
   
    `;
    tbody.appendChild(tr);
  });
}
//   <td>${description}</td>
//<td>From: ${fromAcc} → To: ${toAcc}</td>
// Update summary
function updateSummary(data) {
  const totalCredits = data.filter(tx => tx.transactionType === "CREDIT").reduce((sum, tx) => sum + tx.amount, 0);
  const totalDebits = data.filter(tx => tx.transactionType === "DEBIT" || tx.transactionType === "TRANSFER").reduce((sum, tx) => sum + tx.amount, 0);
  const currentBalance = data.length ? data[data.length - 1].balanceAfter : 0;

  document.getElementById("currentBalance").innerText = `₹${currentBalance}`;
  document.getElementById("totalCredits").innerText = `₹${totalCredits}`;
  document.getElementById("totalDebits").innerText = `₹${totalDebits}`;
}

// Filters
function applyFilters() {
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;
  const type = document.getElementById("type").value;
  const minAmount = parseFloat(document.getElementById("minAmount").value) || 0;
  const maxAmount = parseFloat(document.getElementById("maxAmount").value) || Infinity;
  const search = document.getElementById("search").value.toLowerCase();

  let filtered = transactions.filter(tx => {
    const txDate = new Date(tx.transactionDate);
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    const desc = (tx.description || `${tx.transactionMode} ${tx.transactionType}`).toLowerCase();

    return (!from || txDate >= from) &&
           (!to || txDate <= to) &&
           (!type || tx.transactionType === type) &&
           tx.amount >= minAmount &&
           tx.amount <= maxAmount &&
           desc.includes(search);
  });

  renderTable(filtered);
  updateSummary(filtered);
}

// Download PDF
function downloadPDF() {
  const element = document.getElementById("statementContainer");
  const opt = {
    margin: 0.3,
    filename: 'Bank_Statement.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 3, useCORS: true, scrollY: -window.scrollY },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

window.onload = initStatementPage;
