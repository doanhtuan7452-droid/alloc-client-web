# AllocServer API Documentation

This document provides detailed API specifications for standard HTTP endpoints in the AllocServer backend, tailored for front-end implementation and client-side error handling.

---

## 1. Authentication & Session Management (AuthController)

**Endpoint Base:** `/api/v1/auth`

---

### Login (Local)
**Endpoint:** `POST /api/v1/auth/login`  
**Description:** Authenticates a user using email and password. Returns Access and Refresh tokens on success.  
**Auth Required:** No

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| email | string | Body | Yes | Valid Email | The login email address |
| password | string | Body | Yes | Min 6 chars | The login password |
| deviceInfo | string | Body | No | Max 200 chars | Client device metadata |

**Request Body Example (JSON):**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "deviceInfo": "Chrome / Windows 11"
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "success": true,
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "7c8e5db9...",
  "errorMessage": null
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | (Model state keys) | "Email không được để trống." / "Email không hợp lệ." | Invalid payload parameters | Show field-level validation errors |
| 401 Unauthorized | "INVALID_CREDENTIALS" | "Email hoặc mật khẩu không chính xác." | Bad email or password | Show authentication failure toast |

---

### Register Local Account
**Endpoint:** `POST /api/v1/auth/register/local`  
**Description:** Registers a new local account using email, password, and full name. Automatically creates a Resource profile and logs the user in.  
**Auth Required:** No

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| email | string | Body | Yes | Valid Email | Registration email address |
| password | string | Body | Yes | Min 6 chars | Account password |
| confirmPassword | string | Body | Yes | Must match `password` | Password confirmation |
| fullName | string | Body | Yes | Max 100 chars | Full name of the user |
| deviceInfo | string | Body | No | Max 200 chars | Client device metadata |

**Request Body Example (JSON):**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123",
  "fullName": "Nguyễn Văn A",
  "deviceInfo": "Firefox / macOS"
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "success": true,
  "errorMessage": null,
  "accountId": 42,
  "email": "newuser@example.com",
  "authType": "Local",
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "7c8e5db9...",
  "message": "Đăng ký tài khoản thành công",
  "isLinked": false
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "EmailAlreadyExists" | "Email đã tồn tại trong hệ thống." | The email is already taken | Highlight Email field with warning |
| 400 Bad Request | (Model state keys) | "Mật khẩu xác nhận không khớp." | Password fields do not match | Show validation error on confirm input |

---

### Register / Login with Google
**Endpoint:** `POST /api/v1/auth/register/google`  
**Description:** Integrates Google OAuth ID token. If the Google account does not exist, registers a new account and profile. If it already exists as local, links it and logs in.  
**Auth Required:** No

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| idToken | string | Body | Yes | JWT format | The Google-issued ID token |
| deviceInfo | string | Body | No | Max 200 chars | Client device metadata |

**Request Body Example (JSON):**
```json
{
  "idToken": "eyJhbGciOi...",
  "deviceInfo": "AllocMobile iOS"
}
```

