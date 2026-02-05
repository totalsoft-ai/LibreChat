# Prompts Library

Build a library of reusable prompt templates with variables and commands for consistent, efficient AI interactions.

## What Are Prompts?

**Prompts** are reusable templates for AI instructions that you can save and use across conversations.

**Key Features:**
- Save frequently used instructions
- Include dynamic variables
- Quick access via commands
- Organize in groups
- Version control
- Share with team members

**Benefits:** Consistency, efficiency, collaboration, quality refinement, organization, customization with variables

**Use Cases:** Email response templates, code review instructions, content creation frameworks, analysis templates, meeting summaries, report structures

## Creating Prompts

**Create a Prompt:**

1. **Access Prompts:**
   Click **Prompts** in navigation bar or use shortcut → Prompts library opens

2. **Create New:**
   Click **+ New Prompt** → Prompt editor opens

3. **Name Your Prompt:**
   Enter descriptive name (e.g., "Email Response - Professional")

4. **Write the Prompt:**
   Enter prompt text with variables using `{{variable_name}}` syntax

Example:
```
Please review the following email and draft a professional response:

Email: {{email_content}}

Response tone: {{tone}}
Key points to address: {{key_points}}
```

5. **Add Description (Optional):**
   Explain what prompt does, include usage tips, note required variables

6. **Configure Settings:**
   - **Command Shortcut**: Create quick access command starting with `/` (e.g., `/email`)
   - **Category/Group**: Select or create category (Email, Code, Writing, Analysis)
   - **Variables**: Automatically detected from `{{variable_name}}`, define defaults/descriptions
   - **Auto-send**: Enable to auto-send, disable to allow editing

7. **Save:**
   Click **Save** or **Create** → Prompt appears in library

## Using Variables

**Variable Syntax:**
Use double curly braces: `{{variable_name}}`

Example:
```
Analyze this {{document_type}} and provide:
1. Summary of {{aspect_1}}
2. Evaluation of {{aspect_2}}
3. Recommendations for {{aspect_3}}
```

**Using Prompts with Variables:**
- **Manual Fill**: Insert prompt → Fill variable fields → Click Use Prompt or Send
- **Pre-filled**: Type values before inserting, system may auto-fill
- **Default Values**: Set defaults when creating prompt, edit before sending if needed

**Example Prompts:**

**Code Review:**
```
Review this {{language}} code for:
- Best practices
- Potential bugs
- Security issues
- {{additional_focus}}

Code: {{code_content}}
```

**Email Response:**
```
Draft a {{tone}} email response to:
From: {{sender_name}}
Subject: {{subject}}
Original email: {{email_body}}
Key points to address: {{key_points}}
```

## Using Prompts in Chat

**Method 1: Command Shortcuts**
- Type `/` in chat
- List of available commands appears
- Type command name (e.g., `/email`)
- Prompt inserts with variable fields
- Fill variables → Send

**Method 2: Prompts Button**
- Click **Prompts** button in chat
- Browse prompts library
- Click prompt to insert
- Fill variables → Send


**View History:**
Open prompt → **Version History** → See all versions with dates and changes

**Create New Version:**
Edit prompt → Make changes → Save → New version created automatically

**Revert to Previous:**
Version History → Find version → **Revert** → Confirm

Best practice: Add description of changes when saving.

## Sharing Prompts

**Share with Team:**
Open prompt → **Share** → Add users (email, username, groups) → Set permissions (View/Use, Edit, Admin) → Save

**Make Public:**
Open prompt → **Sharing** → Select **Public** → Save

Prompt now available to all users in organization.

**Share via Link:**
Open prompt → **Generate Link** → Set permissions and expiration → Copy link → Share

**Permission Levels:**
- **View/Use**: Can use the prompt
- **Edit**: Can modify the prompt
- **Admin**: Can manage sharing and delete

## Managing Prompts

**Edit Prompts:**
Find prompt → Click to open → Edit → Save

**Duplicate Prompts:**
Find prompt → **Duplicate** → Modify copy as needed

**Delete Prompts:**
Find prompt → **Delete** → Confirm (permanent action)

**Search Prompts:**
Use search bar in prompts library → Type keywords → Results filter instantly

**Filter Prompts:**
Use category/group filters → Select category → View prompts in that category only

## Best Practices

**Creating Effective Prompts:**
- Be specific and clear
- Use descriptive names
- Include usage instructions in description
- Test prompts before sharing
- Use variables for flexibility
- Organize with appropriate categories

**Variable Design:**
- Use clear variable names ({{user_name}} not {{x}})
- Provide default values when appropriate
- Add descriptions for complex variables
- Limit number of variables for simplicity


**Naming Conventions:**
Good: "Email Response - Customer Support", "Code Review - Python"
Avoid: "Prompt1", "Test", "My Prompt"

## Troubleshooting

**Prompt Not Appearing:**
Check category filter, search for prompt name, ensure not deleted, refresh prompts library

**Variables Not Working:**
Check syntax (must be `{{variable_name}}`), ensure no spaces in variable names, verify variables defined in prompt settings

**Command Not Working:**
Verify command starts with `/`, check command not already in use, ensure prompt saved with command, try different command name

**Can't Share Prompt:**
Check account permissions, verify administrator allows sharing, ensure prompt fully configured, check if you're prompt owner
