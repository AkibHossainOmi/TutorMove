# WebSocket API Documentation

---

## Overview

This WebSocket API enables real-time chat functionality for a user authenticated via JWT token. It supports sending/receiving messages, typing indicators, conversation management, message read tracking, and user search.

The consumer authenticates the user via JWT token passed as a query parameter during connection.

---

## WebSocket Connection

* **URL:** `ws://<your-domain>/ws/chat/?token=<JWT_TOKEN>`

  Replace `<your-domain>` with your backend WebSocket endpoint URL and provide the JWT token as `token` query param.

* **Example:**

  ```js
  const socket = new WebSocket("ws://localhost:8000/ws/chat/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
  ```

* If the token is missing or invalid, the connection will be immediately closed by the server.

---

## Message Format

All messages sent **to** or **from** the WebSocket are JSON objects with at least a `"type"` key indicating the action.

### Common keys in client -> server messages

| Key          | Description                       |
| ------------ | --------------------------------- |
| `type`       | The action/event type (see below) |
| Other fields | Depends on the action             |

---

## Supported Message Types (Client -> Server)

### 1. Send a chat message

```json
{
  "type": "chat.message",
  "conversation_id": 123,
  "content": "Hello!"
}
```

* Sends a chat message to the specified conversation.
* Server will broadcast this message to other participants and echo it back.

---

### 2. Send typing status

```json
{
  "type": "chat.typing",
  "receiver_id": 45,
  "is_typing": true
}
```

* Notify the `receiver_id` that the user is typing (`true` or `false`).

---

### 3. Mark messages as read

```json
{
  "type": "chat.read",
  "conversation_id": 123
}
```

* Marks all messages in the conversation as read by the current user.
* Notifies other participants about this event.

---

### 4. Search users

```json
{
  "type": "chat.search_user",
  "keyword": "john"
}
```

* Searches for users whose usernames contain the keyword.
* Server responds with matching user list.

---

### 5. Start or get existing conversation with a user

```json
{
  "type": "chat.start_conversation",
  "receiver_id": 45
}
```

* Starts a new conversation or returns an existing one with the given user.

---

### 6. Get all conversations of the user

```json
{
  "type": "chat.get_conversations"
}
```

* Requests the list of all conversations the user participates in.

---

### 7. Get messages for a conversation

```json
{
  "type": "chat.get_messages",
  "conversation_id": 123
}
```

* Requests all messages for a given conversation.

---

## Server -> Client Message Types

### 1. New chat message

```json
{
  "type": "chat.message",
  "message": {
    "id": 789,
    "conversation_id": 123,
    "sender": { "id": 1, "username": "alice" },
    "content": "Hello!",
    "timestamp": "2025-07-07T12:34:56.789Z",
    "is_system": false,
    "attachment": null
  }
}
```

* Broadcasted when a new message is created in a conversation.

---

### 2. Typing indicator

```json
{
  "type": "chat.typing",
  "sender_id": 1,
  "is_typing": true
}
```

* Indicates whether a participant is typing.

---

### 3. Message read notification

```json
{
  "type": "chat.read",
  "conversation_id": 123,
  "reader_id": 1
}
```

* Informs participants that a user has read messages in a conversation.

---

### 4. Search results

```json
{
  "type": "chat.search_results",
  "results": [
    { "id": 45, "username": "john_doe" },
    { "id": 46, "username": "john_smith" }
  ]
}
```

* Returned after a user search request.

---

### 5. Conversation started or retrieved

```json
{
  "type": "chat.conversation_started",
  "conversation": {
    "id": 123,
    "participants": [
      { "id": 1, "username": "alice" },
      { "id": 45, "username": "john_doe" }
    ]
  }
}
```

* Returned after starting or retrieving a conversation with a user.

---

### 6. Conversations list

```json
{
  "type": "chat.conversations",
  "conversations": [
    {
      "id": 123,
      "participants": [
        { "user__id": 1, "user__username": "alice" },
        { "user__id": 45, "user__username": "john_doe" }
      ]
    }
  ]
}
```

* List of conversations the user participates in.

---

### 7. Conversation messages

```json
{
  "type": "chat.messages",
  "messages": [
    {
      "id": 789,
      "conversation_id": 123,
      "sender": { "id": 1, "username": "alice" },
      "content": "Hello!",
      "timestamp": "2025-07-07T12:34:56.789Z",
      "is_system": false,
      "attachment": null
    }
  ]
}
```

* Full message history of a conversation.

---

## Summary Flow Example

1. Client connects with token:
   `ws://yourdomain/ws/chat/?token=<jwt_token>`

2. Client requests conversations:

   ```json
   { "type": "chat.get_conversations" }
   ```

3. Client selects a conversation and requests messages:

   ```json
   { "type": "chat.get_messages", "conversation_id": 123 }
   ```

4. Client sends messages:

   ```json
   {
     "type": "chat.message",
     "conversation_id": 123,
     "content": "Hello!"
   }
   ```

5. Client sends typing events:

   ```json
   {
     "type": "chat.typing",
     "receiver_id": 45,
     "is_typing": true
   }
   ```

6. Client searches users:

   ```json
   { "type": "chat.search_user", "keyword": "john" }
   ```

7. Client starts new conversation:

   ```json
   { "type": "chat.start_conversation", "receiver_id": 45 }
   ```

---

## Notes

* **Authentication:** JWT token is mandatory in the connection URL. Tokens are verified and decoded server-side.
* **Groups:** Each user joins a unique group `user_<user_id>` to receive real-time updates.
* **Message Persistence:** Messages are saved to the database and broadcasted to all conversation participants.
* **Typing Status:** Temporary "typing" status is communicated instantly, and automatically expires after 2 seconds client-side.
* **Read Receipts:** Users mark messages as read and notify others.
* **User Search:** Server filters users by username substring, excluding the current user.

