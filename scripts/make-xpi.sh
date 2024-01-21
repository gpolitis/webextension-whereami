#!/bin/sh

SCRIPT=`readlink -f "$0"`
SCRIPTPATH=`dirname "$SCRIPT"`

(cd "$SCRIPTPATH"/.. && zip -r -FS whereami.zip * -x ./.git/\* --exclude whereami.zip --exclude ./scripts/\*)