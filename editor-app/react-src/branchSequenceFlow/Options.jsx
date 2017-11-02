import React,{createClass} from 'react';
import { render } from 'react-dom'
import store from '../../redux/configureStore.js'
import { Provider } from 'react-redux'
import { connect } from 'react-redux'
import ConditionContainer from './condition/ConditionContainer'
import './style'

const Button=(props)=>{
    return(
        <div className="boardbutton">
            <div className="mybutton" >
                添加规则
            </div>
        </div>
    )
}

const dropdownMode = () => {
    store.dispatch({type:'modeChange',value:'dropdown'})
    activeSave()
}
const textMode = () => {
    store.dispatch({type:'modeChange',value:'text'})
    activeSave()

}

const addRule = (index) => {
    store.dispatch({type:'addRule',index})
    activeSave()
}
const onchange = (event) => {
    store.dispatch({type:'radioTextChange',text:event.target.value})
    activeSave()
}

const Options =   ({conditions,element,put,nextElement}) => {
    if(element.radio){
        /*
        <p>{put('branch.remark.content3')}</p>
        <p>{put('branch.remark.content4')}</p>
        <p>{put('branch.remark.content5')}</p>
        <p>{put('branch.remark.content6')}</p>
        */
        return (
            <div>
                <div className="section-content">
                    {put('branch.sectionContent',nextElement)}
                </div>

                <textarea 
                    placeholder='点击输入条件公式...'
                    value={element.text}
                    onChange={onchange}
                    style={{padding:'5px',outline:'none',border:'1px solid #ccc',width:'100%',height:'100px'}} 
                ></textarea>
                
                <div className="section-title">{put('branch.remark.title')}</div>
                <div className="property-row-content" style={{}}>
                    <p>{put('branch.remark.content7')}</p>
                </div>
            </div>
        )
    }else{
        if(conditions.length == 0){
            return (<div></div>)
        }else{
            return (
                <div>
                    <div className="section-content">
                        {put('branch.sectionContent',nextElement)}
                    </div>

                    {conditions.map((el,index)=>{
                        return (<ConditionContainer index={index} key={index}/>)
                    })}
                    <div className="section-title">{put('branch.remark.title')}</div>
                    <div className="property-row-content">
                        {put('branch.remark.content1')}；<br/>
                        {put('branch.remark.content2')}。
                        
                    </div>
                </div>
            )
        }
    }
}
//{put('branch.remark.contentTimeDoc')}
const mapStateToProps = (state) => {
    const nextElement = state.common.nextElOfSF
    const elementFound = state.branch.dataRepo.filter((el,index)=>{
        return el.id == state.branch.id
    })
    const conditions = elementFound[0] && elementFound[0].conditions || []
    const element = elementFound[0] && elementFound[0]||{}
    return {conditions,element,nextElement}
}
const mapDispatchToProps = (dispatch) => {
    return {dispatch}
}

import connectPut from 'react-put'
const putOptions = {mapPropToDictionary: (props)=>window.reactI18n}
const ConnectedApp = connectPut(putOptions)(Options)


const OptionsContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ConnectedApp)

export default OptionsContainer

