FROM node:18-slim
WORKDIR /gateaway-server
COPY . .
RUN ["npm", "install"]
EXPOSE  3000
CMD [ "npm", "run", "start:dev" ]