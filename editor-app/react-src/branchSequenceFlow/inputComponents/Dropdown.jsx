import React,{createClass} from 'react'
import Dropdown from './dpdw.jsx'

function Comp({ inputData, oninput, inputCtrlInfoData }){
    if(inputData.text ==''){
        if(inputData.value ==''){
            inputData = {text:'请选择',value:'initial'}
        }
    }
    const options = inputCtrlInfoData.options.map(el=>{
        el.text = el.name || el.text
        return el
    })
    const choose = (item) =>{
        oninput({
            text:item.text,
            value:'"'+item.value+'"'
        })
    } 
    return (
        <div className="input-text-container" style={{height:'30px',display:'flex'}}>
            <Dropdown options={options} choose={choose} choosedOption={inputData}/>
        </div>
    )
}
export default Comp

