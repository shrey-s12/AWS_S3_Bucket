import { Link } from 'react-router-dom';

const Layout = ({ children }) => {

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors">
            <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Image Uploader</h1>
                <nav className="space-x-4 flex items-center">
                    <Link to="/" className="text-blue-600 dark:text-blue-300 hover:underline">Home</Link>
                    <Link to="/upload" className="text-blue-600 dark:text-blue-300 hover:underline">Upload</Link>
                    <Link to="/gallery" className="text-blue-600 dark:text-blue-300 hover:underline">Gallery</Link>
                </nav>
            </header>
            <main className="p-6">{children}</main>
        </div>
    );
};

export default Layout;