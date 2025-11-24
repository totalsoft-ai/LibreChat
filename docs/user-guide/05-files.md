# File Management

Learn how to upload, manage, and work with files in your TESSA conversations.

## What You'll Learn

- Uploading files to conversations
- Supported file types and formats
- Drag and drop functionality
- File preview and management
- Working with different file types
- Removing and managing uploaded files
- File size limits and restrictions

## File Upload Basics

### Why Upload Files?

Upload files to:
- Analyze documents and PDFs
- Work with images (vision models)
- Process spreadsheets and data
- Review code files
- Transcribe audio (if supported)
- Provide context from documents

### How to Upload Files

**Method 1: Click to Upload**
1. Click the **attachment icon** (paperclip) in the message input area
2. A file picker dialog opens
3. Browse and select your file(s)
4. Click **Open**
5. File(s) upload and appear as thumbnails

**Method 2: Drag and Drop**
1. Locate your file in your file explorer
2. Drag the file over the chat window
3. Drop it onto the upload area
4. File uploads automatically

**Method 3: Paste Images**
1. Copy an image to your clipboard (screenshot, copied image)
2. Click in the message input
3. Press `Ctrl+V` (Windows/Linux) or `Cmd+V` (Mac)
4. Image uploads directly

> **Tip:** You can upload multiple files at once using any of these methods.

### Upload Indicators

While uploading:
- **Progress bar**: Shows upload percentage
- **File thumbnail**: Preview of the file
- **File name**: Displays below thumbnail
- **File size**: Shows file size
- **Cancel button**: Stop upload if needed

After upload:
- **Checkmark**: Upload successful
- **Remove button**: Delete file before sending
- **File preview**: Click to view/expand

## Supported File Types

### Documents

**Supported formats:**
- **PDF**: `.pdf` - Portable Document Format
- **Word**: `.docx`, `.doc` - Microsoft Word documents
- **Text**: `.txt` - Plain text files
- **Markdown**: `.md` - Markdown documents
- **Rich Text**: `.rtf` - Rich Text Format

**What you can do:**
- Ask questions about content
- Summarize documents
- Extract specific information
- Compare multiple documents
- Translate content
- Analyze structure

**Example interactions:**
```
You: [Uploads contract.pdf] "What are the payment terms?"
AI: [Analyzes PDF] "The payment terms specify..."

You: [Uploads report.docx] "Summarize the key findings"
AI: [Reads document] "The main findings are..."
```

### Images

**Supported formats:**
- **JPEG/JPG**: `.jpg`, `.jpeg` - Standard photos
- **PNG**: `.png` - Portable Network Graphics
- **GIF**: `.gif` - Graphics Interchange Format
- **WebP**: `.webp` - Modern image format
- **HEIC**: `.heic` - iPhone photos (converted automatically)
- **BMP**: `.bmp` - Bitmap images

**What you can do:**
- Describe image content
- Extract text from images (OCR)
- Analyze charts and graphs
- Identify objects and people
- Compare images
- Get creative suggestions

**Example interactions:**
```
You: [Uploads photo] "What's in this image?"
AI: [Analyzes] "The image shows a mountain landscape with..."

You: [Uploads receipt] "Extract the total amount"
AI: [Reads text] "The total amount is $47.32"

You: [Uploads diagram] "Explain this flowchart"
AI: [Analyzes] "This flowchart shows the process of..."
```

> **Note:** Image analysis requires models with vision capabilities (GPT-4 Vision, Gemini Pro Vision, Claude 3).

### Spreadsheets

**Supported formats:**
- **Excel**: `.xlsx`, `.xls` - Microsoft Excel
- **CSV**: `.csv` - Comma-Separated Values
- **Google Sheets**: Exported as `.xlsx` or `.csv`

**What you can do:**
- Analyze data patterns
- Create summaries
- Generate charts (with Code Interpreter)
- Calculate statistics
- Find specific values
- Compare datasets

