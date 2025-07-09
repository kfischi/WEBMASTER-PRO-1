# 🤝 Contributing to WebMaster Pro

Thank you for your interest in contributing to WebMaster Pro! This guide will help you get started.

## 🎯 **How to Contribute**

### **Types of Contributions**
- 🐛 **Bug fixes** - Fix issues in existing code
- ✨ **New features** - Add new functionality
- 📝 **Documentation** - Improve or add documentation
- 🎨 **UI/UX improvements** - Enhance user interface
- 🔧 **Performance optimization** - Make the system faster
- 🧪 **Testing** - Add or improve tests
- 🌍 **Translations** - Add support for new languages

---

## 🚀 **Getting Started**

### **1. Fork the Repository**
```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/your-username/webmaster-pro.git
cd webmaster-pro
```

### **2. Set Up Development Environment**
```bash
# Install dependencies
npm run setup

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Initialize database
cd backend
node setup.js

# Run tests
npm test
```

### **3. Create a Feature Branch**
```bash
# Create and switch to new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b bugfix/issue-description
```

---

## 📋 **Development Guidelines**

### **Code Style**
- Use **JavaScript ES6+** syntax
- Follow **camelCase** naming convention
- Use **async/await** for asynchronous operations
- Add **comments** for complex logic
- Keep functions **small and focused**

### **File Structure**
```
backend/
├── src/
│   ├── middleware/     # Authentication, validation
│   ├── routes/         # API endpoints
│   └── utils/          # Helper functions
├── server.js           # Main server file
├── setup.js            # Database setup
└── test-*.js          # Test files
```

### **API Design**
- Use **RESTful** conventions
- Include **proper error handling**
- Add **input validation**
- Use **consistent response format**
- Include **rate limiting**

### **Database**
- Use **PostgreSQL** for data storage
- Follow **normalized** table design
- Add **indexes** for performance
- Use **migrations** for schema changes
- Include **foreign key** constraints

---

## 🧪 **Testing**

### **Before Submitting**
```bash
# Run all tests
npm test

# Run specific test
cd backend
node test-api.js

# Test with different environments
NODE_ENV=production npm test
```

### **Adding Tests**
- Add tests for **new features**
- Test **error conditions**
- Include **edge cases**
- Test **API endpoints**
- Verify **database operations**

---

## 📝 **Pull Request Process**

### **1. Prepare Your Changes**
```bash
# Make sure your code is clean
npm run lint

# Run tests
npm test

# Update documentation if needed
# Add your changes to CHANGELOG.md
```

### **2. Commit Your Changes**
```bash
# Use conventional commit format
git commit -m "feat: add AI design generation"
git commit -m "fix: resolve database connection issue"
git commit -m "docs: update API documentation"
```

### **3. Submit Pull Request**
- **Title**: Clear, descriptive title
- **Description**: Explain what you changed and why
- **Screenshots**: If UI changes, include before/after
- **Tests**: Confirm all tests pass
- **Documentation**: Update if necessary

---

## 🐛 **Bug Reports**

### **Before Reporting**
- Check if issue already exists
- Try to reproduce the bug
- Test with latest version
- Check documentation

### **Bug Report Template**
```markdown
**Bug Description**
Clear description of what went wrong

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should have happened

**Screenshots**
If applicable, add screenshots

**Environment**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Node.js version: [e.g., 18.0.0]
- WebMaster Pro version: [e.g., 1.0.0]

**Additional Context**
Any other relevant information
```

---

## 💡 **Feature Requests**

### **Feature Request Template**
```markdown
**Feature Description**
Clear description of the requested feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How would you like it to work?

**Alternatives Considered**
Other ways to solve this problem

**Additional Context**
Mockups, examples, or other relevant info
```

---

## 🎨 **UI/UX Guidelines**

### **Design Principles**
- **Mobile-first** responsive design
- **Accessibility** (WCAG 2.1)
- **Performance** optimization
- **Consistent** visual language
- **User-friendly** interactions

### **Color Scheme**
- Primary: `#4f46e5` (Indigo)
- Secondary: `#10b981` (Green)
- Accent: `#f59e0b` (Yellow)
- Background: `#ffffff` (White)
- Text: `#1f2937` (Dark Gray)

### **Typography**
- Headers: **Inter** or system font
- Body: **System font stack**
- Code: **JetBrains Mono** or monospace

---

## 🌍 **Internationalization**

### **Adding Language Support**
- Add translations in `src/locales/`
- Use **i18n** keys for all user-facing text
- Test with **RTL languages**
- Update **documentation**

### **Current Languages**
- 🇮🇱 **Hebrew** (primary)
- 🇺🇸 **English** (secondary)

---

## 📚 **Documentation**

### **Types of Documentation**
- **API documentation** - Endpoint details
- **User guides** - How to use features
- **Development guides** - How to contribute
- **Architecture docs** - System design
- **Deployment guides** - Production setup

### **Documentation Standards**
- Use **Markdown** format
- Include **code examples**
- Add **screenshots** where helpful
- Keep it **up-to-date**
- Write for **different skill levels**

---

## 🔒 **Security**

### **Security Guidelines**
- **Never** commit API keys or secrets
- Use **environment variables** for sensitive data
- Implement **input validation**
- Add **rate limiting**
- Use **HTTPS** in production
- Follow **OWASP** guidelines

### **Reporting Security Issues**
- **DO NOT** open public issues for security vulnerabilities
- Email: security@webmaster-pro.co.il
- Include detailed steps to reproduce
- We'll respond within 24 hours

---

## 🏆 **Recognition**

### **Contributors**
All contributors will be:
- Added to **CONTRIBUTORS.md**
- Mentioned in **release notes**
- Recognized in **README.md**
- Credited in **about page**

### **Types of Recognition**
- 🥇 **Major contributors** - Significant features or fixes
- 🥈 **Regular contributors** - Multiple contributions
- 🥉 **First-time contributors** - Welcome to the community!

---

## 📞 **Getting Help**

### **Communication Channels**
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Email** - hello@webmaster-pro.co.il
- **Discord** - [Join our community](https://discord.gg/webmaster-pro)

### **Development Help**
- **Code reviews** - Ask for feedback
- **Architecture questions** - Discuss design decisions
- **Testing help** - Get help with tests
- **Documentation** - Clarify requirements

---

## 📄 **License**

By contributing to WebMaster Pro, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 **Thank You!**

Every contribution makes WebMaster Pro better for everyone. Whether it's a bug fix, new feature, or documentation improvement, your help is greatly appreciated!

**Happy coding! 🚀**
