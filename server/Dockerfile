FROM node:22.11.0

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

EXPOSE 5000

CMD ["pnpm", "run", "dev"]