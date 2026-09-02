const POLAR_FAQS = [
  {
    id: 'faq-001',
    category: 'Data Access & FAIR Principles',
    question: 'How do I download full scientific NetCDF and raw time-series data?',
    answer: 'All datasets on the POLARIS portal are freely accessible under FAIR (Findable, Accessible, Interoperable, Reusable) data principles and the Creative Commons CC-BY 4.0 license. You can download individual parameters directly via the Files & Downloads tab or stream bulk variables via our RESTful API.'
  },
  {
    id: 'faq-002',
    category: 'Data Access & FAIR Principles',
    question: 'Do I need an account to browse datasets?',
    answer: 'No. Discovery, metadata inspection, interactive time-series charting, and basic CSV exports are 100% public and do not require login. An account is only required for high-volume automated API keys and personal bookmarks.'
  },
  {
    id: 'faq-003',
    category: 'Expedition Participation',
    question: 'How can Indian university researchers join an Antarctic or Arctic expedition?',
    answer: 'NCPOR releases an annual Call for Research Proposals (typically in April-May for the Indian Scientific Expedition to Antarctica and November for the Arctic). Selected principal investigators and research students undergo medical and snow acclimatization training at ITBP Auli before embarkation.'
  },
  {
    id: 'faq-004',
    category: 'Sample Requests & Ice Cores',
    question: 'Can external scientists request physical ice core or sediment samples?',
    answer: 'Yes. NCPOR houses the National Ice Core Repository in Goa. Scientists can submit an official Sample Request Form through the Ministry of Earth Sciences portal detailing analytical methodology and scientific objectives.'
  },
  {
    id: 'faq-005',
    category: 'Citation & DOI Rules',
    question: 'How should I cite POLARIS datasets in peer-reviewed publications?',
    answer: 'Each dataset features an immutable Digital Object Identifier (DOI). You can copy pre-formatted citations directly in APA 7th, BibTeX, Chicago, or RIS formats from the Citation tab on any dataset page.'
  }
];

const getAll = (query = {}) => {
  const { category } = query;
  if (category) {
    return POLAR_FAQS.filter((f) => f.category.toLowerCase().includes(category.toLowerCase()));
  }
  return POLAR_FAQS;
};

module.exports = {
  getAll,
  POLAR_FAQS
};
