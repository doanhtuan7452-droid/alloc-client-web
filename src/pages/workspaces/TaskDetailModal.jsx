import { useState, useEffect } from "react";
import { X, Clock, AlertCircle, Calendar, MessageSquare, Link as LinkIcon, Users, CheckCircle2, ChevronRight, Send } from "lucide-react";
import { fetchTaskAssignees, fetchTaskDependencies, fetchTaskComments, createTaskComment } from "../../services/mockApi";

export default function TaskDetailModal({ task, onClose }) {
  const [assignees, setAssignees] = useState([]);
  const [dependencies, setDependencies] = useState([]);
  const [comments, setComments] = useState([]);
  
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const [activeTab, setActiveTab] = useState("comments"); // comments, dependencies

  useEffect(() => {
    if (task) {
      loadDetails();
    }
  }, [task]);

  const loadDetails = async () => {
    try {
      const [assRes, depRes, comRes] = await Promise.all([
        fetchTaskAssignees(task.taskId),
        fetchTaskDependencies(task.taskId),
        fetchTaskComments(task.taskId)
      ]);
      setAssignees(assRes);
      setDependencies(depRes);
      setComments(comRes);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createTaskComment(task.taskId, {
        content: newComment,
        parentCommentId: replyTo ? replyTo.commentId : null
      });
      setNewComment("");
      setReplyTo(null);
      await loadDetails(); // Reload comments
    } catch (e) {
      alert("Lỗi khi đăng bình luận");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  const renderComments = (commentList, isReply = false) => {
    if (!commentList || commentList.length === 0) return null;
    
    return commentList.map(c => (
      <div key={c.commentId} className={`flex gap-3 mb-4 ${isReply ? 'ml-8 mt-3 relative before:absolute before:border-l-2 before:border-b-2 before:border-white/10 before:w-4 before:h-4 before:-left-5 before:-top-2' : ''}`}>
        <img src={c.memberAvatarUrl} alt={c.memberName} className="w-8 h-8 rounded-full border border-white/20 bg-inset shrink-0" />
        <div className="flex-1">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-bold text-sm text-zinc-200">{c.memberName}</span>
            <span className="text-[10px] text-zinc-500 font-mono">{new Date(c.createdAt).toLocaleString()}</span>
          </div>
          <div className="text-sm text-zinc-300 bg-white/5 border border-white/5 rounded-r-xl rounded-bl-xl p-3 inline-block">
            {c.content}
          </div>
          <div className="flex gap-4 mt-1 pl-1">
            <button 
              onClick={() => {setReplyTo(c); document.getElementById('commentInput').focus();}} 
              className="text-[10px] font-bold font-mono text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              Reply
            </button>
          </div>
          
          {/* Recursively render replies */}
          {c.replies && c.replies.length > 0 && (
            <div className="mt-2">
              {renderComments(c.replies, true)}
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-4xl flex flex-col max-h-[90vh] shadow-2xl animate-scaleUp overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-start bg-white/[0.02]">
          <div className="flex items-start gap-4">
            <div className="bg-zinc-800 p-2.5 rounded-lg border border-white/5 shrink-0">
              <CheckCircle2 className={`w-6 h-6 ${task.status === 'Done' ? 'text-emerald-400' : 'text-blue-400'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-white/5">TASK-{task.taskId}</span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-white/5">{task.status}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{task.taskName}</h2>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {task.startDate} to {task.endDate}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {task.estimatedValue} {task.durationType}s</span>
                <span className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-rose-400"/> {task.priority}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Main left content */}
          <div className="flex-1 flex flex-col border-r border-white/10 overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-white/10 px-6 shrink-0">
              <button 
                onClick={() => setActiveTab("comments")}
                className={`py-3 px-4 font-medium text-sm font-mono flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'comments' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                <MessageSquare className="w-4 h-4"/> Comments ({comments.length})
              </button>
              <button 
                onClick={() => setActiveTab("dependencies")}
                className={`py-3 px-4 font-medium text-sm font-mono flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'dependencies' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
              >
                <LinkIcon className="w-4 h-4"/> Dependencies ({dependencies.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-inset/20">
              
              {activeTab === "comments" && (
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    {comments.length === 0 ? (
                      <p className="text-zinc-500 text-sm text-center py-10 font-mono">No comments yet. Be the first to start the discussion!</p>
                    ) : (
                      renderComments(comments)
                    )}
                  </div>
                </div>
              )}

              {activeTab === "dependencies" && (
                <div className="space-y-3">
                  {dependencies.length === 0 ? (
                     <p className="text-zinc-500 text-sm text-center py-10 font-mono">No dependencies found.</p>
                  ) : (
                    dependencies.map(dep => (
                      <div key={dep.dependencyId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-zinc-900 border border-white/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="bg-zinc-800 p-2 rounded shrink-0">
                            <LinkIcon className="w-4 h-4 text-zinc-400"/>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-200">Task {dep.predecessorTaskId}</p>
                            <p className="text-xs text-zinc-500 font-mono">Predecessor</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex text-zinc-600 px-4"><ChevronRight className="w-5 h-5"/></div>
                        <div className="flex items-center gap-3">
                           <div>
                            <p className="text-sm font-bold text-zinc-200 text-right">Task {dep.successorTaskId}</p>
                            <p className="text-xs text-zinc-500 font-mono text-right">Successor</p>
                          </div>
                          <div className="bg-zinc-800 px-2 py-1 rounded text-xs font-bold text-blue-400 border border-white/5 shrink-0">
                            {dep.dependencyType}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Comment Input Box */}
            {activeTab === "comments" && (
              <div className="p-4 border-t border-white/10 bg-zinc-900 shrink-0">
                {replyTo && (
                  <div className="flex justify-between items-center mb-2 px-3 py-1 bg-blue-900/20 border border-blue-500/20 rounded text-xs text-blue-400">
                    <span>Replying to <strong>{replyTo.memberName}</strong></span>
                    <button onClick={() => setReplyTo(null)} className="hover:text-white cursor-pointer"><X className="w-3 h-3"/></button>
                  </div>
                )}
                <form onSubmit={handlePostComment} className="relative">
                  <input 
                    id="commentInput"
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type a comment..."
                    className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !newComment.trim()}
                    className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-blue-600 rounded-lg text-white hover:bg-blue-500 disabled:opacity-50 disabled:bg-zinc-700 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            )}
          </div>
          
          {/* Sidebar right content */}
          <div className="w-64 bg-zinc-900/50 p-6 flex flex-col shrink-0 overflow-y-auto">
            
            <div className="mb-6">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Users className="w-3 h-3"/> Assignees</h3>
              <div className="space-y-2">
                {assignees.length === 0 ? (
                  <span className="text-xs text-zinc-500 italic">No assignees</span>
                ) : assignees.map((a, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-lg">
                    <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center text-[8px] border border-white/20">A</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-zinc-300 truncate">Member {a.memberId}</p>
                      <p className="text-[9px] font-mono text-zinc-500">{a.assigneeType}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Details</h3>
              <div className="space-y-3 text-xs bg-white/5 border border-white/5 p-3 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Complexity:</span>
                  <span className="text-zinc-300 font-bold">{task.complexity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Req. Skill:</span>
                  <span className="text-zinc-300 font-bold">{task.requiredSkillLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Team Size:</span>
                  <span className="text-zinc-300 font-bold">{task.expectedTeamSize}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
