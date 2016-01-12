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