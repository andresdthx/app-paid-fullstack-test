#!/bin/bash
set -e

echo "=== Building Frontend ==="
cd ../frontend
npm run build

echo "=== Building Backend ==="
cd ../backend
npm run build
npx prisma generate

echo "=== Deploying Infrastructure ==="
cd ../infrastructure
npm install
npx cdk deploy --all --require-approval never

echo "=== Deployment Complete ==="
echo "Check CloudFormation outputs for URLs"
