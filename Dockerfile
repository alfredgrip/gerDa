FROM node:alpine

ENV TZ=Etc/UTC

RUN apk update && apk upgrade && apk add texlive-full

# Create user
RUN addgroup -S user && adduser -S user -G user

RUN mkdir -p /home/user

WORKDIR /home/user

COPY . .

RUN chown -R user:user /home/user

USER user

EXPOSE 3000

RUN npm install express
RUN npm install multer

CMD ["node", "index.js"]