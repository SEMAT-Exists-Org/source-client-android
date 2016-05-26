// Main application logic lives here
// by @sauliuz

// These files will be bundled with below JS by Grunt
// to produce bundle.js - for usage in app

// constants used across the funcionality
var userCacheTTL = '';
var apiKey = '';

var projectServiceUrl = 'https://psdev-yt5t7wyhlwjcrfs3sldt4zm6-evals-dev.mbaas1.tom.redhatmobile.com/projects';
var userServiceUrl = 'https://psdev-yt5t7w6ayhgkm527grvejshb-evals-dev.mbaas1.tom.redhatmobile.com/users';

//var projectServiceUrl = 'http://localhost:8002/projects';
//var userServiceUrl = 'http://localhost:8001/users';


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

// General tasks on application startup //

// warn if no network connection
if (!navigator.onLine) {
    myApp.alert('It appears your network connection is down. You need internet connection to use SEMAT App!');
}

// if user is already loged in
// we move him to projects flow
if (localStorage.w7Data && localStorage.w7Data !== ''){
    // debug
    console.log('detected logged in user. moving to projects');
    loadProjects();
}

// global logout function
function logout(){
    console.log('global logout called');
    // delete user data from local storage
    localStorage.w7Data = '';

    // move user to home page  
    mainView.router.load({
        url: 'index.html',
        context: {
            logout: 'true'
        }
    });
}

// load projects page
function loadProjects(){
    
    // 1. first we will check if user has associated project data stored locally
    // 2. if project data is found we are going to display it. if not, validate with project service
    // 3. load up projects page with relevant project information.

    var user = '';
    if (localStorage.w7Data && localStorage.w7Data !== ''){
        
        user = JSON.parse(localStorage.w7Data);

        // if user has projects, use local project data
        if (user.projects) {
            var projectData = user.projects;

            // debug
            console.log('user has local projects. using local project data: '+JSON.stringify(projectData));

            // move to projects view
            myApp.hideIndicator();

            mainView.router.load({
                url: 'projects.html',
                context: {
                    firstname: ''+user.firstname,
                    lastname: ''+user.lastname,
                    email: ''+user.email,
                    projects: projectData
                }
            });
        }
        else {
            // if user has no local project data
            // we ask service for information

            var requestUrl = projectServiceUrl+'/user/'+user.guid;

            $$.ajax({
                url: requestUrl,
                type: "GET",
                contentType: "application/json",
                headers: {'token': user.token},
                success: function(data, status, xhr){
                    // debug
                    console.log('received user projects data: '+data);

                    // better safe then sorry
                    try {
                        var projectsJSON = JSON.parse(data);
                        if (!projectsJSON.status ||  projectsJSON.status !== 'success') {
                            myApp.alert('Cannot parse projects data. Internal error, contact SEMAT app team');
                            return
                        }
                    } catch (e) {
                        myApp.alert('Cannot parse projects data. Internal error, contact SEMAT app team');
                        return
                    }

                    // if user has any associated projects push them to the view
                    if (projectsJSON.projects.length > 0){
                        var projectData = projectsJSON.projects;
                    }
                    else {
                        var projectData = null;
                    }

                    // add the projects to locally stored user profile
                    var localUser = JSON.parse(localStorage.w7Data);
                    localUser.projects = projectData;
                    localStorage.w7Data = JSON.stringify(localUser);

                    // move to projects view
                    myApp.hideIndicator();

                    mainView.router.load({
                        url: 'projects.html',
                        context: {
                            firstname: ''+user.firstname,
                            lastname: ''+user.lastname,
                            email: ''+user.email,
                            projects: projectData
                        }
                    });
                },
                error: function(xhr, status ){ // error while communicating with projects service
                    console.log('error from projects service: '+status);

                    if (status == 302){
                        // user token has expired
                        console.log('user token has expired. asking to relogin');
                        logout();
                    } else {
                        // error while communicating with user service
                        // we cannot show any projects associated with this user
                        myApp.hideIndicator();

                        myApp.alert('We could not access your project information and your project list might be not up to date.');
                        // move to projects view
                        mainView.router.load({
                            url: 'projects.html',
                            context: {
                                firstname: ''+user.firstname,
                                lastname: ''+user.lastname,
                                email: ''+user.email,
                                projects: null
                            }
                        });
                    }
                }
            });
        }
    }
    else {
        // if user is not logged in
        // redirect to standard not logged in flow
        logout();
    }
}

// load a single project page
// from by the project id
function loadProject(projectId){

    // 1. search user local projects for the project id to this method
    // 2. load up project page with relevant project information.

    console.log('single project requested with id: '+projectId);

    var user = '';
    if (localStorage.w7Data && localStorage.w7Data !== ''){

        user = JSON.parse(localStorage.w7Data);
        //console.log(user);

        // finding if the project exists in the array
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find

        function findProjectId(project) {
            return project.projectid === ''+projectId;
        }

        var selectedProject = user.projects.find(findProjectId);

        if (selectedProject){
            // project data is now found
            // navigate to single project page
            mainView.router.load({
                url: 'project.html',
                context: {
                    project: selectedProject
                }
            });


        } else {
            // could't find project by id
            // something went wrong, needs to sync projects
            myApp.alert('Cannot retrieve local project information. Please re-sync your projects.');
            return;
        }

    }
    else {
        // if user is not logged in
        // redirect to standard not logged in flow
        logout();
    }
}

/*** Pages & page specific actions ***/

// Left menu sub-page
myApp.onPageInit('panel-left', function (page) {
    console.log('left menu page');

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
});

