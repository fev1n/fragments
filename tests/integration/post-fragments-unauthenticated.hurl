# tests/integration/post-fragments-unauthenticated.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain; charset=utf-8
# Include HTTP Basic Auth credentials, here incorrect as we need to check if error 401 is encountered for unauthenticated users
[BasicAuth]
user1@email.com:password1234
# Body of the request goes in ```...``` when it's a string
`This is a fragment!`

# We should get back an HTTP 1.1 404 response
HTTP/1.1 401

# Extra checks to perform against the response
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" isString
jsonpath "$.error.message" == "Unauthorized"
jsonpath "$.error.code" == 401
