FROM node:18-alpine
WORKDIR /findmecalendartime-backend
COPY . .
RUN npm install --production
CMD ["node", "app.js"]
EXPOSE 5000