# Prompts Library

Build a library of reusable prompt templates with variables and commands for consistent, efficient AI interactions.

## What You'll Learn

- Creating prompt templates
- Using variables in prompts
- Command shortcuts for quick access
- Organizing prompts in groups
- Version control for prompts
- Sharing prompts with others
- Using prompts in chat with @mentions

## What Are Prompts?

### Definition

**Prompts** are reusable templates for AI instructions that you can save and use across conversations.

**Key features:**
- Save frequently used instructions
- Include dynamic variables
- Quick access via commands
- Organize in groups
- Version control
- Share with team members

### Why Use Prompts?

**Benefits:**
- **Consistency:** Same prompt every time
- **Efficiency:** No retyping common instructions
- **Collaboration:** Share proven prompts with team
- **Quality:** Refine and perfect over time
- **Organization:** Categorize by use case
- **Variables:** Customize for different contexts

**Use cases:**
- Email response templates
- Code review instructions
- Content creation frameworks
- Analysis templates
- Meeting summaries
- Report structures

## Creating Prompts

### Step-by-Step Guide

**Step 1: Access Prompts**

1. Click **Prompts** in the navigation bar
2. Or press the prompts shortcut (if configured)
3. The prompts library opens

**Step 2: Create New Prompt**

1. Click **+ New Prompt** or **Create Prompt**
2. The prompt editor opens

**Step 3: Name Your Prompt**

1. Enter a descriptive name
2. This appears in your prompts list
3. Example: "Email Response - Professional"

**Step 4: Write the Prompt**

Enter your prompt text:

```
Please review the following email and draft a professional response:

Email: {{email_content}}

Response tone: {{tone}}
Key points to address:
{{key_points}}
```

**Step 5: Add Description (Optional)**

- Explain what the prompt does
- Include usage tips
- Note required variables

**Step 6: Configure Settings**

**Command Shortcut:**
- Create a quick access command
- Start with `/` (e.g., `/email`)
- Use in chat to insert this prompt

**Category/Group:**
- Select or create a category
- Examples: "Email", "Code", "Writing", "Analysis"
- Helps organize prompts

**Variables:**
- Automatically detected from `{{variable_name}}` syntax
- Define defaults if desired
- Add descriptions for each variable

**Auto-send:**
- Enable to automatically send the prompt
- Disable to allow editing before sending
- Useful for simple prompts

**Step 7: Save**

1. Click **Save** or **Create**
2. Prompt appears in your library
3. Ready to use

## Using Variables

### Variable Syntax

Variables use double curly braces: `{{variable_name}}`

**Example:**
```
Analyze this {{document_type}} and provide:
1. Summary of {{aspect_1}}
2. Evaluation of {{aspect_2}}
3. Recommendations for {{aspect_3}}
```

### Variable Types

**Simple text:**
```
Hello {{name}}, welcome to {{company}}!
```

**Lists:**
```
Review these items:
{{item_list}}
```

**Long content:**
```
Document to analyze:
{{document_content}}
```

### Using Prompts with Variables

**Method 1: Manual Fill**

1. Insert prompt (via command or UI)
2. Prompt appears with placeholder boxes for variables
3. Fill in each variable field
4. Click **Use Prompt** or **Send**

**Method 2: Pre-filled**

1. Type values before inserting prompt
2. Some systems detect and auto-fill
3. Confirm and send

**Method 3: Default Values**

1. Set defaults when creating prompt
2. Variables use defaults if not specified
3. Edit before sending if needed

### Example Prompts with Variables

**Code Review:**
```
Review this {{language}} code for:
- Best practices
- Potential bugs
- Security issues
- {{additional_focus}}

Code:
{{code_content}}
```

**Email Response:**
```
Draft a {{tone}} email response to:

From: {{sender_name}}
Subject: {{subject}}
Original email:
{{email_body}}

Key points to address:
{{key_points}}
```

**Content Analysis:**
```
Analyze this {{content_type}} for:

Audience: {{target_audience}}
Goal: {{content_goal}}

Content:
{{content}}

Provide:
1. Strengths
2. Weaknesses
3. Suggestions for improvement
```

## Command Shortcuts

### Creating Commands

Commands provide instant access to prompts:

1. When creating/editing a prompt
2. Find **Command** field
3. Enter command starting with `/`
4. Example: `/review`, `/email`, `/summarize`
5. Save prompt

