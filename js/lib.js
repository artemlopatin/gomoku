;
'use strict';

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function reverseString(s) {
    var str = '';
    for (var i = s.length - 1; i >= 0; i--)
        str += s[i];
    return str;
}

function replace7x(s) {
    var a = [], pos = -1;
    while ((pos = s.indexOf('x', pos + 1)) !== -1) {
        a[a.length] = s.substr(0, pos) + '7' + s.substr(pos + 1);
    }
    return a;
}

function cloneObject(obj) {
    var newObj = {};
    for (var prop in obj) {
        if (typeof obj[prop] === 'object') {
            newObj[prop] = cloneObject(obj[prop]);
        } else {
            newObj[prop] = obj[prop];
        }
    }
    return newObj;
}

function createElement(name, attributes) {
    var el = document.createElement(name);
    if (typeof attributes === 'object') {
        for (var i in attributes) {
            el.setAttribute(i, attributes[i]);
            if (i.toLowerCase() === 'class') {
                el.className = attributes[i]; // for IE compatibility

            } else if (i.toLowerCase() === 'style') {
                el.style.cssText = attributes[i]; // for IE compatibility
            }
        }
    }
    for (var i = 2; i < arguments.length; i++) {
        var val = arguments[i];
        if (typeof val === 'string') {
            val = document.createTextNode(val);
        }
        el.appendChild(val);
    }
    return el;
}

function getMiddleColor(a, b, c) {
    var percent = a || 0;
    var startColor = b || '#fafafa';
    var finishColor = c || '#FF0000';
    var aRGBStart = startColor.replace('#', '').match(/.{2}/g);
    var aRGBFinish = finishColor.replace('#', '').match(/.{2}/g);
    var finishPercent = percent;
    var startPercent = 1 - finishPercent;
    var R, G, B;
    var R = Math.floor(('0x' + aRGBStart[0]) * startPercent + ('0x' + aRGBFinish[0]) * finishPercent);
    var G = Math.floor(('0x' + aRGBStart[1]) * startPercent + ('0x' + aRGBFinish[1]) * finishPercent);
    var B = Math.floor(('0x' + aRGBStart[2]) * startPercent + ('0x' + aRGBFinish[2]) * finishPercent);
    return 'rgb(' + R + ',' + G + ',' + B + ')';
}