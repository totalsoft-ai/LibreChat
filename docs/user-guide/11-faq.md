# Troubleshooting & FAQ

Find answers to common questions and solutions to frequently encountered issues.

## Frequently Asked Questions

### Getting Started

**Q: Which AI model should I use?**

A: It depends on your needs:
- **General use:** GPT-4 or Claude 3 Sonnet
- **Complex tasks:** GPT-4 Turbo or Claude 3 Opus
- **Quick tasks:** GPT-3.5 Turbo or Claude 3 Haiku
- **Image analysis:** GPT-4 Vision or Gemini Pro Vision
- **Long documents:** Claude models (up to 200K tokens)

Start with GPT-4 or Claude Sonnet and adjust based on results.

---

**Q: Can I use multiple AI models in the same conversation?**

A: No, each conversation uses one model at a time. However, you can:
- Create multiple conversations with different models
- Use Multi-Conversation view to compare side-by-side
- Switch models for new messages (but previous messages keep their original model)

---

**Q: Are my conversations private?**

A: Yes, with these caveats:
- Your conversations are stored securely
- Administrators may have access (depending on configuration)
- Shared conversations are publicly accessible via link
- AI providers (OpenAI, Anthropic, etc.) may log requests per their policies
- Don't share highly sensitive information

---

**Q: Can I access TESSA on mobile?**

A: Yes! TESSA works in mobile browsers, though the experience is optimized for desktop. Features available on mobile:
- All core chat functionality
- File uploads
- Settings
- Speech features (STT/TTS)
- Most agent features

Some features like Multi-Conversation view work better on larger screens.

---

**Q: How do I save my conversations?**

A: Conversations save automatically! No action needed. Every message is stored immediately. You can also:
- Export conversations in multiple formats
- Organize with tags and bookmarks
- Archive for long-term storage
- Import/export for backup

---

**Q: Can I delete my data?**

A: Yes, you have full control:
- Delete individual conversations
- Clear all conversations at once
- Delete your entire account
- Export data before deleting

See [Settings & Personalization](./10-settings.md) for details.

---

**Q: Is there a limit to conversation length?**

A: Not typically, but consider:
- Very long conversations may slow down
- Models have context windows (token limits)
- Claude handles longer contexts (200K tokens)
- Start new conversation if performance degrades

---

**Q: What happens if I lose internet connection?**

A:
- You can't send/receive messages without connection
- Previous messages remain visible
- Draft messages may be saved by browser
- Reconnect and continue where you left off

---

### Using Features

**Q: How do I upload files?**

A: Three methods:
1. Click paperclip icon in chat input
2. Drag and drop files onto chat
3. Paste images directly (Ctrl/Cmd+V)

See [File Management](./05-files.md) for details.

---

**Q: What file types are supported?**

A: Most common types:
- **Documents:** PDF, DOCX, TXT, MD
- **Images:** JPG, PNG, GIF, WebP, HEIC
- **Spreadsheets:** XLSX, CSV
- **Code:** Most programming languages
- **Audio:** MP3, WAV, M4A (if transcription enabled)

---

**Q: How do I use agents?**

A:
1. Browse Agents Marketplace
2. Find agent for your task
3. Click **Install** or **Use**
4. Start conversation with agent
5. Agent automatically uses its configured tools and settings

See [Agents Marketplace](./04-agents.md) for complete guide.

---

**Q: What's the difference between a preset and an agent?**

A:
- **Preset:** Saved model configuration (model, temperature, tokens, etc.)
- **Agent:** Complete AI assistant with instructions, tools, and knowledge base

Agents are more comprehensive; presets are just settings.

---

**Q: How do I share a conversation?**

A: See [Export & Sharing](./06-export-share.md):
- Export as file (PNG, PDF, etc.) and share file
- Create shareable link for web viewing
- Generate QR code for easy sharing

---

**Q: Can I edit messages after sending?**

A: Yes!
- Hover over your message
- Click edit (pencil) icon
- Make changes
- Save
- AI responds to edited version
- Creates new conversation branch

---

**Q: What are conversation branches?**

A: When you edit a message or regenerate a response, TESSA creates alternative paths (branches). You can:
- Navigate between branches with arrow buttons
- Keep all alternatives
- Continue from any branch
- See which branch you're on (e.g., "2/3")

---

### Troubleshooting

**Q: Messages aren't sending**

A: Try these solutions:
1. Check internet connection
2. Refresh the page
3. Check if you've reached rate limits
4. Verify API keys are configured (admin)
5. Try different browser
6. Clear browser cache
7. Check browser console for errors

