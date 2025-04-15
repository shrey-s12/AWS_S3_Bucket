import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const MAIN_URL = import.meta.env.VITE_MAIN_API_URL;

const MigrateGalleryPage = () => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [migrating, setMigrating] = useState(false);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${MAIN_URL}/images/migrate-images-list`);
            setImages(res.data.images);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch images");
        } finally {
            setLoading(false);
        }
    };

    const handleMigrate = async () => {
        if (!images.length) return toast.error("No images to migrate");

        setMigrating(true);
        try {
            const res = await axios.get(`${MAIN_URL}/images/migrate-images`);
            toast.success(res.data.message || "Migration complete");
            fetchImages(); // refresh list with updated URLs
        } catch (err) {
            console.error(err);
            toast.error("Migration failed");
        } finally {
            setMigrating(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Image Migration Gallery</h2>

            <button
                onClick={handleMigrate}
                className="mb-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                disabled={migrating}
            >
                {migrating ? "Migrating Images..." : "Migrate All Images to S3"}
            </button>

            {loading ? (
                <p>Loading images...</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map(img => (
                        <div key={img.id} className="border p-2 rounded shadow-sm">
                            <img
                                src={img.image_url}
                                alt={`Image ${img.id}`}
                                className="w-full h-32 object-fill rounded"
                            />
                            <p className="text-xs mt-1 break-words">{img.image_url}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MigrateGalleryPage;
