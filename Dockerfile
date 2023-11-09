# FROM node:alpine

# EXPOSE 3000

# RUN npm install

# RUN npm run build

# CMD ORIGIN=http://localhost:3000 node build/index.js

# FROM node:18-alpine AS builder
# WORKDIR /app
# COPY package*.json .
# RUN npm ci
# COPY . .
# RUN npm run build
# RUN npm prune --production

# FROM node:18-alpine
# ENV TZ=Etc/UTC
# RUN apk update && apk upgrade && apk add texlive-full busybox-suid
# WORKDIR /app
# RUN mkdir -p input
# RUN mkdir -p output
# RUN mkdir -p logs
# COPY --from=builder /app/build build/
# COPY --from=builder /app/node_modules node_modules/
# COPY --from=builder /app/fileServer.js .
# COPY package.json .
# EXPOSE 3000
# ENV NODE_ENV=production
# CMD ORIGIN=http://localhost:3000 node fileServer.js

FROM node:alpine
# RUN apk update && apk upgrade && apk add texlive-full pandoc
RUN apk update && apk upgrade && apk add tectonic pandoc wget unzip
ENV TZ=Etc/UTC
WORKDIR /app
COPY . .

RUN wget https://github.com/Dsek-LTH/dsekdocs/archive/refs/heads/main.zip
RUN unzip main.zip
RUN mkdir -p tex
RUN mv dsekdocs-main/* tex/

RUN tectonic -X compile GUIDE.tex -Z search-path=tex -Z continue-on-errors
RUN mv GUIDE.pdf static/GUIDE.pdf

COPY package*.json .
RUN npm install
RUN npm run build
EXPOSE 3000
ENV NODE_ENV=production
# Change this to the domain you are using
# i.e. CMD ORIGIN=https://gerda.dsek.se node fileServer.js
CMD ORIGIN=http://localhost:3000 node fileServer.js