---

**Q: I can't see a conversation I had earlier**

A: Check these locations:
1. Search for it using the search bar
2. Check **Archived Chats** (Settings > General)
3. Scroll down in sidebar (older conversations)
4. Check filters—might be hidden
5. Verify you're logged into correct account

---

**Q: Export isn't working**

A: Troubleshooting:
1. **PDF export:** Requires puppeteer—may not be installed
2. **Large conversations:** May timeout—try smaller sections
3. **File size:** Very large conversations may fail—export as JSON instead
4. **Permissions:** Check browser allows downloads
5. **Format:** Try different export format

---

**Q: File upload failed**

A: Common causes:
1. **File too large:** Check size limits with admin
2. **Unsupported format:** Verify file type is supported
3. **Connection:** Check internet connection
4. **Corrupt file:** Try different file
5. **Browser:** Try different browser

---

**Q: Speech/microphone not working**

A: Solutions:
1. **Permissions:** Allow microphone in browser
2. **Hardware:** Check microphone is connected and working
3. **Settings:** Verify STT is enabled in settings
4. **Browser:** Try different browser (Chrome works best)
5. **Privacy settings:** Check OS microphone permissions
6. **Sensitivity:** Adjust decibel threshold (Advanced mode)

---

**Q: AI responses are cut off/incomplete**

A: Possible fixes:
1. **Token limit:** Increase Max Tokens in settings
2. **Continue:** Type "Please continue" to get more
3. **Simplify:** Break request into smaller parts
4. **Model choice:** Try different model
5. **Temperature:** Lower temperature for more focused responses

---

**Q: Search isn't finding my conversations**

A: Try:
1. **Different keywords:** Use various search terms
2. **Spelling:** Check spelling
3. **Wait:** Give search index time to update
4. **Archived:** Check archived conversations
5. **Filters:** Clear any active filters
6. **Refresh:** Reload the page

---

**Q: Agent isn't working as expected**

A: Troubleshooting:
1. **Instructions:** Review and refine agent instructions
2. **Tools:** Verify needed tools are enabled
3. **Files:** Check files uploaded to agent (if using File Search)
4. **Model:** Try different model
5. **Test:** Test in new conversation
6. **Update:** Edit and save agent to create new version

---

**Q: Can't log in**

A: Solutions:
1. **Password:** Reset password if forgotten
2. **2FA:** Use backup code if device lost
3. **Browser:** Try different browser
4. **Cache:** Clear browser cache and cookies
5. **Caps Lock:** Check caps lock is off
6. **Account:** Verify account exists/not deleted
7. **Admin:** Contact administrator

---

**Q: Settings won't save**

A: Try:
1. **Connection:** Check internet connection
2. **Refresh:** Reload page and try again
3. **Browser:** Try different browser
4. **Extensions:** Disable browser extensions
5. **Cache:** Clear browser cache
6. **Permissions:** Check browser allows local storage

---

### Features and Permissions

**Q: Why can't I see/use a certain feature?**

A: Features may be unavailable because:
- **Configuration:** Administrator disabled it
- **Permissions:** Your account role lacks access
- **Subscription:** Feature requires higher tier
- **Beta:** Feature is in beta/testing phase

Contact your administrator for access.

---

**Q: Can I create my own agents?**

A: Yes! If enabled by your administrator:
1. Go to Agents section
2. Click **Create New Agent**
3. Configure settings, tools, instructions
4. Save and use

See [Agents Marketplace](./04-agents.md) for complete guide.

---

**Q: How do I use variables in prompts?**

A: Use `{{variable_name}}` syntax:
```
Hello {{name}}, please review {{document_type}}...
```

When using prompt, you'll be prompted to fill in variables.

See [Prompts Library](./07-prompts.md) for details.

---

**Q: What is MCP?**

A: **Model Context Protocol** connects AI to external tools and data sources. Enables:
- Database access
- API integrations
- Custom tools
- OAuth-protected resources

Requires administrator setup. See [Advanced Features](./09-advanced.md).

---

**Q: How do I use Code Interpreter?**

A:
1. Create/use agent with Code Interpreter enabled
2. Request code execution or analysis
3. AI writes and runs Python code
4. Results appear in chat
5. Can generate files, charts, etc.

See [Advanced Features](./09-advanced.md) for examples.

---

### Privacy and Security

**Q: How secure is TESSA?**

