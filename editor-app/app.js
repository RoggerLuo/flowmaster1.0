/*
 * Activiti Modeler component part of the Activiti project
 * Copyright 2005-2014 Alfresco Software, Ltd. All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
'use strict';
var activitiModeler = angular.module('activitiModeler', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngDragDrop',
  'mgcrea.ngStrap', 
  'ngGrid',
  'ngAnimate',
  'pascalprecht.translate',
  'duScroll'
]);

var activitiModule = activitiModeler;
activitiModeler
  // Initialize routes
  .config(['$selectProvider', '$translateProvider','$httpProvider', function ($selectProvider, $translateProvider,$httpProvider) {
        
        ACTIVITI.CONFIG.ngAppConfig($httpProvider)

      // Override caret for bs-select directive
      angular.extend($selectProvider.defaults, {
          caretHtml: '&nbsp;<i class="icon icon-caret-down"></i>'
      });
        
        // Initialize angular-translate
        $translateProvider.useStaticFilesLoader({
            prefix: './editor-app/i18n/',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('zh');
        // remember language
        // $translateProvider.useCookieStorage();
        
  }])
  .run(['$rootScope', '$timeout', '$modal', '$translate', '$location', '$window', '$http', '$q',
        function($rootScope, $timeout, $modal, $translate, $location, $window, $http, $q) {
	  
			  $rootScope.config = ACTIVITI.CONFIG;
			  
			  $rootScope.editorInitialized = false;
		      
		      $rootScope.editorFactory = $q.defer();
		
		      $rootScope.forceSelectionRefresh = false;
		
		      $rootScope.ignoreChanges = false; // by default never ignore changes
		      
		      $rootScope.validationErrors = [];
		      
		      $rootScope.staticIncludeVersion = Date.now();

			  /**
		       * A 'safer' apply that avoids concurrent updates (which $apply allows).
		       */
		      $rootScope.safeApply = function(fn) {
		          var phase = this.$root.$$phase;
		          if(phase == '$apply' || phase == '$digest') {
		              if(fn && (typeof(fn) === 'function')) {
		                  fn();
		              }
		          } else {
		              this.$apply(fn);
		          }
		      };
	  
	  
            /**
             * Initialize the event bus: couple all Oryx events with a dispatch of the
             * event of the event bus. This way, it gets much easier to attach custom logic
             * to any event.
             */

             

            /* Helper method to fetch model from server (always needed) */
            function fetchModel(modelId) {
                /* get user fields data */
                $http({ method: 'GET', url: window.globalHost+'/identity/properties'}).success(function (data2) {
                    let linkageData = []
                    let k
                    for( k in data2){
                        linkageData.push({text:k,value:k})
                    }
                    let limited = {
                        // "birthday": "String", //(毫秒数）
                        "gender": "String",   // 性别，MALE FEMALE
                        "jobTitle": "Field",  // 职位
                        // "nickname": "String", // 昵称
                        // "disabled": "Boolean", // 是否禁用
                        // "sn": "String",  // 工号
                        // "email": "String", // 邮箱
                        // "initial": "String", // 拼音首字母
                        // "mobile": "String", // 手机
                        "senior":"String",//字符串:true/false
                        // "avatar": "String", // 头像
                        // "pinyin": "String", // 拼音
                        // "name": "String",  // 姓名
                        "username": "String", // 账号
                        // "status": "String", // 状态 （ACTIVATING， ACTIVATED）
                        // "id": "String", // userId
                    }
                    window.userProperties = linkageData.filter(el=>!!limited[el.value])
                    window.userProperties.unshift({text:'请选择',value:'initial',index:'initial'})
                    window.reduxStore.dispatch({type:'updateUserProperties',data:window.userProperties})
                })

                /* get form fields data */
                $http({    
                    method: 'GET',
                    url: window.globalHost+'/repository/process-definitions/'+window.getQueryString("pid")+'/forms?processType=Normal'
                }).success(function (data) {
                    const obj = JSON.parse(data.formDefinition)
                    window.formProperties = obj
                    if(!obj){
                        window.formProperties = []
                        return ;    
                    }
                    const mapmap = {
                        "text":true,
                        "textarea":true,
                        "number":true,
                        "money":true,
                        "date":true,
                        "time":true,
                        "selection":true,
                        multi_selection:true,
                        select_employee:true,
                        select_org:true,
                        mobile:true,
                        email:true,
                        phone:true,
                        calculate:true
                    }
                    const filteredComponents = obj.components.filter((el)=>{
                        return !!mapmap[el.type]
                    })
                    window.formProperties = filteredComponents.map((el)=>{
                        if(el.type == "calculate"){
                            if(el.rule.type != 'dateDiff'){
                                el.cate = el.type
                                el.text = el.title
                                el.value = el.name
                                el.type = 'double'
                                return el
                            }
                        }
                        el.cate = el.type
                        el.text = el.title
                        el.value = el.name
                        el.type = el.name_type
                        return el
                    })

                    window.formProperties.unshift({text:'请选择',value:'initial',index:'initial',type:'initial'})
                    window.reduxStore.dispatch({type:'updateFormProperties',data:window.formProperties})
                })

                /* get role data */
                $http({    
                    method: 'GET',
                    url: window.globalHost+'/identity/roles?orgId='+window.getQueryString("orgId")
                }).success(function (data) {
                    let roleData = data.data.map((el)=>{
                        return {
                            text:el.name,
                            value:el.id,
                            orgId:el.orgId
                        }                            
                    })
                    .filter((el)=>(el.value!='OrgSupervisor')&&(el.value!='OrgLeader'))
                    roleData.forEach((el,ind,arr)=>{
                        if(arr.filter((el2)=>el2.text == el.text).length>1){
                            $http({    
                                method: 'GET',
                                url: window.globalHost+'/identity/organizations/'+el.orgId
                            }).success(function (data) {
                                arr[ind].text = arr[ind].text + '('+data.name+')'
                            })
                        }
                    })

                    roleData = roleData.length === 0 ? [{text:'尚无角色可选择',value:'initial'}]:roleData
                    window.reduxStore.dispatch({type:'updateRoleData',roleData})
                })

                /* get pid data*/
                $http({    
                    method: 'GET',
                    url: window.globalHost+'/repository/process-definitions/'+window.getQueryString("pid")+'?processType=Normal'
                }).success(function (data2) {
                    window.pidName = data2.name
                    window.pidDescription = data2.description
                })

                const getModel = (callback)=>{
                    /* get model data */
                    $http({    
                        method: 'GET',
                        url: window.globalHost+'/repository/process-definitions/'+window.getQueryString("pid")+'/design?processType=Normal',
                    })
                    .success(function (data, status, headers, config) {
                        callback(data, status, headers, config)
                    })
                    .error(function (data, status, headers, config) {
                        // $scope.error = {};
                        console.log('Something went wrong when updating the process model:' + JSON.stringify(data));
                    });
                }

                getModel(function (data, status, headers, config) {                    
                    /* 如果是初始化数据,则替换成本地，or using remote api */
                    // let localData = window.localDesignData.read(window.getQueryString("pid"))
                    // if( !!localData){
                    //     data.model = localData
                    // }else{
                        if(!data.model.childShapes){ 
                            var modelUrl = KISBPM.URL.getModel(modelId);
                            $http({method: 'GET', url: modelUrl}).success(function (data, status, headers, config) {
                                $rootScope.editor = new ORYX.Editor(data);  //initialised   10866 12431 10060
                                $rootScope.modelData = angular.fromJson(data);
                                $rootScope.editorFactory.resolve();
                            })
                            return ;
                        }
                    // }

                    /* 对服务器上的数据进行 解析 然后加载进redux */
                    data.model.childShapes && data.model.childShapes.forEach((el,index)=>{
                        switch(el.stencil.id){
                            case 'SequenceFlow':
                                let sf = []
                                if(!el.properties.reduxdata){
                                    // return;
                                }else{
                                    window.reduxStore.dispatch({type:'sequenceDataInit',data:el.properties.reduxdata})                                    
                                }
                                /* exclusive gate的内容 */
                                if(el.properties.defaultflow== "true" ){
                                    /*  
                                        寻找sequenceflow的上一个节点（分支）
                                        循环所有的节点，找他们的outgoing里面是不是有这个sequenceflow的resourceId
                                    */
                                    const theExclusiveGate = data.model.childShapes.filter((everyChild)=>{ 
                                        return everyChild.outgoing.some((outgoingEl)=>{
                                            return outgoingEl.resourceId == el.resourceId
                                        })
                                    })[0]

                                    let elName =  data.model.childShapes.filter((eachChild)=>eachChild.resourceId == el.outgoing[0].resourceId)[0].properties.name
                                    const branchObj = theExclusiveGate.outgoing.map((elOfEx)=>{
                                        let currentElement = data.model.childShapes.filter((eachChild)=>eachChild.resourceId == elOfEx.resourceId)[0]
                                        let name = data.model.childShapes.filter((eachChild)=>eachChild.resourceId == currentElement.outgoing[0].resourceId)[0].properties['oryx-name']
                                        return {branchResourceId:elOfEx.resourceId,name,defaultflow:'df',choosed:'false'}
                                    })


                                    const reduxObj = {resourceId:theExclusiveGate.resourceId,data:branchObj,choosed:{text:elName,value:el.resourceId}}
                                    if(reduxObj.data.length){
                                        /* 要放在switchElement后面，不然会顺序会出问题，元素id还没更新 */
                                        window.reduxStore.dispatch({ type: 'branchNodeInit',data:reduxObj})
                                    }
                                }

                                // delete data.model.childShapes[index].properties.name
                                delete data.model.childShapes[index].properties.reduxdata
                                delete data.model.childShapes[index].properties.defaultflow
                                delete data.model.childShapes[index].properties.conditionsequenceflow
                                break

                            case 'EndNoneEvent':
                                let endData = []
                                if(!el.properties.deliverToUsers){return;}
                                endData = el.properties.deliverToUsers.map((el2)=>{ //会签组12345
                                    let obj = {cate:el2.cate,value:el2.id,text:el2.text}
                                    if(el2.value2){
                                        obj.value2 = el2.value2
                                    }
                                    return  obj
                                })  
                                window.reduxStore.dispatch({type:'endPointDataInit',data:{data:endData,id:el.resourceId}})
                                delete data.model.childShapes[index].properties.deliverToUsers
                            break
                            case 'EndErrorEvent':
                                let endData2 = []
                                if(!el.properties.deliverToUsers){return;}
                                endData2 = el.properties.deliverToUsers.map((el2)=>{ //会签组12345
                                    let obj = {cate:el2.cate,value:el2.id,text:el2.text}
                                    if(el2.value2){
                                        obj.value2 = el2.value2
                                    }
                                    return  obj
                                })  
                                window.reduxStore.dispatch({type:'endPointDataInit',data:{data:endData2,id:el.resourceId}})
                                delete data.model.childShapes[index].properties.deliverToUsers
                            break

                            case 'UserTask':
                                let approveData = []
                                if(!el.properties.usertaskassignment){return;}
                                if(typeof(el.properties.usertaskassignment.assignment.candidateOwners) !='object'){
                                    delete data.model.childShapes[index].properties.usertaskassignment
                                    return ;                                    
                                }
                                approveData = el.properties.usertaskassignment.assignment.candidateOwners.map((el2)=>{ //会签组12345
                                    let obj = {cate:el2.cate,value:el2.id,text:el2.text}
                                    if(el2.value2){
                                        obj.value2 = el2.value2
                                    }
                                    return  obj
                                })  
                                window.reduxStore.dispatch({type:'approveDataInit',data:{data:approveData,id:el.resourceId}})
                                delete data.model.childShapes[index].properties.usertaskassignment
                            break

                            case 'MultiUserTask':
                                let theData = []
                                if(!el.properties.multiinstance_parties){return;}
                                theData = el.properties.multiinstance_parties.map((el2)=>{ //会签组12345
                                    
                                    return el2.map((el3)=>{ 
                                        let obj = {cate:el3.cate,value:el3.id,text:el3.text}
                                        if(el3.value2){
                                            obj.value2 = el3.value2
                                        }
                                        return  obj
                                    })
                                })  
                                window.reduxStore.dispatch({type:'parallelDataInit',data:{data:theData,id:el.resourceId}})
                                delete data.model.childShapes[index].properties.multiinstance_parties
                                delete data.model.childShapes[index].properties.multiinstance_type
                                delete data.model.childShapes[index].properties.multiinstance_cardinality
                                delete data.model.childShapes[index].properties.multiinstance_variable
                                delete data.model.childShapes[index].properties.usertaskassignment
                            break
                        }
                    })
                    $rootScope.editor = new ORYX.Editor(data.model);  //initialised   10866 12431 10060
                    $rootScope.modelData = angular.fromJson(data.model);

                // var modelUrl = KISBPM.URL.getModel(modelId);
                // $http({method: 'GET', url: modelUrl}).success(function (data, status, headers, config) {
                //     $rootScope.editor = new ORYX.Editor(data);  //initialised   10866 12431 10060
                //     $rootScope.modelData = angular.fromJson(data);
                    
                    $rootScope.editorFactory.resolve();

                })

                // .
                //     error(function (data, status, headers, config) {
                //       console.log('Error loading model with id ' + modelId + ' ' + data);
                //     });
            }

            function initScrollHandling() {
                var canvasSection = jQuery('#canvasSection');
                canvasSection.scroll(function() {

                    // Hides the resizer and quick menu items during scrolling

                    var selectedElements = $rootScope.editor.selection;
                    var subSelectionElements = $rootScope.editor._subSelection;

                    $rootScope.selectedElements = selectedElements;
                    $rootScope.subSelectionElements = subSelectionElements;
                    if (selectedElements && selectedElements.length > 0) {
                    	$rootScope.selectedElementBeforeScrolling = selectedElements[0];
                    }

                    jQuery('.Oryx_button').each(function(i, obj) {
                    	$rootScope.orginalOryxButtonStyle = obj.style.display;
                    	obj.style.display = 'none';
                    });
                    
                    jQuery('.resizer_southeast').each(function(i, obj) {
                    	$rootScope.orginalResizerSEStyle = obj.style.display;
                        obj.style.display = 'none';
                    });
                    jQuery('.resizer_northwest').each(function(i, obj) {
                    	$rootScope.orginalResizerNWStyle = obj.style.display;
                        obj.style.display = 'none';
                    });



                    $rootScope.editor.handleEvents({type:ORYX.CONFIG.EVENT_CANVAS_SCROLL});
                });

                canvasSection.scrollStopped(function(){

                    // Puts the quick menu items and resizer back when scroll is stopped.

                    $rootScope.editor.setSelection([]); // needed cause it checks for element changes and does nothing if the elements are the same
                    $rootScope.editor.setSelection($rootScope.selectedElements, $rootScope.subSelectionElements);
                    $rootScope.selectedElements = undefined;
                    $rootScope.subSelectionElements = undefined;

                    function handleDisplayProperty(obj) {
                        if (jQuery(obj).position().top > 0) {
                            obj.style.display = 'block';
                        } else {
                            obj.style.display = 'none';
                        }
                    }

                    jQuery('.Oryx_button').each(function(i, obj) {
                        handleDisplayProperty(obj);
                    });
                    
                    jQuery('.resizer_southeast').each(function(i, obj) {
                        handleDisplayProperty(obj);
                    });
                    jQuery('.resizer_northwest').each(function(i, obj) {
                        handleDisplayProperty(obj);
                    });

                });
            }

            /**
             * Initialize the Oryx Editor when the content has been loaded
             */
            // includeContentLoaded这个事件在哪
            // editorInitialized这个属性在哪
            $rootScope.$on('$includeContentLoaded', function (event) {
	            if (!$rootScope.editorInitialized) {

	            	ORYX._loadPlugins();
	
                    var modelId = 'test'
                    // var modelId = EDITOR.UTIL.getParameterByName('modelId'); //获取url的值
                    fetchModel(modelId); 
	                /*
                        $rootScope.editor = new ORYX.Editor(data); 初始化editor
                        $rootScope.modelData = angular.fromJson(data);储存data
                    */
	                $rootScope.window = {};
	                var updateWindowSize = function() { //为什么要updata window size呢
	                    $rootScope.window.width = $window.innerWidth;
	                    $rootScope.window.height  = $window.innerHeight;
	                };
	
	                // Window resize hook
	                angular.element($window).bind('resize', function() {
	                    $rootScope.safeApply(updateWindowSize());  
                        //就是  触发更新，如果正在$apply那就手动执行一次
                        // 如果$apply没有正在执行则执行
	                });
	
	                $rootScope.$watch('window.forceRefresh', function(newValue) { //forceRefresh是啥？
                        if(newValue) {
	                        $timeout(function() {
	                            updateWindowSize();
	                            $rootScope.window.forceRefresh = false;
	                        });
	                    }
	                });
	
	                updateWindowSize();

	                // Hook in resizing of main panels when window resizes
	                // TODO: perhaps move to a separate JS-file?
	                jQuery(window).resize(function () {

	                    // Calculate the offset based on the bottom of the module header
	                    var offset = jQuery("#editor-header").offset();
	                    var propSectionHeight = jQuery('#propertySection').height();
	                    var canvas = jQuery('#canvasSection');
	                    var mainHeader = jQuery('#main-header');

	                    if (offset == undefined || offset === null
	                        || propSectionHeight === undefined || propSectionHeight === null
	                        || canvas === undefined || canvas === null || mainHeader === null) {
	                        return;
	                    }
	                    
	                    if ($rootScope.editor)
	                	{
	        	        	var selectedElements = $rootScope.editor.selection;
	        	            var subSelectionElements = $rootScope.editor._subSelection;
	        	
	        	            $rootScope.selectedElements = selectedElements;
	        	            $rootScope.subSelectionElements = subSelectionElements;
	        	            if (selectedElements && selectedElements.length > 0)
	        	            {
	        	            	$rootScope.selectedElementBeforeScrolling = selectedElements[0];
	        	            	
	        	            	$rootScope.editor.setSelection([]); // needed cause it checks for element changes and does nothing if the elements are the same
	        	                $rootScope.editor.setSelection($rootScope.selectedElements, $rootScope.subSelectionElements);
	        	                $rootScope.selectedElements = undefined;
	        	                $rootScope.subSelectionElements = undefined;
	        	            }
	                	}

                        // var totalAvailable = jQuery(window).height() - offset.top - mainHeader.height() - 21;
                        // var totalAvailable = jQuery(window).height() - offset.top - 21;
                        // var totalAvailable = jQuery(window).height() - 21;
                        var totalAvailable = jQuery(window).height();

	                    // canvas.height(totalAvailable - propSectionHeight);
                        
                        canvas.height(totalAvailable);
                        
                        if(totalAvailable < 400){
                            jQuery('#paletteSection').height('400');
                        }else{
                            jQuery('#paletteSection').height(totalAvailable);
                        }


	                    // Update positions of the resize-markers, according to the canvas

	                    var actualCanvas = null;
	                    if (canvas && canvas[0].children[1]) {
	                        actualCanvas = canvas[0].children[1];
	                    }

	                    var canvasTop = canvas.position().top;
	                    var canvasLeft = canvas.position().left;
	                    var canvasHeight = canvas[0].clientHeight;
	                    var canvasWidth = canvas[0].clientWidth;
	                    var iconCenterOffset = 8;
	                    var widthDiff = 0;

	                    var actualWidth = 0;
	                    if(actualCanvas) {
	                        // In some browsers, the SVG-element clientwidth isn't available, so we revert to the parent
	                        actualWidth = actualCanvas.clientWidth || actualCanvas.parentNode.clientWidth;
	                    }


	                    if(actualWidth < canvas[0].clientWidth) {
	                        widthDiff = actualWidth - canvas[0].clientWidth;
	                        // In case the canvas is smaller than the actual viewport, the resizers should be moved
	                        canvasLeft -= widthDiff / 2;
	                        canvasWidth += widthDiff;
	                    }

	                    var iconWidth = 17;
	                    var iconOffset = 20;

	                    var north = jQuery('#canvas-grow-N');
	                    north.css('top', canvasTop + iconOffset + 'px');
	                    north.css('left', canvasLeft - 10 + (canvasWidth - iconWidth) / 2 + 'px');

	                    var south = jQuery('#canvas-grow-S');
	                    south.css('top', (canvasTop + canvasHeight - iconOffset - iconCenterOffset) +  'px');
	                    south.css('left', canvasLeft - 10 + (canvasWidth - iconWidth) / 2 + 'px');

	                    var east = jQuery('#canvas-grow-E');
	                    east.css('top', canvasTop - 10 + (canvasHeight - iconWidth) / 2 + 'px');
	                    east.css('left', (canvasLeft + canvasWidth - iconOffset - iconCenterOffset) + 'px');

	                    var west = jQuery('#canvas-grow-W');
	                    west.css('top', canvasTop -10 + (canvasHeight - iconWidth) / 2 + 'px');
	                    west.css('left', canvasLeft + iconOffset + 'px');

	                    north = jQuery('#canvas-shrink-N');
	                    north.css('top', canvasTop + iconOffset + 'px');
	                    north.css('left', canvasLeft + 10 + (canvasWidth - iconWidth) / 2 + 'px');

	                    south = jQuery('#canvas-shrink-S');
	                    south.css('top', (canvasTop + canvasHeight - iconOffset - iconCenterOffset) +  'px');
	                    south.css('left', canvasLeft +10 + (canvasWidth - iconWidth) / 2 + 'px');

	                    east = jQuery('#canvas-shrink-E');
	                    east.css('top', canvasTop + 10 + (canvasHeight - iconWidth) / 2 +  'px');
	                    east.css('left', (canvasLeft + canvasWidth - iconOffset - iconCenterOffset) + 'px');

	                    west = jQuery('#canvas-shrink-W');
	                    west.css('top', canvasTop + 10 + (canvasHeight - iconWidth) / 2 + 'px');
	                    west.css('left', canvasLeft + iconOffset + 'px');
	                });

	                jQuery(window).trigger('resize');

	                jQuery.fn.scrollStopped = function(callback) {
	                    jQuery(this).scroll(function(){
	                        var self = this, $this = jQuery(self);
	                        if ($this.data('scrollTimeout')) {
	                            clearTimeout($this.data('scrollTimeout'));
	                        }
	                        $this.data('scrollTimeout', setTimeout(callback,50,self));
	                    });
	                };
	                
	                // Always needed, cause the DOM element on which the scroll event listeners are attached are changed for every new model
	                
                    initScrollHandling();
	                
	                $rootScope.editorInitialized = true;


	            }
            });

            /**
             * Initialize the event bus: couple all Oryx events with a dispatch of the
             * event of the event bus. This way, it gets much easier to attach custom logic
             * to any event.
             */

            $rootScope.editorFactory.promise.then(function() {

                KISBPM.eventBus.editor = $rootScope.editor;

                var eventMappings = [
                    { oryxType : ORYX.CONFIG.EVENT_SELECTION_CHANGED, kisBpmType : KISBPM.eventBus.EVENT_TYPE_SELECTION_CHANGE },
                    { oryxType : ORYX.CONFIG.EVENT_DBLCLICK, kisBpmType : KISBPM.eventBus.EVENT_TYPE_DOUBLE_CLICK },
                    { oryxType : ORYX.CONFIG.EVENT_MOUSEOUT, kisBpmType : KISBPM.eventBus.EVENT_TYPE_MOUSE_OUT },
                    { oryxType : ORYX.CONFIG.EVENT_MOUSEOVER, kisBpmType : KISBPM.eventBus.EVENT_TYPE_MOUSE_OVER }

                ];

                //代理：把Oryx事件都 映射到 ksbpm事件
                eventMappings.forEach(function(eventMapping) {
                    $rootScope.editor.registerOnEvent(eventMapping.oryxType, function(event) {
                        KISBPM.eventBus.dispatch(eventMapping.kisBpmType, event);
                    });
                });
                
                //单独绑一个shape removed是啥，删除吗，还是隐藏? validateButton
                //event.shape.resourceId + "-validate-button" ????
                $rootScope.editor.registerOnEvent(ORYX.CONFIG.EVENT_SHAPEREMOVED, function (event) {
                    var validateButton = document.getElementById(event.shape.resourceId + "-validate-button");
    	    		if (validateButton)
    	    		{
    	    			validateButton.style.display = 'none';
    	    		}
                });

                // The Oryx canvas is ready (we know since we're in this promise callback) and the
                // event bus is ready. The editor is now ready for use
                KISBPM.eventBus.dispatch(KISBPM.eventBus.EVENT_TYPE_EDITOR_READY, {type : KISBPM.eventBus.EVENT_TYPE_EDITOR_READY});

            });
            
            // Alerts
            $rootScope.alerts = {
                queue: []
            };
          
            $rootScope.showAlert = function(alert) {
                if(alert.queue.length > 0) {
                    alert.current = alert.queue.shift();
                    // Start timout for message-pruning
                    alert.timeout = $timeout(function() {
                        if (alert.queue.length == 0) {
                            alert.current = undefined;
                            alert.timeout = undefined;
                        } else {
                            $rootScope.showAlert(alert);
                        }
                    }, (alert.current.type == 'error' ? 5000 : 1000));
                } else {
                    $rootScope.alerts.current = undefined;
                }
            };
          
            $rootScope.addAlert = function(message, type) {
                var newAlert = {message: message, type: type};
                if (!$rootScope.alerts.timeout) {
                    // Timeout for message queue is not running, start one
                    $rootScope.alerts.queue.push(newAlert);
                    $rootScope.showAlert($rootScope.alerts);
                } else {
                    $rootScope.alerts.queue.push(newAlert);
                }
            };
          
            $rootScope.dismissAlert = function() {
                if (!$rootScope.alerts.timeout) {
                    $rootScope.alerts.current = undefined;
                } else {
                    $timeout.cancel($rootScope.alerts.timeout);
                    $rootScope.alerts.timeout = undefined;
                    $rootScope.showAlert($rootScope.alerts);
                }
            };
          
            $rootScope.addAlertPromise = function(promise, type) {
                if (promise) {
                    promise.then(function(data) {
                        $rootScope.addAlert(data, type);
                    });
                }
            };
          
        }
  ])

    // Moment-JS date-formatting filter
    .filter('dateformat', function() {
        return function(date, format) {
            if (date) {
                if (format) {
                    return moment(date).format(format);
                } else {
                    return moment(date).calendar();
                }
            }
            return '';
        };
    });
