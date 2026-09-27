Admin
List Partners
GET
https://brdgr-api.onrender.com/api/v1/admin/partners
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Query Params
page
string 
required
Example:
1
limit
string 
required
Example:
20
Responses
🟢200
Success
application/json
object
 
Request
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/partners?page=1&limit=20' \
--header 'Authorization: Bearer <token>'
Response
{"error":false,"message":"Partner profiles retrieved successfully","data":{"partners":[{"partnerProfile":{"id":"2a743d0a-cfa1-4469-846c-91544daf8d97","userId":"10c6eb31-2c30-4888-aa7a-29a8375ff529","ecosystemId":null,"bio":"Updated bio — now focused on East African fintech ecosystems.","location":"Lagos, Nigeria","languages":["English","Yoruba"],"industries":["Fintech","E-commerce"],"marketsServed":["Nigeria","Ghana"],"yearsExperience":8,"partnershipExperience":"Led revenue-share deals with top 5 Nigerian fintechs.","capacity":"part_time","niches":["reseller","white-label"],"portfolio":[{"url":"https://example.com/flutterwave-case","title":"Flutterwave Referral","description":"Generated 3,500 net new signups in 60 days."}],"contactEmail":"jane.updated@example.com","contactPhone":"+2348098765432","isVetted":false,"createdAt":"2026-09-15T17:24:49.962Z","updatedAt":"2026-09-15T17:43:13.847Z"},"user":{"id":"10c6eb31-2c30-4888-aa7a-29a8375ff529","firstName":"Jane","lastName":"Okonkwo","email":"email@gmail.com","role":"partner","isActive":true,"createdAt":"2026-09-15T17:21:27.225Z","updatedAt":"2026-09-18T16:28:36.089Z"}}],"pagination":{"currentPage":1,"nextPage":null,"prevPage":null,"hasNext":false,"hasPrev":false,"totalPages":1,"totalRecords":1}}}

Admin
Partner Profile
GET
https://brdgr-api.onrender.com/api/v1/admin/partners/10c6eb31-2c30-4888-aa7a-29a8375ff529
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/partners/10c6eb31-2c30-4888-aa7a-29a8375ff529' \
--header 'Authorization: Bearer <token>'
Response Example
{"error":false,"message":"Partner profiles retrieved successfully","data":{"partners":[{"partnerProfile":{"id":"2a743d0a-cfa1-4469-846c-91544daf8d97","userId":"10c6eb31-2c30-4888-aa7a-29a8375ff529","ecosystemId":null,"bio":"Updated bio — now focused on East African fintech ecosystems.","location":"Lagos, Nigeria","languages":["English","Yoruba"],"industries":["Fintech","E-commerce"],"marketsServed":["Nigeria","Ghana"],"yearsExperience":8,"partnershipExperience":"Led revenue-share deals with top 5 Nigerian fintechs.","capacity":"part_time","niches":["reseller","white-label"],"portfolio":[{"url":"https://example.com/flutterwave-case","title":"Flutterwave Referral","description":"Generated 3,500 net new signups in 60 days."}],"contactEmail":"jane.updated@example.com","contactPhone":"+2348098765432","isVetted":false,"createdAt":"2026-09-15T17:24:49.962Z","updatedAt":"2026-09-15T17:43:13.847Z"},"user":{"id":"10c6eb31-2c30-4888-aa7a-29a8375ff529","firstName":"Jane","lastName":"Okonkwo","email":"email@gmail.com","role":"partner","isActive":true,"createdAt":"2026-09-15T17:21:27.225Z","updatedAt":"2026-09-18T16:28:36.089Z"}}],"pagination":{"currentPage":1,"nextPage":null,"prevPage":null,"hasNext":false,"hasPrev":false,"totalPages":1,"totalRecords":1}}}

