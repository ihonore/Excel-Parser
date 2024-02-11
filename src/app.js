const express = require('express');
const XLSX = require('xlsx');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;

app.use(cors());

// Load the Excel file
const workbook = XLSX.readFile('./src/data/insee_rp_hist_2020_filtered.xlsx');
const sheetName = workbook.SheetNames[0];
const populationData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

// API endpoint to search for city population density
app.get('/population-density', (req, res) => {
    const cityName = req.query.city;
    const year = req.query.year || 2020;

    if (!cityName) {
        return res.status(400).json({ error: 'City name is required' });
    }

    const cityData = populationData.find(row => row[0] === cityName && row[1] === year.toString());

    if (!cityData) {
        return res.status(404).json({ error: 'City data not found for the specified year' });
    }

    res.json({ city: cityName, populationDensity: cityData[2] });
});

app.get('/', (req, res) => {
    res.json({ status: 200, message: "Welcome to the population density API" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} 🟢`);
});