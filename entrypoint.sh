#!/bin/sh
if [ -n "${SITE_TITLE}" ]; then
  [ -e dist/index.html ] && sed -ri "s/%%TITLE%%/${SITE_TITLE}/g" dist/index.html
  [ -e index.html ] && sed -ri "s/%%TITLE%%/${SITE_TITLE}/g" index.html
fi
npm rebuild node-sass
exec $@
