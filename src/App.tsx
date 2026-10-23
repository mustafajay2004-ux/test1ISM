import { useMemo, useState } from "react";

type Lang = "fr" | "en";
type Page = "home" | "shop" | "category" | "product" | "about" | "faq" | "system";
type CategoryId = "watches" | "jewelry" | "bags" | "scarves" | "fashion" | "tech";

type Category = {
  id: CategoryId;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  subcategories: Record<Lang, string[]>;
  filters: Record<Lang, string[]>;
};

type Product = {
  id: string;
  category: CategoryId;
  slot: number;
  name: Record<Lang, string> | null;
  price: number | null;
  description: Record<Lang, string> | null;
  images: string[];
  variants: string[];
  availability: "available" | "preorder" | "unavailable" | "pending";
  subcategory: string | null;
  features: Record<Lang, string[]> | null;
  addedAt: string | null;
  featured: boolean;
  audience: "men" | "women" | null;
  priceOnRequest: boolean;
};

// Numéro WhatsApp Business au format international, sans "+" ni espaces (ex. "221770000000").
// Tant qu'il est vide, le bouton de commande reste désactivé.
const WHATSAPP_NUMBER = "";

const categories: Category[] = [
  {
    id: "watches",
    name: { fr: "Montres", en: "Watches" },
    description: {
      fr: "Classiques, sportives ou connectées, selon les modèles dont la disponibilité est confirmée.",
      en: "Classic, sports or smart watches, depending on confirmed available models.",
    },
    subcategories: {
      fr: ["Classiques", "Sportives", "Connectées", "Pour homme", "Pour femme"],
      en: ["Classic", "Sports", "Smart watches", "Men", "Women"],
    },
    filters: { fr: ["Type", "Style", "Couleur", "Prix"], en: ["Type", "Style", "Colour", "Price"] },
  },
  {
    id: "jewelry",
    name: { fr: "Bijoux & style", en: "Jewellery & style" },
    description: {
      fr: "Bracelets, boucles d’oreilles, colliers et bijoux pour hommes selon les références confirmées.",
      en: "Bracelets, earrings, necklaces and men’s jewellery based on confirmed items.",
    },
    subcategories: {
      fr: ["Bracelets", "Boucles d’oreilles", "Colliers", "Bijoux pour homme"],
      en: ["Bracelets", "Earrings", "Necklaces", "Men’s jewellery"],
    },
    filters: { fr: ["Type", "Style", "Couleur", "Matière"], en: ["Type", "Style", "Colour", "Material"] },
  },
  {
    id: "bags",
    name: { fr: "Sacs & maroquinerie", en: "Bags & leather goods" },
    description: {
      fr: "Sacs à main, sacoches et sacs pour hommes, uniquement parmi les modèles réellement disponibles.",
      en: "Handbags, crossbody bags and men’s bags, limited to models that are genuinely available.",
    },
    subcategories: {
      fr: ["Sacs à main", "Sacoches", "Sacs pour homme", "Autres sacs"],
      en: ["Handbags", "Crossbody bags", "Men’s bags", "Other bags"],
    },
    filters: { fr: ["Type", "Couleur", "Style", "Prix"], en: ["Type", "Colour", "Style", "Price"] },
  },
  {
    id: "scarves",
    name: { fr: "Foulards & carrés", en: "Scarves & silk squares" },
    description: {
      fr: "Foulards et carrés de soie classés par imprimé, couleur et style lorsque ces informations sont vérifiées.",
      en: "Scarves and silk squares organised by print, colour and style when that information is verified.",
    },
    subcategories: {
      fr: ["Foulards", "Carrés de soie", "Imprimés", "Unis"],
      en: ["Scarves", "Silk squares", "Printed", "Plain"],
    },
    filters: { fr: ["Type", "Couleur", "Motif", "Style"], en: ["Type", "Colour", "Pattern", "Style"] },
  },
  {
    id: "fashion",
    name: { fr: "Accessoires de mode", en: "Fashion accessories" },
    description: {
      fr: "Lunettes, ceintures et accessoires de tête selon le catalogue confirmé.",
      en: "Sunglasses, belts and headwear based on the confirmed catalogue.",
    },
    subcategories: {
      fr: ["Lunettes de soleil", "Ceintures", "Casquettes", "Bonnets", "Chapeaux"],
      en: ["Sunglasses", "Belts", "Caps", "Beanies", "Hats"],
    },
    filters: { fr: ["Type", "Style", "Couleur", "Taille"], en: ["Type", "Style", "Colour", "Size"] },
  },
  {
    id: "tech",
    name: { fr: "Tech & audio", en: "Tech & audio" },
    description: {
      fr: "Accessoires pour appareils, écouteurs, casques et enceintes dont les caractéristiques sont vérifiées.",
      en: "Device accessories, earphones, headphones and speakers with verified specifications.",
    },
    subcategories: {
      fr: ["Téléphone", "Ordinateur", "Écouteurs sans fil", "Écouteurs filaires", "Casques", "Enceintes"],
      en: ["Phone", "Computer", "Wireless earbuds", "Wired earphones", "Headphones", "Speakers"],
    },
    filters: {
      fr: ["Type d’accessoire", "Compatibilité", "Connectivité", "Prix"],
      en: ["Accessory type", "Compatibility", "Connectivity", "Price"],
    },
  },
];

// Editable catalogue source. Replace a slot with verified product data before publishing it.
const emptySlots: Product[] = categories.flatMap((category) =>
  [1, 2].map((slot) => ({
    id: `${category.id}-slot-${slot}`,
    category: category.id,
    slot,
    name: null,
    price: null,
    description: null,
    images: [],
    variants: [],
    availability: "pending" as const,
    subcategory: null,
    features: null,
    addedAt: null,
    featured: false,
    audience: null,
    priceOnRequest: false,
  })),
);

