const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const rows = await req.db.read("Users", [{ column: "username", value: username }]);
    if (rows.length === 0) {
      return res.render('login', { error: 'User not found.' });
    }
    const user = rows[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.render('login', { error: 'An error occurred.' });
      }
      if (match) {
        req.session.userId = user.id;
        req.session.user = { id: user.id, email: user.email_address };
        res.redirect('/');
      } else {
        res.render('login', { error: 'Invalid credentials.' });
      }
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.render('login', { error: 'An error occurred.' });
  }
});

router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

router.post('/signup', async (req, res) => {
  const { first_name, last_name, username, password, password2 } = req.body;
  if (password !== password2) {
    return res.render('signup', { error: 'Passwords do not match.' });
  }
  try {
    const existing = await req.db.read("Users", [{ column: "username", value: username }]);
    if (existing.length > 0) {
      return res.render('signup', { error: 'Username already exists.' });
    }
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.render('signup', { error: 'An error occurred.' });
      }
      const data = [
        { column: "first_name", value: first_name },
        { column: "last_name", value: last_name },
        { column: "username", value: username },
        { column: "password", value: hash }
      ];
      try {
        await req.db.create("Users", data);
        res.redirect('/login');
      } catch (err2) {
        console.error("Error inserting new user:", err2);
        res.render('signup', { error: 'An error occurred.' });
      }
    });
  } catch (err) {
    console.error("Error during signup:", err);
    res.render('signup', { error: 'An error occurred.' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
