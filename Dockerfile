# Stage 1: Buil stage
# Parent(base) image to use as a astarting point
# Use node version 18.16.0

FROM --platform=linux/arm64/v8 node:18.16.0-alpine AS build

LABEL maintainer="Fevin Patel <fevin.tech@aol.com>"
LABEL description="Fragments node.js microservice - Build stage"

# Setting up environmet variables 

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# explicit path - Copy the package.json and package-lock.json
# files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# that `app` is a directory and not a file.
COPY package*.json /app/ 

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Stage 2: Production stage
FROM --platform=linux/arm64/v8 node:18.16.0-alpine AS production
LABEL description="Fragments node.js microservice - Production Stage"

ENV PORT=8080

# Use /app as our working directory
WORKDIR /app

# Copy the built files from the previous stage
COPY --from=build /app /app

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD ["npm", "start"]

# Port that container will listen to. We run our service on port 8080
EXPOSE 8080
