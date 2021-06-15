#! /usr/bin/env python3
# -*- coding: utf8 -*-
import json, math
from datetime import datetime
from collections import OrderedDict

def formatBytes(b):
  if b == 0:
    return '0 b'
  k = 1024
  sizes = ['b', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo']
  i = math.floor(math.log(b) / math.log(k))
  n = b / math.pow(k, i)
  return  "{0:.2f}".format(n)+' '+sizes[i]

with open('./resources/archives.js', 'r') as archives_file:
  json_str = archives_file.read().replace("\n", " ")[10:-2]
  archives_unsorted = json.loads(json_str)

archives = sorted(
  archives_unsorted,
  key=lambda x: datetime.strptime(x['time'], "%Y-%m-%dT%H:%M"), reverse=True
)

last_update = archives[0]['time']
archives_latest = {}

for item in archives:
  if item['name'] not in archives_latest:
    archives_latest[item['name']] = item

with open('./resources/libre.json', 'r') as ign_file:
  ign = json.loads(ign_file.read())

ign_list = []
ign_dict = {}

for item in ign:
  ign_list.append(item['name'])
  ign_dict[item['name']] = item

rss = OrderedDict()

for item in archives_latest:
  if item in ign_list:
    day = archives_latest[item]['time'].split('T')[0]
    product = archives_latest[item]['name'].split('_')[0]
    if day not in rss:
      rss[day] = {}
    if product not in rss[day]:
      rss[day][product] = []
    rss[day][product].append(archives_latest[item])

xml = '''\
<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Open Data IGN</title>
  <link href="https://github.com/bjperson/ign-bookmarklet"/>
  <link rel="self" href="https://bjperson.github.io/ign-bookmarklet/resources/atom.xml" />
  <author>
    <name>Brice Person</name>
    <uri>https://www.ideeslibres.org</uri>
  </author>
  <updated>{last}:00Z</updated>
  <id>https://geoservices.ign.fr/documentation/diffusion/telechargement-donnees-libres.html</id>\
'''.format(last=last_update)

nb_entry = 0

for day in rss:

  if nb_entry < 21:

    summary = []
    html = ''

    for product in rss[day]:

      nb = str(len(rss[day][product]))
      product_size = 0

      plur = 's' if len(rss[day][product]) > 1 else ''

      html += '''<h1>{p}</h1>
          <p>
          <strong>{n} fichier{s} ajouté{s} :</strong><br /><br />
          '''.format(p=product, n=nb, s=plur)

      products = sorted(rss[day][product], key=lambda x: x['name'])

      for updated in products:
        html +=  '''<a href="{p}{n}">{n}</a> {b}<br />
          '''.format(p=ign_dict[updated['name']]['path'], n=updated['name'], b=formatBytes(updated['size']))
        product_size += updated['size']

      html += '''<br />
          Total: {t}</p>'''.format(t=formatBytes(product_size))

      summary.append(product+' ('+nb+')')

    entry = '''
    <entry>
      <title>{p}</title>
      <link rel="related" href="https://geoservices.ign.fr/documentation/diffusion/telechargement-donnees-libres.html"/>
      <id>https://geoservices.ign.fr/documentation/diffusion/telechargement-donnees-libres.html#{d}</id>
      <updated>{d}T09:00:00Z</updated>
      <summary>{p}</summary>
      <content type="xhtml">
        <div xmlns="http://www.w3.org/1999/xhtml">
          {h}
        </div>
      </content>
    </entry>\
    '''.format(d=day, h=html, p=", ".join(summary))

    xml += entry;

    nb_entry += 1

xml += "\n</feed>"

print(xml)
