hasura metadata export
hasura metadata apply

hasura seeds create <seed-name> --from-table <table-name>
hasura seeds apply --database-name <database-name>

hasura migrate create <migration-name> --from-server
hasura migrate apply --database-name <database-name>

