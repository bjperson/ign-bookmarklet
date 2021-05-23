$('.lastUpdate').after('<div><div><input type="text" id="values" placeholder="bd topo gpkg 2021" style="height:35px" title="Pour exclure un terme, préfixez le avec le signe moins. Ex: -shp" /><a href="javascript:clear()" style="padding: 7px;border: 1px solid #bababa;border-left: none;font-weight: bold;color: #949494;border-radius: 3px;">X</a> <input type="submit" value="rechercher" onclick="javascript:filterFileNames();" style="height:35px" /> <a href="javascript:filterFileNames(true);">liste de liens</a><p><input type="checkbox" id="alt" name="alt" /><label for="alt" style="font-size:small;" title="lorsque disponible"> Privilégier opendatarchives.fr</label></p></div><div id="docs"></div><div id="results"></div></div>');

const docus = {"admin_express": "ADMIN_EXPRESS", "admin_express_cog": "ADMIN_EXPRESS_COG", "adresse_premium": "ADRESSE_PREMIUM", "bdcarthage": "BDCARTHAGE", "bdcarto": "BDCARTO", "bdcarto_em": "BDCARTO_EM", "bdforet": "BDFORET", "bdpr": "BDPR", "bdtopo": "BDTOPO", "bdtopo_postgresql": "BDTOPO_PostGreSQL", "contours_iris": "CONTOURS_IRIS", "dl_commun": "DL_Commun", "donnees_geodesiques": "DONNEES_GEODESIQUES", "ebm": "EBM", "egm": "EGM", "erm": "ERM", "geofla": "GEOFLA", "iris_ge": "IRIS_GE", "ocs_ge": "OCS_GE", "route120": "ROUTE120", "route500": "ROUTE500", "rpg": "RPG", "suivi-des-bocages": "SUIVI DES BOCAGES", "dl_commun-1": "DL_Commun", "plan-ign": "PLAN IGN", "scan_oaci": "SCAN_OACI", "scan25": "SCAN25", "scan50_histo": "SCAN50_HISTO", "scan100": "SCAN100", "scan500": "SCAN500", "scan1000": "SCAN1000", "scanem10k": "SCANEM10K", "scanem40k": "SCANEM40K", "scanreg": "SCANREG", "applications": "APPLICATIONS", "ressources": "RESSOURCES", "bdaltiv2": "BDALTIV2", "histolitt": "HISTOLITT", "litto3d": "LITTO3D", "ref3dnat": "REF3DNAT", "rge_alti": "RGE_ALTI", "territoire3d": "TERRITOIRE3D", "bdortho_orthohr": "BDORTHO_ORTHOHR", "bdorthohisto": "BDORTHOHISTO", "dl_commun-2": "DL_Commun", "ortho-sat": "ORTHO-SAT", "bdparcellaire": "BDPARCELLAIRE", "parcellaire_express_pci": "Parcellaire_Express_PCI", "comparatif_vegetation": "COMPARATIF_VEGETATION", "jpeg2000": "JPEG2000", "metadonnees": "METADONNEES", "projets_carto": "PROJETS_CARTO"};

var links = '<p>Documentation :</p>';
for (var d in docus) {
  links += '<a href="https://geoservices.ign.fr/documentation/diffusion/documentation-offre.html#'+d+'" target="_blank">&#10037; '+docus[d]+'</a>'+"\n";
}
$('#docs').html(links);
$('#docs a').css({"border": "1px solid #bababa", "border-radius": "4px", "font-size": "0.7em", "padding": "2px 5px", "margin": "0 5px 8px 0", "display": "inline-block"});

const documentation = $("#docs a");
const fname = /([^\/]{1,})$/;
const altUrl = "https://data.cquest.org";
const downloadable = $.merge($("a[href*='7z']"), $("a[href*='zip']"));

$('#values').focus();

function filterFileNames(asText = false) {
  $('#results').html('');
  $('#docs a').css('display', 'none');
  alt = $('#alt').prop("checked");
  arr = [];
  var text = '';
  var v = $('#values').val().trim().toUpperCase().split(' ');
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
    if (asText) {
      for (var i in arr.sort()) {
        if (alt) {
          var match = arr[i].match(fname);
          if (match[1] in opendatarchives) {
            text += altUrl+opendatarchives[match[1]]+match[1]+"\n";
          }
          else {
            text += arr[i]+"\n";
          }
        }
        else {
          text += arr[i]+"\n";
        }
      }
      $('#results').html('<p>'+arr.length+' '+r+' :</p><textarea style="width:100%;height:200px;">'+text+'</textarea>');
    }
    else {
      for (var i in arr.sort()) {
        var match = arr[i].match(fname);
        if (alt) {
          if (match[1] in opendatarchives) {
            text += '<a href="'+altUrl+opendatarchives[match[1]]+match[1]+'">'+match[1]+'</a><br />'+"\n";
          }
          else {
            text += '<a href="'+arr[i]+'">'+match[1]+'</a><br />'+"\n";
          }
        }
        else {
          text += '<a href="'+arr[i]+'">'+match[1]+'</a><br />'+"\n";
        }
      }
      $('#results').html('<p>'+arr.length+' '+r+' :</p>'+"\n"+text);
    }
  }
  else {
    $('#results').html('<p>Aucun résultat</p>');
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

$.getScript("https://bjperson.github.io/ign-bookmarklet/resources/extract.js");
