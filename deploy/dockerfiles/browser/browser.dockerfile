FROM node:14.15.2-alpine

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

USER node

ENV NODE_ENV=production

# Install dependencies
COPY --chown=node:node package.json .
COPY --chown=node:node browser/package.json browser/package.json
COPY --chown=node:node yarn.lock .
RUN yarn install --production false --frozen-lockfile && yarn cache clean

# Copy source
COPY --chown=node:node babel.config.js .
COPY --chown=node:node browser browser

# Build
COPY --chown=node:node browser/build.env .
RUN export $(cat build.env | xargs); cd browser && yarn run build

# Compress static files for use with nginx's gzip_static
RUN find browser/dist/public -type f | grep -E '\.(css|html|js|json|map|svg|xml)$' \
  | xargs -I{} -n1 sh -c 'gzip -9 -c "$1" > "$1".gz; MTIME=$(date -R -r "$1" +"%Y-%m-%d %H:%M:%S"); touch -d "$MTIME" "$1.gz"' -- {}

###############################################################################
FROM nginx:stable-alpine

COPY --from=0 /home/node/app/browser/dist/public /usr/share/nginx/html

COPY deploy/dockerfiles/browser/browser-base.nginx.conf /etc/nginx/browser-base.nginx.conf.template
COPY deploy/dockerfiles/browser/browser.nginx.conf /etc/nginx/conf.d/default.conf

CMD REAL_IP_CONFIG=$([ -z "${PROXY_IPS:-}" ] || echo "$PROXY_IPS" | awk 'BEGIN { RS="," } { print "set_real_ip_from " $1 ";" }') \
  envsubst "\$API_URL \$REAL_IP_CONFIG" < /etc/nginx/browser-base.nginx.conf.template > /etc/nginx/browser-base.nginx.conf && \
  nginx -g "daemon off;"
