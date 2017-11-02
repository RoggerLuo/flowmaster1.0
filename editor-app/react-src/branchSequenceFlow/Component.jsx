import React,{createClass} from 'react';
import { render } from 'react-dom'
import store from '../../redux/configureStore.js'
import { Provider } from 'react-redux'
import { connect } from 'react-redux'

import SectionTitleContainer from './SectionTitleContainer'
import Radios from './Radios'
import Options from './Options'
import './style'

const Component = ({put}) => {
    return(
        <div className="react-approve" >
            <SectionTitleContainer text={put('branch.sectionTitle')}/>   
            <Radios />
            <Options />
        </div>
    )
}
import connectPut from 'react-put'
const options = {mapPropToDictionary: (props)=>window.reactI18n}
const ConnectedApp = connectPut(options)(Component)

export default function(){
    render(
        <Provider store={store}>
            <ConnectedApp />
        </Provider>
        ,
        document.getElementById('branchSequenceFlowComponent')
    );
}