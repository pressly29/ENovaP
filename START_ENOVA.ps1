# 🚀 ENova Quick Start Commands

## Step 1: Copy Environment File
Copy-Item "packages\core\.env.enova" -Destination "packages\core\.env.development"

## Step 2: Start Application
Set-Location "packages\core"
npx webpack serve --config './build/webpack.dev.config.js'

## Step 3: Open Browser
Start-Process "http://localhost:3001"

# Your ENova app is now running with:
# - App ID: 106913
# - Markup: 2.5%
# - Affiliate Tracking: Enabled
# - Commission Dashboard: Active