// Produits réels : on remplace l'emplacement correspondant, rien d'autre n'est inventé.
// Photos : ajouter les fichiers dans /public puis les lister dans `images` (ex. "/rolex-day-date-1.jpg").
// Prix : renseigner `price` (FCFA) ou mettre `priceOnRequest: true` pour afficher « Prix sur demande ».
// Disponibilité : passer `availability` à "available" ou "preorder" une fois confirmée.
const realProducts: Record<string, Partial<Product>> = {
  "watches-slot-1": {
    name: { fr: "Rolex Day-Date 36 mm", en: "Rolex Day-Date 36 mm" },
    subcategory: "Classiques",
    description: {
      fr: "Montre Rolex Day-Date 36 mm, livrée avec sa boîte. Pas de certificat ni de facture d’origine.",
      en: "Rolex Day-Date 36 mm watch, supplied with its box. No original certificate or invoice.",
    },
    features: {
      fr: ["Marque : Rolex", "Modèle : Day-Date 36 mm", "Avec boîte", "Sans certificat ni facture d’origine"],
      en: ["Brand: Rolex", "Model: Day-Date 36 mm", "With box", "No original certificate or invoice"],
    },
    images: ["/rolex-day-date-1.jpg"],
    featured: true,
    priceOnRequest: true,
  },
  "watches-slot-2": {
    name: { fr: "Audemars Piguet (modèle à préciser)", en: "Audemars Piguet (model to be specified)" },
    subcategory: "Classiques",
    description: {
      fr: "Montre Audemars Piguet livrée avec sa boîte. Modèle et référence à préciser.",
      en: "Audemars Piguet watch supplied with its box. Model and reference to be specified.",
    },
    features: {
      fr: ["Marque : Audemars Piguet", "Avec boîte", "Modèle et référence à préciser"],
      en: ["Brand: Audemars Piguet", "With box", "Model and reference to be specified"],
    },
    images: ["/audemars-piguet-1.jpg"],
    featured: true,
    priceOnRequest: true,
  },
};

const products: Product[] = emptySlots.map((product) => ({ ...product, ...realProducts[product.id] }));

const featuredProducts = products.filter((product) => product.featured);

// Cartes « collection » de l'accueil : un visuel d'ambiance qui mène à la catégorie, sans prix ni produit précis.
// Pour changer la photo : déposer le fichier dans /public et modifier `image` (null = emplacement vide).
type Showcase = {
  id: string;
  category: CategoryId;
  subcategory: string | null;
  title: Record<Lang, string>;
  image: string | null;
};

const showcases: Showcase[] = [
  { id: "showcase-jewelry-men", category: "jewelry", subcategory: "Bijoux pour homme", title: { fr: "Bijoux · Homme", en: "Jewellery · Men" }, image: "/bijoux-homme.jpg" },
  { id: "showcase-jewelry-women", category: "jewelry", subcategory: null, title: { fr: "Bijoux · Femme", en: "Jewellery · Women" }, image: null },
];

