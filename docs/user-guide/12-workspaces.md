# Team Workspaces

Collaborate with your team using shared workspaces. Organize conversations, share AI agents and prompts, manage files, and track team activity—all in one collaborative environment.

## What You'll Learn

- Understanding what team workspaces are and their benefits
- Creating and managing workspaces
- Managing workspace members and permissions
- Switching between personal and workspace modes
- Sharing agents, prompts, and files with your team
- Using the workspace start page and widgets
- Pinning important resources
- Configuring workspace settings
- Tracking team activity and collaboration
- Best practices for workspace organization
- Troubleshooting common workspace issues

## What Are Team Workspaces?

### Definition

**Team Workspaces** are collaborative environments where teams can work together with AI. They provide a shared space for conversations, agents, prompts, and files, with role-based access control and activity tracking.

**Key benefits:**
- **Collaboration**: Work together with team members in shared AI conversations
- **Resource Sharing**: Share agents, prompts, and files with your workspace
- **Organization**: Keep team projects separate from personal work
- **Visibility**: Track team activity and contributions
- **Control**: Manage who can access and modify workspace resources
- **Customization**: Configure workspace settings, models, and token budgets

### Workspace vs. Personal Mode

**Personal Mode:**
- Your private conversations and resources
- Only you can access your content
- Personal agents, prompts, and files
- No sharing or collaboration

**Workspace Mode:**
- Shared team environment
- All workspace members can collaborate
- Shared resources visible to the team
- Activity tracking and contribution metrics
- Centralized settings and configuration

> **Note:** You can switch between personal and workspace modes at any time. Your personal content remains private and separate from workspace content.

### Use Cases

**Development Teams:**
- Share code review agents
- Collaborative debugging sessions
- Shared technical documentation
- Code snippet libraries

**Marketing Teams:**
- Share content creation agents
- Campaign planning conversations
- Brand voice prompts
- Marketing asset libraries

**Research Teams:**
- Share research assistants
- Literature review collaboration
- Data analysis workflows
- Shared knowledge bases

**Project Teams:**
- Project-specific agents
- Meeting notes and summaries
- Shared project files
- Task tracking prompts

## Understanding Workspace Roles

Workspaces use a role-based permission system with four levels:

### Role Hierarchy

**Owner (Highest Permissions)**
- Create and delete the workspace
- Full access to all workspace settings
- Manage all members and roles
- Configure models and token budgets
- Cannot be removed (must transfer ownership first)
- Every workspace has exactly one owner

**Admin**
- Add and remove members
- Update member roles (except owner)
- Pin and unpin resources
- Configure start page settings
- Update workspace information
- Cannot delete the workspace

**Member**
- Create conversations in workspace
- Share agents, prompts, and files
- View all workspace resources
- Participate in workspace activities
- View workspace statistics

**Viewer (Lowest Permissions)**
- View workspace resources
- Read conversations
- Cannot create or share content
- Cannot modify workspace settings
- Read-only access to workspace

> **Tip:** Assign roles based on team member responsibilities. Most team members should be "Members," with a few trusted "Admins" for management tasks.

## Creating Your First Workspace

### Step-by-Step Guide

1. **Open Workspace Settings**
   - Click your profile icon or settings in the sidebar
   - Navigate to **Settings** > **Workspaces**
   - Or look for the **Workspace Selector** in the navigation bar

2. **Create New Workspace**
   - Click the **+ Create Workspace** button
   - The workspace creation dialog opens

3. **Configure Workspace Details**
   - **Name** (required): Choose a descriptive name
     - Example: "Marketing Team," "Q4 Development," "Research Lab"
   - **Description** (optional): Brief description of the workspace purpose
     - Example: "Collaborative space for Q4 marketing campaigns"
   - **Slug** (auto-generated): URL-friendly identifier
     - Automatically created from the workspace name
     - Can be customized for easier sharing

4. **Customize Appearance** (optional)
   - **Color**: Choose a color to identify the workspace
   - **Avatar**: Upload a custom workspace icon
   - These help you quickly identify workspaces when switching

5. **Create the Workspace**
   - Click **Create** to finalize
   - You become the workspace owner automatically
   - The workspace is now active and ready to use

> **Tip:** Use descriptive names and distinct colors for each workspace to make them easy to identify at a glance.

### Workspace Naming Best Practices

