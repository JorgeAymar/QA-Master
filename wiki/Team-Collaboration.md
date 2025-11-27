# Team Collaboration

Learn how to collaborate with your team using QA Master's sharing and permission features.

## User Roles

QA Master has two levels of roles: **System Roles** and **Project Roles**.

### System Roles

#### ADMIN
- Full system access
- Can access admin panel
- Can manage all projects
- Can invite users
- First registered user becomes ADMIN automatically

#### USER (Default)
- Can create own projects
- Can be added to other projects
- Access based on project membership

### Project Roles

Each project member has one of these roles:

#### OWNER 👑
- Full project control
- Can delete the project
- Can add/remove members
- Can change member roles
- Can edit all project settings
- **Cannot be removed** from the project

#### FULL (Editor) ✏️
- Can create and edit user stories
- Can create and edit features
- Can run QA tests
- Can view test reports
- Cannot manage project members
- Cannot delete the project

#### READ (Viewer) 👁️
- Can view project details
- Can view user stories and features
- Can view test results and reports
- Cannot edit anything
- Cannot run tests

## Sharing Projects

### How to Share a Project

1. **Navigate to your project**
2. **Click the "Share" button** (top-right corner)
3. **Enter collaborator's email address**
4. **Select their role**:
   - Viewer (read-only)
   - Editor (can edit and test)
5. **Click "Add Member"**

> 📧 **Note**: The user must already have an account. If they don't, they need to sign up first.

### Managing Project Members

#### View Current Members

In the Share modal, you'll see:
- Member name and email
- Current role (Owner/Editor/Viewer)
- Remove button (for non-owners)

#### Change Member Role

Currently, to change a member's role:
1. Remove the member
2. Add them again with the new role

> 💡 **Tip**: This will be improved in future versions to allow direct role changes.

#### Remove a Member

1. Open the **Share** modal
2. Find the member you want to remove
3. Click the **trash icon** 🗑️
4. Confirm the removal

> ⚠️ **Important**: The project owner cannot be removed. Transfer ownership first if needed.

## Collaboration Workflows

### Workflow 1: QA Team

**Setup:**
- Project Manager: OWNER
- QA Engineers: FULL (Editor)
- Stakeholders: READ (Viewer)

**Process:**
1. PM creates project and user stories
2. QA Engineers run tests and update stories
3. Stakeholders review results

### Workflow 2: Development Team

**Setup:**
- Tech Lead: OWNER
- Developers: FULL (Editor)
- Product Owner: READ (Viewer)

**Process:**
1. Tech Lead sets up project structure
2. Developers create and test user stories
3. Product Owner reviews progress

### Workflow 3: Client Projects

**Setup:**
- Agency: OWNER
- Client: READ (Viewer)
- Team Members: FULL (Editor)

**Process:**
1. Agency manages project
2. Team executes tests
3. Client monitors progress

## Best Practices

### Project Organization

✅ **DO:**
- Create separate projects for different applications
- Use features to group related user stories
- Keep acceptance criteria clear and testable
- Document test results

❌ **DON'T:**
- Mix unrelated projects
- Create too many small features
- Leave stories without acceptance criteria
- Ignore failed tests

### Team Communication

- **Use story descriptions** for context
- **Link to documentation** in story URLs
- **Review test logs** together
- **Update stories** after fixes

### Permission Management

- **Start restrictive**: Give READ access first
- **Promote as needed**: Upgrade to FULL when trust is established
- **Regular audits**: Review member list periodically
- **Remove promptly**: Remove members who leave the team

## Activity Tracking

QA Master tracks:
- Who created each story
- Who last modified each story
- When tests were run
- Who ran the tests

This information is visible in:
- Story cards (last modified by)
- Test history (executed by)
- Activity logs (coming soon)

## Multi-Language Teams

Team members can set their own language preference:

1. Click **profile menu**
2. Select **Profile**
3. Choose preferred language

Each user sees the interface in their selected language, making it easier for international teams.

## Notifications (Future Feature)

Planned notification features:
- Email alerts for test failures
- Mentions in story comments
- Project updates
- Member additions/removals

## FAQs

### Can I transfer project ownership?

Currently, ownership transfer is not available through the UI. Contact your system administrator for database-level changes.

### How many members can I add to a project?

There's no hard limit, but consider:
- Performance with 50+ members
- Practical collaboration limits
- Your team's actual size

### Can members see other projects?

No. Members can only see projects they've been explicitly added to.

### What happens when I remove a member?

- They immediately lose access to the project
- Their previous contributions remain
- Test history is preserved
- They can be re-added later

### Can viewers run tests?

No. Only OWNER and FULL (Editor) roles can execute tests.

### How do I invite someone who doesn't have an account?

They need to sign up first at your QA Master instance. Share the signup link with them.

---

*For more information, see [Project Management](Project-Management) or [Getting Started](Getting-Started).*
