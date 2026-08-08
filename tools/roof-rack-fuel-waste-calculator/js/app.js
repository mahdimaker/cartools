// Vehicle & Attachment Specs
const VEHICLE_SPECS = {
  sedan: {
    id: 'sedan',
    name: 'Compact / Sedan',
    description: 'Sleek aerodynamic body profile (e.g., Civic, Model 3, Accord)',
    baseCd: 0.28,
    frontalAreaM2: 2.15,
    baseMpg: 36,
    baseL100km: 6.5,
  },
  crossover: {
    id: 'crossover',
    name: 'Crossover / Hatchback',
    description: 'Medium roof height & elevated profile (e.g., RAV4, CR-V, Outback)',
    baseCd: 0.33,
    frontalAreaM2: 2.45,
    baseMpg: 30,
    baseL100km: 7.8,
  },
  suv: {
    id: 'suv',
    name: 'Full SUV / Truck',
    description: 'Large frontal surface & upright stance (e.g., Tahoe, Explorer, F-150)',
    baseCd: 0.38,
    frontalAreaM2: 2.85,
    baseMpg: 22,
    baseL100km: 10.6,
  },
};

const ATTACHMENT_SPECS = {
  empty_bars: {
    id: 'empty_bars',
    name: 'Empty Roof Crossbars',
    shortLabel: 'Empty Bars',
    description: 'Bare crossbars or empty factory roof rack rails',
    deltaCd: 0.045,
    typicalFuelPenaltyPercent: 11,
  },
  roof_box: {
    id: 'roof_box',
    name: 'Streamlined Roof Box',
    shortLabel: 'Cargo Roof Box',
    description: 'Aerodynamic hard-shell luggage box',
    deltaCd: 0.085,
    typicalFuelPenaltyPercent: 18,
  },
  bike_rack: {
    id: 'bike_rack',
    name: 'Roof Bike Rack + Bicycle',
    shortLabel: 'Roof Bicycle',
    description: 'Upright bicycle mounted on roof rack',
    deltaCd: 0.135,
    typicalFuelPenaltyPercent: 28,
  },
  bulky_bag: {
    id: 'bulky_bag',
    name: 'Bulky Cargo / Soft Roof Bag',
    shortLabel: 'Soft Cargo Bag',
    description: 'Non-aerodynamic soft luggage bag or kayak',
    deltaCd: 0.165,
    typicalFuelPenaltyPercent: 35,
  },
};

// Current Application State
const state = {
  unitSystem: 'imperial', // 'imperial' | 'metric'
  vehicleType: 'crossover', // 'sedan' | 'crossover' | 'suv'
  attachmentType: 'roof_box', // 'empty_bars' | 'roof_box' | 'bike_rack' | 'bulky_bag'
  distance: 250,
  speed: 65,
  fuelPrice: 3.65,
};