**Good naming examples:**
- "Product Team 2025"
- "Customer Support Hub"
- "Data Science Lab"
- "Marketing - Q1 Campaign"

**Avoid:**
- Generic names like "Team 1" or "Workspace"
- Overly long names that get truncated
- Special characters that don't work in URLs
- Names that don't indicate the workspace purpose

## Switching Between Workspaces

### Using the Workspace Selector

The workspace selector appears in the top navigation bar:

1. **Locate the Selector**
   - Look for the workspace name or icon in the header
   - In personal mode, it shows your profile or "Personal"

2. **Open the Dropdown**
   - Click the workspace selector
   - A list of your workspaces appears

3. **Switch Workspaces**
   - Click any workspace to switch to it
   - Or select "Personal" to return to personal mode

4. **Visual Feedback**
   - The header updates to show the current workspace
   - A colored badge or indicator shows you're in a workspace
   - Conversations and resources automatically filter to the selected workspace

> **Note:** When you switch workspaces, TESSA automatically filters conversations, agents, prompts, and files to show only content from the selected workspace.

### Workspace Indicator

When working in a workspace, you'll see:
- **Workspace name** in the header with a building icon
- **Color badge** matching the workspace's chosen color
- **Different sidebar content** showing workspace resources only
- **Workspace start page** when entering the workspace (if enabled)

## Managing Workspace Members

### Adding Members

**Prerequisites:**
- You must be an Owner or Admin
- You need to know the member's email address or username

**Steps:**
1. Go to **Workspace Settings** > **Members**
2. Click **Add Member** or **Invite Member**
3. Enter the user's email address or username
4. Select the role: Viewer, Member, Admin, or Owner
5. Click **Send Invite** or **Add**
6. The user receives an invitation (if configured)
7. Once accepted, they appear in the members list

> **Tip:** Start new members as "Member" role and promote to "Admin" once they're familiar with the workspace.

### Viewing Members

**Members Tab:**
- Shows all workspace members
- Displays each member's role
- Shows when they joined
- Indicates who invited them
- Shows their last activity (if tracked)

**Information displayed:**
- Member name and email
- Profile avatar
- Current role
- Join date
- Activity status

### Updating Member Roles

Change a member's permission level:

1. Go to **Workspace Settings** > **Members**
2. Find the member in the list
3. Click the **role dropdown** next to their name
4. Select the new role
5. Confirm the change if prompted

**Role change rules:**
- Admins can change Member and Viewer roles
- Only Owner can promote someone to Admin
- Only Owner can assign Owner role (transfers ownership)
- Cannot change your own role

> **Warning:** Transferring ownership changes your role to Admin. Only transfer ownership to trusted team members.

### Removing Members

Remove a member from the workspace:

1. Go to **Workspace Settings** > **Members**
2. Find the member in the list
3. Click the **three dots** menu (⋯) next to their name
4. Select **Remove from Workspace**
5. Confirm the removal

**What happens when removed:**
- Member loses access to workspace immediately
- Cannot view workspace conversations or resources
- Personal conversations remain unaffected
- Can be re-added later if needed

**Restrictions:**
- Cannot remove the workspace owner
- Admins cannot remove other admins (only owner can)
- Cannot remove the last member with admin/owner role

### Leaving a Workspace

If you want to leave a workspace you're a member of:

1. Go to **Workspace Settings**
2. Click **Leave Workspace** (usually at the bottom)
3. Confirm you want to leave
4. You're removed from the workspace

> **Warning:** If you're the only owner, you cannot leave until you transfer ownership to another member.

## Working in a Workspace

### Creating Workspace Conversations

When you're in workspace mode, new conversations automatically belong to that workspace:

1. **Switch to the workspace** using the workspace selector
2. **Click + New Chat** as usual
3. The conversation is created in the workspace context
4. **All workspace members** can see this conversation
5. The workspace indicator appears in the chat header

### Workspace Indicator in Header

When chatting in a workspace conversation, you'll see:
- **Workspace name badge** with building icon
- **Workspace color** as visual indicator
- Shows you're not in personal mode
- Helps prevent accidental sharing of private information

### Understanding Workspace Scope

**What's shared in workspaces:**
- Conversations created while in workspace mode
- Agents shared with the workspace
- Prompts shared with the workspace
- Files uploaded to the workspace
- Activity and contribution data

**What remains private:**
- Your personal conversations
- Private agents, prompts, and files
- Resources marked as "Private" visibility
- Resources you haven't explicitly shared

