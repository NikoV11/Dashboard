Write-Host 'Testing NEW API key...'
Write-Host 'Key: 313359708686770c608dab3d05c3077f' -ForegroundColor Cyan
Write-Host ''

$apiKey = '313359708686770c608dab3d05c3077f'
$url = 'https://api.stlouisfed.org/fred/series/data?series_id=GDPC1&api_key=' + $apiKey + '&file_type=json&limit=10'

try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
    Write-Host 'Status: SUCCESS ✓' -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Observations: $($json.observations.Count)" -ForegroundColor Green
    Write-Host ''
    Write-Host 'API KEY IS VALID AND WORKING!' -ForegroundColor Green
} catch {
    Write-Host "Status: ERROR - $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
