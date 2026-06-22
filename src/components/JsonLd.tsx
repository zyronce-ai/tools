import { Helmet } from "react-helmet-async";

const SITE = "https://tool.nayratrendz.in";
const ORG = "NayraTools";

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG,
    url: SITE,
    logo: `${SITE}/og-image.svg`,
    description: "AI-powered ecommerce toolkit for online sellers",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${SITE}/contact`,
    },
    sameAs: [],
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORG,
    url: SITE,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE}/chat?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface Breadcrumb {
  name: string;
  path: string;
}

export function BreadcrumbSchema({ items }: { items: Breadcrumb[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE}${item.path}`,
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function ArticleSchema({
  title,
  description,
  image,
  datePublished,
  author = ORG,
}: {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  author?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: image ? `${SITE}${image}` : `${SITE}/og-image.svg`,
    datePublished,
    author: { "@type": "Organization", name: author },
    publisher: { "@type": "Organization", name: ORG, logo: `${SITE}/og-image.svg` },
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

interface QA {
  question: string;
  answer: string;
}

export function FAQSchema({ questions }: { questions: QA[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}