// Physics Calculation Engine
function calculateFuelImpact(inputs) {
  const vehicle = VEHICLE_SPECS[inputs.vehicleType] || VEHICLE_SPECS.crossover;
  const attachment = ATTACHMENT_SPECS[inputs.attachmentType] || ATTACHMENT_SPECS.roof_box;
  const isImperial = inputs.unitSystem === 'imperial';

  const baseCd = vehicle.baseCd;
  const deltaCd = attachment.deltaCd;
  const newCd = baseCd + deltaCd;
  const cdIncreasePercent = (deltaCd / baseCd) * 100;

  const speedMph = isImperial ? inputs.speed : inputs.speed * 0.621371;
  const speedFactor = Math.pow(speedMph / 65, 1.8);

  let adjustedBaseMpg = vehicle.baseMpg / Math.max(0.6, Math.pow(speedMph / 65, 0.7));
  let adjustedBaseL100km = vehicle.baseL100km * Math.max(0.6, Math.pow(speedMph / 65, 0.7));

  const aeroFraction = 0.62 + Math.min(0.2, (speedMph - 50) * 0.006);
  const dragRatio = (baseCd + deltaCd) / baseCd;

  const fuelPenaltyPercent = (dragRatio - 1) * aeroFraction * 100 * (0.85 + 0.15 * speedFactor);

  const distanceMiles = isImperial ? inputs.distance : inputs.distance * 0.621371;
  const distanceKm = isImperial ? inputs.distance * 1.60934 : inputs.distance;

  let baseFuelConsumed = 0;
  let newFuelConsumed = 0;

  if (isImperial) {
    baseFuelConsumed = distanceMiles / adjustedBaseMpg;
    newFuelConsumed = baseFuelConsumed * (1 + fuelPenaltyPercent / 100);
  } else {
    baseFuelConsumed = (distanceKm / 100) * adjustedBaseL100km;
    newFuelConsumed = baseFuelConsumed * (1 + fuelPenaltyPercent / 100);
  }

  const extraFuelConsumed = newFuelConsumed - baseFuelConsumed;

  const baseCost = baseFuelConsumed * inputs.fuelPrice;
  const newCost = newFuelConsumed * inputs.fuelPrice;
  const extraCost = extraFuelConsumed * inputs.fuelPrice;

  const co2Factor = isImperial ? 8.887 : 2.31;
  const extraCo2Kg = extraFuelConsumed * co2Factor;

  const yearlyDistance = isImperial ? 12000 : 18000;
  const tripScaleFactor = yearlyDistance / inputs.distance;
  const yearlyExtraFuel = extraFuelConsumed * tripScaleFactor;
  const yearlyExtraCost = extraCost * tripScaleFactor;

  return {
    baseCd,
    newCd: Number(newCd.toFixed(3)),
    deltaCd: Number(deltaCd.toFixed(3)),
    cdIncreasePercent: Number(cdIncreasePercent.toFixed(1)),

    baseFuelConsumed: Number(baseFuelConsumed.toFixed(2)),
    newFuelConsumed: Number(newFuelConsumed.toFixed(2)),
    extraFuelConsumed: Number(extraFuelConsumed.toFixed(2)),
    fuelPenaltyPercent: Number(fuelPenaltyPercent.toFixed(1)),

    baseCost: Number(baseCost.toFixed(2)),
    newCost: Number(newCost.toFixed(2)),
    extraCost: Number(extraCost.toFixed(2)),

    extraCo2Kg: Number(extraCo2Kg.toFixed(1)),

    yearlyDistance,
    yearlyExtraFuel: Number(yearlyExtraFuel.toFixed(1)),
    yearlyExtraCost: Number(yearlyExtraCost.toFixed(2)),
  };
}

