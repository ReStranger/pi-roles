# session-identity Specification

## Purpose
Define how pi-roles surfaces the active role's identity, and what it deliberately leaves alone.

## Requirements

### Requirement: pi-roles does not modify the session name

pi-roles SHALL NOT call `pi.setSessionName()`. Session names are owned by Pi and the user — they identify sessions in the session selector and `/resume` listings — and SHALL remain untouched on startup, resume, reload, and mid-session role swaps alike.

#### Scenario: Startup does not rename the session
- **WHEN** a session starts with role `architect`
- **THEN** `pi.setSessionName` is not called

#### Scenario: Resume does not rename the session
- **WHEN** a session is resumed and the persisted active role is restored
- **THEN** `pi.setSessionName` is not called

#### Scenario: Mid-session role swap does not rename the session
- **WHEN** the active role is `architect` and the user runs `/role planner`
- **THEN** `pi.setSessionName` is not called

---

### Requirement: Footer status shows the active role name

The role indicator SHALL be surfaced via `ctx.ui.setStatus(STATUS_KEY, roleName)` and nowhere else.

#### Scenario: Footer status at startup
- **WHEN** a session starts with role `architect`
- **THEN** `ctx.ui.setStatus` is called with `"architect"`

#### Scenario: Mid-session role swap updates the footer
- **WHEN** the active role is `architect` and the user runs `/role planner`
- **THEN** `ctx.ui.setStatus` is called with `"planner"`

---

### Requirement: Helpers return role name

The exported function `composeFooterStatus(roleName: string): string` SHALL return the role name directly.

#### Scenario: composeFooterStatus
- **WHEN** `composeFooterStatus("architect")` is called
- **THEN** it returns `"architect"`

---

### Requirement: Intercom targeting uses the existing session name

The intercom prompt addendum SHALL read the current session name via `pi.getSessionName()` and reflect whatever name Pi assigned. Reading the name SHALL NOT cause `pi.setSessionName()` to be called.

#### Scenario: Addendum embeds the Pi-assigned name
- **WHEN** the intercom mode is not `off` and `pi.getSessionName()` returns `"fix login bug"`
- **THEN** the addendum embeds `"fix login bug"`

#### Scenario: Missing session name falls back safely
- **WHEN** the intercom mode is not `off` and `pi.getSessionName()` returns `undefined` or an empty string
- **THEN** the addendum embeds `"(unnamed session)"`
- **THEN** `pi.setSessionName` is not called
