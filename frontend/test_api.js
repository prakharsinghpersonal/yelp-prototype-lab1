import axios from 'axios';

async function test() {
  try {
    const api = axios.create({
      baseURL: 'http://localhost:8000',
    });
    
    const res = await api.get('/restaurants', { params: {} });
    console.log("Status:", res.status);
    console.log("Data type:", typeof res.data);
    console.log("Is Array:", Array.isArray(res.data));
    console.log("Data:", res.data.length ? res.data.slice(0, 2) : res.data);
  } catch (err) {
    console.error("Error:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
  }
}

test();
