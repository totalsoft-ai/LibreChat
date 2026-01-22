# AI Models & Configuration

Learn how to select the right local AI model and configure parameters for optimal results.

**Available Models:**

1. **deepseek-r1:8b** - Reasoning-focused with chain-of-thought. Best for: complex problem-solving, step-by-step reasoning, mathematical tasks
2. **qwen3:8b** (Default) - Balanced general-purpose model. Best for: general conversation, coding, analysis, document search (RAG)
3. **gemma3:27b** - Largest model with best capabilities. Best for: complex tasks, detailed analysis, high-quality outputs
4. **gemma3:4b** - Fast and efficient. Best for: quick responses, simple tasks, cost-effective processing
5. **Test_Gemma_Retrained:latest** - Custom fine-tuned model. Best for: specialized tasks, domain-specific knowledge
6. **phi4-mini:latest** - Microsoft's compact model. Best for: balanced performance, coding tasks
7. **embeddinggemma:latest** - Text embeddings for RAG functionality, semantic search, document similarity


## Selecting a Model

**By Task Complexity:**
- **Simple tasks**: gemma3:4b, phi4-mini:latest
- **Medium tasks**: qwen3:8b (default), phi4-mini:latest
- **Complex tasks**: deepseek-r1:8b, gemma3:27b
- **Document search (RAG)**: qwen3:8b (recommended)

**By Speed:**
- **Fastest**: gemma3:4b
- **Fast**: qwen3:8b, phi4-mini:latest
- **Medium**: deepseek-r1:8b
- **Slower but most capable**: gemma3:27b

**By Resource Usage:**
- **Lowest**: gemma3:4b (4B parameters)
- **Moderate**: qwen3:8b, deepseek-r1:8b (8B parameters)
- **Highest**: gemma3:27b (27B parameters)

**How to Select:**
1. Click **model selector** at top of chat
2. Select **Local Models** provider
3. Choose your model
4. Selection displays at top of chat

> **Tip:** You can change models mid-conversation. Each message stores which model generated it.

### Model Comparison

| Feature | gemma3:27b | deepseek-r1:8b | qwen3:8b | phi4-mini | gemma3:4b |
|---------|------------|----------------|----------|-----------|-----------|
| **Size** | 27B | 8B | 8B | ~4B | 4B |
| **Capability** | Very High | High (Reasoning) | High | Medium-High | Medium |
| **Speed** | Slower | Medium | Fast | Fast | Very Fast |
| **Resource Use** | High | Medium | Medium | Low-Medium | Low |
| **Reasoning** | Excellent | Excellent (CoT*) | Good | Good | Fair |
| **Code Gen** | Excellent | Good | Excellent | Excellent | Good |


## Model Parameters

**Temperature** - Controls randomness and creativity (Range: 0.0-2.0)
- **0.0-0.3**: Very focused, deterministic - For factual questions, code generation, data extraction
- **0.4-0.7**: Balanced - General conversation, most everyday uses
- **0.8-2.0**: Creative, varied - Creative writing, brainstorming, story generation

**Top P (Nucleus Sampling)** - Alternative randomness control (Range: 0.0-1.0)
- **0.1**: Very focused
- **0.5**: Moderate
- **0.9-1.0**: More diverse (default)

> **Note:** Using both temperature and top P can lead to unexpected results. Adjust one or the other.

**Max Tokens** - Maximum response length
- **256-512**: Short responses, quick answers
- **1024**: Medium responses (default)
- **2048-4096**: Long-form content, detailed explanations

**Frequency Penalty** - Reduces token repetition (Range: 0.0-2.0)
- **0.0**: No penalty (default)
- **0.5-1.0**: Moderate reduction
- **1.0-2.0**: Strong variety

**Presence Penalty** - Encourages new topics (Range: -2.0 to 2.0)
- **0.0**: No penalty (default)
- **0.5-1.0**: Encourages exploring new topics
- **1.0-2.0**: Strongly encourages new topics

**How to adjust:**
Open conversation settings (gear icon) → Adjust sliders or enter specific values

> **Tip:** Start with default and adjust based on results. Lower temperature for consistency, higher for creativity.

## Creating Presets

Presets save model and parameter configurations for reuse.

**Benefits:** Save time, maintain consistency, quick switching between use cases

**What's saved:** Model, temperature, max tokens, top P, frequency/presence penalties, stop sequences

