#!/bin/sh

SCRIPT=`readlink -f "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`
VERSION=`cat $SCRIPTPATH/../dist/manifest.json | jq -r .version`
(cd "$SCRIPTPATH"/../dist && zip -r -FS ../whereami-v$VERSION.xpi *)