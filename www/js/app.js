// Main application logic lives here
// by @sauliuz

// These files will be bundled with below JS by Grunt
// to produce bundle.js - for usage in app

// constants used across the funcionality
var userCacheTTL = '';
var apiKey = '';


// Framework7 stuff
// Init App
var myApp = new Framework7({
    modalTitle: 'SEMAT App',
    // Enable Material theme
    material: true,
    cache: false,
    template7Pages: true
});

// Expose Internal DOM library
var $$ = Dom7;

// Add main view
var mainView = myApp.addView('.view-main');


// If user is loged in, he goes directly to the projects page
if (localStorage.w7Data && localStorage.w7Data !== ''){
    var user = JSON.parse(localStorage.w7Data);

    // move to projects view
    mainView.router.load({
        url: 'projects.html',
        context: {
            firstname: ''+user.firstname,
            lastname: ''+user.lastname,
            email: ''+user.email
        }
    });
}

// TODO: Declare globaly accessible funcions like logout


/// Pages ///

// Index page
myApp.onPageInit('index', function (page) {

    console.log('index page init');
    
    if (!navigator.onLine) {
        myApp.alert('It appears your network connection is down. You need internet connection to use SEMAT App!');
    }
});


// Login page
myApp.onPageInit('login', function (page) {

    console.log('login page init');

    if (!navigator.onLine) {
        myApp.alert('It appears your network connection is down. You need internet connection to use SEMAT App!');
    }

    // submit login
    $$('#submmit-login').on('click', function () {
        

        var username = $$('#login-username').val();
        var password = $$('#login-password').val();

        
        // simple validation for empty fields
        if (!username || !password){
            
            myApp.alert('Please fill in all Login form fields');
            return;
        }

        // build the http request
        var requestUrl = 'https://psdev-yt5t7w6ayhgkm527grvejshb-evals-dev.mbaas1.tom.redhatmobile.com/users/login';
        var postdata = {};
        postdata.username = username;
        postdata.password = password;


        // show activity indicator
        myApp.showIndicator();

        // Ajax for making http communication
        // HTTP communication responses are handled
        // based on HTTP response codes
        // documentation: http://framework7.io/docs/dom.html

        $$.ajax({
            url: requestUrl,
            //headers: {"X-Semat-Id":"somestuff","X-Semat-Message":"morestuff"},
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(postdata),

            success: function(data, status, xhr){
            
                // we have received response and can hide activity indicator
                myApp.hideIndicator();

                console.log('data: '+data);
        
                // better safe then sorry
                try {
                    
                    var responseJSON = JSON.parse(data);

                    
                    if (!responseJSON.firstname || !responseJSON.token) { 
                        myApp.alert('Login was unsuccessful, we are experiencing internal errors, contact SEMAT team');
                        return
                    }

                } catch (e) {
                    myApp.alert('Login was unsuccessful, we are experiencing internal errors, contact SEMAT team');
                    return
                }

                // storing user data locally
                var userData = {};
                userData.firstname = responseJSON.firstname;
                userData.lastname = responseJSON.lastname;
                userData.email = responseJSON.email;
                userData.token = responseJSON.token;
                userData.timestamp = new Date().getTime();
                localStorage.w7Data = JSON.stringify(userData);
                

                // move to projects view
                mainView.router.load({
                    url: 'projects.html',
                    context: {
                        firstname: ''+responseJSON.firstname,
                        lastname: ''+responseJSON.lastname,
                        email: ''+responseJSON.email,
                        newLogin: 'true'
                    }
                });            

            }, 

            error: function(xhr, status ){
            
                // we have received response and can hide activity indicator
                myApp.hideIndicator();

                myApp.alert('Login was unsuccessful, please verify your credentials and try again');

                $$('#login-username').val('');
                $$('#login-password').val('');    
            
            }

        });
    });

});

// Login page
myApp.onPageInit('register', function (page) {

    console.log('register page init');

    if (!navigator.onLine) {
        myApp.alert('It appears your network connection is down. You need internet connection to use SEMAT App!');
    }

    // submit login
    $$('#submmit-register').on('click', function () {
        

        var firstname = $$('#register-firstname').val();
        var lastname = $$('#register-lastname').val();
        var email = $$('#register-email').val();
        var password = $$('#register-password').val();

        
        // simple validation for empty fields
        if (!firstname || !lastname || !email || !password){
            
            myApp.alert('Please fill in all Login form fields');
            return;
        }

        // build the http request
        var requestUrl = 'https://psdev-yt5t7w6ayhgkm527grvejshb-evals-dev.mbaas1.tom.redhatmobile.com/users/register';
        var postdata = {};
        postdata.firstname = firstname;
        postdata.lastname = lastname;
        postdata.email = email;
        postdata.password = password;


        // show activity indicator
        myApp.showIndicator();

        // Ajax for making http communication
        // HTTP communication responses are handled
        // based on HTTP response codes
        // documentation: http://framework7.io/docs/dom.html

        $$.ajax({
            url: requestUrl,
            //headers: {"X-Semat-Id":"somestuff","X-Semat-Message":"morestuff"},
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(postdata),

            success: function(data, status, xhr){
            
                // we have received response and can hide activity indicator
                myApp.hideIndicator();

                console.log('data: '+data);
                console.log('status: '+status);
        
                // better safe then sorry
                try {
                    
                    var responseJSON = JSON.parse(data);

                    
                    if (!responseJSON.firstname || !responseJSON.token) { 
                        myApp.alert('Registration was unsuccessful, we are experiencing internal errors, contact SEMAT team');
                        return;
                    }

                } catch (e) {
                    myApp.alert('Registration was unsuccessful, we are experiencing internal errors, contact SEMAT team');

                }

                // storing user data locally
                var userData = {};
                userData.firstname = responseJSON.firstname;
                userData.lastname = responseJSON.lastname;
                userData.email = responseJSON.email;
                userData.token = responseJSON.token;
                userData.timestamp = new Date().getTime();
                localStorage.w7Data = JSON.stringify(userData);


                mainView.router.load({
                    url: 'projects.html',
                    context: {
                        firstname: ''+responseJSON.firstname,
                        lastname: ''+responseJSON.lastname,
                        email: ''+responseJSON.email,
                        newRegistration: 'true'
                    }
                });                
            
            }, 

            error: function(xhr, status ){
            
                // we have received response and can hide activity indicator
                myApp.hideIndicator();

                console.log('status: '+status);

                // 409 status represents already existing email
                if (status == 409) {

                    myApp.alert('Registration was unsuccessful, email already exists. Either use another email address, or Login');

                } else {

                    myApp.alert('Registration was unsuccessful, please try again');

                    $$('#register-firstname').val('');
                    $$('#register-lastname').val('');
                    $$('#register-email').val('');
                    $$('#register-password').val('');

                }            
            }
        });
    });

});


// Projects page
myApp.onPageInit('projects', function (page) {

    console.log('projects page init');

    // we have to retrieve information about the user projects


    



    // submit logout
    $$('#user-logout').on('click', function () {

        // delete user data from local storage
        localStorage.w7Data = '';

        // move user to home page  
        mainView.router.load({
            url: 'index.html',
            context: {
                logout: 'true'
            }
        }); 
    });


    // new project page
    $$('#user-new-project').on('click', function () {

        // myApp.confirm('A new version is available. Do you want to load it right now?', function () {
        //         window.location.reload();
        // });


        // remove user details from local storage  
        mainView.router.load({
            url: 'createProject.html',
            context: {
                something: 'true'
            }
        });                
            
    });

});


