import { useState } from 'react';
import { Box, Button, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

type VoucherItemProps = {
  voucher: {
    id: number;
    nama: string;
    foto: string;
    kategori: string;
    status: string;
  };
  onClaim: (voucherId: number) => void;
};

export function VoucherItem({ voucher, onClaim }: VoucherItemProps) {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const claimVoucher = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbarMessage('Token not found. Please log in.');
        setOpenSnackbar(true);
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/vouchers/claim/${voucher.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSnackbarMessage(response.data.message || 'Voucher claimed successfully!');
      setOpenSnackbar(true);
      onClaim(voucher.id); 
    } catch (error) {
      setSnackbarMessage('Failed to claim the voucher. Please try again later.');
      setOpenSnackbar(true);
    }
  };


  return (
    <Box
      sx={{
        border: '1px solid #ddd',
        borderRadius: 1,
        p: 2,
        transition: '0.3s',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <img
        crossOrigin="anonymous"
        src={`${import.meta.env.VITE_API_BASE_URL}${voucher.foto}`}
        alt={voucher.nama}
        style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: 8 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Box>
          <Typography variant="subtitle1">{voucher.nama}</Typography>
          <Typography variant="body2" color="text.secondary">
            Kategori: {voucher.kategori}
          </Typography>
          <Typography variant="body2" color={voucher.status === 'aktif' ? 'green' : 'red'}>
            Status: {voucher.status}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          color="primary"
          sx={{
            alignSelf: 'flex-start',
            ml: 2,
            py: 1.5,
            px: 3,
            fontSize: '1rem',
          }}
          onClick={claimVoucher}
        >
          Claim Voucher
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ zIndex: 1300 }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarMessage.includes('failed') ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
