export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface SiteConfig {
  title: string;
  description: string;
  url: string;
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  github: {
    owner: string;
    repo: string;
    branch: string;
    contentPath: string;
  };
  nav: NavItem[];
  footer: {
    links: NavItem[];
    copyright: string;
  };
}

export const siteConfig: SiteConfig = {
  title: 'Family Wiki',
  description: '个人决策型知识库',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  author: {
    name: 'Family',
  },
  github: {
    owner: process.env.GITHUB_OWNER ?? 'YoungerYang',
    repo: process.env.GITHUB_REPO ?? 'family-wiki',
    branch: process.env.GITHUB_BRANCH ?? 'main',
    contentPath: 'content',
  },
  nav: [
    { label: '首页', href: '/' },
  ],
  footer: {
    links: [],
    copyright: `© ${new Date().getFullYear()} Family Wiki`,
  },
};
