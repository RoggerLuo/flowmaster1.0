import {
    Text, NumberInput, Calendar, Time,
    Dropdown, Org, Employee, Calculate
} from './inputComponents'

const dropdownList = {
    //dropdown
    "gender": [
        {text:'男',value:'MALE'},
        {text:'女',value:'FEMALE'}
    ], 
    "status": [
        {text:'未激活',value:'ACTIVATING'},
        {text:'已激活',value:'ACTIVATED'}
    ], 
    "disabled": [
        {text:'未禁用',value:false},
        {text:'已禁用',value:true}
    ], // 是否禁用
    "senior": [
        {text:'是',value:'true'},
        {text:'不是',value:'false'}
    ],
}

const textList = {
    //text
    "jobTitle": [],  // 职位
    "nickname": "String", // 昵称
    "sn": "String",  // 工号
    "email": "String", // 邮箱
    "initial": "String", // 拼音首字母
    "mobile": "String", // 手机
    "avatar": "String", // 头像
    "pinyin": "String", // 拼音
    "name": "String",  // 姓名
    "username": "String", // 账号
    "id": "String", // userId
    "birthday": "String", //(毫秒数）
    "senior":"String",//字符串:true/false
}

export const addUserFieldOptions = (options) => {
    return options.map(el=>{
        if(!!dropdownList[el.value]){
            el.options = dropdownList[el.value]
            el.cate = 'selection'
            // if(el.value == 'jobTitle'){
            //     el.options = window.reduxStore.getState().common.roleData            
            // }
        }else{
            el.cate = 'text'
            if(el.value == 'birthday'){
                el.cate = 'dateInSec'
            }
        }
        return el
    })
}
