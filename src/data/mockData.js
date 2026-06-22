// Mock database representing values from the C# Server API.
// Synchronized with C# entity schemas and property fields.
// All field names match real API responses from test-results.md

// ============================================================
// WORKSPACES
// ============================================================
export let workspaces = [
  {
    workspaceId: 12,
    name: "Alloc Core Team",
    type: "Company",
    createdAt: "2026-06-01T08:00:00Z",
    membership: {
      workspaceMemberId: 99,
      resourceId: 5,
      employeeCode: "EMP0005",
      status: "Active",
      joinedAt: "2026-06-01T08:00:00Z",
      role: { workspaceRoleId: 1, roleName: "Owner" }
    }
  },
  {
    workspaceId: 13,
    name: "Research Lab Beta",
    type: "Personal",
    createdAt: "2026-06-10T12:00:00Z",
    membership: {
      workspaceMemberId: 102,
      resourceId: 5,
      employeeCode: "EMP0005",
      status: "Active",
      joinedAt: "2026-06-10T12:00:00Z",
      role: { workspaceRoleId: 2, roleName: "Developer" }
    }
  }
];

export let workspaceDetails = {
  12: {
    workspaceId: 12,
    name: "Alloc Core Team",
    type: "Company",
    createdAt: "2026-06-01T08:00:00Z",
    currentUserMembership: {
      workspaceMemberId: 99,
      resourceId: 5,
      employeeCode: "EMP0005",
      status: "Active",
      joinedAt: "2026-06-01T08:00:00Z",
      role: { workspaceRoleId: 1, roleName: "Owner" }
    },
    memberSummary: {
      totalMembers: 8,
      activeMembers: 7,
      pendingInvites: 1,
      deactivatedMembers: 0
    },
    projectSummary: {
      totalProjects: 3,
      planningProjects: 1,
      inProgressProjects: 1,
      completedProjects: 1,
      onHoldProjects: 0,
      cancelledProjects: 0
    },
    currentPlan: {
      planCode: "FREE",
      limits: [
        { featureCode: "MAX_MEMBERS", isIncluded: true, limitValue: 10 },
        { featureCode: "AI_CHAT_QUOTA", isIncluded: false, limitValue: 10 },
        { featureCode: "AI_RISK_MGT", isIncluded: false, limitValue: 0 }
      ]
    }
  },
  13: {
    workspaceId: 13,
    name: "Research Lab Beta",
    type: "Personal",
    createdAt: "2026-06-10T12:00:00Z",
    currentUserMembership: {
      workspaceMemberId: 102,
      resourceId: 5,
      employeeCode: "EMP0005",
      status: "Active",
      joinedAt: "2026-06-10T12:00:00Z",
      role: { workspaceRoleId: 2, roleName: "Developer" }
    },
    memberSummary: {
      totalMembers: 3,
      activeMembers: 3,
      pendingInvites: 0,
      deactivatedMembers: 0
    },
    projectSummary: {
      totalProjects: 2,
      planningProjects: 0,
      inProgressProjects: 1,
      completedProjects: 0,
      onHoldProjects: 1,
      cancelledProjects: 0
    },
    currentPlan: {
      planCode: "FREE",
      limits: [
        { featureCode: "MAX_MEMBERS", isIncluded: true, limitValue: 5 },
        { featureCode: "AI_CHAT_QUOTA", isIncluded: false, limitValue: 10 },
        { featureCode: "AI_RISK_MGT", isIncluded: false, limitValue: 0 }
      ]
    }
  }
};

