import React,{createClass} from 'react';
import { render } from 'react-dom'
import {connect} from 'react-redux'
import { Provider } from 'react-redux'
import store from '../../redux/configureStore.js'

import './style'
import TimerMixin from 'react-timer-mixin'

// window.reduxStore.dispatch({type:'callAlert',alertContent:'aaa'})
// window.reduxStore.dispatch({type:'hideAlertAnimation'})
// window.reduxStore.dispatch({type:'hideAlert'})

const Component = createClass({ 
    getInitialState(){
        return {currentStep:'d'}
    },
    mixins: [TimerMixin],
    // show(){
    //     this.setTimeout(
    //        () => { console.log('timeout test'); },
    //        1000
    //     );
    // },
    render(){
        // let dynamicClass = th
        let display = 'none'
        let theClass = ''
        if(this.props.showAlert == 'show'){
            display = ''
            theClass = 'fadeInAlert'
        }
        if(this.props.showAlert == 'hideAnimation'){
            display = ''
            theClass = 'fadeOutAlert'
        }
        if(this.props.showAlert == 'hideAlert'){
            display = 'none'
        }
        const type = this.props.alertType
        let iconText = (<div className="content">
                    {this.props.alertContent}
                </div>)
        if(type=='good'){
            iconText = (<div className="content">
                    <i className="icon iconfont icon-check"></i>
                    {this.props.alertContent}
                </div>)
        }
        if(type=='bad'){
            iconText = (<div className="content">
                    <i className="icon iconfont icon-gantanhao-xianxingyuankuang"></i>
                    {this.props.alertContent}
                </div>)            
        }
        
        return (
            <div className={'alertComponent '+theClass} style={{display:display}}>
                {iconText}
            </div>
        )
    }
})
// 节点名称不能为空，请编辑后再继续操作

    
const mapStateToProps = (state) => {
    return state.common
}
const mapDispatchToProps = (dispatch) => {
    return {dispatch}
}

const ComponentContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Component)

export default function(){
    window.showAlert = (text,alertType)=>{
        if(window.showAlertDisable){
            return
        }
        store.dispatch({type:'callAlert',alertContent:text,alertType:alertType||'bad'})
        store.dispatch({type:'hideAlertAnimation'})
        setTimeout(function(){
            store.dispatch({type:'hideAlert'})
        },2500)
    }

    render(
        <Provider store={store}>
            <ComponentContainer />
        </Provider>
        ,
        document.getElementById('custom-alert')
    )
}