// Index page
myApp.onPageInit('index', function (page) {
    console.log('index page init');
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
        var requestUrl = userServiceUrl+'/login';
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

                console.log('received user login data: '+data);
        
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

                // preparing for storing user data locally
                var userData = {};
                userData.firstname = responseJSON.firstname;
                userData.lastname = responseJSON.lastname;
                userData.email = responseJSON.email;
                userData.token = responseJSON.token;
                userData.guid = responseJSON.guid;
                userData.timestamp = new Date().getTime();

                localStorage.w7Data = JSON.stringify(userData);

                loadProjects();


                // user is now loged in and validated
                // we need to retrieve the project information for this user
                // this means another request to the projects service
                
                //var requestUrl = projectServiceUrl+'/user/'+responseJSON.guid;      
                // $$.ajax({
                //     url: requestUrl,
                //     type: "GET",
                //     contentType: "application/json",
                //     success: function(data, status, xhr){
                //         // debug
                //         console.log('received user projects data: '+data);

                //         // better safe then sorry
                //         try {                            
                //             var projectsJSON = JSON.parse(data);                    
                //             if (!projectsJSON.status ||  projectsJSON.status !== 'success') { 
                //                 myApp.alert('Login was unsuccessful, we are experiencing internal errors, contact SEMAT team');
                //                 return
                //             }
                //         } catch (e) {
                //             myApp.alert('Login was unsuccessful, we are experiencing internal errors, contact SEMAT team');
                //             return
                //         }

                //         // get the projects belonging to user
                //         var projectData = projectsJSON.projects;

                //         // finalise user data for local storage
                //         userData.projects = projectData || null;
                //         localStorage.w7Data = JSON.stringify(userData);
                //         // debug
                //         console.log('stored user object: '+JSON.stringify(userData));

                //         // about to do redirect to projects page
                //         // hide activity indicator
                //         myApp.hideIndicator();

                //         // move to projects view
                //         mainView.router.load({
                //             url: 'projects.html',
                //             context: {
                //                 firstname: ''+userData.firstname,
                //                 lastname: ''+userData.lastname,
                //                 email: ''+userData.email,
                //                 projects: userData.projects,
                //                 newLogin: 'true'
                //             }
                //         });
                //     },
                //     error: function(xhr, status ){ // error while communicating with projects service
                //         console.log('user projects error: '+status);

                //         // we will still log the user in as user service gave us ok
                //         // however, we cannot show any projects associated with this user

                //         // finalise user data for local storage
                //         userData.projects = null;
                //         localStorage.w7Data = JSON.stringify(userData);
                //         // debug
                //         console.log('stored user object: '+JSON.stringify(userData));

                //         myApp.hideIndicator();

                //         // move to projects view
                //         mainView.router.load({
                //             url: 'projects.html',
                //             context: {
                //                 firstname: ''+userData.firstname,
                //                 lastname: ''+userData.lastname,
                //                 email: ''+userData.email,
                //                 projects: userData.projects,
                //                 newLogin: 'true'
                //             }
                //         });
                //     }
                // });          
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
}).trigger();

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
        var requestUrl = userServiceUrl+'/register';
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

    // read local storage, see what projects
    // user is associated with
    // If user is logged in, he goes directly to the projects page
    if (localStorage.w7Data && localStorage.w7Data !== ''){
        
        var user = JSON.parse(localStorage.w7Data);
    }
    else {
        // redirect to login
    }

    // once user clicks on the specific project

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

// Create project page
myApp.onPageInit('createProject', function (page) {

    console.log('createProject page init');

    // read local storage, see what projects
    // user is assotiated with
    // If user is loged in, he goes directly to the projects page
    if (localStorage.w7Data && localStorage.w7Data !== ''){        
        var user = JSON.parse(localStorage.w7Data);
    }
    else {
        // redirect to login
        logout();
    }

    // once user clicks on the specific project

    // new project page
    $$('#create-new-project').on('click', function () {

        var projectName = $$('#project-name').val();
        console.log('creating new project with the name: '+projectName);
        console.log('assigning user: '+user.guid+' to the new project');

        //remove spaces from project name
        projectName = projectName.replace(/\s+/g, '');

        // new project
        // build the http request
        var requestUrl = projectServiceUrl+'/';
        var postdata = {};
        postdata.project_name = projectName;
        postdata.users = [{'userid':''+user.guid}];

        // show activity indicator
        myApp.showIndicator();
        // http
        $$.ajax({
            url: requestUrl,
            //headers: {"X-Semat-Id":"somestuff","X-Semat-Message":"morestuff"},
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(postdata),

            success: function(data, status, xhr){                
                
                // nex step is to add the new project to the user profile
                console.log('new project is created, updating the user info');                
                var requestUrl = userServiceUrl+'/'+user.guid+'/projects';

                data = JSON.parse(data);
                postdata = {"projectid": data.project.projectid};

                $$.ajax({
                    url: requestUrl,
                    type: "PUT",
                    contentType: "application/json",
                    headers: {'token': user.token},
                    data: JSON.stringify(postdata),
                    
                    success: function(data, status, xhr){
                        // debug
                        console.log('successfully updated user profile : '+data);
                    },
                    error: function(xhr, status ){
                        console.log(status);
                        // done
                        myApp.hideIndicator();
                        myApp.alert('Sorry, cannot update user profile at the moment');
                    }
                });

                // done
                myApp.hideIndicator();
                // load up user projects
                loadProjects();
            },
            error: function(xhr, status ){
                console.log(status);
                // done
                myApp.hideIndicator();
                myApp.alert('Sorry, cannot create new project at the moment');
            }
        });


        // myApp.confirm('A new version is available. Do you want to load it right now?', function () {
        //         window.location.reload();
        // });

        // // remove user details from local storage  
        // mainView.router.load({
        //     url: 'createProject.html',
        //     context: {
        //         something: 'true'
        //     }
        // });                
            
    });
});


