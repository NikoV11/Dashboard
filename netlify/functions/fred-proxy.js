const FRED_API_KEY = '60702495b0f5bcf665cfe1db3ae9dbe0';
const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/data';

exports.handler = async (event) => {
  try {
    // Enable CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    const { seriesId } = JSON.parse(event.body || '{}');

    if (!seriesId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'seriesId is required' })
      };
    }

    const url = `${FRED_BASE_URL}?series_id=${seriesId}&api_key=${FRED_API_KEY}&file_type=json`;
    console.log(`Fetching ${seriesId} from FRED...`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`FRED API returned status ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error in fred-proxy:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
