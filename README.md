# 🌍 Geoguessr Challenge Tracker

**A comprehensive web application for tracking, analyzing, and visualizing your Geoguessr challenge performance.** Transform raw challenge data into beautiful insights with detailed player statistics, performance trends, and exportable reports.

## 📖 How to Use

### 🔖 Bookmarklet

**Import challenges instantly from any GeoGuessr page with our streamlined bookmarklet:**

#### Setup the Bookmarklet

1. **Get the Bookmarklet Code**:
   - Visit the tracker website at `https://dingyiyi0226.github.io/geoguessr-challenge-tracker/`
   - Click the blue bookmarklet code box to copy it automatically
   - Or manually copy from `src/utils/bookmarklet.js` in this repository

2. **Add to Your Browser**:
   - Right-click your bookmarks bar → "Add bookmark"
   - **Name**: `Import GeoGuessr Challenge`
   - **URL**: Paste the copied bookmarklet code

   **Show bookmarks bar**: `Ctrl+Shift+B` (Windows) or `Cmd+Shift+B` (Mac)

#### Using the Bookmarklet

1. **Navigate to a GeoGuessr Challenge**: Go to any challenge or results page (e.g., `https://www.geoguessr.com/challenge/ABC123`)
2. **Click the bookmarklet** - Challenge data is automatically copied to clipboard
3. **Go to the tracker website** and paste the data in the input area
4. **Click "Import Data"** - Challenge is instantly added to your tracker!

### 📤 Importing Challenges from Discord

1. **Export from Discord**:
   - Use [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter/releases) to export the messages in the channel. Set the filter be "www.geoguessr.com/challenge".

2. **Import into the App**:
   - We will parse every challenge links from each message.
   - The name of the challenge will be the date of the message.

## 🚀 Getting Started for Local Development

**For local development, you can use direct API access**, since we don't have CORS issue.

### Authentication Setup

1. **Authentication Setup** (for real data):
   - Open Geoguessr in your browser and log in
   - Open browser Developer Tools (F12)
   - Go to Application/Storage → Cookies → geoguessr.com
   - Find the `_ncfa` cookie and copy its value
   - In the app, click "Setup API Access" and paste the token

### Adding Challenges

2. **Enter Challenge URL**: Paste a Geoguessr challenge URL in the input field. Supported formats:
   - `https://www.geoguessr.com/challenge/ABC123`
   - `https://www.geoguessr.com/results/ABC123`
   - Or just the challenge ID: `ABC123`

3. **Click "Add Challenge"**: The application will fetch the challenge data automatically

### Building the Bookmarklet

1. Edit `scripts/bookmarklet.js` to modify bookmarklet functionality
2. Run `yarn build-bookmarklet` to generate the minified version
3. The built code is automatically exported to `src/utils/bookmarklet.js`
