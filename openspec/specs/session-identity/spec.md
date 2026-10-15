# session-identity Specification

## Purpose
Define the canonical session identity and footer status string across pi-roles.

## Requirements
### Requirement: Canonical session identity format

The session identity string — used for the title bar (via `pi.setSessionName`), the footer status bar (via `ctx.ui.setStatus`), and intercom targeting (via `pi.getSessionName`) — SHALL be the active role's `name` field (`roleName`).

#### Scenario: Session identity at startup
- **WHEN** a session starts with role `architect`
- **THEN** `ctx.ui.setStatus` is called with `"architect"`
- **THEN** `pi.setSessionName` is called with `"architect"`

#### Scenario: Mid-session role swap updates identity
- **WHEN** the active role is `architect` and the user runs `/role planner`
- **THEN** `pi.setSessionName` is called with `"planner"`
- **THEN** `ctx.ui.setStatus` is called with `"planner"`

---

### Requirement: Helpers return role name

The exported functions `composeSessionName(roleName: string): string` and `composeFooterStatus(roleName: string): string` SHALL return the role name directly.

#### Scenario: composeSessionName
- **WHEN** `composeSessionName("architect")` is called
- **THEN** it returns `"architect"`

#### Scenario: composeFooterStatus
- **WHEN** `composeFooterStatus("architect")` is called
- **THEN** it returns `"architect"`
