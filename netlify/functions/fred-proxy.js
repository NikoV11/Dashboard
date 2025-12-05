const https = require('https');
const http = require('http');

const FRED_API_KEY = '60702495b0f5bcf665cfe1db3ae9dbe0';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/data';

function fetchFromFRED(seriesId) {
  return new Promise((resolve, reject) => {
    const url = `${FRED_BASE_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`;
    console.log(`Fetching from: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${e.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    let seriesId;
    
    // Parse request body
    if (event.body) {
      const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      seriesId = body.seriesId;
    }
    
    // Also check query parameters
    if (!seriesId && event.queryStringParameters) {
      seriesId = event.queryStringParameters.seriesId;
    }

    if (!seriesId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'seriesId parameter is required' })
      };
    }

    console.log(`Fetching series: ${seriesId}`);
    const data = await fetchFromFRED(seriesId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        details: error.stack 
      })
    };
  }
};
