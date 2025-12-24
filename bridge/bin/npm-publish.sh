#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

npm_rootdir="${DIR}/.."
old_README="${npm_rootdir}/README.md"
new_README="${npm_rootdir}/../README.md"

[ -f "$old_README" ] && rm -f "$old_README"
cp "$new_README" "$old_README"

cd "$npm_rootdir"
npm publish --access=public
