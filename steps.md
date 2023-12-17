Steps:
1. Install MySQL and Redis client. Run them locally.
2. Set the variables in the env file.
3. Create DB affable in MySQL.
4. Run 'npm run migration:run' from the root of the folder.
5. Run - npm i
6. Run - npm start
7. Make sure influencer API is running on port 3000.
8. Call the follower API with the given curl
curl --location 'http://localhost:5000/follower-api/follower/cron' \
--header 'accept: */*' \
--header 'Content-Type: application/json' \
--data '{
    "start": 1000000,
    "end": 1001000,
    "batch": 10
}'