> **Important:** Always check which workspace you're in before starting sensitive conversations. Use personal mode for private matters.

## Sharing Resources with Workspaces

### Understanding Visibility Levels

Resources (agents, prompts, files) have three visibility levels:

**Private (Default)**
- Only you can see and use the resource
- Not visible to workspace members
- Appears only in your personal mode
- Use for work-in-progress or personal resources

**Workspace**
- All workspace members can see and use the resource
- Appears when workspace is selected
- Ideal for team collaboration
- Most common sharing level for team resources

**Shared with Specific People** (Coming Soon)
- Share with selected individuals only
- More granular than workspace sharing
- Useful for cross-team collaboration
- Not yet available in current version

### Sharing Agents

Share your custom AI agents with the workspace:

1. **Open the agent** you want to share
   - Go to **Agents** in the sidebar
   - Click on the agent to view details

2. **Find the Share Button**
   - Located near the agent name or in the actions menu
   - Shows current visibility status

3. **Change Visibility**
   - Click the **Share** button
   - Select **Workspace** from the dropdown
   - The agent is now shared with all workspace members

4. **Confirmation**
   - A badge appears showing "Workspace" visibility
   - The agent appears in the workspace agents list
   - All members can now use this agent

> **Note:** Only the agent owner can share or unshare. Workspace members can use shared agents but cannot modify them unless they're also admins.

### Sharing Prompts

Share prompt templates with your workspace:

1. **Navigate to Prompts**
   - Click **Prompts** in the sidebar
   - Find the prompt you want to share

2. **Open Prompt Details**
   - Click on the prompt to view details
   - Look for the **Share** button

3. **Share with Workspace**
   - Click **Share** button
   - Select **Workspace** visibility
   - Confirm the sharing

4. **Result**
   - Prompt appears with a "Workspace" badge
   - Available to all workspace members
   - Members can use the prompt in their conversations

**Shared prompt benefits:**
- Consistent messaging across the team
- Reusable templates for common tasks
- Standardized workflows
- Easy onboarding for new members

### Sharing Files

Share files with workspace members:

1. **Upload or locate the file**
   - Go to the **Files** section or Workspace Files Widget
   - Upload a new file using the Upload button
   - Or find an existing file

2. **Open file options**
   - Click the file to view details
   - Look for sharing options

3. **Share with workspace**
   - Click **Share** or visibility settings
   - Select **Workspace**
   - The file becomes accessible to all members

**Shared file use cases:**
- Reference documents for the team
- Templates and examples
- Data files for analysis
- Brand assets and resources
- Knowledge base for RAG in conversations

**Important:** Files uploaded directly through the Workspace Files Widget are automatically shared with the workspace and available for RAG (Retrieval-Augmented Generation) in all workspace conversations.

### Using the Share Button

The Share button provides quick access to visibility settings:

**Button appearance:**
- Shows an icon (usually a share or lock icon)
- Displays current visibility status
- Available on agents, prompts, and files

**Dropdown options:**
1. **Private**: Only you can access
2. **Workspace**: All workspace members can access
3. **Shared with**: Specific people (coming soon)

**Visual feedback:**
- Button color changes based on visibility
- Badge appears showing current status
- Confirmation message after changes

### Shared Badges

Shared badges help you quickly identify resource visibility:

**Badge types:**
- **Gray "Private" badge**: Only you can see this
- **Blue "Workspace" badge**: Shared with workspace
- **Purple badge** (future): Shared with specific people

**Where badges appear:**
- Agent cards in marketplace
- Prompt library listings
- File manager entries
- Resource detail pages

> **Tip:** Use shared badges to quickly verify what's shared and what's private before making changes.

## Workspace Start Page

When you enter a workspace, you may see a customizable start page with helpful information and widgets.

### What is the Start Page?

The start page is an information dashboard that appears when you:
- Switch to a workspace
- Open TESSA with a workspace selected
- Click on the workspace in your list

**Purpose:**
- Welcome new members
- Show workspace guidelines
- Display important statistics
- Highlight pinned resources
- Show team activity
- Provide quick links

> **Note:** Workspace admins can enable or disable the start page, and customize its content. You can also choose "Don't show again" to skip directly to conversations.

### Start Page Widgets

The start page can display several interactive widgets:

#### Quick Stats Widget

