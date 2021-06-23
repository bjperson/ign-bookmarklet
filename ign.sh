#!/bin/bash
file_changed=${1:-false}

wget -q https://geoservices.ign.fr/documentation/diffusion/telechargement-donnees-libres.html -O ./resources/libre.html

extracted=$(cat ./resources/libre.html | grep href | grep "7z\|zip\|gpkg" | sed 's|[^"]\{1,\}"\([^"]\{1,\}\)".\{1,\}|\1|' | sort | uniq | sed 's|\([^/]\{1,\}\)$| \1|' | sed 's|\([^ ]\{1,\}\) \(.\{1,\}\)|{"path":"\1","name":"\2"},|');
json="[${extracted::-1}]";

if jq -e . >/dev/null 2>&1 <<<"$json"
then
  echo "$json" > ./resources/libre2.json
fi

if [ -f "./resources/libre2.json" ]
then
  if [ -f "./resources/libre.json" ]
  then
    old_file=$(md5sum ./resources/libre.json | sed 's|  [^ ]\{1,\}$||');
    new_file=$(md5sum ./resources/libre2.json | sed 's|  [^ ]\{1,\}$||');
    if [ "$old_file" != "$new_file" ]
    then
      #echo "md5 mismatch";
      old_size=$(wc -c ./resources/libre.json | sed 's| [^ ]\{1,\}$||');
      new_size=$(wc -c ./resources/libre2.json | sed 's| [^ ]\{1,\}$||');
      half_old_size=$(($old_size / 2));
      if [ $new_size -gt $half_old_size ]
      then
        #echo "new file size greater than half of old file size";
        rm ./resources/libre.json
        mv ./resources/libre2.json ./resources/libre.json
        file_changed=true
      fi
    fi
  else
    #echo "First libre.json";
    mv ./resources/libre2.json ./resources/libre.json
    file_changed=true
  fi
fi

if [ "$file_changed" = true ]
then
  python3 atom.py > ./resources/atom.xml
  git config user.name "github-actions (bot)"
  git config user.email ign-bookmarklet@noreply.github.com
  git add ./resources/libre.json
  git add ./resources/atom.xml
  git commit -m "Updated feed"
  git push
fi


