# Conversations Management

Master the art of managing your conversations in TESSA. Learn how to create, organize, search, and maintain your chat history effectively.

## What You'll Learn

- Creating and managing conversations
- Advanced message interactions (edit, regenerate, fork)
- Searching and filtering conversations
- Using tags and bookmarks for organization
- Archiving and deleting conversations
- Understanding conversation branches

## Creating Conversations

### Starting a New Chat

**Method 1: New Chat Button**
1. Click the **+ New Chat** button in the top-left corner
2. A blank conversation opens with default settings
3. Select your AI model and start chatting

**Method 2: Keyboard Shortcut**
- Press `Ctrl/Cmd + Shift + N` (if configured)
- Quick way to start a fresh conversation

**Method 3: From Agent or Preset**
1. Select an agent from the **Agents Marketplace**
2. Click **Start Chat** or **Use Agent**
3. A new conversation opens with the agent's configuration

> **Tip:** Starting a new chat doesn't delete your previous conversation—it's saved automatically in your sidebar.

### Conversation Title

When you create a new conversation:
- It automatically receives a title based on your first message
- The title appears in the left sidebar
- You can rename it at any time

**Auto-generated titles:** TESSA uses AI to create descriptive titles from your conversation content.

## Managing Conversations

### Renaming Conversations

Give conversations meaningful names for easy reference:

1. **In the sidebar:**
   - Hover over a conversation
   - Click the **three dots** menu (⋯)
   - Select **Rename**
   - Type the new title
   - Press **Enter** to save

2. **While chatting:**
   - Click the conversation title at the top of the chat
   - Edit the title inline
   - Press **Enter** or click away to save

**Naming tips:**
- Use descriptive titles: "Q4 Marketing Strategy" instead of "Chat 1"
- Include dates for time-sensitive topics
- Use consistent naming patterns for related conversations
- Keep titles under 50 characters for better display

### Deleting Conversations

Permanently remove conversations you no longer need:

1. Hover over the conversation in the sidebar
2. Click the **three dots** menu (⋯)
3. Select **Delete**
4. Confirm the deletion in the dialog

> **Warning:** Deletion is permanent and cannot be undone. Consider archiving instead if you might need the conversation later.

**Bulk deletion:**
1. Go to **Settings** > **Data**
2. Click **Clear Conversations**
3. Select conversations to delete or clear all
4. Confirm your selection

### Archiving Conversations

Keep conversations for reference without cluttering your main list:

1. Hover over the conversation in the sidebar
2. Click the **three dots** menu (⋯)
3. Select **Archive**
4. The conversation moves to your archive

**Viewing archived conversations:**
1. Click **Settings** in the sidebar
2. Go to **General** tab
3. Click **Archived Chats**
4. Browse or search archived conversations
5. Click **Unarchive** to restore a conversation

> **Tip:** Archive completed projects, old research, or any conversation you want to preserve but don't need active access to.

## Advanced Message Interactions

### Editing Your Messages

Modify your messages after sending:

1. Hover over your message
2. Click the **Edit** icon (pencil)
3. Make your changes in the text editor
4. Press **Save** or **Enter**
5. The AI responds to your edited message

**What happens when you edit:**
- A new branch is created in the conversation
- The original message is preserved
- The AI generates a new response
- You can navigate between branches

> **Note:** Editing creates a fork in your conversation. You can return to the original branch at any time.

### Regenerating AI Responses

Get a different response to the same prompt:

1. Hover over the AI's message
2. Click the **Regenerate** icon (circular arrow)
3. The AI generates a new response
4. Previous responses are saved as alternate branches

**When to regenerate:**
- The response wasn't quite what you wanted
- You want to see different approaches
- The AI made an error
- You're exploring creative alternatives

**Multiple regenerations:**
- Keep regenerating to get more options
- Use arrow buttons to cycle through different responses
- Each regeneration is numbered (1/3, 2/3, 3/3, etc.)

### Copying Messages

Copy message content to your clipboard:

1. Hover over any message
2. Click the **Copy** icon (clipboard)
3. The message text is copied
4. Paste it wherever you need

