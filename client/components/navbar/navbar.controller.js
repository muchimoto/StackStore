'use strict';

angular.module('stackStoreApp')
    .controller('NavbarCtrl', function($scope, $location, Auth, Store,Cart,$stateParams) {

        $scope.menu = [{
            'title': 'Home',
            'link': '/'
        }];

       $scope.toggleNav = function (){
        	angular.element('#container').toggleClass('sidebar-closed');
        }
        $scope.toggleMsgDropdown = function (){
        	angular.element('#header_inbox_bar').toggleClass('open');
        }
        $scope.redirectToCart = function (){
        	console.log('hey')
        	$location.path('/cart');
        }

        Store.query({}).$promise
            .then(function(stores) {

                for (var i = 0; i < stores.length; i++) {
                    var storeName = stores[i].name;
                    var navItem = { title: stores[i].name, link: '/store/'+ stores[i].name};

                    $scope.menu.push(navItem);
                }
            });

        $scope.isCollapsed = true;
        $scope.isLoggedIn = Auth.isLoggedIn;
        $scope.isAdmin = Auth.isAdmin;
        $scope.getCurrentUser = Auth.getCurrentUser;
        Cart.get(function(err, data) {
        	Cart.formatCartObj(data.cart);
        	$scope.cart_nav = data.cart;
        });

        $scope.logout = function() {
            Auth.logout();
            $location.path('/login');
        };

        $scope.isActive = function(param) {
        		var name = param.split('/')[1] === 'store' ? param.split('/')[2] : '';
            return $stateParams.name == name;
        };
    });
