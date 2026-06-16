// Stateful Mock API client for Conversations and Messages in Alloc
// Mimics async latency (300ms) and persists data in module memory.

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Workspace Members
const workspaceMembers = {
  12: [
    { workspaceMemberId: 99, resourceId: 5, fullName: "Nguyễn Văn A", avatarUrl: null, role: "Owner" },
    { workspaceMemberId: 101, resourceId: 101, fullName: "Dr. Elias Vance", avatarUrl: "https://i.pravatar.cc/150?u=1", role: "Lead Researcher" },
    { workspaceMemberId: 102, resourceId: 102, fullName: "Dr. Alyx Vance", avatarUrl: "https://i.pravatar.cc/150?u=2", role: "Data Scientist" },
    { workspaceMemberId: 103, resourceId: 103, fullName: "Isaac Kleiner", avatarUrl: null, role: "Theoretical Physicist" },
    { workspaceMemberId: 104, resourceId: 104, fullName: "Barney Calhoun", avatarUrl: "https://i.pravatar.cc/150?u=4", role: "Security Officer" },
    { workspaceMemberId: 105, resourceId: 105, fullName: "Wallace Breen", avatarUrl: "https://i.pravatar.cc/150?u=5", role: "Administrator" }
  ],
  13: [
    { workspaceMemberId: 99, resourceId: 5, fullName: "Nguyễn Văn A", avatarUrl: null, role: "Developer" },
    { workspaceMemberId: 110, resourceId: 110, fullName: "Gordon Freeman", avatarUrl: "https://i.pravatar.cc/150?u=Freeman", role: "Research Associate" },
    { workspaceMemberId: 111, resourceId: 111, fullName: "G-Man", avatarUrl: null, role: "Observer" }
  ]
};

// Stateful Conversations Database
let conversations = [
  {
    conversationId: 45,
    workspaceId: 12,
    projectId: 3,
    name: "project-alpha",
    type: "Project_Channel",
    lastMessageContent: "@here Just an update: the budget for Q4 compute has been approved.",
    lastMessageAt: "2026-06-15T10:45:00Z",
    unreadCount: 0
  },
  {
    conversationId: 46,
    workspaceId: 12,
    projectId: null,
    name: "budget-discussion",
    type: "Group",
    lastMessageContent: "Budget is fixed for this quarter. Optimize your codes.",
    lastMessageAt: "2026-06-13T11:00:00Z",
    unreadCount: 2
  },
  {
    conversationId: 47,
    workspaceId: 12,
    projectId: null,
    name: "Dr. Elias Vance",
    type: "Direct",
    lastMessageContent: "The regression models are ready for review.",
    lastMessageAt: "2026-06-15T10:42:00Z",
    unreadCount: 1
  },
  {
    conversationId: 48,
    workspaceId: 12,
    projectId: null,
    name: "Dr. Alyx Vance",
    type: "Direct",
    lastMessageContent: "Have you checked the latest dataset?",
    lastMessageAt: "2026-06-14T15:30:00Z",
    unreadCount: 0
  },
  {
    conversationId: 49,
    workspaceId: 12,
    projectId: null,
    name: "Isaac Kleiner",
    type: "Direct",
    lastMessageContent: "I'll prepare the anomalous materials report.",
    lastMessageAt: "2026-06-14T09:00:00Z",
    unreadCount: 0
  },
  // Workspace 13 Conversations
  {
    conversationId: 1301,
    workspaceId: 13,
    projectId: 1,
    name: "neural-optimization",
    type: "Project_Channel",
    lastMessageContent: "Welcome to neural net discussions.",
    lastMessageAt: "2026-06-12T08:00:00Z",
    unreadCount: 0
  },
  {
    conversationId: 1302,
    workspaceId: 13,
    projectId: null,
    name: "Gordon Freeman",
    type: "Direct",
    lastMessageContent: "Looking forward to working together.",
    lastMessageAt: "2026-06-12T09:00:00Z",
    unreadCount: 0
  }
];

