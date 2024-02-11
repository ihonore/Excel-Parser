const express = require('express');
const XLSX = require('xlsx');
const app = express();
const PORT = process.env.PORT || 3000;

console.log("Opening");

let populationData;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} 🟢`);
});

// Function to load Excel data asynchronously
const loadExcelData = () => {
    return new Promise((resolve, reject) => {
        const workbook = XLSX.readFile('./src/data/insee_rp_hist_1968.xlsx');
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        resolve(data);
    });
};


// API endpoint to search for city population density
app.get('/population-density', (req, res) => {
    const cityName = req.query.city;
    const year = req.query.year || 2020;

    if (!cityName) {
        return res.status(400).json({ error: 'City name is required' });
    }

    if (!populationData) {
        return res.status(500).json({ error: 'Excel data not loaded yet. Please try again later.' });
    }

    const cityData = populationData.find(row => row[1] === cityName && row[2] === year.toString());

    if (!cityData) {
        return res.status(404).json({ error: 'City data not found for the specified year' });
    }

    res.json({ city: cityName, populationDensity: cityData[3] });
});

// Root endpoint
app.get('/', (req, res) => {

    // Load Excel data asynchronously
    loadExcelData().then(data => {
        populationData = data;
    }).catch(error => {
        console.error("Error loading Excel data:", error);
    });

    res.json({ status: 200, message: "Welcome to the population density API" });
});
