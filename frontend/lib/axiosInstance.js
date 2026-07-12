import axios from "axios"

const axiosInstance = axios.create({
    baseURL : process.env.NEXT_PUBLIC_API_URL,
    withCredentials : true,
})

let accessToken = null;

export const setAccessToken = (token)=>{
    accessToken = token;
}

// ✅ Define auth endpoints once to avoid duplication
const authEndpoints = [
    '/auth/login', 
    '/auth/register', 
    '/auth/verify-login',
    '/auth/verify-register',
    '/auth/resend-otp',
    '/auth/otp-cooldown'
];

const isAuthEndpoint = (url) => {
    return authEndpoints.some(endpoint => url?.includes(endpoint));
};

axiosInstance.interceptors.request.use(async(config)=>{
    // ✅ Skip token refresh for auth endpoints
    if (isAuthEndpoint(config.url)) {
        // For auth endpoints, just attach access token if it exists
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    }
    
    // ✅ For protected endpoints, attach access token
    if(accessToken){
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    return config;
});


axiosInstance.interceptors.response.use(
    (response) => response, 
    async (error) => {
        const original = error.config;
        
        // ✅ Don't retry refresh for auth endpoints
        if (isAuthEndpoint(original.url)) {
            return Promise.reject(error);
        }
        
        if(error.response?.status === 403 && !original._retry){
            original._retry = true;
            try{
                const res = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );
                const newToken = res.data.accessToken;
                setAccessToken(newToken);
                original.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(original);
            }catch(err){
                console.log("Refresh failed. Please log in again");
                setAccessToken(null); // ✅ Clear token on refresh failure
                if(typeof window !== "undefined") window.location.href = "/login";
            }
        }
        
        return Promise.reject(error);    
    }
)

export default axiosInstance;