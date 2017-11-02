import React,{createClass} from 'react';
import { connect } from 'react-redux'

const Radios = ({mode1,mode2,element,put}) => {
    let view = ''
    if(element.radio){
        view = (
            <div className="radio-box">
                <label className="radio-lable" onClick={mode1}>
                    <span className="radio-img"><img width="20" height="20" src={require("./unselected.png")} /></span>
                    <span className="radio-text">{put('branch.radio.manual')}</span> 
                </label> 
                <label className="radio-lable" >
                    <span className="radio-img"><img width="20" height="20" src={require("./selected.png")} /></span>
                    <span className="radio-text">{put('branch.radio.formula')}</span> 
                </label> 
            </div>
        )
    }else{
        view = (
            <div className="radio-box">
                <label className="radio-lable">
                    <span className="radio-img"><img width="20" height="20" src={require("./selected.png")} /></span>
                    <span className="radio-text">{put('branch.radio.manual')}</span> 
                </label> 
                <label className="radio-lable" onClick={mode2}>
                    <span className="radio-img"><img width="20" height="20" src={require("./unselected.png")} /></span>
                    <span className="radio-text">{put('branch.radio.formula')}</span> 
                </label>  
            </div>
        )
    }

    return view
}
const mapStateToProps = (state) => {
    const elementFound = state.branch.dataRepo.filter((el,index)=>{
        return el.id == state.branch.id
    })
    // const conditions = elementFound[0] && elementFound[0].conditions || []
    const element = elementFound[0] && elementFound[0]||{}
    return {element}

    // return {radio:state.branch.radio}
}
const mapDispatchToProps = (dispatch) => {
    const mode1 =()=>{
        dispatch({type:'switchRadio',value:'dropdown'})
        dispatch({type:'radioChange',radio:false})
        dispatch({type:'saveActive'})

    }
    const mode2 =()=>{
        dispatch({type:'switchRadio',value:'text'})
        dispatch({type:'radioChange',radio:true})
        dispatch({type:'saveActive'})

    }
    return {mode1,mode2}
}


import connectPut from 'react-put'
const options = {mapPropToDictionary: (props)=>window.reactI18n}
const ConnectedApp = connectPut(options)(Radios)



const RadiosContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ConnectedApp)

export default RadiosContainer