import urllib.request, urllib.error
import json, sys
try:
    with urllib.request.urlopen('http://127.0.0.1:3001/api/organizations', timeout=5) as r:
        body = r.read().decode('utf-8')
        data = json.loads(body)
        print('COUNT', len(data))
        print(json.dumps(data, indent=2))
except Exception as e:
    print('ERROR', repr(e))
    sys.exit(1)
