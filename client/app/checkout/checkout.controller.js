'use strict';

angular.module('stackStoreApp')
  .controller('CheckoutCtrl', function ($scope, Cart, User, Auth, $http, $location) {

    var originalTotal;
    $scope.paid = false;
    if(Auth.isLoggedIn()) {
      Cart.get(function(err, data){
        $scope.cart = data.cart;
        if(data.cart.length == 0) $scope.cartEmpty = true;
        $scope.total = 0;
        $scope.cart.forEach(function(item){
          $scope.total += item.price;
        })
        console.log('Logged in! Cart: ', $scope.cart, $scope.total)
        originalTotal = $scope.total;
      });
    } else {
      console.log('Not logged in.')
      $location.path('/');
    }

    $scope.applyPromo = function() {
      $scope.total = originalTotal;
      console.log('$scope.promo', $scope.promo, $scope.total)
      if($scope.promo) {
        $http.get("/api/promos/")
        .then(function(response){
          var promoList = response.data;
          var discount = 1;
          promoList.forEach(function(promo){
            if(promo.code == $scope.promo) {
              discount = promo.discount / 100;
              $scope.total = $scope.total - ($scope.total * discount);
            }
          })
        })
        .catch(function(err){
          console.log('err in api promos get', err);
        })
      } else {
        window.alert('No promo code entered.')
      }
    }

    $scope.onCheckout = function () {
      //this function will also run when pay btn is click, use it if needed
    }
    $scope.stripeCallback = function (code, result) {
      if (result.error) {
        window.alert("Error: please enter valid credit card info!")
      } else {
        $http.post("/api/stripes", {
          token: result.id,
          name: Auth.getCurrentUser().name,
          amount: $scope.total,
          userId: Auth.getCurrentUser()._id
        })
        .then(function(response){
          var stripeCharge = response.data;
          //post to server-side order controller and make the order for the buyer and all the store owners
          return $http.post("/api/orders", { stripeToken: result.id, chargeId: stripeCharge.id })
        })
        .then(function(response) {
          var order = response.data;
          $scope.paid = true;
        })
        .catch(function(err) {
          console.error('oh snap:', err);
        });

      }
    };

  });
