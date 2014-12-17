angular.module('tabroom', ['ui.router'])
.config(
	[
		'$stateProvider',
		'$urlRouterProvider',
		function ($stateProvider, $urlRouterProvider) {
			$stateProvider
			.state(
				'home',
				{
					url: '/home',
					templateUrl: '/home.html',
					controller: 'MainCtrl',
					resolve: {
						postPromise: [
							'tournaments',
							function (tournaments) {
								return tournaments.getAll();
							}
						]
					}
				}
			);

			$urlRouterProvider.otherwise('home');
		}
	]
)
.factory(
	'tournaments',
	[
		'$http',
		function ($http) {
			var o = {
				tournaments: []
			};

			o.getAll = function () {
				return $http.get('/tournaments').success(
					function (data) {
						angular.copy(data, o);
					}
				);
			}

			return o;
		}
	]
)
.controller(
	'MainCtrl',
	[
		'$scope',
		'tournaments',
		function ($scope, tournaments) {
			$scope.tournaments = tournaments.tournaments;
		}
	]
);