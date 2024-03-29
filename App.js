
const express = require('express');
const cors = require('cors');

const multer = require('multer');
const { S3Client, ListObjectsCommand, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

// Create an Express application
const app = express();
const port = 3000;

app.use(cors());

// AWS S3 configuration
const s3Client = new S3Client({ region: 'us-east-1' }); // Change the region as needed

// Multer middleware configuration for handling file uploads
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Endpoint to list all objects in a bucket
app.get('/listObjects', async (req, res) => {
    try {
        const command = new ListObjectsCommand({ Bucket: 'my-cool-local-bucket' }); 
        const data = await s3Client.send(command);
        res.json(data.Contents.map(object => object.Key));
    } catch (err) {
        console.error("Error listing objects:", err);
        res.status(500).send("Error listing objects");
    }
});

// Endpoint to upload an object to a bucket
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const uploadParams = {
            Bucket: 'my-cool-local-bucket',
            Key: file.originalname,
            Body: require('fs').createReadStream(file.path),
        };
        await s3Client.send(new PutObjectCommand(uploadParams));
        res.send("Object uploaded successfully");
    } catch (err) {
        console.error("Error uploading object:", err);
        res.status(500).send("Error uploading object");
    }
});

// Endpoint to retrieve an object from a bucket
app.get('/getObject/:key', async (req, res) => {
    const key = req.params.key;
    try {
        const command = new GetObjectCommand({ Bucket: 'my-cool-local-bucket', Key: key });
        const data = await s3Client.send(command);
        res.send(data.Body.toString());
    } catch (err) {
        console.error("Error retrieving object:", err);
        res.status(500).send("Error retrieving object");
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});