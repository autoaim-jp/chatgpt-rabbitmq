FROM node:20-slim

WORKDIR /app

COPY ./service/apiServer/src/package.json /app/

RUN yarn install

COPY ./service/apiServer/src /app