**Example interactions:**
```
You: [Uploads sales.xlsx] "What were the top 5 products?"
AI: [Analyzes data] "The top 5 products by sales were..."

You: [Uploads data.csv] "Calculate the average and create a chart"
AI: [Uses Code Interpreter, generates chart]
```

> **Note:** Advanced spreadsheet analysis requires Code Interpreter tool.

### Code Files

**Supported formats:**
- **Python**: `.py`
- **JavaScript**: `.js`, `.jsx`, `.ts`, `.tsx`
- **HTML/CSS**: `.html`, `.css`
- **Java**: `.java`
- **C/C++**: `.c`, `.cpp`, `.h`
- **And many more**: Most text-based code files

**What you can do:**
- Code review and suggestions
- Bug identification
- Documentation generation
- Refactoring suggestions
- Security analysis
- Explain code functionality

**Example interactions:**
```
You: [Uploads script.py] "Review this code for improvements"
AI: [Analyzes] "Here are some suggestions: 1. Add error handling..."

You: [Uploads app.js] "Find potential security issues"
AI: [Reviews] "I found these security concerns..."
```

### Audio Files (If Supported)

**Supported formats:**
- **MP3**: `.mp3`
- **WAV**: `.wav`
- **M4A**: `.m4a`
- **OGG**: `.ogg`

**What you can do:**
- Transcribe speech to text
- Analyze audio content
- Extract information from recordings

> **Note:** Audio transcription availability depends on your configuration and may require Speech-to-Text services.

### Archive Files

**Supported formats:**
- **ZIP**: `.zip`
- **Archive**: May need to extract before uploading individual files

**What you can do:**
- Some systems allow uploading archives
- May need to extract and upload individual files
- Check with your administrator

## File Management

### Viewing Uploaded Files

**In the conversation:**
- Files appear as thumbnails or cards
- Shows file name and type
- Click to preview or download

**In the side panel:**
1. Open the right side panel
2. Navigate to **Files** tab
3. See all files attached to the conversation
4. Manage files from this view

### Previewing Files

**Images:**
- Click image thumbnail
- Full-size preview opens
- Use zoom controls if available
- Close to return to chat

**Documents:**
- Click document thumbnail
- Preview opens (if supported)
- Or file downloads for viewing in external app

**Code files:**
- Click to see syntax-highlighted preview
- Copy code directly from preview

### Removing Files

**Before sending message:**
1. Hover over uploaded file thumbnail
2. Click the **X** or **Remove** button
3. File is removed from upload queue

**After sending message:**
- Files become part of the message
- Cannot be removed without deleting the message
- Edit the message to remove file reference

### File Organization

**By conversation:**
- Each conversation keeps its own files
- Files don't carry over to new conversations
- Use agents with File Search for persistent file access

**With agents:**
- Upload files to agent's knowledge base
- Files persist across conversations with that agent
- Manage in agent configuration

### Downloading Files

**AI-generated files:**
1. AI creates file (chart, document, code, etc.)
2. File appears as download link
3. Click to download
4. Save to your computer

**Uploaded files:**
1. Click on file thumbnail
2. Choose **Download** option
3. File downloads to your computer

## Working with Different File Types

### Document Analysis

**Best practices:**
1. **Single document:**
   - Upload the file
   - Ask specific questions
   - Request summaries or extractions

2. **Multiple documents:**
   - Upload all related files
   - Ask comparative questions
   - Request cross-references

**Example workflow:**
```
Step 1: Upload contract.pdf and terms.pdf
Step 2: "Compare the warranty terms in both documents"
Step 3: AI analyzes both, provides comparison
Step 4: "Which one has better coverage?"
Step 5: AI provides detailed answer with citations
```

### Image Analysis

**Best practices:**
1. **Clear images:** Use high-quality, well-lit photos
2. **Relevant content:** Ensure image shows what you want analyzed
3. **Specific questions:** Ask precise questions about the image
4. **Multiple images:** Upload all related images together

