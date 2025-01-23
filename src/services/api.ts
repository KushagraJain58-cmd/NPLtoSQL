import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // NestJS backend URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const checkHealth = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error('Health check failed:', error);
        throw error;
    }
};

export const uploadCSV = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

export const dropTable = async (tableName?: string) => {
    try {
        const response = await api.post('/drop', { tableName });
        return response.data;
    } catch (error) {
        console.error('Drop table error:', error);
        throw error;
    }
};

export const queryData = async (naturalLanguageQuery: string) => {
    try {
        const response = await api.post('/query', { naturalLanguageQuery });
        return response.data;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

