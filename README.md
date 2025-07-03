# 🧾 Fatoora - Modern Invoice Management System

A beautiful, modern invoice management application built with React and Flask. Fatoora helps businesses create, manage, and track their invoices with a professional, user-friendly interface.

![Fatoora](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.0-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)

## ✨ Features

### 📊 **Dashboard & Analytics**
- Real-time business metrics and KPIs
- Month-over-month trend analysis
- Revenue tracking and insights
- Professional data visualization

### 👥 **Client Management**
- Add, edit, and manage client information
- Store contact details, ICE, and IF numbers
- Beautiful card-based client interface
- Advanced search and filtering

### 🧾 **Invoice Management**
- Create professional invoices instantly
- Auto-generated invoice numbers
- Multiple status tracking (Paid, Unpaid, Overdue)
- Bulk operations and filtering

### 📄 **PDF Generation**
- Beautiful, branded PDF invoices
- Company logo integration
- Professional layout and styling
- Single-page optimized design

### 📤 **Export & Backup**
- CSV export for data analysis
- PDF archive with all invoices
- Secure download with authentication
- Bulk export capabilities

### 🔐 **Authentication & Security**
- Firebase Authentication integration
- Google and Apple sign-in
- JWT token-based API security
- Secure file handling

### 🌍 **Internationalization**
- Multi-language support (French, English, Arabic)
- RTL support for Arabic
- Dynamic language switching
- Localized date and number formats

### 🎨 **Modern UI/UX**
- Beautiful Tailwind CSS design
- Responsive mobile-first layout
- Smooth animations and transitions
- Professional color schemes and gradients

## 🚀 Tech Stack

### **Frontend**
- **React 18** - Modern UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **i18next** - Internationalization
- **Lucide React** - Beautiful icons
- **Firebase SDK** - Authentication

### **Backend**
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **Flask-Migrate** - Database migrations
- **WeasyPrint** - PDF generation
- **Firebase Admin** - Server-side authentication
- **PostgreSQL** - Database (production ready)

### **Additional Tools**
- **Jinja2** - Template engine for PDFs
- **python-dotenv** - Environment management
- **CORS** - Cross-origin resource sharing

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (or SQLite for development)
- Firebase project with authentication enabled

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/fatoora.git
cd fatoora
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
flask db upgrade

# Start backend server
python -m backend.app
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Firebase Configuration
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Google/Apple providers
3. Download your service account key
4. Update `frontend/src/firebase.js` with your config
5. Place service account JSON in `backend/` directory

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/fatoora

# Firebase
FIREBASE_ADMIN_CREDENTIALS=backend/your-firebase-key.json

# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key
```

### Firebase Setup
1. Go to Firebase Console → Project Settings → Service Accounts
2. Generate new private key
3. Save as `backend/your-firebase-key.json`
4. Update the path in your environment variables

## 🎯 Usage

### Starting the Application
1. **Backend**: `python -m backend.app` (runs on http://localhost:5000)
2. **Frontend**: `npm run dev` (runs on http://localhost:5173)

### Key Features Usage

#### Creating Invoices
1. Navigate to "Invoices" page
2. Click "Add Invoice"
3. Select client, enter amount and due date
4. Invoice is auto-numbered and created

#### Generating PDFs
1. Go to any invoice
2. Click "PDF" button
3. Professional PDF downloads automatically

#### Exporting Data
1. Visit "Export" page
2. Choose CSV (data) or ZIP (PDFs)
3. Files download with authentication

#### Managing Clients
1. Go to "Clients" page
2. Add client with contact information
3. Search and filter as needed

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and structure
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📸 Screenshots

*Add screenshots of your application here*

## 🔒 Security

- All API endpoints are protected with Firebase authentication
- JWT tokens are used for secure communication
- Sensitive files are excluded from version control
- Input validation and sanitization implemented

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Tailwind CSS** for the amazing utility-first CSS framework
- **Firebase** for authentication and hosting services
- **WeasyPrint** for excellent PDF generation
- **React** community for incredible ecosystem
- **Flask** for the lightweight and flexible backend framework

## 📞 Support

If you have any questions or need support:
- Open an issue on GitHub
- Contact: your-email@example.com

---

**Made with ❤️ by [Your Name]**

> Fatoora - Making invoice management beautiful and efficient 