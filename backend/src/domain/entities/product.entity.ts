export class Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.price = props.price;
    this.stock = props.stock;
    this.imageUrl = props.imageUrl;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }
}
