'use strict'
export default () => {
    let canvas = window.windowCanvas
    window.reduxStore.getState().branch.dataRepo.forEach((el, index) => {
        let currentElement = canvas.getChildShapeByResourceId(el.id)
        if (el.id && !currentElement) return
        let displayText = ''
        if (el.radio) {
            window.setPropertyAdvance({ key: 'oryx-name', value: el.text }, currentElement)
        } else {
            el.conditions.forEach((condition, i) => {
                /* 循环不同的条件组 */
                condition.data.forEach((el, index) => {
                    /* 循环条件组里的规则 */
                    if (el.entry2.value != 'initial') {
                        displayText += el.entry2.text || ''
                        displayText += ' '
                    }
                    if (el.entry3.value != 'initial') {
                        displayText += el.entry3.text || ''
                        displayText += ' '
                    }
                    if (!isNaN(el.input.text)) {
                        displayText += el.input.text
                    } else {
                        displayText += '"' + el.input.text + '"'
                    }
                    if (index < (condition.data.length - 1)) {
                        displayText += ' && '
                    }
                })
                if (i < (el.conditions.length - 1)) {
                    displayText += ' || '
                }
            })
        }
        if (currentElement.properties.defaultflow != 'true') {
            window.setPropertyAdvance({ key: 'oryx-name', value: displayText }, currentElement)
        }
    })
}
