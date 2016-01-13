(function () {
  'use strict';

  var
    smartTable,
    columns = [
      {
        type: 'index',
        title: '#',
        width: 75
      },
      {
        title: 'Username',
        property: 'user.username',
        filter: {
          type: 'text'
        }
      },
      {
        title: 'Email',
        property: 'user.email',
        width: 230,
        filter: {
          type: 'text'
        }
      },
      {
        title: 'First Name',
        property: 'user.name.first',
        filter: {
          type: 'text'
        }
      },
      {
        title: 'LastName',
        property: 'user.name.last',
        filter: {
          type: 'text'
        }
      },
      {
        title: 'Gender',
        property: 'user.gender',
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
        },
        width: 120
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
