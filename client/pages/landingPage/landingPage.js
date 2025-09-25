// Account Cards: Hover handled by CSS

// Loan Type Carousel Switch
const loanTypes = [
    {
        type: "Personal",
        caption: "Instant approval, minimal documentation, flexible usage."
    },
    {
        type: "Home",
        caption: "Low interest rates, easy EMIs, dream homes come true."
    },
    {
        type: "Vehicle",
        caption: "Fast funding, affordable interest, drive your dream car."
    },
    {
        type: "Education",
        caption: "Empowering your future with no hassle educational finance."
    }
];

const loanTypeBtns = document.querySelectorAll('.loan-type-btn');
const loanCaption = document.getElementById('loan-caption');

loanTypeBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
        loanTypeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loanCaption.textContent = loanTypes[idx].caption;
    });
});

// Amount Slider and Input
const amountSlider = document.getElementById('amountSlider');
const amountInput = document.getElementById('amountInput');
const amountWords = document.getElementById('amountWords');

function convertToWords(num) {
    if (num === 50000) return "Fifty Thousand";
    if (num >= 100000) return (num/100000) + " Lakh";
    return num.toString();
}

// Sync slider and input
amountSlider.addEventListener('input', () => {
    amountInput.value = amountSlider.value;
    amountWords.textContent = convertToWords(+amountSlider.value);
    calculateLoan();
});
amountInput.addEventListener('input', () => {
    let val = Math.min(Math.max(+amountInput.value, 50000), 500000);
    amountInput.value = val;
    amountSlider.value = val;
    amountWords.textContent = convertToWords(val);
    calculateLoan();
});

// Duration Switch
const durationBtns = document.querySelectorAll('.duration-btn');
let durationVal = 6;
let customDurationInput = null;

durationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        durationBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.months === 'custom') {
            // Add custom input if not present
            if (!customDurationInput) {
                customDurationInput = document.createElement('input');
                customDurationInput.type = 'number';
                customDurationInput.min = 1;
                customDurationInput.max = 360;
                customDurationInput.value = 6;
                customDurationInput.className = "custom-duration-input";
                customDurationInput.style.marginLeft = "0.7rem";
                btn.parentNode.appendChild(customDurationInput);
                customDurationInput.addEventListener('input', () => {
                    durationVal = parseInt(customDurationInput.value) || 1;
                    calculateLoan();
                });
            }
            durationVal = parseInt(customDurationInput.value) || 1;
        } else {
            durationVal = parseInt(btn.dataset.months);
            if (customDurationInput) {
                customDurationInput.parentNode.removeChild(customDurationInput);
                customDurationInput = null;
            }
        }
        calculateLoan();
    });
});

// Interest Rate Edit
const interestRateDisplay = document.getElementById('interestRateDisplay');
let interestRate = 11;

document.querySelector('.edit-rate').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'number';
    input.value = interestRate;
    input.min = 0;
    input.max = 50;
    input.style.width = "45px";
    interestRateDisplay.parentNode.replaceChild(input, interestRateDisplay);
    input.focus();

    input.addEventListener('blur', () => {
        interestRate = parseFloat(input.value) || 0;
        interestRateDisplay.textContent = interestRate;
        input.parentNode.replaceChild(interestRateDisplay, input);
        calculateLoan();
    });
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') input.blur();
    });
});

// Calculator formula - matches your image
function calculateLoan() {
    const principal = parseInt(amountInput.value) || 0;
    const rate = interestRate;
    const months = durationVal || 1;

    // Simple interest calculation: Total Interest = P * r * t / 12 / 100
    const totalInterest = Math.round(principal * rate * months / (12 * 100));
    // EMI (monthly) = (Principal + Total Interest) / months
    const emi = Math.round((principal + totalInterest) / months);

    document.getElementById('emiAmount').textContent = emi;
    document.getElementById('totalInterest').textContent = totalInterest;
    interestRateDisplay.textContent = rate;
}

calculateLoan();




// document.addEventListener('DOMContentLoaded', function() {
//       const cardContainer = document.querySelector('.card-container');
      
//       cardContainer.addEventListener('click', function() {
//         this.classList.toggle('flipped');
//       });
      
//       // Tilt effect based on mouse position
//       document.addEventListener('mousemove', function(e) {
//         if (cardContainer.classList.contains('flipped')) return;
        
//         const boundingRect = cardContainer.getBoundingClientRect();
//         const cardCenterX = boundingRect.left + boundingRect.width / 2;
//         const cardCenterY = boundingRect.top + boundingRect.height / 2;
        
//         const mouseX = e.clientX;
//         const mouseY = e.clientY;
        
//         const deltaX = (mouseX - cardCenterX) / (boundingRect.width / 2);
//         const deltaY = (mouseY - cardCenterY) / (boundingRect.height / 2);
        
//         const tiltX = deltaY * 10; // Tilt the card around the X axis
//         const tiltY = -deltaX * 1; // Tilt the card around the Y axis
        
//         cardContainer.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
//       });
      
//       // Reset card position when mouse leaves the container
//       document.addEventListener('mouseleave', function() {
//         if (!cardContainer.classList.contains('flipped')) {
//           cardContainer.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
//         }
//       });
      
//       // Create shining effect for tap animation
//       cardContainer.addEventListener('touchstart', function() {
//         const shine = document.querySelector('.shine');
//         shine.style.animation = 'none';
//         setTimeout(() => {
//           shine.style.animation = 'shine 5s infinite';
//         }, 10);
//       });
//     });

document.addEventListener('DOMContentLoaded', function() {
    const cardContainers = document.querySelectorAll('.card-container');

    cardContainers.forEach(cardContainer => {
        // Flip on click
        cardContainer.addEventListener('click', function() {
            this.classList.toggle('flipped');
            // Reset transform when flipped/unflipped
            if (this.classList.contains('flipped')) {
                this.style.transform = 'perspective(1000px) rotateY(180deg)';
            } else {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            }
        });

        // Tilt effect on mouse move relative to each card individually
        cardContainer.addEventListener('mousemove', function(e) {
            if (this.classList.contains('flipped')) return;

            const boundingRect = this.getBoundingClientRect();
            const cardCenterX = boundingRect.left + boundingRect.width / 2;
            const cardCenterY = boundingRect.top + boundingRect.height / 2;

            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const deltaX = (mouseX - cardCenterX) / (boundingRect.width / 2);
            const deltaY = (mouseY - cardCenterY) / (boundingRect.height / 2);

            const tiltX = deltaY * 10;  // Tilt card around X axis
            const tiltY = -deltaX * 10; // Tilt card around Y axis, increased for better effect
            
            this.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });

        // Reset tilt on mouse leave
        cardContainer.addEventListener('mouseleave', function() {
            if (!this.classList.contains('flipped')) {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            }
        });

        // Shine effect on touchstart (tap)
        cardContainer.addEventListener('touchstart', function() {
            const shine = this.querySelector('.shine');
            if (!shine) return;

            shine.style.animation = 'none';
            setTimeout(() => {
                shine.style.animation = 'shine 5s infinite';
            }, 10);
        });
    });
});
