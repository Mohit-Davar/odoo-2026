import cloudinary from 'cloudinary';
import { addDocument, deleteDocumentById, getDocumentById } from '../models/document.model.js';

// Cloudinary SDK automatically uses the CLOUDINARY_URL environment variable.
// We only need to force secure URLs.
cloudinary.v2.config({
  secure: true,
});

export const getCloudinarySignature = async (req, res) => {
    try {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.v2.utils.api_sign_request(
            {
                timestamp: timestamp,
            },
            cloudinary.v2.config().api_secret
        );
        res.json({ timestamp, signature });
    } catch (error) {
        console.error("Error generating Cloudinary signature:", error);
        res.status(500).json({ msg: "Server error" });
    }
};

export const addVehicleDocument = async (req, res) => {
    const { id: vehicle_id } = req.params;
    const { document_name, file_url, cloudinary_public_id } = req.body;

    if (!document_name || !file_url || !cloudinary_public_id) {
        return res.status(400).json({ msg: "Please provide all required fields." });
    }

    try {
        const newDocument = await addDocument({
            vehicle_id,
            document_name,
            file_url,
            cloudinary_public_id,
        });
        res.status(201).json(newDocument);
    } catch (error) {
        console.error("Error adding vehicle document:", error);
        res.status(500).json({ msg: "Server error while adding document." });
    }
};

export const deleteVehicleDocument = async (req, res) => {
    const { docId } = req.params;
    try {
        const document = await getDocumentById(docId);
        if (!document) {
            return res.status(404).json({ msg: "Document not found." });
        }

        // Delete from Cloudinary
        await cloudinary.v2.uploader.destroy(document.cloudinary_public_id);

        // Delete from database
        await deleteDocumentById(docId);

        res.json({ msg: "Document deleted successfully." });
    } catch (error) {
        console.error("Error deleting vehicle document:", error);
        res.status(500).json({ msg: "Server error while deleting document." });
    }
};
