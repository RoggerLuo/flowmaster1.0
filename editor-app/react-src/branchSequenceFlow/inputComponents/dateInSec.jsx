import React,{createClass} from 'react'

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function Comp({ inputData, oninput }){
    //不加这一句就会报错，因为没有初始值，所以就变成了uncontrolled组件
    let text
    inputData.value = inputData.value || ''
    
    if(!isNaN(inputData.value)){
        const value = inputData.value
        text = new Date(value).Format("yyyy-MM-dd")
    }else{
        text = '选择生日'
    }
    if(inputData.value == ''){
        text = '选择生日'
    }
    const whenChange = (text) => {
        const newInputData = {
            text,value:Date.parse(new Date(text)) + new Date().getTimezoneOffset()*60*1000
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
