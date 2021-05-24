#!/bin/bash
process=false
curl https://data.cquest.org/ign/tree.xml -o ./resources/opendatarchives2.xml

if [ -f "./resources/opendatarchives.xml" ]
then
  old_file=$(md5sum ./resources/opendatarchives.xml | sed 's|  [^ ]\{1,\}$||');
  new_file=$(md5sum ./resources/opendatarchives2.xml | sed 's|  [^ ]\{1,\}$||');
  if [ "$old_file" != "$new_file" ]
  then
    size=$(wc -c ./resources/opendatarchives2.xml | sed 's| [^ ]\{1,\}$||');
    if [ $size -gt 1000 ]
    then
      rm ./resources/opendatarchives.xml
      mv ./resources/opendatarchives2.xml ./resources/opendatarchives.xml
      process=true
    fi
  fi
else
  mv ./resources/opendatarchives2.xml ./resources/opendatarchives.xml
  process=true
fi


if [ "$process" = true ]
then
  echo "opendatarchives = [" > ./resources/opendatarchives.js
  extracted=$(cat ./resources/opendatarchives.xml | grep file | grep "7z\|zip" | sed 's| \{2,\}||' | sed 's|^<file name.\{1,\}org\([^"]\{1,\}\)" size="\([^"]\{1,\}\)" time="\([^"]\{1,\}\)"|{"size":\2,"time":"\3","path":"\1|' | sed 's|/>||' | sed 's|\([^/]\{1,\}\)$|","name":"\1"},|' | sed 's| |T|');
  echo "${extracted::-1}" >> ./resources/opendatarchives.js
  echo "];" >> ./resources/opendatarchives.js

  git config user.name "github-actions (bot)"
  git config user.email ign-bookmarklet@noreply.github.com
  git add ./resources/opendatarchives.xml
  git add ./resources/opendatarchives.js
  git commit -m "Generated new opendatarchives.js"
  git push
fi
