function KorridorManager(opt){

	this._map = opt["map"];
	this._parent_name = opt["parent"];
	this._parent = $("#" + opt["parent"]);
	
	//Массив объектов-геометрий. Ключ id	
	this._geometry_objects = {};	
	
	//Элемент TextBox - ширина буфера
	this._BufferWidthValue = null;
	
	//Радиус
	this._radius = 2220;
	
	this._scroll_bar_added = false;
	
	//Число "сложных" геометрий
	this._hard_geometry_count = 0;
	
	//Панель 
	this._panel = null;
	
	this._buffer_calc = null;			  		
	this._progress_bar = null;
	
	//Кнопка "свернуть список"
	this._slideSpisok = null;
	
	//Кнопка плказа элементов
	this._showObjButton = null;
	
	//Массив ID объектов-геометрий в видимой области. Для фильтрации выбора 
	this._geometry_objects_on_svreen = [];
	
	//Массив объектов-геометрий для построения буфера. 
	this._geometry_buffer_objects = [];	
	
	//Кнопка отображение примитивов
	this._show_buffers_button = null;
	
	//Кнопка выбора примитивов
	this._choice_geo_button = null;
	
	//Кнопки с примитивами
	this._geo_buttons = [];
	
	//Массив объектов-буферов. 
	this._buffers = [];	
	
	//Массив ВСЕХ объектов-буферов. 
	this._allDrawBuffers = {};	
	
	//Колличество полей 
	this._KorridorManagerFields = {
		"INFO_FIELED_"      : 0,
		"CHECK_BOX_FIELED_" : 0
	};
}

//Переставить координаты полигона для корректной отрисовки
KorridorManager.prototype.changePolygonCoords = function(cur_obj){	
	function get_cickle_next(array, pos){	
		var len = array.length;
	
		var next = pos + 1;
		
		if (next >= len){
			next = next - len;
		}
	
		return array[next];
	}
	
	function get_max(array){
		var max = [array[0], 0];
		
		var len = array.length;
		
		for(var i = 1; i < len; i++){
			if (array[i] > max[0]){
				max[0] = array[i];
				max[1] = i;
			}
		}
		
		return max;
	}
	
	var is_reposing = false;
	
	var coords  = this.getPoints(cur_obj);
	var bound   = this.getGeometryBounds(cur_obj);	
	var max = get_max(bound[1]);

	var max_pos = max[1];
	
	var next_elem_1 = get_cickle_next(bound[1], max_pos);
	var next_elem_2 = get_cickle_next(bound[1], max_pos + 1);
	var next_elem_3 = get_cickle_next(bound[1], max_pos + 2);
	
	if ((next_elem_1 <= max[0]) &&
	    (next_elem_2 <= next_elem_1) &&
	    (next_elem_3 <= next_elem_2)){
	    	is_reposing = true;
	    }
	
	var new_coords = [];
	
	if (is_reposing == true){
		var start_pos = bound[1][0];
		
		var count = coords.length;		
	
		//"Переворачиваем" массив	
		for (var i = count - 2; i >= 0; i--){		
			new_coords.push( coords[i] );		
		}		
		
		new_coords[new_coords.length] = new_coords[0]; 	
	}
	
	return new_coords;
}

//Получить координаты геометрии
KorridorManager.prototype.getPoints = function(obj){
	
	var points = null;
	
	var type = obj["geometry"]["type"];
	var coords = obj["geometry"]["coordinates"];
	
	if (type == Korridor.GEOMETRY_TYPES.LINE){
		points = coords;
	} else if (type == Korridor.GEOMETRY_TYPES.POLYGON){
		points = coords[0];
	}else if (type == Korridor.GEOMETRY_TYPES.DOT){
		points = [coords];
	} 
	
	return points;
}

//Отобразить геометрию
KorridorManager.prototype.drawGeometryObject = function(map, obj){
	var points = this.getPoints(obj);
	
	var type = obj["geometry"]["type"];
	var coords = obj["geometry"]["coordinates"];

	var obj = null;

	if (type == Korridor.GEOMETRY_TYPES.LINE){		
		obj = this.drawLine( Korridor.DRAW_LINE_OPT, points);
	} else if (type == Korridor.GEOMETRY_TYPES.POLYGON){
		obj = this.drawLine( Korridor.DRAW_LINE_OPT, points);
	}else if (type == Korridor.GEOMETRY_TYPES.DOT){
		
		var radius = MathHelper.getDotRadius(this._map.getZ());
		
		obj = this.drawCircle( Korridor.DRAW_CIRCLE_OPT, points, radius);
	} 
	
	return obj;
}