Admin
Normal Partners
GET
https://brdgr-api.onrender.com/api/v1/admin/partners/normal
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Query Params
page
string 
required
Example:
1
limit
string 
required
Example:
20
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/partners/normal?page=1&limit=20' \
--header 'Authorization: Bearer <token>'
Response Example
{"error":false,"message":"Partner profiles retrieved successfully","data":{"partners":[{"partnerProfile":{"id":"2a743d0a-cfa1-4469-846c-91544daf8d97","userId":"10c6eb31-2c30-4888-aa7a-29a8375ff529","ecosystemId":null,"bio":"Updated bio — now focused on East African fintech ecosystems.","location":"Lagos, Nigeria","languages":["English","Yoruba"],"industries":["Fintech","E-commerce"],"marketsServed":["Nigeria","Ghana"],"yearsExperience":8,"partnershipExperience":"Led revenue-share deals with top 5 Nigerian fintechs.","capacity":"part_time","niches":["reseller","white-label"],"portfolio":[{"url":"https://example.com/flutterwave-case","title":"Flutterwave Referral","description":"Generated 3,500 net new signups in 60 days."}],"contactEmail":"jane.updated@example.com","contactPhone":"+2348098765432","isVetted":false,"createdAt":"2026-09-15T17:24:49.962Z","updatedAt":"2026-09-15T17:43:13.847Z"},"user":{"id":"10c6eb31-2c30-4888-aa7a-29a8375ff529","firstName":"Jane","lastName":"Okonkwo","email":"email@gmail.com","role":"partner","isActive":true,"createdAt":"2026-09-15T17:21:27.225Z","updatedAt":"2026-09-18T16:28:36.089Z"}}],"pagination":{"currentPage":1,"nextPage":null,"prevPage":null,"hasNext":false,"hasPrev":false,"totalPages":1,"totalRecords":1}}}

Admin
BYOP Partners
GET
https://brdgr-api.onrender.com/api/v1/admin/partners/byop
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Query Params
page
string 
required
Example:
1
limit
string 
required
Example:
20
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/partners/byop?page=1&limit=20' \
--header 'Authorization: Bearer <token>'
Response Example
{"error":false,"message":"Partner profiles retrieved successfully","data":{"partners":[{"partnerProfile":{"id":"2a743d0a-cfa1-4469-846c-91544daf8d97","userId":"10c6eb31-2c30-4888-aa7a-29a8375ff529","ecosystemId":null,"bio":"Updated bio — now focused on East African fintech ecosystems.","location":"Lagos, Nigeria","languages":["English","Yoruba"],"industries":["Fintech","E-commerce"],"marketsServed":["Nigeria","Ghana"],"yearsExperience":8,"partnershipExperience":"Led revenue-share deals with top 5 Nigerian fintechs.","capacity":"part_time","niches":["reseller","white-label"],"portfolio":[{"url":"https://example.com/flutterwave-case","title":"Flutterwave Referral","description":"Generated 3,500 net new signups in 60 days."}],"contactEmail":"jane.updated@example.com","contactPhone":"+2348098765432","isVetted":false,"createdAt":"2026-09-15T17:24:49.962Z","updatedAt":"2026-09-15T17:43:13.847Z"},"user":{"id":"10c6eb31-2c30-4888-aa7a-29a8375ff529","firstName":"Jane","lastName":"Okonkwo","email":"email@gmail.com","role":"partner","isActive":true,"createdAt":"2026-09-15T17:21:27.225Z","updatedAt":"2026-09-18T16:28:36.089Z"}}],"pagination":{"currentPage":1,"nextPage":null,"prevPage":null,"hasNext":false,"hasPrev":false,"totalPages":1,"totalRecords":1}}}


Admin
List Organizations
GET
https://brdgr-api.onrender.com/api/v1/admin/organizations
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Query Params
page
integer 
required
Example:
1
limit
integer 
required
Example:
10
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/organizations?page=1&limit=10' \
--header 'Authorization: Bearer <token>'
Response Example


