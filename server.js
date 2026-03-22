const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.render('home', { page: 'home' });
});

app.get('/about', (req, res) => {
  res.render('about', { page: 'about' });
});

// Journeys overview
app.get('/journeys', (req, res) => {
  res.render('journeys', { page: 'journeys' });
});

// Individual journeys
app.get('/journeys/rio', (req, res) => {
  res.render('journeys/rio', { page: 'journeys' });
});

app.get('/journeys/bahia', (req, res) => {
  res.render('journeys/bahia', { page: 'journeys' });
});

app.get('/journeys/nature', (req, res) => {
  res.render('journeys/nature', { page: 'journeys' });
});

// Redirect old experience URL
app.get('/experience', (req, res) => {
  res.redirect(301, '/journeys');
});

app.get('/contact', (req, res) => {
  res.render('contact', { page: 'contact', submitted: false });
});

app.post('/contact', (req, res) => {
  // In production, you would handle the form submission here
  // (send email, save to database, etc.)
  console.log('Contact form submission:', req.body);
  res.render('contact', { page: 'contact', submitted: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
