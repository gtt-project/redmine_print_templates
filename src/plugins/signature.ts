import { ZOOM, Plugin, Schema } from '@pdfme/common';
import SignaturePad from 'signature_pad';
import { image } from '@pdfme/schemas';

interface Signature extends Schema {}

const getEffectiveScale = (element: HTMLElement | null) => {
  let scale = 1;
  while (element && element !== document.body) {
    const style = window.getComputedStyle(element);
    const transform = style.transform;
    if (transform && transform !== 'none') {
      const localScale = parseFloat(transform.match(/matrix\((.+)\)/)?.[1].split(', ')[3] || '1');
      scale *= localScale;
    }
    element = element.parentElement;
  }
  return scale;
};

export const signature: Plugin<Signature> = {
  ui: async (arg) => {
    const { schema, value, onChange, rootElement, mode, i18n } = arg;

    const canvas = document.createElement('canvas');
    canvas.width = schema.width * ZOOM;
    canvas.height = schema.height * ZOOM;
    const resetScale = 1 / getEffectiveScale(rootElement);
    canvas.getContext('2d')!.scale(resetScale, resetScale);

    const signaturePad = new SignaturePad(canvas);
    try {
      value ? signaturePad.fromDataURL(value, { ratio: resetScale }) : signaturePad.clear();
    } catch (e) {
      console.error(e);
    }

    if (mode === 'viewer') {
      signaturePad.off();
    } else {
      signaturePad.on();
      const clearButton = document.createElement('button');
      clearButton.style.position = 'absolute';
      clearButton.style.zIndex = '1';
      clearButton.textContent = i18n('clear') || 'x';
      clearButton.addEventListener('click', () => {
        onChange && onChange({ key: 'content', value: '' });
      });
      rootElement.appendChild(clearButton);
      signaturePad.addEventListener('endStroke', () => {
        const data = signaturePad.toDataURL('image/png');
        onChange && data && onChange({ key: 'content', value: data });
      });
    }
    rootElement.appendChild(canvas);
  },
  pdf: image.pdf,
  propPanel: {
    schema: {},
    defaultSchema: {
      type: 'signature',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square-pen"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>',
      content: '',
      position: { x: 0, y: 0 },
      width: 62.5,
      height: 37.5,
    },
  },
};
