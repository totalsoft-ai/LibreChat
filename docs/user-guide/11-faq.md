# Troubleshooting & FAQ

Find answers to common questions and solutions to frequently encountered issues.

## Frequently Asked Questions

### Getting Started

**Q: Can I use multiple AI models in the same conversation?**

A: No, each conversation uses one model at a time. However:
- Create multiple conversations with different models
- Use Multi-Conversation view for side-by-side comparison
- Switch models for new messages (previous messages keep original model)

---

**Q: Are my conversations private?**

A: Yes, with caveats:
- Conversations stored securely
- Administrators may have access (depending on configuration)
- Shared conversations are publicly accessible via link

---

**Q: How do I save my conversations?**

A: Conversations save automatically! You can also:
- Export conversations in multiple formats
- Organize with tags and bookmarks
- Archive for long-term storage
- Import/export for backup

---

**Q: Can I delete my data?**

A: Yes, full control:
- Delete individual conversations
- Clear all conversations at once
- Delete entire account
- Export data before deleting

See [Settings & Personalization](./09-settings.md).

---

**Q: Is there a limit to conversation length?**

A: Not typically, but:
- Very long conversations may slow down
- Models have context windows (token limits)
- Start new conversation if performance degrades

---

**Q: What happens if I lose internet connection?**

A: Can't send/receive messages, previous messages remain visible, draft messages may be saved, reconnect and continue

---

### Using Features

**Q: How do I upload files?**

A: Three methods:
1. Click paperclip icon in chat input
2. Drag and drop files onto chat
3. Paste images (Ctrl/Cmd+V)

See [File Management](./05-files.md).

---

**Q: What file types are supported?**

A: Most common types:
- **Documents:** PDF, DOCX, TXT, MD
- **Images:** JPG, PNG, GIF, WebP, HEIC
- **Spreadsheets:** XLSX, CSV
- **Code:** Most programming languages

---

**Q: How do I use agents?**

A:
1. Browse Agents Marketplace
2. Find agent for your task
3. Click on **Start Chat**
4. Start conversation with agent
5. Agent uses configured tools and settings

See [Agents Marketplace](./04-agents.md).

---

**Q: What's the difference between a preset and an agent?**

A:
- **Preset:** Saved model configuration (model, temperature, tokens)
- **Agent:** Complete AI assistant with instructions, tools, knowledge base

Agents are more comprehensive.

---

**Q: How do I share a conversation?**

A: See [Export & Sharing](./06-export-share.md):
- Export as file (PNG, TXT) and share file
- Create shareable link for web viewing
- Generate QR code

---

**Q: Can I edit messages after sending?**

A: Yes! Hover over message > Click edit (pencil) icon > Make changes > Save. AI responds to edited version and creates new branch.

---

**Q: What are conversation branches?**

A: When you edit a message or regenerate response, TESSA creates alternative paths. Navigate between branches with arrow buttons, keep all alternatives, continue from any branch (see "2/3" indicator).

---

### Troubleshooting

**Q: Messages aren't sending**

A: Try:
1. Check internet connection
2. Refresh page
3. Check rate limits
4. Verify API keys configured (admin)
5. Try different browser
6. Clear browser cache
7. Check browser console for errors

---

**Q: I can't see a conversation I had earlier**

A: Check:
1. Search using search bar
2. **Archived Chats** (Settings > General)
3. Scroll down in sidebar
4. Check filters
5. Verify correct account

---

**Q: File upload failed**

A: Common causes:
1. File too large (check limits with admin)
2. Unsupported format
3. Connection issue
4. Corrupt file
5. Try different browser

---

**Q: AI responses are cut off/incomplete**

A: Fixes:
1. Increase Max Tokens in settings
2. Type "Please continue" to get more
3. Break request into smaller parts
4. Try different model
5. Lower temperature for focused responses

---

**Q: Search isn't finding my conversations**

A: Try:
1. Different keywords
2. Check spelling
3. Wait for search index to update
4. Check archived conversations
5. Clear active filters
6. Reload page

---

**Q: Agent isn't working as expected**

A: Troubleshooting:
1. Review and refine agent instructions
2. Verify needed tools enabled
3. Check files uploaded to agent
4. Try different model
5. Test in new conversation
6. Edit and save agent for new version

---