//Прямоугольник, ограничивающий геометрию
KorridorManager.prototype.getGeometryBounds = function(obj) {
	
	var points = this.getPoints(obj);
		
	var bound = MathHelper.getBounds(points);					
		
	return bound;		
}

//Построить буфер по осевой линии
KorridorManager.prototype.createBuffer = function(data) {	
	//console.log("KorridorManager.prototype.createBuffer");
}

//Найти объект-буфер в хранилище. Ключ - ID объекта-геометрии
KorridorManager.prototype.getBufferFromGeoID = function(obj) {	
	var id = obj["objectId"];
	
	var ret_buffer = null;
	
	for(var ii in this._buffers){
		var cur_buffer = this._buffers[ii];
		
		if (cur_buffer[0] == id){
			ret_buffer = cur_buffer;
			
			break;
		}
	}
	
	return ret_buffer;
}

//Удалить буферы по геометриям
KorridorManager.prototype.removeBuffers = function() {	
	
	
	for(var i in this._allDrawBuffers){		
		var cur_obj = this._allDrawBuffers[i];
		
		cur_obj.remove();
	}
}

//Перевести буферы в DrawingObject
KorridorManager.prototype.buffersToDrawingObject = function() {	
	for(var i in this._allDrawBuffers){		
		var cur_obj = this._allDrawBuffers[i];
		
		if ( cur_obj.isRemoved == false ){
			var coords = cur_obj.getGeometry()["coordinates"];		
			
			this.addDrawObject(coords);
			
			cur_obj.remove();
		}						
	}
}

//Добавить rawObject
KorridorManager.prototype.addDrawObject = function(coords) {
	this._map.drawing.addObject({	type: "POLYGON", 
								    coordinates: coords });
}

//отобразить буферы по геометриям
KorridorManager.prototype.drawBuffers = function(progress_bar) {

	var width = parseInt(this._BufferWidthValue.value(), 10);

	this._hard_geometry_count = 0;
	
	for(var i in this._geometry_buffer_objects){
		var cur_obj = this._geometry_buffer_objects[i];
		
		var type = cur_obj["geometry"]["type"];
		
		var len = this.getPoints(cur_obj).length;
		
		if (type == Korridor.GEOMETRY_TYPES.POLYGON){
			this._hard_geometry_count += 1;
			
			//console.log(len);	
		}
		
		if (type == Korridor.GEOMETRY_TYPES.LINE){
			this._hard_geometry_count += 1;
			
			//console.log(len);	
		}
		
			
	}

	//trace(this._hard_geometry_count);

	for(var i in this._geometry_buffer_objects){		
		var cur_obj = this._geometry_buffer_objects[i];
	
		var type = cur_obj["geometry"]["type"];
		
		var buffer = null;
		
		var buffer_obj = this.getBufferFromGeoID(cur_obj);
	
		if (buffer_obj == null){		
			var coords = this.getPoints(cur_obj);						
								
			buffer = new Korridor({"points" : coords,
								   "parent" : this,
								   "cur_geo_obj" : cur_obj,
								   "type"   : Korridor.KORRIDOR_TYPES.Contur,
							       "width"  : width,
								   "map"    : this._map}); 
												 
			this._buffers.push([cur_obj["objectId"], buffer]);			
		}else{
			buffer = buffer_obj[1];
			
			var coords = this.getPoints(cur_obj); 
							
			buffer.setParams({"width":  width,
							  "points": coords});
		}
		
		var buf = null;
		
		if (type == Korridor.GEOMETRY_TYPES.LINE){			
			buf = buffer.draw(progress_bar, false);			
		} else if (type == Korridor.GEOMETRY_TYPES.POLYGON){
			buf = buffer.drawpPolygon_2(progress_bar, true);
		}else if (type == Korridor.GEOMETRY_TYPES.DOT){
			buf = buffer.drawConturAroundDot(width);
		} 	
		
		//this._allDrawBuffers[cur_obj["objectId"]] = buf;		
		
		//trace(this._allDrawBuffers);
	}
}

KorridorManager.prototype.clearProgressBar = function() {			
	if (this._scroll_bar_added == true){
		this._panel.setModalState(false);
		
		if (this._buffer_calc != null){
			this._buffer_calc.hide();
			
			//this._buffer_calc = null;
		}
		
		if (this._progress_bar != null){
			this._progress_bar.hide();
			
			//this._progress_bar = null;
		}
		
		this._scroll_bar_added = false;
	}
};

