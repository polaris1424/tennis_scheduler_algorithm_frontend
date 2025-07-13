# use the official Node.js to build the image
FROM node:18 AS builder

# setup the wirking directory
WORKDIR /app

# copy package.json & yarn.lock
COPY package.json yarn.lock ./

# install dependencies 
RUN yarn install

# copy all project files
COPY . .

# construct the static website
RUN yarn build

# # default to expose port 3000
EXPOSE 3000
CMD ["yarn", "start"]