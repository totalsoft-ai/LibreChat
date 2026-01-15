# AI Models & Configuration

Learn how to select the right local AI model for your needs and configure parameters to get the best results from your conversations.

## What You'll Learn

- Understanding local AI models running on Local Models
- Selecting the right model for your task
- Configuring model parameters (temperature, tokens, etc.)
- Creating and using presets
- Model comparison and capabilities
- Working with RAG (file search)


### Local Models 

All models run locally via Ollama.

**Available Models:**

1. **deepseek-r1:8b**
   - Reasoning-focused model with chain-of-thought capabilities
   - Best for: Complex problem-solving, step-by-step reasoning, mathematical tasks
   - Context: 8B parameters

2. **qwen3:8b** (Default)
   - Balanced general-purpose model
   - Best for: General conversation, coding, analysis
   - Context: 8B parameters

3. **gemma3:27b**
   - Largest model with best capabilities
   - Best for: Complex tasks, detailed analysis, high-quality outputs
   - Context: 27B parameters

4. **gemma3:4b**
   - Fast and efficient smaller model
   - Best for: Quick responses, simple tasks, cost-effective processing
   - Context: 4B parameters

5. **Test_Gemma_Retrained:latest**
   - Custom fine-tuned model for specific use cases
   - Best for: Specialized tasks, domain-specific knowledge

6. **phi4-mini:latest**
   - Microsoft's compact yet powerful model
   - Best for: Balanced performance and speed, coding tasks

7. **embeddinggemma:latest**
   - Specialized for text embeddings
   - Used internally for RAG (file search) functionality
   - Best for: Semantic search, document similarity

**All models support:**
- ✅ **File Search (RAG)**: Upload documents and search through them
- ✅ **Local Processing**: Full privacy, no external API calls
- ✅ **Workspaces**: Organize conversations and files by projects
- ✅ **Multi-file Upload**: Upload multiple documents at once
- ✅ **Progress Tracking**: Visual feedback during file processing

## Selecting a Local AI Model

### Choosing the Right Model

Consider these factors when selecting a model:

**1. Task Complexity**
- **Simple tasks** (quick answers, basic questions): gemma3:4b, phi4-mini:latest
- **Medium tasks** (drafting, analysis, coding): qwen3:8b (default), phi4-mini:latest
- **Complex tasks** (deep reasoning, research, complex coding): deepseek-r1:8b, gemma3:27b
- **Specialized reasoning**: deepseek-r1:8b (shows thinking process)

**2. Response Speed**
- **Fastest**: gemma3:4b
- **Fast**: qwen3:8b, phi4-mini:latest
- **Medium**: deepseek-r1:8b
- **Slower but most capable**: gemma3:27b

**3. Resource Usage**
- **Lowest**: gemma3:4b (4B parameters)
- **Moderate**: qwen3:8b, deepseek-r1:8b (8B parameters)
- **Highest**: gemma3:27b (27B parameters)

**4. Special Capabilities**
- **Reasoning with thinking**: deepseek-r1:8b
- **Code generation**: qwen3:8b, phi4-mini:latest
- **General purpose**: qwen3:8b (recommended default)
- **Maximum quality**: gemma3:27b
- **Custom domain**: Test_Gemma_Retrained:latest

### How to Select a Model

**Step 1: Open Model Selector**
1. Start a new conversation or open an existing one
2. Click the **model selector** dropdown at the top of the chat area
3. Look for **Local models** provider

**Step 2: Choose Local Models**
1. Click on **Local Models**
2. A submenu shows all available local models

**Step 3: Select Specific Model**
1. Click on the model you want to use
2. The model selector updates to show your choice
3. New messages will use this model

**Step 4: Verify Selection**
- The selected model displays at the top of the chat
- Model name shows which specific local model is active
- All processing happens locally on your infrastructure

> **Tip:** You can change models mid-conversation. Each message stores which model generated it.

### Model Comparison

| Feature | gemma3:27b | deepseek-r1:8b | qwen3:8b | phi4-mini | gemma3:4b |
|---------|------------|----------------|----------|-----------|-----------|
| **Size** | 27B params | 8B params | 8B params | ~4B params | 4B params |
| **Capability** | Very High | High (Reasoning) | High | Medium-High | Medium |
| **Speed** | Slower | Medium | Fast | Fast | Very Fast |
| **Resource Use** | High | Medium | Medium | Low-Medium | Low |
| **Reasoning** | Excellent | Excellent (CoT) | Good | Good | Fair |
| **Code Generation** | Excellent | Good | Excellent | Excellent | Good |
| **Creative Tasks** | Excellent | Good | Good | Good | Fair |
| **File Search (RAG)** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |

