import React,{createClass} from 'react'
function Comp({ inputData, oninput }){
    const value = inputData.value || '' //不加这一句就会报错，因为没有初始值，所以就变成了uncontrolled组件
    const whenChange = (event) => {
        if(isNaN(event.target.value)){
            window.showAlert('当前控件只能输入数字')
            return
        }
        const newInputData = {
            text:event.target.value,
            value:event.target.value 
        }
        oninput(newInputData)
    }
    return (
        <div className="input-text-container">
            <input type='text' className="input-text" value={value} onChange={whenChange}/>
        </div>
    )
}
export default Comp

