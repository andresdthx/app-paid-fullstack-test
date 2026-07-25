import { CreateDeliveryUseCase } from '../../application/use-cases/create-delivery.use-case';
import { Transaction, TransactionStatus, Delivery } from '../../domain/entities';
import { isSuccess, isFailure } from '../../domain/value-objects';

describe('CreateDeliveryUseCase', () => {
  const mockDeliveryRepo = {
    create: jest.fn(),
    findByTransactionId: jest.fn(),
    findById: jest.fn(),
  };
  const mockTransactionRepo = {
    create: jest.fn(),
    findById: jest.fn(),
    findByReference: jest.fn(),
    updateStatus: jest.fn(),
  };

  let useCase: CreateDeliveryUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateDeliveryUseCase(mockDeliveryRepo as any, mockTransactionRepo as any);
  });

  const validInput = {
    transactionId: 'txn-1',
    customerId: 'c-1',
    productId: 'p-1',
    fullName: 'John Doe',
    streetAddress: 'Calle 123',
    city: 'Bogota',
    department: 'Cundinamarca',
    postalCode: '110111',
  };

  it('should fail with empty required field', async () => {
    const result = await useCase.execute({ ...validInput, fullName: '' });
    expect(isFailure(result)).toBe(true);
  });

  it('should fail with invalid postal code', async () => {
    const result = await useCase.execute({ ...validInput, postalCode: '123' });
    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error.message).toContain('Postal code');
    }
  });

  it('should fail when transaction not found', async () => {
    mockTransactionRepo.findById.mockResolvedValue(null);
    const result = await useCase.execute(validInput);
    expect(isFailure(result)).toBe(true);
  });

  it('should return existing delivery (idempotent)', async () => {
    const txn = new Transaction({ id: 'txn-1', reference: 'r', productId: 'p-1', quantity: 1, totalAmount: 100, baseFee: 0, deliveryFee: 0, status: TransactionStatus.APPROVED, customerEmail: 'e@e.com' });
    mockTransactionRepo.findById.mockResolvedValue(txn);
    const existing = new Delivery({ ...validInput, id: 'd-1' });
    mockDeliveryRepo.findByTransactionId.mockResolvedValue(existing);

    const result = await useCase.execute(validInput);
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.value.id).toBe('d-1');
    }
    expect(mockDeliveryRepo.create).not.toHaveBeenCalled();
  });

  it('should create delivery successfully', async () => {
    const txn = new Transaction({ id: 'txn-1', reference: 'r', productId: 'p-1', quantity: 1, totalAmount: 100, baseFee: 0, deliveryFee: 0, status: TransactionStatus.APPROVED, customerEmail: 'e@e.com' });
    mockTransactionRepo.findById.mockResolvedValue(txn);
    mockDeliveryRepo.findByTransactionId.mockResolvedValue(null);
    const created = new Delivery({ ...validInput, id: 'd-new' });
    mockDeliveryRepo.create.mockResolvedValue(created);

    const result = await useCase.execute(validInput);
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.value.id).toBe('d-new');
    }
  });
});
