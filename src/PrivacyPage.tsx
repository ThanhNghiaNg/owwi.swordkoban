import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { gameBackground, portalFrames } from "./assets/gameAssets";
import "./privacy.css";

type Language = "vi" | "en";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.owwi.swordkoban";

const copy = {
  vi: {
    skip: "Chuyển đến chính sách quyền riêng tư",
    languageLabel: "Ngôn ngữ",
    home: "Trở lại trò chơi",
    kicker: "Quyền riêng tư tại Swordkoban",
    title: "Chính sách quyền riêng tư",
    intro:
      "Swordkoban được thiết kế để chơi mà không cần tài khoản, quảng cáo hay hồ sơ theo dõi người dùng.",
    effective: "Có hiệu lực từ ngày 27 tháng 8, 2026",
    summary: [
      ["Không cần tài khoản", "Bạn có thể chơi mà không đăng ký hoặc đăng nhập."],
      ["Không bán dữ liệu", "Swordkoban không bán hoặc cho thuê dữ liệu cá nhân."],
      ["Không có quảng cáo", "Phiên bản hiện tại không tích hợp mạng quảng cáo hoặc SDK phân tích."],
    ],
    contents: "Nội dung chính sách",
    nav: [
      ["scope", "Phạm vi"],
      ["data", "Dữ liệu"],
      ["providers", "Nhà cung cấp"],
      ["retention", "Lưu giữ & xóa"],
      ["children", "Trẻ em"],
      ["contact", "Liên hệ"],
    ],
    sections: {
      scope: {
        title: "1. Phạm vi và đơn vị phụ trách",
        body: (
          <>
            <p>
              Chính sách này áp dụng cho trò chơi <strong>Swordkoban</strong>, có định danh Android
              <code>com.owwi.swordkoban</code>, do <strong>OWWI</strong> phát hành.
            </p>
            <p>
              Chính sách mô tả cách phiên bản hiện tại của ứng dụng và trang web Swordkoban xử lý
              thông tin khi bạn sử dụng trò chơi.
            </p>
          </>
        ),
      },
      data: {
        title: "2. Dữ liệu Swordkoban truy cập hoặc thu thập",
        body: (
          <>
            <p>
              Swordkoban không yêu cầu tài khoản và không trực tiếp thu thập tên, email, số điện
              thoại, vị trí, danh bạ, ảnh, tệp, thông tin thanh toán, mã nhận dạng quảng cáo hoặc dữ
              liệu sức khỏe của bạn.
            </p>
            <p>
              Trò chơi chỉ yêu cầu quyền Internet để tải giao diện và tài nguyên trò chơi. Tiến độ
              màn chơi, số bước, cấu hình bản đồ và gợi ý được xử lý trong phiên chơi hiện tại; source
              hiện tại không gửi các dữ liệu chơi này tới cơ sở dữ liệu của OWWI.
            </p>
          </>
        ),
      },
      providers: {
        title: "3. Hạ tầng kỹ thuật và bên thứ ba",
        body: (
          <>
            <p>
              Giao diện sản phẩm được phân phối qua hạ tầng lưu trữ của Vercel. Khi thiết bị kết nối
              tới dịch vụ này, nhà cung cấp hạ tầng có thể xử lý thông tin kỹ thuật cơ bản như địa chỉ
              IP, loại trình duyệt hoặc WebView, thời điểm yêu cầu và dữ liệu chẩn đoán nhằm phân phối
              nội dung, bảo mật và duy trì độ tin cậy của dịch vụ.
            </p>
            <p>
              Google Play cũng xử lý thông tin liên quan đến việc phân phối, cài đặt và cập nhật ứng
              dụng theo chính sách riêng của Google. Swordkoban không chia sẻ dữ liệu cá nhân với nhà
              quảng cáo hoặc nhà môi giới dữ liệu.
            </p>
            <ul>
              <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Chính sách quyền riêng tư của Vercel</a></li>
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Chính sách quyền riêng tư của Google</a></li>
            </ul>
          </>
        ),
      },
      security: {
        title: "4. Mục đích sử dụng, chia sẻ và bảo mật",
        body: (
          <>
            <p>
              Thông tin kỹ thuật do hạ tầng xử lý chỉ được dùng để cung cấp nội dung, phòng chống lạm
              dụng, khắc phục lỗi và vận hành dịch vụ. OWWI không dùng thông tin này để quảng cáo cá
              nhân hóa hoặc lập hồ sơ hành vi.
            </p>
            <p>
              Kết nối tới trang sản phẩm sử dụng HTTPS. Chúng tôi giới hạn việc xử lý dữ liệu ở mức
              cần thiết cho hoạt động của trò chơi và lựa chọn nhà cung cấp hạ tầng có biện pháp bảo
              vệ dữ liệu phù hợp.
            </p>
          </>
        ),
      },
      retention: {
        title: "5. Lưu giữ và xóa dữ liệu",
        body: (
          <>
            <p>
              OWWI không vận hành cơ sở dữ liệu tài khoản hoặc hồ sơ người chơi cho phiên bản hiện
              tại, vì vậy không có dữ liệu tài khoản do OWWI lưu giữ để yêu cầu xóa.
            </p>
            <p>
              Nhật ký kỹ thuật tạm thời, nếu được tạo bởi nhà cung cấp hạ tầng, được lưu giữ và xóa
              theo lịch vận hành và chính sách của nhà cung cấp đó. Bạn có thể gửi yêu cầu về quyền
              riêng tư qua kênh liên hệ ở cuối chính sách này.
            </p>
          </>
        ),
      },
      children: {
        title: "6. Quyền riêng tư của trẻ em",
        body: (
          <p>
            Swordkoban không chủ ý thu thập dữ liệu cá nhân của trẻ em. Vì ứng dụng không yêu cầu tài
            khoản, không có quảng cáo và không có tính năng gửi nội dung cá nhân, chúng tôi giảm thiểu
            dữ liệu cho mọi người chơi, bao gồm cả người chơi nhỏ tuổi.
          </p>
        ),
      },
      changes: {
        title: "7. Thay đổi chính sách",
        body: (
          <p>
            Nếu tính năng hoặc cách xử lý dữ liệu thay đổi, chúng tôi sẽ cập nhật trang này và ngày có
            hiệu lực trước khi áp dụng thay đổi quan trọng. Phiên bản mới nhất luôn được đăng tại địa
            chỉ URL này.
          </p>
        ),
      },
      contact: {
        title: "8. Liên hệ về quyền riêng tư",
        body: (
          <>
            <p>
              Để gửi câu hỏi hoặc yêu cầu về quyền riêng tư, hãy sử dụng địa chỉ email công khai tại
              mục <strong>Hỗ trợ ứng dụng</strong> trên trang Google Play của Swordkoban.
            </p>
            <a className="privacy-contact" href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
              Mở trang hỗ trợ trên Google Play
              <span aria-hidden="true">→</span>
            </a>
          </>
        ),
      },
    },
    footer: "© 2026 OWWI · Swordkoban",
  },
  en: {
    skip: "Skip to privacy policy",
    languageLabel: "Language",
    home: "Back to the game",
    kicker: "Privacy at Swordkoban",
    title: "Privacy Policy",
    intro:
      "Swordkoban is designed to work without accounts, advertising, or user tracking profiles.",
    effective: "Effective August 27, 2026",
    summary: [
      ["No account required", "Play without registering or signing in."],
      ["No data sales", "Swordkoban does not sell or rent personal data."],
      ["No advertising", "The current version includes no ad network or analytics SDK."],
    ],
    contents: "Policy contents",
    nav: [
      ["scope", "Scope"],
      ["data", "Data"],
      ["providers", "Providers"],
      ["retention", "Retention & deletion"],
      ["children", "Children"],
      ["contact", "Contact"],
    ],
    sections: {
      scope: {
        title: "1. Scope and responsible developer",
        body: (
          <>
            <p>
              This policy applies to <strong>Swordkoban</strong>, Android application identifier
              <code>com.owwi.swordkoban</code>, published by <strong>OWWI</strong>.
            </p>
            <p>
              It explains how the current version of the Swordkoban application and website handle
              information when you use the game.
            </p>
          </>
        ),
      },
      data: {
        title: "2. Data accessed or collected by Swordkoban",
        body: (
          <>
            <p>
              Swordkoban does not require an account and does not directly collect your name, email,
              phone number, location, contacts, photos, files, payment information, advertising ID,
              or health information.
            </p>
            <p>
              The game requests Internet access only to load its interface and game resources. Level
              progress, move counts, map settings, and hints are processed during the current play
              session; the current source does not send this gameplay data to an OWWI database.
            </p>
          </>
        ),
      },
      providers: {
        title: "3. Technical infrastructure and third parties",
        body: (
          <>
            <p>
              The product interface is delivered through Vercel hosting infrastructure. When a device
              connects, the infrastructure provider may process basic technical information such as
              IP address, browser or WebView type, request time, and diagnostic data to deliver
              content, protect the service, and maintain reliability.
            </p>
            <p>
              Google Play also processes information related to distributing, installing, and
              updating the application under Google's own policies. Swordkoban does not share
              personal data with advertisers or data brokers.
            </p>
            <ul>
              <li><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Vercel Privacy Policy</a></li>
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Privacy Policy</a></li>
            </ul>
          </>
        ),
      },
      security: {
        title: "4. Use, sharing, and security",
        body: (
          <>
            <p>
              Technical information handled by infrastructure is used only to deliver content,
              prevent abuse, troubleshoot errors, and operate the service. OWWI does not use it for
              personalized advertising or behavioral profiling.
            </p>
            <p>
              Connections to the product website use HTTPS. We minimize processing to what is needed
              for the game to function and select infrastructure providers with appropriate data
              protection measures.
            </p>
          </>
        ),
      },
      retention: {
        title: "5. Data retention and deletion",
        body: (
          <>
            <p>
              OWWI does not operate an account database or player profiles for the current version,
              so there is no account data retained by OWWI that requires an account-deletion process.
            </p>
            <p>
              Temporary technical logs, if generated by infrastructure providers, are retained and
              deleted according to those providers' operational schedules and policies. You may send
              a privacy inquiry through the contact channel below.
            </p>
          </>
        ),
      },
      children: {
        title: "6. Children's privacy",
        body: (
          <p>
            Swordkoban does not knowingly collect personal data from children. Because the app has no
            account requirement, advertising, or feature for submitting personal content, we minimize
            data for every player, including younger players.
          </p>
        ),
      },
      changes: {
        title: "7. Changes to this policy",
        body: (
          <p>
            If features or data practices change, we will update this page and its effective date
            before material changes take effect. The latest version will always be published at this
            URL.
          </p>
        ),
      },
      contact: {
        title: "8. Privacy contact",
        body: (
          <>
            <p>
              To submit a privacy question or request, use the public email shown under
              <strong>App support</strong> on Swordkoban's Google Play listing.
            </p>
            <a className="privacy-contact" href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
              Open App support on Google Play
              <span aria-hidden="true">→</span>
            </a>
          </>
        ),
      },
    },
    footer: "© 2026 OWWI · Swordkoban",
  },
} satisfies Record<Language, unknown>;

