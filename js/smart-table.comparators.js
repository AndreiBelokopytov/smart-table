(function (SmartTable) {
  'use strict';
  
  var Comparators = {
    containComparator: containComparator,
    rangeComparator: rangeComparator,
    equalComparator: equalComparator
  };
  
  function containComparator(val, condition) {
    if (!condition) {
      return true;
    }
    return val.toString().indexOf(condition) >= 0;
  }

  function rangeComparator(val, condition) {
    var conditionMin = condition[0],
      conditionMax = condition[1];

    if (!conditionMax && !conditionMin) {
      return true;
    }

    if (!conditionMin) {
      return val <= conditionMax;
    } else if (!conditionMax) {
      return val >= conditionMin;
    } else {
      return val <= conditionMax && val >= conditionMin;
    }
  }

  function equalComparator(val, condition) {
    if (condition && val !== condition) {
      return false;
    }
    return true;
  }
  
  SmartTable.Comparators = Comparators;
})(SmartTable || {});