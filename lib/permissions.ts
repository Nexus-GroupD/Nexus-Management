export type Permission = typeof ALL_PERMISSIONS[number];

export const PERMISSION_GROUPS = [
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
    label: "Emails",
    perms: [
      { key: "emails.view", label: "View emails" },
      { key: "emails.edit", label: "Edit emails" },
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
] as const;

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) =>
  g.perms.map((p) => p.key)
) as Permission[];

// Default permission sets for the three built-in roles
export const MANAGER_PERMISSIONS: string[] = [...ALL_PERMISSIONS];

export const TEAM_LEAD_PERMISSIONS: string[] = [
  "people.view", "people.add", "people.edit",
  "pay.view",
  "schedule.view", "schedule.edit", "schedule.assign_shifts",
  "availability.view", "availability.edit", "availability.override",
  "accounts.create_login", "accounts.set_password",
  "emails.view",
  "roles.view",
  "teams.view", "teams.edit",
  "time_off.approve",
];

export const EMPLOYEE_PERMISSIONS: string[] = [
  "people.view",
  "schedule.view",
  "availability.view",
  "emails.view",
];
