angular.module('triageApp', []).
  controller('MainController', ['$scope', '$http', function ($scope, $http) {
    $http.get('api').success(function (data) {
      $scope.data = data;
    });
  }]);