// ============================================================
// WORKSPACE MEMBERS (khớp API GET /workspaces/{id}/members)
// ============================================================
export let workspaceMembers = {
  12: {
    page: 1, pageSize: 20, totalItems: 5, totalPages: 1,
    items: [
      {
        workspaceMemberId: 99,
        resource: { resourceId: 5, fullName: "Từ Vĩ Thành", phoneNumber: "0912345678", avatarUrl: "https://i.pravatar.cc/150?u=5", timezone: "SE Asia Standard Time" },
        employeeCode: "EMP0005", status: "Active", joinedAt: "2026-06-01T08:00:00Z",
        role: { workspaceRoleId: 1, roleName: "Owner" }
      },
      {
        workspaceMemberId: 100,
        resource: { resourceId: 6, fullName: "Nguyễn Minh Khoa", phoneNumber: "0987654321", avatarUrl: "https://i.pravatar.cc/150?u=6", timezone: "SE Asia Standard Time" },
        employeeCode: "EMP0006", status: "Active", joinedAt: "2026-06-02T09:00:00Z",
        role: { workspaceRoleId: 3, roleName: "Manager" }
      },
      {
        workspaceMemberId: 101,
        resource: { resourceId: 7, fullName: "Trần Thị Hồng", phoneNumber: "0901234567", avatarUrl: "https://i.pravatar.cc/150?u=7", timezone: "SE Asia Standard Time" },
        employeeCode: "EMP0007", status: "Active", joinedAt: "2026-06-03T10:00:00Z",
        role: { workspaceRoleId: 4, roleName: "Developer" }
      },
      {
        workspaceMemberId: 103,
        resource: { resourceId: 8, fullName: "Lê Quốc Bảo", phoneNumber: "0909876543", avatarUrl: "", timezone: "SE Asia Standard Time" },
        employeeCode: "EMP0008", status: "Active", joinedAt: "2026-06-05T08:00:00Z",
        role: { workspaceRoleId: 4, roleName: "Developer" }
      },
      {
        workspaceMemberId: 104,
        resource: { resourceId: 9, fullName: "Phạm Thanh Tùng", phoneNumber: "0932111222", avatarUrl: "https://i.pravatar.cc/150?u=9", timezone: "SE Asia Standard Time" },
        employeeCode: "EMP0009", status: "Pending", joinedAt: "2026-06-12T14:00:00Z",
        role: { workspaceRoleId: 4, roleName: "Developer" }
      }
    ]
  },
  13: {
    page: 1, pageSize: 20, totalItems: 3, totalPages: 1,
    items: [
      {
        workspaceMemberId: 102,
        resource: { resourceId: 5, fullName: "Từ Vĩ Thành", phoneNumber: "0912345678", avatarUrl: "https://i.pravatar.cc/150?u=5", timezone: "SE Asia Standard Time" },
        employeeCode: "EMP0005", status: "Active", joinedAt: "2026-06-10T12:00:00Z",
        role: { workspaceRoleId: 2, roleName: "Owner" }
      },
      {
        workspaceMemberId: 105,
        resource: { resourceId: 10, fullName: "Đỗ Thị Mai", phoneNumber: "0977888999", avatarUrl: "https://i.pravatar.cc/150?u=10", timezone: "SE Asia Standard Time" },
        employeeCode: "EMP0010", status: "Active", joinedAt: "2026-06-11T09:00:00Z",
        role: { workspaceRoleId: 4, roleName: "Researcher" }
      },
      {
        workspaceMemberId: 106,
        resource: { resourceId: 11, fullName: "Võ Hoàng Nam", phoneNumber: "0966555444", avatarUrl: "https://i.pravatar.cc/150?u=11", timezone: "SE Asia Standard Time" },
        employeeCode: "EMP0011", status: "Active", joinedAt: "2026-06-12T10:00:00Z",
        role: { workspaceRoleId: 4, roleName: "Researcher" }
      }
    ]
  }
};

// ============================================================
// MEMBER PROFILES (khớp API GET /workspaces/{id}/members/{id}/profile)
// ============================================================
export let memberProfiles = {
  99: {
    profileID: 99, workspaceMemberID: 99,
    priorExperienceYears: 7, totalExperienceYears: 7,
    educationLevel: "Master",
    technicalSkillScore: 85.00, communicationScore: 90.00,
    leadershipScore: 88.00, problemSolvingScore: 92.00,
    avgSoftSkillScore: 90.000, attendanceRate: 98.50,
    conflictRate: 2.00, performanceRating: "Outstanding",
    lastEvaluatedAt: "2026-06-14T08:01:24Z"
  },
  100: {
    profileID: 100, workspaceMemberID: 100,
    priorExperienceYears: 5, totalExperienceYears: 5,
    educationLevel: "Bachelor",
    technicalSkillScore: 78.00, communicationScore: 82.00,
    leadershipScore: 75.00, problemSolvingScore: 80.00,
    avgSoftSkillScore: 79.000, attendanceRate: 95.00,
    conflictRate: 5.00, performanceRating: "Good",
    lastEvaluatedAt: "2026-06-14T08:01:24Z"
  },
  101: {
    profileID: 101, workspaceMemberID: 101,
    priorExperienceYears: 3, totalExperienceYears: 3,
    educationLevel: "Bachelor",
    technicalSkillScore: 70.00, communicationScore: 85.00,
    leadershipScore: 60.00, problemSolvingScore: 72.00,
    avgSoftSkillScore: 72.333, attendanceRate: 92.00,
    conflictRate: 3.00, performanceRating: "Average",
    lastEvaluatedAt: "2026-06-14T08:01:24Z"
  }
};

