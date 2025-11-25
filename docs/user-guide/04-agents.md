# Agents Marketplace

Discover and use AI agents—specialized AI assistants configured with specific tools, knowledge, and capabilities to help with particular tasks.

## What You'll Learn

- Understanding what agents are and how they work
- Browsing the Agents Marketplace
- Installing and using agents
- Agent tools (Code Interpreter, File Search, Web Search, Actions, MCP)
- Creating your own custom agents
- Configuring agent settings
- Sharing agents with others
- Version control for agents

## What Are AI Agents?

### Definition

**AI Agents** are pre-configured AI assistants designed for specific tasks or domains. Think of them as specialized experts you can call upon for particular needs.

**Key differences from regular chat:**
- Pre-configured with optimal settings for specific tasks
- Access to specialized tools and capabilities
- Custom instructions and knowledge
- Consistent behavior across conversations
- Can be shared and reused

### Agent Capabilities

Agents can have access to various tools:

- **Code Interpreter**: Execute Python code in a secure sandbox
- **File Search (Retrieval)**: Search through uploaded documents
- **Web Search**: Search the internet for current information
- **Actions (Function Calling)**: Call custom APIs and services
- **MCP (Model Context Protocol)**: Access external tools and data sources
- **Image Generation**: Create images based on descriptions
- **Image Vision**: Analyze and understand images

### Use Cases

**Professional:**
- Code review assistant
- Technical documentation writer
- Data analysis expert
- Research assistant

**Creative:**
- Story writing companion
- Marketing copy generator
- Social media content creator
- Design brainstormer

**Business:**
- Email response generator
- Report summarizer
- Meeting notes organizer
- Customer support assistant

**Personal:**
- Study buddy
- Travel planner
- Recipe suggester
- Learning tutor

## Accessing the Agents Marketplace

### Opening the Marketplace

**Method 1: From Navigation**
1. Click the **Agents Marketplace** button in the top navigation bar
2. The marketplace opens in a new view or modal

**Method 2: During Conversation**
1. Click the **agent selector** in the chat area
2. Select **Browse Marketplace**
3. The marketplace view opens

**Method 3: From Side Panel**
1. Open the right side panel
2. Navigate to the **Agents** section
3. Click **Browse Marketplace**

### Marketplace Layout

The marketplace interface includes:

**Search Bar:**
- Located at the top
- Search agents by name, description, or capabilities
- Instant results as you type

**Category Tabs:**
- Filter agents by category
- Categories include: All, Productivity, Creative, Development, Research, Business, Personal, etc.
- Click a category to view only those agents

**Agent Grid:**
- Visual cards showing agent information
- Agent avatar/icon
- Name and short description
- Capabilities badges
- Rating/usage indicators

**Agent Details Panel:**
- Click any agent card for detailed information
- Full description
- Tool list
- Version information
- Author information
- Install/Use button

## Browsing Agents

### Using Search

**Basic search:**
1. Click in the search bar
2. Type keywords related to your needs
   - "code" - find coding assistants
   - "writing" - find writing helpers
   - "data" - find data analysis agents
3. Results update instantly

**Advanced search tips:**
- Use specific tool names: "code interpreter", "web search"
- Search by domain: "marketing", "engineering", "education"
- Look for capabilities: "python", "analysis", "creative"

### Filtering by Category

Categories help you discover agents for specific domains:

**Common categories:**
- **All**: View all available agents
- **Productivity**: Task management, organization, efficiency
- **Creative**: Writing, art, design, brainstorming
- **Development**: Coding, debugging, architecture
- **Research**: Analysis, summarization, investigation
- **Business**: Operations, strategy, communication
- **Personal**: Learning, entertainment, lifestyle
- **Data**: Analysis, visualization, interpretation

**To filter:**
1. Click on a category tab
2. Only agents in that category display
3. Click **All** to return to full list

### Understanding Agent Cards

Each agent card displays:

**Agent Information:**
- **Name**: Descriptive agent name
- **Description**: Brief summary of capabilities
- **Avatar**: Visual identifier
- **Author**: Who created the agent

**Capabilities Badges:**
- Tool indicators (🔧 Tools icon)
- Code interpreter badge
- File search badge
- Web search badge
- Action/API badges
- MCP tool badges

**Status Indicators:**
- **Installed**: You've installed this agent
- **Featured**: Highlighted by administrators
- **Popular**: High usage count
- **New**: Recently added

## Installing and Using Agents

### Installing an Agent

