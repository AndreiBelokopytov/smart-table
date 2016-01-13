(function () {
  'use strict';

  var
    Users = window.Users,
    smartTable,
    columns = [
    {
      title: 'Id',
      property: 'id',
      width: 120,
      filter: {
        type: 'text'
      }
    },
    {
      title: 'First Name',
      property: 'first_name',
      filter: {
        type: 'text'
      }
    },
    {
      title: 'LastName',
      property: 'last_name',
      filter: {
        type: 'text'
      }
    },
    {
      title: 'Email',
      property: 'email',
      width: 240,
      filter: {
        type: 'text'
      }
    },
    {
      title: 'Gender',
      property: 'gender',
      filter: {
        type: 'select',
        selectOptions: [
          {
            text: 'Male',
            value: 'Male'
          },
          {
            text: 'Female',
            value: 'Female'
          }
        ]
      }
    },
    {
      title: 'Registration Date',
      property: 'registration_date',
      formatter: displayDate,
      filter: {
        type: 'range',
        cssClass: 'datepicker',
        valueParser: parseDate
      }
    }
  ];

  smartTable = new SmartTable({
    element: '.container',
    columns: columns,
    actions: {
      getData: getData
    }
  });
  
  function parseDate(val) {
    if (val) {
      return +moment(val, 'DD.MM.YYYY');
    }
    return '';
  }
  
  $(".datepicker").datepicker({
    dateFormat: 'dd.mm.yy',
    onSelect: function () {
      //hack for jQuery UI datepicker widget
      var event = new Event('input', {
        bubbles: true
      });
      this.dispatchEvent(event);
    }
  });
  
  function getData(callback) {
    callback(Users);
  }
  
  function displayDate(val) {
    var d = new Date(val);
    if (d) {
      return moment(d).format('DD.MM.YYYY');
    }
    return '';
  }
})();
