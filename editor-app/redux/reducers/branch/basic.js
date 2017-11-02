export const defaultOption = () => {
    return { text: '请选择', value: 'initial', index: 'initial' }
}
export const newRule = () => {
    /* 创建的时候就指定了默认值 */
    return {
        entry1: { text: 'pleaseChoose', value: 'initial', index: 'initial' },
        entry2: { text: '请选择', value: 'initial', index: 'initial' },
        entry3: { text: '请选择', value: 'initial', index: 'initial' },
        input: { text: '', value: '' }
    }
}
export const newCreate = (state) => {
    return {
        id: state.id,
        conditions: [{
            data: [
                newRule()
            ],
            ruleMode: 'normal'
        }]
    }
}

export const template = {
    entry1: {
        options: [{
                value: 'initial',
                text: 'pleaseChoose'
            }, {
                value: 'form.properties',
                text: 'form.properties'
            }, {
                value: 'user.properties',
                text: 'user.properties'
            },
            // {
            //     value: 'e.properties',
            //     text: 'e.properties'
            // }
        ],
        click() {},
        defaultText: 'pleaseChoose'
    },
    entry2: {
        options: [
            { text: '请选择', value: 'initial' }
            // {
            //     value:'',
            //     text:'请假天数'
            // },
        ],
        click() {},
        defaultText: '请选择'
    },
    entry3: {
        options: [{
                value: 'initial',
                text: '请选择'
            }, {
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
            },

        ],
        click() {},
        defaultText: '请选择'
    }
}

// const environmentVariable =[{value:'date',text:'date'}]
