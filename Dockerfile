# Build stage
FROM node:20 AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Nginx stage
FROM nginx:alpine
COPY --from=build /app/dist/BizMate.FE /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
