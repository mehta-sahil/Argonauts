#!/bin/sh
# Swap the proxy config in once the backends actually resolve.
#
# Two facts drive this. First, nginx resolves a literal proxy_pass hostname at
# config-load time and exits if it fails, so it cannot start before its
# upstreams exist. Second, Lightsail publishes container names through
# /etc/hosts rather than DNS, so nginx's own `resolver` directive - which does
# DNS only - can never see them. That rules out the usual workaround of putting
# the host in a variable.
#
# So: boot on the static-only config, then poll with getent (which reads
# /etc/hosts and DNS both, exactly like nginx does at load time) until every
# backend is present, and reload into the full config.
#
# Runs in the background so the entrypoint proceeds to start nginx at once.

FULL=/etc/nginx/nginx.full.conf
LIVE=/etc/nginx/conf.d/default.conf
HOSTS="kyc-backend pushpay chatbot voiceauth"
DEADLINE=$(( $(date +%s) + 600 ))

(
  while :; do
    missing=""
    for h in $HOSTS; do
      getent hosts "$h" >/dev/null 2>&1 || missing="$missing $h"
    done

    if [ -z "$missing" ]; then
      cp "$FULL" "$LIVE"
      if nginx -t >/dev/null 2>&1; then
        nginx -s reload
        echo "[upstream-wait] all backends resolved - proxy routes are live"
      else
        # Never leave a broken config behind; the site keeps serving static.
        echo "[upstream-wait] full config failed to validate, staying on bootstrap"
        nginx -T >/dev/null 2>&1
      fi
      exit 0
    fi

    if [ "$(date +%s)" -ge "$DEADLINE" ]; then
      echo "[upstream-wait] gave up after 10m; still missing:$missing"
      echo "[upstream-wait] static site stays up, proxy routes return 503"
      exit 1
    fi

    echo "[upstream-wait] waiting for:$missing"
    sleep 5
  done
) &
