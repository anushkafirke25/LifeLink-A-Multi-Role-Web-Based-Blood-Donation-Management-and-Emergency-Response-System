// Certificate generation utility

/**
 * Generate a donation certificate as PDF (client-side)
 * @param {Object} donation - Donation object with donor, bloodBank, donationDate, etc.
 * @param {Object} user - User object with name, bloodType
 */
export const generateCertificate = (donation, user) => {
  // Blood bank: populated object or flat
  const bloodBank = donation.bloodBank && typeof donation.bloodBank === 'object' ? donation.bloodBank : null;
  const bloodBankName =
    (bloodBank && bloodBank.name) ||
    donation.bloodBankName ||
    'LifeLink Blood Bank';

  // Signature: use this blood bank's uploaded signature (data URL), else after.png (used for central bank and fallback)
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const defaultSignatureUrl = origin + '/after.png';
  const signatureSrc = (bloodBank && bloodBank.signature) ? bloodBank.signature : defaultSignatureUrl;

  // Create a new window for certificate
  const certificateWindow = window.open('', '_blank', 'width=800,height=600');

  const certificateHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Blood Donation Certificate</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 0;
        }
        body {
          font-family: 'Georgia', serif;
          margin: 0;
          padding: 40px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        .certificate {
          background: white;
          padding: 60px;
          border: 8px solid #dc2626;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          text-align: center;
          max-width: 900px;
          position: relative;
        }
        .certificate::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          border: 2px solid #dc2626;
          opacity: 0.3;
        }
        .header {
          color: #dc2626;
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 3px;
        }
        .subtitle {
          color: #666;
          font-size: 18px;
          margin-bottom: 40px;
          font-style: italic;
        }
        .certificate-text {
          font-size: 24px;
          color: #333;
          margin: 30px 0;
          line-height: 1.8;
        }
        .donor-name {
          font-size: 36px;
          font-weight: bold;
          color: #dc2626;
          margin: 20px 0;
          text-decoration: underline;
        }
        .details {
          margin-top: 40px;
          font-size: 18px;
          color: #555;
          line-height: 2;
        }
        .footer {
          margin-top: 50px;
          display: flex;
          justify-content: space-between;
          font-size: 16px;
        }
        .signature {
          width: 220px;
          margin-top: 60px;
        }
        .signature-img {
          display: block;
          max-width: 180px;
          max-height: 56px;
          margin: 0 auto 0;
          object-fit: contain;
        }
        .signature-line {
          border-top: 2px solid #333;
          margin-top: 4px;
          padding-top: 10px;
        }
        .seal {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 60px;
          opacity: 0.1;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="seal">🩸</div>
        <div class="header">Certificate of Appreciation</div>
        <div class="subtitle">For Generous Blood Donation</div>
        <div class="certificate-text">
          This is to certify that
        </div>
        <div class="donor-name">${user?.name || 'Donor'}</div>
        <div class="certificate-text">
          has voluntarily donated blood on
        </div>
        <div class="details">
          <div><strong>Date:</strong> ${new Date(donation.donationDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
          <div><strong>Blood Type:</strong> ${donation.bloodType || user?.bloodType}</div>
          <div><strong>Units:</strong> ${donation.units || 1}</div>
          <div><strong>Blood Bank:</strong> ${bloodBankName}</div>
        </div>
        <div class="certificate-text" style="margin-top: 40px;">
          Your selfless act of donating blood has the potential to save up to three lives.
          We express our heartfelt gratitude for your contribution to saving lives.
        </div>
        <div class="footer">
          <div class="signature">
            <img src="${signatureSrc}" alt="Signature" class="signature-img" onerror="this.style.display='none'">
            <div class="signature-line">
              <div>Authorized Signatory</div>
              <div style="font-size: 14px; color: #555; margin-top: 8px;">Issued by</div>
              <div style="margin-top: 8px; font-weight: bold;">${bloodBankName}</div>
            </div>
          </div>
          <div class="signature">
            <div>Date</div>
            <div style="margin-top: 40px;">${new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  certificateWindow.document.write(certificateHTML);
  certificateWindow.document.close();

  // Wait for signature image to load (if present), then print
  const img = certificateWindow.document.querySelector('.signature-img');
  const triggerPrint = () => certificateWindow.print();
  if (img && img.complete) {
    setTimeout(triggerPrint, 300);
  } else if (img) {
    img.onload = () => setTimeout(triggerPrint, 200);
    img.onerror = () => setTimeout(triggerPrint, 200);
    setTimeout(triggerPrint, 1500); // fallback in case onload never fires
  } else {
    setTimeout(triggerPrint, 500);
  }
};

/**
 * Download certificate as PDF (using browser print to PDF)
 */
export const downloadCertificate = (donation, user) => {
  generateCertificate(donation, user);
};

