import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { setProducts, setLoading, setError } from '../store/slices/products.slice';
import apiService from '../services/api.service';

export function useProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((s: RootState) => s.products);

  const fetchProducts = useCallback(async () => {
    dispatch(setLoading(true));
    try {
      const data = await apiService.getProducts();
      dispatch(setProducts(data));
    } catch {
      dispatch(setError('Failed to load products. Please try again.'));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products: items, loading, error, refetch: fetchProducts };
}
