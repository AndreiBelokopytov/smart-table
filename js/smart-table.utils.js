(function (SmartTable) {
  'use strict';
  
  var Utils = {
    createDomElem: createDomElem,
    isNullOrUndef: isNullOrUndef,
    inherit: inherit
  };

  function createDomElem(elem, cssClass, attributes, textContent) {
    var
      attrName,
      attrVal;

    elem = document.createElement(elem);

    if (cssClass) {
      elem.className = cssClass;
    }

    if (attributes) {
      for (attrName in attributes) {
        if (attributes.hasOwnProperty(attrName)) {
          attrVal = attributes[attrName];
          elem.setAttribute(attrName, attrVal);
        }
      }
    }

    if (textContent) {
      elem.innerText = textContent;
    }

    return elem;
  }
  
  function isNullOrUndef() {
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] === null || arguments[i] === undefined) {
        return true;
      }
    }
    return false;
  }
  
  function inherit(Child, Parent) {
    var F = function () {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Parent;
    Child.super = Parent;
    return Child;
  }
  
  SmartTable.Utils = Utils;
})(SmartTable || {});
