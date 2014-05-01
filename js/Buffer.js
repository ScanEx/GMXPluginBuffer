
Korridor.GEOMETRY_TYPES = {
	"LINE": "LINESTRING",
	"POLYGON": "POLYGON",
	"DOT": "POINT"
}

Korridor.DRAW_LINE_OPT = {
		"penColor" : 0xff0000,
		"penThickness" : 12,
		"penOpacity" : 70
}

Korridor.DRAW_CIRCLE_OPT = {
		"penColor" : 0xff0000,
		"penThickness" : 6,
		"penOpacity" : 70
}

function moveToCenter(x0, y0, x, y) {	
	return [0, 0, x - x0, y - y0];
}

function rotate(x, y, alpha, flag) {
	if (flag == false) {alpha = -alpha;}

	var new_x =  x * Math.cos(alpha) + y * Math.sin(alpha);
	var new_y = -x * Math.sin(alpha) + y * Math.cos(alpha);

	return [new_x, new_y];
}

function rotateXZero(y, alpha, flag) {
	if (flag == false) {alpha = -alpha;}

	return [y * Math.sin(alpha), y * Math.cos(alpha)];
}

function rotateYZero(x, alpha, flag) {
	if (flag == false) {alpha = -alpha;}

	return [x * Math.cos(alpha), -x * Math.sin(alpha)];
}

function rotateToY(x, y, alpha, flag) {	
	if (flag == false) {alpha = -alpha;}

	return [x * Math.cos(alpha) + y * Math.sin(alpha), 0];
}

function getCrossCoords(x0, y0, x1, y1, x2, y2, x3, y3) {

	var newCoord = [-1, -1];

	var d  = (x0 - x1) * (y3 - y2) - (y0 - y1) * (x3 - x2);
	var da = (x0 - x2) * (y3 - y2) - (y0 - y2) * (x3 - x2);
	var db = (x0 - x1) * (y0 - y2) - (y0 - y1) * (x0 - x2);

	if (d == 0){
		return newCoord;
	}
	
	var ta = da / d;
	var tb = db / d;
	
	if ((0 <= ta) && (ta <= 1) && (0 <= tb) && (tb <= 1)) {
		newCoord[0] = (x0 + ta * (x1 - x0));
		newCoord[1] = (y0 + ta * (y1 - y0));
	}
	
	return newCoord;
}

