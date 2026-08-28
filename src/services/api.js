const API_URL = "http://192.168.15.27:8082";

// preenchido pelo AuthContext, para permitir renovar o token
// e persistir o resultado sem criar dependência circular de import
let authHandlers = {
  getRefreshToken: async () => null,
  onTokensRefreshed: async () => {},
  onRefreshFailed: async () => {},
};

export function registerAuthHandlers(handlers) {
  authHandlers = handlers;
}

export function updatePushToken(token, expoPushToken) {
  return request(
    "/api/users/me/push-token",
    {
      method: "PATCH",
      body: JSON.stringify({ expoPushToken }),
    },
    token,
  );
}

async function request(path, options = {}, token = null, isRetry = false) {
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !isRetry && token) {
    const refreshToken = await authHandlers.getRefreshToken();

    if (refreshToken) {
      try {
        const refreshed = await refreshTokenRequest(refreshToken);
        await authHandlers.onTokensRefreshed(refreshed);

        return request(path, options, refreshed.token, true);
      } catch (refreshError) {
        await authHandlers.onRefreshFailed();
        throw new Error("Sessão expirada. Faça login novamente.");
      }
    }
  }

  if (!response.ok) {
  const text = await response.text();
  let message = `Erro HTTP ${response.status}`;

  if (text) {
    try {
      const parsed = JSON.parse(text);
      message = parsed.message || parsed.error || text;
    } catch {
      message = text;
    }
  }

  throw new Error(message);
}

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function refreshTokenRequest(refreshToken) {
  return request("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function logoutRequest(refreshToken) {
  return request("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function getNearbyBusinesses(
  lat,
  lng,
  radiusMeters = 10000,
  token = null,
) {
  return request(
    `/api/businesses/nearby?lat=${lat}&lng=${lng}&radiusMeters=${radiusMeters}`,
    {},
    token,
  );
}

export function getAllBusinesses(token = null) {
  return request("/api/businesses", {}, token);
}

export function getBusinessesByCategory(category, token = null) {
  return request(
    `/api/businesses${category ? `?category=${category}` : ""}`,
    {},
    token,
  );
}

export function getBusinessById(businessId, token = null) {
  return request(`/api/businesses/${businessId}`, {}, token);
}

export function login(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

export function register(name, email, phone, password) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      phone,
      password,
    }),
  });
}

export function updateUserAddress(token, address) {
  return request(
    "/api/users/me/address",
    {
      method: "PATCH",
      body: JSON.stringify({
        address,
      }),
    },
    token,
  );
}

export function listMyAppointments(token) {
  return request("/api/appointments/me", {}, token);
}

export async function createAppointment(data, token) {
  return request(
    "/api/appointments",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token,
  );
}

export async function createReview(token, appointmentId, rating, comment, photoUri) {
  const formData = new FormData();

  formData.append("rating", String(rating));

  if (comment) {
    formData.append("comment", comment);
  }

  if (photoUri) {
    formData.append("photo", {
      uri: photoUri,
      name: "review.jpg",
      type: "image/jpeg",
    });
  }

  const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/review`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    let message = `Erro HTTP ${response.status}`;

    if (text) {
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || parsed.error || text;
      } catch {
        message = text;
      }
    }

    throw new Error(message);
  }

  return response.json();
}

export function getBusinessServices(businessId, token = null) {
  return request(`/api/businesses/${businessId}/services`, {}, token);
}

export function getBusinessEmployees(businessId, token = null) {
  return request(`/api/businesses/${businessId}/employees`, {}, token);
}

export function getBusinessWorkingHours(businessId, token = null) {
  return request(`/api/businesses/${businessId}/working-hours`, {}, token);
}

export function getAvailability(
  businessId,
  date,
  serviceId,
  employeeId,
  token = null,
) {
  const params = new URLSearchParams({
    date,
    serviceId,
  });

  if (employeeId) {
    params.append("employeeId", employeeId);
  }

  return request(
    `/api/businesses/${businessId}/availability?${params.toString()}`,
    {},
    token,
  );
}

export function getBusinessReviews(businessId, token = null) {
  return request(`/api/businesses/${businessId}/reviews`, {}, token);
}

export function getBusinessGiftCards(businessId, token = null) {
  return request(`/api/businesses/${businessId}/gift-cards`, {}, token);
}

export function reportBusiness(token, businessId, reason) {
  return request(
    `/api/businesses/${businessId}/report`,
    {
      method: "POST",
      body: JSON.stringify({
        reason,
      }),
    },
    token,
  );
}

export async function uploadBusinessLogo(businessId, imageUri, token) {
  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    name: "logo.jpg",
    type: "image/jpeg",
  });

  const response = await fetch(`${API_URL}/api/businesses/${businessId}/logo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    let message = `Erro HTTP ${response.status}`;

    if (text) {
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || parsed.error || text;
      } catch {
        message = text;
      }
    }

    throw new Error(message);
  }

  return response.text();
}

export async function uploadBusinessPhoto(businessId, imageUri, category, token) {
  const formData = new FormData();

  formData.append("file", {
    uri: imageUri,
    name: "photo.jpg",
    type: "image/jpeg",
  });

  const response = await fetch(
    `${API_URL}/api/businesses/${businessId}/photos?category=${category}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    let message = `Erro HTTP ${response.status}`;

    if (text) {
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || parsed.error || text;
      } catch {
        message = text;
      }
    }

    throw new Error(message);
  }

  return response.text();
}