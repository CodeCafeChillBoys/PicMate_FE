import React, { useState, useEffect } from 'react';
import { payoutService, formatPrice } from '../../services/apiClient';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Search, FileText } from 'lucide-react';

export default function AdminPayoutTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(''); // '' = all, 0 = pending, 1 = paid, 2 = rejected
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const [resolveForm, setResolveForm] = useState({ proofImageUrl: '', adminNote: '' });
  const [rejectForm, setRejectForm] = useState({ rejectReason: '', adminNote: '' });
  const [actionType, setActionType] = useState(null); // 'resolve' or 'reject'

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const statusParam = filter === '' ? undefined : Number(filter);
      const data = await payoutService.getAllRequests(statusParam);
      setRequests(data);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách rút tiền');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      if (actionType === 'resolve') {
        await payoutService.resolveRequest(selectedRequest.id, resolveForm);
        toast.success('Đã xác nhận thanh toán thành công!');
      } else {
        await payoutService.rejectRequest(selectedRequest.id, rejectForm);
        toast.success('Đã từ chối yêu cầu và hoàn tiền!');
      }
      setSelectedRequest(null);
      setActionType(null);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xử lý yêu cầu');
    }
  };

  const openResolveModal = (req) => {
    setSelectedRequest(req);
    setResolveForm({ proofImageUrl: '', adminNote: '' });
    setActionType('resolve');
  };

  const openRejectModal = (req) => {
    setSelectedRequest(req);
    setRejectForm({ rejectReason: '', adminNote: '' });
    setActionType('reject');
  };

  return (
    <div className="pg-admin-payout-tab">
      <div className="dashboard-content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Quản lý Rút tiền</h2>
          <p>Duyệt yêu cầu rút tiền của thợ</p>
        </div>
        <div>
          <select 
            className="input-field" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '8px' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="0">Chờ xử lý</option>
            <option value="1">Đã thanh toán</option>
            <option value="2">Đã từ chối</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</div>
      ) : (
        <table className="pg-table" style={{ width: '100%', marginTop: '1rem', background: 'var(--color-surface)', borderRadius: '12px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '1rem' }}>Ngày yêu cầu</th>
              <th style={{ padding: '1rem' }}>Thợ chụp</th>
              <th style={{ padding: '1rem' }}>Số tiền</th>
              <th style={{ padding: '1rem' }}>Ngân hàng</th>
              <th style={{ padding: '1rem' }}>Trạng thái</th>
              <th style={{ padding: '1rem' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem' }}>{new Date(req.createdAt).toLocaleDateString('vi-VN')}</td>
                <td style={{ padding: '1rem' }}>{req.grapherName}</td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{formatPrice(req.amount)}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.875rem' }}>
                    <div><strong>NH:</strong> {req.bankName}</div>
                    <div><strong>STK:</strong> {req.bankAccountNumber}</div>
                    <div><strong>Tên:</strong> {req.bankAccountName}</div>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  {req.status === 0 && <span style={{ color: '#eab308' }}>Chờ xử lý</span>}
                  {req.status === 1 && <span style={{ color: '#22c55e' }}>Đã thanh toán</span>}
                  {req.status === 2 && <span style={{ color: '#ef4444' }}>Đã từ chối</span>}
                </td>
                <td style={{ padding: '1rem' }}>
                  {req.status === 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => openResolveModal(req)}>
                        <CheckCircle size={14} /> Duyệt
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => openRejectModal(req)}>
                        <XCircle size={14} /> Từ chối
                      </button>
                    </div>
                  )}
                  {req.status === 1 && req.proofImageUrl && (
                    <a href={req.proofImageUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', fontSize: '0.875rem' }}>
                      Xem bill
                    </a>
                  )}
                  {req.status === 2 && req.rejectReason && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Lý do: {req.rejectReason}</span>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Không có dữ liệu</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {selectedRequest && actionType === 'resolve' && (
        <div className="lightbox" onClick={(e) => { if (e.target.className === 'lightbox') setSelectedRequest(null); }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Duyệt thanh toán</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setSelectedRequest(null)}><XCircle size={20} /></button>
            </div>
            <form onSubmit={handleActionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Xác nhận đã chuyển khoản <strong>{formatPrice(selectedRequest.amount)}</strong> cho thợ <strong>{selectedRequest.grapherName}</strong>.
              </p>
              <div className="input-group">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Link ảnh bill chuyển khoản (Bắt buộc)</label>
                <input 
                  type="url" 
                  className="input" 
                  value={resolveForm.proofImageUrl} 
                  onChange={e => setResolveForm({...resolveForm, proofImageUrl: e.target.value})} 
                  required 
                  placeholder="https://imgur.com/..."
                />
              </div>
              <div className="input-group">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Ghi chú (Tùy chọn)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={resolveForm.adminNote} 
                  onChange={e => setResolveForm({...resolveForm, adminNote: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setSelectedRequest(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Xác nhận chuyển khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRequest && actionType === 'reject' && (
        <div className="lightbox" onClick={(e) => { if (e.target.className === 'lightbox') setSelectedRequest(null); }}>
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Từ chối yêu cầu</h3>
              <button className="btn btn-icon btn-ghost" onClick={() => setSelectedRequest(null)}><XCircle size={20} /></button>
            </div>
            <form onSubmit={handleActionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                Từ chối yêu cầu rút <strong>{formatPrice(selectedRequest.amount)}</strong> của thợ <strong>{selectedRequest.grapherName}</strong>.<br/>
                Số dư sẽ được hoàn lại vào ví của thợ.
              </p>
              <div className="input-group">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Lý do từ chối (Bắt buộc)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={rejectForm.rejectReason} 
                  onChange={e => setRejectForm({...rejectForm, rejectReason: e.target.value})} 
                  required 
                  placeholder="Sai thông tin ngân hàng..."
                />
              </div>
              <div className="input-group">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Ghi chú nội bộ (Tùy chọn)</label>
                <input 
                  type="text" 
                  className="input" 
                  value={rejectForm.adminNote} 
                  onChange={e => setRejectForm({...rejectForm, adminNote: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setSelectedRequest(null)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--accent-coral)' }}>Từ chối & Hoàn tiền</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