Admin
Organization
GET
https://brdgr-api.onrender.com/api/v1/admin/organizations/d05796ae-26b1-46f7-8e20-83802a2e8fc9
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/organizations/d05796ae-26b1-46f7-8e20-83802a2e8fc9' \
--header 'Authorization: Bearer <token>'
Response Example


Admin
Organization
GET
https://brdgr-api.onrender.com/api/v1/admin/organizations/d05796ae-26b1-46f7-8e20-83802a2e8fc9
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/organizations/d05796ae-26b1-46f7-8e20-83802a2e8fc9' \
--header 'Authorization: Bearer <token>'
Response Example



Admin
List Kyc
GET
https://brdgr-api.onrender.com/api/v1/admin/kyc/
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Query Params
page
string 
required
Example:
1
limit
string 
required
Example:
10
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/kyc/?page=1&limit=10' \
--header 'Authorization: Bearer <token>'
Response Example


Admin
Get Organization KYC
GET
https://brdgr-api.onrender.com/api/v1/admin/kyc/organizations/{organizationId}/kyc
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Path Params
organizationId
string 
required
Example:
d05796ae-26b1-46f7-8e20-83802a2e8fc9
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/kyc/organizations/d05796ae-26b1-46f7-8e20-83802a2e8fc9/kyc' \
--header 'Authorization: Bearer <token>'
Response Example


Admin
Get Kyc
GET
https://brdgr-api.onrender.com/api/v1/admin/kyc/{kycRecordId}
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Path Params
kycRecordId
string 
required
Query Params
page
string 
required
Example:
1
limit
string 
required
Example:
10
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/kyc/?page=1&limit=10' \
--header 'Authorization: Bearer <token>'
Response Example



Admin
List Kyc
GET
https://brdgr-api.onrender.com/api/v1/admin/partners/kyc/records
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Query Params
page
string 
required
Example:
1
limit
string 
required
Example:
10
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/partners/kyc/records?page=1&limit=10' \
--header 'Authorization: Bearer <token>'
Response Example
{"error":false,"message":"KYC records retrieved successfully","data":{"records":[{"kycRecord":{"id":"56eb1ad8-3211-4f5f-be34-6c932abcf09a","orgId":"d05796ae-26b1-46f7-8e20-83802a2e8fc9","status":"pending","provider":" SumSub","providerReferenceId":" REF-KYC-2026-98765","decisionNotes":null,"submittedAt":"2026-09-18T20:40:52.232Z","decidedAt":null,"createdAt":"2026-09-18T20:40:52.232Z","updatedAt":"2026-09-18T20:40:52.232Z"},"organization":{"id":"d05796ae-26b1-46f7-8e20-83802a2e8fc9","name":"Acme Enterprise Solutions"}}],"pagination":{"currentPage":1,"nextPage":null,"prevPage":null,"hasNext":false,"hasPrev":false,"totalPages":1,"totalRecords":1}}}
Modified at 1 day ago
Previous
Organization KYC Status
Next
Get Organization KYC


Admin
Get Organization KYC
GET
https://brdgr-api.onrender.com/api/v1/admin/partners/kyc/records/14ad46e0-b5f0-47a2-b520-7d75a9500a13
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/partners/kyc/records/14ad46e0-b5f0-47a2-b520-7d75a9500a13' \
--header 'Authorization: Bearer <token>'
Response Example
{"error":false,"message":"KYC records retrieved successfully","data":{"records":[{"kycRecord":{"id":"56eb1ad8-3211-4f5f-be34-6c932abcf09a","orgId":"d05796ae-26b1-46f7-8e20-83802a2e8fc9","status":"pending","provider":" SumSub","providerReferenceId":" REF-KYC-2026-98765","decisionNotes":null,"submittedAt":"2026-09-18T20:40:52.232Z","decidedAt":null,"createdAt":"2026-09-18T20:40:52.232Z","updatedAt":"2026-09-18T20:40:52.232Z"},"organization":{"id":"d05796ae-26b1-46f7-8e20-83802a2e8fc9","name":"Acme Enterprise Solutions"}}],"pagination":{"currentPage":1,"nextPage":null,"prevPage":null,"hasNext":false,"hasPrev":false,"totalPages":1,"totalRecords":1}}}
Modified at 1 day ago
Previous
List Kyc
Next
Get Kyc



