# NATS VSCode Extension - Examples

This file contains practical examples of using the NATS VSCode Extension for different scenarios.

## 🏗️ Basic Examples

### Simple Messaging
```nats
# Subscribe to messages
SUBSCRIBE chat.messages

# Send a message
PUBLISH chat.messages "Hello, everyone!"

# Send a structured message
PUBLISH chat.messages { "user": "alice", "message": "Hello!", "timestamp": 1726233600 }
```

### Request-Response Pattern
```nats
# Subscribe to requests
SUBSCRIBE service.user.get

# Send a request
REQUEST service.user.get { "user_id": "123" }

# Send a request with random ID
REQUEST service.user.get { "user_id": randomId() }
```