Shows key workspace metrics at a glance:

**Displayed statistics:**
- **Conversations**: Total workspace conversations
- **Messages**: Total messages sent
- **Agents**: Number of agents (shared and personal)
- **Prompts**: Number of available prompts
- **Files**: Number of workspace files
- **Members**: Total workspace members

**Why it's useful:**
- Track workspace usage
- Monitor token consumption
- Understand team activity level
- Identify resource growth

#### Recent Activity Widget

Displays the latest activities in the workspace:

**Activity types shown:**
- Conversations created
- Agents shared
- Prompts shared
- Files uploaded
- Members joined
- Resources pinned
- Workspace settings updated

**Information displayed:**
- Activity description
- Member who performed the action
- Time ago (e.g., "5 minutes ago," "2 hours ago")
- Related resource name

**Benefits:**
- Stay updated on team activities
- See what's new in the workspace
- Track collaboration patterns
- Discover newly shared resources

#### Pinned Resources Widget

Shows agents and prompts that admins have pinned for easy access:

**Two sections:**
1. **Pinned Agents**: Important agents for the workspace
2. **Pinned Prompts**: Frequently used prompt templates

**Features:**
- Click any resource to view details or use it
- Shows resource description
- Displays who created it
- Maximum of 5 pinned items per type

**Why pin resources:**
- Highlight essential tools for the team
- Guide new members to important agents
- Provide quick access to common prompts
- Feature high-quality resources

> **Tip:** Ask workspace admins to pin the most useful agents and prompts for your team's workflow.

#### Top Contributors Widget

Recognizes the most active workspace members:

**Shows:**
- Top 5 contributors by activity count
- Ranked by number of activities
- Activity count for each member
- Last active timestamp

**Activities counted:**
- Creating conversations
- Sharing resources
- Creating agents
- Uploading files
- Other collaborative actions

**Benefits:**
- Recognize active team members
- Encourage participation
- Identify workspace champions
- Understand engagement patterns

#### Recent Shared Widget

Displays the latest resources shared with the workspace:

**Shows:**
- Last 5 shared resources (agents, prompts, files)
- Resource type and name
- Who shared it
- When it was shared
- Color-coded by resource type

**Why it's useful:**
- Discover new shared resources quickly
- See who's contributing
- Stay updated on available tools
- Find recently added prompts or agents

#### Quick Links Widget

Custom links configured by workspace admins:

**Features:**
- Links to external resources
- Documentation
- Company wikis
- Project management tools
- Relevant websites
- Custom icons for each link

**Use cases:**
- Link to team documentation
- Connect to project boards
- Reference company guidelines
- Provide training resources

#### Workspace Files Widget

Shows recently uploaded files:

**Displays:**
- 10 most recent files
- File name and type
- File size
- Upload date
- File icons by type
- Upload new files directly

**Features:**
- Upload files using the Upload button
- Click to preview or download
- Quick access to team files
- See who uploaded each file
- Files are automatically available for RAG in workspace conversations

### Customizing the Start Page

Workspace owners and admins can customize the start page:

1. **Go to Workspace Settings**
   - Click settings icon for the workspace
   - Navigate to **Start Page Settings**

2. **Enable/Disable Start Page**
   - Toggle **Show Start Page** on or off
   - When off, workspace opens directly to conversations

3. **Configure Content**
   - **Title**: Custom welcome title
   - **Content**: Main welcome message (supports markdown)
   - **Show Stats**: Toggle quick stats widget
   - **Welcome Message**: Detailed welcome (markdown supported)
   - **Guidelines**: Workspace rules and guidelines (markdown)

4. **Add Custom Links**
   - Click **Add Link**
   - Enter title and URL
   - Choose icon type
   - Links appear in Quick Links widget

5. **Save Changes**
   - Click **Save** to apply
   - Changes visible to all members immediately

**Markdown support:**
- Format text with bold, italic, headers
- Create lists and tables
- Add links and code blocks
- Embed images (URLs)

> **Example:**
> ```markdown
> # Welcome to Our Team Workspace!
>
> ## Getting Started
> - Check out our pinned agents
> - Review the team guidelines below
> - Join our daily standup conversations
>
> **Need help?** Contact @admin
> ```

## Pinning Resources

Highlight important agents and prompts by pinning them to the start page.

### What is Pinning?

