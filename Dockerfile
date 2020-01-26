FROM node:12-alpine
WORKDIR /var/scripts/bBot

RUN apk update && apk add yarn python g++ make && rm -rf /var/cache/apk/*

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start-dev"]