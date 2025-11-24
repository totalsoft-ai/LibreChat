# AI Models & Configuration

Learn how to select the right AI model for your needs and configure parameters to get the best results from your conversations.

## What You'll Learn

- Understanding different AI providers and models
- Selecting the right model for your task
- Configuring model parameters (temperature, tokens, etc.)
- Creating and using presets
- Endpoint-specific settings
- Model comparison and capabilities

## AI Providers and Models

TESSA integrates multiple AI providers, each with unique models and capabilities.

### OpenAI

**Available Models:**
- **GPT-4 Turbo**: Most capable, best for complex tasks
- **GPT-4**: Highly capable, good reasoning
- **GPT-3.5 Turbo**: Fast and cost-effective for simpler tasks
- **GPT-4 Vision**: Can analyze images

**Best for:**
- General conversation and assistance
- Code generation and debugging
- Creative writing
- Problem-solving
- Image analysis (Vision models)

**Strengths:**
- Excellent instruction following
- Strong reasoning capabilities
- Good code generation
- Wide knowledge base

### Anthropic (Claude)

**Available Models:**
- **Claude 3 Opus**: Most powerful, best for complex tasks
- **Claude 3 Sonnet**: Balanced performance and speed
- **Claude 3 Haiku**: Fastest, good for simple tasks

**Best for:**
- Long-form content analysis
- Complex reasoning
- Ethical and nuanced discussions
- Detailed explanations
- Large document processing

**Strengths:**
- Excellent at following complex instructions
- Strong at analysis and reasoning
- Handles longer contexts well
- Thoughtful and nuanced responses

### Google (Gemini)

**Available Models:**
- **Gemini Pro**: General-purpose model
- **Gemini Ultra**: Most capable (when available)
- **Gemini Pro Vision**: Multimodal with image understanding

**Best for:**
- Multimodal tasks (text + images)
- Fast responses
- Real-time information (when enabled)
- Creative tasks

**Strengths:**
- Multimodal capabilities
- Fast response generation
- Good at creative tasks
- Integration with Google services (if configured)

### Azure OpenAI

**Available Models:**
- Same as OpenAI (GPT-4, GPT-3.5)
- Deployed through Azure infrastructure

**Best for:**
- Enterprise environments
- Compliance requirements
- Regional data requirements

**Strengths:**
- Enterprise-grade reliability
- Compliance and security features
- Regional deployment options

### Other Providers

Depending on your configuration, you may also have access to:
- **Mistral AI**: Fast, efficient models
- **Meta Llama**: Open-source models
- **Cohere**: Specialized in text generation
- **AI21**: Specialized language models
- **Custom endpoints**: Self-hosted or specialized models

> **Note:** Available models depend on your TESSA configuration and your account permissions.

## Selecting an AI Model

### Choosing the Right Model

Consider these factors when selecting a model:

**1. Task Complexity**
- **Simple tasks** (quick answers, basic formatting): GPT-3.5, Claude Haiku, smaller models
- **Medium tasks** (drafting, analysis, coding): GPT-4, Claude Sonnet, Gemini Pro
- **Complex tasks** (research, deep analysis, complex coding): GPT-4 Turbo, Claude Opus

**2. Response Speed**
- **Fast**: GPT-3.5 Turbo, Claude Haiku, smaller models
- **Balanced**: Claude Sonnet, Gemini Pro
- **Slower but more capable**: GPT-4 Turbo, Claude Opus

**3. Cost Considerations**
- **Lower cost**: GPT-3.5, Claude Haiku
- **Mid-range**: Claude Sonnet, Gemini Pro
- **Higher cost**: GPT-4, Claude Opus

**4. Special Capabilities**
- **Image analysis**: GPT-4 Vision, Gemini Pro Vision
- **Long contexts**: Claude models (up to 200K tokens)
- **Coding**: GPT-4, Claude Sonnet
- **Creative writing**: Claude Opus, GPT-4

### How to Select a Model

**Step 1: Open Model Selector**
1. Start a new conversation or open an existing one
2. Click the **model selector** dropdown at the top of the chat area
3. You'll see available providers (OpenAI, Anthropic, Google, etc.)

