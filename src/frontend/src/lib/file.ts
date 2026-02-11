/**
 * Reads a browser File object and converts it to a Uint8Array
 * suitable for creating an ExternalBlob for blob storage.
 */
export async function fileToUint8Array(file: File): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        // Create Uint8Array with explicit ArrayBuffer type
        const uint8Array = new Uint8Array(reader.result);
        resolve(uint8Array as Uint8Array<ArrayBuffer>);
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validates if a file is an image based on its MIME type
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}
