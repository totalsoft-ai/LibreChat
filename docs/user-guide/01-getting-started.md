# Getting Started with TESSA

Welcome to TESSA! This guide will help you get up and running with the platform, from your first login to starting your first conversation.

## What is TESSA?

TESSA (TotalSoft Enhanced Smart System Assistant) is a unified AI conversation platform that brings together multiple AI models from different providers into one powerful interface. 

### Key Benefits

- **One Platform, Multiple AI Models**: Access OpenAI, Anthropic, Google, and more from a single interface
- **Advanced Features**: Agents, prompts, file uploads, and powerful conversation management
- **Customizable**: Adjust settings, themes, and preferences to match your workflow
- **Organized**: Search, tag, and organize your conversations efficiently
- **Shareable**: Export and share your conversations in multiple formats

## Authentication Method

**To log in with domain account:**

1. Open TESSA in your web browser
2. Click the icon for your provider (e.g., **Continue with OpenID**)
3. Enter your organizational username
4. Enter your organizational password
5. Click **Sign In**
6. You'll be redirected back to TESSA and automatically logged in

> **Note:** Available domain login options depend on your administrator's configuration.


## Interface Overview

[![Interface Overview](/docs_images/image.png)](/docs_images/image.png)

Once logged in, you'll see the main TESSA interface divided into several key areas:

### Navigation Sidebar (Left)

The left sidebar is your command center for managing conversations:

- **New Chat** button: Start a fresh conversation
- **Search bar**: Find conversations by content or title
- **Conversations list**: Browse your recent conversations
- **Bookmarks**: Quick access to important conversations
- **Archived chats**: View conversations you've archived
- **Settings**: Access your preferences and configuration

### Chat Area (Center)

The main area where conversations happen:

- **Model selector**: Choose which AI model to use (top of chat)
- **Message history**: View the conversation thread
- **Input box**: Type your messages (bottom)
- **Attachments**: Add files, images, or other content
- **Send button**: Submit your message

### Side Panel (Right)

Contextual information and tools (can be toggled):

- **Agent settings**: Configure AI agents when selected
- **Conversation settings**: Adjust parameters for the current chat
- **File uploads**: Manage attached files
- **Prompt library**: Access saved prompts

### Top Bar

Quick access to important features:


- **Prompts**: Access your prompt library
- **User menu**: Account settings and logout
- **Theme toggle**: Switch between light and dark modes

## Starting Your First Conversation

Let's create your first conversation in TESSA!

### Step 1: Create a New Chat

1. Click the **+ New Chat** button in the top-left corner
2. The chat area will refresh with a blank conversation

### Step 2: Select an AI Model

1. Click on the **model selector** at the top of the chat area
   - You'll see options like "Gemma" 
2. Click on your preferred AI provider
3. Select a specific model (e.g., Local Models)
4. Optionally adjust settings like temperature or max tokens

> **Tip:** Not sure which model to choose? Start with gemma3:4b for balanced performance. See [AI Models & Configuration](./03-models.md) for details.

### Step 3: Type Your Message

1. Click in the message input box at the bottom
2. Type your question or prompt
3. Press **Enter** or click the **Send** button (paper plane icon)

**Example first message:**
```
Hello! Can you help me understand what you can do?
```

### Step 4: Wait for the Response

- The AI will begin generating a response
- You'll see a typing indicator while the response is being generated
- The response will appear in the chat as it's generated (streaming)

### Step 5: Continue the Conversation

- Type follow-up questions or requests
- The AI maintains context from the conversation
- Each new message builds on the previous discussion

## Basic Message Interactions

Once you have messages in your conversation, you can interact with them:

### Copy a Message

1. Hover over any message
2. Click the **Copy** icon (clipboard)
3. The message text is copied to your clipboard

### Regenerate a Response

1. Hover over an AI response
2. Click the **Regenerate** icon (circular arrow)
3. The AI will generate a new response to the same prompt

### Edit Your Message

1. Hover over your own message
2. Click the **Edit** icon (pencil)
3. Modify your message
4. Press **Enter** to submit the edited version
5. The AI will respond to the edited message

> **Note:** Editing a message creates a new branch in the conversation. See [Conversations Management](./02-conversations.md) for details on branches.

### Fork a Conversation

Create a new conversation starting from a specific message:

