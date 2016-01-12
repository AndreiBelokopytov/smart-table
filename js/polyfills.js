//polyfill for Element.closest
if (!Element.prototype.closest) {
  Element.prototype.closest = function (selector) {
    'use strict';

    var closest = this,
      matchesSelector = Element.prototype.matches ||
        Element.prototype.msMatchesSelector;

    while (closest) {
      if (matchesSelector.call(closest, selector)) {
        return closest;
      }
      closest = closest.parentElement;
    }

    return null;
  };
}