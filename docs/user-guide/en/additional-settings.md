# Additional Settings

The assistant configuration menu is located on the right side of the screen and provides control over AI parameters. Each user can create agents that provide personalised, shorter or more elaborate responses.

![image](/help-images/en_0064.png)

![image](/help-images/en_0065.png)

## Define Agents

The Agent Builder functionality allows the creation of personalised AI agents with specific instructions, configured model and extended capabilities.

![image](/help-images/en_0066.png)

Fields required to create an agent:


| Field | Description and Purpose |
| --- | --- |
| Name | Descriptive name of the agent. Allows quick identification of the agent in the list of available agents. |
| Description | Detailed description of the agent. Clarifies the agent’s specialisation and the domain in which it operates. |
| Category | Functional category to which the agent belongs. Allows thematic grouping of agents for easier navigation. |
| Instructions | Prompt and specific instructions for the agent. They define the AI behaviour, response mode and action limits. |
| Model | Modelul AI utilizat de agent. Allows selection of the required capabilities based on task complexity. |


![image](/help-images/en_0067.png)

**Advanced AI Settings**

![image](/help-images/en_0068.png)

### Temperature

Temperature affects the responses provided by the agent. It can be modified and should be tested at each level to verify that responses are adequate in length and relevance.

Range: 0.0 to 2.0

0.0 - 0.3: specific, consistent

0.4 - 0.7: balanced (default setting is 1.0)

0.8 - 1.5: creative, varied

1.6 - 2.0: random, experimental

***Note:*** *Test different levels to identify the optimal setting for your case.*

### Top P (Nucleus Sampling)

Alternative method of controlling response diversity by selecting probable tokens.
Range: 0.0 to 1.0

0.1: Very focused

0.5: Moderate

0.9 - 1.0: More diverse (default)

**When to use:**

Alternative to temperature

Smaller values = more focused responses

Larger values = more diverse responses

***Note: Simultaneous use of temperature and Top P can lead to unexpected results. It is recommended to adjust only one parameter at a time.***

### Max Tokens (Output Length)

Controls the maximum length of the AI response, varies depending on the model (usually 256 to 4096+)


| Interval | Response Type | Use Cases |
| --- | --- | --- |
| 256 - 512 | Short | Quick, simple responses; Resource optimisation |
| 1024 | Medium (defaut) | Standard conversations; Most use cases |
| 2048 - 4096 | Long, detalied | Complex explanations; Elaborate code; Articles |


### Frequency Penalty

Reduces repetition of words and expressions already used in the response.
Range: 0.0 to 2.0

0.0:         No penalty (default)

0.5 - 1.0: Moderate reduction of repetition

1.0 - 2.0: Strong reduction, encourages variety

It is recommended to increase the value if responses seem repetitive or monotone.

### Presence Penalty

Encourages the model to address new topics and avoid returning to already discussed themes.
Range: -2.0 to 2.0

0.0:         No penalty (default)

0.5 - 1.0: Encourages exploration of new topics

1.0 - 2.0: Strongly encourages new topics

Usage:

Higher values for more diverse discussions

Lower values for focused, on-topic responses

### Delete Agents

To delete an agent, you must identify which workspace it was created in. Select the desired workspace and from the My Agents tab, select the agent to be deleted.

![image](/help-images/en_0069.png)

On the desired agent, open the right panel and press the ''Delete'' button at the bottom of the screen.

![image](/help-images/en_0070.png)

## Prompt Library

The Prompt Library allows quick creation and reuse of frequent instruction templates. Prompts can contain variables and can be called through a short command directly from the message field.

![image](/help-images/en_0071.png)

Examples of useful prompts:

/trad – “Translate into {{limba}}:" → usable for any language

/email – “Draft a professional email for {{client}} about {{subiect}}"

/cr – „Code review pentru cod {{limbaj}}"

/rezumat – “Summarise the text below in Romanian"

### Creating Prompts

Steps for creating a prompt:

Access Prompts: click on "Prompts" in the side panel or use the shortcut "/" → the prompt library opens

Create a new prompt: press "+ Create Prompt" → the prompt editor opens

Enter a descriptive name in the "Prompt Name" field

Write the prompt content in the "Text" field

Configure additional settings:

Quick command: Create a short command starting with "/" (e.g.: /email)

Variables: Automatically detected from {{variable_name}}, with the option to define default values

Press "Save" or "Create" → the prompt appears in the library

![image](/help-images/en_0072.png)

### Using Prompts