1. Hover over any message
2. Click the **Fork** icon (branching arrow)
3. Choose from four fork options:
   - **Fork with target message visible**: New conversation starts at this message
   - **Fork with target message included**: This message is the first in the new chat
   - **Fork from this message**: Include all messages up to this point
   - **Fork from parent message**: Start from the message before this one

## Navigation and Organization

### Renaming a Conversation

Give your conversation a meaningful title:

1. Click the conversation in the sidebar
2. Click the **three dots** menu (⋯) next to the conversation
3. Select **Rename**
4. Enter a new title
5. Press **Enter** or click away to save

> **Tip:** Conversations are automatically titled based on the first message, but you can change this anytime.

### Switching Between Conversations

- Click any conversation in the left sidebar to open it
- Use the search bar to find specific conversations
- Use keyboard shortcuts: `Ctrl/Cmd + K` to open quick search

### Using the Search Bar

Find conversations quickly:

1. Click the **search bar** at the top of the left sidebar
2. Type keywords from the conversation content or title
3. Results appear instantly as you type
4. Click a result to open that conversation

> **Note:** Search uses MeiliSearch for full-text search across all your conversations.

## Quick Tips for Beginners

### Getting Better Responses

- **Be specific**: Provide clear, detailed questions or instructions
- **Give context**: Explain what you're trying to achieve
- **Iterate**: Refine your prompts based on the responses you get
- **Use examples**: Show the AI what you want with examples

### Organizing Your Work

- **Name your conversations**: Give them descriptive titles
- **Use tags**: Add tags to categorize conversations (see [Conversations Management](./02-conversations.md))
- **Bookmark important chats**: Quick access to frequently used conversations
- **Archive old conversations**: Keep your workspace clean

### Keyboard Shortcuts

Common keyboard shortcuts to speed up your workflow:

- **Enter**: Send message
- **Shift + Enter**: New line in message (without sending)
- **Ctrl/Cmd + K**: Quick search conversations
- **Esc**: Close dialogs and modals

### Privacy and Security

- **Your conversations are private**: Only you (and administrators with appropriate permissions) can see them
- **Enable 2FA**: Add an extra layer of security to your account (see [Settings & Personalization](./10-settings.md))
- **Log out when done**: Especially on shared computers
- **Review shared links**: Check what you're sharing before creating public links

## What's Available to You

The features available in TESSA may vary based on:

- **Your user role**: Admins may have additional capabilities
- **System configuration**: Your administrator may enable or disable certain features
- **Subscription/credits**: Some features may require credits or specific subscription levels

> **Note:** If a feature mentioned in this guide isn't available to you, contact your system administrator.

## Getting Help

### Built-in Help

- Hover over interface elements to see tooltips
- Look for info icons (ⓘ) next to settings for explanations
- Check the status bar at the bottom for notifications

### Support Resources

- **Documentation**: Continue reading this user guide
- **FAQ**: See [Troubleshooting & FAQ](./11-faq.md) for common questions
- **Administrator**: Contact your TESSA administrator for system-specific questions
- **Community**: Visit the TESSA community forums or GitHub repository

## Common First-Time Questions

**Q: Which AI model should I use?**
A: Start with GPT-4 or Claude 3 Sonnet for general use. Each model has different strengths—experiment to find what works best for you.

**Q: Can I use multiple AI models in the same conversation?**
A: No, each conversation uses one model at a time. However, you can create multiple conversations with different models and compare results.

**Q: Are my conversations saved automatically?**
A: Yes, all conversations are saved automatically as you chat.

**Q: What happens if I lose my internet connection?**
A: You won't be able to send or receive messages, but your conversation history is preserved. Reconnect and continue where you left off.

## Next Steps

Now that you're familiar with the basics, explore these features:

1. **[Conversations Management](./02-conversations.md)**: Learn advanced conversation features like forking, tagging, and search
2. **[AI Models & Configuration](./03-models.md)**: Understand model parameters and create presets
3. **[Agents Marketplace](./04-agents.md)**: Discover pre-built AI agents with specialized capabilities
4. **[File Management](./05-files.md)**: Learn how to upload and work with files in conversations

---

**Congratulations!** You're now ready to use TESSA. Start exploring and discover how it can enhance your AI-powered workflows.
