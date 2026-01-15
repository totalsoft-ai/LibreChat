const manifest = require('./manifest');

// Structured Tools
const DALLE3 = require('./structured/DALLE3');
const FluxAPI = require('./structured/FluxAPI');
const OpenWeather = require('./structured/OpenWeather');
const StructuredWolfram = require('./structured/Wolfram');
const createYouTubeTools = require('./structured/YouTube');
const StructuredACS = require('./structured/AzureAISearch');
const StructuredSD = require('./structured/StableDiffusion');
const GoogleSearchAPI = require('./structured/GoogleSearch');
const TraversaalSearch = require('./structured/TraversaalSearch');
const createOpenAIImageTools = require('./structured/OpenAIImageTools');
const TavilySearchResults = require('./structured/TavilySearchResults');
const DocumentLoaderTool = require('./structured/DocumentLoader');
const CodeReviewTool = require('./structured/CodeReviewTool');
const DocumentFlowTool = require('./structured/DocumentFlowTool');
const DocumentSummarizerTool = require('./structured/DocumentSummarizerTool');
const TextTranslatorTool = require('./structured/TextTranslatorTool');
const WebScrapingTool = require('./structured/WebScrapingTool');

module.exports = {
  ...manifest,
  // Structured Tools
  DALLE3,
  FluxAPI,
  OpenWeather,
  StructuredSD,
  StructuredACS,
  GoogleSearchAPI,
  TraversaalSearch,
  StructuredWolfram,
  createYouTubeTools,
  TavilySearchResults,
  createOpenAIImageTools,
  DocumentLoaderTool,
  CodeReviewTool,
  DocumentFlowTool,
  DocumentSummarizerTool,
  TextTranslatorTool,
  WebScrapingTool,
};
