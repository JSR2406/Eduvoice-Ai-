import urllib.request, urllib.error, json
req = urllib.request.Request(
    'http://127.0.0.1:8001/api/generate-audio',
    data=json.dumps({'text': 'Hello world', 'voice_id': 'edge:en'}).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
try:
    urllib.request.urlopen(req)
    print("SUCCESS")
except urllib.error.HTTPError as e:
    print("FAILED", e.read().decode())
