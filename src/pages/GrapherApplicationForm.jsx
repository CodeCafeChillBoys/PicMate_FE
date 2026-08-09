import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import toast from 'react-hot-toast';
import { Upload, Plus, X, Camera, AlertCircle, CheckCircle, FileText, Loader2, ArrowRight } from 'lucide-react';
import './GrapherApplicationForm.css';

export default function GrapherApplicationForm() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [kycStatus, setKycStatus] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');
    const [district, setDistrict] = useState('');
    const [experienceYears, setExperienceYears] = useState(0);
    const [specialization, setSpecialization] = useState('Chụp ảnh sự kiện');
    const [cvFileUrl, setCvFileUrl] = useState('');
    const [portfolioUrls, setPortfolioUrls] = useState([]);
    const [externalLinks, setExternalLinks] = useState(['']);
    
    const [uploadingCv, setUploadingCv] = useState(false);
    const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

    useEffect(() => {
        // Fetch profile to check status
        const fetchProfile = async () => {
            try {
                const profile = await apiClient.getMyGrapherProfile();
                if (profile.kycStatus === 'Approved') {
                    navigate('/photographer-dashboard');
                } else {
                    setKycStatus(profile.kycStatus || 'NotSubmitted');
                    setRejectReason(profile.kycRejectReason || '');
                    
                    // Pre-fill if Rejected
                    if (profile.kycStatus === 'Rejected') {
                        setBio(profile.bio || '');
                        setLocation(profile.location || '');
                        setExperienceYears(profile.experienceYears || 0);
                        setSpecialization(profile.specialization || 'Chụp ảnh sự kiện');
                        setCvFileUrl(profile.cvFileUrl || '');
                        if (profile.portfolio) setPortfolioUrls(profile.portfolio);
                        if (profile.externalLinks && profile.externalLinks.length > 0) {
                            setExternalLinks(profile.externalLinks);
                        }
                    }
                }
            } catch (err) {
                // If 404, it means not created yet
                setKycStatus('NotSubmitted');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleCvUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File CV không được vượt quá 5MB');
            return;
        }

        setUploadingCv(true);
        try {
            const url = await apiClient.uploadImage(file);
            setCvFileUrl(url);
            toast.success('Tải CV lên thành công');
        } catch (error) {
            toast.error('Lỗi khi tải CV: ' + error.message);
        } finally {
            setUploadingCv(false);
        }
    };

    const handlePortfolioUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        if (portfolioUrls.length + files.length > 10) {
            toast.error('Bạn chỉ có thể tải lên tối đa 10 ảnh portfolio');
            return;
        }

        setUploadingPortfolio(true);
        try {
            const uploadPromises = files.map(file => apiClient.uploadImage(file));
            const urls = await Promise.all(uploadPromises);
            setPortfolioUrls(prev => [...prev, ...urls]);
            toast.success(`Đã tải lên ${urls.length} ảnh`);
        } catch (error) {
            toast.error('Có lỗi xảy ra khi tải ảnh: ' + error.message);
        } finally {
            setUploadingPortfolio(false);
        }
    };

    const removePortfolioImage = (indexToRemove) => {
        setPortfolioUrls(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleAddLink = () => {
        setExternalLinks(prev => [...prev, '']);
    };

    const handleRemoveLink = (index) => {
        setExternalLinks(prev => prev.filter((_, i) => i !== index));
    };

    const handleLinkChange = (index, value) => {
        const newLinks = [...externalLinks];
        newLinks[index] = value;
        setExternalLinks(newLinks);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // ── Client-side validation ──────────────────────────────────────────
        const cleanBio = bio.trim();
        const cleanLocation = location.trim();
        
        if (!cleanBio) {
            toast.error('Vui lòng giới thiệu bản thân (Bio)');
            return;
        }
        if (cleanBio.length < 10) {
            toast.error('Giới thiệu bản thân (Bio) phải có ít nhất 10 ký tự');
            return;
        }

        if (!cleanLocation) {
            toast.error('Vui lòng nhập khu vực hoạt động');
            return;
        }
        if (cleanLocation.length < 2) {
            toast.error('Khu vực hoạt động phải có ít nhất 2 ký tự');
            return;
        }

        if (!specialization) {
            toast.error('Vui lòng chọn chuyên môn chính');
            return;
        }

        if (portfolioUrls.length === 0) {
            toast.error('Vui lòng tải lên ít nhất 1 ảnh portfolio để Admin đánh giá năng lực');
            return;
        }

        // Validate external links formatting
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
        const validLinks = [];
        for (let link of externalLinks) {
            const cleanLink = link.trim();
            if (cleanLink) {
                if (!urlPattern.test(cleanLink)) {
                    toast.error(`Đường dẫn không hợp lệ: "${cleanLink}". Vui lòng nhập đúng định dạng https://...`);
                    return;
                }
                validLinks.push(cleanLink);
            }
        }
        
        setSubmitting(true);
        try {
            await apiClient.submitApplication({
                Bio: cleanBio,
                Location: cleanLocation,
                District: district.trim() || null,
                ExperienceYears: Number(experienceYears),
                Specialization: specialization,
                CvFileUrl: cvFileUrl || null,
                PortfolioImageUrls: portfolioUrls,
                ExternalLinks: validLinks
            });
            
            toast.success('Gửi đơn xét duyệt thành công!');
            setKycStatus('Pending');
            window.scrollTo(0, 0);
        } catch (error) {
            console.error("Lỗi gửi đơn xét duyệt (Submit Application Error):", error);
            if (error.response) {
                console.log("Status Code:", error.response.status);
                console.log("Response Headers:", error.response.headers);
                console.log("Response Body (Chi tiết lỗi từ Server):", error.response.data);
            }
            const serverMsg = error.response?.data?.Error || error.response?.data?.title || error.message || 'Lỗi gửi đơn. Vui lòng thử lại sau.';
            toast.error(`Gửi đơn thất bại: ${serverMsg}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="application-page loading-state">
                <Loader2 className="spin" size={40} />
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (kycStatus === 'Pending') {
        return (
            <div className="application-page container">
                <div className="pending-state-card fadeInUp">
                    <div className="icon-wrapper pending-icon">
                        <Camera size={48} />
                    </div>
                    <h2>Đơn xét duyệt đang được xử lý</h2>
                    <p>
                        Cảm ơn bạn đã đăng ký trở thành Phone-Grapher trên PicMate. 
                        Đội ngũ admin đang xem xét hồ sơ năng lực của bạn.
                    </p>
                    <p className="text-muted">
                        Quá trình này có thể mất từ 1-2 ngày làm việc. Chúng tôi sẽ thông báo cho bạn ngay khi có kết quả.
                    </p>
                    <button className="btn btn-outline" onClick={() => navigate('/photographer-dashboard')}>
                        Trở về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="application-page container">
            <div className="application-header fadeInUp">
                <h1>Hoàn thiện hồ sơ năng lực</h1>
                <p>Cung cấp thông tin chi tiết để chúng tôi hiểu rõ hơn về kỹ năng và kinh nghiệm của bạn.</p>
            </div>

            {kycStatus === 'Rejected' && (
                <div className="alert alert-danger fadeInUp">
                    <AlertCircle size={24} />
                    <div>
                        <h4>Hồ sơ của bạn chưa đạt yêu cầu</h4>
                        <p><strong>Lý do từ chối:</strong> {rejectReason || 'Không có ghi chú thêm.'}</p>
                        <p>Vui lòng cập nhật lại thông tin bên dưới và gửi lại đơn xét duyệt.</p>
                    </div>
                </div>
            )}

            <form className="application-form fadeInUp" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Thông tin cơ bản</h3>
                    
                    <div className="form-group">
                        <label>Giới thiệu bản thân (Bio) <span className="required">*</span></label>
                        <textarea 
                            className="input" 
                            rows="4" 
                            placeholder="Giới thiệu về phong cách chụp, kinh nghiệm, và điểm mạnh của bạn..."
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Khu vực hoạt động (Tỉnh/Thành) <span className="required">*</span></label>
                            <input 
                                type="text" 
                                className="input" 
                                placeholder="VD: TP. Hồ Chí Minh"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Quận/Huyện (Tuỳ chọn)</label>
                            <input 
                                type="text" 
                                className="input" 
                                placeholder="VD: Quận 1, Quận 3"
                                value={district}
                                onChange={e => setDistrict(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Số năm kinh nghiệm</label>
                            <select 
                                className="input" 
                                value={experienceYears}
                                onChange={e => setExperienceYears(e.target.value)}
                            >
                                <option value={0}>Dưới 1 năm</option>
                                <option value={1}>1 - 2 năm</option>
                                <option value={3}>3 - 5 năm</option>
                                <option value={5}>Trên 5 năm</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Chuyên môn chính</label>
                            <select 
                                className="input" 
                                value={specialization}
                                onChange={e => setSpecialization(e.target.value)}
                            >
                                <option value="Chụp ảnh sự kiện">Chụp ảnh sự kiện</option>
                                <option value="Chụp ảnh cưới">Chụp ảnh cưới</option>
                                <option value="Chụp sản phẩm">Chụp sản phẩm</option>
                                <option value="Chụp chân dung">Chụp chân dung</option>
                                <option value="Chụp kỷ yếu">Chụp kỷ yếu</option>
                                <option value="Chụp thời trang">Chụp thời trang</option>
                                <option value="Chụp phong cảnh">Chụp phong cảnh</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Hồ sơ năng lực (CV & Portfolio)</h3>
                    
                    <div className="form-group">
                        <label>Tải lên CV (PDF, tối đa 5MB)</label>
                        <div className="upload-zone">
                            <input 
                                type="file" 
                                id="cv-upload" 
                                accept=".pdf,image/*" 
                                onChange={handleCvUpload}
                                disabled={uploadingCv}
                                className="file-input-hidden"
                            />
                            <label htmlFor="cv-upload" className={`upload-label ${cvFileUrl ? 'has-file' : ''}`}>
                                {uploadingCv ? (
                                    <><Loader2 className="spin" size={24} /> Đang tải lên...</>
                                ) : cvFileUrl ? (
                                    <><FileText size={24} color="var(--primary)" /> Đã tải lên CV (Nhấn để thay đổi)</>
                                ) : (
                                    <><Upload size={24} /> Kéo thả hoặc nhấn để chọn file</>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Ảnh Portfolio (Tối đa 10 ảnh) <span className="text-muted">- {portfolioUrls.length}/10</span></label>
                        <div className="upload-zone">
                            <input 
                                type="file" 
                                id="portfolio-upload" 
                                accept="image/*" 
                                multiple 
                                onChange={handlePortfolioUpload}
                                disabled={uploadingPortfolio || portfolioUrls.length >= 10}
                                className="file-input-hidden"
                            />
                            <label htmlFor="portfolio-upload" className="upload-label">
                                {uploadingPortfolio ? (
                                    <><Loader2 className="spin" size={24} /> Đang tải lên...</>
                                ) : portfolioUrls.length >= 10 ? (
                                    <><CheckCircle size={24} color="var(--success-color)" /> Đã đạt giới hạn ảnh</>
                                ) : (
                                    <><Camera size={24} /> Nhấn để chọn nhiều ảnh</>
                                )}
                            </label>
                        </div>

                        {portfolioUrls.length > 0 && (
                            <div className="portfolio-grid">
                                {portfolioUrls.map((url, idx) => (
                                    <div key={idx} className="portfolio-item">
                                        <img src={url} alt={`Portfolio ${idx}`} />
                                        <button 
                                            type="button" 
                                            className="remove-btn"
                                            onClick={() => removePortfolioImage(idx)}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-section">
                    <h3>Liên kết bên ngoài (Tuỳ chọn)</h3>
                    <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                        Thêm link đến Facebook, Instagram, Behance, Website cá nhân...
                    </p>
                    
                    {externalLinks.map((link, idx) => (
                        <div key={idx} className="link-input-group">
                            <input 
                                type="url" 
                                className="input" 
                                placeholder="https://..." 
                                value={link}
                                onChange={(e) => handleLinkChange(idx, e.target.value)}
                            />
                            {externalLinks.length > 1 && (
                                <button type="button" className="btn btn-icon btn-ghost" onClick={() => handleRemoveLink(idx)}>
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                    
                    <button type="button" className="btn btn-ghost btn-sm" onClick={handleAddLink} style={{ marginTop: '0.5rem' }}>
                        <Plus size={16} /> Thêm liên kết
                    </button>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                        {submitting ? <><Loader2 className="spin" size={20} /> Đang xử lý...</> : <><CheckCircle size={20} /> Gửi đơn xét duyệt</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
