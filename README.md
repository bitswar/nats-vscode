# NATS VSCode Extension

A Visual Studio Code extension for working with NATS servers directly from the editor. Create `.nats` files, connect to servers, and execute commands through an intuitive Code Lens interface.

## 🚀 Quick Start

1. **Create a `.nats` file** with your commands:
   ```nats
   SUBSCRIBE foo.bar
   REQUEST foo.bar { "data": "hello" }
   PUBLISH foo.bar { "data": "world" }
   ```

2. **Connect to your NATS server**:
   - Open Command Palette (`Ctrl+Shift+P`)
   - Run `NATS: Connect`
   - Enter server URL (e.g., `nats://localhost:4222`)

3. **Use Code Lens buttons** that appear above each command to execute them

## 📚 Documentation

- **[English Documentation](README_EN.md)** - Complete user guide in English
- **[Русская Документация](README_RU.md)** - Полное руководство пользователя на русском

## ✨ Features

- **Interactive Code Lens** - Click buttons to execute NATS commands
- **Flexible Data Support** - JSON objects, strings, and `randomId()` function
- **Auto-connection** - Automatically connects to your last used server
- **Separate Output Channels** - Dedicated windows for each subject
- **Multi-line Support** - Handle complex JSON structures

## 🎯 Supported Commands

- `SUBSCRIBE` - Subscribe to messages
- `REQUEST` - Send requests and receive responses  
- `PUBLISH` - Publish messages

## 📦 Installation

Install from VS Code Marketplace or build from source:
```bash
npm install
npm run compile
```

## 🤝 Contributing

Issues and pull requests are welcome! Please check the documentation files for detailed usage examples.