A: TESSA implements:
- Encrypted connections (HTTPS)
- Secure authentication
- Database encryption
- Rate limiting
- Input validation
- Regular security updates

Your deployment's security also depends on administrator configuration.

---

**Q: Should I enable 2FA?**

A: **Yes, strongly recommended!** 2FA adds significant security:
- Protects even if password compromised
- Prevents unauthorized access
- Industry best practice
- Easy to set up

See [Settings & Personalization](./10-settings.md) for setup guide.

---

**Q: What data is stored about me?**

A: Typically stored:
- Account information (email, username)
- Conversations and messages
- Files you upload
- Settings and preferences
- Usage statistics
- API keys/tokens you create

Check your deployment's privacy policy for specifics.

---

**Q: Can I use TESSA for sensitive data?**

A: Consider carefully:
- **Company policies:** Check if allowed
- **Data classification:** What level of sensitivity?
- **Regulations:** GDPR, HIPAA, etc. compliance
- **Configuration:** How is your instance configured?
- **AI providers:** Their data handling policies

For highly sensitive data, use self-hosted deployment with appropriate safeguards or avoid AI tools.

---

**Q: How long are conversations stored?**

A: Depends on configuration:
- Usually stored indefinitely until you delete
- Some deployments have retention policies
- Check with your administrator
- You can delete anytime in settings

---

### Best Practices

**Q: How can I get better AI responses?**

A: Follow these tips:

**Be specific:**
- ❌ "Write about marketing"
- ✅ "Write a 500-word blog post about email marketing for small businesses"

**Provide context:**
- Include relevant background
- Explain your goal
- Mention your audience
- Define constraints

**Iterate:**
- Start with general question
- Refine based on response
- Ask follow-ups
- Use regenerate for alternatives

**Use features:**
- Agents for specialized tasks
- Prompts for consistency
- Files for context
- Examples in your prompts

---

**Q: How should I organize my conversations?**

A: Best practices:
1. **Name clearly:** Descriptive titles
2. **Tag consistently:** Use standard tags
3. **Bookmark important:** Quick access
4. **Archive completed:** Keep list manageable
5. **Search often:** Find before creating duplicates

---

**Q: When should I start a new conversation?**

A: Start new conversation when:
- Changing topics significantly
- Previous conversation is too long (performance)
- Want clean context (no prior discussion)
- Comparing approaches (different models)
- Organizing work (project separation)

Continue existing when:
- Following up on same topic
- Context from earlier is relevant
- Building on previous responses
- Working through a problem

---

**Q: How can I improve my prompt writing?**

A: Tips for better prompts:

**Structure:**
```
Role: You are an expert [X]
Task: [What you want done]
Context: [Relevant background]
Format: [How you want output]
Constraints: [Limitations, requirements]
```

**Examples:**
- Show examples of desired output
- Demonstrate style/format
- Provide reference materials

**Clarity:**
- Be explicit, not implicit
- Use bullet points
- Define terms
- Specify do's and don'ts

**Iteration:**
- Start simple
- Refine based on results
- Save successful prompts
- Version control

See [Prompts Library](./07-prompts.md) for detailed guide.

---

### Technical Questions

**Q: What browsers are supported?**

A: TESSA works best in:
- **Chrome/Chromium** (recommended)
- **Firefox**
- **Safari**
- **Edge**

Mobile browsers also supported. Latest versions recommended.

---

**Q: Can I use TESSA offline?**

A: No, TESSA requires internet:
- Needs connection to AI providers
- Cloud-based processing
- Syncs data across devices

Some features like STT may work offline in certain browsers, but core functionality requires internet.

---

**Q: Is there an API?**

A: TESSA has an API for:
- Programmatic access
- Integrations
- Automation
- Custom applications

Check with your administrator about API access and documentation.

---

**Q: Can I self-host TESSA?**

A: Yes! TESSA is open source:
- Full control over data
- Custom configuration
- On-premises deployment
- Enhanced privacy

See TESSA GitHub repository for installation instructions.

---

**Q: How often is TESSA updated?**

A:
- Regular updates and improvements
- Security patches as needed
- Feature releases
- Check GitHub or changelog

Your deployment update schedule depends on administrator.

---

## Common Error Messages

### "Rate limit exceeded"

**Meaning:** Too many requests in short time

**Solutions:**
- Wait a few minutes
- Space out requests
- Check if multiple users on same account
- Contact admin if limits too restrictive

---

### "Invalid API key" or "Authentication failed"

**Meaning:** API credentials not configured or expired

