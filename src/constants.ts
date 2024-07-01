import { Template, PDFME_VERSION } from '@pdfme/common';

export const supportedLocales = ['en', 'ja', 'ar', 'th', 'it', 'pl', 'zh', 'ko', 'de', 'es', 'fr'] as const;

export const defaultTemplate: Template = {
  basePdf: {
    width: 210,
    height: 297,
    padding: [0, 0, 0, 0]
  },
  schemas: [{} as Record<string, any>],
  pdfmeVersion: PDFME_VERSION
};

export const themeSettings = {
  token: {
    colorPrimary: '#f1515c'
  },
};
