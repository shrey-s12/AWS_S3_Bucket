import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const MAIN_URL = import.meta.env.VITE_MAIN_API_URL;

const UploadJSONPage = () => {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return toast.error("Please select a JSON file");

        const formData = new FormData();
        formData.append("jsonFile", file);

        try {
            setIsLoading(true);
            const res = await axios.post(`${MAIN_URL}/images/json-upload`, formData);
            toast.success(res.data.message || "Images uploaded successfully!");
            navigate("/gallery");
        } catch (err) {
            console.error(err);
            toast.error("Upload failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow transition-colors">
            <h2 className="text-2xl font-bold mb-4 text-center dark:text-white">Upload JSON File</h2>

            <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0
                    file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100 mb-6"
            />

            <button
                onClick={handleUpload}
                disabled={isLoading}
                className={`w-full py-2 rounded text-white font-medium transition ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {isLoading ? "Uploading..." : "Upload"}
            </button>

            {isLoading && (
                <div className="mt-6 flex flex-col items-center gap-2">
                    <div className="h-6 w-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-600">Please wait, files are uploading...</p>
                </div>
            )}
        </div>
    );
};

export default UploadJSONPage;