// Stateful Message Histories
let messages = {
  45: [
    {
      messageId: 501,
      conversationId: 45,
      senderId: 101,
      senderName: "Dr. Elias Vance",
      senderAvatarUrl: "https://i.pravatar.cc/150?u=1",
      content: "I've uploaded the initial findings for the dataset. We need to normalize variables before running the next models.",
      createdAt: "2026-06-14T09:14:00Z",
      isEdited: false,
      isDeleted: false,
      assets: [
        {
          assetId: 201,
          assetName: "regression_results.png",
          assetType: "image/png",
          fileSizeKB: 512,
          createdAt: "2026-06-14T09:14:00Z"
        },
        {
          assetId: 202,
          assetName: "data_normalization.csv",
          assetType: "text/csv",
          fileSizeKB: 84,
          createdAt: "2026-06-14T09:14:00Z"
        }
      ]
    },
    {
      messageId: 502,
      conversationId: 45,
      senderId: 101,
      senderName: "Dr. Elias Vance",
      senderAvatarUrl: "https://i.pravatar.cc/150?u=1",
      content: "Can someone review the script I pushed to the repository?",
      createdAt: "2026-06-14T09:16:00Z",
      isEdited: false,
      isDeleted: false,
      assets: null
    },
    {
      messageId: 503,
      conversationId: 45,
      senderId: 99, // Current User
      senderName: "Nguyễn Văn A",
      senderAvatarUrl: null,
      content: "Sure, I'll take a look at the script right away. I'm currently working on the literature review draft.",
      createdAt: "2026-06-15T10:02:00Z",
      isEdited: false,
      isDeleted: false,
      assets: null
    },
    {
      messageId: 504,
      conversationId: 45,
      senderId: 102,
      senderName: "Dr. Alyx Vance",
      senderAvatarUrl: "https://i.pravatar.cc/150?u=2",
      content: "@here Just an update: the budget for Q4 compute has been approved. We can scale up our ML models.",
      createdAt: "2026-06-15T10:45:00Z",
      isEdited: false,
      isDeleted: false,
      assets: null
    }
  ],
  46: [
    {
      messageId: 601,
      conversationId: 46,
      senderId: 103,
      senderName: "Isaac Kleiner",
      senderAvatarUrl: null,
      content: "We should allocate more budget to server infrastructure.",
      createdAt: "2026-06-13T10:00:00Z",
      isEdited: false,
      isDeleted: false,
      assets: null
    },
    {
      messageId: 602,
      conversationId: 46,
      senderId: 105,
      senderName: "Wallace Breen",
      senderAvatarUrl: "https://i.pravatar.cc/150?u=5",
      content: "Budget is fixed for this quarter. Optimize your codes.",
      createdAt: "2026-06-13T11:00:00Z",
      isEdited: false,
      isDeleted: false,
      assets: null
    }
  ],
  47: [
    {
      messageId: 701,
      conversationId: 47,
      senderId: 101,
      senderName: "Dr. Elias Vance",
      senderAvatarUrl: "https://i.pravatar.cc/150?u=1",
      content: "The regression models are ready for review.",
      createdAt: "2026-06-15T10:42:00Z",
      isEdited: false,
      isDeleted: false,
      assets: null
    }
  ],
  48: [
    {
      messageId: 801,
      conversationId: 48,
      senderId: 102,
      senderName: "Dr. Alyx Vance",
      senderAvatarUrl: "https://i.pravatar.cc/150?u=2",
      content: "Have you checked the latest dataset?",
      createdAt: "2026-06-14T15:30:00Z",
      isEdited: false,
      isDeleted: false,
      assets: null
    }
  ],
  49: [
    {
      messageId: 901,
      conversationId: 49,
      senderId: 103,
      senderName: "Isaac Kleiner",
      senderAvatarUrl: null,
      content: "I'll prepare the anomalous materials report.",
      createdAt: "2026-06-14T09:00:00Z",
      isEdited: false,
      isDeleted: false,
      assets: null
    }
  ],
  1301: [
    {
      messageId: 13001,
      conversationId: 1301,
      senderId: 110,
      senderName: "Gordon Freeman",
      senderAvatarUrl: "https://i.pravatar.cc/150?u=Freeman",
      content: "Welcome to neural net discussions.",
      createdAt: "2026-06-12T08:00:00Z",
      isEdited: false,
      isDeleted: false,
      assets: null
    }
  ],
  1302: [
    {
      messageId: 13002,
      conversationId: 1302,
      senderId: 110,
      senderName: "Gordon Freeman",
      senderAvatarUrl: "https://i.pravatar.cc/150?u=Freeman",
      content: "Looking forward to working together.",
      createdAt: "2026-06-12T09:00:00Z",
      isEdited: false,
      isDeleted: false,
      assets: null
    }
  ]
};

