# Advanced Features

Explore powerful advanced features that extend TESSA's capabilities beyond standard chat.

## What You'll Learn

- Model Context Protocol (MCP) integration
- Memories System
- Multi-Conversation (split screen)
- Code Interpreter for Python execution
- Web Search integration
- Code Artifacts (generative UI)
- Advanced workflows and automation

## Model Context Protocol (MCP)

### What Is MCP?

**Model Context Protocol** is a standardized way for AI models to access external tools, data sources, and services.

**Key concepts:**
- **MCP Servers:** Services that provide tools and data
- **MCP Tools:** Specific capabilities exposed by servers
- **OAuth Integration:** Secure authentication for protected resources
- **Standardized Communication:** Consistent protocol across different tools

**Benefits:**
- Access enterprise data systems
- Connect to custom tools
- Integrate with specialized services
- Extend AI capabilities beyond training data
- Secure authentication with OAuth

### Available MCP Tools

MCP tools depend on what your administrator has configured. Common examples:

**Data Access:**
- Database query tools
- File system access
- Cloud storage integration
- CRM system connectors

**Development:**
- Git operations
- API testing tools
- Deployment systems
- CI/CD integrations

**Productivity:**
- Calendar management
- Task tracking
- Email integration
- Document management

**Business:**
- Analytics platforms
- Reporting systems
- Financial data access
- Customer data platforms

### Using MCP with Agents

MCP tools are primarily used through agents:

**Step 1: Select or Create Agent**
1. Go to Agents Marketplace or create new agent
2. Ensure agent supports MCP

**Step 2: Enable MCP Tools**
1. In agent configuration
2. Find **MCP Tools** section
3. See available MCP servers and tools
4. Check the tools you want to enable

**Step 3: Configure OAuth (if needed)**
1. Some tools require authentication
2. Click **Authenticate** or **Connect**
3. Complete OAuth flow in popup window
4. Return to TESSA—tool is now connected
5. If connection expires, reconnect via settings

**Step 4: Use Agent**
1. Start conversation with agent
2. Agent can now access enabled MCP tools
3. Ask agent to perform operations using those tools
4. Example: "Check my calendar for next week"

### OAuth Reconnection

If OAuth token expires:

**Automatic reconnection:**
- System detects expired token
- Prompts for re-authentication
- Complete OAuth flow again
- Agent resumes with refreshed access

**Manual reconnection:**
1. Go to agent settings
2. Find MCP tools section
3. Click **Reconnect** next to expired tool
4. Complete OAuth flow
5. Tool is re-authenticated

> **Note:** MCP requires administrator configuration. Contact your admin if you need specific tools or servers.

## Memories System

### What Are Memories?

**Memories** allow the AI to remember information about you across conversations.

**What it remembers:**
- Preferences you've stated
- Facts you've shared
- Context from previous conversations
- Your working style
- Important details

**Benefits:**
- Don't repeat yourself
- Consistent experience
- Personalized responses
- Better long-term assistance

### How Memories Work

**Automatic memory creation:**
- AI identifies important information during conversations
- Automatically stores relevant details
- References memories in future conversations

**Manual memory creation:**
- You explicitly tell AI to remember something
- Example: "Remember that I prefer Python over JavaScript"

**Memory usage:**
- AI references memories when relevant
- Provides more personalized responses
- Maintains consistency across conversations

### Viewing Your Memories

1. Go to **Settings** or **User Menu**
2. Find **Memories** section
3. See list of stored memories
4. Each memory shows:
   - What is remembered
   - When it was created
   - Source conversation (if applicable)

### Managing Memories

**Create manual memory:**
1. In any conversation, say: "Remember that [information]"
2. Or go to Memories settings
3. Click **Add Memory**
4. Enter what you want remembered
5. Save

**Edit memory:**
1. Go to Memories settings
2. Find memory to edit
3. Click **Edit**
4. Modify information
5. Save changes

**Delete memory:**
1. Go to Memories settings
2. Find memory to delete
3. Click **Delete**
4. Confirm deletion

**Clear all memories:**
1. Go to Memories settings
2. Click **Clear All Memories**
3. Confirm (this is permanent)

### Opting Out of Memories

If you don't want AI to remember information:

**Disable memories:**
1. Go to Settings > Memories
2. Toggle **Enable Memories** OFF
3. Existing memories are preserved but not used
4. No new memories are created

**Delete and disable:**
1. Clear all memories
2. Disable memories feature
3. Start fresh without memory system

### Example Memory Usage

**Scenario: Work Preferences**

**You say:** "Remember that I work in marketing and prefer concise, actionable advice."

**AI remembers:**
- Your role: Marketing
- Your preference: Concise and actionable advice

**Future conversations:**

