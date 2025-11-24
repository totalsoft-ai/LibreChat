# Export & Sharing

Learn how to export your conversations in multiple formats and share them with others through secure links.

## What You'll Learn

- Exporting conversations in different formats (PNG, TXT, MD, JSON, PDF, CSV)
- Configuring export options
- Creating shareable links
- Generating QR codes
- Managing shared conversations
- Revoking access to shared content
- Privacy and security considerations

## Exporting Conversations

### Why Export?

Export conversations to:
- Save important discussions for offline reference
- Create documentation from AI-assisted work
- Share insights with colleagues
- Archive conversations
- Include in reports or presentations
- Backup your data
- Process data in other applications

### Available Export Formats

TESSA supports six export formats:

| Format | Extension | Best For |
|--------|-----------|----------|
| **Screenshot** | `.png` | Visual sharing, presentations, social media |
| **Text** | `.txt` | Simple backup, plain text processing |
| **Markdown** | `.md` | Documentation, GitHub, version control |
| **JSON** | `.json` | Data processing, backup, migration |
| **PDF** | `.pdf` | Official documents, printing, archiving |
| **CSV** | `.csv` | Data analysis, spreadsheets, databases |

### How to Export a Conversation

**Step 1: Open Export Dialog**

1. Open the conversation you want to export
2. Click the **three dots** menu (⋯) in the conversation header or sidebar
3. Select **Export Conversation**
4. The export dialog opens

**Step 2: Choose Format**

1. In the export dialog, find the **Type** dropdown
2. Click to see available formats
3. Select your desired format:
   - screenshot (.png)
   - text (.txt)
   - markdown (.md)
   - json (.json)
   - PDF (.pdf)
   - csv (.csv)

**Step 3: Configure Filename**

1. In the **Filename** field, enter your desired name
2. Default: Conversation title (auto-sanitized)
3. Do not include file extension (added automatically)
4. Example: "Q4-Marketing-Strategy"

**Step 4: Configure Options**

Depending on format, you'll see these options:

**Include Endpoint Options:**
- Enabled for: Text, Markdown, JSON, PDF
- Disabled for: Screenshot, CSV
- **What it does:** Includes model settings and parameters
- **Enable when:** You want to preserve configuration details

**Export All Message Branches:**
- Enabled for: JSON, CSV
- Disabled for: Screenshot, Text, Markdown, PDF
- **What it does:** Exports all message variations (from regenerations and edits)
- **Enable when:** You want complete conversation history including alternatives

**Recursive or Sequential (JSON only):**
- Available only for JSON format
- **Recursive:** Nested message structure showing conversation tree
- **Sequential:** Linear list of messages
- **Choose recursive when:** You want to preserve conversation branches
- **Choose sequential when:** You want simple, linear message list

**Step 5: Export**

1. Review your settings
2. Click the **Export** button
3. File downloads to your default download folder
4. Check your downloads for the exported file

> **Tip:** The filename will be sanitized automatically (special characters removed, spaces converted to hyphens).

## Export Formats in Detail

### Screenshot (.png)

**What it includes:**
- Visual rendering of the conversation
- Messages formatted as they appear
- User and AI avatars
- Message timestamps
- Model indicators

**What it excludes:**
- Endpoint options (not applicable)
- Message branches (shows current branch only)

**Best for:**
- Quick sharing on social media
- Including in presentations
- Visual documentation
- Sharing on image-based platforms

**Characteristics:**
- High-quality PNG image
- Scrollable conversations captured in full
- Preserves formatting and colors
- Cannot be edited after export

**Example use case:**
```
You had a great conversation about marketing strategy.
Export as screenshot to share with your team on Slack.
```

### Text (.txt)

**What it includes:**
- Plain text of all messages
- User and AI labels
- Basic metadata (title, model, dates)
- Optional: endpoint options

**What it excludes:**
- Formatting (bold, italic, code blocks)
- Images (described as "[Image]")
- Message branches
- Structured data

**Best for:**
- Simple backup
- Email sharing
- Processing in text editors
- Quick reference

**Characteristics:**
- Smallest file size
- Universal compatibility
- No formatting
- Easy to search

**Example format:**
```
# Conversation Title

Model: GPT-4
Created: 2024-01-15

---

User: How do I create a marketing strategy?
