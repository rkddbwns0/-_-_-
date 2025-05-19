FROM node:18-slim
WORKDIR /auth-server
COPY . .
RUN ["npm", "install"]
EXPOSE  3001
CMD [ "npm", "run", "start:dev" ]