const copy = {
  fr: {
    announcement: "Catalogue en préparation — seules les informations vérifiées seront publiées",
    nav: { home: "Accueil", shop: "Boutique", about: "À propos", faq: "Infos pratiques" },
    search: "Rechercher dans le catalogue",
    heroEyebrow: "Accessoires choisis pour la vie étudiante",
    heroTitle: "Tes essentiels. Ton style. Ton campus.",
    heroText:
      "Montres, bijoux, sacs, foulards, accessoires de mode et tech : une sélection indépendante qui sera publiée au fil des disponibilités confirmées.",
    discover: "Explorer les catégories",
    how: "Comment commander",
    categories: "Six univers à découvrir",
    categoriesText: "Une organisation claire pour trouver rapidement le bon accessoire.",
    catalogReady: "Catalogue structuré",
    catalogPending: "Produits en cours d’ajout",
    seeAll: "Voir toute la boutique",
    philosophy: "Des informations réelles, ou rien.",
    philosophyText:
      "Chaque nom, prix, photo, variante et disponibilité sera ajouté uniquement après vérification. Les emplacements visibles aujourd’hui indiquent clairement les données qui restent à compléter.",
    steps: ["Découvre une catégorie", "Choisis ton article", "Confirme sur WhatsApp"],
    stepsText: [
      "Parcours les six univers et leurs sous-catégories.",
      "Consulte les photos, variantes, caractéristiques et disponibilités vérifiées.",
      "Envoie ta demande. La commande reste à confirmer dans la conversation.",
    ],
    shopTitle: "Toute la boutique",
    shopText: "La structure est prête à accueillir les produits réels sans devoir redessiner chaque page.",
    filters: "Filtres",
    sort: "Trier par",
    newest: "Nouveautés",
    low: "Prix croissant",
    high: "Prix décroissant",
    results: "emplacements",
    noResults: "Aucun résultat",
    noResultsText: "Essaie un autre terme ou efface les filtres actifs.",
    clear: "Effacer les filtres",
    placeholder: "Emplacement produit",
    addData: "Informations à renseigner",
    pricePending: "Prix à renseigner",
    details: "Ouvrir la fiche",
    quantity: "Quantité",
    variant: "Variante",
    order: "Commander sur WhatsApp",
    orderUnavailable: "La commande sera activée après ajout du nom, du prix et de la disponibilité réelle.",
    practical: "Informations de commande",
    practicalText:
      "Aucun paiement n’est effectué sur ce site. Disponibilité, paiement et remise seront confirmés dans la conversation WhatsApp.",
    similar: "Vous pourriez aussi aimer",
    completeStyle: "Complétez votre style",
    aboutTitle: "Une initiative étudiante, simplement.",
    aboutText:
      "Le Coin ISM est un projet indépendant lancé par un étudiant pour proposer des accessoires utiles avec des informations claires.",
    faqTitle: "Commander en toute clarté",
    faqText: "Les modalités non finalisées restent explicitement signalées comme étant à compléter.",
    independent: "Projet indépendant — sans affiliation officielle avec le Groupe ISM.",
    dsTitle: "Design System",
    dsText: "Les fondations visuelles et les composants du prototype Le Coin ISM.",
    backCategory: "Retour à la catégorie",
    menu: "Menu",
    close: "Fermer",
    language: "Langue",
    footerText: "Une sélection indépendante pensée avec et pour les étudiants.",
    verifiedOnly: "Aucune donnée commerciale inventée",
    prestigeEyebrow: "Sélection prestige",
    prestigeTitle: "Nos pièces d’exception",
    prestigeText: "Une vitrine de nos articles les plus luxueux. Toutes les montres et tous les bijoux restent à retrouver dans leurs catégories.",
    priceOnRequest: "Prix sur demande",
    men: "Homme",
    women: "Femme",
    statusAvailable: "Disponible",
    statusPreorder: "Précommande",
    statusUnavailable: "Indisponible",
    showcaseTag: "Collection",
    showcaseCta: "Découvrir la sélection",
  },
  en: {
    announcement: "Catalogue in preparation — only verified information will be published",
    nav: { home: "Home", shop: "Shop", about: "About", faq: "Practical info" },
    search: "Search the catalogue",
    heroEyebrow: "Accessories selected for student life",
    heroTitle: "Your essentials. Your style. Your campus.",
    heroText:
      "Watches, jewellery, bags, scarves, fashion accessories and tech: an independent selection published as availability is confirmed.",
    discover: "Explore categories",
    how: "How to order",
    categories: "Six worlds to explore",
    categoriesText: "A clear structure to help you quickly find the right accessory.",
    catalogReady: "Catalogue structure ready",
    catalogPending: "Products being added",
    seeAll: "View the full shop",
    philosophy: "Real information, or nothing.",
    philosophyText:
      "Every name, price, photo, variant and availability status will only be added after verification. Current slots clearly show what still needs to be completed.",
    steps: ["Explore a category", "Choose your item", "Confirm on WhatsApp"],
    stepsText: [
      "Browse the six collections and their subcategories.",
      "Check verified photos, variants, specifications and availability.",
      "Send your request. The order still needs confirmation in the conversation.",
    ],
    shopTitle: "All products",
    shopText: "The structure is ready for real products without redesigning each page.",
    filters: "Filters",
    sort: "Sort by",
    newest: "Newest",
    low: "Price: low to high",
    high: "Price: high to low",
    results: "slots",
    noResults: "No results",
    noResultsText: "Try another term or clear the active filters.",
    clear: "Clear filters",
    placeholder: "Product slot",
    addData: "Information to complete",
    pricePending: "Price to complete",
    details: "Open product page",
    quantity: "Quantity",
    variant: "Variant",
    order: "Order on WhatsApp",
    orderUnavailable: "Ordering will be enabled once the real name, price and availability are added.",
    practical: "Ordering information",
    practicalText:
      "No payment is processed on this site. Availability, payment and handover will be confirmed in the WhatsApp conversation.",
    similar: "You may also like",
    completeStyle: "Complete your style",
    aboutTitle: "A student initiative, simply.",
    aboutText:
      "Le Coin ISM is an independent project started by a student to offer useful accessories with clear information.",
    faqTitle: "Order with clarity",
    faqText: "Any terms that are not final remain explicitly marked as pending completion.",
    independent: "Independent project — not officially affiliated with Groupe ISM.",
    dsTitle: "Design System",
    dsText: "Visual foundations and reusable components for Le Coin ISM.",
    backCategory: "Back to category",
    menu: "Menu",
    close: "Close",
    language: "Language",
    footerText: "An independent selection made with and for students.",
    verifiedOnly: "No invented commercial data",
    prestigeEyebrow: "Prestige selection",
    prestigeTitle: "Our exceptional pieces",
    prestigeText: "A showcase of our most luxurious items. All watches and jewellery can still be found in their categories.",
    priceOnRequest: "Price on request",
    men: "Men",
    women: "Women",
    statusAvailable: "Available",
    statusPreorder: "Pre-order",
    statusUnavailable: "Unavailable",
    showcaseTag: "Collection",
    showcaseCta: "Explore the selection",
  },
};

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    check: <path d="m5 12 4 4L19 6" />,
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9.2 9.2 0 0 1-4-.9L3 21l1.7-4.5A8.4 8.4 0 1 1 21 11.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="1" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5L5 20" /></>,
  };
  return <svg aria-hidden="true" className="icon" fill="none" height={size} viewBox="0 0 24 24" width={size}><g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">{paths[name]}</g></svg>;
}

function Logo({ onClick }: { onClick: () => void }) {
  return <button aria-label="Le Coin ISM" className="logo" onClick={onClick}><span className="logo-mark"><i /><i /><i /></span><span>Le Coin <strong>ISM</strong></span></button>;
}

const getCategory = (id: CategoryId) => categories.find((category) => category.id === id) ?? categories[0];
const priceLabel = (product: Product, lang: Lang) =>
  product.price !== null ? `${product.price.toLocaleString("fr-FR")} FCFA` : product.priceOnRequest ? copy[lang].priceOnRequest : copy[lang].pricePending;
