import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Shield, FileText, RefreshCw, HelpCircle, Mail, Phone } from 'lucide-react';
import './SupportPages.css';

/* ===== FAQ PAGE ===== */
export function FAQPage() {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            category: 'Đặt lịch & Thanh toán',
            questions: [
                {
                    q: 'Làm sao để đặt lịch chụp ảnh?',
                    a: 'Bạn chỉ cần tìm Phone Grapher yêu thích trên trang Khám phá, chọn gói dịch vụ phù hợp, chọn ngày giờ và thanh toán trực tuyến. Phone Grapher sẽ xác nhận lịch hẹn trong vòng 15 phút.'
                },
                {
                    q: 'PIC PLS hỗ trợ những phương thức thanh toán nào?',
                    a: 'Hiện tại PIC PLS hỗ trợ thanh toán qua VNPay (bao gồm thẻ ATM nội địa, Visa, MasterCard, JCB, QR Code). Chúng tôi đang mở rộng thêm MoMo và ZaloPay trong thời gian tới.'
                },
                {
                    q: 'Tôi có thể hủy lịch đã đặt không?',
                    a: 'Có. Bạn có thể hủy lịch miễn phí trước 24 giờ so với thời gian hẹn. Nếu hủy trong vòng 24 giờ, phí hủy sẽ là 30% giá trị đơn hàng. Chi tiết xem tại Chính sách hoàn tiền.'
                },
                {
                    q: 'Tiền thanh toán được bảo vệ như thế nào?',
                    a: 'PIC PLS sử dụng cơ chế Escrow – tiền của bạn được giữ an toàn bởi hệ thống cho đến khi buổi chụp hoàn thành và bạn xác nhận hài lòng. Nếu có tranh chấp, đội ngũ hỗ trợ sẽ can thiệp giải quyết.'
                },
            ]
        },
        {
            category: 'Tài khoản & Hồ sơ',
            questions: [
                {
                    q: 'Làm sao để trở thành Phone Grapher trên PIC PLS?',
                    a: 'Bấm nút "Trở thành Phone Grapher" trên trang chủ hoặc trang đăng ký. Điền thông tin cá nhân, upload portfolio (ít nhất 5 ảnh mẫu), thiết lập giá dịch vụ và chờ duyệt. Quá trình duyệt hồ sơ thường mất 1-3 ngày làm việc.'
                },
                {
                    q: 'Tôi quên mật khẩu, phải làm sao?',
                    a: 'Tại trang đăng nhập, bấm "Quên mật khẩu" và nhập email đã đăng ký. Hệ thống sẽ gửi link đặt lại mật khẩu về email của bạn trong vòng 5 phút.'
                },
                {
                    q: 'Làm sao để thay đổi thông tin cá nhân?',
                    a: 'Đăng nhập vào tài khoản, vào mục Dashboard → Hồ sơ. Tại đây bạn có thể cập nhật ảnh đại diện, tên hiển thị, số điện thoại, địa chỉ và các thông tin khác.'
                },
            ]
        },
        {
            category: 'Dịch vụ & Chất lượng',
            questions: [
                {
                    q: 'Buổi chụp thường kéo dài bao lâu?',
                    a: 'Thời gian tùy thuộc vào gói dịch vụ bạn chọn, thường từ 1-3 giờ. Thời gian cụ thể được ghi rõ trong mô tả từng gói dịch vụ của Phone Grapher.'
                },
                {
                    q: 'Tôi nhận ảnh sau bao lâu?',
                    a: 'Thông thường ảnh đã chỉnh sửa sẽ được gửi trong vòng 3-7 ngày sau buổi chụp, tùy thuộc vào gói dịch vụ và thỏa thuận với Phone Grapher. Một số Phone Grapher có dịch vụ giao ảnh nhanh trong 24h.'
                },
                {
                    q: 'Nếu tôi không hài lòng với kết quả thì sao?',
                    a: 'Bạn có quyền yêu cầu chỉnh sửa lại ảnh (số lần tùy gói dịch vụ). Nếu vẫn không hài lòng, bạn có thể liên hệ đội ngũ hỗ trợ PIC PLS để được giải quyết và có thể được hoàn tiền một phần hoặc toàn bộ.'
                },
                {
                    q: 'Tính năng "Chụp ngay" hoạt động như thế nào?',
                    a: 'Tính năng "Chụp ngay" giúp bạn tìm Phone Grapher đang Online và sẵn sàng nhận lịch chụp ngay lập tức. Bạn chọn Phone Grapher, thanh toán và hẹn gặp trong vòng 1-2 giờ.'
                },
            ]
        },
    ];

    const toggleFaq = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    let globalIdx = 0;

    return (
        <div className="support-page">
            <div className="support-header">
                <div className="container">
                    <HelpCircle size={48} className="support-icon" />
                    <h1>Câu hỏi thường gặp</h1>
                    <p>Tìm câu trả lời nhanh cho những thắc mắc phổ biến nhất</p>
                </div>
            </div>
            <div className="container support-content">
                {faqs.map((section) => (
                    <div key={section.category} className="faq-section">
                        <h2 className="faq-category">{section.category}</h2>
                        <div className="faq-list">
                            {section.questions.map((item) => {
                                const idx = globalIdx++;
                                return (
                                    <div key={idx} className={`faq-item ${openIndex === idx ? 'open' : ''}`} id={`faq-${idx}`}>
                                        <button className="faq-question" onClick={() => toggleFaq(idx)}>
                                            <span>{item.q}</span>
                                            {openIndex === idx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                        {openIndex === idx && (
                                            <div className="faq-answer">
                                                <p>{item.a}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <div className="support-contact-box">
                    <h3>Vẫn chưa tìm thấy câu trả lời?</h3>
                    <p>Liên hệ đội ngũ hỗ trợ PIC PLS để được giúp đỡ nhanh nhất.</p>
                    <div className="support-contact-links">
                        <a href="mailto:picpls202@gmail.com"><Mail size={16} /> picpls202@gmail.com</a>
                    </div>
                </div>
            </div>
        </div>
    );
}


/* ===== PRIVACY POLICY PAGE ===== */
export function PrivacyPolicyPage() {
    return (
        <div className="support-page">
            <div className="support-header">
                <div className="container">
                    <Shield size={48} className="support-icon" />
                    <h1>Chính sách bảo mật</h1>
                    <p>Cập nhật lần cuối: 01/07/2026</p>
                </div>
            </div>
            <div className="container support-content">
                <div className="policy-content">
                    <section className="policy-section">
                        <h2>1. Thu thập thông tin</h2>
                        <p>PIC PLS thu thập các thông tin sau khi bạn sử dụng dịch vụ:</p>
                        <ul>
                            <li><strong>Thông tin cá nhân:</strong> Họ tên, email, số điện thoại, ảnh đại diện khi bạn đăng ký tài khoản.</li>
                            <li><strong>Thông tin thanh toán:</strong> Thông tin giao dịch (không bao gồm số thẻ đầy đủ) thông qua cổng thanh toán VNPay.</li>
                            <li><strong>Thông tin sử dụng:</strong> Lịch sử đặt lịch, đánh giá, tương tác trên nền tảng.</li>
                            <li><strong>Thông tin thiết bị:</strong> Địa chỉ IP, loại trình duyệt, hệ điều hành để cải thiện trải nghiệm.</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>2. Sử dụng thông tin</h2>
                        <p>Chúng tôi sử dụng thông tin của bạn để:</p>
                        <ul>
                            <li>Cung cấp và duy trì dịch vụ đặt lịch chụp ảnh.</li>
                            <li>Xử lý thanh toán và giao dịch an toàn.</li>
                            <li>Gửi thông báo về lịch hẹn, cập nhật đơn hàng.</li>
                            <li>Cải thiện chất lượng dịch vụ và trải nghiệm người dùng.</li>
                            <li>Hỗ trợ khách hàng và giải quyết tranh chấp.</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>3. Chia sẻ thông tin</h2>
                        <p>PIC PLS <strong>không bán</strong> thông tin cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp:</p>
                        <ul>
                            <li>Với Phone Grapher mà bạn đặt lịch (tên, số điện thoại liên hệ).</li>
                            <li>Với đối tác thanh toán (VNPay) để xử lý giao dịch.</li>
                            <li>Khi có yêu cầu từ cơ quan pháp luật có thẩm quyền.</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>4. Bảo mật dữ liệu</h2>
                        <p>Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành:</p>
                        <ul>
                            <li>Mã hóa SSL/TLS cho toàn bộ kết nối.</li>
                            <li>Mã hóa mật khẩu người dùng (bcrypt).</li>
                            <li>Giám sát và phát hiện truy cập trái phép 24/7.</li>
                            <li>Sao lưu dữ liệu định kỳ.</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>5. Quyền của người dùng</h2>
                        <p>Bạn có quyền:</p>
                        <ul>
                            <li>Truy cập và xem lại thông tin cá nhân đã cung cấp.</li>
                            <li>Yêu cầu chỉnh sửa hoặc cập nhật thông tin.</li>
                            <li>Yêu cầu xóa tài khoản và dữ liệu liên quan.</li>
                            <li>Từ chối nhận email marketing (unsubscribe).</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>6. Liên hệ</h2>
                        <p>Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên hệ:</p>
                        <ul>
                            <li><strong>Email:</strong> picpls202@gmail.com</li>
                            <li><strong>Facebook:</strong> <a href="https://www.facebook.com/profile.php?id=61590515463360" target="_blank" rel="noopener noreferrer">PIC PLS Fanpage</a></li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}


/* ===== TERMS OF SERVICE PAGE ===== */
export function TermsPage() {
    return (
        <div className="support-page">
            <div className="support-header">
                <div className="container">
                    <FileText size={48} className="support-icon" />
                    <h1>Điều khoản sử dụng</h1>
                    <p>Cập nhật lần cuối: 01/07/2026</p>
                </div>
            </div>
            <div className="container support-content">
                <div className="policy-content">
                    <section className="policy-section">
                        <h2>1. Giới thiệu</h2>
                        <p>Chào mừng bạn đến với PIC PLS – nền tảng kết nối khách hàng với Phone Grapher (thợ chụp ảnh bằng điện thoại) hàng đầu Việt Nam. Bằng việc sử dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản dưới đây.</p>
                    </section>

                    <section className="policy-section">
                        <h2>2. Tài khoản người dùng</h2>
                        <ul>
                            <li>Bạn phải từ 16 tuổi trở lên để tạo tài khoản.</li>
                            <li>Thông tin đăng ký phải chính xác và đầy đủ.</li>
                            <li>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập của mình.</li>
                            <li>PIC PLS có quyền khóa tài khoản vi phạm điều khoản mà không cần thông báo trước.</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>3. Dịch vụ đặt lịch</h2>
                        <ul>
                            <li>PIC PLS đóng vai trò trung gian kết nối khách hàng và Phone Grapher.</li>
                            <li>Giá dịch vụ do Phone Grapher tự quy định và hiển thị công khai trên hồ sơ.</li>
                            <li>Sau khi thanh toán, đơn hàng được xác nhận và hai bên có trách nhiệm tuân thủ lịch hẹn.</li>
                            <li>PIC PLS giữ quyền thu phí dịch vụ (commission) từ mỗi giao dịch thành công.</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>4. Quy tắc ứng xử</h2>
                        <p>Người dùng PIC PLS cam kết:</p>
                        <ul>
                            <li>Không sử dụng ngôn ngữ thô tục, xúc phạm, phân biệt đối xử.</li>
                            <li>Không đăng tải nội dung vi phạm pháp luật hoặc đạo đức.</li>
                            <li>Không lợi dụng nền tảng để lừa đảo hoặc giao dịch ngoài hệ thống.</li>
                            <li>Tôn trọng thời gian và công sức của Phone Grapher.</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>5. Quyền sở hữu trí tuệ</h2>
                        <ul>
                            <li>Toàn bộ nội dung trên PIC PLS (logo, giao diện, mã nguồn) thuộc sở hữu của PIC PLS.</li>
                            <li>Ảnh trong portfolio thuộc quyền sở hữu của Phone Grapher tương ứng.</li>
                            <li>Ảnh từ buổi chụp thuộc quyền sở hữu theo thỏa thuận giữa khách hàng và Phone Grapher.</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>6. Giới hạn trách nhiệm</h2>
                        <p>PIC PLS nỗ lực cung cấp dịch vụ tốt nhất nhưng không đảm bảo:</p>
                        <ul>
                            <li>Dịch vụ hoạt động liên tục 100% không gián đoạn.</li>
                            <li>Chất lượng ảnh hoàn toàn phụ thuộc vào Phone Grapher.</li>
                            <li>PIC PLS không chịu trách nhiệm về thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ.</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>7. Luật áp dụng và Giải quyết tranh chấp</h2>
                        <p>Các điều khoản này được điều chỉnh bởi và giải thích theo pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam. Mọi tranh chấp phát sinh từ hoặc liên quan đến việc sử dụng dịch vụ của PIC PLS sẽ được giải quyết tại Tòa án nhân dân có thẩm quyền tại Việt Nam.</p>
                    </section>

                    <section className="policy-section">
                        <h2>8. Liên hệ</h2>
                        <p>Mọi thắc mắc về điều khoản sử dụng hoặc phản ánh dịch vụ, vui lòng liên hệ: <a href="mailto:picpls202@gmail.com">picpls202@gmail.com</a></p>
                    </section>
                </div>
            </div>
        </div>
    );
}


/* ===== REFUND POLICY PAGE ===== */
export function RefundPolicyPage() {
    return (
        <div className="support-page">
            <div className="support-header">
                <div className="container">
                    <RefreshCw size={48} className="support-icon" />
                    <h1>Chính sách hoàn tiền</h1>
                    <p>Cập nhật lần cuối: 01/07/2026</p>
                </div>
            </div>
            <div className="container support-content">
                <div className="policy-content">
                    <section className="policy-section">
                        <h2>1. Nguyên tắc chung</h2>
                        <p>PIC PLS cam kết bảo vệ quyền lợi của cả khách hàng và Phone Grapher. Chính sách hoàn tiền được áp dụng công bằng và minh bạch cho tất cả các bên.</p>
                    </section>

                    <section className="policy-section">
                        <h2>2. Các trường hợp được hoàn tiền 100%</h2>
                        <ul>
                            <li>Khách hàng hủy đơn hàng <strong>trước 24 giờ</strong> so với thời gian hẹn.</li>
                            <li>Phone Grapher hủy đơn hàng hoặc không đến đúng hẹn.</li>
                            <li>Lỗi hệ thống gây thanh toán sai hoặc thanh toán trùng.</li>
                            <li>Phone Grapher vi phạm nghiêm trọng quy tắc ứng xử.</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>3. Hoàn tiền một phần (70%)</h2>
                        <ul>
                            <li>Khách hàng hủy đơn trong khoảng <strong>12-24 giờ</strong> trước thời gian hẹn.</li>
                            <li>Dịch vụ hoàn thành nhưng chất lượng không đạt yêu cầu (cần có bằng chứng, đội ngũ PIC PLS sẽ xem xét).</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>4. Không hoàn tiền</h2>
                        <ul>
                            <li>Khách hàng hủy đơn <strong>dưới 12 giờ</strong> trước thời gian hẹn mà không có lý do chính đáng.</li>
                            <li>Khách hàng không đến đúng hẹn mà không thông báo trước (no-show).</li>
                            <li>Buổi chụp đã hoàn thành và khách hàng đã xác nhận "Hoàn thành".</li>
                            <li>Yêu cầu hoàn tiền sau 7 ngày kể từ ngày hoàn thành dịch vụ.</li>
                        </ul>
                    </section>

                    <section className="policy-section">
                        <h2>5. Quy trình hoàn tiền</h2>
                        <ol>
                            <li><strong>Bước 1:</strong> Gửi yêu cầu hoàn tiền qua email <a href="mailto:picpls202@gmail.com">picpls202@gmail.com</a> kèm mã đơn hàng và lý do.</li>
                            <li><strong>Bước 2:</strong> Đội ngũ PIC PLS xem xét trong vòng 2-3 ngày làm việc.</li>
                            <li><strong>Bước 3:</strong> Nếu được duyệt, tiền hoàn sẽ được chuyển về phương thức thanh toán ban đầu trong 5-7 ngày làm việc.</li>
                        </ol>
                    </section>

                    <section className="policy-section">
                        <h2>6. Giải quyết tranh chấp</h2>
                        <p>Trong trường hợp tranh chấp giữa khách hàng và Phone Grapher, PIC PLS sẽ đóng vai trò trung gian hòa giải. Quyết định cuối cùng của PIC PLS là quyết định có hiệu lực.</p>
                    </section>

                    <section className="policy-section">
                        <h2>7. Liên hệ hỗ trợ</h2>
                        <p>Để yêu cầu hoàn tiền hoặc hỗ trợ, vui lòng liên hệ:</p>
                        <ul>
                            <li><strong>Email:</strong> <a href="mailto:picpls202@gmail.com">picpls202@gmail.com</a></li>
                            <li><strong>Facebook:</strong> <a href="https://www.facebook.com/profile.php?id=61590515463360" target="_blank" rel="noopener noreferrer">PIC PLS Fanpage</a></li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
