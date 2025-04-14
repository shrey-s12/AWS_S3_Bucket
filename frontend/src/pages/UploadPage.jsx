import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MAIN_URL = import.meta.env.VITE_MAIN_API_URL;

const UploadPage = () => {
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState("");
    const [uploadType, setUploadType] = useState('file');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (uploadType === 'file' && !image) {
            toast.error("Please select an image file.");
            return;
        }

        if (uploadType === 'url' && !imageUrl.trim()) {
            toast.error("Please enter an image URL.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("description", description);

        if (uploadType === 'file') {
            formData.append("image", image);
        } else {
            formData.append("imageUrl", imageUrl);
        }

        try {
            const res = await axios.post(`${MAIN_URL}/images/upload`, formData);
            toast.success(res.data.message);
            navigate("/gallery");
        } catch (err) {
            console.error("Upload failed:", err);
            toast.error(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow transition-colors">
            <h2 className="text-2xl font-bold mb-4 text-center dark:text-white">Upload an Image</h2>

            <div className="flex justify-center mb-4">
                <button
                    onClick={() => setUploadType('file')}
                    className={`px-4 py-2 rounded-l ${uploadType === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700 dark:text-white'}`}
                >
                    Upload File
                </button>
                <button
                    onClick={() => setUploadType('url')}
                    className={`px-4 py-2 rounded-r ${uploadType === 'url' ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-700 dark:text-white'}`}
                >
                    Use URL
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {uploadType === 'file' ? (
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full border p-2 dark:bg-gray-900 dark:text-white"
                        required
                    />
                ) : (
                    <input
                        type="text"
                        placeholder="Paste image URL here"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="w-full border p-2 dark:bg-gray-900 dark:text-white"
                        required
                    />
                )}

                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border p-2 dark:bg-gray-900 dark:text-white"
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? "Uploading..." : "Upload"}
                </button>
            </form>

            {loading && (
                <div className="flex justify-center items-center h-20 mt-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
};

export default UploadPage;
