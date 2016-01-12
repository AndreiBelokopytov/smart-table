(function () {
  'use strict';

  var
    smartTable,
    columns = [
      {
        title: '#',
        type: 'index',
        width: 75
      },
      {
        title: 'Username',
        property: 'user.username'
      },
      {
        title: 'Email',
        property: 'user.email',
        width: 230
      },
      {
        title: 'First Name',
        property: 'user.name.first'
      },
      {
        title: 'LastName',
        property: 'user.name.last'
      },
      {
        title: 'Gender',
        property: 'user.gender',
        type: 'select',
        width: 120,
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
      }];

  smartTable = new SmartTable({
    element: '.container',
    columns: columns,
    actions: {
      getData: getData
    }
  });
  
  $('#btn-refresh').on('click', function () {
    smartTable.refresh();
  });
  
  function getData(success) {
    var count = 20;
    $.get('https://randomuser.me/api',
      {
        results: count
      },
      function (data) {
        success(data.results);
      });
  }
})();