**CoT** = Chain of Thought (shows reasoning steps)

## Model Parameters

Fine-tune how models generate responses by adjusting parameters.

### Temperature

**What it controls:** Randomness and creativity in responses

**Range:** 0.0 to 2.0
- **0.0 - 0.3**: Very focused, deterministic, consistent
- **0.4 - 0.7**: Balanced (default is usually 1.0)
- **0.8 - 1.5**: Creative, varied, explorative
- **1.6 - 2.0**: Very random, experimental

**When to adjust:**

**Low temperature (0.0 - 0.3):**
- Factual questions requiring accuracy
- Code generation
- Data extraction
- Consistent formatting
- Mathematical problems

**Medium temperature (0.4 - 0.7):**
- General conversation
- Balanced tasks
- Most everyday uses

**High temperature (0.8 - 2.0):**
- Creative writing
- Brainstorming
- Exploring alternatives
- Story generation

**How to set:**
1. Open conversation settings (gear icon)
2. Find **Temperature** slider
3. Drag to desired value
4. Or enter a specific number

> **Tip:** Start with default temperature and adjust based on results. Lower for consistency, higher for creativity.

### Top P (Nucleus Sampling)

**What it controls:** Alternative method for controlling randomness

**Range:** 0.0 to 1.0
- **0.1**: Very focused
- **0.5**: Moderate
- **0.9 - 1.0**: More diverse (default)

**How it works:** Considers only the most likely tokens that add up to probability P

**When to use:**
- Alternative to temperature
- Lower values = more focused responses
- Higher values = more diverse responses

> **Note:** Using both temperature and top P can lead to unexpected results. Adjust one or the other.

### Max Tokens (Output Length)

**What it controls:** Maximum length of the AI's response

**Range:** Varies by model (typically 256 to 4096+)
- **256 - 512**: Short responses
- **1024**: Medium responses (default)
- **2048 - 4096**: Long, detailed responses

**When to adjust:**

**Lower (256-512):**
- Quick answers
- Simple responses
- Resource optimization

**Medium (1024-2048):**
- Standard conversations
- Most use cases
- Balanced output

**Higher (2048+):**
- Long-form content
- Detailed explanations
- Complex code
- Essays and articles

### Frequency Penalty

**What it controls:** Reduces repetition of tokens that already appeared

**Range:** 0.0 to 2.0
- **0.0**: No penalty (default)
- **0.5 - 1.0**: Moderate reduction in repetition
- **1.0 - 2.0**: Strong reduction, encourages variety

**When to use:**
- Higher values for more variety in word choice
- Increase if responses feel repetitive

### Presence Penalty

**What it controls:** Encourages model to talk about new topics

**Range:** -2.0 to 2.0
- **0.0**: No penalty (default)
- **0.5 - 1.0**: Encourages exploring new topics
- **1.0 - 2.0**: Strongly encourages new topics

**When to use:**
- Higher values for more diverse discussions
- Lower values for focused, on-topic responses

## Creating and Using Presets

Presets save your model configuration for reuse.

### What Are Presets?

**Definition:** Saved combinations of model and parameter settings

**Benefits:**
- Save time by not reconfiguring each time
- Consistency across conversations
- Quick switching between use cases
- Share configurations with team

**What presets save:**
- Selected model
- Temperature
- Max tokens
- Top P
- Frequency penalty
- Presence penalty
- Stop sequences

### Creating a Preset

**Step 1: Configure Your Settings**
1. Open a conversation
2. Select your desired local model
3. Adjust all parameters as needed
4. Test to ensure settings work well

**Step 2: Save as Preset**
1. Click the **presets** dropdown or button
2. Select **Save as Preset**
3. Enter a descriptive name
   - Good: "Code Review - qwen3:8b Low Temp"
   - Good: "Reasoning Tasks - deepseek-r1:8b"
   - Good: "Fast Responses - gemma3:4b"
4. Optionally add a description
5. Click **Save**

### Preset Ideas for Local Models

**Code Generation**
```
Model: qwen3:8b or phi4-mini:latest
Temperature: 0.2
Max Tokens: 2048
Frequency Penalty: 0.0
Presence Penalty: 0.0
```

**Reasoning & Problem Solving**
```
Model: deepseek-r1:8b
Temperature: 0.3
Max Tokens: 2048
Frequency Penalty: 0.0
Presence Penalty: 0.0
```