Admin
Get Kyc
PATCH
https://brdgr-api.onrender.com/api/v1/admin/partners/kyc/records/14ad46e0-b5f0-47a2-b520-7d75a9500a13/review
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Body Params
application/json
Required
object
 
Examples
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location --request PATCH 'https://brdgr-api.onrender.com/api/v1/admin/partners/kyc/records/14ad46e0-b5f0-47a2-b520-7d75a9500a13/review' \
--header 'Authorization: Bearer <token>' \
--header 'Content-Type: application/json' \
--data '{
    "status": "failed",
    "decisionNotes": "Hello"
}'
Response Example
{"error":false,"message":"KYC records retrieved successfully","data":{"records":[{"kycRecord":{"id":"56eb1ad8-3211-4f5f-be34-6c932abcf09a","orgId":"d05796ae-26b1-46f7-8e20-83802a2e8fc9","status":"pending","provider":" SumSub","providerReferenceId":" REF-KYC-2026-98765","decisionNotes":null,"submittedAt":"2026-09-18T20:40:52.232Z","decidedAt":null,"createdAt":"2026-09-18T20:40:52.232Z","updatedAt":"2026-09-18T20:40:52.232Z"},"organization":{"id":"d05796ae-26b1-46f7-8e20-83802a2e8fc9","name":"Acme Enterprise Solutions"}}],"pagination":{"currentPage":1,"nextPage":null,"prevPage":null,"hasNext":false,"hasPrev":false,"totalPages":1,"totalRecords":1}}}
Modified at 1 day ago
Previous
Get Organization KYC
Next
Submit Partner KYC


Admins
Users
GET
https://brdgr-api.onrender.com/api/v1/admins/users
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Query Params
page
string 
required
Example:
1
limit
string 
required
Example:
2
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admins/users?page=1&limit=2' \
--header 'Authorization: Bearer <token>'
Response Example
{"error":false,"message":"Users retrieved successfully","data":{"users":[{"id":"e6a74219-ca1d-45c6-b239-ba6e43f452c2","firstName":"John","lastName":"Doe","email":"email@gmail.comd","role":"partner","isActive":true,"emailVerifiedAt":null,"createdAt":"2026-09-15T18:27:06.784Z"},{"id":"10c6eb31-2c30-4888-aa7a-29a8375ff529","firstName":"Jane","lastName":"Okonkwo","email":"email@gmail.com","role":"partner","isActive":true,"emailVerifiedAt":null,"createdAt":"2026-09-15T17:21:27.225Z"},{"id":"82023513-6761-40e1-b514-a17392486c80","firstName":"William","lastName":"Onyejiaka","email":"williamonyejiaka2021@gmail.com","role":"client","isActive":true,"emailVerifiedAt":"2026-09-15T13:14:58.575Z","createdAt":"2026-09-15T12:59:58.892Z"},{"id":"540a9b45-f6dd-4f3f-8990-8d4b5aaa5de1","firstName":"John","lastName":"Doe","email":"client@gmail.com","role":"client","isActive":true,"emailVerifiedAt":null,"createdAt":"2026-09-18T21:03:35.142Z"},{"id":"72dbcae4-67dd-4bac-bfe2-643a2baee46d","firstName":"Default","lastName":"Admin","email":"defaualt@admin.com","role":"admin","isActive":true,"emailVerifiedAt":"2026-09-19T00:35:12.725Z","createdAt":"2026-09-19T00:35:12.725Z"}],"pagination":{"currentPage":1,"nextPage":null,"prevPage":null,"hasNext":false,"hasPrev":false,"totalPages":1,"totalRecords":5}}}
Modified at 1 day ago
Previous
Organization Partner Status
Next
Create Staff




