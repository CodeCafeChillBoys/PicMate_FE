import React, { useState, useEffect } from 'react';
import { payoutService, formatPrice } from '../../services/apiClient';
import toast from 'react-hot-toast';
import { CreditCard, Edit, CheckCircle, Clock, XCircle, FileText, Send } from 'lucide-react';

export default function PhotographerWalletTab() {
  const [wallet, setWallet] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  const [bankForm, setBankForm] = useState({ bankName: '', accountNumber: '', accountName: '' });
  const [amount, setAmount] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, rRes] = await Promise.all([
        payoutService.getMyWallet(),
        payoutService.getMyRequests()
      ]);
      setWallet(wRes);
      setBankForm({
        bankName: wRes.bankName || '',
        accountNumber: wRes.bankAccountNumber || '',
        accountName: wRes.bankAccountName || ''
      });
      setRequests(rRes);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải dữ liệu ví');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateBank = async (e) => {
    e.preventDefault();
    try {
      await payoutService.updateMyBank(bankForm);
      toast.success('Cập nhật tài khoản ngân hàng thành công!');
      setShowBankModal(false);
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi cập nhật ngân hàng');
    }
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    try {
      await payoutService.requestPayout(Number(amount));
      toast.success('Gửi yêu cầu rút tiền thành công!');
      setShowRequestModal(false);
      setAmount('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi yêu cầu rút tiền');
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="pg-wallet-tab">
      <div className="dashboard-content-header">
        <div>
          <h2>Ví & Rút tiền</h2>
          <p>Quản lý số dư và các yêu cầu rút tiền</p>
        </div>
      </div>

      <div className="pg-wallet-cards" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div className="pg-wallet-card" style={{ flex: 1, padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Số dư hiện tại</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '1.5rem' }}>
            {formatPrice(wallet?.balance)}
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowRequestModal(true)}
            disabled={!wallet?.balance || wallet.balance < 100000 || !wallet.bankName}
          >
            <Send size={16} /> Rút tiền
          </button>
          {(!wallet?.bankName) && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-error)', marginTop: '0.5rem' }}>* Vui lòng cập nhật thông tin ngân hàng để rút tiền</p>
          )}
          {(wallet?.balance > 0 && wallet?.balance < 100000) && (
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>* Số dư tối thiểu để rút là 100,000đ</p>
          )}
        </div>

        <div className="pg-wallet-card" style={{ flex: 1, padding: '1.5rem', background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-text-secondary)' }}>Tài khoản nhận tiền</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowBankModal(true)}>
              <Edit size={16} />
            </button>
          </div>
          {wallet?.bankName ? (
            <div>
              <p><strong>Ngân hàng:</strong> {wallet.bankName}</p>
              <p><strong>Số tài khoản:</strong> {wallet.bankAccountNumber}</p>
              <p><strong>Chủ tài khoản:</strong> {wallet.bankAccountName}</p>
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-secondary)' }}>Chưa có thông tin</p>
          )}
        </div>
      </div>

      <div className="pg-wallet-history">
        <h3>Lịch sử rút tiền</h3>
        {requests.length === 0 ? (
          <p>Chưa có yêu cầu nào.</p>
        ) : (
          <table className="pg-table" style={{ width: '100%', marginTop: '1rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '0.75rem' }}>Ngày yêu cầu</th>
                <th style={{ padding: '0.75rem' }}>Số tiền</th>
                <th style={{ padding: '0.75rem' }}>Trạng thái</th>
                <th style={{ padding: '0.75rem' }}>Ngày xử lý</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem' }}>{new Date(req.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{formatPrice(req.amount)}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {req.status === 0 && <span style={{ color: '#eab308' }}><Clock size={14}/> Chờ xử lý</span>}
                    {req.status === 1 && <span style={{ color: '#22c55e' }}><CheckCircle size={14}/> Đã thanh toán</span>}
                    {req.status === 2 && <span style={{ color: '#ef4444' }}><XCircle size={14}/> Đã từ chối</span>}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {req.processedAt ? new Date(req.processedAt).toLocaleDateString('vi-VN') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showBankModal && (
        <div className="lightbox" onClick={(e) => { if (e.target.className === 'lightbox') setShowBankModal(false); }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Cập nhật thông tin ngân hàng</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowBankModal(false)}><XCircle size={20} /></button>
            </div>
            <form onSubmit={handleUpdateBank} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Tên Ngân hàng</label>
                <input type="text" className="input" value={bankForm.bankName} onChange={e => setBankForm({...bankForm, bankName: e.target.value})} required placeholder="VD: Vietcombank" />
              </div>
              <div className="input-group">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Số tài khoản</label>
                <input type="text" className="input" value={bankForm.accountNumber} onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} required />
              </div>
              <div className="input-group">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Tên chủ tài khoản</label>
                <input type="text" className="input" value={bankForm.accountName} onChange={e => setBankForm({...bankForm, accountName: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowBankModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu thông tin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="lightbox" onClick={(e) => { if (e.target.className === 'lightbox') setShowRequestModal(false); }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Yêu cầu rút tiền</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setShowRequestModal(false)}><XCircle size={20} /></button>
            </div>
            <form onSubmit={handleRequestPayout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Số tiền muốn rút (VNĐ)</label>
                <input 
                  type="number" 
                  className="input" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  min="100000" 
                  max={wallet?.balance} 
                  required 
                />
                <small style={{ color: 'var(--text-secondary)' }}>Tối đa: {formatPrice(wallet?.balance)}</small>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowRequestModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Gửi yêu cầu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
