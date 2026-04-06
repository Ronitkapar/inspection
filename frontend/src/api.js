import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

export async function healthCheck() {
  const response = await api.get("/health");
  return response.data;
}

export async function signup(username, email, password) {
  const response = await api.post("/auth/signup", {
    username,
    email,
    password,
  });
  return response.data;
}

export async function login(email, password) {
  const response = await api.post("/auth/login", {
    email,
    password,
  });
  return response.data;
}

export default api;
