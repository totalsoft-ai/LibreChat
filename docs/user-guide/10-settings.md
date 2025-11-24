# Settings & Personalization

Customize TESSA to match your preferences, manage your account, and control your data.

## What You'll Learn

- General settings (theme, language, UI preferences)
- Chat settings (font, display, fork behavior)
- Account settings (avatar, username, 2FA)
- Data management (clear, export, import)
- Balance and credits (if enabled)
- Privacy and security settings

## Accessing Settings

**How to open settings:**

1. Click your **user icon** or **menu** (usually top-right)
2. Select **Settings**
3. Settings modal/page opens with tabs

**Settings tabs:**
- **General**: Theme, language, basic preferences
- **Chat**: Chat display and behavior
- **Speech**: Voice features (see [Speech & Audio](./08-speech.md))
- **Account**: Profile and security
- **Data**: Data management and privacy
- **Balance**: Credits and usage (if enabled)
- **Commands**: Custom commands (if available)

## General Settings

### Theme Selection

**Available themes:**
- **Dark**: Dark background, light text (default for many)
- **Light**: Light background, dark text
- **System**: Matches your operating system theme

**To change theme:**
1. Go to **Settings** > **General**
2. Find **Theme** selector
3. Click desired theme
4. Changes apply immediately

> **Tip:** Dark theme is easier on the eyes in low light. Light theme is better for bright environments.

### Language Selection

TESSA supports 36 languages!

**Available languages include:**
- English
- Spanish (Español)
- French (Français)
- German (Deutsch)
- Italian (Italiano)
- Portuguese (Português)
- Chinese (中文)
- Japanese (日本語)
- Korean (한국어)
- Russian (Русский)
- Arabic (العربية)
- And many more...

**To change language:**
1. Go to **Settings** > **General**
2. Find **Language** dropdown
3. Select your preferred language
4. Interface updates immediately

> **Note:** Language affects UI only, not AI responses. Ask AI to respond in any language.

### Auto-Scroll

**What it does:** Automatically scrolls to show new messages

**When enabled:**
- Chat automatically scrolls as AI responds
- Always see latest message
- Smooth reading experience

**When disabled:**
- Chat stays at current scroll position
- You control scrolling manually
- Good if you're reviewing earlier messages

**To toggle:**
1. Settings > General
2. Toggle **Auto-Scroll** ON/OFF

### Archived Chats

View and manage archived conversations:

1. Settings > General
2. Click **Archived Chats**
3. See list of archived conversations
4. Click conversation to view
5. Unarchive to restore to main list

**Managing archived chats:**
- **Unarchive:** Restore to main conversation list
- **Delete:** Permanently remove
- **Search:** Find specific archived conversation

## Chat Settings

### Font Size

Adjust text size for comfortable reading:

**Available sizes:**
- Small
- Normal (default)
- Large
- Extra Large

**To change:**
1. Settings > Chat
2. Find **Font Size** selector
3. Choose size
4. Chat text updates immediately

> **Tip:** Larger fonts are easier to read. Smaller fonts fit more content on screen.

### Text Direction

For languages with different reading directions:

**Options:**
- **LTR** (Left-to-Right): English, Spanish, French, etc.
- **RTL** (Right-to-Left): Arabic, Hebrew, etc.

**To change:**
1. Settings > Chat
2. Select **Text Direction**
3. Choose LTR or RTL
4. Layout adjusts immediately

### Fork Settings

Configure how conversation forking behaves:

**Fork behavior options:**
- **Always show fork options:** Modal appears with 4 fork options
- **Direct fork to new conversation:** Immediately creates fork
- **Ask each time:** Prompt for preference

**To configure:**
1. Settings > Chat
2. Find **Fork Settings**
3. Select preferred behavior

**Fork options display:**
- **Visible:** Show all 4 fork options
- **Hidden:** Use default behavior
- **Customizable:** Set default fork type

### Display Preferences

**Show Thinking/Reasoning:**
- Toggle to show or hide AI's thinking process (Claude models)
- When enabled: See how AI reasons through problems
- When disabled: See only final responses

**Save Badge States:**
- Remember which notification badges you've dismissed
- Persist across sessions
- Keep interface clean

**To configure:**
1. Settings > Chat
2. Toggle preferences ON/OFF

## Account Settings

### Avatar Management

**Upload custom avatar:**
1. Settings > Account
2. Click **Avatar** section
3. Click **Upload** or **Change Avatar**
4. Select image file (JPG, PNG)
5. Crop if needed
6. Save

**Remove avatar:**
1. Settings > Account
2. Click **Remove Avatar**
3. Returns to default avatar

