import urllib.request, urllib.error
import sys, json
try:
    with urllib.request.urlopen('http://localhost:3001/api/health', timeout=5) as r:
        body = r.read().decode('utf-8')
        print('STATUS', r.getcode())
        try:
            print(json.dumps(json.loads(body), indent=2))
        except Exception:
            print(body[:1000])
except Exception as e:
    print('ERROR', repr(e))
    sys.exit(1)
