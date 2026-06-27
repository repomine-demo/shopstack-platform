import { useState, useEffect } from "react";
import { api } from "../services/apiClient";

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category_id: number;
  image_url: string;
  is_active: boolean;
}

interface ProductsResponse {
  products: Product[];
  count: number;
}

export function useProducts(query?: string, categoryId?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (categoryId) params.set("category_id", String(categoryId));

    api.get<ProductsResponse>(`/api/catalog/products?${params}`)
      .then(data => { setProducts(data.products || []); setError(null); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [query, categoryId]);

  return { products, loading, error };
}
