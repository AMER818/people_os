import urllib.request, urllib.error
import json, sys

url = 'http://127.0.0.1:3001/api/auth/login'
data = json.dumps({'username': 'admin', 'password': 'admin'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=5) as r:
        body = r.read().decode('utf-8')
        print('STATUS', r.getcode())
        print(body)
except urllib.error.HTTPError as e:
    print('HTTPERR', e.code, e.read().decode('utf-8'))
except Exception as e:
    print('ERR', repr(e))
    sys.exit(1)
