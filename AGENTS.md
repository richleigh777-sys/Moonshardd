# Security and Data Protection Policies
- STRICT: **NO GOOGLE SIGN IN**. Do not use Google Auth provider for login or saving user data under any circumstances.
- STRICT: **NO MICROSOFT ACCOUNT SAVING**. Do not connect or save data to any Microsoft account.
- **CUSTOMER DATA PROTECTION**: The utmost priority is protecting customer data by maintaining full control over the authentication lifecycle and not leaking telemetry or access to external third-party consumer Oauth flows.
- **LEVEL 10 PRIVILEGES**: Admin Level 10 (root/sys admin) has full unrestricted access to everything in the CRM.
- **CREDENTIAL ISSUANCE**: Admin Level 10 is the sole provider of login credentials to lower-level agents and admins. Users do not self-register; they are provisioned internally.

# System Unification
- Ensure that the dashboard and workspace UI flows intuitively. All aesthetic components should share the `bg-surface-main`, `border-border-subtle`, and accent variables for unified system flow.
