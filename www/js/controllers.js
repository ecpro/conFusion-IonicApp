angular.module('conFusion.controllers', [])

    .controller('AppCtrl', function ($scope, $ionicModal, $timeout) {

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //$scope.$on('$ionicView.enter', function(e) {
        //});

        // Form data for the login modal
        $scope.loginData = {};

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope,
            animate: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
        });

        // Triggered in the login modal to close it
        $scope.closeLogin = function () {
            $scope.modal.hide();
        };

        // Open the login modal
        $scope.login = function () {
            $scope.modal.show();
        };

        // Perform the login action when the user submits the login form
        $scope.doLogin = function () {
            console.log('Doing login', $scope.loginData);

            // Simulate a login delay. Remove this and replace with your login
            // code if using a login system
            $timeout(function () {
                $scope.closeLogin();
            }, 1000);
        };

        // Form data for reserve table model

        $scope.reservation = {};
        $ionicModal.fromTemplateUrl('templates/reserve.html', {
            scope: $scope,
            animate: 'slide-in-up'
        }).then(function (modal) {
            $scope.reserveForm = modal;
        });

        // pops up the modal
        $scope.closeReserve = function () {
            $scope.reserveForm.hide();
        };

        // closes the modal
        $scope.reserve = function () {
            $scope.reserveForm.show();
        };


        // executed on tapping on submit button
        $scope.doReserve = function () {
            console.log("doing reservation", $scope.reservation);
            $timeout(function () {
                $scope.closeReserve();
            }, 1000);
        };


    })
    .controller('MenuController', ['$scope', 'menuFactory', 'favoriteFactory',
        'baseURL', '$ionicListDelegate',
        function ($scope, menuFactory, favoriteFactory, baseURL, $ionicListDelegate) {
            $scope.baseURL = baseURL;
            $scope.tab = 1;
            $scope.filtText = '';
            $scope.showDetails = false;
            $scope.showMenu = false;
            $scope.message = "Loading ...";
            $scope.shouldNotSwipe = true;
            $scope.shouldShowDelete = true;
            $scope.showShouldReorder = true;
            menuFactory.getDishes().query(
                function (response) {
                    $scope.dishes = response;
                    $scope.showMenu = true;
                },
                function (response) {
                    $scope.message = "Error: " + response.status + " " + response.statusText;
                });


            $scope.select = function (setTab) {
                $scope.tab = setTab;

                if (setTab === 2) {
                    $scope.filtText = "appetizer";
                } else if (setTab === 3) {
                    $scope.filtText = "mains";
                } else if (setTab === 4) {
                    $scope.filtText = "dessert";
                } else {
                    $scope.filtText = "";
                }
            };

            $scope.isSelected = function (checkTab) {
                return ($scope.tab === checkTab);
            };

            $scope.toggleDetails = function () {
                $scope.showDetails = !$scope.showDetails;
            };

            $scope.addFavorite = function (index) {
                console.log("index is " + index);
                favoriteFactory.addToFavorites(index);
                $ionicListDelegate.closeOptionButtons();
            }

            $scope.favorites = favoriteFactory.getFavorites();
            console.log($scope.favorites);

        }])

    .controller('ContactController', ['$scope', function ($scope) {

        $scope.feedback = {
            mychannel: "",
            firstName: "",
            lastName: "",
            agree: false,
            email: ""
        };

        var channels = [{
            value: "tel",
            label: "Tel."
        }, {
            value: "Email",
            label: "Email"
        }];

        $scope.channels = channels;
        $scope.invalidChannelSelection = false;

    }])

    .controller('FeedbackController', ['$scope', 'feedbackFactory', function ($scope, feedbackFactory) {

        $scope.sendFeedback = function () {

            console.log($scope.feedback);

            if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
                $scope.invalidChannelSelection = true;
                console.log('incorrect');
            } else {
                $scope.invalidChannelSelection = false;
                feedbackFactory.save($scope.feedback);
                $scope.feedback = {
                    mychannel: "",
                    firstName: "",
                    lastName: "",
                    agree: false,
                    email: ""
                };
                $scope.feedback.mychannel = "";
                $scope.feedbackForm.$setPristine();
                console.log($scope.feedback);
            }
        };
    }])

    .controller('DishDetailController', ['$scope', '$stateParams', 'menuFactory', 'baseURL', '$ionicPopover', 'favoriteFactory', '$ionicPopup', '$timeout', function ($scope, $stateParams, menuFactory, baseURL, $ionicPopover, favoriteFactory, $ionicPopup, $timeout) {
        $scope.baseURL = baseURL;
        $scope.dish = {};
        $scope.showDish = false;
        $scope.message = "Loading ...";

        $scope.dish = menuFactory.getDishes().get({
            id: parseInt($stateParams.id, 10)
        })
            .$promise.then(
            function (response) {
                $scope.dish = response;
                $scope.showDish = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
            );

        $ionicPopover.fromTemplateUrl('templates/dishdetailPopover.html', {
            scope: $scope
        }).then(function (popover) {
            $scope.popover = popover;
        });

        $scope.openPopover = function ($event) {
            $scope.popover.show($event);
        };

        $scope.closePopover = function () {
            $scope.popover.hide();
        }

        $scope.addFavorite = function (id) {
            $scope.closePopover();
            favoriteFactory.addToFavorites(id);
            console.log("added to favorites");

            var popup = $ionicPopup.show({
                title: 'Added to favaorites',
                template: '<ion-spinner class="spinner-energized" icon ="ripple"></ion-spinner>'
            });

            popup();

            $timeout(function () {
                popup.close();
            }, 1000);
        };



    }])

    .controller('DishCommentController', ['$scope', 'menuFactory', function ($scope, menuFactory) {

        $scope.mycomment = {
            rating: 5,
            comment: "",
            author: "",
            date: ""
        };

        $scope.submitComment = function () {

            $scope.mycomment.date = new Date().toISOString();
            console.log($scope.mycomment);

            $scope.dish.comments.push($scope.mycomment);
            menuFactory.getDishes().update({
                id: $scope.dish.id
            }, $scope.dish);

            $scope.commentForm.$setPristine();

            $scope.mycomment = {
                rating: 5,
                comment: "",
                author: "",
                date: ""
            };
        }
    }])

    // implement the IndexController and About Controller here

    .controller('IndexController', ['$scope', 'menuFactory', 'corporateFactory', 'baseURL', function ($scope, menuFactory, corporateFactory, baseURL) {
        $scope.baseURL = baseURL;
        $scope.leader = corporateFactory.get({
            id: 3
        });
        $scope.showDish = false;
        $scope.message = "Loading ...";
        $scope.dish = menuFactory.getDishes().get({
            id: 0
        })
            .$promise.then(
            function (response) {
                $scope.dish = response;
                $scope.showDish = true;
            },
            function (response) {
                $scope.message = "Error: " + response.status + " " + response.statusText;
            }
            );
        $scope.promotion = menuFactory.getPromotion().get({
            id: 0
        });

    }])

    .controller('AboutController', ['$scope', 'corporateFactory', 'baseURL', function ($scope, corporateFactory, baseURL) {
        $scope.baseURL = baseURL;
        $scope.leaders = corporateFactory.query();
        console.log($scope.leaders);


    }])

    .controller('FavoritesController', ['$scope', 'favoriteFactory', 'menuFactory', 'baseURL', '$ionicPopup', '$timeout', '$ionicLoading', function ($scope, favoriteFactory, menuFactory, baseURL, $ionicPopup, $timeout, $ionicLoading) {
        $scope.baseURL = baseURL;
        $scope.shouldShowDelete = false;

        $ionicLoading.show({
            template: '<ion-spinner class="spinner-energized" icon ="ripple"></ion-spinner> Loading...'
        });

        $scope.dishes = menuFactory.getDishes().query(
            function (response) {
                $scope.dishes = response;
                $timeout(function () {
                    $ionicLoading.hide();
                }, 3000);
            },
            function (response) {
                $scope.message = "Error" + response.status + " " + response.statusText;
                $timeout(function () {
                    $ionicLoading.hide();
                }, 3000);
            }
        );

        $scope.favorites = favoriteFactory.getFavorites();

        console.log($scope.dishes, $scope.favorites);

        $scope.toggleDelete = function () {
            $scope.shouldShowDelete = !$scope.shouldShowDelete;
            console.log($scope.shouldShowDelete);
        };

        $scope.deleteFavorite = function (id) {

            var confirmPopup = $ionicPopup.confirm({
                title: 'Confirm Delete',
                template: 'Are you sure you want to delete this item?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    console.log("OK to delete");
                    favoriteFactory.deleteFromFavorites(id);
                }
                else {
                    console.log("You are not sure");
                }
            })


        };

    }])

    .filter('favoriteFilter', function () {
        return function (dishes, favorites) {
            var output = [];
            for (var i = 0; i < favorites.length; i++) {
                for (var j = 0; j < dishes.length; j++) {
                    if (favorites[i].id === dishes[j].id) {
                        output.push(dishes[j]);
                    }
                }
            }
            return output;
        }
    })

    ;