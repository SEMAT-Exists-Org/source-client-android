# Mobile app code

This repositary contains client application HTML5 code for building mobile app binaries with Cordova wrapper.

Using Android material design.

### Building mobile binary

For this project we use [RHMAP platform](https://www.redhat.com/en/technologies/mobile/application-platform) to produce Android mobile application binary. You can also use local cordova install to build your project.


### Development and Grunt

This project is setup with Gruntfile for serving HTML5 application localy and watching for file changes during the development.

You have to have [NodeJS](https://nodejs.org/en/) and [Grunt](http://gruntjs.com/) installed on your box.

Install all npm modules with 

	npm install
	
And tell Grunt to serve your project locally (watching is enabled by default)

	grunt serve
	
Have fun!  



