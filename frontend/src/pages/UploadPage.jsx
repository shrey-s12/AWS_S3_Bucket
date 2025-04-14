import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MAIN_URL = import.meta.env.VITE_MAIN_API_URL;

const UploadPage = () => {
    const [image, setImage] = useState(null);
    const [description, setDescription] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!image) {
            console.log("No image selected");
            return;
        }

        const formData = new FormData();
        formData.append("image", image);
        formData.append("description", description);

        try {
            const res = await axios.post(`${MAIN_URL}/images/upload`, formData);
            toast.success(res.data.message);
            navigate("/gallery");
        } catch (err) {
            console.error("Upload failed:", err);
            toast.error(err.response?.data?.message);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow transition-colors">
            <h2 className="text-2xl font-bold mb-4">Upload an Image</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="file"
                    onChange={(e) => setImage(e.target.files[0])}
                    className="w-full border p-2 dark:bg-gray-900"
                    required
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border p-2 dark:bg-gray-900"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Upload
                </button>
            </form>
        </div>
    );
};

export default UploadPage;
