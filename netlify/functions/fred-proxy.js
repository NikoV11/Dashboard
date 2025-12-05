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
    
    console.log(`[fred-proxy] Request received for seriesId: ${seriesId}`);

    if (!seriesId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'seriesId parameter required' }),
      };
    }

    // Build FRED API URL
    const apiUrl = `${FRED_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json&limit=10000`;
    
    console.log(`[fred-proxy] Calling FRED API endpoint: ${FRED_URL}`);
    console.log(`[fred-proxy] Parameters: series_id=${seriesId}, api_key=***`);
    
    // Fetch with explicit timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    let response;
    try {
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'FRED-Dashboard/1.0'
        },
        signal: controller.signal
      });
      clearTimeout(timeout);
    } catch (fetchError) {
      clearTimeout(timeout);
      console.error(`[fred-proxy] Fetch error:`, fetchError.message);
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          error: 'Failed to reach FRED API',
          details: fetchError.message
        }),
      };
    }
    
    console.log(`[fred-proxy] FRED API response status: ${response.status}`);
    
    // Read response body
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`[fred-proxy] FRED API error ${response.status}:`);
      console.error(`[fred-proxy] Response body:`, responseText.substring(0, 200));
      
      // Try to parse as JSON for error details
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = errorJson.error_message || responseText;
      } catch (e) {
        // Not JSON, use raw text
      }
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `FRED API returned ${response.status}`,
          details: errorDetails,
          seriesId: seriesId
        }),
      };
    }

    // Parse response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[fred-proxy] JSON parse error:`, parseError.message);
      console.error(`[fred-proxy] Response text:`, responseText.substring(0, 200));
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Failed to parse FRED API response',
          details: parseError.message
        }),
      };
    }
    
    const obsCount = data.observations?.length || 0;
    console.log(`[fred-proxy] ✓ Successfully fetched ${seriesId}: ${obsCount} observations`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('[fred-proxy] Unexpected error:', error.message);
    console.error('[fred-proxy] Stack:', error.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Unexpected error',
        details: error.message,
      }),
    };
  }
};

