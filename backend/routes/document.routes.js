import express from 'express';
import { getCloudinarySignature, addVehicleDocument, deleteVehicleDocument, getVehicleDocuments } from '../controllers/document.controller.js';
import { verifyAccessToken } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';

const router = express.Router();

const allowedRoles = ['ADMIN', 'SAFETY_OFFICER', 'FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'];

router.use(verifyAccessToken);

router.get('/signature', requireRoles(['ADMIN', 'SAFETY_OFFICER', 'FLEET_MANAGER']), getCloudinarySignature);
router.get('/vehicles/:id/documents', requireRoles(allowedRoles), getVehicleDocuments);
router.post('/vehicles/:id/documents', requireRoles(['ADMIN', 'SAFETY_OFFICER', 'FLEET_MANAGER']), addVehicleDocument);
router.delete('/:docId', requireRoles(['ADMIN', 'SAFETY_OFFICER', 'FLEET_MANAGER']), deleteVehicleDocument);

export default router;
