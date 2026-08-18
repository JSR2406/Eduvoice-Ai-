import urllib.request
req = urllib.request.Request(
    'http://127.0.0.1:8002/api/generate-story',
    method='OPTIONS',
    headers={
        'Origin': 'https://eduvoice-skillsbuild.vercel.app',
        'Access-Control-Request-Method': 'POST'
    }
)
try:
    res = urllib.request.urlopen(req)
    print(res.headers)
except Exception as e:
    print(e.read().decode())
