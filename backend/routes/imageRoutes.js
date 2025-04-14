const express = require('express');
const router = express.Router();
const upload = require('../upload');
const db = require('../db');
const s3 = require('../s3');
const axios = require('axios');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Upload image
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { description, imageUrl } = req.body;

        let url = '';

        if (req.file) {
            url = req.file.location;
        } else if (imageUrl) {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');

            const imagePathFromUrl = new URL(imageUrl).pathname.slice(1);

            const command = new PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: imagePathFromUrl,
                Body: buffer,
                ContentType: response.headers['content-type'],
            });

            await s3.send(command);

            url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imagePathFromUrl}`;
        } else {
            return res.status(400).json({ message: "No image provided" });
        }

        const [result] = await db.query("INSERT INTO images (url, description) VALUES (?, ?)", [url, description]);

        res.json({
            id: result.insertId,
            url,
            description,
            message: 'Image uploaded successfully'
        });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Upload failed", error: err });
    }
});

// Get all images with pagination
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    try {
        const [results] = await db.query('SELECT * FROM images LIMIT ? OFFSET ?', [limit, offset]);
        const [countRows] = await db.query('SELECT COUNT(*) as count FROM images');
        const total = countRows[0].count;
        const totalPages = Math.ceil(total / limit);

        res.json({
            images: results,
            currentPage: page,
            totalPages,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Update image & description
router.put('/update/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;

    try {
        // Fetch current image details
        const [result] = await db.query('SELECT * FROM images WHERE id = ?', [id]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const existingImageUrl = result[0].url;
        let updatedUrl = existingImageUrl;

        // If a new image is uploaded
        if (req.file) {
            // ✅ Fix: Extract key correctly
            const url = new URL(existingImageUrl);
            const key = decodeURIComponent(url.pathname.substring(1)); // remove starting '/'

            const deleteParams = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key,
            };

            await s3.send(new DeleteObjectCommand(deleteParams));
            updatedUrl = req.file.location;
        }

        // Update in DB
        await db.query('UPDATE images SET url = ?, description = ? WHERE id = ?', [
            updatedUrl,
            description,
            id,
        ]);

        res.json({ message: 'Updated successfully', url: updatedUrl, description });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ message: 'Update Error', error: err });
    }
});

// Delete image
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Get the image details from the database
        const [result] = await db.query('SELECT * FROM images WHERE id = ?', [id]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const imageUrl = result[0].url;
        const url = new URL(imageUrl); // parse the full URL
        const key = decodeURIComponent(url.pathname.substring(1)); // remove the leading '/'

        // Delete the image from S3
        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        };
        await s3.send(new DeleteObjectCommand(deleteParams));

        // Delete the image record from the database
        await db.query('DELETE FROM images WHERE id = ?', [id]);

        res.json({ message: 'Image deleted successfully' });
    } catch (err) {
        console.error("Delete Error", err);
        res.status(500).json({ message: 'Delete Server Error' });
    }
});

module.exports = router;