// ============================================================
// PROJECTS
// ============================================================
export let projects = {
  12: [
    {
      projectId: 3, workspaceId: 12, projectName: "Alloc Web Application",
      expectedBudget: 15000.00, totalRevenue: 20000.00,
      startDate: "2026-06-01", endDate: "2026-12-31",
      status: "In Progress", originalCurrencyCode: "USD", exchangeRateToUSD: 1.0000,
      methodology: "Agile", createdAt: "2026-06-01T08:00:00Z"
    },
    {
      projectId: 4, workspaceId: 12, projectName: "Alloc Phase 2 Backend",
      expectedBudget: 45000000.00, totalRevenue: 0.00,
      startDate: "2026-07-01", endDate: "2026-11-30",
      status: "Planning", originalCurrencyCode: "VND", exchangeRateToUSD: 0.00004,
      methodology: "Scrum", createdAt: "2026-06-12T23:46:00Z"
    },
    {
      projectId: 5, workspaceId: 12, projectName: "Alloc Mobile App",
      expectedBudget: 8000.00, totalRevenue: 8000.00,
      startDate: "2026-02-01", endDate: "2026-05-31",
      status: "Completed", originalCurrencyCode: "USD", exchangeRateToUSD: 1.0000,
      methodology: "Kanban", createdAt: "2026-02-01T09:00:00Z"
    }
  ],
  13: [
    {
      projectId: 1, workspaceId: 13, projectName: "Neural Net Optimization",
      expectedBudget: 145000.00, totalRevenue: 180000.00,
      startDate: "2026-01-15", endDate: "2026-08-30",
      status: "In Progress", originalCurrencyCode: "USD", exchangeRateToUSD: 1.0000,
      methodology: "Agile", createdAt: "2026-01-15T09:00:00Z"
    },
    {
      projectId: 2, workspaceId: 13, projectName: "Genomics Study",
      expectedBudget: 320000.00, totalRevenue: 350000.00,
      startDate: "2025-10-01", endDate: "2026-06-30",
      status: "On Hold", originalCurrencyCode: "USD", exchangeRateToUSD: 1.0000,
      methodology: "Waterfall", createdAt: "2025-10-01T10:00:00Z"
    }
  ]
};

