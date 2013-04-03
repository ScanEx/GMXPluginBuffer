//спомогательный класс
function MathHelper(){}

MathHelper.RAD_IN_1_GRAD = Math.PI / 180;

MathHelper.removeObj = function(array, del_el){  	
	var del_index = -1;
	
	for(i in array){
		var cur_el = array[i];
		
		if (cur_el == del_el){
			del_index = i;
			
			break;
		}		
	}
	
	if (del_index != -1){				
		array.splice(del_index, 1);
	}	
}

MathHelper.getDotRadius = function(z){
	var radius = 0;
	
	if (z == 1){radius = 1000000;}
    if (z == 2){radius = 400000;}
    if (z == 3){radius = 160000;}
    if (z == 4){radius = 80000;}
    if (z == 5){radius = 40000;}
    if (z == 6){radius = 20000;}
    if (z == 7){radius = 16000;}
    if (z == 8){radius = 8000;}
    if (z == 9){radius = 4000;}
    if (z == 10){radius = 2000;}
    if (z == 11){radius = 1200;}
    if (z == 12){radius = 800;}
    if (z == 13){radius = 500;}
    if (z == 14){radius = 400;}
    if (z == 15){radius = 200;}
    if (z == 16){radius = 100;}
    if (z == 17){radius = 50;}
	
	return radius;
}

MathHelper.is_undf = function(obj){
	return (obj == undefined);
}

MathHelper.getBounds = function(points){
	var bounds  = [-1, -1, -1, -1];
	
	if (points.length > 0){
		bounds = [ points[0][0], points[0][1], points[0][0], points[0][1] ];
	
		for (i in points){
			var cur_point = points[i];
			
			if (cur_point[0] <= bounds[0]){
				bounds[0]  = cur_point[0];				
			}
			
			if (cur_point[1] >= bounds[1]){
				bounds[1]  = cur_point[1];				
			}
			
			if (cur_point[0] > bounds[2]){
				bounds[2]  = cur_point[0];				
			}
		
			if (cur_point[1] < bounds[3]){
				bounds[3]  = cur_point[1];				
			}
		} 
	}

	return bounds;
}

MathHelper.getPointHMS = function(coords){
	function gradToHMS(grad){	
		var first = ~~grad;
		var last  = (grad - first);
		
		var pre_minutes = last * 60;	
		var minutes = ~~pre_minutes;
	
		var other_part = pre_minutes - minutes;
		
		var pre_second = other_part * 60;	
		var second = pre_second.toFixed(1);
		
		return first + "°" + minutes + "'" + second + "''";
	}
	
	return " (" + gradToHMS(coords[0]) + " N, " + gradToHMS(coords[1]) + " E" + ")";	
}

MathHelper.getLength = function(len){	
	var ret_len = "";
	
	if (len >= 1000){
		ret_len = (len / 1000).toFixed(3).toString() + " км.";
	}else{
		ret_len = len.toFixed(3).toString() + " м.";
	}
	
	return " (" + ret_len + ")";
}

MathHelper.getSquare = function(square){		
	var ret_square = "";
		
	if (square >= 100000){
		ret_square = (square / 1000000).toFixed(2).toString() + " кв. км.";
	}else{
		ret_square = square.toFixed(0).toString() + " кв. м.";
	}
	
	return " (" + ret_square + ")";
}

MathHelper.getGeometryName = function(o){
	var ret_name = "";
	var size = "";
	
	var name = o["geometry"]["type"].toString();
	
	if (name == "POLYGON"){
		ret_name = "многоугольник";
		size = MathHelper.getSquare(o.getArea());
	}else if (name == "LINESTRING"){
		ret_name = "линия";
		size = MathHelper.getLength(o.getLength());		
	}else if (name == "POINT"){
		ret_name = "точка";
		size = MathHelper.getPointHMS(o.getCenter());		
	}
	
	return ret_name + size;
}

MathHelper.getCirclePoints = function(x, y, r){
	function v_fi (fi, a, b)
			{
				return [
					-Math.cos(fi)*Math.sin(a)+Math.sin(fi)*Math.sin(b)*Math.cos(a),
					Math.cos(fi)*Math.cos(a)+Math.sin(fi)*Math.sin(b)*Math.sin(a),
					-Math.sin(fi)*Math.cos(b)
				];
			}
										
			var a = Math.PI*x/180;  //долгота центра окружности в радианах
			var b = Math.PI*y/180;  //широта центра окружности в радианах
		
			var corner_start = 0;
			var corner_end = 2*Math.PI;
			
			var count = 100;
						
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
			}
		
			return coordinates;
}

