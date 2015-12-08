(function($){
    
    var listTemplate = Handlebars.compile('<div class="geobuff-container">' +
        '<table class="geobuff-params-container">' +
            '<tr><td>Размер буфера (м):</td><td><input class="inputStyle geobuff-size" value="{{bufferSize}}"></td></tr>' +
            '<tr><td>Точность:</td><td><input class="inputStyle geobuff-precision" value="{{precision}}"></td></tr>' +
        '</table>' +
        '<table class="geobuff-geom-container"><tbody>{{#rows}}' +
            '<tr>' +
                '<td><input type="checkbox" data-index="{{@index}}"{{#if selected}} selected{{/if}} class="geobuff-feature-checkbox"></td>' +
                '<td data-index="{{@index}}" class="geobuff-feature-placeholder"></td>' +
            '</tr>' +
        '{{/rows}}</tbody></table>' +
        '<span class="buttonLink geobuff-calculate">Рассчитать</span>' +
        '<span class="buttonLink geobuff-save">Сохранить</span>' +
        '<span class="buttonLink geobuff-export-shp">Экспорт в shp</span>' +
        '<span class="buttonLink geobuff-remove">Удалить</span>' +
    '</div>');
    
    var loadingScriptPromise,
        precision = 36,
        bufferSize = 3000;
    
    var publicInterface = {
        pluginName: 'BufferPlugin', 
        afterViewer: function(params, map){
            var path = gmxCore.getModulePath('BufferPlugin'),
                lmap = nsGmx.leafletMap;
                
            var bufferIcon = new L.Control.gmxIcon({
                id: 'geobuffer',
                regularImageUrl: path + 'img/buffer_tool.png',
                activeImageUrl: path + 'img/buffer_tool_a.png',
                togglable: true
            });
            
            var bufferPanel = new leftMenu();
            
            bufferIcon.on('statechange', function() {
                if (bufferIcon.options.isActive) {

                    var deleteBufferGeometries = function() {
                        _.chain(featureInfos).where({selected: true}).each(function(f) {
                            if (f.bufferGeom) {
                                lmap.removeLayer(f.bufferGeom);
                                f.bufferGeom = null;
                            }
                        });
                    }
                    
                    bufferPanel.createWorkCanvas('geobuffer', {
                        path: ['Буфер геометрических объектов'],
                        closeFunc: function() {
                            deleteBufferGeometries();
                            bufferIcon.setActive(false);
                        }
                    });
                    
                    $(bufferPanel.workCanvas).empty();
                    
                    var DrawingObjectCollection = gmxCore.getModule('DrawingObjects').DrawingObjectCollection,
                        DrawingObjectInfoRow = gmxCore.getModule('DrawingObjects').DrawingObjectInfoRow;
                    
                    var featureInfos = lmap.gmxDrawing.getFeatures().map(function(feature) {
                        return {
                            feature: feature,
                            bufferGeom: null,
                            selected: false
                        }
                    });
                    
                    var ui = $(listTemplate({
                        bufferSize: bufferSize,
                        precision: precision,
                        rows: featureInfos
                    }));
                    ui.find('.geobuff-feature-placeholder').each(function() {
                        new DrawingObjectInfoRow(lmap, this, featureInfos[$(this).data('index')].feature, {
                            allowDelete: false,
                            editStyle: false
                        });
                    });
                    
                    ui.find('.geobuff-feature-checkbox').change(function() {
                        var index = $(this).data('index'),
                            bufferGeom = featureInfos[index].bufferGeom;
                            
                        featureInfos[index].selected = this.checked;
                            
                        if (bufferGeom) {
                            lmap[this.checked ? 'addLayer' : 'removeLayer'](bufferGeom);
                        }
                    });
                    
                    ui.find('.geobuff-size').change(function() {
                        bufferSize = this.value;
                    });
                    
                    ui.find('.geobuff-precision').change(function() {
                        precision = this.value;
                    });
                    
                    ui.appendTo(bufferPanel.workCanvas);
                    
                    ui.find('.geobuff-calculate').click(function() {
                        if (_.chain(featureInfos).pluck('selected').any().value()) {
                            loadingScriptPromise = loadingScriptPromise ||gmxCore.loadScriptWithCheck([{
                                check: function() {return window.buffer},
                                script: path + 'js/turf-geobuffer.js'
                            }]);
                            
                            loadingScriptPromise.then(function() {
                                _.chain(featureInfos).where({selected: true}).each(function(f) {
                                    var geoJSON = f.feature.toGeoJSON(),
                                        size = +ui.find('.geobuff-size').val(),
                                        precision = +ui.find('.geobuff-precision').val();
                                        
                                    if (f.bufferGeom) {
                                        lmap.removeLayer(f.bufferGeom);
                                    };
                                    f.bufferGeom = L.geoJson(buffer(geoJSON, size/1000, 'kilometers', precision), {color: 'green', fillOpacity: 0.2, opacity: 1}).addTo(lmap);
                                });
                            })
                        }
                    });
                    
                    ui.find('.geobuff-save').click(function() {
                        _.chain(featureInfos).where({selected: true}).each(function(f) {
                            if (f.bufferGeom) {
                                lmap.removeLayer(f.bufferGeom);
                                lmap.gmxDrawing.addGeoJSON(f.bufferGeom);
                                f.bufferGeom = null;
                            }
                        });
                    });
                    
                    ui.find('.geobuff-export-shp').click(function() {
                        var features = _.chain(featureInfos).where({selected: true}).map(function(f) {
                            return f.bufferGeom ? f.bufferGeom.toGeoJSON().features : [];
                        }).flatten().value();
                        
                        nsGmx.Utils.downloadGeometry(features);
                    });
                    
                    ui.find('.geobuff-remove').click(deleteBufferGeometries);
                    
                } else {
                    bufferPanel.leftPanelItem.close();
                }
            })
            
            lmap.addControl(bufferIcon);
        }
    }       

    gmxCore.addModule('BufferPlugin', publicInterface, {
        css: "BufferPlugin.css"
    });

})(jQuery);