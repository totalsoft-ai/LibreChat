# Main Screen

The main screen occupies the central area of the interface and represents the workspace where all conversations and interactions with AI assistants take place. All requests and generated responses are recorded here.

![image](/help-images/en_0035.png)

**Unified Interface**

All assistants use the same intuitive interface, the only visible difference is the name displayed in the upper left, which indicates the selected active assistant.

![image](/help-images/en_0036.png)

## QnA Assistant (Assistant with knowledge)

**Operation and Capabilities**

The QnA Assistant is specialized in providing answers based exclusively on documentation uploaded in Confluence. The assistant's performance depends directly on the quality and details of the formulated question.

Best Practices for Questions:

Formulate clear and direct questions

Include as many relevant details as possible

Specify context when necessary

Use specific terms from documentation

![image](/help-images/en_0037.png)

**Response Management**

If the requested information is not identified in the database, the assistant will communicate transparently: *"I could not identify an answer in the available documentation."*

![image](/help-images/en_0038.png)

Documentation from Confluence that forms the basis of the assistant's responses is loaded and vectorized in the database daily. If necessary, the frequency can be increased. It is the responsibility of each team to keep the documentation updated in Confluence, so that the agent can provide correct answers.

Because the documentation is also used to generate responses for the Ticheto application, it is recommended to create separate spaces for each mission and each client. The documentation is managed by each mission.

![image](/help-images/en_0039.png)

Documentation is accessed and loaded into the database both in link format and through direct addition on screen.

![image](/help-images/en_0040.png)

![image](/help-images/en_0041.png)

### Retrieving Documents from Confluence

**Synchronization with the Knowledge Base**

The platform integrates an **automatic mechanism** for retrieving documents from Confluence into the **vectorized database**. **Not all pages from Confluence are indexed** — to avoid overloading the database with irrelevant content, the system applies a **filter based on the page title**.

### Inclusion Rule — Filter by Title

A Confluence page is automatically retrieved **only if its title contains one of the key words** defined in the namespace configuration. This rule applies **regardless of the space** the page belongs to.

**The accepted key words in the title are:**


| Keyword (pattern) | Examples of accepted titles |
| --- | --- |
| documenta?i* | Documentation, Documentations |
| documentare | Documentation of process X |
| documentation | API Documentation |
| specifica?i* | Specification, Technical Specifications |
| manual* | User Manual, Manuals |
| configur?r* | Configuration, System Configurations |
| test case | Test case login |
| *test* | Testing, Tests, Test Run |
| tehnic | Technical Guide, Technical Documentation |
| train* | Training, Trainings, Train the trainer |


**Recommendation:** ***When creating a new page in Confluence, include one of the key words above in the title if you want it to be available in the Tessa agent’s responses.***

### Synchronization Schedule

The indexing service runs **automatically every night, at 02:00**. At each run, the system:

Scans pages from the configured Confluence namespaces

Filters pages whose title matches one of the defined patterns

Loads the content of eligible pages into vectorized database

Updates existing records if the page has been modified

**⚠ Warning:** *Any page* ***added or renamed*** *in Confluence will become available in Tessa* ***at the earliest the next day****, after the* **nightly service run**.

## Multi-tool Assistant (Assistant)

The assistant offers complete support through multiple functionalities, detecting user requirements and processing them quickly to provide efficient solutions.

**Available Functionalities:**


|  |
| --- |



| Agent | Actions | Activation keywords |
| --- | --- | --- |
| Chat | General conversation, Q&A | Any general request |
| Summarizer | Summarize long texts | "summarize", "summary" |
| Translator | Translate texts/files | "translate to", "translation" |
| DocuFlow | Generate PRDs, plans, diagrams | "prd", "execution plan", "diagram" |
| Code Review | Analyze and improve code | "code review", "analyze code" |


### Chat

General conversation functionality. Answers questions of a general nature.

**⚠️ Attention:** ***The agent is not connected to the internet. Information received is not updated or verified in real time.***

![image](/help-images/en_0042.png)

### Document summarizer

**Functionality:** Intelligent summarization of documents and extensive texts.

**Formate Suportate**: text direct.

Linguistic Capabilities:

Summarization in the same language as the original text

Cross-language summarisation (e.g.: text in English → summary in Romanian)

Option to explicitly specify the language for the summary

