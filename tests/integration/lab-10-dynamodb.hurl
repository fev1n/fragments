# tests/integration/lab-10-dynamodb.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a json type of fragment
Content-Type: application/json
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request
{ "service": "DynamoDB" }

# 1. We expect to get back an HTTP 201
HTTP/1.1 201
# Capture the Location URL into a variable 
[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"

# 2. Try to GET the fragment we just posted by its URL
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1

# 3. Checking response is as expected
HTTP/1.1 200
# We have various assertions about the response that we want to check
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" exists
jsonpath "$.fragment.updated" exists
jsonpath "$.fragment.size" exists
jsonpath "$.fragment.type" == "application/json"


# 4. Another authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a json type of fragment
Content-Type: text/markdown
# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1
# Body of the request in markdown
`DynamoDB is **great**.`

# 5. We expect to get back an HTTP 201
HTTP/1.1 201
# Capture the Location URL into a variable 
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# 6. Try to GET the fragment we just posted by its URL
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1

# 7. Checking response is as expected
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" exists 
jsonpath "$.fragment.updated" exists
jsonpath "$.fragment.size" exists
jsonpath "$.fragment.type" == "text/markdown"

# 8. GET all of the fragments without expanding them
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

# 9. Checking response is as expected
HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" includes "{{fragment2_id}}"
jsonpath "$.fragments" includes "{{fragment1_id}}"

# 10. DELETE the created first fragment and checking if it was successful
DELETE http://localhost:8080/v1/fragments/{{fragment1_id}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# 11. Trying to GET first fragment again that we created to check if was deleted successfully
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

# 12. Checking if it gives error 404
HTTP/1.1 404

# 13. GET all of the fragments without expanding them
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

# 14. Checking response is as expected and just second created fragment is shown in response
HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" includes "{{fragment2_id}}"
jsonpath "$.fragments" not includes "{{fragment1_id}}"
