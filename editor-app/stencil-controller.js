'use strict';

function limitedCondition(option) {
    /* sequnce flow 的限制 */
    if (option.connectedShape && (option.connectedShape._stencil._jsonStencil.title == 'Exclusive gateway')) {
        // window.showAlert('Exclusive gateway节点');
    }
    
    /* 开始节点的限制 */
    if (option.connectedShape && (option.connectedShape._stencil._jsonStencil.title == 'Start event')) {
        var branchCounter = 0;
        option.connectedShape.outgoing.forEach(function(el) {
            branchCounter += 1;
        });
        if (branchCounter >= 1) {
            window.showAlert('开始节点不能有分支');
            return false;
        }
    }

    /* 审批节点的限制 */
    if (option.connectedShape && (option.connectedShape._stencil._jsonStencil.title == 'User task')) {
        var branchCounter = 0;
        option.connectedShape.outgoing.forEach(function(el) {
            // if (el._stencil._jsonStencil.title == 'Sequence flow'){
            branchCounter += 1;
            // }
        });
        if (branchCounter >= 1) {
            window.showAlert('审批节点不能有分支');
            return false;
        }
    }
    if (option.connectedShape && (option.connectedShape._stencil._jsonStencil.title == 'Multi user task')) {
        var branchCounter = 0;
        option.connectedShape.outgoing.forEach(function(el) {
            // if (el._stencil._jsonStencil.title == 'Sequence flow'){
            branchCounter += 1;
            // }
        });
        if (branchCounter >= 1) {
            window.showAlert('会签节点不能有分支');
            return false;
        }
    }

    return true;
}

