FROM node:20-alpine
WORKDIR /app

COPY . /app

RUN npm install
RUN npm run -w @repo/shared build --if-present
RUN npm run -w @repo/inputs-svc prisma:generate
RUN npm run -w @repo/shared build --if-present

CMD ["sh", "-c", "npm run -w @repo/inputs-svc start:migrate"]
