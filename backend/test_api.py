import urllib.request, urllib.error, json
req = urllib.request.Request(
    'https://eduvoice-api-skillsbuild.vercel.app/api/generate-audio',
    data=json.dumps({'text': 'Hello world', 'voice_id': 'edge:en'}).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.read().decode())
