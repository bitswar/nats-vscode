# NATS VSCode Extension

A Visual Studio Code extension that allows you to work with NATS servers directly from the editor. Create `.nats` files, connect to servers, and execute commands through a convenient interface.

## 🚀 Features

- **NATS Server Connection** - Quick connection with settings persistence
- **Code Lens Interface** - Interactive buttons directly in the code
- **Support for all NATS operations**:
  - `SUBSCRIBE` - Subscribe to messages
  - `REQUEST` - Send requests
  - `PUBLISH` - Publish messages
- **Flexible Data Parsing**:
  - JSON objects (single-line and multi-line)
  - Simple quoted strings
  - `randomId()` function for UUID generation
- **Automatic Output Channels** - Separate windows for each subject
- **Auto-connection** - Automatic connection on startup

## 📦 Installation

1. Install the extension from VS Code Marketplace
2. Or build from source:
   ```bash
   npm install
   npm run compile
   ```

## 🎯 Quick Start

### 1. Create a NATS File

Create a file with `.nats` extension (e.g., `test.nats`):

```nats
SUBSCRIBE foo.bar
REQUEST foo.bar { "data": "hello" }
PUBLISH foo.bar { "data": "world", "timestamp": 1726233600 }
```

### 2. Connect to Server

1. Open Command Palette (`Ctrl+Shift+P`)
2. Execute `NATS: Connect` command
3. Enter your NATS server URL (e.g., `nats://localhost:4222`)

### 3. Use Code Lens

After connection, interactive buttons will appear above each command:
- **Subscribe/Unsubscribe** - for `SUBSCRIBE` commands
- **Send request** - for `REQUEST` commands
- **Publish** - for `PUBLISH` commands

## 📝 NATS File Syntax

### Commands

#### SUBSCRIBE
```nats
SUBSCRIBE subject.name
```
Subscribes to messages on the specified subject.

#### REQUEST
```nats
REQUEST subject.name { "data": "request payload" }
```
Sends a request and waits for a response.

#### PUBLISH
```nats
PUBLISH subject.name { "data": "message payload" }
```
Publishes a message to the specified subject.

### Data Formats

#### JSON Objects
```nats
# Single-line JSON
REQUEST user.create { "name": "John", "email": "john@example.com" }

# Multi-line JSON
REQUEST user.create 
{ 
    "name": "John", 
    "email": "john@example.com",
    "metadata": {
        "role": "admin",
        "permissions": ["read", "write"]
    }
}

# JSON on separate lines
REQUEST user.create 
{ 
    "name": "John", 
    "email": "john@example.com" 
}
```

#### Simple Strings
```nats
# String on the same line
PUBLISH notification.send "Hello, World!"

# String on separate line
PUBLISH notification.send 
"Hello, World!"
```

#### randomId() Function
```nats
# Generate random UUID
REQUEST user.create 
{ 
    "id": randomId(),
    "name": "John",
    "parent_id": randomId()
}
```

## 🎮 Extension Commands

### Main Commands

| Command | Description |
|---------|-------------|
| `NATS: Connect` | Connect to NATS server |
| `NATS: Disconnect` | Disconnect from server |
| `NATS: Clear Saved Connection` | Clear saved connection settings |

### Code Lens Commands

| Button | Description |
|--------|-------------|
| **Subscribe** | Start subscription to subject |
| **Unsubscribe** | Stop subscription |
| **Send request** | Send request |
| **Publish** | Publish message |

## 📊 Output Data

### Global Channel
- **Name**: `NATS`
- **Contains**: Request responses, system messages

### Subscription Channels
- **Name**: `NATS - {subject}`
- **Contains**: Messages received via subscription

## ⚙️ Settings

### Auto-connection
The extension automatically connects to the last used server when VS Code starts.

### Settings Persistence
Server URL is saved in VS Code global settings and used for auto-connection.

## 🔧 Usage Examples

### API Testing
```nats
# Subscribe to events
SUBSCRIBE events.user.created

# Create user
REQUEST user.create 
{ 
    "name": "Alice",
    "email": "alice@example.com",
    "id": randomId()
}

# Send notification
PUBLISH notification.send 
{ 
    "user_id": randomId(),
    "message": "Welcome to our service!",
    "type": "welcome"
}
```

## 🐛 Troubleshooting

### Problem: "Not connected to nats server"
**Solution**: Execute `NATS: Connect` command and enter the correct server URL.

### Problem: Code Lens not appearing
**Solution**: 
1. Ensure the file has `.nats` extension
2. Check server connection
3. Reload VS Code window

### Problem: "nil body" in messages
**Solution**: Ensure data is properly formatted:
- JSON must be valid
- Strings must be in quotes
- Check multi-line JSON syntax

## 📚 Additional Resources

- [NATS Documentation](https://docs.nats.io/)
- [NATS Server](https://github.com/nats-io/nats-server)
- [NATS Client Libraries](https://docs.nats.io/developing-with-nats)

## 🤝 Support

If you encounter issues or have suggestions:
1. Create an Issue in the project repository
2. Describe the problem in detail
3. Attach a `.nats` file example if possible

## 📄 License

This project is distributed under the MIT license. See the `LICENSE` file for details.