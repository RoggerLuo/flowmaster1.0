import React,{createClass} from 'react';
import { render } from 'react-dom'
import './style'

const step1 =  {
    step:'1',
    header:'10px solid rgba(50, 54, 61, 0.6)',
    leftBackground:'rgba(0, 0, 0, 0)',
    leftBorderBackground:'rgba(50, 54, 61, 0.6)',
    rightBackground:'rgba(50, 54, 61, 0.6)',
    rightBorderBackground:'rgba(0, 0, 0, 0)',
    middleBackground:'rgba(50, 54, 61, 0.6)',
}
const step2 =  {
    step:'2',
    header:'10px solid rgba(50, 54, 61, 0.6)',
    leftBackground:'rgba(50, 54, 61, 0.6)',
    leftBorderBackground:'rgba(0, 0, 0, 0)',
    rightBackground:'rgba(50, 54, 61, 0.6)',
    rightBorderBackground:'rgba(0, 0, 0, 0)',
    middleBackground:'rgba(0, 0, 0, 0)'
}
const step3 =  {
    step:'3',
    header:'10px solid rgba(50, 54, 61, 0.6)',
    leftBackground:'rgba(50, 54, 61, 0.6)',
    leftBorderBackground:'rgba(0, 0, 0, 0)',
    rightBackground:'rgba(0, 0, 0, 0)',
    rightBorderBackground:'rgba(50, 54, 61, 0.6)',
    middleBackground:'rgba(50, 54, 61, 0.6)'
}
const final =  {
    step:'4',
    header:'10px solid rgba(0, 0, 0, 0)',
    leftBackground:'rgba(0, 0, 0, 0)',
    leftBorderBackground:'rgba(0, 0, 0, 0)',
    rightBackground:'rgba(0, 0, 0, 0)',
    rightBorderBackground:'rgba(0, 0, 0, 0)',
    middleBackground:'rgba(0, 0, 0, 0)'
}
const Component = createClass({ 
    getInitialState(){
        return {currentStep:step1}
    },
    closeShadow(){
        const chooseCallback = (e) => {
            window.removeEventListener("message",chooseCallback, false)
        }
        const callDialogue = () => {
            window.addEventListener('message',chooseCallback,false)
            let message = {type:"closeShadow",value:"123test",params:{pickerType:'people',title:'选择人员'}}
            window.parent.postMessage(message,'*')
        }
        callDialogue()
    },
    nextStep(){
        switch(this.state.currentStep.step){
            case '1':
                this.setState({currentStep:step2})
                break
            case '2':
                this.setState({currentStep:step3,text:''})
                break
            case '3':
                this.setState({currentStep:final,text:'从左边点击或拖动功能点',display:'none'})
                this.closeShadow()
                break
        }
    },
    stopRemind(){
        this.closeShadow()
        this.setState({currentStep:final,text:'从左边点击或拖动功能点',display:'none'})
    },
    render(){
        let slice1Display = 'none'
        let slice2Display = 'none'
        let slice3Display = 'none'
        switch(this.state.currentStep.step){
            case '1':
                slice1Display = ''
                slice2Display = 'none'
                slice3Display = 'none'                                
                break
            case '2':
                slice1Display = 'none'
                slice2Display = ''
                slice3Display = 'none'                                
                break
            case '3':
                slice1Display = 'none'
                slice2Display = 'none'
                slice3Display = ''                                
                break
        }

        return (
            <div className="cover" onClick={this.nextStep} style={{display:this.state.display}}>
                <div className="header"></div>
                <div className="body" >
                    <div style={{backgroundColor:this.state.currentStep.leftBackground}} className="left">
                    </div>
                    <div style={{backgroundColor:this.state.currentStep.leftBorderBackground}} className="left-border"></div>
                    
                    <div style={{backgroundColor:this.state.currentStep.middleBackground}} className="middle">
                        
                        <div className="slice3line" style={{display:slice3Display,position:'relative',top:'36%',marginTop:'-62px',left:'88%'}} >
                            <img src={require("./line/3.png")}/>
                        </div>

                        <div className="slice slice1" style={{display:slice1Display}} >
                            <div className="title-text">{this.props.put('guide.title1')}</div>
                            <div className="content-text">{this.props.put('guide.content1')}</div>
                            <div className="bottom-text"><span className="stopremind" onClick={this.stopRemind}>{this.props.put('guide.stopRemind')}</span> <span className="iknow">{this.props.put('guide.iknow')}</span></div>
                        </div>
                        <div className="slice1line" style={{display:slice1Display,position:'relative',top:'249px',right:'200px'}} >
                            <img src={require("./line/1.png")}/>
                        </div>

                        <div className="middle-text">{this.state.text}</div>
                        <div className="slice slice3" style={{display:slice3Display}} >
                            <div className="title-text">{this.props.put('guide.title3')}</div>
                            <div className="content-text">{this.props.put('guide.content3')}</div>
                            <div className="bottom-text"><span className="stopremind" onClick={this.stopRemind}>{this.props.put('guide.stopRemind')}</span> <span className="iknow">{this.props.put('guide.iknow')}</span></div>
                        </div>

                    </div>
                    <div style={{backgroundColor:this.state.currentStep.rightBorderBackground}} className="right-border"></div>
                    <div style={{backgroundColor:this.state.currentStep.rightBackground}} className="right">
                        
                        <div className="slice1line" style={{display:slice2Display,position:'relative',top:'323px',left:'20px'}} >
                            <img src={require("./line/2.png")}/>
                        </div>

                        <div className="slice slice2" style={{display:slice2Display}} >
                            <div className="title-text">{this.props.put('guide.title2')}</div>
                            <div className="content-text">{this.props.put('guide.content2')}</div>
                            <div className="bottom-text"><span className="stopremind" onClick={this.stopRemind}>{this.props.put('guide.stopRemind')}</span> <span className="iknow">{this.props.put('guide.iknow')}</span></div>
                        </div>

                    </div>
                </div>
            </div>
        )
    }
})


import connectPut from 'react-put'
const options = {mapPropToDictionary: (props)=>window.reactI18n}
const ConnectedApp = connectPut(options)(Component)


window.userGuide = function(){
    let userGuide = window.localStorage.getItem('userGuide')
    if(userGuide){
        
    }else{
        //挂载
        render(
            <ConnectedApp />
            ,
            document.getElementById('userGuideComponent')
        )
        window.localStorage.setItem('userGuide','readed')

        const chooseCallback = (e) => {
            window.removeEventListener("message",chooseCallback, false)
        }

        const callDialogue = () => {
            window.addEventListener('message',chooseCallback,false)
            let message = {type:"openShadow",value:"123test",params:{pickerType:'people',title:'选择人员'}}
            window.parent.postMessage(message,'*')
        }
        callDialogue()

    }    
}
