# Stage 1: Build Angular app
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --output-path=dist --configuration production

# Stage 2: Nginx serve
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Replace default nginx config if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
