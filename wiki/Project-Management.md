# Project Management

Projects are the main container in QA Master. Each project represents a web application you want to test.

## Create a Project

1. **Navigate to Dashboard**
   - Click on "Projects" in the sidebar
   - Click on "New Project"

2. **Complete the Form**
   - **Name**: Descriptive name of your project
   - **Base URL**: URL of your application (e.g., `https://my-app.com`)
   - **Description** (optional): Brief description of the project

3. **Save**
   - Click on "Create Project"

## Project Structure

```
Project
├── Features
│   ├── Feature 1
│   │   ├── Story 1
│   │   ├── Story 2
│   │   └── Story 3
│   └── Feature 2
│       ├── Story 4
│       └── Story 5
└── Uncategorized
    └── Stories without assigned feature
```

## Features

Features allow you to organize related stories.

### Create a Feature

1. In the project view, use the sidebar form
2. Enter the feature name
3. Click on "Add Feature"

### Reorder Features

- Use the **grip** icon (⋮⋮) to the left of the name
- Drag up or down
- Order is saved automatically

### Rename Feature

- Click the **pencil** icon next to the name
- Edit the name
- Press Enter or click ✓

### Delete Feature

- Click the **trash** icon
- Confirm deletion
- **Note**: Stories inside will move to "Uncategorized"

## Edit Project

1. In the project view, click the pencil icon next to the name
2. Modify necessary fields
3. Click on "Update Project"

## Delete Project

⚠️ **Warning**: This action is irreversible

1. Go to the project list
2. Click the trash icon on the project
3. Confirm deletion
4. All features, stories, and test results will be deleted

## Best Practices

### Naming Projects

✅ **Good**:
- "E-commerce Frontend"
- "Payments API v2"
- "Admin Dashboard"

❌ **Avoid**:
- "Project 1"
- "Test"
- "My App"

### Organizing with Features

Group stories by:
- **Module**: Login, Registration, Checkout
- **Epic**: User Management, Reports
- **Sprint**: Sprint 1, Sprint 2

### Base URL

- Use production or staging URL
- Ensure it is accessible
- Include the protocol (`https://`)

## Next Steps

- [User Stories](User-Stories)
- [Running Tests](Running-Tests)