**Step 2: Choose Provider**
1. Click on your preferred provider
2. A submenu shows available models from that provider

**Step 3: Select Specific Model**
1. Click on the model you want to use
2. The model selector updates to show your choice
3. New messages will use this model

**Step 4: Verify Selection**
- The selected model displays at the top of the chat
- Model icon indicates the provider
- Model name shows which specific model is active

> **Tip:** You can change models mid-conversation, but previous messages keep their original model. Each message stores which model generated it.

### Model Comparison

| Feature | GPT-4 Turbo | Claude 3 Opus | Gemini Pro | GPT-3.5 Turbo |
|---------|-------------|---------------|------------|---------------|
| **Capability** | Very High | Very High | High | Medium |
| **Speed** | Medium | Medium | Fast | Very Fast |
| **Cost** | High | High | Medium | Low |
| **Context Window** | 128K tokens | 200K tokens | 32K tokens | 16K tokens |
| **Code Generation** | Excellent | Excellent | Good | Good |
| **Creative Writing** | Excellent | Excellent | Good | Good |
| **Analysis** | Excellent | Excellent | Good | Fair |
| **Image Input** | Yes (Vision) | Yes | Yes (Vision) | No |

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
- Artistic tasks

**How to set:**
1. Open conversation settings (gear icon)
2. Find **Temperature** slider
3. Drag to desired value
4. Or enter a specific number

> **Tip:** Start with default temperature (usually 1.0) and adjust based on results. Lower for consistency, higher for creativity.

### Top P (Nucleus Sampling)

**What it controls:** Alternative method for controlling randomness

**Range:** 0.0 to 1.0
- **0.1**: Very focused
- **0.5**: Moderate
- **0.9 - 1.0**: More diverse (default)

**How it works:** Considers only the most likely tokens that add up to the probability P

**When to use:**
- Alternative to temperature
- Can be used with temperature for fine control
- Lower values = more focused responses
- Higher values = more diverse responses

> **Note:** Using both temperature and top P can lead to unexpected results. It's often better to adjust one or the other.

### Max Tokens (Output Length)

**What it controls:** Maximum length of the AI's response

**Range:** Varies by model (typically 256 to 4096+)
- **256 - 512**: Short responses
- **1024**: Medium responses (default)
- **2048 - 4096**: Long, detailed responses
- **4096+**: Very long responses (essays, articles)

**Considerations:**
- Higher values use more credits/cost more
- Model may not always use the full amount
- Some tasks naturally need more tokens

**When to adjust:**

**Lower (256-512):**
- Quick answers
- Simple responses
- Cost optimization

**Medium (1024-2048):**
- Standard conversations
- Most use cases
- Balanced output

**Higher (2048+):**
- Long-form content
- Detailed explanations
- Complex code
- Essays and articles

**How to set:**
1. Open conversation settings
2. Find **Max Tokens** field
3. Enter desired value
4. Or use slider if available

### Frequency Penalty

**What it controls:** Reduces repetition of tokens that already appeared

**Range:** 0.0 to 2.0
- **0.0**: No penalty (default)
- **0.5 - 1.0**: Moderate reduction in repetition
- **1.0 - 2.0**: Strong reduction, encourages variety

**When to use:**
- Higher values when you want more variety in word choice
- Lower values for consistent terminology
- Increase if responses feel repetitive

**Effects:**
- Positive values = less likely to repeat same words
- Makes output more diverse
- Too high can make output less coherent

### Presence Penalty

**What it controls:** Encourages model to talk about new topics

**Range:** -2.0 to 2.0
- **0.0**: No penalty (default)
- **0.5 - 1.0**: Encourages exploring new topics
- **1.0 - 2.0**: Strongly encourages new topics

**When to use:**
- Higher values for more diverse discussions
- Lower values for focused, on-topic responses
- Increase to explore related topics

**Effects:**
- Positive values = more likely to introduce new topics
- Makes conversations more exploratory
- Too high can cause topic drift

### Stop Sequences

**What it controls:** Tokens that stop generation when encountered

**Format:** Text strings (e.g., "END", "###", "\n\n")

