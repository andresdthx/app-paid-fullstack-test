export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  ERROR = 'ERROR',
}

export class Transaction {
  id: string;
  reference: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  baseFee: number;
  deliveryFee: number;
  status: TransactionStatus;
  customerEmail: string;
  gatewayTransactionId?: string;
  statusReason?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    reference: string;
    productId: string;
    quantity: number;
    totalAmount: number;
    baseFee: number;
    deliveryFee: number;
    status: TransactionStatus;
    customerEmail: string;
    gatewayTransactionId?: string;
    statusReason?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.reference = props.reference;
    this.productId = props.productId;
    this.quantity = props.quantity;
    this.totalAmount = props.totalAmount;
    this.baseFee = props.baseFee;
    this.deliveryFee = props.deliveryFee;
    this.status = props.status;
    this.customerEmail = props.customerEmail;
    this.gatewayTransactionId = props.gatewayTransactionId;
    this.statusReason = props.statusReason;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  isTerminal(): boolean {
    return [
      TransactionStatus.APPROVED,
      TransactionStatus.DECLINED,
      TransactionStatus.ERROR,
    ].includes(this.status);
  }
}
