const FRED_API_KEY = '60702495b0f5bcf665cfe1db3ae9dbe0';
const FRED_URL = 'https://api.stlouisfed.org/fred/series/data';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Extract seriesId from query params or path
    let seriesId = event.queryStringParameters?.seriesId;
    
    // Alternative: extract from path (e.g., /api/fred/GDPC1)
    if (!seriesId && event.path) {
      const parts = event.path.split('/');
      seriesId = parts[parts.length - 1];
    }

    if (!seriesId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'seriesId parameter required' }),
      };
    }

    // Fetch from FRED API
    const apiUrl = `${FRED_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`;
    
    console.log(`Fetching ${seriesId} from FRED API...`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`FRED API error: ${response.status} ${response.statusText}`);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `FRED API returned ${response.status}`,
          details: response.statusText 
        }),
      };
    }

    const data = await response.json();
    
    console.log(`✓ Successfully fetched ${seriesId}: ${data.observations?.length || 0} observations`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Netlify function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch FRED data',
        details: error.message,
      }),
    };
  }
};

