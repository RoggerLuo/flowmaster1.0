'use strict';
import { saveHandlerBranch, updateBranchText } from './branch'
window.globalEvent = window.globalEvent || {}
window.updateBranchText = updateBranchText

const saveHandlerBranchNode = (canvas) => {
    canvas.children.forEach((el) => {
        if (el._stencil._jsonStencil.title == 'Sequence flow') {
            el.setProperty('defaultflow', "false")
        }
    })
    window.reduxStore.getState().branchNode.repo.forEach((el) => {
        let currentElement = canvas.getChildShapeByResourceId(el.choosed.value)
        if (el.resourceId && !currentElement) {
            return;
        }
        currentElement.setProperty('defaultflow', "true")
        currentElement.setProperty('conditionsequenceflow', '')
        currentElement.setProperty('reduxdata', '')
    })
}


const saveHandlerParallel = (canvas) => {
    window.reduxStore.getState().parallel.repo.forEach((el) => {
        let currentElement = canvas.getChildShapeByResourceId(el.id)
        if (el.id && !currentElement) {
            return;
        }

        let jsonArray = []
        el.data.forEach((group) => {
            let innerArray = []
            group.forEach((el, index) => {
                switch (el.cate) {
                    case "boss":
                        innerArray.push({ "value": "boss" + "(" + el.value + ")", cate: el.cate, text: el.text, id: el.value })
                        break
                    case "role":
                        innerArray.push({ "value": "role" + "(" + el.value2 + ":" + el.value + ")", cate: el.cate, text: el.text, id: el.value, value2: el.value2 })
                        break
                    case "EMPLOYEE":
                        innerArray.push({ "value": "user" + "(" + el.value + ")", cate: el.cate, text: el.text, id: el.value })
                        break
                    case "ORG":
                    case "DEPT":
                        innerArray.push({ "value": "org" + "(" + el.value + ")", cate: el.cate, text: el.text, id: el.value })
                        break
                }
            })
            jsonArray.push(innerArray)
        })
        currentElement.setProperty('multiinstance_parties', jsonArray)
        currentElement.setProperty('multiinstance_type', "parallel")
        currentElement.setProperty('multiinstance_variable', "per")
        currentElement.setProperty('usertaskassignment', { "assignment": { "candidateOwners": [{ "value": "${per}" }] } })
    })
}

const saveHandlerApprove = (canvas) => {
    window.reduxStore.getState().approve.approveListRepo.forEach((el) => {
        let currentElement = canvas.getChildShapeByResourceId(el.id)
        if (el.id && !currentElement) {
            return;
        }

        let jsonArray = []
        el.data.forEach((el, index) => {
            switch (el.cate) {
                case "boss":
                    jsonArray.push({ "value": "boss" + "(" + el.value + ")", cate: el.cate, text: el.text, id: el.value })
                    break
                case "role":
                    jsonArray.push({ "value": "role" + "(" + el.value2 + ":" + el.value + ")", cate: el.cate, text: el.text, id: el.value, value2: el.value2 })
                    break
                case "EMPLOYEE":
                    jsonArray.push({ "value": "user" + "(" + el.value + ")", cate: el.cate, text: el.text, id: el.value })
                    break
                case "ORG":
                case "DEPT":
                    jsonArray.push({ "value": "org" + "(" + el.value + ")", cate: el.cate, text: el.text, id: el.value })
                    break
            }
        })

        let value = {
            "assignment": {
                "candidateOwners": jsonArray
            }
        }
        currentElement.setProperty('usertaskassignment', value)
    })
}