**You ask:** "How should I approach this campaign?"

**AI responds:** Provides concise, actionable marketing advice without you restating your background.

## Multi-Conversation (Split Screen)

### What Is Multi-Conversation?

**Multi-Conversation** allows you to have multiple AI conversations side-by-side.

**Benefits:**
- Compare responses from different models
- Work on related tasks simultaneously
- Reference one conversation while working in another
- Parallel workflows

**Use cases:**
- Compare GPT-4 vs Claude responses
- Research while writing
- Multiple aspects of a project
- A/B testing prompts

### Enabling Multi-Conversation

1. Look for **Multi-Conversation** or **Split View** button
2. Or keyboard shortcut (if configured)
3. Chat area splits into multiple panes
4. Each pane is an independent conversation

### Using Multi-Conversation

**Create new conversation in pane:**
1. Click **+ New** in specific pane
2. Or drag conversation from sidebar to pane

**Switch models per pane:**
- Each pane can use different model
- Configure independently
- Compare model behaviors

**Resize panes:**
- Drag divider between panes
- Resize to preferred widths
- Focus on primary conversation

**Close pane:**
- Click **X** on pane
- Or toggle multi-conversation off
- Returns to single conversation view

### Multi-Conversation Workflows

**Workflow 1: Model Comparison**
- Pane 1: GPT-4
- Pane 2: Claude 3 Opus
- Ask same question to both
- Compare responses
- Choose best approach

**Workflow 2: Research and Writing**
- Pane 1: Research agent searching documents
- Pane 2: Writing assistant drafting content
- Reference research while writing
- Seamless workflow

**Workflow 3: Code Development**
- Pane 1: Code generation agent
- Pane 2: Code review agent
- Generate code in one pane
- Review in another
- Iterate quickly

## Code Interpreter

### What Is Code Interpreter?

**Code Interpreter** executes Python code in a secure, sandboxed environment.

**Capabilities:**
- Run Python code
- Data analysis and visualization
- Mathematical computations
- File processing
- Chart generation

**Security:**
- Isolated sandbox
- No internet access from code
- Limited execution time
- Safe execution environment

### Using Code Interpreter

**Enable via agent:**
1. Create or select agent
2. Enable **Code Interpreter** tool
3. Save agent
4. Use agent in conversation

**Request code execution:**
```
You: "Analyze this dataset and create a bar chart"
AI: [Writes Python code]
AI: [Executes code]
AI: [Returns results and/or generated files]
```

**What you can do:**

**Data Analysis:**
- Load CSV/Excel files
- Statistical analysis
- Data cleaning
- Pattern identification

**Visualizations:**
- Charts and graphs
- Plots and diagrams
- Data visualizations
- Exported as images

**Mathematical Computations:**
- Complex calculations
- Algorithmic problems
- Simulations
- Mathematical proofs

**File Processing:**
- Text processing
- File transformations
- Data format conversions
- Batch operations

### Example Code Interpreter Usage

**Example 1: Data Analysis**
```
You: [Upload sales.csv] "Calculate average sales by month and create a line chart"

AI: I'll analyze the data and create a visualization.
[Writes and executes Python code]
[Generates chart]

AI: Here's the line chart showing average monthly sales. The data shows...
[Chart image appears]
```

**Example 2: Mathematical Problem**
```
You: "Calculate the first 100 Fibonacci numbers and plot them"

AI: I'll compute the sequence and visualize it.
[Writes and executes Python code]

AI: Here are the first 100 Fibonacci numbers and their plot...
[Results and plot appear]
```

## Web Search Integration

### What Is Web Search?

**Web Search** allows AI to search the internet for current information.

**When to use:**
- Recent events or news
- Current prices or data
- Real-time information
- Facts beyond AI's training data
- Multiple source verification

### Using Web Search

**Enable via agent:**
1. Create or select agent
2. Enable **Web Search** tool
3. Save agent
4. Use agent in conversation

**Request web search:**
```
You: "What are the latest developments in AI this week?"

AI: [Performs web search]
AI: [Analyzes results]

AI: Based on recent news, here are the latest AI developments...
[Provides information with source citations]
```

**Search features:**
- Automatic search trigger when needed
- Multiple source analysis
- Citation and links
- Current information
- Fact verification

### Web Search Best Practices

1. **Be specific:** Clear questions get better search results
2. **Ask for sources:** Request citations for verification
3. **Recent info only:** Use web search for current data
4. **Verify critical info:** Cross-check important facts
5. **Respect rate limits:** Don't overuse (may have quotas)

## Code Artifacts (Generative UI)

### What Are Code Artifacts?

**Code Artifacts** are interactive code components that the AI generates and displays in the chat.

