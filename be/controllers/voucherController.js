const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Get all vouchers
exports.getAllVouchers = (req, res) => {
    const query = `
        SELECT v.*
        FROM Voucher v
        LEFT JOIN Voucher_Claim vc ON v.id = vc.id_voucher
        WHERE vc.id_voucher IS NULL
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};
// exports.getAllVouchers = (req, res) => {
//     const query = 'SELECT * FROM Voucher';
//     db.query(query, (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.status(200).json(results);
//     });
// };

// Get all kategori
exports.getAllCategories = (req, res) => {
    const query = 'SELECT DISTINCT kategori FROM Voucher';
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const categories = results.map(row => row.kategori);
        res.status(200).json(categories);
    });
};


// Get all vouchers by category
exports.getVouchersByKategori = (req, res) => {
    const { kategori } = req.params;
    const query = `
        SELECT v.*
        FROM Voucher v
        LEFT JOIN Voucher_Claim vc ON v.id = vc.id_voucher
        WHERE v.kategori = ? AND vc.id_voucher IS NULL
    `;
    db.query(query, [kategori], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(404).json({ message: `Tidak ada voucher ditemukan untuk kategori ${kategori}.` });
        }
        res.status(200).json(results);
    });
};
// exports.getVouchersByKategori = (req, res) => {
//     const { kategori } = req.params;

//     const query = 'SELECT * FROM Voucher WHERE kategori = ?';
//     db.query(query, [kategori], (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         if (results.length === 0) {
//             return res.status(404).json({ message: `Tidak ada voucher ditemukan untuk kategori ${kategori}.` });
//         }
//         res.status(200).json(results);
//     });
// };

// Create a new voucher
exports.createVoucher = (req, res) => {
    const { nama, kategori, status } = req.body;
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    const query = 'INSERT INTO Voucher (nama, foto, kategori, status) VALUES (?, ?, ?, ?)';
    db.query(query, [nama, foto, kategori, status], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Voucher created successfully.' });
    });
};

// Update a voucher
exports.updateVoucher = (req, res) => {
    const { id } = req.params;
    const { nama, kategori, status } = req.body;
    const foto = req.file ? `/uploads/${req.file.filename}` : null;

    const query = 'SELECT foto FROM Voucher WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Voucher not found.' });

        const oldFoto = results[0].foto;
        if (foto && oldFoto) {
            fs.unlinkSync(path.join(__dirname, '..', oldFoto));
        }

        const updateQuery = 'UPDATE Voucher SET nama = ?, foto = ?, kategori = ?, status = ? WHERE id = ?';
        db.query(updateQuery, [nama, foto, kategori, status, id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Voucher updated successfully.' });
        });
    });
};

// Delete a voucher
exports.deleteVoucher = (req, res) => {
    const { id } = req.params;

    const query = 'SELECT foto FROM Voucher WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Voucher not found.' });

        const oldFoto = results[0].foto;
        if (oldFoto) {
            fs.unlinkSync(path.join(__dirname, '..', oldFoto));
        }

        const deleteQuery = 'DELETE FROM Voucher WHERE id = ?';
        db.query(deleteQuery, [id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Voucher deleted successfully.' });
        });
    });
};

// Claim a voucher
exports.claimVoucher = (req, res) => {
    const { id } = req.params;

    const query = 'INSERT INTO Voucher_Claim (id_voucher) VALUES (?)';
    db.query(query, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Voucher claimed successfully.' });
    });
};

exports.getClaimedVoucherCounts = (req, res) => {
    const query = `
    SELECT v.kategori, COUNT(vc.id) AS count
    FROM Voucher_Claim vc
    JOIN Voucher v ON vc.id_voucher = v.id
    GROUP BY v.kategori
  `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

// Get all claims
exports.getAllClaims = (req, res) => {
    const query = `
    SELECT vc.id, DATE(vc.tanggal_claim) AS tanggal_claim, v.nama, v.kategori, v.status
    FROM Voucher_Claim vc
    JOIN Voucher v ON vc.id_voucher = v.id
  `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

// voucherController.js
exports.deleteClaimedVoucher = (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM Voucher_Claim WHERE id = ?';
    db.query(query, [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Claimed voucher deleted successfully.' });
    });
};
// exports.getAllClaims = (req, res) => {
//     const query = `
//     SELECT vc.id, vc.tanggal_claim, v.nama, v.kategori, v.status
//     FROM Voucher_Claim vc
//     JOIN Voucher v ON vc.id_voucher = v.id
//   `;
//     db.query(query, (err, results) => {
//         if (err) return res.status(500).json({ error: err.message });
//         res.status(200).json(results);
//     });
// };
