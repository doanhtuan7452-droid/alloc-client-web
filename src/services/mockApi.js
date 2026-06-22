// Mock API client to simulate network requests to AllocServer C# API.
// Mimics asynchronous latency and handles data cloning.
// All function signatures match the real API endpoints from test-results.md.

import {
  workspaces, workspaceDetails, projects, tasks, expenses, revenues,
  workspaceMembers, memberProfiles, risks, riskMitigations, riskLifecycle,
  timesheetEntries, leaveRequests, otRequests, reviewCycles, evaluations,
  notifications, aiInsights, taskAssignees, taskDependencies, taskComments
} from "../data/mockData";

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// WORKSPACES
// ============================================================
export async function fetchWorkspaces() {
  await delay();
  return JSON.parse(JSON.stringify(workspaces));
}

export async function fetchWorkspaceDetails(workspaceId) {
  await delay();
  const details = workspaceDetails[workspaceId];
  if (!details) throw new Error("WorkspaceNotFound");
  return JSON.parse(JSON.stringify(details));
}

// ============================================================
// WORKSPACE MEMBERS
// ============================================================
export async function fetchWorkspaceMembers(workspaceId) {
  await delay();
  const members = workspaceMembers[workspaceId];
  if (!members) return { page: 1, pageSize: 20, totalItems: 0, totalPages: 0, items: [] };
  return JSON.parse(JSON.stringify(members));
}

export async function fetchMemberProfile(workspaceMemberId) {
  await delay();
  const profile = memberProfiles[workspaceMemberId];
  if (!profile) return null;
  return JSON.parse(JSON.stringify(profile));
}

export async function updateMemberProfile(workspaceMemberId, data) {
  await delay(500);
  if (memberProfiles[workspaceMemberId]) {
    Object.assign(memberProfiles[workspaceMemberId], data);
  }
  return JSON.parse(JSON.stringify(memberProfiles[workspaceMemberId]));
}

// ============================================================
// PROJECTS
// ============================================================
export async function fetchProjects(workspaceId) {
  await delay();
  const workspaceProjects = projects[workspaceId] || [];
  return JSON.parse(JSON.stringify(workspaceProjects));
}

export async function createProject(workspaceId, projectData) {
  await delay(600);
  if (!projects[workspaceId]) projects[workspaceId] = [];
  const nameExists = projects[workspaceId].some(
    (p) => p.projectName.toLowerCase() === projectData.projectName.toLowerCase()
  );
  if (nameExists) throw new Error("ProjectNameExists");

  const newId = Math.max(...Object.values(projects).flatMap(p => p.map(x => x.projectId)), 0) + 1;
  const newProject = {
    projectId: newId, workspaceId: parseInt(workspaceId),
    projectName: projectData.projectName,
    expectedBudget: parseFloat(projectData.expectedBudget || 0),
    totalRevenue: parseFloat(projectData.totalRevenue || 0),
    startDate: projectData.startDate, endDate: projectData.endDate,
    status: projectData.status || "Planning",
    originalCurrencyCode: projectData.originalCurrencyCode || "USD",
    exchangeRateToUSD: parseFloat(projectData.exchangeRateToUSD || 1.0000),
    methodology: projectData.methodology || "Agile",
    createdAt: new Date().toISOString()
  };
  projects[workspaceId].push(newProject);
  const details = workspaceDetails[workspaceId];
  if (details) {
    details.projectSummary.totalProjects += 1;
    if (newProject.status === "Planning") details.projectSummary.planningProjects += 1;
    else if (newProject.status === "In Progress") details.projectSummary.inProgressProjects += 1;
  }
  return JSON.parse(JSON.stringify(newProject));
}

export async function fetchProjectDetails(projectId) {
  await delay();
  const project = Object.values(projects).flat().find((p) => p.projectId === parseInt(projectId));
  if (!project) throw new Error("ProjectNotFound");
  return JSON.parse(JSON.stringify(project));
}

