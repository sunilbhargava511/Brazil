const express = require('express');
const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Settings helpers ---
function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading settings:', err.message);
  }
  return {};
}

function saveSettings(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// --- Email helper ---
async function sendContactEmail(formData) {
  const settings = loadSettings();
  if (!settings.resendApiKey) {
    console.log('No Resend API key configured. Form data:', formData);
    return { success: false, error: 'Email not configured' };
  }

  const resend = new Resend(settings.resendApiKey);
  const toEmail = settings.toEmail || 'battersbyaraujo@gmail.com';
  const fromEmail = settings.fromEmail || 'onboarding@resend.dev';

  const emailBody = `
New inquiry from Alma Brazil

Name: ${formData.name || 'Not provided'}
Email: ${formData.email || 'Not provided'}
Location: ${formData.location || 'Not provided'}
Travel Style: ${formData.travelStyle || 'Not provided'}
Timing: ${formData.timing || 'Not provided'}
Experience Level: ${formData.experienceLevel || 'Not provided'}
How Found: ${formData.howFound || 'Not provided'}

What draws them to Brazil:
${formData.interests || 'Not provided'}
  `.trim();

  try {
    await resend.emails.send({
      from: `Alma Brazil <${fromEmail}>`,
      to: [toEmail],
      replyTo: formData.email || undefined,
      subject: `New Inquiry from ${formData.name || 'Website Visitor'}`,
      text: emailBody,
    });
    return { success: true };
  } catch (err) {
    console.error('Email send error:', err.message);
    return { success: false, error: err.message };
  }
}

// --- Routes ---
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

// Contact
app.get('/contact', (req, res) => {
  res.render('contact', { page: 'contact', submitted: false });
});

app.post('/contact', async (req, res) => {
  console.log('Contact form submission:', req.body);
  const result = await sendContactEmail(req.body);
  if (!result.success) {
    console.log('Email not sent:', result.error);
  }
  res.render('contact', { page: 'contact', submitted: true });
});

// Admin Settings
app.get('/admin/settings', (req, res) => {
  const settings = loadSettings();
  res.render('admin-settings', { page: 'admin', settings, message: null });
});

app.post('/admin/settings', async (req, res) => {
  const { resendApiKey, fromEmail, toEmail, action } = req.body;
  const settings = { resendApiKey, fromEmail, toEmail };
  saveSettings(settings);

  let message = { type: 'success', text: 'Settings saved.' };

  if (action === 'test') {
    if (!resendApiKey) {
      message = { type: 'error', text: 'Add an API key before sending a test email.' };
    } else {
      const resend = new Resend(resendApiKey);
      try {
        await resend.emails.send({
          from: `Alma Brazil <${fromEmail || 'onboarding@resend.dev'}>`,
          to: [toEmail || 'battersbyaraujo@gmail.com'],
          subject: 'Alma Brazil - Test Email',
          text: 'This is a test email from your Alma Brazil website. If you received this, your email settings are working correctly.',
        });
        message = { type: 'success', text: 'Settings saved and test email sent. Check your inbox.' };
      } catch (err) {
        message = { type: 'error', text: `Settings saved but test email failed: ${err.message}` };
      }
    }
  }

  res.render('admin-settings', { page: 'admin', settings, message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
