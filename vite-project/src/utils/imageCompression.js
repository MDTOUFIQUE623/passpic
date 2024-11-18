const compressImage = async (file, maxWidth = 2000, maxHeight = 2000, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to blob
                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error('Canvas to Blob conversion failed'));
                        return;
                    }
                    
                    // Create a new file from the blob
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    
                    resolve(compressedFile);
                }, 'image/jpeg', quality);
            };
            
            img.onerror = (error) => {
                reject(error);
            };
        };
        
        reader.onerror = (error) => {
            reject(error);
        };
    });
};

const needsCompression = (file) => {
    return new Promise((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(img.width > 2000 || img.height > 2000);
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(false);
        };
        
        img.src = objectUrl;
    });
};

export { compressImage, needsCompression }; 