'use strict';
angular.module('activitiModeler')
    .controller('StencilController', ['$rootScope', '$scope', '$http', '$modal', '$timeout', function($rootScope, $scope, $http, $modal, $timeout) {
        
        // Property window toggle state
        $scope.propertyWindowState = { 'collapsed': false }; //哪个toggle?

        // Add reference to global header-config
        $scope.headerConfig = KISBPM.HEADER_CONFIG; //header用来展示什么，我咋没看见header

        $scope.propertyWindowState.toggle = function() {
            $scope.propertyWindowState.collapsed = !$scope.propertyWindowState.collapsed;
            $timeout(function() {
                jQuery(window).trigger('resize'); //这个事件在哪？
            });
        };

        /*
            $scope.editorFactory.promise 这个方法的目的就是初始化以下属性：
            $scope.stencilItemGroups
            $scope.morphingRules 
            $scope.containmentRules 
        */

        // Code that is dependent on an initialised Editor is wrapped in a promise for the editor
        $scope.editorFactory.promise.then(function() {

            myEvent($scope,$http)
            window.userGuide()

            /* Build stencil item list */
            // Build simple json representation of stencil set
            var stencilItemGroups = []; /* stencilItemGroups 是所有左边的menu，只有一层数组，因为只有一层子菜单 */

            // 使用循环 根据名字来找group Helper method: find a group in an array
            var findGroup = function(name, groupArray) {
                for (var index = 0; index < groupArray.length; index++) {
                    if (groupArray[index].name === name) {
                        return groupArray[index];
                    }
                }
                return null;
            };

            // 使用循环 根据名字添加一个空的group, Helper method: add a new group to an array of groups
            var addGroup = function(groupName, groupArray) { //通过groupName来添加group，但是内容是空的
                //给stencilItemGroups添加一个空的group, 有items属性，有paletteItems，还有子groups
                var group = { name: groupName, items: [], paletteItems: [], groups: [], visible: true };
                groupArray.push(group);
                return group;
            };

            /*
             StencilSet items
             stencilSet 应该是activiti 的angular 系统做出来的数据结构
             */
            $http({ method: 'GET', url: KISBPM.URL.getStencilSet() }).success(function(data, status, headers, config) {
                var quickMenuDefinition = [ //就是那个点出来的菜单,手动确定的
                    'SequenceFlow',
                    'UserTask',
                    'ExclusiveGateway',
                    // 'MuleTask',
                    'MultiUserTask',
                    // 'EndErrorEvent',
                    // 'EndNoneEvent', 
                    // 'CatchTimerEvent', 
                    // 'ThrowNoneEvent', 
                    // 'TextAnnotation',
                    // 'Association'
                ];
                //调色板不显示的项目
                // var ignoreForPaletteDefinition = ['SequenceFlow', 'MessageFlow', 'Association', 'DataAssociation', 'DataStore', 'SendTask'];
                var ignoreForPaletteDefinition = [];

                var quickMenuItems = [];

                var morphRoles = []; //变形规则？


                /* 只是把rule的role字段复制到morphRoles里面 */
                for (var i = 0; i < data.rules.morphingRules.length; i++) {
                    var role = data.rules.morphingRules[i].role;
                    var roleItem = { 'role': role, 'morphOptions': [] };
                    morphRoles.push(roleItem)
                }

                // Check all received items
                //stencils是UserTask、StartTimerEvent这种的
                for (var stencilIndex = 0; stencilIndex < data.stencils.length; stencilIndex++) {
                    /*
                    现在 在循环stencils里面,stencilItemGroups是全局变量
                    当前循环 临时定义的变量 有： 
                        @currentGroupName , 从data.stencils[stencilIndex].groups[0]获得名字
                        @currentGroup , 从名字和findGroup(currentGroupName, stencilItemGroups)获得这个group//没有就添加一个只有名字的空group
                        @removed ,
                        @stencilItem ,映射 data.stencils[stencilIndex] 的对象，增加了canConnect等对象                    
                    */

                    // Check if the root group is the 'diagram' group. If so, this item should not be shown.
                    // 在这里，循环内，定义当前循环的stencils[i]的groups
                    var currentGroupName = data.stencils[stencilIndex].groups[0]; //为什么是数组，可以出现在多个子菜单吗

                    if (currentGroupName === 'Diagram' || currentGroupName === 'Form') {
                        continue; // go to next item
                    }

                    var removed = false;
                    if (data.stencils[stencilIndex].removed) { //这个字段还没出现过
                        removed = true;
                    }

                    // 一个currentGroupName 一个currentGroup，简直，不是一个就好了吗，坑爹
                    var currentGroup = undefined;
                    if (!removed) {

                        // Check if this group already exists. If not, we create a new one
                        if (currentGroupName !== null && currentGroupName !== undefined && currentGroupName.length > 0) {

                            currentGroup = findGroup(currentGroupName, stencilItemGroups); // Find group in root groups array
                            if (currentGroup === null) {
                                currentGroup = addGroup(currentGroupName, stencilItemGroups);
                            }

                            // Add all child groups (if any)
                            /* 循环，然后添加子groups，难道还有多层groups，可是现在json里只有一层 */
                            for (var groupIndex = 1; groupIndex < data.stencils[stencilIndex].groups.length; groupIndex++) {
                                var childGroupName = data.stencils[stencilIndex].groups[groupIndex];
                                var childGroup = findGroup(childGroupName, currentGroup.groups); // currentGroup.groups 果然是多层嵌套
                                if (childGroup === null) {
                                    childGroup = addGroup(childGroupName, currentGroup.groups);
                                }

                                // The current group variable holds the parent of the next group (if any),
                                // and is basically the last element in the array of groups defined in the stencil item
                                currentGroup = childGroup; //嵌套，不理它
                            }
                        }
                    }

                    // Construct the stencil item
                    /* 这是把 stencils又映射成另一个item */
                    /* 现在还在data.stencils的for循环里面 */
                    /* 映射是为了什么目的呢？ */
                    /*
                        就把 title改成name
                        还加了cuntomIcon, canConnect等属性
                    */

                    var stencilItem = {
                        'id': data.stencils[stencilIndex].id,
                        'name': data.stencils[stencilIndex].title,
                        'description': data.stencils[stencilIndex].description,
                        'icon': data.stencils[stencilIndex].icon,
                        'type': data.stencils[stencilIndex].type,
                        'roles': data.stencils[stencilIndex].roles,
                        'removed': removed,
                        'customIcon': false,
                        'canConnect': false,
                        'canConnectTo': false,
                        'canConnectAssociation': false
                    };

                    /* 可以设置 customIcon */
                    if (data.stencils[stencilIndex].customIconId && data.stencils[stencilIndex].customIconId > 0) {
                        stencilItem.customIcon = true;
                        stencilItem.icon = data.stencils[stencilIndex].customIconId;
                    }

                    /* 如果是quickMenu其中之一，就把quickMenu的'字符串'替换成这个映射出来的对象 */
                    if (!removed) {
                        if (quickMenuDefinition.indexOf(stencilItem.id) >= 0) {
                            quickMenuItems[quickMenuDefinition.indexOf(stencilItem.id)] = stencilItem;
                        }
                    }
                    /* 所以到最后quickMenu的字符串全部变成了真实对象，这就是个转换器，通过名字去拿对象 */

                    // TextAnnotation、BoundaryCompensationEvent 这两是啥
                    if (stencilItem.id === 'TextAnnotation' || stencilItem.id === 'BoundaryCompensationEvent') {
                        stencilItem.canConnectAssociation = true; //??
                    }

                    /*
                    现在 在循环stencils里面, stencilItemGroups是全局变量
                    当前循环 临时定义的变量 有： 
                        @currentGroupName , 从data.stencils[stencilIndex].groups[0]获得名字
                        @currentGroup , 从名字和findGroup(currentGroupName, stencilItemGroups)获得这个group//没有就添加一个只有名字的空group
                        @removed ,
                        @stencilItem ,映射 data.stencils[stencilIndex] 的对象，增加了canConnect等对象
                        
                    */
                    // 设置这个对象的canConnect等属性，通过role来进行逻辑判断
                    for (var i = 0; i < data.stencils[stencilIndex].roles.length; i++) { //role角色，一个item有多个角色
                        var stencilRole = data.stencils[stencilIndex].roles[i];
                        if (stencilRole === 'sequence_start') {
                            stencilItem.canConnect = true;
                        } else if (stencilRole === 'sequence_end') {
                            stencilItem.canConnectTo = true; //canConnectTo?? 答：能够被连接
                        }

                        /* 
                            不知道morphRoles的role和baseMorphs有什么用
                            有符合 morphRoles项的item.role 就把这个item push进这一项的morphOptions属性
                        */
                        for (var j = 0; j < morphRoles.length; j++) {
                            if (stencilRole === morphRoles[j].role) { //如果在morphRoles列表里
                                if (!removed) {
                                    morphRoles[j].morphOptions.push(stencilItem);
                                }
                                //stencilItem是大循环中的一个当前item， stencilRole是小循环的，而现在处在小小循环

                                //这句话不理解了，难道会进行多次赋值？
                                stencilItem.morphRole = morphRoles[j].role;
                                break; //不对，赋值一次之后就break了，break小循环还是大循环，卧槽...
                            }
                        }
                    }

                    /*
                    现在 在循环stencils里面, stencilItemGroups 是全局变量
                    当前循环 临时定义的变量 有： 
                        @currentGroupName , 从data.stencils[stencilIndex].groups[0]获得名字
                        @currentGroup , 从名字和findGroup(currentGroupName, stencilItemGroups)获得这个group//没有就添加一个只有名字的空group
                        @removed ,
                        @stencilItem , 映射 data.stencils[stencilIndex] 的对象，增加了canConnect等对象
                    */
                    /*
                        currentGroup还有  paletteitems和items
                    */
                    if (currentGroup) {
                        // Add the stencil item to the correct group

                        currentGroup.items.push(stencilItem);
                        //ok, 把这个stencils映射之后的对象 放进 它所属于的group的items里面
                        //wait，这个items属性是要闹哪样？

                        if (ignoreForPaletteDefinition.indexOf(stencilItem.id) < 0) {
                            currentGroup.paletteItems.push(stencilItem);
                            //这里又多一个paletteItems属性
                        }

                    } else { //如果currentGroup不存在？？？这里逻辑不明白 
                        // It's a root stencil element //为什么就是root stencil, root stencil是stencilItem?
                        if (!removed) {
                            stencilItemGroups.push(stencilItem);
                            // 这个stencilItemGroups是刚才用addGroups add了当前循环的group，为什么又push一次
                            // 这次push的是stencilItem上次是group
                        }
                    }


                }
                //超级大循环结束


                /* stencilItemGroups 是所有左边的menu，只有一层数组，因为只有一层子菜单 */
                //addGroup给stencilItemGroups添加一个空的group, 有items属性，有paletteItems，还有子groups
                for (var i = 0; i < stencilItemGroups.length; i++) {
                    //逐个检查每个菜单栏,如果没有内容就不要显示
                    if (stencilItemGroups[i].paletteItems && stencilItemGroups[i].paletteItems.length == 0) {
                        stencilItemGroups[i].visible = false;
                    }
                }

                // 给scope戴上这个属性
                $scope.stencilItemGroups = stencilItemGroups;

                //data.rules.containmentRules这个又是干嘛的
                var containmentRules = [];
                for (var i = 0; i < data.rules.containmentRules.length; i++) {
                    var rule = data.rules.containmentRules[i];
                    containmentRules.push(rule);
                }
                $scope.containmentRules = containmentRules; //好吧，暂时不知道这个是干嘛的

                // remove quick menu items which are not available anymore due to custom pallette
                var availableQuickMenuItems = [];
                for (var i = 0; i < quickMenuItems.length; i++) {
                    if (quickMenuItems[i]) {
                        availableQuickMenuItems[availableQuickMenuItems.length] = quickMenuItems[i]; //为什么用这种写法，给跪，push不好吗
                    }
                }

                $scope.quickMenuItems = availableQuickMenuItems;
                $scope.morphRoles = morphRoles; //这个用来干啥??



                /* 发送加载完成的消息 */
                let message = {type:"designLoadComplete",value:""}
                window.parent.postMessage(message,'*')

                window.windowCanvas = $scope.editor.getCanvas()
                
            }).

            error(function(data, status, headers, config) {
                console.log('Something went wrong when fetching stencil items:' + JSON.stringify(data));
            });


            /*
             * Listen to selection change events: show properties
             */
            /*
               改变一下选择，
               获得这个elements ，然后更新
               $scope.selectedItem = selectedItem; //这个属性是从svg的oryx库里的对象映射过来的angular层面的对象
               $scope.selectedShape = selectedShape; //这个是oryx原生的对象
               *scope.previousShape

            */
            $scope.editor.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, function(event) {
                var shapes = event.elements;
                /* elements 是一个数组，里面有classDef对象, classDef对象是什么来的？
                    有isMovable属性
                    magnets属性
                    node属性等等
                    properties
                    isChanged isResized isVisible isSelectable:true
                */
                var canvasSelected = false;

                if (shapes && shapes.length == 0) { //如果没有选择shapes那就选择 画布 
                    shapes = [$scope.editor.getCanvas()];
                    canvasSelected = true; //选择画布
                }
                if (shapes && shapes.length > 0) {
                    var selectedShape = shapes.first(); //first方法..again
                    var stencil = selectedShape.getStencil(); //getStencil?

                    //啥意思
                    if ($rootScope.selectedElementBeforeScrolling && stencil.id().indexOf('BPMNDiagram') !== -1) {
                        // ignore canvas event because of empty selection when scrolling stops
                        return;
                    }
                    //selectedElementBeforeScrolling这个哪里来？
                    if ($rootScope.selectedElementBeforeScrolling && $rootScope.selectedElementBeforeScrolling.getId() === selectedShape.getId()) {
                        $rootScope.selectedElementBeforeScrolling = null;
                        return;
                    }

                    // Store previous selection
                    //这个用法....
                    $scope.previousSelectedShape = $scope.selectedShape;

                    // Only do something if another element is selected (Oryx fires this event multiple times)
                    //如果现在选择的元素 和 之前选择的不是同一个
                    if ($scope.selectedShape !== undefined && $scope.selectedShape.getId() === selectedShape.getId()) {
                        if ($rootScope.forceSelectionRefresh) { //这个字段..暂时忽略
                            // Switch the flag again, this run will force refresh
                            $rootScope.forceSelectionRefresh = false;
                        } else {

                            // Selected the same element again, no need to update anything
                            // 有need 还是非常有need，为了textarea同步刷新“节点名称”
                            // 在oryx.debug的第18711行增加一个事件dispatch，一旦textare失去焦点就会触发重新select
                            // return;
                        }
                    }
                    
                    /* 如果直接切换item，直接把title设置成空字符串，导致每次都保存失败 */
                    // window.inputBlurred && window.inputBlurred(true)
                    
                    //注意多了一个局部变量 selectedItem
                    var selectedItem = { 'title': '', 'properties': [] };

                    selectedItem.jsonStencilTitle = selectedShape._stencil._jsonStencil.title;

                    if (canvasSelected) { //如果选了画布，尼玛这个逻辑太散了吧,不能写在一起吗
                        selectedItem.auditData = { //这个字段什么用，不管了先
                            'author': $scope.modelData.createdByUser,
                            'createDate': $scope.modelData.createDate
                        };
                    }

                    /* 现在在如果shape大于1的if条件句里面，写这么长，谁知道现在在哪个条件分支还是循环？*/
                    // Gather properties of selected item
                    /*
                    var selectedShape = shapes.first(); //first方法..again
                    var stencil = selectedShape.getStencil(); 
                    */
                    var properties = stencil.properties(); //这个stencil哪里来？

                    // 对每一个properties进行遍历
                    for (var i = 0; i < properties.length; i++) {
                        var property = properties[i];
                        if (property.popular() == false) continue;
                        var key = property.prefix() + "-" + property.id();

                        if (key === 'oryx-name') {
                            selectedItem.title = selectedShape.properties[key];
                        }

                        // First we check if there is a config for 'key-type' and then for 'type' alone
                        // 对每一个properties进行遍历
                        // 看看有没有key-type或者直接type的配置信息
                        var propertyConfig = KISBPM.PROPERTY_CONFIG[key + '-' + property.type()];
                        if (propertyConfig === undefined || propertyConfig === null) {
                            propertyConfig = KISBPM.PROPERTY_CONFIG[property.type()];
                        }

                        // 没有就warning
                        if (propertyConfig === undefined || propertyConfig === null) {
                            console.log('WARNING: no property configuration defined for ' + key + ' of type ' + property.type());
                        } else { //如果有配置

                            //转化下boolean值
                            if (selectedShape.properties[key] === 'true') {
                                selectedShape.properties[key] = true;
                            }

                            if (KISBPM.CONFIG.showRemovedProperties == false && property.isHidden()) {
                                continue;
                            }
                            //{如果 有配置的if条件分支
                            var currentProperty = {
                                'key': key,
                                'title': property.title(),
                                'type': property.type(),
                                'mode': 'read',
                                'hidden': property.isHidden(),
                                'value': selectedShape.properties[key]
                            };

                            //这个if块是干啥，把value从字符串变成对象吗
                            if ((currentProperty.type === 'complex' || currentProperty.type === 'multiplecomplex') && currentProperty.value && currentProperty.value.length > 0) {
                                try {
                                    currentProperty.value = JSON.parse(currentProperty.value);
                                } catch (err) {
                                    // ignore
                                }
                            }

                            //以下判断放弃
                            if (propertyConfig.readModeTemplateUrl !== undefined && propertyConfig.readModeTemplateUrl !== null) {
                                currentProperty.readModeTemplateUrl = propertyConfig.readModeTemplateUrl + '?version=' + $rootScope.staticIncludeVersion;
                            }
                            if (propertyConfig.writeModeTemplateUrl !== null && propertyConfig.writeModeTemplateUrl !== null) {
                                currentProperty.writeModeTemplateUrl = propertyConfig.writeModeTemplateUrl + '?version=' + $rootScope.staticIncludeVersion;
                            }

                            if (propertyConfig.templateUrl !== undefined && propertyConfig.templateUrl !== null) {
                                currentProperty.templateUrl = propertyConfig.templateUrl + '?version=' + $rootScope.staticIncludeVersion;
                                currentProperty.hasReadWriteMode = false;
                            } else {
                                currentProperty.hasReadWriteMode = true;
                            }

                            if (currentProperty.value === undefined || currentProperty.value === null || currentProperty.value.length == 0) {
                                currentProperty.noValue = true;
                            }

                            //{对每一个properties进行遍历
                            //{如果 有配置的if条件分支
                            selectedItem.properties.push(currentProperty); //添加属性到selected
                        }
                    }

                    // Need to wrap this in an $apply block, see http://jimhoskins.com/2012/12/17/angularjs-and-apply.html
                    $scope.safeApply(function() {
                        /* 
                            如果把afterElementSelected放在 selectedShape更新后面，
                            就会出现顺序问题，

                            从 组件 跳到 canvas的时候,
                            如果先更新了，那么selectedShape就变成canvas对象,

                            如果 只是失焦，不跳转组件，那么slectedShape不变,先后都无所谓
                        */
                        $scope.selectedItem = selectedItem;

                        window.beforeShapeUpdate($scope,event) //调用updateProperty会使用到selectedShape
                        $scope.selectedShape = selectedShape; //更新 selectedShape 在使用之后
                        window.afterShapeUpdate($scope,event) 
                        
                        window.lastSelectedItem = selectedItem;
                        /* 
                            一共有
                            window.lastSelectedItem
                            window.lastSelectedShape

                            $scope.selectedShape
                            $scope.selectedItem

                            4个，不要弄混淆了
                        */
                    });

                } else {
                    $scope.safeApply(function() {
                        $scope.selectedItem = {};
                        $scope.selectedShape = null;
                        window.afterElementSelected($scope,event)
                        window.lastSelectedItem = selectedItem;
                    });
                }

            });


        
            /*
                这个决定了所有 div 的位置，the div which 用来在ORYX上加一层按钮
            */

            $scope.editor.registerOnEvent(ORYX.CONFIG.EVENT_SELECTION_CHANGED, function(event) {
                
                KISBPM.eventBus.dispatch(KISBPM.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS); //这个event是干嘛
                var shapes = event.elements;

                if (shapes && shapes.length == 1) {

                    var selectedShape = shapes.first();

                    var a = $scope.editor.getCanvas().node.getScreenCTM();

                    var absoluteXY = selectedShape.absoluteXY();

                    absoluteXY.x *= a.a;
                    absoluteXY.y *= a.d;

                    var additionalIEZoom = 1;
                    if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
                        var ua = navigator.userAgent;
                        if (ua.indexOf('MSIE') >= 0) {
                            //IE 10 and below
                            var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
                            if (zoom !== 100) {
                                additionalIEZoom = zoom / 100
                            }
                        }
                    }

                    if (additionalIEZoom === 1) {
                        absoluteXY.y = absoluteXY.y - jQuery("#canvasSection").offset().top + 5;
                        absoluteXY.x = absoluteXY.x - jQuery("#canvasSection").offset().left;

                    } else {
                        var canvasOffsetLeft = jQuery("#canvasSection").offset().left;
                        var canvasScrollLeft = jQuery("#canvasSection").scrollLeft();
                        var canvasScrollTop = jQuery("#canvasSection").scrollTop();

                        var offset = a.e - (canvasOffsetLeft * additionalIEZoom);
                        var additionaloffset = 0;
                        if (offset > 10) {
                            additionaloffset = (offset / additionalIEZoom) - offset;
                        }
                        absoluteXY.y = absoluteXY.y - (jQuery("#canvasSection").offset().top * additionalIEZoom) + 5 + ((canvasScrollTop * additionalIEZoom) - canvasScrollTop);
                        absoluteXY.x = absoluteXY.x - (canvasOffsetLeft * additionalIEZoom) + additionaloffset + ((canvasScrollLeft * additionalIEZoom) - canvasScrollLeft);
                    }
                    // ORYX.Core.Bounds这个是干嘛的?
                    var bounds = new ORYX.Core.Bounds(a.e + absoluteXY.x, a.f + absoluteXY.y, a.e + absoluteXY.x + a.a * selectedShape.bounds.width(), a.f + absoluteXY.y + a.d * selectedShape.bounds.height());
                    var shapeXY = bounds.upperLeft();

                    var stencilItem = $scope.getStencilItemById(selectedShape.getStencil().idWithoutNs());
                    var morphShapes = [];
                    if (stencilItem && stencilItem.morphRole) {
                        for (var i = 0; i < $scope.morphRoles.length; i++) {
                            if ($scope.morphRoles[i].role === stencilItem.morphRole) {
                                morphShapes = $scope.morphRoles[i].morphOptions;
                            }
                        }
                    }

                    var x = shapeXY.x;
                    if (bounds.width() < 48) {
                        x -= 24;
                    }

                    // if (morphShapes && morphShapes.length > 0) {
                    //     // In case the element is not wide enough, start the 2 bottom-buttons more to the left
                    //     // to prevent overflow in the right-menu
                    //     var morphButton = document.getElementById('morph-button');
                    //     morphButton.style.display = "block";
                    //     morphButton.style.left = x + 24 + 'px';
                    //     morphButton.style.top = (shapeXY.y + bounds.height() + 2) + 'px';
                    // }

                    var deleteButton = document.getElementById('delete-button');
                    deleteButton.style.display = "block";
                    deleteButton.style.left = x + 'px';
                    deleteButton.style.top = (shapeXY.y + bounds.height() + 2) + 'px';

                    if (stencilItem && (stencilItem.canConnect || stencilItem.canConnectAssociation)) {
                        var quickButtonCounter = 0;
                        var quickButtonX = shapeXY.x + bounds.width() + 5;
                        var quickButtonY = shapeXY.y;
                        jQuery('.Oryx_button').each(function(i, obj) {
                            if (obj.id !== 'morph-button' && obj.id != 'delete-button') {
                                quickButtonCounter++;
                                if (quickButtonCounter > 3) {
                                    quickButtonX = shapeXY.x + bounds.width() + 5;
                                    quickButtonY += 30;
                                    quickButtonCounter = 1;

                                } else if (quickButtonCounter > 1) {
                                    quickButtonX += 30;
                                }
                                obj.style.display = "block";
                                obj.style.left = quickButtonX + 'px';
                                obj.style.top = quickButtonY + 'px';
                            }
                        });
                    }
                }
            });

            if (!$rootScope.stencilInitialized) {
                KISBPM.eventBus.addListener(KISBPM.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS, function(event) {
                    jQuery('.Oryx_button').each(function(i, obj) {
                        obj.style.display = "none";
                    });
                });

                /*
                 * Listen to property updates and act upon them
                 */
                KISBPM.eventBus.addListener(KISBPM.eventBus.EVENT_TYPE_PROPERTY_VALUE_CHANGED, function(event) {
                    if (event.property && event.property.key) {
                        // If the name property is been updated, we also need to change the title of the currently selected item
                        if (event.property.key === 'oryx-name' && $scope.selectedItem !== undefined && $scope.selectedItem !== null) {
                            $scope.selectedItem.title = event.newValue;
                        }

                        // Update "no value" flag
                        event.property.noValue = (event.property.value === undefined || event.property.value === null || event.property.value.length == 0);
                    }
                });

                $rootScope.stencilInitialized = true;
            }

            $scope.morphShape = function() {
                $scope.safeApply(function() {

                    var shapes = $rootScope.editor.getSelection();
                    if (shapes && shapes.length == 1) {
                        $rootScope.currentSelectedShape = shapes.first();
                        var stencilItem = $scope.getStencilItemById($rootScope.currentSelectedShape.getStencil().idWithoutNs());
                        var morphShapes = [];
                        for (var i = 0; i < $scope.morphRoles.length; i++) {
                            if ($scope.morphRoles[i].role === stencilItem.morphRole) {
                                morphShapes = $scope.morphRoles[i].morphOptions.slice();
                            }
                        }

                        // Method to open shape select dialog (used later on)
                        var showSelectShapeDialog = function() {
                            $rootScope.morphShapes = morphShapes;
                            $modal({
                                backdrop: false,
                                keyboard: true,
                                template: 'editor-app/popups/select-shape.html?version=' + Date.now()
                            });
                        };

                        showSelectShapeDialog();
                    }
                });
            };
            
            $scope.deleteShape = function() {
                //我手动添加了一个属性jsonStencilTitle 用来判断node的type
                if ($scope.selectedItem.jsonStencilTitle == "Start event") {
                    alert('开始按钮不能删除');
                    return;
                }
                if ($scope.selectedItem.jsonStencilTitle == "End event") {
                    alert('结束按钮不能删除');
                    return;
                }
                KISBPM.TOOLBAR.ACTIONS.deleteItem({ '$scope': $scope });
            };

            $scope.quickAddItem = function(newItemId) {
                $scope.safeApply(function() {

                    var shapes = $rootScope.editor.getSelection();
                    if (shapes && shapes.length == 1) {
                        $rootScope.currentSelectedShape = shapes.first(); //first()是什么鬼，看来shapes数组里面 是一种特殊对象

                        /*  为了从stencilSets里面获得newItemId这种类型的"node" 
                            赋值给containedStencil
                        */
                        var containedStencil = undefined;
                        var stencilSets = $scope.editor.getStencilSets().values();
                        for (var i = 0; i < stencilSets.length; i++) {
                            var stencilSet = stencilSets[i];
                            var nodes = stencilSet.nodes();
                            for (var j = 0; j < nodes.length; j++) {
                                if (nodes[j].idWithoutNs() === newItemId) {
                                    containedStencil = nodes[j];
                                    break;
                                }
                            }
                        }

                        if (!containedStencil) return;

                        //现在从stencilSets拿到了一个node，在containedStencil里

                        var option = { type: $scope.currentSelectedShape.getStencil().namespace() + newItemId, namespace: $scope.currentSelectedShape.getStencil().namespace() };
                        option['connectedShape'] = $rootScope.currentSelectedShape;
                        option['parent'] = $rootScope.currentSelectedShape.parent;
                        option['containedStencil'] = containedStencil;

                        var args = { sourceShape: $rootScope.currentSelectedShape, targetStencil: containedStencil };
                        var targetStencil = $scope.editor.getRules().connectMorph(args);

                        if (!targetStencil) {
                            return;
                        } // Check if there can be a target shape
                        option['connectingType'] = targetStencil.id();

                        //拼了一个option，传入CreateCommand（来自ORYX）,最后一个参数editor
                        //返回command


                        /* 我的条件限制 用来限制审批节点的分支数量 */
                        if (!limitedCondition(option)) {
                            return false;
                        }


                        var command = new KISBPM.CreateCommand(option, undefined, undefined, $scope.editor);
                        //然后editor执行
                        $scope.editor.executeCommands([command]);
                        // window.activeSave()

                    }
                });
            };

        }); // end of $scope.editorFactory.promise block

        /* Click handler for clicking a property */
        /* 不是固有属性，而是都可以编辑的，只是在点击的时候才变成编辑 */
        $scope.propertyClicked = function(index) {
            if (!$scope.selectedItem.properties[index].hidden) {
                $scope.selectedItem.properties[index].mode = "write";
            }
        };

        /*
        // 看看有没有key-type或者直接type的配置信息
        var propertyConfig = KISBPM.PROPERTY_CONFIG[key + '-' + property.type()];
        Urls信息都是预先存在Kisbpm.Propery_config这个里面的
        然后根据这个item的type去取相应的url配置，然后存在porperties里面响应的属性
        */

        /* Helper method to retrieve the template url for a property */
        $scope.getPropertyTemplateUrl = function(index) {
            return $scope.selectedItem.properties[index].templateUrl;
        };
        $scope.getPropertyReadModeTemplateUrl = function(index) {
            return $scope.selectedItem.properties[index].readModeTemplateUrl;
        };
        $scope.getPropertyWriteModeTemplateUrl = function(index) {
            return $scope.selectedItem.properties[index].writeModeTemplateUrl;
        };

        /* Method available to all sub controllers (for property controllers) to update the internal Oryx model */
        $scope.updatePropertyInModel = function(property, shapeId) {

            var shape = $scope.selectedShape;
            // Some updates may happen when selected shape is already changed, so when an additional
            // shapeId is supplied, we need to make sure the correct shape is updated (current or previous)
            if (shapeId) {
                if (shape.id != shapeId && $scope.previousSelectedShape && $scope.previousSelectedShape.id == shapeId) {
                    shape = $scope.previousSelectedShape;
                } else {
                    shape = null;
                }
            }

            if (!shape) {
                // When no shape is selected, or no shape is found for the alternative
                // shape ID, do nothing
                return;
            }
            var key = property.key;
            var newValue = property.value;
            var oldValue = shape.properties[key];

            if (newValue != oldValue) {
                var commandClass = ORYX.Core.Command.extend({
                    construct: function() {
                        this.key = key;
                        this.oldValue = oldValue;
                        this.newValue = newValue;
                        this.shape = shape;
                        this.facade = $scope.editor;
                    },
                    execute: function() {
                        this.shape.setProperty(this.key, this.newValue);

                        this.facade.getCanvas().update();
                        this.facade.updateSelection();
                    },
                    rollback: function() {
                        this.shape.setProperty(this.key, this.oldValue);

                        this.facade.getCanvas().update();
                        this.facade.updateSelection();
                    }
                });
                // Instantiate the class
                var command = new commandClass();

                // Execute the command
                $scope.editor.executeCommands([command]);
                $scope.editor.handleEvents({
                    type: ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,
                    elements: [shape],
                    key: key
                });

                // Switch the property back to read mode, now the update is done
                property.mode = 'read';

                // Fire event to all who is interested
                // Fire event to all who want to know about this
                var event = {
                    type: KISBPM.eventBus.EVENT_TYPE_PROPERTY_VALUE_CHANGED,
                    property: property,
                    oldValue: oldValue,
                    newValue: newValue
                };
                KISBPM.eventBus.dispatch(event.type, event);
            } else {
                // Switch the property back to read mode, no update was needed
                property.mode = 'read';
            }
            // console.log(window.getJson())
            // debugger
        };
        //把scope上的function绑定到全局
        window.updatePropertyInModel = $scope.updatePropertyInModel

        window.setPropertyAdvance = function(property,shape) {

            var key = property.key;
            var newValue = property.value;
            var oldValue = shape.properties[key];


            if (newValue != oldValue) {
                var commandClass = ORYX.Core.Command.extend({
                    construct: function() {
                        this.key = key;
                        this.oldValue = oldValue;
                        this.newValue = newValue;
                        this.shape = shape;
                        this.facade = $scope.editor;
                    },
                    execute: function() {
                        this.shape.setProperty(this.key, this.newValue);

                        this.facade.getCanvas().update();
                        this.facade.updateSelection();
                    },
                    rollback: function() {
                        this.shape.setProperty(this.key, this.oldValue);

                        this.facade.getCanvas().update();
                        this.facade.updateSelection();
                    }
                });
                // Instantiate the class
                var command = new commandClass();

                // Execute the command
                $scope.editor.executeCommands([command]);


                $scope.editor.handleEvents({
                    type: ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,
                    elements: [shape],
                    key: key
                });

                // Switch the property back to read mode, now the update is done
                property.mode = 'read';

                // Fire event to all who is interested
                // Fire event to all who want to know about this
                var event = {
                    type: KISBPM.eventBus.EVENT_TYPE_PROPERTY_VALUE_CHANGED,
                    property: property,
                    oldValue: oldValue,
                    newValue: newValue
                };
                KISBPM.eventBus.dispatch(event.type, event);
            } else {
                // Switch the property back to read mode, no update was needed
                property.mode = 'read';
            }
            // console.log(window.getJson())
            // debugger
        };

        /**
         * Helper method that searches a group for an item with the given id.
         * If not found, will return undefined.
         */
        $scope.findStencilItemInGroup = function(stencilItemId, group) {

            var item;

            // Check all items directly in this group
            for (var j = 0; j < group.items.length; j++) {
                item = group.items[j];
                if (item.id === stencilItemId) {
                    return item;
                }
            }

            // Check the child groups
            if (group.groups && group.groups.length > 0) {
                for (var k = 0; k < group.groups.length; k++) {
                    item = $scope.findStencilItemInGroup(stencilItemId, group.groups[k]);
                    if (item) {
                        return item;
                    }
                }
            }

            return undefined;
        };

        /**
         * Helper method to find a stencil item.
         */
        $scope.getStencilItemById = function(stencilItemId) {
            for (var i = 0; i < $scope.stencilItemGroups.length; i++) {
                var element = $scope.stencilItemGroups[i];

                // Real group
                if (element.items !== null && element.items !== undefined) {
                    var item = $scope.findStencilItemInGroup(stencilItemId, element);
                    if (item) {
                        return item;
                    }
                } else { // Root stencil item
                    if (element.id === stencilItemId) {
                        return element;
                    }
                }
            }
            return undefined;
        };

        /*
         * DRAG AND DROP FUNCTIONALITY
         */

        $scope.dropCallback = function(event, ui) {

            $scope.editor.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                highlightId: "shapeRepo.attached"
            });
            $scope.editor.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                highlightId: "shapeRepo.added"
            });

            $scope.editor.handleEvents({
                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                highlightId: "shapeMenu"
            });

            KISBPM.eventBus.dispatch(KISBPM.eventBus.EVENT_TYPE_HIDE_SHAPE_BUTTONS);

            if ($scope.dragCanContain) {

                var item = $scope.getStencilItemById(ui.draggable[0].id); //item是 从ui获取，再用方法获得的，后面会用到，逻辑好散啊，写得简直恶心

                var pos = { x: event.pageX, y: event.pageY };

                var additionalIEZoom = 1;
                if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
                    var ua = navigator.userAgent;
                    if (ua.indexOf('MSIE') >= 0) {
                        //IE 10 and below
                        var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
                        if (zoom !== 100) {
                            additionalIEZoom = zoom / 100;
                        }
                    }
                }

                var screenCTM = $scope.editor.getCanvas().node.getScreenCTM();

                // Correcting the UpperLeft-Offset
                pos.x -= (screenCTM.e / additionalIEZoom);
                pos.y -= (screenCTM.f / additionalIEZoom);
                // Correcting the Zoom-Factor
                pos.x /= screenCTM.a;
                pos.y /= screenCTM.d;

                // Correcting the ScrollOffset
                pos.x -= document.documentElement.scrollLeft;
                pos.y -= document.documentElement.scrollTop;

                var parentAbs = $scope.dragCurrentParent.absoluteXY();
                pos.x -= parentAbs.x;
                pos.y -= parentAbs.y;

                var containedStencil = undefined; //这个containedStencil是干嘛用的
                var stencilSets = $scope.editor.getStencilSets().values();
                for (var i = 0; i < stencilSets.length; i++) {
                    var stencilSet = stencilSets[i];
                    var nodes = stencilSet.nodes();
                    for (var j = 0; j < nodes.length; j++) {
                        if (nodes[j].idWithoutNs() === ui.draggable[0].id) //去stencilSets找到当前移动的项
                        {
                            containedStencil = nodes[j]; //覆盖更新
                            break; //然后跳出本次循环
                        }
                    }
                    //如果没有找到当前项
                    if (!containedStencil) {
                        var edges = stencilSet.edges();
                        for (var j = 0; j < edges.length; j++) {
                            if (edges[j].idWithoutNs() === ui.draggable[0].id) {
                                containedStencil = edges[j]; //edge是什么，线吗?
                                break;
                            }
                        }
                    }
                }

                if (!containedStencil) return; //如果什么都不匹配就返回

                if ($scope.quickMenu) //这句话什么意思，quickMenu还可能不存在 ？ 如果拖动的是quickMenu
                {
                    var shapes = $scope.editor.getSelection();
                    if (shapes && shapes.length == 1) //如果只选择了一个
                    {
                        var currentSelectedShape = shapes.first();

                        var option = {};
                        option.type = currentSelectedShape.getStencil().namespace() + ui.draggable[0].id;
                        option.namespace = currentSelectedShape.getStencil().namespace();
                        option.connectedShape = currentSelectedShape;
                        option.parent = $scope.dragCurrentParent;
                        option.containedStencil = containedStencil;

                        // If the ctrl key is not pressed, 
                        // snapp the new shape to the center 
                        // if it is near to the center of the other shape
                        if (!event.ctrlKey) {
                            // Get the center of the shape
                            var cShape = currentSelectedShape.bounds.center();
                            // Snapp +-20 Pixel horizontal to the center 
                            if (20 > Math.abs(cShape.x - pos.x)) {
                                pos.x = cShape.x;
                            }
                            // Snapp +-20 Pixel vertical to the center 
                            if (20 > Math.abs(cShape.y - pos.y)) {
                                pos.y = cShape.y;
                            }
                        }

                        option.position = pos;



                        /* 我的条件限制 用来限制审批节点的分支数量 */
                        if (!limitedCondition(option)) {
                            return false;
                        }


                        if (containedStencil.idWithoutNs() !== 'SequenceFlow' && containedStencil.idWithoutNs() !== 'Association' &&
                            containedStencil.idWithoutNs() !== 'MessageFlow' && containedStencil.idWithoutNs() !== 'DataAssociation') {
                            var args = { sourceShape: currentSelectedShape, targetStencil: containedStencil };
                            var targetStencil = $scope.editor.getRules().connectMorph(args);
                            if (!targetStencil) {
                                return;
                            } // Check if there can be a target shape
                            option.connectingType = targetStencil.id();
                        }

                        var command = new KISBPM.CreateCommand(option, $scope.dropTargetElement, pos, $scope.editor);

                        $scope.editor.executeCommands([command]);
                    }
                } else {
                    
                    var canAttach = false;
                    if (containedStencil.idWithoutNs() === 'BoundaryErrorEvent' || containedStencil.idWithoutNs() === 'BoundaryTimerEvent' ||
                        containedStencil.idWithoutNs() === 'BoundarySignalEvent' || containedStencil.idWithoutNs() === 'BoundaryMessageEvent' ||
                        containedStencil.idWithoutNs() === 'BoundaryCancelEvent' || containedStencil.idWithoutNs() === 'BoundaryCompensationEvent') {
                        // Modify position, otherwise boundary event will get position related to left corner of the canvas instead of the container
                        pos = $scope.editor.eventCoordinates(event);

                        canAttach = true;
                    }

                    var option = {};

                    // option['type'] = $scope.modelData.model.stencilset.namespace + item.id;
                    // option['namespace'] = $scope.modelData.model.stencilset.namespace;
                    //减去了一个model就可以，这...

                    option['type'] = $scope.modelData.stencilset.namespace + item.id;
                    option['namespace'] = $scope.modelData.stencilset.namespace;
                    option['position'] = pos;
                    option['parent'] = $scope.dragCurrentParent;

                    
                    /* 我的条件限制 用来限制审批节点的分支数量 */
                    if (!limitedCondition(option)) {
                        return false;
                    }



                    var commandClass = ORYX.Core.Command.extend({
                        construct: function(option, dockedShape, canAttach, position, facade) {
                            this.option = option;
                            this.docker = null;
                            this.dockedShape = dockedShape;
                            this.dockedShapeParent = dockedShape.parent || facade.getCanvas();
                            this.position = position;
                            this.facade = facade;
                            this.selection = this.facade.getSelection();
                            this.shape = null;
                            this.parent = null;
                            this.canAttach = canAttach;
                        },
                        execute: function() {
                            if (!this.shape) {
                                this.shape = this.facade.createShape(option);
                                this.parent = this.shape.parent;
                            } else if (this.parent) {
                                this.parent.add(this.shape);
                            }

                            if (this.canAttach && this.shape.dockers && this.shape.dockers.length) {
                                this.docker = this.shape.dockers[0];

                                this.dockedShapeParent.add(this.docker.parent);

                                // Set the Docker to the new Shape
                                this.docker.setDockedShape(undefined);
                                this.docker.bounds.centerMoveTo(this.position);
                                if (this.dockedShape !== this.facade.getCanvas()) {
                                    this.docker.setDockedShape(this.dockedShape);
                                }
                                this.facade.setSelection([this.docker.parent]);
                            }

                            this.facade.getCanvas().update();
                            this.facade.updateSelection();

                        },
                        rollback: function() {
                            if (this.shape) {
                                this.facade.setSelection(this.selection.without(this.shape));
                                this.facade.deleteShape(this.shape);
                            }
                            if (this.canAttach && this.docker) {
                                this.docker.setDockedShape(undefined);
                            }
                            this.facade.getCanvas().update();
                            this.facade.updateSelection();

                        }
                    });

                    // Update canvas
                    var command = new commandClass(option, $scope.dragCurrentParent, canAttach, pos, $scope.editor);
                    $scope.editor.executeCommands([command]);
                    // window.activeSave()

                    // Fire event to all who want to know about this
                    var dropEvent = {
                        type: KISBPM.eventBus.EVENT_TYPE_ITEM_DROPPED,
                        droppedItem: item,
                        position: pos
                    };
                    KISBPM.eventBus.dispatch(dropEvent.type, dropEvent);
                }
            }

            $scope.dragCurrentParent = undefined;
            $scope.dragCurrentParentId = undefined;
            $scope.dragCurrentParentStencil = undefined;
            $scope.dragCanContain = undefined;
            $scope.quickMenu = undefined;
            $scope.dropTargetElement = undefined;
        };


        $scope.overCallback = function(event, ui) {
            $scope.dragModeOver = true;
        };

        $scope.outCallback = function(event, ui) {
            $scope.dragModeOver = false;
        };

        $scope.startDragCallback = function(event, ui) {
            $scope.dragModeOver = false;
            $scope.quickMenu = false;
            if (!ui.helper.hasClass('stencil-item-dragged')) {
                ui.helper.addClass('stencil-item-dragged');
            }

        };

        $scope.startDragCallbackQuickMenu = function(event, ui) {
            $scope.dragModeOver = false;
            $scope.quickMenu = true;
        };

        $scope.dragCallback = function(event, ui) {

            if ($scope.dragModeOver != false) {
                

                var coord = $scope.editor.eventCoordinatesXY(event.pageX, event.pageY);

                var additionalIEZoom = 1;
                if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
                    var ua = navigator.userAgent;
                    if (ua.indexOf('MSIE') >= 0) {
                        //IE 10 and below
                        var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
                        if (zoom !== 100) {
                            additionalIEZoom = zoom / 100
                        }
                    }
                }

                if (additionalIEZoom !== 1) {
                    coord.x = coord.x / additionalIEZoom;
                    coord.y = coord.y / additionalIEZoom;
                }

                var aShapes = $scope.editor.getCanvas().getAbstractShapesAtPosition(coord);

                if (aShapes.length <= 0) {
                    if (event.helper) {
                        $scope.dragCanContain = false;
                        return false;
                    }
                }

                if (aShapes[0] instanceof ORYX.Core.Canvas) {
                    $scope.editor.getCanvas().setHightlightStateBasedOnX(coord.x);
                }

                if (aShapes.length == 1 && aShapes[0] instanceof ORYX.Core.Canvas) {
                    var parentCandidate = aShapes[0];

                    $scope.dragCanContain = true;
                    $scope.dragCurrentParent = parentCandidate;
                    $scope.dragCurrentParentId = parentCandidate.id;

                    $scope.editor.handleEvents({
                        type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                        highlightId: "shapeRepo.attached"
                    });
                    $scope.editor.handleEvents({
                        type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                        highlightId: "shapeRepo.added"
                    });
                    return false;
                } else {
                    var item = $scope.getStencilItemById(event.target.id);


                    

                    var parentCandidate = aShapes.reverse().find(function(candidate) {
                        return (candidate instanceof ORYX.Core.Canvas || candidate instanceof ORYX.Core.Node || candidate instanceof ORYX.Core.Edge);
                    });

                    if (!parentCandidate) {
                        $scope.dragCanContain = false;
                        return false;
                    }
                    

                    if (item.type === "node") {

                        // check if the draggable is a boundary event and the parent an Activity
                        var _canContain = false;
                        var parentStencilId = parentCandidate.getStencil().id();

                        if ($scope.dragCurrentParentId && $scope.dragCurrentParentId === parentCandidate.id) {
                            return false;
                        }

                        var parentItem = $scope.getStencilItemById(parentCandidate.getStencil().idWithoutNs());
                        if (parentItem.roles.indexOf("Activity") > -1) {
                            if (item.roles.indexOf("IntermediateEventOnActivityBoundary") > -1) {
                                _canContain = true;
                            }
                        } else if (parentCandidate.getStencil().idWithoutNs() === 'Pool') {
                            if (item.id === 'Lane') {
                                _canContain = true;
                            }
                        }

                        if (_canContain) {
                            $scope.editor.handleEvents({
                                type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                                highlightId: "shapeRepo.attached",
                                elements: [parentCandidate],
                                style: ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
                                color: ORYX.CONFIG.SELECTION_VALID_COLOR
                            });

                            $scope.editor.handleEvents({
                                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                                highlightId: "shapeRepo.added"
                            });
                        } else {
                            for (var i = 0; i < $scope.containmentRules.length; i++) {
                                var rule = $scope.containmentRules[i];
                                if (rule.role === parentItem.id) {
                                    for (var j = 0; j < rule.contains.length; j++) {
                                        if (item.roles.indexOf(rule.contains[j]) > -1) {
                                            _canContain = true;
                                            break;
                                        }
                                    }

                                    if (_canContain) {
                                        break;
                                    }
                                }
                            }

                            // Show Highlight
                            $scope.editor.handleEvents({
                                type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                                highlightId: 'shapeRepo.added',
                                elements: [parentCandidate],
                                color: _canContain ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR
                            });

                            $scope.editor.handleEvents({
                                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                                highlightId: "shapeRepo.attached"
                            });
                        }

                        $scope.dragCurrentParent = parentCandidate;
                        $scope.dragCurrentParentId = parentCandidate.id;
                        $scope.dragCurrentParentStencil = parentStencilId;
                        $scope.dragCanContain = _canContain;

                    } else {
                        var canvasCandidate = $scope.editor.getCanvas();
                        var canConnect = false;

                        var targetStencil = $scope.getStencilItemById(parentCandidate.getStencil().idWithoutNs());
                        if (targetStencil) {
                            var associationConnect = false;

                            try {
                                if (stencil) {
                                    if (stencil.idWithoutNs() === 'Association' && (curCan.getStencil().idWithoutNs() === 'TextAnnotation' || curCan.getStencil().idWithoutNs() === 'BoundaryCompensationEvent')) {
                                        associationConnect = true;
                                    } else if (stencil.idWithoutNs() === 'DataAssociation' && curCan.getStencil().idWithoutNs() === 'DataStore') {
                                        associationConnect = true;
                                    }
                                }
                            } catch (err) {
                                //在此处理错误
                            }


                            if (targetStencil.canConnectTo || associationConnect) {
                                canConnect = true;
                            }
                        }

                        //Edge
                        $scope.dragCurrentParent = canvasCandidate;
                        $scope.dragCurrentParentId = canvasCandidate.id;
                        $scope.dragCurrentParentStencil = canvasCandidate.getStencil().id();
                        $scope.dragCanContain = canConnect;

                        // Show Highlight
                        $scope.editor.handleEvents({
                            type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                            highlightId: 'shapeRepo.added',
                            elements: [canvasCandidate],
                            color: ORYX.CONFIG.SELECTION_VALID_COLOR
                        });

                        $scope.editor.handleEvents({
                            type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                            highlightId: "shapeRepo.attached"
                        });
                    }
                }
            }
        };

        $scope.dragCallbackQuickMenu = function(event, ui) {

            if ($scope.dragModeOver != false) {
                var coord = $scope.editor.eventCoordinatesXY(event.pageX, event.pageY);

                var additionalIEZoom = 1;
                if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
                    var ua = navigator.userAgent;
                    if (ua.indexOf('MSIE') >= 0) {
                        //IE 10 and below
                        var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100);
                        if (zoom !== 100) {
                            additionalIEZoom = zoom / 100
                        }
                    }
                }

                if (additionalIEZoom !== 1) {
                    coord.x = coord.x / additionalIEZoom;
                    coord.y = coord.y / additionalIEZoom;
                }

                var aShapes = $scope.editor.getCanvas().getAbstractShapesAtPosition(coord);

                if (aShapes.length <= 0) {
                    if (event.helper) {
                        $scope.dragCanContain = false;
                        return false;
                    }
                }

                if (aShapes[0] instanceof ORYX.Core.Canvas) {
                    $scope.editor.getCanvas().setHightlightStateBasedOnX(coord.x);
                }

                var stencil = undefined;
                var stencilSets = $scope.editor.getStencilSets().values();
                for (var i = 0; i < stencilSets.length; i++) {
                    var stencilSet = stencilSets[i];
                    var nodes = stencilSet.nodes();
                    for (var j = 0; j < nodes.length; j++) {
                        if (nodes[j].idWithoutNs() === event.target.id) {
                            stencil = nodes[j];
                            break;
                        }
                    }

                    if (!stencil) {
                        var edges = stencilSet.edges();
                        for (var j = 0; j < edges.length; j++) {
                            if (edges[j].idWithoutNs() === event.target.id) {
                                stencil = edges[j];
                                break;
                            }
                        }
                    }
                }

                var candidate = aShapes.last();

                var isValid = false;
                if (stencil.type() === "node") {
                    //check containment rules
                    var canContain = $scope.editor.getRules().canContain({ containingShape: candidate, containedStencil: stencil });

                    var parentCandidate = aShapes.reverse().find(function(candidate) {
                        return (candidate instanceof ORYX.Core.Canvas || candidate instanceof ORYX.Core.Node || candidate instanceof ORYX.Core.Edge);
                    });

                    if (!parentCandidate) {
                        $scope.dragCanContain = false;
                        return false;
                    }

                    $scope.dragCurrentParent = parentCandidate;
                    $scope.dragCurrentParentId = parentCandidate.id;
                    $scope.dragCurrentParentStencil = parentCandidate.getStencil().id();
                    $scope.dragCanContain = canContain;
                    $scope.dropTargetElement = parentCandidate;
                    isValid = canContain;

                } else { //Edge

                    var shapes = $scope.editor.getSelection();
                    if (shapes && shapes.length == 1) {
                        var currentSelectedShape = shapes.first();
                        var curCan = candidate;
                        var canConnect = false;

                        var targetStencil = $scope.getStencilItemById(curCan.getStencil().idWithoutNs());
                        if (targetStencil) {
                            var associationConnect = false;
                            if (stencil.idWithoutNs() === 'Association' && (curCan.getStencil().idWithoutNs() === 'TextAnnotation' || curCan.getStencil().idWithoutNs() === 'BoundaryCompensationEvent')) {
                                associationConnect = true;
                            } else if (stencil.idWithoutNs() === 'DataAssociation' && curCan.getStencil().idWithoutNs() === 'DataStore') {
                                associationConnect = true;
                            }

                            if (targetStencil.canConnectTo || associationConnect) {
                                while (!canConnect && curCan && !(curCan instanceof ORYX.Core.Canvas)) {
                                    candidate = curCan;
                                    //check connection rules
                                    canConnect = $scope.editor.getRules().canConnect({
                                        sourceShape: currentSelectedShape,
                                        edgeStencil: stencil,
                                        targetShape: curCan
                                    });
                                    curCan = curCan.parent;
                                }
                            }
                        }
                        var parentCandidate = $scope.editor.getCanvas();

                        isValid = canConnect;
                        $scope.dragCurrentParent = parentCandidate;
                        $scope.dragCurrentParentId = parentCandidate.id;
                        $scope.dragCurrentParentStencil = parentCandidate.getStencil().id();
                        $scope.dragCanContain = canConnect;
                        $scope.dropTargetElement = candidate;
                    }

                }

                $scope.editor.handleEvents({
                    type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                    highlightId: 'shapeMenu',
                    elements: [candidate],
                    color: isValid ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR
                });
                // window.activeSave()
            }
        };
    }]);