**Example workflow:**
```
Step 1: Upload product-photo.jpg
Step 2: "Describe this product and suggest marketing copy"
Step 3: AI analyzes image, generates description and copy
Step 4: Upload competitor-product.jpg
Step 5: "Compare these two products"
Step 6: AI provides comparison
```

### Data Analysis

**Best practices:**
1. **Clean data:** Ensure spreadsheets are well-formatted
2. **Clear headers:** Use descriptive column names
3. **Reasonable size:** Very large files may have limitations
4. **Use Code Interpreter:** Enable for advanced analysis

**Example workflow:**
```
Step 1: Upload sales-data.csv
Step 2: "Show me sales trends by month"
Step 3: AI uses Code Interpreter to create visualization
Step 4: "Now break down by product category"
Step 5: AI generates additional analysis
```

### Code Review

**Best practices:**
1. **Context:** Provide context about what the code does
2. **Specific concerns:** Mention what to focus on
3. **Complete files:** Upload full files when possible
4. **Multiple files:** Include related files for better context

**Example workflow:**
```
Step 1: Upload main.py and utils.py
Step 2: "Review this code for best practices"
Step 3: AI provides comprehensive review
Step 4: "Focus on the database connection handling"
Step 5: AI provides specific analysis of that aspect
```

## File Limitations

### Size Limits

**Typical limits (varies by configuration):**
- **Images**: 20 MB per file
- **Documents**: 50 MB per file
- **Spreadsheets**: 20 MB per file
- **Code files**: 10 MB per file

> **Note:** Limits depend on your TESSA configuration. Check with your administrator for specific limits.

**If file is too large:**
- Compress images before uploading
- Split large documents into sections
- Extract relevant pages from PDFs
- Use file compression tools

### Number of Files

**Per message:**
- Usually 10-20 files per message
- Depends on configuration

**Per conversation:**
- No hard limit on total files
- Older messages with files remain accessible

**With agents (File Search):**
- Knowledge base file limits (e.g., 20 files per agent)
- Depends on agent configuration

### File Type Restrictions

**Not supported:**
- Executable files (`.exe`, `.app`)
- System files
- Very specialized formats
- DRM-protected content
- Corrupt or damaged files

**Security restrictions:**
- Files are scanned for malware (if configured)
- Suspicious files may be rejected
- Some file types blocked for security

## Advanced File Features

### File Search with Agents

**How it works:**
1. Create or select an agent
2. Enable **File Search** tool
3. Upload files to the agent's knowledge base
4. Files become searchable across all conversations with that agent

**Benefits:**
- Persistent file access
- Automatic relevance search
- Citation generation
- Multi-file queries

**Use cases:**
- Product documentation support agent
- Research assistant with paper library
- Code helper with documentation
- Legal assistant with case files

**How to set up:**
1. Go to agent configuration
2. Enable **File Search** tool
3. Click **Add Files**
4. Upload relevant documents
5. Save agent
6. Use agent in conversations—it automatically searches files

### Image Generation

Some models can generate images:

**To request image generation:**
```
You: "Create an image of a sunset over ocean"
AI: [Generates image] "Here's the image..."
```

**Generated images:**
- Appear in the conversation
- Can be downloaded
- Can be modified with follow-up requests

### File Conversion

**Automatic conversions:**
- HEIC to JPEG (iPhone photos)
- Some spreadsheet formats to CSV
- Audio to text (transcription)

**Manual conversion:**
- Convert files before uploading if needed
- Use online converters or local software

## Best Practices

### Upload Strategy

1. **Upload early:** Add files at the start of conversation for context
2. **Relevant files only:** Don't upload unnecessary files
3. **Clear naming:** Use descriptive file names
4. **Organized approach:** Group related files together

### File Organization