Steps for using a created prompt:

Return to the chat interface by pressing "Back to Chat"

In the message field, type "/" followed by the command or prompt name (e.g.: "/ef")

A dropdown with corresponding prompts appears; select the desired prompt

The prompt text is automatically populated in the message field

Press Enter or the send button to send the prompt

![image](/help-images/en_0073.png)

![image](/help-images/en_0074.png)

### Variables in Prompts – Detailed Guide with Examples

Variables are dynamic elements inserted into a prompt, marked by the syntax **{{nume_variabila}}**. When using the prompt, the system automatically detects the variables and replaces them with the values entered by the user at sending time. This allows the creation of flexible prompts, reusable in different contexts.


| Variable in prompt | What the user enters at sending |
| --- | --- |
| {{limba}} | “english", “french", “german" etc. |
| {{nume_client}} | „Alfa SRL", „Beta SA" etc. |
| {{tip_document}} | “SRS", “PRD", “Analysis Report" etc. |
| {{cod_sursa}} | Codul copiat din IDE (C#, SQL, JS etc.) |


#### Variable syntax

A variable is declared by surrounding the name with double curly braces. The variable name must be descriptive, without spaces (use underscore “_” instead of spaces):

**{{limba}}** – simple variable for a translation language

**{{nume_client}}** – variable for a client name

**{{tip_document}}** – variable for the type of document to generate

**{{text_de_procesat}}** – variable for long content (text, code, etc.)

***Example 1 – Translation prompt with variables.***

Scenario: You want a reusable prompt for translations, where you can quickly change both the text and the target language without rewriting the instruction each time.

**Prompt text (entered at creation):**

*Translate the following text into the language {{limba}}. Respond only with the translated text, without additional explanations:*

*{{text_de_tradus}}*

**Associated quick command:** /trad

**How to use it:**

In the message field type **/trad** and select the prompt from the dropdown.

The system displays a form with two fields: **limba** and **text_de_tradus**.

Enter: ***limba*** = “English” and ***text_de_tradus*** = desired text, then press Enter.

The complete prompt automatically sent to the AI will be: “Translate the following text into English. Respond only with the translated text, without additional explanations: [your text]”

**⚠️ Advantage:** ***The same /trad prompt can be used for any language (French, Spanish, German, etc.) without creating a separate prompt for each.***

***Example 2 – Professional email prompt***

Scenario: A consultant who frequently sends formal emails to different clients wants a standard template, quickly filled in with the client name and specific subject.

**Prompt text (entered at creation):**

*Draft a professional email in Romanian to the client {{nume_client}}, regarding the subject: {{subiect_email}}. The tone must be formal, concise and friendly. Sign with “TotalSoft Support Team”.*

**Associated quick command:** /email

**Fill-in example:**

**Client_name** = “Alfa SRL”

**subiect_email** = “payroll module delivery delay”

**AI auto-generated result:**

*Dear Alfa SRL,*

*We are contacting you regarding the delay in delivering the payroll module. We would like to inform you that our team is actively working to resolve the situation and we will communicate a revised deadline as soon as possible. Thank you for your understanding.*

*Sincerely, TotalSoft Support Team*

#### Example 3 – Prompt for generating technical documentation

Scenario: A business analyst frequently generates specification documents. They want a prompt with three variables: the document type, the targeted system and the target audience.

**Prompt text (entered at creation):**

*Generate a {{tip_document}} for the {{sistem}} system, intended for the {{audienta}} audience. The document must include: objectives, functional requirements, non-functional requirements and identified risks. Language: Romanian, formal style.*

**Associated quick command:** /doc

**Fill-in examples:**

**document_type** = “System Specification (SRS)”

**system** = “Charisma HR – the timesheet module”

**audience** = “development team and end client”

Result: The AI automatically generates a complete SRS specification, adapted to the Charisma HR timesheet module, addressed simultaneously to the technical team and the client.

#### Example 4 – Prompt for code analysis with language variable

Scenario: A developer performs code review for multiple programming languages and wants a single adaptable prompt.

*You are an expert in {{limbaj_programare}}. Analyse the following code, identify errors, propose optimisations and provide the corrected version with explanatory comments. Give a final rating (Excellent / Good / Needs Improvement):*

*{{cod_sursa}}*

**Quick command:** /cr (code review)

**Fill-in examples:**

**limbaj_programare** = “SQL / Python” (depending on current context)

**cod_sursa** = code copied from IDE/editor

***Best practices for variables***

**Use descriptive names:** {{lingua_target}} is clearer than {{l}} or {{x}}.

**Do not use spaces in the variable name:** {{nume_client}} ✅ vs {{nume client}} ❌.

**You can use the same variable multiple times** in the same prompt: “Hello {{nume_client}}! We are sending you the offer for {{nume_client}}...” – the value is filled in once and propagates automatically.

**Combine variables with fixed instructions** to maintain consistency of style and response format, regardless of the values entered.

**Note:** ***Variables transform a static prompt into a dynamic tool, reusable in dozens of different scenarios, without having to rewrite the instructions each time. They represent the key element for building an efficient prompt library at the team level.***

## AI Memory Management (Memories)

The Memories functionality allows persistent storage of information about the user or context, which the agent will automatically use in all future conversations. If you set that you are a “business consultant specialised in Charisma HR", the agent will take this into account at every interaction.

![image](/help-images/en_0075.png)

Memory is made up of key-value pairs (Key-Value), where Key represents the label under which the information is stored, and Value contains the actual information.

![image](/help-images/en_0076.png)

Steps for creating a memory:

Access the right side panel and click on "Memories"

Press the "+ Create Memory" button

Enter an identifier in the "Key" field (e.g.: "user_role")

Enter the information to be memorised in the "Value" field (e.g.: "I am a business consultant and I use Charisma ERP")

Verify that the "Use memory" toggle is enabled (ON) so that the agent uses the memory in conversations

The memory appears in the Memories list. You can edit or delete any entry at any time

**Note:** ***Active memories are indicated by the "Usage" indicator and can be edited or deleted anytime.***

## Parameters –Model Parameters Configuration

The Parameters functionality allows detailed configuration of the AI model behaviour: temperature, response length, personalised instructions and saving configurations as reusable presets.

![image](/help-images/en_0077.png)

Model parameters control how the AI generates responses. Access them from the right panel, “Parameters" section, or directly from the agent creation form.

![image](/help-images/en_0078.png)

### Temperature – Response Creativity

Temperature controls how “creative" or “precise" the agent is. It is the most important parameter to adjust.


| Parametru | Recommended value | Efect |
| --- | --- | --- |
| Temperature: 0.0–0.3 | Exact, technical responses | Ideal for code review, FAQ |
| Temperature: 0.4–0.7 | Balanced (default 1.0) | Suitable for general conversations |
| Temperature: 0.8–1.5 | Creative, varied responses | Useful for brainstorming, creative texts |
| Temperature: 1.6–2.0 | Random responses | Experimental, not recommended for production |


How to adjust it: slide the Temperature slider in the Parameters panel. The default value is 1.0.

For technical agents (code review, internal FAQ, contract analysis) use small values (0.1–0.3). For creative agents (drafting emails, brainstorming) use large values (0.7–1.2).

### Top P – Vocabulary Diversity

Top P is an alternative parameter for controlling response diversity. Small values = more restricted and predictable vocabulary; large values = varied vocabulary (default: 1.0).

⚠️  Do not adjust Temperature and Top P simultaneously. Recommendation: adjust only one of them. If Temperature is already configured, leave Top P at the default value.

### Max Tokens – Response Length

Max Tokens controls how long a response can be. One token = approximately 4 characters in English or 3 characters in Romanian.


| Interval | Response type | When to use |
| --- | --- | --- |
| 256–512 | Short | Quick responses, simple confirmations |
| 1024 (implicit) | Medium | Standard conversations, explanations |
| 2048–4096 | Long, detaliat | Documentation, complex code, articles |


How to adjust it: modify the value in the Max Tokens field. The default value is 1024.

For agents that provide short responses (confirmations, YES/NO, data extraction), reduce Max Tokens to 256–512 for faster and more efficient responses.

### Frequency Penalty – Reducing Repetitions

Frequency Penalty penalises words that already appear frequently in the response, forcing the agent to vary its vocabulary. Range: 0.0–2.0.

0.0 (default) – no penalty, natural response

0.5–1.0 – moderate reduction of repetitions

1.0–2.0 – maximum variety, forced

Increase the value if you notice that the agent repeats the same phrases or expressions within a response.

### Presence Penalty – Exploring New Topics

Presence Penalty encourages the agent to bring new ideas and not return to already discussed topics. Range: -2.0 to 2.0.

0.0 (default) – standard behaviour

0.5–1.0 – the agent explores multiple angles

1.0–2.0 – the agent actively avoids repeating topics

Use positive values for brainstorming or exploratory conversations. Leave at 0 for responses focused on a single topic.

### Saving Configuration as Preset

If you have found a combination of parameters that works well, you can save it as a preset to apply quickly in the future:

Configure the desired parameters

Press "Save As Preset" from the bottom of the Parameters panel

Enter a descriptive name for the preset (e.g.: “Strict Technical", “Moderately Creative")

Press "Save"

To set a preset as default, press the pin icon next to it

Saved presets appear in the list in the Parameters panel and can be applied with a single click in any conversation.

## File Management and "File Search" Function

File Search allows uploading your own documents (PDF, Word, text) directly into the chat and asking questions based on their content. It is ideal when you have documentation that is not in Confluence or project-specific working materials.

Supported formats:

PDF (.pdf)

Word (.docx, .doc)

Text (.txt, .md)

**The maximum file size is 25 MB and the total storage space is 1024 MB.**

![image](/help-images/en_0079.png)

### Upload and Indexing Process

Steps for uploading files:

Select "File Search" from the assistant selector at the top left

Click on the attachment icon in the bottom bar of the message field

Select "Attach files"

Choose the desired file and press "Open"

The file appears above the message field and in the right panel with the status "RAG Processing"

Wait for indexing to complete (60–90 seconds – depends on file size); press Refresh to update status

After completion, the file is available for semantic search

### Formats and Limitations

- Supported Formats:

- PDF (.pdf)

- Word (.docx, .doc)

- Text (.txt, .md)

Limitations:

**Maximum file size:** 512 MB (default, can be modified by administrator)

### RAG Processing Status

After upload, the file goes through the following stages:


| Status | Description |
| --- | --- |
| 🔄 Processing RAG | The system processes and vectorises the content (60-90 sec) |
| ✅Indexat | The file is indexed and available for search |


Example:

When the file is selected, the "File Search" function becomes active in the chat area. On the right side, the file can be seen in "RAG Processing" status”.

![image](/help-images/en_0080.png)

Rezultat:

![image](/help-images/en_0081.png)

How to manage uploaded files:

Press the “Manage Files" button in the right panel

Check the checkbox next to the file you want to delete

Press "Delete" — confirmation "✓ Successfully deleted" appears

⚠️  If a file remains stuck in “RAG Processing" for more than 2 minutes, delete it from Manage Files and re-upload it.

## Bookmarks – Marking Important Messages

Bookmarks are labels that you attach to important conversations, to instantly find them without searching the chronological list. They are useful whenever you want to quickly return to a chat with an important analysis, a document draft, or a reference conversation for a project. A bookmark does not modify or move the conversation — it only adds a visible marker in the right panel, accessible with a single click. **The same bookmark can be used for multiple chats.**

![image](/help-images/en_0082.png)

### Creating a Bookmark

Before marking a chat, you must create at least one bookmark (a label). Access the right panel and press the Bookmarks icon, visible in the top right bar:

Press "+ New Bookmark" and fill in the "Title" field with a descriptive title

Fill in the "Description" field with an additional description and press "Save"

Navigate in the conversation to the desired message and click on the bookmark icon in the message action bar

Select the desired bookmark from the displayed dropdown

The bookmark appears active in the right side panel

### Associating a Bookmark to a Chat

Once the bookmark is created, you can associate it with a chat in two ways: from the bookmark icon located in the top navigation bar (next to the agent selector), or directly from the Bookmarks panel on the right. Press the bookmark icon in the top bar, select the desired label from the displayed list and the current chat will be marked automatically.

![image](/help-images/en_0083.png)

### Searching Chats by Bookmark

To quickly filter the list of conversations by a specific bookmark, press the bookmark icon in the top navigation bar and select the desired label. The chat list in the left panel will display exclusively the conversations marked with that bookmark, hiding all others. The numeric counter next to each label in the Bookmarks panel shows how many chats have been marked with that label.

![image](/help-images/en_0084.png)

### Managing and Deleting Bookmarks

Individual editing or deletion of a bookmark is done directly from the right panel, by pressing the edit (✏️) or delete (🗑) icon next to each label. Changes are applied immediately and are automatically reflected in all chats marked with that bookmark.

To return to the normal view of all conversations and deactivate any active filter, press the “Clear all" button in the bookmarks menu. This action does not delete the labels — it only removes the active filter, displaying the complete list of chats again.

![image](/help-images/en_0085.png)

![image](/help-images/en_0086.png)
