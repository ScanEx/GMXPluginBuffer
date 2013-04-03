(function($){
  var publicInterface = {
	    pluginName: 'BufferPlugin', 
	    afterViewer: function(params, map){	 	    
	        MyControlsFactory.MyControls.setParent("flash");		
			MyControlsFactory.MyControls.createStealManager({
			name: "My styles",	
			"styles_for_all":	[	
					[StyleManager.STYLE_NAMES.COLOR,            "#387EAA"],	
					[StyleManager.STYLE_NAMES.COLOR_MODAL,      "#CCCCCC"],	
					[StyleManager.STYLE_NAMES.COLOR_OVER_START, "#3F84EC"],
					[StyleManager.STYLE_NAMES.COLOR_OVER_END,   "#004AA8"],			
					[StyleManager.STYLE_NAMES.OPACITY,          0.55],
					[StyleManager.STYLE_NAMES.OPACITY_OVER,     0.85],	
					[StyleManager.STYLE_NAMES.OPACITY_MODAL,     0.90],	
					[StyleManager.STYLE_NAMES.COLOR_SHADOW,     "#666"],			
					[StyleManager.STYLE_NAMES.SHADOW_SHIFTS,    [2,2,2]]
			],
			"styles":
				//Стили для PANEL 
				[[StyleManager.STYLE.PANEL, [
					[StyleManager.STYLE_NAMES.COLOR,            "#387EAA"],							
					[StyleManager.STYLE_NAMES.OPACITY_DRAG,     0.25]]
				],
				//Стили для BUTTON
				[StyleManager.STYLE.BUTTON, [						
					//			
				]],
				//Стили для LABEL
				[StyleManager.STYLE.LABEL, [				
					[StyleManager.STYLE_NAMES.COLOR_OVER,       "#3F84EC"]]
				],
				//Стили для TEXTBOX
				[StyleManager.STYLE.TEXTBOX, [				
					//
				]],
				//Стили для CHECKBOX
				[StyleManager.STYLE.CHECKBOX, [				
					//
				]],
				//Стили для SCROLL_PANEL
				[StyleManager.STYLE.SCROLL_PANEL, [				
					[StyleManager.STYLE_NAMES.COLOR_SCROLL,     "#FF0000"],
					[StyleManager.STYLE_NAMES.COLOR_BAR,        "#00FF00"],
					[StyleManager.STYLE_NAMES.SHADOW_SHIFTS,    [1,1,1]],
					[StyleManager.STYLE_NAMES.COLOR_OVER_START, "#216AC4"],
					[StyleManager.STYLE_NAMES.COLOR_OVER_END,   "#0D2B51"],
					[StyleManager.STYLE_NAMES.COLOR_BAR_START,  "#1F7022"],
					[StyleManager.STYLE_NAMES.COLOR_BAR_END,    "#00FF00"]
				]],
				//Стили для PROGRESS_BAR
				[StyleManager.STYLE.PROGRESS_BAR, [				
					[StyleManager.STYLE_NAMES.COLOR,            "#90B7CF"],
					[StyleManager.STYLE_NAMES.COLOR_BAR,        "#00FF00"],
					[StyleManager.STYLE_NAMES.OPACITY,          0.66],
					[StyleManager.STYLE_NAMES.COLOR_OVER_START, "#00FF00"],
					[StyleManager.STYLE_NAMES.COLOR_OVER_END,   "#1F7022"]
				]],
				//Стили для COMBOBOX
				[StyleManager.STYLE.COMBOBOX, [				
					//
				]]]
		});	
			
	        var korridorMngr = null;
	        
	        function setOnClickKorridor(){		        				        																					
						if( korridorMngr == null){																		
							korridorMngr = new KorridorManager({"map":    map,
																"parent": "flash"});																																		
						}	
						
						korridorMngr.showGeometryPrimitives_2();																																   																																																							
			}
			
			function onCancelKorridor(){	
			map.unfreeze();
				map.setHandlers({ onMouseDown: null, onMouseMove: null, onMouseUp: null });		
				gmxAPI._tools.standart.selectTool('move');
				
				if (korridorMngr !=null){
					korridorMngr.removeAllObjects();				
				}									
			}	
		
			var buff_path = gmxCore.getModulePath("BufferPlugin");
		
			console.log(buff_path + "img/buffer_tool.png");
		
	        var bufferTool = {
				'key':             "buffer_tool",
				'activeStyle':     {},
				'regularStyle':    {'paddingLeft': '2px'},
				'regularImageUrl': buff_path + "img/buffer_tool.png",
				'activeImageUrl':  buff_path + "img/buffer_tool_a.png",
				'onClick':         setOnClickKorridor,
				'onCancel': 	   onCancelKorridor,
				'hint': 		   gmxAPI.KOSMOSNIMKI_LOCALIZED("Буфер", "Korridor")
			};
		
			gmxAPI._tools.standart.addTool( 'bufferTool', bufferTool);
	    }
	}	   

	gmxCore.addModule('BufferPlugin', publicInterface,
	{
		css: "css/BufferPlugin.css",
		init: function(module, path){					
			
			return gmxCore.loadScriptWithCheck([
                {	//MyControlsFactory
                    check: function(){ return false; },
                    script: path + "js/MyControlsFactory.js?" + Math.random()
                },
                {   //StyleManager
                    check: function(){ return false; },
                    script: path + "js/StyleManager.js?" + Math.random()
                },
                {   //Buffer
                    check: function(){ return false; },
                    script: path + "js/Buffer.js"
                },
                {   //BufferManager
                    check: function(){ return false; },
                    script: path + "js/BufferManager.js?" + Math.random()
                },
                {   //MathHelper
                    check: function(){ return false; },
                    script: path + "js/MathHelper.js?" + Math.random()
                },
                {   //javascript.util
                    check: function(){ return false },
                    script: path + "js/javascript.util.js?" + Math.random()
                },
                {   //jsts
                    check: function(){ return false },
                    script: path + "js/jsts.js?" + Math.random()
                }
            ]);
		}//,
        //require: ['DateTimePeriodControl']
	});
	
})(jQuery);