KorridorManager.prototype.showGeometryPrimitives_2 = function() {

    var MyControlsFactory = nsBuffer.MyControlsFactory;
	//trace("showGeometryPrimitives_2");

	var _this = this;
	
	var shag = 35;			
	var i = 0;
	
	var max_obj_count = nsBuffer.StyleManager.MAX_COUNT_ELEMENTS;
	
	var first_pos = 270;
	var left_pos = 40;
	
	var geometry_count = 0;
	
	if((this._panel != null) && (this._slideSpisok != null)){
		this._panel.remove();	
		this._slideSpisok.remove();	
	}	
	
	this._map.drawing.forEachObject(function(o){
		geometry_count++;
	});
	
	var all_height = (geometry_count + 2)* shag + 5;
	
	if (geometry_count > max_obj_count){
		var all_height = (max_obj_count + 2)* shag + 5;
	}
	
	var panel_all = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.PANEL, 
							  {"draggable": true,
							   "maximize": true,
							   "pos": [first_pos, left_pos],
							   "size": [340, all_height],
							   "minSize": [135, 40]});							   
	panel_all.append();		
	
	this._panel = panel_all;
	
	var BufferWidthLabel = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL, 
								{"text": "Размер буфера (м):",
							    "pos": [first_pos - 35, 40 + left_pos],
							    "size": [135, 30]});
	BufferWidthLabel.append();
	
	var BufferWidthValue = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.TEXT_BOX, 
								{"text": this._radius,
							    "pos": [first_pos - 35, 40 + left_pos + 135 + 5],
							    "size": [85, 30]});
	
	BufferWidthValue.append();
		
	this._BufferWidthValue = BufferWidthValue;
	
	panel_all.addToPanel(BufferWidthLabel);
	panel_all.addToPanel(BufferWidthValue);
	
	var panel_scroll = null;		
	
	if (geometry_count > max_obj_count){
		panel_scroll = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.SCROLL_PANEL, 
											       {"draggable": false,		
											        "maximize": true,					  
													 "pos": [5 + first_pos, left_pos + 5],
													 "size": [340 - 10, max_obj_count*(30 + 4) + 3],
													 "minSize": [135, 40]});				   		
		panel_scroll.append();
	}
	
	this._map.drawing.forEachObject(function(o){
		
		var is_obj_added = false;
		
		var obj_id = o["objectId"];
		
		for (index in _this._geometry_objects_on_svreen){
			var cur_id = _this._geometry_objects_on_svreen[index];
			
			if (cur_id == obj_id){
				is_obj_added = true;
				
				break;
			}
		}
				
		if (true){	
			_this._geometry_objects_on_svreen.push( obj_id );
			
			var geo_obj = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON, 
								{"isToggle": true,
							    "enterOutFun": [
							    	function(){		
							    		var obj = o;					    		
										var obj_id = o.objectId;
										
										var bound   = null;
										var center  = null;
										var geo_fon = null;
											
										bound   =  _this.getGeometryBounds(obj);
																    				  
										center  =  obj.getCenter();												
										geo_fon = _this.drawGeometryObject( _this._map,  obj );
												
										_this._geometry_objects[obj_id] = [ obj, [bound, center, geo_fon ] ];
										
										//_this._map.zoomToExtent(bound[0], bound[1], bound[2], bound[3]);
										//_this._map.slideTo(center[0], center[1], _this._map.getZ());
							    	},function(){							    		
										var obj_id = o.objectId;
										
										data = _this._geometry_objects[obj_id][1];
															
										data[2].setVisible(false);							    	
							    }],
							    "click": function(){
							    	var clicked = this.isClicked();
							  	
							    	if (clicked){
							    		_this._geometry_buffer_objects.push(o);	
							    	}else{							    		
							    		MathHelper.removeObj(_this._geometry_buffer_objects, o);
							    	}	
							    },
							    "text": MathHelper.getGeometryName(o),
							    "pos": [5 + first_pos + i*shag, left_pos + 5],
							    "size": [295, 30]});
			
			geo_obj.append();
			
			if (panel_scroll == null){							
				panel_all.addToPanel(geo_obj);	
			}else{
				panel_scroll.addToPanel(geo_obj);
			}							    											
		}	
		
		i++;			
	});	
	
	if (panel_scroll != null){
		panel_all.addToPanel(panel_scroll);
		
		i = max_obj_count;
	}
	
	
	
	//***********************___progress_bar___*****************************************************************************************************	
	if (this._buffer_calc == null){
		this._buffer_calc = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.LABEL, 
														{"text": "Расчет буфера:",
													    "pos": [first_pos + 5, left_pos + 5],
													    "size": [110, 30]});
	};
				  
	if (this._progress_bar == null){		
		this._progress_bar = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.PROGRESS_BAR, 
											       {"pos": [first_pos + 5, left_pos + 5 + 110],
											       	 "callBack": function(progress){/*change progress*/},
													 "progress": 0,
													 "size": [160, 30]});		
	}
	
	var calc_buffer = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON, 
								{"isToggle": false,
							    "click": function(){
								    if (_this._geometry_buffer_objects.length > 0){
								    	//_this.addScrollBar();
								    	
								    	_this.drawBuffers(_this._progress_bar);
								    }
							    },
							    "text": "Рассчитать",
							    "pos": [5 + 270 + i*shag, left_pos + 5],
							    "size": [90, 30]});
							    
	calc_buffer.append();
	
	var remove_buffers = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON, 
								{"isToggle": false,
							    "click": function(){
							    	_this.removeBuffers();
							    },
							    "text": "Удалить",
							    "pos": [5 + 270 + i*shag, left_pos + 5 + 155 + 10],
							    "size": [90, 30]});
							    
	remove_buffers.append();	
	
	var save_in_file = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON, 
								{"isToggle": false,
							    "enabled": false,
							    "click": function(){
							    	//
							    },
							    "text": "Сохранить в файл",
							    "pos": [267 + 35 + 5 + i*shag, left_pos + 5],
							    "size": [140, 30]});
							    
	save_in_file.append();
	
	var save_in_map = MyControlsFactory.createInstance( MyControlsFactory.CONTROLS.BUTTON, 
								{"isToggle": false,
							    "click": function(){
							    	_this.buffersToDrawingObject();
							    },
							    "text": "Сохранить на карте",
							    "pos": [267 + 35 + 5 + i*shag, left_pos + 5 + 155 + 10],
							    "size": [150, 30]});
							    
	save_in_map.append();
				    	
	panel_all.addToPanel(calc_buffer);	
	panel_all.addToPanel(remove_buffers);	
	panel_all.addToPanel(save_in_file);		
	panel_all.addToPanel(save_in_map);	
	
	//console.log("showGeometryPrimitives_2_________________________________");	    				
}

