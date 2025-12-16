"""
Cloud Run service for processing screenshots
Handles HTTP requests and processes images using graph_telemetry_service
"""
import os
import json
import base64
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys

# Add parent directory to path to import graph_telemetry_service
sys.path.insert(0, '/app')
try:
    from services.graph_telemetry.graph_telemetry_service import GraphTelemetryService
except ImportError as e:
    # Fallback: try direct import
    sys.path.insert(0, '/app/services/graph-telemetry')
    from graph_telemetry_service import GraphTelemetryService

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the service with API key from environment
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', '')
service = GraphTelemetryService(GOOGLE_API_KEY)

print(f"✅ Cloud Run service initialized (API key: {'set' if GOOGLE_API_KEY else 'not set'})")


@app.route('/', methods=['POST'])
def process_screenshot():
    """
    Process screenshot and extract screen time data
    
    Expected JSON body (Firebase Functions format):
    {
        "data": {
            "imageData": "base64_encoded_image",
            "targetDay": "ראשון"
        }
    }
    
    Or direct format:
    {
        "imageData": "base64_encoded_image",
        "targetDay": "ראשון"
    }
    """
    try:
        # Get request data
        request_data = request.get_json()
        
        if not request_data:
            return jsonify({
                'success': False,
                'error': 'Missing request body'
            }), 400
        
        # Handle both Firebase Functions format and direct format
        if 'data' in request_data:
            data = request_data['data']
        else:
            data = request_data
        
        image_data = data.get('imageData')
        target_day = data.get('targetDay')
        
        if not image_data or not target_day:
            return jsonify({
                'success': False,
                'error': 'Missing required parameters: imageData and targetDay'
            }), 400
        
        print(f'[Cloud Run] Processing screenshot for day: {target_day}')
        
        # Decode base64 image
        try:
            # Remove data URL prefix if present
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            
            image_bytes = base64.b64decode(image_data)
            print(f'[Cloud Run] Decoded image: {len(image_bytes)} bytes')
        except Exception as e:
            print(f'[Cloud Run] Error decoding image: {str(e)}')
            return jsonify({
                'success': False,
                'error': f'Invalid image data format: {str(e)}'
            }), 400
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpeg') as tmp_file:
            tmp_file.write(image_bytes)
            temp_path = tmp_file.name
        
        try:
            # Process the image
            print(f'[Cloud Run] Calling graph_telemetry_service.process_day...')
            result = service.process_day(temp_path, target_day)
            print(f'[Cloud Run] Result: {result}')
            
            # Return result in expected format
            return jsonify({
                'success': True,
                'day': result.get('day', target_day),
                'minutes': result.get('minutes', 0),
                'found': result.get('found', False),
                'metadata': result.get('metadata', {})
            })
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_path)
                print(f'[Cloud Run] Cleaned up temp file: {temp_path}')
            except Exception as e:
                print(f'[Cloud Run] Warning: Could not delete temp file: {str(e)}')
    
    except Exception as e:
        print(f'[Cloud Run] Error processing screenshot: {str(e)}')
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'graph-telemetry-processor',
        'python_version': sys.version
    }), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f'Starting Cloud Run service on port {port}')
    app.run(host='0.0.0.0', port=port, debug=False)

