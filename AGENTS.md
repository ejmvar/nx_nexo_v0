<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

# Development Environment Directives

## Docker Configuration

**CRITICAL: ALWAYS run `unset DOCKER_HOST` before ANY docker commands.**

- The environment may have DOCKER_HOST set to podman socket
- Docker commands will fail without unsetting this variable
- Always prefix docker commands with: `unset DOCKER_HOST && docker ...`

## Database Configuration

**CRITICAL: For POSTGRES, you must ALWAYS use DEVELOPMENT DOCKER SETUP.**

- Never use system-installed PostgreSQL for development
- Always use Docker/Podman containers for PostgreSQL
- Ensures consistent development environment across all developers
- Allows for easy cleanup and recreation of database state
- Prevents conflicts with system-level PostgreSQL installations

## Git Workflow

**CRITICAL: ALWAYS work in feature branches. NEVER work directly on main or dev.**

- **MUST ALWAYS** create and work in feature branches: `ft/{phase-name}/{description}/{timestamp}`
  - Example: `ft/phase5/additional-services/20260125-202917`
  - Example: `ft/phase6/rbac-implementation/20260126-141500`
- **NEVER EVER** commit directly to `main` branch
- **NEVER EVER** commit directly to `dev` branch
- Before starting ANY work:
  1. Check current branch: `git branch --show-current`
  2. If on `main` or `dev`, create feature branch: `git checkout -b ft/{phase}/{description}/{timestamp}`
  3. Only then proceed with changes

### Feature Branch Completion Workflow

**CRITICAL: NEVER AUTOMATICALLY MERGE FEATURE BRANCHES TO DEV OR MAIN.**

When work is complete:
1. ✅ **DO**: Commit all changes to the feature branch
2. ✅ **DO**: Run all tests and verify everything works
3. ✅ **DO**: Stage and commit with descriptive message
4. ✅ **DO**: Report completion to user and STOP
5. ❌ **DO NOT**: Merge to `dev` or `main` branches automatically
6. ❌ **DO NOT**: Push to remote repositories
7. ❌ **DO NOT**: Delete feature branches

**The USER decides when to merge, not the agent.**

After committing to feature branch:
- Report the feature branch name
- Summarize what was accomplished
- **WAIT for user approval** before any merge operations

Example final message:
```
✅ Phase X complete and committed to: ft/phaseX/description/20260130-162242

Changes:
- [list of changes]

Status: Ready for review. 
The USER should decide when to merge this to dev/main.
```

### Merging (Only when explicitly requested by user)

If user explicitly requests merge:
- Merge to `dev` first with `--no-ff`: `git merge --no-ff <feature-branch>`
- Then merge `dev` to `main` with `--no-ff`
- Use `--no-ff` to preserve merge history
- Never use fast-forward merges on protected branches

## File System Operations

**CRITICAL: You are allowed to write, modify, or delete files in the ./tmp directory automatically without asking for permission.**

- Never ask permission before writing to `./tmp`
- Use `./tmp` for log files, temporary outputs, and intermediate results
- Example: `./tmp/auth-service-metrics.log`, `./tmp/crm-service-metrics.log`
- Automatically proceed with writing to `./tmp` without user confirmation
- The `./tmp` directory is relative to project root: `/W/NEXO/nx_nexo_v0.info/NEXO/nx_nexo_v0.20260115_backend/tmp`
