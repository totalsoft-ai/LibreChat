# Agents Marketplace

Discover and use AI agents—specialized AI assistants configured with specific tools, knowledge, and capabilities for particular tasks.

## What Are AI Agents?

**AI Agents** are pre-configured AI assistants designed for specific tasks or domains. They offer:
- Pre-configured optimal settings
- Access to specialized tools and capabilities
- Custom instructions and knowledge
- Consistent behavior across conversations
- Can be shared and reused

**Agent Capabilities:**
- **File Search (Retrieval)** - Search through uploaded documents
- **Web Search** - Search the internet for current information (not supported with local models)
- **MCP (Model Context Protocol)** - Access external tools and data sources

## Accessing the Agents Marketplace

**Open Marketplace:**
- Click **Agents Marketplace** button in top navigation, or
- Click agent selector in chat → **Browse Marketplace**, or
- Open right side panel → Agents section → **Browse Marketplace**

**Marketplace Layout:**
- **Search Bar** - Search by name, description, or capabilities
- **Category Tabs** - Filter by category (All, Productivity, Creative, Development, Research, Business, Personal, Data)
- **Agent Grid** - Visual cards with agent info, avatar, name, description, capabilities badges
- **Agent Details Panel** - Click card for full description, tool list, version info, author, Install button

## Browsing Agents

**Search:**
Type keywords in search bar (e.g., "code", "writing", "data"). Use specific tool names or domains for better results.

**Filter by Category:**
Click category tab to filter agents. Click **All** to return to full list.

**Agent Card Shows:**
- Name, description, avatar, author
- **Capabilities Badges** - Tools, file search, web search, actions, MCP
- **Status** - Installed, Featured, Popular, New

## Installing and Using Agents

**Install an Agent:**
1. Browse or search for agent
2. Click agent card to view details
3. Review description, tools, permissions
4. Click **Install** or **Add Agent**
5. Confirm installation

> **Note:** Some agents require specific permissions. Administrator may need to enable features.

**Use an Installed Agent:**
- **New Conversation**: Click **+ New Chat** → Select agent → Start chatting
- **Switch in Conversation**: Open conversation → Click agent selector → Choose agent
- **From Agents List**: Go to agents list → Click agent → **Start Chat**

**Agent Indicator:** Shows agent name, avatar, active tools, and configuration settings when using an agent.

## Agent Tools Explained

**File Search (Retrieval):**
Upload files (PDFs, Word docs, text, markdown, code) → Ask questions → Agent searches and returns answers with citations. Use for research, finding info in large files, summarizing documents, Q&A over collections.

**Web Search:**
Agent searches internet for current information, recent news, facts beyond training data. (not supported with local models)

**Actions (Function Calling):**
Calls external APIs and services to integrate with third-party systems, perform operations, fetch data, trigger workflows.

**MCP (Model Context Protocol):**
Connects to external tools and data sources (databases, file systems, APIs, enterprise systems) via standardized protocol. Requires administrator configuration. Supports OAuth authentication.


## Creating Custom Agents

**When to Create:**
For repetitive tasks with specific requirements, consistent behavior needs, combining multiple tools, including specific knowledge, or sharing configurations.

**Create an Agent:**

1. **Basic Information:**
   - Go to Agents section → **Create New Agent**
   - Add name, description, category, avatar (optional)

2. **Select AI Model:**
   - Choose model for agent's task (qwen3:8b, deepseek-r1:8b, gemma3:27b, etc.)
   - Set parameters (temperature, max tokens)

3. **Write Instructions:**
   - Define agent's role and behavior
   - Be specific about tone, style, output format
   - Include do's and don'ts

Example:
```
You are a Python code reviewer. Review Python code for best practices,
identify bugs and security issues, suggest improvements with examples.
Be constructive. Format suggestions as markdown with code blocks.
```

4. **Enable Tools:**
   - ☑️ File Search, Web Search, Actions, MCP Tools
   - Only enable what's needed (more tools slow response)

5. **Upload Knowledge Files (Optional):**
   - Add PDFs, documents, text files as agent's knowledge base
   - Examples: product docs, style guides, API docs, research papers

6. **Save and Test:**
   - Click **Save** or **Create Agent**
   - Start test conversation
   - Verify behavior and refine if needed

**Good Instructions Tips:**
- Be specific about role
- Define tone and style
- Specify output format
- Include examples if helpful

## Managing Agents

**Edit Agents:**
Go to agents list → Click agent → **Edit** → Make changes → **Save Changes**

Can edit: name, description, instructions, model, parameters, tools, knowledge files, advanced settings

> **Note:** Editing creates a new version. Previous conversations use old version unless updated.

**Duplicate Agents:**
Find agent → **Duplicate** → A copy is created with "(Copy)" added. Use for experimenting with variations or creating similar agents.

**Delete Agents:**
Find agent → **Delete** → Confirm. Deletion is permanent.

## Agent Versions

**Version Control:**
- Each save creates a new version
- Previous versions preserved
- Can switch between versions
- Track changes over time

**View Version History:**
Open agent details → **Versions** → See list with version number, date, description, creator

**Create New Version:**
Automatically created when editing. Best practice: add description of changes when saving.

**Revert to Previous:**
Open version history → Find version → **Revert** or **Use This Version** → Confirm

Reverting creates a new version (copy of old one). History is preserved.

## Sharing Agents

**Make Public:**
Open agent configuration → **Sharing** or **Visibility** → Select **Public** → Set permissions (View only or Can duplicate) → Save

Agent now appears in marketplace for others to install.

**Share with Specific People:**
Agent configuration → **Sharing** → **Private** or **Shared with specific people** → Add users (email, username, groups) → Set permissions (View/Use, Edit, Admin) → Save

**Share via Link:**
Open sharing settings → **Generate Link** → Set permissions, expiration, usage limit → Copy link → Share

## Best Practices

**Creating Effective Agents:**
- Clear purpose with one primary role
- Specific, explicit instructions
- Minimal tools (only what's needed)
- Thorough testing before sharing
- Good documentation with clear use cases

**Instructions Writing:**
Do: Use clear language, provide examples, define output format, specify tone
Don't: Be vague, contradict yourself, overload with rules, forget output format

**Good Agent Names:**
"Python Code Review Assistant", "Marketing Email Composer", "Research Paper Summarizer"

Avoid: "Agent 1", overly long names, unclear abbreviations

**Tool Selection:**
Enable file search for documents, web search only for current information, limit actions to necessary ones, test combinations.

## Troubleshooting

**Agent Not in Marketplace:** Verify sharing is "Public", check if approval required, ensure all fields filled, refresh marketplace

**Agent Not Following Instructions:** Make instructions more specific, provide examples, check contradictions, adjust temperature, try different model

**Tools Not Working:** Verify tools enabled, check administrator configuration, ensure permissions, check API keys, review error messages

**Agent Too Slow:** Reduce enabled tools, limit knowledge base size, use faster model, reduce max tokens, simplify instructions

**Can't Share Agent:** Check account permissions, verify administrator allows sharing, ensure agent fully configured, check if you're owner
