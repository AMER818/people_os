import urllib.request, urllib.error
import json, sys

TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBZG1pbiIsIm9yZ2FuaXphdGlvbl9pZCI6bnVsbCwiZXhwIjoxNzY4MjMwNzE2fQ.YQO3YgWBJOnfSS7ec6h98rOQA8rh26HiBo4ZV9sN9Ac'
url = 'http://127.0.0.1:3001/api/organizations'
req = urllib.request.Request(url, headers={'Authorization': f'Bearer {TOKEN}'})
try:
    with urllib.request.urlopen(req, timeout=5) as r:
        body = r.read().decode('utf-8')
        data = json.loads(body)
        print('COUNT', len(data))
        print(json.dumps(data, indent=2))
except urllib.error.HTTPError as e:
    print('HTTPERR', e.code, e.read().decode('utf-8'))
except Exception as e:
    print('ERR', repr(e))
    sys.exit(1)
