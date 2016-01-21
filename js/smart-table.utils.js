(function (SmartTable) {
  'use strict';

  var Utils = {
    createDomElem: createDomElem,
    isNullOrUndef: isNullOrUndef,
    inherit: inherit,
    pickProperties: pickProperties
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

  //TODO: replace with obj == null
  function isNullOrUndef() {
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] === null || arguments[i] === undefined) {
        return true;
      }
    }
    return false;
  }

  function inherit(Child, Parent) {
    var F = function () { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.super = Parent;
    return Child;
  }

   function pickProperty(object, property) {
    var
      val = object,
      propertyPath;

    if (typeof property === 'string') {
      propertyPath = property.split('.');
    } else {
      throw Error('Column property should be a sting');
    }

    if (propertyPath.length) {
      propertyPath.forEach(function (pathPart) {
        if (val && val[pathPart] !== undefined &&
          val[pathPart] !== null) {
          val = val[pathPart];
        } else {
          val = null;
        }
      });
    }
    return val;
  }

  function pickProperties(obj, properties) {
    var mappedObject = {};
    properties.forEach(function (prop) {
      mappedObject[prop] = pickProperty(obj, prop);
    });
    return mappedObject;
  }

  SmartTable.Utils = Utils;
})(SmartTable || {});