**Usage Example:** *"Summarise the following text in Romanian:"* [text in English]

Result: A concise and relevant summary in the requested language

![image](/help-images/en_0043.png)

### Text translator

**Functionality:** Professional translation in multiple languages.

Text input methods: direct Copy/Paste into chat.

![image](/help-images/en_0044.png)

Example of text translation to English:

![image](/help-images/en_0045.png)

Example of translation into Spanish:

![image](/help-images/en_0046.png)

### Code review

**Functionality:** Analyzes, optimizes, and corrects source code.

Usage Process:

Add code with Copy/Paste in chat

Specify the requirement (e.g.: "Code review”)

The tool analyses the code

You receive detailed suggestions with explanations

Capabilities:

Error and bug detection

Performance optimisation

Readability improvement

Best practices suggestions

Detailed explanations for each change

![image](/help-images/en_0047.png)

### Attaching Code Files (SQL, Python and other formats)

In addition to the copy/paste method, the Tessa platform allows direct attachment of code files for code review. The functionality is available through the **File Search** assistant and is used through the **"Attach Files"** button or through drag & drop.

**Supported code formats:**

•   **SQL (.sql)** — database scripts, stored procedures, queries

•   **Python (.py)** — scripts and modules

•   Other text code formats (JavaScript, C#, TypeScript, XML etc.) — processed as plain text

**Steps to use:**

**Step 1 — Select the File Search assistant**

From the assistant **selector** in the top **bar**, choose File Search.

![image](/help-images/en_0048.png)

**Step 2 — Upload the file**

Press the **"Attach Files"** button from the **message field** or drag the **file** directly into the chat **window** (drag & drop). The file appears above the **message field**, ready for **processing**.

![image](/help-images/en_0049.png)

**Step 3 — Disable the File Search button and formulate the request**

Once the **file** is **attached**, the application **detects** the file **type** and automatically **disables** the File Search **button**. If this doesn't **happen**, **disable** the File Search **button** from the **message bar** so that the assistant processes the file as code text, not as an **indexed** document. Write the desired request in the **message field** (e.g., "**Check if the script is correct**") and press Enter.

![image](/help-images/en_0050.png)

**Step 4 — View the result**

The assistant **analyzes** the code and returns a detailed **response**: **identifies** syntax **errors**, **explains** the script **logic**, **suggests** improvements and **provides** the corrected **version**.

![image](/help-images/en_0051.png)

**Important behavior to remember:**

•   The **file** is not **vectorized** and is not saved in the **database** — it remains only in the current conversation. If you open a new chat or another conversation, the file must be attached again

•   **All** code files are **processed** as plain text, **regardless** of **extension**

•   Limit: approximately **1,500 lines** of code per file. Larger files are processed **partially** — only the first ~1,500 lines

•   **Processing** code files does not **consume tokens** from the daily **limit** of 20,000 — the processing cost is **zero**

•   **Response export**: there is currently **no** dedicated **export button** — use **copy/paste** to extract the corrected code from the assistant's response

**Note: For large SQL files (over 1,500 lines), split the script into logical chunks (e.g., one module or stored procedure per conversation) and attach them separately for optimal results.**

### Document Flow

**Functionality:** Automatic generation of professional documentation using AI.

Types of Documents Generated:

Technical specifications – Complete details for implementation

PRD (Product Requirement Document) – Structured product requirements

Execution plans – Roadmaps and tasks

Process diagrams – Visual flows for workflows

![image](/help-images/en_0052.png)

**Recommendation:** The more initial details you provide, the completer and more accurate the generated document will be. Include:

Context and objectives

Involved stakeholders

Constraints and limitations

Functional and non-functional requirements

**Process diagram example:**

![image](/help-images/en_0053.png)

## PPM Agent – Timesheets from Chat

The PPM Agent is a specialized AI assistant that provides a direct link between Tessa and the Planview PPM system. Through it you can view your own timesheets, enter hours directly from the chat field, check project allocations, and send timesheets for approval — without opening the PPM application. The user is automatically recognized based on the domain account, and all operations are done conversationally, in natural language.

### Accessing the PPM Agent

The PPM Agent is accessed from the Agent Marketplace section. Press the Marketplace icon (4-square grid) from the top navigation bar of the left panel.

![image](/help-images/en_0054.png)

Also, you can find the PPM agent from the Tools Selector > My Agents > PPM.

![image](/help-images/en_0055.png)

In the Marketplace page, identify the agent **PPM** from the General category and press it to open it. Alternatively, use the “Search agents…” field and type “PPM”.

![image](/help-images/en_0056.png)

Press the “Start Chat” button to start a session with the PPM agent. The chat interface is identical to that of any other assistant — the active agent is indicated in the top bar with the icon and the name “PPM”.

![image](/help-images/en_0057.png)

### Using the PPM Agent

The agent page has the same configuration as the other agents. Questions are entered directly in the chat; the user is automatically recognised.

![image](/help-images/en_0058.png)

### Viewing Timesheets

You can request to view timesheets for any recent period using natural language. The agent understands exact dates, relative intervals (“last week”, “last month”, “starting from March 8”) and individual dates. The response includes complete details: hours per day, per project, per task and the associated notes.

### Example questions for viewing timesheets

**Example 1 – Timesheets for a specified period**

*I want to see the timesheet for the period 13.03.2026 – 16.03.2026*

The agent returns detailed daily timesheets for the requested period, with hours per project, per task, and the notes filled in at time logging. The response includes the total hours for the period.

![image](/help-images/en_0059.png)

**Example 2 – Timesheets for a single day**

*Show me the timesheets for the day of 16.03.2026*

The agent displays the complete breakdown of that day: each logged activity, allocated hours, corresponding project and task, and added notes.

![image](/help-images/en_0060.png)

**Example 3 – Timesheets using relative dates**

*We are in March. I want to see the timesheets for last month*

The agent interprets "last month" in relation to the current date and returns timesheets for the entire previous month. There is no need to specify exact dates — the agent understands temporal expressions in natural language.

![image](/help-images/en_0061.png)

### Adding Timesheets from Chat

This is the agent's main functionality: enter the timesheet directly from chat, without accessing the PPM interface. Specify in the message the number of hours, date, project, task, and optionally a descriptive note. The agent processes the request and records the timesheet in the system.

### Timesheet Entry Example

*Log 3 hours today on the ERP_PDM_CHARISMA_AI project, on the PPM in Tessa task and add to Note: PPM Agent Testing*

The agent automatically identifies the specified project and task, records the 3 hours for the current day, and adds the indicated note. You will receive a confirmation with the details of the recorded timesheet.

***⚠️ Make sure you correctly specify the project code (e.g.: ERP_PDM_CHARISMA) and the exact task name. You can check the list of available tasks before time logging.***

![image](/help-images/en_0062.png)

### Viewing Allocated Projects and Tasks

Before logging hours, it is recommended to check the list of projects and tasks you are allocated to, to ensure you use the correct names.

**Example 1 – List of allocated projects**

*I want you to tell me which projects I am allocated to*

The agent returns the complete list of active projects to which the user is allocated, with the official codes from PPM, necessary for correct time logging.

![image](/help-images/en_0063.png)

**Example 2 – Tasks allocated for a week**

*I want to see the tasks allocated for the week of MARCH 16 – 20*

The agent displays allocated tasks from PPM for the specified period, grouped by projects. Useful for planning the days of the week and correctly allocating hours per activity.

![image](/help-images/en_0064.png)

### Other Available Functionalities

In addition to the functionalities detailed above, the PPM agent also supports the following requests:

View timesheets per working day with marking of days without logged hours (display 0h for days with no entries)

Identification of past days with incomplete or under 8 hours (e.g.: “Load the dates where 8 hours are not logged”)

Checking unapproved timesheets (e.g.: “I want to see if there are unapproved timesheets”)

Raport complet al task-urilor alocate pe un proiect (ex.: „Vreau un raport al task-urilor pe care sunt alocat pe proiectul ERP_PDM_CHARISMA”)

View team members per project (e.g.: “I want to see the members of the ERP_PDM_CHARISMA project”)

View project milestones (e.g.: “Load the milestones from PPM for my projects”)

Used hours and total available hours per project (e.g.: “Load the used hours and total available hours for the ERP_PDM_CHARISMA project”)

Sending timesheets for approval to the manager (e.g.: “I want to send the timesheet to the manager for the period 16.03.2026 – 31.03.2026”) — the agent requests confirmation before sending

**Note:** ***The PPM Agent automatically recognizes the logged-in user — there is no need to specify the email address or other identification data. Always use the exact project code and correct task name to avoid errors in time logging. The exact list can be obtained from the PPM agent before adding hours.***


| Agent PPM – Command List | Agent PPM – Command List | Agent PPM – Command List |
| --- | --- | --- |
| # | Category | Command (chat message) |
| VIEW TIMESHEETS | VIEW TIMESHEETS | VIEW TIMESHEETS |
| 1 | View timesheets | I want to see the timesheet for the period 13.03.2026 – 16.03.2026 |
| 2 | View timesheets | I want to see the timesheet starting from 8 March |
| 3 | View timesheets | Load the timesheet for 02 March – 06 March |
| 4 | View timesheets | Show me the timesheets for the day 16.03.2026 |
| 5 | View timesheets | We are in March. I want to see the timesheets for the previous month |
| ADVANCED VIEW | ADVANCED VIEW | ADVANCED VIEW |
| 6 | Advanced view | I want to see the timesheet for the period 01.03.2026 – 16.03.2026 group by weeks, each week has 5 working days |
| 7 | Advanced view | I want to see the timesheet for the period 01.03.2026 – 16.03.2026 group by working days, when you find missing timesheets add 0h on the missing days |
| 8 | Advanced view | Load past dates or days where less than 8 hours or more than 8 hours are logged |
| TIMESHEET ENTRY | TIMESHEET ENTRY | TIMESHEET ENTRY |
| 9 | Timesheet entry | Log 3 hours today on project ERP_PDM_CHARISMA_AI, on the PPM task in Tessa and add to Notes: Testing Agent PPM |
| PROJECTS AND TASKS | PROJECTS AND TASKS | PROJECTS AND TASKS |
| 10 | Projects and tasks | I want you to tell me what projects I am allocated to |
| 11 | Projects and tasks | I want to see the tasks allocated to me for the week 16 MARCH – 20 MARCH |
| 12 | Projects and tasks | I want a report of the tasks I am allocated to on project ERP_PDM_CHARISMA_AI |
| TIMESHEET APPROVAL | TIMESHEET APPROVAL | TIMESHEET APPROVAL |
| 13 | Timesheet approval | I want to see if there are any unapproved timesheets |
| PROJECT INFORMATION | PROJECT INFORMATION | PROJECT INFORMATION |
| 14 | Project information | I want to see the members of project ERP_PDM_CHARISMA_AI |
| 15 | Project information | Load the next milestones from PPM for my projects |
| 16 | Project information | Load used hours and total available hours for project ERP_PDM_CHARISMA_AI |


## Export and Share Conversations

![image](/help-images/en_0065.png)

### Export Conversations

You can export any conversation to save it locally or to include it in reports and documentation. The text (.txt) export is ideal when you want to edit or reuse the content of the responses — for example, copying an AI-generated specification directly into a Word document or email. The screenshot format is recommended when you want to present the conversation exactly as it looks on the platform, including formatting, tables and code blocks, without any further editing needed.

![image](/help-images/en_0066.png)

Steps for export:

Press the "Export" button (download icon) from the action bar

Select the desired format from the available list

The system generates the file and the download starts automatically

Available export formats:


| Format | Description |
| --- | --- |
| 📄 Text (.txt) | Export as plain text, easy to edit |
| 📸 Screenshot | Visual capture of conversation, includes original formatting |


### Share Conversations

You can share a conversation with a colleague via a unique link, without requiring them to authenticate on the platform. This is especially useful when you want to quickly send a complex response — an analysis, an execution plan or an AI-generated diagram — to a colleague who does not have an active account or is not logged in at that moment. The link remains active indefinitely and can be revoked at any time, giving you full control over access to the information.

![image](/help-images/en_0067.png)

Sharing features:

Generate a unique public link – the link remains valid long-term

QR Code – for quick sharing on mobile devices

Set expiry – links can expire after a defined period

Revoke access – the link can be cancelled at any time

Tracking (optional) – the ability to see how many users have viewed the link

**Workflow example:**

Access an important conversation with analyses

Press Share → Create Link

Copy the link and send it to your colleague

The colleague accesses the conversation without requiring authentication

Access can be revoked at any time via "Delete Link"
