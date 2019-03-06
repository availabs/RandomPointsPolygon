var bg_json = require('./final.json');
var turf = require('@turf/turf');
var turf_inside = require('turf-inside');
var fs = require('fs');
var point = {}
var inside = ''
var updated_geojson = {
           type: 'FeatureCollection',
            features : []
}
var wstream = fs.createWriteStream('ny_whole.geojson');
module.exports = randomPointInPoly = function(bg_json){
        bg_json.forEach(function(block_feature,index) {
            if(index <= (bg_json.length-2)) {
                if (bg_json[index].id === bg_json[index + 1].id) {
                    bg_json[index].properties['POPULATION'] = bg_json[index + 1].B01003
                }
                delete bg_json[index + 1]
            }
            return bg_json
        })

        bg_json.forEach(function(feature){
            if (feature.geometry.type === 'MultiPolygon') {
                console.log('if its Multipolygon')
                for (var i = 0; i < feature.geometry.coordinates.length; i++) {
                    var polygon = {
                        'type': 'Polygon',
                        'coordinates': feature.geometry.coordinates[i],
                        'properties': feature.properties
                    }
                    polygon.coordinates.forEach(function(coordinate,index){
                        var line = turf.lineString(coordinate);
                        var bbox = turf.bbox(line);
                        var poly = turf.polygon([coordinate], {name: 'Polygon'})
                        var count = 0
                        while (count < feature.properties.POPULATION) {
                            var points = turf.randomPoint(feature.properties.POPULATION, {bbox: bbox})
                            Object.values(points.features).forEach(function (each_point, index) {
                                point = each_point
                                each_point.properties['GEOID'] = feature.properties.GEOID
                                inside = turf_inside(point, poly)
                                if (inside) {
                                    if (count < feature.properties.POPULATION) {
                                        each_point.properties['i'] = count + 1
                                        wstream.write(JSON.stringify(each_point))
                                        wstream.write(',')
                                        count = count + 1
                                    }
                                }
                            })
                        }
                    })


                }
            }
            else{
                console.log('if its polygon')
                feature.geometry.coordinates.forEach(function (item,index) {
                    var line = turf.lineString(item);
                    var bbox = turf.bbox(line);
                    var poly = turf.polygon([item],{name: 'Polygon'})
                    var count = 0
                    while(count < feature.properties.POPULATION){
                        var points = turf.randomPoint(feature.properties.POPULATION, {bbox: bbox})
                        Object.values(points.features).forEach(function (each_point,index) {
                            point = each_point
                            each_point.properties['GEOID'] = feature.properties.GEOID
                            inside = turf_inside(point,poly)
                            if (inside) {
                                if (count < feature.properties.POPULATION ){
                                    each_point.properties['i'] = count+1
                                    wstream.write(JSON.stringify(each_point))
                                    wstream.write(',')
                                    count = count+1
                                }
                            }
                        })
                    }
                })
            }


        })

    return null
}

var result = randomPointInPoly(bg_json)
wstream.end()




