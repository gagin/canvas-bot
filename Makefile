.PHONY: help install dev start client server opencode clean

help:
	@echo "Canvaz - Visual Canvas for Opencode"
	@echo ""
	@echo "Available commands:"
	@echo "  make install    - Install all dependencies"
	@echo "  make dev        - Start dev mode (all services)"
	@echo "  make opencode  - Start opencode server"
	@echo "  make server     - Start canvaz server"
	@echo "  make client     - Start client dev server"
	@echo "  make start      - Start production server"
	@echo "  make clean      - Clean node_modules and dist"

install:
	cd client && npm install
	cd server && npm install

opencode:
	@echo "Starting opencode server..."
	opencode serve

server:
	@echo "Starting canvaz server..."
	cd server && npx tsx src/index.ts

client:
	@echo "Starting client..."
	cd client && npx vite

dev:
	@echo "Starting opencode server..."
	opencode serve &
	@echo "Waiting for opencode..."
	sleep 3
	cd server && npx tsx src/index.ts &
	cd client && npx vite

start:
	cd server && npm run start

clean:
	rm -rf client/node_modules server/node_modules node_modules
	rm -rf client/dist server/dist
