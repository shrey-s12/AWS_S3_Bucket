const axios = require('axios');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../s3');

async function uploadImageFromUrl(imageUrl) {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    const url = new URL(imageUrl);
    const key = decodeURIComponent(url.pathname.slice(1));

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: response.headers['content-type']
    });

    await s3.send(command);

    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

module.exports = uploadImageFromUrl;
