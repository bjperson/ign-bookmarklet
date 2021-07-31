jQuery('h1').after('<div><div><input type="text" id="values" placeholder="bd topo gpkg 2021" style="height:35px" title="Pour exclure un terme, préfixez le avec le signe moins. Ex: -shp" /><a href="javascript:clear()" style="padding: 7px;border: 1px solid #bababa;border-left: none;font-weight: bold;color: #949494;border-radius: 3px;">X</a> <input type="submit" value="rechercher" onclick="javascript:filterFileNames();" style="height:35px" /> <a href="javascript:filterFileNames(true);">liste de liens</a><span style="float:right;"></span><p><input type="checkbox" id="alt" name="alt" /><label for="alt" style="font-size:small;" title="lorsque disponible"> Proposer des liens opendatarchives.fr</label></p></div><div id="results"></div></div>');

jQuery('.size').css({"float": "right", "font-variant": "super", "color": "#A0A0A0"});
jQuery('body').append('<span id="go-up" onclick="uiScrollTo(\'#nav-header\')" style="position: fixed; right: 5px; bottom: 5px; background-color: #fff; border: 1px solid #bababa; border-radius: 4px; width: 35px; height: 35px; text-align: center; cursor: pointer;">^ ^ ^ ^</span>');

const fnameRegex = /([^\/]{1,})$/;
const altUrl = "https://data.cquest.org/";
const downloadable = jQuery.merge(jQuery("a[href*='7z']"), jQuery("a[href*='zip']"));
var opendatarchive = {};

jQuery('#values').focus();

function filterFileNames(asText = false) {
  jQuery('#results').html('');
  var v = jQuery('#values').val().trim().toUpperCase();
  
  if (v.length > 0) {
    alt = jQuery('#alt').prop("checked");
    arr = [];
    var text = '';
    v = v.split(' ');
    var results = downloadable;
    for (var i in v) {
      if (v[i].startsWith('-')) {
        results = results.not("a[href*='"+v[i].substring(1)+"']");
      }
      else {
        results = results.filter("a[href*='"+v[i]+"']");
      }
    }
    results.each(function() {
      arr.push(jQuery(this).attr("href"));
    });

    if (arr.length > 0) {
      var r = 'résultats';
      if (arr.length === 1) {
        r = 'résultat';
      }

      var size = 0;
      var nosize = 0;

      for (var i in arr.sort()) {
        var fname = arr[i].match(fnameRegex)[1];
        var fnameOA = false;

        if (fname in opendatarchive) {
          fnameOA = fname;
        }
        /* More checks needed to do this :
        else if (fname.replace('.001', '') in opendatarchive) {
          fnameOA = fname.replace('.001', '');
        }
        else if (fname+'.001' in opendatarchive) {
          fnameOA = fname+'.001';
        }
        */

        if (fnameOA === false) {
          nosize += 1;
        }
        else {
          size += opendatarchive[fnameOA].size;
        }

        if (asText) {
          if (alt === true && fnameOA !== false) {
            text += altUrl+opendatarchive[fnameOA].path+fname+"\n";
          }
          else {
            text += arr[i]+"\n";
          }
        }
        else {
          if (alt === true && fnameOA !== false) {
            text += '<a href="'+altUrl+opendatarchive[fnameOA].path+fnameOA+'">'+fname+'<span  class="size">'+formatBytes(opendatarchive[fnameOA].size)+'</span></a><br />'+"\n";
          }
          else if (fnameOA !== false) {
            text += '<a href="'+arr[i]+'">'+fname+'<span class="size">'+formatBytes(opendatarchive[fnameOA].size)+'</span></a><br />'+"\n";
          }
          else {
            text += '<a href="'+arr[i]+'">'+fname+'<span class="size" title="taille inconnue">...</span></a><br />'+"\n";
          }
        }
      }
      
      var results_size = '';
      
      if (size !== 0) {
        results_size += formatBytes(size, 2);
      }
      
      if (nosize !== 0) {
        results_size += ' + '+nosize+' fichiers de taille inconnue';
      }
      
      jQuery('#results').html('<p>'+arr.length+' '+r+' :<span class="size">'+results_size+'</span></p>'+"\n");

      if (asText) {
        jQuery('#results').append('<textarea style="width:100%;height:200px;">'+text+'</textarea>');
        jQuery('.size').css({"float": "right", "font-size": "0.8em", "color": "#A0A0A0"});
      }
      else {
        jQuery('#results').append(text);
  			jQuery('.size').css({"float": "right", "font-size": "0.8em", "color": "#A0A0A0"});
  			jQuery('#results a:hover').css({"background-color": "#dfdfdf"});
      }
    }
    else {
      jQuery('#results').html('<p>Aucun résultat</p>');
    }
  }
}

function clear() {
  jQuery('#values').val('');
  jQuery('#values').focus();
}

function uiScrollTo(id = '#values') {
  document.querySelector(id).scrollIntoView({
    behavior: 'smooth'
  });
}

// from: https://stackoverflow.com/a/18650828
function formatBytes(bytes, decimals = 0) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['b', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

jQuery("#values").keypress(function(event) {
  if (event.keyCode === 13) {
    filterFileNames();
  }
});

jQuery.getScript( "https://bjperson.github.io/ign-bookmarklet/resources/archives.js" )
  .done(function() {
    opendatarchive = {};
    archives.sort((a, b) => {
      if (Date.parse(a.time) > Date.parse(b.time)) return -1
        return Date.parse(a.time) < Date.parse(b.time) ? 1 : 0
    });
    for (var i in archives) {
      if (!(archives[i].name in opendatarchive)) {
        opendatarchive[archives[i].name] = archives[i];
      }
    }
    archives = {};
  });
