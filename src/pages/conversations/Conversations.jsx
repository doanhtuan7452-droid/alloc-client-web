import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import {
  Search,
  Plus,
  Hash,
  Paperclip,
  Send,
  Smile,
  UserCircle,
  Edit2,
  Trash2,
  Wifi,
  WifiOff,
  X,
  FileText,
  Image,
  Bell,
  Sparkles,
} from "lucide-react";
import {
  fetchWorkspaceConversations,
  fetchConversationMessages,
  sendConversationMessage,
  markConversationAsRead,
  editConversationMessage,
  deleteConversationMessage,
  createConversation,
  fetchWorkspaceMembers,
} from "../../services/conversationApi";

export default function Conversations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isCreatingParam = searchParams.get("isCreating");
  const workspaceIdParam = searchParams.get("workspaceId");



  const { currentUser, currentWorkspaceRole, switchWorkspace } = useUser();
  const isWorkspaceOwner = currentWorkspaceRole?.roleName?.toLowerCase() === "owner";

  // 1. ĐƯA TẤT CẢ STATE LÊN TRÊN CÙNG ĐỂ TRÁNH LỖI HOISTING/HOOKS
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [conversationsList, setConversationsList] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messagesList, setMessagesList] = useState([]);
  const [workspaceMembersList, setWorkspaceMembersList] = useState([]);

  // UI States
  const [inputText, setInputText] = useState("");
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState("all");

  // Modal Tạo Chat States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newChatType, setNewChatType] = useState("Group"); 
  const [newChatName, setNewChatName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]); 

  // Message Actions States
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");

  const messagesEndRef = useRef(null);

  const myAccountId = currentUser?.accountId;

  const myMemberId = useMemo(() => {
    if (!currentUser?.profile?.resourceId) return null;

    const me = workspaceMembersList.find(
      (m) =>
        m.resource?.resourceId === currentUser.profile.resourceId
    );

    return me?.workspaceMemberId ?? null;
  }, [currentUser, workspaceMembersList]);


  // 3. THEO DÕI TRẠNG THÁI MẠNG (ĐẢM BẢO CÓ DẤU ; RÕ RÀNG)
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Đồng bộ Workspace ID từ URL và tải danh sách cuộc trò chuyện, thành viên
  useEffect(() => {
    if (!workspaceIdParam) return;

    const wId = parseInt(workspaceIdParam);
    setActiveWorkspaceId(wId);
    switchWorkspace(wId);
    const loadData = async () => {
      try {
        const res = await fetchWorkspaceConversations(wId);
        const list = res?.data || res || []; 
        setConversationsList(list);

        if (isCreatingParam !== "true" && list.length > 0) {
          setActiveConversation(list[0]);
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách cuộc hội thoại:", err);
        setConversationsList([]);
      }

      try {
        const members = await fetchWorkspaceMembers(wId);
        setWorkspaceMembersList(members || []);
      } catch (err) {
        console.error("Lỗi khi tải thành viên workspace:", err);
        setWorkspaceMembersList([]);
      }
    };

    loadData();
  }, [workspaceIdParam, isCreatingParam]);

  // Tải lịch sử tin nhắn khi chọn phòng hội thoại
  useEffect(() => {
    if (activeConversation?.conversationId) {
      fetchConversationMessages(activeConversation.conversationId)
        .then((res) => {
          const msgs = res.data?.items || res.data || res || [];
          setMessagesList(msgs);
          return markConversationAsRead(activeConversation.conversationId);
        })
        .then(() => {
          setConversationsList((prev) =>
            prev.map((c) =>
              c.conversationId === activeConversation.conversationId ? { ...c, unreadCount: 0 } : c
            )
          );
        })
        .catch((err) => console.error("Lỗi nạp tin nhắn:", err));
    } else {
      setMessagesList([]);
    }
  }, [activeConversation]);

  // Reset selected members khi đổi loại chat trong modal
  useEffect(() => {
    setSelectedMembers([]);
  }, [newChatType]);

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesList]);

  // Bộ lọc danh sách hội thoại theo Tab và Ô tìm kiếm
  const filteredConversations = useMemo(() => {
    return conversationsList.filter((c) => {
      const matchesSearch = (c.name || `Hội thoại ${c.conversationId}`)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeTab === "direct") return c.type === "Direct";
      if (activeTab === "groups") return c.type === "Group";
      if (activeTab === "channels") return c.type === "Project_Channel";
      return true;
    });
  }, [conversationsList, searchQuery, activeTab]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setEditingMessageId(null);
  };

  // Click mở Modal và cập nhật lại thành viên mới nhất
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    setSelectedMembers([]);
    if (activeWorkspaceId) {
      fetchWorkspaceMembers(activeWorkspaceId)
        .then((res) => {
          const members = res.data || res?.items || res || [];
          setWorkspaceMembersList(members);
        })
        .catch((err) => console.error(err));
    }
  };

  // Quản lý tích chọn thành viên trong Form Modal tạo chat
  const toggleMemberSelection = (memberId) => {
    const idNum = Number(memberId);
    setSelectedMembers((prev) => {
      if (newChatType === "Direct") {
        return [idNum]; // Nếu là chat 1-1, chỉ cho phép chọn duy nhất 1 người
      }
      return prev.includes(idNum) ? prev.filter((id) => id !== idNum) : [...prev, idNum];
    });
  };

  // Thêm tệp đính kèm tạm thời
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const mockAssets = files.map((f, i) => ({
      assetId: Date.now() + i,
      fileName: f.name,
      fileType: f.type.startsWith("image/") ? "Image" : "Document",
    }));
    setSelectedAssets((prev) => [...prev, ...mockAssets]);
  };

  // Gửi tin nhắn mới lên API
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && selectedAssets.length === 0) return;
    if (!activeConversation) return;

    const contentToSend = inputText;
    const assetsToSend = selectedAssets.map((a) => a.assetId);

    setInputText("");
    setSelectedAssets([]);

    try {
      const res = await sendConversationMessage(
        activeConversation.conversationId,
        contentToSend,
        assetsToSend
      );
      
      // Lấy dữ liệu tin nhắn trả về từ server
      const savedMsg = res.data || res;
      
      // Đảm bảo gán đủ thông tin định danh của chính bạn nếu API không trả về thông tin sender
      const completeMsg = {
        ...savedMsg,
        senderId: currentUser?.id || savedMsg.senderId,
        senderName: currentUser?.profile?.fullName || savedMsg.senderName,
        senderAvatarUrl: currentUser?.profile?.avatarUrl || savedMsg.senderAvatarUrl
      };

      // Push tin nhắn mới vào dưới cùng danh sách
      setMessagesList((prev) => [...prev, completeMsg]);
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    }
  };

  const startEditMessage = (msg) => {
    setEditingMessageId(msg.messageId);
    setEditText(msg.content);
  };

  // Lưu chỉnh sửa tin nhắn
  const handleSaveEditMessage = async (msgId) => {
    if (!editText.trim()) return;
    try {
      await editConversationMessage(msgId, editText.trim());
      setMessagesList((prev) =>
        prev.map((m) =>
          m.messageId === msgId ? { ...m, content: editText.trim(), isEdited: true } : m
        )
      );
      setEditingMessageId(null);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi chỉnh sửa tin nhắn.");
    }
  };

  // Thu hồi tin nhắn
  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("Bạn có chắc chắn muốn thu hồi tin nhắn này không?")) return;
    try {
      await deleteConversationMessage(msgId);
      setMessagesList((prev) => prev.filter((m) => m.messageId !== msgId));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thu hồi tin nhắn.");
    }
  };

  // Xử lý tạo cuộc hội thoại mới khi Submit form Modal
  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!activeWorkspaceId) return;

    if (newChatType !== "Direct" && !newChatName.trim()) {
      alert("Vui lòng nhập tên cuộc hội thoại!");
      return;
    }
    if (newChatType === "Direct" && selectedMembers.length !== 1) {
      alert("Hội thoại Direct (1-1) yêu cầu chọn đúng 1 đồng nghiệp!");
      return;
    }

    // Khi gửi lên backend, gom cả ID của mình và các thành viên được chọn vào mảng chung nếu backend yêu cầu đầy đủ
    const finalMemberIds = myMemberId ? [myMemberId, ...selectedMembers] : selectedMembers;

    try {
      const response = await createConversation({
        workspaceId: activeWorkspaceId,
        type: newChatType,
        name: newChatType === "Direct" ? "" : newChatName.trim(),
        workspaceMemberIds: newChatType === "Direct" ? selectedMembers : finalMemberIds, // Điều chỉnh tùy theo cấu trúc API nhận diện 1-1 của bạn
        projectId: null
      });

      const newConv = response.data || response;
      setConversationsList((prev) => [newConv, ...prev]);
      handleSelectConversation(newConv);

      setIsCreateModalOpen(false);
      setNewChatName("");
      setSelectedMembers([]);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Lỗi khi tạo cuộc hội thoại.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-[#0B0B0C] text-slate-100 overflow-hidden select-none">
      
      {/* SIDEBAR TRÁI: DANH SÁCH PHÒNG CHAT */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-white/10 border border-white/10 shrink-0">
        
        {/* Header tìm kiếm & Plus button */}
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400 animate-pulse" />
              Conversations
            </h1>
            {isWorkspaceOwner && (
              <button
                onClick={handleOpenCreateModal}
                className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Tạo cuộc hội thoại mới"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm phòng, tin nhắn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141416] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 font-mono"
            />
          </div>
        </div>

        {/* Các Tab Phân loại phòng */}
        <div className="flex border-b border-white/5 px-2 bg-black/10 shrink-0 text-[11px] font-mono">
          {["all", "direct", "groups", "channels"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-center border-b font-medium capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? "border-blue-500 text-blue-400 bg-white/[0.01]"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab === "all" ? "Tất cả" : tab === "direct" ? "1-1" : tab === "groups" ? "Nhóm" : "Kênh"}
            </button>
          ))}
        </div>

        {/* Khung chứa danh sách phòng chat */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-600 font-mono italic">
              Không tìm thấy cuộc hội thoại nào.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConversation?.conversationId === conv.conversationId;

              // TÌM AVATAR: Nếu là chat 1-1 (Direct), tìm thành viên trong danh sách không phải là mình
              let displayAvatar = null;
              if (conv.type === "Direct") {
                // Nếu API có mảng các thành viên của phòng chat (ví dụ conv.workspaceMembers), hãy tìm người kia.
                // Nếu không có, ta dò trong danh sách tin nhắn của phòng này xem có ai trùng tên hoặc dùng tạm memberId
                const otherMember = workspaceMembersList.find(
                  (m) => (m.resource?.fullName === conv.name || m.fullName === conv.name) && m.resource?.avatarUrl
                );
                displayAvatar = otherMember?.resource?.avatarUrl;
              }

              return (
                <div
                  key={conv.conversationId}
                  onClick={() => handleSelectConversation(conv)}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? "bg-blue-600/10 border-blue-500/30 text-white shadow-md"
                      : "bg-transparent border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* ĐOẠN HIỂN THỊ AVATAR CẦN THAY THẾ */}
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden transition-all ${
                        isSelected
                          ? "bg-blue-500/20 border-blue-400/30 text-blue-400"
                          : "bg-white/[0.02] border-white/5 text-slate-400 group-hover:border-white/10"
                      }`}
                    >
                      {conv.type === "Project_Channel" ? (
                        <Hash size={16} />
                      ) : displayAvatar ? (
                        <img 
                          src={displayAvatar} 
                          alt={conv.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (conv.name || "C").substring(0, 2).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="font-medium text-xs truncate text-slate-200">
                          {conv.name || `Hội thoại Direct #${conv.conversationId}`}
                        </span>
                        <span className="text-[9px] font-mono text-content-muted shrink-0">
                          {conv.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-content-muted truncate font-mono">
                        {conv.lastMessageContent || "Chưa có tin nhắn thảo luận..."}
                      </p>
                    </div>
                  </div>

                  {conv.unreadCount > 0 && !isSelected && (
                    <span className="ml-2 w-4 h-4 rounded-full bg-blue-500 text-[10px] font-bold font-mono flex items-center justify-center text-white shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Thanh trạng thái dưới đáy sidebar */}
        <div className="p-3 border-t border-white/5 bg-black/20 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                <Wifi size={12} /> REST-READY
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-500 font-semibold">
                <WifiOff size={12} /> OFFLINE
              </span>
            )}
          </div>
          <span className="text-slate-600">WS-ID: {activeWorkspaceId || "None"}</span>
        </div>
      </div>

      {/* CHÍNH GIỮA: KHUNG NỘI DUNG CUỘC TRÒ CHUYỆN */}
      <div className="flex-1 flex flex-col bg-white/10 backdrop-blur-md border border-white/10 overflow-hidden relative">
        {activeConversation ? (
          <>
            {/* Header Khung Chat Chi Tiết */}
            <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-[#0E0E10]/50 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                  {activeConversation.type === "Project_Channel" ? (
                    <Hash size={14} />
                  ) : (
                    (activeConversation.name || "C").substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xs font-bold text-slate-200 truncate">
                    {activeConversation.name || `Hội thoại #${activeConversation.conversationId}`}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Type: {activeConversation.type} • ID: {activeConversation.conversationId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1 text-slate-400">
                  <Bell size={12} className="text-amber-500" /> Active
                </span>
              </div>
            </div>

            {/* Khung hiển thị danh sách tin nhắn */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4 bg-gradient-to-b from-black/0 via-black/5 to-black/20">
              {messagesList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 font-mono">
                  <p className="text-xs">Chưa có dữ liệu hội thoại nào ở phòng này.</p>
                  <p className="text-[10px] text-slate-700">Hãy bắt đầu gửi tin nhắn thảo luận đầu tiên!</p>
                </div>
              ) : (
                messagesList.map((msg) => {
                  // 🌟 SỬA TẠI ĐÂY: So sánh senderId từ API với ID của chính bạn từ UserContext
                  // Hoặc so sánh tên senderName nếu hệ thống của bạn map theo tên
                  const isMe = 
                    msg.senderId === currentUser?.id || 
                    msg.senderId === currentUser?.accountId || 
                    msg.senderName === currentUser?.profile?.fullName; 

                  const isEditingThis = editingMessageId === msg.messageId;

                  return (
                    <div
                      key={msg.messageId}
                      className={`flex gap-3 group max-w-2xl ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      {/* Avatar của người gửi */}
                      {msg.senderAvatarUrl ? (
                        <img 
                          src={msg.senderAvatarUrl} 
                          alt={msg.senderName} 
                          className="w-7 h-7 rounded-xl object-cover shrink-0 border border-white/5 shadow-inner"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center font-bold text-xs text-slate-400 shrink-0 shadow-inner">
                          {(msg.senderName || "U").substring(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="space-y-1 flex flex-col">
                        {/* Tên người gửi và thời gian hiển thị */}
                          <div className={`flex items-center gap-2 text-[10px] font-mono text-slate-500 ${isMe ? "justify-end" : ""}`}>
                            <span className="font-bold text-slate-400">{msg.senderName || "User"}</span>
                            
                            {/* 🌟 SỬA ĐOẠN HIỂN THỊ THỜI GIAN TẠI ĐÂY */}
                            <span>
                              {new Date(msg.createdAt || msg.sentAt || Date.now()).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour12: false // Sử dụng định dạng 24h kiểu Việt Nam (VD: 13:20 thay vì 1:20 PM)
                              }).replace(/,/g, " -")} 
                            </span>

                            {msg.isEdited && <span className="text-blue-500/70 text-[9px]">(đã sửa)</span>}
                          </div>

                        {/* Nội dung bong bóng chat */}
                        <div
                          className={`p-3 rounded-2xl text-xs relative ${
                            isMe
                              ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-900/10" // Của mình: Nền xanh, bo góc phải
                              : "bg-[#18181B] border border-white/5 text-slate-200 rounded-tl-none shadow-sm" // Người khác: Nền tối, bo góc trái
                          }`}
                        >
                          {isEditingThis ? (
                            <div className="space-y-2 min-w-[200px]">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                              />
                              <div className="flex justify-end gap-1.5 text-[10px] font-mono">
                                <button onClick={() => setEditingMessageId(null)} className="px-2 py-0.5 hover:text-white text-slate-400">Hủy</button>
                                <button onClick={() => handleSaveEditMessage(msg.messageId)} className="px-2 py-0.5 bg-white text-black rounded font-medium">Lưu</button>
                              </div>
                            </div>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap break-all">{msg.content}</p>
                          )}

                          {/* Render file đính kèm nếu có */}
                          {msg.assets && msg.assets.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-white/10 space-y-1.5 min-w-[180px]">
                              {msg.assets.map((asset) => (
                                <div key={asset.assetId} className="flex items-center gap-2 p-1.5 rounded bg-black/20 border border-white/5 text-[11px] font-mono text-slate-300">
                                  {asset.fileType === "Image" ? <Image size={12} /> : <FileText size={12} />}
                                  <span className="truncate flex-1">{asset.fileName}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Nút hành động sửa/xoá khi hover chuột dành riêng cho tin nhắn của bạn */}
                          {isMe && !isEditingThis && (
                            <div className="absolute top-1/2 -translate-y-1/2 -left-12 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#141416] border border-white/10 p-1 rounded-lg shadow-xl">
                              <button onClick={() => startEditMessage(msg)} className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded" title="Chỉnh sửa">
                                <Edit2 size={11} />
                              </button>
                              <button onClick={() => handleDeleteMessage(msg.messageId)} className="p-1 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded" title="Thu hồi">
                                <Trash2 size={11} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input soạn thảo dưới đáy khung chat */}
            <div className="p-4 border-t border-white/5 bg-[#0E0E10]/60 shrink-0 space-y-2">
              {selectedAssets.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-2">
                  {selectedAssets.map((asset) => (
                    <div
                      key={asset.assetId}
                      className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-mono text-slate-300"
                    >
                      <span>{asset.fileName}</span>
                      <button
                        onClick={() => setSelectedAssets((p) => p.filter((x) => x.assetId !== asset.assetId))}
                        className="p-0.5 hover:bg-white/10 rounded text-slate-500 hover:text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                <div className="flex items-center gap-1 absolute left-3">
                  <label className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-300 cursor-pointer transition-all">
                    <Paperclip size={15} />
                    <input type="file" multiple onChange={handleFileChange} className="hidden" />
                  </label>
                  <button
                    type="button"
                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-300 transition-all"
                  >
                    <Smile size={15} />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder={`Nhắn tin vào phòng #${activeConversation.name || activeConversation.conversationId}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-[#121214] border border-white/5 rounded-xl pl-20 pr-12 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() && selectedAssets.length === 0}
                  className="absolute right-2.5 p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-all disabled:opacity-30 disabled:hover:bg-blue-600 cursor-pointer shadow-md shadow-blue-900/20"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 font-mono space-y-3">
            <UserCircle size={40} className="text-slate-700 stroke-[1.2]" />
            <div className="text-center space-y-1">
              <p className="text-xs">Chưa chọn phòng hội thoại thảo luận.</p>
              <p className="text-[10px] text-slate-700">Vui lòng chọn một phòng từ danh sách bên trái để xem tin nhắn.</p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: KHỞI TẠO CUỘC HỘI THOẠI MỚI */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white/10 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h2 className="text-sm font-bold text-slate-200 mb-4 font-mono uppercase tracking-wider text-blue-400">
              Tạo cuộc trò chuyện mới
            </h2>

            <form onSubmit={handleCreateChat} className="space-y-4">
              
              {/* Loại cuộc hội thoại */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                  Loại trò chuyện
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {["Direct", "Group", "Project_Channel"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewChatType(type)}
                      className={`py-2 text-center rounded-lg border transition-all cursor-pointer ${
                        newChatType === type
                          ? "bg-blue-600/10 border-blue-500/50 text-blue-400 font-semibold"
                          : "bg-white/[0.02] border-white/5 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {type === "Direct" ? "1-1" : type === "Group" ? "Nhóm" : "Kênh"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tên phòng (Ẩn đi nếu chọn chat Direct 1-1) */}
              {newChatType !== "Direct" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                    Tên cuộc hội thoại / Kênh
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên phòng thảo luận..."
                    value={newChatName}
                    onChange={(e) => setNewChatName(e.target.value)}
                    className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Danh sách thành viên tham gia hội thoại */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                  Mời thành viên ({newChatType === "Direct" ? "Chọn 1 đồng nghiệp" : "Chọn nhiều"})
                </label>
                <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                  {workspaceMembersList && workspaceMembersList
                    .filter((m) => {
                      const mId = Number(m.workspaceMemberId || m.id);
                      return mId && mId !== myMemberId; // Loại bỏ chính mình ra khỏi giao diện chọn lựa
                    })
                    .map((m) => {
                      const mId = Number(m.workspaceMemberId || m.id);
                      const isSelected = selectedMembers.includes(mId);
                      
                      const displayName = m.resource?.fullName || m.fullName || m.name || `Thành viên ${mId}`;

                      return (
                        <label
                          key={mId}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                            isSelected
                              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                              : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-[10px] text-zinc-400 uppercase">
                              {displayName.charAt(0)}
                            </div>
                            <span className="truncate max-w-[150px]">{displayName}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleMemberSelection(mId)}
                            className="rounded border-white/10 text-blue-600 focus:ring-0 cursor-pointer"
                          />
                        </label>
                      );
                    })}
                </div>
                {newChatType === "Direct" && (
                  <p className="text-[10px] text-content-muted font-mono mt-1">
                    * Đã chọn {selectedMembers.length} / 1 đồng nghiệp.
                  </p>
                )}
              </div>

              {/* Footer Actions Modal */}
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