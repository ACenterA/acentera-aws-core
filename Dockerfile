FROM node:8-alpine

WORKDIR /usr/app

COPY package.json .
# RUN npm install --quiet
# npm uninstall node-sass && npm install node-sass --sass-binary-name=linux-x64-57

RUN apk add --no-cache make gcc g++ python && \
  npm install && \
  npm rebuild node-sass --force && \
  apk del make gcc g++ python

COPY favicon.ico favicon.ico
COPY .eslintignore .eslintignore
COPY .eslintrc.js .eslintrc.js
COPY .babelrc .babelrc
COPY .postcssrc.js .postcssrc.js
COPY index.html index.html

COPY build build
COPY config config
COPY static static
COPY src src
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9527

ENTRYPOINT [ "/usr/local/bin/entrypoint.sh" ]
CMD ["npm","run", "dev"]