// ============================================================
// TASKS (khớp API GET /projects/{id}/tasks)
// ============================================================
export let tasks = {
  1: [
    { taskId: 101, projectId: 1, taskName: "Prepare training datasets", status: "Done", durationType: "Day", estimatedValue: 5.0, startDate: "2026-01-20", endDate: "2026-02-15", createdAt: "2026-01-20T00:00:00Z", complexity: "Medium", requiredSkillLevel: "Medium", priority: "Medium", expectedTeamSize: 2 },
    { taskId: 102, projectId: 1, taskName: "Develop CNN architecture", status: "In Progress", durationType: "StoryPoint", estimatedValue: 8.0, startDate: "2026-02-16", endDate: "2026-04-30", createdAt: "2026-02-16T00:00:00Z", complexity: "High", requiredSkillLevel: "High", priority: "High", expectedTeamSize: 2 },
    { taskId: 103, projectId: 1, taskName: "Optimize hyper-parameters", status: "To-do", durationType: "Hour", estimatedValue: 40.0, startDate: "2026-05-01", endDate: "2026-07-15", createdAt: "2026-05-01T00:00:00Z", complexity: "Critical", requiredSkillLevel: "Expert", priority: "Critical", expectedTeamSize: 1 },
    { taskId: 104, projectId: 1, taskName: "Evaluate final model accuracy", status: "To-do", durationType: "Day", estimatedValue: 10.0, startDate: "2026-07-16", endDate: "2026-08-25", createdAt: "2026-07-16T00:00:00Z", complexity: "Medium", requiredSkillLevel: "Medium", priority: "High", expectedTeamSize: 1 }
  ],
  2: [
    { taskId: 201, projectId: 2, taskName: "Collect DNA sample sequences", status: "Done", durationType: "Day", estimatedValue: 15.0, startDate: "2025-10-05", endDate: "2025-11-30", createdAt: "2025-10-05T00:00:00Z", complexity: "Medium", requiredSkillLevel: "Low", priority: "High", expectedTeamSize: 3 },
    { taskId: 202, projectId: 2, taskName: "Align gene sequences using BLAST", status: "Review", durationType: "Hour", estimatedValue: 120.0, startDate: "2025-12-01", endDate: "2026-03-15", createdAt: "2025-12-01T00:00:00Z", complexity: "High", requiredSkillLevel: "High", priority: "Critical", expectedTeamSize: 2 },
    { taskId: 203, projectId: 2, taskName: "Identify mutation patterns", status: "In Progress", durationType: "StoryPoint", estimatedValue: 13.0, startDate: "2026-03-16", endDate: "2026-05-31", createdAt: "2026-03-16T00:00:00Z", complexity: "Critical", requiredSkillLevel: "Expert", priority: "High", expectedTeamSize: 2 },
    { taskId: 204, projectId: 2, taskName: "Draft genome report", status: "To-do", durationType: "Day", estimatedValue: 8.0, startDate: "2026-06-01", endDate: "2026-06-25", createdAt: "2026-06-01T00:00:00Z", complexity: "Low", requiredSkillLevel: "Medium", priority: "Medium", expectedTeamSize: 1 }
  ],
  3: [
    { taskId: 301, projectId: 3, taskName: "Design UI/UX Mockups", status: "Done", durationType: "Day", estimatedValue: 7.0, startDate: "2026-06-01", endDate: "2026-06-14", createdAt: "2026-06-01T00:00:00Z", complexity: "Medium", requiredSkillLevel: "Medium", priority: "High", expectedTeamSize: 1 },
    { taskId: 302, projectId: 3, taskName: "Implement Client Layout & Sidebar", status: "Done", durationType: "Hour", estimatedValue: 24.0, startDate: "2026-06-15", endDate: "2026-06-25", createdAt: "2026-06-15T00:00:00Z", complexity: "Low", requiredSkillLevel: "Low", priority: "Medium", expectedTeamSize: 1 },
    { taskId: 303, projectId: 3, taskName: "Build Kanban Board Page", status: "In Progress", durationType: "StoryPoint", estimatedValue: 5.0, startDate: "2026-06-26", endDate: "2026-08-15", createdAt: "2026-06-26T00:00:00Z", complexity: "Medium", requiredSkillLevel: "Medium", priority: "High", expectedTeamSize: 1 },
    { taskId: 304, projectId: 3, taskName: "Develop Gantt Chart Pipeline", status: "In Progress", durationType: "StoryPoint", estimatedValue: 8.0, startDate: "2026-08-16", endDate: "2026-10-10", createdAt: "2026-08-16T00:00:00Z", complexity: "High", requiredSkillLevel: "High", priority: "High", expectedTeamSize: 1 },
    { taskId: 305, projectId: 3, taskName: "Integrate Real-time Hub (SignalR)", status: "To-do", durationType: "Hour", estimatedValue: 36.0, startDate: "2026-10-11", endDate: "2026-11-20", createdAt: "2026-10-11T00:00:00Z", complexity: "Critical", requiredSkillLevel: "Expert", priority: "Critical", expectedTeamSize: 2 },
    { taskId: 306, projectId: 3, taskName: "Financial Dashboard Integration", status: "To-do", durationType: "Day", estimatedValue: 10.0, startDate: "2026-11-21", endDate: "2026-12-25", createdAt: "2026-11-21T00:00:00Z", complexity: "Medium", requiredSkillLevel: "High", priority: "Medium", expectedTeamSize: 1 }
  ],
  4: [
    { taskId: 401, projectId: 4, taskName: "Database Schema Design & Migration", status: "To-do", durationType: "StoryPoint", estimatedValue: 5.0, startDate: "2026-07-01", endDate: "2026-07-20", createdAt: "2026-07-01T00:00:00Z", complexity: "High", requiredSkillLevel: "High", priority: "High", expectedTeamSize: 1 },
    { taskId: 402, projectId: 4, taskName: "API Authorization Guards & JWT", status: "To-do", durationType: "Hour", estimatedValue: 16.0, startDate: "2026-07-21", endDate: "2026-08-10", createdAt: "2026-07-21T00:00:00Z", complexity: "High", requiredSkillLevel: "Expert", priority: "Critical", expectedTeamSize: 1 },
    { taskId: 403, projectId: 4, taskName: "Setup ProjectsController Endpoints", status: "To-do", durationType: "Day", estimatedValue: 12.0, startDate: "2026-08-11", endDate: "2026-09-30", createdAt: "2026-08-11T00:00:00Z", complexity: "Medium", requiredSkillLevel: "Medium", priority: "High", expectedTeamSize: 1 },
    { taskId: 404, projectId: 4, taskName: "Unit Testing with xUnit & Mock", status: "To-do", durationType: "Hour", estimatedValue: 40.0, startDate: "2026-10-01", endDate: "2026-11-25", createdAt: "2026-10-01T00:00:00Z", complexity: "Medium", requiredSkillLevel: "Medium", priority: "Medium", expectedTeamSize: 2 }
  ],
  5: [
    { taskId: 501, projectId: 5, taskName: "Setup React Native Workspace", status: "Done", durationType: "Day", estimatedValue: 3.0, startDate: "2026-02-01", endDate: "2026-02-15", createdAt: "2026-02-01T00:00:00Z", complexity: "Low", requiredSkillLevel: "Low", priority: "Medium", expectedTeamSize: 1 },
    { taskId: 502, projectId: 5, taskName: "Mobile Layout and Auth Screens", status: "Done", durationType: "StoryPoint", estimatedValue: 5.0, startDate: "2026-02-16", endDate: "2026-04-10", createdAt: "2026-02-16T00:00:00Z", complexity: "Medium", requiredSkillLevel: "Medium", priority: "High", expectedTeamSize: 1 },
    { taskId: 503, projectId: 5, taskName: "Connect with REST API endpoints", status: "Done", durationType: "Hour", estimatedValue: 24.0, startDate: "2026-04-11", endDate: "2026-05-30", createdAt: "2026-04-11T00:00:00Z", complexity: "High", requiredSkillLevel: "High", priority: "High", expectedTeamSize: 1 }
  ]
};

// ============================================================
// TASK ASSIGNEES (khớp API POST /tasks/{id}/assignees)
// ============================================================
export let taskAssignees = {
  102: [
    { taskId: 102, memberId: 99, assigneeType: "Assignee", assignedAt: "2026-02-16T08:00:00Z" },
    { taskId: 102, memberId: 102, assigneeType: "Reviewer", assignedAt: "2026-02-16T08:00:00Z" }
  ],
  303: [
    { taskId: 303, memberId: 99, assigneeType: "Assignee", assignedAt: "2026-06-26T08:00:00Z" },
    { taskId: 303, memberId: 100, assigneeType: "Reviewer", assignedAt: "2026-06-26T08:00:00Z" }
  ],
  304: [
    { taskId: 304, memberId: 101, assigneeType: "Assignee", assignedAt: "2026-08-16T08:00:00Z" }
  ]
};

