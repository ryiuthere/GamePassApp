FROM node:16 as development

#Create app directory in image
WORKDIR /ryiu/backend/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

#Start app from main
CMD ["node", "dist/main"]