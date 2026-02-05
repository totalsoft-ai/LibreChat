# Conversations Management

Learn how to create, organize, search, and maintain your chat history effectively in TESSA.

## Creating Conversations

**New Chat Button:**
- Click **+ New Chat** in the top-left
- Select your AI model and start chatting
- Previous conversations are saved automatically

**From Agent or Preset:**
- Select an agent from **Agents Marketplace**
- Click **Start Chat** to open a conversation with the agent's configuration

**Conversation Titles:**
- Auto-generated from your first message using AI
- Can be renamed at any time
- Appears in the left sidebar

## Managing Conversations

**Rename:**
Hover over conversation → three dots (⋯) → Rename → Enter new title → Press Enter

**Naming tips:** Use descriptive titles, include dates for time-sensitive topics, keep under 50 characters

**Delete:**
Hover over conversation → three dots (⋯) → Delete → Confirm

> **Warning:** Deletion is permanent. Consider archiving if you might need the conversation later.

**Bulk deletion:** Settings > Data > Clear Conversations

**Archive:**
Hover over conversation → three dots (⋯) → Archive

**View archived:** Settings > General > Archived Chats > Click Unarchive to restore

> **Tip:** Archive completed projects or conversations you want to preserve but don't need active access to.

## Advanced Message Interactions

**Edit Your Messages:**
1. Hover over your message → Click Edit icon (pencil)
2. Make changes → Press Save or Enter
3. AI responds to the edited message
4. Creates a new branch (original preserved)

**Regenerate AI Responses:**
- Hover over AI message → Click Regenerate icon (circular arrow)
- Get a different response to the same prompt
- Previous responses saved as alternate branches
- Use arrow buttons to cycle through responses (1/3, 2/3, etc.)

**When to regenerate:** Response wasn't ideal, want different approaches, explore creative alternatives

**Copy Messages:**
Hover over any message → Click Copy icon (clipboard) → Paste wherever needed

Copies plain text, code blocks with syntax, and formatted text as markdown.

**Fork Conversations:**
Create new conversations branching from specific points.

**Why fork?** Explore different directions, test multiple approaches, save important moments as starting points

**How to fork:**
1. Hover over any message → Click Fork icon (branching symbol)
2. Choose from four options:
   - **Target Message Visible**: New conversation where target message is the last visible
   - **Target Message Included**: Target message becomes the first in the new chat
   - **Fork from This Message**: Include all messages up to and including target
   - **Fork from Parent Message**: Include all messages up to (but not including) target

After forking, a new conversation opens and both are saved independently with "(Fork)" in the new title.

## Search and Discovery

**Search Bar:**
TESSA uses MeiliSearch for instant full-text search:
- Type keywords in the search bar
- Results appear instantly as you type
- Searches message content and conversation titles
- Fuzzy search supports partial words

**Bookmarks:**

**Add bookmark:**
Click bookmark icon in conversation header → Select existing or create New Bookmark

**View by bookmark:**
Click bookmark icon in sidebar → Select bookmarks to filter → Click Clear All to remove filters

**Remove bookmark:**
Click bookmark icon in conversation header → Click same bookmark to deselect

**Uses:** Categorize by project/topic, frequently accessed conversations, active projects, conversations requiring follow-up

Multiple bookmarks can be applied per conversation. Bookmarks are user-specific and private.

## Conversation Branches

**Understanding Branches:**
When you edit a message or regenerate a response, TESSA creates branches—different paths your conversation can take. Each branch preserves alternative responses and edited messages.

**Navigate branches:**
- Look for arrow buttons (< >) next to messages
- Click arrows to cycle through alternatives
- Numbers show current branch (e.g., "2/3")
- Simply type a new message to continue from any branch

> **Tip:** Branches let you explore different approaches without losing work.

## Conversation Settings

**Adjust mid-conversation:**
Click settings icon in chat area or use right side panel to change:
- Temperature and model parameters
- Max tokens
- Attached files
- Tools and capabilities

New settings affect only new messages. Previous messages keep their original settings.

**Export history:** See [Export & Sharing](./06-export-share.md) for saving conversations in multiple formats.

## Best Practices

**Organization:**
- Name conversations immediately—don't rely on auto-generated titles
- Bookmark active projects for quick access
- Archive completed work to keep main list manageable
- Search before creating new conversations

**Efficient Workflow:**
- Fork for experimentation
- Regenerate for multiple perspectives
- Edit instead of rewriting to maintain context
- Copy important responses immediately

**Maintenance:**
- Regular cleanup: archive or delete old conversations monthly
- Keep bookmark list current
- Use search to find existing conversations before duplicating work

## Troubleshooting

**Conversation Won't Load:**
Refresh browser, check internet connection, clear browser cache, try different browser

**Search Not Finding Conversations:**
Check spelling, try different keywords, wait for search index to update, try partial words, look in archived conversations

**Lost Conversation:**
Use search with keywords, check Archived Chats (Settings > General)

