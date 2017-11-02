import React,{createClass} from 'react'
function Comp({ inputData, oninput }){
    let text = inputData.text || '' 
    let part1 = text.split('天')
    let days = part1[0]  || ''
    const whenChange1 = (event) => {
        if(isNaN(event.target.value)){
            window.showAlert('当前控件只能输入数字')
            return 
        }
        const newInputData = {
            text:event.target.value+'天',
            value:  '"' + event.target.value+'天' +'"' //event.target.value*60*60*24
        }
        console.log(newInputData.value)
        oninput(newInputData)
    }
    return (
        <div className="input-text-container input-text-container-calculate">
            <input className="input-text" style={{width:'92%'}} type='text' value={days} onChange={whenChange1}/>天
        </div>
    )
}
export default Comp

