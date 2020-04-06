FROM node:13.12
WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
COPY . .