const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use(cors());

// File path for storing contracts
const contractsFilePath = 'contracts.json';

// Helper function to read contracts from file
function readContractsFromFile() {
    try {
        const contractsData = fs.readFileSync(contractsFilePath, 'utf8');
        return JSON.parse(contractsData);
    } catch (error) {
        return [];
    }
}

// Helper function to write contracts to file
function writeContractsToFile(contracts) {
    fs.writeFileSync(contractsFilePath, JSON.stringify(contracts, null, 2), 'utf8');
}

// Get contracts
app.get('/contracts', (req, res) => {
    const contracts = readContractsFromFile();
    res.json(contracts);
});

// Add contract
app.post('/contract', (req, res) => {
    const { contract } = req.body;

    if (!contract) {
        return res.status(400).json({ error: 'Contract name is required' });
    }

    const contracts = readContractsFromFile();
    contracts.push(contract);
    writeContractsToFile(contracts);

    res.status(201).json({ message: 'Contract added successfully', contracts });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
