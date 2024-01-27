dist:
	cd public/ && zip -r -FS ../whereami-v$(shell jq -r .version public/manifest.json).xpi *