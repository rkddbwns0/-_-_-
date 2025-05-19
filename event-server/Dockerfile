FROM node:18-slim
WORKDIR /event-server
COPY . .
RUN ["npm", "install"]
EXPOSE  3002
CMD [ "npm", "run", "start:dev" ]