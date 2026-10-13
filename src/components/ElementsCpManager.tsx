import React, { useState } from 'react';
import { CpElement } from '../types/curriculum';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  AlertTriangle,
  Save,
  FileCheck,
  Edit2,
  Check,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ElementsCpManagerProps {
  elements: CpElement[];
  setElements: React.Dispatch<React.SetStateAction<CpElement[]>>;
  onAnalyzeAll: () => void;
  onAnalyzeSingle: (element: CpElement) => void;
  isAnalyzing: boolean;
  onSaveDraft: () => void;
  onLoadDraft: () => void;
  hasDraft: boolean;
}

export const ElementsCpManager: React.FC<ElementsCpManagerProps> = ({
  elements,
  setElements,
  onAnalyzeAll,
  onAnalyzeSingle,
  isAnalyzing,
  onSaveDraft,
  onLoadDraft,
  hasDraft,
}) => {
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Add Element
  const handleAddElement = () => {
    const newId = `elem-${Date.now()}`;
    const newNumber = elements.length + 1;
    const newElement: CpElement = {
      id: newId,
      elementName: `Elemen ${newNumber}`,
      elementCode: `EL${newNumber}`,
      cpText: '',
    };
    setElements([...elements, newElement]);
  };

  // Reorder Element Up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newElements = [...elements];
    const temp = newElements[index - 1];
    newElements[index - 1] = newElements[index];
    newElements[index] = temp;
    setElements(newElements);
  };

  // Reorder Element Down
  const handleMoveDown = (index: number) => {
    if (index === elements.length - 1) return;
    const newElements = [...elements];
    const temp = newElements[index + 1];
    newElements[index + 1] = newElements[index];
    newElements[index] = temp;
    setElements(newElements);
  };

  // Delete Element with confirmation
  const handleDelete = (id: string) => {
    if (elements.length <= 1) {
      alert('Minimal harus ada 1 elemen.');
      return;
    }
    setElements(elements.filter((el) => el.id !== id));
    setDeleteConfirmId(null);
  };

  // Update text
  const handleCpChange = (id: string, text: string) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, cpText: text } : el)));
  };

  // Start editing name
  const startEditingName = (el: CpElement) => {
    setEditingNameId(el.id);
    setTempName(el.elementName);
  };

  // Save edited name
  const saveEditedName = (id: string) => {
    if (!tempName.trim()) return;
    const code = tempName
      .trim()
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 4);

    setElements(
      elements.map((el) =>
        el.id === id
          ? {
              ...el,
              elementName: tempName.trim(),
              elementCode: code || el.elementCode,
            }
          : el
      )
    );
    setEditingNameId(null);
  };

  // Validation
  const emptyElements = elements.filter((el) => !el.cpText.trim());
  const hasEmpty = emptyElements.length > 0;

  return (
    <div className="space-y-5">
      {/* Action Header & Guidance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Capaian Pembelajaran (CP) Per Elemen
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
              {elements.length} Elemen Terdaftar
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Setiap elemen dianalisis secara terpisah agar tidak terjadi percampuran kompetensi yang sembarangan.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onSaveDraft}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
            title="Simpan draf input CP di browser"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Simpan Draf</span>
          </button>

          {hasDraft && (
            <button
              onClick={onLoadDraft}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
              title="Buka kembali draf tersimpan"
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Muat Draf</span>
            </button>
          )}

          <button
            onClick={handleAddElement}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Elemen</span>
          </button>

          <button
            onClick={onAnalyzeAll}
            disabled={isAnalyzing || elements.length === 0}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-xs disabled:opacity-50 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAnalyzing ? 'Sedang Menganalisis...' : 'Analisis Seluruh Elemen Sekaligus'}</span>
          </button>
        </div>
      </div>

      {/* Curriculum Completeness Warning as required by Section 4 & 10 */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Ketentuan Ketercakupan Capaian Pembelajaran:</p>
          <p className="text-amber-800 leading-relaxed">
            Dokumen ini disusun berdasarkan elemen CP yang telah dimasukkan dan belum tentu mencakup seluruh CP mata pelajaran dalam satu fase apabila terdapat elemen resmi yang dilewati. Pastikan Anda memasukkan seluruh elemen jika menyusun perencanaan utuh satu fase.
          </p>
        </div>
      </div>

      {/* Validation warning if empty */}
      {hasEmpty && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              Ada <strong>{emptyElements.length} elemen</strong> yang teks CP-nya masih kosong. Lengkapi teks CP sebelum melakukan analisis.
            </span>
          </div>
        </div>
      )}

      {/* Dynamic Element Cards List */}
      <div className="space-y-4">
        {elements.map((el, index) => {
          const charCount = el.cpText.length;
          const wordCount = el.cpText.trim() ? el.cpText.trim().split(/\s+/).length : 0;
          const isDeleting = deleteConfirmId === el.id;

          return (
            <div
              key={el.id}
              className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all hover:border-slate-300"
            >
              {/* Card Header */}
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5 flex-1 min-w-[240px]">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs shadow-xs">
                    {index + 1}
                  </span>

                  {editingNameId === el.id ? (
                    <div className="flex items-center space-x-1.5 flex-1">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="px-2 py-1 text-xs font-bold border border-blue-400 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full max-w-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditedName(el.id);
                          if (e.key === 'Escape') setEditingNameId(null);
                        }}
                      />
                      <button
                        onClick={() => saveEditedName(el.id)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-md"
                        title="Simpan Nama"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingNameId(null)}
                        className="p-1 text-slate-400 hover:bg-slate-100 rounded-md"
                        title="Batal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                        {el.elementName}
                      </h3>
                      {el.elementCode && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-700">
                          {el.elementCode}
                        </span>
                      )}
                      <button
                        onClick={() => startEditingName(el)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors"
                        title="Ubah Nama Elemen"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Top Actions */}
                <div className="flex items-center space-x-1">
                  {/* Reorder Buttons */}
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Naikkan Urutan Elemen"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === elements.length - 1}
                    className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-md disabled:opacity-30 disabled:hover:bg-transparent"
                    title="Turunkan Urutan Elemen"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Single Element Analysis */}
                  <button
                    onClick={() => onAnalyzeSingle(el)}
                    disabled={isAnalyzing || !el.cpText.trim()}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-md disabled:opacity-40 transition-colors shadow-xs ml-1"
                    title="Analisis khusus CP elemen ini"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Analisis Elemen</span>
                  </button>

                  {/* Delete Button */}
                  {isDeleting ? (
                    <div className="flex items-center space-x-1 pl-2 border-l border-slate-300">
                      <span className="text-[10px] text-red-600 font-semibold">Hapus?</span>
                      <button
                        onClick={() => handleDelete(el.id)}
                        className="px-2 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Ya
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-200 rounded-md"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(el.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors ml-1"
                      title="Hapus Elemen Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Body - CP Textarea */}
              <div className="p-4">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Teks Capaian Pembelajaran (CP) Elemen:</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {wordCount} kata • {charCount} karakter
                  </span>
                </label>
                <textarea
                  rows={4}
                  value={el.cpText}
                  onChange={(e) => handleCpChange(el.id, e.target.value)}
                  placeholder={`Tempelkan atau ketikkan rumusan CP resmi untuk elemen "${el.elementName}" di sini...`}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed resize-y font-normal"
                />

                {!el.cpText.trim() && (
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>Teks CP elemen ini masih kosong. Silakan tempelkan teks CP resmi.</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
        <button
          onClick={handleAddElement}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4 text-slate-500" />
          <span>Tambah Elemen Pembelajaran Lainnya</span>
        </button>

        <button
          onClick={onAnalyzeAll}
          disabled={isAnalyzing || elements.length === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isAnalyzing ? 'Sedang Memproses Analisis...' : 'Lanjutkan ke Analisis CP (AI) →'}</span>
        </button>
      </div>
    </div>
  );
};
