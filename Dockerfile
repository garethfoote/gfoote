FROM ruby:3.2-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates build-essential git \
  && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && npm install -g npm@latest \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

ENV BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_BIN=/usr/local/bundle/bin \
    GEM_HOME=/usr/local/bundle \
    PATH=/usr/local/bundle/bin:/workspace/node_modules/.bin:$PATH

COPY Gemfile Gemfile.lock package.json package-lock.json ./

RUN bundle install && npm install

COPY scripts/dev-docker.sh /usr/local/bin/dev-docker.sh
RUN chmod +x /usr/local/bin/dev-docker.sh

CMD ["dev-docker.sh"]
