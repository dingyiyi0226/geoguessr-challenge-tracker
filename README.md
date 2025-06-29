# 🌍 Geoguessr Challenge Tracker

**A comprehensive web application for tracking, analyzing, and visualizing your Geoguessr challenge performance.** Transform raw challenge data into beautiful insights with detailed player statistics, performance trends, and exportable reports.

> **Note**: Due to CORS restrictions, direct API access to Geoguessr currently works only in local development. For production use, the file import feature provides full functionality with exported challenge data.

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

### Importing Challenges from Discord

1. **Export from Discord**:
   - Use [DiscordChatExporter](https://github.com/Tyrrrz/DiscordChatExporter/releases) to export the messages in the channel. Set the filter be "www.geoguessr.com/challenge".

2. **Import into the App**
   - We will parse every challenge links from each message.
   - The name of the challenge will be the date of the message.
