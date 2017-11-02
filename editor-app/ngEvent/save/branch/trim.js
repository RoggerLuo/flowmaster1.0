'use strict';

function LTrim(str) {
    var i;
    for (i = 0; i < str.length; i++) {
        if (str.charAt(i) != " ")
            break;
    }
    str = str.substring(i, str.length);
    return str;
}

function RTrim(str) {
    var i;
    for (i = str.length - 1; i >= 0; i--) {
        if (str.charAt(i) != " ")
            break;
    }
    str = str.substring(0, i + 1);
    return str;
}

function Trim(str) {
    if(typeof(str) != 'string') return str
    return LTrim(RTrim(str));
}

export default Trim