**Types of artifacts:**
- React components
- HTML/CSS demos
- Interactive visualizations
- Mini applications
- UI prototypes

**Benefits:**
- See code in action immediately
- Interactive previews
- Iterate quickly
- Visual feedback
- Shareable demos

### Using Code Artifacts

**Request artifact creation:**
```
You: "Create an interactive button that changes color when clicked"

AI: I'll create a React component for you.
[Generates code]
[Artifact appears with live preview]

AI: Here's an interactive button component. You can click it to see the color change.
[Live preview shows working button]
```

**Interact with artifacts:**
- View live preview
- See code behind it
- Request modifications
- Copy code
- Export artifact

**Modify artifacts:**
```
You: "Make the button larger and add a counter"

AI: I'll update the component.
[Modifies code]
[Artifact updates with changes]

AI: Updated! The button is now larger and shows a click counter.
```

### Artifact Use Cases

**UI Prototyping:**
- Quick mockups
- Component design
- Layout testing
- Interactive demos

**Learning:**
- Code examples
- Interactive tutorials
- Concept demonstrations
- Practice exercises

**Presentations:**
- Live demos
- Visual explanations
- Interactive slides
- Proof of concepts

## Advanced Workflows

### Chained Agents

Some configurations allow agents to call other agents:

**How it works:**
1. Agent encounters task beyond its scope
2. Automatically invokes specialist agent
3. Specialist completes subtask
4. Results return to original agent
5. Original agent continues

**Example:**
- Writing agent needs research
- Calls research agent
- Research agent searches documents
- Returns findings
- Writing agent incorporates research

### Automation with Presets and Prompts

Combine features for automated workflows:

**Example: Automated Report Generation**
1. Create agent with Code Interpreter and File Search
2. Create prompt template for report structure
3. Upload data files to agent
4. Use command `/report` with variables
5. Agent generates complete report

### Integration Patterns

**Pattern 1: Research and Synthesis**
- Agent with File Search + Web Search
- Searches internal documents
- Searches web for current info
- Synthesizes comprehensive answer

**Pattern 2: Code Development**
- Agent with Code Interpreter + Web Search
- Searches documentation (web)
- Generates code
- Tests code (interpreter)
- Provides working solution

**Pattern 3: Data Analysis Pipeline**
- Agent with Code Interpreter + File Search
- Loads data from files
- Performs analysis
- Generates visualizations
- Creates summary report

## Best Practices for Advanced Features

### MCP Usage

1. **Authenticate proactively:** Connect OAuth before needing tools
2. **Monitor expiration:** Reconnect tokens before they expire
3. **Minimal permissions:** Only enable needed tools
4. **Test tools:** Verify MCP tools work before relying on them
5. **Security awareness:** Be cautious with sensitive data access

### Memories Management

1. **Regular review:** Check what's remembered periodically
2. **Update outdated info:** Edit memories that change
3. **Be explicit:** Tell AI what to remember important details
4. **Privacy conscious:** Don't store sensitive information unnecessarily
5. **Fresh start option:** Clear memories for new contexts

### Multi-Conversation Efficiency

1. **Purposeful splits:** Use for meaningful comparisons
2. **Close unused panes:** Avoid clutter
3. **Organize by task:** Group related conversations
4. **Keyboard shortcuts:** Learn shortcuts for faster navigation
5. **Screen real estate:** Use larger screens for better experience

### Code Interpreter Safety

1. **Verify code:** Review generated code before execution
2. **Safe data:** Don't upload highly sensitive data
3. **Understand output:** Ensure you understand results
4. **Save important results:** Download generated files
5. **Reasonable requests:** Keep executions reasonable in scope

## Troubleshooting

### MCP Tool Not Working
**Solutions:**
- Check OAuth connection
- Reconnect if token expired
- Verify tool is enabled in agent
- Check administrator configuration
- Review error messages

### Memories Not Applying
**Solutions:**
- Verify memories are enabled
- Check memory exists in settings
- Be explicit about what information is relevant
- Try creating memory manually
- Refresh page

### Multi-Conversation Slow
**Solutions:**
- Close unnecessary panes
- Reduce to 2-3 conversations max
- Clear browser cache
- Check internet connection
- Use less complex models

### Code Interpreter Timeout
**Solutions:**
- Simplify code request
- Break into smaller steps
- Reduce data size
- Optimize algorithm
- Check execution limits

## Next Steps

Explore related features:

- **[Agents Marketplace](./04-agents.md)**: Create agents using advanced features
- **[File Management](./05-files.md)**: Upload files for Code Interpreter
- **[Prompts Library](./07-prompts.md)**: Create automated workflows
- **[Settings & Personalization](./10-settings.md)**: Configure advanced settings

---

**Master advanced features** to unlock TESSA's full potential!
