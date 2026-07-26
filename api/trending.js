const fs = require('fs');
const path = require('path');

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

    const { country, limit, search } = req.query;

    let items = [...data.items];

    if (country) {
      const countries = Array.isArray(country)
        ? country.flatMap(c => c.split(','))
        : country.split(',');
      const normalized = countries.map(c => c.trim().toUpperCase()).filter(Boolean);
      items = items.filter(item => normalized.includes(item.region));
    }

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.channelTitle.toLowerCase().includes(q)
      );
    }

    if (limit) {
      const n = parseInt(limit, 10);
      if (!isNaN(n) && n > 0) {
        items = items.slice(0, n);
      }
    }

    const response = {
      updatedAt: data.updatedAt,
      category: data.category,
      countries: country
        ? (Array.isArray(country) ? country.length : 1)
        : data.countries,
      count: items.length,
      items: items
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};
