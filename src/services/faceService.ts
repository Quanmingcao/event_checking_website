import * as faceapi from 'face-api.js';

// Configuration
const MODEL_URL = '/models';

// Load models
export const loadModels = async () => {
    try {
        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL), // Heavy but accurate
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log('FaceAPI Models Loaded');
    } catch (error) {
        console.error('Failed to load FaceAPI models', error);
        throw error;
    }
};

// Detect single face and return descriptor
export const detectFace = async (input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) => {
    // Use SSD MobileNet V1 for better accuracy than TinyFaceDetector
    // We can switch to TinyFaceDetector if performance on mobile is bad,
    // but for "Registration" (one-time), accuracy is priority.

    const detection = await faceapi
        .detectSingleFace(input, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        return null;
    }

    return detection.descriptor; // Float32Array
};

// Helper: Resize image to max dimensions to save bandwidth & speed up AI
export const resizeImage = async (file: File, maxWidth = 800): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas to Blob failed'));
                }, file.type, 0.9);
            };
            img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// Helper: Match face (will be used in CheckIn later)
export const matchFace = (
    descriptor: Float32Array,
    labeledDescriptors: faceapi.LabeledFaceDescriptors[]
) => {
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
    return faceMatcher.findBestMatch(descriptor);
};
