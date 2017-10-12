## About This Project
This is the backend project for Adherence Pill Project, written in javascript with Express framework and connecting to MongoDB through parse API.

## How To Run
#### 1. Clone this project   

```sh
$ git clone git@github.com:AdherencePillProject/WebSide.git
```

#### 2. Install dependencies

```sh
$ cd AdherencePillProject
$ npm install  
```

#### 3. Run the server  

```sh
$ npm start
```
- The server will up and listen on http://localhost:5000  
- You can go to http://localhost:5000/test to check if the Parse server is running or not.

## About Parse Server
The parse server is integrated into the project, make sure there is a live MongoDB instance running on http://localhost:27017 (or any other remote MongoDB connection).

#### How?
- Basically it's mapping the Parse API path to Express path, check the `app.js`:
```javascript
var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/adherence',
  cloud: process.env.CLOUD_CODE_MAIN || './cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || 'myMasterKey',
  serverURL: process.env.SERVER_URL || 'http://localhost:5000/parse',
  liveQuery: {
    classNames: ["Posts", "Comments"]
  }
});
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);
```  
  So any connection to http://localhost:5000/parse will redirect to Parse server and let it handle.  

#### What next?
- Define all the functions front-end needed(add, delete, modify, search any modules in the Parse server).
- Map the functions with RESTful API.
