FROM node:10.16.0

WORKDIR /app

COPY . .
RUN npm install
RUN npx link-module-alias

EXPOSE 3000
CMD npm run start