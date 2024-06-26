var app = angular.module('bloggerApp');

// Authentication service and methods
app.service('authentication', ['$http', '$window', function($http, $window) {
    var saveToken = function(token) {
        $window.localStorage['blog-token'] = token;
    };

    // Get token from local storage
    var getToken = function(){
        return $window.localStorage ['blog-token'];
    };

    // Register user
    var register = function(user){
        console.log('Registering User ' + user.email + ' ' + user.password);
        return $http.post('/api/register', user).then(function(response){
            saveToken(response.data.token);
        });
    }

    // Login user
    var login = function(user){
        console.log('Logging In User ' + user.email + ' ' + user.password);
        return $http.post('/api/login', user).then(function(response){
            saveToken(response.data.token);
        });
    };

    // Logout user
    var logout = function(){
        $window.localStorage.removeItem('blog-token');
    };

var isLoggedIn = function() {
    var token = getToken();
    if(token) {
        try {
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch (e) {
            console.error("Error decoding token: ", e);
            return false;
        }
    } else {
        return false;
    }
};


    // Get current user
    var currentUser = function(){
        if(isLoggedIn()){
            var token = getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return {
                email : payload.email,
                name : payload.name
            };
        }
    };

    return {
        saveToken : saveToken,
        getToken : getToken,
        register : register,
        login : login,
        logout : logout,
        isLoggedIn : isLoggedIn,
        currentUser : currentUser
    };
}]);

// Login Controller
app.controller('LoginController', ['$http','$location', 'authentication', 
    function LoginController($http, $location, authentication){
        var vm = this;
        vm.title = 'Login to Blogger';

        vm.credentials = {
            email : "",
            password : ""
        };

        vm.returnPage = $location.search().page || '/';

        // Submit form
        vm.onSubmit = function(){
            vm.formError = "";
            if(!vm.credentials.email || !vm.credentials.password){
                vm.formError = "All fields required, please try again";
                return false;
            } else {
                vm.doLogin();
            }
        };

        // Login user
        vm.doLogin = function(){
            vm.formError = "";
            authentication
                .login(vm.credentials)
                .then(function(){
                    $location.search('page', null);
                    $location.path(vm.returnPage);
                }, function(err){
                    vm.formError = err.data.message;
                });
        };
}]);

// Register Controller
app.controller('RegisterController', ['$location', 'authentication', 
    function RegisterController($location, authentication){
        var vm = this;
        vm.title = 'Register new Blogger account';

        vm.credentials = {
            name : "",
            email : "",
            password : ""
        };

        vm.returnPage = $location.search().page || '/';
        
        // Submit form
        vm.onRegister = function(){
            vm.formError = "";
            if(!vm.credentials.name || !vm.credentials.email || !vm.credentials.password){
                vm.formError = "All fields required, please try again";
                return false;
            } else {
                vm.doRegister();
            }
        };

        // Register user
        vm.doRegister = function(){
            vm.formError = "";
            authentication
                .register(vm.credentials)
                .then(function(){
                    $location.search('page', null);
                    $location.path(vm.returnPage);
                }, function(err){
                    vm.formError = "Error registering user, please try again with a different email address.";
                });
        };
}]);