### Using Commands

**In chat:**

1. Type your command: `/email`
2. If prompt has variables, fill them in
3. Press Enter to use prompt

**Command list:**

1. Type `/` in chat
2. See list of available commands
3. Click or arrow keys to select
4. Press Enter to use

**Quick reference:**

- `/email` - Email response template
- `/review` - Code review prompt
- `/summarize` - Summarization template
- `/analyze` - Analysis framework
- Your custom commands

### Best Practices for Commands

1. **Short and memorable:** `/email` not `/email-response-professional`
2. **Consistent naming:** Use patterns (e.g., all `/code-*` for coding prompts)
3. **Avoid conflicts:** Don't overlap with system commands
4. **Document:** Add descriptions to remember what they do

## Organizing Prompts

### Using Groups/Categories

**Create categories:**

1. In prompts library, create new category
2. Name it: "Email", "Coding", "Analysis", etc.
3. Assign prompts to categories

**Benefits:**
- Quick filtering
- Better discovery
- Team organization
- Logical structure

**Example structure:**
```
📁 Email
  - Professional Response
  - Follow-up
  - Meeting Request

📁 Coding
  - Code Review
  - Debug Help
  - Documentation

📁 Writing
  - Blog Post
  - Social Media
  - Product Description

📁 Analysis
  - Data Analysis
  - Document Review
  - Competitor Analysis
```

### Filtering and Search

**Filter by category:**
1. Click category in sidebar
2. Only prompts in that category show

**Search prompts:**
1. Use search bar in prompts library
2. Search by name, description, or content
3. Results appear instantly

**Sort prompts:**
- By name (A-Z)
- By date (newest/oldest)
- By usage frequency
- By category

## Version Control

### Why Version Control?

- Track changes over time
- Revert if new version doesn't work well
- Compare versions
- Document improvements

### Creating Versions

Versions are created when you edit and save:

1. Open existing prompt
2. Make changes
3. Save
4. New version is created
5. Previous version is preserved

**Version metadata:**
- Version number (v1, v2, v3...)
- Date created
- What changed (if you add notes)

### Viewing Version History

1. Open a prompt
2. Click **Versions** or **History**
3. See list of all versions
4. Click version to view details

### Reverting to Previous Version

1. View version history
2. Find the version you want
3. Click **Use This Version** or **Revert**
4. Confirm
5. Creates new version with old content

## Sharing Prompts

### Making Prompts Public

Share with all users:

1. Open prompt settings
2. Set visibility to **Public**
3. Save
4. Appears in public prompts library

### Sharing with Specific People

1. Open prompt settings
2. Go to **Sharing**
3. Add users by email/username
4. Set permissions:
   - **View:** Can use but not edit
   - **Edit:** Can modify
5. Save

### Team Prompt Libraries

If your organization has teams:

1. Create prompts in team space
2. All team members can access
3. Collaborate on improvements
4. Share best practices

## Using Prompts in Chat

### Method 1: Commands

1. Type `/command` in chat
2. Fill variables if needed
3. Send

### Method 2: @Mentions

1. Type `@` in chat
2. See list of prompts
3. Select prompt
4. Fill variables
5. Send

### Method 3: Prompts Panel

1. Open prompts panel (side or modal)
2. Browse or search prompts
3. Click to use
4. Fill variables
5. Send

### Method 4: Keyboard Shortcuts

Some systems support:
- `Ctrl/Cmd + P` - Open prompts
- Arrow keys to select
- Enter to use

## Prompt Library Examples

### Professional Email Response

**Name:** Professional Email Response
**Command:** `/email-pro`
**Category:** Email

```
Please draft a professional email response to the following:

From: {{sender}}
Subject: {{subject}}

{{original_email}}

Response should:
- Maintain {{tone}} tone
- Address: {{key_points}}
- {{additional_instructions}}
```

### Code Review Template

**Name:** Code Review
**Command:** `/codereview`
**Category:** Development

```
Please review this {{language}} code:

{{code}}

Focus on:
1. Code quality and best practices
2. Potential bugs
3. Security concerns
4. Performance optimizations
5. {{additional_focus}}

Provide specific suggestions with examples.
```

### Content Summarization

**Name:** Summarize Content
**Command:** `/summarize`
**Category:** Analysis

