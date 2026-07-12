import express from 'express';
import { getCloudinarySignature, addVehicleDocument, deleteVehicleDocument } from '../controllers/document.controller.js';
import { verifyAccessToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = express.Router();

const allowedRoles = ['ADMIN', 'SAFETY_OFFICER'];

router.use(verifyAccessToken, requireRoles(allowedRoles));

router.get('/signature', getCloudinarySignature);
router.post('/vehicles/:id/documents', addVehicleDocument);
router.delete('/:docId', deleteVehicleDocument);

export default router;
