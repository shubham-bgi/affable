Steps:
1. Install MySQL and Redis client. Run them locally.
2. Set the variables in the env file.
3. Create DB affable in MySQL.
4. Run 'npm run migration:run' from the root of the folder.
5. Run - npm i
6. Run - npm start
7. Make sure influencer API is running on port 3000.
8. Call the follower API with the given curl
curl -X 'POST' \
  'http://localhost:5000/follower-api/follower/cron' \
  -H 'accept: */*' \
  -d ''