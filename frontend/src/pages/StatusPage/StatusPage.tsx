import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { resetCheckout } from '../../store/slices/checkout.slice';
import StatusDisplay from '../../components/StatusDisplay/StatusDisplay';
import apiService from '../../services/api.service';
import persistenceService from '../../services/persistence.service';

function StatusPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const checkout = useSelector((s: RootState) => s.checkout);
  const products = useSelector((s: RootState) => s.products.items);
  const [txnData, setTxnData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If we have transaction in redux, use it. Otherwise fetch from backend.
    if (checkout.transaction?.id === id) {
      setTxnData(checkout.transaction);
    } else if (id) {
      fetchTransaction(id);
    }
  }, [id]);

  const fetchTransaction = async (txnId: string) => {
    setLoading(true);
    try {
      const data = await apiService.getTransaction(txnId);
      setTxnData({
        id: data.id,
        reference: data.reference,
        status: data.status,
        totalAmount: Number(data.totalAmount),
        statusReason: data.statusReason,
        createdAt: data.createdAt,
      });
    } catch {
      // If fetch fails, show minimal info
      setTxnData({ id: txnId, reference: 'N/A', status: 'ERROR', statusReason: 'Could not load transaction' });
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = () => {
    dispatch(resetCheckout());
    persistenceService.clear();
    navigate('/');
  };

  if (loading) {
    return <div className="page-container"><p>Loading transaction...</p></div>;
  }

  if (!txnData) {
    return <div className="page-container"><p>Transaction not found</p></div>;
  }

  const product = products.find((p) => p.id === checkout.selectedProductId);

  return (
    <div className="page-container">
      <StatusDisplay
        status={txnData.status}
        transactionId={txnData.id}
        reference={txnData.reference}
        productName={product?.name}
        totalAmount={txnData.totalAmount}
        createdAt={txnData.createdAt}
        statusReason={txnData.statusReason}
        onReturn={handleReturn}
      />
    </div>
  );
}

export default StatusPage;
