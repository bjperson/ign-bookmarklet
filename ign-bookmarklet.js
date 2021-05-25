$('.lastUpdate').after('<div><div><input type="text" id="values" placeholder="bd topo gpkg 2021" style="height:35px" title="Pour exclure un terme, préfixez le avec le signe moins. Ex: -shp" /><a href="javascript:clear()" style="padding: 7px;border: 1px solid #bababa;border-left: none;font-weight: bold;color: #949494;border-radius: 3px;">X</a> <input type="submit" value="rechercher" onclick="javascript:filterFileNames();" style="height:35px" /> <a href="javascript:filterFileNames(true);">liste de liens</a><p><input type="checkbox" id="alt" name="alt" /><label for="alt" style="font-size:small;" title="lorsque disponible"> Proposer des liens opendatarchives.fr</label></p></div><div id="docs"></div><div id="results"></div></div>');

const docus = {"admin_express": "ADMIN_EXPRESS", "admin_express_cog": "ADMIN_EXPRESS_COG", "adresse_premium": "ADRESSE_PREMIUM", "bdcarthage": "BDCARTHAGE", "bdcarto": "BDCARTO", "bdcarto_em": "BDCARTO_EM", "bdforet": "BDFORET", "bdpr": "BDPR", "bdtopo": "BDTOPO", "bdtopo_postgresql": "BDTOPO_PostGreSQL", "contours_iris": "CONTOURS_IRIS", "dl_commun": "DL_Commun", "donnees_geodesiques": "DONNEES_GEODESIQUES", "ebm": "EBM", "egm": "EGM", "erm": "ERM", "geofla": "GEOFLA", "iris_ge": "IRIS_GE", "ocs_ge": "OCS_GE", "route120": "ROUTE120", "route500": "ROUTE500", "rpg": "RPG", "suivi-des-bocages": "SUIVI DES BOCAGES", "dl_commun-1": "DL_Commun", "plan-ign": "PLAN IGN", "scan_oaci": "SCAN_OACI", "scan25": "SCAN25", "scan50_histo": "SCAN50_HISTO", "scan100": "SCAN100", "scan500": "SCAN500", "scan1000": "SCAN1000", "scanem10k": "SCANEM10K", "scanem40k": "SCANEM40K", "scanreg": "SCANREG", "applications": "APPLICATIONS", "ressources": "RESSOURCES", "bdaltiv2": "BDALTIV2", "histolitt": "HISTOLITT", "litto3d": "LITTO3D", "ref3dnat": "REF3DNAT", "rge_alti": "RGE_ALTI", "territoire3d": "TERRITOIRE3D", "bdortho_orthohr": "BDORTHO_ORTHOHR", "bdorthohisto": "BDORTHOHISTO", "dl_commun-2": "DL_Commun", "ortho-sat": "ORTHO-SAT", "bdparcellaire": "BDPARCELLAIRE", "parcellaire_express_pci": "Parcellaire_Express_PCI", "comparatif_vegetation": "COMPARATIF_VEGETATION", "jpeg2000": "JPEG2000", "metadonnees": "METADONNEES", "projets_carto": "PROJETS_CARTO"};

var links = '<p>Documentation :</p>';
for (var d in docus) {
  links += '<a href="https://geoservices.ign.fr/documentation/diffusion/documentation-offre.html#'+d+'" target="_blank">&#10037; '+docus[d]+'</a>'+"\n";
}
$('#docs').html(links);
$('#docs a').css({"border": "1px solid #bababa", "border-radius": "4px", "font-size": "0.7em", "padding": "2px 5px", "margin": "0 5px 8px 0", "display": "inline-block"});
$('.size').css({"float": "right", "font-variant": "super", "color": "#A0A0A0"});

const documentation = $("#docs a");
const fnameRegex = /([^\/]{1,})$/;
const altUrl = "https://data.cquest.org";
const downloadable = $.merge($("a[href*='7z']"), $("a[href*='zip']"));
var opendatarchive = {};

$('#values').focus();

function filterFileNames(asText = false) {
  $('#results').html('');
  var v = $('#values').val().trim().toUpperCase();
  
  if (v.length > 0) {
    $('#docs a').css('display', 'none');
    alt = $('#alt').prop("checked");
    arr = [];
    var text = '';
    v = v.split(' ');
    var results = downloadable;
    var docs = documentation;
    for (var i in v) {
      if (v[i].startsWith('-')) {
        results = results.not("a[href*='"+v[i].substring(1)+"']")
        $("#docs a:contains('"+v[i].substring(1)+"')").css('display', 'none');
      }
      else {
        results = results.filter("a[href*='"+v[i]+"']");
        $("#docs a:contains('"+v[i]+"')").css('display', 'inline-block');
      }
    }
    results.each(function() {
      arr.push($(this).attr("href"));
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
            text += '<a href="'+arr[i]+'">'+fname+'</a><br />'+"\n";
          }
        }
      }
      
      var results_size = '';
      
      if (size !== 0) {
        results_size += formatBytes(size)
      }
      
      if (nosize !== 0) {
        results_size += ' + '+nosize+' fichiers de taille inconnue'
      }

      if (asText) {
        $('#results').html('<p title="'+results_size+'">'+arr.length+' '+r+' :</p><textarea style="width:100%;height:200px;">'+text+'</textarea>');
      }
      else {
        $('#results').html('<p title="'+results_size+'">'+arr.length+' '+r+' :</p>'+"\n"+text);
  			$('.size').css({"float": "right", "font-variant": "super", "color": "#A0A0A0"});
      }
    }
    else {
      $('#results').html('<p>Aucun résultat</p>');
    }
  }
  else {
    $('#docs a').css('display', 'inline-block');
  }
}

function clear() {
  $('#values').val('');
  $('#values').focus();
}

$("#values").keypress(function(event) {
  if (event.keyCode === 13) {
    filterFileNames();
  }
});

// from: https://stackoverflow.com/a/18650828
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['b', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

$.getScript( "https://bjperson.github.io/ign-bookmarklet/resources/opendatarchives.js" )
  .done(function() {
    opendatarchive = {};
    opendatarchives.sort((a, b) => {
      if (Date.parse(a.time) > Date.parse(b.time)) return -1
        return Date.parse(a.time) < Date.parse(b.time) ? 1 : 0
    });
    for (var i in opendatarchives) {
      if (!(opendatarchives[i].name in opendatarchive)) {
        opendatarchive[opendatarchives[i].name] = opendatarchives[i];
      }
    }
    opendatarchives = {};
  });