**Pinning** makes a resource prominent on the workspace start page:
- Appears in the Pinned Resources widget
- Easy access for all members
- Signals importance to the team
- Maximum 5 pins per resource type

**Who can pin:**
- Workspace Owners
- Workspace Admins

**What can be pinned:**
- Agents
- Prompts
- Files (in file widget, not separately pinned)

### How to Pin an Agent

1. **Open the agent details**
   - Navigate to **Agents**
   - Click the agent you want to pin

2. **Find the pin option**
   - Look for a **Pin** button or pin icon
   - Usually near the share button

3. **Click to pin**
   - Click **Pin to Workspace**
   - The agent is added to pinned resources

4. **Confirmation**
   - A success message appears
   - The agent shows a "Pinned" indicator
   - It appears on the workspace start page

### How to Pin a Prompt

1. **Navigate to prompts**
   - Go to **Prompts** in the sidebar
   - Find the prompt to pin

2. **Open prompt details**
   - Click to view the prompt

3. **Pin the prompt**
   - Click the **Pin** button or icon
   - Confirm if prompted

4. **Result**
   - Prompt appears in Pinned Resources widget
   - Shows pinned badge
   - Available on start page for quick access

### Unpinning Resources

Remove resources from the pinned list:

1. **Open the pinned resource**
   - Navigate to the agent or prompt
   - Or find it in the Pinned Resources widget

2. **Click Unpin**
   - Look for **Unpin** button
   - Or click the pin icon again

3. **Confirmation**
   - Resource removed from pinned list
   - Still available in regular listings
   - No longer appears on start page

> **Tip:** Pin your team's most-used agents and prompts to help everyone find them quickly. Rotate pinned items as team needs change.

### Best Practices for Pinning

**Pin resources that are:**
- Used frequently by the team
- Essential for onboarding new members
- High-quality and well-tested
- Aligned with team workflows
- Regularly updated and maintained

**Avoid pinning:**
- Experimental or untested resources
- Rarely used agents or prompts
- Personal preferences not relevant to the team
- More than 5 items per type (unpins oldest)

## Workspace Settings

Configure your workspace to match your team's needs.

### Accessing Settings

**For Owners and Admins:**
1. Switch to the workspace
2. Click **Settings** or the workspace menu
3. Look for **Workspace Settings**
4. Multiple tabs for different settings

### General Settings

**Basic Information:**

**Name**
- Change the workspace name
- Appears in workspace selector
- Keep it descriptive and concise

**Description**
- Brief description of workspace purpose
- Helps new members understand the workspace
- Visible on workspace start page

**Slug**
- URL-friendly identifier
- Used in workspace URLs
- Auto-generated but can be customized
- Must be unique across the system

**Avatar**
- Upload custom workspace icon
- Appears in workspace selector
- Helps identify workspace visually
- Recommended: logo or team icon

**Color**
- Choose a workspace color
- Appears in workspace badge
- Helps distinguish multiple workspaces
- Select from color picker

### Member Settings

Configure how members join and participate:

**Membership Options:**

**Allow Guest Access** (Optional)
- Enable or disable guest access
- Guests have limited permissions
- Useful for external collaborators

**Require Approval for Members** (Optional)
- New members need admin approval
- Prevents unwanted additions
- Better control over workspace access

**Default Role for New Members**
- Choose default role: Viewer, Member, or Admin
- Applied when members join
- Can be changed individually later

### Model and Endpoint Settings

Control which AI models the workspace can use:

**Available Models** (Owner Only)
- Restrict which models workspace can access
- Useful for cost control
- Leave empty to allow all available models
- Select specific models from list

**Available Endpoints** (Owner Only)
- Limit which AI providers are available
- Examples: OpenAI, Anthropic, Google
- Helps standardize team usage
- Leave empty to allow all endpoints

**Default Model**
- Pre-selected model for new conversations
- Members can change per conversation
- Helps standardize team usage
- Optional setting

**Default Endpoint**
- Pre-selected AI provider
- Applied to new conversations
- Can be changed by members
- Optional setting

> **Tip:** Restricting models and endpoints can help manage costs and ensure consistent quality across team conversations.

### Token Budget

Control AI usage costs with token limits:

**Token Budget Setting:**
- Set maximum tokens for the workspace
- Measured per month or billing period
- Prevents unexpected overages
- Leave empty for unlimited usage

**When budget is reached:**
- Workspace conversations may be restricted
- Members receive warnings
- Admins notified of usage levels
- Can be increased by owner

