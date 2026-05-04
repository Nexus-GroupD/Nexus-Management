export const ALL_PERMISSION_KEYS = [
  "people.view", "people.add", "people.edit", "people.delete",
  "pay.view", "pay.edit",
  "schedule.view", "schedule.edit", "schedule.assign_shifts",
  "availability.view", "availability.edit", "availability.override",
  "accounts.create_login", "accounts.set_password", "accounts.reset_password",
  "accounts.force_password_reset", "accounts.enable_disable",
  "messages.view", "messages.send",
  "roles.view", "roles.create", "roles.edit", "roles.delete", "roles.assign",
  "data.view_sensitive", "data.export", "data.import",
  "audit.view", "audit.edit",
  "time_off.approve",
  "departments.manage",
  "teams.view", "teams.edit",
  "all.view_all", "system.settings",
] as const;

export type Permission = (typeof ALL_PERMISSION_KEYS)[number];

/** Narrowed perm entry — key is always a Permission, not a plain string */
export type PermEntry = { key: Permission; label: string };

export const PERMISSION_GROUPS: ReadonlyArray<{
  label: string;
  perms: ReadonlyArray<PermEntry>;
}> = [
  {
    label: "People",
    perms: [
      { key: "people.view",   label: "View people" },
      { key: "people.add",    label: "Add people" },
      { key: "people.edit",   label: "Edit people" },
      { key: "people.delete", label: "Delete people" },
    ],
  },
  {
    label: "Pay",
    perms: [
      { key: "pay.view", label: "View pay" },
      { key: "pay.edit", label: "Edit pay" },
    ],
  },
  {
    label: "Schedule",
    perms: [
      { key: "schedule.view",          label: "View schedule" },
      { key: "schedule.edit",          label: "Edit schedule" },
      { key: "schedule.assign_shifts", label: "Assign shifts" },
    ],
  },
  {
    label: "Availability",
    perms: [
      { key: "availability.view",     label: "View availability" },
      { key: "availability.edit",     label: "Edit availability" },
      { key: "availability.override", label: "Override availability" },
    ],
  },
  {
    label: "Accounts",
    perms: [
      { key: "accounts.create_login",         label: "Create login" },
      { key: "accounts.set_password",         label: "Set password" },
      { key: "accounts.reset_password",       label: "Reset password" },
      { key: "accounts.force_password_reset", label: "Force password reset" },
      { key: "accounts.enable_disable",       label: "Enable / disable accounts" },
    ],
  },
  {
    label: "Messages",
    perms: [
      { key: "messages.view", label: "View messages" },
      { key: "messages.send", label: "Send messages" },
    ],
  },
  {
    label: "Roles",
    perms: [
      { key: "roles.view",   label: "View roles" },
      { key: "roles.create", label: "Create roles" },
      { key: "roles.edit",   label: "Edit roles" },
      { key: "roles.delete", label: "Delete roles" },
      { key: "roles.assign", label: "Assign roles" },
    ],
  },
  {
    label: "Data",
    perms: [
      { key: "data.view_sensitive", label: "View sensitive data" },
      { key: "data.export",         label: "Export data" },
      { key: "data.import",         label: "Import data" },
    ],
  },
  {
    label: "Audit",
    perms: [
      { key: "audit.view", label: "View audit logs" },
      { key: "audit.edit", label: "Edit audit logs" },
    ],
  },
  {
    label: "Time Off",
    perms: [
      { key: "time_off.approve", label: "Approve time off" },
    ],
  },
  {
    label: "Departments",
    perms: [
      { key: "departments.manage", label: "Manage departments" },
    ],
  },
  {
    label: "Teams",
    perms: [
      { key: "teams.view", label: "View team data" },
      { key: "teams.edit", label: "Edit team data" },
    ],
  },
  {
    label: "System",
    perms: [
      { key: "all.view_all",    label: "View all data" },
      { key: "system.settings", label: "System settings access" },
    ],
  },
];

/** Flat array of all valid permission strings */
export const ALL_PERMISSIONS: Permission[] = [...ALL_PERMISSION_KEYS];

// Default permission sets for the three built-in roles
export const MANAGER_PERMISSIONS: Permission[] = [...ALL_PERMISSIONS];

export const TEAM_LEAD_PERMISSIONS: Permission[] = [
  "people.view", "people.add", "people.edit",
  "pay.view",
  "schedule.view", "schedule.edit", "schedule.assign_shifts",
  "availability.view", "availability.edit", "availability.override",
  "accounts.create_login", "accounts.set_password",
  "messages.view", "messages.send",
  "roles.view",
  "teams.view", "teams.edit",
  "time_off.approve",
];

export const EMPLOYEE_PERMISSIONS: Permission[] = [
  "people.view",
  "schedule.view",
  "availability.view",
  "messages.view",
];
