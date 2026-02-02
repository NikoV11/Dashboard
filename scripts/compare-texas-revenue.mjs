import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(process.cwd());
const revenueFile = path.join(repoRoot, 'revenue-data.js');
const dashboardFile = path.join(repoRoot, 'dashboard.js');
const outputDir = path.join(repoRoot, 'reports');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function extractApiKey(dashboardContents) {
  const match = dashboardContents.match(/const\s+FRED_API_KEY\s*=\s*['"]([^'"]+)['"]/);
  return match ? match[1].trim() : null;
}

function extractRevenueData(revenueContents) {
  const start = revenueContents.indexOf('const REVENUE_DATA =');
  if (start === -1) throw new Error('REVENUE_DATA not found');
  const arrayStart = revenueContents.indexOf('[', start);
  const arrayEnd = revenueContents.lastIndexOf('];');
  if (arrayStart === -1 || arrayEnd === -1) throw new Error('REVENUE_DATA array not found');
  const jsonText = revenueContents.slice(arrayStart, arrayEnd + 1);
  return JSON.parse(jsonText);
}

function normalizeCategory(category) {
  const normalized = category
    .replace(/\s+/g, ' ')
    .replace('ProductionTax', 'Production Tax')
    .replace('Alcoholic Beverages Taxes', 'Alcoholic Beverage Taxes')
    .replace('Oil Production and Regulation Taxes', 'Oil Production Tax')
    .replace('Natural Gas ProductionTax', 'Natural Gas Production Tax')
    .replace('Cigarette and Tobacco Taxes', 'Cigarette and Tobacco Taxes')
    .trim();
  return normalized;
}

const TARGET_TAX_CATEGORIES = new Set([
  'Sales Taxes',
  'Motor Vehicle Sales and Rental Taxes',
  'Motor Fuels Taxes',
  'Franchise Tax',
  'Oil Production Tax',
  'Insurance Taxes',
  'Cigarette and Tobacco Taxes',
  'Natural Gas Production Tax',
  'Alcoholic Beverage Taxes',
  'Hotel Occupancy Tax',
  'Utility Taxes',
  'Other Taxes',
  'Total Tax Collections'
]);

const CATEGORY_KEYWORDS = {
  'Sales Taxes': ['sales tax'],
  'Motor Vehicle Sales and Rental Taxes': ['motor vehicle', 'vehicle sales', 'rental'],
  'Motor Fuels Taxes': ['motor fuel'],
  'Franchise Tax': ['franchise'],
  'Oil Production Tax': ['oil production'],
  'Insurance Taxes': ['insurance'],
  'Cigarette and Tobacco Taxes': ['cigarette', 'tobacco'],
  'Natural Gas Production Tax': ['natural gas'],
  'Alcoholic Beverage Taxes': ['alcoholic', 'beverage'],
  'Hotel Occupancy Tax': ['hotel', 'occupancy'],
  'Utility Taxes': ['utility'],
  'Other Taxes': ['other tax'],
  'Total Tax Collections': ['total tax', 'tax collections']
};

function monthKey(year, monthName) {
  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  const monthIndex = monthNames.indexOf(monthName);
  if (monthIndex === -1) return null;
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function buildCategorySeriesMap(revenueData) {
  const map = new Map();
  revenueData.forEach(item => {
    const category = normalizeCategory(item.category);
    if (!TARGET_TAX_CATEGORIES.has(category)) return;
    const key = monthKey(item.year, item.month);
    if (!key) return;
    if (!map.has(category)) map.set(category, new Map());
    map.get(category).set(key, item.value);
  });
  return map;
}

async function fredSearch(apiKey, query, limit = 8) {
  const url = new URL('https://api.stlouisfed.org/fred/series/search');
  url.searchParams.set('search_text', query);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('file_type', 'json');
  url.searchParams.set('limit', String(limit));
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data?.seriess || [];
    }
    if (res.status === 429) {
      const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    throw new Error(`FRED search failed: ${res.status}`);
  }
  return [];
}

async function fredObservations(apiKey, seriesId) {
  const url = new URL('https://api.stlouisfed.org/fred/series/observations');
  url.searchParams.set('series_id', seriesId);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('file_type', 'json');
  url.searchParams.set('limit', '10000');
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data?.observations || [];
    }
    if (res.status === 429) {
      const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    throw new Error(`FRED observations failed: ${res.status}`);
  }
  return [];
}

function isLikelyTexasTaxSeries(series) {
  const title = (series?.title || '').toLowerCase();
  if (!title.includes('texas')) return false;
  if (!title.includes('tax')) return false;
  if (title.includes('percentage change') || title.includes('percent change')) return false;
  if (title.includes('rate')) return false;
  if (title.includes('employment') || title.includes('unemployment')) return false;
  return true;
}

