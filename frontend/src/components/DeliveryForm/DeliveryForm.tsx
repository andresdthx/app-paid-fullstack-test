import { useState } from 'react';
import { validatePostalCode, validateRequiredField } from '../../utils/delivery-validation';
import type { DeliveryFormData } from '../../store/slices/checkout.slice';
import './DeliveryForm.css';

interface DeliveryFormProps {
  onSubmit: (data: DeliveryFormData) => void;
  initialData?: DeliveryFormData | null;
}

function DeliveryForm({ onSubmit, initialData }: DeliveryFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [streetAddress, setStreetAddress] = useState(initialData?.streetAddress || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [department, setDepartment] = useState(initialData?.department || '');
  const [postalCode, setPostalCode] = useState(initialData?.postalCode || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateRequiredField(fullName, 100)) {
      newErrors.fullName = 'Full name is required (max 100 chars)';
    }
    if (!validateRequiredField(streetAddress, 200)) {
      newErrors.streetAddress = 'Street address is required (max 200 chars)';
    }
    if (!validateRequiredField(city, 100)) {
      newErrors.city = 'City is required';
    }
    if (!validateRequiredField(department, 100)) {
      newErrors.department = 'Department is required';
    }
    if (!validatePostalCode(postalCode)) {
      newErrors.postalCode = 'Postal code must be exactly 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ fullName: fullName.trim(), streetAddress: streetAddress.trim(), city: city.trim(), department: department.trim(), postalCode: postalCode.trim() });
    }
  };

  return (
    <div className="delivery-form">
      <h2>Delivery Information</h2>
      <form className="delivery-form__fields" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" type="text" maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
          {errors.fullName && <span className="error">{errors.fullName}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="streetAddress">Street Address</label>
          <input id="streetAddress" type="text" maxLength={200} value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="Calle 123 #45-67" />
          {errors.streetAddress && <span className="error">{errors.streetAddress}</span>}
        </div>

        <div className="delivery-form__row">
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input id="city" type="text" maxLength={100} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bogota" />
            {errors.city && <span className="error">{errors.city}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input id="department" type="text" maxLength={100} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Cundinamarca" />
            {errors.department && <span className="error">{errors.department}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="postalCode">Postal Code</label>
          <input id="postalCode" type="text" maxLength={6} value={postalCode} onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))} placeholder="110111" inputMode="numeric" />
          {errors.postalCode && <span className="error">{errors.postalCode}</span>}
        </div>

        <button type="submit" className="delivery-form__submit">Continue to Summary</button>
      </form>
    </div>
  );
}

export default DeliveryForm;
