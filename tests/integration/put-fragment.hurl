# tests/integration/put-fragment.hurl
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

# 2. authenticated PUT request
PUT {{url}}
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
`changed fragment's data`

# 3. Check if successfully changed the fragments data
HTTP/1.1 200

# 5. GET the fragment to check the data was changed with same url
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 6. Confirm that the server returns expected response
HTTP/1.1 200
Content-Type: text/plain
`changed fragment's data`


