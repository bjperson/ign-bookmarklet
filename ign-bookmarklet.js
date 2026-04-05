(function() {
  'use strict';

  if (document.getElementById('ign-bm')) return;

  var GEOPF_BASE = 'https://data.geopf.fr/telechargement/download/';
  var ALT_BASE = 'https://data.cquest.org/';
  var ARCHIVES_URL = 'https://bjperson.github.io/ign-bookmarklet/resources/archives.js';

  var PAGE_SIZE = 20;
  var archiveEntries = [];
  var datasetHint = '';
  var lastMatches = [];
  var currentPage = 0;

  function getDatasetHint() {
    var m = window.location.pathname.match(/\/dataset\/(?:IGNF_)?(.+)$/);
    if (!m) return '';
    return m[1].replace(/-/g, ' ');
  }

  // Mapping: filename prefix from archives.js → geopf resource ID
  var GEOPF_RESOURCES = {
    'ADMIN-EXPRESS': 'ADMIN-EXPRESS',
    'ADMIN-EXPRESS-COG-CARTO-PE': 'ADMIN-EXPRESS-COG-CARTO-PE',
    'ADMIN-EXPRESS-COG-CARTOPLUS': 'ADMIN-EXPRESS-COG-CARTOPLUS',
    'ADMIN-EXPRESS-COG-CARTO': 'ADMIN-EXPRESS-COG-CARTO',
    'ADMIN-EXPRESS-COG': 'ADMIN-EXPRESS-COG',
    'BAN-PLUS': 'BAN-PLUS',
    'BDALTIV2': 'BDALTI',
    'BDCARTO': 'BDCARTO',
    'BDFORET': 'BDFORET',
    'BDORTHO': 'BDORTHO',
    'BDPARCELLAIRE': 'BDPARCELLAIRE',
    'BDTOPO-DIFF': 'BDTOPO-DIFF',
    'BDTOPO': 'BDTOPO',
    'CONTOURS-IRIS': 'CONTOURS-IRIS',
    'GEODESIE': 'GEODESIE',
    'GEOFLA': 'GEOFLA',
    'IRIS-GE': 'IRIS-GE',
    'MNS-Correl': 'MNS-CORREL',
    'RGEALTI': 'RGEALTI',
    'ROUTE500': 'ROUTE500',
    'RPG': 'RPG',
    'SCAN1000': 'SCAN1000',
    'SCAN500': 'SCAN500',
    'SCAN50': 'SCAN50',
    'SCANEM10K': 'SCANEM10K',
    'SCANEM40K': 'SCANEM40K',
    'SCANREG': 'SCANREG'
  };

  function getGeopfResourceId(name) {
    var keys = Object.keys(GEOPF_RESOURCES).sort(function(a, b) { return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
      if (name.toUpperCase().indexOf(keys[i].toUpperCase()) === 0) {
        return GEOPF_RESOURCES[keys[i]];
      }
    }
    return null;
  }

  function buildDownloadUrl(entry) {
    var resourceId = getGeopfResourceId(entry.name);
    if (!resourceId) return ALT_BASE + entry.path + entry.name;
    var entryName = entry.name.replace(/\.(7z|zip)(\.\d+)?$/i, '');
    return GEOPF_BASE + resourceId + '/' + entryName + '/' + entry.name;
  }

  function buildAltUrl(entry) {
    return ALT_BASE + entry.path + entry.name;
  }

  function formatBytes(bytes, decimals) {
    if (!bytes) return '0 b';
    var k = 1024;
    var dm = decimals > 0 ? decimals : 0;
    var sizes = ['b', 'Ko', 'Mo', 'Go', 'To'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function buildSummary(matches) {
    var totalSize = 0;
    var unknownCount = 0;
    for (var i = 0; i < matches.length; i++) {
      if (matches[i].size) totalSize += matches[i].size;
      else unknownCount++;
    }
    var summary = matches.length + ' résultat' + (matches.length > 1 ? 's' : '');
    if (totalSize > 0) summary += ' — ' + formatBytes(totalSize, 2);
    if (unknownCount > 0) summary += ' + ' + unknownCount + ' de taille inconnue';
    return summary;
  }

  function renderPage() {
    var listDiv = document.getElementById('ign-bm-list');
    if (!listDiv) return;
    listDiv.innerHTML = '';

    var useAlt = document.getElementById('ign-bm-alt').checked;
    var paginate = document.getElementById('ign-bm-paginate').checked;
    var start = paginate ? currentPage * PAGE_SIZE : 0;
    var end = paginate ? Math.min(start + PAGE_SIZE, lastMatches.length) : lastMatches.length;

    for (var i = start; i < end; i++) {
      var entry = lastMatches[i];
      var mainUrl = buildDownloadUrl(entry);
      var altUrl = buildAltUrl(entry);
      var url = useAlt ? altUrl : mainUrl;
      var fallback = (url === mainUrl && mainUrl !== altUrl) ?
        ' <a href="' + altUrl + '" style="font-size:0.75em;color:#999;" title="lien alternatif opendatarchives.fr">[alt]</a>' : '';
      var sizeStr = entry.size ? formatBytes(entry.size) : '...';
      listDiv.insertAdjacentHTML('beforeend',
        '<a href="' + url + '" style="display:inline;padding:2px 4px;text-decoration:none;color:#000;">' +
        entry.name + '</a>' + fallback +
        '<span style="float:right;font-size:0.8em;color:#666;">' + sizeStr + '</span><br>\n');
    }

    var nav = document.getElementById('ign-bm-nav');
    if (!nav) return;
    var totalPages = Math.ceil(lastMatches.length / PAGE_SIZE);
    if (!paginate || totalPages <= 1) { nav.innerHTML = ''; return; }
    nav.innerHTML = '';

    var prev = document.createElement('a');
    prev.href = '#';
    prev.textContent = '< précédent';
    prev.style.cssText = 'margin-right:10px;' + (currentPage === 0 ? 'color:#ccc;pointer-events:none;' : '');
    prev.addEventListener('click', function(e) { e.preventDefault(); if (currentPage > 0) { currentPage--; renderPage(); listDiv.scrollIntoView({behavior: 'smooth'}); } });

    var info = document.createElement('span');
    info.textContent = 'page ' + (currentPage + 1) + '/' + totalPages;
    info.style.cssText = 'margin:0 10px;';

    var next = document.createElement('a');
    next.href = '#';
    next.textContent = 'suivant >';
    next.style.cssText = 'margin-left:10px;' + (currentPage >= totalPages - 1 ? 'color:#ccc;pointer-events:none;' : '');
    next.addEventListener('click', function(e) { e.preventDefault(); if (currentPage < totalPages - 1) { currentPage++; renderPage(); listDiv.scrollIntoView({behavior: 'smooth'}); } });

    nav.appendChild(prev);
    nav.appendChild(info);
    nav.appendChild(next);
  }

  function filterFileNames(asText) {
    var resultsDiv = document.getElementById('ign-bm-results');
    resultsDiv.innerHTML = '';
    var query = document.getElementById('ign-bm-input').value.trim().toUpperCase();
    var fullQuery = datasetHint ? datasetHint.toUpperCase() + (query ? ' ' + query : '') : query;
    if (!fullQuery) return;

    var terms = fullQuery.split(/\s+/);

    lastMatches = archiveEntries.filter(function(entry) {
      var name = entry.name.toUpperCase();
      return terms.every(function(term) {
        if (term.startsWith('-') && term.length > 1) {
          return name.indexOf(term.substring(1)) === -1;
        }
        return name.indexOf(term) !== -1;
      });
    });

    if (lastMatches.length === 0) {
      resultsDiv.innerHTML = '<p>Aucun résultat</p>';
      return;
    }

    lastMatches.sort(function(a, b) { return a.name.localeCompare(b.name); });

    resultsDiv.innerHTML = '<p style="font-weight:bold;margin:8px 0;">' + buildSummary(lastMatches) + '</p>';

    if (asText) {
      var useAlt = document.getElementById('ign-bm-alt').checked;
      var text = '';
      for (var i = 0; i < lastMatches.length; i++) {
        var entry = lastMatches[i];
        text += (useAlt ? buildAltUrl(entry) : buildDownloadUrl(entry)) + '\n';
      }
      var textarea = document.createElement('textarea');
      textarea.style.cssText = 'width:100%;height:200px;font-family:monospace;font-size:12px;';
      textarea.value = text;
      resultsDiv.appendChild(textarea);

      var copyBtn = document.createElement('button');
      copyBtn.textContent = 'copier';
      copyBtn.style.cssText = 'margin-top:4px;padding:4px 12px;background:#000091;color:#fff;border:none;cursor:pointer;';
      copyBtn.addEventListener('click', function() {
        navigator.clipboard.writeText(text).then(function() {
          copyBtn.textContent = 'copié !';
          setTimeout(function() { copyBtn.textContent = 'copier'; }, 2000);
        });
      });
      resultsDiv.appendChild(copyBtn);
    } else {
      var listDiv = document.createElement('div');
      listDiv.id = 'ign-bm-list';
      resultsDiv.appendChild(listDiv);

      var nav = document.createElement('div');
      nav.id = 'ign-bm-nav';
      nav.style.cssText = 'text-align:center;padding:8px 0;';
      resultsDiv.appendChild(nav);

      currentPage = 0;
      renderPage();
    }

    resultsDiv.insertAdjacentHTML('beforeend',
      '<p style="font-size:0.8em;color:#666;margin:8px 0 0;">Certains fichiers anciens ne sont disponibles que sur <a href="https://data.cquest.org/ign/" style="color:#666;">opendatarchives.fr</a> [alt]</p>');
  }

  function createUI() {
    datasetHint = getDatasetHint();

    var container = document.createElement('div');
    container.id = 'ign-bm';
    container.className = 'container-lg';
    container.style.cssText = 'margin:0 auto;padding:15px 16px;font-family:Arial,sans-serif;';

    var bar = document.createElement('div');
    bar.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;';

    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'ign-bm-input';
    input.value = '';
    input.placeholder = datasetHint ? 'gpkg 2024 D001' : 'bd topo gpkg 2024';
    input.title = 'Pour exclure un terme, préfixez le avec le signe moins. Ex: -shp';
    input.style.cssText = 'flex:1;min-width:200px;height:35px;padding:4px 8px;border:1px solid #bababa;font-size:14px;';
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') filterFileNames(false);
    });

    var clearBtn = document.createElement('button');
    clearBtn.textContent = 'X';
    clearBtn.style.cssText = 'height:35px;padding:0 10px;border:1px solid #bababa;background:#fff;cursor:pointer;font-weight:bold;color:#949494;';
    clearBtn.addEventListener('click', function() {
      input.value = '';
      input.focus();
    });

    var searchBtn = document.createElement('button');
    searchBtn.textContent = 'rechercher';
    searchBtn.id = 'ign-bm-search';
    searchBtn.style.cssText = 'height:35px;padding:0 15px;background:#000091;color:#fff;border:none;cursor:pointer;';
    searchBtn.addEventListener('click', function() { filterFileNames(false); });

    var listLink = document.createElement('a');
    listLink.href = '#';
    listLink.textContent = 'liste de liens';
    listLink.style.cssText = 'font-size:13px;';
    listLink.addEventListener('click', function(e) { e.preventDefault(); filterFileNames(true); });

    bar.appendChild(input);
    bar.appendChild(clearBtn);
    bar.appendChild(searchBtn);
    bar.appendChild(listLink);

    var options = document.createElement('div');
    options.style.cssText = 'margin-top:4px;';

    var altCheckbox = document.createElement('input');
    altCheckbox.type = 'checkbox';
    altCheckbox.id = 'ign-bm-alt';
    var altLabel = document.createElement('label');
    altLabel.style.cssText = 'font-size:small;';
    altLabel.appendChild(altCheckbox);
    altLabel.appendChild(document.createTextNode(' Proposer des liens opendatarchives.fr'));

    var status = document.createElement('span');
    status.id = 'ign-bm-status';
    status.style.cssText = 'font-size:small;color:#666;margin-left:10px;';
    status.textContent = 'Chargement des archives...';

    var paginateCheckbox = document.createElement('input');
    paginateCheckbox.type = 'checkbox';
    paginateCheckbox.id = 'ign-bm-paginate';
    paginateCheckbox.checked = true;
    var paginateLabel = document.createElement('label');
    paginateLabel.style.cssText = 'font-size:small;margin-left:15px;';
    paginateLabel.appendChild(paginateCheckbox);
    paginateLabel.appendChild(document.createTextNode(' Paginer les résultats'));

    options.appendChild(altLabel);
    options.appendChild(paginateLabel);
    options.appendChild(status);

    var results = document.createElement('div');
    results.id = 'ign-bm-results';
    results.style.cssText = 'margin-top:8px;';

    container.appendChild(bar);
    container.appendChild(options);
    container.appendChild(results);

    var anchor = document.querySelector('datahub-header-record') || document.querySelector('header');
    if (anchor && anchor.nextSibling) {
      anchor.parentNode.insertBefore(container, anchor.nextSibling);
    } else if (anchor) {
      anchor.parentNode.appendChild(container);
    } else {
      document.body.prepend(container);
    }
    input.focus();
  }

  function loadArchives() {
    var script = document.createElement('script');
    script.src = ARCHIVES_URL;
    script.onload = function() {
      if (typeof archives !== 'undefined') {
        archives.sort(function(a, b) { return Date.parse(b.time) - Date.parse(a.time); });
        var seen = {};
        for (var i = 0; i < archives.length; i++) {
          if (!(archives[i].name in seen)) {
            seen[archives[i].name] = archives[i];
          }
        }
        archiveEntries = Object.values(seen).filter(function(e) {
          return /\.(7z|zip)(\.[\d]+)?$/i.test(e.name);
        });
        archives = null;
        document.getElementById('ign-bm-status').textContent = archiveEntries.length + ' fichiers indexés';

        if (datasetHint || document.getElementById('ign-bm-input').value) {
          filterFileNames(false);
        }
      }
    };
    script.onerror = function() {
      document.getElementById('ign-bm-status').textContent = 'Erreur de chargement des archives';
    };
    document.body.appendChild(script);
  }

  createUI();
  loadArchives();
})();
