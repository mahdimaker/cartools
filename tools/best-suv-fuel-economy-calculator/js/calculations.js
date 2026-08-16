// Fuel & Efficiency Calculations for Best Fuel Mileage SUV

/**
 * Calculate annual fuel or electricity cost for a vehicle
 * EPA Standard: 1 gallon of gas = 33.7 kWh
 */
function calculateAnnualCost(
  combinedMpg,
  powertrain,
  annualMiles,
  gasPricePerGallon,
  electricityPricePerKwh
) {
  const safeMpg = Math.max(1, combinedMpg);

  if (powertrain === 'Full EV') {
    // 33.7 kWh per 100 MPGe gallon equivalent
    const kwhPerMile = 33.7 / safeMpg;
    const totalKwh = annualMiles * kwhPerMile;
    return totalKwh * electricityPricePerKwh;
  }

  if (powertrain === 'Plug-in Hybrid') {
    // EPA PHEV assumption: ~50% electric miles / 50% hybrid gas miles
    const electricMiles = annualMiles * 0.5;
    const gasMiles = annualMiles * 0.5;

    // Electric cost based on MPGe
    const kwhPerMile = 33.7 / safeMpg;
    const electricCost = electricMiles * kwhPerMile * electricityPricePerKwh;

    // Gas cost based on gas mode mpg (~75% of MPGe as approx hybrid mode)
    const hybridGasMpg = Math.max(25, safeMpg * 0.5);
    const gasCost = (gasMiles / hybridGasMpg) * gasPricePerGallon;

    return electricCost + gasCost;
  }

  // Standard Gas or Traditional Hybrid
  const gallonsUsed = annualMiles / safeMpg;
  return gallonsUsed * gasPricePerGallon;
}

/**
 * Calculate annual savings of switching from Current Vehicle to Candidate SUV
 */
function calculateAnnualSavings(suv, currentVehicle, settings) {
  const currentAnnualCost = calculateAnnualCost(
    currentVehicle.mpg,
    'Gas',
    currentVehicle.annualMiles,
    settings.gasPricePerGallon,
    settings.electricityPricePerKwh
  );

  const suvAnnualCost = calculateAnnualCost(
    suv.mpgCombined,
    suv.powertrain,
    currentVehicle.annualMiles,
    settings.gasPricePerGallon,
    settings.electricityPricePerKwh
  );

  return Math.max(0, currentAnnualCost - suvAnnualCost);
}

/**
 * Calculate CO2 reduction in Metric Tons per year
 * (approx 8,887 grams CO2 per gallon of gasoline burned)
 */
function calculateCO2SavingsTons(suv, currentVehicle, settings) {
  const currentGallons = currentVehicle.annualMiles / Math.max(1, currentVehicle.mpg);
  let suvGallons = 0;

  if (suv.powertrain === 'Full EV') {
    suvGallons = 0;
  } else if (suv.powertrain === 'Plug-in Hybrid') {
    suvGallons = (currentVehicle.annualMiles * 0.5) / Math.max(25, suv.mpgCombined * 0.5);
  } else {
    suvGallons = currentVehicle.annualMiles / Math.max(1, suv.mpgCombined);
  }

  const gallonsSaved = Math.max(0, currentGallons - suvGallons);
  const kgCO2Saved = gallonsSaved * 8.887;
  return Number((kgCO2Saved / 1000).toFixed(1));
}

/**
 * Format currency with commas and no decimal places
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format standard number with commas
 */
function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}

window.CalculatorUtils = {
  calculateAnnualCost,
  calculateAnnualSavings,
  calculateCO2SavingsTons,
  formatCurrency,
  formatNumber,
};