**Monitoring:**
- View current token usage in Quick Stats
- Check usage in workspace settings
- Track spending over time
- Set alerts (if configured)

> **Note:** Token budgets help manage costs for teams using paid API services. Contact your administrator for budget adjustments.

### File Settings

Configure file handling for the workspace:

**Allowed File Types**
- Specify which file types can be uploaded
- Examples: images, PDFs, documents, code
- Leave empty to allow all supported types
- Helps maintain workspace organization

**Maximum File Size**
- Set max size per file in MB
- Prevents large uploads
- Default usually set by administrator
- Applies to all workspace uploads

### Start Page Configuration

Customize the workspace start page (Admin/Owner only):

**Enable Start Page**
- Toggle on/off
- When off, opens directly to conversations
- Most workspaces keep this enabled

**Start Page Title**
- Custom title for the welcome message
- Example: "Welcome to Marketing Team!"
- Appears at top of start page

**Start Page Content**
- Main welcome message
- Supports markdown formatting
- Can include links, lists, formatting
- Optional - leave blank for default

**Show Statistics**
- Toggle Quick Stats widget
- Shows conversation, message, token counts
- Turn off for simpler start page

**Custom Links**
- Add links to external resources
- Each link has:
  - Title
  - URL
  - Icon type
- Appears in Quick Links widget
- Add multiple links for team resources

### Welcome Message and Guidelines

**Welcome Message** (Markdown supported)
- Greet new and existing members
- Explain workspace purpose
- Provide getting started tips
- Link to important resources
- Maximum 5000 characters

**Guidelines** (Markdown supported)
- Workspace rules and expectations
- Best practices for the team
- Usage policies
- Contribution guidelines
- Maximum 5000 characters

**Example Welcome Message:**
```markdown
# Welcome to Our Development Team Workspace! 👋

This workspace is for our engineering team's collaboration with AI.

## Quick Start
1. Check out our pinned agents (Code Reviewer, Debug Assistant)
2. Use shared prompts for common tasks
3. Tag conversations with project names

## Support
Questions? Message @tech-lead in Slack
```

**Example Guidelines:**
```markdown
# Workspace Guidelines

## Code Quality
- Always use the Code Reviewer agent before merging
- Share useful prompts you create
- Tag conversations by project

## Collaboration
- Share learnings with the team
- Pin excellent agents for others to use
- Keep conversations organized

## Security
- Don't share credentials or secrets
- Use private mode for sensitive topics
- Review shared agents before using
```

### Saving Settings

After making changes:
1. Scroll to bottom of settings page
2. Click **Save Changes**
3. Confirmation message appears
4. Changes apply immediately to all members

> **Warning:** Some settings (like model restrictions) apply immediately and may affect ongoing conversations.

## Activity and Collaboration

Track how your team uses the workspace and collaborates.

### Viewing Workspace Activity

**Access Activity:**
- View the **Recent Activity Widget** on start page
- Or go to **Workspace Settings** > **Activity** (if available)

**Activity Feed Shows:**
- Chronological list of workspace actions
- Who performed each action
- What was done
- When it happened (time ago)
- Related resources

### Activity Types

TESSA tracks 13 types of workspace activities:

**Resource Activities:**
1. **Conversation Created**: New workspace conversation started
2. **Agent Created**: New agent added to workspace
3. **Agent Shared**: Existing agent shared with workspace
4. **Prompt Created**: New prompt added
5. **Prompt Shared**: Existing prompt shared with workspace
6. **File Uploaded**: New file added to workspace

**Pinning Activities:**
7. **Agent Pinned**: Agent pinned to start page
8. **Prompt Pinned**: Prompt pinned to start page

**Membership Activities:**
9. **Member Joined**: New member added to workspace
10. **Member Left**: Member removed or left workspace

**Workspace Activities:**
11. **Workspace Created**: The workspace was created
12. **Workspace Updated**: Settings or information changed

**Each activity shows:**
- Activity type with icon
- User who performed the action
- Resource name (if applicable)
- Timestamp
- Link to resource (if applicable)

### Top Contributors

See who's most active in the workspace:

**Contribution Metrics:**
- Number of activities performed
- Ranking (1st, 2nd, 3rd, etc.)
- Last activity timestamp
- Activity count badge

