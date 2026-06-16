# SignalR Real-Time Event Documentation

This document outlines the real-time websocket connections, client methods, and server-to-client push events for the AllocServer. These hubs support the real-time chat, read receipts, and push notifications for clients using `@microsoft/signalr` or other compatible client libraries (such as Blazor client applications).

---

## General Authentication

Since web browsers do not support custom headers during WebSockets handshakes, authentication tokens must be passed in the URL query string parameter `access_token`. 

The server intercepts this parameter on connection request for SignalR routes, validates the JWT, and sets the user connection context:
- **Query Parameter:** `?access_token=YOUR_JWT_TOKEN`
- **Example connection builder (Blazor / C#):**
  ```csharp
  var hubConnection = new HubConnectionBuilder()
      .WithUrl("https://your-server.com/hubs/conversation", options =>
      {
          options.AccessTokenProvider = () => Task.FromResult(jwtToken);
      })
      .WithAutomaticReconnect()
      .Build();
  ```

---

## 1. Conversation Hub (`/hubs/conversation`)

**Route Endpoint:** `/hubs/conversation`  
**Description:** Manages real-time group chat rooms, message updates, and conversation read receipts.

### Group Membership Lifecycle
Upon connection (`OnConnectedAsync`), the server resolves all **active** workspace memberships for the authenticated user and automatically adds their connection ID to:
- A user group: `user:{workspaceMemberId}`
- A workspace group: `workspace:{workspaceId}` for each workspace they belong to.

To receive messages for a specific conversation, the client must explicitly invoke `JoinConversation` on the hub.

---

### Client-to-Server Methods (Invocations)

Clients can invoke the following methods on the server connection:

#### JoinConversation
- **Method Name:** `JoinConversation`
- **Parameters:**
  - `conversationId` (`integer`): Target Conversation ID to join.
- **Description:** Joins the real-time chat room group `conversation:{conversationId}`. Validates that the user has active membership in the conversation.
- **Errors:** Throws a `HubException` if the token is invalid or if the user lacks active access permissions.
- **Blazor Invocation Example:**
  ```csharp
  await hubConnection.SendAsync("JoinConversation", conversationId);
  ```

#### LeaveConversation
- **Method Name:** `LeaveConversation`
- **Parameters:**
  - `conversationId` (`integer`): Target Conversation ID to leave.
- **Description:** Leaves the chat room group `conversation:{conversationId}` and stops receiving real-time events for it.
- **Blazor Invocation Example:**
  ```csharp
  await hubConnection.SendAsync("LeaveConversation", conversationId);
  ```

---

### Server-to-Client Events (Pushes)

The server pushes events to client listeners subscribed to the following event names:

#### MessageCreated
- **Event Name:** `MessageCreated`
- **Group Target:** `conversation:{conversationId}`
- **Trigger Condition:** Fired when a user sends a new message using the `POST /api/v1/conversations/{conversationId}/messages` endpoint.
- **Payload Schema & Example:**
  ```json
  {
    "messageId": 502,
    "conversationId": 45,
    "senderId": 99,
    "senderName": "Nguyễn Văn A",
    "senderAvatarUrl": "https://example.com/avatar1.jpg",
    "content": "Đây là tài liệu đặc tả thiết kế mới.",
    "createdAt": "2026-06-13T01:10:00Z",
    "isEdited": false,
    "isDeleted": false,
    "assets": [
      {
        "assetId": 201,
        "assetName": "design_spec.png",
        "assetType": "image/png",
        "fileSizeKB": 512,
        "createdAt": "2026-06-13T00:30:00Z"
      }
    ]
  }
  ```

#### MessageEdited
- **Event Name:** `MessageEdited`
- **Group Target:** `conversation:{conversationId}`
- **Trigger Condition:** Fired when a user updates their message text content using the `PUT /api/v1/messages/{messageId}` endpoint.
- **Payload Schema & Example:**
  ```json
  {
    "messageId": 501,
    "conversationId": 45,
    "senderId": 99,
    "senderName": "Nguyễn Văn A",
    "senderAvatarUrl": "https://example.com/avatar1.jpg",
    "content": "Nội dung tin nhắn đã được chỉnh sửa.",
    "createdAt": "2026-06-13T01:05:00Z",
    "isEdited": true,
    "isDeleted": false,
    "assets": [
      {
        "assetId": 201,
        "assetName": "design_spec.png",
        "assetType": "image/png",
        "fileSizeKB": 512,
        "createdAt": "2026-06-13T00:30:00Z"
      }
    ]
  }
  ```

#### MessageDeleted
- **Event Name:** `MessageDeleted`
- **Group Target:** `conversation:{conversationId}`
- **Trigger Condition:** Fired when a user recalls (soft-deletes) their message using the `DELETE /api/v1/messages/{messageId}` endpoint.
- **Payload Schema & Example:**
  ```json
  {
    "messageId": 501,
    "conversationId": 45,
    "senderId": 99,
    "senderName": "Nguyễn Văn A",
    "senderAvatarUrl": "https://example.com/avatar1.jpg",
    "content": "[Tin nhan da thu hoi]",
    "createdAt": "2026-06-13T01:05:00Z",
    "isEdited": false,
    "isDeleted": true,
    "assets": null
  }
  ```

#### ConversationRead
- **Event Name:** `ConversationRead`
- **Group Target:** `conversation:{conversationId}` and `user:{workspaceMemberId}`
- **Trigger Condition:** Fired when a member marks a conversation as read via `PUT/POST /api/v1/conversations/{conversationId}/read` to update unread counts.
- **Payload Schema & Example:**
  ```json
  {
    "conversationId": 45,
    "memberId": 99,
    "lastReadAt": "2026-06-13T02:00:00Z"
  }
  ```

#### ConversationCleared
- **Event Name:** `ConversationCleared`
- **Group Target:** `conversation:{conversationId}`
- **Trigger Condition:** Fired when a group conversation is soft-deleted/disbanded via the `DELETE /api/v1/conversations/{conversationId}` endpoint.
- **Payload Schema & Example:**
  ```json
  {
    "conversationId": 45,
    "deletedBy": 99
  }
  ```

---

## 2. Notification Hub (`/hubs/notifications`)

**Route Endpoint:** `/hubs/notifications`  
**Description:** Dispatches real-time alerts and inbox notification signals directly to specific active workspace members.

### Group Membership Lifecycle
Upon connection (`OnConnectedAsync`), the server resolves all **active** workspace memberships for the authenticated user and automatically adds their connection ID to:
- A user group: `user:{workspaceMemberId}` for each workspace where they are active.

This allows the background dispatch system to target users individually across their active workspace profile identities.

---

### Client-to-Server Methods (Invocations)
There are no client-to-server invokable methods defined on this Hub. The client connection operates strictly as a receiver for pushed notifications.

---

### Server-to-Client Events (Pushes)

#### ReceiveNotification
- **Event Name:** `ReceiveNotification`
- **Group Target:** `user:{workspaceMemberId}`
- **Trigger Condition:** Dispatched by the background `NotificationDispatcherService` whenever a new notification is queued for an active workspace member (e.g., Task Assigned, Comment Reply, Risk Warning).
- **Payload Schema & Example:**
  ```json
  {
    "notificationID": 8001,
    "notificationType": "TaskAssigned",
    "title": "Công việc mới được giao",
    "message": "Bạn đã được giao công việc 'Thiết kế Database'.",
    "referenceType": "Task",
    "referenceID": 1001,
    "isRead": false,
    "readAt": null,
    "createdAt": "2026-06-13T02:00:00Z",
    "metadataJson": "{\"projectId\":15}",
    "referenceData": null
  }
  ```
