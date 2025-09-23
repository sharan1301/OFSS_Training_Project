document.addEventListener('DOMContentLoaded', () => {
  const typesList = document.querySelectorAll('.investment-types-list li');
  const benefitsContent = document.getElementById('benefitsContent');

  const benefitsData = {
    mutualFunds: [
      {
        title: "Professional Management",
        caption: "Funds managed by experienced experts aiming for optimal growth."
      },
      {
        title: "Diversification",
        caption: "Risk minimization by investing in multiple asset classes."
      },
      {
        title: "Flexibility",
        caption: "Convenient investment plans including systematic SIPs."
      },
      {
        title: "Accessibility",
        caption: "Easy to start with low initial investment amounts."
      }
    ],
    stocksIPO: [
      {
        title: "Ownership in Companies",
        caption: "Direct stake in businesses along with potential dividends."
      },
      {
        title: "High Return Potential",
        caption: "Possibility of significant capital gains over time."
      },
      {
        title: "Early Investment via IPO",
        caption: "Opportunity to get in early on emerging ventures."
      }
    ],
    bonds: [
      {
        title: "Stable Income",
        caption: "Fixed interest returns over the bond tenure."
      },
      {
        title: "Lower Risk",
        caption: "Generally safer than stocks, suitable for steady portfolios."
      },
      {
        title: "Portfolio Balance",
        caption: "Helps offset risks from equity investments."
      }
    ],
    demat: [
      {
        title: "Secure Securities Holding",
        caption: "Digital safe-keeping of stocks and mutual fund units."
      },
      {
        title: "Facilitates Trading",
        caption: "Essential for buying and selling securities in electronic form."
      }
    ],
    govSchemes: [
      {
        title: "Guaranteed Returns",
        caption: "Backed by government security and low risk."
      },
      {
        title: "Tax Benefits",
        caption: "Eligible for exemptions and deductions under tax laws."
      },
      {
        title: "Long Term Wealth Creation",
        caption: "Designed to promote disciplined savings for future goals."
      }
    ],
    nps: [
      {
        title: "Flexible Asset Allocation",
        caption: "Choose mix of equities, corporate bonds and government securities."
      },
      {
        title: "Retirement Income",
        caption: "Regular pension benefits at retirement."
      },
      {
        title: "Tax Savings",
        caption: "Contributions eligible for tax deductions."
      }
    ]
  };

  function loadBenefits(typeId) {
    benefitsContent.innerHTML = '';
    const benefits = benefitsData[typeId];
    if (!benefits) {
      benefitsContent.textContent = "No information available.";
      return;
    }
    benefits.forEach(({ title, caption }) => {
      const div = document.createElement('div');
      div.className = 'benefit-item';
      div.innerHTML = `<div class="benefit-title">${title}</div><div class="benefit-caption">${caption}</div>`;
      benefitsContent.appendChild(div);
    });
  }

  // Initial load on page load (mutual funds default)
  loadBenefits('mutualFunds');

  typesList.forEach(li => {
    li.addEventListener('click', function () {
      typesList.forEach(item => item.classList.remove('active'));
      this.classList.add('active');
      const selectedType = this.getAttribute('data-id');
      loadBenefits(selectedType);
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
    // (other page JS...)

    // Investment "discover" tab data
    const discoverData = {
        start: [
            {
                title: '3-in-1 Account',
                desc: 'Invest, Grow and Save your funds',
                arrow: true
            },
            {
                title: 'IPO',
                desc: 'For Seamless IPO Investments',
                arrow: true
            },
            {
                title: 'Mutual Funds',
                desc: 'Market-linked investment with diversified portfolio and growth potential',
                arrow: true
            }
        ],
        tax: [
            { title: 'ELSS Funds', desc: 'Get tax benefits and long term returns', arrow: true },
            { title: 'PPF', desc: 'Safe government scheme with tax exemption', arrow: true },
            { title: 'NSC', desc: 'Small savings scheme with fixed return & tax benefit', arrow: true }
        ],
        retirement: [
            { title: 'NPS', desc: 'Low-cost retirement solution, tax benefits', arrow: true },
            { title: 'Pension Funds', desc: 'Build wealth for post-retirement needs', arrow: true },
            { title: 'Annuities', desc: 'Regular payouts after retirement', arrow: true }
        ],
        short: [
            { title: 'Short-term Bonds', desc: 'Stable income in 1-3 years', arrow: true },
            { title: 'Liquid Mutual Funds', desc: 'Instant withdrawal and low risk', arrow: true },
            { title: 'Recurring Deposit', desc: 'Save and earn moderate returns', arrow: true }
        ],
        long: [
            { title: 'Equity Mutual Funds', desc: 'Capital appreciation over long term', arrow: true },
            { title: 'Stocks', desc: 'Potential for high long-term returns', arrow: true },
            { title: 'Sukanya Samriddhi', desc: 'Long-term savings for girl child', arrow: true }
        ],
        
    };

    function renderDiscoverCards(tab) {
        const row = document.getElementById('discoverCardsRow');
        row.innerHTML = '';
        (discoverData[tab] || []).forEach(card => {
            const cardDiv = document.createElement('div');
            cardDiv.className = 'discover-card';
            cardDiv.innerHTML = `
                <div class="discover-card-title">${card.title} <span class="arrow">${card.arrow ? '↗' : ''}</span></div>
                <div class="discover-card-desc">${card.desc}</div>
                <div class="discover-card-actions">
                    <button>INVEST</button>
                    <button>DETAILS</button>
                </div>
            `;
            row.appendChild(cardDiv);
        });
    }

    // Tab interaction
    const tabs = document.querySelectorAll('.discover-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            tabs.forEach(el => el.classList.remove('active'));
            this.classList.add('active');
            renderDiscoverCards(this.getAttribute('data-tab'));
        });
    });

    // Load Start Investing by default
    renderDiscoverCards('start');
});
