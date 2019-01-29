#!/bin/bash
npm run build:prod
npm run binary
cp -f bindata.go ../acentera-cognito-base/static/main.go
touch ../acentera-cognito-base/handlers/website-public/main.go
