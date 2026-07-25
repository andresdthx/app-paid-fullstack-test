import { GetProductsUseCase } from '../../application/use-cases/get-products.use-case';
import { Product } from '../../domain/entities';
import { isSuccess, isFailure } from '../../domain/value-objects';

describe('GetProductsUseCase', () => {
  const mockProductRepo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    decrementStock: jest.fn(),
  };

  let useCase: GetProductsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetProductsUseCase(mockProductRepo as any);
  });

  it('should return products on success', async () => {
    const products = [
      new Product({ id: '1', name: 'Test', description: 'Desc', price: 100, stock: 10, imageUrl: 'url' }),
    ];
    mockProductRepo.findAll.mockResolvedValue(products);

    const result = await useCase.execute();

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.value).toEqual(products);
    }
  });

  it('should return failure when repository throws', async () => {
    mockProductRepo.findAll.mockRejectedValue(new Error('DB error'));

    const result = await useCase.execute();

    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error.message).toContain('Failed to retrieve products');
    }
  });
});