//Начертить дугу до определенной точки "cross_point"
function drawArcWithoutPart(x, y, r, alpha, variant, cross_point)
		{
			function v_fi (fi, a, b)
			{
				return [
					-Math.cos(fi)*Math.sin(a)+Math.sin(fi)*Math.sin(b)*Math.cos(a),
					Math.cos(fi)*Math.cos(a)+Math.sin(fi)*Math.sin(b)*Math.sin(a),
					-Math.sin(fi)*Math.cos(b)
				];
			}
			
			cross_point = MathHelper.MercatorToLatLng(cross_point[0], cross_point[1]);
										
			var a = Math.PI*x/180;  //долгота центра окружности в радианах
			var b = Math.PI*y/180;  //широта центра окружности в радианах
		
			var alpha_0 = alpha[0];
			var alpha_1 = alpha[1];
            				
			var corner_start = 0;
			var corner_end = 0;
			
			//for left
			if (variant == 1){
				corner_start = Math.PI/2     - alpha_0;	
				corner_end   = 3 * Math.PI/2 - alpha_0;		
			}
			
			if (variant == 3){
				corner_start = -Math.PI/2 - alpha_0;	
				corner_end   =  Math.PI/2 - alpha_0;		
			}
			
			if (variant == 0){												
				corner_start = 3 *  Math.PI/2 - alpha_0;	
				corner_end   = 3 *  Math.PI/2 - alpha_1;
				
				if (corner_end  > 2*Math.PI){
					corner_end  = corner_end  - 2*Math.PI;
				}
				
				if (corner_start > corner_end){						
					corner_end   = corner_end + 2*Math.PI;
				}								
			}						
			
			if (variant == 2){
			
				corner_start = Math.PI/2 - alpha_1;	
				corner_end   = Math.PI/2 - alpha_0;
				
				if ( (corner_end  - corner_start) >= 2*Math.PI ){					
					corner_end  = corner_end  - 2*Math.PI;
				}
								
				if (corner_start > corner_end){										
					corner_end   = corner_end + 2*Math.PI;
				}							
			}			
						
			var d_alpha = corner_end - corner_start;			
			
			var count = d_alpha / MathHelper.RAD_IN_1_GRAD;
						
			var corner_shag = (corner_end - corner_start) / count;
		
			var corner_cur = corner_start;
						
			var R = 6372795; // Радиус Земли
			//      6378137 - Некоторые источники дают такое число.
		
			var d = R * Math.sin(r / R);
			var Rd = R * Math.cos(r / R);
			var VR = [];
			VR[0] = Rd * Math.cos(b) * Math.cos(a);
			VR[1] = Rd * Math.cos(b) * Math.sin(a);
			VR[2] = Rd * Math.sin(b);
		
			var circle = [];
			var coordinates = [];
		
			for (var fi = 0; fi <= count; fi += 1)
			{							
				var v = v_fi(corner_cur, a, b);
				
				for (var i=0; i<3; i++)
					circle[i] = VR[i] + d*v[i];
				
				var t1 = (180*Math.asin(circle[2]/R)/Math.PI);
				var r = Math.sqrt(circle[0]*circle[0]+circle[1]*circle[1]);
				var t2 = circle[1]<0 ? -180*Math.acos(circle[0]/r)/Math.PI :
					180*Math.acos(circle[0]/r)/Math.PI;
		
				if (t2 < x - 180)
					t2 += 360;
				else if (t2 > x + 180)
					t2 -= 360;
		
				coordinates.push([t2, t1]);								
				
				corner_cur += corner_shag;
				
				if (( Math.abs(cross_point[0] - t2) <= 0.000001 ) && ( Math.abs(cross_point[1] - t1) <= 0.000001 )){
					break;
				}
			}
		
			return coordinates;
}
	
/********************************************************************************************/
/*************************************__Korridor__*******************************************/

Korridor.KORRIDOR_TYPES = {
	"Contur" : "0",
	"Segments" : "1"
}

function Korridor(opt) {
	this._map = opt["map"];
	this._points = [];//opt["points"];
	
	this._parent_manager = opt.parent;
	
	this._cur_geo_obj = opt.cur_geo_obj;
	
	this._is_not_cross = false;
	
	var _points = opt["points"];

	for (var index in _points) {
		var cur_point = _points[index];
		
		this._points.push(cur_point);
	}
	
	this._width = opt["width"];

	if (this._points.length > 0 ){

		for (var index in this._points) {
			var cur_point = this._points[index];
	
			this._points[index] = MathHelper.LatLngToMercator(this._points[index][0], this._points[index][1]);
		}
	}

	//this._width = getMercatorWidth(this._points[0], this._points[1], this._width)[1];	
	this._width_div_2 = this._width;//this._width / 2;
	this._width_sqr = this._width * this._width;
		
	this._type = opt["type"];		

	//Массив "частей" корридора.
	this._bufer_parts = [];

	//Массив полигонов корридора - для полигонального вывода.
	this._sections = [];
	
	//Массив картежей корридора - для схематичнского вывода.
	this._carteges = [];
	
	//Массив Объектов-линий - для схематичнского вывода.
	this._lines = [];
	
	this._lines_old = [];

	this._left_oldPoint = [];
	this._right_oldPoint = [];
	
	this._old_left = [];
	this._old_right = [];
}

//Инициализировать новыми значениями
Korridor.prototype.setParams = function(opt) {	
	var width  = opt["width"];
	var _points = opt["points"];

	this._points = [];

	for (var index in _points) {
		var cur_point = _points[index];
		
		this._points.push(cur_point);
	}
	
	for (var index in this._points) {
		var cur_point = this._points[index];
	
		this._points[index] = MathHelper.LatLngToMercator(this._points[index][0], this._points[index][1]);
	}
	
	this._width       = width;
	this._width_div_2 = width;//width / 2;
	this._width_sqr   = width * width;
}

//Вернуть точки
Korridor.prototype.getPoints = function() {	
	return this._points;	
}

