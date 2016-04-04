// Main application logic lives here
// by @sauliuz

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
if (localStorage.w7Data != ''){
    var user = JSON.parse(localStorage.w7Data);

    // move to projects view
    mainView.router.load({
        url: 'projects.html',
        context: {
            name: ''+user.name,
            email: ''+user.email
        }
    });
}


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

    if (localStorage.w7Data) {

        var user = JSON.parse(localStorage.w7Data);
        console.log('Storage data: '+localStorage.w7Data);


        // TODO - check the timestamp for expiry

        // move to projects view
        mainView.router.load({
            url: 'no-projects.html',
            context: {
                name: ''+user.name,
                email: ''+user.email
            }
        });

        if (user.name && user.email ) {
            
            console.log(user.email);
            console.log(user.name);


        }

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
                console.log('status: '+status);
        
                // better safe then sorry
                try {
                    
                    var responseJSON = JSON.parse(data);

                    
                    if (!responseJSON.name || !responseJSON.token) { 
                        myApp.alert('Login was unsuccessful, we are experiencing internal errors, contact SEMAT team');
                    }

                } catch (e) {
                    myApp.alert('Login was unsuccessful, we are experiencing internal errors, contact SEMAT team');

                }

                // storing user data locally
                var userData = {};
                userData.name = responseJSON.name;
                userData.email = responseJSON.email;
                userData.token = responseJSON.token;
                userData.timestamp = new Date().getTime();
                localStorage.w7Data = JSON.stringify(userData);

                // move to projects view
                mainView.router.load({
                    url: 'projects.html',
                    context: {
                        name: ''+responseJSON.name,
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
        

        var name = $$('#register-name').val();
        var email = $$('#register-email').val();
        var password = $$('#register-password').val();

        
        // simple validation for empty fields
        if (!name || !email || !password){
            
            myApp.alert('Please fill in all Login form fields');
            return;
        }

        // build the http request
        var requestUrl = 'https://psdev-yt5t7w6ayhgkm527grvejshb-evals-dev.mbaas1.tom.redhatmobile.com/users/register';
        var postdata = {};
        postdata.name = name;
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

                    
                    if (!responseJSON.name || !responseJSON.token) { 
                        myApp.alert('Registration was unsuccessful, we are experiencing internal errors, contact SEMAT team');
                    }

                } catch (e) {
                    myApp.alert('Registration was unsuccessful, we are experiencing internal errors, contact SEMAT team');

                }

                // storing user data locally
                var userData = {};
                userData.name = responseJSON.name;
                userData.email = responseJSON.email;
                userData.token = responseJSON.token;
                userData.timestamp = new Date().getTime();
                localStorage.w7Data = JSON.stringify(userData);


                mainView.router.load({
                    url: 'projects.html',
                    context: {
                        name: ''+responseJSON.name,
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

                    myApp.alert('Registration was unsuccessful, please verify your credentials and try again');

                    $$('#register-name').val('');
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

            // move user to home page  
        mainView.router.load({
            url: 'index.html',
            context: {
                logout: 'true'
            }
        });


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


