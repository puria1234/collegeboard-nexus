import urllib.request, json
url = "https://integrate.api.nvidia.com/v1/chat/completions"
req = urllib.request.Request(url, method="POST")
req.add_header("Authorization", "Bearer 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")
req.add_header("Content-Type", "application/json")
data = json.dumps({
    "model": "meta/llama3-70b-instruct",
    "messages": [{"role": "user", "content": "hi"}]
}).encode()
try:
    with urllib.request.urlopen(req, data=data) as f:
        print(f.read().decode())
except Exception as e:
    print(e.read().decode() if hasattr(e, 'read') else str(e))
