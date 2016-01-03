(function (root) {
  'use strict';
  var
    TABLE_CSS_CLASS = 'smart-table',
    HEADERS_BAR_CSS = 'smart-table-headers-bar',
    FILTERS_BAR_CSS = 'smart-table-filters-bar',

    FILTER_CSS_CLASS = 'filter',
    FILTER_RANGE_CSS_CLASS = 'range-filter',
    FILTER_RANGE_MIN_CSS_CLASS = 'range-min',
    FILTER_RANGE_MAX_CSS_CLASS = 'range-max',

    COLUMN_TYPE_TEXT = 'text',
    COLUMN_TYPE_RANGE = 'range',
    COLUMN_TYPE_SELECT = 'select',

    COLUMN_SORTED = 'sorted',
    COLUMN_SORT_ASC = 'sort-asc',
    COLUMN_SORT_DESC = 'sort-desc';


  ///TODO: add closest polyfill

  function Filter(column) {
    this.cssClass = FILTER_CSS_CLASS;
    if (column.filter) {
      this.cssClass += column.filter.cssClass ?
        ' ' + column.filter.cssClass : '';
      this.parser = column.filter.valueParser;
    }
  }

  Filter.prototype = {
    check: function (val) {
      if (isNullOrUndef(val)) {
        return false;
      }
      return this.comparator(val, this.condition);
    },
    setCondition: function (val, index) {
      if (this.parser) {
        val = this.parser(val);
      }
      if (isNullOrUndef(index)) {
        this.condition = val;
      } else {
        if (!Array.isArray(this.condition)) {
          this.condition = [];
        }
        this.condition[index] = val;
      }
    }
  };

  Filter.createFilter = function (column) {
    switch(column.type) {
      case COLUMN_TYPE_TEXT:
        return new TextFilter(column);
      case COLUMN_TYPE_RANGE:
        return new RangeFilter(column);
      case COLUMN_TYPE_SELECT:
        return new SelectFilter(column);
      default:
        return new TextFilter(column);
    }
  };




  function TextFilter(column) { 
    TextFilter.super.apply(this, arguments);

    this.getFilterElement = function () {
      return createDomElem(
        'input',
        this.cssClass,
        {
          type: 'text',
          placeholder: column.title
        });
    };
  }

  inherit(TextFilter, Filter);

  TextFilter.prototype.comparator = containsComparator;




  function RangeFilter(column) {
    RangeFilter.super.apply(this, arguments);

    this.cssClass += ' ' + FILTER_RANGE_CSS_CLASS;
    this.condition = [];

    this.getFilterElement = function () {
      var
        filterWrap = document.createDocumentFragment(),
        inputMin = createDomElem(
          'input',
          this.cssClass += ' ' + FILTER_RANGE_MIN_CSS_CLASS,
          {
            type: 'text',
            placeholder: column.title
          }),
        inputMax = createDomElem(
          'input',
          this.cssClass += ' ' + FILTER_RANGE_MAX_CSS_CLASS,
          {
            type: 'text',
            placeholder: column.title
          });

       filterWrap.appendChild(inputMin);
       filterWrap.appendChild(inputMax);

      return filterWrap;
    };
  }

  inherit(RangeFilter, Filter);

  RangeFilter.prototype.comparator = rangeComparator;




  function SelectFilter(column) {
    SelectFilter.super.apply(this, arguments);

    this.getFilterElement = function () {
      var
        selectElem = createDomElem('select', this.cssClass),
        optionElem,
        optionData,
        index = 0,
        selectOptionsLen = column.selectOptions.length;

      optionElem = createDomElem('option', '', {
        value: ''
      });
      selectElem.appendChild(optionElem);

      for (; index < selectOptionsLen; index++) {
        optionData = column.selectOptions[index];
        optionElem = createDomElem('option', this.cssClass, 
          {
            value: optionData.value
          }, optionData.text);
        selectElem.appendChild(optionElem);
      }
      
      return selectElem;
    };
  }

  inherit(SelectFilter, Filter);

  SelectFilter.prototype.comparator = equalComparator;




  function SmartTable(options) {
    var
      self = this,
      cssClass = TABLE_CSS_CLASS;

    this._dataset = [];
    this._filtered = [];
    this._columnsFilters = {};

    if (options.cssClass) {
      cssClass += options.tableCssClass;
    }

    if (typeof options.element === 'string') {
      this.el = document.querySelector(options.element);
    } else {
      this.el = options.element;
    }

    this.columns = options.columns || [];

    this.columns.forEach(function (column) {
      if (column.type === 'index') {
        column.isIndex = true;
        column.noFilter = true;
        column.noSort = true;
      }
      if (!column.noFilter) {
        self._columnsFilters[column.property] =
          Filter.createFilter(column);
      }
    });

    this.getTableData = function () {};

    if (options.actions) {
      this.getTableData = options.actions.getData;
    }

    this._render = function () {
      var
        el,
        tableContent = createTableContent(this.columns, this._filtered),
        contentLen = this.tbodyElem.children.length;

      while(contentLen--) {
        el = this.tbodyElem.children[contentLen];
        if (el.tagName === 'TR') {
          this.tbodyElem.removeChild(el);
        }
      }
      this._setColumns(tableContent);
      this.tbodyElem.appendChild(tableContent);
    };
    
    this._setColumns = function (elem) {
      var
        colIndex,
        display,
        setColumnVisibility = function (displayStyle, colIndex) {
          var 
            colElements;
            
          colElements = elem.querySelectorAll(
            'col[data-colindex="' + colIndex + '"], ' +
            'th[data-colindex="' + colIndex + '"], ' + 
            'td[data-colindex="' + colIndex + '"]');
            
          [].forEach.call(colElements, function (elem) {
            elem.style.display = displayStyle;
          });
        };
        
        this.columns.forEach(function (column, index) {
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
            source.classList.contains(COLUMN_SORTED)) {

            colIndex = source.cellIndex;
            column = self.columns[colIndex];
            if (source.classList.contains(COLUMN_SORT_ASC)) {
              sortType = COLUMN_SORT_DESC;
              self.sort(column, sortType);
            } else {
              sortType = COLUMN_SORT_ASC;
              self.sort(column, sortType);
            }

            [].forEach.call(self.headersBar.children, function (node) {
              if (node.tagName === 'TH') {
                node.classList.remove(COLUMN_SORT_ASC);
                node.classList.remove(COLUMN_SORT_DESC);
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
            column = self.columns[td.cellIndex];
            filter = self._columnsFilters[column.property];

            if (!source.classList.contains(FILTER_RANGE_CSS_CLASS)) {
              filter.setCondition(source.value);
            } else {
              if (source.classList.contains(FILTER_RANGE_MIN_CSS_CLASS)) {
                filter.setCondition(source.value, 0);
              } else if (source.classList.contains(FILTER_RANGE_MAX_CSS_CLASS)) {
                filter.setCondition(source.value, 1);
              }
            }
            self.filter();
          }
        };

      this.tableElem = createDomElem('table', cssClass, {
        cols: this.columns.length
      });
      this.theadElem = createDomElem('thead');
      this.tbodyElem = createDomElem('tbody');
      this.headersBar = createDomElem('tr', HEADERS_BAR_CSS);
      this.filtersBar = createDomElem('tr', FILTERS_BAR_CSS);

      this.columns.forEach(function (column, index) {
        colIndex = index + 1;
        
        if (!column.noSort) {
          columnClass = COLUMN_SORTED;
        }
        
        columnAttributes['data-colindex'] = colIndex;

        th = createDomElem('th', columnClass, columnAttributes, column.title);
        self.headersBar.appendChild(th);

        th = createDomElem('th', '', columnAttributes);
        if (self._columnsFilters[column.property]) {
          filter = self._columnsFilters[column.property];
          th.appendChild(filter.getFilterElement());
        }
        self.filtersBar.appendChild(th);

        col = createDomElem('col', '', columnAttributes);
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
        self.tableElem.appendChild(col);
      });

      ///TODO: throttle events
      this.filtersBar.addEventListener('input', filterChangedHandler);
      this.filtersBar.addEventListener('change', filterChangedHandler);
      this.headersBar.addEventListener('click', sortDataHandler);

      this.theadElem.appendChild(this.headersBar);
      this.theadElem.appendChild(this.filtersBar);
      this.tableElem.appendChild(this.theadElem);
      this.tableElem.appendChild(this.tbodyElem);

      this.el.appendChild(this.tableElem);

      this.refresh();
    }).apply(this);
  }

  SmartTable.prototype = {
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
            filter = self._columnsFilters[prop];
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
    refresh: function () {
      var self = this,
        getColProperty = function (rowData, column) {
          var
            val = rowData,
            propertyPath;

          if (typeof column.property === 'string') {
            propertyPath = column.property.split('.');
          } else {
            return null;
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

      this.getTableData(function (data) {
        var
          colVal,
          mappedItem;

        data.forEach(function (item) {
          mappedItem = {};
          self.columns.forEach(function (column) {
            if (column.property) {
              colVal = getColProperty(item, column);
              mappedItem[column.property] = colVal;
            }
          });
          self._dataset.push(mappedItem);
        });
        self._filtered = self._dataset;
        self._render();
      });
    },
    sort: function (column, order) {
      var
        self = this,
        sortResult = 1;

      if (!order) {
        order = COLUMN_SORT_ASC;
      }

      if (order === COLUMN_SORT_DESC) {
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
        column = self.columns[colIndex - 1];
        if (column) {
          if (typeof column.hidden === 'undefined' || 
            column.hidden === false) {
            column.hidden = true;
          } else {
            column.hidden = false;
          }
        }
      });
      
      this._setColumns(this.tableElem);
    },
    toggleFilters: function () {
      if (this.filtersBar.style.display !== 'none') {
        this.filtersBar.style.display = 'none';
      } else {
        this.filtersBar.style.display = '';
      }
    }
  };




  function inherit(Child, Parent) {
    var F = function () {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Parent;
    Child.super = Parent;
    return Child;
  }

  function isNullOrUndef() {
    for (var i = 0; i < arguments.length; i++) {
      if (arguments[i] === null || arguments[i] === undefined) {
        return true;
      }
    }
    return false;
  }

  function containsComparator(val, condition) {
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

  function createTableContent(columns, data) {
    var
      rowElem,
      colElem,
      colVal,
      colIndex,
      columnAttributes = {},
      tableRows = document.createDocumentFragment();

    if (Array.isArray(data)) {
      data.forEach(function (item, index) {
        rowElem = createDomElem('tr', '', {
          'grid-rowindex': index
        });

        columns.forEach(function (column, index) {
          colIndex = index + 1;
          columnAttributes['data-colindex'] = colIndex;
          colElem = createDomElem('td', '', columnAttributes);
          
          if (column.isIndex) {
            colElem.innerText = index + 1;
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
        });

        tableRows.appendChild(rowElem);
      });
    }

    return tableRows;
  }




  root.SmartTable = SmartTable;
})(this);
