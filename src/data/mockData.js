// Mock database representing values from the C# Server API.
// Synchronized with C# entity schemas and property fields.

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
      role: {
        workspaceRoleId: 1,
        roleName: "Owner"
      }
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
      role: {
        workspaceRoleId: 2,
        roleName: "Developer"
      }
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
      role: {
        workspaceRoleId: 1,
        roleName: "Owner"
      }
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
        {
          featureCode: "MaxMembers",
          isIncluded: true,
          limitValue: 10
        }
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
      role: {
        workspaceRoleId: 2,
        roleName: "Developer"
      }
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
        {
          featureCode: "MaxMembers",
          isIncluded: true,
          limitValue: 5
        }
      ]
    }
  }
};

export let projects = {
  12: [
    {
      projectId: 3,
      workspaceId: 12,
      projectName: "Alloc Web Application",
      expectedBudget: 15000.00,
      totalRevenue: 20000.00,
      startDate: "2026-06-01",
      endDate: "2026-12-31",
      status: "In Progress",
      originalCurrencyCode: "USD",
      exchangeRateToUSD: 1.0000,
      methodology: "Agile",
      createdAt: "2026-06-01T08:00:00Z"
    },
    {
      projectId: 4,
      workspaceId: 12,
      projectName: "Alloc Phase 2 Backend",
      expectedBudget: 45000000.00,
      totalRevenue: 0.00,
      startDate: "2026-07-01",
      endDate: "2026-11-30",
      status: "Planning",
      originalCurrencyCode: "VND",
      exchangeRateToUSD: 0.00004,
      methodology: "Scrum",
      createdAt: "2026-06-12T23:46:00Z"
    },
    {
      projectId: 5,
      workspaceId: 12,
      projectName: "Alloc Mobile App",
      expectedBudget: 8000.00,
      totalRevenue: 8000.00,
      startDate: "2026-02-01",
      endDate: "2026-05-31",
      status: "Completed",
      originalCurrencyCode: "USD",
      exchangeRateToUSD: 1.0000,
      methodology: "Kanban",
      createdAt: "2026-02-01T09:00:00Z"
    }
  ],
  13: [
    {
      projectId: 1,
      workspaceId: 13,
      projectName: "Neural Net Optimization",
      expectedBudget: 145000.00,
      totalRevenue: 180000.00,
      startDate: "2026-01-15",
      endDate: "2026-08-30",
      status: "In Progress",
      originalCurrencyCode: "USD",
      exchangeRateToUSD: 1.0000,
      methodology: "Agile",
      createdAt: "2026-01-15T09:00:00Z"
    },
    {
      projectId: 2,
      workspaceId: 13,
      projectName: "Genomics Study",
      expectedBudget: 320000.00,
      totalRevenue: 350000.00,
      startDate: "2025-10-01",
      endDate: "2026-06-30",
      status: "On Hold",
      originalCurrencyCode: "USD",
      exchangeRateToUSD: 1.0000,
      methodology: "Waterfall",
      createdAt: "2025-10-01T10:00:00Z"
    }
  ]
};

