const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../s3');

async function deleteImageFromS3(imageUrl) {
    const url = new URL(imageUrl);
    const key = decodeURIComponent(url.pathname.substring(1));

    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
    });

    await s3.send(command);
}

module.exports = deleteImageFromS3;
