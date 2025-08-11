# Rescue Project Advanced

**Rescue Project Advanced** is a sophisticated web application designed to help locate missing persons using advanced technology, community collaboration, and real-time alert systems. Built with Flask, this platform provides a comprehensive solution for reporting, tracking, and finding missing individuals.

## 🌟 Key Features

### User Management
- Secure user registration and authentication
- Profile customization with avatar upload
- Social media integration (Twitter, Facebook, LinkedIn)
- Notification preferences (email and push notifications)
- Admin dashboard for user management

### Missing Person Reporting
- Comprehensive reporting form with detailed information fields
- Photo upload with automatic optimization
- Location tracking with date/time specification
- Status tracking (active, resolved, pending, urgent)
- Report categorization and filtering

### Advanced Search & Filtering
- Real-time search with suggestions
- Multi-criteria filtering (name, age, gender, location)
- Pagination for large result sets
- Advanced search algorithms

### Modern UI/UX
- Responsive design for all devices
- Dark/light mode toggle
- Customizable color themes
- Smooth animations and transitions
- Premium glassmorphism design elements
- Mobile-first approach with touch-friendly controls

### Technical Features
- SQLAlchemy ORM for database management
- Alembic for database migrations
- Flask-WTF for form handling and validation
- Flask-Login for user session management
- Flask-Mail for email notifications
- Image optimization and validation
- Secure file uploads
- Environment-based configuration

## 🎬 Demo

Check out our [demo video](https://vt.tiktok.com/ZSStvM2JG/) to see the website in action!

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Virtual environment tool (venv or virtualenv)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/rescue-project-advanced.git
   cd rescue-project-advanced
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   Create a `.env` file in the project root:
   ```env
   SECRET_KEY=your-very-secret-key-here
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   ```

5. **Initialize the database:**
   ```bash
   python init_db.py
   ```

6. **Run database migrations:**
   ```bash
   python run_migration.py
   ```

7. **Start the development server:**
   ```bash
   python run.py
   ```

8. **Access the application:**
   Open your browser and navigate to `http://localhost:5000`

## 🏗️ Project Structure

```
rescue-project-advanced/
├── app/
│   ├── __init__.py          # Application factory
│   ├── config.py            # Configuration settings
│   ├── forms.py             # WTForms definitions
│   ├── models.py            # Database models
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication routes
│   │   ├── main.py          # Main application routes
│   │   └── utils.py         # Utility routes
│   └── utils/
│       ├── __init__.py
│       └── helpers.py       # Helper functions
├── migrations/              # Alembic database migrations
├── static/                  # Static assets (CSS, JS, images)
│   ├── css/
│   ├── images/
│   ├── js/
│   └── uploads/             # User uploaded files
├── templates/               # Jinja2 templates
├── instance/                # SQLite database
├── .env                     # Environment variables
├── requirements.txt         # Python dependencies
├── run.py                   # Application entry point
├── init_db.py               # Database initialization
└── run_migration.py         # Migration runner
```

## 🔧 Configuration

The application uses environment variables for configuration. Create a `.env` file in the project root with the following variables:

```env
SECRET_KEY=your-super-secret-key-here
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
```

## 🗄️ Database

The application uses SQLite for development and can be configured to use PostgreSQL or MySQL for production. Database migrations are handled by Alembic.

### Initialize Database
```bash
python init_db.py
```

### Run Migrations
```bash
python run_migration.py
```

## 🎨 UI Components

### Premium Design Elements
- Glassmorphism cards and panels
- Smooth animations and transitions
- Responsive grid layouts
- Interactive form elements
- Real-time search with suggestions
- Dark/light mode toggle
- Customizable color themes

### Key Pages
- **Home Page**: Landing page with platform overview
- **Dashboard**: User/admin report management
- **Report Form**: Detailed missing person reporting
- **Search Results**: Advanced filtering and search
- **Profile**: User settings and preferences
- **Contact**: Communication page
- **Chatbot**: AI-powered assistance (placeholder)

## 🔒 Security Features

- Password hashing with Werkzeug
- CSRF protection (where applicable)
- Secure file upload validation
- SQL injection prevention with SQLAlchemy
- XSS prevention with Jinja2 templating
- Secure session management
- Input validation and sanitization

## 📱 Mobile Responsiveness

The application features a fully responsive design that works on:
- Desktop computers
- Tablets
- Smartphones
- Touch devices

Mobile-specific features include:
- Touch-friendly navigation
- Optimized form layouts
- Mobile search overlay
- Responsive image handling
- Adaptive grid systems

## 🛠️ Development

### Running Tests
```bash
# TODO: Add test running instructions
```

### Code Style
The project follows PEP 8 guidelines for Python code.

### Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Flask framework for the web application foundation
- SQLAlchemy for ORM capabilities
- WTForms for form handling
- Pillow for image processing
- AOS.js for scroll animations
- All contributors to the open-source libraries used

## 📞 Support

For support, please open an issue on the GitHub repository or contact the development team.
