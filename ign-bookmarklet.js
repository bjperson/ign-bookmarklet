$('.lastUpdate').after('<div><div><input type="text" id="values" placeholder="bd topo gpkg 2021" /><input type="submit" value="rechercher" onclick="javascript:filterFileNames();" /> <a href="javascript:filterFileNames(true);">liste de liens</a></div><div id="results"></div></div>')
const fname = /([^\/]{1,})$/;

function filterFileNames(asText = false) {
  $('#results').html('');
  arr = [];
  var text = '';
  var v = $('#values').val().trim().toUpperCase().split(' ');
  var results = $("a[href*='7z']");
  for (var i in v) {
    results = results.filter("a[href*='"+v[i]+"']")
  }
  results.each(function() {
    arr.push($(this).attr("href"));
  });
  if (arr.length > 0) {
    if (asText) {
      for (var i in arr.sort()) {
        text += arr[i]+"\n";
      }
      $('#results').html('<p>'+arr.length+' résultats</p><textarea style="width:100%;height:200px;">'+text+'</textarea>');
    }
    else {
      text += '<p>'+arr.length+' résultat(s)</p>';
      for (var i in arr.sort()) {
        var match = arr[i].match(fname);
        text += '<a href="'+arr[i]+'">'+match[1]+'</a><br />'+"\n";
      }
      $('#results').html(text);
    }
  }
}

$("#values").keypress(function(event) {
  if (event.keyCode === 13) {
    filterFileNames();
  }
});