Admins
Create Staff
POST
https://brdgr-api.onrender.com/api/v1/admins/staff
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Body Params
application/json
Required
object
 
Examples
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admins/staff' \
--header 'Authorization: Bearer <token>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "firstName": "Sarah",
    "lastName": "Jenkins",
    "email": "sarah.jenkins@company.com",
    "role": "ops_admin"
}'
Response Example
{}
Modified at 1 day ago
Previous
Users
Next
Seed History


Admins
Seed History
GET
https://brdgr-api.onrender.com/api/v1/admins/seed-history
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Body Params
application/json
Required
object
 
Examples
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location --request GET 'https://brdgr-api.onrender.com/api/v1/admins/seed-history' \
--header 'Authorization: Bearer <token>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "firstName": "Sarah",
    "lastName": "Jenkins",
    "email": "sarah.jenkins@company.com",
    "role": "ops_admin"
}'
Response Example
{}
Modified at 1 day ago
Previous
Create Staff
Next
Staffs

Admins
Staffs
GET
https://brdgr-api.onrender.com/api/v1/admins/staff
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Query Params
page
string 
required
Example:
1
limit
string 
required
Example:
10
Body Params
application/json
Required
object
 
Examples
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location --request GET 'https://brdgr-api.onrender.com/api/v1/admins/staff?page=1&limit=10' \
--header 'Authorization: Bearer <token>' \
--header 'Content-Type: application/json' \
--data '{}'
Response Example
{}
Modified at 1 day ago
Previous
Seed History
Next
Staff


Admins
Staff
GET
https://brdgr-api.onrender.com/api/v1/admins/staff/375291cf-9f50-4e22-b87e-879c92e22298
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Body Params
application/json
Required
object
 
Examples
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location --request GET 'https://brdgr-api.onrender.com/api/v1/admins/staff/375291cf-9f50-4e22-b87e-879c92e22298' \
--header 'Authorization: Bearer <token>' \
--header 'Content-Type: application/json' \
--data '{}'
Response Example
{}
Modified at 1 day ago
Previous
Staffs
Next
Profile


Admins
Profile
GET
https://brdgr-api.onrender.com/api/v1/admins/profile
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Body Params
application/json
Required
object
 
Examples
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location --request GET 'https://brdgr-api.onrender.com/api/v1/admins/profile' \
--header 'Authorization: Bearer <token>' \
--header 'Content-Type: application/json' \
--data '{}'
Response Example
{}
Modified at 1 day ago
Previous
Staff
Next
Create

Admin
Relationships
GET
https://brdgr-api.onrender.com/api/v1/admin/byop/relationships
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Query Params
page
string 
required
Example:
1
limit
string 
required
Example:
20
search
string 
optional
clientOrgId
string 
optional
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/byop/relationships?page=1&limit=20&search=undefined' \
--header 'Authorization: Bearer <token>'
Response Example
{"error":false,"message":"All BYOP relationships retrieved successfully","data":{"records":[{"relationshipId":"2af4d5ff-a148-4578-b6c5-004c9bde6e32","createdAt":"2026-09-19T20:25:39.124Z","updatedAt":"2026-09-19T20:25:39.124Z","partner":{"id":"52d7ee91-0a60-4dd5-b8b5-2f08a3b96865","firstName":"Alex","lastName":"Morgan","email":"alex@example.com","role":"partner","isActive":true,"emailVerifiedAt":"2026-09-19T20:30:33.355Z"},"clientOrganization":{"id":"d05796ae-26b1-46f7-8e20-83802a2e8fc9","name":"Acme Enterprise Solutions"}}],"pagination":{"currentPage":1,"nextPage":null,"prevPage":null,"hasNext":false,"hasPrev":false,"totalPages":1,"totalRecords":1}}}
Modified at 1 day ago
Previous
Delete Contact
Next
Relationship


