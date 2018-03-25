var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var expressSession = require('express-session');
var sharedsession = require('express-socket.io-session');

var Sequelize = require('sequelize');
var model2 = require('./model.js');
var Promise= require('promise');
var model=require('./model.js');

exports.sequelize=Sequelize;

//Connecting to server

/* CONNECTING TO OWN SERVER AS A REMOTE USER */
const sequelize = new Sequelize({
  dialect: 'mysql',
  database: 'truelab',
  username: 'root',
  password: 'Knutte',
  host: 'localhost', //will always change :(
  port:'3306'
});

sequelize.authenticate()
  .then(() => {
  console.log('Connection has been established successfully.');
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});

// Defining and syncing models with database.
const Users = sequelize.define("users", {
  id: {type:Sequelize.INTEGER, autoIncrement: true, primaryKey:true},
  name: {type:Sequelize.STRING},
  email: {type:Sequelize.STRING, unique: true},
  password: {type:Sequelize.STRING},
  //TODO picture: {type:Sequelize.STRING}
},{timestamps: false});

const Courses = sequelize.define("courses", {
  id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  name: {type: Sequelize.STRING}
},{timestamps: false});

const Matches = sequelize.define("matches", {
  cId: {type: Sequelize.INTEGER,  primaryKey: true},
  uId1: {type: Sequelize.INTEGER,  primaryKey: true},
  uId2: {type: Sequelize.INTEGER,  primaryKey: true},
  totalMessages: {type: Sequelize.INTEGER}
},{timestamps: false});

const UserSwipes = sequelize.define("userSwipes",{
  cId: { type: Sequelize.INTEGER, primaryKey: true},
  uId1: { type: Sequelize.INTEGER,  primaryKey: true},
  uId2: { type: Sequelize.INTEGER, primaryKey: true},
  liked: { type: Sequelize.BOOLEAN}
},{timestamps: false,freezeTableName: true});

const CourseUserInfo = sequelize.define("courseUserInfo", {
  uId: { type: Sequelize.INTEGER,  primaryKey: true},
  cId: { type: Sequelize.INTEGER, primaryKey: true},
  ambition: {type: Sequelize.STRING},
  seeking: {type: Sequelize.STRING},
  biography: {type: Sequelize.TEXT},
  numberOfMatches: {type: Sequelize.INTEGER},
},{timestamps: false,freezeTableName: true});

const Messages = sequelize.define('messages', {
  id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
  cId: { type: Sequelize.INTEGER},
  from: { type: Sequelize.INTEGER},
  to: { type: Sequelize.INTEGER},
  message: {type: Sequelize.STRING},
  messageNumber: {type:Sequelize.INTEGER}
},{timestamps: false});

const sync= ()=> sequelize.sync({ force:true });

const seed=()=>{
  return sync().then(()=>{
    return Promise.all([
      //users
      Users.create({name:'alvin', email:'alvin@kth.se',password:'alvin'}),
      Users.create({name:'felix', email:'felix@kth.se',password:'felix'}),
      Users.create({name:'oscar', email:'oscar@kth.se',password:'oscar'}),
      Users.create({name:'felipe', email:'felipe@kth.se',password:'felipe'}),
      Users.create({name:'george', email:'george@kth.se',password:'george'}),

      //course
      Courses.create({id:1,name:'intnet'}),

      /* matches
      Matches.create({cId:1,uId1:1,uId2:2, totalMessages: 0}),
      Matches.create({cId:1,uId1:1,uId2:4, totalMessages: 0}),
      Matches.create({cId:1,uId1:2,uId2:3, totalMessages: 0}),
      */

      //userSwipes
      UserSwipes.create({cId:1,uId1:2,uId2:1, liked:true}),
      UserSwipes.create({cId:1,uId1:3,uId2:1, liked:true}),
      UserSwipes.create({cId:1,uId1:4,uId2:1, liked:true}),


      CourseUserInfo.create({uId:4, cId:1, ambition:'A', seeking: 'A', biography: 'Hot guy'}),
      CourseUserInfo.create({uId:5, cId:1,ambition:'B', seeking: 'B', biography: 'Ridiculous guy'}),
      CourseUserInfo.create({uId:1, cId:1, ambition:'A', seeking: 'A', biography: 'Nice guy'}),
      CourseUserInfo.create({uId:2, cId:1, ambition:'B', seeking: 'B', biography: 'Cool guy'})

      /* Messages
      Messages.create({from:1,to:2,cId:1, message:'Hälsar!', messageNumber:1 }),
      Messages.create({from:2,to:1,cId:1, message:'Hälsar tillbaks!', messageNumber:2 }),
      Messages.create({from:1,to:2,cId:1, message:'Mycket trevligt att råkas!', messageNumber:3 })
    */
    ]); //promise
  }//function
);//then

};//seed

//exports the database
exports.database = {users: Users, courses: Courses, matches: Matches,
  courseUserInfo: CourseUserInfo, messages: Messages, userSwipes: UserSwipes};

//call the seed function that was defined earlier
seed();

//Defining associations:
CourseUserInfo.belongsTo(Users, {foreignKey: 'uId'});

//UserSwipes.belongsTo(Users,{foreignKey: 'uId1'});
//UserSwipes.belongsTo(Users,{foreignKey: 'uId2'});

//Matches.belongsTo(Users,{foreignKey: 'uId1'});
//Matches.belongsTo(Users,{foreignKey: 'uId2'});

//defining middleware and initiating server.

var port = 8090;

var app = express();
app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
var session = expressSession({
  secret: "MoveFromHereOrTheSecretWillBeOnGit",
  resave: true,
  saveUninitialized: true,
});

app.use(session);

var httpServer = http.Server(app);
var io = require('socket.io').listen(httpServer);
io.use(sharedsession(session));

var router = require('./controller.js');
app.use('/API', router);

var socketController = require('./socketController.js');
io.on('connection', function (socket) {
  socketController(socket, io);
});

httpServer.listen(port, function () {
  console.log("server listening on port", port);
});
