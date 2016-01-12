;(function () {
var SmartTable = {};
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

(function (SmartTable) {
  'use strict';

  var CSS = {
    COLUMN_TYPE_TEXT: 'text',
    COLUMN_TYPE_RANGE: 'range',
    COLUMN_TYPE_SELECT: 'select',

    FILTER: 'filter',
    FILTER_RANGE: 'range-filter',
    FILTER_RANGE_MIN: 'range-min',
    FILTER_RANGE_MAX: 'range-max',
    
    TABLE: 'smart-table',
    HEADERS_BAR: 'smart-table-headers-bar',
    FILTERS_BAR: 'smart-table-filters-bar',

    NO_DATA: 'no-data',

    COLUMN_SORTED: 'sorted',
    COLUMN_SORT_ASC: 'sort-asc',
    COLUMN_SORT_DESC: 'sort-desc'
  };

  SmartTable.CSS = CSS;
})(SmartTable || {});
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

(function (SmartTable) {
  'use strict';
  
  var
    Utils = SmartTable.Utils,
    CSS = SmartTable.CSS,
    Filter = SmartTable.Filter;




  function createTableContent(columns, data) {
    var
      rowElem,
      colElem,
      colVal,
      columnAttributes = {},
      visibleColumns,
      tableRows = document.createDocumentFragment();

    if (Array.isArray(data)) {
      if (data.length) {
        data.forEach(function (item, rowIndex) {
          rowElem = Utils.createDomElem('tr', '', {
            'grid-rowindex': rowIndex
          });

          columns.forEach(function (column, colIndex) {
            if (!column.hidden) {
              columnAttributes['data-colindex'] = colIndex + 1;
              colElem = Utils.createDomElem('td', '', columnAttributes);

              if (column.isIndex) {
                colElem.innerText = rowIndex + 1;
              } else {
                colVal = item[column.property];

                if (colVal) {
                  if (typeof column.formatter === 'function') {
                    colElem.innerHTML = column.formatter(colVal);
                  } else {
                    colElem.innerText = colVal;
                  }
                }
              }

              rowElem.appendChild(colElem);
            }
          });

          tableRows.appendChild(rowElem);
        });
      } else {
        visibleColumns = columns.filter(function (item) {
          return !item.hidden;
        });
        rowElem = Utils.createDomElem('tr', CSS.NO_DATA, {
          'grid-rowindex': 1
        });
        colElem = Utils.createDomElem('td', CSS.NO_DATA, {
          colspan: visibleColumns.length
        }, 'No data');
        rowElem.appendChild(colElem);
        tableRows.appendChild(rowElem);
      }
    }

    return tableRows;
  }



  function SmartTableConstructor(options) {
    var self = this;
    
    this._tableElem = null;
    this._theadElem = null;
    this._tbodyElem = null;
    this._headersBar = null;
    this._filtersBar = null;
      
    this._cssClass = CSS.TABLE;

    this._dataset = [];
    this._filtered = [];
    this._filters = {};
    this._columns = options.columns || [];

    if (options.cssClass) {
      this._cssClass += options.tableCssClass;
    }

    if (typeof options.element === 'string') {
      this.el = document.querySelector(options.element);
    } else {
      this.el = options.element;
    }

    this._columns.forEach(function (column) {
      if (column.type === 'index') {
        column.isIndex = true;
        column.noFilter = true;
        column.noSort = true;
      }
      if (!column.noFilter) {
        self._filters[column.property] =
          Filter.createFilter(column);
      }
    });

    this.getTableData = function () {};

    if (options.actions) {
      this.getTableData = options.actions.getData;
    }

    this._getColumnValue = function (rowData, column) {
      var
        val = rowData,
        propertyPath;

      if (typeof column.property === 'string') {
        propertyPath = column.property.split('.');
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
    };

    this._render = function () {
      var
        el,
        tableContent = createTableContent(this._columns, this._filtered),
        contentLen = this._tbodyElem.children.length;

      while(contentLen--) {
        el = this._tbodyElem.children[contentLen];
        if (el.tagName === 'TR') {
          this._tbodyElem.removeChild(el);
        }
      }
      this._setColumns(tableContent);
      this._tbodyElem.appendChild(tableContent);
    };

    this._clearFilters = function () {
      var filterFields = this._theadElem.querySelectorAll('input, select');
      Array.prototype.forEach.call(filterFields, function (field) {
        field.value = '';
      });
    };

    this._clearSort = function () {
      var colHeaders = this._theadElem.querySelectorAll('th');
      Array.prototype.forEach.call(colHeaders, function (th) {
        th.classList.remove(CSS.COLUMN_SORT_ASC);
        th.classList.remove(CSS.COLUMN_SORT_DESC);
      });
    };

    this._setColumns = function () {
      var
        self = this,
        colIndex,
        display,
        setColumnVisibility = function (displayStyle, colIndex) {
          var
            colElements;

          colElements = self._tableElem.querySelectorAll(
            'col[data-colindex="' + colIndex + '"], ' +
            'th[data-colindex="' + colIndex + '"]');

          [].forEach.call(colElements, function (elem) {
            elem.style.display = displayStyle;
          });
        };

        this._columns.forEach(function (column, index) {
          colIndex = index + 1;
          if (column.hidden) {
            display = 'none';
          } else {
            display = '';
          }
          setColumnVisibility(display, colIndex);
        }, this);
    };

    (function initGrid() {
      var
        th,
        col,
        colWidth,
        colIndex,
        filter,
        columnClass = '',
        columnAttributes = {},
        sortDataHandler = function (event) {
          var
            colIndex,
            column,
            sortType,
            source = event.target;

          if (source.tagName === 'TH' &&
            source.classList.contains(CSS.COLUMN_SORTED)) {

            colIndex = source.cellIndex;
            column = self._columns[colIndex];
            if (source.classList.contains(CSS.COLUMN_SORT_ASC)) {
              sortType = CSS.COLUMN_SORT_DESC;
              self.sort(column, sortType);
            } else {
              sortType = CSS.COLUMN_SORT_ASC;
              self.sort(column, sortType);
            }

            [].forEach.call(self._headersBar.children, function (node) {
              if (node.tagName === 'TH') {
                node.classList.remove(CSS.COLUMN_SORT_ASC);
                node.classList.remove(CSS.COLUMN_SORT_DESC);
              }
            });

            source.classList.add(sortType);
          }
        },
        filterChangedHandler = function (event) {
          var
            td,
            column,
            filter,
            source = event.target;

          if (source.tagName === 'INPUT' || source.tagName === 'SELECT') {
            td = source.closest('th');
            column = self._columns[td.cellIndex];
            filter = self._filters[column.property];

            if (!source.classList.contains(CSS.FILTER_RANGE)) {
              filter.setCondition(source.value);
            } else {
              if (source.classList.contains(CSS.FILTER_RANGE_MIN)) {
                filter.setCondition(source.value, 0);
              } else if (source.classList.contains(CSS.FILTER_RANGE_MAX)) {
                filter.setCondition(source.value, 1);
              }
            }
            self.filter();
          }
        };

      this._tableElem = Utils.createDomElem('table', this._cssClass, {
        cols: this._columns.length
      });
      this._theadElem = Utils.createDomElem('thead');
      this._tbodyElem = Utils.createDomElem('tbody');
      this._headersBar = Utils.createDomElem('tr', CSS.HEADERS_BAR);
      this._filtersBar = Utils.createDomElem('tr', CSS.FILTERS_BAR);

      this._columns.forEach(function (column, index) {
        colIndex = index + 1;

        if (!column.noSort) {
          columnClass = CSS.COLUMN_SORTED;
        }

        columnAttributes['data-colindex'] = colIndex;

        th = Utils.createDomElem('th', columnClass, columnAttributes, column.title);
        self._headersBar.appendChild(th);

        th = Utils.createDomElem('th', '', columnAttributes);
        if (self._filters[column.property]) {
          filter = self._filters[column.property];
          th.appendChild(filter.getFilterElement());
        }
        self._filtersBar.appendChild(th);

        col = Utils.createDomElem('col', '', columnAttributes);
        if (column.width) {
          colWidth = parseInt(column.width, 10);
          if (isNaN(colWidth)) {
            throw {
              message: 'Column width should be a number'
            };
          }
          colWidth += 'px';
          col.style.width = colWidth;
        }
        self._tableElem.appendChild(col);
      });

      ///TODO: throttle events
      this._filtersBar.addEventListener('input', filterChangedHandler);
      this._filtersBar.addEventListener('change', filterChangedHandler);
      this._headersBar.addEventListener('click', sortDataHandler);

      this._theadElem.appendChild(this._headersBar);
      this._theadElem.appendChild(this._filtersBar);
      this._tableElem.appendChild(this._theadElem);
      this._tableElem.appendChild(this._tbodyElem);

      this.el.appendChild(this._tableElem);

      this.refresh();
    }).apply(this);
  }

  //public api
  SmartTableConstructor.prototype = {
    refresh: function () {
      var self = this;

      this._dataset = [];
      this._filtered = [];
      this._clearFilters();
      this._clearSort();

      this.getTableData(function (data) {
        var
          colVal,
          mappedItem;

        data.forEach(function (item) {
          mappedItem = {};
          self._columns.forEach(function (column) {
            if (column.property) {
              colVal = self._getColumnValue(item, column);
              mappedItem[column.property] = colVal;
            }
          });
          self._dataset.push(mappedItem);
        });
        self._filtered = self._dataset;
        self._render();
      });
    },
    
    filter: function () {
      var
        self = this,
        checked,
        prop,
        colValue,
        filter;

      this._filtered = [];

      this._dataset.forEach(function (item) {
        checked = true;
        for (prop in item) {
          if (item.hasOwnProperty(prop)) {
            filter = self._filters[prop];
            if (filter) {
              colValue = item[prop];
              checked = filter.check(colValue);
              if (!checked) {
                break;
              }
            }
          }
        }
        if (checked) {
          self._filtered.push(item);
        }
      });

      this._render();
    },

    sort: function (column, order) {
      var
        self = this,
        sortResult = 1;

      if (!order) {
        order = CSS.COLUMN_SORT_ASC;
      }

      if (order === CSS.COLUMN_SORT_DESC) {
        sortResult = -1;
      }

      self._filtered.sort(function (a, b) {
        if (a[column.property] >= b[column.property]) {
          return sortResult;
        }
        if (a[column.property] < b[column.property]) {
          return -1 * sortResult;
        }
      });

      self._render();
    },
    
    toggleColumns: function (colIndexes) {
      var
        self = this,
        column;

      if (!Array.isArray(colIndexes)) {
        colIndexes = [colIndexes];
      }

      colIndexes.forEach(function (colIndex) {
        column = self._columns[colIndex - 1];
        if (column) {
          if (typeof column.hidden === 'undefined' ||
            column.hidden === false) {
            column.hidden = true;
          } else {
            column.hidden = false;
          }
        }
      });

      this._render();
    },
    
    toggleFilters: function () {
      if (this.filtersBar.style.display !== 'none') {
        this.filtersBar.style.display = 'none';
      } else {
        this.filtersBar.style.display = '';
      }
    }
  };




  window.SmartTable = SmartTableConstructor;
})(SmartTable || {});

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
}})();