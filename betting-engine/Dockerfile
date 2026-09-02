FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma/ ./prisma/
RUN npm install --omit=dev
RUN npx prisma generate

COPY betting-engine/ ./betting-engine/

EXPOSE 4000

CMD ["node", "betting-engine/index.js"]
