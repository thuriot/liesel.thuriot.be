ARG RUBY_VERSION=2.3.1
ARG NODE_VERSION=10.15

FROM node:$NODE_VERSION-alpine AS nodejs
FROM ruby:$RUBY_VERSION-alpine

RUN addgroup -g 1000 node \
  && adduser -u 1000 -G node -s /bin/sh -D node \
  && apk add --no-cache \
    libstdc++ \
    bash

COPY --from=nodejs /usr/local/bin/node /usr/local/bin/
COPY --from=nodejs /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=nodejs /opt/ /opt/

RUN ln -sf /usr/local/bin/node /usr/local/bin/nodejs \
  && ln -sf ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
  && ln -sf ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
  && ln -sf /opt/yarn*/bin/yarn /usr/local/bin/yarn \
  && ln -sf /opt/yarn*/bin/yarnpkg /usr/local/bin/yarnpkg

ENV NOKOGIRI_USE_SYSTEM_LIBRARIES=true

RUN apk add --no-cache bash

RUN /bin/sh
RUN apk update && apk add --virtual build-dependencies build-base
RUN apk add --update \
  build-base \
  libxml2-dev \
  libxslt-dev \
  postgresql-dev \
  && rm -rf /var/cache/apk/*

ENV BUNDLER_VERSION=2.1.4

RUN gem update --system && \
    gem install bundler:2.1.4

# Use libxml2, libxslt a packages from alpine for building nokogiri
RUN bundle config build.nokogiri --use-system-libraries

RUN gem install pygments.rb --version "=0.5.0"

# This hack is widely applied to avoid python printing issues in docker containers.
# See: https://github.com/Docker-Hub-frolvlad/docker-alpine-python3/pull/13
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache py-pip

RUN apk add --update --no-cache openjdk8

ENTRYPOINT "/usr/src/app/build.sh"