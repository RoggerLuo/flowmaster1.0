const rawData = {
    text:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }],
    textarea: [{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }],
    number:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }, {
            value: '>',
            text: '大于'
        }, {
            value: '<',
            text: '小于'
        }, {
            value: '>=',
            text: '大于等于'
        }, {
            value: '<=',
            text: '小于等于'
        }],
    money:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }, {
            value: '>',
            text: '大于'
        }, {
            value: '<',
            text: '小于'
        }, {
            value: '>=',
            text: '大于等于'
        }, {
            value: '<=',
            text: '小于等于'
        }],
    date:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }, {
            value: '>',
            text: '大于'
        }, {
            value: '<',
            text: '小于'
        }, {
            value: '>=',
            text: '大于等于'
        }, {
            value: '<=',
            text: '小于等于'
        }],
    time:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }, {
            value: '>',
            text: '大于'
        }, {
            value: '<',
            text: '小于'
        }, {
            value: '>=',
            text: '大于等于'
        }, {
            value: '<=',
            text: '小于等于'
        }],
    selection:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }],
    multi_selection:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }],
    select_employee:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }],

    select_org:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }],
    
    mobile:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }],
    email:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }],
    phone:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }],
    calculate:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }, {
            value: '>',
            text: '大于'
        }, {
            value: '<',
            text: '小于'
        }, {
            value: '>=',
            text: '大于等于'
        }, {
            value: '<=',
            text: '小于等于'
        }],
    dateDiff: [{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }],
    timeDiff:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }
        // , {
        //     value: '>',
        //     text: '大于'
        // }, {
        //     value: '<',
        //     text: '小于'
        // }, {
        //     value: '>=',
        //     text: '大于等于'
        // }, {
        //     value: '<=',
        //     text: '小于等于'
        // }
        ],
    sum:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }, {
            value: '>',
            text: '大于'
        }, {
            value: '<',
            text: '小于'
        }, {
            value: '>=',
            text: '大于等于'
        }, {
            value: '<=',
            text: '小于等于'
        }],
    mean:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }, {
            value: '>',
            text: '大于'
        }, {
            value: '<',
            text: '小于'
        }, {
            value: '>=',
            text: '大于等于'
        }, {
            value: '<=',
            text: '小于等于'
        }],
    formula:[{
            value: '==',
            text: '等于'
        }, {
            value: '!=',
            text: '不等于'
        }]
}
const arr = []
let k
for(k in rawData){
    rawData[k].unshift({value: 'initial',text: '请选择'})
}
export default rawData