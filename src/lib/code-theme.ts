import type { ThemeRegistrationRaw } from 'shiki';

/**
 * Shiki theme matching the grimoire palette. Deliberately narrow: five
 * colours doing the work of thirty, because a code listing in a reference
 * book is read, not skimmed.
 */
export const grimoireCodeTheme: ThemeRegistrationRaw = {
  name: 'grimoire',
  type: 'dark',
  colors: {
    'editor.background': '#0e0f11',
    'editor.foreground': '#cfd2d6',
  },
  settings: [
    { settings: { foreground: '#cfd2d6', background: '#0e0f11' } },
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.quoted.docstring'],
      settings: { foreground: '#5c6168', fontStyle: 'italic' },
    },
    {
      scope: [
        'keyword',
        'keyword.control',
        'keyword.operator.logical',
        'keyword.operator.expression',
        'storage',
        'storage.type',
        'storage.modifier',
        'constant.language',
        'variable.language.special',
        'variable.language.self',
      ],
      settings: { foreground: '#b39ddb' },
    },
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call.generic',
        'entity.name.function.decorator',
        'meta.decorator',
      ],
      settings: { foreground: '#e0a86a' },
    },
    {
      scope: ['constant.numeric', 'constant.character', 'constant.other'],
      settings: { foreground: '#e0a86a' },
    },
    {
      scope: ['string', 'string.quoted', 'constant.character.escape'],
      settings: { foreground: '#8fbf9f' },
    },
    {
      scope: [
        'support.type',
        'support.class',
        'entity.name.type',
        'entity.name.class',
        'entity.other.inherited-class',
      ],
      settings: { foreground: '#8fbf9f' },
    },
    {
      scope: ['variable.parameter', 'meta.function.parameters'],
      settings: { foreground: '#cfd2d6' },
    },
    {
      scope: ['punctuation', 'meta.brace', 'keyword.operator'],
      settings: { foreground: '#79808a' },
    },
  ],
};
