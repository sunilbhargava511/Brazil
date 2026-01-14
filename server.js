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

app.get('/experience', (req, res) => {
  res.render('experience', { page: 'experience' });
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
