'use strict'
window.globalEvent =  window.globalEvent || {}
window.globalEvent.router =  window.globalEvent.router || {}

/* 判断是否重名 直接循环所有的 */
const isRepeated = (name) => {
    const json = window.getRawJson()        
    return json.childShapes.some((el,index)=>{
        return el.properties.name==name
    })            
}
window.isRepeated = isRepeated

/* 自动命名 */
const giveName = (cate) => {
    const mapArr={
        "Start event":"StartNoneEvent",
        "End event":"EndNoneEvent",
        "Sequence flow":"SequenceFlow",
        "User task":"UserTask",
        "Exclusive gateway":"ExclusiveGateway",
        "End error event":"EndErrorEvent",
        "Multi user task":"MultiUserTask"
    }
    const mapArrCN={
        "Start event":"开始",
        "End event":"结束",
        "Sequence flow":"连线",
        "User task":"审批",
        "Exclusive gateway":"分支",
        "End error event":"异常结束",
        "Multi user task":"会签"
    }
    const json = window.getRawJson()        
    /* 计算此类有多少个 */
    let num = 1
    let name = mapArrCN[cate] + num
    while(isRepeated(name)){
        num = num + 1 
        name = mapArrCN[cate] + num
    }
    return name
}

/* 
    mini router 
*/
window.globalEvent.router = function($scope,event){
    var selectedShape = event.elements.first()
    if (!selectedShape) {
        $scope.propertyTpl = './editor-app/property-tpl/canvas.html';
        window.isThisCanvas = true        
        return;/*罪魁祸首 。。。如果选中的是canvas我就把后面的事件全部屏蔽掉了 */
    }
    window.isThisCanvas = false     
    
    /* 命名 */
    if(selectedShape.properties["oryx-name"]==''){
        if(selectedShape._stencil._jsonStencil.title != "Sequence flow"){
            $scope.updatePropertyInModel({ key: 'oryx-name', value: giveName(selectedShape._stencil._jsonStencil.title)})
            window.activeSave()            
        }
    }
    if (selectedShape.incoming[0] && selectedShape.incoming[0]._stencil._jsonStencil.title == 'Exclusive gateway') {
        /* 如果defaultflow为 true则显示普通节点 */
        if(selectedShape.properties['defaultflow'] == 'true'){
            $scope.propertyTpl = './editor-app/property-tpl/sequenceFlow.html';
            // window.setPropertyAdvance({key:'oryx-name',value:''},selectedShape)
        }else{
            $scope.propertyTpl = './editor-app/property-tpl/branchSequenceFlow.html';
        }
    } else {
        switch (selectedShape._stencil._jsonStencil.title) {
            case 'User task':
                $scope.propertyTpl = './editor-app/property-tpl/approve.html';
                break;
            case 'Multi user task':
                $scope.propertyTpl = './editor-app/property-tpl/parallelApprove.html';
                break;
            case 'Sequence flow':
                $scope.propertyTpl = './editor-app/property-tpl/sequenceFlow.html';
                break;
            case 'End error event':
                $scope.propertyTpl = './editor-app/property-tpl/errorNotify.html';
                break;
            case 'End event':
                $scope.propertyTpl = './editor-app/property-tpl/notify.html';
                break;
            case 'Start event':
                $scope.propertyTpl = './editor-app/property-tpl/start.html';
                break;
            case 'Exclusive gateway':
                $scope.propertyTpl = './editor-app/property-tpl/exclusive.html';
                break;
            default:
                $scope.propertyTpl = './editor-app/property-tpl/canvas.html';
                break;
        }
    }
}
