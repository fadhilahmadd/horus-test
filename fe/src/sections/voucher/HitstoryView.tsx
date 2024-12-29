import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Snackbar,
    Alert,
} from '@mui/material';
import axios from 'axios';

import { DashboardContent } from 'src/layouts/dashboard';

type ClaimedVoucher = {
    id: number;
    tanggal_claim: string;
    nama: string;
    kategori: string;
    status: string;
};

type CategoryCount = {
    kategori: string;
    count: number;
};

export function HistoryView() {
    const [claimedVouchers, setClaimedVouchers] = useState<ClaimedVoucher[]>([]);
    const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
    const [snackbarMessage, setSnackbarMessage] = useState<string>('');
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [vouchersResponse, countsResponse] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/vouchers/claims`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/vouchers/claimed-counts`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                setClaimedVouchers(vouchersResponse.data);
                setCategoryCounts(countsResponse.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();
    }, []);

    const handleDeleteClaimedVoucher = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/vouchers/claims/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Remove the deleted voucher from the list
            setClaimedVouchers((prev) => prev.filter((v) => v.id !== id));

            // Update the category counts
            const updatedCounts = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/vouchers/claimed-counts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategoryCounts(updatedCounts.data);

            // Show success message
            setSnackbarMessage('Claimed voucher deleted successfully!');
            setOpenSnackbar(true);
        } catch (error) {
            console.error('Failed to delete claimed voucher:', error);
            setSnackbarMessage('Failed to delete claimed voucher. Please try again.');
            setOpenSnackbar(true);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    return (
        <DashboardContent>
            <Typography variant="h4" mb={3}>
                Voucher Claim History
            </Typography>

            <Box display="flex" gap={3}>
                <Box flex={1}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tanggal Claim</TableCell>
                                    <TableCell>Nama</TableCell>
                                    <TableCell>Kategori</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {claimedVouchers.map((voucher) => (
                                    <TableRow key={voucher.id}>
                                        <TableCell>{voucher.tanggal_claim}</TableCell>
                                        <TableCell>{voucher.nama}</TableCell>
                                        <TableCell>{voucher.kategori}</TableCell>
                                        <TableCell>{voucher.status}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={() => handleDeleteClaimedVoucher(voucher.id)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <Box width="20%">
                    <Typography variant="h6" mb={2}>
                        Claimed Vouchers
                    </Typography>
                    {categoryCounts.map((category) => (
                        <Box key={category.kategori} mb={1}>
                            <Typography>
                                {category.kategori}: {category.count}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Snackbar for showing messages */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarMessage.includes('Failed') ? 'error' : 'success'}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </DashboardContent>
    );
}