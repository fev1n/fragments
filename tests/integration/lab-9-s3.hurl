# tests/integration/lab-9-s3.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request goes in ```...``` when it's a string
`Hello S3!`

# 1. We expect to get back an HTTP 201
HTTP/1.1 201
# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

#3. Checking response is as expected
HTTP/1.1 200
Content-Type: text/plain
`Hello S3!`

#4. DELETE the created fragment and checking if it was successful
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# 5. Try to GET the fragment we just deleted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 6. Making sure that deletion worked
HTTP/1.1 404






