# Main Screen

The main screen occupies the central area of the interface and represents the workspace where all conversations and interactions with AI assistants take place. All requests and generated responses are recorded here.

![image](/help-images/en_0040.png)

## Unified Interface – Assistant

All assistants use the same intuitive interface. The user formulates the request in natural language, and The Assistant decides automatically which agent will take over and execute the requirement. 

![image](/help-images/en_0041.png)

### The QnA Assistant

**Operation and Capabilities**

The QnA Assistant specializes in providing answers based exclusively on documentation uploaded to Confluence and Coda. The assistant's performance depends directly on the quality and detail of the formulated question.

Best Practices for Questions:

Formulate clear and direct questions

Include as many relevant details as possible

Specify the context when necessary

Use specific terms from the documentation

![image](/help-images/en_0042.png)

**Managing Responses**

If the requested information is not found in the database, the assistant will transparently communicate: *"I have not identified an answer in the available documentation."*

![image](/help-images/en_0043.png)

The Confluence and Coda documentation that forms the basis of the assistant's responses is uploaded and vectorized in the database daily. If necessary, the frequency can be increased. It is the responsibility of each team to keep the documentation up to date in Confluence or Coda, so that the agent can provide accurate answers.

Since the documentation is also used for generating responses for the Ticheto application, it is recommended to create separate spaces for each mission and each client. These pages manage the documentation for each mission. 

![image](/help-images/en_0044.png)

Documentation is accessed and uploaded into the database both in link format and by addition on screen.

![image](/help-images/en_0045.png)

![image](/help-images/en_0046.png)

***The same requirements are recommended for the Coda application.**

![image](/help-images/en_0047.png)

![image](/help-images/en_0048.png)

#### Retrieving Documents from Confluence or Coda

**Database Synchronization**

The platform integrates an automatic document retrieval mechanism from Confluence or Coda into the vectorized database. **Not all pages in Confluence or Coda has indexed** — to avoid overloading the database with irrelevant content, the system applies a filter based on the page title.

#### Inclusion Rule — Filtering by Title

A Confluence or Coda page is taken automatically retrieved only if its title contains one of the keywords defined in the namespace configuration. This rule applies regardless of the space the page belongs to.

**The accepted keywords in the title are:**


| Keyword (pattern) | Examples of accepted titles |
| --- | --- |
| documenta?i* | Documentation, Documentation |
| documentare | Documentare proces X |
| documentation | API Documentation |
| specifica?i* | Specification, Specifications tehnice |
| manually* | Manual user, Manuale |
| configur?r* | Configuration, Settings system |
| test case | Test case login |
| *test* | Testing, Tis, Testare |
| tehnic | Technical guide, technical documentation |
| train* | Training, Trainings, Train the trainer |


**Recommendation: When creating a new page in Confluence or Coda, include one of the above keywords in the title if you want it to be available in Tessa agent responses.**

**Synchronization Schedule**

The indexing service runs **automatically every night at 02:00**. At each run, the system:

Scans pages from configured Confluence namespaces

Filters pages whose title matches one of the defined patterns

Loads the content of eligible pages into the vectorized database

Updates existing entries if a page has been modified

⚠️ **Note: Any page added or renamed in Confluence or Coda will become available the next day at the earliest, after the nightly service run.**

### The Assistant multi-tool

The Assistant integrated with the Charisma Assistant provides full support through multiple functionalities, detecting user requirements and processing them quickly to provide efficient solutions.

**Available Features:**


|  |
| --- |



| Agent | Actions | Activation keywords |
| --- | --- | --- |
| Chat | General conversation, Q&A | Any general request |
| Summarizer | Summarizes long texts | "summarize", "summary" |
| Translator | Translates texts/files | "translate to", "translation" |
| DocuFlow | Generates PRDs, plans, diagrams | "prd", "execution plan", "diagram" |
| Code Review | Analyzes and improves code | "code review", "analyze code" |


#### Chat

General conversation feature. Answers questions of a general nature.

**⚠️ Note:** ***The agent not is connected to internet. The information received is not updated or verified in real time.***

![image](/help-images/en_0049.png)

#### Document summarizer

**Feature: Summarization of documents and extended texts.**