**Complex Analysis**
```
Model: gemma3:27b
Temperature: 0.4
Max Tokens: 4096
Frequency Penalty: 0.0
Presence Penalty: 0.0
```

**Quick Q&A**
```
Model: gemma3:4b
Temperature: 0.7
Max Tokens: 512
Frequency Penalty: 0.0
Presence Penalty: 0.0
```

**Creative Writing**
```
Model: gemma3:27b
Temperature: 1.2
Max Tokens: 4096
Frequency Penalty: 0.7
Presence Penalty: 0.6
```

## File Search (RAG) with Local Models

All local models support document search through uploaded files.

### How It Works

1. **Upload documents** in workspace or conversation
2. **Files are indexed** using embeddinggemma:latest
3. **Ask questions** and AI searches through your documents
4. **Get answers with citations** from your files

### Supported File Types

- PDF documents
- Text files (.txt, .md)
- Microsoft Office files (.docx, .xlsx)
- Images (with OCR)

### Best Practices

1. **Upload relevant documents** before starting conversation
2. **Wait for "Indexed" status** (green checkmark) before querying
3. **Ask specific questions** for better search results
4. **Use workspaces** to organize documents by project

### Progress Tracking

When uploading files, you'll see:
- **Converting...** - Processing images (HEIC conversion)
- **Uploading...** - File transfer in progress
- **Indexing...** - Generating embeddings for search
- **Indexed** ✅ - Ready for search

## Best Practices

### Model Selection

1. **Start with qwen3:8b**: Good balance of speed and capability (default)
2. **Use gemma3:4b for speed**: When you need fast responses
3. **Switch to deepseek-r1:8b**: For complex reasoning tasks
4. **Use gemma3:27b**: For highest quality outputs
5. **Try phi4-mini:latest**: Excellent for coding tasks

### Parameter Tuning

1. **Start with defaults**: Adjust only if results aren't satisfactory
2. **Change one parameter at a time**: Easier to understand effects
3. **Lower temperature for accuracy**: Higher for creativity
4. **Test your settings**: Verify they produce desired results

### Working with Files

1. **Upload documents to workspaces**: Better organization
2. **Wait for indexing**: Don't query until "Indexed" status shows
3. **Ask specific questions**: Better search results
4. **Use file citations**: Verify information from documents

## Common Scenarios

### Scenario 1: Code Debugging

**Best configuration:**
- Model: qwen3:8b or phi4-mini:latest
- Temperature: 0.2
- Max Tokens: 2048
- Reasoning: Need accuracy and consistency

### Scenario 2: Complex Problem Solving

**Best configuration:**
- Model: deepseek-r1:8b
- Temperature: 0.3
- Max Tokens: 2048
- Reasoning: Shows thinking process, step-by-step solution

### Scenario 3: Document Analysis with RAG

**Best configuration:**
- Model: gemma3:27b
- Temperature: 0.4
- Max Tokens: 2048
- Files: Upload relevant documents first
- Reasoning: Best comprehension of uploaded documents

### Scenario 4: Quick Answers

**Best configuration:**
- Model: gemma3:4b
- Temperature: 0.7
- Max Tokens: 512
- Reasoning: Fast, efficient for simple questions

## Troubleshooting

### Model Not Available
**Problem:** A model doesn't appear in the list

**Solutions:**
- Check that Ollama is running on the server
- Verify model is pulled: `ollama list`
- Contact administrator if model is missing

### Slow Responses
**Problem:** Model takes too long to respond

**Solutions:**
- Switch to smaller model (gemma3:4b, qwen3:8b)
- Reduce max tokens
- Check server resource usage
- Use faster parameters (lower temperature)

### File Not Indexing
**Problem:** Uploaded file stuck on "Indexing..."

**Solutions:**
- Wait up to 5 minutes (automatic status polling)
- Check RAG service is running
- Verify network connectivity
- Try re-uploading the file

### Responses Cut Off
**Problem:** AI stops mid-sentence

**Solutions:**
- Increase max tokens
- Ask "Please continue" to get more
- Some responses naturally need continuation

## Next Steps

Explore these related features:

- **[Workspaces](./12-workspaces.md)**: Organize conversations and files by project
- **[File Search](./05-file-search.md)**: Upload and search through documents
- **[Prompts Library](./07-prompts.md)**: Combine prompts with presets
- **[Settings & Personalization](./10-settings.md)**: Customize your TESSA experience

---

**Master local model configuration** to get the best results from your Local Models!
