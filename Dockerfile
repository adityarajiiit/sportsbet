FROM node:20-alpine AS builder

WORKDIR /app

ARG DATABASE_URL


COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json

RUN npm install

COPY . .

RUN npx prisma generate
RUN DATABASE_URL=${DATABASE_URL} npm run build




FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pm2

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/betting-engine ./betting-engine/
COPY --from=builder /app/ecosystem.config.mjs ./
EXPOSE 3000
EXPOSE 4000
CMD ["pm2-runtime","start","ecosystem.config.mjs"]