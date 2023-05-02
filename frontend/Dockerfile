FROM node:16 as builder

WORKDIR /ryiu/frontend/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Copy output path to default folder for hosting application
# nginx automatically exposes port 80
FROM nginx:alpine
COPY --from=builder /ryiu/frontend/src/app/dist/frontend /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]