const audienceLabel = (product: Product, lang: Lang) => (product.audience ? copy[lang][product.audience] : "");
const displayName = (product: Product, lang: Lang) => {
  const audience = audienceLabel(product, lang);
  const suffix = audience ? ` · ${audience}` : "";
  return product.name?.[lang] ?? (lang === "fr" ? `Produit à renseigner · ${getCategory(product.category).name.fr}${suffix}` : `Product to complete · ${getCategory(product.category).name.en}${suffix}`);
};

function ProductPlaceholder({ category, compact = false }: { category: CategoryId; compact?: boolean }) {
  return <div className={compact ? "product-placeholder compact" : "product-placeholder"}><Icon name="image" size={compact ? 22 : 34} /><span>{category.toUpperCase()}</span><small>PHOTO</small></div>;
}

export default function App() {
  const [lang, setLang] = useState<Lang>("fr");
  const [page, setPage] = useState<Page>("home");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("watches");
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [query, setQuery] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [variant, setVariant] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const t = copy[lang];

  const navigate = (next: Page) => {
    setPage(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCategory = (category: CategoryId) => {
    setSelectedCategory(category);
    setSubcategory("");
    setQuery("");
    navigate("category");
  };

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedCategory(product.category);
    setVariant("");
    setQuantity(1);
    setImageIndex(0);
    navigate("product");
  };

  const openShowcase = (showcase: Showcase) => {
    openCategory(showcase.category);
    setSubcategory(showcase.subcategory ?? "");
  };

  const fr = lang === "fr";
  const missingData = [
    !selectedProduct.name && (fr ? "Nom exact du produit" : "Exact product name"),
    selectedProduct.price === null && !selectedProduct.priceOnRequest && (fr ? "Prix réel en FCFA" : "Real price in FCFA"),
    selectedProduct.availability === "pending" && (fr ? "Disponibilité réelle" : "Actual availability"),
    !selectedProduct.description && (fr ? "Description et caractéristiques" : "Description and features"),
    !selectedProduct.images.length && (fr ? "Photos authentiques du stock" : "Authentic stock photos"),
  ].filter((item): item is string => Boolean(item));

  const activeCategory = getCategory(selectedCategory);
  const categoryProducts = products.filter((product) => product.category === selectedCategory);
  const canOrder = Boolean(
    WHATSAPP_NUMBER &&
    selectedProduct.name &&
    (selectedProduct.price !== null || selectedProduct.priceOnRequest) &&
    selectedProduct.availability !== "pending" &&
    selectedProduct.availability !== "unavailable" &&
    (!selectedProduct.variants.length || variant),
  );

  const visibleProducts = useMemo(() => {
    const base = page === "category" ? categoryProducts : products;
    const filtered = base.filter((product) => {
      const name = displayName(product, lang).toLowerCase();
      const matchesQuery = name.includes(query.toLowerCase()) || getCategory(product.category).name[lang].toLowerCase().includes(query.toLowerCase());
      const matchesSubcategory = !subcategory || product.subcategory === subcategory;
      return matchesQuery && matchesSubcategory;
    });
    if (sort === "low") return [...filtered].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === "high") return [...filtered].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    return filtered;
  }, [page, categoryProducts, query, subcategory, sort, lang]);

  const whatsappMessage = canOrder
    ? lang === "fr"
      ? `Bonjour Le Coin ISM, je souhaite commander : ${selectedProduct.name?.fr}, variante : ${variant || "sans variante"}, quantité : ${quantity}, prix affiché : ${priceLabel(selectedProduct, "fr")}. Voici le produit : ${window.location.href}`
      : `Hello Le Coin ISM, I would like to order: ${selectedProduct.name?.en}, variant: ${variant || "no variant"}, quantity: ${quantity}, displayed price: ${priceLabel(selectedProduct, "en")}. Product link: ${window.location.href}`
    : "";

  return (
    <div className="app">
      <div className="announcement">{t.announcement}</div>
      <header className="header">
        <div className="shell header-inner">
          <Logo onClick={() => navigate("home")} />
          <nav className="desktop-nav" aria-label="Main navigation">
            {(["home", "shop", "about", "faq"] as Page[]).map((item) => <button className={page === item || (item === "shop" && ["category", "product"].includes(page)) ? "nav-link active" : "nav-link"} key={item} onClick={() => navigate(item)}>{t.nav[item as keyof typeof t.nav]}</button>)}
          </nav>
          <div className="header-actions">
            <button className="icon-button desktop-search" aria-label={t.search} onClick={() => navigate("shop")}><Icon name="search" /></button>
            <div className="language-switch" aria-label={t.language}><button className={lang === "fr" ? "active" : ""} onClick={() => setLang("fr")}>FR</button><span /><button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button></div>
            <button className="icon-button mobile-menu" aria-label={t.menu} onClick={() => setMenuOpen(true)}><Icon name="menu" /></button>
          </div>
        </div>
        <div className="category-nav shell">
          {categories.map((category) => <button key={category.id} onClick={() => openCategory(category.id)}>{category.name[lang]}</button>)}
        </div>
      </header>

      {menuOpen && <div className="mobile-drawer"><div className="drawer-head"><Logo onClick={() => navigate("home")} /><button className="icon-button" aria-label={t.close} onClick={() => setMenuOpen(false)}><Icon name="close" /></button></div><nav>{(["home", "shop", "about", "faq"] as Page[]).map((item, index) => <button key={item} onClick={() => navigate(item)}><span>0{index + 1}</span>{t.nav[item as keyof typeof t.nav]}<Icon name="arrow" /></button>)}</nav><div className="drawer-categories">{categories.map((category) => <button key={category.id} onClick={() => openCategory(category.id)}>{category.name[lang]}</button>)}</div><p>{t.independent}</p></div>}

      <main>
        {page === "home" && <>
          <section className="hero"><div className="shell hero-grid"><div className="hero-copy"><span className="eyebrow">{t.heroEyebrow}</span><h1>{t.heroTitle}</h1><p>{t.heroText}</p><div className="button-row"><button className="button primary" onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}>{t.discover}<Icon name="arrow" /></button><button className="button tertiary" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>{t.how}</button></div><div className="trust-note"><Icon name="check" /><span>{t.verifiedOnly}</span></div></div><div className="hero-visual"><div className="hero-image-wrap"><img src="https://images.unsplash.com/photo-1776435303185-95be02310cff?auto=format&fit=crop&w=1200&q=85" alt={lang === "fr" ? "Visuel éditorial provisoire, non lié au stock" : "Temporary editorial visual, unrelated to stock"} /><span className="photo-credit">Visuel éditorial provisoire · Unsplash</span></div><div className="floating-card"><span>06</span><strong>{t.catalogReady}</strong><small>{t.catalogPending}</small></div></div></div></section>

          <section className="section shell" id="categories"><div className="section-heading"><div><span className="eyebrow">01 — {t.categories}</span><h2>{t.categories}</h2></div><p>{t.categoriesText}</p></div><div className="category-grid six-categories">{categories.map((category, index) => <button className={`category-card cat-${(index % 3) + 1}`} key={category.id} onClick={() => openCategory(category.id)}><span>0{index + 1}</span><div><strong>{category.name[lang]}</strong><small>{category.subcategories[lang].slice(0, 3).join(" · ")}</small></div><i><Icon name="arrow" /></i></button>)}</div></section>

          <section className="section warm-section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">02 — {t.prestigeEyebrow}</span><h2>{t.prestigeTitle}</h2><p style={{ marginTop: 12, maxWidth: 560, color: "var(--muted)" }}>{t.prestigeText}</p></div><button className="text-link" onClick={() => navigate("shop")}>{t.seeAll}<Icon name="arrow" /></button></div><div className="product-grid home-products">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} lang={lang} onOpen={openProduct} />)}{showcases.map((showcase) => <ShowcaseCard key={showcase.id} showcase={showcase} lang={lang} onOpen={openShowcase} />)}</div></div></section>

          <section className="section shell philosophy"><div className="philosophy-number">03</div><div><span className="eyebrow">{lang === "fr" ? "Notre engagement" : "Our commitment"}</span><h2>{t.philosophy}</h2></div><div><p>{t.philosophyText}</p><button className="text-link" onClick={() => navigate("about")}>{t.nav.about}<Icon name="arrow" /></button></div></section>

          <section className="section shell" id="how"><div className="section-heading"><div><span className="eyebrow">04 — {t.how}</span><h2>{t.how}</h2></div></div><div className="steps">{t.steps.map((step, index) => <article key={step}><span>0{index + 1}</span><div className="step-icon"><Icon name={index === 0 ? "search" : index === 1 ? "check" : "message"} /></div><h3>{step}</h3><p>{t.stepsText[index]}</p></article>)}</div></section>
          <FaqPreview lang={lang} onAll={() => navigate("faq")} />
        </>}

        {(page === "shop" || page === "category") && <CatalogPage lang={lang} isCategory={page === "category"} activeCategory={activeCategory} products={visibleProducts} query={query} setQuery={setQuery} subcategory={subcategory} setSubcategory={setSubcategory} sort={sort} setSort={setSort} filterOpen={filterOpen} setFilterOpen={setFilterOpen} onShop={() => navigate("shop")} onCategory={openCategory} onProduct={openProduct} onClear={() => { setQuery(""); setSubcategory(""); }} />}

        {page === "product" && <section className="product-page shell">
          <button className="back-link" onClick={() => openCategory(selectedProduct.category)}><span>←</span>{t.backCategory} · {getCategory(selectedProduct.category).name[lang]}</button>
          <div className="product-detail">
            <div className="product-gallery"><div className="main-image">{selectedProduct.images.length ? <img src={selectedProduct.images[imageIndex] ?? selectedProduct.images[0]} alt={displayName(selectedProduct, lang)} /> : <><ProductPlaceholder category={selectedProduct.category} /><span className="demo-label">{lang === "fr" ? "Photo réelle à importer" : "Real photo to upload"}</span></>}</div>{selectedProduct.images.length ? <div className="thumbnail-row">{selectedProduct.images.map((src, index) => <button className={index === imageIndex ? "active" : ""} key={src} onClick={() => setImageIndex(index)} aria-label={`${lang === "fr" ? "Angle photo" : "Photo angle"} ${index + 1}`}><img src={src} alt="" /></button>)}</div> : <><div className="thumbnail-row">{[1, 2, 3, 4].map((item) => <button className={item === 1 ? "active placeholder-thumb" : "placeholder-thumb"} key={item} aria-label={`${lang === "fr" ? "Angle photo" : "Photo angle"} ${item}`}><Icon name="image" /></button>)}</div><p className="photo-guidance">{lang === "fr" ? "Emplacements prévus pour la vue principale, le détail, le profil et la mise en situation. Aucune image illustrative n’est associée au stock." : "Slots for main view, detail, profile and context. No illustrative image is presented as stock photography."}</p></>}</div>
            <div className="product-info"><div className="product-meta"><Status lang={lang} availability={selectedProduct.availability} /><span>{selectedProduct.name ? (audienceLabel(selectedProduct, lang) || getCategory(selectedProduct.category).name[lang]) : lang === "fr" ? "Référence à renseigner" : "Reference to complete"}</span></div><h1>{displayName(selectedProduct, lang)}</h1><div className={selectedProduct.price !== null || selectedProduct.priceOnRequest ? "detail-price" : "detail-price pending-price"}>{priceLabel(selectedProduct, lang)}</div><p className="detail-description">{selectedProduct.description?.[lang] ?? (lang === "fr" ? "Ajoutez ici une description concise et vérifiée du produit, sans promesse non confirmée." : "Add a concise, verified product description here, without unconfirmed claims.")}</p>
              {selectedProduct.features && <div className="data-checklist"><strong>{lang === "fr" ? "Caractéristiques" : "Features"}</strong>{selectedProduct.features[lang].map((item) => <span key={item}><i />{item}</span>)}</div>}
              {missingData.length > 0 && <div className="data-checklist"><strong>{t.addData}</strong>{missingData.map((item) => <span key={item}><i />{item}</span>)}</div>}
              <div className="selection-block"><div className="selection-label"><label>{t.variant}</label></div>{selectedProduct.variants.length ? <div className="variants">{selectedProduct.variants.map((item) => <button className={variant === item ? "active" : ""} key={item} onClick={() => setVariant(item)}>{item}</button>)}</div> : <div className="unconfigured-field">{lang === "fr" ? "Couleurs, tailles ou modèles à renseigner" : "Colours, sizes or models to complete"}</div>}</div>
              <div className="selection-block"><label>{t.quantity}</label><div className="quantity"><button aria-label="Decrease" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Icon name="minus" /></button><span>{quantity}</span><button aria-label="Increase" onClick={() => setQuantity(quantity + 1)}><Icon name="plus" /></button></div></div>
              <a className={`button whatsapp ${canOrder ? "" : "disabled"}`} href={canOrder ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}` : undefined} target={canOrder ? "_blank" : undefined} rel="noreferrer" aria-disabled={!canOrder} onClick={(event) => { if (!canOrder) event.preventDefault(); }}><Icon name="message" />{t.order}<Icon name="arrow" /></a><p className="order-help"><Icon name={canOrder ? "check" : "close"} />{canOrder ? t.practicalText : t.orderUnavailable}</p><details className="practical" open><summary>{t.practical}<span>−</span></summary><p>{t.practicalText}</p></details>
            </div>
          </div>
          <RecommendationSection title={t.similar} products={categoryProducts.filter((product) => product.id !== selectedProduct.id)} lang={lang} onOpen={openProduct} />
          <RecommendationSection title={t.completeStyle} products={products.filter((product) => product.category !== selectedProduct.category).slice(0, 3)} lang={lang} onOpen={openProduct} />
        </section>}

        {page === "about" && <AboutPage lang={lang} />}
        {page === "faq" && <FaqPage lang={lang} />}
        {page === "system" && <DesignSystemPage lang={lang} />}
      </main>

      <footer className="footer"><div className="shell footer-top"><div><Logo onClick={() => navigate("home")} /><p>{t.footerText}</p><span>{t.independent}</span></div><div><strong>{lang === "fr" ? "Catégories" : "Categories"}</strong>{categories.slice(0, 3).map((category) => <button key={category.id} onClick={() => openCategory(category.id)}>{category.name[lang]}</button>)}</div><div><strong>{lang === "fr" ? "Explorer" : "Explore"}</strong>{categories.slice(3).map((category) => <button key={category.id} onClick={() => openCategory(category.id)}>{category.name[lang]}</button>)}</div><div><strong>{lang === "fr" ? "Informations" : "Information"}</strong><button onClick={() => navigate("faq")}>FAQ</button><button onClick={() => navigate("system")}>Design System</button><span>{lang === "fr" ? "Mentions légales — à compléter" : "Legal notice — to complete"}</span></div></div><div className="shell footer-bottom"><span>© 2025 Le Coin ISM</span><span>Dakar, Sénégal · Prototype</span></div></footer>
    </div>
  );
}

function Status({ lang, availability = "pending" }: { lang: Lang; availability?: Product["availability"] }) {
  const t = copy[lang];
  const label = availability === "available" ? t.statusAvailable : availability === "preorder" ? t.statusPreorder : availability === "unavailable" ? t.statusUnavailable : lang === "fr" ? "À renseigner" : "To complete";
  return <span className={`status ${availability}`}><i />{label}</span>;
}

function ProductCard({ product, lang, onOpen }: { product: Product; lang: Lang; onOpen: (product: Product) => void }) {
  const t = copy[lang];
  const hasPrice = product.price !== null || product.priceOnRequest;
  const audience = audienceLabel(product, lang);
  return <article className="product-card placeholder-card" onClick={() => onOpen(product)}><div className="product-image">{product.images[0] ? <img src={product.images[0]} alt={displayName(product, lang)} /> : <ProductPlaceholder category={product.category} />}<Status lang={lang} availability={product.availability} /><button aria-label={t.details}><Icon name="arrow" /></button></div><div className="product-card-info"><span>{getCategory(product.category).name[lang]}{product.name ? (audience ? ` · ${audience}` : "") : ` · ${t.placeholder}`}</span><h3>{displayName(product, lang)}</h3><strong className={hasPrice ? "" : "price-placeholder"}>{priceLabel(product, lang)}</strong></div></article>;
}

function ShowcaseCard({ showcase, lang, onOpen }: { showcase: Showcase; lang: Lang; onOpen: (showcase: Showcase) => void }) {
  const t = copy[lang];
  return <article className="product-card placeholder-card" onClick={() => onOpen(showcase)}><div className="product-image">{showcase.image ? <img src={showcase.image} alt={showcase.title[lang]} style={{ objectPosition: "center 58%" }} /> : <ProductPlaceholder category={showcase.category} />}<span className="status confirm"><i />{t.showcaseTag}</span><button aria-label={t.details}><Icon name="arrow" /></button></div><div className="product-card-info"><span>{getCategory(showcase.category).name[lang]}</span><h3>{showcase.title[lang]}</h3><strong>{t.showcaseCta}</strong></div></article>;
}

function CatalogPage({ lang, isCategory, activeCategory, products: visibleProducts, query, setQuery, subcategory, setSubcategory, sort, setSort, filterOpen, setFilterOpen, onShop, onCategory, onProduct, onClear }: {
  lang: Lang; isCategory: boolean; activeCategory: Category; products: Product[]; query: string; setQuery: (value: string) => void; subcategory: string; setSubcategory: (value: string) => void; sort: string; setSort: (value: string) => void; filterOpen: boolean; setFilterOpen: (value: boolean) => void; onShop: () => void; onCategory: (id: CategoryId) => void; onProduct: (product: Product) => void; onClear: () => void;
}) {
  const t = copy[lang];
  const availablePriceData = visibleProducts.some((product) => product.price !== null);
  const filterCategory = isCategory ? activeCategory : null;
  return <section className="shop-page shell">
    <div className="page-intro">{isCategory && <div className="breadcrumb"><button onClick={onShop}>{t.nav.shop}</button><span>/</span><span>{activeCategory.name[lang]}</span></div>}<span className="eyebrow">{isCategory ? `Collection 0${categories.findIndex((item) => item.id === activeCategory.id) + 1}` : t.catalogReady}</span><h1>{isCategory ? activeCategory.name[lang] : t.shopTitle}</h1><p>{isCategory ? activeCategory.description[lang] : t.shopText}</p>{isCategory && <div className="subcategory-chips">{activeCategory.subcategories[lang].map((item) => <button className={subcategory === item ? "active" : ""} key={item} onClick={() => setSubcategory(subcategory === item ? "" : item)}>{item}</button>)}</div>}</div>
    {!isCategory && <div className="shop-category-strip">{categories.map((category) => <button key={category.id} onClick={() => onCategory(category.id)}><span>{category.name[lang]}</span><Icon name="arrow" /></button>)}</div>}
    <div className="catalog-toolbar"><label className="search-field"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} /></label><button className="button secondary mobile-filter" onClick={() => setFilterOpen(!filterOpen)}>{t.filters}<span>{filterOpen ? "−" : "+"}</span></button><div className="sort-control"><label>{t.sort}</label><select value={sort} onChange={(event) => setSort(event.target.value)} disabled={!availablePriceData}><option value="newest">{t.newest}</option><option value="low">{t.low}</option><option value="high">{t.high}</option></select></div></div>
    <div className="catalog-layout"><aside className={filterOpen ? "filters open" : "filters"}><div className="filter-head"><strong>{t.filters}</strong><button onClick={onClear}>{t.clear}</button></div>{filterCategory ? <><div className="filter-group"><label>{lang === "fr" ? "Sous-catégorie" : "Subcategory"}</label>{filterCategory.subcategories[lang].map((item) => <button className={subcategory === item ? "filter-option active" : "filter-option"} key={item} onClick={() => setSubcategory(subcategory === item ? "" : item)}><span>{item}</span><small>—</small></button>)}</div><div className="planned-filters"><label>{lang === "fr" ? "Filtres prévus" : "Planned filters"}</label>{filterCategory.filters[lang].map((filter) => <span key={filter}>{filter}<small>{lang === "fr" ? "À activer avec les données" : "Enable with data"}</small></span>)}</div></> : <div className="filter-group"><label>{lang === "fr" ? "Catégorie" : "Category"}</label>{categories.map((category) => <button className="filter-option" key={category.id} onClick={() => onCategory(category.id)}><span>{category.name[lang]}</span><small>02</small></button>)}</div>}<div className="pilot-note"><span>i</span><p>{lang === "fr" ? "Le tri par prix et les filtres détaillés s’activent uniquement lorsque les données réelles sont renseignées." : "Price sorting and detailed filters are only enabled once real data is entered."}</p></div></aside><div className="catalog-content"><div className="result-head"><span><strong>{visibleProducts.length}</strong> {t.results}</span><span>{isCategory ? activeCategory.name[lang] : t.shopTitle}</span></div>{visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} lang={lang} onOpen={onProduct} />)}</div> : <div className="empty-state"><div><Icon name="search" size={28} /></div><h2>{t.noResults}</h2><p>{subcategory ? (lang === "fr" ? "Aucun produit n’est encore associé à cette sous-catégorie." : "No product is associated with this subcategory yet.") : t.noResultsText}</p><button className="button secondary" onClick={onClear}>{t.clear}</button></div>}</div></div>
  </section>;
}

function RecommendationSection({ title, products: items, lang, onOpen }: { title: string; products: Product[]; lang: Lang; onOpen: (product: Product) => void }) {
  return <section className="similar-section"><div className="section-heading"><div><span className="eyebrow">{lang === "fr" ? "Suggestions contextuelles" : "Contextual suggestions"}</span><h2>{title}</h2></div></div>{items.length ? <div className="product-grid">{items.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} lang={lang} onOpen={onOpen} />)}</div> : <div className="recommendation-empty">{lang === "fr" ? "Les recommandations apparaîtront lorsque plusieurs produits réels seront ajoutés." : "Recommendations will appear once several real products are added."}</div>}</section>;
}

const faqs = {
  fr: [["Comment commander ?", "Le bouton WhatsApp est activé uniquement quand le produit possède un nom, un prix et une disponibilité vérifiés."], ["Comment la disponibilité est-elle confirmée ?", "La fiche indique l’état renseigné, puis la disponibilité finale est confirmée dans la conversation."], ["Quels sont les délais ?", "Les délais ne sont pas encore définis. Ils seront indiqués uniquement lorsqu’ils seront connus."], ["Comment payer ?", "Les moyens de paiement restent à compléter avant le lancement."], ["Puis-je annuler ?", "Les conditions d’annulation et de retour restent à définir avant toute vente réelle."]],
  en: [["How do I order?", "The WhatsApp button is enabled only when the product has a verified name, price and availability."], ["How is availability confirmed?", "The product page shows the entered status, then final availability is confirmed in the conversation."], ["What are the lead times?", "Lead times are not yet defined. They will only be shown once known."], ["How can I pay?", "Payment methods still need to be completed before launch."], ["Can I cancel?", "Cancellation and return terms must be defined before any real sale."]],
};

function FaqPreview({ lang, onAll }: { lang: Lang; onAll: () => void }) {
  return <section className="section shell faq-preview"><div><span className="eyebrow">FAQ</span><h2>{lang === "fr" ? "Les questions essentielles" : "The essential questions"}</h2><button className="text-link" onClick={onAll}>{lang === "fr" ? "Toutes les réponses" : "All answers"}<Icon name="arrow" /></button></div><div className="accordion">{faqs[lang].slice(0, 3).map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>;
}

function AboutPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return <><section className="inner-hero"><div className="shell"><span className="eyebrow">{lang === "fr" ? "Notre histoire" : "Our story"}</span><h1>{t.aboutTitle}</h1><p>{t.aboutText}</p></div></section><section className="section shell about-grid"><div className="about-image"><img src="https://images.unsplash.com/photo-1612365245546-d424d47bfdb5?auto=format&fit=crop&w=1200&q=85" alt={lang === "fr" ? "Visuel éditorial provisoire" : "Temporary editorial visual"} /><span>Visuel éditorial provisoire · Unsplash</span></div><div className="about-copy"><span className="eyebrow">01 — {lang === "fr" ? "Notre méthode" : "Our method"}</span><h2>{lang === "fr" ? "Vérifier avant de publier." : "Verify before publishing."}</h2><p>{lang === "fr" ? "Le catalogue est organisé autour de six univers réels. Chaque fiche reste en préparation tant que ses photos, son prix et sa disponibilité ne sont pas confirmés." : "The catalogue is organised around six real collections. Each page remains in preparation until its photos, price and availability are confirmed."}</p><div className="values">{(lang === "fr" ? [["Authenticité", "Pas de marque ou photo trompeuse."], ["Clarté", "Les données manquantes sont visibles."], ["Souplesse", "Le catalogue s’enrichit sans refonte."]] : [["Authenticity", "No misleading brand or photo."], ["Clarity", "Missing data stays visible."], ["Flexibility", "The catalogue grows without redesign."]]).map(([title, text], index) => <div key={title}><span>0{index + 1}</span><strong>{title}</strong><p>{text}</p></div>)}</div></div></section><section className="section shell independence"><span>i</span><div><h2>{lang === "fr" ? "Une identité indépendante" : "An independent identity"}</h2><p>{t.independent}</p></div></section></>;
}

function FaqPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return <section className="faq-page shell"><div className="page-intro"><span className="eyebrow">FAQ & {lang === "fr" ? "informations" : "information"}</span><h1>{t.faqTitle}</h1><p>{t.faqText}</p></div><div className="faq-layout"><aside><strong>{lang === "fr" ? "Sur cette page" : "On this page"}</strong>{faqs[lang].map(([question], index) => <span key={question}>0{index + 1} — {question}</span>)}</aside><div className="faq-list">{faqs[lang].map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>0{index + 1}</span>{question}<i>+</i></summary><p>{answer}</p>{index > 1 && <small>{lang === "fr" ? "Contenu à compléter avant lancement." : "Content to complete before launch."}</small>}</details>)}<div className="contact-card"><Icon name="message" size={28} /><div><h3>{lang === "fr" ? "Besoin d’une précision ?" : "Need more information?"}</h3><p>{lang === "fr" ? "Le numéro WhatsApp réel sera configuré séparément." : "The real WhatsApp number will be configured separately."}</p></div></div></div></div></section>;
}

function DesignSystemPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return <section className="system-page shell"><div className="page-intro"><span className="eyebrow">Le Coin ISM / v1.1</span><h1>{t.dsTitle}</h1><p>{t.dsText}</p></div><div className="system-section"><div className="system-title"><span>01</span><h2>{lang === "fr" ? "Couleurs" : "Colours"}</h2></div><div className="swatches">{[["Nuit","navy"],["Ivoire","cream"],["Or doux","gold"],["Sauge","sage"],["Blanc","white"]].map(([name, token]) => <div key={name}><i className={`swatch-${token}`} /><strong>{name}</strong><span>--{token}</span></div>)}</div></div><div className="system-section"><div className="system-title"><span>02</span><h2>{lang === "fr" ? "Composants catalogue" : "Catalogue components"}</h2></div><div className="component-shelf"><button className="button primary">{lang === "fr" ? "Bouton primaire" : "Primary button"}<Icon name="arrow" /></button><button className="button secondary">{lang === "fr" ? "Secondaire" : "Secondary"}</button><Status lang={lang} /><label className="search-field"><Icon name="search" /><input placeholder={t.search} /></label></div></div></section>;
}
