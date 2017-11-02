import {
    Text, NumberInput, Calendar, Time,
    Dropdown, DropdownMulti, Org, Employee, CalculateTime, CalculateDate,
    dateInSec
} from './inputComponents'


export default {
    text: Text,
    textarea: Text,
    number:NumberInput,
    money:NumberInput,
    date:Calendar,
    time:Time,
    selection:Dropdown,
    multi_selection:DropdownMulti,
    select_employee:Employee,
    select_org:Org,
    mobile:Text,
    email:Text,
    phone:Text,
    dateDiff:CalculateDate,
    timeDiff:CalculateTime,
    sum:NumberInput,
    mean:NumberInput,
    formula:Text,
    dateInSec:dateInSec
}