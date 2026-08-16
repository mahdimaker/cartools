// Best Fuel Mileage SUV - Pure Vanilla JavaScript Application

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    currentVehicle: {
      name: 'Current Vehicle (20 MPG)',
      mpg: 20,
      annualMiles: 12000,
    },
    settings: {
      gasPricePerGallon: 3.50,
      electricityPricePerKwh: 0.15,
      ownershipYears: 5,
      loanInterestRatePercent: 5.5,
    },
    filters: {
      searchQuery: '',
      powertrain: 'All',
      category: 'All',
      maxPrice: 100000,
      minMpg: 0,
      sortBy: 'savings',
      seats: 'All',
    },
    comparedIds: ['toyota-rav4-hybrid', 'kia-niro-hybrid', 'tesla-model-y'],
    viewMode: 'grid', // 'grid' | 'table'
    visibleLimit: 12, // Progressive loading limit
    activeLeagueTab: 'top-overall',
    expandedLeagueId: null,
    inspectSuvId: null,
    isSettingsModalOpen: false,
    isCompareModalOpen: false,
    isMobileMenuOpen: false,
    openFaqIds: {
      'faq-1': true,
      'faq-2': false,
      'faq-3': false,
      'faq-4': false,
      'faq-5': false,
    },
  };

  // Helper references
  const { calculateAnnualCost, calculateAnnualSavings, calculateCO2SavingsTons, formatCurrency, formatNumber } = window.CalculatorUtils;
  const SUVS = window.TOP_50_SUVS || [];

  // --- DOM ELEMENTS ---
  const elements = {
    // Top Parameters (Desktop & Header)
    baselineMpgVal: document.getElementById('baseline-mpg-val'),
    baselineMpgSlider: document.getElementById('baseline-mpg-slider'),
    annualMilesVal: document.getElementById('annual-miles-val'),
    annualMilesSlider: document.getElementById('annual-miles-slider'),
    gasPriceBadge: document.getElementById('gas-price-badge'),
    horizonBadge: document.getElementById('horizon-badge'),
    compareBtnBadge: document.getElementById('compare-btn-badge'),
    openCompareBtn: document.getElementById('open-compare-btn'),
    openSettingsBtn: document.getElementById('open-settings-btn'),
    
    // Sticky Mobile Bar
    mobileMpgSlider: document.getElementById('mobile-mpg-slider'),
    mobileMpgVal: document.getElementById('mobile-mpg-val'),
    mobileMilesSlider: document.getElementById('mobile-miles-slider'),
    mobileMilesVal: document.getElementById('mobile-miles-val'),
    mobileSettingsBtn: document.getElementById('mobile-settings-btn'),
    mobileCompareBtn: document.getElementById('mobile-compare-btn'),
    mobileCompareBadge: document.getElementById('mobile-compare-badge'),
    mobileCurrentCarSummary: document.getElementById('mobile-current-car-summary'),

    // Search & Filters
    searchInput: document.getElementById('search-input'),
    powertrainSelect: document.getElementById('powertrain-select'),
    categorySelect: document.getElementById('category-select'),
    sortBySelect: document.getElementById('sort-by-select'),
    showingCount: document.getElementById('showing-count'),
    pillsContainer: document.getElementById('quick-pills-container'),
    viewGridBtn: document.getElementById('view-grid-btn'),
    viewTableBtn: document.getElementById('view-table-btn'),
    
    // Content Containers
    gridContainer: document.getElementById('suv-grid-container'),
    tableContainer: document.getElementById('suv-table-container'),
    gridLoadMoreContainer: document.getElementById('grid-load-more-container'),
    leagueListContainer: document.getElementById('league-list-container'),
    leagueTabsContainer: document.getElementById('league-tabs-container'),
    leagueCountBadge: document.getElementById('league-count-badge'),

    // Detail Modal
    detailModal: document.getElementById('detail-modal'),
    detailModalBody: document.getElementById('detail-modal-body'),
    closeDetailBtn: document.getElementById('close-detail-btn'),

    // Compare Drawer / Modal
    compareModal: document.getElementById('compare-modal'),
    compareModalBody: document.getElementById('compare-modal-body'),
    closeCompareBtn: document.getElementById('close-compare-btn'),
    clearCompareBtn: document.getElementById('clear-compare-btn'),
    compareModalBaselineNote: document.getElementById('compare-baseline-note'),

    // Settings Modal
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsBtn: document.getElementById('close-settings-btn'),
    applySettingsBtn: document.getElementById('apply-settings-btn'),
    resetSettingsBtn: document.getElementById('reset-settings-btn'),
    settingsGasPriceSlider: document.getElementById('settings-gas-slider'),
    settingsGasPriceVal: document.getElementById('settings-gas-val'),
    settingsElectricSlider: document.getElementById('settings-electric-slider'),
    settingsElectricVal: document.getElementById('settings-electric-val'),
    settingsYearsContainer: document.getElementById('settings-years-container'),
    
    // Mobile Nav Menu
    mobileMenu: document.getElementById('mobile-nav-menu'),
    mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
    mobileMenuClose: document.getElementById('mobile-menu-close'),
  };

  // --- INITIALIZATION ---
  function init() {
    setupEventListeners();
    renderAll();
  }

  // --- CORE RENDER FUNCTION ---
  function renderAll() {
    renderStickyParameters();
    renderRankingsGrid();
    renderLeagueTable();
    renderCompareDrawer();
    renderSettingsModal();
    renderFAQ();
    
    // Initialize Lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // --- RENDER STICKY PARAMETERS ---
  function renderStickyParameters() {
    if (elements.baselineMpgVal) elements.baselineMpgVal.textContent = `${state.currentVehicle.mpg} MPG`;
    if (elements.baselineMpgSlider) elements.baselineMpgSlider.value = state.currentVehicle.mpg;
    if (elements.annualMilesVal) elements.annualMilesVal.textContent = `${formatNumber(state.currentVehicle.annualMiles)} mi/yr`;
    if (elements.annualMilesSlider) elements.annualMilesSlider.value = state.currentVehicle.annualMiles;
    if (elements.gasPriceBadge) elements.gasPriceBadge.textContent = `$${state.settings.gasPricePerGallon.toFixed(2)}/gal`;
    if (elements.horizonBadge) elements.horizonBadge.textContent = `${state.settings.ownershipYears} Yrs`;
    if (elements.compareBtnBadge) elements.compareBtnBadge.textContent = state.comparedIds.length;

    // Mobile
    if (elements.mobileMpgVal) elements.mobileMpgVal.textContent = `${state.currentVehicle.mpg} MPG`;
    if (elements.mobileMpgSlider) elements.mobileMpgSlider.value = state.currentVehicle.mpg;
    if (elements.mobileMilesVal) elements.mobileMilesVal.textContent = `${(state.currentVehicle.annualMiles / 1000).toFixed(0)}k mi/yr`;
    if (elements.mobileMilesSlider) elements.mobileMilesSlider.value = state.currentVehicle.annualMiles;
    if (elements.mobileCompareBadge) elements.mobileCompareBadge.textContent = state.comparedIds.length;
    if (elements.mobileCurrentCarSummary) {
      elements.mobileCurrentCarSummary.textContent = `Baseline: $${state.settings.gasPricePerGallon.toFixed(2)}/gal (${state.settings.ownershipYears} Yrs)`;
    }
  }

  // --- FILTER & PROCESS SUVS ---
  function getProcessedSuvs() {
    const currentAnnualFuelCost = (state.currentVehicle.annualMiles / Math.max(1, state.currentVehicle.mpg)) * state.settings.gasPricePerGallon;
    const currentHorizonFuelCost = currentAnnualFuelCost * state.settings.ownershipYears;

    return SUVS
      .map((suv) => {
        const savings = calculateAnnualSavings(suv, state.currentVehicle, state.settings);
        const suvAnnualCost = calculateAnnualCost(
          suv.mpgCombined,
          suv.powertrain,
          state.currentVehicle.annualMiles,
          state.settings.gasPricePerGallon,
          state.settings.electricityPricePerKwh
        );
        const suvHorizonCost = suvAnnualCost * state.settings.ownershipYears;
        const netHorizonSavings = Math.max(0, currentHorizonFuelCost - suvHorizonCost);

        return { suv, savings, suvAnnualCost, suvHorizonCost, netHorizonSavings };
      })
      .filter(({ suv }) => {
        // Search
        if (state.filters.searchQuery.trim() !== '') {
          const q = state.filters.searchQuery.toLowerCase();
          const matchName = suv.name.toLowerCase().includes(q);
          const matchBrand = suv.brand.toLowerCase().includes(q);
          const matchCategory = suv.category.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchCategory) return false;
        }

        // Powertrain
        if (state.filters.powertrain !== 'All' && suv.powertrain !== state.filters.powertrain) return false;

        // Category
        if (state.filters.category !== 'All' && suv.category !== state.filters.category) return false;

        // Max Price
        if (suv.msrp > state.filters.maxPrice) return false;

        // Seats
        if (state.filters.seats === '5' && suv.seatingCapacity !== 5) return false;
        if (state.filters.seats === '7' && suv.seatingCapacity < 7) return false;

        return true;
      })
      .sort((a, b) => {
        if (state.filters.sortBy === 'savings') return b.savings - a.savings;
        if (state.filters.sortBy === 'mpg') return b.suv.mpgCombined - a.suv.mpgCombined;
        if (state.filters.sortBy === 'priceAsc') return a.suv.msrp - b.suv.msrp;
        if (state.filters.sortBy === 'priceDesc') return b.suv.msrp - a.suv.msrp;
        if (state.filters.sortBy === 'score') return b.suv.overallScore - a.suv.overallScore;
        if (state.filters.sortBy === 'rank') return a.suv.usSalesRank - b.suv.usSalesRank;
        return 0;
      });
  }

  // --- RENDER RANKINGS (GRID & TABLE) ---
  function renderRankingsGrid() {
    const processedSuvs = getProcessedSuvs();
    const totalMatches = processedSuvs.length;
    const currentAnnualFuelCost = (state.currentVehicle.annualMiles / Math.max(1, state.currentVehicle.mpg)) * state.settings.gasPricePerGallon;
    const currentHorizonFuelCost = currentAnnualFuelCost * state.settings.ownershipYears;

    const visibleSuvs = state.viewMode === 'grid' ? processedSuvs.slice(0, state.visibleLimit) : processedSuvs;

    if (elements.showingCount) {
      elements.showingCount.textContent = state.viewMode === 'grid' ? Math.min(visibleSuvs.length, totalMatches) : totalMatches;
    }

    // Toggle view buttons
    if (elements.viewGridBtn && elements.viewTableBtn) {
      if (state.viewMode === 'grid') {
        elements.viewGridBtn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-white text-slate-900 shadow-xs';
        elements.viewTableBtn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-600 hover:text-slate-900';
        elements.gridContainer.classList.remove('hidden');
        elements.tableContainer.classList.add('hidden');
      } else {
        elements.viewGridBtn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-slate-600 hover:text-slate-900';
        elements.viewTableBtn.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer bg-white text-slate-900 shadow-xs';
        elements.gridContainer.classList.add('hidden');
        elements.tableContainer.classList.remove('hidden');
      }
    }

    // Render Quick Pills
    if (elements.pillsContainer) {
      const pills = ['All', 'Hybrid', 'Plug-in Hybrid', 'Full EV', 'Gas'];
      let pillsHtml = '';
      pills.forEach((p) => {
        const isActive = state.filters.powertrain === p;
        pillsHtml += `
          <button
            data-action="filter-powertrain"
            data-value="${p}"
            class="px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isActive ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-100 hover:border-slate-300'
            }"
          >
            ${p}
          </button>
        `;
      });

      // Under $35k pill
      const isUnder35k = state.filters.maxPrice === 35000;
      pillsHtml += `
        <button
          data-action="filter-price-35k"
          class="px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            isUnder35k ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-100 hover:border-slate-300'
          }"
        >
          Under $35k MSRP
        </button>
      `;

      // 7-Passenger pill
      const is7Seats = state.filters.seats === '7';
      pillsHtml += `
        <button
          data-action="filter-seats-7"
          class="px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            is7Seats ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-100 hover:border-slate-300'
          }"
        >
          7-Passenger (3-Row)
        </button>
      `;

      elements.pillsContainer.innerHTML = pillsHtml;
    }

    // Render Grid Cards
    if (elements.gridContainer && state.viewMode === 'grid') {
      if (totalMatches === 0) {
        elements.gridContainer.innerHTML = `
          <div class="col-span-full py-16 text-center text-slate-500">
            <i data-lucide="search-x" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
            <p class="font-bold text-slate-800 text-base">No SUVs found matching your criteria</p>
            <p class="text-xs mt-1">Try relaxing your search or reset filter pills above.</p>
          </div>
        `;
      } else {
        let gridHtml = '';
        visibleSuvs.forEach(({ suv, savings, suvHorizonCost, netHorizonSavings }) => {
          const isCompared = state.comparedIds.includes(suv.id);
          const maxCost = Math.max(currentHorizonFuelCost, suvHorizonCost, 1);
          const currentBarPct = Math.min(100, Math.round((currentHorizonFuelCost / maxCost) * 100));
          const suvBarPct = Math.min(100, Math.round((suvHorizonCost / maxCost) * 100));

          const badgeColor =
            suv.powertrain === 'Full EV'
              ? 'bg-teal-600'
              : suv.powertrain === 'Plug-in Hybrid'
              ? 'bg-blue-600'
              : suv.powertrain === 'Hybrid'
              ? 'bg-emerald-600'
              : 'bg-slate-700';

          gridHtml += `
            <div
              id="suv-card-${suv.id}"
              class="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group scroll-mt-24"
            >
              <div>
                <!-- Image Header -->
                <div class="h-48 overflow-hidden relative">
                  <img
                    src="${suv.imageUrl}"
                    alt="${suv.name} - ${suv.powertrain} SUV fuel economy"
                    loading="lazy"
                    decoding="async"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                  
                  <!-- Badges -->
                  <div class="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span class="bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-slate-700">
                      #${suv.usSalesRank} US Sales
                    </span>
                    <span class="text-[11px] font-extrabold px-2.5 py-1 rounded-md text-white ${badgeColor}">
                      ${suv.powertrain}
                    </span>
                  </div>

                  <!-- Price & MPG -->
                  <div class="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <span class="bg-white/95 backdrop-blur-md text-slate-900 font-extrabold px-2.5 py-1 rounded-lg text-xs">
                      ${formatCurrency(suv.msrp)} MSRP
                    </span>
                    <span class="bg-slate-900/90 text-emerald-400 font-extrabold px-2.5 py-1 rounded-lg text-xs border border-slate-700">
                      ${suv.mpgCombined} ${suv.powertrain === 'Full EV' ? 'MPGe' : 'MPG'}
                    </span>
                  </div>
                </div>

                <!-- Body Content -->
                <div class="p-5">
                  <div class="flex justify-between items-start gap-2 mb-1">
                    <h3 class="font-bold text-slate-900 text-lg leading-snug group-hover:text-emerald-600 transition-colors">
                      ${suv.name}
                    </h3>
                    <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-xs font-bold shrink-0">
                      ${suv.overallScore}/10 ★
                    </span>
                  </div>

                  <p class="text-xs text-slate-500 line-clamp-2 mb-3 font-normal">
                    ${suv.tagline}
                  </p>

                  <!-- Fuel Spend Box -->
                  <div class="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/80 mb-4 space-y-2.5">
                    <div class="flex items-center justify-between">
                      <span class="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                        <i data-lucide="fuel" class="w-3.5 h-3.5 text-emerald-600 shrink-0"></i>
                        <span>Fuel Spend (${state.settings.ownershipYears} Yrs)</span>
                      </span>
                      <span class="text-xs font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300">
                        +${formatNumber(Math.round(netHorizonSavings))} Saved
                      </span>
                    </div>

                    <!-- Comparison Bars -->
                    <div class="space-y-1.5 pt-0.5">
                      <div>
                        <div class="flex justify-between text-[10px] font-medium text-slate-500 mb-0.5">
                          <span>Your Current Car (${state.currentVehicle.mpg} MPG)</span>
                          <span class="font-semibold text-amber-700">$${formatNumber(Math.round(currentHorizonFuelCost))}</span>
                        </div>
                        <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div class="bg-amber-500 h-full rounded-full transition-all duration-300" style="width: ${currentBarPct}%"></div>
                        </div>
                      </div>

                      <div>
                        <div class="flex justify-between text-[10px] font-medium text-slate-500 mb-0.5">
                          <span class="font-bold text-slate-800 truncate max-w-[170px]">${suv.name}</span>
                          <span class="font-bold text-emerald-700">$${formatNumber(Math.round(suvHorizonCost))}</span>
                        </div>
                        <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div class="bg-emerald-500 h-full rounded-full transition-all duration-300" style="width: ${suvBarPct}%"></div>
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-slate-500 font-medium">
                      <span>Annual savings: <strong class="text-emerald-700 font-bold">+${formatNumber(Math.round(savings))}/yr</strong></span>
                      <span>${suv.seatingCapacity} Seats • ${suv.cargoVolumeCuFt} cu ft</span>
                    </div>
                  </div>

                  <!-- Quick Specs -->
                  <div class="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium mb-2">
                    <div class="bg-slate-50 p-2 rounded-lg">
                      0-60 mph: <strong class="text-slate-900">${suv.acceleration0to60Sec}s</strong>
                    </div>
                    <div class="bg-slate-50 p-2 rounded-lg">
                      Drivetrain: <strong class="text-slate-900">${suv.drivetrain}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer Actions -->
              <div class="p-5 pt-0 flex gap-2">
                <button
                  data-action="inspect-suv"
                  data-suv-id="${suv.id}"
                  class="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>Full Specs</span>
                  <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </button>
                <button
                  data-action="toggle-compare"
                  data-suv-id="${suv.id}"
                  class="px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isCompared
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }"
                  title="Compare side-by-side"
                >
                  <i data-lucide="${isCompared ? 'check' : 'scale'}" class="w-4 h-4"></i>
                </button>
              </div>
            </div>
          `;
        });
        elements.gridContainer.innerHTML = gridHtml;
      }
    }

    // Render Dense Table
    if (elements.tableContainer && state.viewMode === 'table') {
      let tableHtml = `
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-900 text-white font-bold uppercase tracking-wider">
                <th class="py-3.5 px-4">SUV Model</th>
                <th class="py-3.5 px-4">Powertrain</th>
                <th class="py-3.5 px-4">MSRP</th>
                <th class="py-3.5 px-4">MPG / MPGe</th>
                <th class="py-3.5 px-4">Annual Savings</th>
                <th class="py-3.5 px-4 min-w-[210px]">Fuel Spend Comparison (${state.settings.ownershipYears} Yrs)</th>
                <th class="py-3.5 px-4">Seats & Trunk</th>
                <th class="py-3.5 px-4 text-center">Score</th>
                <th class="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
      `;

      processedSuvs.forEach(({ suv, savings, suvHorizonCost, netHorizonSavings }) => {
        const isCompared = state.comparedIds.includes(suv.id);
        const maxCost = Math.max(currentHorizonFuelCost, suvHorizonCost, 1);
        const suvBarPct = Math.min(100, Math.round((suvHorizonCost / maxCost) * 100));

        tableHtml += `
          <tr class="hover:bg-slate-50/80 transition-colors">
            <td class="py-3 px-4 font-bold text-slate-900 flex items-center gap-3">
              <img
                src="${suv.imageUrl}"
                alt="${suv.name} thumbnail"
                loading="lazy"
                decoding="async"
                class="w-10 h-8 rounded-lg object-cover shrink-0"
              />
              <div>
                <div>${suv.name}</div>
                <div class="text-[10px] text-slate-400 font-normal">${suv.category} SUV</div>
              </div>
            </td>
            <td class="py-3 px-4">
              <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                ${suv.powertrain}
              </span>
            </td>
            <td class="py-3 px-4 font-bold text-slate-900">${formatCurrency(suv.msrp)}</td>
            <td class="py-3 px-4">
              <span class="font-extrabold text-emerald-600">
                ${suv.mpgCombined} ${suv.powertrain === 'Full EV' ? 'MPGe' : 'MPG'}
              </span>
            </td>
            <td class="py-3 px-4 font-extrabold text-emerald-600">
              +${formatCurrency(savings)} / yr
            </td>
            <td class="py-3 px-4">
              <div class="space-y-1">
                <div class="flex items-center justify-between text-[11px] font-bold">
                  <span class="text-slate-800">$${formatNumber(Math.round(suvHorizonCost))} <span class="text-[10px] font-normal text-slate-400">spend</span></span>
                  <span class="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    +$${formatNumber(Math.round(netHorizonSavings))}
                  </span>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div class="bg-emerald-500 h-full rounded-full" style="width: ${suvBarPct}%"></div>
                </div>
                <div class="text-[10px] text-slate-400">
                  vs $${formatNumber(Math.round(currentHorizonFuelCost))} current car
                </div>
              </div>
            </td>
            <td class="py-3 px-4">${suv.seatingCapacity} Seats • ${suv.cargoVolumeCuFt} cu ft</td>
            <td class="py-3 px-4 text-center font-bold text-slate-900">${suv.overallScore}</td>
            <td class="py-3 px-4 text-right space-x-2">
              <button
                data-action="inspect-suv"
                data-suv-id="${suv.id}"
                class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold cursor-pointer"
              >
                Details
              </button>
              <button
                data-action="toggle-compare"
                data-suv-id="${suv.id}"
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer border ${
                  isCompared ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-700'
                }"
              >
                ${isCompared ? 'Added' : 'Compare'}
              </button>
            </td>
          </tr>
        `;
      });

      tableHtml += `
            </tbody>
          </table>
        </div>
      `;

      elements.tableContainer.innerHTML = tableHtml;
    }

    // Render Load More Controls
    if (elements.gridLoadMoreContainer) {
      if (state.viewMode === 'grid' && totalMatches > visibleSuvs.length) {
        const remaining = totalMatches - visibleSuvs.length;
        const batchSize = Math.min(12, remaining);
        const pct = Math.round((visibleSuvs.length / totalMatches) * 100);
        elements.gridLoadMoreContainer.innerHTML = `
          <div class="flex flex-col items-center gap-3 text-center w-full max-w-md mx-auto py-2">
            <div class="text-xs font-bold text-slate-500">
              Showing <strong class="text-slate-900 font-extrabold">${visibleSuvs.length}</strong> of <strong class="text-slate-900 font-extrabold">${totalMatches}</strong> SUVs (${pct}%)
            </div>
            <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div class="bg-emerald-600 h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
            </div>
            <div class="flex items-center gap-2.5 w-full pt-1">
              <button
                data-action="load-more-suvs"
                class="flex-1 py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <i data-lucide="chevron-down" class="w-4 h-4 text-emerald-400"></i>
                <span>Show ${batchSize} More SUVs</span>
              </button>
              <button
                data-action="show-all-suvs"
                class="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap border border-slate-200"
              >
                Show All (${totalMatches})
              </button>
            </div>
          </div>
        `;
      } else if (state.viewMode === 'grid' && totalMatches > 12 && visibleSuvs.length >= totalMatches) {
        elements.gridLoadMoreContainer.innerHTML = `
          <div class="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 py-3 px-4 bg-slate-100/80 rounded-2xl border border-slate-200/60 max-w-md mx-auto">
            <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
            <span>All <strong>${totalMatches}</strong> matching SUVs are loaded</span>
          </div>
        `;
      } else {
        elements.gridLoadMoreContainer.innerHTML = '';
      }
    }
  }

  // --- RENDER MOBILE LEAGUE TABLE ---
  function renderLeagueTable() {
    if (!elements.leagueListContainer) return;

    const tabs = [
      { id: 'top-overall', label: 'Top Savings', icon: 'trophy' },
      { id: 'best-value', label: 'Best Value', icon: 'tag' },
      { id: 'best-sellers', label: 'Best Sellers', icon: 'trending-up' },
      { id: 'hybrids-gas', label: 'Gas & Hybrids', icon: 'fuel' },
      { id: 'evs', label: 'Full EVs', icon: 'zap' },
      { id: 'family-3row', label: '3-Row Family', icon: 'users' },
    ];

    // Render Tabs
    if (elements.leagueTabsContainer) {
      let tabsHtml = '';
      tabs.forEach((tab) => {
        const isActive = state.activeLeagueTab === tab.id;
        tabsHtml += `
          <button
            data-action="league-tab"
            data-tab-id="${tab.id}"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              isActive
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }"
          >
            <i data-lucide="${tab.icon}" class="w-3.5 h-3.5"></i>
            <span>${tab.label}</span>
          </button>
        `;
      });
      elements.leagueTabsContainer.innerHTML = tabsHtml;
    }

    // Filter items based on active tab
    let filtered = SUVS.map((suv) => {
      const savings = calculateAnnualSavings(suv, state.currentVehicle, state.settings);
      const suvAnnualCost = calculateAnnualCost(
        suv.mpgCombined,
        suv.powertrain,
        state.currentVehicle.annualMiles,
        state.settings.gasPricePerGallon,
        state.settings.electricityPricePerKwh
      );
      const totalHorizonSavings = savings * state.settings.ownershipYears;
      return { suv, savings, suvAnnualCost, totalHorizonSavings };
    });

    if (state.activeLeagueTab === 'top-overall') {
      filtered.sort((a, b) => b.savings - a.savings);
    } else if (state.activeLeagueTab === 'best-value') {
      filtered = filtered.filter((i) => i.suv.msrp <= 35000).sort((a, b) => b.savings - a.savings);
    } else if (state.activeLeagueTab === 'best-sellers') {
      filtered.sort((a, b) => a.suv.usSalesRank - b.suv.usSalesRank);
    } else if (state.activeLeagueTab === 'hybrids-gas') {
      filtered = filtered.filter((i) => i.suv.powertrain === 'Hybrid' || i.suv.powertrain === 'Gas').sort((a, b) => b.savings - a.savings);
    } else if (state.activeLeagueTab === 'evs') {
      filtered = filtered.filter((i) => i.suv.powertrain === 'Full EV' || i.suv.powertrain === 'Plug-in Hybrid').sort((a, b) => b.savings - a.savings);
    } else if (state.activeLeagueTab === 'family-3row') {
      filtered = filtered.filter((i) => i.suv.seatingCapacity >= 7).sort((a, b) => b.savings - a.savings);
    }

    if (elements.leagueCountBadge) {
      elements.leagueCountBadge.textContent = `Top ${Math.min(15, filtered.length)} of ${SUVS.length}`;
    }

    const currentAnnualFuelCost = (state.currentVehicle.annualMiles / Math.max(1, state.currentVehicle.mpg)) * state.settings.gasPricePerGallon;
    const currentHorizonCost = currentAnnualFuelCost * state.settings.ownershipYears;

    let rowsHtml = '';
    filtered.slice(0, 15).forEach(({ suv, savings, suvAnnualCost, totalHorizonSavings }, index) => {
      const isExpanded = state.expandedLeagueId === suv.id;
      const rank = index + 1;
      const rankBadgeClass =
        rank === 1
          ? 'bg-amber-400 text-amber-950 font-black'
          : rank === 2
          ? 'bg-slate-200 text-slate-900 font-black'
          : rank === 3
          ? 'bg-amber-600 text-white font-black'
          : 'bg-slate-900/85 text-white font-bold';

      const suvHorizonCost = suvAnnualCost * state.settings.ownershipYears;
      const maxCost = Math.max(currentHorizonCost, suvHorizonCost, 1);
      const currentBarPct = Math.min(100, Math.round((currentHorizonCost / maxCost) * 100));
      const suvBarPct = Math.min(100, Math.round((suvHorizonCost / maxCost) * 100));

      rowsHtml += `
        <div
          class="bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
            isExpanded ? 'border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20' : 'border-slate-200/90 shadow-xs hover:border-slate-300'
          }"
        >
          <div
            data-action="toggle-league-accordion"
            data-suv-id="${suv.id}"
            class="p-3 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
          >
            <!-- Left: Rank & Car Info -->
            <div class="flex items-center gap-3 min-w-0">
              <div class="relative w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 shadow-xs">
                <img
                  src="${suv.imageUrl}"
                  alt="${suv.name}"
                  loading="lazy"
                  decoding="async"
                  class="w-full h-full object-cover"
                />
                <span class="absolute top-0 left-0 px-2 py-0.5 rounded-tl-xl rounded-br-lg flex items-center justify-center text-[10px] sm:text-xs leading-none shadow-xs backdrop-blur-2xs ${rankBadgeClass}">
                  ${rank}
                </span>
              </div>
              <div class="min-w-0 flex flex-col justify-center space-y-1">
                <div class="font-bold text-slate-900 text-xs sm:text-sm tracking-tight truncate">
                  ${suv.name}
                </div>
                <div class="text-[11px] font-semibold text-slate-700">
                  ${formatCurrency(suv.msrp)}
                </div>
                <div>
                  <span class="inline-block px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px] tracking-wide">
                    ${suv.powertrain}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: MPG & Savings -->
            <div class="flex items-center gap-2 sm:gap-3 shrink-0">
              <div class="text-right space-y-0.5">
                <div class="text-sm sm:text-base font-black text-emerald-600 tracking-tight">
                  +${formatCurrency(savings)}<span class="text-[10px] sm:text-xs font-bold text-emerald-700">/yr</span>
                </div>
                <div class="text-[10px] sm:text-xs font-bold text-amber-600">
                  ${suv.mpgCombined} ${suv.powertrain === 'Full EV' ? 'MPGe' : 'MPG'}
                </div>
              </div>

              <div class="p-1 rounded-lg bg-slate-100 text-slate-500 transition-transform ${isExpanded ? 'rotate-180 bg-emerald-50 text-emerald-600' : ''}">
                <i data-lucide="chevron-down" class="w-4 h-4"></i>
              </div>
            </div>
          </div>

          <!-- Accordion Expanded Body -->
          ${
            isExpanded
              ? `
                <div class="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/60 space-y-3 animate-in fade-in duration-150">
                  <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="bg-white p-2.5 rounded-xl border border-slate-200/80">
                      <div class="text-[10px] text-slate-500 font-medium">${state.settings.ownershipYears}-Year Total Savings</div>
                      <div class="text-sm font-black text-emerald-700 mt-0.5">+${formatCurrency(totalHorizonSavings)}</div>
                    </div>
                    <div class="bg-white p-2.5 rounded-xl border border-slate-200/80">
                      <div class="text-[10px] text-slate-500 font-medium">Monthly Gas Savings</div>
                      <div class="text-sm font-black text-emerald-700 mt-0.5">+${formatCurrency(savings / 12)}/mo</div>
                    </div>
                  </div>

                  <!-- Fuel Cost Bar Comparison -->
                  <div class="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                    <div class="flex items-center justify-between text-[11px] font-bold text-slate-700">
                      <span>${state.settings.ownershipYears}-Yr Fuel Spend vs Current Car</span>
                    </div>

                    <div class="space-y-1.5">
                      <div>
                        <div class="flex justify-between text-[10px] text-slate-500 font-medium mb-0.5">
                          <span>Current (${state.currentVehicle.mpg} MPG)</span>
                          <span class="font-semibold text-amber-700">${formatCurrency(currentHorizonCost)}</span>
                        </div>
                        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div class="bg-amber-500 h-full rounded-full" style="width: ${currentBarPct}%"></div>
                        </div>
                      </div>

                      <div>
                        <div class="flex justify-between text-[10px] text-slate-500 font-medium mb-0.5">
                          <span class="font-bold text-slate-800">${suv.name}</span>
                          <span class="font-bold text-emerald-700">${formatCurrency(suvHorizonCost)}</span>
                        </div>
                        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div class="bg-emerald-500 h-full rounded-full" style="width: ${suvBarPct}%"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-2 pt-1">
                    <button
                      data-action="inspect-suv"
                      data-suv-id="${suv.id}"
                      class="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>View Full Specs</span>
                      <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                    </button>
                    <button
                      data-action="toggle-compare"
                      data-suv-id="${suv.id}"
                      class="px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        state.comparedIds.includes(suv.id)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }"
                    >
                      <i data-lucide="${state.comparedIds.includes(suv.id) ? 'check' : 'scale'}" class="w-4 h-4"></i>
                    </button>
                  </div>
                </div>
              `
              : ''
          }
        </div>
      `;
    });

    elements.leagueListContainer.innerHTML = rowsHtml;
  }

  // --- RENDER DETAIL MODAL ---
  function renderDetailModal() {
    if (!elements.detailModal || !elements.detailModalBody) return;

    if (!state.inspectSuvId) {
      elements.detailModal.classList.add('hidden');
      return;
    }

    const suv = SUVS.find((s) => s.id === state.inspectSuvId);
    if (!suv) {
      elements.detailModal.classList.add('hidden');
      return;
    }

    const annualSavings = calculateAnnualSavings(suv, state.currentVehicle, state.settings);
    const total5YearSavings = annualSavings * state.settings.ownershipYears;
    const co2SavedTons = calculateCO2SavingsTons(suv, state.currentVehicle, state.settings);
    const annualFuelCost = calculateAnnualCost(
      suv.mpgCombined,
      suv.powertrain,
      state.currentVehicle.annualMiles,
      state.settings.gasPricePerGallon,
      state.settings.electricityPricePerKwh
    );
    const isCompared = state.comparedIds.includes(suv.id);

    elements.detailModalBody.innerHTML = `
      <!-- Hero Image Header -->
      <div class="h-64 sm:h-80 relative">
        <img
          src="${suv.imageUrl}"
          alt="${suv.name}"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
        
        <div class="absolute bottom-6 left-6 right-6 text-white">
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <span class="px-2.5 py-1 rounded-md bg-emerald-500 text-slate-950 font-extrabold text-xs">
              ${suv.powertrain}
            </span>
            <span class="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 text-xs font-semibold">
              ${suv.category} SUV
            </span>
            <span class="px-2.5 py-1 rounded-md bg-white text-slate-900 font-extrabold text-xs">
              ${suv.overallScore}/10 Overall Rating
            </span>
          </div>

          <h2 class="text-2xl sm:text-4xl font-black text-white">${suv.name}</h2>
          <p class="text-slate-300 text-xs sm:text-sm font-normal mt-1">${suv.tagline}</p>
        </div>
      </div>

      <!-- Modal Content Body -->
      <div class="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
        
        <!-- Personalized Gas Savings Callout -->
        <div class="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div class="text-xs font-semibold text-emerald-400">
              Personalized Fuel Savings vs Your ${state.currentVehicle.mpg} MPG Car
            </div>
            <div class="text-2xl font-black text-white mt-0.5">
              Save ${formatCurrency(annualSavings)} / year
            </div>
            <p class="text-xs text-slate-300">
              Total ${state.settings.ownershipYears}-year savings: <strong class="text-emerald-400">${formatCurrency(total5YearSavings)}</strong>
            </p>
          </div>

          <button
            data-action="toggle-compare"
            data-suv-id="${suv.id}"
            class="hidden md:flex px-4 py-2.5 rounded-xl font-bold text-xs items-center gap-2 transition-all cursor-pointer ${
              isCompared
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }"
          >
            <i data-lucide="scale" class="w-4 h-4"></i>
            <span>${isCompared ? '✓ Added to Compare' : '+ Add to Compare'}</span>
          </button>
        </div>

        <!-- Key Specs Matrix -->
        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Official EPA Specs & Performance
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div class="text-[11px] font-semibold text-slate-500">Starting MSRP</div>
              <div class="text-sm font-black text-slate-900">${formatCurrency(suv.msrp)}</div>
            </div>

            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div class="text-[11px] font-semibold text-slate-500">Combined Mileage</div>
              <div class="text-sm font-black text-emerald-600">
                ${suv.mpgCombined} ${suv.powertrain === 'Full EV' ? 'MPGe' : 'MPG'}
              </div>
            </div>

            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div class="text-[11px] font-semibold text-slate-500">Annual Fuel Cost</div>
              <div class="text-sm font-black text-slate-900">${formatCurrency(annualFuelCost)}</div>
            </div>

            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div class="text-[11px] font-semibold text-slate-500">0-60 mph Speed</div>
              <div class="text-sm font-black text-slate-900">${suv.acceleration0to60Sec} sec</div>
            </div>

            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div class="text-[11px] font-semibold text-slate-500">Seating Capacity</div>
              <div class="text-sm font-black text-slate-900">${suv.seatingCapacity} Passengers</div>
            </div>

            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div class="text-[11px] font-semibold text-slate-500">Cargo Space</div>
              <div class="text-sm font-black text-slate-900">${suv.cargoVolumeCuFt} cu ft</div>
            </div>

            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div class="text-[11px] font-semibold text-slate-500">Drivetrain</div>
              <div class="text-sm font-black text-slate-900">${suv.drivetrain}</div>
            </div>

            <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div class="text-[11px] font-semibold text-slate-500">CO₂ Reduced</div>
              <div class="text-sm font-black text-emerald-600">${co2SavedTons} Tons / yr</div>
            </div>
          </div>
          <p class="text-[11px] text-slate-400 mt-2 italic">
            * Base MSRP and estimated savings are approximate. Check official manufacturer or authorized dealership resources for exact local pricing, packages, and incentives.
          </p>
        </div>

        <!-- Pros & Cons -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <h4 class="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
              Key Advantages
            </h4>
            <ul class="space-y-1.5 text-xs text-slate-700 font-medium">
              ${suv.pros.map((pro) => `<li class="flex items-start gap-1.5"><span class="text-emerald-600 font-bold">•</span><span>${pro}</span></li>`).join('')}
            </ul>
          </div>

          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i data-lucide="x-circle" class="w-4 h-4 text-slate-500"></i>
              Things to Consider
            </h4>
            <ul class="space-y-1.5 text-xs text-slate-600 font-medium">
              ${suv.cons.map((con) => `<li class="flex items-start gap-1.5"><span class="text-slate-400 font-bold">•</span><span>${con}</span></li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Standard Features -->
        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Standard Highlights
          </h3>
          <div class="flex flex-wrap gap-2">
            ${suv.keyFeatures.map((feat) => `
              <span class="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
                ✓ ${feat}
              </span>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    elements.detailModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  // --- RENDER COMPARE DRAWER / MODAL ---
  function renderCompareDrawer() {
    if (!elements.compareModal || !elements.compareModalBody) return;

    if (!state.isCompareModalOpen) {
      elements.compareModal.classList.add('hidden');
      return;
    }

    if (elements.compareModalBaselineNote) {
      elements.compareModalBaselineNote.textContent = `Comparing against your baseline ${state.currentVehicle.mpg} MPG vehicle (${formatNumber(state.currentVehicle.annualMiles)} mi/yr · $${state.settings.gasPricePerGallon.toFixed(2)}/gal)`;
    }

    const comparedSuvs = SUVS.filter((s) => state.comparedIds.includes(s.id));

    if (comparedSuvs.length === 0) {
      elements.compareModalBody.innerHTML = `
        <div class="text-center py-12 text-slate-500">
          <i data-lucide="scale" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
          <p class="font-bold text-slate-800 text-base">No SUVs selected for comparison</p>
          <p class="text-xs mt-1">Click "+ Add to Compare" on any SUV card to compare specs side-by-side.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      elements.compareModal.classList.remove('hidden');
      return;
    }

    // Ensure valid mobile comparison selections
    if (!state.mobileCompareLeftId || !state.comparedIds.includes(state.mobileCompareLeftId)) {
      state.mobileCompareLeftId = comparedSuvs[0] ? comparedSuvs[0].id : null;
    }
    if (!state.mobileCompareRightId || !state.comparedIds.includes(state.mobileCompareRightId)) {
      state.mobileCompareRightId = comparedSuvs[1] ? comparedSuvs[1].id : comparedSuvs[0] ? comparedSuvs[0].id : null;
    }

    const leftSuv = SUVS.find((s) => s.id === state.mobileCompareLeftId) || comparedSuvs[0];
    const rightSuv = SUVS.find((s) => s.id === state.mobileCompareRightId) || (comparedSuvs[1] || comparedSuvs[0]);

    // Calculate baseline costs
    const currentAnnualFuelCost = (state.currentVehicle.annualMiles / Math.max(1, state.currentVehicle.mpg)) * state.settings.gasPricePerGallon;
    const currentHorizonCost = currentAnnualFuelCost * state.settings.ownershipYears;

    // Mobile Head-to-Head calculations
    const leftSavings = calculateAnnualSavings(leftSuv, state.currentVehicle, state.settings);
    const leftHorizonSavings = leftSavings * state.settings.ownershipYears;
    const leftAnnualCost = calculateAnnualCost(leftSuv.mpgCombined, leftSuv.powertrain, state.currentVehicle.annualMiles, state.settings.gasPricePerGallon, state.settings.electricityPricePerKwh);
    const leftHorizonCost = leftAnnualCost * state.settings.ownershipYears;

    const rightSavings = calculateAnnualSavings(rightSuv, state.currentVehicle, state.settings);
    const rightHorizonSavings = rightSavings * state.settings.ownershipYears;
    const rightAnnualCost = calculateAnnualCost(rightSuv.mpgCombined, rightSuv.powertrain, state.currentVehicle.annualMiles, state.settings.gasPricePerGallon, state.settings.electricityPricePerKwh);
    const rightHorizonCost = rightAnnualCost * state.settings.ownershipYears;

    // Build Mobile Head-to-Head View (Pattern 1 + Pattern 2: Zero Horizontal Scroll)
    let mobileHtml = `
      <div class="block md:hidden space-y-4">
        
        <!-- Quick Switcher Bar (Car A vs Car B) -->
        <div class="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 space-y-3">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span class="flex items-center gap-1">
              <i data-lucide="split" class="w-3.5 h-3.5 text-emerald-400"></i>
              Head-to-Head Matchup
            </span>
            <span class="text-slate-400 font-mono">${comparedSuvs.length} in Compare List</span>
          </div>

          <!-- Selectors Grid (50 / 50 Split) -->
          <div class="grid grid-cols-2 gap-2 items-center relative">
            
            <!-- Left SUV Select -->
            <div class="space-y-1">
              <label class="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 block">Vehicle A</label>
              <select
                data-action="change-mobile-left-suv"
                class="w-full bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                ${comparedSuvs.map((s) => `
                  <option value="${s.id}" ${s.id === leftSuv.id ? 'selected' : ''}>${s.name} (${s.mpgCombined} MPG)</option>
                `).join('')}
              </select>
            </div>

            <!-- Swap Button in Center -->
            <div class="absolute left-1/2 -translate-x-1/2 top-6 z-10">
              <button
                data-action="swap-mobile-compare"
                class="w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg border border-slate-800 cursor-pointer"
                title="Swap Vehicles"
              >
                <i data-lucide="arrow-left-right" class="w-3.5 h-3.5"></i>
              </button>
            </div>

            <!-- Right SUV Select -->
            <div class="space-y-1 pl-2">
              <label class="text-[10px] uppercase tracking-wider font-extrabold text-blue-400 block text-right">Vehicle B</label>
              <select
                data-action="change-mobile-right-suv"
                class="w-full bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                ${comparedSuvs.map((s) => `
                  <option value="${s.id}" ${s.id === rightSuv.id ? 'selected' : ''}>${s.name} (${s.mpgCombined} MPG)</option>
                `).join('')}
              </select>
            </div>

          </div>

          <!-- Quick Vehicle Chips Bar (if > 2 compared) -->
          ${comparedSuvs.length > 2 ? `
            <div class="pt-2 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
              <span class="text-slate-500 font-semibold shrink-0">Quick Pick:</span>
              ${comparedSuvs.map((s) => `
                <button
                  data-action="quick-pick-mobile-suv"
                  data-suv-id="${s.id}"
                  class="px-2 py-1 rounded-lg shrink-0 font-bold cursor-pointer transition-colors ${
                    s.id === leftSuv.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : s.id === rightSuv.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                  }"
                >
                  ${s.name.split(' ')[0]} ${s.name.split(' ')[1] || ''}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Head-to-Head Vehicle Photos & Names Card -->
        <div class="grid grid-cols-2 gap-2.5">
          <!-- Left Vehicle Card Header -->
          <div class="bg-slate-50 rounded-2xl p-2.5 border border-slate-200 flex flex-col justify-between">
            <div>
              <div class="h-24 rounded-xl overflow-hidden mb-2 relative">
                <img src="${leftSuv.imageUrl}" alt="${leftSuv.name}" class="w-full h-full object-cover" />
                <span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/80 text-white font-bold text-[9px]">
                  #${leftSuv.usSalesRank} Sales
                </span>
              </div>
              <h3 class="font-extrabold text-slate-900 text-xs leading-tight mb-1">${leftSuv.name}</h3>
              <span class="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                ${leftSuv.powertrain}
              </span>
            </div>
            <div class="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
              <span class="text-slate-500 font-semibold">${leftSuv.overallScore}/10 ★</span>
              <button
                data-action="remove-compare-suv"
                data-suv-id="${leftSuv.id}"
                class="text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <i data-lucide="trash-2" class="w-3 h-3"></i>
                <span>Remove</span>
              </button>
            </div>
          </div>

          <!-- Right Vehicle Card Header -->
          <div class="bg-slate-50 rounded-2xl p-2.5 border border-slate-200 flex flex-col justify-between">
            <div>
              <div class="h-24 rounded-xl overflow-hidden mb-2 relative">
                <img src="${rightSuv.imageUrl}" alt="${rightSuv.name}" class="w-full h-full object-cover" />
                <span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/80 text-white font-bold text-[9px]">
                  #${rightSuv.usSalesRank} Sales
                </span>
              </div>
              <h3 class="font-extrabold text-slate-900 text-xs leading-tight mb-1">${rightSuv.name}</h3>
              <span class="inline-block px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[10px]">
                ${rightSuv.powertrain}
              </span>
            </div>
            <div class="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
              <span class="text-slate-500 font-semibold">${rightSuv.overallScore}/10 ★</span>
              <button
                data-action="remove-compare-suv"
                data-suv-id="${rightSuv.id}"
                class="text-red-500 hover:text-red-700 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <i data-lucide="trash-2" class="w-3 h-3"></i>
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== VERTICAL SPEC FEATURE CARDS (PATTERN 1) ==================== -->
        <div class="space-y-2.5">
          
          <!-- Spec 1: 5-Year Net Fuel Savings (Primary Metric) -->
          <div class="bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 rounded-2xl p-3.5 border border-emerald-200/80 shadow-xs">
            <div class="flex items-center justify-between text-xs font-bold text-emerald-950 mb-2">
              <span class="flex items-center gap-1.5">
                <i data-lucide="piggy-bank" class="w-4 h-4 text-emerald-600"></i>
                ${state.settings.ownershipYears}-Year Net Gas Savings
              </span>
              ${leftHorizonSavings !== rightHorizonSavings ? `
                <span class="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  ${leftHorizonSavings > rightHorizonSavings ? leftSuv.name.split(' ')[0] : rightSuv.name.split(' ')[0]} Wins (+$${formatNumber(Math.abs(Math.round(leftHorizonSavings - rightHorizonSavings)))})
                </span>
              ` : '<span class="text-[10px] text-slate-400 font-bold">Tie</span>'}
            </div>

            <div class="grid grid-cols-2 gap-2 text-center">
              <div class="p-2.5 rounded-xl ${leftHorizonSavings >= rightHorizonSavings ? 'bg-emerald-100/90 text-emerald-950 border border-emerald-300 font-black' : 'bg-slate-100 text-slate-700'}">
                <div class="text-[10px] font-medium text-slate-500 truncate mb-0.5">${leftSuv.name}</div>
                <div class="text-sm sm:text-base font-black text-emerald-700">+${formatCurrency(leftHorizonSavings)}</div>
                <div class="text-[10px] text-emerald-800 font-medium">+${formatCurrency(leftSavings)}/yr</div>
              </div>

              <div class="p-2.5 rounded-xl ${rightHorizonSavings >= leftHorizonSavings ? 'bg-emerald-100/90 text-emerald-950 border border-emerald-300 font-black' : 'bg-slate-100 text-slate-700'}">
                <div class="text-[10px] font-medium text-slate-500 truncate mb-0.5">${rightSuv.name}</div>
                <div class="text-sm sm:text-base font-black text-emerald-700">+${formatCurrency(rightHorizonSavings)}</div>
                <div class="text-[10px] text-emerald-800 font-medium">+${formatCurrency(rightSavings)}/yr</div>
              </div>
            </div>
          </div>

          <!-- Spec 2: Fuel Economy / EPA Rating -->
          <div class="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs">
            <div class="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span class="flex items-center gap-1.5">
                <i data-lucide="fuel" class="w-4 h-4 text-emerald-600"></i>
                Combined Fuel Economy
              </span>
              ${leftSuv.mpgCombined !== rightSuv.mpgCombined ? `
                <span class="text-[10px] font-bold text-emerald-700">
                  +${Math.abs(leftSuv.mpgCombined - rightSuv.mpgCombined)} ${leftSuv.powertrain === 'Full EV' || rightSuv.powertrain === 'Full EV' ? 'MPGe' : 'MPG'} Higher
                </span>
              ` : ''}
            </div>

            <div class="grid grid-cols-2 gap-2 text-center">
              <div class="p-2 rounded-xl ${leftSuv.mpgCombined >= rightSuv.mpgCombined ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}">
                <div class="text-[10px] text-slate-500 truncate mb-0.5">${leftSuv.name}</div>
                <div class="text-base font-extrabold text-emerald-700">${leftSuv.mpgCombined} <span class="text-xs font-bold">${leftSuv.powertrain === 'Full EV' ? 'MPGe' : 'MPG'}</span></div>
              </div>

              <div class="p-2 rounded-xl ${rightSuv.mpgCombined >= leftSuv.mpgCombined ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}">
                <div class="text-[10px] text-slate-500 truncate mb-0.5">${rightSuv.name}</div>
                <div class="text-base font-extrabold text-emerald-700">${rightSuv.mpgCombined} <span class="text-xs font-bold">${rightSuv.powertrain === 'Full EV' ? 'MPGe' : 'MPG'}</span></div>
              </div>
            </div>
          </div>

          <!-- Spec 3: Starting MSRP -->
          <div class="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs">
            <div class="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span class="flex items-center gap-1.5">
                <i data-lucide="tag" class="w-4 h-4 text-slate-600"></i>
                Starting MSRP
              </span>
              ${leftSuv.msrp !== rightSuv.msrp ? `
                <span class="text-[10px] font-bold text-emerald-700">
                  ${leftSuv.msrp < rightSuv.msrp ? leftSuv.name.split(' ')[0] : rightSuv.name.split(' ')[0]} is ${formatCurrency(Math.abs(leftSuv.msrp - rightSuv.msrp))} lower
                </span>
              ` : ''}
            </div>

            <div class="grid grid-cols-2 gap-2 text-center">
              <div class="p-2 rounded-xl ${leftSuv.msrp <= rightSuv.msrp ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}">
                <div class="text-[10px] text-slate-500 truncate mb-0.5">${leftSuv.name}</div>
                <div class="text-sm font-extrabold text-slate-900">${formatCurrency(leftSuv.msrp)}</div>
              </div>

              <div class="p-2 rounded-xl ${rightSuv.msrp <= leftSuv.msrp ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50'}">
                <div class="text-[10px] text-slate-500 truncate mb-0.5">${rightSuv.name}</div>
                <div class="text-sm font-extrabold text-slate-900">${formatCurrency(rightSuv.msrp)}</div>
              </div>
            </div>
          </div>

          <!-- Spec 4: Acceleration (0-60 mph) -->
          <div class="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs">
            <div class="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span class="flex items-center gap-1.5">
                <i data-lucide="gauge" class="w-4 h-4 text-slate-600"></i>
                0-60 mph Acceleration
              </span>
              ${leftSuv.acceleration0to60Sec !== rightSuv.acceleration0to60Sec ? `
                <span class="text-[10px] font-bold text-blue-600">
                  ${leftSuv.acceleration0to60Sec < rightSuv.acceleration0to60Sec ? leftSuv.name.split(' ')[0] : rightSuv.name.split(' ')[0]} is ${(Math.abs(leftSuv.acceleration0to60Sec - rightSuv.acceleration0to60Sec)).toFixed(1)}s quicker
                </span>
              ` : ''}
            </div>

            <div class="grid grid-cols-2 gap-2 text-center">
              <div class="p-2 rounded-xl ${leftSuv.acceleration0to60Sec <= rightSuv.acceleration0to60Sec ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'}">
                <div class="text-[10px] text-slate-500 truncate mb-0.5">${leftSuv.name}</div>
                <div class="text-sm font-extrabold text-slate-900">${leftSuv.acceleration0to60Sec} sec</div>
              </div>

              <div class="p-2 rounded-xl ${rightSuv.acceleration0to60Sec <= leftSuv.acceleration0to60Sec ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'}">
                <div class="text-[10px] text-slate-500 truncate mb-0.5">${rightSuv.name}</div>
                <div class="text-sm font-extrabold text-slate-900">${rightSuv.acceleration0to60Sec} sec</div>
              </div>
            </div>
          </div>

          <!-- Spec 5: Seating & Cargo Volume -->
          <div class="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs">
            <div class="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span class="flex items-center gap-1.5">
                <i data-lucide="package" class="w-4 h-4 text-slate-600"></i>
                Seating & Cargo Volume
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-center text-xs">
              <div class="p-2 rounded-xl bg-slate-50 space-y-1">
                <div class="text-[10px] text-slate-500 truncate">${leftSuv.name}</div>
                <div class="font-bold text-slate-900">${leftSuv.seatingCapacity} Passengers</div>
                <div class="text-[11px] font-semibold text-slate-600">${leftSuv.cargoVolumeCuFt} cu ft trunk</div>
              </div>

              <div class="p-2 rounded-xl bg-slate-50 space-y-1">
                <div class="text-[10px] text-slate-500 truncate">${rightSuv.name}</div>
                <div class="font-bold text-slate-900">${rightSuv.seatingCapacity} Passengers</div>
                <div class="text-[11px] font-semibold text-slate-600">${rightSuv.cargoVolumeCuFt} cu ft trunk</div>
              </div>
            </div>
          </div>

          <!-- Spec 6: Drivetrain & Overall Rating -->
          <div class="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs">
            <div class="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span class="flex items-center gap-1.5">
                <i data-lucide="shield-check" class="w-4 h-4 text-slate-600"></i>
                Drivetrain & Score
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-center text-xs">
              <div class="p-2 rounded-xl bg-slate-50 space-y-1">
                <div class="text-[10px] text-slate-500 truncate">${leftSuv.name}</div>
                <div class="font-bold text-slate-900">${leftSuv.drivetrain}</div>
                <div class="text-[11px] font-bold text-emerald-700">${leftSuv.overallScore} / 10 Rating</div>
              </div>

              <div class="p-2 rounded-xl bg-slate-50 space-y-1">
                <div class="text-[10px] text-slate-500 truncate">${rightSuv.name}</div>
                <div class="font-bold text-slate-900">${rightSuv.drivetrain}</div>
                <div class="text-[11px] font-bold text-emerald-700">${rightSuv.overallScore} / 10 Rating</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;

    // Desktop Multi-Column Table View (>= md)
    let desktopHtml = `
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr>
              <th class="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider w-36">
                Specs
              </th>
              ${comparedSuvs.map((suv) => `
                <th class="p-3 bg-white border-b border-slate-200 min-w-[200px]">
                  <div class="flex justify-between items-start gap-2">
                    <div class="font-bold text-slate-900 text-sm leading-tight">${suv.name}</div>
                    <button
                      data-action="remove-compare-suv"
                      data-suv-id="${suv.id}"
                      class="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                      title="Remove SUV"
                    >
                      <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                  </div>
                  <span class="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                    ${suv.powertrain}
                  </span>
                </th>
              `).join('')}
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
            <!-- Photo Row -->
            <tr>
              <td class="p-3 bg-slate-50 font-bold text-slate-800">Preview</td>
              ${comparedSuvs.map((suv) => `
                <td class="p-3">
                  <img src="${suv.imageUrl}" alt="${suv.name}" class="w-full h-28 object-cover rounded-xl" />
                </td>
              `).join('')}
            </tr>

            <!-- MSRP -->
            <tr>
              <td class="p-3 bg-slate-50 font-bold text-slate-800">MSRP</td>
              ${comparedSuvs.map((suv) => `
                <td class="p-3 font-bold text-slate-900 text-sm">
                  ${formatCurrency(suv.msrp)}
                </td>
              `).join('')}
            </tr>

            <!-- Fuel Economy -->
            <tr>
              <td class="p-3 bg-slate-50 font-bold text-slate-800">Fuel Economy</td>
              ${comparedSuvs.map((suv) => `
                <td class="p-3 font-extrabold text-emerald-600 text-sm">
                  ${suv.mpgCombined} ${suv.powertrain === 'Full EV' ? 'MPGe' : 'MPG'}
                </td>
              `).join('')}
            </tr>

            <!-- Annual Savings -->
            <tr class="bg-emerald-50/40">
              <td class="p-3 bg-emerald-100/50 font-bold text-emerald-900">Annual Savings</td>
              ${comparedSuvs.map((suv) => {
                const savings = calculateAnnualSavings(suv, state.currentVehicle, state.settings);
                return `
                  <td class="p-3 font-black text-emerald-700 text-sm">
                    +${formatCurrency(savings)} / yr
                  </td>
                `;
              }).join('')}
            </tr>

            <!-- 5-Year Total Savings -->
            <tr class="bg-emerald-50/60">
              <td class="p-3 bg-emerald-100/60 font-bold text-emerald-900">
                ${state.settings.ownershipYears}-Year Savings
              </td>
              ${comparedSuvs.map((suv) => {
                const savings = calculateAnnualSavings(suv, state.currentVehicle, state.settings);
                return `
                  <td class="p-3 font-black text-emerald-800 text-sm">
                    +${formatCurrency(savings * state.settings.ownershipYears)}
                  </td>
                `;
              }).join('')}
            </tr>

            <!-- 0-60 Speed -->
            <tr>
              <td class="p-3 bg-slate-50 font-bold text-slate-800">0-60 mph</td>
              ${comparedSuvs.map((suv) => `
                <td class="p-3">${suv.acceleration0to60Sec} sec</td>
              `).join('')}
            </tr>

            <!-- Seating -->
            <tr>
              <td class="p-3 bg-slate-50 font-bold text-slate-800">Seating</td>
              ${comparedSuvs.map((suv) => `
                <td class="p-3">${suv.seatingCapacity} Passengers</td>
              `).join('')}
            </tr>

            <!-- Cargo Volume -->
            <tr>
              <td class="p-3 bg-slate-50 font-bold text-slate-800">Cargo Volume</td>
              ${comparedSuvs.map((suv) => `
                <td class="p-3">${suv.cargoVolumeCuFt} cu ft</td>
              `).join('')}
            </tr>

            <!-- Drivetrain -->
            <tr>
              <td class="p-3 bg-slate-50 font-bold text-slate-800">Drivetrain</td>
              ${comparedSuvs.map((suv) => `
                <td class="p-3">${suv.drivetrain}</td>
              `).join('')}
            </tr>

            <!-- Overall Score -->
            <tr>
              <td class="p-3 bg-slate-50 font-bold text-slate-800">Overall Score</td>
              ${comparedSuvs.map((suv) => `
                <td class="p-3 font-bold text-slate-900">
                  ${suv.overallScore} / 10 ★
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    `;

    elements.compareModalBody.innerHTML = mobileHtml + desktopHtml;
    elements.compareModal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  }

  // --- RENDER SETTINGS MODAL ---
  function renderSettingsModal() {
    if (!elements.settingsModal) return;

    if (elements.settingsGasPriceVal) elements.settingsGasPriceVal.textContent = `$${state.settings.gasPricePerGallon.toFixed(2)}`;
    if (elements.settingsGasPriceSlider) elements.settingsGasPriceSlider.value = state.settings.gasPricePerGallon;
    if (elements.settingsElectricVal) elements.settingsElectricVal.textContent = `$${state.settings.electricityPricePerKwh.toFixed(2)}`;
    if (elements.settingsElectricSlider) elements.settingsElectricSlider.value = state.settings.electricityPricePerKwh;

    // Render Years Buttons
    if (elements.settingsYearsContainer) {
      const yearOptions = [3, 5, 7, 10];
      let yearsHtml = '';
      yearOptions.forEach((y) => {
        const isSelected = state.settings.ownershipYears === y;
        yearsHtml += `
          <button
            data-action="select-ownership-years"
            data-years="${y}"
            class="py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }"
          >
            ${y} Years
          </button>
        `;
      });
      elements.settingsYearsContainer.innerHTML = yearsHtml;
    }

    if (state.isSettingsModalOpen) {
      elements.settingsModal.classList.remove('hidden');
    } else {
      elements.settingsModal.classList.add('hidden');
    }
  }

  // --- RENDER FAQ ACCORDION ---
  function renderFAQ() {
    Object.keys(state.openFaqIds).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const isOpen = state.openFaqIds[id];
      const btn = el.querySelector('button');
      const iconWrap = el.querySelector('.faq-icon-wrap');
      const body = el.querySelector('.faq-body');

      if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (iconWrap) {
        if (isOpen) {
          iconWrap.classList.add('rotate-180', 'bg-emerald-50', 'text-emerald-600');
        } else {
          iconWrap.classList.remove('rotate-180', 'bg-emerald-50', 'text-emerald-600');
        }
      }
      if (body) {
        if (isOpen) {
          body.classList.remove('hidden');
        } else {
          body.classList.add('hidden');
        }
      }

      if (isOpen) {
        el.className = 'transition-all duration-200 rounded-2xl border bg-white shadow-sm ring-1 ring-emerald-500/20 border-emerald-500/40 overflow-hidden';
      } else {
        el.className = 'transition-all duration-200 rounded-2xl border bg-white shadow-xs border-slate-200/90 hover:border-slate-300 overflow-hidden';
      }
    });
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Sliders
    if (elements.baselineMpgSlider) {
      elements.baselineMpgSlider.addEventListener('input', (e) => {
        state.currentVehicle.mpg = Number(e.target.value);
        renderAll();
      });
    }

    if (elements.annualMilesSlider) {
      elements.annualMilesSlider.addEventListener('input', (e) => {
        state.currentVehicle.annualMiles = Number(e.target.value);
        renderAll();
      });
    }

    if (elements.mobileMpgSlider) {
      elements.mobileMpgSlider.addEventListener('input', (e) => {
        state.currentVehicle.mpg = Number(e.target.value);
        renderAll();
      });
    }

    if (elements.mobileMilesSlider) {
      elements.mobileMilesSlider.addEventListener('input', (e) => {
        state.currentVehicle.annualMiles = Number(e.target.value);
        renderAll();
      });
    }

    // Search input
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        state.filters.searchQuery = e.target.value;
        state.visibleLimit = 12;
        renderRankingsGrid();
        if (window.lucide) window.lucide.createIcons();
      });
    }

    // Select dropdowns
    if (elements.powertrainSelect) {
      elements.powertrainSelect.addEventListener('change', (e) => {
        state.filters.powertrain = e.target.value;
        state.visibleLimit = 12;
        renderRankingsGrid();
        if (window.lucide) window.lucide.createIcons();
      });
    }

    if (elements.categorySelect) {
      elements.categorySelect.addEventListener('change', (e) => {
        state.filters.category = e.target.value;
        state.visibleLimit = 12;
        renderRankingsGrid();
        if (window.lucide) window.lucide.createIcons();
      });
    }

    if (elements.sortBySelect) {
      elements.sortBySelect.addEventListener('change', (e) => {
        state.filters.sortBy = e.target.value;
        state.visibleLimit = 12;
        renderRankingsGrid();
        if (window.lucide) window.lucide.createIcons();
      });
    }

    // View mode toggles
    if (elements.viewGridBtn) {
      elements.viewGridBtn.addEventListener('click', () => {
        state.viewMode = 'grid';
        renderRankingsGrid();
        if (window.lucide) window.lucide.createIcons();
      });
    }

    if (elements.viewTableBtn) {
      elements.viewTableBtn.addEventListener('click', () => {
        state.viewMode = 'table';
        renderRankingsGrid();
        if (window.lucide) window.lucide.createIcons();
      });
    }

    // Compare Drawer triggers
    if (elements.openCompareBtn) {
      elements.openCompareBtn.addEventListener('click', () => {
        state.isCompareModalOpen = true;
        renderCompareDrawer();
      });
    }

    if (elements.mobileCompareBtn) {
      elements.mobileCompareBtn.addEventListener('click', () => {
        state.isCompareModalOpen = true;
        renderCompareDrawer();
      });
    }

    if (elements.closeCompareBtn) {
      elements.closeCompareBtn.addEventListener('click', () => {
        state.isCompareModalOpen = false;
        renderCompareDrawer();
      });
    }

    if (elements.clearCompareBtn) {
      elements.clearCompareBtn.addEventListener('click', () => {
        state.comparedIds = [];
        renderAll();
      });
    }

    // Settings Modal triggers
    if (elements.openSettingsBtn) {
      elements.openSettingsBtn.addEventListener('click', () => {
        state.isSettingsModalOpen = true;
        renderSettingsModal();
      });
    }

    if (elements.mobileSettingsBtn) {
      elements.mobileSettingsBtn.addEventListener('click', () => {
        state.isSettingsModalOpen = true;
        renderSettingsModal();
      });
    }

    if (elements.closeSettingsBtn) {
      elements.closeSettingsBtn.addEventListener('click', () => {
        state.isSettingsModalOpen = false;
        renderSettingsModal();
      });
    }

    if (elements.applySettingsBtn) {
      elements.applySettingsBtn.addEventListener('click', () => {
        state.isSettingsModalOpen = false;
        renderAll();
      });
    }

    if (elements.resetSettingsBtn) {
      elements.resetSettingsBtn.addEventListener('click', () => {
        state.settings.gasPricePerGallon = 3.50;
        state.settings.electricityPricePerKwh = 0.15;
        state.settings.ownershipYears = 5;
        state.isSettingsModalOpen = false;
        renderAll();
      });
    }

    if (elements.settingsGasPriceSlider) {
      elements.settingsGasPriceSlider.addEventListener('input', (e) => {
        state.settings.gasPricePerGallon = Number(e.target.value);
        if (elements.settingsGasPriceVal) elements.settingsGasPriceVal.textContent = `$${state.settings.gasPricePerGallon.toFixed(2)}`;
      });
    }

    if (elements.settingsElectricSlider) {
      elements.settingsElectricSlider.addEventListener('input', (e) => {
        state.settings.electricityPricePerKwh = Number(e.target.value);
        if (elements.settingsElectricVal) elements.settingsElectricVal.textContent = `$${state.settings.electricityPricePerKwh.toFixed(2)}`;
      });
    }

    // Detail Modal close
    if (elements.closeDetailBtn) {
      elements.closeDetailBtn.addEventListener('click', () => {
        state.inspectSuvId = null;
        renderDetailModal();
      });
    }

    // Mobile nav menu
    if (elements.mobileMenuToggle && elements.mobileMenu) {
      elements.mobileMenuToggle.addEventListener('click', () => {
        elements.mobileMenu.classList.remove('hidden');
      });
    }

    if (elements.mobileMenuClose && elements.mobileMenu) {
      elements.mobileMenuClose.addEventListener('click', () => {
        elements.mobileMenu.classList.add('hidden');
      });
    }

    // Delegated Global Click Handler
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.getAttribute('data-action');

      // Filter powertrain pill
      if (action === 'filter-powertrain') {
        const val = target.getAttribute('data-value');
        state.filters.powertrain = val;
        state.visibleLimit = 12;
        if (elements.powertrainSelect) elements.powertrainSelect.value = val;
        renderRankingsGrid();
        if (window.lucide) window.lucide.createIcons();
      }

      // Filter price 35k pill
      if (action === 'filter-price-35k') {
        state.filters.maxPrice = state.filters.maxPrice === 35000 ? 100000 : 35000;
        state.visibleLimit = 12;
        renderRankingsGrid();
        if (window.lucide) window.lucide.createIcons();
      }

      // Filter seats 7 pill
      if (action === 'filter-seats-7') {
        state.filters.seats = state.filters.seats === '7' ? 'All' : '7';
        state.visibleLimit = 12;
        renderRankingsGrid();
        if (window.lucide) window.lucide.createIcons();
      }

      // Load More SUVs (Progressive Loading)
      if (action === 'load-more-suvs') {
        state.visibleLimit += 12;
        renderRankingsGrid();
        if (window.lucide) window.lucide.createIcons();
      }

      // Show All SUVs
      if (action === 'show-all-suvs') {
        state.visibleLimit = 1000;
        renderRankingsGrid();
        if (window.lucide) window.lucide.createIcons();
      }

      // Gas price preset
      if (action === 'set-gas-preset') {
        const val = Number(target.getAttribute('data-val'));
        state.settings.gasPricePerGallon = val;
        renderSettingsModal();
      }

      // Electricity price preset
      if (action === 'set-electric-preset') {
        const val = Number(target.getAttribute('data-val'));
        state.settings.electricityPricePerKwh = val;
        renderSettingsModal();
      }

      // Ownership years
      if (action === 'select-ownership-years') {
        const years = Number(target.getAttribute('data-years'));
        state.settings.ownershipYears = years;
        renderSettingsModal();
      }

      // Inspect SUV Full Specs
      if (action === 'inspect-suv') {
        const suvId = target.getAttribute('data-suv-id');
        state.inspectSuvId = suvId;
        renderDetailModal();
      }

      // Toggle Compare
      if (action === 'toggle-compare') {
        const suvId = target.getAttribute('data-suv-id');
        if (state.comparedIds.includes(suvId)) {
          state.comparedIds = state.comparedIds.filter((id) => id !== suvId);
        } else {
          if (state.comparedIds.length >= 4) {
            alert('You can compare up to 4 SUVs at a time. Please remove one first.');
            return;
          }
          state.comparedIds.push(suvId);
        }
        renderAll();
      }

      // Remove Compare SUV
      if (action === 'remove-compare-suv') {
        const suvId = target.getAttribute('data-suv-id');
        state.comparedIds = state.comparedIds.filter((id) => id !== suvId);
        if (state.mobileCompareLeftId === suvId) state.mobileCompareLeftId = state.comparedIds[0] || null;
        if (state.mobileCompareRightId === suvId) state.mobileCompareRightId = state.comparedIds[1] || state.comparedIds[0] || null;
        renderAll();
      }

      // Swap Mobile Compare Left and Right
      if (action === 'swap-mobile-compare') {
        const temp = state.mobileCompareLeftId;
        state.mobileCompareLeftId = state.mobileCompareRightId;
        state.mobileCompareRightId = temp;
        renderCompareDrawer();
      }

      // Quick Pick Mobile SUV
      if (action === 'quick-pick-mobile-suv') {
        const suvId = target.getAttribute('data-suv-id');
        if (state.mobileCompareLeftId === suvId) {
          // already selected as left
        } else {
          state.mobileCompareRightId = suvId;
        }
        renderCompareDrawer();
      }

      // League Tab
      if (action === 'league-tab') {
        const tabId = target.getAttribute('data-tab-id');
        state.activeLeagueTab = tabId;
        state.expandedLeagueId = null;
        renderLeagueTable();
        if (window.lucide) window.lucide.createIcons();
      }

      // Toggle League Accordion Row
      if (action === 'toggle-league-accordion') {
        const suvId = target.getAttribute('data-suv-id');
        state.expandedLeagueId = state.expandedLeagueId === suvId ? null : suvId;
        renderLeagueTable();
        if (window.lucide) window.lucide.createIcons();
      }

      // Toggle FAQ
      if (action === 'toggle-faq') {
        const faqId = target.getAttribute('data-faq-id');
        state.openFaqIds[faqId] = !state.openFaqIds[faqId];
        renderFAQ();
      }
    });

    // Delegated Global Change Handler
    document.addEventListener('change', (e) => {
      const target = e.target;
      if (!target) return;

      const action = target.getAttribute('data-action');
      if (action === 'change-mobile-left-suv') {
        state.mobileCompareLeftId = target.value;
        renderCompareDrawer();
      } else if (action === 'change-mobile-right-suv') {
        state.mobileCompareRightId = target.value;
        renderCompareDrawer();
      }
    });

    // Close modals on background backdrop click
    if (elements.detailModal) {
      elements.detailModal.addEventListener('click', (e) => {
        if (e.target === elements.detailModal) {
          state.inspectSuvId = null;
          renderDetailModal();
        }
      });
    }

    if (elements.compareModal) {
      elements.compareModal.addEventListener('click', (e) => {
        if (e.target === elements.compareModal) {
          state.isCompareModalOpen = false;
          renderCompareDrawer();
        }
      });
    }

    if (elements.settingsModal) {
      elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
          state.isSettingsModalOpen = false;
          renderSettingsModal();
        }
      });
    }
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
