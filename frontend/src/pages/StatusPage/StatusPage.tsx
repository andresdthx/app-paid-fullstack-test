import { useParams } from 'react-router-dom';

function StatusPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="status-page">
      <h1>Transaction Status</h1>
      <p>Transaction: {id}</p>
    </div>
  );
}

export default StatusPage;
