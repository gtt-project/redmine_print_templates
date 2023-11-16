import { Template, BLANK_PDF } from '@pdfme/common';
import { Designer } from '@pdfme/ui';

document.addEventListener("DOMContentLoaded", function() {
  const designerContainer = document.getElementById('pdfme-designer') as HTMLElement;
  const basepdfField = document.getElementById('print_template_basepdf') as HTMLInputElement;
  const schemasField = document.getElementById('print_template_schemas') as HTMLInputElement;

  let designer: Designer | undefined;
  let currentSchemas = schemasField.value ? JSON.parse(schemasField.value) : [];

  const openBtn = document.getElementById('open-designer-fullscreen-btn');
  const closeBtn = document.getElementById('close-designer-fullscreen-btn');
  const designerFullscreen = document.getElementById('designer-fullscreen');
  const uploadField = document.getElementById('pdf-upload') as HTMLInputElement | null;
  const useBlankPdfLink = document.getElementById('use-blank-pdf');

  openBtn?.addEventListener('click', function() {
    const basePdfValue = basepdfField.value ? basepdfField.value : BLANK_PDF;

    const template: Template = {
      basePdf: basePdfValue,
      schemas: currentSchemas
    };

    if (!designer && designerContainer) {
      designer = new Designer({
        domContainer: designerContainer,
        template: template
      });
      designer.onChangeTemplate((updatedTemplate) => {
        currentSchemas = updatedTemplate.schemas;
        schemasField.value = JSON.stringify(currentSchemas);
      });
    } else {
      designer?.updateTemplate(template);
    }

    designerFullscreen.style.display = 'block';
  });

  closeBtn?.addEventListener('click', function() {
    designerFullscreen.style.display = 'none';
    schemasField.value = JSON.stringify(currentSchemas);
  });

  useBlankPdfLink?.addEventListener('click', function(event) {
    event.preventDefault();
    basepdfField.value = '';
    if (uploadField) uploadField.value = '';
    toggleBasePDFControls();
  });

  uploadField?.addEventListener('change', function() {
    if (this instanceof HTMLInputElement) {
      encodeBasePDF(this);
    }
  });
});

function encodeBasePDF(input: HTMLInputElement) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const encodedPDF = e.target.result as string;
      const basepdfField = document.getElementById('print_template_basepdf') as HTMLInputElement | null;
      if (basepdfField) {
        basepdfField.value = encodedPDF;
      }
      toggleBasePDFControls();
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function toggleBasePDFControls() {
  const basepdfField = document.getElementById('print_template_basepdf') as HTMLInputElement | null;
  const basepdfIcon = document.getElementById('basepdf-ok-icon');
  const useBlankPdfLink = document.getElementById('use-blank-pdf');

  if (basepdfField && basepdfField.value) {
    basepdfIcon.style.display = 'inline';
    useBlankPdfLink.style.display = 'inline';
  } else {
    basepdfIcon.style.display = 'none';
    useBlankPdfLink.style.display = 'none';
  }
}
