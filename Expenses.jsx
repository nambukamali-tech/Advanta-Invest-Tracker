import React, { useEffect, useState } from 'react';
import api from '../../api';
import { 
  Plus, 
  Upload, 
  Trash, 
  CheckCircle,
  Clock,
  XCircle,
  Edit2,
  X,
  FileDigit
} from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  
  const getLocalIsoString = (dateObj) => {
    const d = dateObj || new Date();
    const tzoffset = d.getTimezoneOffset() * 60000; 
    return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
  };

  const defaultForm = {
    supplierName: '',
    date: getLocalIsoString(),
    description: '',
    IsPaidByEmployee: true,
    criteria: 'Already Paid',
    attachmentUrl: '',
    materialItems: [
      { materialName: '', typeOfMaterial: 'General', quantity: 1, price: 0, gst: 0, cgst: 0, total: 0, isEditing: true }
    ]
  };

  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const resp = await api.get('/expense');
      const data = Array.isArray(resp.data) ? resp.data : resp.data?.expenses || [];
      setExpenses(data);
    } catch (err) { console.error(err); }
  };

  const calculateRowTotal = (item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const gst = parseFloat(item.gst) || 0;
    const cgst = parseFloat(item.cgst) || 0;
    const base = qty * price;
    const gstAmt = base * (gst / 100);
    const cgstAmt = base * (cgst / 100);
    return parseFloat((base + gstAmt + cgstAmt).toFixed(2));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.materialItems];
    newItems[index][field] = value;
    newItems[index].total = calculateRowTotal(newItems[index]);
    setFormData({ ...formData, materialItems: newItems });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      materialItems: [
        ...formData.materialItems,
        { materialName: '', typeOfMaterial: 'General', quantity: 1, price: 0, gst: 0, cgst: 0, total: 0, isEditing: true }
      ]
    });
  };

  const toggleEditItem = (index) => {
    const newItems = [...formData.materialItems];
    newItems[index].isEditing = !newItems[index].isEditing;
    setFormData({ ...formData, materialItems: newItems });
  };

  const removeItemRow = (index) => {
    const newItems = formData.materialItems.filter((_, i) => i !== index);
    setFormData({ ...formData, materialItems: newItems });
  };

 const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  setPreviewUrl(url);
  setPreviewType(file.type.includes('pdf') ? 'pdf' : 'image');

  const fd = new FormData();
  fd.append('file', file);

  setLoading(true);

  try {
    const resp = await api.post('/expense/upload', fd);

    const ocrData = resp.data?.ocrData || {};
    const attachmentUrl = resp.data?.attachmentUrl || '';

    const mappedItems = (ocrData.items || []).map(item => ({
      materialName: item.materialName || '',
      typeOfMaterial: item.typeOfMaterial || 'General',
      quantity: item.quantity || 1,
      price: item.price || 0,
      gst: item.gst || 0,
      cgst: item.cgst || 0,
      total: item.total || 0,
      isEditing: false
    }));

    // ✅ FIXED HERE
    setFormData(prev => {
      const dateStr = ocrData.invoiceDate
        ? getLocalIsoString(new Date(ocrData.invoiceDate))
        : prev.date;

      return {
        ...prev,
        supplierName: ocrData.supplierName || prev.supplierName,
        attachmentUrl: attachmentUrl,
        date: dateStr,
        materialItems: mappedItems.length > 0
          ? mappedItems
          : prev.materialItems
      };
    });

  } catch (err) {
    console.error(err);
    alert('Failed to process invoice. You can fill the form manually.');
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.materialItems.length === 0) {
      alert('Please add at least one material item');
      return;
    }

    try {
      const computedTotal = parseFloat(
        formData.materialItems.reduce((sum, item) => sum + calculateRowTotal(item), 0).toFixed(2)
      );

      const payload = {
        supplierName: formData.supplierName,
        date: formData.date,
        description: formData.description,
        IsPaidByEmployee: formData.IsPaidByEmployee,
        criteria: formData.criteria,
        attachmentUrl: formData.attachmentUrl,
        total: computedTotal,
        amount: computedTotal,
        category: 'Material',
        materialItems: formData.materialItems.map(item => ({
          materialName: item.materialName,
          typeOfMaterial: item.typeOfMaterial,
          quantity: parseFloat(item.quantity) || 0,
          price: parseFloat(item.price) || 0,
          gst: parseFloat(item.gst) || 0,
          cgst: parseFloat(item.cgst) || 0,
          total: parseFloat(calculateRowTotal(item).toFixed(2))
        }))
      };

      await api.post('/expense', payload);
      setIsModalOpen(false);
      resetForm();
      fetchExpenses();
    } catch (err) {
      console.error('Submit failed:', err.response?.data || err.message);
      alert(`Submission failed: ${err.response?.data?.title || err.message}`);
    }
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const grandTotal = formData.materialItems.reduce((sum, item) => sum + calculateRowTotal(item), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)' }}>My Expense Submissions</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and track your Advanta expense requests</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', fontWeight: '600' }}
        >
          <Plus size={20} /> New Expense Request
        </button>
      </div>

      {/* Expense Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
        {expenses.length === 0 && (
          <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>No expenses submitted yet.</p>
        )}
        {expenses.map(expense => (
          <div key={expense.id} className="glass" style={{ padding: '1.5rem', borderLeft: `4px solid ${expense.status === 'Approved' ? 'var(--secondary)' : expense.status === 'Rejected' ? 'var(--danger)' : '#eab308'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {expense.criteria || 'N/A'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: expense.status === 'Approved' ? 'var(--secondary)' : expense.status === 'Rejected' ? 'var(--danger)' : '#854d0e' }}>
                {expense.status === 'Approved' ? <CheckCircle size={14} /> : expense.status === 'Rejected' ? <XCircle size={14} /> : <Clock size={14} />}
                {expense.status || 'Pending'}
              </div>
            </div>

            <h3 style={{ marginBottom: '0.5rem' }}>{expense.supplierName || 'General Expense'}</h3>

            {/* Payment Method Badge */}
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '99px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: expense.isPaidByEmployee ? '#e0f2fe' : '#fef9c3',
                color: expense.isPaidByEmployee ? '#0369a1' : '#854d0e'
              }}>
                {expense.isPaidByEmployee ? '👤 Employee to Reimburse' : '🏢 Company to Pay'}
              </span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Items: {expense.materialItems?.length || 0} items included
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                </p>
                <p style={{ fontWeight: '700', fontSize: '1.5rem', color: 'var(--primary)' }}>
                  ₹{(expense.total || 0).toLocaleString()}
                </p>
              </div>
              {expense.adminRemarks && (
                <div style={{ background: '#f8fafc', padding: '0.5rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', maxWidth: '150px' }}>
                  <p style={{ fontWeight: '600', fontSize: '0.7rem', color: '#64748b' }}>Remark:</p>
                  <p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{expense.adminRemarks}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ padding: '2.5rem', width: '95%', maxWidth: '1100px', background: 'white', color: '#1a1a1a', maxHeight: '95vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ color: 'var(--primary)' }}>New Material Expense</h2>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Add multiple items and upload invoice for verification.</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} style={{ background: 'transparent', color: '#666' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: formData.criteria === 'Already Paid' ? '1fr 1fr' : '1fr', gap: '2rem', marginBottom: '2rem', transition: 'all 0.3s' }}>
                
                {/* Left Panel */}
                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  
                  {/* Criteria */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.85rem' }}>Payment Criteria *</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button type="button"
                        onClick={() => setFormData({...formData, criteria: 'Already Paid', IsPaidByEmployee: true, attachmentUrl: ''})}
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid', borderColor: formData.criteria === 'Already Paid' ? 'var(--primary)' : '#ddd', background: formData.criteria === 'Already Paid' ? '#eff6ff' : 'white', fontWeight: '600' }}>
                        Already Paid
                      </button>
                      <button type="button"
                        onClick={() => {
                            setFormData({...formData, criteria: 'Yet to Pay', IsPaidByEmployee: false, attachmentUrl: ''});
                            setPreviewUrl(null);
                        }}
                        style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid', borderColor: formData.criteria === 'Yet to Pay' ? 'var(--primary)' : '#ddd', background: formData.criteria === 'Yet to Pay' ? '#eff6ff' : 'white', fontWeight: '600' }}>
                        Yet to Pay
                      </button>
                    </div>
                  </div>

                  {/* Payment Responsibility Auto Badge */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: formData.IsPaidByEmployee ? '#e0f2fe' : '#fef9c3', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: formData.IsPaidByEmployee ? '#0369a1' : '#854d0e' }}>Payment Responsibility:</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: formData.IsPaidByEmployee ? '#0369a1' : '#854d0e' }}>
                        {formData.IsPaidByEmployee ? '👤 Employee to Reimburse' : '🏢 Company to Pay'}
                      </span>
                    </div>
                  </div>

                  {/* Supplier Name */}
                  <div className="input-group">
                    <label>Supplier Name *</label>
                    <input type="text" required value={formData.supplierName} onChange={e => setFormData({...formData, supplierName: e.target.value})} placeholder="e.g. Acme Materials" />
                  </div>

                  {/* Date */}
                  <div className="input-group">
                    <label>Submission Date *</label>
                    <input type="datetime-local" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>

                  {/* Conditional Invoice Upload */}
                  {formData.criteria === 'Already Paid' && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Invoice Upload</label>
                    <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '1rem', textAlign: 'center', background: 'white' }}>
                      <input type="file" id="invoice-upload" hidden onChange={handleFileUpload} accept="image/*,application/pdf" />
                      <label htmlFor="invoice-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <Upload size={24} color="var(--primary)" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                          {loading ? '⏳ Scanning Invoice...' : 'Click to upload Image or PDF'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Invoice fields will auto-fill</span>
                      </label>
                    </div>
                  </div>
                  )}
                </div>

                {/* Right Panel — Invoice Preview */}
                {formData.criteria === 'Already Paid' && (
                <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
                  <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '600', fontSize: '0.9rem', color: 'var(--primary)' }}>Invoice Preview</label>
                  <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '250px' }}>
                    {previewUrl ? (
                      previewType === 'pdf' ? (
                        <iframe src={previewUrl} style={{ width: '100%', height: '400px', border: 'none' }} title="Invoice Preview" />
                      ) : (
                        <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
                      )
                    ) : (
                      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                        <FileDigit size={48} style={{ marginBottom: '0.5rem', opacity: 0.3 }} />
                        <p style={{ fontSize: '0.8rem' }}>No invoice uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
                )}
              </div>

              {/* Material Items Table */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>Material Items</h3>
                  <button type="button" onClick={addItemRow} style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Plus size={16} /> Add Material
                  </button>
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead style={{ background: '#f8fafc' }}>
                      <tr>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', minWidth: '140px' }}>Material Name</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', minWidth: '120px' }}>Type</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', minWidth: '70px' }}>Qty</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', minWidth: '90px' }}>Price (₹)</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', minWidth: '70px' }}>GST%</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', minWidth: '70px' }}>CGST%</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #e2e8f0', minWidth: '110px', color: 'var(--primary)' }}>Row Total</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', borderBottom: '1px solid #e2e8f0', minWidth: '80px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.materialItems.map((item, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? 'white' : '#fafafa' }}>
                          <td style={{ padding: '0.4rem' }}>
                            {item.isEditing ? 
                              <input type="text" value={item.materialName} onChange={e => updateItem(index, 'materialName', e.target.value)} placeholder="e.g. Cement" style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.4rem 0.6rem', width: '100%', fontSize: '0.85rem' }} />
                              : <span style={{ padding: '0.4rem 0.6rem', display: 'block' }}>{item.materialName || '-'}</span>}
                          </td>
                          <td style={{ padding: '0.4rem' }}>
                            {item.isEditing ?
                              <input type="text" value={item.typeOfMaterial} onChange={e => updateItem(index, 'typeOfMaterial', e.target.value)} placeholder="Raw Material" style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.4rem 0.6rem', width: '100%', fontSize: '0.85rem' }} />
                              : <span style={{ padding: '0.4rem 0.6rem', display: 'block' }}>{item.typeOfMaterial || '-'}</span>}
                          </td>
                          <td style={{ padding: '0.4rem' }}>
                            {item.isEditing ?
                              <input type="number" min="0" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.4rem 0.6rem', width: '70px', fontSize: '0.85rem' }} />
                              : <span style={{ padding: '0.4rem 0.6rem', display: 'block' }}>{item.quantity}</span>}
                          </td>
                          <td style={{ padding: '0.4rem' }}>
                            {item.isEditing ?
                              <input type="number" min="0" value={item.price} onChange={e => updateItem(index, 'price', e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.4rem 0.6rem', width: '90px', fontSize: '0.85rem' }} />
                              : <span style={{ padding: '0.4rem 0.6rem', display: 'block' }}>₹{item.price}</span>}
                          </td>
                          <td style={{ padding: '0.4rem' }}>
                            {item.isEditing ?
                              <input type="number" min="0" max="100" value={item.gst} onChange={e => updateItem(index, 'gst', e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.4rem 0.6rem', width: '65px', fontSize: '0.85rem' }} />
                              : <span style={{ padding: '0.4rem 0.6rem', display: 'block' }}>{item.gst}%</span>}
                          </td>
                          <td style={{ padding: '0.4rem' }}>
                            {item.isEditing ?
                              <input type="number" min="0" max="100" value={item.cgst} onChange={e => updateItem(index, 'cgst', e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.4rem 0.6rem', width: '65px', fontSize: '0.85rem' }} />
                              : <span style={{ padding: '0.4rem 0.6rem', display: 'block' }}>{item.cgst}%</span>}
                          </td>
                          <td style={{ padding: '0.4rem', fontWeight: '700', color: 'var(--primary)', fontSize: '0.95rem' }}>
                            ₹{calculateRowTotal(item).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.4rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                              {item.isEditing ? (
                                <button type="button" title="Save" onClick={() => toggleEditItem(index)} style={{ color: '#10b981', padding: '0.3rem 0.5rem', background: '#d1fae5', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                                  <CheckCircle size={14} />
                                </button>
                              ) : (
                                <button type="button" title="Edit" onClick={() => toggleEditItem(index)} style={{ color: '#3b82f6', padding: '0.3rem 0.5rem', background: '#dbeafe', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                                  <Edit2 size={14} />
                                </button>
                              )}
                              <button type="button" title="Remove" onClick={() => removeItemRow(index)} style={{ color: '#ef4444', padding: '0.3rem 0.5rem', background: '#fef2f2', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                                <Trash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                        <td colSpan={6} style={{ padding: '0.75rem 1rem', fontWeight: '700', textAlign: 'right', color: '#64748b' }}>Grand Total:</td>
                        <td style={{ padding: '0.75rem 0.4rem', fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)' }}>₹{grandTotal.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Submit Bar */}
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>Grand Total Amount</p>
                  <h2 style={{ fontSize: '2.25rem', margin: 0  , color: 'white'}}>₹{grandTotal.toLocaleString()}</h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} style={{ background: 'white', color: 'var(--primary)', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: '700', border: 'none', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Processing...' : 'Submit Expense'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;