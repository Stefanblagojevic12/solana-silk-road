export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Convert the file to base64 string for storage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error handling image:', error);
    throw new Error('Failed to handle image');
  }
}; 