**Step 1: Find Your Agent**
1. Browse or search for the agent you want
2. Click on the agent card to view details

**Step 2: Review Details**
1. Read the full description
2. Check what tools it uses
3. Review permissions it requires
4. Check version and author information

**Step 3: Install**
1. Click the **Install** or **Add Agent** button
2. Review any permission requests
3. Confirm installation
4. The agent is added to your agents list

> **Note:** Some agents may require specific permissions or access to tools. Your administrator may need to enable certain features.

### Using an Installed Agent

**Method 1: Start New Conversation**
1. Click **+ New Chat**
2. Select the agent from the agent selector
3. The conversation starts with the agent's configuration
4. Begin chatting with the agent

**Method 2: Switch in Existing Conversation**
1. Open any conversation
2. Click the agent selector dropdown
3. Choose your installed agent
4. New messages use the agent's configuration

**Method 3: From Agents List**
1. Go to your installed agents list
2. Click on the agent
3. Click **Start Chat** or **Use Agent**
4. A new conversation opens

### Agent Indicator

When using an agent, you'll see:
- Agent name at the top of the chat
- Agent avatar/icon
- Active tools indicators
- Configuration settings in the side panel

## Agent Tools Explained

### Code Interpreter

**What it does:** Executes Python code in a secure, sandboxed environment

**Use cases:**
- Data analysis and visualization
- Mathematical calculations
- File processing and transformation
- Algorithm testing
- Generating charts and graphs

**How it works:**
1. You ask the agent to perform a computation or analysis
2. The agent writes Python code
3. Code executes in a secure environment
4. Results are returned (including generated files/images)

**Example interactions:**
```
You: "Analyze this CSV file and create a bar chart of sales by month"
Agent: [Uploads code, executes, returns chart image]

You: "Calculate the Fibonacci sequence up to 100"
Agent: [Executes code, returns results]
```

**Limitations:**
- Python only (no other languages)
- Limited execution time
- No internet access from the sandbox
- Limited file system access

### File Search (Retrieval)

**What it does:** Searches through uploaded documents to find relevant information

**Use cases:**
- Research through documents
- Finding specific information in large files
- Summarizing documents
- Q&A over document collections
- Cross-referencing multiple sources

**How it works:**
1. Upload files to the agent (PDFs, documents, text files)
2. Ask questions about the content
3. Agent searches relevant sections
4. Returns answers with citations

**Supported file types:**
- PDF documents
- Word documents (.docx)
- Text files (.txt)
- Markdown files (.md)
- Code files
- Spreadsheets (converted to text)

**Example interactions:**
```
You: "What does this contract say about payment terms?"
Agent: [Searches uploaded contract, returns relevant sections]

You: "Summarize the key findings from these research papers"
Agent: [Analyzes multiple papers, provides summary]
```

### Web Search

**What it does:** Searches the internet for current information

**Use cases:**
- Finding recent news and events
- Looking up current facts and data
- Researching topics beyond the model's training data
- Checking real-time information
- Gathering multiple sources

**How it works:**
1. You ask a question requiring current information
2. Agent performs web search queries
3. Retrieves and analyzes results
4. Synthesizes information into response
5. Often includes source citations

**Example interactions:**
```
You: "What are the latest developments in AI this week?"
Agent: [Searches web, returns recent news with sources]

You: "What's the weather forecast for Paris next week?"
Agent: [Searches weather services, returns forecast]
```

> **Note:** Web search availability depends on your TESSA configuration and may require API keys.

### Actions (Function Calling)

**What it does:** Calls external APIs and services to perform actions

**Use cases:**
- Integrating with third-party services
- Performing specific operations
- Fetching data from external systems
- Triggering workflows
- Custom integrations

**How it works:**
1. Agent is configured with available actions/functions
2. When appropriate, agent calls these functions
3. External service processes the request
4. Results are returned to the conversation

**Example actions:**
- Send email
- Create calendar event
- Update database
- Post to social media
- Fetch from custom API

**Example interactions:**
```
You: "Schedule a meeting for next Tuesday at 2 PM"
Agent: [Calls calendar API, creates event, confirms]

You: "Get the current stock price for AAPL"
Agent: [Calls financial API, returns price]
```

### MCP (Model Context Protocol)

**What it does:** Connects to external tools and data sources via standardized protocol

**Use cases:**
- Accessing enterprise data systems
- Connecting to custom tools
- Integrating with specialized services
- OAuth-protected resources
- Complex multi-step workflows

