import productsReducer, { setLoading, setProducts, setError } from './products.slice';
import type { Product } from './products.slice';

describe('products slice', () => {
  const initialState = { items: [], loading: false, error: null };

  it('should return initial state', () => {
    expect(productsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setLoading', () => {
    const state = productsReducer(initialState, setLoading(true));
    expect(state.loading).toBe(true);
  });

  it('should handle setProducts', () => {
    const products: Product[] = [
      { id: '1', name: 'P1', description: 'D', price: 100, stock: 5, imageUrl: '' },
    ];
    const state = productsReducer({ ...initialState, loading: true }, setProducts(products));
    expect(state.items).toEqual(products);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle setError', () => {
    const state = productsReducer({ ...initialState, loading: true }, setError('Failed'));
    expect(state.error).toBe('Failed');
    expect(state.loading).toBe(false);
  });
});
