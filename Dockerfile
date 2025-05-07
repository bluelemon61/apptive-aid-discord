## build runner
FROM node:lts-alpine as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json .

# Install dependencies
RUN corepack enable && pnpm install

# Move source files
COPY src ./src
COPY tsconfig.json   .

# Generate DB
COPY prisma ./prisma
RUN pnpm dlx prisma@6.7.0 generate

# Build project
RUN pnpm run build

## production runner
FROM node:lts-alpine as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json

# install openssl
RUN apk add --no-cache openssl

# Install dependencies
RUN corepack enable && pnpm install --production

# Move build files
COPY --from=build-runner /tmp/app/build /app/build
COPY --from=build-runner /tmp/app/prisma /app/prisma

# generate db
RUN npx prisma@6.7.0 generate

# Start bot
CMD [ "pnpm", "start" ]
