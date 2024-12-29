const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const path = require('path');

require('dotenv').config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5011;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