**How it works:**
1. MCP servers configured by administrator
2. Agent can access MCP tools
3. OAuth authentication when needed
4. Standardized communication protocol

**Example MCP tools:**
- Database query tools
- File system access
- API integrations
- Custom business logic
- Enterprise system connections

> **Note:** MCP requires configuration by your administrator. See [Advanced Features](./09-advanced.md) for details.

### Image Generation

**What it does:** Creates images based on text descriptions

**Use cases:**
- Creating illustrations
- Generating designs
- Visual brainstorming
- Conceptual art
- Marketing materials

**How it works:**
1. You describe the image you want
2. Agent generates the image using AI
3. Image is displayed in the conversation
4. You can request modifications

**Example interactions:**
```
You: "Create an image of a sunset over mountains with a lake"
Agent: [Generates and displays image]

You: "Make it more vibrant and add birds"
Agent: [Generates modified version]
```

### Image Vision

**What it does:** Analyzes and understands uploaded images

**Use cases:**
- Describing image content
- Extracting text (OCR)
- Analyzing charts and diagrams
- Understanding visual context
- Comparing images

**How it works:**
1. Upload an image to the conversation
2. Ask questions about the image
3. Agent analyzes visual content
4. Provides descriptions, answers, or analysis

**Example interactions:**
```
You: [Uploads chart] "What trends do you see here?"
Agent: [Analyzes chart, describes trends]

You: [Uploads receipt] "Extract the total amount"
Agent: [Reads receipt, returns total]
```

## Creating Custom Agents

You can create your own agents tailored to your specific needs.

### When to Create an Agent

Create a custom agent when:
- You have a repetitive task with specific requirements
- You need consistent behavior across conversations
- You want to combine multiple tools
- You have specific knowledge to include
- You want to share a configuration with others

### Creating an Agent: Step-by-Step

**Step 1: Open Agent Creator**
1. Go to the Agents section
2. Click **Create New Agent** or **+ New Agent**
3. The agent configuration panel opens

**Step 2: Basic Information**

1. **Name your agent**
   - Use a clear, descriptive name
   - Example: "Python Code Reviewer", "Marketing Copy Assistant"

2. **Add description**
   - Explain what the agent does
   - Include use cases
   - Mention any special capabilities

3. **Choose a category**
   - Select the most relevant category
   - Helps others discover your agent
   - Can select multiple if applicable

4. **Select avatar/icon** (optional)
   - Visual identifier for your agent
   - Upload custom image or choose from library

**Step 3: Select AI Model**

1. Click **Model** dropdown
2. Choose the best model for your agent's task
   - GPT-4 for complex reasoning
   - Claude for analysis and long documents
   - GPT-3.5 for speed and efficiency
3. Set model parameters
   - Temperature
   - Max tokens
   - Other parameters

**Step 4: Write Instructions**

Provide clear instructions that define the agent's behavior:

```
You are a Python code reviewer. Your role is to:
1. Review Python code for best practices
2. Identify potential bugs and security issues
3. Suggest improvements
4. Explain your recommendations clearly

Always be constructive and provide examples of better code.
Format suggestions as markdown with code blocks.
```

**Tips for good instructions:**
- Be specific about the agent's role
- Define the tone and style
- Specify output format
- Include do's and don'ts
- Provide examples if helpful

**Step 5: Enable Tools**

Select which tools the agent can use:

- ☑️ **Code Interpreter**: Check if agent needs to run code
- ☑️ **File Search**: Check if agent should search documents
- ☑️ **Web Search**: Check if agent needs current information
- ☑️ **Actions**: Select specific actions/APIs
- ☑️ **MCP Tools**: Select MCP servers
- ☑️ **Image Generation**: Check if agent creates images
- ☑️ **Image Vision**: Check if agent analyzes images

> **Note:** Only enable tools the agent actually needs. More tools can slow response time and increase cost.

**Step 6: Upload Knowledge Files (Optional)**

Add files the agent should reference:

1. Click **Add Files** in the File Search section
2. Upload relevant documents
   - PDFs, documents, text files
   - Up to configured file limit
3. These become the agent's knowledge base
4. Agent can search these files during conversations

**Examples:**
- Product documentation for a support agent
- Company style guide for a writing agent
- API documentation for a coding agent
- Research papers for a analysis agent

**Step 7: Configure Advanced Settings (Optional)**

Click **Advanced** to access additional options:

