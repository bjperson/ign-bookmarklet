#!/bin/bash
file_changed=false
wget -q -r -l4 -np -nH -E -A "*.html" –spider -D data.cquest.org https://data.cquest.org/ign/

> ./resources/temp.txt

for index in $(find ./ign/ -name "*.html")
do
  p=$(echo $index | sed 's|index.html||') ;
  path=${p:2} ;
  cat $index | grep href | grep "7z\|zip\|gpkg" | grep -v torrent | sed 's| \{2,\}| |g' | sed 's|^.\{1,\}href="\([^"]\{1,\}\)"[^ ]\{1,\} \([^-]\{1,\}\)-\([^-]\{1,\}\)-\([^ ]\{1,\}\) \([^ ]\{1,\}\) \([0-9]\{1,\}\)|{"name":"\1","time":"\4-\3-\2T\5","size":\6,#|' | sed "s|#|\"path\":\"$path\"},|" | sort | uniq | grep "{" >> ./resources/temp.txt;
done

declare -A months
months=([Jan]='01' [Feb]='02' [Mar]='03' [Apr]='04' [May]='05' [Jun]='06' [Jul]='07' [Aug]='08' [Sep]='09' [Oct]='10' [Nov]='11' [Dec]='12') ;

for key in "${!months[@]}"
do
  sed -i "s/-$key-/-${months[$key]}-/" ./resources/temp.txt
done

extracted=$(cat ./resources/temp.txt);
json="[${extracted::-2}]";

if jq -e . >/dev/null 2>&1 <<<"$json"
then
  echo "archives = $json;" > ./resources/archives2.js
fi

if [ -f "./resources/archives.js" ]
then
  old_file=$(md5sum ./resources/archives.js | sed 's|  [^ ]\{1,\}$||');
  new_file=$(md5sum ./resources/archives2.js | sed 's|  [^ ]\{1,\}$||');
  if [ "$old_file" != "$new_file" ]
  then
    #echo "md5 mismatch";
    old_size=$(wc -c ./resources/archives.js | sed 's| [^ ]\{1,\}$||');
    new_size=$(wc -c ./resources/archives2.js | sed 's| [^ ]\{1,\}$||');
    half_old_size=$(($old_size / 2));
    if [ $new_size -gt $half_old_size ]
    then
      #echo "new file size greater than half of old file size";
      rm ./resources/archives.js
      mv ./resources/archives2.js ./resources/archives.js
      file_changed=true
    fi
  fi
else
  #echo "First archives.js";
  mv ./resources/archives2.js ./resources/archives.js
  file_changed=true
fi

if [ "$file_changed" = true ]
then
  git config user.name "github-actions (bot)"
  git config user.email ign-bookmarklet@noreply.github.com
  git add ./resources/archives.js
  git commit -m "Generated new archives.js"
  git push
fi