MathHelper.drawArc = function(x, y, r, alpha, variant)
		{			
			function v_fi (fi, a, b)
			{
				return [
					-Math.cos(fi)*Math.sin(a)+Math.sin(fi)*Math.sin(b)*Math.cos(a),
					Math.cos(fi)*Math.cos(a)+Math.sin(fi)*Math.sin(b)*Math.sin(a),
					-Math.sin(fi)*Math.cos(b)
				];
			}
										
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
						
			var count = 20;
						
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
			}
		
			return coordinates;
}

MathHelper.createJSTSPolygon = function(coords){
			var str = "POLYGON((";
						
			for(var i in coords){
				
				var cur_p = coords[i];
											
				if (i < coords.length - 1){
					str += cur_p[0] + " " + cur_p[1] + ", "; 
				}else{
					str += cur_p[0] + " " + cur_p[1] + "))"; 
				}
				
				old_cur = cur_p;
			}
			
			return str;
}

MathHelper.getHolesCoordsFromJSTSPolygon = function(p){	
			var jsts_coords = p.points;
	
			coords = [];
		
			for (var i in jsts_coords){				
				var cur_coord = jsts_coords[i];
													
				coords.push( [cur_coord.x, cur_coord.y] );											
			}		
			
			return coords;			
}

MathHelper.getCoordsFromJSTSPolygon = function(p){
			var jsts_coords = p.getCoordinates();
	
			coords = [];
		
			for (var i in jsts_coords){				
				var cur_coord = jsts_coords[i];
													
				coords.push( [cur_coord.x, cur_coord.y] );											
			}		
			
			return coords;
}

MathHelper.arrayGradToRad = function(array_grad){
		var array_rad = [];
	
		for (var i in array_grad){			
			var cur_grad = array_grad[i];
			
			array_rad.push( MathHelper.LatLngToMercator(cur_grad.x, cur_grad.y));			
		}
		
		return array_rad;
}

MathHelper.GradToRad = function(grad) {
	return grad * Math.PI / 180;
}

MathHelper.RadToGrad = function(rad) {
	return 180 * rad / Math.PI;
}

MathHelper.MercatorToLatLng = function(x, y) {
	var a = 6372795.0;

	var lon = x / a;
	var lat = 2 * Math.atan(Math.exp(y / a)) - Math.PI / 2;

	return [MathHelper.RadToGrad(lon), 
			MathHelper.RadToGrad(lat)];
}

MathHelper.LatLngToMercator = function(lon, lat) {                         
	var a = 6372795.0;

	var rLong = MathHelper.GradToRad(lon);
	var rLat = MathHelper.GradToRad(lat);

	var X = a * rLong;
	var Y = a * Math.log(Math.tan(Math.PI / 4 + rLat / 2));

	return [X, Y];
}

MathHelper.getMercatorWidth = function(p0, p1, width){	
	var width_2 = width * width;
	
	var alpha = Math.atan((p1[1] - p0[1]) / (p1[0] - p0[0]));

	var rot_p0 = rotate(p1[0] - p0[0], p1[1] - p0[1], alpha, true);

	//Начальная точка осевой сегмента
	var rot_p0_new = [0, 0];
	var rot_pw_new = rotateXZero(width, alpha, false);

	rot_p0_new[0] += p0[0]; 
	rot_p0_new[1] += p0[1];	
	rot_pw_new[0] += p0[0]; 
	rot_pw_new[1] += p0[1];	
	
	var new_mk_0 = MathHelper.MercatorToLatLng(rot_p0_new[0], rot_p0_new[1]);
	var new_mk_1 = MathHelper.MercatorToLatLng(rot_pw_new[0], rot_pw_new[1]);
	
	var koeff_start = (width_2 / distVincenty(new_mk_0[0], new_mk_0[1], new_mk_1[0], new_mk_1[1]));
		
	//Конечная точка осевой сегмента
	rot_p0_new = rotateYZero(rot_p0[0],        alpha, false);
	rot_pw_new = rotate(     rot_p0[0], width, alpha, false);

	rot_p0_new[0] += p0[0]; 
	rot_p0_new[1] += p0[1];	
	rot_pw_new[0] += p0[0]; 
	rot_pw_new[1] += p0[1];	

	var new_mk_0 = MathHelper.MercatorToLatLng(rot_p0_new[0], rot_p0_new[1]);
	var new_mk_1 = MathHelper.MercatorToLatLng(rot_pw_new[0], rot_pw_new[1]);

	var koeff_end = (width_2 / distVincenty(new_mk_0[0], new_mk_0[1], new_mk_1[0], new_mk_1[1]));

	return [koeff_start, koeff_end];	
}
