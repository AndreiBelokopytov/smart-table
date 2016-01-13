(function (SmartTable) {
  'use strict';

  var
    CSS = SmartTable.CSS,
    Utils = SmartTable.Utils,
    Comparators = SmartTable.Comparators,
    
    COLUMN_TYPE_TEXT = 'text',
    COLUMN_TYPE_RANGE = 'range',
    COLUMN_TYPE_SELECT = 'select',
    COLUMN_TYPE_CHECKBOX = 'checkbox';
  
  function Filter(column) {
    var self = this;
    
    self.condition = [];
    self.cssClass = CSS.FILTER;
    if (column.filter) {
      self.cssClass += column.filter.cssClass ?
        ' ' + column.filter.cssClass : '';
      self.parser = column.filter.valueParser;
    }
  }

  Filter.prototype = {
    hasCondition: function () {
      return this.condition.length && this.condition.every(function (item) {
        return !!item;
      });
    },
    check: function (val) {
      var self = this;
      
      if (!this.hasCondition()) {
        return true;
      }
      
      if (Utils.isNullOrUndef(val)) {
        return false;
      }
      return self.comparator(val, self.condition);
    },
    setCondition: function (val, index) {
      var self = this;
      index = index || 0;
      
      if (self.parser) {
        val = self.parser(val);
      }
      self.condition[index] = val;
    }
  };

  Filter.createFilter = function (column) {
    switch (column.type) {
      case COLUMN_TYPE_TEXT:
        return new TextFilter(column);
      case COLUMN_TYPE_RANGE:
        return new RangeFilter(column);
      case COLUMN_TYPE_SELECT:
        return new SelectFilter(column);
      case COLUMN_TYPE_CHECKBOX:
        return new CheckboxFilter(column);
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



  function CheckboxFilter() {
    CheckboxFilter.super.apply(this, arguments);

    // this.hasCondition = function () {
    //   return Boolean(this.condition[0]);
    // };
    this.getFilterElement = function () {
      var input = Utils.createDomElem(
        'input',
        this.cssClass,
        {
          type: 'checkbox',
        }),
        label = Utils.createDomElem('label');

      label.appendChild(input);
      return label;
    };
  }

  Utils.inherit(CheckboxFilter, Filter);
  CheckboxFilter.prototype.comparator = Comparators.existComparator;
  
  
  
  
  SmartTable.Filter = Filter;
})(SmartTable || {});