export let tasks = {
  // Project 1: Neural Net Optimization
  1: [
    {
      taskId: 101,
      projectId: 1,
      taskName: "Prepare training datasets",
      status: "Done",
      durationType: "Day",
      estimatedValue: 5.0,
      startDate: "2026-01-20",
      endDate: "2026-02-15",
      createdAt: "2026-01-20T00:00:00Z",
      complexity: "Medium",
      requiredSkillLevel: "Medium",
      priority: "Medium",
      expectedTeamSize: 2
    },
    {
      taskId: 102,
      projectId: 1,
      taskName: "Develop CNN architecture",
      status: "In Progress",
      durationType: "StoryPoint",
      estimatedValue: 8.0,
      startDate: "2026-02-16",
      endDate: "2026-04-30",
      createdAt: "2026-02-16T00:00:00Z",
      complexity: "High",
      requiredSkillLevel: "High",
      priority: "High",
      expectedTeamSize: 2
    },
    {
      taskId: 103,
      projectId: 1,
      taskName: "Optimize hyper-parameters",
      status: "To-do",
      durationType: "Hour",
      estimatedValue: 40.0,
      startDate: "2026-05-01",
      endDate: "2026-07-15",
      createdAt: "2026-05-01T00:00:00Z",
      complexity: "Critical",
      requiredSkillLevel: "Expert",
      priority: "Critical",
      expectedTeamSize: 1
    },
    {
      taskId: 104,
      projectId: 1,
      taskName: "Evaluate final model accuracy",
      status: "To-do",
      durationType: "Day",
      estimatedValue: 10.0,
      startDate: "2026-07-16",
      endDate: "2026-08-25",
      createdAt: "2026-07-16T00:00:00Z",
      complexity: "Medium",
      requiredSkillLevel: "Medium",
      priority: "High",
      expectedTeamSize: 1
    }
  ],
  // Project 2: Genomics Study
  2: [
    {
      taskId: 201,
      projectId: 2,
      taskName: "Collect DNA sample sequences",
      status: "Done",
      durationType: "Day",
      estimatedValue: 15.0,
      startDate: "2025-10-05",
      endDate: "2025-11-30",
      createdAt: "2025-10-05T00:00:00Z",
      complexity: "Medium",
      requiredSkillLevel: "Low",
      priority: "High",
      expectedTeamSize: 3
    },
    {
      taskId: 202,
      projectId: 2,
      taskName: "Align gene sequences using BLAST",
      status: "Review",
      durationType: "Hour",
      estimatedValue: 120.0,
      startDate: "2025-12-01",
      endDate: "2026-03-15",
      createdAt: "2025-12-01T00:00:00Z",
      complexity: "High",
      requiredSkillLevel: "High",
      priority: "Critical",
      expectedTeamSize: 2
    },
    {
      taskId: 203,
      projectId: 2,
      taskName: "Identify mutation patterns",
      status: "In Progress",
      durationType: "StoryPoint",
      estimatedValue: 13.0,
      startDate: "2026-03-16",
      endDate: "2026-05-31",
      createdAt: "2026-03-16T00:00:00Z",
      complexity: "Critical",
      requiredSkillLevel: "Expert",
      priority: "High",
      expectedTeamSize: 2
    },
    {
      taskId: 204,
      projectId: 2,
      taskName: "Draft genome report",
      status: "To-do",
      durationType: "Day",
      estimatedValue: 8.0,
      startDate: "2026-06-01",
      endDate: "2026-06-25",
      createdAt: "2026-06-01T00:00:00Z",
      complexity: "Low",
      requiredSkillLevel: "Medium",
      priority: "Medium",
      expectedTeamSize: 1
    }
  ],
  // Project 3: Alloc Web Application
  3: [
    {
      taskId: 301,
      projectId: 3,
      taskName: "Design UI/UX Mockups",
      status: "Done",
      durationType: "Day",
      estimatedValue: 7.0,
      startDate: "2026-06-01",
      endDate: "2026-06-14",
      createdAt: "2026-06-01T00:00:00Z",
      complexity: "Medium",
      requiredSkillLevel: "Medium",
      priority: "High",
      expectedTeamSize: 1
    },
    {
      taskId: 302,
      projectId: 3,
      taskName: "Implement Client Layout & Sidebar",
      status: "Done",
      durationType: "Hour",
      estimatedValue: 24.0,
      startDate: "2026-06-15",
      endDate: "2026-06-25",
      createdAt: "2026-06-15T00:00:00Z",
      complexity: "Low",
      requiredSkillLevel: "Low",
      priority: "Medium",
      expectedTeamSize: 1
    },
    {
      taskId: 303,
      projectId: 3,
      taskName: "Build Kanban Board Page",
      status: "In Progress",
      durationType: "StoryPoint",
      estimatedValue: 5.0,
      startDate: "2026-06-26",
      endDate: "2026-08-15",
      createdAt: "2026-06-26T00:00:00Z",
      complexity: "Medium",
      requiredSkillLevel: "Medium",
      priority: "High",
      expectedTeamSize: 1
    },
    {
      taskId: 304,
      projectId: 3,
      taskName: "Develop Gantt Chart Pipeline",
      status: "In Progress",
      durationType: "StoryPoint",
      estimatedValue: 8.0,
      startDate: "2026-08-16",
      endDate: "2026-10-10",
      createdAt: "2026-08-16T00:00:00Z",
      complexity: "High",
      requiredSkillLevel: "High",
      priority: "High",
      expectedTeamSize: 1
    },
    {
      taskId: 305,
      projectId: 3,
      taskName: "Integrate Real-time Hub (SignalR)",
      status: "To-do",
      durationType: "Hour",
      estimatedValue: 36.0,
      startDate: "2026-10-11",
      endDate: "2026-11-20",
      createdAt: "2026-10-11T00:00:00Z",
      complexity: "Critical",
      requiredSkillLevel: "Expert",
      priority: "Critical",
      expectedTeamSize: 2
    },
    {
      taskId: 306,
      projectId: 3,
      taskName: "Financial Dashboard Integration",
      status: "To-do",
      durationType: "Day",
      estimatedValue: 10.0,
      startDate: "2026-11-21",
      endDate: "2026-12-25",
      createdAt: "2026-11-21T00:00:00Z",
      complexity: "Medium",
      requiredSkillLevel: "High",
      priority: "Medium",
      expectedTeamSize: 1
    }
  ],
  // Project 4: Alloc Phase 2 Backend
  4: [
    {
      taskId: 401,
      projectId: 4,
      taskName: "Database Schema Design & Migration",
      status: "To-do",
      durationType: "StoryPoint",
      estimatedValue: 5.0,
      startDate: "2026-07-01",
      endDate: "2026-07-20",
      createdAt: "2026-07-01T00:00:00Z",
      complexity: "High",
      requiredSkillLevel: "High",
      priority: "High",
      expectedTeamSize: 1
    },
    {
      taskId: 402,
      projectId: 4,
      taskName: "API Authorization Guards & JWT",
      status: "To-do",
      durationType: "Hour",
      estimatedValue: 16.0,
      startDate: "2026-07-21",
      endDate: "2026-08-10",
      createdAt: "2026-07-21T00:00:00Z",
      complexity: "High",
      requiredSkillLevel: "Expert",
      priority: "Critical",
      expectedTeamSize: 1
    },
    {
      taskId: 403,
      projectId: 4,
      taskName: "Setup ProjectsController Endpoints",
      status: "To-do",
      durationType: "Day",
      estimatedValue: 12.0,
      startDate: "2026-08-11",
      endDate: "2026-09-30",
      createdAt: "2026-08-11T00:00:00Z",
      complexity: "Medium",
      requiredSkillLevel: "Medium",
      priority: "High",
      expectedTeamSize: 1
    },
    {
      taskId: 404,
      projectId: 4,
      taskName: "Unit Testing with xUnit & Mock",
      status: "To-do",
      durationType: "Hour",
      estimatedValue: 40.0,
      startDate: "2026-10-01",
      endDate: "2026-11-25",
      createdAt: "2026-10-01T00:00:00Z",
      complexity: "Medium",
      requiredSkillLevel: "Medium",
      priority: "Medium",
      expectedTeamSize: 2
    }
  ],
  // Project 5: Alloc Mobile App
  5: [
    {
      taskId: 501,
      projectId: 5,
      taskName: "Setup React Native Workspace",
      status: "Done",
      durationType: "Day",
      estimatedValue: 3.0,
      startDate: "2026-02-01",
      endDate: "2026-02-15",
      createdAt: "2026-02-01T00:00:00Z",
      complexity: "Low",
      requiredSkillLevel: "Low",
      priority: "Medium",
      expectedTeamSize: 1
    },
    {
      taskId: 502,
      projectId: 5,
      taskName: "Mobile Layout and Auth Screens",
      status: "Done",
      durationType: "StoryPoint",
      estimatedValue: 5.0,
      startDate: "2026-02-16",
      endDate: "2026-04-10",
      createdAt: "2026-02-16T00:00:00Z",
      complexity: "Medium",
      requiredSkillLevel: "Medium",
      priority: "High",
      expectedTeamSize: 1
    },
    {
      taskId: 503,
      projectId: 5,
      taskName: "Connect with REST API endpoints",
      status: "Done",
      durationType: "Hour",
      estimatedValue: 24.0,
      startDate: "2026-04-11",
      endDate: "2026-05-30",
      createdAt: "2026-04-11T00:00:00Z",
      complexity: "High",
      requiredSkillLevel: "High",
      priority: "High",
      expectedTeamSize: 1
    }
  ]
};

