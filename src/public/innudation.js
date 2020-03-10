export function createInnudationLayers(map) {
  let sources = ['0ft_flood', '1ft_flood', '2ft_flood', '3ft_flood', '4ft_flood', 
    '5ft_flood', '6ft_flood', '7ft_flood', '8ft_flood', '9ft_flood', '10ft_flood']; 
  let urls = ['atlmaproom.93btovy5', 'atlmaproom.648gihzb', 'atlmaproom.d8ny5yls', 'atlmaproom.djqk6f2y', 'atlmaproom.2ygvk1sa',
    'atlmaproom.4gufk4q2', 'atlmaproom.85425a0c', 'atlmaproom.anc8gj9d', 'atlmaproom.d3gpkygm', 'atlmaproom.6qqx7qn1', 'atlmaproom.4vxrmiod'];
  let sourceLayers = ['SLR_0ft-0o7756', 'SLR_1ft-6r3rtk', 'SLR_2ft-9f6erf', 'SLR_3ft-8jphh4', 'SLR_4ft-b3d67f',
    'SLR_5ft-boolll', 'SLR_6ft-9pigdt', 'SLR_7ft-010eyg', 'SLR_8ft-12hgg0', 'SLR_9ft-d2x7e7', 'SLR_10ft-bdjxeh'];
  for (let i = 0; i < sources.length; i++) {
    map.addSource(sources[i], {
      type: 'vector',
      url: 'mapbox://' + urls[i]
    })
    map.addLayer({
      'id': sources[i],
      'type': 'fill',
      'source': sources[i],
      'source-layer': sourceLayers[i],
      'layout': {
        'visibility': 'none'
      },
      'paint': {
        'fill-outline-color': '#f7ff05',
        'fill-color': 'blue',
        'fill-opacity': 0.6
      }
    })
  }
}