# Advanced Features

Explore powerful advanced features that extend TESSA's capabilities beyond standard chat.

## Model Context Protocol (MCP)

**What Is MCP?**
Model Context Protocol is a standardized way for AI models to access external tools, data sources, and services.

**Key Concepts:**
- **MCP Servers**: Services that provide tools and data
- **MCP Tools**: Specific capabilities exposed by servers
- **OAuth Integration**: Secure authentication for protected resources
- **Standardized Communication**: Consistent protocol across different tools

**Benefits:** Access enterprise data systems, connect to custom tools, integrate with specialized services, extend AI capabilities, secure OAuth authentication


**Using MCP with Agents:**

1. **Select or Create Agent**: Go to Agents Marketplace or create new agent with MCP support

2. **Enable MCP Tools**: Agent configuration → Find **MCP Tools** section → Check tools to enable

3. **Configure OAuth (if needed)**: Click **Authenticate** → Complete OAuth flow in popup → Return to TESSA (tool now connected)

4. **Use Agent**: Start conversation → Agent can access enabled tools → Ask agent to perform operations (e.g., "Check my calendar for next week")

**OAuth Reconnection:**
- **Automatic**: System detects expired token → Prompts re-authentication → Complete OAuth → Agent resumes
- **Manual**: Agent settings → MCP tools section → Click **Reconnect** → Complete OAuth

> **Note:** MCP requires administrator configuration. Contact admin for specific tools/servers.

## Memories System

**What Are Memories?**
Memories allow AI to remember information about you across conversations.

**What It Remembers:** Preferences, facts you've shared, context from previous conversations, working style, important details

**Benefits:** Don't repeat yourself, consistent experience, personalized responses, better long-term assistance

**How Memories Work:**
- **Manual**: Explicitly tell AI to remember (e.g., "Remember that I prefer Python over JavaScript")
- **Usage**: AI references memories when relevant for personalized responses

**Viewing Memories:**
Settings or User Menu → **Memories** section → See list with what is remembered, creation date, source conversation

**Managing Memories:**
- **Create**: Say "Remember that [information]" or Settings → Memories → **Add Memory**
- **Edit**: Memories settings → Find memory → **Edit** → Modify → Save
- **Delete**: Memories settings → Find memory → **Delete** → Confirm
- **Clear All**: Memories settings → **Clear All Memories** → Confirm (permanent)

**Disable Memories:**
Settings > Memories → Toggle **Enable Memories** OFF

Existing memories preserved but not used, no new memories created.

## Multi-Conversation (Split Screen)

**What Is Multi-Conversation?**
Have multiple AI conversations side-by-side.

**Benefits:** Compare responses from different models, work on related tasks simultaneously, reference one conversation while working in another, parallel workflows

**Use Cases:** Compare GPT-4 vs Claude, research while writing, multiple project aspects, A/B testing prompts

**Enabling:**
Click **Multi-Conversation** or **Split View** button (or keyboard shortcut) → Chat area splits into panes

**Using:**
- **New conversation**: Click **+ New** in pane or drag conversation from sidebar to pane
- **Switch models**: Each pane can use different model, configure independently
- **Resize panes**: Drag divider between panes to adjust widths
- **Close panes**: Click close button on pane to return to single view

## Web Search

**What Is Web Search?**
AI can search the internet for current information beyond training data.

**Benefits:** Access recent news, current facts, real-time information, multiple sources with citations

**Availability:** Depends on configuration and API keys (contact administrator if not available)

**Using Web Search:**

**With Agents:**
Create or select agent → Enable **Web Search** tool → Use agent in conversation → Agent searches web when appropriate




## Code Artifacts (Generative UI)

**What Are Code Artifacts?**
Interactive code outputs that AI can generate and display directly in the chat interface.

**Supported Types:**
- **HTML/CSS/JavaScript**: Interactive web demos
- **React Components**: Dynamic UI elements
- **SVG Graphics**: Vector illustrations
- **PlantUML Diagrams**: Flowcharts, sequence diagrams
- **Charts and Visualizations**: Data visualizations

**How It Works:**
1. Ask AI to create something visual or interactive
2. AI generates code artifact
3. Artifact renders directly in chat
4. Interact with artifact, modify, or download code

**Example Requests:**
- "Create an interactive calculator"
- "Generate a flowchart for this process"
- "Build a simple todo app"
- "Create a bar chart from this data"

**Working with Artifacts:**
- **View code**: Click to see underlying code
- **Edit**: Modify artifact by asking AI for changes
- **Download**: Export code for use elsewhere
- **Share**: Artifact included in conversation exports

## Advanced Workflows

**Combining Features:**
- **MCP + Agents**: Access enterprise data through custom agents
- **Memories + Prompts**: Personalized prompt templates
- **Multi-Conversation + Web Search**: Research in one pane, write in another
- **Agents + File Search**: Knowledge base agents with document search
- **Code Artifacts + Code Interpreter**: Generate and execute interactive visualizations

**Best Practices:**
- Start simple, add features as needed
- Test workflows before sharing with team
- Document custom agent configurations
- Review memories periodically for accuracy
- Use appropriate models for each conversation pane

## Troubleshooting

**MCP Tools Not Available:**
Check with administrator, ensure agent has MCP tools enabled, verify OAuth authentication complete, check network connectivity

**OAuth Token Expired:**
Complete re-authentication flow, check connection status in agent settings, ensure browser allows popups

**Memories Not Working:**
Verify memories enabled in settings, check if specific memory exists, try manual memory creation, clear and recreate if corrupted

**Multi-Conversation Not Available:**
Check if feature enabled by administrator, try keyboard shortcut, ensure browser window large enough, refresh page

**Web Search Not Working:**
Verify web search enabled in agent/settings, check API keys configured (administrator), ensure network connectivity, try different query phrasing

**Code Artifacts Not Rendering:**
Refresh page, check browser compatibility, verify artifact code is valid, try simpler artifact first, clear browser cache
