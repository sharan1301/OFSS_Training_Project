document.getElementById('helpBtn').addEventListener('click', function () {
  document.querySelector('.card.categories').scrollIntoView({ behavior: 'smooth' });
});

 function redirectToPage() {
    window.location.href = "loanRequest.html";
  }
const toggleBtn = document.getElementById('toggleBtn');
const loanInfo = document.getElementById('loanInfo');
const dropdownText = document.getElementById('dropdownText');
const readLess = document.getElementById('readLess');

toggleBtn.addEventListener('click', () => {
  loanInfo.style.display = "none";
  dropdownText.style.display = "block";
});

readLess.addEventListener('click', () => {
  dropdownText.style.display = "none";
  loanInfo.style.display = "block";
});


// EMI Calculator Elements
const loanAmount = document.getElementById("loanAmount");
const interestRate = document.getElementById("interestRate");
const customLoanAmount = document.getElementById("customLoanAmount");
const customInterestRate = document.getElementById("customInterestRate");

const amountDisplay = document.getElementById("amountDisplay");
const rateDisplay = document.getElementById("rateDisplay");
const emiDisplay = document.getElementById("emi");
const totalInterestDisplay = document.getElementById("totalInterest");
const totalPaymentDisplay = document.getElementById("totalPayment");
const scheduleBody = document.getElementById("scheduleBody");

let duration = 6;

// Format numbers
const formatNumber = (num) =>
  num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

// Calculate EMI
function calculateEMI() {
  const P = parseInt(loanAmount.value);
  const annualRate = parseFloat(interestRate.value);
  const R = annualRate / 12 / 100;
  const N = duration;

  if (!P || !R || !N) return;

  const emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
  const totalPayment = emi * N;
  const totalInterest = totalPayment - P;

  emiDisplay.textContent = formatNumber(Math.round(emi));
  totalInterestDisplay.textContent = formatNumber(Math.round(totalInterest));
  totalPaymentDisplay.textContent = formatNumber(Math.round(totalPayment));

  generateSchedule(P, R, N, emi);
}

// Repayment Schedule
function generateSchedule(P, R, N, emi) {
  if (!scheduleBody) return;
  scheduleBody.innerHTML = "";
  let balance = P;

  for (let i = 1; i <= N; i++) {
    const interest = balance * R;
    const principal = emi - interest;
    balance -= principal;

    const row = `<tr>
      <td>Month ${i}</td>
      <td>₹${formatNumber(Math.round(principal))}</td>
      <td>₹${formatNumber(Math.round(interest))}</td>
      <td>₹${formatNumber(Math.round(emi))}</td>
      <td>₹${formatNumber(Math.max(0, Math.round(balance)))}</td>
    </tr>`;
    scheduleBody.innerHTML += row;
  }
}

// --- Sliders + Custom Inputs ---

// Loan Amount Slider
loanAmount.addEventListener("input", () => {
  const val = parseInt(loanAmount.value);
  amountDisplay.textContent = formatNumber(val);
  customLoanAmount.value = val;
  calculateEMI();
});

// Custom Loan Amount Input
customLoanAmount.addEventListener("input", (e) => {
  if (e.target.value) {
    let val = parseInt(e.target.value);

    // Clamp to slider range
    if (val < parseInt(loanAmount.min)) val = parseInt(loanAmount.min);
    if (val > parseInt(loanAmount.max)) val = parseInt(loanAmount.max);

    loanAmount.value = val;
    amountDisplay.textContent = formatNumber(val);
    calculateEMI();
  }
});

// Interest Rate Slider
interestRate.addEventListener("input", () => {
  const val = parseFloat(interestRate.value);
  rateDisplay.textContent = `${val}%`;
  customInterestRate.value = val;
  calculateEMI();
});

// Custom Interest Rate Input
customInterestRate.addEventListener("input", (e) => {
  if (e.target.value) {
    let val = parseFloat(e.target.value);

    // Clamp to slider range
    if (val < parseFloat(interestRate.min)) val = parseFloat(interestRate.min);
    if (val > parseFloat(interestRate.max)) val = parseFloat(interestRate.max);

    interestRate.value = val;
    rateDisplay.textContent = `${val}%`;
    calculateEMI();
  }
});

// --- Duration Buttons ---
document.querySelectorAll(".duration-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".duration-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (btn.classList.contains("custom")) {
      document.getElementById("customDuration").style.display = "block";
    } else {
      document.getElementById("customDuration").style.display = "none";
      duration = parseInt(btn.dataset.months);
      calculateEMI();
    }
  });
});

// Custom duration
document.getElementById("customDuration").addEventListener("input", (e) => {
  duration = parseInt(e.target.value) || 0;
  calculateEMI();
});

// --- Quick-select labels ---
function attachRangeLabels(slider, labels) {
  labels.querySelectorAll("span").forEach(label => {
    label.addEventListener("click", () => {
      const value = label.dataset.value;
      slider.value = value;
      slider.dispatchEvent(new Event("input")); // sync slider + custom input
    });
  });
}

const loanAmountLabels = document.getElementById("loanAmountLabels");
attachRangeLabels(loanAmount, loanAmountLabels);

const interestRateLabels = document.getElementById("interestRateLabels");
attachRangeLabels(interestRate, interestRateLabels);

// --- Toggle schedule ---
document.querySelectorAll(".toggle-schedule").forEach(btn => {
  btn.addEventListener("click", () => {
    const schedule = btn.nextElementSibling;
    schedule.style.display = schedule.style.display === "none" ? "block" : "none";
  });
});

// Initial Calculation
calculateEMI();


// Required Documents Tabs
const salariedBtn = document.querySelector('[data-doc="salaried"]');
const selfBtn = document.querySelector('[data-doc="self"]');
const docSalaried = document.getElementById("hlDocSalaried");
const docSelf = document.getElementById("hlDocSelf");

if (salariedBtn && selfBtn) {
  salariedBtn.addEventListener("click", () => {
    salariedBtn.classList.add("active");
    selfBtn.classList.remove("active");
    docSalaried.hidden = false;
    docSelf.hidden = true;
  });

  selfBtn.addEventListener("click", () => {
    selfBtn.classList.add("active");
    salariedBtn.classList.remove("active");
    docSelf.hidden = false;
    docSalaried.hidden = true;
  });
}

// FAQ Accordion
document.querySelectorAll(".faq-question").forEach(button => {
  button.addEventListener("click", () => {
    const faq = button.parentElement;
    faq.classList.toggle("open");

    const answer = faq.querySelector(".faq-answer");
    if (faq.classList.contains("open")) {
      answer.style.display = "block";
    } else {
      answer.style.display = "none";
    }
  });
});

const slider = document.querySelector(".blog-slider");
const leftBtn = document.querySelector(".slide-btn.left");
const rightBtn = document.querySelector(".slide-btn.right");

const cardWidth = document.querySelector(".blog-card").offsetWidth + 20; 

leftBtn.addEventListener("click", () => {
  slider.scrollBy({ left: -cardWidth, behavior: "smooth" });
});

rightBtn.addEventListener("click", () => {
  slider.scrollBy({ left: cardWidth, behavior: "smooth" });
});


calculateEMI();