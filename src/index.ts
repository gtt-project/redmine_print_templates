import { Template, BLANK_PDF } from '@pdfme/common';
import { Designer } from '@pdfme/ui';

const designerContainer = document.getElementById('pdfme-designer');
let designer: Designer | undefined;

document.getElementById('open-designer-fullscreen-btn').addEventListener('click', function() {
  const basepdfField = document.getElementById('print_template_basepdf') as HTMLInputElement;
  const basePdfValue = basepdfField.value ? basepdfField.value : BLANK_PDF;

  const template: Template = {
    basePdf: basePdfValue,
    schemas: [
      {
        a: {
          type: 'text',
          position: { x: 0, y: 0 },
          width: 10,
          height: 10,
        },
        b: {
          type: 'text',
          position: { x: 10, y: 10 },
          width: 10,
          height: 10,
        },
        c: {
          type: 'text',
          position: { x: 20, y: 20 },
          width: 10,
          height: 10,
        },
      },
    ],
  };

  if (designerContainer) {
    if (!designer) {
      designer = new Designer({
        domContainer: designerContainer,
        template: template,
      });
    } else {
      designer.updateTemplate(template);
    }
  }

  // Display the designer fullscreen
  document.getElementById('designer-fullscreen').style.display = 'block';
});