// ============================================================
// TASK DEPENDENCIES (khớp API POST /tasks/{id}/dependencies)
// ============================================================
export let taskDependencies = {
  103: [{ dependencyId: 1, predecessorTaskId: 102, successorTaskId: 103, dependencyType: "FS" }],
  104: [{ dependencyId: 2, predecessorTaskId: 103, successorTaskId: 104, dependencyType: "FS" }],
  304: [{ dependencyId: 3, predecessorTaskId: 303, successorTaskId: 304, dependencyType: "FS" }]
};

// ============================================================
// TASK COMMENTS (khớp API GET /tasks/{id}/comments)
// ============================================================
export let taskComments = {
  102: [
    {
      commentId: 1, taskId: 102, memberId: 99, memberName: "Từ Vĩ Thành",
      memberAvatarUrl: "https://i.pravatar.cc/150?u=5", parentCommentId: null,
      content: "CNN architecture cần thêm residual connections để tăng accuracy.",
      createdAt: "2026-03-01T10:30:00Z", updatedAt: null,
      replies: [
        {
          commentId: 2, taskId: 102, memberId: 102, memberName: "Từ Vĩ Thành",
          memberAvatarUrl: "https://i.pravatar.cc/150?u=5", parentCommentId: 1,
          content: "Đồng ý, sẽ thêm ResNet blocks vào layer 3-5.",
          createdAt: "2026-03-01T11:00:00Z", updatedAt: null, replies: []
        }
      ]
    }
  ],
  303: [
    {
      commentId: 3, taskId: 303, memberId: 100, memberName: "Nguyễn Minh Khoa",
      memberAvatarUrl: "https://i.pravatar.cc/150?u=6", parentCommentId: null,
      content: "Kanban board cần hỗ trợ drag-and-drop giữa các cột status.",
      createdAt: "2026-07-01T14:00:00Z", updatedAt: "2026-07-02T09:00:00Z",
      replies: []
    }
  ]
};

// ============================================================
// EXPENSES (khớp API GET /projects/{id}/expenses)
// ============================================================
export let expenses = {
  1: [
    { expenseId: 10, projectId: 1, projectName: "Neural Net Optimization", category: "Infrastructure", amount: 45000.00, expenseDate: "2026-03-01", description: "GPU cluster training hosting fee" },
    { expenseId: 11, projectId: 1, projectName: "Neural Net Optimization", category: "Software License", amount: 20000.00, expenseDate: "2026-04-15", description: "Lead AI researcher monthly salary" }
  ],
  2: [
    { expenseId: 20, projectId: 2, projectName: "Genomics Study", category: "Infrastructure", amount: 4500.00, expenseDate: "2025-12-10", description: "Flights to Geneva conference" }
  ],
  3: [
    { expenseId: 50, projectId: 3, projectName: "Alloc Web Application", category: "Software License", amount: 250.00, expenseDate: "2026-06-10", description: "Figma design system subscription" },
    { expenseId: 51, projectId: 3, projectName: "Alloc Web Application", category: "Infrastructure", amount: 1200.00, expenseDate: "2026-06-12", description: "Azure cloud services - June invoice" },
    { expenseId: 52, projectId: 3, projectName: "Alloc Web Application", category: "Infrastructure", amount: 1800.00, expenseDate: "2026-06-14", description: "Freelance frontend UI review contract" }
  ],
  4: [],
  5: [
    { expenseId: 90, projectId: 5, projectName: "Alloc Mobile App", category: "Software License", amount: 99.00, expenseDate: "2026-03-01", description: "Apple Developer Program renewal" }
  ]
};

// ============================================================
// REVENUES (khớp API GET /projects/{id}/revenues)
// ============================================================
export let revenues = {
  1: [
    { revenueId: 10, projectId: 1, type: "Time & Material", amount: 80000.00, expectedDate: "2026-04-01", status: "Received" },
    { revenueId: 11, projectId: 1, type: "Time & Material", amount: 100000.00, expectedDate: "2026-08-01", status: "Pending" }
  ],
  2: [],
  3: [
    { revenueId: 80, projectId: 3, type: "Milestone", amount: 5000.00, expectedDate: "2026-07-01", status: "Pending" },
    { revenueId: 81, projectId: 3, type: "Fixed Price", amount: 15000.00, expectedDate: "2026-06-15", status: "Received" }
  ],
  4: [],
  5: [
    { revenueId: 90, projectId: 5, type: "Fixed Price", amount: 8000.00, expectedDate: "2026-05-15", status: "Received" }
  ]
};

