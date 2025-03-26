echo "Checking if database is seeded..."
SEED_STATUS=$(curl --silent --request POST --url http://hasura:8080/v1/graphql \
  --header 'Content-Type: application/json' \
  --header "x-hasura-admin-secret: admin_secret" \
  --data '{"query": "query { user(limit: 1) { id } }"}')

USER_COUNT=$(echo "$SEED_STATUS" | jq '.data.user | length')

if [ "$USER_COUNT" -gt 0 ]; then
  echo "Database already seeded."
else
  echo "Seeding database..."
  hasura seed apply --endpoint http://hasura:8080 --database-name default
fi