#### Response (Success - 200 OK / 201 Created)
Content-Type: `application/json`
- Returns `201 Created` for newly registered users.
- Returns `200 OK` if linked to an existing account.
```json
{
  "success": true,
  "errorMessage": null,
  "accountId": 42,
  "email": "googleuser@example.com",
  "authType": "Google",
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "7c8e5db9...",
  "message": "Liên kết tài khoản Google thành công",
  "isLinked": true
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "InvalidGoogleToken" | "Mã xác thực Google không hợp lệ." | Google token validation failed | Show toast alert to retry Google login |

---

### Refresh Token
**Endpoint:** `POST /api/v1/auth/refresh-token`  
**Description:** Requests a new Access Token using a valid Refresh Token. Rotates the current Refresh Token for a new pair.  
**Auth Required:** No

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| refreshToken | string | Body | Yes | None | The valid Refresh Token |
| deviceInfo | string | Body | No | Max 200 chars | Client device metadata |

**Request Body Example (JSON):**
```json
{
  "refreshToken": "7c8e5db9...",
  "deviceInfo": "Chrome / Windows 11"
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "success": true,
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "a8f3b2c1...",
  "errorMessage": null
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 401 Unauthorized | "TokenExpired" | "Refresh Token đã hết hạn." | Refresh token is expired | Redirect user to Login Page |
| 401 Unauthorized | "TokenRevoked" | "Refresh Token đã bị thu hồi hoặc không hợp lệ." | Token has been rotated or invalidated | Redirect user to Login Page |

---

### Local Logout
**Endpoint:** `POST /api/v1/auth/revoke/local`  
**Description:** Invalidates the provided Refresh Token and denylists the current Access Token. Reads `JTI` and `AccountID` from the JWT claims to prevent CSRF.  
**Auth Required:** Yes (Bearer Token)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| refreshToken | string | Body | Yes | None | The current Refresh Token |

**Request Body Example (JSON):**
```json
{
  "refreshToken": "7c8e5db9..."
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "message": "Đăng xuất thiết bị hiện tại thành công."
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "TokenInvalid" | "Token không hợp lệ hoặc đã hết hạn." | Invalid payload parameters | Clear tokens locally and redirect to login |
| 401 Unauthorized | "TokenExpired" | "Token không hợp lệ." | JWT claim extraction failed | Redirect user to Login Page |

---

### Global Logout
**Endpoint:** `POST /api/v1/auth/revoke/global`  
**Description:** Revokes all active sessions (Refresh Tokens) for the account and denylists the current Access Token. Reads account identity from the Bearer token.  
**Auth Required:** Yes (Bearer Token)

#### Request Parameters
*(None - Identity is extracted from claims)*

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "message": "Đăng xuất khỏi tất cả các thiết bị thành công."
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 401 Unauthorized | "TokenExpired" | "Token không hợp lệ." | JWT claim extraction failed | Clear local storage and redirect to login |

---

### Request OTP
**Endpoint:** `POST /api/v1/auth/request-otp`  
**Description:** Generates and emails an OTP code to verify the user. Subject to Rate Limiting (max 1 request/60s per IP).  
**Auth Required:** No

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| email | string | Body | Yes | Valid Email | User email address |

**Request Body Example (JSON):**
```json
{
  "email": "user@example.com"
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "message": "Nếu email tồn tại trên hệ thống, mã OTP đã được gửi đến email của bạn."
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "CooldownActive" | "Yêu cầu gửi OTP quá nhanh. Vui lòng đợi 60 giây giữa các lần yêu cầu." | Under cooldown period | Show countdown alert to client |
| 500 Internal Server Error | "SystemError" | "Lỗi hệ thống khi gửi OTP: [Details]" | Server failing to dispatch email | Show general failure toast |

---

### Verify OTP
**Endpoint:** `POST /api/v1/auth/verify-otp`  
**Description:** Verifies the 6-digit OTP code sent to the email.  
**Auth Required:** No

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| email | string | Body | Yes | Valid Email | User email address |
| code | string | Body | Yes | Exactly 6 chars | 6-digit verification code |

**Request Body Example (JSON):**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "message": "Xác thực mã OTP thành công."
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "IncorrectCode" | "Mã OTP không chính xác hoặc đã hết hạn." | Expired or mismatched code | Show input error below OTP field |

---

## 2. Personal Profile & Account Info (AccountsController)

**Endpoint Base:** `/api/v1/accounts`

---

### Get Paged Accounts (Admin-only)
**Endpoint:** `GET /api/v1/accounts`  
**Description:** Retrieves a paginated list of accounts. Requires active account status and system account permissions.  
**Auth Required:** Yes (Bearer Token + `[RequireSystemAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| Page | integer | Query | No | Default 1, Min 1 | Current page index |
| PageSize | integer | Query | No | Default 20, Max 100 | Items per page |
| Keyword | string | Query | No | Max 100 chars | Matches against email/fullName |
| AccountStatus | string | Query | No | Max 20 chars | Filter by status: `Active`, `Deactivated` |
| AuthType | string | Query | No | Max 20 chars | Filter by auth: `Local`, `Google` |
| IsSystemAccount | boolean | Query | No | None | Filter system admins |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 1,
  "totalPages": 1,
  "items": [
    {
      "accountId": 1,
      "email": "admin@example.com",
      "authType": "Local",
      "isEmailVerified": true,
      "accountStatus": "Active",
      "isSystemAccount": true,
      "lastLoginAt": "2026-06-12T16:00:00Z",
      "createdAt": "2026-06-12T12:00:00Z",
      "updatedAt": "2026-06-12T16:00:00Z",
      "profile": {
        "resourceId": 1,
        "fullName": "System Administrator",
        "phoneNumber": "+84987654321",
        "avatarUrl": "https://example.com/avatar.jpg",
        "timezone": "SE Asia Standard Time",
        "createdAt": "2026-06-12T12:00:00Z"
      }
    }
  ]
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 401 Unauthorized | "TokenExpired" | "Token không hợp lệ." | Expired or bad token | Redirect user to Login Page |
| 403 Forbidden | "InsufficientPermissions" | "Quyền truy cập không hợp lệ." | Account is not system admin | Redirect to unauthorized screen |

---

### Get My Profile
**Endpoint:** `GET /api/v1/accounts/me`  
**Description:** Fetches the logged-in user's account details and profile.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
*(None - Extracted from current token context)*

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "accountId": 42,
  "email": "user@example.com",
  "authType": "Local",
  "isEmailVerified": true,
  "accountStatus": "Active",
  "isSystemAccount": false,
  "lastLoginAt": "2026-06-12T23:30:00Z",
  "createdAt": "2026-06-11T10:00:00Z",
  "updatedAt": "2026-06-12T23:30:00Z",
  "profile": {
    "resourceId": 5,
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0912345678",
    "avatarUrl": "https://example.com/avatar42.jpg",
    "timezone": "UTC",
    "createdAt": "2026-06-11T10:00:00Z"
  }
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 401 Unauthorized | "TokenInvalid" | "Token khong hop le." | Expired or bad token | Redirect user to Login Page |
| 404 Not Found | "AccountProfileNotFound" | "Không tìm thấy tài khoản hoặc profile Resource." | Account exists, but profile is missing | Show account recovery screen |

---

### Update My Profile
**Endpoint:** `PUT /api/v1/accounts`  
**Description:** Updates the logged-in user's profile details.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| fullName | string | Body | Yes | Max 100 chars, Non-empty | Full display name |
| phoneNumber | string | Body | No | Max 20 chars | Contact number |
| avatarUrl | string | Body | No | Max 500 chars | Profile picture link |
| timezone | string | Body | No | Max 50 chars | Local timezone name |

**Request Body Example (JSON):**
```json
{
  "fullName": "Nguyễn Văn B",
  "phoneNumber": "0987654321",
  "avatarUrl": "https://example.com/new-avatar.jpg",
  "timezone": "SE Asia Standard Time"
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "accountId": 42,
  "email": "user@example.com",
  "authType": "Local",
  "isEmailVerified": true,
  "accountStatus": "Active",
  "isSystemAccount": false,
  "lastLoginAt": "2026-06-12T23:30:00Z",
  "createdAt": "2026-06-11T10:00:00Z",
  "updatedAt": "2026-06-12T23:45:00Z",
  "profile": {
    "resourceId": 5,
    "fullName": "Nguyễn Văn B",
    "phoneNumber": "0987654321",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "timezone": "SE Asia Standard Time",
    "createdAt": "2026-06-11T10:00:00Z"
  }
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | (Model state keys) | "FullName is required." | Empty name sent | Display inline validation alerts |
| 401 Unauthorized | "TokenInvalid" | "Token khong hop le." | Expired or bad token | Redirect user to Login Page |
| 404 Not Found | "AccountProfileNotFound" | "Không tìm thấy tài khoản hoặc profile Resource." | Profile database record missing | Show critical failure toast |

---

## 3. Workspaces & Workspace Memberships (WorkspacesController)

**Endpoint Base:** `/api/v1/workspaces`

---

### Get My Workspaces
**Endpoint:** `GET /api/v1/workspaces`  
**Description:** Retrieves all workspaces the logged-in user participates in.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
*(None)*

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
[
  {
    "workspaceId": 12,
    "name": "Alloc Core Team",
    "type": "Company",
    "createdAt": "2026-06-01T08:00:00Z",
    "membership": {
      "workspaceMemberId": 99,
      "resourceId": 5,
      "employeeCode": "EMP0005",
      "status": "Active",
      "joinedAt": "2026-06-01T08:00:00Z",
      "role": {
        "workspaceRoleId": 1,
        "roleName": "Owner"
      }
    }
  }
]
```

---

### Create Workspace
**Endpoint:** `POST /api/v1/workspaces`  
**Description:** Creates a new workspace. The creating user is assigned as Owner. A free usage plan is seeded via Database Trigger automatically.  
**Auth Required:** Yes (Bearer Token)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| Name | string | Body | Yes | Min 2, Max 100 chars | Name of the workspace |
| Type | string | Body | Yes | Allowed values: `Personal`, `Company` | Workspace visibility context |

**Request Body Example (JSON):**
```json
{
  "name": "Alloc Development Team",
  "type": "Company"
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "message": "Tạo Workspace thành công",
  "workspaceId": 13
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "ProfileNotFound" | "Tài khoản chưa có profile (Resource)." | Account profile missing | Redirect user to Profile Setup page |
| 500 Internal Server Error | "SystemError" | "Lỗi khi tạo Workspace: [Details]" | DB Transaction rollback | Alert developer, show failure toast |

---

### Get Workspace Details
**Endpoint:** `GET /api/v1/workspaces/{workspaceId}`  
**Description:** Retrieves full structure of a workspace including member plans and project totals. Protection: Workspace member guard.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | The ID of the target workspace |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "workspaceId": 12,
  "name": "Alloc Core Team",
  "type": "Company",
  "createdAt": "2026-06-01T08:00:00Z",
  "currentUserMembership": {
    "workspaceMemberId": 99,
    "resourceId": 5,
    "employeeCode": "EMP0005",
    "status": "Active",
    "joinedAt": "2026-06-01T08:00:00Z",
    "role": {
      "workspaceRoleId": 1,
      "roleName": "Owner"
    }
  },
  "memberSummary": {
    "totalMembers": 5,
    "activeMembers": 4,
    "pendingInvites": 1,
    "deactivatedMembers": 0
  },
  "projectSummary": {
    "totalProjects": 3,
    "planningProjects": 1,
    "inProgressProjects": 2,
    "completedProjects": 0,
    "onHoldProjects": 0,
    "cancelledProjects": 0
  },
  "currentPlan": {
    "planCode": "FREE",
    "limits": [
      {
        "featureCode": "MaxMembers",
        "isIncluded": true,
        "limitValue": 10
      }
    ]
  }
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 403 Forbidden | "AccessDenied" | "Bạn không phải là thành viên của Workspace này." | Non-member user requested details | Show access denied message |
| 404 Not Found | "WorkspaceNotFound" | "Không tìm thấy Workspace." | Workspace ID does not exist | Show resource not found banner |

---

### Update Workspace
**Endpoint:** `PUT /api/v1/workspaces/{workspaceId}`  
**Description:** Modifies workspace details. Protection: Workspace owner authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | The ID of the target workspace |
| Name | string | Body | Yes | Min 2, Max 100 chars | New workspace name |

**Request Body Example (JSON):**
```json
{
  "name": "Alloc Core Team Updated"
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "message": "Cap nhat Workspace thanh cong."
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 403 Forbidden | "OwnerWorkspaceUpdateOnly" | "Chỉ Owner mới có quyền cập nhật thông tin Workspace." | Non-Owner workspace member update attempt | Show action forbidden overlay |

---

### Delete Workspace
**Endpoint:** `DELETE /api/v1/workspaces/{workspaceId}`  
**Description:** Soft-deletes a workspace. Protection: Workspace owner authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "message": "Xoa Workspace thanh cong."
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 403 Forbidden | "OwnerWorkspaceDeleteOnly" | "Chỉ Owner mới có quyền xóa Workspace." | Non-Owner deletion attempt | Show restriction alert |

---

### Invite Workspace Member
**Endpoint:** `POST /api/v1/workspaces/{workspaceId}/members`  
**Description:** Invites a user to join the workspace. Validates subscription capacity limits before adding. Protection: Workspace owner authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| email | string | Body | Yes | Max 100 chars, Valid Email | Email of invited user |
| workspaceRoleID | integer | Body | Yes | Positive integer | Role inside workspace |
| baseSalaryMonth | decimal | Body | No | Min 0.0 | Initial salary rate |
| otRatePerHour | decimal | Body | No | Min 0.0 | Overtime rate |

**Request Body Example (JSON):**
```json
{
  "email": "employee@example.com",
  "workspaceRoleID": 2,
  "baseSalaryMonth": 2500.0,
  "otRatePerHour": 25.0
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "workspaceMemberId": 105,
  "resource": {
    "resourceId": 12,
    "fullName": "Employee Name",
    "phoneNumber": "0977112233",
    "avatarUrl": "https://example.com/emp-avatar.jpg",
    "timezone": "UTC"
  },
  "employeeCode": "EMP0012",
  "status": "Active",
  "joinedAt": "2026-06-12T16:47:00Z",
  "role": {
    "workspaceRoleId": 2,
    "roleName": "Developer"
  }
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "EmailRequired" | "Email không được để trống." | Email param missing | Show field validation alert |
| 402 Payment Required | "MemberQuotaExceeded" | "Workspace đã đạt giới hạn số lượng thành viên của gói cước." | Subscription tier limit reached | Prompt owner to upgrade plan |
| 403 Forbidden | "OwnerMemberManagementOnly" | "Chỉ Owner mới có quyền quản trị nhân sự Workspace." | Unauthorized invite attempt | Show action denied popup |
| 409 Conflict | "MemberAlreadyExists" | "Nhân sự đã tồn tại trong Workspace." | User already added to workspace | Alert client about existing membership |

---

### Update Workspace Member Status
**Endpoint:** `PUT /api/v1/workspaces/{workspaceId}/members/{memberId}/status`  
**Description:** Activates or deactivates a member in the workspace. Protection: Workspace owner authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| memberId | integer | Path | Yes | Positive integer | Target Member ID |
| status | string | Body | Yes | String `Active` or `Deactivated` | New status value |

**Request Body Example (JSON):**
```json
{
  "status": "Deactivated"
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "message": "Cap nhat trang thai nhan su thanh cong."
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "OwnerCannotDeactivateSelf" | "Owner không thể tự vô hiệu hóa chính mình." | Deactivating current Owner | Show action blocked toast |
| 400 Bad Request | "InvalidMemberStatus" | "Trạng thái (Status) chỉ nhận Active hoặc Deactivated." | Mismatched string parameter | Fix field payload constraints |
| 402 Payment Required | "MemberQuotaExceeded" | "Workspace đã đạt giới hạn số lượng thành viên của gói cước." | Activating exceeds plan limit | Prompt owner to upgrade plan |
| 403 Forbidden | "OwnerMemberManagementOnly" | "Chỉ Owner mới có quyền quản trị nhân sự Workspace." | Non-Owner status change attempt | Show action blocked toast |

---

### Get Workspace Members (Paged)
**Endpoint:** `GET /api/v1/workspaces/{workspaceId}/members`  
**Description:** Retrieves workspace members with pagination. Protection: Workspace member guard.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| Page | integer | Query | No | Default 1, Min 1 | Pagination page index |
| PageSize | integer | Query | No | Default 20, Max 100 | Items per page size |
| Search | string | Query | No | None | Matches email or user name |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 2,
  "totalPages": 1,
  "items": [
    {
      "workspaceMemberId": 99,
      "resource": {
        "resourceId": 5,
        "fullName": "Nguyễn Văn A",
        "phoneNumber": "0912345678",
        "avatarUrl": "https://example.com/avatar42.jpg",
        "timezone": "UTC"
      },
      "employeeCode": "EMP0005",
      "status": "Active",
      "joinedAt": "2026-06-01T08:00:00Z",
      "role": {
        "workspaceRoleId": 1,
        "roleName": "Owner"
      }
    }
  ]
}
```

---

### Get Workspace Projects
**Endpoint:** `GET /api/v1/workspaces/{workspaceId}/projects`  
**Description:** Gets projects within a workspace. Optional status filter. Protection: Workspace member guard.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| Status | string | Query | No | String values: `Planning`, `In Progress`, `Completed`, `On Hold`, `Cancelled` | Filter project statuses |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
[
  {
    "projectId": 3,
    "projectName": "Alloc Web Application",
    "expectedBudget": 15000.00,
    "totalRevenue": 20000.00,
    "startDate": "2026-06-01",
    "endDate": "2026-12-31",
    "status": "In Progress",
    "originalCurrencyCode": "USD",
    "exchangeRateToUSD": 1.0000,
    "methodology": "Agile",
    "createdAt": "2026-06-01T08:00:00Z"
  }
]
```

---

### Upload Workspace Asset
**Endpoint:** `POST /api/v1/workspaces/{workspaceId}/assets`  
**Description:** Uploads a workspace document to use inside chat sessions. Content-Type is form-data. Protection: Workspace member guard.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| file | file | Body (Form) | Yes | File size limits apply | File input payload |

**Content-Type:** `multipart/form-data`

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "assetId": 201,
  "fileName": "specification.pdf",
  "fileUrl": "https://allocstorage.blob.core.windows.net/assets/spec.pdf",
  "fileSize": 1048576,
  "uploadedBy": 99,
  "uploadedAt": "2026-06-12T23:45:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "InvalidFile" | "Một hoặc nhiều tài liệu không hợp lệ." | Bad file format/size | Highlight file upload field |

---

### Create Project
**Endpoint:** `POST /api/v1/workspaces/{workspaceId}/projects`  
**Description:** Spawns a new project in the workspace. Protection: Workspace owner authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| projectName | string | Body | Yes | Max 255 chars | Unique project name |
| expectedBudget | decimal | Body | No | Default 0.0, Min 0.0 | Budget for tracking |
| startDate | DateOnly | Body | Yes | DateOnly format | Projected start |
| endDate | DateOnly | Body | Yes | Must be >= `startDate` | Projected completion |
| originalCurrencyCode | string | Body | No | Default `USD`, Max 5 chars | Currency ISO name |
| exchangeRateToUSD | decimal | Body | No | Default 1.0, Max 999999.9999 | Exchange conversion rate |
| methodology | string | Body | No | Default `Agile`. Options: `Agile`, `Waterfall`, `Scrum`, `Kanban`, `Hybrid` | Design lifecycle methodology |

**Request Body Example (JSON):**
```json
{
  "projectName": "Alloc Phase 2 Backend",
  "expectedBudget": 45000.0,
  "startDate": "2026-07-01",
  "endDate": "2026-11-30",
  "originalCurrencyCode": "VND",
  "exchangeRateToUSD": 0.00004,
  "methodology": "Scrum"
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "projectId": 4,
  "workspaceId": 12,
  "projectName": "Alloc Phase 2 Backend",
  "expectedBudget": 45000.0,
  "totalRevenue": 0.0,
  "startDate": "2026-07-01",
  "endDate": "2026-11-30",
  "status": "Planning",
  "baselineData": null,
  "originalCurrencyCode": "VND",
  "exchangeRateToUSD": 0.00004,
  "methodology": "Scrum",
  "createdAt": "2026-06-12T23:46:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "StartEndDateRequired" | "Ngày bắt đầu và ngày kết thúc là bắt buộc." | Date parameters omitted | Alert users to input start/end dates |
| 400 Bad Request | "EndDateBeforeStartDate" | "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu." | Invalid chronologic range | Highlight start/end calendar inputs |
| 400 Bad Request | "InvalidMethodology" | "Methodology chỉ nhận Agile, Waterfall, Scrum, Kanban hoặc Hybrid." | Invalid methodology | Highlight methodology dropdown |
| 403 Forbidden | "OwnerProjectCreationOnly" | "Chỉ Owner mới có quyền tạo dự án." | Non-Owner project creation attempt | Show forbidden notification |
| 409 Conflict | "ProjectNameExists" | "Tên dự án đã tồn tại trong Workspace." | Project name duplication | Alert to change project name |

---

### Get Workspace Roles
**Endpoint:** `GET /api/v1/workspaces/{workspaceId}/roles`  
**Description:** Retrieves workspace role templates. Protection: Workspace member guard.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
[
  {
    "workspaceRoleId": 1,
    "roleName": "Owner"
  },
  {
    "workspaceRoleId": 2,
    "roleName": "Developer"
  }
]
```

---

## 4. Workspace Member Profiles (WorkspaceMemberProfilesController)

**Endpoint Base:** `/api/v1/workspaces/{workspaceId}/members/{memberId}/profile`

---

### Get Member Profile
**Endpoint:** `GET /api/v1/workspaces/{workspaceId}/members/{memberId}/profile`  
**Description:** Gets detailed professional profile, technical metrics, and soft skills stats of a member. Permission required: View profile.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| memberId | integer | Path | Yes | Positive integer | Target Member ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "profileId": 10,
  "workspaceMemberId": 99,
  "priorExperienceYears": 3,
  "totalExperienceYears": 3,
  "educationLevel": "Bachelor",
  "technicalSkillScore": 4.5,
  "communicationScore": 4.2,
  "leadershipScore": 3.8,
  "problemSolvingScore": 4.6,
  "avgSoftSkillScore": 4.2,
  "attendanceRate": 0.98,
  "conflictRate": 0.05,
  "performanceRating": "Good",
  "lastEvaluatedAt": "2026-06-12T16:00:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 404 Not Found | "MemberProfileNotFound" | "Không tìm thấy hồ sơ của nhân sự." | Profile record missing | Offer option to create default profile |

---

### Create Member Profile
**Endpoint:** `POST /api/v1/workspaces/{workspaceId}/members/{memberId}/profile`  
**Description:** Spawns a member profile if one does not exist. Permission required: Manage profile.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| memberId | integer | Path | Yes | Positive integer | Target Member ID |
| priorExperienceYears | integer | Body | Yes | Between 0 and 100 | Prior job experience |
| educationLevel | string | Body | No | String options: `High School`, `Diploma`, `Bachelor`, `Master`, `PhD` | Highest academic degree |

**Request Body Example (JSON):**
```json
{
  "priorExperienceYears": 5,
  "educationLevel": "Master"
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "profileId": 11,
  "workspaceMemberId": 102,
  "priorExperienceYears": 5,
  "totalExperienceYears": 5,
  "educationLevel": "Master",
  "technicalSkillScore": 0.0,
  "communicationScore": 0.0,
  "leadershipScore": 0.0,
  "problemSolvingScore": 0.0,
  "avgSoftSkillScore": 0.0,
  "attendanceRate": 1.0,
  "conflictRate": 0.0,
  "performanceRating": "New",
  "lastEvaluatedAt": "2026-06-12T23:45:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "InvalidExperience" | "Kinh nghiem phai tu 0 den 100 nam." | Experience value out of bounds | Show slider error alert |
| 400 Bad Request | "InvalidEducation" | "Trinh do hoc van phai la 'High School', 'Diploma', 'Bachelor', 'Master', hoac 'PhD'." | Invalid dropdown item | Correct selection dropdown mapping |
| 409 Conflict | "ProfileAlreadyExists" | "Hồ sơ đã tồn tại cho nhân sự này. Vui lòng cập nhật hoặc khôi phục hồ sơ thay vì tạo mới." | Member already has profile | Redirect client to edit screen |

---

### Update Member Profile
**Endpoint:** `PUT /api/v1/workspaces/{workspaceId}/members/{memberId}/profile`  
**Description:** Modifies background statistics of a member. Permission required: Manage profile.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| memberId | integer | Path | Yes | Positive integer | Target Member ID |
| priorExperienceYears | integer | Body | Yes | Between 0 and 100 | Background experience value |
| educationLevel | string | Body | No | String options: `High School`, `Diploma`, `Bachelor`, `Master`, `PhD` | Academic degree |

**Request Body Example (JSON):**
```json
{
  "priorExperienceYears": 6,
  "educationLevel": "PhD"
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "profileId": 11,
  "workspaceMemberId": 102,
  "priorExperienceYears": 6,
  "totalExperienceYears": 6,
  "educationLevel": "PhD",
  "technicalSkillScore": 4.0,
  "communicationScore": 3.8,
  "leadershipScore": 4.1,
  "problemSolvingScore": 4.2,
  "avgSoftSkillScore": 4.0,
  "attendanceRate": 0.95,
  "conflictRate": 0.02,
  "performanceRating": "Good",
  "lastEvaluatedAt": "2026-06-12T23:45:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 404 Not Found | "MemberProfileNotFound" | "Không tìm thấy hồ sơ của nhân sự." | Profile record missing | Show critical failure toast |

---

### Delete Member Profile
**Endpoint:** `DELETE /api/v1/workspaces/{workspaceId}/members/{memberId}/profile`  
**Description:** Deletes member profile details. Permission required: Manage profile.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| memberId | integer | Path | Yes | Positive integer | Target Member ID |

#### Response (Success - 204 NoContent)
*(No body returned)*

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 404 Not Found | "MemberProfileNotFound" | "Khong tim thay ho so cua nhan su trong Workspace de xoa." | Profile not found | Show deletion failure toast |

---

## 5. Projects & Financial Management (ProjectsController)

**Endpoint Base:** `/api/v1/projects`

---

### Get Project Details
**Endpoint:** `GET /api/v1/projects/{projectId}`  
**Description:** Retrieves specific project statistics, schedule bounds, and baseline settings. Protection: Project member authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[ProjectAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Path | Yes | Positive integer | The ID of the target project |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "projectId": 3,
  "workspaceId": 12,
  "projectName": "Alloc Web Application",
  "expectedBudget": 15000.00,
  "totalRevenue": 20000.00,
  "startDate": "2026-06-01",
  "endDate": "2026-12-31",
  "status": "In Progress",
  "baselineData": null,
  "originalCurrencyCode": "USD",
  "exchangeRateToUSD": 1.0000,
  "methodology": "Agile",
  "createdAt": "2026-06-01T08:00:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 404 Not Found | "ProjectNotFound" | "Khong tim thay Project." | Project ID does not exist | Alert user and return to previous list |

---

### Update Project
**Endpoint:** `PUT /api/v1/projects/{projectId}`  
**Description:** Modifies project properties and timeline dates. Protection: Project update permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[ProjectAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Path | Yes | Positive integer | The ID of the target project |
| projectName | string | Body | Yes | Max 255 chars | Display name of project |
| expectedBudget | decimal | Body | Yes | Min 0.0 | Estimated financial bounds |
| totalRevenue | decimal | Body | Yes | Min 0.0 | Accumulated client fee |
| startDate | DateOnly | Body | Yes | None | Launch date bounds |
| endDate | DateOnly | Body | Yes | Must be >= `startDate` | Target delivery date |
| status | string | Body | Yes | String: `Planning`, `In Progress`, `Completed`, `On Hold`, `Cancelled` | Lifecycle status |
| baselineData | string | Body | No | None | Milestone log snapshot |
| originalCurrencyCode | string | Body | No | Max 5 chars | Currency ISO code |
| exchangeRateToUSD | decimal | Body | No | Min 0.0 | Currency exchange rate |
| methodology | string | Body | No | String: `Agile`, `Waterfall`, `Scrum`, `Kanban`, `Hybrid` | Project design model |

**Request Body Example (JSON):**
```json
{
  "projectName": "Alloc Web Application v2",
  "expectedBudget": 18000.00,
  "totalRevenue": 22000.00,
  "startDate": "2026-06-01",
  "endDate": "2027-01-31",
  "status": "In Progress",
  "baselineData": "Phase 1 Baseline",
  "originalCurrencyCode": "USD",
  "exchangeRateToUSD": 1.0000,
  "methodology": "Scrum"
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "projectId": 3,
  "workspaceId": 12,
  "projectName": "Alloc Web Application v2",
  "expectedBudget": 18000.00,
  "totalRevenue": 22000.00,
  "startDate": "2026-06-01",
  "endDate": "2027-01-31",
  "status": "In Progress",
  "baselineData": "Phase 1 Baseline",
  "originalCurrencyCode": "USD",
  "exchangeRateToUSD": 1.0000,
  "methodology": "Scrum",
  "createdAt": "2026-06-01T08:00:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "EndDateBeforeStartDate" | "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu." | Timeline ranges invalid | Prompt input validation correction |
| 400 Bad Request | "InvalidProjectStatus" | "Trạng thái (Status) chỉ nhận Planning, In Progress, Completed, On Hold hoặc Cancelled." | Bad status parameter | Display selection dropdown choices |
| 400 Bad Request | "InvalidOriginalCurrencyCode" | "Mã tiền tệ gốc (OriginalCurrencyCode) không được để trống và không được vượt quá 5 ký tự." | Currency parameters invalid | Highlight currency input |
| 409 Conflict | "ProjectNameExists" | "Tên dự án đã tồn tại trong Workspace." | Name duplicated within workspace | Show rename conflict warning |

---

### Delete Project
**Endpoint:** `DELETE /api/v1/projects/{projectId}`  
**Description:** Soft-deletes a project. Protection: Project delete permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[ProjectAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Path | Yes | Positive integer | The ID of the target project |

#### Response (Success - 204 No Content)
*(No body returned)*

---

### Get Project Tasks (Paged)
**Endpoint:** `GET /api/v1/projects/{projectId}/tasks`  
**Description:** Returns tasks for a project with filters. Protection: Project member authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[ProjectAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Path | Yes | Positive integer | The ID of the target project |
| page | integer | Query | No | Default 1, Min 1 | Pagination page index |
| pageSize | integer | Query | No | Default 20, Max 100 | Page items limit |
| search | string | Query | No | None | Search matching name |
| status | string | Query | No | String: `To-do`, `In Progress`, `Review`, `Done` | Filter task status |
| durationType | string | Query | No | String: `Hour`, `Day`, `StoryPoint` | Filter workload type |
| complexity | string | Query | No | String: `Low`, `Medium`, `High`, `Critical` | Filter complexity |
| requiredSkillLevel | string | Query | No | String: `Low`, `Medium`, `High`, `Expert` | Filter skill level |
| priority | string | Query | No | String: `Low`, `Medium`, `High`, `Critical` | Filter priority |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 1,
  "totalPages": 1,
  "items": [
    {
      "taskId": 101,
      "projectId": 3,
      "taskName": "Implement API documentation",
      "status": "In Progress",
      "durationType": "Hour",
      "estimatedValue": 8.00,
      "startDate": "2026-06-12",
      "endDate": "2026-06-13",
      "createdAt": "2026-06-12T00:00:00Z",
      "complexity": "Medium",
      "requiredSkillLevel": "Medium",
      "priority": "High",
      "expectedTeamSize": 1
    }
  ]
}
```

---

### Create Project Task
**Endpoint:** `POST /api/v1/projects/{projectId}/tasks`  
**Description:** Creates a task inside a project. Validates dates are within the project lifecycle. Protection: Task create permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[ProjectAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Path | Yes | Positive integer | Target project ID |
| taskName | string | Body | Yes | Max 255 chars, Non-empty | Unique task name |
| durationType | string | Body | Yes | Allowed values: `Hour`, `Day`, `StoryPoint` | Workspace duration type |
| estimatedValue | decimal | Body | No | Between 0.01 and 99999999.99 | Effort estimate |
| startDate | DateOnly | Body | No | None | Planned start date |
| endDate | DateOnly | Body | No | Must be >= `startDate` | Planned end date |
| status | string | Body | No | Options: `To-do`, `In Progress`, `Review`, `Done` | Initial lifecycle state |
| complexity | string | Body | No | Options: `Low`, `Medium`, `High`, `Critical` | Target complexity |
| requiredSkillLevel | string | Body | No | Options: `Low`, `Medium`, `High`, `Expert` | Minimum skill level |
| priority | string | Body | No | Options: `Low`, `Medium`, `High`, `Critical` | Task priority level |
| expectedTeamSize | integer | Body | No | Min 1 | Expected crew count |

**Request Body Example (JSON):**
```json
{
  "taskName": "Design Database Schema",
  "durationType": "StoryPoint",
  "estimatedValue": 5.0,
  "startDate": "2026-06-15",
  "endDate": "2026-06-18",
  "status": "To-do",
  "complexity": "High",
  "requiredSkillLevel": "High",
  "priority": "High",
  "expectedTeamSize": 1
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "taskId": 102,
  "projectId": 3,
  "taskName": "Design Database Schema",
  "status": "To-do",
  "durationType": "StoryPoint",
  "estimatedValue": 5.0,
  "startDate": "2026-06-15",
  "endDate": "2026-06-18",
  "createdAt": "2026-06-12T23:55:00Z",
  "complexity": "High",
  "requiredSkillLevel": "High",
  "priority": "High",
  "expectedTeamSize": 1
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "TaskNameRequired" | "Tên công việc không được để trống." | Name parameter missing | Show field validation alert |
| 400 Bad Request | "TaskEndDateBeforeStartDate" | "Ngày kết thúc công việc phải lớn hơn hoặc bằng ngày bắt đầu công việc." | Invalid chronological order | Highlight calendar fields |
| 400 Bad Request | "TaskStartDateBeforeProjectStart" | "Ngày bắt đầu công việc không được nhỏ hơn ngày bắt đầu dự án." | Task starts before project launch | Adjust calendar range to project bounds |
| 400 Bad Request | "TaskEndDateAfterProjectEnd" | "Ngày kết thúc công việc không được lớn hơn ngày kết thúc dự án." | Task ends after project deadline | Adjust calendar range to project bounds |
| 400 Bad Request | "InvalidComplexity" | "Độ phức tạp (Complexity) phải là Low, Medium, High hoặc Critical." | Invalid complexity parameter | Correct dropdown values |
| 400 Bad Request | "InvalidSkillLevel" | "Yêu cầu trình độ (RequiredSkillLevel) phải là Low, Medium, High hoặc Expert." | Invalid skill level parameter | Correct dropdown values |
| 400 Bad Request | "InvalidPriority" | "Mức độ ưu tiên (Priority) phải là Low, Medium, High hoặc Critical." | Invalid priority parameter | Correct dropdown values |

---

### Get Project Assets (Paged)
**Endpoint:** `GET /api/v1/projects/{projectId}/assets`  
**Description:** Retrieves project assets with pagination. Protection: Asset view permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[ProjectAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Path | Yes | Positive integer | Target project ID |
| page | integer | Query | No | Default 1, Min 1 | Current page index |
| pageSize | integer | Query | No | Default 20, Max 100 | Items per page limit |
| search | string | Query | No | None | Match files by name |
| assetType | string | Query | No | None | Filter asset types |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 1,
  "totalPages": 1,
  "items": [
    {
      "assetId": 201,
      "projectId": 3,
      "workspaceId": 12,
      "assetName": "specification.pdf",
      "assetType": "application/pdf",
      "fileSizeKB": 1024,
      "uploadedBy": 99,
      "uploadedByName": "Nguyễn Văn A",
      "createdAt": "2026-06-12T23:45:00Z"
    }
  ]
}
```

---

### Upload Project Asset
**Endpoint:** `POST /api/v1/projects/{projectId}/assets`  
**Description:** Uploads a file asset into the project container. Content-Type is form-data. Protection: Asset create permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[ProjectAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Path | Yes | Positive integer | Target project ID |
| file | file | Body (Form) | Yes | File size limits apply | Upload file stream payload |

**Content-Type:** `multipart/form-data`

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "assetId": 202,
  "projectId": 3,
  "workspaceId": 12,
  "assetName": "architecture-diagram.png",
  "assetType": "image/png",
  "fileSizeKB": 512,
  "uploadedBy": 99,
  "uploadedByName": "Nguyễn Văn A",
  "createdAt": "2026-06-12T23:58:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "InvalidFile" | "Một hoặc nhiều tài liệu không hợp lệ." | Bad file format/size | Prompt to choose a valid file |

---

### Get Project Expenses (Paged)
**Endpoint:** `GET /api/v1/projects/{projectId}/expenses`  
**Description:** Retrieves financial expense records for a project. Protection: Expense view permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[ProjectAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Path | Yes | Positive integer | Target project ID |
| page | integer | Query | No | Default 1, Min 1 | Current page index |
| pageSize | integer | Query | No | Default 20, Max 100 | Items per page limit |
| category | string | Query | No | None | Filter by category |
| fromDate | DateOnly | Query | No | None | Filter date bounds |
| toDate | DateOnly | Query | No | None | Filter date bounds |
| minAmount | decimal | Query | No | Min 0.0 | Filter minimum expense |
| maxAmount | decimal | Query | No | Min 0.0 | Filter maximum expense |
| search | string | Query | No | None | Matches text in description |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 1,
  "totalPages": 1,
  "items": [
    {
      "expenseId": 50,
      "projectId": 3,
      "projectName": "Alloc Web Application",
      "category": "Software License",
      "amount": 250.00,
      "expenseDate": "2026-06-10",
      "description": "Figma design system subscription"
    }
  ]
}
```

---

### Create Project Expense
**Endpoint:** `POST /api/v1/projects/{projectId}/expenses`  
**Description:** Records a project cost. Dates must fit project duration. Protection: Expense create permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[ProjectAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Path | Yes | Positive integer | Target project ID |
| category | string | Body | Yes | Max 100 chars, Non-empty | Expense cost category |
| amount | decimal | Body | Yes | Between 0.01 and 9999999999999999.99 | Transaction cost |
| expenseDate | DateOnly | Body | Yes | DateOnly format | Expense date |
| description | string | Body | No | None | Brief context details |

**Request Body Example (JSON):**
```json
{
  "category": "Infrastructure hosting",
  "amount": 1200.0,
  "expenseDate": "2026-06-12",
  "description": "Azure cloud services - June invoice"
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "expenseId": 51,
  "projectId": 3,
  "projectName": "Alloc Web Application",
  "category": "Infrastructure hosting",
  "amount": 1200.00,
  "expenseDate": "2026-06-12",
  "description": "Azure cloud services - June invoice"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "CategoryRequired" | "Danh mục (Category) là bắt buộc." | Category parameter missing | Highlight cost category dropdown |
| 400 Bad Request | "ExpenseDateRequired" | "Ngày chi tiêu (ExpenseDate) là bắt buộc." | Date parameter omitted | Highlight calendar input |
| 400 Bad Request | "ExpenseDateBeforeProjectStart" | "Ngày chi tiêu không được trước ngày bắt đầu dự án." | Date falls outside project start | Move cost date back within timeline |
| 400 Bad Request | "ExpenseDateAfterProjectEnd" | "Ngày chi tiêu không được sau ngày kết thúc dự án." | Date falls outside project end | Move cost date back within timeline |
| 400 Bad Request | "InvalidAmount" | "Khoản tiền (Amount) phải từ 0.01 đến 9999999999999999.99." | Zero or negative amount | Change cost amount to positive value |

---

### Get Project Revenues (Paged)
**Endpoint:** `GET /api/v1/projects/{projectId}/revenues`  
**Description:** Retrieves financial client revenues. Protection: Revenue view permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[ProjectAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Path | Yes | Positive integer | Target project ID |
| page | integer | Query | No | Default 1, Min 1 | Current page index |
| pageSize | integer | Query | No | Default 20, Max 100 | Page items limit |
| type | string | Query | No | String: `Fixed Price`, `Time & Material`, `Milestone` | Filter revenue models |
| status | string | Query | No | String: `Pending`, `Received` | Filter payment states |
| expectedFromDate | DateOnly | Query | No | None | Filter date range |
| expectedToDate | DateOnly | Query | No | None | Filter date range |
| minAmount | decimal | Query | No | Min 0.0 | Filter minimum amount |
| maxAmount | decimal | Query | No | Min 0.0 | Filter maximum amount |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 1,
  "totalPages": 1,
  "items": [
    {
      "revenueId": 80,
      "projectId": 3,
      "projectName": "Alloc Web Application",
      "type": "Milestone",
      "amount": 5000.00,
      "expectedDate": "2026-07-01",
      "status": "Pending"
    }
  ]
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "InvalidRevenueType" | "Loại doanh thu (Type) chỉ nhận Fixed Price, Time & Material hoặc Milestone." | Invalid query parameter type | Select valid revenue type dropdown |
| 400 Bad Request | "InvalidRevenueStatus" | "Trạng thái (Status) chỉ nhận Pending hoặc Received." | Invalid status type | Select valid status dropdown |

---

### Get Project Risks (Paged)
**Endpoint:** `GET /api/v1/projects/{projectId}/risks`  
**Description:** Fetches all risks registered under a project. Protection: Risk view permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[ProjectAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Path | Yes | Positive integer | Target project ID |
| page | integer | Query | No | Default 1, Min 1 | Pagination page index |
| pageSize | integer | Query | No | Default 20, Max 100 | Page size bounds |
| search | string | Query | No | None | Match keywords in risk name |
| category | string | Query | No | None | Filter categories |
| status | string | Query | No | String: `Open`, `Assessed`, `Mitigated`, `Closed` | Filter status |
| taskId | integer | Query | No | Positive integer | Filter related task |
| ownerId | integer | Query | No | Positive integer | Filter manager |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 1,
  "totalPages": 1,
  "items": [
    {
      "riskId": 10,
      "projectId": 3,
      "projectName": "Alloc Web Application",
      "taskId": 101,
      "riskName": "API Spec Delays",
      "description": "Integration specifications are delayed from third-party systems",
      "category": "Technical",
      "probability": 3,
      "impact": 4,
      "riskScore": 12,
      "estimatedFinancialImpact": 5000.00,
      "actualFinancialImpact": 0.00,
      "status": "Open",
      "ownerId": 99,
      "createdAt": "2026-06-12T16:00:00Z",
      "updatedAt": "2026-06-12T16:00:00Z"
    }
  ]
}
```

---

### Create Project Risk
**Endpoint:** `POST /api/v1/projects/{projectId}/risks`  
**Description:** Declares a new risk for the project. Score is automatically calculated (Probability * Impact). Protection: Risk create permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[ProjectAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Path | Yes | Positive integer | Target project ID |
| taskId | integer | Body | No | Positive integer | Related task ID |
| riskName | string | Body | Yes | Max 255 chars, Non-empty | Name of the risk |
| description | string | Body | No | None | Detailed risk context |
| category | string | Body | No | None | Risk type category |
| probability | integer | Body | Yes | Between 1 and 5 | Occurrence likelihood |
| impact | integer | Body | Yes | Between 1 and 5 | Business damage severity |
| estimatedFinancialImpact | decimal | Body | No | >= 0.0 | Estimated cost loss |
| ownerId | integer | Body | No | Positive integer | Assigned risk manager ID |
| status | string | Body | No | None | Initial risk status |

**Request Body Example (JSON):**
```json
{
  "taskId": 101,
  "riskName": "Integrations Downtime",
  "description": "Sandbox APIs have frequent downtime",
  "category": "Technical",
  "probability": 4,
  "impact": 3,
  "estimatedFinancialImpact": 8000.00,
  "ownerId": 99,
  "status": "Open"
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "riskId": 11,
  "projectId": 3,
  "projectName": "Alloc Web Application",
  "taskId": 101,
  "riskName": "Integrations Downtime",
  "description": "Sandbox APIs have frequent downtime",
  "category": "Technical",
  "probability": 4,
  "impact": 3,
  "riskScore": 12,
  "estimatedFinancialImpact": 8000.00,
  "actualFinancialImpact": 0.00,
  "status": "Open",
  "ownerId": 99,
  "createdAt": "2026-06-12T23:59:00Z",
  "updatedAt": "2026-06-12T23:59:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "RiskNameRequired" | "Tên rủi ro là bắt buộc." | RiskName is empty | Alert user to fill risk name |
| 400 Bad Request | "RiskNameMaxLength" | "Tên rủi ro tối đa 255 ký tự." | RiskName too long | Shorten name under 255 chars |
| 400 Bad Request | "InvalidRiskProbability" | "Xác suất rủi ro (Probability) phải từ 1 đến 5." | Score range out of bounds | Show Probability dropdown selector |
| 400 Bad Request | "InvalidRiskImpact" | "Mức độ tác động (Impact) phải từ 1 đến 5." | Score range out of bounds | Show Impact dropdown selector |
| 400 Bad Request | "InvalidEstimatedFinancialImpact" | "Tác động tài chính ước tính phải từ 0 đến 9999999999999999.99." | Mismatched financial amount | Change value to valid decimal |

---

### Get Project AI Insights (Paged)
**Endpoint:** `GET /api/v1/projects/{projectId}/ai-insights`  
**Description:** Fetches AI-generated warnings and suggestions for project risks, budget overruns, or team burnout. Protection: AI view permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[ProjectAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Path | Yes | Positive integer | Target project ID |
| page | integer | Query | No | Default 1, Min 1 | Current page index |
| pageSize | integer | Query | No | Default 20, Max 100 | Page items limit |
| suggestionType | string | Query | No | Max 50 chars | e.g. `Budget`, `Schedule`, `Resource` |
| userFeedback | string | Query | No | Max 50 chars | e.g. `Helpful`, `Ignored` |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 1,
  "totalPages": 1,
  "items": [
    {
      "logId": 501,
      "projectId": 3,
      "suggestionType": "Budget Overrun Warning",
      "suggestionContent": "Project expenses have reached 90% of the allocated baseline budget.",
      "userFeedback": null,
      "createdAt": "2026-06-12T12:00:00Z"
    }
  ]
}
```

---

## 6. Project Risks & Mitigations (RisksController)

**Endpoint Base:** `/api/v1/risks`

---

### Create Risk Mitigation Plan
**Endpoint:** `POST /api/v1/risks/{riskId}/mitigations`  
**Description:** Sets up a mitigation plan for the target risk. Protection: Risk update authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[RiskAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| riskId | integer | Path | Yes | Positive integer | The ID of the parent risk |
| strategyType | string | Body | Yes | Non-empty | Mitigation model: `Avoid`, `Mitigate`, `Transfer`, `Accept` |
| actionPlan | string | Body | Yes | Non-empty | Concrete steps description |
| mitigationCost | decimal | Body | No | Between 0 and 9999999999999999.99 | Estimated mitigation cost |
| assignedMemberId | integer | Body | No | Positive integer | Workspace member ID in charge |
| targetDate | DateOnly | Body | No | None | Deadline to apply mitigation |
| status | string | Body | No | None | e.g. `Draft`, `Approved`, `In Action`, `Done` |

**Request Body Example (JSON):**
```json
{
  "strategyType": "Mitigate",
  "actionPlan": "Migrate mock endpoints to secondary AWS staging zones",
  "mitigationCost": 150.00,
  "assignedMemberId": 99,
  "targetDate": "2026-06-20",
  "status": "In Action"
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "mitigationId": 32,
  "riskId": 11,
  "strategyType": "Mitigate",
  "actionPlan": "Migrate mock endpoints to secondary AWS staging zones",
  "mitigationCost": 150.00,
  "assignedMemberId": 99,
  "targetDate": "2026-06-20",
  "status": "In Action",
  "createdAt": "2026-06-13T00:00:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "ActionPlanRequired" | "Kế hoạch hành động (ActionPlan) là bắt buộc." | ActionPlan is empty | Prompt user to fill plan field |
| 404 Not Found | "RiskNotFound" | "Không tìm thấy rủi ro." | Parent risk ID missing | Return to risk overview screen |

---

### Get Risk Lifecycle History
**Endpoint:** `GET /api/v1/risks/{riskId}/lifecycle`  
**Description:** Fetches historical updates, status shifts, and risk score adjustments for tracking. Protection: Risk view authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[RiskAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| riskId | integer | Path | Yes | Positive integer | Target risk ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
[
  {
    "historyId": 1001,
    "riskId": 11,
    "changedByMemberId": 99,
    "oldStatus": "Open",
    "newStatus": "Assessed",
    "oldScore": 12,
    "newScore": 15,
    "changeNote": "Updated impact to critical based on third-party service delay estimates",
    "changeDate": "2026-06-12T16:30:00Z"
  }
]
```

---

## 7. Project Tasks Management (TasksController)

**Endpoint Base:** `/api/v1/tasks`

---

### Update Task Details
**Endpoint:** `PUT /api/v1/tasks/{taskId}`  
**Description:** Modifies properties, scheduling windows, or requirements of a task. Protection: Task update authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[TaskAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| taskId | integer | Path | Yes | Positive integer | Target task ID |
| taskName | string | Body | Yes | Max 255 chars, Non-empty | Display name of task |
| durationType | string | Body | Yes | Options: `Hour`, `Day`, `StoryPoint` | Type of effort metric |
| estimatedValue | decimal | Body | Yes | Between 0.01 and 99999999.99 | Quantity of effort |
| startDate | DateOnly | Body | No | None | Planned start date |
| endDate | DateOnly | Body | No | None | Planned end date |
| status | string | Body | Yes | Options: `To-do`, `In Progress`, `Review`, `Done` | Lifecycle status |
| complexity | string | Body | Yes | Options: `Low`, `Medium`, `High`, `Critical` | Complexity tier |
| requiredSkillLevel | string | Body | Yes | Options: `Low`, `Medium`, `High`, `Expert` | Minimum required skill |
| priority | string | Body | Yes | Options: `Low`, `Medium`, `High`, `Critical` | Priority tier |
| expectedTeamSize | integer | Body | Yes | Min 1 | Expected crew count |

**Request Body Example (JSON):**
```json
{
  "taskName": "Implement API documentation v2",
  "durationType": "Hour",
  "estimatedValue": 12.00,
  "startDate": "2026-06-12",
  "endDate": "2026-06-14",
  "status": "In Progress",
  "complexity": "Medium",
  "requiredSkillLevel": "Medium",
  "priority": "High",
  "expectedTeamSize": 1
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "taskId": 101,
  "projectId": 3,
  "taskName": "Implement API documentation v2",
  "status": "In Progress",
  "durationType": "Hour",
  "estimatedValue": 12.00,
  "startDate": "2026-06-12",
  "endDate": "2026-06-14",
  "createdAt": "2026-06-12T00:00:00Z",
  "complexity": "Medium",
  "requiredSkillLevel": "Medium",
  "priority": "High",
  "expectedTeamSize": 1
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "InvalidTaskStatus" | "Trạng thái (Status) chỉ nhận To-do, In Progress, Review hoặc Done." | Incorrect status parameter | Correct payload status value |
| 400 Bad Request | "InvalidDurationType" | "Loại thời lượng (DurationType) chỉ nhận Hour, Day hoặc StoryPoint." | Incorrect duration parameter | Correct payload duration value |

---

### Delete Task
**Endpoint:** `DELETE /api/v1/tasks/{taskId}`  
**Description:** Soft-deletes a task. Prevents deletion if other tasks depend on it. Protection: Task delete authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[TaskAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| taskId | integer | Path | Yes | Positive integer | Target Task ID |

#### Response (Success - 204 No Content)
*(No body returned)*

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 409 Conflict | "TaskHasDependents" | "Không thể xóa công việc vì có công việc khác phụ thuộc vào." | Dependent tasks block deletion | Alert user to detach dependencies first |

---

### Assign Task Member
**Endpoint:** `POST /api/v1/tasks/{taskId}/assignees`  
**Description:** Links a workspace member to the task with a specific role assignment. Protection: Task update authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[TaskAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| taskId | integer | Path | Yes | Positive integer | Target Task ID |
| memberId | integer | Body | Yes | Positive integer | Workspace member ID |
| assigneeType | string | Body | Yes | Options: `Assignee`, `Reviewer`, `Watcher` | Role type inside task |

**Request Body Example (JSON):**
```json
{
  "memberId": 99,
  "assigneeType": "Assignee"
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "taskId": 101,
  "memberId": 99,
  "assigneeType": "Assignee",
  "assignedAt": "2026-06-13T00:05:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "InvalidAssigneeType" | "Loại phân công (AssigneeType) chỉ nhận Assignee, Reviewer hoặc Watcher." | Invalid assigneeType value | Highlight role dropdown |
| 400 Bad Request | "InvalidTaskMember" | "Thành viên không tồn tại, không hoạt động hoặc không thuộc Workspace của công việc." | Mismatched member ID | Alert client about member constraints |
| 409 Conflict | "MemberRoleAlreadyAssigned" | "Thành viên đã được gán vai trò này trong công việc." | Role duplicate check | Highlight target list |

---

### Remove Task Member Role
**Endpoint:** `DELETE /api/v1/tasks/{taskId}/assignees/{memberId}`  
**Description:** Detaches all roles of a member from a task. Protection: Task update authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[TaskAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| taskId | integer | Path | Yes | Positive integer | Target Task ID |
| memberId | integer | Path | Yes | Positive integer | Target Member ID |

#### Response (Success - 204 No Content)
*(No body returned)*

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 404 Not Found | "AssignmentNotFound" | "Khong tim thay assignment cua member trong task." | Target user has no roles in task | Show failure toast alert |

---

### Create Task Dependency
**Endpoint:** `POST /api/v1/tasks/{taskId}/dependencies`  
**Description:** Defines a predecessor dependency link for scheduling. Protects against self-reference or cycles. Protection: Task update authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[TaskAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| taskId | integer | Path | Yes | Positive integer | Target successor task ID |
| predecessorTaskId | integer | Body | Yes | Positive integer | Target predecessor task ID |
| dependencyType | string | Body | Yes | Options: `FS`, `SS`, `FF`, `SF` | Link logic (Finish-Start, etc.) |

**Request Body Example (JSON):**
```json
{
  "predecessorTaskId": 100,
  "dependencyType": "FS"
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "dependencyId": 501,
  "predecessorTaskId": 100,
  "successorTaskId": 101,
  "dependencyType": "FS"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "InvalidDependencyType" | "Loại phụ thuộc (DependencyType) chỉ nhận FS, SS, FF hoặc SF." | Incorrect dependency model | Check input type parameter |
| 400 Bad Request | "TaskSelfDependencyNotAllowed" | "Công việc không thể phụ thuộc vào chính nó." | successorId == predecessorId | Block UI select choice |
| 400 Bad Request | "PredecessorTaskProjectMismatch" | "Công việc tiền nhiệm phải thuộc cùng dự án với công việc kế nhiệm." | Cross-project dependency link | Restrict search list to same project |
| 404 Not Found | "PredecessorTaskNotFound" | "Không tìm thấy công việc tiền nhiệm (predecessor task)." | Mismatched predecessor task ID | Show target list details |
| 409 Conflict | "DependencyAlreadyExists" | "Mối quan hệ phụ thuộc này đã tồn tại." | Duplicate link | Notify user of existing relationship |
| 409 Conflict | "DependencyCycleDetected" | "Không thể tạo sự phụ thuộc vì sẽ gây ra vòng lặp." | Schedule cycle detection failed | Inform user about cycle loop bounds |

---

### Get Task Comments
**Endpoint:** `GET /api/v1/tasks/{taskId}/comments`  
**Description:** Fetches all nested commentary lines for a task. Protection: Task view authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[TaskAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| taskId | integer | Path | Yes | Positive integer | Target Task ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
[
  {
    "commentId": 1001,
    "taskId": 101,
    "memberId": 99,
    "memberName": "Nguyễn Văn A",
    "memberAvatarUrl": "https://example.com/avatar.jpg",
    "parentCommentId": null,
    "content": "Need to clarify API models first",
    "createdAt": "2026-06-12T16:00:00Z",
    "updatedAt": null,
    "replies": []
  }
]
```

---

### Create Task Comment
**Endpoint:** `POST /api/v1/tasks/{taskId}/comments`  
**Description:** Adds a comment or replies to an existing thread. Protection: Task update authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[TaskAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| taskId | integer | Path | Yes | Positive integer | Target Task ID |
| content | string | Body | Yes | Non-empty | Display text of comment |
| parentCommentId | integer | Body | No | Positive integer | Parent comment ID for replies |

**Request Body Example (JSON):**
```json
{
  "content": "I will coordinate with frontend team.",
  "parentCommentId": 1001
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "commentId": 1002,
  "taskId": 101,
  "memberId": 99,
  "memberName": "Nguyễn Văn A",
  "memberAvatarUrl": "https://example.com/avatar.jpg",
  "parentCommentId": 1001,
  "content": "I will coordinate with frontend team.",
  "createdAt": "2026-06-13T00:10:00Z",
  "updatedAt": null,
  "replies": []
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "CommentContentRequired" | "Nội dung bình luận không được để trống." | Empty content text | Highlight comment input box |
| 404 Not Found | "ParentCommentNotFound" | "Không tìm thấy bình luận cha." | Parent comment ID missing | Prompt thread reload |

---

### Get Task Attached Assets
**Endpoint:** `GET /api/v1/tasks/{taskId}/assets`  
**Description:** Retrieves list of documents attached to a task. Protection: Task view authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[TaskAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| taskId | integer | Path | Yes | Positive integer | Target Task ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
[
  {
    "assetId": 201,
    "assetName": "specification.pdf",
    "assetType": "application/pdf",
    "fileSizeKB": 1024,
    "attachedBy": 99,
    "attachedByName": "Nguyễn Văn A",
    "attachedAt": "2026-06-12T23:45:00Z"
  }
]
```

---

### Attach Project Assets to Task
**Endpoint:** `POST /api/v1/tasks/{taskId}/assets`  
**Description:** Links existing project assets to a task. Protection: Task update authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[TaskAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| taskId | integer | Path | Yes | Positive integer | Target Task ID |
| assetIds | array of integers | Body | Yes | Min 1 item | List of project asset IDs |

**Request Body Example (JSON):**
```json
{
  "assetIds": [201, 202]
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
[
  {
    "assetId": 201,
    "assetName": "specification.pdf",
    "assetType": "application/pdf",
    "fileSizeKB": 1024,
    "attachedBy": 99,
    "attachedByName": "Nguyễn Văn A",
    "attachedAt": "2026-06-13T00:15:00Z"
  }
]
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "AssetIdsRequired" | "Danh sách mã tài liệu (AssetIds) không được rỗng." | Empty ID array | Show asset selection grid |
| 400 Bad Request | "InvalidAssets" | "Một hoặc nhiều tài liệu không hợp lệ (không tồn tại, đã bị xóa hoặc thuộc dự án khác)." | Bad asset ID link | Prompt search checklist reload |

---

### Detach Asset from Task
**Endpoint:** `DELETE /api/v1/tasks/{taskId}/assets/{assetId}`  
**Description:** Detaches a document link from a task. Does not delete the asset from the project folder. Protection: Task update authorization.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[TaskAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| taskId | integer | Path | Yes | Positive integer | Target Task ID |
| assetId | integer | Path | Yes | Positive integer | Target Asset ID |

#### Response (Success - 204 No Content)
*(No body returned)*

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 404 Not Found | "TaskAssetNotFound" | "Không tìm thấy liên kết tài liệu với công việc." | Mismatched asset/task link | Show detachment failure toast |

---

## 8. Workspace Review Cycles (ReviewCyclesController)

**Endpoint Base:** `/api/v1/workspaces/{workspaceId}/review-cycles`

---

### Get Workspace Review Cycles
**Endpoint:** `GET /api/v1/workspaces/{workspaceId}/review-cycles`  
**Description:** Lists all review cycles (Drafts, Active, Completed) inside a workspace. Protection: Workspace view permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
[
  {
    "cycleId": 1,
    "workspaceId": 12,
    "cycleName": "Q2 Performance Appraisal",
    "startDate": "2026-06-01",
    "endDate": "2026-06-30",
    "status": "Draft",
    "createdBy": 99,
    "createdAt": "2026-06-01T08:00:00Z"
  }
]
```

---

### Create Review Cycle
**Endpoint:** `POST /api/v1/workspaces/{workspaceId}/review-cycles`  
**Description:** Spawns a new cycle in Draft status. Protection: Workspace manage permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| cycleName | string | Body | Yes | Max 255 chars, Non-empty | Unique display name |
| startDate | DateOnly | Body | Yes | None | Timeline start date |
| endDate | DateOnly | Body | Yes | Must be >= `startDate` | Timeline end date |

**Request Body Example (JSON):**
```json
{
  "cycleName": "Q2 Performance Appraisal",
  "startDate": "2026-06-01",
  "endDate": "2026-06-30"
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "cycleId": 1,
  "workspaceId": 12,
  "cycleName": "Q2 Performance Appraisal",
  "startDate": "2026-06-01",
  "endDate": "2026-06-30",
  "status": "Draft",
  "createdBy": 99,
  "createdAt": "2026-06-13T00:20:00Z"
}
```

---

### Start Review Cycle
**Endpoint:** `POST /api/v1/workspaces/{workspaceId}/review-cycles/{cycleId}/start`  
**Description:** Moves a draft cycle to Active status to open evaluation submissions. Protection: Workspace manage permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| cycleId | integer | Path | Yes | Positive integer | Target Cycle ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "cycleId": 1,
  "workspaceId": 12,
  "cycleName": "Q2 Performance Appraisal",
  "startDate": "2026-06-01",
  "endDate": "2026-06-30",
  "status": "Active",
  "createdBy": 99,
  "createdAt": "2026-06-01T08:00:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "CannotStartNonDraftCycle" | "Chỉ có thể bắt đầu chu kỳ đánh giá đang ở trạng thái nháp (Draft)." | Cycle is already Active/Done | Hide Start button for non-draft cycles |
| 404 Not Found | "ReviewCycleNotFound" | "Không tìm thấy chu kỳ đánh giá." | Invalid Cycle ID | Reload cycle list |

---

### Complete Review Cycle
**Endpoint:** `POST /api/v1/workspaces/{workspaceId}/review-cycles/{cycleId}/complete`  
**Description:** Completes the active cycle, triggering background queue processes to calculate overall performance levels. Protection: Workspace manage permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| cycleId | integer | Path | Yes | Positive integer | Target Cycle ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "cycleId": 1,
  "workspaceId": 12,
  "cycleName": "Q2 Performance Appraisal",
  "startDate": "2026-06-01",
  "endDate": "2026-06-30",
  "status": "Completed",
  "createdBy": 99,
  "createdAt": "2026-06-01T08:00:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "CannotCompleteNonActiveCycle" | "Chỉ có thể hoàn thành chu kỳ đánh giá đang hoạt động (Active)." | Cycle not active yet | Hide Complete button |
| 404 Not Found | "ReviewCycleNotFound" | "Không tìm thấy chu kỳ đánh giá." | Invalid Cycle ID | Reload cycle list |

---

### Submit Evaluation
**Endpoint:** `POST /api/v1/workspaces/{workspaceId}/review-cycles/{cycleId}/evaluations`  
**Description:** Submits scores for Self, Manager, or Peer appraisals in an active cycle. Protection: Workspace manage permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| cycleId | integer | Path | Yes | Positive integer | Target Cycle ID |
| revieweeID | integer | Body | Yes | Positive integer | Member being reviewed |
| reviewerID | integer | Body | Yes | Positive integer | Member giving scores |
| evaluationType | string | Body | Yes | Allowed: `Self`, `Manager`, `Peer` | Relationship model |
| communicationScore | decimal | Body | Yes | Between 0 and 100 | Metric rating |
| leadershipScore | decimal | Body | Yes | Between 0 and 100 | Metric rating |
| problemSolvingScore | decimal | Body | Yes | Between 0 and 100 | Metric rating |
| feedbackNotes | string | Body | No | None | Written evaluations |

**Request Body Example (JSON):**
```json
{
  "revieweeID": 102,
  "reviewerID": 99,
  "evaluationType": "Manager",
  "communicationScore": 85.5,
  "leadershipScore": 90.0,
  "problemSolvingScore": 88.0,
  "feedbackNotes": "Exceeds performance standards in problem-solving."
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "evaluationId": 5001,
  "cycleId": 1,
  "revieweeId": 102,
  "reviewerId": 99,
  "evaluationType": "Manager",
  "communicationScore": 85.5,
  "leadershipScore": 90.0,
  "problemSolvingScore": 88.0,
  "feedbackNotes": "Exceeds performance standards in problem-solving.",
  "submittedAt": "2026-06-13T00:25:00Z",
  "status": "Submitted"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "CannotSubmitInNonActiveCycle" | "Chỉ có thể nộp đánh giá trong chu kỳ đang hoạt động (Active)." | Cycle status != Active | Alert user that cycle is closed |
| 400 Bad Request | "InvalidReviewMembers" | "Nhân viên được đánh giá hoặc người đánh giá không hợp lệ trong Workspace." | Reviewee/Reviewer ID check fail | Highlight member selector inputs |
| 400 Bad Request | "InvalidReviewType" | "Loại đánh giá không hợp lệ (chỉ chấp nhận Self, Manager, Peer)." | Bad evaluation type string | Highlight type selector dropdown |
| 404 Not Found | "ReviewCycleNotFound" | "Không tìm thấy chu kỳ đánh giá." | Cycle ID does not exist | Show thread error toast |

---

## 9. Conversations (ConversationsController)

**Endpoint Base:** `/api/v1`

---

### Create Conversation
**Endpoint:** `POST /api/v1/workspaces/{workspaceId}/conversations`  
**Description:** Creates a new direct (1-1), group, or project channel conversation. Automatically adds the creator as a member. Protection: Workspace active member.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| projectId | integer | Body | No | Positive integer | Associated project ID. Required if `type` is `Project_Channel`. |
| name | string | Body | No | Max 100 characters | Conversation name. Required if `type` is `Group`. |
| type | string | Body | Yes | Allowed: `Direct`, `Group`, `Project_Channel` | The classification of the conversation |
| workspaceMemberIds | array of integers | Body | Yes | Min 1 item | List of active workspace member IDs to include in the conversation |

**Request Body Example (JSON):**
```json
{
  "projectId": null,
  "name": "Project Alpha Group Chat",
  "type": "Group",
  "workspaceMemberIds": [102, 103]
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "conversationId": 45,
  "workspaceId": 12,
  "projectId": null,
  "name": "Project Alpha Group Chat",
  "type": "Group",
  "createdAt": "2026-06-13T01:00:00Z",
  "members": [
    {
      "workspaceMemberId": 99,
      "resourceId": 5,
      "fullName": "Nguyễn Văn A",
      "avatarUrl": "https://example.com/avatar1.jpg",
      "joinedAt": "2026-06-13T01:00:00Z",
      "lastReadAt": "2026-06-13T01:00:00Z"
    },
    {
      "workspaceMemberId": 102,
      "resourceId": 8,
      "fullName": "Trần Thị B",
      "avatarUrl": null,
      "joinedAt": "2026-06-13T01:00:00Z",
      "lastReadAt": "2026-06-13T01:00:00Z"
    }
  ]
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | None | "Direct conversation must have exactly 2 members." | Direct type but members count is not exactly 2 | Highlight user selection and enforce exactly 2 members |
| 400 Bad Request | None | "Group conversation must have a Name." | Group type but name is null/empty | Highlight the conversation name input field |
| 400 Bad Request | None | "Group conversation must have at least 2 members." | Group type but members count is less than 2 | Inform user that at least 2 members are required |
| 400 Bad Request | None | "Project_Channel conversation must be associated with a Project." | Project_Channel type but projectId is missing | Highlight project dropdown selector |
| 400 Bad Request | None | "Một số thành viên không hợp lệ hoặc không thuộc Workspace này." | Workspace member IDs do not exist, are inactive, or belong to another workspace | Reload list of members |
| 403 Forbidden | None | "Bạn không có quyền truy cập Workspace này." | Creator is not active member of workspace | Show workspace forbidden modal and redirect to home |
| 404 Not Found | None | "Không tìm thấy Project hoặc Project không thuộc Workspace." | Associated project ID does not exist in the specified workspace | Show warning and refresh project selection list |

---

### Get Workspace Conversations
**Endpoint:** `GET /api/v1/workspaces/{workspaceId}/conversations`  
**Description:** Lists all active conversations in a workspace that the current member is a part of. The conversation name for direct chats is dynamically populated with the other member's name. Sorting is automatically ordered by the last message timestamp. Protection: Workspace active member.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
[
  {
    "conversationId": 45,
    "workspaceId": 12,
    "projectId": null,
    "name": "Project Alpha Group Chat",
    "type": "Group",
    "lastMessageContent": "Xin chào mọi người",
    "lastMessageAt": "2026-06-13T01:05:00Z",
    "unreadCount": 2
  },
  {
    "conversationId": 46,
    "workspaceId": 12,
    "projectId": null,
    "name": "Trần Thị B",
    "type": "Direct",
    "lastMessageContent": "[Tin nhan da thu hoi]",
    "lastMessageAt": "2026-06-13T00:50:00Z",
    "unreadCount": 0
  }
]
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 403 Forbidden | None | "Bạn không có quyền truy cập Workspace này." | Current user is not an active member in this workspace | Redirect to dashboard or home |

---

### Get Conversation Details
**Endpoint:** `GET /api/v1/conversations/{conversationId}`  
**Description:** Retrieves the detailed metadata and membership of a specific conversation. Displays other member name dynamically if type is `Direct`. Protection: Conversation membership required.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| conversationId | integer | Path | Yes | Positive integer | Target Conversation ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "conversationId": 45,
  "workspaceId": 12,
  "projectId": null,
  "name": "Project Alpha Group Chat",
  "type": "Group",
  "createdAt": "2026-06-13T01:00:00Z",
  "members": [
    {
      "workspaceMemberId": 99,
      "resourceId": 5,
      "fullName": "Nguyễn Văn A",
      "avatarUrl": "https://example.com/avatar1.jpg",
      "joinedAt": "2026-06-13T01:00:00Z",
      "lastReadAt": "2026-06-13T01:05:00Z"
    }
  ]
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 403 Forbidden | None | "Bạn không có quyền truy cập hội thoại này hoặc hội thoại không tồn tại." | User is not in the conversation, or conversation/workspace was soft-deleted | Show warning toast and redirect back to inbox |

---

### Get Conversation Messages
**Endpoint:** `GET /api/v1/conversations/{conversationId}/messages`  
**Description:** Retrieves messages in a conversation. Implements cursor-based pagination using the `beforeMessageId` query parameter to fetch historical messages. Protection: Conversation membership required.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| conversationId | integer | Path | Yes | Positive integer | Target Conversation ID |
| pageSize | integer | Query | No | Range: 1 to 100, default 20 | Number of messages to return |
| beforeMessageId | integer | Query | No | Positive integer | Return messages with ID strictly less than this cursor |
| keyword | string | Query | No | None | Text search filter for non-deleted message content |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
[
  {
    "messageId": 501,
    "conversationId": 45,
    "senderId": 99,
    "senderName": "Nguyễn Văn A",
    "senderAvatarUrl": "https://example.com/avatar1.jpg",
    "content": "Xin chào mọi người",
    "createdAt": "2026-06-13T01:05:00Z",
    "isEdited": false,
    "isDeleted": false,
    "assets": [
      {
        "assetId": 201,
        "assetName": "design_spec.png",
        "assetType": "image/png",
        "fileSizeKB": 512,
        "createdAt": "2026-06-13T00:30:00Z"
      }
    ]
  }
]
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 403 Forbidden | None | "Bạn không có quyền truy cập hội thoại này hoặc hội thoại không tồn tại." | User is not a member of the conversation or the workspace was deleted | Show error toast and block chat view |

---

### Send Message
**Endpoint:** `POST /api/v1/conversations/{conversationId}/messages`  
**Description:** Sends a text message and/or attaches existing project documents to the conversation. Triggers real-time dispatch via SignalR to group `Conversation_{conversationId}` with event `"MessageCreated"`. Protection: Conversation membership required.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| conversationId | integer | Path | Yes | Positive integer | Target Conversation ID |
| content | string | Body | No | Max 4000 characters | Message text content. Required if `assetIds` is empty. |
| assetIds | array of integers | Body | No | None | List of project asset IDs to attach. Required if `content` is empty. |

**Request Body Example (JSON):**
```json
{
  "content": "Đây là tài liệu đặc tả thiết kế mới.",
  "assetIds": [201]
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "messageId": 502,
  "conversationId": 45,
  "senderId": 99,
  "senderName": "Nguyễn Văn A",
  "senderAvatarUrl": "https://example.com/avatar1.jpg",
  "content": "Đây là tài liệu đặc tả thiết kế mới.",
  "createdAt": "2026-06-13T01:10:00Z",
  "isEdited": false,
  "isDeleted": false,
  "assets": [
    {
      "assetId": 201,
      "assetName": "design_spec.png",
      "assetType": "image/png",
      "fileSizeKB": 512,
      "createdAt": "2026-06-13T00:30:00Z"
    }
  ]
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | None | "Tin nhan phai co noi dung hoac tai lieu dinh kem." | Both `content` and `assetIds` are empty or white-spaces | Display validation error under input box |
| 400 Bad Request | None | "Mot hoac nhieu tai lieu dinh kem khong hop le cho hoi thoai nay." | One or more asset IDs do not exist, belong to another workspace, or mismatch the project | Refresh file browser and display warning toast |
| 403 Forbidden | None | "Bạn không có quyền truy cập hội thoại này hoặc hội thoại không tồn tại." | User is not in the conversation or the conversation/workspace is deleted | Block chat input field |

---

### Mark Conversation As Read
**Endpoint:** `PUT /api/v1/conversations/{conversationId}/read` (Also supports `POST /api/v1/conversations/{conversationId}/read`)  
**Description:** Marks the conversation as read by the current user. Updates `lastReadAt`. Triggers SignalR `"ConversationRead"` real-time pushes to the chat group and user group. Protection: Conversation membership required.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| conversationId | integer | Path | Yes | Positive integer | Target Conversation ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "message": "Đã đánh dấu đọc."
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 403 Forbidden | None | "Bạn không có quyền truy cập hội thoại này." | User is not in the conversation or workspace deleted | Silent fail or show warning |

---

### Rename Conversation
**Endpoint:** `PUT /api/v1/conversations/{conversationId}`  
**Description:** Modifies the display name of a group or channel. Direct chats cannot be renamed. Protection: Manage conversations permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| conversationId | integer | Path | Yes | Positive integer | Target Conversation ID |
| name | string | Body | Yes | Max 100 characters, Non-empty | New display name for the conversation |

**Request Body Example (JSON):**
```json
{
  "name": "Design Discussion Group"
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "conversationId": 45,
  "workspaceId": 12,
  "projectId": null,
  "name": "Design Discussion Group",
  "type": "Group",
  "createdAt": "2026-06-13T01:00:00Z",
  "members": [
    {
      "workspaceMemberId": 99,
      "resourceId": 5,
      "fullName": "Nguyễn Văn A",
      "avatarUrl": "https://example.com/avatar1.jpg",
      "joinedAt": "2026-06-13T01:00:00Z",
      "lastReadAt": "2026-06-13T01:05:00Z"
    }
  ]
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | None | "Không thể đổi tên hội thoại 1-1." | Conversation is of type Direct | Hide or disable rename option |
| 400 Bad Request | None | "Tên hội thoại không được để trống." | Name parameter is null/empty/whitespaces | Show invalid input feedback |
| 403 Forbidden | None | "Bạn không có quyền đổi tên hội thoại này." | User lacks Manage permission for conversations in workspace | Hide/disable edit title actions |
| 403 Forbidden | None | "Bạn không có quyền truy cập hội thoại này hoặc hội thoại không tồn tại." | User is not in the conversation or the workspace is deleted | Show alert toast |

---

### Delete Conversation
**Endpoint:** `DELETE /api/v1/conversations/{conversationId}`  
**Description:** Soft-deletes a conversation and its messages. Group chats require Manage permission; direct chats can be deleted by either participant. Triggers SignalR `"ConversationCleared"` push notification. Protection: Manage conversations or direct chat participant.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| conversationId | integer | Path | Yes | Positive integer | Target Conversation ID |

#### Response (Success - 204 No Content)
*(No body returned)*

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 403 Forbidden | None | "Bạn không có quyền xóa/giải tán hội thoại này." | Non-manager attempting to delete a group conversation | Show action forbidden warning toast |
| 403 Forbidden | None | "Bạn không có quyền truy cập hội thoại này hoặc hội thoại không tồn tại." | Conversation does not exist or user is not a member | Redirect to workspace inbox |

---

### Add Members to Conversation
**Endpoint:** `POST /api/v1/conversations/{conversationId}/members`  
**Description:** Appends active workspace members to an existing group/channel conversation. Direct chats cannot add members. Protection: Manage conversations permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| conversationId | integer | Path | Yes | Positive integer | Target Conversation ID |
| workspaceMemberIds | array of integers | Body | Yes | Min 1 item | List of active workspace member IDs to add |

**Request Body Example (JSON):**
```json
{
  "workspaceMemberIds": [104, 105]
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "conversationId": 45,
  "workspaceId": 12,
  "projectId": null,
  "name": "Design Discussion Group",
  "type": "Group",
  "createdAt": "2026-06-13T01:00:00Z",
  "members": [
    {
      "workspaceMemberId": 99,
      "resourceId": 5,
      "fullName": "Nguyễn Văn A",
      "avatarUrl": "https://example.com/avatar1.jpg",
      "joinedAt": "2026-06-13T01:00:00Z",
      "lastReadAt": "2026-06-13T01:05:00Z"
    },
    {
      "workspaceMemberId": 104,
      "resourceId": 12,
      "fullName": "Phạm Văn C",
      "avatarUrl": null,
      "joinedAt": "2026-06-13T01:15:00Z",
      "lastReadAt": "2026-06-13T01:15:00Z"
    }
  ]
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | None | "Không thể thêm thành viên vào hội thoại 1-1." | Target conversation is direct chat | Disable add members dropdown |
| 400 Bad Request | None | "ID thành viên không hợp lệ." | Workspace member IDs contain invalid values (<= 0) | Filter out invalid values before posting |
| 400 Bad Request | None | "Một số thành viên không hợp lệ hoặc không thuộc Workspace này." | Workspace member IDs contain users that are inactive or outside the workspace | Reload workspace members list |
| 403 Forbidden | None | "Bạn không có quyền thêm thành viên vào hội thoại này." | Current user lacks Manage permission for conversations | Hide add members button |
| 403 Forbidden | None | "Bạn không có quyền truy cập hội thoại này hoặc hội thoại không tồn tại." | Conversation deleted, workspace deleted, or user not in chat | Redirect to chat index |
| 409 Conflict | None | "Có lỗi xảy ra hoặc dữ liệu bị trùng lặp, vui lòng thử lại." | Unique constraint violation / database insert race condition | Show generic conflict toast |

---

### Remove Member from Conversation
**Endpoint:** `DELETE /api/v1/conversations/{conversationId}/members/{memberId}`  
**Description:** Removes a member from a group conversation. Either a manager kicking a member, or a member leaving. Lacks support for direct 1-1 chats. Protection: Manage conversations (if kicking others) or self-removal.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| conversationId | integer | Path | Yes | Positive integer | Target Conversation ID |
| memberId | integer | Path | Yes | Positive integer | Workspace Member ID to remove |

#### Response (Success - 204 No Content)
*(No body returned)*

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | None | "Không thể xóa thành viên khỏi hội thoại 1-1." | Target conversation is direct chat | Hide leave/remove actions |
| 403 Forbidden | None | "Bạn không có quyền xóa thành viên khác khỏi hội thoại này." | User without Manage permission trying to remove another member | Enforce leaving only, hide kick options |
| 403 Forbidden | None | "Bạn không có quyền truy cập hội thoại này hoặc hội thoại không tồn tại." | Conversation or workspace is inactive/deleted | Show warning toast |
| 404 Not Found | None | "Không tìm thấy thành viên trong hội thoại." | Member ID is not in the conversation member list | Reload members checklist |
| 409 Conflict | None | "Không thể xóa thành viên cuối cùng của hội thoại. Vui lòng giải tán hội thoại." | Deleting the sole remaining member | Prompt to delete/disband conversation instead |

---

## 10. Messages (MessagesController)

**Endpoint Base:** `/api/v1/messages`

---

### Edit Message
**Endpoint:** `PUT /api/v1/messages/{messageId}`  
**Description:** Updates the text content of a message. Only allowed for the message sender. Triggers real-time SignalR push with event `"MessageEdited"`. Protection: Message sender.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| messageId | integer | Path | Yes | Positive integer | Target Message ID |
| content | string | Body | Yes | Max 4000 characters, Non-empty | New message text content |

**Request Body Example (JSON):**
```json
{
  "content": "Nội dung tin nhắn đã được chỉnh sửa."
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "messageId": 501,
  "conversationId": 45,
  "senderId": 99,
  "senderName": "Nguyễn Văn A",
  "senderAvatarUrl": "https://example.com/avatar1.jpg",
  "content": "Nội dung tin nhắn đã được chỉnh sửa.",
  "createdAt": "2026-06-13T01:05:00Z",
  "isEdited": true,
  "isDeleted": false,
  "assets": [
    {
      "assetId": 201,
      "assetName": "design_spec.png",
      "assetType": "image/png",
      "fileSizeKB": 512,
      "createdAt": "2026-06-13T00:30:00Z"
    }
  ]
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "MessageContentRequired" | "Nội dung tin nhắn không được để trống." | Edited text content is null/empty/whitespaces | Show validation error on text input |
| 403 Forbidden | "UnauthorizedMessageEdit" | "Bạn không có quyền chỉnh sửa tin nhắn này." | Current user is not the message author | Hide or disable message edit button |
| 403 Forbidden | "UnauthorizedMessageAccess" | "Bạn không có quyền truy cập tin nhắn này." | User is not active member in conversation workspace | Show access denied message and return |
| 404 Not Found | "MessageNotFound" | "Không tìm thấy tin nhắn tương ứng." | Invalid message ID or message already deleted | Show error toast and refresh chat history |

---

### Delete Message
**Endpoint:** `DELETE /api/v1/messages/{messageId}`  
**Description:** Recalls a message (soft-delete). The message content is replaced with `[Tin nhan da thu hoi]` and assets are detached. Only allowed for the message sender. Triggers real-time SignalR push with event `"MessageDeleted"`. Protection: Message sender.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| messageId | integer | Path | Yes | Positive integer | Target Message ID |

#### Response (Success - 204 No Content)
*(No body returned)*

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 403 Forbidden | "UnauthorizedMessageRecall" | "Bạn không có quyền thu hồi tin nhắn này." | Current user is not the message author | Disable delete/recall option |
| 403 Forbidden | "UnauthorizedMessageAccess" | "Bạn không có quyền truy cập tin nhắn này." | User is not active member in conversation workspace | Show access denied message |
| 404 Not Found | "MessageNotFound" | "Không tìm thấy tin nhắn tương ứng." | Invalid message ID or message already deleted | Show message deleted toast |

---

## 11. Comments (CommentsController)

**Endpoint Base:** `/api/v1/comments`

---

### Update Comment
**Endpoint:** `PUT /api/v1/comments/{commentId}`  
**Description:** Modifies the text content of a task comment. Only allowed for the comment creator. Protection: Comment creator.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| commentId | integer | Path | Yes | Positive integer | Target Comment ID |
| content | string | Body | Yes | Non-empty | New task comment content |

**Request Body Example (JSON):**
```json
{
  "content": "Nội dung bình luận đã được chỉnh sửa."
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "commentId": 305,
  "taskId": 1001,
  "memberId": 99,
  "memberName": "Nguyễn Văn A",
  "memberAvatarUrl": "https://example.com/avatar1.jpg",
  "parentCommentId": null,
  "content": "Nội dung bình luận đã được chỉnh sửa.",
  "createdAt": "2026-06-13T02:00:00Z",
  "updatedAt": "2026-06-13T02:10:00Z",
  "replies": []
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "CommentContentRequired" | "Nội dung bình luận không được để trống." | Content parameter is null or whitespace | Highlight comments textarea |
| 403 Forbidden | "UnauthorizedCommentEdit" | "Bạn không có quyền sửa bình luận này." | User is not the author of this comment | Disable or hide edit action |
| 404 Not Found | "CommentNotFound" | "Không tìm thấy bình luận." | Comment ID does not exist | Show toast alert and reload comments thread |

---

### Delete Comment
**Endpoint:** `DELETE /api/v1/comments/{commentId}`  
**Description:** Soft-deletes a task comment. Only allowed for the comment creator. Protection: Comment creator.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| commentId | integer | Path | Yes | Positive integer | Target Comment ID |

#### Response (Success - 204 No Content)
*(No body returned)*

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 403 Forbidden | "UnauthorizedCommentDelete" | "Bạn không có quyền xóa bình luận này." | User is not the author of this comment | Hide delete option |
| 404 Not Found | "CommentNotFound" | "Không tìm thấy bình luận." | Comment ID does not exist | Show generic failure toast |

---

## 12. Notifications (NotificationsController)

**Endpoint Base:** `/api/v1/Notifications`

---

### Get Notifications
**Endpoint:** `GET /api/v1/Notifications`  
**Description:** Retrieves a paginated list of notifications for the active user. Can be filtered by read status, workspace, and reference type. Protection: User must have active membership.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| page | integer | Query | No | Range: >= 1, default 1 | Page number |
| pageSize | integer | Query | No | Range: 1 to 100, default 20 | Number of items per page |
| isRead | boolean | Query | No | None | Filter by read status |
| workspaceId | integer | Query | No | Positive integer | Filter by workspace ID |
| referenceType | string | Query | No | None | Filter by reference type (e.g. `Task`, `Comment`, `Project`, etc.) |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 50,
  "totalPages": 3,
  "unreadCount": 12,
  "items": [
    {
      "notificationID": 8001,
      "notificationType": "TaskAssigned",
      "title": "Công việc mới được giao",
      "message": "Bạn đã được giao công việc 'Thiết kế Database'.",
      "referenceType": "Task",
      "referenceID": 1001,
      "isRead": false,
      "readAt": null,
      "createdAt": "2026-06-13T02:00:00Z",
      "metadataJson": "{\"projectId\":15}",
      "referenceData": null
    }
  ]
}
```

#### Error Responses & Handling
*(No specific custom errors returned. Empty datasets yield a successful response with empty list and pagination details)*

---

### Get Unread Notifications Count
**Endpoint:** `GET /api/v1/Notifications/unread-count`  
**Description:** Returns the total count of unread notifications for the active user across active workspaces. Protection: User must have active membership.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
None

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "unreadCount": 12
}
```

#### Error Responses & Handling
*(No specific custom errors returned)*

---

### Get Notification Detail
**Endpoint:** `GET /api/v1/Notifications/{notificationId}`  
**Description:** Retrieves a specific notification, dynamically fetching and mapping referenced entity details (e.g., TaskName, WorkspaceID, ProjectID) into `referenceData`. Protection: Notification recipient active member.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| notificationId | integer | Path | Yes | Positive integer | Target Notification ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "notificationID": 8001,
  "notificationType": "TaskAssigned",
  "title": "Công việc mới được giao",
  "message": "Bạn đã được giao công việc 'Thiết kế Database'.",
  "referenceType": "Task",
  "referenceID": 1001,
  "isRead": false,
  "readAt": null,
  "createdAt": "2026-06-13T02:00:00Z",
  "metadataJson": "{\"projectId\":15}",
  "referenceData": {
    "type": "Task",
    "id": 1001,
    "title": "Thiết kế Database",
    "workspaceId": 12,
    "projectId": 15,
    "url": null,
    "extra": null
  }
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 404 Not Found | None | "Notification not found or access denied." | Notification ID invalid or recipient mismatch / workspace deleted | Show notification missing message or return to list |

---

### Mark Notification As Read
**Endpoint:** `PUT /api/v1/Notifications/{notificationId}/read`  
**Description:** Marks a single notification as read by updating `readAt` to current time. Protection: Notification recipient active member.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| notificationId | integer | Path | Yes | Positive integer | Target Notification ID |

#### Response (Success - 204 No Content)
*(No body returned)*

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 404 Not Found | None | "Notification not found or access denied." | Notification ID invalid or recipient mismatch | Silent fail or show toast warning |

---

### Mark All Notifications As Read
**Endpoint:** `PUT /api/v1/Notifications/read-all`  
**Description:** Marks all unread notifications of the active user across active workspaces as read. Protection: Active member.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
None

#### Response (Success - 204 No Content)
*(No body returned)*

#### Error Responses & Handling
*(No specific custom errors returned)*

---

### Register Device Token
**Endpoint:** `POST /api/v1/Notifications/device-tokens`  
**Description:** Registers a device token for push notifications (iOS, Android, or Web push). Refreshes existing token details if already registered. Protection: Active account.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| deviceType | string | Body | Yes | Max 20 characters, Allowed: `iOS`, `Android`, `Web` | Platform type of user device |
| deviceToken | string | Body | Yes | Max 1024 characters | Registration token provided by FCM or APNS |

**Request Body Example (JSON):**
```json
{
  "deviceType": "Web",
  "deviceToken": "fcm_token_123456789_abcdef"
}
```

#### Response (Success - 204 No Content)
*(No body returned)*

#### Error Responses & Handling
*(Standard request body validation failures will return 400 Bad Request if fields do not match constraints)*

---

### Revoke Device Token
**Endpoint:** `DELETE /api/v1/Notifications/device-tokens`  
**Description:** Deactivates a registered device token so it will no longer receive push notifications. Protection: Active account.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| deviceToken | string | Body | Yes | Max 1024 characters | Token to revoke |

**Request Body Example (JSON):**
```json
{
  "deviceToken": "fcm_token_123456789_abcdef"
}
```

#### Response (Success - 204 No Content)
*(No body returned)*

#### Error Responses & Handling
*(Standard request body validation failures will return 400 Bad Request)*

---

## 13. Assets (AssetsController)

**Endpoint Base:** `/api/v1/assets`

**Note on File Uploads:**  
While file download and deletion are handled by `AssetsController`, file uploads are routed through:
- `POST /api/v1/workspaces/{workspaceId}/assets` (documented under `WorkspacesController`)
- `POST /api/v1/projects/{projectId}/assets` (documented under `ProjectsController`)

For those upload endpoints:
- The **Content-Type** must be `multipart/form-data`.
- The exact form field name expected by the server for the file upload payload is `file` (binding to the C# `File` property in `UploadAssetRequestDto`).

---

### Download Project Asset
**Endpoint:** `GET /api/v1/assets/{assetId}/download`  
**Description:** Generates a temporary SAS URL to download/stream a project asset securely. Protection: Active member of workspace containing project asset.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| assetId | integer | Path | Yes | Positive integer | Target Asset ID |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "assetId": 201,
  "downloadUrl": "https://allocstorage.blob.core.windows.net/assets/spec.pdf?sas_token_parameters"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 403 Forbidden | None | "Ban khong phai thanh vien active cua workspace cua Project nay." | Member not in workspace or inactive | Redirect to workspace home |
| 404 Not Found | None | "Khong tim thay Project." | Asset's project is missing or deleted | Show project missing warning toast |
| 404 Not Found | None | "AssetNotFound" | Asset ID does not exist in workspace | Show asset missing toast |

---

### Delete Project Asset
**Endpoint:** `DELETE /api/v1/assets/{assetId}`  
**Description:** Soft-deletes a project asset from the workspace database. Protection: Asset delete permission.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| assetId | integer | Path | Yes | Positive integer | Target Asset ID |

#### Response (Success - 204 No Content)
*(No body returned)*

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 403 Forbidden | None | "Ban khong phai thanh vien active cua workspace cua Project nay." | Current user lacks active workspace status | Show access error screen |
| 404 Not Found | None | "AssetNotFound" | Asset ID does not exist or is already deleted | Refresh asset browser grid |

---

## 14. Timesheets (TimesheetsController)

**Endpoint Base:** `/api/v1/timesheets`

---

### Get Timesheet Logs
**Endpoint:** `GET /api/v1/timesheets`  
**Description:** Retrieves a paginated list of work logs. Regular active members can view their own entries. Members with `Timesheet.ViewAll` workspace permission can view other members' logs by specifying `memberId`. Protection: Active member.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| page | integer | Query | No | Range: >= 1, default 1 | Page number |
| pageSize | integer | Query | No | Range: 1 to 100, default 20 | Items per page |
| fromDate | DateOnly | Query | No | default: first day of current month | Start date filter |
| toDate | DateOnly | Query | No | default: last day of current month | End date filter |
| workspaceId | integer | Query | No | Positive integer | Filter logs by workspace ID |
| projectId | integer | Query | No | Positive integer | Filter logs by project ID |
| taskId | integer | Query | No | Positive integer | Filter logs by task ID |
| memberId | integer | Query | No | Positive integer | Workspace Member ID whose logs to fetch |

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "page": 1,
  "pageSize": 20,
  "totalItems": 15,
  "totalPages": 1,
  "fromDate": "2026-06-01",
  "toDate": "2026-06-30",
  "items": [
    {
      "timesheetId": 1201,
      "taskId": 1001,
      "taskName": "Thiết kế Database",
      "projectId": 3,
      "projectName": "Project Alpha",
      "workspaceId": 12,
      "workspaceMemberId": 99,
      "memberName": "Nguyễn Văn A",
      "workDate": "2026-06-12",
      "normalHours": 8.0,
      "otHours": 2.0,
      "loggedHourlyRate": 50.00,
      "loggedOTRate": 75.00,
      "totalCost": 550.00,
      "createdAt": "2026-06-12T17:00:00Z"
    }
  ]
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "InvalidDateRange" | "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc." | `toDate` is before `fromDate` | Show date range selection warning |
| 400 Bad Request | None | "workspaceId phai lon hon 0." | workspaceId <= 0 | Show generic validation error |
| 400 Bad Request | None | "memberId phai lon hon 0." | memberId <= 0 | Show generic validation error |
| 400 Bad Request | None | "MemberWorkspaceMismatch" | Queried member belongs to another workspace | Clear member selection filter |
| 403 Forbidden | "UnauthorizedTimesheetView" | "Bạn không có quyền xem bảng chấm công của thành viên khác." | Regular member querying other member's logs | Disable member selection dropdown |
| 403 Forbidden | "UnauthorizedWorkspaceMember" | "Bạn không phải là thành viên của Workspace này." | Current user is not active workspace member | Redirect to workspace listing |
| 404 Not Found | "ActiveMemberNotFound" | "Không tìm thấy thành viên hoạt động." | `memberId` does not exist or is inactive | Clear member selection filter |

---

### Log/Update Work Hours (Upsert Timesheet)
**Endpoint:** `POST /api/v1/timesheets`  
**Description:** Logs or updates normal and OT hours for a task on a specific date. Calculates cost dynamically based on the member's hourly rate (derived from `baseSalaryMonth` divided by workspace settings' standard hours per month, defaulting to 160) and OT multiplier rate. Returns `201 Created` for new logs or `200 OK` for modifications. Protection: Workspace member.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| taskId | integer | Body | Yes | Positive integer | Associated Task ID |
| workDate | DateOnly | Body | Yes | YYYY-MM-DD | Logging date |
| normalHours | decimal | Body | Yes | Between 0 and 24 | Normal working hours |
| otHours | decimal | Body | Yes | Between 0 and 24 | Overtime hours |

**Request Body Example (JSON):**
```json
{
  "taskId": 1001,
  "workDate": "2026-06-12",
  "normalHours": 8.0,
  "otHours": 2.0
}
```

#### Response (Success - 201 Created / 200 OK)
Content-Type: `application/json`
```json
{
  "timesheetId": 1201,
  "taskId": 1001,
  "taskName": "Thiết kế Database",
  "projectId": 3,
  "projectName": "Project Alpha",
  "workspaceId": 12,
  "workspaceMemberId": 99,
  "memberName": "Nguyễn Văn A",
  "workDate": "2026-06-12",
  "normalHours": 8.0,
  "otHours": 2.0,
  "loggedHourlyRate": 50.00,
  "loggedOTRate": 75.00,
  "totalCost": 550.00,
  "createdAt": "2026-06-12T17:00:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "NegativeHoursNotAllowed" | "Số giờ làm việc không được âm." | `normalHours` < 0 or `otHours` < 0 | Show invalid hours input alert |
| 400 Bad Request | "ZeroHoursNotAllowed" | "Tổng số giờ làm việc phải lớn hơn 0." | `normalHours` + `otHours` == 0 | Require non-zero input |
| 400 Bad Request | "ExceedDailyHoursLimit" | "Tổng số giờ làm việc trong ngày không được vượt quá 24." | `normalHours` + `otHours` > 24 | Alert user on daily hours limit exceeded |
| 400 Bad Request | "WorkDateBeforeTaskStart" | "Ngày làm việc không được nhỏ hơn ngày bắt đầu công việc." | Log date is before task start date | Restrict date selection to task bounds |
| 400 Bad Request | "WorkDateAfterTaskEnd" | "Ngày làm việc không được lớn hơn ngày kết thúc công việc." | Log date is after task end date | Restrict date selection to task bounds |
| 403 Forbidden | "UnauthorizedTaskWorkspaceMember" | "Bạn không phải thành viên hoạt động của Workspace chứa công việc này." | Active member is not associated with workspace | Show access denied alert |
| 404 Not Found | "TaskNotFound" | "Không tìm thấy công việc tương ứng." | Task ID does not exist or task project is missing | Show task missing warning toast |

---

## 15. Approval Requests (ApprovalRequestsController)

**Endpoint Base:** `/api/v1`

---

### Create Leave Request
**Endpoint:** `POST /api/v1/workspaces/{workspaceId}/leave-requests`  
**Description:** Creates a leave request in `Pending` status. Protection: Workspace active member.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| startDate | DateOnly | Body | Yes | YYYY-MM-DD | Start of leave period |
| endDate | DateOnly | Body | Yes | YYYY-MM-DD | End of leave period |
| reason | string | Body | No | None | Reason notes |

**Request Body Example (JSON):**
```json
{
  "startDate": "2026-06-15",
  "endDate": "2026-06-16",
  "reason": "Bị ốm cần đi khám bệnh."
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "requestType": "Leave",
  "requestId": 301,
  "workspaceId": 12,
  "workspaceMemberId": 99,
  "requesterName": "Nguyễn Văn A",
  "approverId": null,
  "approverName": null,
  "startDate": "2026-06-15",
  "endDate": "2026-06-16",
  "reason": "Bị ốm cần đi khám bệnh.",
  "status": "Pending",
  "approvalNote": null,
  "reviewedAt": null,
  "createdAt": "2026-06-13T02:00:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "StartDateRequired" | "Ngày bắt đầu là bắt buộc." | StartDate missing | Highlight date selector |
| 400 Bad Request | "EndDateRequired" | "Ngày kết thúc là bắt buộc." | EndDate missing | Highlight date selector |
| 400 Bad Request | "InvalidDateRange" | "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc." | EndDate is before StartDate | Inform user of invalid range |
| 403 Forbidden | "UnauthorizedWorkspaceMember" | "Bạn không phải là thành viên của Workspace này." | Requester is not active in workspace | Show dashboard redirection |

---

### Create OT Request
**Endpoint:** `POST /api/v1/workspaces/{workspaceId}/ot-requests`  
**Description:** Creates an overtime request in `Pending` status. Protection: Workspace active member.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]` + `[WorkspaceAuthorize]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| workspaceId | integer | Path | Yes | Positive integer | Target Workspace ID |
| taskId | integer | Body | No | Positive integer | Associated Task ID |
| requestedDate | DateOnly | Body | Yes | YYYY-MM-DD | OT execution date |
| expectedHours | decimal | Body | Yes | Between 0.01 and 24 | Target duration |

**Request Body Example (JSON):**
```json
{
  "taskId": 1001,
  "requestedDate": "2026-06-12",
  "expectedHours": 2.5
}
```

#### Response (Success - 201 Created)
Content-Type: `application/json`
```json
{
  "requestType": "OT",
  "requestId": 401,
  "workspaceId": 12,
  "workspaceMemberId": 99,
  "requesterName": "Nguyễn Văn A",
  "taskId": 1001,
  "taskName": "Thiết kế Database",
  "projectId": 3,
  "projectName": "Project Alpha",
  "requestedDate": "2026-06-12",
  "expectedHours": 2.5,
  "approverId": null,
  "approverName": null,
  "status": "Pending",
  "approvalNote": null,
  "reviewedAt": null,
  "createdAt": "2026-06-13T02:05:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | "RequestedDateRequired" | "Ngày yêu cầu là bắt buộc." | `requestedDate` missing | Highlight date selector |
| 400 Bad Request | "InvalidExpectedHours" | "Số giờ dự kiến (expectedHours) phải từ 0.01 đến 24." | `expectedHours` <= 0 or > 24 | Show hours invalid range alert |
| 400 Bad Request | "InvalidTaskId" | "Mã công việc (taskId) phải lớn hơn 0." | `taskId` <= 0 | Show task selector warning |
| 400 Bad Request | "RequestedDateBeforeTaskStart" | "Ngày yêu cầu không được nhỏ hơn ngày bắt đầu công việc." | OT date is before task start date | Restrict request date to task bounds |
| 400 Bad Request | "RequestedDateAfterTaskEnd" | "Ngày yêu cầu không được lớn hơn ngày kết thúc công việc." | OT date is after task end date | Restrict request date to task bounds |
| 403 Forbidden | "UnauthorizedWorkspaceMember" | "Bạn không phải là thành viên của Workspace này." | Current user not active in workspace | Show dashboard redirection |
| 404 Not Found | "TaskNotFoundInWorkspace" | "Không tìm thấy công việc trong Workspace này." | Task ID is not in current workspace | Show task not found toast |

---

### Review Request (Approve / Reject)
**Endpoint:** `PUT /api/v1/requests/{requestType}/{requestId}/approval`  
**Description:** Reviews (Approves or Rejects) a pending Leave or OT request. Only Owner or members with `Request.Approve` workspace permission. Protection: Workspace request reviewer.  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| requestType | string | Path | Yes | Allowed: `leave`, `ot` | Request category |
| requestId | integer | Path | Yes | Positive integer | Target Request ID |
| status | string | Body | Yes | Max 20 chars, Allowed: `Approved`, `Rejected` | Reviewed outcome status |
| approvalNote | string | Body | No | None | Optional approval notes |

**Request Body Example (JSON):**
```json
{
  "status": "Approved",
  "approvalNote": "Chấp thuận duyệt đơn."
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "requestType": "Leave",
  "requestId": 301,
  "status": "Approved",
  "approverId": 105,
  "approvalNote": "Chấp thuận duyệt đơn.",
  "reviewedAt": "2026-06-13T02:30:00Z"
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | None | "requestType chi nhan leave hoac ot." | requestType path is invalid | Hide or block approval actions |
| 400 Bad Request | "StatusRequired" | "Trạng thái (status) là bắt buộc." | Status body field missing | Suggest status selector input |
| 400 Bad Request | "InvalidRequestStatus" | "Trạng thái chỉ nhận Approved hoặc Rejected." | Status body value invalid | Force options in UI to Approved/Rejected |
| 403 Forbidden | "UnauthorizedRequestApproval" | "Bạn không có quyền duyệt đơn trong Workspace này." | User lacks approval permission | Hide approve/reject options |
| 404 Not Found | "LeaveRequestNotFound" | "Không tìm thấy đơn xin nghỉ phép (LeaveRequest)." | Leave request ID does not exist | Show warning toast and reload list |
| 404 Not Found | "OTRequestNotFound" | "Không tìm thấy đơn làm thêm giờ (OTRequest)." | OT request ID does not exist | Show warning toast and reload list |
| 409 Conflict | "RequestAlreadyProcessed" | "Đơn này đã được xử lý." | Request is already Approved or Rejected | Block duplicate submission and refresh requests grid |

---

## 16. AI Operations (AIController)

**Endpoint Base:** `/api/v1/ai`

---

### Analyze Project Aspect via AI
**Endpoint:** `POST /api/v1/ai/ask`  
**Description:** Sends a request to the AI generation provider to analyze project details. Currently supports three analysis types: `Risk Warning`, `Resource Suggestion`, and `Budget Forecast`. Performs monthly billing month quota checks and consumes AI query counts. Protection: Active member with `AI.Ask` permission (Owner has it by default).  
**Auth Required:** Yes (Bearer Token + `[RequireActiveAccount]`)

#### Request Parameters
| Name | Type | In (Path/Query/Body) | Required | Constraints/Validation | Description |
|---|---|---|---|---|---|
| projectId | integer | Body | Yes | Positive integer | Associated Project ID |
| analysisType | string | Body | Yes | Max 50 chars, Allowed: `Risk Warning`, `Resource Suggestion`, `Budget Forecast` | Type of AI prompt calculation |
| targetEntityId | integer | Body | No | Positive integer | Associated task ID to summarize as context |
| prompt | string | Body | No | Max 4000 chars | Custom instructions to guide AI analysis |

**Request Body Example (JSON):**
```json
{
  "projectId": 3,
  "analysisType": "Risk Warning",
  "targetEntityId": 1001,
  "prompt": "Hãy đưa ra cảnh báo rủi ro về tiến độ dự kiến."
}
```

#### Response (Success - 200 OK)
Content-Type: `application/json`
```json
{
  "logId": 2501,
  "projectId": 3,
  "analysisType": "Risk Warning",
  "content": "### Cảnh báo Rủi ro:\n\n1. Công việc tiền nhiệm (ID: 999) đang trễ tiến độ.\n2. TaskID: 1001 có thời lượng quá ngắn so với độ phức tạp cao.",
  "createdAt": "2026-06-13T02:40:00Z",
  "remainingQuota": 45
}
```

#### Error Responses & Handling
| Status Code | Error Code/Key | Localized Vietnamese Message | Trigger Condition | Recommended Client Action |
|---|---|---|---|---|
| 400 Bad Request | None | "AnalysisType chi nhan Risk Warning, Resource Suggestion hoac Budget Forecast." | Invalid `analysisType` | Show selection list error |
| 400 Bad Request | None | "targetEntityId khong ton tai hoac khong thuoc Project nay." | Invalid `targetEntityId` | Reset task selector |
| 403 Forbidden | "FEATURE_NOT_INCLUDED" | "Gói cước hiện tại chưa hỗ trợ tính năng Quản trị rủi ro AI." | Workspace lacks package entitlement for Risk AI | Show feature upgrade banner |
| 403 Forbidden | None | "Workspace da het quota hoi dap AI cua goi cuoc hien tai." | Strict limit check failed or limit <= 0 | Show limit warning screen |
| 403 Forbidden | None | "Workspace da vuot quota hoi dap AI cua thang hien tai." | Monthly query limit reached | Show limit warning screen |
| 403 Forbidden | None | "Ban khong phai thanh vien active cua workspace chua Project nay." | Access violation | Redirect to dashboard |
| 403 Forbidden | None | "Ban khong co quyen su dung AI trong workspace nay." | Workspace membership role lacks permission | Hide Ask AI options |
| 404 Not Found | None | "Khong tim thay Project." | Project ID is invalid or deleted | Return to home |
