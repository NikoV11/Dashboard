#!/usr/bin/env python3
"""
FRED Dashboard Server
Provides CORS-enabled API endpoint to fetch FRED data
"""

import json
import urllib.request
import urllib.error
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
import mimetypes

FRED_API_KEY = '60702495b0f5bcf665cfe1db3ae9dbe0'
FRED_API_URL = 'https://api.stlouisfed.org/fred/series/data'
PORT = 3000
HOST = 'localhost'

class FREDHandler(BaseHTTPRequestHandler):
    """HTTP request handler with CORS support and FRED API proxy"""
    
    def do_GET(self):
        """Handle GET requests"""
        # Add CORS headers to all responses
        self.send_cors_headers()
        
        # Parse the URL path
        path = self.path.split('?')[0]
        
        # API endpoint to fetch FRED data
        if path.startswith('/api/fred/'):
            self.handle_fred_request(path)
            return
        
        # Health check endpoint
        if path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'status': 'ok',
                'timestamp': str(__import__('datetime').datetime.now().isoformat())
            }).encode())
            return
        
        # Serve static files
        self.serve_static_file(path)
    
    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_cors_headers()
        self.send_response(200)
        self.end_headers()
    
    def send_cors_headers(self):
        """Add CORS headers to response"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def handle_fred_request(self, path):
        """Fetch FRED data and return as JSON"""
        series_id = path.replace('/api/fred/', '').rstrip('/')
        
        if not series_id:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Series ID required'}).encode())
            return
        
        # Build FRED API URL
        api_url = f"{FRED_API_URL}?series_id={series_id}&api_key={FRED_API_KEY}&file_type=json"
        
        print(f'[{__import__("datetime").datetime.now().isoformat()}] Fetching {series_id}...')
        
        try:
            # Fetch from FRED API
            with urllib.request.urlopen(api_url, timeout=10) as response:
                data = response.read().decode('utf-8')
                fred_data = json.loads(data)
            
            # Return the data
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(fred_data).encode())
            
            print(f'[{__import__("datetime").datetime.now().isoformat()}] ✓ Successfully fetched {series_id}')
        
        except urllib.error.URLError as e:
            print(f'[{__import__("datetime").datetime.now().isoformat()}] Error fetching from FRED: {e}')
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': 'Failed to fetch from FRED API',
                'details': str(e)
            }).encode())
        
        except json.JSONDecodeError as e:
            print(f'[{__import__("datetime").datetime.now().isoformat()}] Error parsing FRED response: {e}')
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': 'Failed to parse FRED API response',
                'details': str(e)
            }).encode())
    
    def serve_static_file(self, path):
        """Serve static files from the directory"""
        if path == '/' or path == '':
            file_path = Path(__file__).parent / 'index.html'
        else:
            file_path = Path(__file__).parent / path.lstrip('/')
        
        if not file_path.exists():
            self.send_response(404)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<h1>404 - File Not Found</h1>')
            return
        
        try:
            # Determine content type
            content_type, _ = mimetypes.guess_type(str(file_path))
            if content_type is None:
                content_type = 'application/octet-stream'
            
            # Read and send file
            with open(file_path, 'rb') as f:
                file_content = f.read()
            
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', len(file_content))
            self.end_headers()
            self.wfile.write(file_content)
        
        except Exception as e:
            print(f'Error serving {file_path}: {e}')
            self.send_response(500)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<h1>500 - Server Error</h1>')
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass


def main():
    """Start the server"""
    server_address = (HOST, PORT)
    httpd = HTTPServer(server_address, FREDHandler)
    
    print("=" * 40)
    print("🚀 FRED Dashboard Server Started")
    print("=" * 40)
    print(f"📍 Local URL: http://{HOST}:{PORT}")
    print(f"📊 Open your browser and navigate to:")
    print(f"   http://{HOST}:{PORT}")
    print(f"\n🔌 API Endpoint: http://{HOST}:{PORT}/api/fred/:seriesId")
    print(f"   Example: http://{HOST}:{PORT}/api/fred/GDPC1")
    print(f"\n✅ CORS Enabled - Live data fetching enabled!")
    print("=" * 40)
    print("Press Ctrl+C to stop the server\n")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped.")
        httpd.server_close()


if __name__ == '__main__':
    main()
