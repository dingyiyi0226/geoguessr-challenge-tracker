# 🌍 Geoguessr Challenge Tracker

A modern React application to track and visualize your Geoguessr challenge results. Simply paste challenge URLs and get beautiful, organized results in a table format.

## ✨ Features

- **Real API Integration**: Connect to Geoguessr's official API to fetch actual challenge data
- **Multiple Players Support**: View all participants in a challenge with detailed breakdowns
- **Round-by-Round Analysis**: Expand player results to see performance in each round
- **Easy URL Input**: Paste any Geoguessr challenge URL and automatically fetch results
- **Authentication Management**: Secure token-based authentication with easy setup
- **Beautiful UI**: Modern, responsive design with gradient backgrounds and smooth animations
- **Detailed Results**: View challenge names, player names, scores, completion times, distances, and dates
- **Color-coded Performance**: Scores are color-coded based on performance levels
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Smart Fallback**: Graceful fallback to simulated data when API is unavailable

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- Yarn package manager

### Installation

1. **Clone or download the repository**
   ```bash
   git clone <your-repo-url>
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

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application.

## 📖 How to Use

### Initial Setup (Optional but Recommended)

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
   - `https://www.geoguessr.com/c/ABC123` (short URL)
   - Or just the challenge ID: `ABC123`

3. **Click "Add Challenge"**: The application will fetch the challenge data automatically

### Viewing Results

4. **Browse Challenges**: Each challenge appears as an expandable card showing:
   - Challenge name and map
   - Number of participants
   - Creator and creation date
   - Demo badge (if using simulated data)

5. **View All Players**: Click on a challenge card to expand and see:
   - All participants and their scores
   - Total completion times
   - When each player completed the challenge

6. **Detailed Round Analysis**: Click on any player to see:
   - Score for each round (1-5)
   - Time taken per round
   - Distance from correct location

### Management

7. **Manage Results**: 
   - Remove individual challenges with the "Remove" button
   - Clear all results with the "Clear All" button
   - Disconnect API authentication when needed

## 🔧 Technical Details

### Built With

- **React 18**: Modern React with hooks
- **Styled Components**: CSS-in-JS styling solution
- **Axios**: HTTP client for API requests
- **Modern CSS**: Gradients, animations, and responsive design

### API Integration

The application includes **full integration** with Geoguessr's official API:

- **Endpoints Used**:
  - `v3/challenges/<challengeId>` - Fetch challenge details and participants
  - `v3/games/<gameToken>` - Fetch detailed game results for each player

- **Authentication**: Uses the `_ncfa` cookie for authentication (same as the website)

- **Data Retrieved**:
  - Challenge metadata (name, creator, map, etc.)
  - All participants and their game tokens
  - Round-by-round results for each player
  - Exact scores, times, and distances

- **Error Handling**: Comprehensive error handling for:
  - Authentication failures
  - Private/inaccessible challenges
  - Network issues
  - Invalid challenge IDs

**Note**: When authentication is not provided, the app displays realistic simulated data for demonstration purposes.

### Project Structure

```
src/
├── components/
│   ├── Header.js          # Application header with title
│   ├── ChallengeForm.js   # Form for inputting challenge URLs
│   └── ResultsTable.js    # Table for displaying results
├── utils/
│   └── geoguessrApi.js    # API integration utilities
├── App.js                 # Main application component
├── index.js              # Application entry point
└── index.css             # Global styles
```

## 🎨 Customization

### Styling

The application uses styled-components for styling. You can customize colors, fonts, and layouts by modifying the styled components in each file.

### Adding Features

Some ideas for additional features:
- Export results to CSV/Excel
- Performance statistics and charts
- Player comparison and ranking
- Historical tracking and trends
- Map-based visualization of guesses
- Challenge leaderboard sorting
- Score improvement tracking

## 🐛 Known Limitations

- Geoguessr API access requires manual cookie extraction (no official OAuth)
- Some challenges might be private or require specific permissions
- Cookie tokens expire periodically and need to be renewed
- Rate limiting may apply to API requests
- CORS restrictions may require running the app from localhost

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please create an issue in the repository.

---

**Note**: This application is not officially affiliated with Geoguessr. It's a third-party tool created for educational and personal use purposes. 