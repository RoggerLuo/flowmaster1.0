import React,{createClass} from 'react'

function Comp({ inputData, oninput }){

    const text = inputData.text  || '选择日期' //不加这一句就会报错，因为没有初始值，所以就变成了uncontrolled组件    

    const whenChange = (value) => {
        const re = new RegExp(/\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}/)    
        let numberValue
        if (re.test(value)) {
            numberValue = Date.parse(new Date(value + ' 00:00'))  // + new Date().getTimezoneOffset()*60*1000
        }

        const newInputData = {
            text:value,
            value: numberValue //'"' +value + '"'
        }
        oninput(newInputData)
    }
    const click = (event) => {
        const chooseCallback = (e) => {            
            if(e.data.type=='selectedDate'){
                console.log(e.data.value)
                whenChange(e.data.value)
                window.activeSave() 
            }
            window.removeEventListener("message",chooseCallback, false)
        }
        window.addEventListener('message',chooseCallback,false)        
        const message = {
            type:"openCalendar",
            left:event.currentTarget.getBoundingClientRect().left - 20,
            top:event.currentTarget.getBoundingClientRect().top
        }
        window.parent.postMessage(message,'*')
    }
    return (
        <div className="input-text-container">
            <div className="input-text pointer center" onClick={click}>
                <i className="icon-riqi icon iconfont"></i>{text}
            </div>
        </div>
    )
}

export default Comp

