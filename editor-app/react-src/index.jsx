import './saveButton/saveButton'
// import saveButton from './saveButton/saveButton'

import '../ngEvent'

import './userGuide/component'
import '../qingfont/iconfont.css'
import './global.less'
import './icon.less'
import './basic.less'

import approveComponent from './approveNode/Container'
import endPointComponent from './endPoint/Container'
import parallelApproveComponent from './parallelApprove/MainCompContainer'
import branchSequenceFlowComponent from './branchSequenceFlow/Component'
import branchNodeComponent from './branchNode/Container'
import popupStart from './popup/popupWrapContainer'
import store from '../redux/configureStore'
import myAlert from './alert/alert'
import mySpin from './alert/spin'


popupStart()
myAlert()
mySpin()
// global.saveButton = {render:saveButton,flag:true}
global.branchSequenceFlowComponent = {render:branchSequenceFlowComponent}
global.parallelApproveComponent = {render:parallelApproveComponent}
global.approveComponent = {render:approveComponent}
global.branchComponent = {render:branchNodeComponent}
global.reduxStore = store
global.endPointComponent = endPointComponent

import zh from './i18n/zh'
import en from './i18n/en'
window.reactI18n = zh
