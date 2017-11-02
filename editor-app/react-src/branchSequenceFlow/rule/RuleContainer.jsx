import React,{createClass} from 'react'
import { connect } from 'react-redux'
import Rule from './RuleRepresentation'
import makeRuleData from './makeRuleData.js'
/*  
    cancelDeleteRuleStatus 取消当前规则的删除状态    
    ruleMode: 是否显示规则的 删除按钮
    key1 条件在 当前组件中 的序数, key2 规则在 当前条件中 的序数, del: 点击删除当前 规则,  oninput: 为了输入的时候保存文字 
*/
const RuleContainer = ({branch,conditions,dispatch,/*from redux*/key1,key2,ruleMode,cancelRuleDeleteStatus}) =>{
    const oninput = (inputData) => {
        dispatch({type:'ruleOnInput',key1,key2,inputData})
        activeSave()
        window.updateBranchText()
    }
    const del = () => {
        if(conditions[key1].data.length<=1){
            window.showAlert('至少保留一组规则')
            cancelRuleDeleteStatus()
            return 
        }
        dispatch({type:'deleteRule',groupIndex:key1,ruleIndex:key2})
        activeSave()
        window.updateBranchText()
    }
    const chooseFactory = (entryIndex) => {
        return (optionItem)=>{
            activeSave()
            dispatch({optionItem,type:'branchUpdate',groupIndex:key1,ruleIndex:key2,entryIndex})
            window.updateBranchText()
        }
    }
    const dropdownData = makeRuleData(conditions,chooseFactory,branch,key1,key2)
    if(!dropdownData) return null //切换的时候，可能返回null，不显示就好了
    return (<Rule {...{dropdownData,ruleMode,del,oninput}} />)
}
const mapStateToProps = (state) => {
    const elementFound = state.branch.dataRepo.filter((el,index)=>{
        return el.id == state.branch.id
    })
    const conditions = elementFound[0] && elementFound[0].conditions || []
    return {conditions,branch:state.branch}
}
const mapDispatchToProps = (dispatch) => {
    return {dispatch}
}
export default connect(mapStateToProps,mapDispatchToProps)(RuleContainer)
