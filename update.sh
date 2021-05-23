#!/bin/bash
curl https://data.cquest.org/ign/tree.json -o ./resources/opendatarchives2.json
process=false

if [ -f "./resources/opendatarchives.json" ]
then
  old_file=$(md5sum ./resources/opendatarchives.json | sed 's|  [^ ]$||');
  new_file=$(md5sum ./resources/opendatarchives2.json | sed 's|  [^ ]$||');
  if [ "$old_file" != "$new_file" ]
  then
    rm ./resources/opendatarchives.json
    mv ./resources/opendatarchives2.json ./resources/opendatarchives.json
    process=true
  fi
else
  mv ./resources/opendatarchives2.json ./resources/opendatarchives.json
  process=true
fi


if [ "$process" = true ]
then
  echo "opendatarchives = {" > ./resources/extract.js
  extracted=$(cat ./resources/opendatarchives.json | grep name | sed 's| ||g' | sed 's|^"name.\{1,\}org||' | sort | uniq | grep "7z\|zip" | sed 's|\([^/]\{1,\}\)$| \1|' | sed 's|\([^ ]\{1,\}\) \([^"]\{1,\}\)|"\2": "\1|');
  echo "${extracted::-1}" >> ./resources/extract.js
  echo "}" >> ./resources/extract.js
  
  git config user.name github-actions (bot)
  git config user.email github-actions@github.com
  git add ./resources/opendatarchives.json
  git add ./resources/extract.js
  git commit -m "generated extract"
  git push
fi
