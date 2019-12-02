# https://www.digitalocean.com/community/tutorials/how-to-build-a-node-js-application-with-docker
FROM node:10-alpine

WORKDIR /home/node/app

# Adding this COPY instruction before running npm install or copying the application
# code allows us to take advantage of Docker’s caching mechanism.
# At each stage in the build, Docker will check to see if it has a layer cached for that particular instruction.
# If we change package.json, this layer will be rebuilt, but if we don’t,
# this instruction will allow Docker to use the existing image layer and skip reinstalling our node modules.
COPY package*.json ./

# Install the NPM deps
RUN npm install

# Copy our app files
COPY . /home/node/app

# Build the Typescript files
RUN npm run build

# Remove devDepedencies
RUN npm prune --production

EXPOSE 8080

CMD [ "npm", "start" ]
