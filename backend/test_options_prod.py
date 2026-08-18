import urllib.request
req = urllib.request.Request(
    'https://eduvoice-api-skillsbuild.vercel.app/api/generate-story',
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