1. **By topic:** Keep related files in the same conversation
2. **Use agents:** For files you'll reference repeatedly
3. **Clean up:** Remove old conversations with large files periodically
4. **Export important data:** Save critical analysis results

### Privacy and Security

1. **Sensitive data:** Be cautious with confidential information
2. **Clean metadata:** Remove sensitive metadata before uploading
3. **Check permissions:** Ensure you have rights to share the content
4. **Delete when done:** Remove files you no longer need

### Performance Optimization

1. **Compress when possible:** Reduce file sizes
2. **Limit simultaneous uploads:** Upload in batches if many files
3. **Use appropriate formats:** PDF for documents, PNG for images with text
4. **Close unused conversations:** Free up resources

## Troubleshooting

### Upload Fails
**Problem:** File won't upload

**Solutions:**
- Check file size (may exceed limit)
- Verify file type is supported
- Check internet connection
- Try a different browser
- Compress or convert the file
- Check with administrator

### File Not Visible
**Problem:** Uploaded file doesn't appear

**Solutions:**
- Refresh the page
- Check if upload completed (look for checkmark)
- Verify file was within size limits
- Try uploading again
- Clear browser cache

### AI Can't Read File
**Problem:** AI says it can't access or read the file

**Solutions:**
- Verify file isn't corrupted
- Check if file type is supported for analysis
- Ensure you selected a model with file reading capability
- Try converting to a different format (e.g., DOCX to PDF)
- Re-upload the file

### Poor Image Analysis
**Problem:** AI misinterprets or poorly describes images

**Solutions:**
- Upload higher quality image
- Ensure image is well-lit and clear
- Try a different vision model
- Provide context with your question
- Be more specific in your query

### File Search Not Working (Agents)
**Problem:** Agent can't find information in uploaded files

**Solutions:**
- Verify File Search tool is enabled
- Check files were uploaded to agent (not just conversation)
- Ensure files are in supported format
- Try asking more specific questions
- Re-upload files to agent's knowledge base

## Common Scenarios

### Scenario 1: Analyzing a Business Report

**Goal:** Extract key insights from a quarterly report

**Steps:**
1. Upload `Q4-Report.pdf`
2. "Summarize the key financial metrics"
3. AI provides summary
4. "What were the main challenges mentioned?"
5. AI extracts challenges
6. "Create a bullet list of action items"
7. AI generates action items

### Scenario 2: Code Review Session

**Goal:** Review multiple code files for a project

**Steps:**
1. Upload `main.py`, `utils.py`, `config.py`
2. "Review these files for code quality"
3. AI provides comprehensive review
4. "Focus on security concerns in main.py"
5. AI provides specific security analysis
6. "Suggest improvements for utils.py"
7. AI offers refactoring suggestions

### Scenario 3: Document Comparison

**Goal:** Compare two contract versions

**Steps:**
1. Upload `contract-v1.pdf` and `contract-v2.pdf`
2. "What are the main differences between these contracts?"
3. AI highlights differences
4. "Focus on pricing and terms changes"
5. AI provides detailed comparison of those sections
6. "Which version is more favorable?"
7. AI provides analysis with reasoning

### Scenario 4: Data Visualization

**Goal:** Create charts from sales data

**Steps:**
1. Ensure you're using an agent with Code Interpreter
2. Upload `sales-data.csv`
3. "Create a bar chart of monthly sales"
4. AI generates code, creates chart
5. "Now add a trend line"
6. AI modifies chart
7. Download the generated chart image

## Next Steps

Explore related features:

- **[Agents Marketplace](./04-agents.md)**: Use agents with File Search for persistent file access
- **[Export & Sharing](./06-export-share.md)**: Export conversations including file references
- **[Advanced Features](./09-advanced.md)**: Learn about Code Interpreter for advanced file processing
- **[Conversations Management](./02-conversations.md)**: Organize conversations with file attachments

---

**Master file management** to enhance your AI conversations with documents, images, and data!
