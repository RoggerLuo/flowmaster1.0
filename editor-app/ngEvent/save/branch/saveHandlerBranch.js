'use strict'
import { validationCheck, inputFormatter, collectValuesFromDpdw, ifEmpty, ifEmptyWithoutInit } from './basic.js'
export default function(canvas) {
    let canBeSaved = true
    window.reduxStore.getState().branch.dataRepo.forEach((el, index) => {
        let currentElement = canvas.getChildShapeByResourceId(el.id)
        if (el.id && !currentElement) return
        let returnString = '' /* 拼返回字符串 */
        if (el.radio) {
            returnString = '${' + el.text + '}'
            window.setPropertyAdvance({ key: 'oryx-name', value: el.text }, currentElement)
        } else {
            if (ifEmpty(el, currentElement)) canBeSaved = false
            returnString = '${'
            el.conditions.forEach((condition, i) => {
                condition.data.forEach((el, index, wholeArr) => {
                    /* 下拉框的值 */
                    returnString = collectValuesFromDpdw({ returnString, el })
                    /* input框的值 */
                    el = validationCheck(el) /* 根据entry2的type来确定 input的值是否合规 */
                    returnString += inputFormatter(el)
                    // returnString += el.input.value
                    /* 是否继续循环 */
                    if (index < (condition.data.length - 1)) {
                        returnString += ' && '
                    }
                })
                /* 是否继续循环 */
                if (i < (el.conditions.length - 1)) {
                    returnString += ' || '
                }
            })
            returnString += '}'
        }
        const reduxdataConditions = el.conditions.map((originEl) => {
            originEl.ruleMode = 'normal'
            return originEl
        })
        el.conditions = reduxdataConditions
        currentElement.setProperty('conditionsequenceflow', returnString)
        currentElement.setProperty('reduxdata', el)
    })
    canBeSaved = ifEmptyWithoutInit(canBeSaved)
    return canBeSaved
}
