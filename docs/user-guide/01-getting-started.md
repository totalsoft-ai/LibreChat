# Getting Started with TESSA

## What is TESSA?

TESSA (TotalSoft Enhanced Smart System Assistant) is an AI conversation platform that integrates multiple AI models from different providers into one interface.

## Authentication

**To log in:**

- Open TESSA in your browser
- Click your provider icon (e.g., **Continue with OpenID**)
- Enter your organizational credentials
- You'll be redirected and automatically logged in

## Interface Overview

The TESSA interface has four main areas:

**Navigation Sidebar (Left):**
- New Chat button - Start conversations
- Search bar - Find conversations by content/title
- Conversations list - Browse recent chats
- Bookmarks, Archived chats, Settings

**Chat Area (Center):**
- Model selector - Choose AI model
- Message history - View conversation thread
- Input box - Type messages
- Attachments, Send button

**Side Panel (Right):**
- Agent settings - Configure AI agents
- Conversation settings - Adjust parameters
- File uploads, Prompt library

**Top Bar:**
- Prompts library, User menu, Theme toggle

## Starting Your First Conversation

**Create and Configure:**
1. Click **+ New Chat** in the top-left
2. Click the **model selector** and choose an AI model (e.g., gemma3:4b for balanced performance)
3. Optionally adjust settings like temperature or max tokens

> **Tip:** See [AI Models & Configuration](./03-models.md) for model details.

**Send a Message:**
- Type your question in the input box
- Press **Enter** or click the **Send** button
- The AI will stream its response
- Continue with follow-up questions to build on the conversation

## Message Interactions

Hover over any message to access actions:

**Copy:** Click the clipboard icon to copy message text

**Regenerate:** Click the circular arrow to generate a new response

**Edit:** Click the pencil icon to modify your message, then press Enter. The AI responds to the edited version.

> **Note:** Editing creates a new conversation branch. See [Conversations Management](./02-conversations.md) for details.

**Fork:** Create a new conversation from any message with four options:
- Fork with target message visible
- Fork with target message included
- Fork from this message (include all prior messages)
- Fork from parent message

## Navigation and Organization

**Rename a Conversation:**
Click the conversation → three dots menu (⋯) → Rename → Enter title → Save

> **Tip:** Conversations are auto-titled but can be changed anytime.

**Search Conversations:**
Type keywords in the search bar at the top of the sidebar. Results appear instantly using full-text search across all conversations.

**Switch Conversations:**
Click any conversation in the sidebar to open it.

## Quick Tips

**Better Responses:**
- Be specific with clear, detailed questions
- Provide context about your goals
- Use examples to show what you want
- Iterate and refine your prompts

**Organization:**
- Give conversations descriptive titles
- Bookmark important chats for quick access
- Archive old conversations to keep your workspace clean

**Keyboard Shortcuts:**
- **Enter** - Send message
- **Shift + Enter** - New line without sending
- **Esc** - Close dialogs
