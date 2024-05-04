const mongoose = require('mongoose');
const axios = require('axios');

mongoose.connect("mongodb+srv://admin:admin@cluster0.2a2ykhi.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

// Define Block schema
const blockSchema = new mongoose.Schema({
    height: Number
});

const Block = mongoose.model('Block', blockSchema);

// Function to fetch data from API and save to MongoDB
async function fetchDataAndSave() {
    try {
        const heightdata = await Block.find();
        console.log("Height Data: ", heightdata);
        
        if (heightdata.length > 0) {
            const response = await axios.get('https://mempool.space/api/blocks/tip/height');
            const latestHeight = response.data;
            let checking = false;
            for (let i = 0; i < heightdata.length; i++) {
                if (heightdata[i].height === latestHeight) {
                    checking = true;
                }
            }

            if (!checking) {
                const blockData = {
                    height: latestHeight
                };
                const block = new Block(blockData);
                await block.save();
                console.log('New block data saved:', blockData);
            } else {
                console.log('Data already up to date.');
            }
        } else {
            const response = await axios.get('https://mempool.space/api/blocks/tip/height');
            const blockData = {
                height: response.data
            };
            const block = new Block(blockData);
            await block.save();
            console.log('First block data saved:', blockData);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to fetch data in a loop
async function fetchAndSaveInLoop() {
    while (true) {
        await fetchDataAndSave();
        await new Promise(resolve => setTimeout(resolve, 30000));
    }
}

// Start fetching data
fetchAndSaveInLoop();

// Error handling for MongoDB connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});
