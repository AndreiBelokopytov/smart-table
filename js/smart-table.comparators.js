(function (SmartTable) {
  'use strict';
  
  var
    Comparators = {
      containComparator: containComparator,
      rangeComparator: rangeComparator,
      equalComparator: equalComparator,
      existComparator: existComparator
    };
  
  function containComparator(val, condition) {
    var substr = condition[0];
    return val.toString().indexOf(substr) >= 0;
  }

  function rangeComparator(val, condition) {
    var rangeMin = condition[0],
      rangeMax = condition[1];

    if (!rangeMax && !rangeMin) {
      return true;
    }

    if (!rangeMin) {
      return val <= rangeMax;
    } else if (!rangeMax) {
      return val >= rangeMin;
    } else {
      return val <= rangeMax && val >= rangeMin;
    }
  }

  function equalComparator(val, condition) {
    var equalTo = condition[0];
    return val === equalTo;
  }

  function existComparator(val) {
    return Boolean(val);
  }

  SmartTable.Comparators = Comparators;
})(SmartTable || {});