//Вернуть картежи
Korridor.prototype.getCarteges = function() {	
	return this._carteges;	
}

//Удалить картежи
Korridor.prototype.removeCarteges = function() {	
	this._carteges = [];	
}

//Добавить последнюю точку
Korridor.prototype.addPoint = function(point) {
	
	point = MathHelper.LatLngToMercator(point[0], point[1]);
	
	this._points[this._points.length ] = point;	
}

//Удалить точки
Korridor.prototype.removePoints = function() {	
	this._points = [];	
}

//Изменить последнюю точку
Korridor.prototype.changeLastPoint = function(point) {
	point = MathHelper.LatLngToMercator(point[0], point[1]);
	
	this._points[this._points.length - 1] = point;	
}

//Получить координаты секции корридора
Korridor.prototype.getSection = function(x0, y0, x, y) {		
	var rotate_center_br = [];

	var width_start = null;
	var width_end = null;

	var widths = MathHelper.getMercatorWidth([x0, y0], [x, y], this._width_div_2);

	var alpha = Math.atan((y - y0) / (x - x0));

	if (x < x0) {
		if (alpha < 0) {
			alpha = alpha - Math.PI;
		} else {
			alpha = alpha + Math.PI;
		}
	}

	rotate_center_br = rotateToY(x - x0, y - y0, alpha, true);

	//Получаем секцию
	var rect = [
		[0,                    widths[0]/* this._width_div_2*/],
		[0,                   -widths[0]/*-this._width_div_2*/],
		[rotate_center_br[0], -widths[1]/*-this._width_div_2*/],
		[rotate_center_br[0],  widths[1] /*this._width_div_2*/]];
			
	//Поворачиваем секцию в обратную сторону
	rect[0] = rotateXZero(rect[0][1],             alpha, false);
	rect[1] = rotateXZero(rect[1][1],             alpha, false);
	rect[2] = rotate(     rect[2][0], rect[2][1], alpha, false);
	rect[3] = rotate(     rect[3][0], rect[3][1], alpha, false);
 	
	//Переносим секцию
	rect[0][0] += x0; rect[0][1] += y0;	
	rect[1][0] += x0; rect[1][1] += y0;	
	rect[2][0] += x0; rect[2][1] += y0;	
	rect[3][0] += x0; rect[3][1] += y0;
		
	rect[4] = alpha;	

	var point_0 = MathHelper.MercatorToLatLng(x0, y0);		
	var point_1 = MathHelper.MercatorToLatLng(x, y);		
		
	return rect;
}

//"Нормализовать" высоту коридора по длине всего сегмента
Korridor.prototype.normalizeWidthForSegment = function(p0, p1, partsCount){
	
	var lineOpt = {
		"penColor" : 0xff0000,
		"penThickness" : 2,
		"penOpacity" : 90
	}			
	
	var alpha = Math.atan((p1[1] - p0[1]) / (p1[0] - p0[0]));

	var rot_p0 = rotate(p1[0] - p0[0], p1[1] - p0[1], alpha, true);
	
	var dx = rot_p0[0] / partsCount;

	var old_x = 0;
	var x     = null;
	
	var cur_width = this._width;
	
	for(var i = 1; i <= partsCount; i++){		
		//x = i * dx; 
		
		var rot_p0_new = rotateYZero(i * dx,            alpha, false);
		var rot_pw_new = rotate(     i * dx, cur_width, alpha, false);
	
		rot_p0_new[0] += p0[0]; 
		rot_p0_new[1] += p0[1];	
		rot_pw_new[0] += p0[0]; 
		rot_pw_new[1] += p0[1];	
		
		
		var new_mk_0 = MathHelper.MercatorToLatLng(rot_p0_new[0], rot_p0_new[1]);
		var new_mk_1 = MathHelper.MercatorToLatLng(rot_pw_new[0], rot_pw_new[1]);
	
		this.drawLine(lineOpt, rot_p0_new, rot_pw_new);
		
		var new_width = (cur_width * cur_width) / distVincenty(new_mk_0[0], new_mk_0[1], new_mk_1[0], new_mk_1[1]);
				
		//old_x = x;
	}
}