// Seed older history for project-alpha (to test pagination)
const extraHistory = Array.from({ length: 30 }, (_, i) => {
  const id = 300 - i;
  const daysOffset = 3 + Math.floor(i / 5);
  const hour = 8 + (i % 8);
  const minute = 10 + (i % 45);
  const dateStr = `2026-06-${(15 - daysOffset).toString().padStart(2, "0")}T${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00Z`;
  
  return {
    messageId: id,
    conversationId: 45,
    senderId: i % 2 === 0 ? 101 : 102,
    senderName: i % 2 === 0 ? "Dr. Elias Vance" : "Dr. Alyx Vance",
    senderAvatarUrl: i % 2 === 0 ? "https://i.pravatar.cc/150?u=1" : "https://i.pravatar.cc/150?u=2",
    content: `Tin nhắn lịch sử số ${i + 1} về chủ đề Project Alpha. Đây là dữ liệu giả lập từ server backend C#.`,
    createdAt: dateStr,
    isEdited: false,
    isDeleted: false,
    assets: i === 12 ? [
      {
        assetId: 300 + i,
        assetName: "alpha_roadmap.pdf",
        assetType: "application/pdf",
        fileSizeKB: 2048,
        createdAt: dateStr
      }
    ] : null
  };
});

// Prepend the old history to project-alpha message list
messages[45] = [...extraHistory.reverse(), ...messages[45]];

// Helper to clone JSON
const clone = (data) => JSON.parse(JSON.stringify(data));

// HTTP REST Methods

// GET /api/v1/workspaces/{workspaceId}/conversations
export async function fetchWorkspaceConversations(workspaceId) {
  await delay();
  const wId = parseInt(workspaceId);
  const filtered = conversations.filter((c) => c.workspaceId === wId);
  return clone(filtered);
}

// GET /api/v1/conversations/{conversationId}
export async function fetchConversationDetails(conversationId) {
  await delay();
  const cId = parseInt(conversationId);
  const conv = conversations.find((c) => c.conversationId === cId);
  if (!conv) throw new Error("ConversationNotFound");
  
  const wId = conv.workspaceId;
  const members = workspaceMembers[wId] || [];
  
  return clone({
    ...conv,
    members: members.map(m => ({
      workspaceMemberId: m.workspaceMemberId,
      resourceId: m.resourceId,
      fullName: m.fullName,
      avatarUrl: m.avatarUrl,
      joinedAt: conv.createdAt || "2026-06-10T12:00:00Z",
      lastReadAt: new Date().toISOString()
    }))
  });
}

// GET /api/v1/conversations/{conversationId}/messages
// Implements cursor-based pagination using the beforeMessageId query parameter
export async function fetchConversationMessages(conversationId, pageSize = 20, beforeMessageId = null) {
  await delay();
  const cId = parseInt(conversationId);
  const chatMessages = messages[cId] || [];
  
  let filtered = [...chatMessages];
  if (beforeMessageId) {
    const cursor = parseInt(beforeMessageId);
    filtered = filtered.filter((m) => m.messageId < cursor);
  }
  
  // Sort descending by ID to get the newest messages first (cursor pagination standard)
  filtered.sort((a, b) => b.messageId - a.messageId);
  
  // Take the page size
  const pageItems = filtered.slice(0, pageSize);
  
  // Return reversed pageItems so they are in chronological order (oldest to newest) for the UI
  return clone(pageItems.reverse());
}

