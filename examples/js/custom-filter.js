(function () {
  'use strict';

  var
    Users = window.Users,
    smartTable,
    columns = [
    {
      title: 'Id',
      property: 'id'
    },
    {
      title: 'First Name',
      property: 'first_name'
    },
    {
      title: 'LastName',
      property: 'last_name'
    },
    {
      title: 'Email',
      property: 'email',
      width: 240
    },
    {
      title: 'Gender',
      property: 'gender',
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
    },
    {
      title: 'Registration Date',
      property: 'registration_date',
      type: 'range',
      formatter: displayDate,
      filter: {
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
