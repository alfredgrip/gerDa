FROM node:alpine

ENV TZ=Etc/UTC

RUN apk update && apk upgrade && apk add texlive-full busybox-suid

# Create user
RUN addgroup -S user && adduser -S user -G user

RUN mkdir -p /home/user

WORKDIR /home/user
COPY . .

RUN echo "0 6 * * * ~/cleanjob.sh && echo cleaned" >> cleanjob
RUN crontab cleanjob
RUN rm cleanjob

RUN chown -R user:user /home/user
RUN chmod u+x cleanjob.sh

USER user

RUN mkdir -p input
RUN mkdir -p output
RUN mkdir -p logs


EXPOSE 3000

RUN npm install

RUN npm run build

CMD npm run start