KorridorManager.prototype.addScrollBar = function() {	
	
	if (this._scroll_bar_added == false){
		this._panel.setModalState(true);
									    	
		var panel_pos = this._panel.getCurPos();
									    	
		this._progress_bar.show();
		this._buffer_calc.show();
		
		var panel_z_index = this._panel.getJQUERYDOM()[0].css("z-index");
						    	
		this._progress_bar.setCurPos([panel_pos[0] + 5, panel_pos[1] + 5 + 115]);
		this._buffer_calc.setCurPos([panel_pos[0] + 5, panel_pos[1] + 5]);
		
		this._progress_bar.append();	
		this._buffer_calc.append();
		
		this._panel.addToPanel(this._progress_bar);	
		this._panel.addToPanel(this._buffer_calc);
		
		this._scroll_bar_added = true;
		
		var parts = this._progress_bar.getJQUERYDOM();
		
		for(var j in parts){
			var cur_el = parts[j];
			
			cur_el.css("z-index", 1000000100);				
		}
		
		var parts = this._buffer_calc.getJQUERYDOM();
		
		for(var j in parts){
			var cur_el = parts[j];
			
			cur_el.css("z-index", 1000000100);				
		}
			
		this._scroll_bar_added = true;
	}	
}

//Удлить все объекты KorridorManager'а
KorridorManager.prototype.removeAllObjects = function() {		
	//this._showObjButton.remove();		
	this._panel.remove();	
	//this._slideSpisok.remove();
	
	this._radius = parseInt( this._BufferWidthValue.value(), 10 );
	
	this._geometry_objects_on_svreen = [];
	this._geometry_buffer_objects    = [];
	
	//this._allDrawBuffers = {};
}

KorridorManager.prototype.drawCircle = function(opt, point, radius) {
	var o = this._map.addObject();
	o.setCircle(point[0][0], point[0][1], radius);

	o.setStyle({
		outline : {
			color : opt["penColor"],
			thickness : opt["penThickness"],
			opacity : opt["penOpacity"]
		}
	});
	
	return o;
}

KorridorManager.prototype.drawPoligon = function(opt, points) {	
	var o = this._map.addObject();
	
	o.setGeometry({
		"type" : "POLYGON",
		"coordinates" : [points]
	});
	o.setStyle({
		outline : {
			color : opt["penColor"],
			thickness : opt["penThickness"],
			opacity : opt["penOpacity"]
		},
		fill : {
			color : opt["fillColor"],
			opacity : opt["fillOpacity"]
		}
	});	

	return o;
}

KorridorManager.prototype.drawLine = function(opt, points) {	
	var o = this._map.addObject();
	o.setGeometry({
		"type" : "LINESTRING",
		"coordinates" : points
	});
	o.setStyle({
		outline : {
			color : opt["penColor"],
			thickness : opt["penThickness"],
			opacity : opt["penOpacity"]
		}
	});
	
	return o;
}


function trace(s) {
  try { console.log(s) } catch (e) { alert(s) }
}
