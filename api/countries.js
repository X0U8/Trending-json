const fs = require('fs');
const path = require('path');

const COUNTRY_NAMES = {
  US: 'United States',
  IN: 'India',
  GB: 'United Kingdom',
  CA: 'Canada',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  JP: 'Japan',
  KR: 'South Korea',
  BR: 'Brazil',
  MX: 'Mexico',
  ID: 'Indonesia',
  PH: 'Philippines',
  TH: 'Thailand',
  VN: 'Vietnam',
  PK: 'Pakistan',
  BD: 'Bangladesh',
  NG: 'Nigeria',
  ZA: 'South Africa',
  SA: 'Saudi Arabia'
};

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const dataPath = path.join(process.cwd(), 'data.json');
    const raw = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(raw);

    const regionCounts = {};
    for (const item of data.items) {
      regionCounts[item.region] = (regionCounts[item.region] || 0) + 1;
    }

    const countries = Object.keys(regionCounts)
      .sort()
      .map(code => ({
        code,
        name: COUNTRY_NAMES[code] || code,
        count: regionCounts[code]
      }));

    return res.status(200).json({
      updatedAt: data.updatedAt,
      totalCountries: countries.length,
      countries
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