var KISBPM = KISBPM || {};
//create command for undo/redo
KISBPM.CreateCommand = ORYX.Core.Command.extend({
    construct: function(option, currentReference, position, facade) {
        this.option = option;
        this.currentReference = currentReference;
        this.position = position;
        this.facade = facade;
        this.shape;
        this.edge;
        this.targetRefPos;
        this.sourceRefPos;
        /*
         * clone options parameters
         */
        this.connectedShape = option.connectedShape;
        this.connectingType = option.connectingType;
        this.namespace = option.namespace;
        this.type = option.type;
        this.containedStencil = option.containedStencil;
        this.parent = option.parent;
        this.currentReference = currentReference;
        this.shapeOptions = option.shapeOptions;
    },
    execute: function() {

        if (this.shape) {
            if (this.shape instanceof ORYX.Core.Node) {
                this.parent.add(this.shape);
                if (this.edge) {
                    this.facade.getCanvas().add(this.edge);
                    this.edge.dockers.first().setDockedShape(this.connectedShape);
                    this.edge.dockers.first().setReferencePoint(this.sourceRefPos);
                    this.edge.dockers.last().setDockedShape(this.shape);
                    this.edge.dockers.last().setReferencePoint(this.targetRefPos);
                }

                this.facade.setSelection([this.shape]);

            } else if (this.shape instanceof ORYX.Core.Edge) {
                this.facade.getCanvas().add(this.shape);
                this.shape.dockers.first().setDockedShape(this.connectedShape);
                this.shape.dockers.first().setReferencePoint(this.sourceRefPos);
            }
        } else {
            this.shape = this.facade.createShape(this.option);
            this.edge = (!(this.shape instanceof ORYX.Core.Edge)) ? this.shape.getIncomingShapes().first() : undefined;
        }

        if (this.currentReference && this.position) {

            if (this.shape instanceof ORYX.Core.Edge) {

                if (!(this.currentReference instanceof ORYX.Core.Canvas)) {
                    this.shape.dockers.last().setDockedShape(this.currentReference);

                    if (this.currentReference.getStencil().idWithoutNs() === 'TextAnnotation') {
                        var midpoint = {};
                        midpoint.x = 0;
                        midpoint.y = this.currentReference.bounds.height() / 2;
                        this.shape.dockers.last().setReferencePoint(midpoint);
                    } else {
                        this.shape.dockers.last().setReferencePoint(this.currentReference.bounds.midPoint());
                    }
                } else {
                    this.shape.dockers.last().bounds.centerMoveTo(this.position);
                }
                this.sourceRefPos = this.shape.dockers.first().referencePoint;
                this.targetRefPos = this.shape.dockers.last().referencePoint;

            } else if (this.edge) {
                this.sourceRefPos = this.edge.dockers.first().referencePoint;
                this.targetRefPos = this.edge.dockers.last().referencePoint;
            }
        } else {
            var containedStencil = this.containedStencil;
            var connectedShape = this.connectedShape;
            var bc = connectedShape.bounds;
            var bs = this.shape.bounds;

            var pos = bc.center();
            if (containedStencil.defaultAlign() === "north") {
                pos.y -= (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.height() / 2);
            } else if (containedStencil.defaultAlign() === "northeast") {
                pos.x += (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2);
                pos.y -= (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2);
            } else if (containedStencil.defaultAlign() === "southeast") {
                pos.x += (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2);
                pos.y += (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2);
            } else if (containedStencil.defaultAlign() === "south") {
                pos.y += (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.height() / 2);
            } else if (containedStencil.defaultAlign() === "southwest") {
                pos.x -= (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2);
                pos.y += (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2);
            } else if (containedStencil.defaultAlign() === "west") {
                pos.x -= (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.width() / 2);
            } else if (containedStencil.defaultAlign() === "northwest") {
                pos.x -= (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.width() / 2);
                pos.y -= (bc.height() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER + (bs.height() / 2);
            } else {
                pos.x += (bc.width() / 2) + ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET + (bs.width() / 2);
            }

            // Move shape to the new position
            this.shape.bounds.centerMoveTo(pos);

            // Move all dockers of a node to the position
            if (this.shape instanceof ORYX.Core.Node) {
                (this.shape.dockers || []).each(function(docker) {
                    docker.bounds.centerMoveTo(pos);
                });
            }

            //this.shape.update();
            this.position = pos;

            if (this.edge) {
                this.sourceRefPos = this.edge.dockers.first().referencePoint;
                this.targetRefPos = this.edge.dockers.last().referencePoint;
            }
        }

        this.facade.getCanvas().update();
        this.facade.updateSelection();

    },
    rollback: function() {
        this.facade.deleteShape(this.shape);
        if (this.edge) {
            this.facade.deleteShape(this.edge);
        }
        //this.currentParent.update();
        this.facade.setSelection(this.facade.getSelection().without(this.shape, this.edge));
    }

});

