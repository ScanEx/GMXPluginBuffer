function KorridorManager(opt){

  this._map = opt["map"];
	this._parent_name = opt["parent"];
	this._parent = $("#" + opt["parent"]);
	
	//Массив объектов-геометрий. Ключ id	
	this._geometry_objects = {};	
	
	//Элемент TextBox - ширина буфера
	this._BufferWidthValue = null;
	
	//Радиус
	this._radius = 222200;
	
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

	//trace("showGeometryPrimitives_2");

	var _this = this;
	
	var shag = 35;			
	var i = 0;
	
	var max_obj_count = StyleManager.MAX_COUNT_ELEMENTS;
	
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
									    	
		this._progress_bar.setCurPos([panel_pos[0] + 5, panel_pos[1] + 5 + 115]);
		this._buffer_calc.setCurPos([panel_pos[0] + 5, panel_pos[1] + 5]);
									    								    	
		this._progress_bar.append();	
		this._buffer_calc.append();
													    	
		this._panel.addToPanel(this._progress_bar);	
		this._panel.addToPanel(this._buffer_calc);
		
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

var COORDS = [[35.143634,55.959137],[35.14754,55.962756],[35.146386,55.963623],[35.155756,55.977176],[35.165701,55.979482],[35.168296,55.98092],
[35.171178,55.982648],[35.173632,55.984812],[35.172763,55.988131],[35.172906,55.991299],[35.174348,55.993604],[35.177379,55.996921],[35.181989,56.000817],
[35.185308,56.003558],[35.190635,56.00831],[35.19497,56.01163],[35.199,56.012921],[35.203475,56.013792],[35.20707,56.013213],[35.210098,56.012062],
[35.214569,56.012349],[35.21803,56.012347],[35.220767,56.013936],[35.221485,56.015806],[35.22365,56.017534],[35.224375,56.019704],[35.224374,56.022295],
[35.227112,56.023884],[35.229271,56.025322],[35.231435,56.02749],[35.233887,56.029791],[35.237196,56.032672],[35.236161,56.034712],[35.232195,56.037734],
[35.23012,56.040383],[35.230499,56.043401],[35.233143,56.044729],[35.24127,56.046809],[35.246561,56.047187],[35.250335,56.045482],[35.255251,56.043969],
[35.264134,56.041897],[35.268857,56.040761],[35.287363,56.061919],[35.303997,56.060032],[35.306262,56.061164],[35.30815,56.063623],[35.313443,56.064187],
[35.317975,56.067588],[35.321568,56.070803],[35.323741,56.078039],[35.318353,56.084219],[35.333285,56.090265],[35.338944,56.093664],[35.331578,56.097634],
[35.324399,56.098958],[35.32138,56.099899],[35.321375,56.101981],[35.318354,56.104438],[35.310611,56.106514],[35.286232,56.103299],[35.283398,56.109725],
[35.28907,56.114262],[35.285098,56.121624],[35.285101,56.124465],[35.30853,56.130888],[35.308715,56.138447],[35.293722,56.140587],[35.295303,56.144489],
[35.298892,56.149024],[35.305883,56.153748],[35.314762,56.156208],[35.319104,56.154313],[35.332897,56.158846],[35.341587,56.159225],[35.336674,56.163382],
[35.361807,56.178877],[35.356517,56.180014],[35.351976,56.182091],[35.35009,56.186059],[35.351787,56.190593],[35.36577,56.197396],[35.339698,56.199663],
[35.333461,56.20193],[35.331952,56.207977],[35.327602,56.207594],[35.323824,56.207593],[35.320425,56.208731],[35.320237,56.212129],[35.321177,56.216665],
[35.319288,56.220255],[35.321747,56.222338],[35.31675,56.229101],[35.32892,56.232347],[35.336865,56.233671],[35.344423,56.232918],[35.349517,56.233293],
[35.355375,56.234992],[35.360672,56.237264],[35.365387,56.237828],[35.368981,56.237451],[35.372949,56.23632],[35.375974,56.237638],[35.380126,56.237638],
[35.384283,56.236506],[35.388628,56.235374],[35.393171,56.235754],[35.396004,56.236509],[35.397328,56.238021],[35.393353,56.24085],[35.395062,56.242934],
[35.400719,56.24293],[35.404689,56.242927],[35.408659,56.245195],[35.411494,56.247843],[35.415459,56.247276],[35.437761,56.238965],[35.44229,56.239338],
[35.464777,56.242176],[35.471391,56.244256],[35.475548,56.245768],[35.487445,56.247086],[35.4848,56.249923],[35.502191,56.258805],[35.500293,56.263338],
[35.497271,56.265035],[35.494054,56.265415],[35.48707,56.269197],[35.481212,56.272976],[35.47705,56.275997],[35.474787,56.279017],[35.4746,56.281854],
[35.473089,56.283743],[35.479512,56.287333],[35.483108,56.28847],[35.48707,56.287904],[35.491524,56.287695],[35.489339,56.289602],[35.484798,56.292436],
[35.482726,56.294513],[35.481775,56.297156],[35.478946,56.298671],[35.482159,56.302449],[35.468547,56.308494],[35.480829,56.313406],[35.500107,56.315864],
[35.484803,56.321535],[35.483288,56.3204],[35.47837,56.323609],[35.480268,56.326825],[35.469115,56.330031],[35.467792,56.331542],[35.468168,56.333625],
[35.475351,56.33646],[35.466656,56.338538],[35.478754,56.346477],[35.477134,56.358806],[35.496134,56.361963],[35.488576,56.366883],[35.473273,56.359891],
[35.470249,56.361207],[35.484791,56.373867],[35.495188,56.371221],[35.49481,56.364993],[35.505204,56.369339],[35.505577,56.374626],[35.507279,56.380672],
[35.512003,56.379916],[35.519372,56.384638],[35.512951,56.389555],[35.518044,56.394842],[35.51317,56.395962],[35.504071,56.398247],[35.496697,56.400696],
[35.481204,56.384825],[35.458914,56.379351],[35.454747,56.381803],[35.448894,56.384452],[35.442853,56.385772],[35.437179,56.386341],[35.431705,56.383505],
[35.427736,56.38275],[35.424333,56.385394],[35.418668,56.381429],[35.413754,56.384076],[35.419613,56.391062],[35.417531,56.393327],[35.415829,56.395977],
[35.41791,56.398054],[35.420936,56.399376],[35.422068,56.401833],[35.422637,56.40429],[35.425088,56.40504],[35.427546,56.405987],[35.428485,56.418834],
[35.428964,56.421896],[35.43321,56.422047],[35.435856,56.422241],[35.433213,56.42394],[35.435857,56.426583],[35.436799,56.429417],[35.440392,56.430739],
[35.443979,56.428662],[35.446633,56.428287],[35.450594,56.428282],[35.454515,56.430174],[35.45252,56.432819],[35.448464,56.436381],[35.440203,56.438304],
[35.425464,56.443214],[35.424143,56.444534],[35.426593,56.451144],[35.426974,56.453412],[35.426976,56.455305],[35.429996,56.457949],[35.433964,56.459083],
[35.439819,56.457568],[35.443227,56.458136],[35.44738,56.458895],[35.452859,56.458897],[35.45929,56.458141],[35.466841,56.456623],[35.471754,56.454741],
[35.476484,56.451715],[35.479875,56.448311],[35.481959,56.444914],[35.479685,56.444533],[35.476096,56.443399],[35.472319,56.442077],[35.47195,56.440002],
[35.473842,56.438982],[35.494009,56.431044],[35.523149,56.431495],[35.526738,56.434712],[35.529004,56.436414],[35.527876,56.440571],[35.530514,56.442075],
[35.533352,56.44057],[35.536182,56.440187],[35.538639,56.440568],[35.540605,56.44302],[35.545257,56.450583],[35.553573,56.449828],[35.555644,56.453606],
[35.55394,56.456628],[35.552616,56.458894],[35.555455,56.457765],[35.558475,56.457004],[35.56056,56.457007],[35.584358,56.471174],[35.587572,56.471742],
[35.591738,56.47288],[35.595699,56.474202],[35.597971,56.475903],[35.599672,56.477795],[35.620831,56.476847],[35.618944,56.473823],[35.622719,56.469852],
[35.624798,56.469479],[35.625743,56.466458],[35.624608,56.463244],[35.622343,56.460976],[35.620072,56.459653],[35.629331,56.455118],[35.636512,56.459843],
[35.640292,56.46154],[35.644067,56.461539],[35.648421,56.461167],[35.651253,56.461169],[35.656976,56.460346],[35.65767,56.452093],[35.663158,56.447563],
[35.673739,56.450777],[35.673544,56.447749],[35.684508,56.447373],[35.685448,56.44454],[35.684883,56.440378],[35.683179,56.434336],[35.68148,56.433765],
[35.680537,56.431691],[35.681858,56.431121],[35.681485,56.429044],[35.698487,56.4281],[35.696784,56.424699],[35.715876,56.411288],[35.727968,56.413744],
[35.731367,56.408076],[35.728721,56.399191],[35.731554,56.39749],[35.730988,56.395038],[35.733067,56.392962],[35.734644,56.389481],[35.740812,56.390693],
[35.748747,56.390121],[35.754793,56.389558],[35.760468,56.390882],[35.768963,56.389742],[35.781434,56.399379],[35.790508,56.39693],[35.800327,56.406561],
[35.81809,56.404298],[35.817337,56.399199],[35.831888,56.397873],[35.83453,56.399383],[35.839351,56.397844],[35.840411,56.393537],[35.846061,56.394405],
[35.847026,56.397732],[35.860414,56.394476],[35.85569,56.389744],[35.852672,56.38956],[35.849266,56.391071],[35.83699,56.388805],[35.844171,56.38068],
[35.864003,56.38786],[35.866841,56.381625],[35.861735,56.378977],[35.871941,56.371985],[35.885736,56.374446],[35.894802,56.374067],[35.905383,56.377092],
[35.905008,56.373878],[35.95337,56.370287],[35.954702,56.374449],[35.95904,56.372552],[35.958919,56.378039],[36.013461,56.377663],[36.017994,56.376906],
[36.023089,56.375579],[36.02744,56.373127],[36.028951,56.369719],[36.031035,56.365379],[36.03708,56.365378],[36.037082,56.367081],[36.03708,56.370291],
[36.039159,56.372369],[36.051814,56.37331],[36.06069,56.365565],[36.065035,56.365565],[36.072981,56.363492],[36.073925,56.356497],[36.070334,56.355936],
[36.066366,56.355177],[36.063154,56.353664],[36.060508,56.351212],[36.058808,56.348183],[36.062585,56.345346],[36.060695,56.339489],[36.062772,56.337222],
[36.065607,56.335337],[36.067689,56.334962],[36.067875,56.336845],[36.07676,56.340247],[36.080346,56.337411],[36.085068,56.337416],[36.088996,56.336135],
[36.093192,56.344594],[36.093003,56.347616],[36.09074,56.350074],[36.092062,56.357632],[36.091866,56.36273],[36.093379,56.367265],[36.094894,56.368968],
[36.097158,56.371425],[36.097543,56.373694],[36.09773,56.377471],[36.099803,56.380868],[36.103391,56.384273],[36.106421,56.386542],[36.108122,56.387866],
[36.115299,56.384654],[36.121346,56.385407],[36.12437,56.386731],[36.128712,56.392963],[36.13098,56.39542],[36.129474,56.396746],[36.124745,56.396363],
[36.123425,56.397878],[36.125128,56.399769],[36.127768,56.401277],[36.131922,56.405058],[36.137593,56.40355],[36.142766,56.417354],[36.236978,56.404684],
[36.240377,56.415258],[36.264535,56.414713],[36.274388,56.417908],[36.275705,56.422062],[36.278923,56.42528],[36.283647,56.429245],[36.288558,56.433399],
[36.294786,56.433021],[36.298946,56.436801],[36.302352,56.439448],[36.306125,56.439638],[36.308023,56.441528],[36.317277,56.442661],[36.337684,56.447764],
[36.360356,56.44833],[36.359978,56.450412],[36.373207,56.451356],[36.375534,56.450355],[36.379622,56.450783],[36.383778,56.454185],[36.396069,56.459102],
[36.398336,56.463071],[36.397573,56.464959],[36.40135,56.468355],[36.420436,56.473084],[36.414771,56.480832],[36.436497,56.48744],[36.44594,56.474217],
[36.536819,56.474404],[36.539278,56.472327],[36.541735,56.474595],[36.537203,56.488199],[36.538712,56.491979],[36.541928,56.497081],[36.549674,56.50067],
[36.553449,56.501425],[36.558929,56.498779999999996],[36.586705,56.499157],[36.58954,56.500861],[36.590861,56.504823],[36.591988,56.507848],[36.596913,56.511821],
[36.604274,56.514464],[36.609758,56.5156],[36.613724,56.516733],[36.615801,56.518054],[36.631291,56.514274],[36.630537,56.510304],[36.644715,56.505209],
[36.647551,56.502374],[36.665296,56.501867],[36.65491,56.522587],[36.672104,56.530717],[36.688919,56.535623],[36.735028,56.544889],[36.754292,56.551873],
[36.753727,56.554336],[36.784905,56.568128],[36.800204,56.56718],[36.803419,56.572662],[36.812297,56.57757],[36.802281,56.593068],[36.802432,56.595727],
[36.80531,56.59496],[36.807958,56.59496],[36.815513,56.594578],[36.823065,56.590044],[36.833833,56.589856],[36.846498,56.58589],[36.851977,56.58589],
[36.878433,56.577389],[36.880696,56.577575],[36.886745,56.584381],[36.89071,56.583432],[36.896756,56.576817],[36.901859,56.574368],[36.908283,56.571722],
[36.916792,56.569832],[36.921695,56.570018],[36.930017,56.570398],[36.93927,56.567186],[36.948533,56.566621],[36.962508,56.56586],[36.970633,56.564354],
[36.982732,56.563217],[36.984068,56.558898],[36.979705,56.556605],[36.97404,56.554907],[36.96874,56.554523],[36.968346,56.545939],[36.972325,56.545469],
[36.972825,56.542249],[37.007479,56.541675],[37.031475,56.536008],[37.031664,56.533553],[37.041109,56.528072],[37.045264,56.52656],[37.052255,56.525995]
,[37.059629,56.525996],[37.06643,56.525996],[37.069834,56.526945],[37.072857,56.528835],[37.075121,56.529962],[37.074181,56.53299],[37.072092,56.535253],
[37.067761,56.535235],[37.067373,56.537145],[37.069641,56.539789],[37.070397,56.542624],[37.07191,56.545459],[37.075688,56.54546],[37.078899,56.545458],
[37.084752,56.544134],[37.089267,56.542993],[37.093311,56.540254],[37.096556,56.53957],[37.102521,56.542647],[37.104788,56.54527],[37.10703,56.546798],
[37.104686,56.548472],[37.103277,56.546216],[37.101002,56.544891],[37.099876,56.546594],[37.100631,56.548484],[37.102133,56.549614],[37.106484,56.551505],
[37.110266,56.55264],[37.112906,56.553018],[37.116877,56.553587],[37.1182,56.555662],[37.119525,56.558309],[37.122544,56.559627],[37.123111,56.561712],
[37.123294,56.565675],[37.124621,56.568512],[37.127452,56.570588],[37.131427,56.571347],[37.133878,56.571909],[37.134065,56.574744],[37.136142,56.57531],
[37.139363,56.575123],[37.138984,56.577584],[37.139546,56.580224],[37.142382,56.581171],[37.144465,56.583063],[37.145783,56.585139],[37.148241,56.587027],
[37.148242,56.588919],[37.145973,56.591566],[37.143705,56.593075],[37.144845,56.594588],[37.139168,56.597604],[37.134635,56.599495],[37.131982,56.600629],
[37.129347,56.60063],[37.128211,56.601763],[37.12878,56.604219],[37.1318,56.606675],[37.135089,56.60841],[37.135586,56.610647],[37.132742,56.612157],
[37.129908,56.612345],[37.129347,56.613859],[37.130289,56.615558],[37.132929,56.616692],[37.134441,56.619147],[37.134259,56.62123],[37.131237,56.622737],
[37.128966,56.623875],[37.127451,56.626702],[37.125185,56.628974],[37.121791,56.63143],[37.119705,56.633129],[37.117252,56.637474],[37.117438,56.640118],
[37.118574,56.640496],[37.120838,56.640689],[37.123296,56.642196],[37.123673,56.644465],[37.125945,56.644847],[37.128581,56.644655],[37.13085,56.646356],
[37.133688,56.646359],[37.137462,56.646734],[37.140681,56.648059],[37.143705,56.648623],[37.148797,56.648621],[37.152956,56.64919],[37.154472,56.650135],
[37.15277,56.651838],[37.149746,56.653346],[37.150879,56.654479],[37.154091,56.653914],[37.156738,56.652591],[37.158439,56.652026],[37.158244,56.654666],
[37.158062,56.656749],[37.159756,56.658068],[37.160137,56.660527],[37.158247,56.661659],[37.154097,56.661851],[37.150688,56.662793],[37.148046,56.663741],
[37.147476,56.665248],[37.144837,56.66525],[37.143886,56.663735],[37.143694,56.661847],[37.141239,56.661847],[37.13936,56.662039],[37.137652,56.664307],
[37.135385,56.665251],[37.130662,56.666196],[37.129341,56.667892],[37.129337,56.670539],[37.131417,56.670542],[37.134253,56.671673],[37.134059,56.674886],
[37.134445,56.677343],[37.135954,56.678291],[37.138396,56.677849],[37.138403,56.676773],[37.138789,56.675267],[37.142382,56.675643],[37.144264,56.676205],
[37.142785,56.677999],[37.144646,56.678494],[37.146909,56.679039],[37.151072,56.677759],[37.152602,56.679699],[37.153148,56.681877],[37.156333,56.681907],
[37.157105,56.684145],[37.157265,56.686533],[37.154462,56.688271],[37.153278,56.690727],[37.157299,56.691133],[37.159114,56.692718],[37.164576,56.693576],
[37.167885,56.694774],[37.17431,56.696048]];

var COORDS_2 = [];

for (var i in COORDS){
	var cur_coord = COORDS[i];
	
	COORDS_2.push([cur_coord[0] + 0.63, cur_coord[1] + 0.33]);
}

COORDS_2[COORDS_2.length - 1] = COORDS_2[0];
