FROM oven/bun:latest
WORKDIR /app
COPY package.json .
COPY akfu-backend.ts .
RUN bun install
EXPOSE 3000
CMD ["bun", "run", "akfu-backend.ts"]