**When to use:**
- Structured output formats
- Preventing certain patterns
- Controlling output boundaries
- Custom formatting needs

**Example:**
```
Stop sequences: ["END", "---"]
Model will stop generating when it encounters these strings
```

## Creating and Using Presets

Presets save your model configuration for reuse.

### What Are Presets?

**Definition:** Saved combinations of model and parameter settings

**Benefits:**
- Save time by not reconfiguring each time
- Consistency across conversations
- Quick switching between use cases
- Share configurations with others

**What presets save:**
- Selected model
- Temperature
- Max tokens
- Top P
- Frequency penalty
- Presence penalty
- Stop sequences
- Other endpoint-specific settings

### Creating a Preset

**Step 1: Configure Your Settings**
1. Open a conversation
2. Select your desired model
3. Adjust all parameters as needed
4. Test to ensure settings work well

**Step 2: Save as Preset**
1. Click the **presets** dropdown or button
2. Select **Save as Preset**
3. Enter a descriptive name
   - Good: "Creative Writing - Claude Opus"
   - Good: "Code Review - GPT-4 Low Temp"
   - Bad: "Preset 1"
4. Optionally add a description
5. Click **Save**

**Step 3: Verify**
- The preset appears in your presets list
- You can now select it from the presets dropdown

### Using a Preset

**Method 1: From Presets Menu**
1. Click the **presets** dropdown
2. Browse your saved presets
3. Click on the preset you want
4. All settings are applied instantly

**Method 2: When Starting a Conversation**
1. Click **+ New Chat**
2. Select a preset before typing
3. The conversation uses those settings from the start

**Method 3: Mid-Conversation**
1. Open the presets menu
2. Select a different preset
3. New messages use the new settings

> **Note:** Changing presets mid-conversation doesn't affect previous messages.

### Managing Presets

**Edit a Preset:**
1. Open presets menu
2. Find the preset to edit
3. Click **Edit** (pencil icon)
4. Modify settings
5. Click **Save Changes**

**Delete a Preset:**
1. Open presets menu
2. Find the preset to delete
3. Click **Delete** (trash icon)
4. Confirm deletion

**Organize Presets:**
- Name presets consistently
- Group by use case: "Writing - ", "Code - ", "Analysis - "
- Include model name for clarity
- Add descriptions for complex configurations

### Preset Ideas

**Creative Writing**
```
Model: Claude 3 Opus or GPT-4
Temperature: 1.2
Max Tokens: 4096
Frequency Penalty: 0.7
Presence Penalty: 0.6
```

**Code Generation**
```
Model: GPT-4 or Claude Sonnet
Temperature: 0.2
Max Tokens: 2048
Frequency Penalty: 0.0
Presence Penalty: 0.0
```

**Data Analysis**
```
Model: GPT-4 Turbo
Temperature: 0.3
Max Tokens: 2048
Frequency Penalty: 0.0
Presence Penalty: 0.0
```

**Brainstorming**
```
Model: Claude 3 Opus or GPT-4
Temperature: 1.5
Max Tokens: 2048
Frequency Penalty: 1.0
Presence Penalty: 0.8
```

**Concise Answers**
```
Model: GPT-3.5 Turbo or Claude Haiku
Temperature: 0.5
Max Tokens: 512
Frequency Penalty: 0.0
Presence Penalty: 0.0
```

## Endpoint-Specific Settings

Some providers offer unique settings.

### OpenAI-Specific

**Function Calling / Tools:**
- Enable AI to use tools and functions
- Useful for structured outputs
- Required for some agents

**Response Format:**
- JSON mode for structured output
- Text mode for natural language

**Seed (Reproducibility):**
- Set a seed value for consistent results
- Same input + same seed = same output
- Useful for testing and debugging

### Anthropic-Specific

**System Messages:**
- Claude handles system messages differently
- Provides context and instructions
- Affects entire conversation

**Thinking/Reasoning:**
- Some Claude models show "thinking" process
- Can enable/disable in settings
- Provides insight into reasoning

### Google-Specific

**Safety Settings:**
- Control content filtering levels
- Adjust thresholds for different categories
- Balance between safety and flexibility

