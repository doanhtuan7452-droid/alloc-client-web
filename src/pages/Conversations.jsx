import {
  Search,
  Plus,
  Hash,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
  UserCircle,
} from "lucide-react";

export default function Conversations() {
  return (
    <div className="flex h-[calc(100vh-12rem)] bg-[#131b2c] border border-[#1f2937] rounded-xl overflow-hidden">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 border-r border-[#1f2937] flex flex-col bg-[#0b0f19]/50">
        <div className="p-4 border-b border-[#1f2937]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Conversations</h2>
            <button className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 transition">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full bg-[#131b2c] border border-[#1f2937] rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-slate-300"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Channels Section */}
          <div className="p-4">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
              Channels
            </h3>
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-blue-900/10 border border-blue-800/30 text-blue-400">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  <span className="text-sm font-medium">project-alpha</span>
                </div>
                <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                  3
                </span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1a2333] hover:text-slate-300 transition-colors">
                <Hash className="w-4 h-4" />
                <span className="text-sm font-medium">data-synthesis</span>
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1a2333] hover:text-slate-300 transition-colors">
                <Hash className="w-4 h-4" />
                <span className="text-sm font-medium">budget-discussion</span>
              </button>
            </div>
          </div>

          {/* Direct Messages Section */}
          <div className="px-4 pb-4">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
              Direct Messages
            </h3>
            <div className="space-y-1">
              {/* DM Item 1 */}
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1a2333] hover:text-slate-300 transition-colors text-left">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                    <img
                      src="https://i.pravatar.cc/150?u=1"
                      alt="EV"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#131b2c] rounded-full"></span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm font-medium text-slate-200 truncate">
                      Dr. Elias Vance
                    </span>
                    <span className="text-[10px] text-slate-500">10:42 AM</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    The regression models are ready for review.
                  </p>
                </div>
              </button>

              {/* DM Item 2 */}
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1a2333] hover:text-slate-300 transition-colors text-left">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden">
                    <img
                      src="https://i.pravatar.cc/150?u=2"
                      alt="AV"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-slate-500 border-2 border-[#131b2c] rounded-full"></span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm font-medium text-slate-200 truncate">
                      Dr. Alyx Vance
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Yesterday
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    Have you checked the latest dataset?
                  </p>
                </div>
              </button>

              {/* DM Item 3 */}
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1a2333] hover:text-slate-300 transition-colors text-left">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center text-xs">
                    IK
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-amber-500 border-2 border-[#131b2c] rounded-full"></span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm font-medium text-slate-200 truncate">
                      Isaac Kleiner
                    </span>
                    <span className="text-[10px] text-slate-500">Mon</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    I'll prepare the anomalous materials report.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#131b2c]">
        {/* Chat Header */}
        <div className="h-16 border-b border-[#1f2937] flex items-center justify-between px-6 bg-[#0b0f19]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/20 border border-blue-800/30 flex items-center justify-center text-blue-400">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white leading-tight">
                project-alpha
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <UserCircle className="w-3 h-3" />
                <span>8 Members</span>
                <span>•</span>
                <span>General discussion and updates for Project Alpha</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <button className="w-8 h-8 flex items-center justify-center hover:text-white transition">
              <Search className="w-5 h-5" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center hover:text-white transition">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-center">
            <span className="bg-[#1f2937] text-slate-400 text-[10px] px-3 py-1 rounded-full font-mono">
              Yesterday, October 24
            </span>
          </div>

          {/* Someone else's message */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
              <img
                src="https://i.pravatar.cc/150?u=1"
                alt="EV"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-medium text-slate-200">
                  Dr. Elias Vance
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  09:14 AM
                </span>
              </div>
              <div className="bg-[#1f2937] text-slate-300 px-4 py-3 rounded-2xl rounded-tl-sm text-sm border border-[#2e3c50]">
                I've uploaded the initial findings for the dataset. We need to
                normalize variables before running the next models.
              </div>
            </div>
          </div>

          {/* Another message from same person */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-transparent flex-shrink-0"></div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[10px] text-slate-500 font-mono">
                  09:16 AM
                </span>
              </div>
              <div className="bg-[#1f2937] text-slate-300 px-4 py-3 rounded-2xl rounded-tl-sm text-sm border border-[#2e3c50]">
                Can someone review the script I pushed to the repository?
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <span className="bg-[#1f2937] text-slate-400 text-[10px] px-3 py-1 rounded-full font-mono">
              Today, October 25
            </span>
          </div>

          {/* My Message */}
          <div className="flex gap-4 flex-row-reverse">
            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-[#131b2c] flex-shrink-0">
              <img
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                alt="Me"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[10px] text-slate-500 font-mono">
                  10:02 AM
                </span>
                <span className="font-medium text-slate-200">You</span>
              </div>
              <div className="bg-blue-600 border border-blue-500 text-white px-4 py-3 rounded-2xl rounded-tr-sm text-sm shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                Sure, I'll take a look at the script right away. I'm currently
                working on the literature review draft.
              </div>
            </div>
          </div>

          {/* Someone else's message with mention */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0">
              <img
                src="https://i.pravatar.cc/150?u=2"
                alt="AV"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-medium text-slate-200">
                  Dr. Alyx Vance
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  10:45 AM
                </span>
              </div>
              <div className="bg-purple-900/20 text-slate-300 px-4 py-3 rounded-2xl rounded-tl-sm text-sm border border-purple-800/30">
                <span className="text-purple-400 font-medium">@here</span> Just
                an update: the budget for Q4 compute has been approved. We can
                scale up our ML models.
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#1f2937] bg-[#0b0f19]/30">
          <div className="bg-[#131b2c] border border-[#1f2937] rounded-xl p-2 flex items-end gap-2 focus-within:border-blue-500/50 transition-colors shadow-inner">
            <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-200 min-h-[40px] max-h-32 py-2"
              placeholder="Type your message in #project-alpha..."
              rows="1"
            ></textarea>
            <div className="flex items-center gap-1 p-1">
              <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
              <button className="p-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center mt-2 px-2">
            <span className="text-[10px] text-slate-500 font-mono">
              Use{" "}
              <span className="p-0.5 bg-[#1f2937] rounded border border-slate-700">
                @
              </span>{" "}
              to mention a colleague.
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Enter to Send • Shift+Enter for newline
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
