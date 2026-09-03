# Additional Settings

The assistant configuration menu is located on the right side of the screen and provides control over AI parameters. Each user can create agents that offer personalized responses, either shorter or more elaborate.

![image](/help-images/en_0079.png)

![image](/help-images/en_0080.png)

## Defining Agents

The Agent Builder feature allows the creation of customized AI agents with specific instructions, a configured model and extended capabilities.

![image](/help-images/en_0081.png)

**Fields required to create an agent:**


| Field | Description and Purpose |
| --- | --- |
| Name | Descriptive name of the agent. Allows quick identification of the agent in the list of available agents. |
| Description | Detailed description of the agent. Clarifies the agent’s specialization and the domain in which it operates. |
| Category | Functional category the agent belongs to. Allows thematic grouping of agents for easier navigation. |
| Instructions | Prompt and specific instructions for the agent. Defines the AI’s behavior, response mode, and action limits. |
| Model | The AI model is used by the agent. Allows selection of capabilities necessary depending on task complexity. |


![image](/help-images/en_0082.png)

**Advanced AI Settings**

![image](/help-images/en_0083.png)

### Temperature

Temperature affects the responses provided by the agent. It can be modified and should be tested at each level to verify whether the responses are adequate in length and relevance.

**Range: 0.0 until to 2.0**


| Range | Recommended Value | Effect |
| --- | --- | --- |
| 0.0–0.3 | Technical/precise | Ideal for code review, FAQ |
| 0.4–0.7 | Balanced | Suitable for general conversations |
| 0.8–1.5 | Creative | Useful for brainstorming, creative texts |
| 1.6–2.0 | Random | Experimental, not recommended in production |


***Note:*** *Test different levels to identify the optimal setting for your use case.*

### Top P (Nucleus Sampling)

An alternative method for controlling response diversity through the selection of probable tokens.
Range: 0.0 to 1.0

0.1: Very focused

0.5: Moderate

0.9 - 1.0: More diverse (default)

**When to use:**

Alternative to temperature

Lower values = more focused responses

Higher values = more diverse responses

***Note: Simultaneously adjusting Temperature and Top P can lead to unexpected results. It is recommended to adjust only one parameter at a time.***

### Max Tokens (Output Length)

Controls the maximum length of the AI response; varies depending on the model (typically from 256 to 4096+)


| Range | Tip Response | Cazuri of Usage |
| --- | --- | --- |
| 256 - 512 | Short | Quick, simple responses; resource optimization |
| 1024 | Medium (default) | Standard conversations; most use cases |
| 2048 - 4096 | Long, detailed | Complex explanations; elaborate code; articles |


### Frequency Penalty

Reduces the repetition of words and expressions that already appear frequently in the response.
Range: 0.0 until to 2.0

0.0:         Without penalty (default)

0.5 - 1.0: Moderate reduction of repetition

1.0 - 2.0: Strong reduction, encourages variety

Increasing the value is recommended if responses appear repetitive or monotonous.

### Presence Penalty

Encourages the model to address new topics and avoid returning to previously discussed themes.
Range: -2.0 to 2.0

0.0:         Without penalty (default)

0.5 - 1.0: Encourages exploration of new topics

1.0 - 2.0: Strongly encourages new topics

Usage:

Higher values for more diverse discussions

Lower values for focused, on-topic responses

### Deleting agents

To delete an agent, you must first identify which workspace it was created in. Select the desired workspace and, from the My Agents tab, select the agent you wish to delete.

![image](/help-images/en_0084.png)

On the desired agent, the right-side screen opens and you click the "Delete" button at the bottom of the screen. 

![image](/help-images/en_0085.png)

## Prompt Library

The Prompt Library allows the quick creation and reuse of frequently used instruction templates. Prompts can contain variables and can be invoked with a short command directly from the message field.

![image](/help-images/en_0086.png)

Examples of useful prompts:

/trad – "Translate into {{language}}:" → callable for any language

/email – "Write a professional email for {{client}} about {{subject}}"

/cr – "Code review for {{language}} code"

/summary – "Summarize the following text in Romanian"

### Creating Prompts

Steps for creating a prompt:

Access Prompts: click on "Prompts" in the side panel or use the quick command "/" → the prompt library opens

Create a new prompt: click "+ Create Prompt" → the prompt editor opens

Enter a descriptive name in the "Prompt Name" field

Write the prompt content in the "Text" field

Configure the additional settings:

