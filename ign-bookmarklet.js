$('.lastUpdate').after('<div><div><input type="text" id="values" placeholder="bd topo gpkg 2021" style="height:35px" title="Pour exclure un terme, préfixez le avec le signe moins. Ex: -shp" /><a href="javascript:clear()" style="padding: 7px;border: 1px solid #bababa;border-left: none;font-weight: bold;color: #949494;border-radius: 3px;">X</a> <input type="submit" value="rechercher" onclick="javascript:filterFileNames();" style="height:35px" /> <a href="javascript:filterFileNames(true);">liste de liens</a></div><div id="results"></div></div>');
const fname = /([^\/]{1,})$/;
const downloadable = $.merge($("a[href*='7z']"), $("a[href*='zip']"));
$('#values').focus();

function filterFileNames(asText = false) {
  $('#results').html('');
  arr = [];
  var text = '';
  var v = $('#values').val().trim().toUpperCase().split(' ');
  var results = downloadable;
  for (var i in v) {
    if (v[i].startsWith('-')) {
      results = results.not("a[href*='"+v[i].substring(1)+"']")
    }
    else {
      results = results.filter("a[href*='"+v[i]+"']")
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
        text += arr[i]+"\n";
      }
      $('#results').html('<p>'+arr.length+' '+r+' :</p><textarea style="width:100%;height:200px;">'+text+'</textarea>');
    }
    else {
      for (var i in arr.sort()) {
        var match = arr[i].match(fname);
        text += '<a href="'+arr[i]+'">'+match[1]+'</a><br />'+"\n";
      }
      $('#results').html('<p>'+arr.length+' '+r+' :</p>'+"\n"+text);
    }
  }
  else {
    $('#results').html('<p>Aucun résultat</p>');
  }
}

$("#values").keypress(function(event) {
  if (event.keyCode === 13) {
    filterFileNames();
  }
});

function clear() {
  $('#values').val('');
  $('#values').focus();
}
