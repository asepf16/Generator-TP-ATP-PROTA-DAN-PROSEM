import React, { useState } from 'react';
import { FullDocumentState } from '../types/curriculum';
import { calculateTimeDistribution } from '../utils/exportEngine';
import { generateFullProtaPromes } from '../utils/protaPromesGenerator';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Copy,
  CheckCircle2,
  Calendar,
  Building2,
  Clock,
  Layers,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface ExportViewProps {
  documentState: FullDocumentState;
  setTeacherNotes: (notes: string) => void;
  onExportDocx: () => void;
  onExportXlsx: () => void;
  onPrint: () => void;
  onCopyTable: () => void;
}

export const ExportView: React.FC<ExportViewProps> = ({
  documentState,
  setTeacherNotes,
  onExportDocx,
  onExportXlsx,
  onPrint,
  onCopyTable,
}) => {
  const [copied, setCopied] = useState(false);
  const { schoolIdentity, learningIdentity, elements, analysis, tpList = [], atpResult, traceability, teacherNotes } =
    documentState;

  const timeCalc = calculateTimeDistribution(learningIdentity, tpList);
  const atpList = atpResult?.atpList || [];

  const protaPromes = documentState.protaPromes || generateFullProtaPromes(atpList, learningIdentity, schoolIdentity);
  const promes1 = protaPromes.promesList.find((p) => p.semester === 1);
  const promes2 = protaPromes.promesList.find((p) => p.semester === 2);
  const totalProtaJp = (protaPromes.protaList || []).reduce((acc, c) => acc + (Number(c.allocatedJp) || 0), 0);
  const sem1Jp = (protaPromes.protaList || []).filter(p => p.semester === 1).reduce((acc, c) => acc + (Number(c.allocatedJp) || 0), 0);
  const sem2Jp = (protaPromes.protaList || []).filter(p => p.semester === 2).reduce((acc, c) => acc + (Number(c.allocatedJp) || 0), 0);

  const handleCopy = () => {
    onCopyTable();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Pratinjau Dokumen &amp; Ekspor Resmi
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Dokumen Lengkap 7 Bagian
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen siap diunduh dalam format Word (.docx), Excel (.xlsx), atau dicetak langsung ke PDF.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Markdown'}</span>
          </button>

          <button
            onClick={onExportDocx}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg shadow-xs transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Unduh Word (.docx)</span>
          </button>

          <button
            onClick={onExportXlsx}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Unduh Excel (.xlsx)</span>
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Official Formatted Document Preview (Printable Area) */}
      <div id="printable-document" className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-10 space-y-8 text-slate-800 font-sans">
        {/* Document Header / Kop */}
        <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
          <h2 className="text-sm font-bold tracking-widest text-slate-600 uppercase">
            Pemerintah Republik Indonesia • Kemendikdasmen
          </h2>
          <h1 className="text-lg font-extrabold text-slate-950 uppercase tracking-tight">
            PERENCANAAN PEMBELAJARAN: TUJUAN PEMBELAJARAN (TP) DAN ALUR TUJUAN PEMBELAJARAN (ATP)
          </h1>
          <p className="text-xs text-slate-600">
            Mengacu pada Panduan Pembelajaran dan Asesmen (PPA) Edisi Revisi 2025 • Kepka BKPDM No. 020 Tahun 2026 (Pendidikan Agama) &amp; Kepka BSKAP No. 046 Tahun 2025 (Mata Pelajaran Lainnya)
          </p>
        </div>

        {/* 1. Identitas Satuan Pendidikan & Pembelajaran */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-3 py-1.5 rounded-sm">
            I. Identitas Satuan Pendidikan &amp; Pembelajaran
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500 font-medium">Nama Satuan Pendidikan:</span>
              <span className="font-bold text-slate-900">{schoolIdentity.schoolName || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500 font-medium">NPSN / NSM:</span>
              <span className="font-semibold text-slate-800">{schoolIdentity.npsnNsm || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500 font-medium">Mata Pelajaran:</span>
              <span className="font-bold text-blue-900">{learningIdentity.subjectName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500 font-medium">Jenjang / Fase / Kelas:</span>
              <span className="font-bold text-slate-900">
                {learningIdentity.jenjang} • {learningIdentity.fase} • {learningIdentity.grade}
              </span>
            </div>
            {learningIdentity.vocationalProgram && (
              <div className="flex justify-between border-b border-slate-100 py-1 md:col-span-2">
                <span className="text-slate-500 font-medium">Program / Konsentrasi Keahlian (SMK):</span>
                <span className="font-bold text-slate-900">{learningIdentity.vocationalProgram}</span>
              </div>
            )}
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500 font-medium">Tahun Pelajaran:</span>
              <span className="font-semibold text-slate-800">{schoolIdentity.academicYear}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1">
              <span className="text-slate-500 font-medium">Guru Pengampu:</span>
              <span className="font-semibold text-slate-800">{schoolIdentity.teacherName || '-'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-1 md:col-span-2">
              <span className="text-slate-500 font-medium">Alokasi Waktu Pembelajaran:</span>
              <span className="font-semibold text-slate-800">
                {learningIdentity.jpPerWeek} JP/Minggu @ {learningIdentity.minutesPerJp} Menit • {learningIdentity.effectiveWeeksPerSemester} Minggu Efektif (Total: {timeCalc.totalAvailableJp} JP / {timeCalc.totalAvailableMinutes} Menit)
              </span>
            </div>
          </div>
        </div>

        {/* 2. CP Per Elemen */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-3 py-1.5 rounded-sm">
            II. Capaian Pembelajaran (CP) Per Elemen
          </h3>

          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2.5 w-12 text-center border-r border-slate-300">No</th>
                  <th className="p-2.5 w-44 border-r border-slate-300">Nama Elemen</th>
                  <th className="p-2.5">Rumusan Capaian Pembelajaran (CP) Resmi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {elements.map((el, i) => (
                  <tr key={el.id} className="align-top">
                    <td className="p-2.5 text-center font-medium border-r border-slate-300">{i + 1}</td>
                    <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">{el.elementName}</td>
                    <td className="p-2.5 text-slate-700 leading-relaxed text-justify">{el.cpText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Hasil Analisis CP */}
        {analysis && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-3 py-1.5 rounded-sm">
              III. Ringkasan Hasil Analisis CP Multi-Elemen
            </h3>
            <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
              {analysis.curriculumCoverageSummary}
            </p>
          </div>
        )}

        {/* 4. Tabel TP Per Elemen */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-3 py-1.5 rounded-sm">
            IV. Tujuan Pembelajaran (TP) Per Elemen (Seluruh Fase)
          </h3>

          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2 w-10 text-center border-r border-slate-300">No</th>
                  <th className="p-2 w-24 border-r border-slate-300">Kode TP</th>
                  <th className="p-2 w-28 border-r border-slate-300">Tahun / Kelas</th>
                  <th className="p-2 w-16 text-center border-r border-slate-300">Sem</th>
                  <th className="p-2 w-28 border-r border-slate-300">Elemen</th>
                  <th className="p-2 border-r border-slate-300">Rumusan Tujuan Pembelajaran (TP)</th>
                  <th className="p-2 w-32 border-r border-slate-300">Kompetensi &amp; Materi</th>
                  <th className="p-2 w-16 text-center">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tpList.map((tp, idx) => (
                  <tr key={tp.id} className="align-top">
                    <td className="p-2 text-center border-r border-slate-300 font-medium">{idx + 1}</td>
                    <td className="p-2 font-mono font-bold text-blue-700 border-r border-slate-300">{tp.code}</td>
                    <td className="p-2 font-semibold text-slate-900 border-r border-slate-300">{tp.suggestedGrade}</td>
                    <td className="p-2 text-center border-r border-slate-300 font-medium">Sem {tp.suggestedSemester}</td>
                    <td className="p-2 font-medium text-slate-800 border-r border-slate-300">{tp.elementName}</td>
                    <td className="p-2 text-slate-800 leading-relaxed border-r border-slate-300">{tp.tpStatement}</td>
                    <td className="p-2 text-slate-700 border-r border-slate-300 text-[11px]">
                      <strong>Komp:</strong> {tp.competency} <br />
                      <strong>Materi:</strong> {tp.contentScope}
                    </td>
                    <td className="p-2 text-center font-bold text-slate-900">{tp.recommendedJp} JP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Tabel ATP Terpadu */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-3 py-1.5 rounded-sm">
            V. Alur Tujuan Pembelajaran (ATP) Terpadu Seluruh Semester
          </h3>

          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2 w-12 text-center border-r border-slate-300">Alur Fase</th>
                  <th className="p-2 w-16 text-center border-r border-slate-300">Alur Sem.</th>
                  <th className="p-2 w-24 border-r border-slate-300">Kode TP</th>
                  <th className="p-2 w-28 border-r border-slate-300">Tahun / Kelas</th>
                  <th className="p-2 w-16 text-center border-r border-slate-300">Sem</th>
                  <th className="p-2 w-28 border-r border-slate-300">Elemen</th>
                  <th className="p-2 border-r border-slate-300">Tujuan Pembelajaran (TP)</th>
                  <th className="p-2 w-28 border-r border-slate-300">Konsep &amp; Prasyarat</th>
                  <th className="p-2 w-16 text-center border-r border-slate-300">Waktu</th>
                  <th className="p-2 w-44">Bukti Ketercapaian (IKTP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {atpList.map((atp) => (
                  <tr key={atp.tpId} className="align-top">
                    <td className="p-2 text-center border-r border-slate-300 font-bold text-blue-700">#{atp.order}</td>
                    <td className="p-2 text-center border-r border-slate-300 font-mono font-bold text-slate-800 bg-slate-50">
                      {atp.semesterOrder || '-'}
                    </td>
                    <td className="p-2 font-mono font-bold text-slate-800 border-r border-slate-300">{atp.tpCode}</td>
                    <td className="p-2 font-semibold text-slate-900 border-r border-slate-300">{atp.grade}</td>
                    <td className="p-2 text-center border-r border-slate-300 font-medium">Sem {atp.semester}</td>
                    <td className="p-2 font-medium text-slate-800 border-r border-slate-300">{atp.elementName}</td>
                    <td className="p-2 text-slate-900 leading-relaxed border-r border-slate-300">{atp.tpStatement}</td>
                    <td className="p-2 text-slate-700 border-r border-slate-300 text-[11px]">
                      <strong>Konsep:</strong> {atp.coreConcept} <br />
                      <strong>Prasyarat:</strong> {atp.prerequisites || '-'}
                    </td>
                    <td className="p-2 text-center border-r border-slate-300 font-bold text-slate-900">
                      {atp.allocatedJp} JP
                    </td>
                    <td className="p-2 text-slate-700 leading-relaxed text-[11px]">{atp.evidenceOfAttainment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Program Tahunan (Prota) */}
        {protaPromes && protaPromes.protaList?.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                VI. Program Tahunan (Prota) Tahun Ajaran {schoolIdentity.academicYear}
              </h3>
              <span className="text-[11px] font-bold text-slate-700">
                Total Alokasi: {totalProtaJp} JP (Sem 1: {sem1Jp} JP • Sem 2: {sem2Jp} JP)
              </span>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2 w-12 text-center border-r border-slate-300">No.</th>
                    <th className="p-2 border-r border-slate-300">Alur Tujuan Pembelajaran (ATP) / Lingkup Materi</th>
                    <th className="p-2 w-28 text-center border-r border-slate-300">Semester</th>
                    <th className="p-2 w-32 text-center">Alokasi Waktu (JP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {protaPromes.protaList.map((item) => (
                    <tr key={item.no} className="align-top hover:bg-slate-50/50">
                      <td className="p-2 text-center font-bold text-slate-600 border-r border-slate-300">{item.no}.</td>
                      <td className="p-2 text-slate-900 border-r border-slate-300">
                        <p className="font-semibold">{item.atpContent}</p>
                        <span className="font-mono text-[10px] text-blue-700">
                          [{item.tpCode} • {item.grade} • {item.elementName}]
                        </span>
                      </td>
                      <td className="p-2 text-center border-r border-slate-300">
                        <span className="font-medium text-slate-800">Semester {item.semester}</span>
                      </td>
                      <td className="p-2 text-center font-bold text-slate-900">
                        {item.allocatedJp} JP
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                    <td colSpan={2} className="p-2 text-right border-r border-slate-300">
                      Total Alokasi Waktu 1 Tahun Pelajaran:
                    </td>
                    <td className="p-2 text-center border-r border-slate-300">1 Tahun</td>
                    <td className="p-2 text-center font-extrabold text-blue-900">{totalProtaJp} JP</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 7. Program Semester (Promes) - Sem 1 & 2 */}
        {promes1 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-3 py-1.5 rounded-sm">
              VII. Program Semester (Promes) Semester 1 (Ganjil) - {promes1.grade}
            </h3>

            <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2 w-24 border-r border-slate-300">Bulan</th>
                    <th className="p-2 w-24 text-center border-r border-slate-300">Minggu ke-</th>
                    <th className="p-2 border-r border-slate-300">Lingkup Materi / Tujuan Pembelajaran (TP)</th>
                    <th className="p-2 w-28 text-center border-r border-slate-300">Alokasi Waktu</th>
                    <th className="p-2 w-36">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {promes1.entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`align-top ${entry.isNonEffective ? 'bg-amber-50/50' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="p-2 font-bold text-slate-800 border-r border-slate-300">{entry.month || '”'}</td>
                      <td className="p-2 text-center font-mono font-semibold border-r border-slate-300">{entry.weeks}</td>
                      <td className="p-2 border-r border-slate-300">
                        <p className={entry.isNonEffective ? 'font-bold text-amber-950' : 'font-semibold text-slate-900'}>
                          {entry.contentScope}
                        </p>
                        {entry.tpCode && (
                          <span className="font-mono text-[10px] text-blue-700">{entry.tpCode}</span>
                        )}
                      </td>
                      <td className="p-2 text-center font-bold text-slate-900 border-r border-slate-300">
                        {entry.allocatedJp}
                      </td>
                      <td className="p-2 text-[11px] text-slate-700">{entry.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {promes2 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-3 py-1.5 rounded-sm">
              VIII. Program Semester (Promes) Semester 2 (Genap) - {promes2.grade}
            </h3>

            <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2 w-24 border-r border-slate-300">Bulan</th>
                    <th className="p-2 w-24 text-center border-r border-slate-300">Minggu ke-</th>
                    <th className="p-2 border-r border-slate-300">Lingkup Materi / Tujuan Pembelajaran (TP)</th>
                    <th className="p-2 w-28 text-center border-r border-slate-300">Alokasi Waktu</th>
                    <th className="p-2 w-36">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {promes2.entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`align-top ${entry.isNonEffective ? 'bg-amber-50/50' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="p-2 font-bold text-slate-800 border-r border-slate-300">{entry.month || '”'}</td>
                      <td className="p-2 text-center font-mono font-semibold border-r border-slate-300">{entry.weeks}</td>
                      <td className="p-2 border-r border-slate-300">
                        <p className={entry.isNonEffective ? 'font-bold text-amber-950' : 'font-semibold text-slate-900'}>
                          {entry.contentScope}
                        </p>
                        {entry.tpCode && (
                          <span className="font-mono text-[10px] text-blue-700">{entry.tpCode}</span>
                        )}
                      </td>
                      <td className="p-2 text-center font-bold text-slate-900 border-r border-slate-300">
                        {entry.allocatedJp}
                      </td>
                      <td className="p-2 text-[11px] text-slate-700">{entry.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. Peta Keterlacakan */}
        {traceability && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-3 py-1.5 rounded-sm">
              IX. Peta Keterlacakan (Traceability Matrix) CP → TP → ATP
            </h3>

            <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2.5 w-36 border-r border-slate-300">Elemen CP</th>
                    <th className="p-2.5 w-28 text-center border-r border-slate-300">Status</th>
                    <th className="p-2.5 w-36 border-r border-slate-300">Kode TP Pemenuh</th>
                    <th className="p-2.5">Catatan Validasi Ketercakupan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {traceability.traceability?.map((t, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="p-2.5 font-bold text-slate-900 border-r border-slate-300">{t.elementName}</td>
                      <td className="p-2.5 text-center font-bold border-r border-slate-300">
                        {t.coverageStatus === 'Terakomodasi' ? (
                          <span className="text-emerald-700">✓ Terakomodasi</span>
                        ) : (
                          <span className="text-amber-700">⚠ Perlu Ditinjau</span>
                        )}
                      </td>
                      <td className="p-2.5 font-mono text-blue-700 border-r border-slate-300">
                        {t.mappedTpCodes?.join(', ') || '-'}
                      </td>
                      <td className="p-2.5 text-slate-700 leading-relaxed">
                        {t.missingSubstances?.length
                          ? `Bagian belum terwadahi: ${t.missingSubstances.join('; ')}`
                          : t.recommendation || 'Seluruh substansi materi esensial telah terpenuhi secara memadai.'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Rekapitulasi Alokasi Waktu */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide bg-slate-100 px-3 py-1.5 rounded-sm">
            VII. Rekapitulasi Alokasi Waktu Pembelajaran
          </h3>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 block">Total JP Kurikulum Tersedia:</span>
                <span className="font-bold text-slate-900 text-sm">{timeCalc.totalAvailableJp} JP</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Menit Pembelajaran:</span>
                <span className="font-bold text-slate-900 text-sm">{timeCalc.totalAvailableMinutes} Menit</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total JP Teralokasi ke TP:</span>
                <span className="font-bold text-blue-900 text-sm">{timeCalc.allocatedJp} JP</span>
              </div>
              <div>
                <span className="text-slate-500 block">Sisa / Selisih Cadangan:</span>
                <span className={`font-bold text-sm ${timeCalc.remainingJp < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {timeCalc.remainingJp} JP
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                <strong>Alokasi Per Semester:</strong> Semester 1: {timeCalc.bySemester[1] || 0} JP | Semester 2:{' '}
                {timeCalc.bySemester[2] || 0} JP
              </div>
              <div>
                <strong>Distribusi Elemen:</strong>{' '}
                {Object.entries(timeCalc.byElement)
                  .map(([elem, jp]) => `${elem}: ${jp} JP`)
                  .join(' • ')}
              </div>
            </div>
          </div>
        </div>

        {/* Catatan Penelaahan Guru */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            Catatan Penelaahan Guru Pengampu / Review Kurikulum:
          </h3>
          <textarea
            rows={2}
            value={teacherNotes || ''}
            onChange={(e) => setTeacherNotes(e.target.value)}
            placeholder="Tuliskan catatan khusus penyesuaian, diferensiasi pembelajaran, atau rekomendasi asesmen..."
            className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Lembar Pengesahan */}
        <div className="pt-8 border-t border-slate-300 flex justify-between text-xs text-slate-800">
          <div className="text-center space-y-14">
            <p>
              Mengetahui, <br />
              Kepala {schoolIdentity.schoolName || 'Satuan Pendidikan'}
            </p>
            <div>
              <p className="font-bold underline">{schoolIdentity.principalName || '___________________________'}</p>
              <p className="text-slate-500">NIP. ___________________________</p>
            </div>
          </div>

          <div className="text-center space-y-14">
            <p>
              Ditetapkan di: ......................., 2025 <br />
              Guru Mata Pelajaran
            </p>
            <div>
              <p className="font-bold underline">{schoolIdentity.teacherName || '___________________________'}</p>
              <p className="text-slate-500">NIP. {schoolIdentity.nipTeacher || '___________________________'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
