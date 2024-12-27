import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3002',
  timeout: 5000,
});

export const useApi = () => {
  const get = async (url) => {
    try {
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('API GET Hatası:', error);
      throw error;
    }
  };

  const post = async (url, data) => {
    try {
      const response = await axiosInstance.post(url, data);
      return response.data;
    } catch (error) {
      console.error('API POST Hatası:', error);
      throw error;
    }
  };

  const put = async (url, data) => {
    try {
      const response = await axiosInstance.put(url, data);
      return response.data;
    } catch (error) {
      console.error('API PUT Hatası:', error);
      throw error;
    }
  };

  const remove = async (url) => {
    try {
      const response = await axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      console.error('API DELETE Hatası:', error);
      throw error;
    }
  };

  return { get, post, put, remove };
};

export default defineNuxtPlugin(() => {
  return {
    provide: {
      api: useApi()
    }
  };
});