// ============================================================
// RISKS (khớp API GET /projects/{id}/risks)
// ============================================================
export let risks = {
  3: [
    {
      riskId: 1, projectId: 3, projectName: "Alloc Web Application", taskId: null,
      riskName: "Schedule Delay Risk",
      description: "Team may not meet Q3 deadline due to complex SignalR integration requirements",
      category: "Schedule", probability: 4, impact: 3, riskScore: 12,
      estimatedFinancialImpact: 5000.00, actualFinancialImpact: 0.00,
      status: "Mitigation Planned", ownerId: 99,
      createdAt: "2026-06-14T08:01:31.94", updatedAt: "2026-06-14T08:01:33.44"
    },
    {
      riskId: 2, projectId: 3, projectName: "Alloc Web Application", taskId: 303,
      riskName: "Technical Complexity Risk",
      description: "Kanban board drag-and-drop may be more complex than estimated, affecting overall timeline",
      category: "Technical", probability: 3, impact: 4, riskScore: 12,
      estimatedFinancialImpact: 8000.00, actualFinancialImpact: 0.00,
      status: "Identified", ownerId: 100,
      createdAt: "2026-06-14T08:01:32.917", updatedAt: "2026-06-14T08:01:32.917"
    },
    {
      riskId: 3, projectId: 3, projectName: "Alloc Web Application", taskId: null,
      riskName: "Budget Overrun Risk",
      description: "Azure cloud costs increasing beyond initial budget estimates due to higher test environments",
      category: "Budget", probability: 2, impact: 3, riskScore: 6,
      estimatedFinancialImpact: 3000.00, actualFinancialImpact: 0.00,
      status: "Monitoring", ownerId: 99,
      createdAt: "2026-06-15T10:00:00Z", updatedAt: "2026-06-18T14:00:00Z"
    }
  ],
  1: [
    {
      riskId: 4, projectId: 1, projectName: "Neural Net Optimization", taskId: 103,
      riskName: "GPU Resource Scarcity",
      description: "Training pipeline requires significant GPU resources that may not be available during peak usage",
      category: "Resource", probability: 3, impact: 5, riskScore: 15,
      estimatedFinancialImpact: 25000.00, actualFinancialImpact: 0.00,
      status: "Identified", ownerId: 102,
      createdAt: "2026-05-01T09:00:00Z", updatedAt: "2026-05-01T09:00:00Z"
    }
  ],
  2: [], 4: [], 5: []
};

// ============================================================
// RISK MITIGATIONS (khớp API POST /risks/{id}/mitigations)
// ============================================================
export let riskMitigations = {
  1: [
    {
      mitigationId: 1, riskId: 1, strategyType: "Mitigate",
      actionPlan: "Add 1 extra developer; Conduct daily standup meetings; Break SignalR tasks into smaller subtasks",
      mitigationCost: 3000.00, assignedMemberId: 100,
      targetDate: "2026-07-15", status: "Planned",
      createdAt: "2026-06-14T08:01:33.377Z"
    }
  ],
  2: [],
  3: [
    {
      mitigationId: 2, riskId: 3, strategyType: "Accept",
      actionPlan: "Set budget alerts at 80% threshold; Downgrade non-critical test instances to B1 tier",
      mitigationCost: 0, assignedMemberId: 99,
      targetDate: "2026-06-30", status: "In Progress",
      createdAt: "2026-06-18T14:00:00Z"
    }
  ],
  4: []
};

// ============================================================
// RISK LIFECYCLE (khớp API GET /risks/{id}/lifecycle)
// ============================================================
export let riskLifecycle = {
  1: [
    { historyId: 1, riskId: 1, changedByMemberId: 99, oldStatus: "Identified", newStatus: "Mitigation Planned", oldScore: 12, newScore: 12, changeNote: "Da lap ke hoach giam thieu rui ro.", changeDate: "2026-06-14T08:01:33.44" }
  ],
  3: [
    { historyId: 2, riskId: 3, changedByMemberId: 99, oldStatus: "Identified", newStatus: "Monitoring", oldScore: 6, newScore: 6, changeNote: "Chuyển sang theo dõi chủ động.", changeDate: "2026-06-18T14:00:00Z" }
  ]
};

