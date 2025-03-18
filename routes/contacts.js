const express = require('express');
const router = express.Router();

// Route to display all contacts on the homepage.
router.get('/', async (req, res) => {
  try {
    const contacts = await req.db.read("Contact", []);
    res.render('index', { contacts: contacts, user: req.session.userId });
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.send("An error occurred while fetching contacts.");
  }
});

// Route to show the form for creating a new contact.
router.get('/create', (req, res) => {
  res.render('create', { user: req.session.userId });
});

// Route to process the new contact form submission.
router.post('/create', async (req, res) => {
  try {
    const contact_by_email = req.body.contact_by_email ? 1 : 0;
    const contact_by_phone = req.body.contact_by_phone ? 1 : 0;

    const data = [
      { column: "first_name", value: req.body.first_name },
      { column: "last_name", value: req.body.last_name },
      { column: "phone_number", value: req.body.phone_number },
      { column: "email_address", value: req.body.email_address },
      { column: "street", value: req.body.street },
      { column: "city", value: req.body.city },
      { column: "state", value: req.body.state },
      { column: "zip", value: req.body.zip },
      { column: "country", value: req.body.country },
      { column: "contact_by_email", value: contact_by_email },
      { column: "contact_by_phone", value: contact_by_phone }
    ];
    await req.db.create("Contact", data);
    res.redirect('/');
  } catch (err) {
    console.error("Error creating contact:", err);
    res.send("Error adding contact.");
  }
});

// Route to display full details for a specific contact.
router.get('/:id', async (req, res) => {
  try {
    const rows = await req.db.read("Contact", [{ column: "id", value: req.params.id }]);
    const contact = rows[0];
    if (!contact) {
      return res.send("Contact not found.");
    }
    res.render('detail', { contact, user: req.session.userId });
  } catch (err) {
    console.error("Error fetching contact:", err);
    res.send("Contact not found.");
  }
});

// Route to display the edit form for a contact.
router.get('/:id/edit', async (req, res) => {
  try {
    const rows = await req.db.read("Contact", [{ column: "id", value: req.params.id }]);
    const contact = rows[0];
    if (!contact) {
      return res.send("Contact not found.");
    }
    res.render('edit', { contact, user: req.session.userId });
  } catch (err) {
    console.error("Error fetching contact for edit:", err);
    res.send("Contact not found.");
  }
});

// Route to process the edit form submission.
router.post('/:id/edit', async (req, res) => {
  try {
    const contact_by_email = req.body.contact_by_email ? 1 : 0;
    const contact_by_phone = req.body.contact_by_phone ? 1 : 0;
    
    const data = [
      { column: "first_name", value: req.body.first_name },
      { column: "last_name", value: req.body.last_name },
      { column: "phone_number", value: req.body.phone_number },
      { column: "email_address", value: req.body.email_address },
      { column: "street", value: req.body.street },
      { column: "city", value: req.body.city },
      { column: "state", value: req.body.state },
      { column: "zip", value: req.body.zip },
      { column: "country", value: req.body.country },
      { column: "contact_by_email", value: contact_by_email },
      { column: "contact_by_phone", value: contact_by_phone }
    ];

    const query = [{ column: "id", value: req.params.id }];
    await req.db.update("Contact", data, query);
    res.redirect(`/${req.params.id}`);
  } catch (err) {
    console.error("Error updating contact:", err);
    res.send("Error updating contact.");
  }
});

// Route to display the confirmation page for deletion.
router.get('/:id/delete', async (req, res) => {
  try {
    const rows = await req.db.read("Contact", [{ column: "id", value: req.params.id }]);
    const contact = rows[0];
    if (!contact) {
      return res.send("Contact not found.");
    }
    res.render('delete', { contact, user: req.session.userId });
  } catch (err) {
    console.error("Error fetching contact for delete:", err);
    res.send("Contact not found.");
  }
});

// Route to process the deletion of a contact.
router.post('/:id/delete', async (req, res) => {
  try {
    await req.db.db.run("DELETE FROM Contact WHERE id = ?", req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error("Error deleting contact:", err);
    res.send("Error deleting contact.");
  }
});

module.exports = router;
