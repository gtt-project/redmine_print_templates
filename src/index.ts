import { Template, BLANK_PDF } from '@pdfme/common';
import { Designer } from '@pdfme/ui';

const blankTemplate: Template = {
  basePdf: BLANK_PDF,
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

const designerContainer = document.getElementById('pdfme-designer');

if (designerContainer) {
  const designer = new Designer({
    domContainer: designerContainer,
    template: blankTemplate,
  });

  // Workaround until https://github.com/pdfme/pdfme/pull/280 is available.
  // Find the closest parent form of the designerContainer
  // const form = designerContainer.closest('form');

  // if (form) {
  //   // Prevent form submission
  //   form.addEventListener('submit', function(event) {
  //     event.preventDefault();
  //   });
  // }
}
