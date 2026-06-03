#!/bin/bash
export PATH="/Users/udaybatra/.nvm/versions/node/v24.16.0/bin:$PATH"
cd /Users/udaybatra/blushline
exec node node_modules/.bin/next dev --webpack