- **Agent chain**: Allow agent to call other agents
- **Max agent steps**: Limit tool usage iterations
- **Custom stop sequences**: Define when to stop generating
- **Response format**: JSON or text
- **Additional parameters**: Model-specific options

**Step 8: Save Your Agent**

1. Review all settings
2. Click **Save** or **Create Agent**
3. Your agent is now available in your agents list
4. Test it in a conversation to verify behavior

### Testing Your Agent

After creating an agent:

1. **Start a test conversation**
   - Create new chat with your agent
   - Try various scenarios
   - Test all enabled tools

2. **Verify behavior**
   - Does it follow instructions?
   - Are responses appropriate?
   - Do tools work as expected?

3. **Refine if needed**
   - Edit agent configuration
   - Adjust instructions
   - Modify tool selection
   - Update parameters

4. **Iterate**
   - Test again after changes
   - Get feedback from others
   - Continuously improve

## Managing Agents

### Editing Agents

Update your agents as needs change:

1. Go to your agents list
2. Click on the agent to edit
3. Click **Edit** or the edit icon
4. Make your changes
5. Click **Save Changes**

**What you can edit:**
- Name and description
- Instructions
- Model and parameters
- Enabled tools
- Knowledge files
- Advanced settings

> **Note:** Editing an agent creates a new version. Previous conversations continue using the old version unless you update them.

### Duplicating Agents

Create a copy to modify without affecting the original:

1. Find the agent to duplicate
2. Click **Duplicate** or the duplicate icon
3. A copy is created with "(Copy)" added to the name
4. Edit the duplicate as needed

**When to duplicate:**
- Experimenting with variations
- Creating similar agents for different domains
- Starting from an existing template
- Preserving the original while testing changes

### Deleting Agents

Remove agents you no longer need:

1. Find the agent to delete
2. Click **Delete** or the delete icon
3. Confirm deletion
4. Agent is removed from your list

> **Warning:** Deletion is permanent. Conversations using deleted agents may lose agent-specific features.

**Consider instead:**
- Archiving (if feature available)
- Making private (stop sharing)
- Keeping but not using

## Agent Versions

TESSA includes version control for agents.

### Understanding Versions

**What are versions?**
- Each save creates a new version
- Previous versions are preserved
- Can switch between versions
- Track changes over time

**Version information includes:**
- Version number (v1, v2, v3, etc.)
- Creation date
- Changes description (if provided)
- Creator

### Viewing Version History

1. Open an agent's details
2. Click **Versions** or **Version History**
3. See list of all versions
4. View details for each version

**Version list shows:**
- Version number
- Date created
- Description of changes
- Option to revert or preview

### Creating a New Version

Versions are created automatically when you:
- Edit and save an agent
- Modify instructions
- Change tools
- Update files

**Best practice:**
- Add a description of changes when saving
- Note what you modified
- Explain why you made the change

Example descriptions:
- "Added web search tool for current information"
- "Updated instructions to be more concise"
- "Increased temperature for more creative responses"
- "Added company documentation to knowledge base"

### Reverting to Previous Versions

Go back to an earlier configuration:

1. Open version history
2. Find the version you want
3. Click **Revert** or **Use This Version**
4. Confirm reversion
5. Agent now uses that version's configuration

**When to revert:**
- Recent changes didn't work as expected
- Earlier version performed better
- You need a specific older configuration
- Testing different versions

> **Note:** Reverting creates a new version (copy of the old one). The history is preserved.

## Sharing Agents

Share your custom agents with others.

### Making Agents Public

Allow others to discover and use your agent:

1. Open the agent's configuration
2. Find **Sharing** or **Visibility** settings
3. Select **Public** or **Shared**
4. Optionally set permissions:
   - **View only**: Others can use but not edit
   - **Can duplicate**: Others can copy and modify
5. Save changes

**Your agent now:**
- Appears in the marketplace
- Can be installed by others
- Shows you as the author

### Sharing with Specific People

Share with selected users only:

1. Open agent configuration
2. Go to **Sharing** settings
3. Select **Private** or **Shared with specific people**
4. Add users via:
   - Email addresses
   - Usernames
   - Groups (if available)
5. Set permissions for each person
6. Save changes

**Permission levels:**
- **View/Use**: Can use the agent
- **Edit**: Can modify the agent
- **Admin**: Can manage sharing and delete

### Sharing via Link

Create a shareable link:

1. Open agent sharing settings
2. Click **Generate Link**
3. Set link permissions
4. Copy the link
5. Share the link with anyone who needs access

