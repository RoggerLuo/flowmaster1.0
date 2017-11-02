import { toJS, fromJS, List, Map } from 'immutable';
import { defaultOption, newRule, newCreate } from './branch/basic'

let initial = {
    environmentVariable: [{ value: 'date', text: 'date' }],
    formProperties: [],
    userProperties: [],
    id: '',
    radio: 'dropdown',
    conditionMode: 'normal',
    dataRepo: [
        /*
        {
            id:'test',
            radio:false,
            text:'',
            conditions:[
                {
                    data:[
                       {entry1:{},entry2:{},entry3:{},input:''},
                    ],
                    ruleMode:'normal'
                },
            ]
        }
        */
    ]
}
const Reducer = (state = initial, action) => {
    let data = fromJS(state)
    switch (action.type) {
        /* 任何下拉框 被选择的时候 */
        case 'branchUpdate':
            //获取在dataRepo里的位置
            let repoIndex4branchUpdate = data.get('dataRepo').findKey((el, index, iter) => el.get('id') == state.id)
                //位置信息(ind)汇总
            const dataRepoInd = repoIndex4branchUpdate
            const groupIndex = action.groupIndex
            const ruleInd = action.ruleIndex
            const lastCascaderInd = action.optionItem.index
                //获取当前‘规则’所在的数据路径
            const ruleDataPath = ['dataRepo', dataRepoInd, 'conditions', groupIndex, 'data', ruleInd]
                /* 定义核心 mutate 逻辑 */
            const updateOption = el => el.set(action.entryIndex, action.optionItem) //改变当前dropdown的选中项
            //二级联动
            const cascade2 = el => el.set('entry2template', String(lastCascaderInd)) //改变entry2template的值
                .set('entry2', fromJS(defaultOption())) //设置默认值
                .set('entry3', fromJS(defaultOption()))
                .set('input',fromJS(newRule().input))
                .set('inputCtrlInfoData',fromJS({cate:'text'}))
            //三级联动
            const cascade3 = el => {
                const entry2tplInd = el.toJS().entry2template 
                if(entry2tplInd == 1){ //1表单组件
                    return el.set('inputCtrlInfoData',action.optionItem) //ctrlTemplate代表了控件类型，决定第三个下拉和最后一个空间类型
                        .set('entry3', fromJS(defaultOption()))
                        .set('input',fromJS(newRule().input))
                }
                if(entry2tplInd == 2){ //2用户字段
                    return el.set('inputCtrlInfoData',action.optionItem) //ctrlTemplate代表了控件类型，决定第三个下拉和最后一个空间类型
                        .set('entry3', fromJS(defaultOption()))
                        .set('input',fromJS(newRule().input))
                }
                return el
            }
            /* 执行逻辑 */
            data = data.updateIn(ruleDataPath, 'initial', updateOption)
            if (action.entryIndex == 'entry1') { //二级联动
                data = data.updateIn(ruleDataPath, 'initial', cascade2)
            }
            if (action.entryIndex == 'entry2') { //三级联动
                data = data.updateIn(ruleDataPath, 'initial', cascade3)
            }
            return data.toJS()

        case 'clearSFData': /* 清空某个sequenceflow */
            let clearIndex = data.get('dataRepo').findKey((el, index, iter) => el.get('id') == action.id)
            return data.updateIn(['dataRepo', clearIndex, 'conditions'], 'initial', (el) => {
                return fromJS([{
                    data: [
                        newRule()
                    ],
                    ruleMode: 'normal'
                }])
            }).toJS()

            /* 加载 表单字段 和 用户字段 时 */
        case 'updateFormProperties':
            return data.updateIn(['formProperties'], 'initial', (el) => {
                return action.data
            }).toJS()

        case 'updateUserProperties':
            return data.updateIn(['userProperties'], 'initial', (el) => {
                    return action.data
                }).toJS()
                /* 加载 表单字段 和 用户字段 时 */

            /* 改变每个condition的rule删除模式 */
        case 'allRuleModeEQdelete':
            let allRuleModeEQdeleteIndex = data.get('dataRepo').findKey((el, index, iter) => el.get('id') == state.id)
            return data.updateIn(['dataRepo', allRuleModeEQdeleteIndex, 'conditions', action.index], 'initial', (el) => {
                return el.set('ruleMode', 'delete')
            }).toJS()
        case 'allRuleModeEQnormal':
            let allRuleModeEQdeleteIndex2 = data.get('dataRepo').findKey((el, index, iter) => el.get('id') == state.id)
            return data.updateIn(['dataRepo', allRuleModeEQdeleteIndex2, 'conditions', action.index], 'initial', (el) => {
                    return el.set('ruleMode', 'normal')
                }).toJS()
                /* 改变每个condition的rule删除模式 */


        case 'radioTextChange':
            let repoIndexRadio2 = data.get('dataRepo').findKey((el, index, iter) => el.get('id') == state.id)

            return data.updateIn(['dataRepo', repoIndexRadio2], 'initial', (el) => {
                return el.set('text', action.text) //false or true
            }).toJS()
        case 'radioChange':
            let repoIndexRadio = data.get('dataRepo').findKey((el, index, iter) => el.get('id') == state.id)
            return data.updateIn(['dataRepo', repoIndexRadio], 'initial', (el) => {
                return el.set('radio', action.radio)
            }).toJS()

        case 'switchElement':
            return data.updateIn(['id'], 'initial', (el) => {
                return action.nextId
            }).toJS()

        case 'sequenceDataInit':
            return data.updateIn(['dataRepo'], 'initial', (el) => {
                return el.push(fromJS(action.data))
            }).toJS()

        case 'ruleOnInput':
            let repoIndex4 = data.get('dataRepo').findKey((el, index, iter) => el.get('id') == state.id)
            return data.updateIn(['dataRepo', repoIndex4, 'conditions', action.key1, 'data', action.key2], 'initial', (el) => {
                return el.set('input', action.inputData)
            }).toJS()

        case 'linkage':
            return data.updateIn(['template', 'entry2', 'options'], 'initial', (el) => {
                return action.options
            }).toJS()

        case 'initCondition':
            let initIndex = data.get('dataRepo').findKey((el, index, iter) => el.get('id') == state.id)

            if (!initIndex && (initIndex != 0)) { //如果nextRepoIndex不存在

                return data.updateIn(['dataRepo'], 'initial', (el) => {
                    return el.push(fromJS(newCreate(state)))
                }).toJS()
            }
            return state

        case 'switchRadio':
            return Object.assign({}, state, {
                radio: action.value
            })

        case 'switchApproveData':
            return data.updateIn(['id'], 'initial', (el) => {
                return action.nextId
            }).toJS()

        case 'conditionDeleteMode':
            return Object.assign({}, state, {
                conditionMode: 'delete'
            })

        case 'closeConditionDeleteMode':
            return Object.assign({}, state, {
                conditionMode: 'normal'
            })

        case 'addCondition':
            let repoIndex = data.get('dataRepo').findKey((el, index, iter) => el.get('id') == state.id)
            if (!repoIndex && (repoIndex != 0)) { //如果nextRepoIndex不存在
                return data.updateIn(['dataRepo'], 'initial', (el) => {
                    return el.push(fromJS(newCreate(state)))
                }).toJS()
            }
            return data.updateIn(['dataRepo', repoIndex], 'initial', (el) => {
                return el.set('conditions', el.get('conditions').push(fromJS({
                    data: [
                        newRule()
                        // {entry1:defaultOption(),entry2:defaultOption(),entry3:{index:'initial',value:"=="},input:''}
                    ],
                    ruleMode: 'normal'
                })))
            }).toJS()

        case 'addRule':
            let repoIndex2 = data.get('dataRepo').findKey((el, index, iter) => el.get('id') == state.id)
            return data.updateIn(['dataRepo', repoIndex2, 'conditions', action.index, 'data'], 'initial', (el) => {
                return el.push(fromJS(newRule()))
            }).toJS()

        case 'deleteCondition':
            let repoIndexDelete = data.get('dataRepo').findKey((el, index, iter) => el.get('id') == state.id)
            return data.updateIn(['dataRepo', repoIndexDelete, 'conditions'], 'initial', (el) => {
                return el.delete(action.conditionIndex)
            }).toJS()

        case 'deleteRule':
            let repoIndexDelete2 = data.get('dataRepo').findKey((el, index, iter) => el.get('id') == state.id)
            return data.updateIn(['dataRepo', repoIndexDelete2, 'conditions', action.groupIndex, 'data'], 'initial', (el) => {
                return el.delete(action.ruleIndex)
            }).toJS()

        case 'modeChange':
            return Object.assign({}, state, {
                mode: action.value
            })
        default:
            return state
    }
}

export default Reducer
