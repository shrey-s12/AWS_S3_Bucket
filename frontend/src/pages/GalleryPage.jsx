import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const MAIN_URL = import.meta.env.VITE_MAIN_API_URL;

const GalleryPage = () => {
    const [images, setImages] = useState([]);
    const [editingImage, setEditingImage] = useState(null);
    const [editDescription, setEditDescription] = useState('');
    const [editFile, setEditFile] = useState(null);
    const [editImageUrl, setEditImageUrl] = useState('');
    const [editMode, setEditMode] = useState('file'); // 'file' or 'url'
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setLoading(true);
        axios.get(`${MAIN_URL}/images?page=${page}&limit=8`)
            .then(res => {
                setImages(res.data.images);
                setTotalPages(res.data.totalPages);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [page]);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this image?")) return;

        try {
            const res = await axios.delete(`${MAIN_URL}/images/delete/${id}`);
            setImages(images.filter(img => img.id !== id));
            toast.success(res.data.message);
        } catch (err) {
            console.error("Delete failed:", err);
            toast.error(err.response?.data?.message);
        }
    };

    const openEditModal = (id) => {
        const imageToEdit = images.find(img => img.id === id);
        setEditingImage(imageToEdit);
        setEditDescription(imageToEdit.description);
        setEditFile(null);
        setEditImageUrl('');
        setEditMode('file');
    };

    const handleUpdate = async () => {
        const formData = new FormData();
        formData.append('description', editDescription);
        if (editMode === 'file' && editFile) {
            formData.append('image', editFile);
        } else if (editMode === 'url' && editImageUrl) {
            formData.append('imageUrl', editImageUrl);
        }

        try {
            const res = await axios.put(`${MAIN_URL}/images/update/${editingImage.id}`, formData);
            toast.success(res.data.message);

            setImages(images.map(img =>
                img.id === editingImage.id ? {
                    ...img,
                    url: res.data.url,
                    description: res.data.description
                } : img
            ));
            setEditingImage(null);
        } catch (err) {
            console.error("Update failed:", err);
            toast.error(err.response?.data?.message);
        }
    };

    return (
        <div className="p-4">
            {/* Edit Modal */}
            <AnimatePresence>
                {editingImage && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            <h3 className="text-2xl font-semibold mb-4 text-center dark:text-white">Edit Image</h3>

                            <div className="flex justify-center mb-4">
                                <button
                                    onClick={() => setEditMode('file')}
                                    className={`px-4 py-2 rounded-l ${editMode === 'file' ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700 dark:text-white'}`}
                                >
                                    Upload File
                                </button>
                                <button
                                    onClick={() => setEditMode('url')}
                                    className={`px-4 py-2 rounded-r ${editMode === 'url' ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700 dark:text-white'}`}
                                >
                                    Upload via URL
                                </button>
                            </div>

                            {editMode === 'file' ? (
                                <input
                                    type="file"
                                    onChange={(e) => setEditFile(e.target.files[0])}
                                    className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-4"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={editImageUrl}
                                    onChange={(e) => setEditImageUrl(e.target.value)}
                                    placeholder="Enter image URL"
                                    className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-4"
                                />
                            )}

                            <input
                                type="text"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="w-full border p-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-4"
                                placeholder="Image description"
                            />

                            <div className="flex justify-between gap-4">
                                <button
                                    onClick={handleUpdate}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingImage(null)}
                                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 w-full"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <h2 className="text-3xl font-bold mb-6 text-center dark:text-white">Image Gallery</h2>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((img) => (
                            <motion.div
                                key={img.id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg p-4 transition-transform hover:scale-105"
                                whileHover={{ scale: 1.03 }}
                            >
                                <img src={img.url} alt="Uploaded" className="w-full h-48 object-contain rounded mb-2" />
                                <p className="text-center text-gray-700 dark:text-gray-300 mb-2">{img.description}</p>
                                <div>
                                    <button
                                        onClick={() => openEditModal(img.id)}
                                        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 w-full text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(img.id)}
                                        className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 w-full text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-lg font-medium dark:text-white">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default GalleryPage;
