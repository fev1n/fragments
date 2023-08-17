# tests/integration/delete-fragment.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`This is a fragment!`

# 1. We expect to get back an HTTP 201
HTTP/1.1 201
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 2. DELETE the fragment with location URL that was captured earlier
DELETE {{url}} 
[BasicAuth]
user1@email.com:password1

# 3. DELETE request worked and gave 200 in response
HTTP/1.1 200

# 4. Make a GET request with URL to check if fragment was deleted 
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 5. expect to get back 404 error
HTTP/1.1 404

