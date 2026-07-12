import axios from "axios"

const axiosInstance = axios.create({
    baseURL : process.env.NEXT_PUBLIC_API_URL,
    withCredentials : true,
})

let accessToken = null;

// Track if a token refresh is currently in progress
let isRefreshing = false;
// Queue of requests waiting for the token refresh to complete
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export const setAccessToken = (token) => {
    accessToken = token;
}

export const getAccessToken = () => accessToken;

// ✅ Define auth endpoints once to avoid duplication
const authEndpoints = [
    '/auth/login', 
    '/auth/register', 
    '/auth/verify-login',
    '/auth/verify-register',
    '/auth/resend-otp',
    '/auth/otp-cooldown',
    '/auth/refresh',
    '/auth/logout'
];

const isAuthEndpoint = (url) => {
    return authEndpoints.some(endpoint => url?.includes(endpoint));
};

axiosInstance.interceptors.request.use(async(config)=>{
    // Attach access token to all requests if it exists
    if(accessToken){
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
});


axiosInstance.interceptors.response.use(
    (response) => response, 
    async (error) => {
        const original = error.config;
        
        // ✅ Don't retry refresh for auth endpoints (prevents infinite loop)
        if (isAuthEndpoint(original.url)) {
            return Promise.reject(error);
        }
        
        if((error.response?.status === 403 || error.response?.status === 401) && !original._retry){
            original._retry = true;
            
            // ✅ If a refresh is already in progress, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    original.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(original);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }
            
            isRefreshing = true;
            
            try{
                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                    { withCredentials: true }
                );
                const newToken = res.data.accessToken;
                setAccessToken(newToken);
                processQueue(null, newToken);
                original.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(original);
            }catch(err){
                processQueue(err, null);
                console.log("Refresh failed. Please log in again");
                setAccessToken(null);
                if(typeof window !== "undefined") window.location.href = "/login";
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);    
    }
)

export default axiosInstance;