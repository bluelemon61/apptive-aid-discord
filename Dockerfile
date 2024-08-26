## build runner
FROM node:lts-alpine as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json .

# Install dependencies
RUN corepack enable && yarn

# Move source files
COPY src ./src
COPY tsconfig.json   .

# Generate DB
COPY prisma ./prisma
RUN yarn prisma generate

# Build project
RUN yarn build

## production runner
FROM node:lts-alpine as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json

# Install dependencies
RUN yarn install --production

# Move build files
COPY --from=build-runner /tmp/app/build /app/build
COPY --from=build-runner /tmp/app/prisma /app/prisma

# generate db
RUN npx prisma generate

# Start bot
CMD [ "yarn", "start" ]
