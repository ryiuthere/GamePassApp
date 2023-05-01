FROM node:16 as development

WORKDIR /ryiu/frontend/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 4200

# Copy output path to default folder for hosting application
FROM nginx:alpine
COPY --from=development /ryiu/frontend/src/app/dist/frontend ./usr/share/nginx/html