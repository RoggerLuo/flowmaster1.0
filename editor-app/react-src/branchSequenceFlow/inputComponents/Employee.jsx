import React,{createClass} from 'react'

function Comp({ inputData, oninput }){
    const text = inputData.text || '选择人员' //不加这一句就会报错，因为没有初始值，所以就变成了uncontrolled组件
    const click = (event) => {
        const chooseCallback = (e) => {
            if(e.data.type=="selectedData"){
                console.log(e.data.value)
                const returnData = {
                    text:e.data.value[0].name,
                    value: '"'+e.data.value[0].id+'"'
                }
                oninput(returnData)
            }
            window.removeEventListener("message",chooseCallback, false)
            window.activeSave() 
        }
        window.addEventListener('message',chooseCallback,false)
        let message = {type:"openSelectUserPanel",value:"",params:{pickerType:'onlyPeople',title:'选择人员',orgId:window.getQueryString("rootOrgId")}}
        window.parent.postMessage(message,'*')
    }
    return (
        <div className="input-text-container">
            <div className="input-text pointer center" onClick={click}>
                <i className="icon-xuanzerenyuan icon iconfont"></i>{text}
            </div>
        </div>
    )
}

export default Comp