// Formatting Helpers
function formatCurrency(amount, unitSystem) {
  const symbol = unitSystem === 'imperial' ? '$' : '€';
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatFuel(amount, unitSystem) {
  const unit = unitSystem === 'imperial' ? 'gal' : 'L';
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${unit}`;
}

// SVG Aerodynamic Rendering
function renderCarSvg(vehicleType, attachmentType, baseCd, deltaCd, newCd, speed, unitSystem, fuelPenaltyPercent) {
  let strokeColor = '#3b82f6';
  if (fuelPenaltyPercent >= 15 && fuelPenaltyPercent < 25) strokeColor = '#f59e0b';
  if (fuelPenaltyPercent >= 25) strokeColor = '#ef4444';

  const vehiclePath =
    vehicleType === 'sedan'
      ? 'M 120,195 L 140,165 Q 170,150 220,140 Q 260,95 340,95 L 430,105 Q 480,145 510,160 L 520,195 Z'
      : vehicleType === 'crossover'
      ? 'M 110,195 L 130,160 Q 170,145 220,135 Q 260,90 360,90 L 460,95 Q 490,135 520,160 L 525,195 Z'
      : 'M 100,195 L 120,150 Q 160,140 210,130 Q 240,82 380,82 L 485,85 L 530,160 L 535,195 Z';

  const windowPath =
    vehicleType === 'sedan'
      ? 'M 240,135 L 270,102 L 340,102 L 365,135 Z'
      : vehicleType === 'crossover'
      ? 'M 240,130 L 270,97 L 380,97 L 415,130 Z'
      : 'M 235,125 L 255,89 L 410,89 L 435,125 Z';

  let attachmentSvg = '';
  if (attachmentType === 'roof_box') {
    attachmentSvg = `
      <g id="svg-roof-box">
        <path d="M 250,76 Q 280,52 350,52 Q 390,52 400,76 Z" fill="#f59e0b" stroke="#b45309" stroke-width="2" />
        <line x1="260" y1="66" x2="390" y2="66" stroke="#fef3c7" stroke-width="1" opacity="0.6" />
      </g>
    `;
  } else if (attachmentType === 'bike_rack') {
    attachmentSvg = `
      <g id="svg-bike-rack">
        <circle cx="280" cy="55" r="16" fill="none" stroke="#f59e0b" stroke-width="2.5" />
        <circle cx="350" cy="55" r="16" fill="none" stroke="#f59e0b" stroke-width="2.5" />
        <path d="M 280,55 L 315,55 L 335,35 L 295,35 Z" fill="none" stroke="#fbbf24" stroke-width="2.5" />
        <line x1="335" y1="35" x2="330" y2="22" stroke="#fef3c7" stroke-width="2.5" />
      </g>
    `;
  } else if (attachmentType === 'bulky_bag') {
    attachmentSvg = `
      <g id="svg-bulky-bag">
        <rect x="260" y="48" width="110" height="28" rx="8" fill="#ef4444" stroke="#991b1b" stroke-width="2" />
        <line x1="285" y1="48" x2="285" y2="76" stroke="#fee2e2" stroke-width="2" stroke-dasharray="2,2" />
        <line x1="345" y1="48" x2="345" y2="76" stroke="#fee2e2" stroke-width="2" stroke-dasharray="2,2" />
      </g>
    `;
  }

  let extraTurbulenceLines = '';
  if (attachmentType !== 'empty_bars') {
    extraTurbulenceLines = `
      <path d="M 230,85 Q 290,30 350,55 Q 420,80 570,120" fill="none" stroke="${strokeColor}" stroke-width="3.5" stroke-dasharray="6,4" class="animate-pulse" />
      <path d="M 270,45 Q 330,20 380,45 Q 450,75 580,110" fill="none" stroke="${strokeColor}" stroke-width="2.5" opacity="0.8" />
    `;
  }

  return `
    <svg viewBox="0 0 600 240" role="img" aria-label="Aerodynamic airflow simulation" class="w-full h-full max-h-56 select-none overflow-visible">
      <defs>
        <linearGradient id="windGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.1" />
          <stop offset="60%" stop-color="${strokeColor}" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.2" />
        </linearGradient>
        <pattern id="roadStripes" width="40" height="10" patternUnits="userSpaceOnUse">
          <line x1="0" y1="5" x2="20" y2="5" stroke="#475569" stroke-width="2" stroke-dasharray="4,4" />
        </pattern>
      </defs>

      <!-- Road surface -->
      <line x1="20" y1="210" x2="580" y2="210" stroke="#334155" stroke-width="3" />
      <rect x="20" y="212" width="560" height="8" fill="url(#roadStripes)" opacity="0.6" />

      <!-- Wind Streamlines -->
      <g id="svg-wind-lines">
        <path d="M 30,170 Q 150,170 200,160 T 320,160 T 560,170" fill="none" stroke="url(#windGrad)" stroke-width="2.5" stroke-dasharray="8,4" opacity="0.7" />
        <path d="M 30,150 Q 160,150 210,120 Q 280,75 360,75 Q 450,85 550,160" fill="none" stroke="url(#windGrad)" stroke-width="3" stroke-dasharray="12,6" />
        ${extraTurbulenceLines}
        <circle cx="390" cy="65" r="12" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="3,3" opacity="0.6" />
        <circle cx="420" cy="78" r="18" fill="none" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.4" />
      </g>

      <!-- Vehicle Body Silhouette -->
      <g id="svg-vehicle-body" fill="#1e293b" stroke="#64748b" stroke-width="2.5">
        <path d="${vehiclePath}" />
        <path d="${windowPath}" fill="#0f172a" stroke="#475569" stroke-width="2" />
        <circle cx="190" cy="195" r="22" fill="#020617" stroke="#94a3b8" stroke-width="4" />
        <circle cx="190" cy="195" r="10" fill="#475569" />
        <circle cx="450" cy="195" r="22" fill="#020617" stroke="#94a3b8" stroke-width="4" />
        <circle cx="450" cy="195" r="10" fill="#475569" />
      </g>

      <!-- Roof Attachments -->
      <g id="svg-roof-attachment">
        <line x1="280" y1="88" x2="280" y2="78" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />
        <line x1="360" y1="88" x2="360" y2="78" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />
        <line x1="270" y1="78" x2="370" y2="78" stroke="#fbbf24" stroke-width="3" />
        ${attachmentSvg}
      </g>

      <!-- Cd Badge overlay -->
      <g transform="translate(420, 25)">
        <rect width="160" height="42" rx="8" fill="#0f172a" stroke="${strokeColor}" stroke-width="1.5" opacity="0.95" />
        <text x="12" y="18" fill="#94a3b8" font-size="10" font-family="sans-serif" font-weight="bold">DRAG COEFFICIENT (Cd)</text>
        <text x="12" y="34" fill="#ffffff" font-size="15" font-family="sans-serif" font-weight="bold">
          ${baseCd} <tspan fill="${strokeColor}">→ ${newCd}</tspan>
        </text>
      </g>
    </svg>
  `;
}

// Update DOM UI Elements
function updateUI() {
  const isImperial = state.unitSystem === 'imperial';
  const results = calculateFuelImpact(state);

  // Unit System Buttons
  const imperialBtn = document.getElementById('unit-imperial-btn');
  const metricBtn = document.getElementById('unit-metric-btn');
  if (imperialBtn && metricBtn) {
    if (isImperial) {
      imperialBtn.className = 'px-2.5 py-1 rounded-md transition-all cursor-pointer bg-white text-slate-900 shadow-xs font-semibold';
      imperialBtn.setAttribute('aria-pressed', 'true');
      metricBtn.className = 'px-2.5 py-1 rounded-md transition-all cursor-pointer text-slate-600 hover:text-slate-900';
      metricBtn.setAttribute('aria-pressed', 'false');
    } else {
      metricBtn.className = 'px-2.5 py-1 rounded-md transition-all cursor-pointer bg-white text-slate-900 shadow-xs font-semibold';
      metricBtn.setAttribute('aria-pressed', 'true');
      imperialBtn.className = 'px-2.5 py-1 rounded-md transition-all cursor-pointer text-slate-600 hover:text-slate-900';
      imperialBtn.setAttribute('aria-pressed', 'false');
    }
  }

  // Quick Overhead Banner
  const quickExtraCost = document.getElementById('quick-extra-cost');
  const quickWastedFuel = document.getElementById('quick-wasted-fuel');
  if (quickExtraCost) quickExtraCost.textContent = `+${formatCurrency(results.extraCost, state.unitSystem)}`;
  if (quickWastedFuel) quickWastedFuel.textContent = `${formatFuel(results.extraFuelConsumed, state.unitSystem)} wasted`;

  // Distance Input & Slider
  const distanceUnitLabel = document.getElementById('distance-unit-label');
  const distanceInput = document.getElementById('distance-number-input');
  const distanceSlider = document.getElementById('distance-range-slider');
  const distanceMinLabel = document.getElementById('distance-min-label');
  const distanceMidLabel = document.getElementById('distance-mid-label');
  const distanceMaxLabel = document.getElementById('distance-max-label');

  if (distanceUnitLabel) distanceUnitLabel.textContent = isImperial ? 'miles' : 'km';
  if (distanceInput) distanceInput.value = state.distance;
  if (distanceSlider) {
    distanceSlider.max = isImperial ? 1500 : 2500;
    distanceSlider.value = state.distance;
  }
  if (distanceMinLabel) distanceMinLabel.textContent = `10 ${isImperial ? 'mi' : 'km'}`;
  if (distanceMidLabel) distanceMidLabel.textContent = isImperial ? '500 mi' : '800 km';
  if (distanceMaxLabel) distanceMaxLabel.textContent = isImperial ? '1,500 mi' : '2,500 km';

  // Speed Input & Slider
  const speedUnitLabel = document.getElementById('speed-unit-label');
  const speedInput = document.getElementById('speed-number-input');
  const speedSlider = document.getElementById('speed-range-slider');

  if (speedUnitLabel) speedUnitLabel.textContent = isImperial ? 'mph' : 'km/h';
  if (speedInput) {
    speedInput.min = isImperial ? 35 : 50;
    speedInput.max = isImperial ? 90 : 150;
    speedInput.value = state.speed;
  }
  if (speedSlider) {
    speedSlider.min = isImperial ? 40 : 65;
    speedSlider.max = isImperial ? 85 : 140;
    speedSlider.value = state.speed;
  }

  // Attachment Buttons Highlight
  Object.keys(ATTACHMENT_SPECS).forEach((key) => {
    const btn = document.getElementById(`attachment-btn-${key}`);
    if (btn) {
      const isSelected = state.attachmentType === key;
      if (isSelected) {
        btn.className = 'p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/50';
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.className = 'p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
        btn.setAttribute('aria-pressed', 'false');
      }
    }
  });

  // Vehicle Buttons Highlight
  Object.keys(VEHICLE_SPECS).forEach((key) => {
    const btn = document.getElementById(`vehicle-btn-${key}`);
    if (btn) {
      const isSelected = state.vehicleType === key;
      if (isSelected) {
        btn.className = 'p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20';
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.className = 'p-3 sm:p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
        btn.setAttribute('aria-pressed', 'false');
      }
    }
  });

  // Fuel Price Input
  const fuelPriceUnitLabel = document.getElementById('fuel-price-unit-label');
  const fuelPriceInput = document.getElementById('fuel-price-number-input');
  if (fuelPriceUnitLabel) fuelPriceUnitLabel.textContent = isImperial ? '$/Gallon' : '€/Liter';
  if (fuelPriceInput) fuelPriceInput.value = state.fuelPrice;

  // Car Graphic Header & Graphic Render
  const graphicOverheadBadge = document.getElementById('graphic-overhead-badge');
  const graphicSpeedDisplay = document.getElementById('graphic-speed-display');
  const carSvgWrapper = document.getElementById('car-svg-wrapper');
  const graphicBaseCd = document.getElementById('graphic-base-cd');
  const graphicDeltaCd = document.getElementById('graphic-delta-cd');
  const graphicCdIncrease = document.getElementById('graphic-cd-increase');

  if (graphicOverheadBadge) graphicOverheadBadge.textContent = `+${results.fuelPenaltyPercent}% Fuel Overhead`;
  if (graphicSpeedDisplay) graphicSpeedDisplay.textContent = `Speed: ${state.speed} ${isImperial ? 'mph' : 'km/h'}`;
  if (carSvgWrapper) {
    carSvgWrapper.innerHTML = renderCarSvg(
      state.vehicleType,
      state.attachmentType,
      results.baseCd,
      results.deltaCd,
      results.newCd,
      state.speed,
      state.unitSystem,
      results.fuelPenaltyPercent
    );
  }
  if (graphicBaseCd) graphicBaseCd.textContent = results.baseCd;
  if (graphicDeltaCd) graphicDeltaCd.textContent = `+${results.deltaCd}`;
  if (graphicCdIncrease) graphicCdIncrease.textContent = `+${((results.deltaCd / results.baseCd) * 100).toFixed(1)}%`;

  // Headline Result Card
  const resultPenaltyPercent = document.getElementById('result-penalty-percent');
  const resultWastedBadge = document.getElementById('result-wasted-badge');
  const resultDescription = document.getElementById('result-description');
  const resBaseFuel = document.getElementById('res-base-fuel');
  const resNewFuel = document.getElementById('res-new-fuel');
  const resNewCost = document.getElementById('res-new-cost');
  const resExtraCo2 = document.getElementById('res-extra-co2');

  if (resultPenaltyPercent) resultPenaltyPercent.textContent = `+${results.fuelPenaltyPercent}%`;
  if (resultWastedBadge) resultWastedBadge.textContent = `+${formatFuel(results.extraFuelConsumed, state.unitSystem)} wasted`;
  if (resultDescription) {
    const attachmentName = ATTACHMENT_SPECS[state.attachmentType]?.name || 'Roof Rack';
    const distUnit = isImperial ? 'miles' : 'km';
    resultDescription.innerHTML = `Your ${attachmentName} adds <strong class="text-slate-950 font-extrabold">+${results.deltaCd} Cd</strong> to aerodynamic drag, burning an extra <strong class="text-amber-950 font-extrabold">${formatFuel(results.extraFuelConsumed, state.unitSystem)}</strong> of fuel over ${state.distance} ${distUnit}.`;
  }
  if (resBaseFuel) resBaseFuel.textContent = formatFuel(results.baseFuelConsumed, state.unitSystem);
  if (resNewFuel) resNewFuel.textContent = formatFuel(results.newFuelConsumed, state.unitSystem);
  if (resNewCost) resNewCost.textContent = formatCurrency(results.newCost, state.unitSystem);
  if (resExtraCo2) resExtraCo2.textContent = `+${results.extraCo2Kg} kg`;

  // Yearly Projection
  const yearlyDistanceTitle = document.getElementById('yearly-distance-title');
  const yearlyExtraCost = document.getElementById('yearly-extra-cost');
  const yearlyExtraFuel = document.getElementById('yearly-extra-fuel');

  if (yearlyDistanceTitle) {
    yearlyDistanceTitle.textContent = `IF LEFT ON ROOF YEAR-ROUND (${results.yearlyDistance.toLocaleString()} ${isImperial ? 'MI' : 'KM'})`;
  }
  if (yearlyExtraCost) yearlyExtraCost.textContent = `+${formatCurrency(results.yearlyExtraCost, state.unitSystem)}`;
  if (yearlyExtraFuel) yearlyExtraFuel.textContent = `+${formatFuel(results.yearlyExtraFuel, state.unitSystem)}`;
}

// Set Unit System (US Imperial vs Metric)
function setUnitSystem(unit) {
  if (state.unitSystem === unit) return;
  state.unitSystem = unit;
  const isImperial = unit === 'imperial';
  state.distance = isImperial ? 250 : 400;
  state.speed = isImperial ? 65 : 110;
  state.fuelPrice = isImperial ? 3.65 : 1.85;
  updateUI();
}

// Reset Handler
function handleReset() {
  const isImperial = state.unitSystem === 'imperial';
  state.vehicleType = 'crossover';
  state.attachmentType = 'roof_box';
  state.distance = isImperial ? 250 : 400;
  state.speed = isImperial ? 65 : 110;
  state.fuelPrice = isImperial ? 3.65 : 1.85;
  updateUI();
}

// FAQ Accordion Toggle
function toggleFaq(id) {
  const answerEl = document.getElementById(`faq-answer-${id}`);
  const iconEl = document.getElementById(`faq-icon-${id}`);
  if (answerEl) {
    const isHidden = answerEl.classList.contains('hidden');
    if (isHidden) {
      answerEl.classList.remove('hidden');
      if (iconEl) iconEl.classList.add('rotate-180', 'bg-amber-200', 'text-amber-900');
    } else {
      answerEl.classList.add('hidden');
      if (iconEl) iconEl.classList.remove('rotate-180', 'bg-amber-200', 'text-amber-900');
    }
  }
}

// Floating Sticky CTA Scroll Handler
function handleScroll() {
  const inputsCard = document.getElementById('calculator-inputs-card');
  const floatingCta = document.getElementById('floating-sticky-cta-container');
  if (!floatingCta) return;

  let isVisible = false;
  if (inputsCard) {
    const rect = inputsCard.getBoundingClientRect();
    const seventyPercentHeight = rect.height * 0.7;
    isVisible = rect.top + seventyPercentHeight <= window.innerHeight * 0.6;
  } else {
    isVisible = window.scrollY > 600;
  }

  if (isVisible) {
    floatingCta.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[88%] max-w-xs sm:hidden transition-all duration-500 ease-out opacity-100 translate-y-0 scale-100 pointer-events-auto';
  } else {
    floatingCta.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[88%] max-w-xs sm:hidden transition-all duration-500 ease-out opacity-0 translate-y-10 scale-95 pointer-events-none';
  }
}

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Unit toggle buttons
  document.getElementById('unit-imperial-btn')?.addEventListener('click', () => setUnitSystem('imperial'));
  document.getElementById('unit-metric-btn')?.addEventListener('click', () => setUnitSystem('metric'));

  // Reset button
  document.getElementById('calculator-reset-btn')?.addEventListener('click', handleReset);

  // Distance input & slider
  const distanceInput = document.getElementById('distance-number-input');
  const distanceSlider = document.getElementById('distance-range-slider');
  distanceInput?.addEventListener('input', (e) => {
    state.distance = Math.max(1, Number(e.target.value) || 1);
    updateUI();
  });
  distanceSlider?.addEventListener('input', (e) => {
    state.distance = Number(e.target.value);
    updateUI();
  });

  // Speed input & slider
  const speedInput = document.getElementById('speed-number-input');
  const speedSlider = document.getElementById('speed-range-slider');
  speedInput?.addEventListener('input', (e) => {
    state.speed = Math.max(30, Number(e.target.value) || 30);
    updateUI();
  });
  speedSlider?.addEventListener('input', (e) => {
    state.speed = Number(e.target.value);
    updateUI();
  });

  // Attachment buttons
  Object.keys(ATTACHMENT_SPECS).forEach((key) => {
    document.getElementById(`attachment-btn-${key}`)?.addEventListener('click', () => {
      state.attachmentType = key;
      updateUI();
    });
  });

  // Vehicle buttons
  Object.keys(VEHICLE_SPECS).forEach((key) => {
    document.getElementById(`vehicle-btn-${key}`)?.addEventListener('click', () => {
      state.vehicleType = key;
      updateUI();
    });
  });

  // Fuel price input
  const fuelPriceInput = document.getElementById('fuel-price-number-input');
  fuelPriceInput?.addEventListener('input', (e) => {
    state.fuelPrice = Math.max(0.1, Number(e.target.value) || 0.1);
    updateUI();
  });

  // FAQ buttons
  [1, 2, 3].forEach((id) => {
    document.getElementById(`faq-btn-${id}`)?.addEventListener('click', () => toggleFaq(id));
  });

  // Scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Initial UI Render
  updateUI();
  handleScroll();
});
