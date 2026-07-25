@echo off
echo === Building Frontend ===
cd ..\frontend
call npm run build
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo === Building Backend ===
cd ..\backend
call npm run build
call npx prisma generate
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo === Deploying Infrastructure ===
cd ..\infrastructure
call npm install
call npx cdk deploy --all --require-approval never
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo === Deployment Complete ===
echo Check CloudFormation outputs for URLs