**What gets copied:**
- Plain text content
- Code blocks (with syntax)
- Formatted text (as markdown)

> **Tip:** Use copy to save important responses, share insights, or paste into documents.

### Forking Conversations

Create new conversations branching from specific points:

**Why fork?**
- Explore different conversation directions
- Test multiple approaches
- Save important moments as starting points
- Organize complex discussions

**How to fork:**

1. Hover over any message (yours or the AI's)
2. Click the **Fork** icon (branching symbol)
3. Choose from four fork options:

#### Fork Option 1: Target Message Visible
Creates a new conversation where the target message is the last visible message.

**Use case:** You want to restart from this point but keep context up to here.

#### Fork Option 2: Target Message Included
Creates a new conversation starting with the target message.

**Use case:** This message is the perfect starting point for a new direction.

#### Fork Option 3: Fork from This Message
Includes all messages up to and including the target message.

**Use case:** You want to take the conversation in a new direction from this point.

#### Fork Option 4: Fork from Parent Message
Includes all messages up to (but not including) the target message.

**Use case:** You want to ask a different question instead of the target message.

**After forking:**
- A new conversation opens in a new tab/window
- The original conversation remains unchanged
- Both conversations are saved independently
- The new conversation has "(Fork)" in its title

## Search and Discovery

### Using the Search Bar

TESSA uses MeiliSearch for powerful, instant search:

**Basic search:**
1. Click the **search bar** at the top of the sidebar
2. Type your search query
3. Results appear instantly as you type
4. Click a result to open that conversation

**What you can search:**
- Message content (full-text search)
- Conversation titles
- Tags (see below)
- Dates (e.g., "january meetings")

**Search tips:**
- Use specific keywords for better results
- Search phrases with quotes: "exact phrase"
- Use partial words—search is fuzzy
- Recent conversations rank higher

### Advanced Search Techniques

**Search by date:**
- Type date-related terms: "last week," "january," "2024"
- Conversations from that time period appear

**Search by model:**
- Include the model name: "gpt-4," "claude"
- Find conversations using specific models

**Search by content type:**
- "code" - conversations with code blocks
- "image" - conversations with images
- "file" - conversations with attachments

> **Note:** Search performance depends on your number of conversations. With thousands of chats, search remains fast thanks to MeiliSearch indexing.

### Filtering Conversations

Narrow down your conversation list:

**By date:**
1. Click the **filter** icon in the sidebar
2. Select a date range
3. Only conversations from that period show

**By model/endpoint:**
1. Click the **filter** icon
2. Select specific AI models
3. View conversations using those models only


**Clear filters:**
- Click **Clear All** or the X next to each filter
- Return to viewing all conversations

### Using Bookmarks

Quick access to important conversations:

**Bookmark a conversation:**
1. Hover over a conversation in the sidebar
2. Click the **star** icon
3. The conversation moves to your Bookmarks section

**View bookmarks:**
1. Click **Bookmarks** in the sidebar
2. All bookmarked conversations appear
3. Click any conversation to open it

**Remove bookmark:**
1. Click the **star** icon again
2. The conversation returns to the main list

**When to use bookmarks:**
- Frequently accessed conversations
- Important reference materials
- Active projects
- Conversations you're monitoring

## Conversation Branches

### Understanding Branches

When you edit a message or regenerate a response, TESSA creates branches:

**What are branches?**
- Different paths your conversation can take
- Alternative responses to the same input
- Preserved history of edits and regenerations

**Navigating branches:**
- Look for **arrow buttons** (< >) next to messages
- Click arrows to cycle through alternatives
- The current branch number shows (e.g., "2/3")
- Each branch is fully preserved

**Branch indicators:**
- Messages with branches show navigation arrows
- Numbers indicate how many alternatives exist
- The active branch is what you currently see

### Working with Branches

**Switching branches:**
1. Find a message with branch indicators
2. Click the **left arrow** (<) for previous branches
3. Click the **right arrow** (>) for next branches
4. The conversation updates to show that branch

**Continuing from a branch:**
- Simply type a new message
- You're now following that branch
- Other branches remain accessible

**Finding your way:**
- Branch from your desired message
- Navigate branches to find the right path
- Continue from any branch you prefer

> **Tip:** Branches let you explore different approaches without losing your work. Use them to experiment!

## Conversation Settings

### Adjusting Mid-Conversation

Change settings without starting over:

**Access conversation settings:**
1. Click the **settings icon** in the chat area
2. Or use the right side panel
3. Adjust parameters as needed

**What you can change:**
- Temperature and other model parameters
- Max tokens
- Attached files
- Tools and capabilities

**When changes apply:**
- New settings affect only new messages
- Previous messages keep their original settings
- You can see which settings were used per message

### Conversation History

**View full history:**
- All messages are preserved
- Scroll up to see earlier messages
- Use search to jump to specific points

**Export history:**
- See [Export & Sharing](./06-export-share.md) for details
- Save conversations in multiple formats
- Preserve important discussions

## Best Practices

### Organization Strategy

1. **Name conversations immediately**: Don't rely on auto-generated titles
2. **Bookmark active projects**: Quick access to what you're working on
3. **Archive completed work**: Keep your main list manageable
4. **Search before creating**: Check if you already have a similar conversation

### Efficient Workflow

1. **Use keyboard shortcuts**: Faster than clicking
2. **Fork for experimentation**: Don't be afraid to branch out
3. **Regenerate for options**: Get multiple perspectives
4. **Edit instead of rewriting**: Saves time and maintains context
5. **Copy important responses**: Save insights immediately

### Maintenance

1. **Regular cleanup**: Archive or delete old conversations monthly
2. **Bookmark management**: Keep bookmarks list current
3. **Search usage**: Find existing conversations before duplicating work

## Troubleshooting

### Conversation Won't Load
**Problem:** Clicking a conversation doesn't open it

**Solutions:**
- Refresh your browser
- Check your internet connection
- Clear browser cache
- Try a different browser

### Search Not Finding Conversations
**Problem:** Search doesn't show conversations you know exist

**Solutions:**
- Check spelling and try different keywords
- Wait a moment for search index to update
- Try searching partial words
- Look in archived conversations


### Lost Conversation
**Problem:** Can't find a conversation you know you had

**Solutions:**
- Use search with keywords from the conversation
- Check **Archived Chats** in settings
- Sort conversations by date
- Check if it was accidentally deleted (check deletion history if available)

## Common Scenarios

### Scenario 1: Comparing Multiple Approaches

**Goal:** Get several AI responses to the same question

**Steps:**
1. Ask your question
2. Click **Regenerate** multiple times
3. Use arrows to review all responses
4. Choose the best one or combine insights

### Scenario 2: Organizing Project Conversations

**Goal:** Keep all project-related chats together

**Steps:**
1. Create conversations for different aspects
2. Tag all with the project name: "project-name"
3. Bookmark the most important ones
4. Use search or filter by tag to view all project chats

### Scenario 3: Exploring Different Directions

**Goal:** Try multiple conversation paths from one point

**Steps:**
1. Continue conversation to an important decision point
2. Fork from that message
3. Explore one direction in the fork
4. Return to original and fork again for another direction
5. Compare results across forks

### Scenario 4: Preserving Important Discussions

**Goal:** Save a valuable conversation for future reference

**Steps:**
1. Give it a descriptive title
2. Bookmark it
3. Consider exporting it (see [Export & Sharing](./06-export-share.md))
4. Do NOT archive unless you rarely need to access it

## Next Steps

Now that you know how to manage conversations, explore:

- **[AI Models & Configuration](./03-models.md)**: Fine-tune your AI responses
- **[Export & Sharing](./06-export-share.md)**: Share and save your conversations
- **[Prompts Library](./07-prompts.md)**: Create reusable prompts for common tasks
- **[Advanced Features](./09-advanced.md)**: Multi-conversation and other power features

---

**Master conversation management** to keep your work organized and easily accessible!
