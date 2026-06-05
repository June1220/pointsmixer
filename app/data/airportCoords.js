// ─────────────────────────────────────────────────────────────────────────────
// Airport coordinates (lat/lon in decimal degrees) for great-circle distance
// calculation. Used by the Class B (Avios/Iberia) distance-band chart lookup.
// Source: OurAirports public domain data (ourairports.com/data) — bundled subset.
// ─────────────────────────────────────────────────────────────────────────────

export const coords = {
  // North America
  JFK: [40.6413,  -73.7781], EWR: [40.6895,  -74.1745], BOS: [42.3656,  -71.0096],
  IAD: [38.9531,  -77.4565], DCA: [38.8521,  -77.0378], PHL: [39.8719,  -75.2411],
  ATL: [33.6407,  -84.4277], MIA: [25.7959,  -80.2870], MCO: [28.4294,  -81.3089],
  ORD: [41.9742,  -87.9073], DFW: [32.8998,  -97.0403], IAH: [29.9902,  -95.3368],
  DEN: [39.8561, -104.6737], PHX: [33.4373, -112.0078], LAS: [36.0840, -115.1537],
  LAX: [33.9425, -118.4081], SFO: [37.6213, -122.3790], SEA: [47.4502, -122.3088],
  SAN: [32.7338, -117.1933], YYZ: [43.6772,  -79.6306], YVR: [49.1947, -123.1792],
  YUL: [45.4706,  -73.7408], MEX: [19.4363,  -99.0721],
  // Central America / Caribbean
  SJU: [18.4394,  -66.0018], SJO: [9.9939,   -84.2088], PTY: [9.0714,   -79.3835],
  CUN: [21.0365,  -86.8771],
  // South America
  GRU: [-23.4356,  -46.4731], GIG: [-22.8099,  -43.2505], EZE: [-34.8222,  -58.5358],
  SCL: [-33.3930,  -70.7858], BOG: [4.7016,    -74.1469], LIM: [-12.0219,  -77.1143],
  // Europe
  LHR: [51.4775,   -0.4614], LGW: [51.1537,   -0.1821], MAN: [53.3537,   -2.2750],
  DUB: [53.4213,   -6.2701], CDG: [49.0097,    2.5479], AMS: [52.3086,    4.7639],
  FRA: [50.0379,    8.5622], MUC: [48.3537,   11.7750], ZRH: [47.4582,    8.5555],
  VIE: [48.1103,   16.5697], MAD: [40.4936,   -3.5668], BCN: [41.2971,    2.0785],
  LIS: [38.7813,   -9.1359], OPO: [41.2481,   -8.6814], FCO: [41.8003,   12.2389],
  ATH: [37.9364,   23.9445], CPH: [55.6180,   12.6561], ARN: [59.6519,   17.9186],
  OSL: [60.1939,   11.1004], HEL: [60.3172,   24.9633], BRU: [50.9010,    4.4844],
  IST: [41.2753,   28.7519],
  // Africa
  CAI: [30.1219,   31.4056], JNB: [-26.1392,   28.2460], CPT: [-33.9648,   18.6017],
  NBO: [-1.3192,   36.9275], LOS: [6.5774,     3.3212], ADD: [8.9779,    38.7993],
  CMN: [33.3675,   -7.5898],
  // Middle East
  DXB: [25.2532,   55.3657], AUH: [24.4330,   54.6511], DOH: [25.2731,   51.6083],
  TLV: [32.0114,   34.8867], RUH: [24.9576,   46.6988], JED: [21.6705,   39.1728],
  // South Asia
  DEL: [28.5562,   77.1000], BOM: [19.0896,   72.8656], BLR: [13.1979,   77.7063],
  CMB: [7.1808,    79.8841],
  // Southeast Asia
  SIN: [1.3644,   103.9915], BKK: [13.6811,  100.7470], KUL: [2.7456,   101.7099],
  CGK: [-6.1255,  106.6559], MNL: [14.5086,  121.0194], SGN: [10.8188,  106.6520],
  HAN: [21.2212,  105.8072], DPS: [-8.7481,  115.1672],
  // North Asia
  NRT: [35.7720,  140.3929], HND: [35.5493,  139.7798], KIX: [34.4272,  135.2440],
  ICN: [37.4691,  126.4510], PVG: [31.1443,  121.8083], PEK: [40.0799,  116.5844],
  HKG: [22.3080,  113.9185], TPE: [25.0777,  121.2327],
  // Oceania
  SYD: [-33.9461,  151.1772], MEL: [-37.6690,  144.8410], BNE: [-27.3842,  153.1175],
  AKL: [-37.0082,  174.7917], PER: [-31.9403,  115.9669],
};

const RAD = Math.PI / 180;
const EARTH_RADIUS_MI = 3958.8;

/**
 * Great-circle distance in statute miles between two IATA airports.
 * Returns null if either airport is unknown.
 */
export function greatCircleMiles(originCode, destCode) {
  const o = coords[String(originCode).toUpperCase()];
  const d = coords[String(destCode).toUpperCase()];
  if (!o || !d) return null;
  const [lat1, lon1] = o;
  const [lat2, lon2] = d;
  const dLat = (lat2 - lat1) * RAD;
  const dLon = (lon2 - lon1) * RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
  return Math.round(EARTH_RADIUS_MI * 2 * Math.asin(Math.sqrt(a)));
}
