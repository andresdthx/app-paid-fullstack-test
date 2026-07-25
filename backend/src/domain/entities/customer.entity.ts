export class Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  documentId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    documentId?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.phone = props.phone;
    this.documentId = props.documentId;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
