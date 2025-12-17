# Этап 1: Установка зависимостей
FROM node:18-alpine AS deps
WORKDIR /app

# Копируем package.json и package-lock.json именно из папки backend
COPY backend/package*.json ./

# Устанавливаем зависимости бэкенда
RUN npm ci --omit=dev

# Этап 2: Сборка финального образа
FROM node:18-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Копируем установленные зависимости из предыдущего этапа
COPY --from=deps /app/node_modules ./node_modules

# Копируем исходный код только бэкенда
COPY backend/ .

EXPOSE 5000

# Запускаем сервер (теперь он будет в /app/server.js)
CMD ["node", "server.js"]
