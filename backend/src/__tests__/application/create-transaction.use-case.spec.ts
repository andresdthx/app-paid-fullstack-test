import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { Product, TransactionStatus } from '../../domain/entities';
import { isSuccess, isFailure } from '../../domain/value-objects';

describe('CreateTransactionUseCase', () => {
  const mockProductRepo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    decrementStock: jest.fn(),
  };
  const mockTransactionRepo = {
    create: jest.fn(),
    findById: jest.fn(),
    findByReference: jest.fn(),
    updateStatus: jest.fn(),
  };
  const mockIntegrityService = {
    generateSignature: jest.fn(),
    validateSignature: jest.fn(),
  };

  let useCase: CreateTransactionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateTransactionUseCase(
      mockProductRepo as any,
      mockTransactionRepo as any,
      mockIntegrityService as any,
    );
  });

  const validInput = {
    productId: 'prod-1',
    quantity: 1,
    customerEmail: 'test@example.com',
    baseFee: 5000,
    deliveryFee: 10000,
  };

  it('should fail with invalid input (empty productId)', async () => {
    const result = await useCase.execute({ ...validInput, productId: '' });
    expect(isFailure(result)).toBe(true);
  });

  it('should fail with invalid input (quantity < 1)', async () => {
    const result = await useCase.execute({ ...validInput, quantity: 0 });
    expect(isFailure(result)).toBe(true);
  });

  it('should fail when product not found', async () => {
    mockProductRepo.findById.mockResolvedValue(null);
    const result = await useCase.execute(validInput);
    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error.message).toContain('Product not found');
    }
  });

  it('should fail when insufficient stock', async () => {
    const product = new Product({ id: 'prod-1', name: 'P', description: 'D', price: 100, stock: 0, imageUrl: '' });
    mockProductRepo.findById.mockResolvedValue(product);

    const result = await useCase.execute(validInput);
    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error.message).toContain('Insufficient stock');
    }
  });

  it('should create transaction successfully', async () => {
    const product = new Product({ id: 'prod-1', name: 'P', description: 'D', price: 50000, stock: 10, imageUrl: '' });
    mockProductRepo.findById.mockResolvedValue(product);
    mockTransactionRepo.findByReference.mockResolvedValue(null);
    mockTransactionRepo.create.mockResolvedValue({
      id: 'txn-1',
      reference: 'txn_abc123',
      totalAmount: 65000,
    });
    mockIntegrityService.generateSignature.mockReturnValue('sig_hash');

    const result = await useCase.execute(validInput);
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.value.transactionId).toBe('txn-1');
      expect(result.value.signature).toBe('sig_hash');
    }
  });

  it('should return existing transaction on duplicate reference', async () => {
    const product = new Product({ id: 'prod-1', name: 'P', description: 'D', price: 50000, stock: 10, imageUrl: '' });
    mockProductRepo.findById.mockResolvedValue(product);
    mockTransactionRepo.findByReference.mockResolvedValue({
      id: 'existing-txn',
      reference: 'txn_existing',
      totalAmount: 65000,
    });
    mockIntegrityService.generateSignature.mockReturnValue('existing_sig');

    const result = await useCase.execute(validInput);
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.value.transactionId).toBe('existing-txn');
    }
  });
});
