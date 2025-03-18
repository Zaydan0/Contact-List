const express = require('express');
const session = require('express-session');
const path = require('path');
const Database = require('dbcmps369');

const app = express();
app.locals.pretty = true;
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'cmps369',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const db = new Database();


(async () => {
  try {
    await db.connect();
    console.log("Database connected");
    
    app.use((req, res, next) => {
      console.log("Adding DB to request");
      req.db = db;
      next();
    });
    
    app.use((req, res, next) => {
      if (req.session.user) {
        res.locals.user = {
          id: req.session.user.id,
          email: req.session.user.email
        };
      }
      next();
    });

    app.use('/', require('./routes/auth'));
    app.use('/', require('./routes/contacts'));

    //$env:DBPATH=./contacts.db

    app.listen(8080, () => {
      console.log(`Server is running  on port 8080`);
    });
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
})();
