const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');

async function mergePDFs(fileGroup) {
    const mergedPdf = await PDFDocument.create();

    for (const file of fileGroup) {
        const pdfBytes = fs.readFileSync(path.join('pdffiles', file));
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return mergedPdf.save();
}

gulp.task('merge-pdfs', async function () {
    const folderPath = 'pdffiles';
    const outputFolder = 'merged';

    // merged klasörünü kontrol et, yoksa oluştur
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }

    let files = fs.readdirSync(folderPath);
    let fileGroups = {};

    files.forEach(file => {
        if (file.endsWith('.pdf')) {
            let baseName = file.replace(/ \(\d+\)\.pdf$/, '.pdf');
            if (!fileGroups[baseName]) {
                fileGroups[baseName] = [];
            }
            fileGroups[baseName].push(file);
        }
    });

    for (let group in fileGroups) {
        const mergedPdfFile = await mergePDFs(fileGroups[group]);
        fs.writeFileSync(path.join(outputFolder, group), mergedPdfFile);
    }
});

gulp.task('default', gulp.series('merge-pdfs'));