// ============================================================
// TASKS
// ============================================================
export async function fetchProjectTasks(projectId) {
  await delay();
  const projectTasks = tasks[parseInt(projectId)] || [];
  return JSON.parse(JSON.stringify(projectTasks));
}

export async function fetchTaskAssignees(taskId) {
  await delay(200);
  return JSON.parse(JSON.stringify(taskAssignees[taskId] || []));
}

export async function fetchTaskDependencies(taskId) {
  await delay(200);
  return JSON.parse(JSON.stringify(taskDependencies[taskId] || []));
}

export async function fetchTaskComments(taskId) {
  await delay(300);
  return JSON.parse(JSON.stringify(taskComments[taskId] || []));
}

export async function createTaskComment(taskId, data) {
  await delay(400);
  if (!taskComments[taskId]) taskComments[taskId] = [];
  const allComments = Object.values(taskComments).flat();
  const flatAll = [];
  const flatten = (list) => { list.forEach(c => { flatAll.push(c); if (c.replies) flatten(c.replies); }); };
  flatten(allComments);
  const newId = Math.max(...flatAll.map(c => c.commentId), 0) + 1;
  const newComment = {
    commentId: newId, taskId: parseInt(taskId), memberId: 99,
    memberName: "Từ Vĩ Thành", memberAvatarUrl: "https://i.pravatar.cc/150?u=5",
    parentCommentId: data.parentCommentId || null,
    content: data.content, createdAt: new Date().toISOString(),
    updatedAt: null, replies: []
  };

  if (data.parentCommentId) {
    const findAndAdd = (list) => {
      for (const c of list) {
        if (c.commentId === data.parentCommentId) { c.replies.push(newComment); return true; }
        if (c.replies && findAndAdd(c.replies)) return true;
      }
      return false;
    };
    findAndAdd(taskComments[taskId]);
  } else {
    taskComments[taskId].push(newComment);
  }
  return JSON.parse(JSON.stringify(newComment));
}

// ============================================================
// EXPENSES & REVENUES
// ============================================================
export async function fetchProjectExpenses(projectId, page = 1, pageSize = 5, search = "", category = "") {
  await delay();
  const projectExpenses = expenses[parseInt(projectId)] || [];
  let filtered = [...projectExpenses];
  if (search) filtered = filtered.filter(e => e.description && e.description.toLowerCase().includes(search.toLowerCase()));
  if (category) filtered = filtered.filter(e => e.category === category);
  filtered.sort((a, b) => b.expenseId - a.expenseId);
  const totalItems = filtered.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const startIdx = (page - 1) * pageSize;
  const items = filtered.slice(startIdx, startIdx + pageSize);
  return { page, pageSize, totalItems, totalPages, items: JSON.parse(JSON.stringify(items)) };
}

export async function createProjectExpense(projectId, expenseData) {
  await delay(600);
  const pId = parseInt(projectId);
  if (!expenses[pId]) expenses[pId] = [];
  const allExpenses = Object.values(expenses).flat();
  const newId = Math.max(...allExpenses.map(e => e.expenseId), 0) + 1;
  const project = Object.values(projects).flat().find(p => p.projectId === pId);
  const newExpense = {
    expenseId: newId, projectId: pId,
    projectName: project ? project.projectName : "",
    category: expenseData.category,
    amount: parseFloat(expenseData.amount),
    expenseDate: expenseData.expenseDate,
    description: expenseData.description || ""
  };
  expenses[pId].push(newExpense);
  return JSON.parse(JSON.stringify(newExpense));
}

export async function fetchProjectRevenues(projectId, page = 1, pageSize = 5) {
  await delay();
  const projectRevenues = revenues[parseInt(projectId)] || [];
  const sorted = [...projectRevenues].sort((a, b) => b.revenueId - a.revenueId);
  const totalItems = sorted.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const startIdx = (page - 1) * pageSize;
  const items = sorted.slice(startIdx, startIdx + pageSize);
  return { page, pageSize, totalItems, totalPages, items: JSON.parse(JSON.stringify(items)) };
}

