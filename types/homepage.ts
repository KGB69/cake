export interface HomepageContent {
  id: string;
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroButtonLink: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHomepageContentInput {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonText: string;
  heroButtonLink: string;
}
