const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  getAllVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  claimVoucher,
  getAllClaims,
  getAllCategories,
  getVouchersByKategori,
  getClaimedVoucherCounts,
  deleteClaimedVoucher,
} = require('../controllers/voucherController');

const router = express.Router();

// Voucher routes
router.get('/', protect, getAllVouchers);
router.get('/kategori', protect, getAllCategories);
router.get('/kategori/:kategori', protect, getVouchersByKategori);
router.post('/', protect, upload.single('foto'), createVoucher);
router.put('/:id', protect, upload.single('foto'), updateVoucher);
router.delete('/:id', protect, deleteVoucher);

// Voucher Claim routes
router.post('/claim/:id', protect, claimVoucher);
router.get('/claims', protect, getAllClaims);
// voucherRoutes.js
router.get('/claimed-counts', protect, getClaimedVoucherCounts);
router.delete('/claims/:id', protect, deleteClaimedVoucher);

module.exports = router;