Admin
Relationship
GET
https://brdgr-api.onrender.com/api/v1/admin/byop/relationships/{relationshipId}
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Path Params
relationshipId
string 
required
Example:
2af4d5ff-a148-4578-b6c5-004c9bde6e32
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/byop/relationships/2af4d5ff-a148-4578-b6c5-004c9bde6e32' \
--header 'Authorization: Bearer <token>'
Response Example
{"error":false,"message":"All BYOP relationships retrieved successfully","data":{"records":[{"relationshipId":"2af4d5ff-a148-4578-b6c5-004c9bde6e32","createdAt":"2026-09-19T20:25:39.124Z","updatedAt":"2026-09-19T20:25:39.124Z","partner":{"id":"52d7ee91-0a60-4dd5-b8b5-2f08a3b96865","firstName":"Alex","lastName":"Morgan","email":"alex@example.com","role":"partner","isActive":true,"emailVerifiedAt":"2026-09-19T20:30:33.355Z"},"clientOrganization":{"id":"d05796ae-26b1-46f7-8e20-83802a2e8fc9","name":"Acme Enterprise Solutions"}}],"pagination":{"currentPage":1,"nextPage":null,"prevPage":null,"hasNext":false,"hasPrev":false,"totalPages":1,"totalRecords":1}}}
Modified at 1 day ago
Previous
Relationships
Next
Invitation Cleanup


Admin
Invitation Cleanup
DELETE
https://brdgr-api.onrender.com/api/v1/admin/byop/invitations
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location --request DELETE 'https://brdgr-api.onrender.com/api/v1/admin/byop/invitations' \
--header 'Authorization: Bearer <token>'
Response Example
{"error":false,"message":"All BYOP relationships retrieved successfully","data":{"records":[{"relationshipId":"2af4d5ff-a148-4578-b6c5-004c9bde6e32","createdAt":"2026-09-19T20:25:39.124Z","updatedAt":"2026-09-19T20:25:39.124Z","partner":{"id":"52d7ee91-0a60-4dd5-b8b5-2f08a3b96865","firstName":"Alex","lastName":"Morgan","email":"alex@example.com","role":"partner","isActive":true,"emailVerifiedAt":"2026-09-19T20:30:33.355Z"},"clientOrganization":{"id":"d05796ae-26b1-46f7-8e20-83802a2e8fc9","name":"Acme Enterprise Solutions"}}],"pagination":{"currentPage":1,"nextPage":null,"prevPage":null,"hasNext":false,"hasPrev":false,"totalPages":1,"totalRecords":1}}}
Modified at 1 day ago
Previous
Relationship
Next
Analytics


Admin
Analytics
GET
https://brdgr-api.onrender.com/api/v1/admin/byop/analytics
Request
Authorization
Provide your bearer token in the Authorization header when making requests to protected resources.
Example:
Authorization: Bearer ********************
Responses
🟢200
Success
application/json
object
 
Request Example
cURL
cURL-Windows
Httpie
wget
PowerShell
curl --location 'https://brdgr-api.onrender.com/api/v1/admin/byop/analytics' \
--header 'Authorization: Bearer <token>'
Response Example
{"error":false,"message":"All BYOP relationships retrieved successfully","data":{"records":[{"relationshipId":"2af4d5ff-a148-4578-b6c5-004c9bde6e32","createdAt":"2026-09-19T20:25:39.124Z","updatedAt":"2026-09-19T20:25:39.124Z","partner":{"id":"52d7ee91-0a60-4dd5-b8b5-2f08a3b96865","firstName":"Alex","lastName":"Morgan","email":"alex@example.com","role":"partner","isActive":true,"emailVerifiedAt":"2026-09-19T20:30:33.355Z"},"clientOrganization":{"id":"d05796ae-26b1-46f7-8e20-83802a2e8fc9","name":"Acme Enterprise Solutions"}}],"pagination":{"currentPage":1,"nextPage":null,"prevPage":null,"hasNext":false,"hasPrev":false,"totalPages":1,"totalRecords":1}}}
Modified at 1 day ago
Previous
Invitation Cleanup
Next
Invite Partner
