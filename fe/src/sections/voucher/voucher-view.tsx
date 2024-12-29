import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
// import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';

import { fetchAllVouchers, createVoucher, fetchVouchersByCategory } from 'src/services/voucherService';
import { useNavigate } from 'react-router-dom';
import { DashboardContent } from 'src/layouts/dashboard';
import { VoucherItem } from './voucher-item';

type Voucher = {
    id: number;
    nama: string;
    foto: string;
    kategori: string;
    status: string;
};

const modalStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 1,
    maxWidth: 500,
    width: '100%',
};

export function VoucherView() {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [openModal, setOpenModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        nama: '',
        kategori: '',
        status: 'aktif',
        foto: null as File | null,
    });
    const navigate = useNavigate();
    const itemsPerPage = 9;

    useEffect(() => {
        const getVouchers = async () => {
            try {
                const data: Voucher[] = await fetchAllVouchers();
                setVouchers(data);
                const uniqueCategories = [...new Set(data.map((v) => v.kategori))];
                setCategories(uniqueCategories);
            } catch (error) {
                console.error('Failed to fetch vouchers:', error);
            }
        };

        getVouchers();
    }, []);

    const handleCategoryClick = async (category: string) => {
        setSelectedCategory(category);
        try {
            const data = await fetchVouchersByCategory(category);
            setVouchers(data);
        } catch (error) {
            console.error('Failed to fetch vouchers by category:', error);
        }
    };

    const handleClaimVoucher = (voucherId: number) => {
        setVouchers((prev) => prev.filter((v) => v.id !== voucherId));
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData((prev) => ({ ...prev, foto: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const formDataToSubmit = new FormData();
            formDataToSubmit.append('nama', formData.nama);
            formDataToSubmit.append('kategori', formData.kategori);
            formDataToSubmit.append('status', formData.status);
            if (formData.foto) {
                formDataToSubmit.append('foto', formData.foto);
            }

            await createVoucher(formDataToSubmit);
            setFormData({ nama: '', kategori: '', status: 'aktif', foto: null });
            handleCloseModal();

            // Refresh the vouchers list
            const updatedVouchers = await fetchAllVouchers();
            setVouchers(updatedVouchers);
        } catch (error) {
            console.error('Failed to create voucher:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDashboardClick = async () => {
        setSelectedCategory(null); // Reset selected category
        try {
            const data = await fetchAllVouchers();
            setVouchers(data);
        } catch (error) {
            console.error('Failed to fetch all vouchers:', error);
        }
    };
    const paginatedVouchers = vouchers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <DashboardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Voucher Management</Typography>
            </Box>
            <Button variant="contained" onClick={handleOpenModal} sx={{ mb: 3, alignSelf: 'flex-start' }}>
                Create Voucher
            </Button>
            {/* Main Content */}
            <Box display="flex" gap={3}>
                {/* Left Navigation Sidebar */}
                <Box width="20%" sx={{ borderRight: '1px solid #ddd', p: 2 }}>
                    
                    <Button
                        fullWidth
                        variant={selectedCategory === null ? 'contained' : 'outlined'}
                        onClick={handleDashboardClick}
                        sx={{ mb: 1 }}
                    >
                        Semua Voucher
                    </Button>
                    <Typography variant="h6" mb={2}>
                        Kategori
                    </Typography>
                    {categories.map((category) => (
                        <Button
                            key={category}
                            fullWidth
                            variant={selectedCategory === category ? 'contained' : 'outlined'}
                            onClick={() => handleCategoryClick(category)}
                            sx={{ mb: 1 }}
                        >
                            {category}
                        </Button>
                    ))}
                </Box>

                {/* Voucher List */}
                <Box flex={1}>
                    <Typography variant="h5" mb={3}>
                        {selectedCategory ? `Vouchers in ${selectedCategory}` : 'All Vouchers'}
                    </Typography>
                    <Grid container spacing={3}>
                        {paginatedVouchers.map((voucher) => (
                            <Grid key={voucher.id} xs={12} sm={6} md={4}>
                                <VoucherItem voucher={voucher} onClaim={handleClaimVoucher} />
                            </Grid>
                        ))}
                    </Grid>

                    {/* Pagination */}
                    <Box display="flex" justifyContent="center" sx={{ mt: 8 }}>
                        <Pagination
                            count={Math.ceil(vouchers.length / itemsPerPage)}
                            page={currentPage}
                            onChange={handlePageChange} // Use handlePageChange here
                            color="primary"
                        />
                    </Box>
                </Box>
            </Box>

            {/* Create Voucher Modal */}
            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={modalStyle}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Create Voucher</Typography>
                        <IconButton onClick={handleCloseModal}>
                            {/* <CloseIcon /> */}
                        </IconButton>
                    </Box>

                    <TextField
                        fullWidth
                        label="Nama"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Kategori"
                        name="kategori"
                        value={formData.kategori}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        select
                        label="Status"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="aktif">Aktif</MenuItem>
                        <MenuItem value="mati">Mati</MenuItem>
                    </TextField>
                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        Upload Foto
                        <input
                            hidden
                            type="file"
                            accept="image/*"
                            name="foto"
                            onChange={handleInputChange}
                        />
                    </Button>

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
                    </Button>
                </Box>
            </Modal>
        </DashboardContent>
    );
}
