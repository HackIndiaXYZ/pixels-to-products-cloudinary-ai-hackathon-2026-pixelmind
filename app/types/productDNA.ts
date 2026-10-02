export type ProductDNA = {
  productName: string;
  productCategory: string;
  primaryColor: string;
  style: string;
  shortDescription: string;
};

export type InstagramSlide = {
  title: string;
  subtitle: string;
  tag: string;
  cta?: string;
};

export type InstagramCampaign = {
  hook: string;
  caption: string;
  hashtags: string[];
  slides: InstagramSlide[];
  cta: string;
};

export type StoryCampaign = {
  headline: string;
  supportingText: string;
  stickerText: string;
  interaction: {
    question: string;
    optionA: string;
    optionB: string;
  };
  cta: string;
};

export type WebsiteCampaign = {
  headline: string;
  subheadline: string;
  primaryCTA: string;
  secondaryCTA: string;
  benefits: string[];
  announcement: string;
};

export type MarketplaceCampaign = {
  productTitle: string;
  description: string;
  features: string[];
  price: string;
  rating: string;
  reviewsCount: string;
  cta: string;
};

export type CampaignWorldType = "URBAN" | "PERFORMANCE" | "LIFESTYLE" | "NIGHT";

export type CampaignCopy = {
  headline: string;
  description: string;
  callToAction: string;

  // Platform-native generated structures
  instagram?: InstagramCampaign;
  story?: StoryCampaign;
  website?: WebsiteCampaign;
  marketplace?: MarketplaceCampaign;
  campaignWorld?: {
    name: string;
    visualTone: string;
    environmentDescription: string;
  };
};

export type CampaignAsset = {
  name: string;
  format: string;
  width: number;
  height: number;
  url: string;
};

export type ProductShape =
  | "natural"
  | "circle"
  | "star"
  | "hexagon"
  | "diamond"
  | "badge"
  | "card";

export type ProductLayoutArrangement =
  | "staged-plinth"
  | "hero-centered"
  | "editorial-split"
  | "diagonal-float";