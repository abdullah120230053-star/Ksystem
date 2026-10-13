'use client';

import React, { useState, useRef } from 'react';
import { Download, Printer, X, FileText, CheckCircle2, Loader2 } from 'lucide-react';

export interface PdfSummaryItem {
  label: string;
  value: string;
  color?: string;
}

export interface OfficialPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
  documentTitle: string;
  subtitle?: string;
  schoolName: string;
  adminName: string;
  metaItems?: { label: string; value: string }[];
  summaryItems?: PdfSummaryItem[];
  headers: string[];
  rows: (string | number)[][];
  totalRow?: (string | number)[];
  notes?: string;
}

export default function OfficialPdfModal({
  isOpen,
  onClose,
  filename,
  documentTitle,
  subtitle,
  schoolName,
  adminName,
  metaItems = [],
  summaryItems = [],
  headers,
  rows,
  totalRow,
  notes,
}: OfficialPdfModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (!docRef.current) return;
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      // Dynamically import html2pdf in client context
      const html2pdf = (await import('html2pdf.js')).default;
      const element = docRef.current;

      const opt = {
        margin: [10, 10, 12, 10] as [number, number, number, number], // top, left, bottom, right in mm
        filename: `${filename}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
        },
        jsPDF: {
          unit: 'mm' as const,
          format: 'a4' as const,
          orientation: 'portrait' as const,
        },
      };

      await html2pdf().set(opt).from(element).save();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('حدث خطأ أثناء إنشاء ملف الـ PDF. يمكنك استخدام زر الطباعة كبديل.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintDocument = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Toolbar (Screen only) */}
        <div
          className="no-print"
          style={{
            padding: '14px 20px',
            backgroundColor: '#0F5132',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={22} style={{ color: '#D4AF37' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                معاينة وتصدير المستند الرسمي (PDF)
              </div>
              <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                تنسيق رسمي A4 معد للطباعة والتحميل كملف PDF
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="btn"
              style={{
                backgroundColor: '#D4AF37',
                color: '#1a3311',
                fontWeight: 900,
                fontSize: '0.85rem',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: isGenerating ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جارٍ إنشاء الـ PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>تم التحميل بنجاح ✓</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>تحميل ملف PDF (.pdf)</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrintDocument}
              className="btn"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Printer size={16} />
              <span>طباعة</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="إغلاق"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {/* Official A4 Document Sheet */}
          <div
            ref={docRef}
            id="official-pdf-document"
            style={{
              width: '100%',
              maxWidth: '780px',
              backgroundColor: '#ffffff',
              padding: '36px 32px',
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
              fontFamily: "'Cairo', 'Segoe UI', sans-serif",
              direction: 'rtl',
              color: '#0f172a',
              boxSizing: 'border-box',
              border: '2px solid #0F5132',
              position: 'relative',
            }}
          >
            {/* Islamic Header (Basmala) */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0F5132',
                  letterSpacing: '1px',
                }}
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
            </div>

            {/* Official Header Frame */}
            <div
              style={{
                borderBottom: '2px solid #0F5132',
                paddingBottom: '16px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px',
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    color: '#0F5132',
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  {schoolName || 'كُتّاب تحفيظ القرآن الكريم'}
                </h1>
                <h2
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#1e293b',
                    margin: '6px 0 0 0',
                  }}
                >
                  {documentTitle}
                </h2>
                {subtitle && (
                  <p
                    style={{
                      fontSize: '0.825rem',
                      color: '#64748b',
                      margin: '2px 0 0 0',
                      fontWeight: 600,
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Meta stamp block */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  textAlign: 'right',
                  minWidth: '170px',
                }}
              >
                <div style={{ fontWeight: 800, color: '#0F5132', marginBottom: '4px' }}>
                  بيانات الوثيقة
                </div>
                <div style={{ color: '#475569' }}>
                  تاريخ الإصدار: <strong>{new Date().toISOString().split('T')[0]}</strong>
                </div>
                {metaItems.map((meta, idx) => (
                  <div key={idx} style={{ color: '#475569', marginTop: '2px' }}>
                    {meta.label}: <strong>{meta.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Statistics Boxes (if any) */}
            {summaryItems.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(summaryItems.length, 4)}, 1fr)`,
                  gap: '8px',
                  marginBottom: '18px',
                }}
              >
                {summaryItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: 900,
                        color: item.color || '#0F5132',
                        marginTop: '2px',
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Structured Table */}
            <div style={{ marginBottom: '20px', overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.825rem',
                  textAlign: 'right',
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: '#0F5132',
                      color: '#ffffff',
                    }}
                  >
                    <th style={{ padding: '8px 10px', border: '1px solid #0F5132', width: '36px', textAlign: 'center' }}>
                      #
                    </th>
                    {headers.map((h, idx) => (
                      <th
                        key={idx}
                        style={{
                          padding: '8px 10px',
                          border: '1px solid #0F5132',
                          fontWeight: 800,
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={headers.length + 1}
                        style={{
                          padding: '16px',
                          textAlign: 'center',
                          border: '1px solid #e2e8f0',
                          color: '#64748b',
                        }}
                      >
                        لا توجد بيانات مسجلة في هذا الكشف
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        style={{
                          backgroundColor: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        }}
                      >
                        <td
                          style={{
                            padding: '7px 10px',
                            border: '1px solid #cbd5e1',
                            textAlign: 'center',
                            fontWeight: 700,
                            color: '#64748b',
                          }}
                        >
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            style={{
                              padding: '7px 10px',
                              border: '1px solid #cbd5e1',
                              fontWeight: cIdx === 0 ? 800 : 600,
                              color: '#1e293b',
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}

                  {/* Total Summary Row */}
                  {totalRow && totalRow.length > 0 && (
                    <tr
                      style={{
                        backgroundColor: '#f1f5f9',
                        fontWeight: 900,
                        borderTop: '2px solid #0F5132',
                      }}
                    >
                      <td
                        style={{
                          padding: '8px 10px',
                          border: '1px solid #cbd5e1',
                          textAlign: 'center',
                        }}
                      >
                        ∑
                      </td>
                      {totalRow.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          style={{
                            padding: '8px 10px',
                            border: '1px solid #cbd5e1',
                            fontWeight: 900,
                            color: '#0F5132',
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Notes if present */}
            {notes && (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#475569',
                  marginBottom: '20px',
                  backgroundColor: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  borderRight: '3px solid #0F5132',
                }}
              >
                <strong>ملاحظة: </strong> {notes}
              </div>
            )}

            {/* Official Signatures & Seal Box */}
            <div
              style={{
                marginTop: '30px',
                paddingTop: '16px',
                borderTop: '1px solid #cbd5e1',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ textAlign: 'center', minWidth: '160px' }}>
                <div style={{ fontWeight: 800, color: '#334155' }}>المشرف الإداري</div>
                <div style={{ marginTop: '4px', color: '#64748b' }}>{adminName || 'إدارة الكُتّاب'}</div>
                <div style={{ marginTop: '24px', borderTop: '1px dashed #94a3b8', width: '120px', margin: '24px auto 0' }} />
              </div>

              <div
                style={{
                  textAlign: 'center',
                  border: '2px dashed #0F5132',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#0F5132',
                  opacity: 0.85,
                }}
              >
                خاتم الكُتّاب
              </div>

              <div style={{ textAlign: 'center', minWidth: '160px' }}>
                <div style={{ fontWeight: 800, color: '#334155' }}>توقيع المسؤول المالي</div>
                <div style={{ marginTop: '4px', color: '#64748b' }}>اعتماد السداد</div>
                <div style={{ marginTop: '24px', borderTop: '1px dashed #94a3b8', width: '120px', margin: '24px auto 0' }} />
              </div>
            </div>

            {/* Document Footer */}
            <div
              style={{
                marginTop: '20px',
                textAlign: 'center',
                fontSize: '0.7rem',
                color: '#94a3b8',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '8px',
              }}
            >
              وثيقة إدارية رسمية صادرة آلياً من نظام إدارة الكُتّاب
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