function PrivacyIcon({ index }: { index: number }) {
  const paths = [
    <path key="account" d="M7 19v-1a5 5 0 0 1 10 0v1M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m6-5 4 4m0-4-4 4" />,
    <path key="shield" d="M12 3 5 6v5c0 4.6 2.9 8.1 7 10 4.1-1.9 7-5.4 7-10V6l-7-3Zm-3 9 2 2 4-5" />,
    <path key="ads" d="M4 6h11l4-2v16l-4-2H4V6Zm5 12v3H6v-3m11-9h3m-3 3h3" />,
  ];
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[index]}</svg>;
}

function PolicySection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="privacy-section" id={id}>
      <h2>{title}</h2>
      <div className="privacy-copy">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const [language, setLanguage] = useState<Language>(() =>
    navigator.language.toLocaleLowerCase().startsWith("vi") ? "vi" : "en",
  );
  const content = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "vi" ? "Chính sách quyền riêng tư · Swordkoban" : "Privacy Policy · Swordkoban";
  }, [language]);

  return (
    <div
      className="privacy-shell"
      style={{ "--privacy-background": `url("${gameBackground}")` } as CSSProperties}
    >
      <a className="skip-link" href="#privacy-content">{content.skip}</a>

      <header className="privacy-header">
        <a className="privacy-brand" href="/" aria-label="Swordkoban home">
          <img src={portalFrames[3]} alt="" draggable={false} />
          <span>Sword<strong>koban</strong></span>
        </a>

        <div className="privacy-header-actions">
          <div className="language-switch" aria-label={content.languageLabel}>
            <button type="button" aria-pressed={language === "vi"} onClick={() => setLanguage("vi")}>VI</button>
            <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
          </div>
          <a className="privacy-home" href="/">{content.home}</a>
        </div>
      </header>

      <main className="privacy-main" id="privacy-content">
        <section className="privacy-hero">
          <p className="privacy-kicker">{content.kicker}</p>
          <h1>{content.title}</h1>
          <p className="privacy-lead">{content.intro}</p>
          <p className="privacy-effective">{content.effective}</p>
        </section>

        <section className="privacy-summary" aria-label={language === "vi" ? "Tóm tắt quyền riêng tư" : "Privacy summary"}>
          {content.summary.map(([title, description], index) => (
            <article key={title}>
              <span className="privacy-summary-icon"><PrivacyIcon index={index} /></span>
              <div>
                <h2>{title}</h2>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </section>

        <div className="privacy-layout">
          <aside className="privacy-toc">
            <p>{content.contents}</p>
            <nav aria-label={content.contents}>
              {content.nav.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
            </nav>
          </aside>

          <article className="privacy-document">
            <PolicySection id="scope" title={content.sections.scope.title}>{content.sections.scope.body}</PolicySection>
            <PolicySection id="data" title={content.sections.data.title}>{content.sections.data.body}</PolicySection>
            <PolicySection id="providers" title={content.sections.providers.title}>{content.sections.providers.body}</PolicySection>
            <PolicySection id="security" title={content.sections.security.title}>{content.sections.security.body}</PolicySection>
            <PolicySection id="retention" title={content.sections.retention.title}>{content.sections.retention.body}</PolicySection>
            <PolicySection id="children" title={content.sections.children.title}>{content.sections.children.body}</PolicySection>
            <PolicySection id="changes" title={content.sections.changes.title}>{content.sections.changes.body}</PolicySection>
            <PolicySection id="contact" title={content.sections.contact.title}>{content.sections.contact.body}</PolicySection>
          </article>
        </div>
      </main>

      <footer className="privacy-footer">
        <span>{content.footer}</span>
        <a href="/">Swordkoban</a>
      </footer>
    </div>
  );
}
