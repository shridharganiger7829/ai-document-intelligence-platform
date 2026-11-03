import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  Building,
  Calendar,
  Layers,
  Code,
  Edit3,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const ExtractedDataViewer = ({
  extractionData,
  isEditable = false,
  onChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('structured'); // 'structured' | 'ocr' | 'raw_json'

  // Extract structured data object or fallback
  const structured = extractionData?.structured_data || extractionData || {};
  const ocrText = extractionData?.ocr?.text || '';

  const {
    document_type = 'document',
    invoice_details = {},
    vendor = {},
    bill_to = {},
    ship_to = {},
    line_items = [],
    financial_summary = {},
    payment_terms,
  } = structured;

  const handleFieldChange = (section, field, value) => {
    if (!onChange) return;
    const updated = JSON.parse(JSON.stringify(structured));
    if (section) {
      if (!updated[section]) updated[section] = {};
      updated[section][field] = value;
    } else {
      updated[field] = value;
    }
    onChange(updated);
  };

  const handleLineItemChange = (index, field, value) => {
    if (!onChange) return;
    const updated = JSON.parse(JSON.stringify(structured));
    if (!updated.line_items) updated.line_items = [];
    if (!updated.line_items[index]) updated.line_items[index] = {};
    updated.line_items[index][field] = value;
    onChange(updated);
  };

  const isInvoice =
    document_type === 'invoice' ||
    Boolean(invoice_details?.invoice_number) ||
    Boolean(financial_summary?.total);

  return (
    <div className={`flex flex-col h-full rounded-2xl bg-surface-card border border-white/10 overflow-hidden shadow-2xl ${className}`}>
      {/* Header and Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-navy-900 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-500/15 text-brand-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              AI Extracted Intelligence
              {isEditable && (
                <span className="px-2 py-0.5 rounded text-[10px] bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  Editing Enabled
                </span>
              )}
            </h3>
            <span className="text-[11px] text-slate-400 capitalize">
              Detected: <span className="text-slate-200 font-semibold">{document_type || 'Unknown Type'}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1 text-xs">
          <button
            onClick={() => setActiveTab('structured')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              activeTab === 'structured'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Structured View
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              activeTab === 'ocr'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            OCR Raw
          </button>
          <button
            onClick={() => setActiveTab('raw_json')}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              activeTab === 'raw_json'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw JSON
          </button>
        </div>
      </div>

      {/* Viewport Content */}
      <div className="flex-1 p-5 overflow-y-auto space-y-6">
        {activeTab === 'ocr' ? (
          <div className="p-4 rounded-xl bg-navy-950 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed border border-white/5 max-h-[600px] overflow-auto">
            {ocrText || 'No OCR text available for this document.'}
          </div>
        ) : activeTab === 'raw_json' ? (
          <pre className="p-4 rounded-xl bg-navy-950 font-mono text-xs text-emerald-400 whitespace-pre-wrap overflow-auto border border-white/5 max-h-[600px]">
            {JSON.stringify(structured, null, 2)}
          </pre>
        ) : (
          <>
            {/* INVOICE / DOCUMENT DETAILS SECTION */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                <span>Document Identifiers</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Invoice / Ref #</span>
                  {isEditable ? (
                    <input
                      type="text"
                      value={invoice_details?.invoice_number || ''}
                      onChange={(e) =>
                        handleFieldChange('invoice_details', 'invoice_number', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-white font-medium focus:outline-none focus:border-brand-500"
                    />
                  ) : (
                    <span className="font-semibold text-white">
                      {invoice_details?.invoice_number || '-'}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Issue Date</span>
                  {isEditable ? (
                    <input
                      type="text"
                      value={invoice_details?.invoice_date || ''}
                      onChange={(e) =>
                        handleFieldChange('invoice_details', 'invoice_date', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-white font-medium focus:outline-none focus:border-brand-500"
                    />
                  ) : (
                    <span className="font-semibold text-white">
                      {invoice_details?.invoice_date || '-'}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Due Date</span>
                  {isEditable ? (
                    <input
                      type="text"
                      value={invoice_details?.due_date || ''}
                      onChange={(e) =>
                        handleFieldChange('invoice_details', 'due_date', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-white font-medium focus:outline-none focus:border-brand-500"
                    />
                  ) : (
                    <span className="font-semibold text-white">
                      {invoice_details?.due_date || '-'}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">PO Number</span>
                  {isEditable ? (
                    <input
                      type="text"
                      value={invoice_details?.purchase_order_number || ''}
                      onChange={(e) =>
                        handleFieldChange('invoice_details', 'purchase_order_number', e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-white font-medium focus:outline-none focus:border-brand-500"
                    />
                  ) : (
                    <span className="font-semibold text-white">
                      {invoice_details?.purchase_order_number || '-'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* PARTIES INVOLVED: VENDOR & CUSTOMER */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Vendor */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-300">
                  <Building className="w-3.5 h-3.5 text-brand-400" />
                  <span>Vendor / Issuer</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Name:</span>
                  {isEditable ? (
                    <input
                      type="text"
                      value={vendor?.name || ''}
                      onChange={(e) => handleFieldChange('vendor', 'name', e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-white font-medium"
                    />
                  ) : (
                    <span className="font-semibold text-white">{vendor?.name || '-'}</span>
                  )}
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Address:</span>
                  {isEditable ? (
                    <input
                      type="text"
                      value={vendor?.address || ''}
                      onChange={(e) => handleFieldChange('vendor', 'address', e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-white font-medium"
                    />
                  ) : (
                    <span className="text-slate-300">{vendor?.address || '-'}</span>
                  )}
                </div>
              </div>

              {/* Bill To */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-slate-300">
                  <Building className="w-3.5 h-3.5 text-brand-400" />
                  <span>Customer (Bill To)</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Name:</span>
                  {isEditable ? (
                    <input
                      type="text"
                      value={bill_to?.name || ''}
                      onChange={(e) => handleFieldChange('bill_to', 'name', e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-white font-medium"
                    />
                  ) : (
                    <span className="font-semibold text-white">{bill_to?.name || '-'}</span>
                  )}
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Address:</span>
                  {isEditable ? (
                    <input
                      type="text"
                      value={bill_to?.address || ''}
                      onChange={(e) => handleFieldChange('bill_to', 'address', e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-navy-900 border border-white/10 text-white font-medium"
                    />
                  ) : (
                    <span className="text-slate-300">{bill_to?.address || '-'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* LINE ITEMS TABLE */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Layers className="w-3.5 h-3.5 text-brand-400" />
                  <span>Line Items ({line_items?.length || 0})</span>
                </div>
              </div>

              {line_items && line_items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 text-center w-20">Qty</th>
                        <th className="py-2 px-3 text-right w-28">Unit Price</th>
                        <th className="py-2 px-3 text-right w-28">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {line_items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-3 font-medium text-white">
                            {isEditable ? (
                              <input
                                type="text"
                                value={item.description || ''}
                                onChange={(e) =>
                                  handleLineItemChange(idx, 'description', e.target.value)
                                }
                                className="w-full px-2 py-1 rounded bg-navy-900 border border-white/10 text-white"
                              />
                            ) : (
                              item.description || '-'
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isEditable ? (
                              <input
                                type="number"
                                value={item.quantity || ''}
                                onChange={(e) =>
                                  handleLineItemChange(idx, 'quantity', e.target.value)
                                }
                                className="w-16 px-1.5 py-1 text-center rounded bg-navy-900 border border-white/10 text-white"
                              />
                            ) : (
                              item.quantity ?? '-'
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            {isEditable ? (
                              <input
                                type="number"
                                step="0.01"
                                value={item.unit_price || ''}
                                onChange={(e) =>
                                  handleLineItemChange(idx, 'unit_price', e.target.value)
                                }
                                className="w-24 px-1.5 py-1 text-right rounded bg-navy-900 border border-white/10 text-white font-mono"
                              />
                            ) : (
                              item.unit_price !== null && item.unit_price !== undefined
                                ? item.unit_price
                                : '-'
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-white">
                            {isEditable ? (
                              <input
                                type="number"
                                step="0.01"
                                value={item.amount || ''}
                                onChange={(e) =>
                                  handleLineItemChange(idx, 'amount', e.target.value)
                                }
                                className="w-24 px-1.5 py-1 text-right rounded bg-navy-900 border border-white/10 text-white font-mono"
                              />
                            ) : (
                              item.amount !== null && item.amount !== undefined ? item.amount : '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">No individual line items identified.</p>
              )}
            </div>

            {/* FINANCIAL SUMMARY */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-navy-900/90 to-navy-850 border border-brand-500/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Financial Totals</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Subtotal</span>
                  <span className="text-sm font-semibold text-slate-200 font-mono">
                    {financial_summary?.subtotal !== null && financial_summary?.subtotal !== undefined
                      ? `${financial_summary.currency || ''} ${financial_summary.subtotal}`
                      : '-'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Tax Amount</span>
                  <span className="text-sm font-semibold text-slate-200 font-mono">
                    {financial_summary?.tax_amount !== null && financial_summary?.tax_amount !== undefined
                      ? `${financial_summary.tax_amount}`
                      : '-'}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-400 block">Currency</span>
                  <span className="text-sm font-bold text-brand-400">
                    {financial_summary?.currency || 'USD'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-brand-500/15 border border-brand-500/30">
                  <span className="text-[10px] text-brand-300 uppercase font-bold block">
                    Total Amount
                  </span>
                  <span className="text-base font-extrabold text-white font-mono">
                    {financial_summary?.total !== null && financial_summary?.total !== undefined
                      ? `${financial_summary.currency || ''} ${financial_summary.total}`
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExtractedDataViewer;
