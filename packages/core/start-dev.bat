@echo off
echo Starting Deriv Core Application...
cd /d "%~dp0"
set NODE_ENV=development

echo Checking environment...
if exist .env (
    echo Environment file found
) else (
    echo Creating .env file...
    echo NODE_ENV=development > .env
)

echo Running appendHosts.js...
node appendHosts.js

echo Starting webpack dev server...
npx webpack serve --config "./build/webpack.config.js" --host localhost --port 8080

pause