Supported formats: Text.

Language Capabilities:

Summarization in the same language as the original text

Cross-language summarization (e.g., text in English → summary in Romanian)

Ability to explicitly specify the language for the summary

**Usage example: "Summarize the following text in Romanian:" [text in English]**

Result: A concise and relevant summary in the requested language

![image](/help-images/en_0050.png)

#### Text translator

**Feature: Professional translation into multiple languages.**

Method for providing text: Copy/paste directly into the chat.

![image](/help-images/en_0051.png)

Example of translating text into English:

![image](/help-images/en_0052.png)

Example of translation into Spanish:

![image](/help-images/en_0053.png)

#### Code review

**Feature: Analyzes, optimizes, and corrects source code.**

Usage Process:

Add the code via copy/paste into the chat

Specify the request (ex: "Cod review”)

The tool analyzes the code

You receive detailed suggestions with explanations

Capabilities:

Error and bug detection

Performance optimization

Readability improvement

Best practice suggestions

Detailed explanations for each modification

![image](/help-images/en_0054.png)

***Attaching Code Files (SQL, Python, and other formats)***

In addition to copy/paste, the Tessa platform allows attaching code files directly for code review. This feature is available through the File Search assistant and is used via the „Attach Files" button or through drag & drop.

**Supported code formats:**

SQL (.sql) — database scripts, stored procedures, queries

Python (.py) — scripts and modules

Other text code formats (JavaScript, C#, TypeScript, XML, etc.) — processed as plain text

**Steps for use:**

**Step 1  —  Select the File Search assistant**

From the assistant selector in the top bar, choose File Search.

![image](/help-images/en_0055.png)

**Step 2  —  Upload the file**

Press the "Attach Files" button in the message field or drag the file directly into the chat window (drag & drop). The file appears above the message field, ready for processing.

![image](/help-images/en_0056.png)

**Step 3  —  Deactivate the File Search button and formulate the request**

Once the file is attached, the application automatically detects the file type and deactivates the File Search button. If this does not happen, manually deactivate the File Search button from the message bar so the assistant processes the file ca text de cod, not as indexed document. Write the desired request in the field of message (ex.: „Check if script is correct") and press Enter.

![image](/help-images/en_0057.png)

**Step 4  —  View the result**

The Assistant analyzes the code and returns a detailed response: it identifies syntax errors, explains the script logic, suggests improvements, and provides a corrected version.

![image](/help-images/en_0058.png)

**Important behavior to note:**

The file is not vectorized and is not saved in the database — it remains only in the current conversation. If you open a new chat or switch to another conversation, the file must be attached again.

All code files are processed as plain text, regardless of the file extension

Recommended limit: **aproximately 1.500 lines of code per file**. Larger files are partially processed — only the first ~1,500 lines

Processing code files does not consume tokens from the daily limit of 20,000 — the processing cost is zero

Export response currently there is no dedicated export button — use copy/paste to extract the corrected code from the assistant's response

**Note: For large SQL files (over 1,500 lines), split the script into logical chunks (e.g.: one module or stored procedure per conversation) and attach them separately for optimal results.**

**Document Flow**

**Feature: Generation of professional documentation using AI.**

Types of Generated Documents:

Technical specifications – Complete details for implementation

PRD (Product Requirement Document) – Structured product requirements

Execution plans – Roadmaps and tasks

Process diagrams – Visual flows for workflows

![image](/help-images/en_0059.png)

**Recommendation: The more initial details you provide, the more complete and accurate the generated document will be. Include:**

Context and objectives

Stakeholders involved

Constraints and limitations

Functional and non-functional requirements

**Example process diagram:**

![image](/help-images/en_0060.png)

### PPM Agent – Timesheets from Chat

The PPM Agent is an AI assistant integrated into Assistant that creates a direct link between Tessa and the Planview PPM system. Through it, you can view your own timesheets, enter hours directly from the chat field, check project allocations, and submit timesheets for approval — without opening the PPM application. The user is automatically recognized based on the domain account, and all operations are done conversationally, in natural language, on the main screen.

#### Accessing the PPM agent

The PPM Agent is accessed from the chat section by entering the information required for time logging or PPM requests. Click the "Start Chat" button to begin a session; the chat interface is identical to that of any other assistant.

![image](/help-images/en_0061.png)

#### Using the PPM agent

The agent page has the same configuration as any other agent. Questions are entered directly in the chat; the user is recognized automatically. 

![image](/help-images/en_0062.png)

#### Viewing Timesheets

You can request a view of timesheets for any recent period using natural language. The agent understands exact dates, relative ranges ("last week", "last month", "starting from March 8") and individual dates. The response includes complete details: hours per day, per project, per task, and the associated notes.

#### Examples of questions for viewing timeheets

***Example 1 – Timesheets for a specified period***

*I want to view the timesheet for the period 13.03.2026 – 16.03.2026*

The agent returns detailed daily timesheets for the requested period, including hours per project, per task, and the notes added to each timesheet entry. The response includes the total hours for the period.

![image](/help-images/en_0063.png)

**Example 2 – Timesheets for a single day**

*Show me timesheets for 16.03.2026*

The agent displays a complete breakdown of the respective day: each recorded activity, allocated hours, the corresponding project and task, and the notes added.

![image](/help-images/en_0064.png)

**Example 3 – Timesheets using a relative date**

*We are in March. I want to see the timesheets for last month.*

The agent interprets „ last month” relative to the current date and returns timesheets for the entire previous month. There is no need to specify exact dates — the agent understands temporal expressions in natural language.

![image](/help-images/en_0065.png)

#### Adding Timesheets from Chat

This is the agent’s main feature: entering timesheets directly from the chat, without accessing the PPM interface. Specify in your message the number of hours, the date, the project, the task, and optionally, notes descriptive. The agent processes the request and records the timesheet in system.

#### Example of timesheet entry

*Record 3 hours today on the ERP_PDM_CHARISMA_AI project, on the PPM in Tessa task and add to Notes: PPM Agent Testing*

The agent automatically identifies the specified project and task, records the 3 hours for the current day, and adds the indicated notes. You will receive a confirmation with the details of the recorded timesheet.

***⚠️ Make sure to specify the correct project code (e.g., ERP_PDM_CHARISMA) and the exact task name. You can verify the list of available tasks before entering a timesheet. .***

![image](/help-images/en_0066.png)

#### Viewing Allocated Projects and Tasks

Before recording hours, it is recommended to check the list of projects and tasks you are assigned to, to ensure you are using the correct names.

**Example 1 – List of allocated projects**

*I want to know which projects I am assigned to*

The agent returns the complete list of active projects the user is assigned to, along with the official PPM codes required for correct timesheet entries.

![image](/help-images/en_0067.png)

**Example 2 – Tasks allocated for a week**

*I want to see the tasks allocated for the week of 16 MARCH – 20 MARCH*

The agent displays the tasks allocated in PPM for the specified period, grouped by project. This is useful for planning the week’s days and correctly allocating hours per activity.

![image](/help-images/en_0068.png)

#### Other Available Features

In addition to the features described above, the PPM agent also supports the following requests:

View timesheets on working days, marking days without entries (displaying 0h for days without a timesheet entry)

Identify past days with incomplete hours or fewer than 8 hours (e.g., "Show days where 8 hours have not been logged")

Checking unapproved timesheets (e.g., "I want to see if there are any unapproved timesheets")

Complete report of tasks allocated to a project (e.g., "I want a report of the tasks I am assigned to on the ERP_PDM_CHARISMA project")

View team members on a project (e.g., "I want to see the members of the ERP_PDM_CHARISMA project")

View project milestones (e.g., "Load the milestones from PPM for my projects")

Hours used and total available hours on a project (e.g., "Load the hours used and total available hours for the ERP_PDM_CHARISMA project")

Sending timesheets for approval to manager (e.g., "I want to submit the timesheet to my manager for the period 16.03.2026 – 31.03.2026") — the agent requests confirmation before submitting

**Note:** ***The Assistant automatically recognizes the connected user — there is no need to specify an email address or other identifying information. Always use the exact project code and the correct task name to avoid errors to timesheet entry. The exact list  can be obtained  from the PPM agent before adding hours.***

#### PPM Agent – Commands Lists


| # | Category | Command (message in chat) |
| --- | --- | --- |
| 1 | View timesheets | I want to view the timesheet for the period 13.03.2026 - 16.03.2026 |
| 2 | View timesheets | I want to see the timesheet starting from March 8 |
| 3 | View timesheets | Load the timesheet for 02 March - 06 March |
| 4 | View timesheets | Show me the timesheets for 16.03.2026 |
| 5 | View timesheets | We are in March. I want to see the timesheets for last month |
| 6 | Advanced view | I want to view the timesheet for the period 01.03.2026 - 16.03.2026, grouped by week |
| 7 | Advanced view | Load past days where 8 hours have not been logged or more than 8 hours have been logged |
| 8 | Timesheet entry | Record 3 hours today on the ERP_PDM_CHARISMA_AI project, on the PPM in Tessa task |
| 9 | Projects and tasks | I want to know which projects I am assigned to |
| 10 | Projects and tasks | I want to see the tasks allocated for the week of 16 MARCH - 20 MARCH |
| 11 | Projects and tasks | I want a report of the tasks I am assigned to on the ERP_PDM_CHARISMA_AI project |
| 12 | Timesheets approval | I want to see if there are any unapproved timesheets |
| 13 | Project Information | I want to see the members of the ERP_PDM_CHARISMA_AI project |
| 14 | Project Information | Load the milestones from PPM for my projects |
| 15 | Project Information | Load the hours used and total available hours for the ERP_PDM_CHARISMA_AI project |


### Jira Ticket Matching for Screen Errors

Tessa can automatically recognize application errors from an image and check whether a similar issue has already been reported in Jira. When you attach a screenshot or a photo of an error message from  Charisma desktop screen, a web page, or even a handheld or mobile terminal the Assistant reads the image, extracts the relevant error details, and searches the Jira ticket history for a close match. This helps you find out in seconds whether a known ticket already covers the problem, instead of searching Jira manually or opening a duplicate ticket.

#### How it works

Open a conversation with the Assistant and attach a screenshot or photo showing the error (you can drag and drop the file, paste it from the clipboard, or use the attachment button). You can optionally add a short description, but this is not required, Tessa reads the text directly from the image, including error dialogs, stack traces, and validation messages, in Romanian or English. Tessa analyzes the image and replies within the same conversation.

#### Possible outcomes

**Similar ticket found**

Tessa replies with a message such as “Am găsit câteva tichete posibil similare”, followed by a list of up to 3 Jira tickets (for example, ERPCORE-XXXXX), each shown as a clickable link that opens the matching ticket directly in Jira. If you want to see other similar tickets, you can ask for them in the conversation, and Tessa will search for up to 3 additional tickets.

**No similar ticket was found**

Tessa replies “Nu am găsit niciun tichet Jira asemănător cu eroarea descrisă.”, letting you know that no existing ticket matches your error, so you can proceed to report a new one.

![image](/help-images/en_0069.png)

#### Examples

***Example 1 – Charisma  screen error***

A Charisma window displays an error, for instance a primary key or foreign key constraint violation. After the screenshot is attached and sent, Tessa returns the closest matching Jira ticket, if one exists.

***Example 2 – Handheld or mobile device error***

An error appears on a handheld barcode scanner or mobile terminal used in the warehouse. A photo of the screen, taken with a phone, is enough for Tessa to read the error text and search Jira for a similar ticket.

![image](/help-images/en_0070.png)

***For best accuracy, make sure the screenshot is legible and includes the full error message. Cropped or blurry images may reduce the accuracy of the match. Tessa can read text from photos as well as from digital screenshots — for example, a photo taken with a phone of a monitor or of a handheld device screen.***

**Note:** ***This feature searches only tickets already present in the Jira ticket history indexed by Tessa, not older than 4 years ago, very recently created tickets may also not yet appear in the results as they haven’t been processed yet.***

### Opening Jira Tickets

When Tessa does not identify any existing Jira ticket matching the reported screen error (see the previous section, the “No similar ticket was found” outcome), it offers you the option to open a new ticket directly in Jira, without having to leave the Tessa conversation or log into Jira separately. All you need to do is follow the steps the Assistant provides directly in the chat.

#### How it works

Tessa asks whether you want to open a new ticket for the reported error:

![image](/help-images/en_0071.jpg)

Reply “yes” to continue. Tessa then asks you to choose the Jira project the ticket will be opened in and displays the list of available projects (top 10); type the name or code of the desired project (for example, CEaaS):

![image](/help-images/en_0072.jpg)

Tessa confirms the chosen project and asks which ticket type you want to open: Task, Bug, Sub-Task, Epic, or Story. Once you choose the type, it displays the fields to fill in Summary (required), Description, Assignee, Epic Link, and TS_CMX_Project (required) together with the most commonly used values for the selected project and a filled-in example. Type all the fields in a single message, one field per line, in the format “Field: value”:

![image](/help-images/en_0073.jpg)

Tessa displays a summary of the ticket  including the screenshot that will be attached  and asks for final confirmation: “Do you confirm creating the ticket?”  (yes/no):

![image](/help-images/en_0074.jpg)

After you confirm with “yes”, Tessa creates the ticket directly in Jira and replies with the code of the newly created ticket, along with a link to it, also confirming how many screenshots were attached.

#### The ticket in Jira

The ticket appears immediately in Jira, with all fields filled in and the screenshot attached, ready to be picked up by the support team:

![image](/help-images/en_0075.jpg)

#### Details about the created ticket

For traceability and control, tickets opened through Tessa follow a few fixed rules:

**Reporter: aicharisma**

The ticket is created and registered in Jira under the technical account aicharisma. It cannot be opened under the personal account of the user who initiated the request in Tessa.

**Label: ai-generated**

Every ticket opened through this feature automatically receives the ai-generated label, so it can be easily identified as created by an AI assistant.

**Assignee**

If filled in, the Assignee field is validated by Tessa and shown with the person’s full name and email address from the system; if left blank, the ticket remains unassigned.

**Attachments**

The screenshot or photo originally analyzed by Tessa is automatically attached to the newly created ticket.

**Returning the ticket to the reporter**

Because the ticket’s reporter is the technical account aicharisma rather than the user’s personal account, the ticket description automatically includes the note “Raportat din Tessa de <adresa de email a utilizatorului>” (Reported from Tessa by the user’s email address). This way, once the ticket is resolved, the support team knows exactly who to return it to or notify of the resolution.

**Note:** ***Tickets opened through Tessa can be edited afterwards directly in Jira (assignee, priority, components, etc.). Always review the data shown in the summary before confirming ticket creation, since it can no longer be changed from the chat once the ticket has been created.***

### Exporting and Sharing Conversations

![image](/help-images/en_0076.png)

#### Exporting Conversations

You can export any conversation to save it locally or include it in reports and documentation. Exporting in text format (.txt) is ideal when you want to edit or reuse the response content,  for example, copying an AI-generated specification directly into a Word document or email. The screenshot format is recommended when you want to present the conversation exactly as it appears on the platform, including formatting, tables, and code blocks, without any subsequent editing being necessary.

![image](/help-images/en_0077.png)

Steps for export:

Click the "Export" button (the download icon) from the actions bar

Select the desired format from the available list

The system generates the file and the download starts automatically

Available export formats:


| Format | Description |
| --- | --- |
| 📄 Text (.txt) | Export as plain text, easy to edit — ideal for copying content into Word documents or emails |
| 📸 Screenshot | Visual capture of a conversation, including the original formatting, tables, and code blocks |


#### Sharing Conversations

You can share a conversation with a colleague via a unique link, without requiring them to authenticate on the platform. This is especially useful when you want to quickly send a complex response — an analysis, an execution plan, or an AI-generated diagram — to a colleague who does not have an active account or is not logged in at that moment. The link remains active indefinitely and can be revoked at any time, giving you complete control over access to the information.

![image](/help-images/en_0078.png)

Sharing features:

Generate a unique public link – the link remains valid long-term

QR Code – for quick sharing on mobile devices

Expiration setting – links can expire after a defined period

Revoke access – the link can be revoked at any time

Tracking (optional) – the option to see how many users have viewed the link

Example workflow:

Access an important conversation with analyses

Click Share → Create Link

Copy the link and send it to your colleague

Your colleague accesses the conversation without needing to authenticate

Access can be revoked at any time via "Delete Link"
