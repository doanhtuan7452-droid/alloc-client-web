import React, { createContext, useContext, useState, useEffect } from "react";
import AuthService from "../services/AuthService";
import WorkspaceService from "../services/WorkspaceService";
import { getStoredRefreshToken } from "../utils/authTokens";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [currentWorkspaceRole, setCurrentWorkspaceRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentWorkspaceId, setCurrentWorkspaceId] = useState(null);

  // 1. Lấy thông tin tài khoản hệ thống khi load trang
  const fetchCurrentUser = async () => {
    const token = getStoredRefreshToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error("Lỗi khi lấy thông tin user:", err);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };
  


  const switchWorkspace = async (workspaceId) => {
    if (!workspaceId || !currentUser) {
        setPermissions([]);
        setCurrentWorkspaceRole(null);
        return;
    }

    try {
        const memberRes = await WorkspaceService.getWorkspaceMembers(workspaceId);
        const members = memberRes.items || memberRes;

        const me = members.find(
            m => String(m.resource?.resourceId) === String(currentUser.profile?.resourceId)
        );


        if (!me) {
            setPermissions([]);
            setCurrentWorkspaceRole(null);
            return;
        }

        setCurrentWorkspaceRole(me.role);

        const rolePermissions =
            await WorkspaceService.getWorkspaceRoleDetails(
                workspaceId,
                me.role.workspaceRoleId
            );

        let rawPerms = [];
        if (Array.isArray(rolePermissions)) {
          rawPerms = rolePermissions;
        } else if (rolePermissions?.permissions) {
          rawPerms = rolePermissions.permissions;
        } else if (rolePermissions?.data) {
          rawPerms = rolePermissions.data;
        }

        const cleanedPermissions = rawPerms
          .map(p => {
            if (typeof p === 'string') return p;
            return p?.permissionId || p?.PermissionId || p?.name;
          })
          .filter(Boolean);

        setPermissions(cleanedPermissions);

    } catch (err) {
        console.error(err);
        setPermissions([]);
        setCurrentWorkspaceRole(null);
    }
  };

  useEffect(() => {
      fetchCurrentUser();
  }, []);
  

  useEffect(() => {
      // Lấy workspaceId từ URL bằng cách thủ công hoặc thông qua window.location
      const urlParams = new URLSearchParams(window.location.search);
      const wId = urlParams.get("workspaceId");
      
      if (wId && currentUser) {
          switchWorkspace(parseInt(wId));
      }
  }, [currentUser]);

  // SỬA TẠI ĐÂY: Nếu role hiện tại trong Workspace là Owner thì tự động cho qua (Bypass)
  const hasPermission = (permissionId) => {
    const roleName = (currentWorkspaceRole?.roleName || "").toLowerCase();
    if (roleName === "owner") {
      return true;
    }
    return permissions.includes(permissionId);
  };

  return (
    <UserContext.Provider 
      value={{ 
        currentUser,
        setCurrentUser,
        permissions,
        currentWorkspaceRole,
        switchWorkspace,
        hasPermission,
        fetchCurrentUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);