**Avatar specifications:**
- Recommended size: 256x256 pixels or larger
- Supported formats: JPG, PNG, GIF
- Maximum file size: Usually 2-5 MB

### Display Username in Messages

**What it does:** Shows your username above your messages in chat

**When enabled:**
- Your username appears above your messages
- Helpful in shared screenshot or multi-user contexts
- More conversational feel

**When disabled:**
- Only "You" or generic indicator shown
- Cleaner interface
- More privacy in screenshots

**To toggle:**
1. Settings > Account
2. Toggle **Display Username in Messages** ON/OFF

### Two-Factor Authentication (2FA)

Add extra security to your account with 2FA.

**What is 2FA?**
- Requires two forms of authentication
- Password + authentication code
- Code generated by app on your phone
- Much more secure than password alone

**Setting up 2FA:**

**Step 1: Initiate Setup**
1. Settings > Account
2. Find **Two-Factor Authentication**
3. Click **Enable 2FA** or **Setup**

**Step 2: Get Authenticator App**
If you don't have one, download:
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Any TOTP-compatible app

**Step 3: Scan QR Code**
1. Open authenticator app
2. Scan the QR code shown in TESSA
3. Or manually enter the secret key
4. App generates 6-digit codes

**Step 4: Verify**
1. Enter current 6-digit code from app
2. Verify it works
3. Proceed to backup codes

**Step 5: Save Backup Codes**
1. System generates backup codes
2. **SAVE THESE SAFELY!**
3. Use if you lose your phone
4. Each code works once
5. Print or save to password manager

**Step 6: Confirm**
1. Confirm you've saved backup codes
2. 2FA is now enabled
3. Future logins require code

**Using 2FA:**
1. Enter email and password as usual
2. System prompts for 6-digit code
3. Open authenticator app
4. Enter current code
5. Log in successfully

**Disabling 2FA:**
1. Settings > Account > 2FA
2. Click **Disable 2FA**
3. Enter password
4. Enter current 6-digit code
5. Confirm disable
6. 2FA is removed

> **Warning:** Only disable 2FA if absolutely necessary. It significantly increases security.

**Using Backup Codes:**
- If you lose your phone
- If authenticator app isn't working
- Enter backup code instead of 6-digit code
- Each code works only once
- Request new backup codes after using some

### Delete Account

Permanently delete your TESSA account.

> **Warning:** This is permanent and cannot be undone!

**What gets deleted:**
- Your account
- All conversations
- All agents
- All prompts
- All settings
- All uploaded files
- All usage data

**What doesn't get deleted:**
- Shared content (if shared with others)
- Team resources (in some configurations)

**To delete account:**
1. Settings > Account
2. Scroll to **Delete Account**
3. Click **Delete My Account**
4. Read warnings carefully
5. Type your password
6. Type confirmation phrase (e.g., "DELETE")
7. Click final confirm
8. Account is immediately deleted

**Before deleting:**
- Export important conversations
- Save any valuable prompts
- Download created content
- Inform team if using shared resources
- Consider archiving instead of deleting

## Data Management

### Clear Conversations

Remove all conversations at once.

**Options:**
- **Clear All:** Delete all conversations
- **Clear Selected:** Choose specific conversations to delete
- **Clear by Date:** Delete conversations before certain date
- **Clear by Endpoint:** Delete conversations from specific models

**To clear conversations:**
1. Settings > Data
2. Click **Clear Conversations**
3. Choose clear option
4. Confirm deletion
5. Conversations are permanently deleted

> **Warning:** This cannot be undone. Export important conversations first!

### Delete Cache

Clear cached data to free space or fix issues.

**What gets cleared:**
- Cached API responses
- Temporary data
- TTS audio cache
- Image previews
- Local storage items

**When to clear cache:**
- Running low on browser storage
- Experiencing UI issues
- After major updates
- Voices or images not loading properly

**To delete cache:**
1. Settings > Data
2. Click **Delete Cache**
3. Confirm
4. Cache is cleared
5. Refresh page if needed

### Import Conversations

Import conversations from backups or other systems.

**Supported formats:**
- JSON exports from TESSA
- Some ChatGPT export formats
- Compatible conversation data

**To import:**
1. Settings > Data
2. Click **Import Conversations**
3. Select file(s) to import
4. Choose import options
5. Click **Import**
6. Conversations appear in sidebar

**Import options:**
- **Merge:** Add to existing conversations
- **Replace:** Delete existing and import
- **Duplicate handling:** Skip or import duplicates

### Revoke API Keys