**Counted Activities:**
- Creating conversations
- Sharing resources
- Creating new agents/prompts
- Uploading files
- Other collaborative actions

**Viewing Contributors:**
- Check the **Top Contributors Widget** on start page
- Shows top 5 most active members
- Updates in real-time
- Recognizes team participation

> **Tip:** Use contributor data to recognize active team members and encourage participation.

### Monitoring Shared Resources

Track what's being shared in your workspace:

**Recent Shared Resources:**
- View in **Recent Shared Widget** on start page
- Shows last 5 shared items
- Includes agents, prompts, and files
- Color-coded by type

**Benefits:**
- Stay informed of new resources
- Discover useful tools teammates share
- Understand team collaboration patterns
- Find newly available agents or prompts

### Activity Data Retention

**How long activity is stored:**
- Activity records kept for 90 days
- Automatically deleted after that period
- Helps maintain performance
- Reduces storage requirements

**What's preserved:**
- Resources remain available
- Activity history is removed
- Statistics are updated
- No impact on current work

## Best Practices

### Workspace Organization

**Create Purpose-Specific Workspaces:**
- One workspace per team or project
- Examples: "Marketing 2025," "Engineering - Backend," "Research Lab"
- Avoid generic workspace names
- Keep workspaces focused

**Use Consistent Naming:**
- Follow a naming convention
- Include team/department
- Add dates for temporary projects
- Make names searchable

### Resource Sharing Strategy

**Share Thoughtfully:**
- Only share tested, working agents
- Write clear descriptions
- Include usage instructions
- Update shared resources regularly

**Organize Shared Resources:**
- Use descriptive names
- Add detailed descriptions
- Tag or categorize appropriately
- Keep resource lists manageable

**Version Control:**
- Document significant changes
- Use version numbers in names
- Archive old versions
- Communicate updates to team

### Member Management

**Role Assignment:**
- Start most users as "Member"
- Promote trusted members to "Admin"
- Limit owner role to one person
- Review permissions periodically

**Onboarding New Members:**
- Share welcome message and guidelines
- Point out pinned resources
- Explain workspace purpose
- Provide training resources

**Offboarding:**
- Remove access promptly when members leave
- Transfer ownership of resources if needed
- Archive important conversations
- Update member lists

### Workspace Settings

**Model and Budget Configuration:**
- Set token budgets to control costs
- Restrict models if necessary
- Monitor usage regularly
- Adjust based on team needs

**Start Page Optimization:**
- Keep welcome message concise
- Pin most-used resources
- Update guidelines as needed
- Add helpful links

**Regular Maintenance:**
- Review shared resources monthly
- Unpin outdated agents/prompts
- Update workspace description
- Clean up inactive members

### Collaboration Tips

**Communication:**
- Use descriptive conversation titles
- Tag conversations appropriately
- Share useful discoveries
- Provide feedback on shared resources

**Resource Creation:**
- Test before sharing
- Document usage instructions
- Include examples
- Request feedback from team

**Respect Permissions:**
- Don't share others' private resources
- Ask before pinning resources
- Respect role limitations
- Follow workspace guidelines

## Troubleshooting

### Common Issues and Solutions

#### "Cannot remove last owner"

**Problem:** Error when trying to remove or leave workspace as the only owner

**Solution:**
1. Transfer ownership to another member first
2. Go to **Workspace Settings** > **Members**
3. Promote someone to **Owner** role
4. Your role changes to Admin automatically
5. Now you can leave if desired

**Prevention:**
- Always have at least one owner
- Appoint a backup owner early
- Transfer ownership before leaving

#### "Permission denied" errors

**Problem:** Cannot perform action in workspace

**Common Causes:**
- Insufficient role permissions
- Trying to modify others' resources
- Workspace settings restrictions
- Token budget exceeded

**Solutions:**
1. **Check your role:**
   - Go to **Workspace Settings** > **Members**
   - Verify your permission level
   - Request role upgrade if needed

2. **Contact workspace admin:**
   - Ask about restrictions
   - Request permission changes
   - Understand workspace policies

3. **Check resource ownership:**
   - You can only share your own resources
   - Ask owner to share instead
   - Request access from resource owner

#### Workspace not appearing in list

**Problem:** Cannot find workspace in selector

**Possible Causes:**
1. **You've been removed:**
   - Contact workspace admin to verify
   - Request re-invitation if needed

2. **Workspace archived:**
   - Check with workspace owner
   - Workspace may be inactive

