/* ========= Loan Page JS ========= */

document.getElementById('helpBtn').addEventListener('click', function () {
  document.querySelector('.card.categories').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('eligibility').addEventListener('click', function () {
  document.querySelector('.split').scrollIntoView({ behavior: 'smooth' });
});

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

// Loan Categories
const loanCards = document.querySelectorAll(".loan-card");
const loanContents = document.querySelectorAll(".loan-content");
const loanTitle = document.getElementById("loanTitle"); // <h2 id="loanTitle"> inside calculator

// EMI Calculator Elements
const loanAmount = document.getElementById("loanAmount");
const interestRate = document.getElementById("interestRate");
const amountDisplay = document.getElementById("amountDisplay");
const rateDisplay = document.getElementById("rateDisplay");
const emiDisplay = document.getElementById("emi");
const totalInterestDisplay = document.getElementById("totalInterest");
const totalPaymentDisplay = document.getElementById("totalPayment");
const scheduleBody = document.getElementById("scheduleBody");

let duration = 6; // default months

// Format numbers
const formatNumber = (num) =>
  num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

// Calculate EMI
function calculateEMI() {
  const P = parseInt(loanAmount.value);
  const annualRate = parseFloat(interestRate.value);
  const R = annualRate / 12 / 100;
  const N = duration;

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

// Update values
loanAmount.addEventListener("input", () => {
  amountDisplay.textContent = formatNumber(parseInt(loanAmount.value));
  calculateEMI();
});

interestRate.addEventListener("input", () => {
  rateDisplay.textContent = `${interestRate.value}%`;
  calculateEMI();
});

// Duration buttons
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

// Toggle schedule
document.querySelector(".toggle-schedule").addEventListener("click", () => {
  const schedule = document.querySelector(".schedule-table");
  schedule.style.display = schedule.style.display === "none" ? "block" : "none";
});

// Loan defaults when switching category
const loanDefaults = {
  home: { min: 100000, max: 10000000, step: 50000, rate: 8.5, title: "Home Loan EMI Calculator" },
  car: { min: 100000, max: 5000000, step: 25000, rate: 9.0, title: "Car Loan EMI Calculator" },
  personal: { min: 50000, max: 2000000, step: 10000, rate: 12.5, title: "Personal Loan EMI Calculator" },
  education: { min: 50000, max: 5000000, step: 20000, rate: 10.5, title: "Education Loan EMI Calculator" }
};

loanCards.forEach(card => {
  card.addEventListener("click", () => {
    const selectedLoan = card.dataset.loan;

    // Highlight active card
    loanCards.forEach(c => c.setAttribute("aria-expanded", "false"));
    card.setAttribute("aria-expanded", "true");

    // Hide/show content section
    loanContents.forEach(content => {
      content.hidden = content.dataset.loan !== selectedLoan;
    });

    // Apply defaults
    const defaults = loanDefaults[selectedLoan];
    if (defaults) {
      loanTitle.textContent = defaults.title;
      loanAmount.min = defaults.min;
      loanAmount.max = defaults.max;
      loanAmount.step = defaults.step;
      loanAmount.value = defaults.min;
      amountDisplay.textContent = formatNumber(defaults.min);

      interestRate.value = defaults.rate;
      rateDisplay.textContent = `${defaults.rate}%`;
      calculateEMI();
    }
  });
});

// Required Documents Tabs
const salariedBtn = document.querySelector('[data-doc="salaried"]');
const selfBtn = document.querySelector('[data-doc="self"]');
const docSalaried = document.getElementById("hlDocSalaried");
const docSelf = document.getElementById("hlDocSelf");

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

// FAQ Accordion
document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
    const answer = btn.nextElementSibling;
    answer.style.maxHeight = answer.style.maxHeight ? null : answer.scrollHeight + "px";
  });
});

// Blog Slider
const slides = document.querySelectorAll(".blog-slide");
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
}
document.getElementById("prev").addEventListener("click", () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
});
document.getElementById("next").addEventListener("click", () => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
});

// Initialize with Home Loan
calculateEMI();