export async function fetchProjectFinancialSummary(projectId) {
  await delay();
  const pId = parseInt(projectId);
  const projectExpenses = expenses[pId] || [];
  const projectRevenues = revenues[pId] || [];
  const totalSpent = projectExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalRevenue = projectRevenues.filter(r => r.status === "Received").reduce((sum, r) => sum + parseFloat(r.amount), 0);
  return { totalSpent: Math.round(totalSpent * 100) / 100, totalRevenue: Math.round(totalRevenue * 100) / 100 };
}

// ============================================================
// RISKS
// ============================================================
export async function fetchProjectRisks(projectId, page = 1, pageSize = 20) {
  await delay();
  const projectRisks = risks[parseInt(projectId)] || [];
  const sorted = [...projectRisks].sort((a, b) => b.riskScore - a.riskScore);
  const totalItems = sorted.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const startIdx = (page - 1) * pageSize;
  const items = sorted.slice(startIdx, startIdx + pageSize);
  return { page, pageSize, totalItems, totalPages, items: JSON.parse(JSON.stringify(items)) };
}

export async function createProjectRisk(projectId, riskData) {
  await delay(600);
  const pId = parseInt(projectId);
  if (!risks[pId]) risks[pId] = [];
  const allRisks = Object.values(risks).flat();
  const newId = Math.max(...allRisks.map(r => r.riskId), 0) + 1;
  const project = Object.values(projects).flat().find(p => p.projectId === pId);
  const score = riskData.probability * riskData.impact;
  const newRisk = {
    riskId: newId, projectId: pId, projectName: project ? project.projectName : "",
    taskId: riskData.taskId || null, riskName: riskData.riskName,
    description: riskData.description, category: riskData.category,
    probability: riskData.probability, impact: riskData.impact, riskScore: score,
    estimatedFinancialImpact: parseFloat(riskData.estimatedFinancialImpact || 0),
    actualFinancialImpact: 0, status: "Identified", ownerId: riskData.ownerId || 99,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  };
  risks[pId].push(newRisk);
  return JSON.parse(JSON.stringify(newRisk));
}

export async function fetchRiskMitigations(riskId) {
  await delay(300);
  return JSON.parse(JSON.stringify(riskMitigations[riskId] || []));
}

export async function fetchRiskLifecycle(riskId) {
  await delay(300);
  return JSON.parse(JSON.stringify(riskLifecycle[riskId] || []));
}

// ============================================================
// TIMESHEETS
// ============================================================
export async function fetchTimesheets(workspaceId, page = 1, pageSize = 20) {
  await delay();
  const entries = timesheetEntries[parseInt(workspaceId)] || [];
  const sorted = [...entries].sort((a, b) => new Date(b.workDate) - new Date(a.workDate));
  const totalItems = sorted.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const startIdx = (page - 1) * pageSize;
  const items = sorted.slice(startIdx, startIdx + pageSize);
  
  const now = new Date();
  const fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const toDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;
  
  return { page, pageSize, totalItems, totalPages, fromDate, toDate, items: JSON.parse(JSON.stringify(items)) };
}