**Create a Preset:**
1. Configure model and parameters
2. Click **presets** dropdown → **Save as Preset**
3. Enter descriptive name (e.g., "Code Review - qwen3:8b Low Temp")
4. Optionally add description
5. Click **Save**

**Preset Ideas:**

**Code Generation:**
- Model: qwen3:8b or phi4-mini:latest, Temperature: 0.2, Max Tokens: 2048

**Reasoning & Problem Solving:**
- Model: deepseek-r1:8b, Temperature: 0.3, Max Tokens: 2048

**Complex Analysis:**
- Model: gemma3:27b, Temperature: 0.4, Max Tokens: 4096

**Quick Q&A:**
- Model: gemma3:4b, Temperature: 0.7, Max Tokens: 512

**Creative Writing:**
- Model: gemma3:27b, Temperature: 1.2, Max Tokens: 4096, Frequency Penalty: 0.7, Presence Penalty: 0.6

## File Search (RAG)

**Recommended Model:** qwen3:8b for all document search and analysis tasks

**Why qwen3:8b?** Fast processing, strong comprehension, efficient memory usage, accurate citations, optimized for RAG workflows

**How It Works:**
1. Upload documents in workspace or conversation
2. Files are indexed automatically
3. Select qwen3:8b model
4. Ask questions—AI searches through documents
5. Get answers with citations

**Supported Files:** PDF, text files (.txt, .md), Microsoft Office (.docx, .xlsx)

**Progress Tracking:**
- **Indexing...** - Generating embeddings
- **Indexed** ✅ - Ready for search

## Custom Endpoints

The platform provides custom endpoints designed for common workflows, optimized for product, engineering, and technical documentation tasks.

### Assistant

**Assistant** is a general-purpose endpoint for generation, analysis, and technical support, without access to internal knowledge bases.

**Capabilities:**
- **Summarization** – summarizing documents, specifications, and conversations
- **Translation** – translating content between languages, including technical text
- **PRD Generation** – generating Product Requirement Documents
- **PRD Execution Plan** – converting PRDs into execution plans (milestones, tasks, dependencies)
- **Diagram Generation** – generating diagrams in **PlantUML** format
- **Code Review** – code analysis, improvement suggestions, best practices, and common issue detection

**Recommended Use Cases:**
- Creating and refining product documentation
- Rapid analysis of requirements and specifications
- Supporting product and engineering teams

**Recommended Models:**
- **qwen3:8b** – balanced speed and quality (default)
- **deepseek-r1:8b** – complex reasoning, PRDs, and execution planning
- **gemma3:27b** – detailed documents and high-quality outputs

---

### Assistant-with-Knowledge

**Assistant-with-Knowledge** extends the Assistant endpoint by integrating with the internal **Confluence** documentation database using Retrieval-Augmented Generation (RAG).

**Additional Capabilities:**
- Semantic search across internal documentation
- Context-aware answers based on Confluence content
- Organizational context (processes, standards, architecture)
- Alignment with official internal documentation

**Recommended Use Cases:**
- Questions related to internal architecture and processes
- Decision support based on internal documentation

---

### Best Practices for Custom Endpoints

1. Use **Assistant** for general-purpose generation and analysis
2. Use **Assistant-with-Knowledge** only when internal documentation context is required
3. Prefer **qwen3:8b** for performance and cost efficiency
4. Use presets to ensure consistent behavior across use cases


**Best Practices:**
- Use qwen3:8b model for RAG
- Upload relevant documents before querying
- Wait for "Indexed" status before asking questions
- Ask specific questions for better results
- Use workspaces to organize documents by project

## Best Practices

**Model Selection:**
1. Start with qwen3:8b for balanced speed and capability
2. Use gemma3:4b for fast responses
3. Switch to deepseek-r1:8b for complex reasoning
4. Use qwen3:8b for RAG and document analysis
5. Use gemma3:27b for highest quality outputs
6. Try phi4-mini:latest for coding tasks

**Parameter Tuning:**
1. Start with defaults, adjust only if needed
2. Change one parameter at a time
3. Lower temperature for accuracy, higher for creativity
4. Test settings before relying on them

**Working with Files:**
1. Upload documents to workspaces for better organization
2. Wait for "Indexed" status before querying
3. Ask specific questions for better search results
4. Use file citations to verify information

## Troubleshooting


**File Not Indexing:**
Wait up to 5 minutes (automatic polling), check RAG service is running, verify network, try re-uploading

**Responses Cut Off:**
Increase max tokens, ask "Please continue," some responses naturally need continuation