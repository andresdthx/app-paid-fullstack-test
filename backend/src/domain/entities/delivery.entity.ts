export class Delivery {
  id: string;
  transactionId: string;
  customerId: string;
  productId: string;
  fullName: string;
  streetAddress: string;
  city: string;
  department: string;
  postalCode: string;
  createdAt: Date;

  constructor(props: {
    id: string;
    transactionId: string;
    customerId: string;
    productId: string;
    fullName: string;
    streetAddress: string;
    city: string;
    department: string;
    postalCode: string;
    createdAt?: Date;
  }) {
    this.id = props.id;
    this.transactionId = props.transactionId;
    this.customerId = props.customerId;
    this.productId = props.productId;
    this.fullName = props.fullName;
    this.streetAddress = props.streetAddress;
    this.city = props.city;
    this.department = props.department;
    this.postalCode = props.postalCode;
    this.createdAt = props.createdAt ?? new Date();
  }
}
