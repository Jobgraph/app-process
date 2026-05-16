import type { DocumentType, ExtractionResult, ExtractedField, Confidence } from './types';

function field(key: string, label: string, value: string, confidence: Confidence): ExtractedField {
  return { key, label, value, confidence };
}

function invoiceResult(): ExtractionResult {
  return {
    documentType: 'invoice',
    documentTypeLabel: 'Invoice',
    fields: [
      field('vendor', 'Vendor', 'Acme Solutions Ltd', 'high'),
      field('invoice_number', 'Invoice Number', 'INV-2024-0847', 'high'),
      field('date', 'Date', '2024-05-03', 'high'),
      field('due_date', 'Due Date', '2024-06-02', 'high'),
      field('line_items', 'Line Items', 'Consulting services x 40hrs @ £100/hr; Travel expenses', 'medium'),
      field('subtotal', 'Subtotal', '£4,250.00', 'high'),
      field('tax', 'Tax (VAT 20%)', '£850.00', 'high'),
      field('total', 'Total', '£5,100.00', 'high'),
      field('payment_terms', 'Payment Terms', 'Net 30', 'medium'),
      field('status', 'Status', 'Unpaid', 'medium'),
    ],
  };
}

function contractResult(): ExtractionResult {
  return {
    documentType: 'contract',
    documentTypeLabel: 'Contract',
    fields: [
      field('parties', 'Parties', 'Acme Corp & Beta Industries Ltd', 'high'),
      field('effective_date', 'Effective Date', '2024-01-15', 'high'),
      field('term', 'Term', '24 months with auto-renewal', 'high'),
      field('governing_law', 'Governing Law', 'England and Wales', 'medium'),
      field('confidentiality', 'Confidentiality Clause', 'Mutual NDA, 3-year survival period', 'medium'),
      field('termination', 'Termination Clause', '90 days written notice; immediate for material breach', 'high'),
      field('liability', 'Liability Cap', 'Limited to 12 months of fees paid', 'medium'),
      field('signatures', 'Signatures', 'J. Smith (Acme), R. Chen (Beta) — both dated 2024-01-15', 'low'),
    ],
  };
}

function emailResult(): ExtractionResult {
  return {
    documentType: 'email',
    documentTypeLabel: 'Email',
    fields: [
      field('from', 'From', 'sarah.jones@example.com', 'high'),
      field('to', 'To', 'team@example.com', 'high'),
      field('cc', 'CC', 'manager@example.com', 'high'),
      field('date', 'Date', '2024-05-10 09:34 UTC', 'high'),
      field('subject', 'Subject', 'Q2 Planning — Action Items', 'high'),
      field('priority', 'Priority', 'High', 'medium'),
      field('sentiment', 'Sentiment', 'Neutral / Professional', 'medium'),
      field('key_actions', 'Key Actions', 'Submit budget by May 15; Schedule review meeting; Update roadmap', 'medium'),
      field('attachments', 'Attachments', 'Q2_Budget_Template.xlsx', 'low'),
    ],
  };
}

function cvResult(): ExtractionResult {
  return {
    documentType: 'cv',
    documentTypeLabel: 'CV / Resume',
    fields: [
      field('full_name', 'Full Name', 'Alexandra Chen', 'high'),
      field('email', 'Email', 'a.chen@email.com', 'high'),
      field('phone', 'Phone', '+44 7700 900123', 'high'),
      field('location', 'Location', 'London, United Kingdom', 'high'),
      field('current_role', 'Current Role', 'Senior Software Engineer at TechCo', 'high'),
      field('years_experience', 'Years of Experience', '8 years', 'medium'),
      field('education', 'Education', 'MSc Computer Science, Imperial College London (2016)', 'high'),
      field('key_skills', 'Key Skills', 'TypeScript, React, Node.js, AWS, Python, PostgreSQL', 'medium'),
      field('languages', 'Languages', 'English (native), Mandarin (fluent), French (intermediate)', 'medium'),
    ],
  };
}

function generalResult(input: string): ExtractionResult {
  const wordCount = input.trim().split(/\s+/).length;
  const hasDate = /\d{4}[-/]\d{2}[-/]\d{2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(input);
  const hasEmail = /@/.test(input);
  const hasCurrency = /[$£€¥]|USD|GBP|EUR/.test(input);

  return {
    documentType: 'general',
    documentTypeLabel: 'General Document',
    fields: [
      field('doc_type_detected', 'Detected Type', 'Unstructured text document', 'medium'),
      field('word_count', 'Word Count', String(wordCount), 'high'),
      field('language', 'Language', 'English', 'high'),
      field('contains_dates', 'Contains Dates', hasDate ? 'Yes' : 'No', 'high'),
      field('contains_emails', 'Contains Email Addresses', hasEmail ? 'Yes' : 'No', 'high'),
      field('contains_currency', 'Contains Currency Values', hasCurrency ? 'Yes' : 'No', 'high'),
      field('summary', 'Summary', input.slice(0, 120).trim() + (input.length > 120 ? '...' : ''), 'medium'),
      field('key_entities', 'Key Entities', 'Unable to determine without NLP backend', 'low'),
    ],
  };
}

export function getMockExtraction(input: string, template: DocumentType): ExtractionResult {
  switch (template) {
    case 'invoice':
      return invoiceResult();
    case 'contract':
      return contractResult();
    case 'email':
      return emailResult();
    case 'cv':
      return cvResult();
    case 'general':
      return generalResult(input);
  }
}