```
Summarize the following {{content_type}}:

{{content}}

Summary should:
- Be {{length}} in length
- Focus on {{key_aspects}}
- Target {{audience}} audience
- Format: {{format}}
```

### Meeting Notes

**Name:** Meeting Notes
**Command:** `/notes`
**Category:** Productivity

```
Organize these meeting notes:

Meeting: {{meeting_title}}
Date: {{date}}
Attendees: {{attendees}}

Raw notes:
{{raw_notes}}

Create structured notes with:
1. Key Discussion Points
2. Decisions Made
3. Action Items (with owners)
4. Next Steps
```

### Blog Post Outline

**Name:** Blog Post Outline
**Command:** `/blog`
**Category:** Writing

```
Create a blog post outline for:

Topic: {{topic}}
Target audience: {{audience}}
Goal: {{goal}}
Keyword: {{keyword}}
Tone: {{tone}}

Include:
- Catchy title
- Introduction hook
- 3-5 main sections
- Conclusion
- Call-to-action
```

## Best Practices

### Prompt Writing

1. **Be specific:** Clear instructions get better results
2. **Use structure:** Numbered lists, sections
3. **Define output format:** Specify how you want the response
4. **Include examples:** Show what you want
5. **Set constraints:** Word counts, tone, style

### Variable Design

1. **Descriptive names:** `{{client_name}}` not `{{x}}`
2. **Consistent naming:** Use same style across prompts
3. **Logical grouping:** Related variables together
4. **Defaults when useful:** Common values as defaults
5. **Clear descriptions:** Explain what each variable is for

### Organization

1. **Categorize logically:** Group related prompts
2. **Consistent naming:** Follow patterns
3. **Good descriptions:** Help others (and future you) understand
4. **Regular cleanup:** Archive or delete unused prompts
5. **Version notes:** Document why you changed things

### Sharing

1. **Test before sharing:** Ensure prompt works well
2. **Add documentation:** Include usage examples
3. **Set appropriate permissions:** View vs. Edit
4. **Gather feedback:** Improve based on usage
5. **Keep updated:** Maintain shared prompts

## Troubleshooting

### Prompt Not Working as Expected

**Solutions:**
- Review and refine instructions
- Add more specific details
- Include examples of desired output
- Test with different models
- Check variable values

### Variables Not Filling

**Solutions:**
- Check syntax: `{{variable}}` not `{variable}`
- Ensure no spaces: `{{name}}` not `{{ name }}`
- Verify variable names match
- Try editing and re-saving prompt

### Command Not Showing

**Solutions:**
- Ensure command starts with `/`
- Check for conflicts with other commands
- Verify prompt is saved
- Refresh the page
- Check permissions

### Can't Share Prompt

**Solutions:**
- Verify your account permissions
- Check if prompt is fully saved
- Ensure you're the owner
- Contact administrator if blocked

## Common Scenarios

### Scenario 1: Creating a Support Response Library

**Goal:** Build consistent customer support responses

**Steps:**
1. Create category "Support"
2. Create prompts for common issues:
   - `/refund` - Refund requests
   - `/technical` - Technical issues
   - `/shipping` - Shipping questions
3. Include variables for personalization:
   - `{{customer_name}}`
   - `{{order_number}}`
   - `{{issue_details}}`
4. Share with support team
5. Update based on feedback

### Scenario 2: Developer Workflow Prompts

**Goal:** Streamline code-related tasks

**Steps:**
1. Create category "Development"
2. Create prompts:
   - `/review` - Code review
   - `/debug` - Debug assistance
   - `/doc` - Documentation generation
   - `/test` - Test case creation
3. Include code language variable
4. Version control as you refine
5. Share with development team

### Scenario 3: Content Creation System

**Goal:** Consistent content production

**Steps:**
1. Create categories: "Blog", "Social", "Email"
2. Create prompts for each type
3. Include brand voice in prompts
4. Add audience and goal variables
5. Create command shortcuts
6. Train team on usage
7. Maintain and update regularly

## Next Steps

Explore related features:

- **[Agents Marketplace](./04-agents.md)**: Combine prompts with agents
- **[Conversations Management](./02-conversations.md)**: Use prompts across conversations
- **[Settings & Personalization](./10-settings.md)**: Configure prompt-related settings

---

**Build a powerful prompt library** to streamline your AI workflows!