**Solutions:**
- Contact administrator
- Re-authenticate OAuth connections
- Check if service is configured
- Verify account permissions

---

### "Model not available"

**Meaning:** Selected model isn't accessible

**Solutions:**
- Choose different model
- Check with administrator about access
- Verify subscription/credits
- Model may be temporarily down

---

### "File too large"

**Meaning:** Uploaded file exceeds size limit

**Solutions:**
- Compress file
- Split into smaller parts
- Use different format
- Check size limits with admin

---

### "Conversation not found"

**Meaning:** Conversation doesn't exist or no access

**Solutions:**
- Check you're logged into correct account
- Verify conversation wasn't deleted
- Check if conversation was shared (access revoked)
- Try refreshing page

---

### "Network error" or "Connection failed"

**Meaning:** Can't reach server

**Solutions:**
- Check internet connection
- Try refreshing page
- Clear browser cache
- Check if service is down (status page)
- Try different network
- Disable VPN temporarily

---

## Getting Additional Help

### Before Contacting Support

1. **Check this guide:** Search for your issue
2. **Try troubleshooting:** Follow suggested solutions
3. **Reproduce:** Can you make it happen again?
4. **Gather info:** Screenshots, error messages, steps to reproduce
5. **Check status:** Verify service isn't experiencing outage

### When Contacting Support

Include:
- **Clear description:** What you were trying to do
- **What happened:** Actual result vs. expected
- **Steps to reproduce:** How to recreate the issue
- **Environment:** Browser, OS, device
- **Screenshots:** If applicable
- **Error messages:** Exact text
- **Account info:** Username (not password!)

### Support Resources

- **Administrator:** First point of contact for your deployment
- **Documentation:** This user guide and other docs
- **Community Forums:** TESSA community discussions
- **GitHub:** Issues and bug reports
- **Official website:** Latest news and announcements

### Feature Requests

Have an idea for improvement?
1. Check if already suggested
2. Describe use case clearly
3. Explain benefits
4. Submit to appropriate channel (admin, GitHub, forums)

---

## Tips for Success

### For New Users

1. **Start simple:** Learn basics before advanced features
2. **Experiment:** Try different models and settings
3. **Read guides:** Use this documentation
4. **Ask questions:** Use AI to learn about AI
5. **Save good prompts:** Build your library

### For Power Users

1. **Master shortcuts:** Learn keyboard shortcuts
2. **Create agents:** Build specialized assistants
3. **Organize systematically:** Consistent tagging and naming
4. **Use Multi-Conversation:** Compare and parallelize
5. **Contribute:** Share agents and prompts with team

### For Teams

1. **Standardize:** Agree on naming conventions
2. **Share resources:** Agents, prompts, best practices
3. **Document:** Create internal guides
4. **Train:** Help team members learn features
5. **Feedback:** Share what works and what doesn't

---

## Quick Reference

### Keyboard Shortcuts

(May vary by configuration)

- **Ctrl/Cmd + Enter:** Send message
- **Ctrl/Cmd + K:** Quick search
- **Shift + Enter:** New line in message
- **Esc:** Close modal/dialog
- **Tab:** Navigate fields

### Common Workflows

**Quick question:**
1. New chat
2. Ask question
3. Get answer
4. Done

**Research project:**
1. Create agent with File Search
2. Upload research documents
3. Start conversation
4. Ask questions, get citations
5. Export findings

**Code development:**
1. Create agent with Code Interpreter
2. Upload data/requirements
3. Request code generation
4. Review and test
5. Iterate to refine

**Content creation:**
1. Create content prompts with variables
2. Use commands for quick access
3. Fill in specifics for each piece
4. Refine with regenerate
5. Export final version

---

**Still have questions?** Contact your TESSA administrator or consult the community forums!

## Related Documentation

- **[Getting Started](./01-getting-started.md)**: Begin using TESSA
- **[Conversations Management](./02-conversations.md)**: Organize your chats
- **[AI Models & Configuration](./03-models.md)**: Optimize AI responses
- **[Agents Marketplace](./04-agents.md)**: Use specialized assistants
- **[File Management](./05-files.md)**: Work with files
- **[Export & Sharing](./06-export-share.md)**: Share your work
- **[Prompts Library](./07-prompts.md)**: Reusable templates
- **[Speech & Audio](./08-speech.md)**: Voice features
- **[Advanced Features](./09-advanced.md)**: Power user features
- **[Settings & Personalization](./10-settings.md)**: Customize TESSA

---

**Happy chatting!** We hope this guide helps you make the most of TESSA.
