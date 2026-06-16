import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import {
  Search,
  Plus,
  Hash,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
  UserCircle,
  Edit2,
  Trash2,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Image,
  Bell,
  Clock,
  Sparkles,
  Info
} from "lucide-react";
import {
  fetchWorkspaceConversations,
  fetchConversationDetails,
  fetchConversationMessages,
  sendConversationMessage,
  markConversationAsRead,
  editConversationMessage,
  deleteConversationMessage,
  createConversation,
  fetchWorkspaceMembers
} from "../../services/conversationApi";
import { fetchWorkspaces } from "../../services/mockApi";

export default function Conversations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const workspaceIdParam = searchParams.get("workspaceId");

  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [conversationsList, setConversationsList] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messagesList, setMessagesList] = useState([]);
  const [workspaceMembersList, setWorkspaceMembersList] = useState([]);
  const [workspacesList, setWorkspacesList] = useState([]);
  
  // UI States
  const [inputText, setInputText] = useState("");
  const [selectedAssets, setSelectedAssets] = useState([]); // Mock selected attachments
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setHistoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [convSearchQuery, setConvSearchQuery] = useState("");
  
  // Message edit state
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  
  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newChatType, setNewChatType] = useState("Group"); // Group, Direct, Project_Channel
  const [newChatName, setNewChatName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  
  // Scroll & UI refs
  const scrollContainerRef = useRef(null);
  const isFetchingHistory = useRef(false);
  const [showNewMessageBanner, setShowNewMessageBanner] = useState(false);
  
  // Real-time Hub Simulation States
  const [connectionStatus, setConnectionStatus] = useState("Connected"); // Connected, Reconnecting, Disconnected
  const [isDevConsoleOpen, setIsDevConsoleOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState(null);
  const [eventLogs, setEventLogs] = useState([]);

  // Resolve Active Workspace ID
  useEffect(() => {
    async function resolveWorkspace() {
      try {
        const list = await fetchWorkspaces();
        setWorkspacesList(list);
        
        if (workspaceIdParam) {
          setActiveWorkspaceId(parseInt(workspaceIdParam));
          localStorage.setItem("lastActiveWorkspaceId", workspaceIdParam);
        } else {
          const storedId = localStorage.getItem("lastActiveWorkspaceId");
          if (storedId) {
            setActiveWorkspaceId(parseInt(storedId));
            setSearchParams({ workspaceId: storedId }, { replace: true });
          } else if (list.length > 0) {
            const firstId = list[0].workspaceId.toString();
            setActiveWorkspaceId(parseInt(firstId));
            localStorage.setItem("lastActiveWorkspaceId", firstId);
            setSearchParams({ workspaceId: firstId }, { replace: true });
          }
        }
      } catch (err) {
        console.error("Error loading workspaces:", err);
      }
    }
    resolveWorkspace();
  }, [workspaceIdParam, setSearchParams]);

  // Load Conversations and Members for the Active Workspace
  useEffect(() => {
    if (!activeWorkspaceId) return;

    let isSubscribed = true;
    async function loadConversations() {
      setIsLoading(true);
      try {
        const conversationsData = await fetchWorkspaceConversations(activeWorkspaceId);
        const membersData = await fetchWorkspaceMembers(activeWorkspaceId);
        
        if (isSubscribed) {
          setConversationsList(conversationsData);
          setWorkspaceMembersList(membersData);
          
          // Auto select first conversation if none is active
          if (conversationsData.length > 0) {
            handleSelectConversation(conversationsData[0]);
          } else {
            setActiveConversation(null);
            setMessagesList([]);
          }
        }
      } catch (err) {
        console.error("Error loading conversation data:", err);
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    loadConversations();
    return () => {
      isSubscribed = false;
    };
  }, [activeWorkspaceId]);

  // Handle Conversation Selection and Read Receipts
  const handleSelectConversation = async (conversation) => {
    setActiveConversation(conversation);
    setMessagesList([]);
    setEditingMessageId(null);
    setShowNewMessageBanner(false);
    
    // Clear unread count locally (Optimistic UI)
    setConversationsList(prev =>
      prev.map(c =>
        c.conversationId === conversation.conversationId
          ? { ...c, unreadCount: 0 }
          : c
      )
    );

    // Call REST endpoint to mark as read in background
    try {
      await markConversationAsRead(conversation.conversationId);
      logEvent(`REST: Mark read for conversation ${conversation.conversationId}`);
    } catch (err) {
      console.error("Error marking read:", err);
    }

    // Load message history
    try {
      const msgs = await fetchConversationMessages(conversation.conversationId, 20);
      setMessagesList(msgs);
      
      // Auto scroll to bottom
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 50);

      // Simulate SignalR: JoinConversation invoke call
      logEvent(`SignalR Hub: JoinConversation(${conversation.conversationId})`);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  // Scroll Anchoring & Pagination logic on Scroll
  const handleScroll = async (e) => {
    const container = e.target;
    if (!container || !activeConversation || isHistoryLoading) return;

    // Detect if we scrolled close to top (scrollTop <= 15px)
    if (container.scrollTop <= 15) {
      if (isFetchingHistory.current || messagesList.length === 0) return;
      
      const oldestMsg = messagesList[0];
      // Check if there are historical messages to fetch
      if (oldestMsg && oldestMsg.messageId && oldestMsg.messageId > 1) {
        isFetchingHistory.current = true;
        setHistoryLoading(true);
        logEvent(`REST API: Fetching history before messageId ${oldestMsg.messageId}`);
        
        try {
          const prevScrollHeight = container.scrollHeight;
          const prevScrollTop = container.scrollTop;
          
          // Fetch older messages (older messages are returned chronologically)
          const olderMessages = await fetchConversationMessages(
            activeConversation.conversationId,
            15,
            oldestMsg.messageId
          );
          
          if (olderMessages && olderMessages.length > 0) {
            setMessagesList(prev => [...olderMessages, ...prev]);
            
            // Adjust scroll position after render (Scroll Anchoring)
            setTimeout(() => {
              container.scrollTop = prevScrollTop + (container.scrollHeight - prevScrollHeight);
            }, 0);
          }
        } catch (err) {
          console.error("Error fetching history:", err);
        } finally {
          isFetchingHistory.current = false;
          setHistoryLoading(false);
        }
      }
    }
  };

  // Auto scroll to bottom when receiving new message
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || messagesList.length === 0) return;

    const lastMsg = messagesList[messagesList.length - 1];
    const isCurrentUserSender = lastMsg && lastMsg.senderId === 99;
    
    // Check if the user is currently looking at history (not near bottom)
    const isNearBottom = (container.scrollHeight - container.clientHeight - container.scrollTop) < 150;

    if (isCurrentUserSender || isNearBottom) {
      container.scrollTop = container.scrollHeight;
      setShowNewMessageBanner(false);
    } else {
      setShowNewMessageBanner(true);
    }
  }, [messagesList]);

  // Send message with Optimistic UI & Stable Keys
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!inputText.trim() && selectedAssets.length === 0) || !activeConversation) return;

    const textToSend = inputText.trim();
    const assetsToSend = [...selectedAssets];
    setInputText("");
    setSelectedAssets([]);

    // Generate optimistic tempId and message details
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const optimisticMsg = {
      messageId: null,
      tempId: tempId,
      conversationId: activeConversation.conversationId,
      senderId: 99,
      senderName: "Nguyễn Văn A",
      senderAvatarUrl: null,
      content: textToSend,
      createdAt: new Date().toISOString(),
      isEdited: false,
      isDeleted: false,
      isOptimistic: true,
      assets: assetsToSend.length > 0 ? assetsToSend.map((id) => ({
        assetId: id,
        assetName: id === 201 ? "regression_results.png" : "design_spec.png",
        assetType: id === 201 ? "image/png" : "application/pdf",
        fileSizeKB: 512,
        createdAt: new Date().toISOString()
      })) : null
    };

    // Prepend optimistic message to UI list immediately
    setMessagesList(prev => [...prev, optimisticMsg]);

    try {
      const realMsg = await sendConversationMessage(
        activeConversation.conversationId,
        textToSend,
        assetsToSend
      );

      // Swap temp placeholder with the database payload
      setMessagesList(prev => prev.map(m => (m.tempId === tempId ? realMsg : m)));
      
      // Update last message in active listing
      setConversationsList(prev => prev.map(c => 
        c.conversationId === activeConversation.conversationId 
          ? { 
              ...c, 
              lastMessageContent: realMsg.content || (realMsg.assets ? "[Tài liệu đính kèm]" : ""), 
              lastMessageAt: realMsg.createdAt 
            } 
          : c
      ));
      
      logEvent(`REST: Message created (ID: ${realMsg.messageId})`);
    } catch (err) {
      console.error("Failed to send message:", err);
      // Rollback optimistic message if call fails
      setMessagesList(prev => prev.filter(m => m.tempId !== tempId));
    }
  };

  // Edit message
  const handleStartEdit = (msg) => {
    setEditingMessageId(msg.messageId);
    setEditingText(msg.content);
  };

  const handleSaveEdit = async (msgId) => {
    if (!editingText.trim()) return;
    try {
      const updatedMsg = await editConversationMessage(msgId, editingText.trim());
      setMessagesList(prev => prev.map(m => m.messageId === msgId ? updatedMsg : m));
      
      // Update conversations list text if editing latest message
      if (activeConversation && messagesList[messagesList.length - 1]?.messageId === msgId) {
        setConversationsList(prev => prev.map(c => 
          c.conversationId === activeConversation.conversationId
            ? { ...c, lastMessageContent: updatedMsg.content }
            : c
        ));
      }
      setEditingMessageId(null);
      logEvent(`REST: Message edited (ID: ${msgId})`);
    } catch (err) {
      console.error("Error editing message:", err);
    }
  };

  // Soft Delete (Recall) Message
  const handleRecallMessage = async (msgId) => {
    if (!window.confirm("Bạn có muốn thu hồi tin nhắn này không?")) return;
    try {
      await deleteConversationMessage(msgId);
      
      // Update local state to reflect soft delete
      setMessagesList(prev => prev.map(m => 
        m.messageId === msgId 
          ? { ...m, content: "[Tin nhắn đã thu hồi]", isDeleted: true, assets: null }
          : m
      ));
      
      if (activeConversation && messagesList[messagesList.length - 1]?.messageId === msgId) {
        setConversationsList(prev => prev.map(c => 
          c.conversationId === activeConversation.conversationId
            ? { ...c, lastMessageContent: "[Tin nhắn đã thu hồi]" }
            : c
        ));
      }
      
      logEvent(`REST: Message recalled (ID: ${msgId})`);
    } catch (err) {
      console.error("Error recalling message:", err);
    }
  };

  // Helper log event for simulator
  const logEvent = (desc) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEventLogs(prev => [`[${time}] ${desc}`, ...prev.slice(0, 19)]);
  };

  // --- Real-time SignalR Event Simulator actions ---
  const simulateIncomingMessage = () => {
    if (!activeConversation) return;
    
    // Check connection state
    if (connectionStatus !== "Connected") {
      logEvent("SignalR Warning: Cannot receive event, hub is disconnected!");
      return;
    }

    const randomMember = workspaceMembersList.find(m => m.workspaceMemberId !== 99) 
      || { workspaceMemberId: 102, fullName: "Dr. Alyx Vance", avatarUrl: "https://i.pravatar.cc/150?u=2" };

    const randomMessages = [
      "Tôi vừa cập nhật lại file kế hoạch, mọi người xem qua nhé.",
      "Chỉ số latency của server đang hơi cao, tôi sẽ kiểm tra lại.",
      "Mọi người đã chuẩn bị xong file thuyết trình chưa?",
      "Tiến trình chạy neural net đã hoàn tất 90%.",
      "Tôi sẽ sửa lại phần CSS Layout cho đồng nhất."
    ];
    const text = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    const timeStr = new Date().toISOString();
    
    // Simulate real-time message payloads
    const allMsgs = messagesList.filter(m => m.messageId !== null);
    const newMsgId = allMsgs.length > 0 ? Math.max(...allMsgs.map(m => m.messageId)) + 1 : 1000;

    const pushPayload = {
      messageId: newMsgId,
      conversationId: activeConversation.conversationId,
      senderId: randomMember.workspaceMemberId,
      senderName: randomMember.fullName,
      senderAvatarUrl: randomMember.avatarUrl,
      content: text,
      createdAt: timeStr,
      isEdited: false,
      isDeleted: false,
      assets: Math.random() > 0.7 ? [{
        assetId: 500 + newMsgId,
        assetName: "regression_summary.png",
        assetType: "image/png",
        fileSizeKB: 256,
        createdAt: timeStr
      }] : null
    };

    // Push into message state using Functional Updates (Mitigate Closure Trap)
    setMessagesList(prev => [...prev, pushPayload]);
    
    // Update conversations list text
    setConversationsList(prev => prev.map(c => 
      c.conversationId === activeConversation.conversationId 
        ? { ...c, lastMessageContent: text, lastMessageAt: timeStr } 
        : c
    ));

    logEvent(`SignalR Push Event 'MessageCreated' received (Msg ID: ${newMsgId})`);
  };

  const simulateTeammateEdit = () => {
    if (!activeConversation || messagesList.length === 0) return;
    if (connectionStatus !== "Connected") {
      logEvent("SignalR Warning: Cannot receive event, hub is disconnected!");
      return;
    }

    // Find the latest message sent by another person that is not deleted
    const teammateMsgs = messagesList.filter(m => m.senderId !== 99 && !m.isDeleted && m.messageId);
    if (teammateMsgs.length === 0) {
      logEvent("SignalR Error: No teammate messages available to edit.");
      return;
    }

    const targetMsg = teammateMsgs[teammateMsgs.length - 1];
    const editPayload = {
      ...targetMsg,
      content: targetMsg.content + " (Nội dung đã chỉnh sửa qua WebSocket SignalR)",
      isEdited: true
    };

    // Functional Update to prevent closure trap
    setMessagesList(prev => prev.map(m => m.messageId === targetMsg.messageId ? editPayload : m));
    
    logEvent(`SignalR Push Event 'MessageEdited' received (Msg ID: ${targetMsg.messageId})`);
  };

  const simulateTeammateRecall = () => {
    if (!activeConversation || messagesList.length === 0) return;
    if (connectionStatus !== "Connected") {
      logEvent("SignalR Warning: Cannot receive event, hub is disconnected!");
      return;
    }

    // Find latest message sent by another person that is not deleted
    const teammateMsgs = messagesList.filter(m => m.senderId !== 99 && !m.isDeleted && m.messageId);
    if (teammateMsgs.length === 0) {
      logEvent("SignalR Error: No teammate messages available to recall.");
      return;
    }

    const targetMsg = teammateMsgs[teammateMsgs.length - 1];
    
    // Functional Update
    setMessagesList(prev => prev.map(m => 
      m.messageId === targetMsg.messageId 
        ? { ...m, content: "[Tin nhắn đã thu hồi]", isDeleted: true, assets: null }
        : m
    ));
    
    logEvent(`SignalR Push Event 'MessageDeleted' received (Msg ID: ${targetMsg.messageId})`);
  };

  const simulateNotification = () => {
    if (connectionStatus !== "Connected") {
      logEvent("SignalR Warning: Cannot receive event, hub is disconnected!");
      return;
    }

    const notifPayload = {
      notificationID: Math.floor(Math.random() * 1000) + 8000,
      notificationType: "TaskAssigned",
      title: "Công việc mới được giao",
      message: `Bạn vừa được giao công việc '${["Thiết kế Dashboard", "Tối ưu hóa Database", "Tích hợp SignalR Hub", "Lên tài liệu API"][Math.floor(Math.random() * 4)]}'`,
      referenceType: "Task",
      referenceID: 1000 + Math.floor(Math.random() * 50),
      isRead: false,
      readAt: null,
      createdAt: new Date().toISOString(),
      metadataJson: "{\"projectId\":3}"
    };

    setNotificationToast(notifPayload);
    logEvent(`SignalR Hub: Pushed 'ReceiveNotification' for current member`);
    
    // Auto clear toast after 6 seconds
    setTimeout(() => {
      setNotificationToast(prev => prev?.notificationID === notifPayload.notificationID ? null : prev);
    }, 6000);
  };

  const simulateConversationCleared = () => {
    if (!activeConversation) return;
    if (connectionStatus !== "Connected") {
      logEvent("SignalR Warning: Cannot receive event, hub is disconnected!");
      return;
    }

    // Soft delete conversation list state
    setConversationsList(prev => prev.filter(c => c.conversationId !== activeConversation.conversationId));
    setActiveConversation(null);
    setMessagesList([]);

    logEvent(`SignalR Push Event 'ConversationCleared' received. Room closed.`);
    alert("Cuộc hội thoại này đã bị giải tán/xóa bởi quản trị viên (simulated).");
  };

  // --- Create Conversation Flow ---
  const handleOpenCreateModal = () => {
    setNewChatName("");
    setNewChatType("Group");
    setSelectedMembers([99]); // Add current user by default
    setIsCreateModalOpen(true);
  };

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!activeWorkspaceId) return;

    if (newChatType !== "Direct" && !newChatName.trim()) {
      alert("Vui lòng nhập tên cuộc hội thoại!");
      return;
    }

    if (newChatType === "Direct" && selectedMembers.length !== 2) {
      alert("Hội thoại 1-1 phải có đúng 2 thành viên (Bạn và 1 người khác)!");
      return;
    }
    
    if (newChatType === "Group" && selectedMembers.length < 2) {
      alert("Hội thoại nhóm cần ít nhất 2 thành viên!");
      return;
    }

    try {
      let resolvedName = newChatName.trim();
      if (newChatType === "Direct") {
        // Find the other member to name the chat
        const otherId = selectedMembers.find(id => id !== 99);
        const otherMember = workspaceMembersList.find(m => m.workspaceMemberId === otherId);
        resolvedName = otherMember ? otherMember.fullName : "Trò chuyện trực tiếp";
      }

      const newConv = await createConversation(activeWorkspaceId, newChatType, resolvedName, selectedMembers);
      
      setConversationsList(prev => [newConv, ...prev]);
      setActiveConversation(newConv);
      setMessagesList([
        {
          messageId: 10001,
          conversationId: newConv.conversationId,
          senderId: 99,
          senderName: "Nguyễn Văn A",
          senderAvatarUrl: null,
          content: "Cuộc hội thoại mới được khởi tạo.",
          createdAt: new Date().toISOString(),
          isEdited: false,
          isDeleted: false,
          assets: null
        }
      ]);
      
      setIsCreateModalOpen(false);
      logEvent(`REST: Created new ${newChatType} conversation (ID: ${newConv.conversationId})`);
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  // Memoized message items processing: Grouping, Avatars and Time Dividers
  const groupedItems = useMemo(() => {
    if (!messagesList || messagesList.length === 0) return [];
    
    const items = [];
    let lastMsg = null;
    
    messagesList.forEach((msg) => {
      // 1. Time / Date Divider check
      let showDivider = false;
      let dividerText = "";
      
      const currentMsgDate = new Date(msg.createdAt);
      
      if (!lastMsg) {
        showDivider = true;
      } else {
        const lastMsgDate = new Date(lastMsg.createdAt);
        const timeDiff = currentMsgDate.getTime() - lastMsgDate.getTime();
        
        // Different day OR time gap > 1 hour
        const isDifferentDay = currentMsgDate.toDateString() !== lastMsgDate.toDateString();
        const isOverHour = timeDiff > 3600000;
        
        if (isDifferentDay || isOverHour) {
          showDivider = true;
        }
      }
      
      if (showDivider) {
        const dateObj = new Date(msg.createdAt);
        const todayStr = new Date().toDateString();
        const yesterdayStr = new Date(Date.now() - 86400000).toDateString();
        
        let timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (dateObj.toDateString() === todayStr) {
          dividerText = `Hôm nay, ${timeStr}`;
        } else if (dateObj.toDateString() === yesterdayStr) {
          dividerText = `Hôm qua, ${timeStr}`;
        } else {
          const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
          dividerText = `${dateStr}, ${timeStr}`;
        }
        
        items.push({
          type: "divider",
          key: `div-${msg.messageId || msg.tempId}`,
          text: dividerText
        });
      }
      
      // 2. Avatar/Name Grouping Collapse
      let isFirstInGroup = true;
      if (lastMsg && !showDivider) {
        const lastMsgDate = new Date(lastMsg.createdAt);
        const timeDiff = currentMsgDate.getTime() - lastMsgDate.getTime();
        
        // Same sender AND within 2 minutes AND both are not recalled
        const isSameSender = msg.senderId === lastMsg.senderId;
        const isWithinTwoMinutes = timeDiff < 120000;
        
        if (isSameSender && isWithinTwoMinutes && !msg.isDeleted && !lastMsg.isDeleted) {
          isFirstInGroup = false;
        }
      }
      
      items.push({
        type: "message",
        key: msg.messageId || msg.tempId,
        isFirstInGroup,
        message: msg
      });
      
      lastMsg = msg;
    });
    
    return items;
  }, [messagesList]);

  // Filter conversations List based on local query
  const filteredConversations = conversationsList.filter(c =>
    c.name.toLowerCase().includes(convSearchQuery.toLowerCase())
  );

  const channels = filteredConversations.filter(c => c.type === "Project_Channel" || c.type === "Group");
  const directMessages = filteredConversations.filter(c => c.type === "Direct");

  return (
    <div className="flex-1 h-full flex flex-row overflow-hidden relative text-slate-200">
      
      {/* 1. Left Column - Conversation List (Elevated layout bg-white/[0.02] matching theme) */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-white/[0.02] shrink-0">
        
        {/* Header Search Area */}
        <div className="p-4 border-b border-white/10 bg-black/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white tracking-wide">Trò chuyện</h2>
            <button 
              onClick={handleOpenCreateModal}
              className="w-7 h-7 rounded-md bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm hội thoại..."
              value={convSearchQuery}
              onChange={(e) => setConvSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-md pl-8 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
          
          {/* Channels Section */}
          <div>
            <h3 className="px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
              Kênh thảo luận
            </h3>
            <div className="space-y-0.5">
              {isLoading ? (
                <div className="text-xs text-slate-500 p-3">Đang tải...</div>
              ) : channels.length === 0 ? (
                <div className="text-[11px] text-slate-600 px-3 py-2">Không có kênh nào</div>
              ) : (
                channels.map((chan) => {
                  const isActive = activeConversation?.conversationId === chan.conversationId;
                  return (
                    <button
                      key={chan.conversationId}
                      onClick={() => handleSelectConversation(chan)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition text-left cursor-pointer ${
                        isActive
                          ? "bg-white/[0.08] text-white border-l-2 border-blue-500 font-medium"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <Hash className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="text-xs truncate">{chan.name}</span>
                      </div>
                      {chan.unreadCount > 0 && (
                        <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                          {chan.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div>
            <h3 className="px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">
              Tin nhắn trực tiếp
            </h3>
            <div className="space-y-0.5">
              {isLoading ? (
                null
              ) : directMessages.length === 0 ? (
                <div className="text-[11px] text-slate-600 px-3 py-2">Không có tin nhắn trực tiếp</div>
              ) : (
                directMessages.map((dm) => {
                  const isActive = activeConversation?.conversationId === dm.conversationId;
                  // Resolve member status or avatar for visual styling
                  const fallbackInitials = dm.name.slice(0, 2).toUpperCase();
                  
                  return (
                    <button
                      key={dm.conversationId}
                      onClick={() => handleSelectConversation(dm)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition text-left cursor-pointer ${
                        isActive
                          ? "bg-white/[0.08] text-white border-l-2 border-blue-500 font-medium"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300 overflow-hidden">
                          {fallbackInitials}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-black rounded-full"></span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-xs font-medium text-slate-200 truncate">{dm.name}</span>
                          {dm.lastMessageAt && (
                            <span className="text-[9px] text-slate-500 font-mono">
                              {new Date(dm.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{dm.lastMessageContent}</p>
                      </div>
                      {dm.unreadCount > 0 && (
                        <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                          {dm.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* SignalR Connection Panel Status */}
        <div className="p-3 border-t border-white/10 bg-black/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            {connectionStatus === "Connected" ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>SignalR Hub Connected</span>
              </>
            ) : connectionStatus === "Reconnecting" ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span className="text-amber-500">Reconnecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-rose-500">Disconnected</span>
              </>
            )}
          </div>
          <button 
            onClick={() => setConnectionStatus(prev => prev === "Connected" ? "Disconnected" : "Connected")}
            className="text-[10px] px-2 py-1 rounded bg-white/[0.05] border border-white/10 hover:bg-white/10 text-slate-300 font-mono cursor-pointer"
          >
            {connectionStatus === "Connected" ? "Mất mạng" : "Kết nối"}
          </button>
        </div>

      </div>

      {/* 2. Right Column - Chat Space (Main content) */}
      <div className="flex-1 flex flex-col bg-white/[0.01]">
        
        {activeConversation ? (
          <>
            {/* Active Header (Muted dark slate panel) */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  {activeConversation.type === "Project_Channel" ? (
                    <Hash className="w-4 h-4" />
                  ) : (
                    <UserCircle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm text-white leading-none">{activeConversation.name}</h2>
                    {activeConversation.type === "Project_Channel" && (
                      <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] px-1 rounded font-mono uppercase">
                        Project Channel
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {activeConversation.type === "Direct" ? "Trực tuyến" : `${workspaceMembersList.length} thành viên • Quản lý dự án`}
                  </div>
                </div>
              </div>

              {/* Developer Console Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDevConsoleOpen(!isDevConsoleOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono border transition cursor-pointer ${
                    isDevConsoleOpen 
                      ? "bg-purple-900/30 border-purple-500 text-purple-300"
                      : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SignalR Simulator Console</span>
                </button>
              </div>
            </div>

            {/* Chat message listing (Stateful Scroll Container) */}
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar relative"
            >
              
              {/* Pagination Spinner */}
              {isHistoryLoading && (
                <div className="flex items-center justify-center py-2 text-xs text-slate-500 gap-1.5 font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tải tin nhắn cũ...</span>
                </div>
              )}

              {/* Message items rendered inside useMemo Grouping */}
              {groupedItems.map((item) => {
                if (item.type === "divider") {
                  return (
                    <div key={item.key} className="chat-timeline-divider">
                      <span>{item.text}</span>
                    </div>
                  );
                }

                // Render Message Node
                const msg = item.message;
                const isMe = msg.senderId === 99;
                const isOptimistic = msg.isOptimistic;
                
                return (
                  <div 
                    key={item.key} 
                    className={`group flex gap-3 ${isMe ? "flex-row-reverse" : ""} ${
                      item.isFirstInGroup ? "mt-4" : "mt-0.5"
                    }`}
                  >
                    
                    {/* Render Avatar only if first in group */}
                    {item.isFirstInGroup ? (
                      <div className="shrink-0">
                        {msg.senderAvatarUrl ? (
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                            <img src={msg.senderAvatarUrl} alt={msg.senderName} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                            {msg.senderName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Placeholder spacer when collapsing
                      <div className="w-8 shrink-0"></div>
                    )}

                    {/* Chat Bubble Area */}
                    <div className={`flex flex-col max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
                      
                      {/* Name/Time Header only if first in group */}
                      {item.isFirstInGroup && (
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-medium text-slate-350">{msg.senderName}</span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}

                      {/* Text Bubble body */}
                      <div className="relative flex items-center gap-2">
                        
                        {/* Action buttons drawer when hovering on hover */}
                        {!msg.isDeleted && !isOptimistic && (
                          <div className={`opacity-0 group-hover:opacity-100 flex items-center gap-1 absolute top-1/2 -translate-y-1/2 transition z-10 ${
                            isMe ? "right-full mr-2" : "left-full ml-2"
                          }`}>
                            {isMe && (
                              <>
                                <button
                                  onClick={() => handleStartEdit(msg)}
                                  title="Chỉnh sửa"
                                  className="p-1 rounded bg-slate-800 border border-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleRecallMessage(msg.messageId)}
                                  title="Thu hồi"
                                  className="p-1 rounded bg-slate-850 border border-rose-500/20 text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        )}

                        {editingMessageId === msg.messageId ? (
                          /* Message Inline Editing Mode */
                          <div className="bg-slate-900 border border-blue-500/50 p-2 rounded-lg flex flex-col gap-2 min-w-[200px]">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full bg-slate-950 border border-white/10 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                              rows={2}
                            />
                            <div className="flex justify-end gap-1 text-[10px]">
                              <button 
                                onClick={() => setEditingMessageId(null)}
                                className="px-2 py-1 bg-white/[0.05] border border-white/10 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 cursor-pointer"
                              >
                                Hủy
                              </button>
                              <button 
                                onClick={() => handleSaveEdit(msg.messageId)}
                                className="px-2.5 py-1 bg-blue-600 rounded hover:bg-blue-500 text-white cursor-pointer"
                              >
                                Lưu
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Static Message Content display */
                          <div className={`px-4 py-2.5 rounded-2xl text-xs border ${
                            msg.isDeleted
                              ? "bg-transparent border-white/5 text-slate-600 italic font-mono" // recalled styling
                              : isMe
                                ? "bg-blue-600/90 border-blue-500/30 text-white rounded-tr-sm shadow-[0_0_15px_rgba(59,130,246,0.08)]"
                                : "bg-white/[0.06] border-white/5 text-slate-200 rounded-tl-sm"
                          } ${isOptimistic ? "opacity-60" : ""}`}>
                            
                            {/* Render text content */}
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            
                            {/* Render Edited Tag */}
                            {msg.isEdited && !msg.isDeleted && (
                              <span className="block text-[8px] text-slate-400 text-right mt-1 font-mono">
                                (đã chỉnh sửa)
                              </span>
                            )}

                            {/* Optimistic indicator spinner */}
                            {isOptimistic && (
                              <span className="block text-[8px] text-slate-400 mt-1 font-mono italic">
                                Đang gửi...
                              </span>
                            )}
                          </div>
                        )}

                      </div>

                      {/* Render Attachments/Assets if exists */}
                      {msg.assets && msg.assets.length > 0 && (
                        <div className={`flex flex-col gap-2 mt-2 w-full max-w-[280px]`}>
                          {msg.assets.map((asset) => {
                            const isImg = asset.assetType.startsWith("image/");
                            return (
                              <div 
                                key={asset.assetId} 
                                className="bg-slate-900/40 border border-white/5 rounded-lg overflow-hidden flex flex-col p-2 text-[11px]"
                              >
                                {isImg ? (
                                  /* Image Preview Panel */
                                  <div className="mb-2 rounded overflow-hidden max-h-32 bg-black/30 border border-white/10 flex items-center justify-center">
                                    <img 
                                      src="https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300" // mock visual
                                      alt={asset.assetName} 
                                      className="object-cover w-full h-full" 
                                    />
                                  </div>
                                ) : null}
                                <div className="flex items-center gap-2 text-slate-300">
                                  {isImg ? (
                                    <Image className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  ) : (
                                    <FileText className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                                  )}
                                  <span className="truncate flex-1 font-mono">{asset.assetName}</span>
                                  <span className="text-[9px] text-slate-500 shrink-0">{asset.fileSizeKB} KB</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}

            </div>

            {/* Floating New Messages Alert Banner */}
            {showNewMessageBanner && (
              <button
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                  }
                  setShowNewMessageBanner(false);
                }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-medium shadow-2xl flex items-center gap-2 transition animate-bounce z-25 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Có tin nhắn mới bên dưới. Cuộn xuống xem</span>
              </button>
            )}

            {/* Input Form area */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02]">
              
              {/* Draft Selected Attachments list */}
              {selectedAssets.length > 0 && (
                <div className="flex items-center gap-2 mb-3 bg-white/[0.03] border border-white/5 p-2 rounded-lg text-xs">
                  <span className="text-slate-400 font-mono">Đính kèm:</span>
                  {selectedAssets.map(id => (
                    <div key={id} className="bg-slate-800 border border-white/10 px-2 py-0.5 rounded flex items-center gap-1.5 text-slate-300">
                      <span>{id === 201 ? "regression_results.png" : "design_spec.png"}</span>
                      <button 
                        onClick={() => setSelectedAssets(prev => prev.filter(x => x !== id))}
                        className="text-slate-500 hover:text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="bg-white/[0.03] border border-white/10 rounded-xl p-2 flex items-end gap-2 focus-within:border-blue-500/40 transition-colors">
                
                {/* Paperclip selector triggers mock files selection */}
                <button
                  type="button"
                  title="Đính kèm file dự án"
                  onClick={() => {
                    const nextId = selectedAssets.includes(201) ? 202 : 201;
                    if (!selectedAssets.includes(nextId)) {
                      setSelectedAssets(prev => [...prev, nextId]);
                    }
                  }}
                  className="p-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer shrink-0"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    // Send message on Enter, Shift+Enter for newline
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  className="flex-1 bg-transparent border-none outline-none focus:ring-0 resize-none text-xs text-white placeholder-slate-500 min-h-[40px] max-h-32 py-2"
                  placeholder={`Nhập tin nhắn trong #${activeConversation.name}...`}
                  rows={1}
                />

                <div className="flex items-center gap-1 p-1 shrink-0">
                  <button 
                    type="button" 
                    className="p-2 text-slate-500 hover:text-slate-350 transition-colors cursor-pointer"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  <button 
                    type="submit"
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </form>

              <div className="flex justify-between items-center mt-2 px-2 text-[10px] text-slate-500 font-mono">
                <span>Dùng @ để nhắc tên đồng nghiệp.</span>
                <span>Enter để Gửi • Shift+Enter để xuống dòng</span>
              </div>
            </div>
          </>
        ) : (
          /* Empty Chat Room Selector screen */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white/[0.005]">
            <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-600 mb-4 shadow-inner">
              <UserCircle className="w-8 h-8" />
            </div>
            <h3 className="text-md font-bold text-white mb-1">Chưa có hội thoại nào được chọn</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              Chọn kênh thảo luận hoặc đồng nghiệp từ danh sách bên trái để bắt đầu nhắn tin và chia sẻ tài liệu.
            </p>
          </div>
        )}

      </div>

      {/* 3. Floating Simulator Toast Notification (ReceiveNotification Event) */}
      {notificationToast && (
        <div className="fixed top-6 right-6 w-80 bg-slate-900 border border-purple-500/40 rounded-xl p-4 shadow-2xl z-50 animate-slide-in flex gap-3 text-slate-200">
          <div className="w-9 h-9 rounded-full bg-purple-900/30 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="text-xs font-bold text-white truncate">{notificationToast.title}</h4>
              <button 
                onClick={() => setNotificationToast(null)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">{notificationToast.message}</p>
            <span className="text-[8px] text-slate-500 block text-right mt-2 font-mono">
              SignalR Notification Pushed
            </span>
          </div>
        </div>
      )}

      {/* 4. Real-time Event Simulator Panel Drawer Console */}
      {isDevConsoleOpen && (
        <div className="absolute right-4 top-16 bottom-24 w-80 bg-slate-950 border border-purple-500/20 rounded-xl flex flex-col shadow-2xl z-30 overflow-hidden font-mono text-[11px]">
          
          <div className="p-3 border-b border-white/10 bg-slate-900/60 flex items-center justify-between text-white">
            <span className="font-bold flex items-center gap-1.5 text-purple-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              SignalR Event Dispatcher
            </span>
            <button 
              onClick={() => setIsDevConsoleOpen(false)}
              className="text-slate-500 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-2 border-b border-white/10 bg-white/[0.01]">
            <span className="text-slate-400 font-bold">Pushes (Server to Client):</span>
            
            <button
              onClick={simulateIncomingMessage}
              disabled={!activeConversation}
              className="w-full text-left py-2 px-3 rounded bg-purple-900/20 hover:bg-purple-900/30 border border-purple-500/30 text-purple-300 hover:text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ⚡ MessageCreated (Nhận tin nhắn)
            </button>
            
            <button
              onClick={simulateTeammateEdit}
              disabled={!activeConversation}
              className="w-full text-left py-2 px-3 rounded bg-purple-900/20 hover:bg-purple-900/30 border border-purple-500/30 text-purple-300 hover:text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ⚡ MessageEdited (Sửa tin nhắn)
            </button>

            <button
              onClick={simulateTeammateRecall}
              disabled={!activeConversation}
              className="w-full text-left py-2 px-3 rounded bg-purple-900/20 hover:bg-purple-900/30 border border-purple-500/30 text-purple-300 hover:text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ⚡ MessageDeleted (Thu hồi tin nhắn)
            </button>

            <button
              onClick={simulateNotification}
              className="w-full text-left py-2 px-3 rounded bg-purple-900/20 hover:bg-purple-900/30 border border-purple-500/30 text-purple-300 hover:text-white cursor-pointer transition"
            >
              ⚡ ReceiveNotification (Nhận báo chuông)
            </button>

            <button
              onClick={simulateConversationCleared}
              disabled={!activeConversation}
              className="w-full text-left py-2 px-3 rounded bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:text-rose-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ⚡ ConversationCleared (Giải tán phòng)
            </button>
          </div>

          {/* Connection log trace */}
          <div className="flex-1 flex flex-col p-3 overflow-hidden bg-black/40">
            <span className="text-slate-500 font-bold mb-2">Live Web Socket Trace Logs:</span>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 text-[10px] text-slate-400">
              {eventLogs.length === 0 ? (
                <span className="text-slate-600 block">No connection events recorded yet. Try clicking the simulator push buttons above!</span>
              ) : (
                eventLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed border-b border-white/[0.02] pb-1 font-mono break-all">{log}</div>
                ))
              )}
            </div>
          </div>
          
        </div>
      )}

      {/* 5. Create Conversation/Channel Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          {/* Modal Container */}
          <div className="w-full max-w-2xl bg-neutral-950/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
              <h3 className="text-lg font-bold text-content-primary">Tạo cuộc hội thoại mới</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-content-muted hover:text-white p-1 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateChat} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
              
              {/* Classification Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-content-muted uppercase tracking-wider block">Phân loại hội thoại</label>
                <select
                  value={newChatType}
                  onChange={(e) => {
                    setNewChatType(e.target.value);
                    // Reset selected members checklist with current user only
                    setSelectedMembers([99]);
                  }}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white/20 hover:bg-white/[0.04] transition-all duration-200 text-content-primary"
                >
                  <option value="Group" className="bg-neutral-900">Nhóm chat</option>
                  <option value="Direct" className="bg-neutral-900">Hội thoại 1-1</option>
                  <option value="Project_Channel" className="bg-neutral-900">Kênh thảo luận dự án</option>
                </select>
              </div>

              {/* Conversation Title input */}
              {newChatType !== "Direct" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-content-muted uppercase tracking-wider block">Tên cuộc hội thoại / Kênh *</label>
                  <input
                    type="text"
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    placeholder={newChatType === "Project_Channel" ? "e.g. backend-discussion" : "e.g. Marketing Group Chat"}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-md px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-white/20 hover:bg-white/[0.04] transition-all duration-200"
                    required
                  />
                </div>
              )}

              {/* Members Checklist Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-content-muted uppercase tracking-wider block">
                  {newChatType === "Direct" ? "Chọn đồng nghiệp nhắn tin *" : "Chọn thành viên tham gia *"}
                </label>
                <div className="max-h-40 overflow-y-auto border border-white/10 rounded-md p-3 bg-white/[0.01] space-y-1.5 custom-scrollbar">
                  {workspaceMembersList.map((m) => {
                    const isMe = m.workspaceMemberId === 99;
                    if (isMe && newChatType === "Direct") return null;
                    
                    const isChecked = selectedMembers.includes(m.workspaceMemberId);
                    
                    return (
                      <label 
                        key={m.workspaceMemberId}
                        className="flex items-center justify-between p-2 rounded hover:bg-white/[0.03] cursor-pointer text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-[9px] font-bold text-slate-300 overflow-hidden shrink-0">
                            {m.avatarUrl ? (
                              <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              m.fullName.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <span className="text-content-secondary text-sm">{m.fullName}</span>
                          {isMe && <span className="text-[10px] text-content-muted font-mono ml-1">(Bạn)</span>}
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isMe}
                          onChange={() => toggleMemberSelection(m.workspaceMemberId)}
                          className="w-4 h-4 rounded border-white/10 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </label>
                    );
                  })}
                </div>
                {newChatType === "Direct" && (
                  <p className="text-[10px] text-content-muted font-mono mt-1">
                    * Đã chọn {selectedMembers.filter(id => id !== 99).length} / 1 đồng nghiệp.
                  </p>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="border-t border-white/10 pt-5 flex justify-end gap-3 bg-transparent">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-white/10 rounded-md bg-white/5 text-slate-350 hover:bg-white/10 hover:text-white text-sm font-medium transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-slate-200 hover:bg-white text-neutral-950 text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 cursor-pointer animate-none"
                >
                  Tạo cuộc hội thoại
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

