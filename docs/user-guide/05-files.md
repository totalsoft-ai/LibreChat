# File Management

Learn how to upload, manage, and work with files in your TESSA conversations.

## File Upload Basics

**How to Upload:**

**Click to Upload:**
Click attachment icon (paperclip) in message input → Browse and select files → Click Open

## Supported File Types

**Documents:**
- **PDF** (`.pdf`), **Word** (`.docx`), **Text** (`.txt`), **Markdown** (`.md`), **Rich Text** (`.rtf`)
- Use for: Questions about content, extracting info, comparing documents, translation, structure analysis

**Images:**
- **JPEG/JPG** (`.jpg`, `.jpeg`), **PNG** (`.png`), **GIF** (`.gif`), **WebP** (`.webp`), **HEIC** (converted automatically)
- Use for: Visual analysis, OCR/text extraction, chart/diagram understanding, comparing images

**Spreadsheets:**
- **Excel** (`.xlsx`, `.xls`), **CSV** (`.csv`)
- Use for: Data analysis, summaries, charts (with Code Interpreter), statistics, finding values, comparing datasets

**Code Files:**
- **Python** (`.py`), **JavaScript** (`.js`, `.jsx`, `.ts`, `.tsx`), **HTML/CSS** (`.html`, `.css`), **Java** (`.java`), **C/C++** (`.c`, `.cpp`, `.h`), and more
- Use for: Code review, bug identification, documentation generation, refactoring, security analysis, explaining functionality


## File Management

**Viewing Uploaded Files:**
- Files appear as thumbnails or cards in conversation
- Shows file name and type
- Open right side panel → **Files** tab to see all attached files

**Removing Files:**
- **Before sending**: Hover over thumbnail → Click **X** or **Remove**
- **After sending**: Files become part of message, cannot be removed without deleting message

**File Organization:**
- Each conversation keeps its own files (don't carry over to new conversations)
- Use agents with File Search for persistent file access
- Upload files to agent's knowledge base for access across conversations

## Working with Files

**Document Analysis Best Practices:**
- **Single document**: Upload file → Ask specific questions 
- **Multiple documents**: Upload all related files → Ask comparative questions → Request cross-references

## Advanced File Features

**File Search with Agents:**
Create or select agent → Enable **File Search** tool → Upload files to agent's knowledge base → Files become searchable across all conversations with that agent

**Benefits:** Persistent file access, automatic relevance search, citation generation, multi-file queries

**Use cases:** Product documentation support, research assistant with paper library, code helper with documentation, legal assistant with case files

**Setup:**
Agent configuration → Enable **File Search** tool → Click **Add Files** → Upload documents → Save agent → Use agent in conversations (automatically searches files)


## File Search & RAG Integration

**What is RAG (Retrieval-Augmented Generation)?**
When you attach files using "Attach files", they are automatically processed through RAG:
- **Text Extraction**: Documents, PDFs, code files → plain text
- **Embedding**: Text converted to vector embeddings
- **Vector Storage**: Stored in searchable database
- **Semantic Search**: AI finds relevant content based on meaning, not just keywords
- **Context Injection**: Relevant excerpts automatically added to AI prompts

**Automatic Indexing:**
 **All files attached through "Attach files"** are automatically indexed in the RAG database
- Files are processed in the background (dual storage: file storage + vector database)
- AI can search and retrieve relevant content from your files semantically
- Works for all conversations, agents, and workspace uploads

**Checking File Status:**
- Open Files panel → Look for status indicator
- **"Procesare RAG"** = Embedding in progress (usually 10-60 seconds)
- **"Indexat"** = Ready for File Search queries and semantic retrieval
- File is available immediately after upload, search capability enabled after processing completes

## Troubleshooting

**Upload Fails:**
Check file size (may exceed limit), verify file type is supported, check internet connection, try different browser, compress/convert file, check with administrator

**File Not Visible:**
Refresh page, check upload completed (look for checkmark), verify within size limits, try uploading again, clear browser cache

**AI Can't Read File:**
Verify file isn't corrupted, check file type is supported for analysis, ensure model has file reading capability, try converting to different format, re-upload file

**Poor Image Analysis:**
Upload higher quality image, ensure well-lit and clear, try different vision model, provide context with question, be more specific

**File Search Not Working (Agents):**
Verify File Search tool enabled, check files uploaded to agent (not just conversation), ensure files in supported format, ask more specific questions, re-upload files to agent's knowledge base