// ============================================================
// TIMESHEETS (khớp API GET /timesheets?workspaceId=)
// ============================================================
export let timesheetEntries = {
  12: [
    { timesheetId: 1, taskId: 303, taskName: "Build Kanban Board Page", projectId: 3, projectName: "Alloc Web Application", workspaceId: 12, workspaceMemberId: 99, memberName: "Từ Vĩ Thành", workDate: "2026-06-20", normalHours: 7.50, otHours: 1.50, loggedHourlyRate: 25.00, loggedOTRate: 37.50, totalCost: 243.75, createdAt: "2026-06-20T08:00:00Z" },
    { timesheetId: 2, taskId: 303, taskName: "Build Kanban Board Page", projectId: 3, projectName: "Alloc Web Application", workspaceId: 12, workspaceMemberId: 99, memberName: "Từ Vĩ Thành", workDate: "2026-06-19", normalHours: 8.00, otHours: 0.00, loggedHourlyRate: 25.00, loggedOTRate: 37.50, totalCost: 200.00, createdAt: "2026-06-19T08:00:00Z" },
    { timesheetId: 3, taskId: 301, taskName: "Design UI/UX Mockups", projectId: 3, projectName: "Alloc Web Application", workspaceId: 12, workspaceMemberId: 100, memberName: "Nguyễn Minh Khoa", workDate: "2026-06-18", normalHours: 6.00, otHours: 2.00, loggedHourlyRate: 22.00, loggedOTRate: 33.00, totalCost: 198.00, createdAt: "2026-06-18T08:00:00Z" },
    { timesheetId: 4, taskId: 304, taskName: "Develop Gantt Chart Pipeline", projectId: 3, projectName: "Alloc Web Application", workspaceId: 12, workspaceMemberId: 101, memberName: "Trần Thị Hồng", workDate: "2026-06-20", normalHours: 8.00, otHours: 0.00, loggedHourlyRate: 20.00, loggedOTRate: 30.00, totalCost: 160.00, createdAt: "2026-06-20T08:00:00Z" }
  ],
  13: [
    { timesheetId: 5, taskId: 102, taskName: "Develop CNN architecture", projectId: 1, projectName: "Neural Net Optimization", workspaceId: 13, workspaceMemberId: 102, memberName: "Từ Vĩ Thành", workDate: "2026-06-20", normalHours: 8.00, otHours: 0.00, loggedHourlyRate: 30.00, loggedOTRate: 45.00, totalCost: 240.00, createdAt: "2026-06-20T08:00:00Z" },
    { timesheetId: 6, taskId: 102, taskName: "Develop CNN architecture", projectId: 1, projectName: "Neural Net Optimization", workspaceId: 13, workspaceMemberId: 105, memberName: "Đỗ Thị Mai", workDate: "2026-06-19", normalHours: 7.00, otHours: 1.00, loggedHourlyRate: 28.00, loggedOTRate: 42.00, totalCost: 238.00, createdAt: "2026-06-19T08:00:00Z" }
  ]
};

// ============================================================
// LEAVE REQUESTS (khớp API POST /workspaces/{id}/leave-requests)
// ============================================================
export let leaveRequests = {
  12: [
    {
      requestType: "Leave", requestId: 1, workspaceId: 12, workspaceMemberId: 101,
      requesterName: "Trần Thị Hồng", approverId: null, approverName: null,
      startDate: "2026-07-01", endDate: "2026-07-03",
      reason: "Nghỉ phép gia đình - Family vacation scheduled",
      status: "Pending", approvalNote: null, reviewedAt: null,
      createdAt: "2026-06-14T08:01:35.243"
    },
    {
      requestType: "Leave", requestId: 2, workspaceId: 12, workspaceMemberId: 103,
      requesterName: "Lê Quốc Bảo", approverId: 99, approverName: "Từ Vĩ Thành",
      startDate: "2026-06-25", endDate: "2026-06-26",
      reason: "Khám sức khỏe định kỳ",
      status: "Approved", approvalNote: "Approved - take care!",
      reviewedAt: "2026-06-20T10:00:00Z",
      createdAt: "2026-06-18T08:00:00Z"
    }
  ],
  13: []
};

// ============================================================
// OT REQUESTS (khớp API POST /workspaces/{id}/ot-requests)
// ============================================================
export let otRequests = {
  12: [
    {
      requestType: "OT", requestId: 1, workspaceId: 12, workspaceMemberId: 99,
      requesterName: "Từ Vĩ Thành", taskId: 303, taskName: "Build Kanban Board Page",
      projectId: 3, projectName: "Alloc Web Application",
      requestedDate: "2026-06-21", expectedHours: 3.00,
      approverId: null, approverName: null,
      status: "Pending", approvalNote: null, reviewedAt: null,
      createdAt: "2026-06-14T08:01:35.69"
    },
    {
      requestType: "OT", requestId: 2, workspaceId: 12, workspaceMemberId: 100,
      requesterName: "Nguyễn Minh Khoa", taskId: 304, taskName: "Develop Gantt Chart Pipeline",
      projectId: 3, projectName: "Alloc Web Application",
      requestedDate: "2026-06-18", expectedHours: 2.00,
      approverId: 99, approverName: "Từ Vĩ Thành",
      status: "Rejected", approvalNote: "OT not needed at this stage",
      reviewedAt: "2026-06-17T16:00:00Z",
      createdAt: "2026-06-16T10:00:00Z"
    }
  ],
  13: []
};

// ============================================================
// REVIEW CYCLES (khớp API GET /workspaces/{id}/review-cycles)
// ============================================================
export let reviewCycles = {
  12: [
    {
      cycleID: 1, workspaceID: 12, cycleName: "Q2 2026 Performance Review",
      startDate: "2026-06-01", endDate: "2026-06-30",
      status: "Active", createdBy: 99, createdAt: "2026-06-01T08:00:00Z"
    },
    {
      cycleID: 2, workspaceID: 12, cycleName: "Q1 2026 Performance Review",
      startDate: "2026-03-01", endDate: "2026-03-31",
      status: "Completed", createdBy: 99, createdAt: "2026-03-01T08:00:00Z"
    }
  ],
  13: []
};