Quick command: Create a short command starting with "/" (e.g., /email)

Variables: Automatically detected from {{variable_name}}, with the ability to define default values

Click "Save" or "Create" → the prompt appears in the library

![image](/help-images/en_0087.png)

### Using Prompts

Steps for using a created prompt:

Return to the chat interface by clicking "Back to Chat"

In the message field, type "/" followed by the command or prompt name (e.g., "/ef")

A dropdown appears with the corresponding prompts; select the desired prompt

The prompt text is automatically populated in the message field

Press Enter or the send button to send the prompt

![image](/help-images/en_0088.png)

![image](/help-images/en_0089.png)

### Variables in Prompts – Detailed Guide with Examples

Variables are dynamic elements inserted into a prompt, marked using the syntax {{variable_name}}. When using a prompt, the system automatically detects the variables and replaces them with the values entered by the user at the time of sending. This allows the creation of flexible, reusable prompts in different contexts.


| Variable in prompt | What the user enters |
| --- | --- |
| {{language}} | "English", "French", "German" etc. |
| {{client_name}} | "Alfa SRL", "Beta SA" etc. |
| {{tip_document}} | "SRS", "PRD", "Analysis Report", etc. |
| {{source_code}} | Code copied from IDE (C#, SQL, JS, etc.) |


#### Variable Syntax

A variable is declared by surrounding its name with double curly braces. The variable name must be descriptive and without spaces (use underscores “_” instead of spaces):

{{language}} – simple variable for a translation language

{{client_name}} – variable for a client's name

{{tip_document}} – variable for the type of document to be generated

{{text_to_process}} – variable for long content (text, code, etc.)

#### Example 1 – Translation prompt with variables

Scenario: You want a reusable prompt for translations, where you can quickly change both the text and the target language, without rewriting the instructions each time.

**Prompt text (entered at creation):**

"Translate the following text into {{language}}.

Respond only with the translated text, without additional explanations: {{text_to_translate}}"

**Associated quick command: /trad**

**How to use:**

In the message field, type /trad and select the prompt from the dropdown.

The system displays a form with two fields: language and text_to_translate.

Enter: ***language*** = “English” and ***text_to_translate*** = textul desired, then press Enter.

**⚠️ Advantage:** ***The same /trad prompt can be used for any language (French, Spanish, German, etc.) without creating a separate prompt for each.***

#### Example 2 – Professional email prompt

Scenario: A consultant who frequently sends formal emails to various clients wants a standard template that can be quickly filled in with the client's name and the specific subject.

**Prompt text (entered at creation):**

"Write a professional email in Romanian to the client {{client_name}}, regarding the subject: {{email_subject}}. The tone must be formal, concise, and friendly. Sign with 'TotalSoft Support Team'."

**Associated quick command: /email**

**Completion example:**

**client_name** = “Alfa SRL”

**email_subject** = “delay in delivery of payroll module”

**Result automatically generated by AI:**

Dear Alfa SRL,

We are contacting you regarding the delay in the delivery of the payroll module. We wish to inform you that our team is actively working to resolve the situation and will communicate a revised timeline as soon as possible. Thank you for your understanding. Kind regards, TotalSoft Support Team.

#### Example 3 – Technical documentation generation prompt

Scenario: A business analyst who frequently generates specification documents wants a prompt with three variables: the document type, the target system, and the target audience.

Prompt text (entered at creation): "Generate a {{tip_document}} for the {{system}} system, intended for the {{audience}} audience. The document must include: objectives, functional requirements, non-functional requirements, and identified risks. Language: Romanian, formal style."

**Command quick associated:** /doc

**Completion examples:**

**tip_document = "System Specification (SRS)"**

**system = "Charisma HR – timesheet module"**

**audience = "development team and end client"**

Result: AI automatically generates a complete SRS specification, adapted to the timesheet module of Charisma HR, simultaneously addressing the technical team and the client.

#### Example 4 – Code Analysis Prompt with Language Variable

Scenario: A developer who performs code reviews for multiple programming languages wants a single adaptable prompt.

"You are a {{programming_language}} expert. Analyze the following code, identify errors, propose optimizations, and provide the corrected version with explanatory comments. Assign a final rating (Excellent / Good / Needs Improvement): {{source_code}}"

**Command quick:** /cr (code review)

**Completion examples:**

programming_language = "SQL / Python" (depending on the current context)

source_code = code copied from IDE/editor

#### Best Practices for Variables

Use descriptive names: {{target_language}} is clearer than {{l}} or {{x}}

Do not use spaces in variable names: {{client_name}} ✅ vs {{client name}} ❌

You can use the same variable multiple times in the same prompt: "Hello {{client_name}}! We are sending you the offer for {{client_name}}..." – the value is filled in once and propagates automatically

Combine variables with fixed instructions to maintain consistency of style and format regardless of the values entered

***Note: Variables transform a static prompt into a dynamic, reusable instrument applicable in dozens of different scenarios, without needing to rewrite the instructions each time. They are the key element for building an efficient prompt library at the team level.***

## AI Memory Management

The Memories feature allows storing persistent information about the user or context, which the agent will automatically use in all future conversations. If you specify that you are a "business consultant specialized in Charisma HR", the agent will take this into account at every interaction.

![image](/help-images/en_0090.png)

Memory is composed of key-value pairs, where the Key is the label under which the information is stored, and the Value contains the actual information.

![image](/help-images/en_0091.png)

Steps for creating a memory entry:

Access the right side panel and click on "Memories"

Press the "+ Create Memory" button

Enter an identifier in the "Key" field (e.g., "user_role")

Enter the information to be stored in the "Value" field (e.g., "I am a business consultant and I use Charisma ERP")

Ensure the "Use memory" toggle is enabled (ON) so that the agent uses the memory in conversations

The memory entry appears in the Memories list; you can edit or delete any entry at any time

**Note: Active memories are indicated through the "Usage" indicator and can be edited or deleted at any time.**

## Parameters – Configuring Model Parameters

The Parameters feature allows detailed configuration of the AI model's behavior: temperature, response length, custom instructions, and saving configurations as reusable presets.

![image](/help-images/en_0092.png)

Model parameters control how the AI generates responses. Access them from the right panel, the "Parameters" section, or directly from the agent creation form.

![image](/help-images/en_0093.png)

### Temperature – Response Creativity

Temperature controls how "creative" or "precise" the agent is. It is the most important parameter to adjust.


| Parameter | Recommended Value | Effect |
| --- | --- | --- |
| Temperature: 0.0–0.3 | Exact, technical responses | Ideal for code review, FAQ |
| Temperature: 0.4–0.7 | Balanced (default 1.0) | Suitable for general conversations |
| Temperature: 0.8–1.5 | Creative, varied responses | Useful for brainstorming, creative texts |
| Temperature: 1.6–2.0 | Random responses | Experimental, not recommended for production |


How to adjust: drag the Temperature slider in the Parameters panel. The default value is 1.0.

For technical agents (code review, internal FAQ, contract analysis), use low values (0.1–0.3). For creative agents (drafting emails, brainstorming), use high values (0.7–1.2).

### Top P – Vocabulary Diversity

Top P is an alternative parameter for controlling response diversity. Lower values result in a more restricted and predictable vocabulary; higher values result in a more varied vocabulary (default: 1.0).

⚠️  Do not adjust Temperature and Top P simultaneously. Recommendation: adjust only one of them at a time. If Temperature is already configured, leave Top P at its default value.

### Max Tokens – Response Length

Max Tokens controls how long a response can be. One token is approximately 4 characters in English or 3 characters in Romanian.


| Range | Tip response | When is uses |
| --- | --- | --- |
| 256–512 | Short | Responses quick, simple confirmations |
| 1024 (default) | Medium | Standard conversations, explanations |
| 2048–4096 | Long, detailed | Documentation, complex code, articles |


How to adjust: modify the value in the Max Tokens field. The default value is 1024.

For agents that provide short responses (confirmations, yes/no, date extraction), reduce Max Tokens to 256–512 for quicker and more efficient responses.

### Frequency Penalty – Reducing Repetitions

Frequency Penalty penalizes words that already appear frequently in the response, forcing the agent to vary its vocabulary. Range: 0.0–2.0.

0.0 (default) – no penalty, natural response

0.5–1.0 – moderate reduction of repetitions

1.0–2.0 – maximum variety, forced

Increase the value if you notice the agent repeating certain phrases or expressions within a response.

### Presence Penalty – Exploring New Topics

Presence Penalty encourages the agent to introduce new ideas and avoid returning to previously discussed topics. Range: -2.0 to 2.0.

0.0 (default) – standard behavior

0.5–1.0 – the agent explores more angles

1.0–2.0 – the agent actively avoids repeating topics

Use positive values for brainstorming or exploration conversations. Leave at 0 for responses focused on a single topic.

### Saving a Configuration as a Preset

If you have found a parameter combination that works well, you can save it as a preset to apply it quickly in the future:

Configure the desired parameters

Press "Save As Preset" at the bottom of the Parameters panel

Enter a nume descriptive for preset (ex.: „Tehnic strict", „Creativ moderat")

Press „Save"

To set a preset as default, click the pin icon next to it

Saved presets appear in the Parameters panel list and can be applied with a single click in any conversation.

## File Management and the "File Search" Function

File Search allows you to upload your own documents (PDF, Word, text) directly into the chat and ask questions based on their content. It is ideal when you have documentation that is not in Confluence or for project-specific work materials.

Supported formats:

PDF (.pdf)

Word (.docx, .doc)

Text (.txt, .md)

**The maximum file size is 25 MB and the total storage space is 1,024 MB.**

![image](/help-images/en_0094.png)

### Upload and Indexing Process

Steps for uploading files:

Select "File Search" from the assistant selector at the top left

Click on the attachment icon in the bottom bar of the message field

Select "Attach files"

Choose the file desired and press "Open"

The file appears above the message field and in the right panel with the status "Processing RAG"

Wait for indexing to complete (60–90 seconds – depending on the file size); click Refresh to update the status

After completion, the file is available for semantic search

### Formats and Limitations

- Supported Formats:

- PDF (.pdf)

- Word (.docx, .doc)

- Text (.txt, .md)

Limitations: Maximum file size: 512 MB (default, can be modified by administrator)

### RAG Processing Status

After uploading, the file goes through the following stages:


| Status | Description |
| --- | --- |
| 🔄 Processing RAG | The system processes and vectorizes the content (60–90 sec) |
| ✅Indexed | The file is indexed and available for search |


**Example:**

At the moment the file is selected, the "File Search" feature becomes active in the chat area. On the right side, it can be observed that the file is in "Processing RAG" status.

![image](/help-images/en_0095.png)

Result:

![image](/help-images/en_0096.png)

How to manage uploaded files:

Press the "Manage Files" button in the right panel

Check the checkbox next to the file you want to delete

Press „Delete" — appears confirming „✓ Successfully deleted"

⚠️  If a file remains stuck in "RAG Processing" for more than 2 minutes, delete it from Manage Files and restore it.

## Bookmarks – Marking Important Messages

Bookmarks are labels attached to important conversations, allowing you to find them instantly without searching through the chronological list. They are useful whenever you want to quickly return to a chat with an important analysis, a document draft, or a reference conversation for a project. A bookmark does not modify or move the conversation — it only adds a visible marker in the right panel, accessible with a single click. The same bookmark can be used for multiple chats.

![image](/help-images/en_0097.png)

### Creating a Bookmark

Before bookmarking a chat, you must create at least one bookmark (a label). Access the right panel and click the Bookmarks icon, visible in the top-right bar:

Press "+ New Bookmark" and fill in the "Title" field with a descriptive title

Fill in the "Description" field with an additional description and press "Save"

Navigate in the conversation to the desired message and click the bookmark icon in the message's action bar

Select the desired bookmark from the displayed dropdown

The bookmark appears as active in the right side panel

### Associating a Bookmark with a Chat

Once the bookmark is created, you can associate it with a chat in two ways: from the bookmark icon located in the top navigation bar (next to the agent selector), or directly from the Bookmarks panel on the right. Press the bookmark icon in the top bar, select the desired label from the displayed list, and the current chat will be marked automatically.

![image](/help-images/en_0098.png)

### Searching Chats by Bookmark

To quickly filter the conversation list by a specific bookmark, click the bookmark icon in the top navigation bar and select the desired label. The chat list in the left panel will display exclusively conversations marked with that bookmark, hiding all others. The numeric counter next to each label in the Bookmarks panel shows how many chats have been marked with that label.

![image](/help-images/en_0099.png)

### Managing and Deleting Bookmarks

Editing or individually deleting a bookmark is done directly from the right panel, by clicking the edit icon (✏️) or delete icon (🗑) next to each label. Changes are applied immediately and are automatically reflected in all chats marked with that bookmark.

To return to the normal view of all conversations and deactivate any active filtering, press the "Clear all" button in the bookmarks menu. This action does not delete the labels — it only removes the active filter, displaying the complete chat list again.

![image](/help-images/en_0100.png)

![image](/help-images/en_0101.png)
