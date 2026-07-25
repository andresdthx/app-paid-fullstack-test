import { formatCOP } from '../../utils/amount-calculation';
import './ProductCard.css';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  onBuy: (productId: string) => void;
}

function ProductCard({ id, name, description, price, stock, imageUrl, onBuy }: ProductCardProps) {
  const isOutOfStock = stock === 0;

  return (
    <article className={`product-card ${isOutOfStock ? 'product-card--disabled' : ''}`}>
      <img
        src={imageUrl}
        alt={name}
        className="product-card__image"
        loading="lazy"
      />
      <div className="product-card__content">
        <h2 className="product-card__name">{name}</h2>
        <p className="product-card__description">{description}</p>
        <div className="product-card__footer">
          <span className="product-card__price">{formatCOP(price)}</span>
          <span className={`product-card__stock ${isOutOfStock ? 'product-card__stock--zero' : ''}`}>
            {isOutOfStock ? 'Sin stock' : `${stock} disponibles`}
          </span>
        </div>
        <button
          className="product-card__button"
          disabled={isOutOfStock}
          onClick={() => onBuy(id)}
          aria-label={`Pagar ${name} con tarjeta de credito`}
        >
          Pay with credit card
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
