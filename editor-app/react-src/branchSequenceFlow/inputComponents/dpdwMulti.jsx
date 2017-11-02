import React,{createClass} from 'react';
import { render } from 'react-dom'
import './dpdw.less'
/*
html:
    drop-down-choosed是占位符 用来显示
    drop-down-table是下拉选项
逻辑:
choosedOption和options都是传入进来的，所以逻辑在外面，有一个container来托管数据和逻辑,以及负责切换options实现二级联动
*/

/* 单个下拉选项 */
/*style={{textAlign: 'center'}}*/
const Option = ({click,el,put,choosedOption}) =>{
    let className="inner-option "
    choosedOption.data.map(el=>el.value).forEach(chooseOptionEl => {
        if(el.value == chooseOptionEl){
            className="inner-option checkok"
        }
    })
    return (
        <div className="drop-down-option" onClick={click}>
            <div className={className} >
                {put(el.text)}
            </div>
        </div>
    )           
}

/*
    视图只负责输出，
    技术上来说 text和value中，value都可以不需要的
    每个单个的dropdown视图需要一个container维护逻辑和数据(store in the redux store)
*/
const DropdownRaw = ({options,choose,choosedOption,display,toggle,close,put,usePut}) => {
    let nDisplay = display == 'none'? '':'none'
    if(!usePut){
        put = (value)=>value
    }
    return (
        <div className="branch-dropdown-input" style={{flex:'1'}}>
            <div style={{display: 'flex'}} className="drop-down-choosed" onClick={toggle}>
                <div style={{overflow: 'hidden',margin: 'auto',paddingLeft: '16px'}}>{put(choosedOption.text)}</div> 
                <div className="inverted-triangle">
                    <i style={{display: nDisplay,top:'0px'}} className="icon iconfont icon-sanjiao1"></i>
                    <i style={{paddingTop: '3px',color:'#00b0ff',transform:'rotate(180deg)',display:display}} className="icon iconfont icon-sanjiao1" ></i>
                </div>
            </div>

            <div style={{ position: 'absolute',left: '22px',right: '21px',height:'30px',zIndex:'1000'}}onClick={toggle}>
            <table className="drop-down-table" style={{zIndex:'1000',width: '100%'}} >
                <tbody>
                    <tr style={{display:'none'}}>
                        <td className="drop-down-choosed stop-propagation" onClick={toggle} style={{color:'black',display:'flex',justifyContent: 'space-between'}}>
                            <div>{put(choosedOption.text)}</div> 
                            <div className="inverted-triangle">
                                <i className="icon iconfont icon-sanjiao1"></i>
                            </div>
                        </td>
                    </tr>
                    <tr className="drop-down-options" style={{display:display}}>
                        <td>
                            <div className="scrollbar" style={{overflow:'auto',maxHeight:'191px'}}>
                                {options.map((el,index)=>{
                                    el.index = index
                                    return(
                                        <Option 
                                            click={(event)=>{
                                                choose(el)
                                                event.stopPropagation()
                                                event.preventDefault()
                                            }}
                                            choosedOption={choosedOption} el={el} key={index} put={put}
                                        />
                                    )
                                })}
                            </div>
                        </td>                
                    </tr>    
                </tbody>
            </table>
            </div>
            <div className="big-cover" style={{display:display}} onClick={close}></div>
        </div>
    )
}

import connectPut from 'react-put'
const putOptions = {mapPropToDictionary: (props)=>window.reactI18n}
const Dropdown = connectPut(putOptions)(DropdownRaw)

const DropdownContainer = createClass({ 
    getInitialState(){
        return {
            display:'none',
        }
    },
    toggle(){
        if(this.state.display == 'none'){
            this.setState({display:''})
        }else{
            this.setState({display:'none'})
        }
    },
    close(){
        this.setState({display:'none'})
    },
    render(){        
        return (
            <Dropdown {...{usePut:this.props.usePut,
                options:this.props.options,
                choose:this.props.choose,
                choosedOption:this.props.choosedOption,
                
                display:this.state.display,
                toggle:this.toggle,
                close:this.close}}/>
        )
    }
})

/*
    需要输入的 
    usePut（是否翻译)
    choose(item) //item 是 options 子元素
    choosedOption //text & value
    options
*/

export default DropdownContainer
