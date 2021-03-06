import React,{createClass} from 'react'
import ApproveGroupContainer from '../ApproveGroupContainer'
import SectionTitle from '../../presentations/SectionTitle/SectionTitle'
import './MainComp.less'

const Component = ({data,sectionTitle,put}) => {
    
    return(
        <div className="react-approve" >
            <SectionTitle {...sectionTitle} text={put('parallel.contentTitle')} /> 
            {data.map((el,index)=>{ //data是state.parallel.data， el是会签组group
                return (
                    <ApproveGroupContainer el={el} index={index} key={index}/>
                )
            })}
            <div className="property-row-title">{put('parallel.remark.title')}</div>
            <div className="property-row-content" 
                style={{padding:'0',fontSize:'13px',color:'#333333'}}
            >
                {put('parallel.remark.content')}
            </div>
        </div>
    )
}


import connectPut from 'react-put'
const options = {mapPropToDictionary: (props)=>window.reactI18n}
const ConnectedApp = connectPut(options)(Component)

export default ConnectedApp
