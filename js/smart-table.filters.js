(function (SmartTable) {
  'use strict';

  var
    CSS = SmartTable.CSS,
    Utils = SmartTable.Utils,
    Comparators = SmartTable.Comparators;
  
  function Filter(column) {
    var self = this;
    
    self.cssClass = CSS.FILTER;
    if (column.filter) {
      self.cssClass += column.filter.cssClass ?
        ' ' + column.filter.cssClass : '';
      self.parser = column.filter.valueParser;
    }
  }

  Filter.prototype = {
    check: function (val) {
      var self = this;
      
      if (Utils.isNullOrUndef(val)) {
        return false;
      }
      return self.comparator(val, self.condition);
    },
    setCondition: function (val, index) {
      var self = this;
      
      if (self.parser) {
        val = self.parser(val);
      }
      if (Utils.isNullOrUndef(index)) {
        self.condition = val;
      } else {
        if (!Array.isArray(self.condition)) {
          self.condition = [];
        }
        self.condition[index] = val;
      }
    }
  };

  Filter.createFilter = function (column) {
    switch (column.type) {
      case CSS.COLUMN_TYPE_TEXT:
        return new TextFilter(column);
      case CSS.COLUMN_TYPE_RANGE:
        return new RangeFilter(column);
      case CSS.COLUMN_TYPE_SELECT:
        return new SelectFilter(column);
      default:
        return new TextFilter(column);
    }
  };




  function TextFilter(column) {
    TextFilter.super.apply(this, arguments);

    this.getFilterElement = function () {
      return Utils.createDomElem(
        'input',
        this.cssClass,
        {
          type: 'text',
          placeholder: column.title
        });
    };
  }

  Utils.inherit(TextFilter, Filter);

  TextFilter.prototype.comparator = Comparators.containComparator;




  function RangeFilter(column) {
    var self = this;
    
    RangeFilter.super.apply(self, arguments);

    self.cssClass += ' ' + CSS.FILTER_RANGE;
    self.condition = [];

    self.getFilterElement = function () {
      var
        self = this,
        filterWrap = document.createDocumentFragment(),
        inputMin = Utils.createDomElem(
          'input',
          self.cssClass + ' ' + CSS.FILTER_RANGE_MIN,
          {
            type: 'text',
            placeholder: column.title
          }),
        inputMax = Utils.createDomElem(
          'input',
          self.cssClass + ' ' + CSS.FILTER_RANGE_MAX,
          {
            type: 'text',
            placeholder: column.title
          });

      filterWrap.appendChild(inputMin);
      filterWrap.appendChild(inputMax);

      return filterWrap;
    };
  }

  Utils.inherit(RangeFilter, Filter);

  RangeFilter.prototype.comparator = Comparators.rangeComparator;




  function SelectFilter(column) {
    var self = this;
    
    SelectFilter.super.apply(self, arguments);

    self.getFilterElement = function () {
      var
        self = this,
        selectElem = Utils.createDomElem('select', self.cssClass),
        optionElem,
        optionData,
        index = 0,
        selectOptionsLen = column.selectOptions.length;

      optionElem = Utils.createDomElem('option', '', {
        value: ''
      });
      selectElem.appendChild(optionElem);

      for (; index < selectOptionsLen; index++) {
        optionData = column.selectOptions[index];
        optionElem = Utils.createDomElem('option', self.cssClass,
          {
            value: optionData.value
          }, optionData.text);
        selectElem.appendChild(optionElem);
      }

      return selectElem;
    };
  }

  Utils.inherit(SelectFilter, Filter);

  SelectFilter.prototype.comparator = Comparators.equalComparator;
  
  
  
  SmartTable.Filter = Filter;
})(SmartTable || {});
