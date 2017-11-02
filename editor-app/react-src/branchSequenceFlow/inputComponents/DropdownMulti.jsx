import React,{createClass} from 'react'
import Dropdown from './dpdwMulti.jsx'

function Comp({ inputData, oninput, inputCtrlInfoData }){
    if(inputData.text ==''){
        inputData = {text:'请选择',value:'initial',data:[]}
    }
    const options = inputCtrlInfoData.options.map(el=>{
        el.text = el.name || el.text
        return el
    })
    const choose = (item) =>{
        if(inputData.data.some(el=>el.value == item.value)){
            inputData.data = inputData.data.filter(el=>el.value!=item.value)
        }else{
            inputData.data.push(item)            
        }
        const valueArr = inputData.data.sort((a,b)=>a.index - b.index) //.map(el=>'"'+el.value+'"')
        let value = ''
        for (var i = 0; i < valueArr.length; i++) {
            value += valueArr[i].value
            if(i+1 != valueArr.length){
                value += ','
            }
        }
        value = '"'+value+'"'
        debugger
        oninput({
            data:inputData.data,
            text: inputData.data.map(el=>el.text).join('，'),
            value//: .join(',')//'"'+item.value+'"'  JSON.stringify()
        })
    } 
    return (
        <div className="input-text-container" style={{height:'30px',display:'flex'}}>
            <Dropdown options={options} choose={choose} choosedOption={inputData}/>
        </div>
    )
}
export default Comp