// ============================================================
// EVALUATIONS (khớp API POST /review-cycles/{id}/evaluations)
// ============================================================
export let evaluations = {
  1: [
    {
      evaluationID: 1, cycleID: 1, revieweeID: 99, reviewerID: 99,
      evaluationType: "Self", communicationScore: 85, leadershipScore: 78,
      problemSolvingScore: 92, feedbackNotes: "Strong in problem solving, improving communication",
      submittedAt: "2026-06-14T08:01:37.476Z", status: "Submitted"
    },
    {
      evaluationID: 2, cycleID: 1, revieweeID: 100, reviewerID: 100,
      evaluationType: "Self", communicationScore: 80, leadershipScore: 82,
      problemSolvingScore: 78, feedbackNotes: "Good leadership skills, need to improve technical depth",
      submittedAt: "2026-06-15T10:00:00Z", status: "Submitted"
    }
  ],
  2: [
    {
      evaluationID: 3, cycleID: 2, revieweeID: 99, reviewerID: 99,
      evaluationType: "Self", communicationScore: 80, leadershipScore: 75,
      problemSolvingScore: 88, feedbackNotes: "Solid quarter overall",
      submittedAt: "2026-03-25T10:00:00Z", status: "Submitted"
    }
  ]
};

// ============================================================
// NOTIFICATIONS (khớp API GET /api/v1/Notifications)
// ============================================================
export let notifications = [
  { notificationId: 1, resourceId: 5, type: "LeaveApproval", title: "Đơn nghỉ phép mới", content: "Trần Thị Hồng đã gửi đơn nghỉ phép từ 01/07 đến 03/07.", isRead: false, referenceId: 1, referenceType: "LeaveRequest", createdAt: "2026-06-20T14:00:00Z" },
  { notificationId: 2, resourceId: 5, type: "OTRequest", title: "Yêu cầu OT mới", content: "Từ Vĩ Thành yêu cầu làm thêm 3h cho task Build Kanban Board Page.", isRead: false, referenceId: 1, referenceType: "OTRequest", createdAt: "2026-06-20T13:00:00Z" },
  { notificationId: 3, resourceId: 5, type: "TaskAssigned", title: "Task mới được giao", content: "Bạn đã được giao task Build Kanban Board Page trong dự án Alloc Web Application.", isRead: true, referenceId: 303, referenceType: "Task", createdAt: "2026-06-19T10:00:00Z" },
  { notificationId: 4, resourceId: 5, type: "Comment", title: "Bình luận mới", content: "Nguyễn Minh Khoa đã bình luận trên task Build Kanban Board Page.", isRead: true, referenceId: 3, referenceType: "Comment", createdAt: "2026-06-18T11:00:00Z" },
  { notificationId: 5, resourceId: 5, type: "RiskCreated", title: "Rủi ro mới được tạo", content: "Technical Complexity Risk đã được tạo cho dự án Alloc Web Application.", isRead: true, referenceId: 2, referenceType: "Risk", createdAt: "2026-06-17T09:00:00Z" }
];

// ============================================================
// AI INSIGHTS (khớp API GET /projects/{id}/ai-insights)
// ============================================================
export let aiInsights = {
  3: [
    {
      logId: 1, projectId: 3, suggestionType: "Risk Warning",
      suggestionContent: "🤖 AI Risk Warning:\n- Dự án có khả năng phát sinh rủi ro về tiến độ nếu các task đang trễ không được xử lý sớm.\n- Nên ưu tiên review các task có effort cao và cập nhật mitigation plan cho risk quan trọng.\n- Schedule Delay Risk (Score: 12) cần được giám sát chặt chẽ.\n- Technical Complexity Risk cho Kanban Board cũng ở mức cao (Score: 12).",
      userFeedback: null, createdAt: "2026-06-14T08:01:44.593"
    },
    {
      logId: 2, projectId: 3, suggestionType: "Resource Optimization",
      suggestionContent: "🤖 Resource Optimization:\n- Đội hiện tại có 5 thành viên active nhưng chỉ 3 task đang In Progress.\n- Đề xuất giao thêm task cho EMP0008 (Lê Quốc Bảo) để tối ưu hóa năng suất.\n- Task 'Financial Dashboard Integration' có thể bắt đầu sớm hơn kế hoạch.",
      userFeedback: null, createdAt: "2026-06-16T10:30:00Z"
    }
  ],
  1: [
    {
      logId: 3, projectId: 1, suggestionType: "Budget Forecast",
      suggestionContent: "🤖 Budget Forecast:\n- Tổng chi phí hiện tại: $65,000 / $145,000 (44.8%).\n- Tốc độ đốt ngân sách: ~$13,000/tháng.\n- Dự kiến hết ngân sách vào tháng 08/2026 nếu giữ tốc độ hiện tại.\n- Khuyến nghị: Tối ưu chi phí GPU cluster để tiết kiệm ~15% chi phí Infrastructure.",
      userFeedback: null, createdAt: "2026-06-10T14:00:00Z"
    }
  ]
};
