import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle } from 'docx';
import * as XLSX from 'xlsx';
import { FullDocumentState, TimeCalculation } from '../types/curriculum';
import { getPhaseDetails, getSubjectRegulationRef } from '../data/curriculumPresets';
import { generateFullProtaPromes } from './protaPromesGenerator';

export function calculateTimeDistribution(
  learningIdentity: FullDocumentState['learningIdentity'],
  tpList: FullDocumentState['tpList'] = []
): TimeCalculation {
  const effectiveWeeks = Number(learningIdentity.effectiveWeeksPerSemester) || 18;
  const jpPerWeek = Number(learningIdentity.jpPerWeek) || 3;
  const minutesPerJp = Number(learningIdentity.minutesPerJp) || 40;

  const phaseDetails = getPhaseDetails(learningIdentity.fase, learningIdentity.yearsOfStudy === 4);
  const totalSemesters = phaseDetails.totalSemesters;

  const totalAvailableJp = effectiveWeeks * jpPerWeek * totalSemesters;
  const totalAvailableMinutes = totalAvailableJp * minutesPerJp;

  let allocatedJp = 0;
  const byElement: Record<string, number> = {};
  const byGrade: Record<string, number> = {};
  const bySemester: Record<string, number> = {};

  tpList.forEach((tp) => {
    const jp = Number(tp.recommendedJp) || 0;
    allocatedJp += jp;
    byElement[tp.elementName] = (byElement[tp.elementName] || 0) + jp;

    const grade = tp.suggestedGrade || 'Kelas';
    byGrade[grade] = (byGrade[grade] || 0) + jp;

    const semKey = `${grade} - Sem ${tp.suggestedSemester || 1}`;
    bySemester[semKey] = (bySemester[semKey] || 0) + jp;
  });

  const allocatedMinutes = allocatedJp * minutesPerJp;
  const remainingJp = totalAvailableJp - allocatedJp;
  const isOverAllocated = allocatedJp > totalAvailableJp;

  return {
    effectiveWeeks,
    jpPerWeek,
    minutesPerJp,
    totalSemesters,
    totalAvailableJp,
    totalAvailableMinutes,
    allocatedJp,
    allocatedMinutes,
    remainingJp,
    isOverAllocated,
    byElement,
    byGrade,
    bySemester,
  };
}

