export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', active: true },
  { label: 'Courses', href: '/courses' },
  { label: 'About', href: '/about' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export interface HeroSlide {
  id: number;
  image: string;
  alt: string;
  badge: string;
  tagline: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: '/images/ghibli/hero-ghibli-1.jpg',
    alt: 'MSI Group of Institutes – premier law coaching institute in Kharar, Mohali',
    badge: 'MSI Law Institute — Kharar',
    tagline: 'Shaping Legal Brilliance',
  },
  {
    id: 2,
    image: '/images/ghibli/hero-ghibli-2.jpg',
    alt: 'Executive Director Boardroom & Judicial Study Chambers at MSI Institutes',
    badge: 'Judiciary & Law Entrance Coaching',
    tagline: 'Creating Confident Legal Professionals',
  },
  {
    id: 3,
    image: '/images/ghibli/hero-ghibli-3.jpg',
    alt: 'Law students studying in MSI library with experienced faculty guidance',
    badge: 'Expert Faculty & Mentorship',
    tagline: 'Top-Tier Legal Education for All',
  },
];

export interface FeatureItem {
  id: number;
  title: string;
  iconName: 'graduation-cap' | 'users' | 'trending-up' | 'shield-star' | 'lightbulb';
  description: string;
}

export const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: 1,
    title: 'Expert\nTutors',
    iconName: 'graduation-cap',
    description: '50+ experienced legal professionals and exam specialists for focused coaching',
  },
  {
    id: 2,
    title: 'Judiciary\nCoaching',
    iconName: 'users',
    description: 'Specialized PCS J, ADJ, and Civil Judge coaching with judgment writing practice',
  },
  {
    id: 3,
    title: 'Law Entrance\nPrep',
    iconName: 'trending-up',
    description: 'Proven CLAT, AILET, SLAT, LSAT India and state law entrance exam preparation',
  },
  {
    id: 4,
    title: 'Small\nBatches',
    iconName: 'shield-star',
    description: 'Controlled small batch sizes ensuring personalized attention for every student',
  },
  {
    id: 5,
    title: 'Mock\nTests',
    iconName: 'lightbulb',
    description: 'Regular mock tests with detailed feedback and performance evaluation reports',
  },
];

export const STUDENT_AVATARS = [
  { id: 1, src: '/images/avatars/avatar-1.webp', alt: 'MSI Student achiever 1' },
  { id: 2, src: '/images/avatars/avatar-2.webp', alt: 'MSI Student achiever 2' },
  { id: 3, src: '/images/avatars/avatar-3.webp', alt: 'MSI Student achiever 3' },
  { id: 4, src: '/images/avatars/avatar-4.webp', alt: 'MSI Student achiever 4' },
  { id: 5, src: '/images/avatars/avatar-5.webp', alt: 'MSI Student achiever 5' },
];

export const BRAND_COLORS = {
  maroon: '#89190E',
  darkMaroon: '#65130D',
  gold: '#EFC988',
  lightGold: '#F7E5BF',
  cream: '#FFF9EF',
  iconCream: '#FFF3DD',
  navy: '#10233F',
  secondaryText: '#526174',
  border: '#E8DCCB',
};