function matchesCategoryKeywords(category, title) {
  const keywords = CATEGORY_KEYWORDS[category] || [];
  if (keywords.length === 0) return true;
  const lower = title.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

function observationsToMap(observations) {
  const map = new Map();
  observations.forEach(o => {
    if (!o?.date) return;
    const value = parseFloat(o.value);
    if (Number.isNaN(value)) return;
    const [y, m] = o.date.split('-');
    if (!y || !m) return;
    map.set(`${y}-${m}`, value);
  });
  return map;
}

function computeError(referenceMap, candidateMap) {
  const scales = [1, 1_000, 1_000_000, 1_000_000_000];
  let best = { mape: Infinity, scale: 1, overlap: 0 };

  for (const scale of scales) {
    let total = 0;
    let count = 0;
    for (const [key, refVal] of referenceMap.entries()) {
      if (!candidateMap.has(key)) continue;
      const candVal = candidateMap.get(key) * scale;
      if (refVal === 0) continue;
      const ape = Math.abs((candVal - refVal) / refVal);
      if (Number.isFinite(ape)) {
        total += ape;
        count += 1;
      }
    }
    if (count > 0) {
      const mape = total / count;
      if (mape < best.mape) {
        best = { mape, scale, overlap: count };
      }
    }
  }
  return best;
}

function buildSearchQueries(category) {
  const base = category.replace(/Taxes?/i, 'Tax');
  return [
    `Texas ${category}`,
    `Texas ${base}`,
    `Texas ${category} collections`,
    `Texas ${base} collections`,
    `Texas state ${category}`,
    `Texas state ${base}`,
    `Texas tax collections ${category}`
  ];
}

async function findBestSeriesForCategory(apiKey, category, referenceMap) {
  const queries = buildSearchQueries(category);
  const seenIds = new Set();
  const candidates = [];

  for (const q of queries) {
    const results = await fredSearch(apiKey, q, 12);
    for (const s of results) {
      if (!s?.id || seenIds.has(s.id)) continue;
      if (!isLikelyTexasTaxSeries(s)) continue;
      if (!matchesCategoryKeywords(category, s.title || '')) continue;
      seenIds.add(s.id);
      candidates.push(s);
    }
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  const scored = [];

  for (const s of candidates) {
    try {
      const observations = await fredObservations(apiKey, s.id);
      const obsMap = observationsToMap(observations);
      const score = computeError(referenceMap, obsMap);
      if (score.overlap > 0) {
        scored.push({
          id: s.id,
          title: s.title,
          units: s.units,
          frequency: s.frequency,
          mape: score.mape,
          scale: score.scale,
          overlap: score.overlap
        });
      }
    } catch {
      // ignore series that fail
    }
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  scored.sort((a, b) => a.mape - b.mape);
  return {
    best: scored[0] || null,
    topMatches: scored.slice(0, 5)
  };
}

async function main() {
  if (!fs.existsSync(revenueFile)) throw new Error('revenue-data.js not found');
  if (!fs.existsSync(dashboardFile)) throw new Error('dashboard.js not found');

  const revenueContents = readFile(revenueFile);
  const dashboardContents = readFile(dashboardFile);

  const apiKey = extractApiKey(dashboardContents);
  if (!apiKey) throw new Error('FRED_API_KEY not found in dashboard.js');

  const revenueData = extractRevenueData(revenueContents);
  const categoryMap = buildCategorySeriesMap(revenueData);
  const categories = Array.from(categoryMap.keys());

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const results = [];
  for (const category of categories) {
    const referenceMap = categoryMap.get(category);
    try {
      const { best, topMatches } = await findBestSeriesForCategory(apiKey, category, referenceMap);
      let status = 'no-series-found';
      if (best) {
        const freq = (best.frequency || '').toLowerCase();
        if (freq !== 'monthly') {
          status = 'frequency-mismatch';
        } else if (best.mape > 0.2) {
          status = 'values-different';
        } else {
          status = 'values-similar';
        }
      }
      results.push({ category, best, topMatches, status });
      console.log(`[${category}] best: ${best?.id || 'none'} (${best?.mape ?? 'n/a'})`);
    } catch (error) {
      results.push({ category, best: null, topMatches: [], status: 'error' });
      console.error(`[${category}] error: ${error.message}`);
    }
  }

  const outputJson = {
    generatedAt: new Date().toISOString(),
    categories: results
  };

  const outputPath = path.join(outputDir, 'texas-revenue-fred-compare.json');
  fs.writeFileSync(outputPath, JSON.stringify(outputJson, null, 2), 'utf8');

  const csvLines = [
    'Category,Status,SeriesID,Title,Units,Frequency,ScaleFactor,MAPE,Overlap'
  ];

  results.forEach(r => {
    const b = r.best;
    if (!b) {
      csvLines.push(`${JSON.stringify(r.category)},${r.status},,,,,,,`);
      return;
    }
    csvLines.push([
      r.category,
      r.status,
      b.id,
      b.title?.replace(/"/g, '""') ?? '',
      b.units ?? '',
      b.frequency ?? '',
      b.scale,
      b.mape.toFixed(6),
      b.overlap
    ].map(v => typeof v === 'string' ? `"${v}"` : v).join(','));
  });

  const csvPath = path.join(outputDir, 'texas-revenue-fred-compare.csv');
  fs.writeFileSync(csvPath, csvLines.join('\n'), 'utf8');

  console.log(`\nReport written to: ${outputPath}`);
  console.log(`Summary CSV written to: ${csvPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
