const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');



const app = express();
const port = 3005;

// MongoDB connection URI for remote host
const uri = 'mongodb://localhost/LibraryMan';

// Replace 'your_remote_host' and 'your_port' with the appropriate values

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(express.static('public'));


// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Function to validate email address format
function validateEmail(email) {
    const emailRegex = /@gmail\.com$/;
    return emailRegex.test(email);
}

// Function to validate phone number format
function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phoneNumber);
}

// Handle form submission
app.post('/signup', async (req, res) => {
    const { studentName, emailAddress, phoneNumber, studentRollNumber, fatherName, bookIssuedName } = req.body;

    // Validate email address
    if (!validateEmail(emailAddress)) {
        return res.status(400).send('Invalid email address format. Please try again.');
    }

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
        return res.status(400).send('Invalid phone number format. Please try again.');
    }

    // If validation passes, proceed with inserting data into MongoDB
    try {
        await client.connect();
        const database = client.db('LibraryMan');
        const collection = database.collection('studentss');
        await collection.insertOne({ studentName, emailAddress, phoneNumber, studentRollNumber, fatherName, bookIssuedName });
        // res.send('Student data inserted successfully! and U are Good to go '); 
        } catch (error) {
            console.error('Error inserting student data:', error);
            res.status(500).send('Error inserting student data');
        } finally {
        res.redirect('/success.html');
        await client.close();
    }
});
// Serve registered user details
app.get('/registeredDetails', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('LibraryMan');
        const collection = database.collection('studentss');
        //display all student's data who has signup
        const allStudents = await collection.find({}).toArray(); 
        res.json(allStudents); // Send the registered user details as JSON response
    } catch (error) {
        console.error('Error retrieving registered details:', error);
        res.status(500).send('Error retrieving registered details');
    } finally {
        await client.close();
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});


