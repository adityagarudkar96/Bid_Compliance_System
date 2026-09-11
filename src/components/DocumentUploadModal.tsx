import React, { useEffect, useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface DocumentUploadModalProps {
  bidderName: string;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: { document_type: string; file_name: string; file_text?: string; file_size?: string }) => Promise<void>;
}

const DOCUMENT_TYPES = [
  'GST Certificate (REG-06)',
  'Udyam Registration Certificate',
  'Company PAN Card',
  'Income Tax Return (ITR-V)',
  'Make in India Local Content Declaration',
  'EPFO Registration & ECR Receipt',
  'Non-Debarment Affidavit',
  'OEM Authorization Form',
];

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  bidderName,
  isOpen,
  onClose,
  onUpload,
}) => {
  const [docType, setDocType] = useState<string>(DOCUMENT_TYPES[0]);
  const [fileName, setFileName] = useState<string>('');
  const [fileText, setFileText] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('1.1 MB');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      setFileText(`TENDER DOCUMENT ARTIFACT: ${file.name}\nUploaded for ${bidderName}\nClassification: ${docType}`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      setFileText(`TENDER DOCUMENT ARTIFACT: ${file.name}\nUploaded for ${bidderName}\nClassification: ${docType}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      setFileName(`submission_${docType.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`);
    }

    setIsUploading(true);
    try {
      await onUpload({
        document_type: docType,
        file_name: fileName || 'tender_submission_doc.pdf',
        file_text: fileText || `Document submitted for ${bidderName}`,
        file_size: fileSize,
      });
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 cursor-pointer animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-600">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-blue-300 font-mono">Document Ingestion Pipeline</div>
              <h3 className="text-base font-bold text-white">Upload Bidder Document</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Bidder:</span>
            <strong className="text-sm text-slate-900">{bidderName}</strong>
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">Document Category / Classification:</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 bg-white"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Drag and Drop Zone */}
          <div>
            <label className="block font-bold text-slate-900 mb-1">Attach File (PDF, Scanned JPG, PNG):</label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-upload" className="cursor-pointer block space-y-2">
                <FileText className="w-8 h-8 text-blue-600 mx-auto" />
                {fileName ? (
                  <div className="text-slate-900 font-bold">
                    <span>{fileName}</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">{fileSize}</span>
                  </div>
                ) : (
                  <div>
                    <span className="font-semibold text-blue-600 hover:underline">Click to browse</span> or drag and drop file here
                    <span className="text-slate-400 text-[11px] block mt-0.5">Maximum size: 25MB • Formats: PDF, JPG, PNG</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">Extracted Text / OCR Preview (Optional):</label>
            <textarea
              value={fileText}
              onChange={(e) => setFileText(e.target.value)}
              rows={2}
              placeholder="Paste extracted document text for direct parsing..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 font-mono"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? 'Uploading & Parsing...' : 'Upload & Process'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
