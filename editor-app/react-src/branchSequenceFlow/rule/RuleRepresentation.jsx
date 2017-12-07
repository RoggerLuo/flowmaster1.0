import React,{createClass} from 'react';
import Dropdown from '../../basicComp/branch-dropdown'
import ctrlComponents from '../ctrl.conf.js'
/* ruleMode: 是否显示规则的 删除按钮 */
const Rule = ({dropdownData,ruleMode,del,oninput}) => {
    let border = '1px solid white'
    let display = 'none'
    if(ruleMode =='delete'){
        border = '1px solid red'//#dde4ef
        display = ''
    }else{
        border = '1px solid white'
        display = 'none'
    }

    let InputComp = ctrlComponents[dropdownData.inputCtrlInfoData.cate] ||  ctrlComponents.text
    if(dropdownData.inputCtrlInfoData.cate == 'calculate'){
        InputComp = ctrlComponents[dropdownData.inputCtrlInfoData.rule.type]
        //dateDiff //timeDiff //sum  //mean  //formula
    }
    if(dropdownData.inputCtrlInfoData.cate ==  'date'){
        if(dropdownData.inputCtrlInfoData.format != "YYYY-MM-DD"){
            InputComp = ctrlComponents.time
        }
    }    
    return (
        <div className="delete-frame" style={{border:border}}>
            <div style={{display:display,
                left: '22px',
                right: '22px',
                height: '66px',
                position: 'absolute',
                backgroundColor: 'rgba(255, 255, 255, 0.63)',
                zIndex: '999',
            }}></div>
            <div className="container-row">
                <Dropdown {...dropdownData.entry1}/>
                <Dropdown {...dropdownData.entry2}/>
                <Dropdown {...dropdownData.entry3}/>
                <i className="icon iconfont icon-guanbi2fill icon-red-close-for-rule" 
                    onClick={del}
                    style={{display:display}}>
                </i>
            </div>    
            <div className="container-row-placeholder"></div>
            <InputComp inputData={dropdownData.input} oninput={oninput} inputCtrlInfoData={dropdownData.inputCtrlInfoData}/>
        </div>
    )
}
export default Rule
