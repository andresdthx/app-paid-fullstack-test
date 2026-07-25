import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.use-case';
import { Customer } from '../../domain/entities';
import { isSuccess, isFailure } from '../../domain/value-objects';

describe('CreateCustomerUseCase', () => {
  const mockCustomerRepo = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  let useCase: CreateCustomerUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateCustomerUseCase(mockCustomerRepo as any);
  });

  it('should fail with missing name', async () => {
    const result = await useCase.execute({ name: '', email: 'a@b.com' });
    expect(isFailure(result)).toBe(true);
  });

  it('should fail with missing email', async () => {
    const result = await useCase.execute({ name: 'John', email: '' });
    expect(isFailure(result)).toBe(true);
  });

  it('should create new customer when not existing', async () => {
    mockCustomerRepo.findByEmail.mockResolvedValue(null);
    const created = new Customer({ id: 'c-1', name: 'John', email: 'j@test.com' });
    mockCustomerRepo.create.mockResolvedValue(created);

    const result = await useCase.execute({ name: 'John', email: 'j@test.com' });
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.value.id).toBe('c-1');
    }
  });

  it('should update existing customer by email (idempotent)', async () => {
    const existing = new Customer({ id: 'c-1', name: 'Old', email: 'j@test.com' });
    mockCustomerRepo.findByEmail.mockResolvedValue(existing);
    const updated = new Customer({ id: 'c-1', name: 'John', email: 'j@test.com', phone: '123' });
    mockCustomerRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute({ name: 'John', email: 'j@test.com', phone: '123' });
    expect(isSuccess(result)).toBe(true);
    expect(mockCustomerRepo.update).toHaveBeenCalledWith('c-1', { name: 'John', phone: '123', documentId: undefined });
  });
});
