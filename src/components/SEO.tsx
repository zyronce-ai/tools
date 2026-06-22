import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
}

const SITE = "https://tool.nayratrendz.in";

export function SEO({ title, description, path = "", image = "/og-image.svg" }: SEOProps) {
  const url = `${SITE}${path}`;
  const fullTitle = `${title} | NayraTools`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE}${image}`} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE}${image}`} />
    </Helmet>
  );
}