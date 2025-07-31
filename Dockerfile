# Stage 1: Build Angular app
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --output-path=dist/BizMate.FE --configuration production

# Stage 2: Nginx serve
FROM nginx:stable-alpine

COPY --from=build /app/dist/BizMate.FE /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
