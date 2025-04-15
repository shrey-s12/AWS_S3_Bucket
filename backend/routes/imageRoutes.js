const express = require('express');
const router = express.Router();
const upload = require('../upload');
const db = require('../db');
const multer = require('multer');
const uploadImageFromUrl = require('../utils/uploadImageFromUrl');
const deleteImageFromS3 = require('../utils/deleteImageFromS3');

// Upload image
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const { description, imageUrl } = req.body;

        let url = '';

        if (req.file) {
            url = req.file.location;
        } else if (imageUrl) {
            url = await uploadImageFromUrl(imageUrl);
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

// For uploading JSON file
const storage = multer.memoryStorage();
const jsonUpload = multer({ storage });

// Upload JSON file
router.post('/json-upload', jsonUpload.single('jsonFile'), async (req, res) => {
    try {
        const jsonBuffer = req.file.buffer;
        const links = JSON.parse(jsonBuffer.toString());

        if (!Array.isArray(links)) {
            return res.status(400).json({ message: "Invalid JSON format. Expecting an array of image URLs." });
        }

        const uploaded = [];

        for (const link of links) {
            try {
                const s3Url = await uploadImageFromUrl(link);
                const [result] = await db.query(
                    "INSERT INTO images (url, description) VALUES (?, ?)",
                    [s3Url, "Uploaded via JSON"]
                );

                uploaded.push({
                    id: result.insertId,
                    url: s3Url,
                    original: link
                });
            } catch (err) {
                console.error(`Error processing URL ${link}:`, err.message);
            }
        }

        res.json({
            message: `${uploaded.length} image(s) uploaded successfully`,
            uploaded
        });

    } catch (err) {
        console.error("JSON Upload Error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
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
    const { description, imageUrl } = req.body;

    try {
        const [result] = await db.query('SELECT * FROM images WHERE id = ?', [id]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const existingImageUrl = result[0].url;
        let updatedUrl = existingImageUrl;

        // Delete the old image from S3
        if (req.file || imageUrl) {
            await deleteImageFromS3(existingImageUrl);
        }

        if (req.file) {
            updatedUrl = req.file.location;
        } else if (imageUrl) {
            updatedUrl = await uploadImageFromUrl(imageUrl);
        }

        await db.query('UPDATE images SET url = ?, description = ? WHERE id = ?', [
            updatedUrl,
            description,
            id
        ]);

        res.json({
            message: 'Updated successfully',
            url: updatedUrl,
            description
        });
    } catch (err) {
        console.error("Update Error:", err);
        res.status(500).json({ message: 'Update Error', error: err });
    }
});

// Delete image
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('SELECT * FROM images WHERE id = ?', [id]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const imageUrl = result[0].url;
        await deleteImageFromS3(imageUrl);

        await db.query('DELETE FROM images WHERE id = ?', [id]);

        res.json({ message: 'Image deleted successfully' });
    } catch (err) {
        console.error("Delete Error", err);
        res.status(500).json({ message: 'Delete Server Error' });
    }
});

module.exports = router;
