// Mock API client to simulate network requests to AllocServer C# API.
// Mimics asynchronous latency (500ms) and handles data cloning.

import { workspaces, workspaceDetails, projects, tasks, expenses, revenues } from "../data/mockData";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchWorkspaces() {
  await delay();
  return JSON.parse(JSON.stringify(workspaces));
}

export async function fetchWorkspaceDetails(workspaceId) {
  await delay();
  const details = workspaceDetails[workspaceId];
  if (!details) {
    throw new Error("WorkspaceNotFound");
  }
  return JSON.parse(JSON.stringify(details));
}

export async function fetchProjects(workspaceId) {
  await delay();
  const workspaceProjects = projects[workspaceId] || [];
  return JSON.parse(JSON.stringify(workspaceProjects));
}

export async function createProject(workspaceId, projectData) {
  await delay(600); // Simulate slightly longer write time
  
  if (!projects[workspaceId]) {
    projects[workspaceId] = [];
  }

  // Check duplicate project name within the workspace
  const nameExists = projects[workspaceId].some(
    (p) => p.projectName.toLowerCase() === projectData.projectName.toLowerCase()
  );
  if (nameExists) {
    throw new Error("ProjectNameExists");
  }

  const newId = Math.max(...Object.values(projects).flatMap(p => p.map(x => x.projectId)), 0) + 1;
  const newProject = {
    projectId: newId,
    workspaceId: parseInt(workspaceId),
    projectName: projectData.projectName,
    expectedBudget: parseFloat(projectData.expectedBudget || 0),
    totalRevenue: parseFloat(projectData.totalRevenue || 0),
    startDate: projectData.startDate,
    endDate: projectData.endDate,
    status: projectData.status || "Planning",
    originalCurrencyCode: projectData.originalCurrencyCode || "USD",
    exchangeRateToUSD: parseFloat(projectData.exchangeRateToUSD || 1.0000),
    methodology: projectData.methodology || "Agile",
    createdAt: new Date().toISOString()
  };

  // Add to projects list
  projects[workspaceId].push(newProject);

  // Update summaries in workspace details
  const details = workspaceDetails[workspaceId];
  if (details) {
    details.projectSummary.totalProjects += 1;
    if (newProject.status === "Planning") details.projectSummary.planningProjects += 1;
    else if (newProject.status === "In Progress") details.projectSummary.inProgressProjects += 1;
    else if (newProject.status === "Completed") details.projectSummary.completedProjects += 1;
    else if (newProject.status === "On Hold") details.projectSummary.onHoldProjects += 1;
    else if (newProject.status === "Cancelled") details.projectSummary.cancelledProjects += 1;
  }

  return JSON.parse(JSON.stringify(newProject));
}

export async function fetchProjectDetails(projectId) {
  await delay();
  // Find project across all workspaces in mock data
  const project = Object.values(projects)
    .flat()
    .find((p) => p.projectId === parseInt(projectId));
  if (!project) {
    throw new Error("ProjectNotFound");
  }
  return JSON.parse(JSON.stringify(project));
}

export async function fetchProjectTasks(projectId) {
  await delay();
  const projectTasks = tasks[parseInt(projectId)] || [];
  return JSON.parse(JSON.stringify(projectTasks));
}

export async function fetchProjectExpenses(projectId, page = 1, pageSize = 5, search = "", category = "") {
  await delay();
  const projectExpenses = expenses[parseInt(projectId)] || [];
  
  // Filter
  let filtered = [...projectExpenses];
  if (search) {
    filtered = filtered.filter(e => e.description && e.description.toLowerCase().includes(search.toLowerCase()));
  }
  if (category) {
    filtered = filtered.filter(e => e.category === category);
  }
  
  // Sort descending by ID (newest first)
  filtered.sort((a, b) => b.expenseId - a.expenseId);

  // Paginate
  const totalItems = filtered.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const startIdx = (page - 1) * pageSize;
  const items = filtered.slice(startIdx, startIdx + pageSize);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    items: JSON.parse(JSON.stringify(items))
  };
}

export async function createProjectExpense(projectId, expenseData) {
  await delay(600); // Simulate slightly longer write time
  
  const pId = parseInt(projectId);
  if (!expenses[pId]) {
    expenses[pId] = [];
  }

  const allExpenses = Object.values(expenses).flat();
  const newId = Math.max(...allExpenses.map(e => e.expenseId), 0) + 1;

  const newExpense = {
    expenseId: newId,
    projectId: pId,
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

  // Sort descending by ID
  const sorted = [...projectRevenues].sort((a, b) => b.revenueId - a.revenueId);

  const totalItems = sorted.length;
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  const startIdx = (page - 1) * pageSize;
  const items = sorted.slice(startIdx, startIdx + pageSize);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    items: JSON.parse(JSON.stringify(items))
  };
}

export async function fetchProjectFinancialSummary(projectId) {
  await delay();
  const pId = parseInt(projectId);
  const projectExpenses = expenses[pId] || [];
  const projectRevenues = revenues[pId] || [];

  const totalSpent = projectExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const totalRevenue = projectRevenues
    .filter(r => r.status === "Received")
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100
  };
}