**Q: Can't log in**

A: Solutions:
1. Reset password if forgotten
2. Use backup code if device lost (2FA)
3. Try different browser
4. Clear browser cache and cookies
5. Check caps lock is off
6. Verify account exists/not deleted
7. Contact administrator

---

**Q: Settings won't save**

A: Try:
1. Check internet connection
2. Reload page and try again
3. Try different browser
4. Disable browser extensions
5. Clear browser cache
6. Check browser allows local storage

---

### Features and Permissions

**Q: Can I create my own agents?**

A: Yes! If enabled:
1. Go to Agents section
2. Click **Create New Agent**
3. Configure settings, tools, instructions
4. Save and use

See [Agents Marketplace](./04-agents.md).

---

**Q: How do I use variables in prompts?**

A: Use `{{variable_name}}` syntax:
```
Hello {{name}}, please review {{document_type}}...
```

When using prompt, you'll be prompted to fill in variables. See [Prompts Library](./07-prompts.md).

---

**Q: What is MCP?**

A: **Model Context Protocol** connects AI to external tools and data sources. Enables database access, API integrations, custom tools, OAuth-protected resources. Requires admin setup. See [Advanced Features](./08-advanced.md).

---

### Privacy and Security

**Q: What data is stored about me?**

A: Typically:
- Account information (email, username)
- Conversations and messages
- Files uploaded
- Settings and preferences
- Usage statistics
- API keys/tokens created

---

### Best Practices

**Q: How can I get better AI responses?**

A: Tips:

**Be specific:**
- ❌ "Write about marketing"
- ✅ "Write a 500-word blog post about email marketing for small businesses"

**Provide context:** Include background, explain goal, mention audience, define constraints

**Iterate:** Start general, refine based on response, ask follow-ups, regenerate for alternatives

**Use features:** Agents for specialized tasks, prompts for consistency, files for context, examples

---

**Q: How should I organize my conversations?**

A: Best practices:
1. Name clearly: Descriptive titles
2. Bookmark important: Quick access
3. Archive completed: Keep list manageable
4. Search often: Find before creating duplicates

---

**Q: When should I start a new conversation?**

A: **Start new when:**
- Changing topics significantly
- Previous conversation too long
- Want clean context
- Comparing approaches (different models)
- Organizing work (project separation)

**Continue existing when:**
- Following up on same topic
- Context from earlier is relevant
- Building on previous responses
- Working through a problem

---

**Q: How can I improve my prompt writing?**

A: Structure:
```
Role: You are an expert [X]
Task: [What you want done]
Context: [Relevant background]
Format: [How you want output]
Constraints: [Limitations, requirements]
```

**Examples:** Show examples of desired output, demonstrate style/format, provide references

**Clarity:** Be explicit, use bullet points, define terms, specify do's and don'ts

**Iteration:** Start simple, refine based on results, save successful prompts, version control

See [Prompts Library](./07-prompts.md).

---

### Technical Questions

**Q: What browsers are supported?**

A: Works best in:
- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

---

**Q: Can I use TESSA offline?**

A: No, requires internet:
- Connection to AI providers needed
- Cloud-based processing
- Syncs data across devices

Some features like STT may work offline in certain browsers, but core functionality requires internet.

---

## Common Error Messages

### "Rate limit exceeded"

**Meaning:** Too many requests in short time

**Solutions:** Wait a few minutes, space out requests, check if multiple users on same account, contact admin if limits too restrictive

---

### "Invalid API key" or "Authentication failed"

**Meaning:** API credentials not configured or expired

**Solutions:** Contact administrator, re-authenticate OAuth, check if service configured, verify account permissions

---

### "Model not available"

**Meaning:** Selected model isn't accessible

**Solutions:** Choose different model, check with admin about access, verify subscription/credits, model may be temporarily down

---

### "File too large"

**Meaning:** File exceeds size limit

**Solutions:** Compress file, split into smaller parts, use different format, check size limits with admin

---

### "Conversation not found"

**Meaning:** Conversation doesn't exist or no access

**Solutions:** Check correct account, verify not deleted, check if shared (access revoked), refresh page



### "Network error" or "Connection failed"

**Meaning:** Can't reach server

**Solutions:** Check internet, refresh page, clear cache, check service status, try different network, disable VPN temporarily

---
