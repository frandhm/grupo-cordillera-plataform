# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos todo el monorepo (NX necesita el contexto raíz)
COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY apps/ms-kpis ./apps/ms-kpis
COPY shared-interfaces ./shared-interfaces

RUN npm ci --ignore-scripts
RUN npx nx build ms-kpis --prod

# ── Stage 2: Runtime ─────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist/apps/ms-kpis ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE ${PORT}

CMD ["node", "main.js"]
