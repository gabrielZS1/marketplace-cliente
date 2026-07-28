const API_URL = "http://localhost:8082";

async function request(path, options = {}, token) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Algo deu errado. Tente novamente.");
  }

  return response.status === 204 ? null : response.json();
}

export function getNearbyBusinesses(lat, lng, radiusMeters = 10000) {
  return request(`/api/businesses/nearby?lat=${lat}&lng=${lng}&radiusMeters=${radiusMeters}`);
}

export function getAllBusinesses() {
  return request("/api/businesses");
}

export function getBusinessesByCategory(category) {
  return request(`/api/businesses${category ? `?category=${category}` : ""}`);
}

export function updateUserAddress(token, address) {
  return request("/api/users/me/address", {
    method: "PATCH",
    body: JSON.stringify({ address }),
  }, token);
}

export function login(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(name, email, phone, password) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, phone, password }),
  });
}

export function listMyAppointments(token) {
  return request("/api/appointments/me", {}, token);
}

export function getBusinessById(businessId) {
  return request(`/api/businesses/${businessId}`);
}

export function getBusinessReviews(businessId) {
  return request(`/api/businesses/${businessId}/reviews`);
}

export function createReview(token, appointmentId, rating, comment) {
  return request(`/api/appointments/${appointmentId}/review`, {
    method: "POST",
    body: JSON.stringify({ rating, comment }),
  }, token);
}

export function getBusinessServices(businessId) {
  return request(`/api/businesses/${businessId}/services`);
}

export function getBusinessEmployees(businessId) {
  return request(`/api/businesses/${businessId}/employees`);
}

export function getBusinessWorkingHours(businessId) {
  return request(`/api/businesses/${businessId}/working-hours`);
}

export function getAvailability(businessId, date, serviceId, employeeId) {
  const params = new URLSearchParams({ date, serviceId });
  if (employeeId) params.append("employeeId", employeeId);
  return request(`/api/businesses/${businessId}/availability?${params}`);
}