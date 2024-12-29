import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchAllVouchers = async () => {
    const response = await axios.get(`${BASE_URL}/vouchers`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
    });
    return response.data;
};

// Create voucher function
export const createVoucher = async (formData: FormData) => {
    try {
        const response = await axios.post(`${BASE_URL}/vouchers`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating voucher:', error);
        throw error;
    }
};

export const fetchVouchersByCategory = async (category: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/vouchers/kategori/${category}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching vouchers by category:', error);
        throw error;
    }
};
