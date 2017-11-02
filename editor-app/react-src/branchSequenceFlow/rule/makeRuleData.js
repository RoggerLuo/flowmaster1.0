import { template, defaultOption } from '../../../redux/reducers/branch/basic'
import judgeList from '../judge.conf.js'
import { addUserFieldOptions } from '../userField.conf.js'
import i18n from '../../i18n'
export default (conditions, chooseFactory, branch, key1, key2) => {
    const ruleEl = conditions && conditions[key1] && conditions[key1].data[key2] && conditions[key1].data[key2] || undefined
    if (!ruleEl) return null
    const dropdown2cate = ruleEl.entry2template || '0'
    //inputCtrlInfoData 来自于 reducer的action，是第二个下拉的选中项
    const inputCtrlInfoData = ruleEl.inputCtrlInfoData || { cate:'text'}
        //二级联动
    switch (dropdown2cate) {
        case '0':
            template.entry2.options = [defaultOption()]
            break
        case '1': //表单字段
            template.entry2.options = branch.formProperties || []
            break
        case '2': //用户字段
            let UsersClone
            if(branch.userProperties){
                UsersClone = branch.userProperties.map(el=>JSON.parse(JSON.stringify(el))) //克隆子对象，断开引用
            }else{
                UsersClone = []
            }
            template.entry2.options = UsersClone.map(el=>{
                el.text = i18n[el.text]
                return el
            })
            template.entry2.options = addUserFieldOptions(template.entry2.options)
            break
        // case '3':
        //     template.entry2.options = branch.environmentVariable || []
        //     break
    }
    //三级联动 //第三个下拉，判断符号，> = 
    template.entry3.options = judgeList[inputCtrlInfoData.cate] || judgeList.text
    if(inputCtrlInfoData.cate =='calculate'){
        // template.entry3.options = judgeList[inputCtrlInfoData.rule.type] 
        //dateDiff //timeDiff //sum  //mean  //formula
    }

    //设置选中项
    template.entry1.choosedOption = ruleEl.entry1
    template.entry2.choosedOption = ruleEl.entry2
    template.entry3.choosedOption = ruleEl.entry3
    template.input = ruleEl.input
    template.inputCtrlInfoData = inputCtrlInfoData
        //方法
    template.entry1.choose = optionItem => chooseFactory('entry1')(optionItem)
    template.entry2.choose = optionItem => chooseFactory('entry2')(optionItem)
    template.entry3.choose = optionItem => chooseFactory('entry3')(optionItem)
        //是否翻译
    template.entry1.usePut = true
    template.entry2.usePut = false
    template.entry3.usePut = false
    return template
}