export async function createTimesheet(data) {
  await delay(500);
  const wId = parseInt(data.workspaceId || 12);
  if (!timesheetEntries[wId]) timesheetEntries[wId] = [];
  
  // Check for upsert (same memberId + taskId + workDate)
  const existing = timesheetEntries[wId].find(
    t => t.taskId === data.taskId && t.workDate === data.workDate && t.workspaceMemberId === 99
  );
  
  if (existing) {
    existing.normalHours = parseFloat(data.normalHours);
    existing.otHours = parseFloat(data.otHours);
    existing.totalCost = existing.normalHours * existing.loggedHourlyRate + existing.otHours * existing.loggedOTRate;
    return JSON.parse(JSON.stringify(existing));
  }
  
  const allEntries = Object.values(timesheetEntries).flat();
  const newId = Math.max(...allEntries.map(t => t.timesheetId), 0) + 1;
  
  // Find task info
  const allTasks = Object.values(tasks).flat();
  const task = allTasks.find(t => t.taskId === data.taskId);
  const project = Object.values(projects).flat().find(p => p.projectId === (task ? task.projectId : 0));
  
  const newEntry = {
    timesheetId: newId, taskId: data.taskId,
    taskName: task ? task.taskName : "Unknown Task",
    projectId: task ? task.projectId : 0,
    projectName: project ? project.projectName : "Unknown Project",
    workspaceId: wId, workspaceMemberId: 99, memberName: "Từ Vĩ Thành",
    workDate: data.workDate,
    normalHours: parseFloat(data.normalHours),
    otHours: parseFloat(data.otHours),
    loggedHourlyRate: 25.00, loggedOTRate: 37.50,
    totalCost: parseFloat(data.normalHours) * 25 + parseFloat(data.otHours) * 37.5,
    createdAt: new Date().toISOString()
  };
  timesheetEntries[wId].push(newEntry);
  return JSON.parse(JSON.stringify(newEntry));
}

// ============================================================
// LEAVE & OT REQUESTS
// ============================================================
export async function fetchLeaveRequests(workspaceId) {
  await delay();
  return JSON.parse(JSON.stringify(leaveRequests[parseInt(workspaceId)] || []));
}

export async function createLeaveRequest(workspaceId, data) {
  await delay(500);
  const wId = parseInt(workspaceId);
  if (!leaveRequests[wId]) leaveRequests[wId] = [];
  const allReqs = Object.values(leaveRequests).flat();
  const newId = Math.max(...allReqs.map(r => r.requestId), 0) + 1;
  const newReq = {
    requestType: "Leave", requestId: newId, workspaceId: wId,
    workspaceMemberId: 99, requesterName: "Từ Vĩ Thành",
    approverId: null, approverName: null,
    startDate: data.startDate, endDate: data.endDate,
    reason: data.reason, status: "Pending",
    approvalNote: null, reviewedAt: null,
    createdAt: new Date().toISOString()
  };
  leaveRequests[wId].push(newReq);
  return JSON.parse(JSON.stringify(newReq));
}

export async function approveRequest(requestType, requestId, data) {
  await delay(400);
  const allLists = requestType === "Leave" ? leaveRequests : otRequests;
  for (const list of Object.values(allLists)) {
    const req = list.find(r => r.requestId === requestId);
    if (req) {
      req.status = data.status;
      req.approvalNote = data.approvalNote;
      req.approverId = 99;
      req.approverName = "Từ Vĩ Thành";
      req.reviewedAt = new Date().toISOString();
      return JSON.parse(JSON.stringify(req));
    }
  }
  throw new Error("RequestNotFound");
}

export async function fetchOTRequests(workspaceId) {
  await delay();
  return JSON.parse(JSON.stringify(otRequests[parseInt(workspaceId)] || []));
}

export async function createOTRequest(workspaceId, data) {
  await delay(500);
  const wId = parseInt(workspaceId);
  if (!otRequests[wId]) otRequests[wId] = [];
  const allReqs = Object.values(otRequests).flat();
  const newId = Math.max(...allReqs.map(r => r.requestId), 0) + 1;
  const allTasks = Object.values(tasks).flat();
  const task = allTasks.find(t => t.taskId === data.taskId);
  const project = Object.values(projects).flat().find(p => p.projectId === (task ? task.projectId : 0));
  const newReq = {
    requestType: "OT", requestId: newId, workspaceId: wId,
    workspaceMemberId: 99, requesterName: "Từ Vĩ Thành",
    taskId: data.taskId, taskName: task ? task.taskName : "", projectId: task ? task.projectId : 0,
    projectName: project ? project.projectName : "",
    requestedDate: data.requestedDate, expectedHours: parseFloat(data.expectedHours),
    approverId: null, approverName: null,
    status: "Pending", approvalNote: null, reviewedAt: null,
    createdAt: new Date().toISOString()
  };
  otRequests[wId].push(newReq);
  return JSON.parse(JSON.stringify(newReq));
}

