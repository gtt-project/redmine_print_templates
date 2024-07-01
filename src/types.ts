import { Template } from '@pdfme/common';
import { Form, Viewer } from '@pdfme/ui';
import { supportedLocales } from './constants';

// Common Options Interfaces
export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldKeyOption {
  label: string;
  options: FieldOption[];
}

export interface CommonOptions {
  locale?: string;
  fieldKeyOptions?: FieldKeyOption[];
  fieldFormatOptions?: FieldOption[];
}

// Plugin Options Interface
export interface PluginOptions extends CommonOptions {
  fieldKeyOptions: FieldKeyOption[];
  fieldFormatOptions: FieldOption[];
}

// Designer Options Interface
export interface DesignerOptions extends CommonOptions {
  container: HTMLElement | null;
  template?: Template;
}

// Form Options Interface
export interface FormOptions extends CommonOptions {
  container: HTMLElement | null;
  template?: Template;
  inputs?: { [key: string]: any };
  editing?: boolean;
}

// Generator Options Interface
export interface GeneratorOptions extends CommonOptions {
  instance: Form | Viewer;
  options?: { [key: string]: any };
  download?: boolean;
}

// Supported Locales
export type SupportedLocale = typeof supportedLocales[number];

