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
    // Extract seriesId from query params
    let seriesId = event.queryStringParameters?.seriesId;
    
    console.log(`[fred-proxy] Received request for seriesId: ${seriesId}`);
    console.log(`[fred-proxy] Query params:`, event.queryStringParameters);

    if (!seriesId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'seriesId parameter required' }),
      };
    }

    // Fetch from FRED API
    const apiUrl = `${FRED_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`;
    
    console.log(`[fred-proxy] Calling FRED API with series_id=${seriesId}`);
    console.log(`[fred-proxy] Full URL: ${FRED_URL}?series_id=${seriesId}&api_key=***&file_type=json`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    console.log(`[fred-proxy] FRED API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[fred-proxy] FRED API error: ${response.status} ${response.statusText}`);
      console.error(`[fred-proxy] Response body:`, errorBody);
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `FRED API returned ${response.status}`,
          details: response.statusText,
          seriesId: seriesId
        }),
      };
    }

    const data = await response.json();
    
    console.log(`[fred-proxy] ✓ Successfully fetched ${seriesId}: ${data.observations?.length || 0} observations`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('[fred-proxy] Error:', error);
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