const saveHandlerEndPoint = (canvas) => {
    window.reduxStore.getState().endpoint.approveListRepo.forEach((el) => {
        let currentElement = canvas.getChildShapeByResourceId(el.id)
        if (el.id && !currentElement) {
            return;
        }

        let jsonArray = []
        el.data.forEach((el, index) => {
            switch (el.cate) {
                case "boss":
                    jsonArray.push({ "value": "boss" + "(" + el.value + ")", cate: el.cate, text: el.text, id: el.value })
                    break
                case "role":
                    jsonArray.push({ "value": "role" + "(" + el.value2 + ":" + el.value + ")", cate: el.cate, text: el.text, id: el.value, value2: el.value2 })
                    break
                case "EMPLOYEE":
                    jsonArray.push({ "value": "user" + "(" + el.value + ")", cate: el.cate, text: el.text, id: el.value })
                    break
                case "ORG":
                case "DEPT":
                    jsonArray.push({ "value": "org" + "(" + el.value + ")", cate: el.cate, text: el.text, id: el.value })
                    break
            }
        })
        currentElement.setProperty('deliverToUsers', jsonArray)
    })
}

window.globalEvent.save = function($scope, $http) {
    return function(callback) {
        window.reduxStore.dispatch({ type: 'saveDeactive' })

        /* 提前把redux转换成oryx数据 */
        const canvas = $scope.editor.getCanvas()
        saveHandlerApprove(canvas)
        saveHandlerParallel(canvas)
        saveHandlerEndPoint(canvas)
        if (!saveHandlerBranch(canvas)) {
            activeSave()
            return
        }
        saveHandlerBranchNode(canvas)

        /* 为空的限制条件 */
        if (window.globalEvent.checkEmpty($scope)) {
            window.reduxStore.dispatch({ type: 'saveActive' })
            return;
        }

        /* 等待动画 */
        window.reduxStore.dispatch({ type: 'callSpin' })

        var json = $scope.editor.getJSON();
        json.properties.process_id = window.getQueryString("pid")
        json = JSON.stringify(json);

        var selection = $scope.editor.getSelection();
        $scope.editor.setSelection([]);

        // Get the serialized svg image source
        var svgClone = $scope.editor.getCanvas().getSVGRepresentation(true);
        $scope.editor.setSelection(selection);
        if ($scope.editor.getCanvas().properties["oryx-showstripableelements"] === false) {
            var stripOutArray = jQuery(svgClone).find(".stripable-element");
            for (var i = stripOutArray.length - 1; i >= 0; i--) {
                stripOutArray[i].remove();
            }
        }

        // Remove all forced stripable elements
        var stripOutArray = jQuery(svgClone).find(".stripable-element-force");
        for (var i = stripOutArray.length - 1; i >= 0; i--) {
            stripOutArray[i].remove();
        }

        // Parse dom to string
        var svgDOM = DataManager.serialize(svgClone);

        var params = {
            json_xml: json,
            svg_xml: svgDOM,
            name: window.pidName
                // descriptionPrivate: 'flowMaster'
        };
        const transformRequest = function(obj) {
            var str = [];
            for (var p in obj) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
            return str.join("&");
        }
        var saveEvent = {
            type: KISBPM.eventBus.EVENT_TYPE_MODEL_SAVED,
            model: params,
            modelId: window.getQueryString("pid"),
            eventType: 'update-model'
        };

        $http({
            method: 'PUT',
            data: params,
            ignoreErrors: true,
            headers: ACTIVITI.CONFIG.httpSaveHeaders,
            transformRequest: function(obj) {
                var str = [];
                for (var p in obj) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
                return str.join("&");
            },
            url: window.globalHost + '/repository/process-definitions/' + window.getQueryString("pid") + '/design?processType=Normal'
        })

        .success(function(data, status, headers, config) {

                window.reduxStore.dispatch({ type: 'closeSpin' })
                window.showAlert('保存成功', 'good')

                // Fire event to all who is listening
                $scope.editor.handleEvents({
                    type: ORYX.CONFIG.EVENT_SAVED
                });

                KISBPM.eventBus.dispatch(KISBPM.eventBus.EVENT_TYPE_MODEL_SAVED, saveEvent);
                callback()

                console.log(json)
                window.reduxStore.dispatch({ type: 'saveDeactive' })
                window.localDesignData.clear(window.getQueryString("pid"))
            })
            .error(function(data, status, headers, config) {
                $scope.error = {};
                console.log('Something went wrong when updating the process model:' + JSON.stringify(data));
                window.reduxStore.dispatch({ type: 'saveActive' })
            });
    };

}