**Link options:**
- Expiration date
- Usage limit
- View only or can duplicate
- Password protection (if available)

## Agent Best Practices

### Creating Effective Agents

1. **Clear purpose**: Define one primary role
2. **Specific instructions**: Be explicit about behavior
3. **Minimal tools**: Only enable what's needed
4. **Test thoroughly**: Verify behavior before sharing
5. **Good documentation**: Clear description and use cases

### Instructions Writing Tips

**Do:**
- Use clear, direct language
- Provide specific examples
- Define expected output format
- Specify tone and style
- Include edge cases

**Don't:**
- Be vague or ambiguous
- Contradict yourself
- Overload with too many rules
- Forget to specify output format
- Neglect to define boundaries

### Naming Conventions

**Good agent names:**
- "Python Code Review Assistant"
- "Marketing Email Composer"
- "Research Paper Summarizer"
- "SQL Query Helper"

**Avoid:**
- "Agent 1", "My Agent"
- Overly long names
- Unclear abbreviations
- Generic terms

### Tool Selection

**Guidelines:**
- Enable code interpreter for computational tasks
- Enable file search when working with documents
- Enable web search for current information only
- Limit actions to what's necessary
- Test each tool combination

## Troubleshooting

### Agent Not Appearing in Marketplace
**Problem:** Your public agent doesn't show up

**Solutions:**
- Verify sharing is set to "Public"
- Check if approval is required (ask administrator)
- Ensure all required fields are filled
- Try refreshing the marketplace
- Check if category is selected

### Agent Not Following Instructions
**Problem:** Agent behavior doesn't match instructions

**Solutions:**
- Make instructions more specific
- Provide examples in instructions
- Check for contradictory instructions
- Adjust model parameters (lower temperature)
- Try a different model
- Test instructions in a regular conversation first

### Tools Not Working
**Problem:** Agent's tools aren't functioning

**Solutions:**
- Verify tools are enabled in agent settings
- Check administrator configuration
- Ensure you have permissions for those tools
- Check if API keys are configured (web search, etc.)
- Review error messages for specific issues

### Agent Too Slow
**Problem:** Agent takes too long to respond

**Solutions:**
- Reduce number of enabled tools
- Limit file search knowledge base size
- Use a faster model (GPT-3.5, Claude Haiku)
- Reduce max tokens
- Simplify instructions

### Can't Share Agent
**Problem:** Sharing options are disabled

**Solutions:**
- Check your account permissions
- Verify administrator allows sharing
- Ensure agent is fully configured
- Check if you're the agent owner
- Contact administrator for permission

## Common Agent Scenarios

### Scenario 1: Creating a Code Review Agent

**Configuration:**
- Model: GPT-4 or Claude Sonnet
- Tools: Code Interpreter
- Temperature: 0.3 (for consistency)
- Instructions: Focus on best practices, security, performance

**Instructions example:**
```
You are an expert code reviewer. Review code for:
1. Best practices and style
2. Potential bugs and edge cases
3. Security vulnerabilities
4. Performance issues
5. Code clarity and documentation

Provide specific, actionable feedback with examples.
```

### Scenario 2: Creating a Research Assistant

**Configuration:**
- Model: Claude Opus (for long documents)
- Tools: File Search, Web Search
- Temperature: 0.5
- Knowledge files: Relevant research papers

**Instructions example:**
```
You are a research assistant helping with academic work.
- Analyze research papers thoroughly
- Provide citations for all claims
- Summarize findings clearly
- Identify patterns across sources
- Suggest related research directions
```

### Scenario 3: Creating a Writing Helper

**Configuration:**
- Model: Claude Opus or GPT-4
- Tools: None required
- Temperature: 0.8 (for creativity)
- Instructions: Define writing style

**Instructions example:**
```
You are a creative writing assistant.
- Help brainstorm ideas
- Provide detailed outlines
- Edit for clarity and flow
- Suggest improvements
- Maintain consistent tone
Write in an engaging, conversational style.
```

## Next Steps

Explore related features:

- **[Prompts Library](./07-prompts.md)**: Combine agents with prompt templates
- **[File Management](./05-files.md)**: Upload knowledge files for agents
- **[Advanced Features](./09-advanced.md)**: Learn about MCP and advanced agent features
- **[Export & Sharing](./06-export-share.md)**: Share conversations with agents

---

**Master agents** to create specialized AI assistants for any task!
