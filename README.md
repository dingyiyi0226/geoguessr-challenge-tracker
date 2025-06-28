# 🌍 Geoguessr Challenge Tracker

A modern React application to track and visualize your Geoguessr challenge results. Simply paste challenge URLs and get beautiful, organized results in a table format.

## ✨ Features

- **Easy URL Input**: Paste any Geoguessr challenge URL and automatically fetch results
- **Beautiful UI**: Modern, responsive design with gradient backgrounds and smooth animations
- **Detailed Results**: View challenge names, player names, scores, completion times, and dates
- **Color-coded Scores**: Scores are color-coded based on performance (Green: Excellent, Yellow: Good, Orange: Fair, Red: Needs Improvement)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Real-time Loading**: Loading indicators and error handling for better user experience

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

1. **Enter Challenge URL**: Paste a Geoguessr challenge URL in the input field. Supported formats:
   - `https://www.geoguessr.com/challenge/ABC123`
   - `https://www.geoguessr.com/results/ABC123`
   - Or just the challenge ID: `ABC123`

2. **Click "Add Challenge"**: The application will fetch the challenge data automatically

3. **View Results**: Results will appear in a beautiful table below with:
   - Challenge name
   - Player name
   - Total score (color-coded)
   - Total completion time
   - Date played

4. **manage Results**: 
   - Remove individual challenges with the "Remove" button
   - Clear all results with the "Clear All" button

## 🔧 Technical Details

### Built With

- **React 18**: Modern React with hooks
- **Styled Components**: CSS-in-JS styling solution
- **Axios**: HTTP client for API requests
- **Modern CSS**: Gradients, animations, and responsive design

### API Integration

Currently, the application uses mock data to demonstrate functionality. To integrate with the real Geoguessr API:

1. Obtain API credentials from Geoguessr
2. Update the `fetchChallengeData` function in `src/utils/geoguessrApi.js`
3. Replace the mock implementation with actual API calls

```javascript
// Example real API integration
const response = await axios.get(`https://api.geoguessr.com/api/v3/challenges/${challengeId}`, {
  headers: {
    'Authorization': `Bearer ${YOUR_API_TOKEN}`,
  }
});
```

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
- Export results to CSV
- Statistics and charts
- Player comparison
- Historical tracking
- Round-by-round breakdown

## 🐛 Known Limitations

- Currently uses mock data (API integration needed)
- Geoguessr API access requires authentication
- Some challenge URLs might not be accessible due to privacy settings

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please create an issue in the repository.

---

**Note**: This application is not officially affiliated with Geoguessr. It's a third-party tool created for educational and personal use purposes. 