**Candidate Count:**
- Number of response candidates to generate
- Higher values = more options (uses more credits)

## Best Practices

### Model Selection

1. **Start simple**: Use GPT-3.5 or Claude Haiku for initial testing
2. **Upgrade when needed**: Switch to GPT-4 or Opus for complex tasks
3. **Match model to task**: Don't use expensive models for simple tasks
4. **Test different models**: Compare results across providers
5. **Consider context length**: Use Claude for long documents

### Parameter Tuning

1. **Start with defaults**: Adjust only if results aren't satisfactory
2. **Change one parameter at a time**: Easier to understand effects
3. **Lower temperature for accuracy**: Higher for creativity
4. **Balance cost and quality**: Higher max tokens = higher cost
5. **Test your settings**: Verify they produce desired results

### Preset Management

1. **Create presets for common tasks**: Save time and ensure consistency
2. **Name descriptively**: Include use case and model
3. **Document complex presets**: Add descriptions
4. **Review and update**: Settings that worked may need adjustment over time
5. **Share with team**: If working collaboratively

### Cost Optimization

1. **Use appropriate models**: Don't overuse expensive models
2. **Limit max tokens**: Set reasonable limits
3. **Lower temperature**: Slightly reduces unpredictability and potential retries
4. **Batch similar tasks**: Use same conversation when possible
5. **Monitor usage**: Check your credit/token usage regularly

## Troubleshooting

### Model Not Available
**Problem:** The model you want doesn't appear in the list

**Solutions:**
- Check with your administrator
- Verify your account permissions
- Some models may require specific subscriptions
- Model availability can change

### Responses Too Random/Inconsistent
**Problem:** AI generates very different responses to similar inputs

**Solutions:**
- Lower temperature (try 0.3-0.5)
- Lower top P value
- Reduce frequency and presence penalties
- Try a different model

### Responses Too Generic/Boring
**Problem:** AI responses lack creativity or variety

**Solutions:**
- Increase temperature (try 1.0-1.5)
- Increase frequency penalty
- Increase presence penalty
- Try a different prompt approach
- Use a more capable model

### Responses Cut Off
**Problem:** AI stops mid-sentence or doesn't complete response

**Solutions:**
- Increase max tokens
- Check if response hit token limit
- Some conversations may need to be continued manually
- Ask "Please continue" to get more

### Preset Not Working
**Problem:** Selecting a preset doesn't apply settings

**Solutions:**
- Refresh the page
- Delete and recreate the preset
- Check if preset includes all needed settings
- Verify model is still available

## Common Scenarios

### Scenario 1: Writing a Technical Document

**Best configuration:**
- Model: GPT-4 or Claude Sonnet
- Temperature: 0.5-0.7
- Max Tokens: 4096
- Frequency Penalty: 0.5
- Reasoning: Balanced creativity with technical accuracy

### Scenario 2: Debugging Code

**Best configuration:**
- Model: GPT-4 or Claude Sonnet
- Temperature: 0.2
- Max Tokens: 2048
- Frequency Penalty: 0.0
- Reasoning: Need accuracy and consistency

### Scenario 3: Creative Storytelling

**Best configuration:**
- Model: Claude Opus or GPT-4
- Temperature: 1.3
- Max Tokens: 4096
- Frequency Penalty: 0.8
- Presence Penalty: 0.6
- Reasoning: Maximize creativity and variety

### Scenario 4: Quick Q&A

**Best configuration:**
- Model: GPT-3.5 Turbo or Claude Haiku
- Temperature: 0.7
- Max Tokens: 512
- Frequency Penalty: 0.0
- Reasoning: Fast, cost-effective, concise

## Next Steps

Explore these related features:

- **[Agents Marketplace](./04-agents.md)**: Use pre-configured AI agents with optimal settings
- **[Prompts Library](./07-prompts.md)**: Combine prompts with presets for powerful workflows
- **[Advanced Features](./09-advanced.md)**: Explore advanced model capabilities
- **[Settings & Personalization](./10-settings.md)**: Customize your overall TESSA experience

---

**Master model configuration** to get the best results for every task!
