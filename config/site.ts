export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Flower Prediction",
  description: "Make prediction by upload an image.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Predict",
      href: "/predict",
    }
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Predict",
      href: "/predict",
    }
  ],
  links: {
    github: "#",
    twitter: "#",
    docs: "#",
    predict: "/predict",
    discord: "#",
    sponsor: "#",
  },
};
