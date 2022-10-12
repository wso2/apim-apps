FROM node:16-alpine
WORKDIR /app
COPY . .
RUN npm i
RUN ls
RUN echo "$PWD"
RUN npm install
RUN npm run react-prod
EXPOSE 4000
CMD ["npm", "run", "start"]