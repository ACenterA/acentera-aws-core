#!/bin/bash
npm run build:prod
npm run binary
touch ../gofaas/handlers/website-public/main.go
