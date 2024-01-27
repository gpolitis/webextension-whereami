#!/bin/sh

SCRIPT=`readlink -f "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`
VERSION=`cat $SCRIPTPATH/../manifest.json | jq -r .version`
(cd "$SCRIPTPATH"/.. && zip -r -FS whereami-v$VERSION.xpi * -x ./.git/\* -x \*.xpi -x ./scripts/\* -x '**/.DS_Store' -x ./node_modules\* -x ./.idea\* -x package*.json)