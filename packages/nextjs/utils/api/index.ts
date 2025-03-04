import axios, { AxiosRequestConfig } from "axios";

// Define types for the API responses
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

// Create an Axios instance with a base configuration
const api = axios.create({
  baseURL: "http://localhost:3001/api/compute",
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`API Error [${status}]:`, data?.message || "An error occurred");
      return Promise.reject(new Error(data?.message || "Request failed"));
    } else if (error.request) {
      console.error("No response received:", error.request);
      return Promise.reject(new Error("Network error or no response from server"));
    } else {
      console.error("Error setting up request:", error.message);
      return Promise.reject(new Error("Error setting up request"));
    }
  },
);

const Api = {
  get: async <T>(url: string, params: Record<string, any> = {}): Promise<ApiResponse<T>> => {
    try {
      const response = await api.get<T>(url, { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  post: async <T>(
    url: string,
    data: Record<string, any> = {},
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await api.post<T>(url, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  put: async <T>(
    url: string,
    data: Record<string, any> = {},
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await api.put<T>(url, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  delete: async <T>(url: string, config: AxiosRequestConfig = {}): Promise<ApiResponse<T>> => {
    try {
      const response = await api.delete<T>(url, config);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default Api;
