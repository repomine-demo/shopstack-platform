import axios from "axios";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://auth-service:8001";

export interface TokenPayload {
  sub: string;
  tenant_id: string;
  email: string;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const response = await axios.post(`${AUTH_SERVICE_URL}/auth/verify`, null, {
      params: { token },
    });
    if (response.data.valid) {
      return {
        sub: response.data.user_id,
        tenant_id: response.data.tenant_id,
        email: response.data.email,
      };
    }
    return null;
  } catch {
    return null;
  }
}