Revoke access tokens and API keys.

**What gets revoked:**
- External API access tokens
- OAuth connections
- Third-party integrations

**When to revoke:**
- Security concern
- No longer using integration
- Suspicious activity
- Regular security maintenance

**To revoke:**
1. Settings > Data
2. Click **Revoke Keys** or **Revoke All**
3. Select specific keys or revoke all
4. Confirm
5. Keys are immediately invalid

### Shared Links

View and manage conversations you've shared publicly.

**Shared Links page shows:**
- List of all shared conversations
- Share link URLs
- Created dates
- View counts (if tracked)
- Options to revoke

**To manage:**
1. Settings > Data
2. Click **Shared Links** or **View Shared Conversations**
3. See list of shared items
4. Click conversation to preview
5. Click **Revoke** to unshare
6. Link becomes invalid immediately

**Revoking shared links:**
- Makes link inaccessible
- Others can no longer view
- Doesn't delete conversation (only sharing)
- Cannot be undone (link permanently revoked)

## Balance & Credits

**(If enabled by your administrator)**

### View Balance

See your current credit balance:

1. Settings > Balance
2. View **Current Balance**
3. See credits available
4. View usage history

**Credit display:**
- Current balance
- Credits used this period
- Credits remaining
- Next reset date (if applicable)

### Token/Credit Usage

View detailed usage information:

**Usage breakdown:**
- By model (GPT-4, Claude, etc.)
- By date/period
- By conversation
- Input vs. output tokens

**To view usage:**
1. Settings > Balance
2. Click **View Usage** or **Token Usage**
3. See detailed breakdown
4. Filter by date, model, etc.

### Auto-Refill Settings

**(If available)**

Configure automatic credit refills:

**Options:**
- **Enable/Disable auto-refill**
- **Threshold:** Balance level that triggers refill
- **Amount:** How many credits to add
- **Payment method**

**To configure:**
1. Settings > Balance
2. Find **Auto-Refill**
3. Enable and set threshold
4. Set refill amount
5. Configure payment method
6. Save settings

### Add Balance

Purchase additional credits:

1. Settings > Balance
2. Click **Add Credits** or **Purchase**
3. Select credit package
4. Complete payment
5. Credits added immediately

## Privacy & Security Best Practices

### Recommended Settings for Security

1. **Enable 2FA:** Always use two-factor authentication
2. **Strong password:** Use unique, complex password
3. **Regular updates:** Change password periodically
4. **Review shared links:** Regularly check what's shared
5. **Revoke unused access:** Remove old API keys/OAuth connections
6. **Monitor usage:** Check for unexpected activity
7. **Log out on shared devices:** Don't stay logged in

### Recommended Settings for Privacy

1. **Manage memories:** Review what AI remembers
2. **Limit sharing:** Only share what's necessary
3. **Use private conversations:** Keep sensitive work private
4. **Clear old data:** Regularly delete unnecessary conversations
5. **Export and delete:** Backup then remove sensitive data
6. **Check permissions:** Review agent and tool permissions

### Recommended Settings for Accessibility

1. **Larger font:** Use large or extra-large if needed
2. **High contrast theme:** Dark or light depending on preference
3. **Speech features:** Enable STT/TTS for voice interaction
4. **Slower TTS:** Reduce playback rate for clarity
5. **Auto-scroll:** Enable for easier following
6. **Keyboard navigation:** Learn keyboard shortcuts

## Troubleshooting

### Settings Not Saving
**Solutions:**
- Check internet connection
- Clear browser cache
- Try different browser
- Disable browser extensions temporarily
- Check browser console for errors

### 2FA Code Not Working
**Solutions:**
- Ensure correct code entered (6 digits)
- Check time sync on phone (important for TOTP)
- Try backup code instead
- Wait for next code cycle
- Contact administrator if locked out

### Import Failed
**Solutions:**
- Check file format (must be valid JSON)
- Verify file isn't corrupted
- Check file size limits
- Try importing smaller batches
- Review error message for specifics

### Theme Not Applying
**Solutions:**
- Refresh page
- Clear browser cache
- Check browser supports theme
- Try different browser
- Manually toggle theme again

## Next Steps

Explore related features:

- **[Getting Started](./01-getting-started.md)**: Basic TESSA usage
- **[Speech & Audio](./08-speech.md)**: Speech settings details
- **[Export & Sharing](./06-export-share.md)**: Exporting and sharing data
- **[Troubleshooting & FAQ](./11-faq.md)**: More help and answers

---

**Customize TESSA** to create your perfect AI assistant experience!
