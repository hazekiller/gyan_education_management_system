import { useState, useEffect } from 'react';

const AuthenticatedImage = ({ src, alt, className }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!src) return;

        const fetchImage = async () => {
            try {
                setLoading(true);
                setError(null);

                // Extract the path after 'uploads/'
                const filePath = src.replace(/^uploads\//, '');
                const token = localStorage.getItem('token');
                // VITE_API_URL already includes /api, so just append /files/
                const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const fileUrl = `${apiBase}/files/${filePath}`;

                const response = await fetch(fileUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to load image');
                }

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                setImageSrc(objectUrl);
            } catch (err) {
                console.error('Error loading image:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();

        // Cleanup function to revoke object URL
        return () => {
            if (imageSrc) {
                URL.revokeObjectURL(imageSrc);
            }
        };
    }, [src]);

    if (loading) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
                <p className="text-sm text-red-600">Failed to load image</p>
            </div>
        );
    }

    return <img src={imageSrc} alt={alt} className={className} />;
};

export default AuthenticatedImage;
