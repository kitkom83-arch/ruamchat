$ErrorActionPreference = "Stop"

$container = "aiomni-dev-postgres-1"
$database = "aiomni"
$user = "postgres"

$exists = docker exec $container psql -U $user -d $database -tAc "select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'Tenant';"

if ($exists.Trim() -eq "1") {
  Write-Host "Database schema already exists in $container/$database."
  exit 0
}

Write-Host "Generating SQL from Prisma schema and applying it to $container/$database..."
$sql = npx prisma migrate diff --from-empty --to-schema-datamodel apps/api/prisma/schema.prisma --script
$sql | docker exec -i $container psql -U $user -d $database
