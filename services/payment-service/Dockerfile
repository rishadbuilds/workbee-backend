FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    npx prisma generate --schema=prisma/schema.prisma

RUN npm run build

EXPOSE 4005

CMD ["npm", "start"]