// POST /api/v1/conversations/{conversationId}/messages
export async function sendConversationMessage(conversationId, content, assetIds = []) {
  await delay();
  const cId = parseInt(conversationId);
  if (!messages[cId]) {
    messages[cId] = [];
  }
  
  const allMsgs = Object.values(messages).flat();
  const newId = Math.max(...allMsgs.map(m => m.messageId), 0) + 1;
  
  let assets = null;
  if (assetIds && assetIds.length > 0) {
    assets = assetIds.map((id, index) => ({
      assetId: id,
      assetName: `file_attached_${id}.${id === 201 ? "png" : "pdf"}`,
      assetType: id === 201 ? "image/png" : "application/pdf",
      fileSizeKB: 256 * (index + 1),
      createdAt: new Date().toISOString()
    }));
  }
  
  const newMsg = {
    messageId: newId,
    conversationId: cId,
    senderId: 99, // Current User
    senderName: "Nguyễn Văn A",
    senderAvatarUrl: null,
    content: content || "",
    createdAt: new Date().toISOString(),
    isEdited: false,
    isDeleted: false,
    assets: assets
  };
  
  messages[cId].push(newMsg);
  
  // Update last message in conversation list
  const conv = conversations.find((c) => c.conversationId === cId);
  if (conv) {
    conv.lastMessageContent = content || (assets ? "[Tài liệu đính kèm]" : "");
    conv.lastMessageAt = newMsg.createdAt;
  }
  
  return clone(newMsg);
}

// PUT /api/v1/conversations/{conversationId}/read
export async function markConversationAsRead(conversationId) {
  await delay();
  const cId = parseInt(conversationId);
  const conv = conversations.find((c) => c.conversationId === cId);
  if (conv) {
    conv.unreadCount = 0;
  }
  return clone({ success: true, message: "Đã đánh dấu đọc." });
}

// PUT /api/v1/messages/{messageId}
export async function editConversationMessage(messageId, content) {
  await delay();
  const mId = parseInt(messageId);
  
  let found = null;
  for (const cId in messages) {
    const msg = messages[cId].find((m) => m.messageId === mId);
    if (msg) {
      msg.content = content;
      msg.isEdited = true;
      found = msg;
      break;
    }
  }
  
  if (!found) throw new Error("MessageNotFound");
  return clone(found);
}

// DELETE /api/v1/messages/{messageId}
export async function deleteConversationMessage(messageId) {
  await delay();
  const mId = parseInt(messageId);
  
  let found = false;
  for (const cId in messages) {
    const idx = messages[cId].findIndex((m) => m.messageId === mId);
    if (idx !== -1) {
      messages[cId][idx] = {
        ...messages[cId][idx],
        content: "[Tin nhắn đã thu hồi]",
        isDeleted: true,
        assets: null
      };
      found = true;
      
      // Update last message in conversation list if this was the last message
      const conv = conversations.find((c) => c.conversationId === parseInt(cId));
      if (conv && conv.lastMessageAt === messages[cId][idx].createdAt) {
        conv.lastMessageContent = "[Tin nhắn đã thu hồi]";
      }
      break;
    }
  }
  
  if (!found) throw new Error("MessageNotFound");
  return { success: true };
}

// POST /api/v1/workspaces/{workspaceId}/conversations
export async function createConversation(workspaceId, type, name, workspaceMemberIds) {
  await delay();
  const wId = parseInt(workspaceId);
  
  const allConvs = conversations;
  const newId = Math.max(...allConvs.map(c => c.conversationId), 0) + 1;
  
  const newConv = {
    conversationId: newId,
    workspaceId: wId,
    projectId: type === "Project_Channel" ? 3 : null, // Default mock association if channel
    name: name || "New Conversation",
    type: type, // 'Direct', 'Group', 'Project_Channel'
    lastMessageContent: "Cuộc hội thoại mới được khởi tạo.",
    lastMessageAt: new Date().toISOString(),
    unreadCount: 0
  };
  
  conversations.push(newConv);
  messages[newId] = [
    {
      messageId: Math.max(...Object.values(messages).flat().map(m => m.messageId), 0) + 1,
      conversationId: newId,
      senderId: 99,
      senderName: "Nguyễn Văn A",
      senderAvatarUrl: null,
      content: "Cuộc hội thoại mới được khởi tạo.",
      createdAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false,
      assets: null
    }
  ];
  
  return clone(newConv);
}

// GET workspace members for creation dialogs
export async function fetchWorkspaceMembers(workspaceId) {
  await delay();
  const wId = parseInt(workspaceId);
  return clone(workspaceMembers[wId] || []);
}
