FROM node:16-alpine

WORKDIR /usr/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["npm", "run", "test:e2e"]