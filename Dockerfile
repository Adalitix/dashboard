# Multi stage build

# Stage 1
FROM node:9.11.1 as ui-builder
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json /usr/src/app/package.json
#COPY package-lock.json /usr/src/app/package-lock.json

RUN npm i npm@6.0.1 -g
RUN npm i react-scripts@1.1.1 -g
RUN npm i

COPY public /usr/src/app/public
COPY src /usr/src/app/src
RUN npm run build

# Stage 2
FROM nginx:1.13.9-alpine
#RUN rm -rf /etc/nginx/conf.d
COPY nginx/nginx.conf /etc/nginx/conf.d/nginx.conf
COPY --from=ui-builder /usr/src/app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]