export let expenses = {
  1: [
    {
      expenseId: 10,
      projectId: 1,
      category: "Infrastructure (Cloud/Compute)",
      amount: 45000.00,
      expenseDate: "2026-03-01",
      description: "GPU cluster training hosting fee"
    },
    {
      expenseId: 11,
      projectId: 1,
      category: "Personnel & Research",
      amount: 20000.00,
      expenseDate: "2026-04-15",
      description: "Lead AI researcher monthly salary"
    }
  ],
  2: [
    {
      expenseId: 20,
      projectId: 2,
      category: "Travel & Symposiums",
      amount: 4500.00,
      expenseDate: "2025-12-10",
      description: "Flights to Geneva conference"
    }
  ],
  3: [
    {
      expenseId: 50,
      projectId: 3,
      category: "Software License",
      amount: 250.00,
      expenseDate: "2026-06-10",
      description: "Figma design system subscription"
    },
    {
      expenseId: 51,
      projectId: 3,
      category: "Infrastructure (Cloud/Compute)",
      amount: 1200.00,
      expenseDate: "2026-06-12",
      description: "Azure cloud services - June invoice"
    },
    {
      expenseId: 52,
      projectId: 3,
      category: "Personnel & Research",
      amount: 1800.00,
      expenseDate: "2026-06-14",
      description: "Freelance frontend UI review contract"
    }
  ],
  4: [], // Dự án 4 trống chi phí để test Empty State
  5: [
    {
      expenseId: 90,
      projectId: 5,
      category: "Software License",
      amount: 99.00,
      expenseDate: "2026-03-01",
      description: "Apple Developer Program renewal"
    }
  ]
};

export let revenues = {
  1: [
    {
      revenueId: 10,
      projectId: 1,
      type: "Time & Material",
      amount: 80000.00,
      expectedDate: "2026-04-01",
      status: "Received"
    },
    {
      revenueId: 11,
      projectId: 1,
      type: "Time & Material",
      amount: 100000.00,
      expectedDate: "2026-08-01",
      status: "Pending"
    }
  ],
  2: [],
  3: [
    {
      revenueId: 80,
      projectId: 3,
      type: "Milestone",
      amount: 5000.00,
      expectedDate: "2026-07-01",
      status: "Pending"
    },
    {
      revenueId: 81,
      projectId: 3,
      type: "Fixed Price",
      amount: 15000.00,
      expectedDate: "2026-06-15",
      status: "Received"
    }
  ],
  4: [], // Dự án 4 trống doanh thu để test Empty State
  5: [
    {
      revenueId: 90,
      projectId: 5,
      type: "Fixed Price",
      amount: 8000.00,
      expectedDate: "2026-05-15",
      status: "Received"
    }
  ]
};

