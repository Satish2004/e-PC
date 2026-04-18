import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('epc_user')) || null,
    token: localStorage.getItem('epc_token') || null,
    login: (userData) => {
        localStorage.setItem('epc_user', JSON.stringify(userData));
        localStorage.setItem('epc_token', userData.token);
        set({ user: userData, token: userData.token });
    },
    logout: () => {
        localStorage.removeItem('epc_user');
        localStorage.removeItem('epc_token');
        set({ user: null, token: null });
    }
}));

export default useAuthStore;