3. **Not yet accepted invite:**
   - Check email for invitation
   - Look in notifications
   - Contact inviter

**Solution:**
- Refresh the page
- Log out and log back in
- Clear browser cache
- Contact support if issue persists

#### Resources not visible in workspace

**Problem:** Shared resources don't appear

**Troubleshooting:**
1. **Check visibility:**
   - Resource must be set to "Workspace"
   - Private resources won't appear
   - Verify sharing status

2. **Verify workspace:**
   - Confirm you're in correct workspace
   - Check workspace selector
   - Switch workspaces and back

3. **Check filters:**
   - Remove any applied filters
   - Clear search terms
   - Check category selections

4. **Refresh view:**
   - Reload the page
   - Switch to different section and back
   - Log out and back in

#### Cannot share resource

**Problem:** Share button not working or missing

**Possible Causes:**
1. **Not the owner:**
   - Only resource owner can share
   - Check if you created the resource

2. **Wrong workspace:**
   - Must be in correct workspace
   - Switch to appropriate workspace

3. **Role restrictions:**
   - Members can share their own resources
   - Verify your workspace role

**Solution:**
- Confirm you own the resource
- Check you're in the right workspace
- Verify your member role
- Contact admin if restrictions apply

#### Start page not showing

**Problem:** Workspace opens directly to conversations

**Possible Reasons:**
1. **Disabled by admin:**
   - Workspace may have start page turned off
   - Contact admin to enable

2. **"Don't show again" selected:**
   - You chose to skip start page
   - Reset in settings if available

3. **Browser cache:**
   - Clear browser cache
   - Try incognito/private mode

**Solution:**
- Check **Workspace Settings** > **Start Page**
- Look for toggle or preference
- Contact workspace admin
- Reset user preferences

#### Token budget exceeded

**Problem:** Cannot create conversations, budget limit reached

**What happened:**
- Workspace reached token limit
- Budget set by owner
- Prevents further usage

**Solutions:**
1. **Wait for reset:**
   - Budgets typically reset monthly
   - Check with admin for reset date

2. **Request increase:**
   - Contact workspace owner
   - Explain usage needs
   - Owner can adjust budget

3. **Use personal mode:**
   - Switch to personal workspace
   - Use personal token allocation
   - Not charged to workspace budget

#### Changes not saving

**Problem:** Workspace settings changes don't persist

**Troubleshooting:**
1. **Check permissions:**
   - Verify you have admin/owner role
   - Some settings require owner permission

2. **Network issues:**
   - Check internet connection
   - Try again after brief wait
   - Look for error messages

3. **Browser issues:**
   - Try different browser
   - Clear cache and cookies
   - Disable browser extensions

4. **Validation errors:**
   - Check for required fields
   - Verify format of input
   - Look for error messages

**Solution:**
- Scroll through entire settings page
- Look for red error messages
- Try saving individual sections
- Contact support if persistent

### Getting Help

If you encounter issues not covered here:

1. **Check this guide:** Review relevant sections thoroughly
2. **Contact workspace admin:** They may have workspace-specific information
3. **Review workspace guidelines:** May include team-specific help
4. **Contact system administrator:** For technical or account issues
5. **Submit support ticket:** Describe the issue with screenshots if possible

> **Tip:** When reporting issues, include: workspace name, your role, what you were trying to do, error messages, and screenshots.

---

## Summary

Team Workspaces in TESSA provide powerful collaboration features:

**Key Capabilities:**
- Create shared team environments
- Manage members with role-based permissions
- Share agents, prompts, and files
- Track team activity and contributions
- Customize workspace settings
- Pin important resources
- Monitor usage and budgets

**Remember:**
- Start as Member, earn Admin role through trust
- Share resources thoughtfully
- Keep workspaces organized
- Communicate with your team
- Review and update settings regularly
- Respect permissions and guidelines

**Next Steps:**
- Create your first workspace
- Invite team members
- Share your best agents and prompts
- Customize the start page
- Set up guidelines and welcome message
- Start collaborating!

For more information, see:
- **[Agents Marketplace](./04-agents.md)** - Learn about creating and sharing agents
- **[Prompts Library](./07-prompts.md)** - Create and share prompt templates
- **[Settings & Personalization](./10-settings.md)** - Customize your TESSA experience

---

*Ready to collaborate with your team? Create your first workspace today!*
