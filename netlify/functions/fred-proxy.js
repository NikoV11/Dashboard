const https = require('https');
const url = require('url');

const FRED_API_KEY = '60702495b0f5bcf665cfe1db3ae9dbe0';
const FRED_URL = 'https://api.stlouisfed.org/fred/series/data';

async function fetchFRED(seriesId) {
  return new Promise((resolve, reject) => {
    const apiUrl = `${FRED_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`;
    
    https.get(apiUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers, body: '' };
    }

    let seriesId = event.queryStringParameters?.seriesId;
    
    if (!seriesId && event.body) {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      seriesId = body.seriesId;
    }

    if (!seriesId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'seriesId required' })
      };
    }

    const data = await fetchFRED(seriesId);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};

