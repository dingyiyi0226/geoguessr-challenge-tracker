# 🌍 Geoguessr Challenge Tracker

**A comprehensive web application for tracking, analyzing, and visualizing your Geoguessr challenge performance.** Transform raw challenge data into beautiful insights with detailed player statistics, performance trends, and exportable reports.

> **Note**: For production use, the **bookmarklet solution** provides instant challenge import from any GeoGuessr page with a simple copy-paste workflow. Local development supports direct API access for testing.

## 🚀 Getting Started

### Installation

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/dingyiyi0226/geoguessr-challenge-tracker.git
   cd geoguessr-challenge-tracker
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   yarn start
   ```

## 📖 How to Use

### 🔖 Bookmarklet Solution (Recommended)

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
   - Save

   **Show bookmarks bar**: `Ctrl+Shift+B` (Windows) or `Cmd+Shift+B` (Mac)

#### Using the Bookmarklet

1. **Navigate to a GeoGuessr Challenge**: Go to any challenge or results page (e.g., `https://www.geoguessr.com/challenge/ABC123`)
2. **Make sure you're logged in** to GeoGuessr  
3. **Click the bookmarklet** - Challenge data is automatically copied to clipboard
4. **Go to the tracker website** and paste the data in the input area
5. **Click "Import Data"** - Challenge is instantly added to your tracker!

#### Troubleshooting

- **"No challenge found"**: Make sure you're on a GeoGuessr challenge or results page
- **"Failed to copy to clipboard"**: Check browser clipboard permissions (modern browsers only)
- **Import fails**: Ensure you paste the complete JSON data from the bookmarklet
- **Invalid data**: Copy the full output - don't truncate the JSON data when pasting

---

### 💻 Local Development Setup

**For local development, you can use direct API access:**

### Initial Setup

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

---

### Importing Challenges from Discord

1. **Export from Discord**:
   - Use [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter/releases) to export the messages in the channel. Set the filter be "www.geoguessr.com/challenge".

2. **Import into the App**
   - We will parse every challenge links from each message.
   - The name of the challenge will be the date of the message.

## ⚙️ Configuration

### Bookmarklet Implementation Status

✅ **COMPLETED**: Streamlined bookmarklet solution ready for production use!

- ✅ **Modern clipboard API** - Fast, reliable data transfer
- ✅ **Parallel API fetching** - ~50% faster challenge data retrieval
- ✅ **Zero configuration** - Works out-of-the-box with any domain
- ✅ **Clean UI integration** - Seamless paste area in main interface  
- ✅ **Optimized code** - Minimal size (2.6KB), maximum performance
- ✅ **Simple workflow**: Click → Copy → Paste → Import

### How It Works

1. **Bookmarklet execution** - Runs on any GeoGuessr challenge page
2. **Parallel data fetching** - Simultaneously requests challenge info + player results  
3. **Automatic clipboard copy** - JSON data copied using modern clipboard API
4. **User workflow** - Navigate to tracker, paste data in input area
5. **Client-side processing** - Raw API data transformed into challenge format
6. **IndexedDB storage** - Challenge saved locally with full offline access
7. **Real-time UI update** - New challenge appears instantly in your tracker

### For Developers

**Building the Bookmarklet:**
1. Edit `scripts/bookmarklet.js` to modify bookmarklet functionality
2. Run `yarn build-bookmarklet` to generate the minified version
3. The built code is automatically exported to `src/utils/bookmarklet.js`

**Customization:**
- Bookmarklet is domain-agnostic - no configuration needed
- Click-to-copy functionality adapts to any deployment URL  
- Build process handles minification and escaping automatically
