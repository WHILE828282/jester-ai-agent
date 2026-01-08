{
  "name": "jester-ai-agent",
  "version": "1.0.0",
  "description": "An autonomous AI clown that posts daily jokes and replies on X. Humor evolves via memory + metrics.",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "cli": "tsx src/cli.ts",
    "migrate": "tsx scripts/migrate.ts",
    "seed": "tsx scripts/seed.ts",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write ."
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "openai": "^4.56.0",
    "twitter-api-v2": "^1.19.1",
    "zod": "^3.23.8",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.7.7",
    "@types/uuid": "^10.0.0",
    "tsx": "^4.19.1",
    "typescript": "^5.6.2",
    "eslint": "^9.12.0",
    "prettier": "^3.3.3"
  }
}
