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
      property: 'email'
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
    }
  ];

  smartTable = new SmartTable({
    element: '.container',
    columns: columns,
    actions: {
      getData: getData
    }
  });
  
  function getData(callback) {
    callback(Users);
  }
})();
