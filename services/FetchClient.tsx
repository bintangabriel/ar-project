import { API_CONFIG } from "../config/Constant";
import { logout } from "../redux/UserSlice";
import { store } from "../redux/store";
export const fetchClient = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const defaultHeaders = {
    "Api-Key": API_CONFIG.API_KEY,
    "Content-Type": "application/json",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "X-XSS-Protection": "1; mode=block",
    "X-From-Admin": "false",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
  });

  const isJSON = response.headers
    .get("content-type")
    ?.includes("application/json");

  const responseBody = isJSON ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401 && responseBody.code === "PR11000000005"){
      console.error('token invalid')
      store.dispatch(logout())
      window.location.href = '/login'
    }
    const error = responseBody?.error || {};
    const message = error.message || "Something went wrong";
    const customError = new Error(message) as Error & { status?: number };
    customError.status = error.status || response.status;
    throw customError;
  }

  return responseBody;
};