//Создать корридор
Korridor.prototype.create = function() {
	rect = rotateRect(this._points[0][0], this._points[0][1], this._points[1][0], this._points[1][1], this._width);

	return rect;
}

//Нарисовать окружность
Korridor.prototype.drawCircle = function(opt, p_center, radius) {
	var p0 = MathHelper.MercatorToLatLng(p_center[0], p_center[1]);
	
	var o = this._map.addObject();
	o.setCircle(p0[0], p0[1], radius);

	o.setStyle({
		outline : {
			color : opt["penColor"],
			thickness : opt["penThickness"],
			opacity : opt["penOpacity"]
		}
	});
	
	return o;
}

//Нарисовать линию
Korridor.prototype.drawLine = function(opt, p0, p1) {
	p0 = MathHelper.MercatorToLatLng(p0[0], p0[1]);
	p1 = MathHelper.MercatorToLatLng(p1[0], p1[1]);

	var o = this._map.addObject();
	o.setGeometry({
		"type" : "LINESTRING",
		"coordinates" : [[p0[0], p0[1]], [p1[0], p1[1]]]
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

//Нарисовать линию
Korridor.prototype.drawLongLine = function(opt, points) {
	
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

//Нарисовать полигон
Korridor.prototype.drawPolygon = function(opt, points) {	
	var o = this._map.addObject();
	o.setGeometry({
		"type" : "POLYGON",
		"coordinates" : points
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
/*
//Нарисовать полигон
Korridor.prototype.drawPoligon = function(opt, points) {
	for (index in points) {
		var cur_point = points[index];

		points[index] = MathHelper.MercatorToLatLng(cur_point[0], cur_point[1]);
	}
	
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
}
*/
//Нарисовать корридор
Korridor.prototype.draw = function(progress_bar, isPolygon) {
	var ret_buff = null;
	/*
	if (this._type == Korridor.KORRIDOR_TYPES["Contur"]){
		//this.drawContur();
		ret_buff = this.drawContur_2(progress_bar, isPolygon);
	}else if (this._type == Korridor.KORRIDOR_TYPES["Segments"]){
		ret_buff = this.drawContur_2(progress_bar, isPolygon);
	}
	*/
	
	//this._parent_manager.addScrollBar();
	
	ret_buff = this.drawContur_2(progress_bar, isPolygon);
	
	return ret_buff;
}

//Нарисовать коридор одним контуром(Вокруг точки)
Korridor.prototype.drawConturAroundDot = function(radius) {	
	var polygon_segmentOpt = {
		"penColor" : 0x0000ff,
		"penThickness" : 1,
		"penOpacity" : 66,
		"fillColor" : 0x0000ff,
		"fillOpacity" : 33
	};
		
	this.remove();
	
	var center = MathHelper.MercatorToLatLng(this._points[0][0], this._points[0][1]);
	
	var circle_points = MathHelper.getCirclePoints(center[0], center[1], radius);
	
	var circle = this.drawPolygon( polygon_segmentOpt, [circle_points]);
	
	this._parent_manager._allDrawBuffers[this._cur_geo_obj["objectId"]] = circle;
	
	circle.bringToBottom();
	
	//Сохраняем объект-геометрию
	this._bufer_parts.push(circle);
	
}

//Удалить буфер
Korridor.prototype.remove = function() {	
	for(var i in this._bufer_parts){
		var cur_section = this._bufer_parts[i];
		
		cur_section.remove();
	}
	
	this._bufer_parts = [];	
}
	
Korridor.prototype.drawpPolygon_2 = function(progress_bar, isPolygon){	
	this.drawContur_2(progress_bar, isPolygon);		
}
	
Korridor.prototype.getJSTPolygonByPoints = function(points, start_pos, end_pos){
	
	var p_old = null;
	var new_p = null;
	
	var reader = new jsts.io.WKTReader();  
		
	var segment_p_0 = this.creatSegmentPolygon(points[start_pos], points[start_pos + 1]);
		
	segment_p_0[segment_p_0.length] = segment_p_0[0];
	
	p_old = MathHelper.createJSTSPolygon(segment_p_0);
	p_old = reader.read(p_old);	
											
	if ((end_pos - start_pos) > 1){			
		for ( var i = start_pos; i < end_pos; i++) {	
			
			var segment_p = this.creatSegmentPolygon(points[i], points[i + 1]);
					
			segment_p[segment_p.length] = segment_p[0];											
			
			try{
				p = reader.read(MathHelper.createJSTSPolygon(segment_p));		
			}catch(err){			  	
			  	trace("createJSTSPolygon error!!!");			  				  	
			}			
													
			try{
				new_p = p.union(p_old);	
			}catch(err){
			  	trace("union error = " + err);			  
			}
  		
			p_old = new_p;								
		}
	}else{
		new_p = p_old;
	}	
	
	return new_p;	
}					
		
Korridor.prototype.getPointsWithautEquals = function(points){	
	var new_points = [];
	
	var status = true;
	
	while(status == true){
		for( var i = 0; i < points.length - 1; i++){
			if (!MathHelper.equals(points[i], points[i + 1])){				
				new_points.push(points[i]);	
				
				status = false;										
			}	
		}
		
		new_points.push(points[i]);		
	}	
	
	return new_points;
}

function getSubBuffer(buffer, pos_start, pos_end){
	var sub_buffer = [];
	
	for(i = pos_start; i < pos_end; i++){
		sub_buffer.push(buffer[i]);
	}
	
	return sub_buffer;
} 

var cur_el = [];

function doUnion(buffer, cur_el){	
	var len = buffer.length;
	
	trace("(len % 2) = " + (len % 2));
	
	trace("len = " + len);
	trace(buffer);
	
	var part_l = ~~(len/2);
	var part_r = len - part_l;

	var buffer_l = getSubBuffer(buffer, 0, part_l);
	var buffer_r = getSubBuffer(buffer, part_l, part_l + part_r);			
	
	trace(buffer_l);
	trace(buffer_r);
	//trace("len buffer_l = " + part_l);
	//trace("len buffer_r = " + part_r);	
	
	var buffer_l_new = [];
	var buffer_r_new = [];
	
	var len = part_l;
}

Korridor.prototype.drawContur_2 = function(progress_bar, isPolygon){	

	var _this = this;
	
	var correct_points= this.getPointsWithautEquals(this._points);   
	
	var len = correct_points.length;
		
	var count_points = 2;	
	
	if((len > 15) && (len <= 60)){
		count_points = 4;
	}else if((len > 60) && (len <= 100)){
		count_points = 10;
	}else if((len > 100) && (len <= 200)){
		count_points = 15;
	}else if((len > 200) && (len <= 300)){
		count_points = 25;
	}else if((len > 300) && (len <= 500)){
		count_points = 30;
	}else if(len > 500){
		count_points = 50;
	}		
	
	var count_iter = ~~((len - 1)/(count_points - 1));	
	var percent_shag = (100 / count_iter);	
	var last_points = (len - 1) - (count_iter * (count_points - 1));
	
	var intervals = [];
	
	for( var i = 0; i < count_iter; i++){
		
		intervals.push( [i*(count_points - 1), (i + 1)*(count_points - 1)] );
	}
	
	intervals[count_iter - 1][1] = i*(count_points - 1) + last_points;
	
	this._cur_polygon = [];
	
	this._parent_manager.addScrollBar();
	
	function union(p_0, p_1){		
		
		var union_p = p_0.union(p_1);
		
		return union_p;
	}
										 							 
	for( var j = 0; j < count_iter; j++){		
		setTimeout(function(cur_i){ 			
			return function(){
				var cur_interval = intervals[cur_i];
						
				var cur_polygon = _this.getJSTPolygonByPoints(correct_points, cur_interval[0], cur_interval[1]);				
				var draw_polygon = _this.drawJSTPolygon(cur_polygon);
				
				_this._cur_polygon.push(cur_polygon);
				
				progress_bar.addToProgress({"progress": percent_shag,
											 "time": 0});
						
				if (cur_i == (count_iter - 1)){									
					var cur_p = _this.unionAllPolygon(_this._cur_polygon);
					
					_this.remove();
					
					var draw_polygon = _this.drawJSTPolygon(cur_p, isPolygon);
					
					progress_bar.addToProgress({"progress": 100,
											    "time": 0});
											    					
					progress_bar.clear();
					
					_this._parent_manager._allDrawBuffers[_this._cur_geo_obj["objectId"]] = draw_polygon;
					
					_this._parent_manager._hard_geometry_count -= 1;
					
					if (_this._parent_manager._hard_geometry_count == 0){
						_this._parent_manager.clearProgressBar();
					}																			
				}
			}			
		}(j), 0);				
	}				   
}

Korridor.prototype.unionAllPolygon = function(polygons){
	var len = polygons.length;
	
	var part_l = ~~(len/2);
	var part_r = len - part_l;

	var polygons_l = getSubBuffer(polygons, 0, part_l);
	var polygons_r = getSubBuffer(polygons, part_l, part_l + part_r);			
	
	var cur_p_l = polygons_l[0];
	
	for(var i = 1; i < polygons_l.length; i++){												
		cur_p_l = cur_p_l.union(polygons_l[i]);			
	}
	
	var cur_p_r = polygons_r[0];
	
	for(var i = 1; i < polygons_r.length; i++){												
		cur_p_r = cur_p_r.union(polygons_r[i]);			
	}
	
	return cur_p_l.union(cur_p_r);			
}

Korridor.prototype.drawJSTPolygon = function(polygon, isPolygom){
	var segmentOpt = {
		"penColor" : 0x0000ff,
		"penThickness" : 1,
		"penOpacity" : 66,
		"fillColor" : 0x0000ff,
		"fillOpacity" : 33
	};
	
	//Удаляем "старую" версию буфера
	//this.remove();	
	
	var holes = polygon.holes;
	
	var holes_array = [];
	
	//Отображаем дырки
	for(var i in holes){		
		var coord_hole = MathHelper.getHolesCoordsFromJSTSPolygon(holes[i]);
		
		holes_array.push(coord_hole);			
	}
			
	//Отображаем "Оболочку полигона"	
	var new_coords = MathHelper.getCoordsFromJSTSPolygon(polygon.getExteriorRing());
	
	var polygon_all = [];
	polygon_all.push(new_coords); 
	
	if (isPolygom == false){
		for(var i in holes_array){
			polygon_all.push(holes_array[i]);
		}
	}
			
	var all_polygon = this.drawPolygon( segmentOpt, polygon_all);	
	
	all_polygon.bringToBottom();
	
	//Сохраняем объект-геометрию
	this._bufer_parts.push(all_polygon);
	
	return all_polygon;	
}

Korridor.prototype.creatSegmentPolygon = function(p_0, p_1){
	/*var lineOpt = {
		"penColor" : 0xff0000,
		"penThickness" : 3,
		"penOpacity" : 90
	}
	*/	
	var segment_p = [];
	
	rect = this.getSection(p_0[0], p_0[1], p_1[0], p_1[1]);	
	
	//Торец 1
	var arc_center = MathHelper.MercatorToLatLng( p_0[0], p_0[1] );
	var arc_coord = MathHelper.drawArc( arc_center[0], arc_center[1], this._width_div_2, [ rect[4], rect[4] ], 1);
	
	for(var i in arc_coord){
		var cur_coord = arc_coord[i];
		
		segment_p.push(cur_coord);
	}
		
	//Параллельные линии
	//segment_p.push(MathHelper.MercatorToLatLng(rect[0][0], rect[0][1]));
	//segment_p.push(MathHelper.MercatorToLatLng(rect[3][0], rect[3][1]));	
		
	//Торец 2		
	var arc_center = MathHelper.MercatorToLatLng( p_1[0], p_1[1] );
	var arc_coord = MathHelper.drawArc( arc_center[0], arc_center[1], this._width_div_2, [ rect[4], rect[4] ], 3);
	
	for(var i in arc_coord){
		var cur_coord = arc_coord[i];
		
		segment_p.push(cur_coord);
	}
		
	//Параллельные линии
	//segment_p.push(MathHelper.MercatorToLatLng(rect[2][0], rect[2][1]));
	//segment_p.push(MathHelper.MercatorToLatLng(rect[1][0], rect[1][1]));
		
	//return changeSide(segment_p);
	return segment_p;
}