// ============================================================
// REVIEW CYCLES
// ============================================================
export async function fetchReviewCycles(workspaceId) {
  await delay();
  return JSON.parse(JSON.stringify(reviewCycles[parseInt(workspaceId)] || []));
}

export async function fetchEvaluations(cycleId) {
  await delay(300);
  return JSON.parse(JSON.stringify(evaluations[cycleId] || []));
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export async function fetchNotifications(page = 1, pageSize = 20) {
  await delay();
  const sorted = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const totalItems = sorted.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const startIdx = (page - 1) * pageSize;
  const items = sorted.slice(startIdx, startIdx + pageSize);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  return { page, pageSize, totalItems, totalPages, unreadCount, items: JSON.parse(JSON.stringify(items)) };
}

export async function getUnreadNotificationCount() {
  await delay(200);
  return { unreadCount: notifications.filter(n => !n.isRead).length };
}

export async function markAllNotificationsRead() {
  await delay(300);
  notifications.forEach(n => n.isRead = true);
}

export async function markNotificationRead(notificationId) {
  await delay(200);
  const notif = notifications.find(n => n.notificationId === notificationId);
  if (notif) notif.isRead = true;
}

// ============================================================
// AI INSIGHTS
// ============================================================
export async function askAI(data) {
  await delay(1500);
  const pId = parseInt(data.projectId);
  const project = Object.values(projects).flat().find(p => p.projectId === pId);
  if (!aiInsights[pId]) aiInsights[pId] = [];
  const allInsights = Object.values(aiInsights).flat();
  const newId = Math.max(...allInsights.map(i => i.logId), 0) + 1;

  const mockResponses = {
    "Risk Warning": `🤖 AI Risk Warning:\n- Dự án ${project?.projectName || ''} có khả năng phát sinh rủi ro về tiến độ.\n- Nên ưu tiên review các task có effort cao và cập nhật mitigation plan.\n- Các rủi ro mở hiện tại cần được giám sát chặt chẽ hơn.`,
    "Resource Optimization": `🤖 Resource Optimization:\n- Phân tích hiệu suất đội ngũ cho thấy có thể tối ưu phân bổ nhân lực.\n- Một số thành viên có workload thấp hơn trung bình.\n- Đề xuất cân bằng lại task assignment.`,
    "Budget Forecast": `🤖 Budget Forecast:\n- Tốc độ đốt ngân sách hiện tại đang ở mức chấp nhận được.\n- Dự kiến ngân sách sẽ đủ cho đến khi dự án kết thúc.\n- Cần giám sát các khoản chi phí Infrastructure.`
  };

  const newInsight = {
    logId: newId, projectId: pId,
    analysisType: data.analysisType,
    content: mockResponses[data.analysisType] || `🤖 AI Analysis: ${data.prompt}`,
    createdAt: new Date().toISOString(),
    remainingQuota: null
  };

  aiInsights[pId].push({
    logId: newId, projectId: pId,
    suggestionType: data.analysisType,
    suggestionContent: newInsight.content,
    userFeedback: null,
    createdAt: newInsight.createdAt
  });

  return JSON.parse(JSON.stringify(newInsight));
}

export async function fetchProjectAIInsights(projectId, page = 1, pageSize = 20) {
  await delay();
  const insights = aiInsights[parseInt(projectId)] || [];
  const sorted = [...insights].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const totalItems = sorted.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const startIdx = (page - 1) * pageSize;
  const items = sorted.slice(startIdx, startIdx + pageSize);
  return { page, pageSize, totalItems, totalPages, items: JSON.parse(JSON.stringify(items)) };
}