// DOCX Generator
export async function exportToDocx(state: FullDocumentState) {
  const { schoolIdentity, learningIdentity, elements, analysis, tpList = [], atpResult, traceability } = state;
  const timeCalc = calculateTimeDistribution(learningIdentity, tpList);
  const phaseDetails = getPhaseDetails(learningIdentity.fase);

  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: '888888' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: '888888' },
    left: { style: BorderStyle.SINGLE, size: 1, color: '888888' },
    right: { style: BorderStyle.SINGLE, size: 1, color: '888888' },
  };

  const createCell = (text: string, isHeader = false, widthPct = 20) => {
    return new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      borders: cellBorder,
      shading: isHeader ? { fill: 'E2E8F0' } : undefined,
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: text || '-',
              bold: isHeader,
              size: isHeader ? 20 : 18,
            }),
          ],
        }),
      ],
    });
  };

  // Section 1: Identity Table
  const identityRows = [
    new TableRow({
      children: [
        createCell('Nama Satuan Pendidikan', true, 30),
        createCell(schoolIdentity.schoolName || 'Sekolah', false, 70),
      ],
    }),
    new TableRow({
      children: [
        createCell('Mata Pelajaran', true, 30),
        createCell(learningIdentity.subjectName || '-', false, 70),
      ],
    }),
    new TableRow({
      children: [
        createCell('Jenjang & Fase Perencanaan', true, 30),
        createCell(
          `${learningIdentity.jenjang} • ${learningIdentity.fase} (${phaseDetails.durationYears} Tahun / ${phaseDetails.totalSemesters} Semester Penuh)`,
          false,
          70
        ),
      ],
    }),
    new TableRow({
      children: [
        createCell('Tahun Pelajaran & Kurikulum', true, 30),
        createCell(`${schoolIdentity.academicYear} • ${schoolIdentity.curriculum}`, false, 70),
      ],
    }),
    new TableRow({
      children: [
        createCell('Penyusun / Guru Pengampu', true, 30),
        createCell(schoolIdentity.teacherName || '-', false, 70),
      ],
    }),
    new TableRow({
      children: [
        createCell('Alokasi Waktu Fase Penuh', true, 30),
        createCell(
          `${learningIdentity.jpPerWeek} JP/Minggu @ ${learningIdentity.minutesPerJp} Menit • ${learningIdentity.effectiveWeeksPerSemester} Minggu/Semester • ${timeCalc.totalSemesters} Semester (Total: ${timeCalc.totalAvailableJp} JP)`,
          false,
          70
        ),
      ],
    }),
  ];

  // Section 2: CP Elements Table
  const cpHeaderRow = new TableRow({
    children: [
      createCell('No', true, 8),
      createCell('Elemen', true, 27),
      createCell('Capaian Pembelajaran (CP) Resmi Fase', true, 65),
    ],
  });

  const cpRows = elements.map((elem, idx) => {
    return new TableRow({
      children: [
        createCell(String(idx + 1), false, 8),
        createCell(elem.elementName, true, 27),
        createCell(elem.cpText, false, 65),
      ],
    });
  });

  // Section 3: TP Table
  const tpHeaderRow = new TableRow({
    children: [
      createCell('No', true, 6),
      createCell('Kode TP', true, 14),
      createCell('Kelas / Semester', true, 16),
      createCell('Elemen', true, 16),
      createCell('Rumusan Tujuan Pembelajaran (TP)', true, 36),
      createCell('Waktu', true, 12),
    ],
  });

  const tpRows = tpList.map((tp, idx) => {
    return new TableRow({
      children: [
        createCell(String(idx + 1), false, 6),
        createCell(tp.code, true, 14),
        createCell(`${tp.suggestedGrade}\nSem ${tp.suggestedSemester}`, false, 16),
        createCell(tp.elementName, false, 16),
        createCell(`${tp.tpStatement}\n\n[Kompetensi: ${tp.competency} | Materi: ${tp.contentScope}]`, false, 36),
        createCell(`${tp.recommendedJp} JP`, true, 12),
      ],
    });
  });

  // Section 4: ATP Table
  const atpItems = atpResult?.atpList || [];
  const atpHeaderRow = new TableRow({
    children: [
      createCell('Urutan', true, 8),
      createCell('Alur Sem.', true, 10),
      createCell('Kode TP', true, 12),
      createCell('Kelas / Sem.', true, 14),
      createCell('Tujuan Pembelajaran (TP)', true, 32),
      createCell('Waktu', true, 8),
      createCell('Bukti Ketercapaian (IKTP)', true, 16),
    ],
  });

  const atpRows = atpItems.map((atp) => {
    return new TableRow({
      children: [
        createCell(String(atp.order), true, 8),
        createCell(atp.semesterOrder || '-', true, 10),
        createCell(atp.tpCode, false, 12),
        createCell(`${atp.grade}\nSem ${atp.semester}`, false, 14),
        createCell(`${atp.tpStatement}\n\nKonsep: ${atp.coreConcept}\nPrasyarat: ${atp.prerequisites || '-'}`, false, 32),
        createCell(`${atp.allocatedJp} JP`, false, 8),
        createCell(atp.evidenceOfAttainment, false, 16),
      ],
    });
  });

  // Section 5: Traceability Table
  const traceItems = traceability?.traceability || [];
  const traceHeaderRow = new TableRow({
    children: [
      createCell('Elemen CP', true, 25),
      createCell('Status Ketercakupan', true, 20),
      createCell('Kode TP Pemenuh', true, 25),
      createCell('Catatan / Keterangan', true, 30),
    ],
  });

  const traceRows = traceItems.map((t) => {
    return new TableRow({
      children: [
        createCell(t.elementName, true, 25),
        createCell(t.coverageStatus, false, 20),
        createCell(t.mappedTpCodes?.join(', ') || '-', false, 25),
        createCell(
          t.missingSubstances?.length
            ? `Belum terwadahi: ${t.missingSubstances.join('; ')}`
            : t.recommendation || 'Seluruh substansi materi esensial fase telah terpenuhi.',
          false,
          30
        ),
      ],
    });
  });

  // Section 6: Program Tahunan (Prota)
  const protaPromes = state.protaPromes || generateFullProtaPromes(atpItems, learningIdentity, schoolIdentity);
  const protaHeaderRow = new TableRow({
    children: [
      createCell('No.', true, 8),
      createCell('Alur Tujuan Pembelajaran (ATP) / Lingkup Materi', true, 60),
      createCell('Semester', true, 16),
      createCell('Alokasi Waktu (JP)', true, 16),
    ],
  });
  const protaRows = (protaPromes.protaList || []).map((item) => {
    return new TableRow({
      children: [
        createCell(String(item.no), true, 8),
        createCell(`${item.atpContent}\n[${item.tpCode} • ${item.grade}]`, false, 60),
        createCell(`Semester ${item.semester}`, false, 16),
        createCell(`${item.allocatedJp} JP`, false, 16),
      ],
    });
  });

  // Section 7 & 8: Program Semester (Promes)
  const promes1 = protaPromes.promesList.find((p) => p.semester === 1);
  const promes1HeaderRow = new TableRow({
    children: [
      createCell('Bulan', true, 15),
      createCell('Minggu ke-', true, 15),
      createCell('Lingkup Materi / Tujuan Pembelajaran (TP)', true, 42),
      createCell('Alokasi Waktu', true, 13),
      createCell('Keterangan', true, 15),
    ],
  });
  const promes1Rows = (promes1?.entries || []).map((entry) => {
    return new TableRow({
      children: [
        createCell(entry.month || '-', false, 15),
        createCell(entry.weeks, false, 15),
        createCell(entry.contentScope + (entry.tpCode ? ` (${entry.tpCode})` : ''), false, 42),
        createCell(String(entry.allocatedJp), false, 13),
        createCell(entry.notes, false, 15),
      ],
    });
  });

  const promes2 = protaPromes.promesList.find((p) => p.semester === 2);
  const promes2HeaderRow = new TableRow({
    children: [
      createCell('Bulan', true, 15),
      createCell('Minggu ke-', true, 15),
      createCell('Lingkup Materi / Tujuan Pembelajaran (TP)', true, 42),
      createCell('Alokasi Waktu', true, 13),
      createCell('Keterangan', true, 15),
    ],
  });
  const promes2Rows = (promes2?.entries || []).map((entry) => {
    return new TableRow({
      children: [
        createCell(entry.month || '-', false, 15),
        createCell(entry.weeks, false, 15),
        createCell(entry.contentScope + (entry.tpCode ? ` (${entry.tpCode})` : ''), false, 42),
        createCell(String(entry.allocatedJp), false, 13),
        createCell(entry.notes, false, 15),
      ],
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'DOKUMEN PERENCANAAN PEMBELAJARAN SATU FASE PENUH',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: 'TUJUAN PEMBELAJARAN (TP) DAN ALUR TUJUAN PEMBELAJARAN (ATP)',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Jenjang ${learningIdentity.jenjang} • ${learningIdentity.fase} (${phaseDetails.durationYears} Tahun / ${phaseDetails.totalSemesters} Semester) • Rujukan Regulasi: ${getSubjectRegulationRef(learningIdentity.subjectName)}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),

          // 1. Identitas
          new Paragraph({ text: 'I. IDENTITAS PEMBELAJARAN', heading: HeadingLevel.HEADING_2 }),
          new Table({ rows: identityRows, width: { size: 100, type: WidthType.PERCENTAGE } }),
          new Paragraph({ text: '' }),

          // 2. CP Per Elemen
          new Paragraph({ text: 'II. CAPAIAN PEMBELAJARAN (CP) PER ELEMEN', heading: HeadingLevel.HEADING_2 }),
          new Table({ rows: [cpHeaderRow, ...cpRows], width: { size: 100, type: WidthType.PERCENTAGE } }),
          new Paragraph({ text: '' }),

          // 3. Analisis CP
          new Paragraph({ text: 'III. HASIL ANALISIS CP FASE', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            children: [
              new TextRun({
                text: analysis?.curriculumCoverageSummary || 'Analisis ketercakupan CP fase telah diintegrasikan pada perumusan TP.',
                italics: true,
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // 4. Tabel TP
          new Paragraph({
            text: `IV. TUJUAN PEMBELAJARAN (TP) SELURUH FASE (${phaseDetails.durationYears} TAHUN / ${phaseDetails.totalSemesters} SEMESTER)`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Table({ rows: [tpHeaderRow, ...tpRows], width: { size: 100, type: WidthType.PERCENTAGE } }),
          new Paragraph({ text: '' }),

          // 5. Tabel ATP
          new Paragraph({
            text: `V. ALUR TUJUAN PEMBELAJARAN (ATP) TERPADU SELURUH SEMESTER`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Table({ rows: [atpHeaderRow, ...atpRows], width: { size: 100, type: WidthType.PERCENTAGE } }),
          new Paragraph({ text: '' }),

          // 6. Program Tahunan (Prota)
          new Paragraph({
            text: `VI. PROGRAM TAHUNAN (PROTA) TAHUN AJARAN ${schoolIdentity.academicYear || '2025/2026'}`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Table({ rows: [protaHeaderRow, ...protaRows], width: { size: 100, type: WidthType.PERCENTAGE } }),
          new Paragraph({ text: '' }),

          // 7. Program Semester 1 (Promes)
          new Paragraph({
            text: `VII. PROGRAM SEMESTER (PROMES) SEMESTER 1 (GANJIL) - ${promes1?.grade || learningIdentity.grade}`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Table({ rows: [promes1HeaderRow, ...promes1Rows], width: { size: 100, type: WidthType.PERCENTAGE } }),
          new Paragraph({ text: '' }),

          // 8. Program Semester 2 (Promes)
          new Paragraph({
            text: `VIII. PROGRAM SEMESTER (PROMES) SEMESTER 2 (GENAP) - ${promes2?.grade || learningIdentity.grade}`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Table({ rows: [promes2HeaderRow, ...promes2Rows], width: { size: 100, type: WidthType.PERCENTAGE } }),
          new Paragraph({ text: '' }),

          // 9. Matriks Keterlacakan
          new Paragraph({ text: 'IX. PETA KETERLACAKAN CP → TP → ATP', heading: HeadingLevel.HEADING_2 }),
          new Table({ rows: [traceHeaderRow, ...traceRows], width: { size: 100, type: WidthType.PERCENTAGE } }),
          new Paragraph({ text: '' }),

          // 10. Rekap Waktu
          new Paragraph({ text: 'X. REKAPITULASI ALOKASI WAKTU', heading: HeadingLevel.HEADING_2 }),
          new Paragraph({
            text: `Total JP Fase Tersedia: ${timeCalc.totalAvailableJp} JP (${timeCalc.totalAvailableMinutes} menit) | Total JP Teralokasi: ${timeCalc.allocatedJp} JP | Sisa/Cadangan: ${timeCalc.remainingJp} JP`,
          }),
          new Paragraph({ text: '' }),

          // Lembar Pengesahan
          new Paragraph({ text: 'Mengetahui,', alignment: AlignmentType.RIGHT }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Kepala Sekolah: ____________________          Guru Pengampu: ${schoolIdentity.teacherName || '____________________'}`,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `TP_dan_ATP_${learningIdentity.subjectName.replace(/\s+/g, '_')}_${learningIdentity.fase.replace(/\s+/g, '_')}_Lengkap.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// XLSX Generator
export function exportToXlsx(state: FullDocumentState) {
  const { schoolIdentity, learningIdentity, elements, tpList = [], atpResult, traceability } = state;
  const phaseDetails = getPhaseDetails(learningIdentity.fase);
  const wb = XLSX.utils.book_new();

  // Sheet 1: Identitas & CP
  const identitasData = [
    ['SMART TP & ATP GENERATOR MULTIJENJANG DAN PROTA PROSEMNYA - By. Asep SF'],
    ['PERENCANAAN SATU FASE PENUH (SEMUA KELAS & SEMESTER)'],
    [''],
    ['Satuan Pendidikan', schoolIdentity.schoolName],
    ['Mata Pelajaran', learningIdentity.subjectName],
    ['Jenjang / Fase', `${learningIdentity.jenjang} / ${learningIdentity.fase} (${phaseDetails.durationYears} Tahun / ${phaseDetails.totalSemesters} Semester)`],
    ['Tahun Pelajaran', schoolIdentity.academicYear],
    ['Guru Pengampu', schoolIdentity.teacherName],
    ['Rujukan Dokumen CP', getSubjectRegulationRef(learningIdentity.subjectName)],
    ['Alokasi Waktu', `${learningIdentity.jpPerWeek} JP/Minggu @ ${learningIdentity.minutesPerJp} Menit`],
    [''],
    ['NO', 'NAMA ELEMEN', 'CAPAIAN PEMBELAJARAN (CP) RESMI'],
    ...elements.map((el, i) => [i + 1, el.elementName, el.cpText]),
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(identitasData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Identitas & CP');

  // Sheet 2: TP
  const tpData = [
    [
      'NO',
      'KODE TP',
      'KELAS',
      'SEMESTER',
      'GLOBAL SEM',
      'ELEMEN',
      'RUMUSAN TUJUAN PEMBELAJARAN (TP)',
      'KOMPETENSI',
      'LINGKUP MATERI',
      'KEDALAMAN',
      'ALOKASI JP',
    ],
    ...tpList.map((tp, i) => [
      i + 1,
      tp.code,
      tp.suggestedGrade,
      tp.suggestedSemester,
      tp.globalSemester || '-',
      tp.elementName,
      tp.tpStatement,
      tp.competency,
      tp.contentScope,
      tp.depthLevel,
      tp.recommendedJp,
    ]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(tpData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Tujuan Pembelajaran (TP)');

  // Sheet 3: ATP
  const atpData = [
    [
      'URUTAN FASE',
      'ALUR SEMESTER',
      'KODE TP',
      'KELAS',
      'SEMESTER',
      'ELEMEN',
      'TUJUAN PEMBELAJARAN (TP)',
      'KONSEP INTI',
      'PRASYARAT',
      'ALOKASI JP',
      'BUKTI KETERCAPAIAN (IKTP)',
    ],
    ...(atpResult?.atpList || []).map((atp) => [
      atp.order,
      atp.semesterOrder || '-',
      atp.tpCode,
      atp.grade,
      atp.semester,
      atp.elementName,
      atp.tpStatement,
      atp.coreConcept,
      atp.prerequisites,
      atp.allocatedJp,
      atp.evidenceOfAttainment,
    ]),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(atpData);
  XLSX.utils.book_append_sheet(wb, ws3, 'ATP Terpadu');

  // Sheet 4: Program Tahunan (Prota)
  const protaPromes = state.protaPromes || generateFullProtaPromes(atpResult?.atpList || [], learningIdentity, schoolIdentity);
  const protaData = [
    ['PROGRAM TAHUNAN (PROTA)'],
    ['Satuan Pendidikan: ' + schoolIdentity.schoolName],
    ['Mata Pelajaran: ' + learningIdentity.subjectName],
    ['Tahun Ajaran: ' + schoolIdentity.academicYear],
    [''],
    ['NO', 'ALUR TUJUAN PEMBELAJARAN (ATP) / LINGKUP MATERI', 'SEMESTER', 'ALOKASI WAKTU (JP)'],
    ...(protaPromes.protaList || []).map((p) => [
      p.no,
      p.atpContent,
      `Semester ${p.semester}`,
      `${p.allocatedJp} JP`,
    ]),
  ];
  const wsProta = XLSX.utils.aoa_to_sheet(protaData);
  XLSX.utils.book_append_sheet(wb, wsProta, 'Program Tahunan (Prota)');

  // Sheet 5: Promes Sem 1
  const promes1 = protaPromes.promesList.find((p) => p.semester === 1);
  const promes1Data = [
    ['PROGRAM SEMESTER (PROMES) SEMESTER 1 (GANJIL)'],
    ['Satuan Pendidikan: ' + schoolIdentity.schoolName],
    ['Mata Pelajaran: ' + learningIdentity.subjectName],
    ['Kelas / Fase: ' + (promes1?.grade || learningIdentity.grade)],
    ['Tahun Ajaran: ' + schoolIdentity.academicYear],
    [''],
    ['BULAN', 'MINGGU KE-', 'LINGKUP MATERI / TUJUAN PEMBELAJARAN (TP)', 'ALOKASI WAKTU (JP)', 'KETERANGAN'],
    ...(promes1?.entries || []).map((e) => [
      e.month || '-',
      e.weeks,
      e.contentScope,
      e.allocatedJp,
      e.notes,
    ]),
  ];
  const wsPromes1 = XLSX.utils.aoa_to_sheet(promes1Data);
  XLSX.utils.book_append_sheet(wb, wsPromes1, 'Promes Sem 1 (Ganjil)');

  // Sheet 6: Promes Sem 2
  const promes2 = protaPromes.promesList.find((p) => p.semester === 2);
  const promes2Data = [
    ['PROGRAM SEMESTER (PROMES) SEMESTER 2 (GENAP)'],
    ['Satuan Pendidikan: ' + schoolIdentity.schoolName],
    ['Mata Pelajaran: ' + learningIdentity.subjectName],
    ['Kelas / Fase: ' + (promes2?.grade || learningIdentity.grade)],
    ['Tahun Ajaran: ' + schoolIdentity.academicYear],
    [''],
    ['BULAN', 'MINGGU KE-', 'LINGKUP MATERI / TUJUAN PEMBELAJARAN (TP)', 'ALOKASI WAKTU (JP)', 'KETERANGAN'],
    ...(promes2?.entries || []).map((e) => [
      e.month || '-',
      e.weeks,
      e.contentScope,
      e.allocatedJp,
      e.notes,
    ]),
  ];
  const wsPromes2 = XLSX.utils.aoa_to_sheet(promes2Data);
  XLSX.utils.book_append_sheet(wb, wsPromes2, 'Promes Sem 2 (Genap)');

  // Sheet 7: Keterlacakan
  const traceData = [
    ['ELEMEN CP', 'STATUS KETERCAKUPAN', 'KODE TP PEMENUHAN', 'SUBSTANSI BELUM TERWADAHI', 'REKOMENDASI AUDIT'],
    ...(traceability?.traceability || []).map((t) => [
      t.elementName,
      t.coverageStatus,
      t.mappedTpCodes?.join(', ') || '-',
      t.missingSubstances?.join('; ') || 'Tidak ada (Lengkap)',
      t.recommendation || '-',
    ]),
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(traceData);
  XLSX.utils.book_append_sheet(wb, ws4, 'Peta Keterlacakan');

  XLSX.writeFile(
    wb,
    `TP_dan_ATP_${learningIdentity.subjectName.replace(/\s+/g, '_')}_${learningIdentity.fase.replace(/\s+/g, '_')}_Lengkap.xlsx`
  );
}

// Copy Table as Markdown
export async function copyTableToClipboard(tpList: FullDocumentState['tpList'] = []) {
  const header = `| No | Kode TP | Kelas | Semester | Elemen | Tujuan Pembelajaran (TP) | Kompetensi | Lingkup Materi | JP |\n|---|---|---|---|---|---|---|---|---|`;
  const rows = tpList
    .map(
      (tp, i) =>
        `| ${i + 1} | ${tp.code} | ${tp.suggestedGrade} | Sem ${tp.suggestedSemester} | ${tp.elementName} | ${tp.tpStatement} | ${tp.competency} | ${tp.contentScope} | ${tp.recommendedJp} JP |`
    )
    .join('\n');
  const markdown = `${header}\n${rows}`;
  await navigator.clipboard.writeText(markdown);
}
