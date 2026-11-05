import { useMemo, useState } from "react";

type Lang = "fr" | "en";
type Page = "home" | "shop" | "category" | "product" | "about" | "faq" | "system";
type CategoryId = "watches" | "jewelry" | "bags" | "scarves" | "fashion" | "tech" | "cosmetics";

type Category = {
  id: CategoryId;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  subcategories: Subcategory[];
  filters: Record<Lang, string[]>;
};

// Une sous-catégorie a un identifiant stable (celui qu'on met dans `subcategory` d'un produit).
// Avec `parent`, elle devient un sous-type : cliquer sur le parent montre toute la sélection.
type Subcategory = { id: string; name: Record<Lang, string>; parent?: string };
const sub = (id: string, fr: string, en: string, parent?: string): Subcategory => ({ id, name: { fr, en }, parent });

// Modèles d'iPhone proposés comme sous-boutons (coques, verres trempés). Pour en ajouter un, l'ajouter à cette liste.
const iphoneModels = ["XR", "11", "11 Pro", "11 Pro Max", "12", "12 Pro", "12 Pro Max", "13", "13 Pro", "13 Pro Max", "14", "14 Plus", "14 Pro", "14 Pro Max", "15", "15 Plus", "15 Pro", "15 Pro Max", "16", "16 Plus", "16 Pro", "16 Pro Max", "17", "17 Air", "17 Pro", "17 Pro Max"];
const modelSubs = (prefix: string, parent: string) =>
  iphoneModels.map((model) => sub(`${prefix}-iphone-${model.toLowerCase().replace(/ /g, "-")}`, `iPhone ${model}`, `iPhone ${model}`, parent));

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
  audience: "men" | "women" | "unisex" | null;
  priceOnRequest: boolean;
  oldPrice?: number; // prix barré affiché à côté du prix promo
  imageFit?: "cover" | "contain";
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
    subcategories: [sub("classic", "Classiques", "Classic"), sub("sports", "Sportives", "Sports"), sub("smart", "Connectées", "Smart watches")],
    filters: { fr: ["Type", "Style", "Couleur", "Prix"], en: ["Type", "Style", "Colour", "Price"] },
  },
  {
    id: "jewelry",
    name: { fr: "Bijoux & style", en: "Jewellery & style" },
    description: {
      fr: "Bracelets, boucles d’oreilles, colliers et bijoux pour hommes selon les références confirmées.",
      en: "Bracelets, earrings, necklaces and men’s jewellery based on confirmed items.",
    },
    subcategories: [sub("bracelets", "Bracelets", "Bracelets"), sub("earrings", "Boucles d’oreilles", "Earrings"), sub("necklaces", "Colliers", "Necklaces")],
    filters: { fr: ["Type", "Style", "Couleur", "Matière"], en: ["Type", "Style", "Colour", "Material"] },
  },
  {
    id: "bags",
    name: { fr: "Sacs & maroquinerie", en: "Bags & leather goods" },
    description: {
      fr: "Sacs à main, sacoches et sacs pour hommes, uniquement parmi les modèles réellement disponibles.",
      en: "Handbags, crossbody bags and men’s bags, limited to models that are genuinely available.",
    },
    subcategories: [sub("handbags", "Sacs à main", "Handbags"), sub("crossbody", "Sacoches", "Crossbody bags"), sub("mens-bags", "Sacs pour homme", "Men’s bags"), sub("other-bags", "Autres sacs", "Other bags")],
    filters: { fr: ["Type", "Couleur", "Style", "Prix"], en: ["Type", "Colour", "Style", "Price"] },
  },
  {
    id: "scarves",
    name: { fr: "Foulards & carrés", en: "Scarves & silk squares" },
    description: {
      fr: "Foulards et carrés de soie classés par imprimé, couleur et style lorsque ces informations sont vérifiées.",
      en: "Scarves and silk squares organised by print, colour and style when that information is verified.",
    },
    subcategories: [sub("scarves", "Foulards", "Scarves"), sub("silk", "Carrés de soie", "Silk squares"), sub("printed", "Imprimés", "Printed"), sub("plain", "Unis", "Plain")],
    filters: { fr: ["Type", "Couleur", "Motif", "Style"], en: ["Type", "Colour", "Pattern", "Style"] },
  },
  {
    id: "fashion",
    name: { fr: "Accessoires de mode", en: "Fashion accessories" },
    description: {
      fr: "Lunettes, ceintures et accessoires de tête selon le catalogue confirmé.",
      en: "Sunglasses, belts and headwear based on the confirmed catalogue.",
    },
    subcategories: [sub("sunglasses", "Lunettes de soleil", "Sunglasses"), sub("belts", "Ceintures", "Belts"), sub("caps", "Casquettes", "Caps"), sub("beanies", "Bonnets", "Beanies"), sub("hats", "Chapeaux", "Hats")],
    filters: { fr: ["Type", "Style", "Couleur", "Taille"], en: ["Type", "Style", "Colour", "Size"] },
  },
  {
    id: "tech",
    name: { fr: "Tech & audio", en: "Tech & audio" },
    description: {
      fr: "Accessoires pour appareils, écouteurs, casques et enceintes dont les caractéristiques sont vérifiées.",
      en: "Device accessories, earphones, headphones and speakers with verified specifications.",
    },
    subcategories: [
      sub("phone", "Téléphone", "Phone"),
      sub("cases", "Coques de téléphone", "Phone cases"),
      ...modelSubs("case", "cases"),
      sub("chargers", "Chargeurs rapides et câbles", "Fast chargers & cables"),
      sub("charger-usbc", "Chargeurs type C", "USB-C chargers", "chargers"),
      sub("charger-iphone", "Chargeurs iPhone", "iPhone chargers", "chargers"),
      sub("charger-samsung", "Chargeurs Samsung mini", "Samsung mini chargers", "chargers"),
      sub("cable-usbc-usbc", "Câble USB-C vers USB-C", "USB-C to USB-C cable", "chargers"),
      sub("cable-usbc-lightning", "Câble USB-C vers Lightning", "USB-C to Lightning cable", "chargers"),
      sub("cable-micro", "Câble Micro USB", "Micro USB cable", "chargers"),
      sub("cable-3in1", "Câble 3 en 1", "3-in-1 cable", "chargers"),
      sub("powerbanks", "Batteries externes", "Power banks"),
      sub("powerbank-10000", "10 000 mAh", "10,000 mAh", "powerbanks"),
      sub("powerbank-15000", "15 000 mAh", "15,000 mAh", "powerbanks"),
      sub("powerbank-20000", "20 000 mAh", "20,000 mAh", "powerbanks"),
      sub("screen", "Verres trempés et protections d’écran", "Tempered glass & screen protectors"),
      ...modelSubs("screen", "screen"),
      sub("stands", "Supports de téléphone", "Phone stands"),
      sub("mics", "Mini-micros pour smartphone", "Smartphone mini microphones"),
      sub("computer", "Ordinateur", "Computer"),
      sub("earbuds", "Écouteurs sans fil", "Wireless earbuds"),
      sub("earbuds-entry", "Entrée de gamme", "Entry level", "earbuds"),
      sub("earbuds-mid", "Milieu de gamme", "Mid-range", "earbuds"),
      sub("earbuds-top", "Haut de gamme", "High-end", "earbuds"),
      sub("earbuds-openear", "Open-ear (à clip)", "Open-ear (clip-on)", "earbuds"),
      sub("wired", "Écouteurs filaires", "Wired earphones"),
      sub("headphones", "Casques", "Headphones"),
      sub("speakers", "Enceintes", "Speakers"),
    ],
    filters: {
      fr: ["Type d’accessoire", "Compatibilité", "Connectivité", "Prix"],
      en: ["Accessory type", "Compatibility", "Connectivity", "Price"],
    },
  },
  {
    id: "cosmetics",
    name: { fr: "Cosmétiques & parfums", en: "Beauty & fragrance" },
    description: {
      fr: "Soins du corps, des cheveux et parfums : gels de douche, shampoings, déodorants, laits de corps, eaux de toilette et parfums.",
      en: "Body care, hair care and fragrance: shower gels, shampoos, deodorants, body milks, eaux de toilette and perfumes.",
    },
    subcategories: [
      sub("shower-gel", "Gels de douche", "Shower gels"),
      sub("shower-milk", "Laits de douche", "Shower milks"),
      sub("bath", "Bains moussants et relaxants", "Bubble & relaxing baths"),
      sub("body-milk", "Laits de corps", "Body milks"),
      sub("balm", "Baumes", "Balms"),
      sub("shampoo", "Shampoings", "Shampoos"),
      sub("conditioner", "Après-shampooings", "Conditioners"),
      sub("hairbrush", "Brosses à cheveux", "Hairbrushes"),
      sub("aftershave", "Lotions après-rasage", "Aftershave lotions"),
      sub("deodorant", "Déodorants", "Deodorants"),
      sub("antiperspirant", "Anti-transpirants", "Antiperspirants"),
      sub("edt", "Eaux de toilette", "Eaux de toilette"),
      sub("perfume", "Parfums", "Perfumes"),
    ],
    filters: {
      fr: ["Type de soin", "Pour qui", "Parfum / senteur", "Contenance", "Prix"],
      en: ["Care type", "For whom", "Scent", "Size", "Price"],
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
    subcategory: "classic",
    audience: "unisex", // à remplacer par "men" ou "women" quand le public est décidé
    description: {
      fr: "Le Day-Date en 36 mm, un format classique pour une montre habillée. Livrée avec sa boîte. Pas de certificat ni de facture d’origine.",
      en: "The Day-Date in 36 mm, a classic size for a dressy watch. Supplied with its box. No original certificate or invoice.",
    },
    features: {
      fr: ["Marque : Rolex", "Modèle : Day-Date 36 mm", "Avec boîte", "Sans certificat ni facture d’origine"],
      en: ["Brand: Rolex", "Model: Day-Date 36 mm", "With box", "No original certificate or invoice"],
    },
    images: ["/rolex-day-date-1.jpg"],
    featured: true,
    price: 16500, // promo
    oldPrice: 20000,
    priceOnRequest: false,
  },
  "watches-slot-2": {
    name: { fr: "Audemars Piguet (modèle à préciser)", en: "Audemars Piguet (model to be specified)" },
    subcategory: "classic",
    audience: "unisex", // à remplacer par "men" ou "women" quand le public est décidé
    description: {
      fr: "Une Audemars Piguet livrée avec sa boîte. Le modèle et la référence restent à préciser.",
      en: "An Audemars Piguet supplied with its box. The model and reference are still to be specified.",
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

// Produits ajoutés en plus des emplacements. Un produit = un objet ci-dessous.
// Les photos sont dans /public. `priceOnRequest: true` est provisoire : remplacer par `price: 5000` (en FCFA)
// quand le prix est connu, et passer `availability` à "available" ou "preorder" pour activer la commande WhatsApp.
const newProduct = (id: string, category: CategoryId, data: Partial<Product>): Product => ({
  id, category, slot: 0, name: null, price: null, description: null, images: [], variants: [],
  availability: "pending", subcategory: null, features: null, addedAt: null, featured: false,
  audience: null, priceOnRequest: true, imageFit: "contain", ...data,
});

// Une couleur = une fiche produit : on voit chaque coloris directement dans la liste, sans devoir cliquer pour en découvrir d'autres.
// `{x}` dans le texte est remplacé par la valeur propre à la couleur (ex. type de câble).
type Colour = { fr: string; en: string; slug: string; images: string[]; x?: [string, string] };
const splitColours = (base: Product, colours: Colour[]): Product[] => colours.map((c) => {
  const fill = (text: string, i: 0 | 1) => (c.x ? text.replace("{x}", c.x[i]) : text);
  return {
    ...base,
    id: `${base.id}-${c.slug}`,
    name: base.name && { fr: `${base.name.fr} – ${c.fr}`, en: `${base.name.en} – ${c.en}` },
    images: c.images,
    variants: [],
    description: base.description && { fr: fill(base.description.fr, 0), en: fill(base.description.en, 1) },
    features: base.features && {
      fr: base.features.fr.map((f) => (/^Coloris :/.test(f) ? `Coloris : ${c.fr.toLowerCase()}` : fill(f, 0))),
      en: base.features.en.map((f) => (/^Colours?:/.test(f) ? `Colour: ${c.en.toLowerCase()}` : fill(f, 1))),
    },
  };
});

// Coque de téléphone : un produit = un modèle d'iPhone (la coque va dans le bouton du modèle).
const caseProduct = (
  id: string, model: string, images: string[],
  name: [string, string], description: [string, string], features: [string[], string[]],
): Product => newProduct(id, "tech", {
  name: { fr: name[0], en: name[1] },
  subcategory: `case-iphone-${model.toLowerCase().replace(/ /g, "-")}`,
  images,
  description: {
    fr: `${description[0]} Compatible uniquement avec l’iPhone ${model} : vérifie le modèle de ton téléphone avant de commander.`,
    en: `${description[1]} Fits the iPhone ${model} only: check your phone model before ordering.`,
  },
  features: { fr: [`Compatible : iPhone ${model}`, ...features[0]], en: [`Fits: iPhone ${model}`, ...features[1]] },
});

const catalogue: Product[] = [
  newProduct("tech-cable-tdkc313-lightning", "tech", {
    name: { fr: "Câble TDKC 313 USB-C vers Lightning 27 W (1 m)", en: "TDKC 313 USB-C to Lightning cable 27 W (1 m)" },
    subcategory: "cable-usbc-lightning",
    images: ["/cable-tdkc313-lightning.jpg"],
    description: {
      fr: "Câble USB-C vers Lightning de 1 m pour charger rapidement un iPhone. L’emballage indique 27 W Power Delivery.",
      en: "1 m USB-C to Lightning cable for fast-charging an iPhone. The packaging states 27 W Power Delivery.",
    },
    features: {
      fr: ["Connecteurs : USB-C et Lightning", "Longueur : 1 m", "Puissance indiquée sur l’emballage : 27 W", "Modèle : TDKC 313"],
      en: ["Connectors: USB-C and Lightning", "Length: 1 m", "Power marked on the packaging: 27 W", "Model: TDKC 313"],
    },
  }),
  newProduct("tech-cable-apple-lightning-1m", "tech", {
    name: { fr: "Câble Apple USB-C vers Lightning (1 m)", en: "Apple USB-C to Lightning cable (1 m)" },
    subcategory: "cable-usbc-lightning",
    images: ["/cable-apple-lightning-1m.jpg"],
    description: {
      fr: "Câble USB-C vers Lightning d’Apple, 1 m, vendu dans sa boîte.",
      en: "Apple USB-C to Lightning cable, 1 m, sold in its box.",
    },
    features: {
      fr: ["Marque : Apple", "Connecteurs : USB-C et Lightning", "Longueur : 1 m", "Avec boîte"],
      en: ["Brand: Apple", "Connectors: USB-C and Lightning", "Length: 1 m", "With box"],
    },
  }),
  newProduct("tech-cable-apple-usbc-2m", "tech", {
    name: { fr: "Câble Apple USB-C (2 m)", en: "Apple USB-C charge cable (2 m)" },
    subcategory: "cable-usbc-usbc",
    images: ["/cable-apple-usbc-2m.jpg"],
    description: {
      fr: "Câble USB-C vers USB-C d’Apple, 2 m : assez long pour charger depuis une prise éloignée du lit. Vendu dans sa boîte.",
      en: "Apple USB-C to USB-C cable, 2 m: long enough to charge from an outlet that is far from the bed. Sold in its box.",
    },
    features: {
      fr: ["Marque : Apple", "Connecteurs : USB-C des deux côtés", "Longueur : 2 m", "Avec boîte"],
      en: ["Brand: Apple", "Connectors: USB-C on both ends", "Length: 2 m", "With box"],
    },
  }),
  newProduct("tech-chargeur-45w-usbc", "tech", {
    name: { fr: "Chargeur 45 W USB-C + câble USB-C vers USB-C", en: "45 W USB-C charger + USB-C to USB-C cable" },
    subcategory: "charger-usbc",
    images: ["/chargeur-45w-usbc.jpg"],
    description: {
      fr: "Chargeur secteur 45 W Power Delivery. Un câble USB-C vers USB-C (5 A) est inclus dans la boîte.",
      en: "45 W Power Delivery wall charger. A USB-C to USB-C cable (5 A) is included in the box.",
    },
    features: {
      fr: ["Puissance indiquée sur l’emballage : 45 W (PD)", "Sortie : USB-C", "Câble USB-C vers USB-C (5 A) inclus", "Prise européenne", "Coloris : noir"],
      en: ["Power marked on the packaging: 45 W (PD)", "Output: USB-C", "USB-C to USB-C (5 A) cable included", "European plug", "Colour: black"],
    },
  }),
  ...splitColours(newProduct("tech-chargeur-iphone-couleurs", "tech", {
    name: { fr: "Chargeur secteur + câble USB-A vers Lightning (iPhone)", en: "Wall charger + USB-A to Lightning cable (iPhone)" },
    subcategory: "charger-iphone",
    images: ["/chargeur-iphone-blanc.jpg", "/chargeur-iphone-orange.jpg", "/chargeur-iphone-jaune.jpg", "/chargeur-iphone-rose.jpg"],
    variants: ["Blanc", "Orange", "Jaune", "Rose"],
    description: {
      fr: "Chargeur secteur USB-A pour iPhone, vendu avec son câble USB-A vers Lightning.",
      en: "USB-A wall charger for iPhone, sold with its USB-A to Lightning cable.",
    },
    features: {
      fr: ["Câble : USB-A vers Lightning inclus", "Pour iPhone", "Prise européenne", "Coloris : blanc, orange, jaune, rose"],
      en: ["Cable: USB-A to Lightning included", "For iPhone", "European plug", "Colours: white, orange, yellow, pink"],
    },
  }), [
    {"fr": "Blanc", "en": "White", "slug": "blanc", "images": ["/chargeur-iphone-blanc.jpg"]},
    {"fr": "Orange", "en": "Orange", "slug": "orange", "images": ["/chargeur-iphone-orange.jpg"]},
    {"fr": "Jaune", "en": "Yellow", "slug": "jaune", "images": ["/chargeur-iphone-jaune.jpg"]},
    {"fr": "Rose", "en": "Pink", "slug": "rose", "images": ["/chargeur-iphone-rose.jpg"]},
  ]),
  newProduct("tech-chargeur-35w-iphone", "tech", {
    name: { fr: "Chargeur 35 W USB-C + câble USB-C vers Lightning", en: "35 W USB-C charger + USB-C to Lightning cable" },
    subcategory: "charger-iphone",
    images: ["/chargeur-35w-lightning-orange.jpg"],
    description: {
      fr: "Chargeur secteur orange de 35 W avec sortie USB-C. Le câble USB-C vers Lightning est inclus.",
      en: "Orange 35 W wall charger with a USB-C output. The USB-C to Lightning cable is included.",
    },
    features: {
      fr: ["Puissance indiquée sur l’emballage : 35 W", "Sortie : USB-C", "Câble USB-C vers Lightning inclus", "Prise européenne", "Coloris : orange"],
      en: ["Power marked on the packaging: 35 W", "Output: USB-C", "USB-C to Lightning cable included", "European plug", "Colour: orange"],
    },
  }),
  newProduct("tech-chargeur-tdkc313-s8", "tech", {
    name: { fr: "Chargeur rapide TDKC 313 S8 + câble USB-A vers USB-C", en: "TDKC 313 S8 fast charger + USB-A to USB-C cable" },
    subcategory: "charger-samsung",
    images: ["/chargeur-s8-noir.jpg"],
    description: {
      fr: "Petit chargeur secteur « Adaptive Fast Charging » à sortie USB-A, vendu avec un câble USB-A vers USB-C.",
      en: "Small “Adaptive Fast Charging” wall charger with a USB-A output, sold with a USB-A to USB-C cable.",
    },
    features: {
      fr: ["Mention « Adaptive Fast Charging » sur l’emballage", "Sortie : USB-A", "Câble USB-A vers USB-C inclus", "Modèle : TDKC 313 S8", "Coloris : noir"],
      en: ["“Adaptive Fast Charging” marked on the packaging", "Output: USB-A", "USB-A to USB-C cable included", "Model: TDKC 313 S8", "Colour: black"],
    },
  }),
  newProduct("tech-chargeur-grand-s6", "tech", {
    name: { fr: "Chargeur rapide GRAND S6 + câble Micro USB", en: "GRAND S6 fast charger + Micro USB cable" },
    subcategory: "charger-samsung",
    images: ["/chargeur-grand-s6-blanc.jpg"],
    description: {
      fr: "Chargeur secteur blanc « Adaptive Fast Charging » à sortie USB-A. Le câble USB-A vers Micro USB est fourni.",
      en: "White “Adaptive Fast Charging” wall charger with a USB-A output. The USB-A to Micro USB cable is supplied.",
    },
    features: {
      fr: ["Mention « Adaptive Fast Charging » sur l’emballage", "Sortie : USB-A", "Câble USB-A vers Micro USB inclus", "Modèle : GRAND S6", "Coloris : blanc"],
      en: ["“Adaptive Fast Charging” marked on the packaging", "Output: USB-A", "USB-A to Micro USB cable included", "Model: GRAND S6", "Colour: white"],
    },
  }),
  newProduct("tech-cable-micro-usb", "tech", {
    name: { fr: "Câble TDKC313 USB-A vers Micro USB", en: "TDKC313 USB-A to Micro USB cable" },
    subcategory: "cable-micro",
    images: ["/cable-micro-usb-tdkc313.jpg"],
    description: {
      fr: "Câble blanc USB-A vers Micro USB, pour la charge et le transfert de données.",
      en: "White USB-A to Micro USB cable, for charging and data transfer.",
    },
    features: {
      fr: ["Connecteurs : USB-A et Micro USB", "Charge rapide et transfert de données (mention de l’emballage)", "Modèle : TDKC313", "Coloris : blanc"],
      en: ["Connectors: USB-A and Micro USB", "Fast charging and data transfer (marked on the packaging)", "Model: TDKC313", "Colour: white"],
    },
  }),
  newProduct("tech-cable-3-en-1", "tech", {
    name: { fr: "Câble 3 en 1 nylon tressé (USB-C, Lightning, Micro USB)", en: "3-in-1 braided nylon cable (USB-C, Lightning, Micro USB)" },
    subcategory: "cable-3in1",
    images: ["/cable-3-en-1.jpg"],
    description: {
      fr: "Un seul câble USB-A, trois embouts : USB-C, Lightning et Micro USB. Gaine en nylon tressé, 1,2 m de long. Pratique quand on a plusieurs appareils différents à charger.",
      en: "One USB-A cable, three tips: USB-C, Lightning and Micro USB. Braided nylon sheath, 1.2 m long. Handy when you have several different devices to charge.",
    },
    features: {
      fr: ["Embouts : USB-C, Lightning, Micro USB", "Longueur : 1,2 m", "Nylon tressé", "Charge et transfert de données (mention de l’emballage)", "Coloris : noir"],
      en: ["Tips: USB-C, Lightning, Micro USB", "Length: 1.2 m", "Braided nylon", "Charging and data transfer (marked on the packaging)", "Colour: black"],
    },
  }),
  newProduct("tech-powerbank-2smc-m8c70", "tech", {
    name: { fr: "Power bank 2SMC M8C70 – 10 000 mAh", en: "2SMC M8C70 power bank – 10,000 mAh" },
    subcategory: "powerbank-10000",
    images: ["/powerbank-2smc-m8c70.jpg"],
    description: {
      fr: "Ce power bank se fixe au dos du téléphone grâce à ses ventouses, et la dragonne passe au poignet ou au sac. 10 000 mAh, 4 câbles intégrés (USB-A, USB-C, Lightning, Micro USB) : le bon câble est toujours là, iPhone ou Android. Câble USB-A vers USB-C fourni, garantie 365 jours.",
      en: "This power bank sticks to the back of your phone with suction cups, and the strap goes round your wrist or on a bag. 10,000 mAh, 4 built-in cables (USB-A, USB-C, Lightning, Micro USB): the right cable is always there, iPhone or Android. USB-A to USB-C cable supplied, 365-day warranty.",
    },
    features: {
      fr: ["Capacité indiquée : 10 000 mAh", "4 câbles intégrés : USB-A, USB-C, Lightning, Micro USB", "Ventouses au dos et dragonne", "Câble USB-A vers USB-C fourni", "Marque : 2SMC – modèle M8C70", "Coloris : noir"],
      en: ["Stated capacity: 10,000 mAh", "4 built-in cables: USB-A, USB-C, Lightning, Micro USB", "Suction cups on the back and wrist strap", "USB-A to USB-C cable supplied", "Brand: 2SMC – model M8C70", "Colour: black"],
    },
  }),
  newProduct("tech-powerbank-aroimac-ard67", "tech", {
    name: { fr: "Power bank Aroimac ARD67 – 10 000 mAh", en: "Aroimac ARD67 power bank – 10,000 mAh" },
    subcategory: "powerbank-10000",
    images: ["/powerbank-aroimac-ard67.jpg"],
    description: {
      fr: "10 000 mAh dans un boîtier blanc fin, facile à glisser dans un sac. Il a 4 câbles de sortie intégrés et une entrée/sortie USB-C, qui sert à le recharger plus vite ou à charger un appareil USB-C. Garantie 365 jours.",
      en: "10,000 mAh in a slim white body that slips easily into a bag. It has 4 built-in output cables and a USB-C input/output, used to recharge it faster or to charge a USB-C device. 365-day warranty.",
    },
    features: {
      fr: ["Capacité indiquée : 10 000 mAh", "4 câbles de sortie intégrés", "Entrée / sortie USB-C", "Protection de sécurité (mention de l’emballage)", "Marque : Aroimac – modèle ARD67", "Coloris : blanc"],
      en: ["Stated capacity: 10,000 mAh", "4 built-in output cables", "USB-C input / output", "Safety protection (marked on the packaging)", "Brand: Aroimac – model ARD67", "Colour: white"],
    },
  }),
  newProduct("tech-powerbank-dakewei-p15", "tech", {
    name: { fr: "Power bank Dakewei DKW-P15 – 10 000 mAh", en: "Dakewei DKW-P15 power bank – 10,000 mAh" },
    subcategory: "powerbank-10000",
    images: ["/powerbank-dakewei-p15.jpg"],
    description: {
      fr: "Un écran LED indique le niveau de charge (25, 50, 75, 100) de ce power bank blanc de 10 000 mAh. Il a 4 câbles intégrés (USB-A, USB-C, Lightning, Micro USB) pour iPhone, Android et accessoires. Câble USB-A vers USB-C fourni, charge rapide annoncée sur l’emballage.",
      en: "An LED screen shows the charge level (25, 50, 75, 100) on this white 10,000 mAh power bank. It has 4 built-in cables (USB-A, USB-C, Lightning, Micro USB) for iPhone, Android and accessories. USB-A to USB-C cable supplied, fast charging stated on the packaging.",
    },
    features: {
      fr: ["Capacité indiquée : 10 000 mAh", "Écran LED du niveau de charge (25 / 50 / 75 / 100)", "4 câbles intégrés : USB-A, USB-C, Lightning, Micro USB", "Câble USB-A vers USB-C fourni", "Marque : Dakewei – modèle DKW-P15", "Coloris : blanc"],
      en: ["Stated capacity: 10,000 mAh", "LED charge-level display (25 / 50 / 75 / 100)", "4 built-in cables: USB-A, USB-C, Lightning, Micro USB", "USB-A to USB-C cable supplied", "Brand: Dakewei – model DKW-P15", "Colour: white"],
    },
  }),
  newProduct("tech-powerbank-tdk551", "tech", {
    name: { fr: "Power bank magnétique TDKC313 TDK551 – 10 000 mAh", en: "TDKC313 TDK551 magnetic power bank – 10,000 mAh" },
    subcategory: "powerbank-10000",
    images: ["/powerbank-tdk551-1.jpg", "/powerbank-tdk551-2.jpg"],
    description: {
      fr: "Il se colle à l’arrière du téléphone grâce à l’aimant et le recharge sans câble (15 W annoncés). Un petit support permet aussi de regarder des vidéos. 10 000 mAh, charge rapide 22,5 W (PD + QC), une sortie USB-C et une sortie USB-A pour charger d’autres appareils en même temps. Câble USB-C vers USB-C et dragonne inclus.",
      en: "It clips magnetically to the back of your phone and charges it without a cable (15 W stated). A small stand also lets you watch videos. 10,000 mAh, 22.5 W fast charging (PD + QC), plus a USB-C and a USB-A output to charge other devices at the same time. USB-C to USB-C cable and strap included.",
    },
    features: {
      fr: ["Capacité indiquée : 10 000 mAh", "Recharge sans fil magnétique : 15 W (mention de l’emballage)", "Puissance indiquée : 22,5 W (PD + QC)", "Entrée / sortie USB-C et sortie USB-A", "Câble USB-C vers USB-C fourni", "Marque : TDKC313 – modèle TDK551", "Coloris : noir"],
      en: ["Stated capacity: 10,000 mAh", "Magnetic wireless charging: 15 W (marked on the packaging)", "Marked power: 22.5 W (PD + QC)", "USB-C input / output and USB-A output", "USB-C to USB-C cable supplied", "Brand: TDKC313 – model TDK551", "Colour: black"],
    },
  }),
  newProduct("tech-powerbank-15000", "tech", {
    name: { fr: "Power bank 15 000 mAh – 4 câbles intégrés", en: "15,000 mAh power bank – 4 built-in cables" },
    subcategory: "powerbank-15000",
    images: ["/powerbank-15000.jpg"],
    description: {
      fr: "15 000 mAh, avec un écran LED qui affiche le pourcentage exact de charge. 4 câbles intégrés (USB-A, USB-C, Lightning, Micro USB) et 4 sorties : téléphone, écouteurs et tablette peuvent se charger ensemble. Charge rapide annoncée sur l’emballage.",
      en: "15,000 mAh, with an LED screen showing the exact charge percentage. 4 built-in cables (USB-A, USB-C, Lightning, Micro USB) and 4 outputs: phone, earbuds and tablet can charge together. Fast charging stated on the packaging.",
    },
    features: {
      fr: ["Capacité indiquée : 15 000 mAh", "Écran LED affichant le pourcentage", "4 câbles intégrés", "4 sorties (mention de l’emballage)", "Charge rapide (mention de l’emballage)", "Coloris : noir"],
      en: ["Stated capacity: 15,000 mAh", "LED screen showing the percentage", "4 built-in cables", "4 outputs (marked on the packaging)", "Fast charging (marked on the packaging)", "Colour: black"],
    },
  }),
  newProduct("tech-powerbank-tdkc313-20000", "tech", {
    name: { fr: "Power bank TDKC313 22,5 W – 20 000 mAh", en: "TDKC313 22.5 W power bank – 20,000 mAh" },
    subcategory: "powerbank-20000",
    images: ["/powerbank-tdkc313-20000.jpg"],
    description: {
      fr: "20 000 mAh dans un format compact. Charge rapide 22,5 W (PD, QC3.0), écran LED du niveau de charge, câble USB-C intégré, plus un câble USB-C vers USB-C fourni. Il convient aux longues journées et aux voyages. Garantie 365 jours.",
      en: "20,000 mAh in a compact format. 22.5 W fast charging (PD, QC3.0), an LED charge-level screen, a built-in USB-C cable, plus a USB-C to USB-C cable supplied. Suited to long days and travel. 365-day warranty.",
    },
    features: {
      fr: ["Capacité indiquée : 20 000 mAh", "Charge rapide indiquée : 22,5 W (PD, QC3.0)", "Écran LED du niveau de charge", "Câble USB-C intégré + câble USB-C vers USB-C fourni", "Marque : TDKC313", "Coloris : blanc"],
      en: ["Stated capacity: 20,000 mAh", "Marked fast charging: 22.5 W (PD, QC3.0)", "LED charge-level display", "Built-in USB-C cable + USB-C to USB-C cable supplied", "Brand: TDKC313", "Colour: white"],
    },
  }),
  newProduct("tech-powerbank-dakewei-p26a", "tech", {
    name: { fr: "Power bank Dakewei DKW-P26A – 20 000 mAh", en: "Dakewei DKW-P26A power bank – 20,000 mAh" },
    subcategory: "powerbank-20000",
    images: ["/powerbank-dakewei-p26a.jpg"],
    description: {
      fr: "20 000 mAh, écran LED du niveau de charge (25, 50, 75, 100), câbles intégrés et dragonne pour le transporter. Un bon choix si tu charges plusieurs appareils ou si tu passes la journée dehors.",
      en: "20,000 mAh, an LED charge-level screen (25, 50, 75, 100), built-in cables and a strap for carrying. A good choice if you charge several devices or spend the whole day out.",
    },
    features: {
      fr: ["Capacité indiquée : 20 000 mAh", "Écran LED du niveau de charge (25 / 50 / 75 / 100)", "Câbles intégrés", "Dragonne", "Marque : Dakewei – modèle DKW-P26A", "Coloris : noir"],
      en: ["Stated capacity: 20,000 mAh", "LED charge-level display (25 / 50 / 75 / 100)", "Built-in cables", "Wrist strap", "Brand: Dakewei – model DKW-P26A", "Colour: black"],
    },
  }),
  newProduct("tech-earbuds-langeer-lge-ne55", "tech", {
    name: { fr: "Écouteurs open-ear Langeer LGE-NE55", en: "Langeer LGE-NE55 open-ear earphones" },
    subcategory: "earbuds-openear",
    images: ["/earbuds-langeer-lge-ne55-1.jpg", "/earbuds-langeer-lge-ne55-2.jpg"],
    description: {
      fr: "Ces écouteurs à clip se posent sur l’oreille sans la boucher : tu entends toujours ce qui se passe autour. Commandes tactiles, micro HD pour les appels, son Hi-Fi avec extra bass, et boîtier de charge USB-C argenté. Câble de charge et embouts fournis.",
      en: "These clip-on earbuds sit on the ear without blocking it, so you still hear what’s going on around you. Touch controls, an HD mic for calls, Hi-Fi sound with extra bass, and a silver USB-C charging case. Charging cable and ear tips supplied.",
    },
    features: {
      fr: ["Format open-ear à clip", "Commandes tactiles", "Micro HD intégré", "Son Hi-Fi, extra bass", "Portée indiquée : 10 m ou plus", "Autonomie indiquée : écoute 3 à 4 h, appels 4 h ou plus", "Résistance à l’eau et à la transpiration (mention de l’emballage)", "Boîtier de charge USB-C", "Marque : Langeer – modèle LGE-NE55", "Coloris : argent"],
      en: ["Clip-on open-ear design", "Touch controls", "Built-in HD microphone", "Hi-Fi sound, extra bass", "Stated range: 10 m or more", "Stated battery life: playback 3–4 h, calls 4 h or more", "Water and sweat resistance (marked on the packaging)", "USB-C charging case", "Brand: Langeer – model LGE-NE55", "Colour: silver"],
    },
  }),
  newProduct("tech-earbuds-freeclip-lge-08", "tech", {
    name: { fr: "Écouteurs open-ear FreeClip LGE-08", en: "FreeClip LGE-08 open-ear earbuds" },
    subcategory: "earbuds-openear",
    images: ["/earbuds-freeclip-lge-08.jpg"],
    description: {
      fr: "Open-ear, noirs et légers : l’oreille reste libre. Son Hi-Fi, longue autonomie annoncée, boîtier de charge USB-C. Câble de charge et 4 embouts fournis.",
      en: "Open-ear, black and light: your ear stays free. Hi-Fi sound, long battery life stated, USB-C charging case. Charging cable and 4 ear tips supplied.",
    },
    features: {
      fr: ["Format open-ear", "Son Hi-Fi", "Longue autonomie (mention de l’emballage)", "Design léger", "Câble USB-A vers USB-C et 4 embouts fournis", "Marque : FreeClip – modèle LGE-08", "Coloris : noir"],
      en: ["Open-ear design", "Hi-Fi sound", "Long battery life (marked on the packaging)", "Lightweight design", "USB-A to USB-C cable and 4 ear tips supplied", "Brand: FreeClip – model LGE-08", "Colour: black"],
    },
  }),
  newProduct("tech-earbuds-seufre", "tech", {
    name: { fr: "Écouteurs Bluetooth open-ear Seufre", en: "Seufre open-ear Bluetooth earphones" },
    subcategory: "earbuds-openear",
    images: ["/earbuds-seufre.jpg"],
    description: {
      fr: "Bluetooth 5.3 et crochet d’oreille pour qu’ils tiennent en place, au sport comme en cours. Son Hi-Fi, boîtier de charge avec affichage LED du niveau de batterie, pochette de rangement avec mousqueton fournie.",
      en: "Bluetooth 5.3 and an ear hook to keep them in place, at the gym or in class. Hi-Fi sound, a charging case with an LED battery display, and a storage pouch with carabiner supplied.",
    },
    features: {
      fr: ["Bluetooth 5.3", "Crochet d’oreille, port confortable", "Son Hi-Fi", "Boîtier de charge avec affichage LED", "Câble USB-A vers USB-C, 6 embouts et pochette fournis", "Marque : Seufre", "Coloris : noir"],
      en: ["Bluetooth 5.3", "Ear-hook design, comfortable fit", "Hi-Fi sound", "Charging case with LED display", "USB-A to USB-C cable, 6 ear tips and pouch supplied", "Brand: Seufre", "Colour: black"],
    },
  }),
  newProduct("tech-earbuds-calus-m02-prox", "tech", {
    name: { fr: "Écouteurs open-ear Calus M02 PROX", en: "Calus M02 PROX open-ear earbuds" },
    subcategory: "earbuds-openear",
    images: ["/earbuds-calus-m02-prox.jpg"],
    description: {
      fr: "Noirs, à clip, en Bluetooth 5.3, pour la musique, les appels et le jeu. Basses profondes, latence annoncée nulle, connexion stable. Livrés avec câble de charge et 6 embouts.",
      en: "Black, clip-on, Bluetooth 5.3, for music, calls and gaming. Deep bass, zero latency stated, stable connection. Supplied with a charging cable and 6 ear tips.",
    },
    features: {
      fr: ["Bluetooth 5.3", "Son Hi-Fi, basses profondes", "Latence nulle annoncée, son surround 360° (mention de l’emballage)", "Pour musique, appels et jeu", "Câble USB-A vers USB-C et 6 embouts fournis", "Marque : Calus – modèle M02 PROX", "Coloris : noir"],
      en: ["Bluetooth 5.3", "Hi-Fi sound, deep bass", "Zero delay and 360° surround (marked on the packaging)", "For music, calls and gaming", "USB-A to USB-C cable and 6 ear tips supplied", "Brand: Calus – model M02 PROX", "Colour: black"],
    },
  }),
  newProduct("tech-earbuds-oraimo-i12", "tech", {
    name: { fr: "Écouteurs sans fil oraimo i12-TWS", en: "oraimo i12-TWS wireless earbuds" },
    subcategory: "earbuds-entry",
    images: ["/earbuds-oraimo-i12.jpg"],
    description: {
      fr: "Simples et blancs, sans fil. Chaque écouteur tient environ 2,5 h, et le boîtier de 350 mAh les recharge environ 4 fois. Une bonne façon de passer au sans fil pour une première paire.",
      en: "Simple and white, wireless. Each earbud lasts about 2.5 h, and the 350 mAh case recharges them about 4 times. A good way to go wireless with a first pair.",
    },
    features: {
      fr: ["Autonomie indiquée : 2,5 h par charge des écouteurs (35 mAh)", "Boîtier de charge 350 mAh : environ 4 recharges", "Son Hi-Fi, connexion stable", "Design léger", "Câble de charge USB-A vers Micro USB fourni", "Marque : oraimo – modèle i12-TWS", "Coloris : blanc"],
      en: ["Stated battery life: 2.5 h per charge (35 mAh earbuds)", "350 mAh charging case: about 4 recharges", "Hi-Fi sound, stable connection", "Lightweight design", "USB-A to Micro USB charging cable supplied", "Brand: oraimo – model i12-TWS", "Colour: white"],
    },
  }),
  newProduct("tech-earbuds-tws-blanc-etui", "tech", {
    name: { fr: "Écouteurs sans fil TWS blancs avec étui silicone", en: "White TWS wireless earbuds with silicone case" },
    subcategory: "earbuds-mid",
    images: ["/earbuds-tws-blanc-etui.jpg"],
    description: {
      fr: "Blancs, sans fil, avec micro pour les appels et son Hi-Fi. Dans la boîte : boîtier de charge compact, étui en silicone avec mousqueton, 6 embouts et un câble USB-A vers USB-C.",
      en: "White, wireless, with a mic for calls and Hi-Fi sound. In the box: a compact charging case, a silicone pouch with carabiner, 6 ear tips and a USB-A to USB-C cable.",
    },
    features: {
      fr: ["Micro intégré pour les appels", "Son Hi-Fi", "Longue autonomie (mention de l’emballage)", "Étui silicone avec mousqueton, 6 embouts et câble USB-A vers USB-C fournis", "Coloris : blanc"],
      en: ["Built-in microphone for calls", "Hi-Fi sound", "Long battery life (marked on the packaging)", "Silicone case with carabiner, 6 ear tips and USB-A to USB-C cable supplied", "Colour: white"],
    },
  }),
  newProduct("tech-earbuds-true-wireless-blanc", "tech", {
    name: { fr: "Écouteurs True Wireless blancs", en: "White True Wireless earbuds" },
    subcategory: "earbuds-mid",
    images: ["/earbuds-true-wireless-blanc.jpg"],
    description: {
      fr: "Blancs, sans fil, avec un boîtier de charge compact. Port confortable, son de qualité, connexion stable et longue autonomie annoncée.",
      en: "White, wireless, with a compact charging case. Comfortable fit, quality sound, stable connection and long battery life stated.",
    },
    features: {
      fr: ["Son Hi-Fi", "Longue autonomie (mention de l’emballage)", "Connexion stable", "Design léger et port confortable", "Coloris : blanc"],
      en: ["Hi-Fi sound", "Long battery life (marked on the packaging)", "Stable connection", "Lightweight design and comfortable fit", "Colour: white"],
    },
  }),
  newProduct("tech-earbuds-airpods-3", "tech", {
    name: { fr: "AirPods 3", en: "AirPods 3" },
    subcategory: "earbuds-mid",
    images: ["/earbuds-airpods-3.jpg"],
    description: {
      fr: "Sans embouts et légers, ils se connectent facilement à un iPhone. Dans la boîte : boîtier de charge, câble USB-C vers Lightning et notice.",
      en: "No ear tips and lightweight, they connect easily to an iPhone. In the box: charging case, USB-C to Lightning cable and instructions.",
    },
    features: {
      fr: ["Modèle : AirPods 3", "Boîtier de charge inclus", "Câble USB-C vers Lightning fourni", "Avec boîte et notice", "Coloris : blanc"],
      en: ["Model: AirPods 3", "Charging case included", "USB-C to Lightning cable supplied", "With box and manual", "Colour: white"],
    },
  }),
  newProduct("tech-earbuds-airpods-pro", "tech", {
    name: { fr: "AirPods Pro", en: "AirPods Pro" },
    subcategory: "earbuds-top",
    images: ["/earbuds-airpods-pro.jpg"],
    description: {
      fr: "Embouts en silicone pour un port bien ajusté. Boîtier de charge, câble USB-C vers USB-C et notice dans la boîte. C’est le modèle haut de gamme de notre sélection d’écouteurs.",
      en: "Silicone ear tips for a snug fit. Charging case, USB-C to USB-C cable and instructions in the box. This is the high-end model of our earbud selection.",
    },
    features: {
      fr: ["Modèle : AirPods Pro", "Embouts en silicone", "Boîtier de charge inclus", "Câble USB-C vers USB-C fourni", "Avec boîte et notice", "Coloris : blanc"],
      en: ["Model: AirPods Pro", "Silicone ear tips", "Charging case included", "USB-C to USB-C cable supplied", "With box and manual", "Colour: white"],
    },
  }),
  newProduct("tech-earbuds-free-buds-lge-20", "tech", {
    name: { fr: "Écouteurs Bluetooth Free Buds LGE-20", en: "Free Buds LGE-20 Bluetooth earbuds" },
    subcategory: "earbuds-mid",
    images: ["/earbuds-free-buds-lge-20.jpg"],
    description: {
      fr: "Intra-auriculaires Bluetooth 5.3 noirs, avec isolation du bruit, basses précises et micro pour les appels. Le boîtier affiche le niveau de batterie en pourcentage. Jusqu’à 5,5 h d’écoute par charge, 20 h avec le boîtier. Câble USB-A vers USB-C fourni.",
      en: "Black in-ear Bluetooth 5.3 earbuds with noise isolation, precise bass and a mic for calls. The case shows the battery level as a percentage. Up to 5.5 h of listening per charge, 20 h with the case. USB-A to USB-C cable supplied.",
    },
    features: {
      fr: ["Bluetooth 5.3", "Isolation du bruit, basses précises, son Hi-Fi", "Micro intégré", "Autonomie indiquée : 5,5 h par charge, jusqu’à 20 h avec le boîtier", "Boîtier de charge avec affichage LED du niveau de batterie", "Résistance à l’eau IPX5 (mention de l’emballage)", "Câble USB-A vers USB-C fourni", "Modèle : Free Buds LGE-20", "Coloris : noir"],
      en: ["Bluetooth 5.3", "Noise isolation, precise bass, Hi-Fi sound", "Built-in microphone", "Stated battery life: 5.5 h per charge, up to 20 h with the case", "Charging case with LED battery display", "IPX5 water resistance (marked on the packaging)", "USB-A to USB-C cable supplied", "Model: Free Buds LGE-20", "Colour: black"],
    },
  }),
  newProduct("tech-earbuds-ormushie-oms-free", "tech", {
    name: { fr: "Écouteurs à clip Ormushie OMS-FREE", en: "Ormushie OMS-FREE clip-on earphones" },
    subcategory: "earbuds-openear",
    images: ["/earbuds-ormushie-oms-free.jpg"],
    description: {
      fr: "Le boîtier en tissu et les finitions brillantes donnent à ces écouteurs à clip un look soigné. Ils se portent confortablement sur l’oreille, avec un son Hi-Fi (Hi-Res Audio), des basses renforcées et une bonne qualité d’appel. Câble USB-A vers USB-C, 6 embouts et notice fournis.",
      en: "The fabric case and glossy finishes give these clip-on earbuds a neat look. They sit comfortably on the ear, with Hi-Fi sound (Hi-Res Audio), boosted bass and good call quality. USB-A to USB-C cable, 6 ear tips and instructions supplied.",
    },
    features: {
      fr: ["Format à clip, port confortable", "Son Hi-Fi, Hi-Res Audio (mention de l’emballage)", "Basses renforcées", "Pour appels téléphoniques", "Câble USB-A vers USB-C et 6 embouts fournis", "Marque : Ormushie – modèle OMS-FREE", "Coloris visibles sur l’emballage : noir, beige doré, violet"],
      en: ["Clip-on design, comfortable fit", "Hi-Fi sound, Hi-Res Audio (marked on the packaging)", "Enhanced bass", "For phone calls", "USB-A to USB-C cable and 6 ear tips supplied", "Brand: Ormushie – model OMS-FREE", "Colours shown on the packaging: black, gold beige, purple"],
    },
  }),
  ...splitColours(newProduct("tech-casque-sony-wh-xm5", "tech", {
    name: { fr: "Casque sans fil Sony WH-XM5 à réduction de bruit", en: "Sony WH-XM5 wireless noise-cancelling headphones" },
    subcategory: "headphones",
    images: ["/casque-sony-wh-xm5-blanc.jpg", "/casque-sony-wh-xm5-noir.jpg"],
    variants: ["Blanc", "Noir"],
    description: {
      fr: "Réduction de bruit active, jusqu’à 30 h d’autonomie annoncées et son 360 Reality Audio. Utile pour réviser, dans les transports ou en voyage. Livré avec étui de transport, câble USB-A vers USB-C, câble audio jack 3,5 mm et adaptateur avion.",
      en: "Active noise cancelling, up to 30 h of stated battery life and 360 Reality Audio. Useful for revising, on public transport or when travelling. Supplied with a carrying case, USB-A to USB-C cable, 3.5 mm audio cable and airplane adapter.",
    },
    features: {
      fr: ["Réduction de bruit active", "Autonomie indiquée : 30 h", "360 Reality Audio (mention de l’emballage)", "Étui, câble USB-A vers USB-C, câble jack 3,5 mm et adaptateur avion fournis", "Marque : Sony – modèle WH-XM5", "Coloris : blanc, noir"],
      en: ["Active noise cancelling", "Stated battery life: 30 h", "360 Reality Audio (marked on the packaging)", "Case, USB-A to USB-C cable, 3.5 mm audio cable and airplane adapter supplied", "Brand: Sony – model WH-XM5", "Colours: white, black"],
    },
  }), [
    {"fr": "Blanc", "en": "White", "slug": "blanc", "images": ["/casque-sony-wh-xm5-blanc.jpg"]},
    {"fr": "Noir", "en": "Black", "slug": "noir", "images": ["/casque-sony-wh-xm5-noir.jpg"]},
  ]),
  ...splitColours(newProduct("tech-casque-jbl-pure-bass-a18", "tech", {
    name: { fr: "Casque Bluetooth JBL Pure Bass A18", en: "JBL Pure Bass A18 Bluetooth headphones" },
    subcategory: "headphones",
    images: ["/casque-jbl-a18-orange.jpg", "/casque-jbl-a18-blanc.jpg", "/casque-jbl-a18-gris.jpg", "/casque-jbl-a18-noir.jpg"],
    variants: ["Orange", "Blanc", "Gris", "Noir"],
    description: {
      fr: "Casque Bluetooth léger et pliable, au son Hi-Fi avec des basses marquées. Il se range dans sa pochette, facile à glisser dans un sac pour aller en cours. Câble USB-A vers Micro USB fourni.",
      en: "Light, foldable Bluetooth headphones with Hi-Fi sound and strong bass. They fit in their pouch, easy to slip into a bag for class. USB-A to Micro USB cable supplied.",
    },
    features: {
      fr: ["Bluetooth", "Son Hi-Fi, Pure Bass", "Pliable et léger", "Port confortable", "Pochette et câble USB-A vers Micro USB fournis", "Marque : JBL – modèle Pure Bass A18", "Coloris : orange, blanc, gris, noir"],
      en: ["Bluetooth", "Hi-Fi sound, Pure Bass", "Foldable and lightweight", "Comfortable fit", "Pouch and USB-A to Micro USB cable supplied", "Brand: JBL – model Pure Bass A18", "Colours: orange, white, grey, black"],
    },
  }), [
    {"fr": "Orange", "en": "Orange", "slug": "orange", "images": ["/casque-jbl-a18-orange.jpg"]},
    {"fr": "Blanc", "en": "White", "slug": "blanc", "images": ["/casque-jbl-a18-blanc.jpg"]},
    {"fr": "Gris", "en": "Grey", "slug": "gris", "images": ["/casque-jbl-a18-gris.jpg"]},
    {"fr": "Noir", "en": "Black", "slug": "noir", "images": ["/casque-jbl-a18-noir.jpg"]},
  ]),
  newProduct("tech-casque-jbl-live-660nc", "tech", {
    name: { fr: "Casque Bluetooth JBL Live 660NC à réduction de bruit", en: "JBL Live 660NC Bluetooth noise-cancelling headphones" },
    subcategory: "headphones",
    images: ["/casque-jbl-live-660nc.jpg"],
    description: {
      fr: "Réduction de bruit active, jusqu’à 50 h d’autonomie annoncées sur l’emballage, et appairage rapide Fast Pair pour se connecter vite à un téléphone Android. Coloris noir.",
      en: "Active noise cancelling, up to 50 h of battery life stated on the packaging, and Fast Pair for connecting quickly to an Android phone. Black.",
    },
    features: {
      fr: ["Réduction de bruit active", "Bluetooth", "Autonomie indiquée : 50 h", "Fast Pair", "Marque : JBL – modèle Live 660NC", "Coloris : noir"],
      en: ["Active noise cancelling", "Bluetooth", "Stated battery life: 50 h", "Fast Pair", "Brand: JBL – model Live 660NC", "Colour: black"],
    },
  }),
  newProduct("tech-casque-jbl-super-bass-i12", "tech", {
    name: { fr: "Casque Bluetooth JBL Super Bass I12", en: "JBL Super Bass I12 Bluetooth headphones" },
    subcategory: "headphones",
    images: ["/casque-jbl-super-bass-i12.jpg"],
    description: {
      fr: "Casque Bluetooth circum-aural conçu pour les basses : grands coussinets, arceau rembourré, commandes sur l’oreillette pour la musique et les appels. En noir.",
      en: "Over-ear Bluetooth headphones designed for bass: large ear cushions, a padded headband and controls on the earcup for music and calls. In black.",
    },
    features: {
      fr: ["Bluetooth", "Super Bass", "Grands coussinets, arceau rembourré", "Boutons de commande sur l’oreillette", "Marque : JBL – modèle I12", "Coloris : noir"],
      en: ["Bluetooth", "Super Bass", "Large ear cushions, padded headband", "Control buttons on the earcup", "Brand: JBL – model I12", "Colour: black"],
    },
  }),
  ...splitColours(newProduct("tech-casque-airpods-max", "tech", {
    name: { fr: "AirPods Max", en: "AirPods Max" },
    subcategory: "headphones",
    images: ["/casque-airpods-max-boite.jpg", "/casque-airpods-max-argent.jpg", "/casque-airpods-max-vert.jpg", "/casque-airpods-max-bleu.jpg", "/casque-airpods-max-rouge.jpg", "/casque-airpods-max-noir.jpg"],
    variants: ["Argent", "Vert", "Bleu", "Rouge", "Noir"],
    description: {
      fr: "Structure en aluminium, mailles et coussinets enveloppants. Livré dans sa boîte avec son étui, un câble USB-C vers USB-C et la notice.",
      en: "Aluminium structure, mesh and enveloping ear cushions. Supplied in its box with its case, a USB-C to USB-C cable and the instructions.",
    },
    features: {
      fr: ["Modèle : AirPods Max", "Étui, câble USB-C vers USB-C et notice fournis", "Avec boîte", "Coloris : argent, vert, bleu, rouge, noir"],
      en: ["Model: AirPods Max", "Case, USB-C to USB-C cable and manual supplied", "With box", "Colours: silver, green, blue, red, black"],
    },
  }), [
    {"fr": "Argent", "en": "Silver", "slug": "argent", "images": ["/casque-airpods-max-argent.jpg", "/casque-airpods-max-boite.jpg"]},
    {"fr": "Vert", "en": "Green", "slug": "vert", "images": ["/casque-airpods-max-vert.jpg", "/casque-airpods-max-boite.jpg"]},
    {"fr": "Bleu", "en": "Blue", "slug": "bleu", "images": ["/casque-airpods-max-bleu.jpg", "/casque-airpods-max-boite.jpg"]},
    {"fr": "Rouge", "en": "Red", "slug": "rouge", "images": ["/casque-airpods-max-rouge.jpg", "/casque-airpods-max-boite.jpg"]},
    {"fr": "Noir", "en": "Black", "slug": "noir", "images": ["/casque-airpods-max-noir.jpg", "/casque-airpods-max-boite.jpg"]},
  ]),
  newProduct("tech-casque-bose-quietcomfort-ultra", "tech", {
    name: { fr: "Casque Bose QuietComfort Ultra", en: "Bose QuietComfort Ultra headphones" },
    subcategory: "headphones",
    images: ["/casque-bose-quietcomfort-ultra.jpg"],
    description: {
      fr: "Réduction de bruit, son premium, longue autonomie annoncée et coussinets doux pour les longues écoutes. Livré avec un étui rigide, un câble USB-A vers USB-C et un câble audio jack 3,5 mm. Coloris noir.",
      en: "Noise cancelling, premium sound, long stated battery life and soft cushions for long listening sessions. Supplied with a hard case, a USB-A to USB-C cable and a 3.5 mm audio cable. Black.",
    },
    features: {
      fr: ["Réduction de bruit", "Son premium, longue autonomie (mention de l’emballage)", "Port confortable", "Étui rigide, câble USB-A vers USB-C et câble jack 3,5 mm fournis", "Marque : Bose – modèle QuietComfort Ultra", "Coloris : noir"],
      en: ["Noise cancelling", "Premium sound, long battery life (marked on the packaging)", "Comfortable fit", "Hard case, USB-A to USB-C cable and 3.5 mm audio cable supplied", "Brand: Bose – model QuietComfort Ultra", "Colour: black"],
    },
  }),
  caseProduct("tech-coque-14plus-alveoles-violet", "14 Plus", ["/coque-14plus-alveoles-violet.jpg"],
    ["Coque alvéoles violette – iPhone 14 Plus", "Purple honeycomb case – iPhone 14 Plus"],
    ["Violette, avec un motif alvéolé (hexagones) brillant. Elle sort du lot sans être chargée.", "Purple, with a glossy honeycomb (hexagon) pattern. It stands out without being busy."],
    [["Motif alvéoles (hexagones)", "Boutons recouverts", "Coloris : violet"], ["Honeycomb (hexagon) pattern", "Covered buttons", "Colour: purple"]]),
  caseProduct("tech-coque-13pro-monogramme-marron", "13 Pro", ["/coque-13pro-monogramme-marron-1.jpg", "/coque-13pro-monogramme-marron-2.jpg"],
    ["Coque marron à motif monogramme – iPhone 13 Pro", "Brown monogram-pattern case – iPhone 13 Pro"],
    ["Finition aspect cuir marron avec un monogramme en relief, entourée de bords noirs. Un style plutôt classique.", "Brown leather-look finish with an embossed monogram, framed by black edges. A rather classic style."],
    [["Finition aspect cuir, motif monogramme en relief", "Bords noirs", "Coloris : marron"], ["Leather-look finish, embossed monogram pattern", "Black edges", "Colour: brown"]]),
  caseProduct("tech-coque-15-magsafe-transparente", "15", ["/coque-15-magsafe-transparente.jpg"],
    ["Coque transparente MagSafe antichoc – iPhone 15", "Clear shockproof MagSafe case – iPhone 15"],
    ["Transparente, elle laisse voir la couleur de ton iPhone. Coins renforcés et anneau MagSafe pour la poser sur un chargeur ou un support magnétique.", "Clear, so your iPhone’s colour still shows. Reinforced corners and a MagSafe ring for placing it on a magnetic charger or mount."],
    [["Transparente", "Coins renforcés antichoc", "Anneau MagSafe visible", "Coloris : transparent"], ["Clear", "Reinforced shockproof corners", "MagSafe ring visible", "Colour: clear"]]),
  caseProduct("tech-coque-12pro-magsafe-gris-mat", "12 Pro", ["/coque-12pro-magsafe-gris-mat.jpg"],
    ["Coque MagSafe gris mat, bord noir – iPhone 12 Pro", "Matte grey MagSafe case with black edge – iPhone 12 Pro"],
    ["Dos gris mat translucide, bord noir et anneau MagSafe. Une couleur neutre qui va avec tout.", "Translucent matte grey back, black edge and a MagSafe ring. A neutral colour that goes with everything."],
    [["Dos gris mat, bord noir", "Anneau MagSafe visible", "Coloris : gris / noir"], ["Matte grey back, black edge", "MagSafe ring visible", "Colour: grey / black"]]),
  caseProduct("tech-coque-16pro-orange-tisse", "16 Pro", ["/coque-16pro-orange-tisse.jpg"],
    ["Coque orange motif tissé – iPhone 16 Pro", "Orange woven-pattern case – iPhone 16 Pro"],
    ["Orange brillant, avec un motif tissé noir et beige. Un protège-objectifs doré est intégré autour des caméras.", "Glossy orange with a black and beige woven pattern. A gold lens protector is built in around the cameras."],
    [["Finition brillante, motif tissé noir et beige", "Contours dorés autour des caméras", "Coloris : orange"], ["Glossy finish, black and beige woven pattern", "Gold rings around the cameras", "Colour: orange"]]),
  caseProduct("tech-coque-17pro-noire-tisse", "17 Pro", ["/coque-17pro-noire-tisse.jpg"],
    ["Coque noire motif tissé – iPhone 17 Pro", "Black woven-pattern case – iPhone 17 Pro"],
    ["Noire brillante, motif tissé gris et noir, contours argentés autour des caméras.", "Glossy black, grey and black woven pattern, silver trim around the cameras."],
    [["Finition brillante, motif tissé noir et gris", "Contours argentés autour des caméras", "Coloris : noir"], ["Glossy finish, black and grey woven pattern", "Silver rings around the cameras", "Colour: black"]]),
  caseProduct("tech-coque-14pro-magsafe-blanche", "14 Pro", ["/coque-14pro-magsafe-blanche.jpg"],
    ["Coque transparente blanche MagSafe – iPhone 14 Pro", "White-tinted clear MagSafe case – iPhone 14 Pro"],
    ["Dos blanc cassé transparent, anneau MagSafe sombre et coins renforcés pour protéger les angles du téléphone.", "Transparent off-white back, dark MagSafe ring and reinforced corners to protect the phone’s corners."],
    [["Dos blanc cassé, transparente", "Coins renforcés", "Anneau MagSafe visible", "Coloris : blanc / transparent"], ["Off-white back, clear", "Reinforced corners", "MagSafe ring visible", "Colour: white / clear"]]),
  caseProduct("tech-coque-13pro-fleurs-violet", "13 Pro", ["/coque-13pro-fleurs-violet.jpg"],
    ["Coque violette fleurs et papillon « Smile » – iPhone 13 Pro", "Purple flowers and butterfly “Smile” case – iPhone 13 Pro"],
    ["Violette, décorée de fleurs en relief, de perles et d’un papillon translucide, avec le message « A smile is the prettiest thing you can wear ». Pour celles qui aiment les coques colorées et pleines de détails.", "Purple, decorated with embossed flowers, pearls and a translucent butterfly, with the message “A smile is the prettiest thing you can wear”. For those who like colourful cases full of detail."],
    [["Décor 3D : fleurs, perles et papillon", "Message « Nice / Smile »", "Coloris : violet"], ["3D decoration: flowers, pearls and butterfly", "“Nice / Smile” message", "Colour: purple"]]),
  caseProduct("tech-coque-14pro-fumee-phone-case", "14 Pro", ["/coque-14pro-fumee-phone-case.jpg"],
    ["Coque fumée transparente – iPhone 14 Pro", "Smoke-tint clear case – iPhone 14 Pro"],
    ["Transparente teintée fumée, avec un motif en relief et des coins renforcés. Elle reste sombre tout en laissant voir le téléphone.", "Smoke-tinted transparent, with a raised pattern and reinforced corners. It stays dark while still showing the phone."],
    [["Transparente teintée fumée", "Motif en relief", "Coins renforcés", "Coloris : fumé / noir"], ["Smoke-tinted clear", "Embossed pattern", "Reinforced corners", "Colour: smoke / black"]]),
  caseProduct("tech-coque-14pro-rose-transparente", "14 Pro", ["/coque-14pro-rose-transparente.jpg"],
    ["Coque rose à bord transparent – iPhone 14 Pro", "Pink case with clear edge – iPhone 14 Pro"],
    ["Rose vif brillant, avec un bord transparent antichoc qui protège les coins.", "Bright glossy pink, with a transparent shockproof edge that protects the corners."],
    [["Dos rose brillant, bord transparent", "Coins renforcés", "Coloris : rose"], ["Glossy pink back, clear edge", "Reinforced corners", "Colour: pink"]]),
  caseProduct("tech-coque-14pro-magsafe-bronze", "14 Pro", ["/coque-14pro-magsafe-bronze.jpg"],
    ["Coque MagSafe doré / bronze – iPhone 14 Pro", "Gold / bronze MagSafe case – iPhone 14 Pro"],
    ["Dos doré translucide, bord bronze et anneau MagSafe. Des tons chauds qui font ressortir la couleur du téléphone.", "Translucent gold back, bronze edge and a MagSafe ring. Warm tones that bring out the phone’s colour."],
    [["Dos doré, bord bronze", "Anneau MagSafe visible", "Coloris : doré / bronze"], ["Gold back, bronze edge", "MagSafe ring visible", "Colour: gold / bronze"]]),
  caseProduct("tech-coque-13promax-strass-papillon", "13 Pro Max", ["/coque-13promax-strass-papillon.jpg"],
    ["Coque transparente strass dorés et papillon – iPhone 13 Pro Max", "Clear case with gold rhinestones and butterfly – iPhone 13 Pro Max"],
    ["Fond doré pailleté entouré de strass, avec un papillon en relief. Les coins sont renforcés. Une coque pour celles qui aiment ce qui brille.", "Glittery gold background surrounded by rhinestones, with an embossed butterfly. The corners are reinforced. A case for those who like things that sparkle."],
    [["Strass et contour doré", "Fond pailleté, papillon décoratif", "Coins renforcés", "Coloris : transparent / doré"], ["Rhinestones and gold frame", "Glitter background, decorative butterfly", "Reinforced corners", "Colour: clear / gold"]]),
  caseProduct("tech-coque-13promax-alveoles-noire", "13 Pro Max", ["/coque-13promax-alveoles-noire.jpg"],
    ["Coque fumée alvéoles antichoc – iPhone 13 Pro Max", "Smoke honeycomb shockproof case – iPhone 13 Pro Max"],
    ["Noire fumée, motif alvéolé, coins renforcés pour mieux encaisser les chutes.", "Smoked black, honeycomb pattern, reinforced corners to better absorb drops."],
    [["Motif alvéoles", "Coins renforcés antichoc", "Coloris : noir fumé"], ["Honeycomb pattern", "Reinforced shockproof corners", "Colour: smoke black"]]),
  caseProduct("tech-coque-13promax-strass-vert-dragonne", "13 Pro Max", ["/coque-13promax-strass-vert-dragonne.jpg"],
    ["Coque strass verts avec dragonne et breloques – iPhone 13 Pro Max", "Green rhinestone case with strap and charms – iPhone 13 Pro Max"],
    ["Transparente et pailletée, bordée de strass verts. Elle vient avec une dragonne tressée verte et des breloques (trèfle, papillons, médailles), pratiques pour tenir le téléphone.", "Clear and glittery, edged with green rhinestones. It comes with a braided green strap and charms (clover, butterflies, medals), handy for holding the phone."],
    [["Strass verts, fond pailleté", "Dragonne tressée verte et breloques", "Coins renforcés", "Coloris : vert / transparent"], ["Green rhinestones, glitter background", "Green braided strap and charms", "Reinforced corners", "Colour: green / clear"]]),
  caseProduct("tech-coque-15promax-rose", "15 Pro Max", ["/coque-15promax-rose.jpg"],
    ["Coque rose brillant – iPhone 15 Pro Max", "Glossy pink case – iPhone 15 Pro Max"],
    ["Rose vif, brillante et translucide, avec un large contour autour des caméras.", "Bright pink, glossy and translucent, with a wide surround around the cameras."],
    [["Finition brillante translucide", "Boutons recouverts", "Coloris : rose"], ["Glossy translucent finish", "Covered buttons", "Colour: pink"]]),
  caseProduct("tech-coque-14promax-beige", "14 Pro Max", ["/coque-14promax-beige.jpg"],
    ["Coque beige à bord transparent – iPhone 14 Pro Max", "Beige case with clear edge – iPhone 14 Pro Max"],
    ["Dos beige doux, bord transparent et contour caméra crème. Une teinte neutre.", "Soft beige back, transparent edge and a cream camera surround. A neutral shade."],
    [["Dos beige, bord transparent", "Contour caméra crème", "Coloris : beige / transparent"], ["Beige back, clear edge", "Cream camera frame", "Colour: beige / clear"]]),
  ...splitColours(caseProduct("tech-coque-11pro-logo", "11 Pro", ["/coque-11pro-violet-logo.jpg", "/coque-11pro-creme-logo.jpg"],
    ["Coque translucide logo pomme – iPhone 11 Pro", "Translucent case with apple logo – iPhone 11 Pro"],
    ["Translucide et teintée, avec un logo pomme au dos. On devine la couleur du téléphone à travers.", "Translucent and tinted, with an apple logo on the back. You can make out your phone’s colour through it."],
    [["Translucide teintée, logo pomme au dos", "Bord transparent", "Coloris : violet clair, crème"], ["Tinted translucent, apple logo on the back", "Clear edge", "Colours: light purple, cream"]]), [
    {"fr": "Violet clair", "en": "Light purple", "slug": "violet", "images": ["/coque-11pro-violet-logo.jpg"]},
    {"fr": "Crème", "en": "Cream", "slug": "creme", "images": ["/coque-11pro-creme-logo.jpg"]},
  ]),
  caseProduct("tech-coque-11-gris-fume-logo", "11", ["/coque-11-gris-fume-logo.jpg"],
    ["Coque gris fumé logo pomme – iPhone 11", "Smoke grey case with apple logo – iPhone 11"],
    ["Translucide gris fumé, logo pomme au dos et contour caméra blanc.", "Translucent smoke grey, apple logo on the back and a white camera surround."],
    [["Translucide gris fumé, logo pomme au dos", "Contour caméra blanc", "Coloris : gris fumé"], ["Translucent smoke grey, apple logo on the back", "White camera frame", "Colour: smoke grey"]]),
  caseProduct("tech-coque-11-noire-logo", "11", ["/coque-11-noire-logo.jpg"],
    ["Coque noire brillante logo pomme – iPhone 11", "Glossy black case with apple logo – iPhone 11"],
    ["Noire brillante et translucide, avec un logo pomme au dos.", "Glossy translucent black, with an apple logo on the back."],
    [["Noire brillante translucide, logo pomme au dos", "Coloris : noir"], ["Glossy translucent black, apple logo on the back", "Colour: black"]]),
  caseProduct("tech-coque-11-bleu-roi", "11", ["/coque-11-bleu-roi.jpg"],
    ["Coque bleu roi brillant – iPhone 11", "Glossy royal blue case – iPhone 11"],
    ["Unie, d’un bleu roi brillant et profond. Une couleur franche, sans motif.", "Plain, a deep glossy royal blue. A bold colour, no pattern."],
    [["Finition brillante unie", "Coloris : bleu roi"], ["Plain glossy finish", "Colour: royal blue"]]),
  caseProduct("tech-coque-11-bleue-volet-magsafe", "11", ["/coque-11-bleue-volet-magsafe.jpg"],
    ["Coque bleue MagSafe avec volet caméra coulissant – iPhone 11", "Blue MagSafe case with sliding camera cover – iPhone 11"],
    ["Bleue, avec un volet coulissant qui cache la caméra quand tu ne t’en sers pas, et un anneau MagSafe au dos.", "Blue, with a sliding cover that hides the camera when you’re not using it, and a MagSafe ring on the back."],
    [["Volet coulissant sur la caméra", "Anneau MagSafe visible", "Coloris : bleu"], ["Sliding camera cover", "MagSafe ring visible", "Colour: blue"]]),
  ...splitColours(newProduct("tech-enceinte-music-x2651", "tech", {
    name: { fr: "Enceinte portable MUSIC X-2651", en: "MUSIC X-2651 portable speaker" },
    subcategory: "speakers",
    images: ["/enceinte-music-x2651-bleu.jpg", "/enceinte-music-x2651-orange.jpg", "/enceinte-music-x2651-vert.jpg", "/enceinte-music-x2651-noir.jpg"],
    variants: ["Bleu clair", "Orange", "Vert", "Noir"],
    description: {
      fr: "Petite enceinte ronde sans fil, façade en tissu et boutons de commande sur le dessus. La dragonne, assortie à la couleur, permet de l’accrocher à un sac ou de la tenir à la main. Câble de charge USB fourni.",
      en: "Small round wireless speaker with a fabric front and control buttons on top. The strap, matched to the colour, lets you hang it from a bag or hold it in your hand. USB charging cable supplied.",
    },
    features: {
      fr: ["Enceinte portable sans fil (mention de l’emballage)", "Façade en tissu, boutons de commande sur le dessus", "Dragonne fournie", "Câble de charge USB fourni : {x}", "Marque : MUSIC – modèle X-2651", "Coloris : bleu clair, orange, vert, noir"],
      en: ["Portable wireless speaker (marked on the packaging)", "Fabric front, control buttons on top", "Strap supplied", "USB charging cable supplied: {x}", "Brand: MUSIC – model X-2651", "Colours: light blue, orange, green, black"],
    },
  }), [
    {"fr": "Bleu clair", "en": "Light blue", "slug": "bleu", "images": ["/enceinte-music-x2651-bleu.jpg"], "x": ["USB-C", "USB-C"]},
    {"fr": "Orange", "en": "Orange", "slug": "orange", "images": ["/enceinte-music-x2651-orange.jpg"], "x": ["USB-C", "USB-C"]},
    {"fr": "Vert", "en": "Green", "slug": "vert", "images": ["/enceinte-music-x2651-vert.jpg"], "x": ["micro-USB", "micro-USB"]},
    {"fr": "Noir", "en": "Black", "slug": "noir", "images": ["/enceinte-music-x2651-noir.jpg"], "x": ["micro-USB", "micro-USB"]},
  ]),
  ...splitColours(newProduct("tech-enceinte-loveyin-ai176", "tech", {
    name: { fr: "Enceinte Loveyin Ai-176 à lumières LED", en: "Loveyin Ai-176 speaker with LED lights" },
    subcategory: "speakers",
    images: ["/enceinte-loveyin-ai176-violet-1.jpg", "/enceinte-loveyin-ai176-violet-2.jpg", "/enceinte-loveyin-ai176-noir.jpg"],
    variants: ["Violet-bleu", "Noir"],
    description: {
      fr: "10 W annoncés, barres lumineuses colorées, poignée de transport et batterie de 1200 mAh. Bluetooth, radio FM, lecture depuis une carte TF ou une clé USB. Avec deux enceintes, le mode TWS les jumelle en stéréo.",
      en: "10 W stated, coloured light bars, a carrying handle and a 1200 mAh battery. Bluetooth, FM radio, playback from a TF card or USB stick. With two speakers, TWS mode pairs them in stereo.",
    },
    features: {
      fr: ["Puissance 10 W (mention de l’emballage)", "Bluetooth, radio FM, carte TF, clé USB", "Jumelage de 2 enceintes (TWS)", "Barres lumineuses LED, mode lumière réglable avec la touche M", "Batterie Li-ion 1200 mAh (mention de l’emballage)", "Poignée de transport, interrupteur marche/arrêt, boutons précédent / suivant / volume / lecture", "Câble de charge, câble jack 3,5 mm et adaptateur ou notice selon le lot (voir photos)", "Marque : Loveyin – modèle Ai-176", "Coloris : violet-bleu, noir"],
      en: ["10 W power (marked on the packaging)", "Bluetooth, FM radio, TF card, USB drive", "Pairs 2 speakers (TWS)", "LED light bars, light mode adjustable with the M button", "1200 mAh Li-ion battery (marked on the packaging)", "Carry handle, on/off switch, previous / next / volume / play buttons", "Charging cable, 3.5 mm audio cable and adapter or manual depending on the batch (see photos)", "Brand: Loveyin – model Ai-176", "Colours: purple-blue, black"],
    },
  }), [
    {"fr": "Violet-bleu", "en": "Purple-blue", "slug": "violet", "images": ["/enceinte-loveyin-ai176-violet-1.jpg", "/enceinte-loveyin-ai176-violet-2.jpg"]},
    {"fr": "Noir", "en": "Black", "slug": "noir", "images": ["/enceinte-loveyin-ai176-noir.jpg"]},
  ]),
  newProduct("watch-day-date-palmier", "watches", {
    name: { fr: "Day-Date Palmier – Acier & Or jaune", en: "Day-Date Palm – Steel & Yellow Gold" },
    subcategory: "classic",
    audience: "men",
    images: ["/montre-day-date-palmier.jpg"],
    description: {
      fr: "Acier et or jaune sur le bracelet President, lunette cannelée dorée, cadran noir à motif palmier avec des index façon diamant. Il indique le jour et la date, et l’inscription Rolex figure sur le cadran. Une montre habillée, qui va aussi bien avec une chemise qu’avec un blazer.",
      en: "Steel and yellow gold on the President bracelet, a gold fluted bezel and a black palm-pattern dial with diamond-style markers. It shows the day and date, with the Rolex inscription on the dial. A dressy watch that goes as well with a shirt as with a blazer.",
    },
    features: {
      fr: ["Inscription Rolex sur le cadran, modèle Day-Date", "Bracelet President acier et or jaune, lunette cannelée", "Cadran noir motif palmier, index façon diamant", "Affichage du jour et de la date", "Style : classique"],
      en: ["Rolex inscription on the dial, Day-Date model", "Steel and yellow-gold President bracelet, fluted bezel", "Black palm-pattern dial, diamond-style markers", "Day and date display", "Style: classic"],
    },
  }),
  newProduct("watch-datejust-noire", "watches", {
    name: { fr: "Datejust Black Edition – Cadran argenté", en: "Datejust Black Edition – Silver dial" },
    subcategory: "classic",
    audience: "unisex",
    images: ["/montre-datejust-noire.jpg"],
    description: {
      fr: "Tout est noir sauf le cadran argenté, qui ressort bien : boîtier, lunette cannelée et bracelet President. La date est à 3 heures et le cadran porte l’inscription Rolex. Sombre mais très lisible, elle convient aussi bien aux hommes qu’aux femmes.",
      en: "Everything is black except the silver dial, which stands out: case, fluted bezel and President bracelet. The date is at 3 o’clock and the dial carries the Rolex inscription. Dark but very readable, it suits men and women alike.",
    },
    features: {
      fr: ["Inscription Rolex sur le cadran, modèle Datejust", "Boîtier, lunette cannelée et bracelet President noirs", "Cadran argenté, index façon diamant et baguettes", "Date à 3 heures", "Style : classique"],
      en: ["Rolex inscription on the dial, Datejust model", "Black case, fluted bezel and President bracelet", "Silver dial, diamond-style and baguette markers", "Date at 3 o’clock", "Style: classic"],
    },
  }),
  newProduct("watch-submariner-bleue", "watches", {
    name: { fr: "Submariner Bleu Électrique – Cadran Rouge", en: "Submariner Electric Blue – Red Dial" },
    subcategory: "sports",
    audience: "men",
    images: ["/montre-submariner-bleue.jpg"],
    description: {
      fr: "Bleu électrique du boîtier au bracelet, avec un cadran rouge en dégradé et une lunette cannelée. On la choisit quand on aime les couleurs franches. Date à 3 heures, inscription Rolex sur le cadran, modèle Submariner.",
      en: "Electric blue from case to bracelet, with a gradient red dial and a fluted bezel. The one to pick if you like bold colours. Date at 3 o’clock, Rolex inscription on the dial, Submariner model.",
    },
    features: {
      fr: ["Inscription Rolex sur le cadran, modèle Submariner", "Boîtier et bracelet President bleu électrique", "Cadran dégradé rouge, index façon diamant", "Date à 3 heures", "Style : sportive"],
      en: ["Rolex inscription on the dial, Submariner model", "Electric blue case and President bracelet", "Red gradient dial, diamond-style markers", "Date at 3 o’clock", "Style: sports"],
    },
  }),
  newProduct("watch-oyster-perpetual-noire", "watches", {
    name: { fr: "Oyster Perpetual Noir – L’essentiel en acier", en: "Oyster Perpetual Black – Steel essentials" },
    subcategory: "classic",
    audience: "men",
    images: ["/montre-oyster-perpetual-noire.jpg"],
    description: {
      fr: "Une montre simple : acier, cadran noir, date à 3 heures, et une touche de rouge sur la couronne comme seul détail de couleur. Inscription Rolex sur le cadran, modèle Oyster Perpetual. Elle passe aussi bien en cours qu’en soirée.",
      en: "A simple watch: steel, a black dial, the date at 3 o’clock and a touch of red on the crown as the only colour detail. Rolex inscription on the dial, Oyster Perpetual model. It works as well in class as in the evening.",
    },
    features: {
      fr: ["Inscription Rolex sur le cadran, modèle Oyster Perpetual", "Bracelet Oyster en acier, lunette lisse", "Cadran noir, index en bâtons, couronne à touche rouge", "Date à 3 heures", "Style : classique"],
      en: ["Rolex inscription on the dial, Oyster Perpetual model", "Steel Oyster bracelet, smooth bezel", "Black dial, bar markers, red-accent crown", "Date at 3 o’clock", "Style: classic"],
    },
  }),
  newProduct("watch-submariner-bicolore", "watches", {
    name: { fr: "Submariner Acier & Or – Lunette Noire", en: "Submariner Steel & Gold – Black Bezel" },
    subcategory: "sports",
    audience: "men",
    images: ["/montre-submariner-bicolore.jpg"],
    description: {
      fr: "La lunette noire graduée, avec son liseré doré, rencontre un bracelet Oyster bicolore acier et or. Le cadran noir a des index façon diamant et une date à 3 heures. Inscription Rolex sur le cadran, modèle Submariner. Un style sportif avec une touche dorée.",
      en: "The black graduated bezel with gold trim meets a two-tone steel and gold Oyster bracelet. The black dial has diamond-style markers and a date at 3 o’clock. Rolex inscription on the dial, Submariner model. A sporty style with a gold touch.",
    },
    features: {
      fr: ["Inscription Rolex sur le cadran, modèle Submariner", "Bracelet Oyster acier et or, lunette noire graduée", "Cadran noir, index façon diamant", "Date à 3 heures", "Style : sportive"],
      en: ["Rolex inscription on the dial, Submariner model", "Steel and gold Oyster bracelet, black graduated bezel", "Black dial, diamond-style markers", "Date at 3 o’clock", "Style: sports"],
    },
  }),
  newProduct("watch-squelette-fashion-noire", "watches", {
    name: { fr: "Squelette Noir « Fashion » – Rouages à vue", en: "Black Skeleton “Fashion” – Visible gears" },
    subcategory: "sports",
    audience: "men",
    images: ["/montre-squelette-fashion-noire.jpg"],
    description: {
      fr: "Le cadran squelette laisse voir les rouages, ce qui donne du relief à une montre toute noire. Boîtier noir à vis apparentes, grands chiffres bien lisibles, bracelet silicone souple. Plus mode que classique, elle se porte au quotidien.",
      en: "The skeleton dial shows the gears, which gives an all-black watch some depth. Black case with visible screws, large easy-to-read numerals, soft silicone strap. More fashion than classic, and easy to wear every day.",
    },
    features: {
      fr: ["Marque inscrite sur le cadran : Fashion", "Boîtier tonneau noir, vis apparentes", "Cadran squelette, grands chiffres", "Bracelet silicone noir", "Style : sportive"],
      en: ["Brand on the dial: Fashion", "Black tonneau case, visible screws", "Skeleton dial, large numerals", "Black silicone strap", "Style: sports"],
    },
  }),
  newProduct("watch-chrono-noire-rouge", "watches", {
    name: { fr: "Montre Noire Trois Compteurs – Touches Rouges", en: "Black Three Sub-dial Watch – Red Accents" },
    subcategory: "sports",
    audience: "men",
    images: ["/montre-chrono-noire-rouge.jpg"],
    description: {
      fr: "Boîtier tonneau noir mat, cadran squelette à trois compteurs et touches rouges qui animent l’ensemble. La date est à 6 heures et le bracelet est en silicone noir. Un look sportif, assumé.",
      en: "Matte black tonneau case, a skeleton dial with three sub-dials and red accents that liven it up. The date is at 6 o’clock and the strap is black silicone. A sporty, confident look.",
    },
    features: {
      fr: ["Boîtier tonneau noir mat, vis apparentes", "Cadran squelette, trois compteurs, touches rouges", "Date à 6 heures", "Bracelet silicone noir", "Style : sportive"],
      en: ["Matte black tonneau case, visible screws", "Skeleton dial, three sub-dials, red accents", "Date at 6 o’clock", "Black silicone strap", "Style: sports"],
    },
  }),
  newProduct("watch-auliter-carbone-rouge", "watches", {
    name: { fr: "AULITER Carbone & Rouge – Édition colorée", en: "AULITER Carbon & Red – Colour edition" },
    subcategory: "sports",
    audience: "men",
    images: ["/montre-auliter-carbone-rouge.jpg"],
    description: {
      fr: "Boîtier effet carbone, cadran squelette traversé d’aiguilles rouge, vert et bleu, bracelet silicone rouge vif. Une montre colorée qui n’essaie pas de passer inaperçue. La marque AULITER est inscrite sur le cadran.",
      en: "Carbon-look case, a skeleton dial crossed by red, green and blue hands, a bright red silicone strap. A colourful watch that doesn’t try to go unnoticed. AULITER brand on the dial.",
    },
    features: {
      fr: ["Marque inscrite sur le cadran : AULITER", "Boîtier effet carbone, vis apparentes", "Cadran squelette, aiguilles colorées", "Bracelet silicone rouge", "Style : sportive"],
      en: ["Brand on the dial: AULITER", "Carbon-look case, visible screws", "Skeleton dial, coloured hands", "Red silicone strap", "Style: sports"],
    },
  }),
  caseProduct("tech-coque-11pro-argent-chrome", "11 Pro", ["/coque-11pro-argent-chrome.jpg"],
    ["Coque argent miroir, anneau caméra chromé – iPhone 11 Pro", "Mirror silver case with chrome camera ring – iPhone 11 Pro"],
    ["Argentée à effet miroir, avec un anneau chromé autour de la caméra. Finition métallisée.", "Mirror-effect silver, with a chrome ring around the camera. Metallic finish."],
    [["Finition argentée effet miroir", "Anneau de caméra chromé", "Coloris : argent"], ["Mirror-effect silver finish", "Chrome camera ring", "Colour: silver"]]),
  caseProduct("tech-coque-13promax-menthe-magsafe", "13 Pro Max", ["/coque-13promax-menthe-magsafe.jpg"],
    ["Coque menthe, plaque MagSafe verte – iPhone 13 Pro Max", "Mint case with green MagSafe panel – iPhone 13 Pro Max"],
    ["Menthe douce, avec une grande plaque verte au dos et un anneau MagSafe bien visible. Un duo de couleurs pastel.", "Soft mint, with a large green plate on the back and a clearly visible MagSafe ring. A pastel colour duo."],
    [["Duo de couleurs menthe et vert", "Anneau MagSafe visible", "Coloris : menthe / vert"], ["Mint and green two-tone", "MagSafe ring visible", "Colour: mint / green"]]),
  caseProduct("tech-coque-12promax-turquoise-pomme", "12 Pro Max", ["/coque-12promax-turquoise-pomme.jpg"],
    ["Coque turquoise clair, logo pomme – iPhone 12 Pro Max", "Light turquoise case with apple logo – iPhone 12 Pro Max"],
    ["Unie, turquoise clair, avec le logo pomme blanc au centre.", "Plain light turquoise, with the white apple logo in the centre."],
    [["Logo pomme blanc au centre", "Coloris : turquoise clair"], ["White apple logo in the centre", "Colour: light turquoise"]]),
  ...splitColours(caseProduct("tech-coque-12promax-silicone-anneau-contraste", "12 Pro Max", ["/coque-12promax-silicone-sauge.jpg", "/coque-12promax-silicone-mauve.jpg", "/coque-12promax-silicone-pervenche.jpg"],
    ["Coque unie à anneau caméra contrasté – iPhone 12 Pro Max", "Plain case with contrast camera ring – iPhone 12 Pro Max"],
    ["Unie, avec un anneau de caméra d’une teinte différente de celle de la coque.", "Plain, with a camera ring in a different shade from the case."],
    [["Anneau de caméra contrasté", "Coloris : vert sauge, mauve, bleu pervenche"], ["Contrast camera ring", "Colours: sage green, mauve, periwinkle blue"]]), [
    {"fr": "Vert sauge", "en": "Sage green", "slug": "sauge", "images": ["/coque-12promax-silicone-sauge.jpg"]},
    {"fr": "Mauve", "en": "Mauve", "slug": "mauve", "images": ["/coque-12promax-silicone-mauve.jpg"]},
    {"fr": "Bleu pervenche", "en": "Periwinkle blue", "slug": "pervenche", "images": ["/coque-12promax-silicone-pervenche.jpg"]},
  ]),
  caseProduct("tech-coque-17air-bleu-clair-plaque-verte", "17 Air", ["/coque-17air-bleu-clair-plaque-verte.jpg"],
    ["Coque bleu clair, plaque MagSafe menthe – iPhone 17 Air", "Light blue case with mint MagSafe panel – iPhone 17 Air"],
    ["Bleu clair avec une grande plaque menthe au dos et un anneau MagSafe visible. Les ouvertures de la caméra sont arrondies.", "Light blue with a large mint plate on the back and a visible MagSafe ring. The camera openings are rounded."],
    [["Duo de couleurs bleu clair et menthe", "Anneau MagSafe visible", "Coloris : bleu clair / menthe"], ["Light blue and mint two-tone", "MagSafe ring visible", "Colour: light blue / mint"]]),
  caseProduct("tech-coque-17air-transparente-anneau-noir", "17 Air", ["/coque-17air-transparente-anneau-noir.jpg"],
    ["Coque transparente, anneau MagSafe noir – iPhone 17 Air", "Clear case with black MagSafe ring – iPhone 17 Air"],
    ["Transparente, avec un anneau MagSafe noir bien visible et des bords renforcés.", "Clear, with a clearly visible black MagSafe ring and reinforced edges."],
    [["Transparente, bords renforcés", "Anneau MagSafe noir visible", "Coloris : transparent"], ["Clear, reinforced edges", "Black MagSafe ring visible", "Colour: clear"]]),
  caseProduct("tech-coque-17air-transparente-anneau-bleu", "17 Air", ["/coque-17air-transparente-anneau-bleu.jpg"],
    ["Coque transparente, anneau MagSafe bleu – iPhone 17 Air", "Clear case with blue MagSafe ring – iPhone 17 Air"],
    ["Transparente, avec un anneau MagSafe bleu vif et une large ouverture pour la caméra. Elle protège sans cacher le design du téléphone.", "Clear, with a bright blue MagSafe ring and a wide camera opening. It protects without hiding the phone’s design."],
    [["Transparente, bords renforcés", "Anneau MagSafe bleu visible", "Coloris : transparent / bleu"], ["Clear, reinforced edges", "Blue MagSafe ring visible", "Colour: clear / blue"]]),
  ...splitColours(caseProduct("tech-coque-xr-magsafe-duo", "XR", ["/coque-xr-lilas.jpg", "/coque-xr-fuchsia.jpg", "/coque-xr-rose.jpg"],
    ["Coque duo de couleurs, motif MagSafe – iPhone XR", "Two-tone case with MagSafe design – iPhone XR"],
    ["Colorée, avec une plaque d’une autre teinte et un motif en anneau MagSafe au dos.", "Colourful, with a plate in a different shade and a MagSafe-style ring pattern on the back."],
    [["Plaque de ton contrasté au dos", "Motif anneau MagSafe visible", "Coloris : lilas, rose fuchsia, rose clair"], ["Contrasting panel on the back", "MagSafe ring design visible", "Colours: lilac, fuchsia pink, light pink"]]), [
    {"fr": "Lilas", "en": "Lilac", "slug": "lilas", "images": ["/coque-xr-lilas.jpg"]},
    {"fr": "Rose fuchsia", "en": "Fuchsia pink", "slug": "fuchsia", "images": ["/coque-xr-fuchsia.jpg"]},
    {"fr": "Rose clair", "en": "Light pink", "slug": "rose", "images": ["/coque-xr-rose.jpg"]},
  ]),
  ...splitColours(caseProduct("tech-coque-11-anneau-support", "11", ["/coque-11-bois-anneau.jpg", "/coque-11-noire-brossee-anneau.jpg"],
    ["Coque anneau MagSafe à support – iPhone 11", "MagSafe ring case with stand – iPhone 11"],
    ["Grand anneau MagSafe avec languette-support, et une grille ronde décorative au dos.", "Large MagSafe ring with a stand tab, and a decorative round grille on the back."],
    [["Anneau MagSafe avec languette-support visible", "Grille ronde décorative", "Coloris : marron effet bois, noir brossé"], ["MagSafe ring with visible stand tab", "Decorative round grille", "Colours: brown wood effect, brushed black"]]), [
    {"fr": "Marron effet bois", "en": "Brown wood effect", "slug": "bois", "images": ["/coque-11-bois-anneau.jpg"]},
    {"fr": "Noir brossé", "en": "Brushed black", "slug": "noir", "images": ["/coque-11-noire-brossee-anneau.jpg"]},
  ]),
  ...splitColours(caseProduct("tech-coque-11promax-magsafe-duo", "11 Pro Max", ["/coque-11promax-bleu.jpg", "/coque-11promax-blanc-gris.jpg", "/coque-11promax-lilas.jpg"],
    ["Coque duo de couleurs, motif MagSafe – iPhone 11 Pro Max", "Two-tone case with MagSafe design – iPhone 11 Pro Max"],
    ["Lisse, aux couleurs douces, avec une plaque d’une autre teinte et un motif en anneau MagSafe au dos.", "Smooth, in soft colours, with a plate in a different shade and a MagSafe-style ring pattern on the back."],
    [["Plaque de ton contrasté au dos", "Motif anneau MagSafe visible", "Coloris : bleu, blanc et gris clair, lilas"], ["Contrasting panel on the back", "MagSafe ring design visible", "Colours: blue, white and light grey, lilac"]]), [
    {"fr": "Bleu", "en": "Blue", "slug": "bleu", "images": ["/coque-11promax-bleu.jpg"]},
    {"fr": "Blanc et gris clair", "en": "White and light grey", "slug": "blanc", "images": ["/coque-11promax-blanc-gris.jpg"]},
    {"fr": "Lilas", "en": "Lilac", "slug": "lilas", "images": ["/coque-11promax-lilas.jpg"]},
  ]),
  caseProduct("tech-coque-17pro-rose-degrade", "17 Pro", ["/coque-17pro-rose-degrade.jpg"],
    ["Coque rose dégradé, anneau MagSafe en relief – iPhone 17 Pro", "Gradient pink case with embossed MagSafe ring – iPhone 17 Pro"],
    ["Rose dégradé, avec un anneau MagSafe en relief au dos et un grand cadre blanc autour de la caméra.", "Gradient pink, with a raised MagSafe ring on the back and a large white frame around the camera."],
    [["Dégradé rose, cadre caméra blanc", "Anneau MagSafe en relief", "Coloris : rose"], ["Pink gradient, white camera frame", "Embossed MagSafe ring", "Colour: pink"]]),
  newProduct("watch-femme-rado-argent", "watches", {
    name: { fr: "Montre femme acier – Cadran argenté, bracelet maille", en: "Women’s steel watch – Silver dial, link bracelet" },
    subcategory: "classic",
    audience: "women",
    price: 4000,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-rado-argent.jpg"],
    description: {
      fr: "Boîtier coussin en acier poli, cadran argenté aux index façon diamant, date à 3 heures et bracelet à maillons arrondis. Inscription Rado sur le cadran. Claire et sobre, elle se porte facilement tous les jours.",
      en: "Polished steel cushion case, a silver dial with diamond-style markers, a date at 3 o’clock and a bracelet of rounded links. Rado inscription on the dial. Light and understated, easy to wear every day.",
    },
    features: {
      fr: ["Inscription Rado sur le cadran", "Boîtier coussin et bracelet maille en acier poli", "Cadran argenté, index façon diamant", "Date à 3 heures", "Style : classique, pour femme"],
      en: ["Rado inscription on the dial", "Polished steel cushion case and link bracelet", "Silver dial, diamond-style markers", "Date at 3 o’clock", "Style: classic, for women"],
    },
  }),
  newProduct("watch-femme-michael-kors-rose", "watches", {
    name: { fr: "Montre femme dorée – Cadran rose, trois sous-cadrans", en: "Women’s gold-tone watch – Pink dial, three sub-dials" },
    subcategory: "classic",
    audience: "women",
    price: 3700,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-michael-kors-rose.jpg"],
    description: {
      fr: "Doré, lunette facettée, cadran rose pastel avec trois sous-cadrans : une montre douce, mais pas discrète. Inscription Michael Kors sur le cadran. Elle fait un joli cadeau d’anniversaire, ou un petit plaisir à s’offrir.",
      en: "Gold-tone, faceted bezel, a pastel pink dial with three sub-dials: a soft watch, but not a discreet one. Michael Kors inscription on the dial. A nice birthday gift, or a small treat for yourself.",
    },
    features: {
      fr: ["Inscription Michael Kors sur le cadran", "Boîtier et bracelet dorés, lunette facettée", "Cadran rose, trois sous-cadrans", "Style : classique, pour femme"],
      en: ["Michael Kors inscription on the dial", "Gold-tone case and bracelet, faceted bezel", "Pink dial, three sub-dials", "Style: classic, for women"],
    },
  }),
  newProduct("watch-femme-rado-jubile-bicolore", "watches", {
    name: { fr: "Montre femme bicolore – Cadran champagne, bracelet maille fine", en: "Women’s two-tone watch – Champagne dial, fine mesh bracelet" },
    subcategory: "classic",
    audience: "women",
    price: 2500,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-rado-jubile.jpg"],
    description: {
      fr: "Petit boîtier rond et fin, cadran champagne avec quatre index façon diamant, bracelet maille bicolore acier et or. Inscription Rado et jubilé sur le cadran. Une montre fine, qui reste discrète au poignet.",
      en: "Small, slim round case, a champagne dial with four diamond-style markers, a two-tone steel and gold mesh bracelet. Rado and jubilé inscriptions on the dial. A slim watch that stays discreet on the wrist.",
    },
    features: {
      fr: ["Inscription Rado et jubilé sur le cadran", "Boîtier rond fin, bracelet maille bicolore acier et or", "Cadran champagne, quatre index façon diamant", "Style : classique, pour femme"],
      en: ["Rado and jubilé inscriptions on the dial", "Slim round case, two-tone steel and gold mesh bracelet", "Champagne dial, four diamond-style markers", "Style: classic, for women"],
    },
  }),
  newProduct("watch-femme-chanel-champagne", "watches", {
    name: { fr: "Montre femme bicolore – Cadran champagne, chiffres dorés", en: "Women’s two-tone watch – Champagne dial, gold numerals" },
    subcategory: "classic",
    audience: "women",
    price: 2500,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-chanel-champagne.jpg"],
    description: {
      fr: "Boîtier doré, cadran champagne avec chiffres arabes dorés et grand double C noir au centre, bracelet maille bicolore. Inscription Chanel sur le cadran. Le doré et le champagne vont aussi bien avec les tenues claires qu’avec le noir.",
      en: "Gold-tone case, a champagne dial with gold Arabic numerals and a large black double-C in the centre, a two-tone mesh bracelet. Chanel inscription on the dial. The gold and champagne work as well with light outfits as with black.",
    },
    features: {
      fr: ["Inscription Chanel sur le cadran", "Boîtier doré, bracelet maille bicolore acier et or", "Cadran champagne, chiffres arabes dorés, double C noir", "Style : classique, pour femme"],
      en: ["Chanel inscription on the dial", "Gold-tone case, two-tone steel and gold mesh bracelet", "Champagne dial, gold Arabic numerals, black double-C", "Style: classic, for women"],
    },
  }),
  newProduct("watch-femme-doree-carree-double-c", "watches", {
    name: { fr: "Montre dorée carrée – Cadran champagne, double C noir", en: "Gold-tone square watch – Champagne dial, black double-C" },
    subcategory: "classic",
    audience: "women",
    price: 2500,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-doree-carree-double-c.jpg"],
    description: {
      fr: "Boîtier doré aux lignes carrées, cadran champagne, chiffres arabes et grand double C noir au centre. Assez discrète pour se porter seule, elle va bien aussi avec des bracelets empilés.",
      en: "Gold-tone case with square lines, a champagne dial, Arabic numerals and a large black double-C in the centre. Discreet enough to wear alone, and it also sits well with stacked bracelets.",
    },
    features: {
      fr: ["Boîtier doré aux lignes carrées, bracelet maille dorée", "Cadran champagne, chiffres arabes, double C noir au centre", "Petits index façon diamant", "Style : classique, pour femme"],
      en: ["Gold-tone case with square lines, gold-tone link bracelet", "Champagne dial, Arabic numerals, black double-C in the centre", "Small diamond-style markers", "Style: classic, for women"],
    },
  }),
  newProduct("watch-femme-doree-strass-octogonale", "watches", {
    name: { fr: "Montre dorée à strass – Cadran blanc, trois sous-cadrans", en: "Gold-tone watch with crystals – White dial, three sub-dials" },
    subcategory: "classic",
    audience: "women",
    price: 3500,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-doree-strass-octogonale.jpg"],
    description: {
      fr: "La lunette octogonale est entièrement sertie de strass, autour d’un cadran blanc à trois sous-cadrans et d’un bracelet doré. Elle brille à la lumière, donc plutôt pour les sorties et les occasions. Elle peut aussi faire un cadeau original.",
      en: "The octagonal bezel is fully set with crystals, around a white dial with three sub-dials and a gold-tone bracelet. It sparkles in the light, so it suits going out and special occasions. It could also make an original gift.",
    },
    features: {
      fr: ["Lunette octogonale sertie de strass", "Cadran blanc, trois sous-cadrans, date", "Boîtier et bracelet dorés", "Style : classique, pour femme"],
      en: ["Octagonal bezel set with crystals", "White dial, three sub-dials, date", "Gold-tone case and bracelet", "Style: classic, for women"],
    },
  }),
  newProduct("watch-femme-acier-chiffres-romains", "watches", {
    name: { fr: "Montre acier chiffres romains – Cadran blanc, bracelet maille galbée", en: "Steel watch with Roman numerals – White dial, curved link bracelet" },
    subcategory: "classic",
    audience: "women",
    price: 4000,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-acier-chiffres-romains.jpg"],
    description: {
      fr: "Boîtier galbé en acier poli, cadran blanc avec chiffres romains et aiguilles bleues, bracelet à maillons arrondis. Inscription Cartier sur le cadran. Un style classique, avec le détail bleu des aiguilles pour la distinguer.",
      en: "Curved polished steel case, a white dial with Roman numerals and blue hands, a bracelet of rounded links. Cartier inscription on the dial. A classic style, with the blue hands as the detail that sets it apart.",
    },
    features: {
      fr: ["Inscription Cartier sur le cadran", "Boîtier galbé et bracelet maille en acier poli", "Cadran blanc, chiffres romains, aiguilles bleues", "Style : classique, pour femme"],
      en: ["Cartier inscription on the dial", "Curved polished steel case and link bracelet", "White dial, Roman numerals, blue hands", "Style: classic, for women"],
    },
  }),
  newProduct("watch-femme-acier-rectangulaire-date", "watches", {
    name: { fr: "Montre acier rectangulaire – Cadran blanc, date", en: "Rectangular steel watch – White dial, date" },
    subcategory: "classic",
    audience: "women",
    price: 3500,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-acier-rectangulaire-date.jpg"],
    description: {
      fr: "Boîtier rectangulaire en acier poli, cadran blanc finement texturé, fenêtre de date et bracelet maille brillant. Une montre nette et moderne, qui suit sans problème la journée du matin au soir.",
      en: "Rectangular polished steel case, a finely textured white dial, a date window and a shiny mesh bracelet. A clean, modern watch that carries you through the day from morning to evening.",
    },
    features: {
      fr: ["Boîtier rectangulaire et bracelet maille en acier poli", "Cadran blanc texturé, date", "Style : classique, pour femme"],
      en: ["Rectangular polished steel case and link bracelet", "Textured white dial, date", "Style: classic, for women"],
    },
  }),
  newProduct("watch-femme-doree-bleu-marine", "watches", {
    name: { fr: "Montre dorée rectangulaire – Cadran bleu marine", en: "Gold-tone rectangular watch – Navy blue dial" },
    subcategory: "classic",
    audience: "women",
    price: 2500,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-doree-bleu-marine.jpg"],
    description: {
      fr: "Le cadran bleu marine profond a des reflets satinés et de petits index dorés, dans un boîtier rectangulaire doré. Inscription Dior sur le cadran. Fine et féminine, elle s’accorde bien avec des tenues simples.",
      en: "The deep navy dial has satin reflections and small gold markers, in a gold-tone rectangular case. Dior inscription on the dial. Slim and feminine, it goes well with simple outfits.",
    },
    features: {
      fr: ["Inscription Dior sur le cadran", "Boîtier rectangulaire et bracelet dorés", "Cadran bleu marine, index dorés", "Style : classique, pour femme"],
      en: ["Dior inscription on the dial", "Gold-tone rectangular case and bracelet", "Navy blue dial, gold-tone markers", "Style: classic, for women"],
    },
  }),
  newProduct("watch-femme-datejust-doree", "watches", {
    name: { fr: "Montre Datejust dorée – Cadran champagne, lunette cannelée", en: "Gold-tone Datejust watch – Champagne dial, fluted bezel" },
    subcategory: "classic",
    audience: "women",
    price: 4500,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-datejust-doree.jpg"],
    description: {
      fr: "Lunette cannelée dorée, cadran champagne lumineux, date à 3 heures et bracelet maille dorée. Inscription Rolex sur le cadran, modèle Datejust. Une montre dorée qui garde un côté classique.",
      en: "Gold-tone fluted bezel, a bright champagne dial, a date at 3 o’clock and a gold-tone link bracelet. Rolex inscription on the dial, Datejust model. A gold watch that keeps a classic feel.",
    },
    features: {
      fr: ["Inscription Rolex sur le cadran, modèle Datejust", "Lunette cannelée, boîtier et bracelet maille dorés", "Cadran champagne, index en bâtons, date à 3 heures", "Style : classique, pour femme"],
      en: ["Rolex inscription on the dial, Datejust model", "Gold-tone fluted bezel, case and link bracelet", "Champagne dial, bar markers, date at 3 o’clock", "Style: classic, for women"],
    },
  }),
  newProduct("watch-homme-aic-rouge", "watches", {
    name: { fr: "Montre carrée AIC – Cadran rouge, bracelet silicone", en: "AIC square watch – Red dial, silicone strap" },
    subcategory: "sports",
    audience: "men",
    price: 5000,
    priceOnRequest: false,
    images: ["/montre-homme-aic-rouge.jpg"],
    description: {
      fr: "Boîtier carré à pans coupés en acier brossé, cadran dégradé rouge et noir avec trois sous-cadrans et trotteuse rouge. Le bracelet silicone noir texturé renforce le côté sportif. Une montre qui ne passe pas inaperçue.",
      en: "Square cut-corner brushed steel case, a red and black gradient dial with three sub-dials and a red seconds hand. The textured black silicone strap adds to the sporty feel. A watch that doesn’t go unnoticed.",
    },
    features: {
      fr: ["Logo AIC sur le cadran", "Boîtier carré à pans coupés, acier brossé", "Cadran dégradé rouge et noir, trois sous-cadrans, trotteuse rouge", "Bracelet silicone noir texturé", "Style : sportive, pour homme"],
      en: ["AIC logo on the dial", "Square cut-corner case, brushed steel", "Red and black gradient dial, three sub-dials, red seconds hand", "Textured black silicone strap", "Style: sports, for men"],
    },
  }),
  newProduct("watch-homme-amiebr-chiffres-arabes", "watches", {
    name: { fr: "Montre carrée chiffres arabes – Cadran gris, bracelet cuir noir", en: "Square watch with Arabic numerals – Grey dial, black leather strap" },
    subcategory: "classic",
    audience: "men",
    price: 5000,
    priceOnRequest: false,
    images: ["/montre-homme-amiebr-arabe.jpg"],
    description: {
      fr: "Cadran gris dégradé aux chiffres arabes orientaux, boîtier carré à lunette texturée, date à 3 heures. Le bracelet est en cuir noir surpiqué. Un choix original si tu veux une montre qu’on ne voit pas partout.",
      en: "Gradient grey dial with Eastern Arabic numerals, a square case with a textured bezel, a date at 3 o’clock. The strap is stitched black leather. An original pick if you want a watch you don’t see everywhere.",
    },
    features: {
      fr: ["Inscription AMIEBR TiMM sur le cadran, mention Quartz", "Boîtier carré, lunette texturée", "Cadran gris dégradé, chiffres arabes orientaux, date à 3 heures", "Bracelet cuir noir surpiqué", "Style : classique, pour homme"],
      en: ["AMIEBR TiMM inscription on the dial, Quartz marking", "Square case, textured bezel", "Gradient grey dial, Eastern Arabic numerals, date at 3 o’clock", "Stitched black leather strap", "Style: classic, for men"],
    },
  }),
  newProduct("watch-homme-cristaux-argent", "watches", {
    name: { fr: "Montre argent sertie de strass – Cadran scintillant, bracelet maille", en: "Silver watch set with crystals – Sparkling dial, mesh bracelet" },
    subcategory: "classic",
    audience: "men",
    price: 4000,
    priceOnRequest: false,
    images: ["/montre-homme-cristaux-argent.jpg"],
    description: {
      fr: "Lunette sertie de strass taillés en baguettes, cadran pavé de cristaux avec quelques touches de rouge, bracelet maille argenté. Elle brille beaucoup, pour ceux qui aiment les montres voyantes.",
      en: "Bezel set with baguette-cut crystals, a dial paved with crystals with a few red touches, a silver mesh bracelet. It sparkles a lot, for those who like eye-catching watches.",
    },
    features: {
      fr: ["Lunette sertie de strass taillés en baguettes", "Cadran pavé de cristaux, repères rouges", "Boîtier et bracelet maille argentés", "Style : classique, pour homme"],
      en: ["Bezel set with baguette-cut crystals", "Crystal-paved dial, red markers", "Silver case and mesh bracelet", "Style: classic, for men"],
    },
  }),
  newProduct("watch-homme-bulova-chrono", "watches", {
    name: { fr: "Montre à deux compteurs noir et blanc – Bracelet cuir noir", en: "Two-sub-dial black and white watch – Black leather strap" },
    subcategory: "classic",
    audience: "men",
    price: 4000,
    priceOnRequest: false,
    images: ["/montre-homme-bulova-chrono.jpg"],
    description: {
      fr: "Boîtier rond en acier poli, cadran dégradé noir et blanc avec deux compteurs, bracelet cuir noir surpiqué. Un style simple, qui passe du cours à une soirée sans changer de tenue.",
      en: "Round polished steel case, a black and white gradient dial with two sub-dials, a stitched black leather strap. A simple style that goes from class to an evening out without a change of outfit.",
    },
    features: {
      fr: ["Inscription Bulova sur le cadran, mention Quartz", "Boîtier rond en acier poli", "Cadran dégradé noir et blanc, deux compteurs", "Bracelet cuir noir surpiqué", "Style : classique, pour homme"],
      en: ["Bulova inscription on the dial, Quartz marking", "Round polished steel case", "Black and white gradient dial, two sub-dials", "Stitched black leather strap", "Style: classic, for men"],
    },
  }),
  newProduct("watch-homme-kelex-marron", "watches", {
    name: { fr: "Montre or rose – Cadran marron, bracelet silicone", en: "Rose gold watch – Brown dial, silicone strap" },
    subcategory: "classic",
    audience: "men",
    price: 5000,
    priceOnRequest: false,
    images: ["/montre-homme-kelex-marron.jpg"],
    description: {
      fr: "Lunette cannelée or rose, cadran marron texturé avec index sertis façon diamant, bracelet silicone marron. Ces tons chauds la changent des montres noires ou argentées qu’on croise le plus souvent.",
      en: "Rose gold fluted bezel, a textured brown dial with diamond-style set markers, a brown silicone strap. The warm tones make a change from the black or silver watches you see most often.",
    },
    features: {
      fr: ["Inscription Kelex sur le cadran, mention Quartz", "Lunette cannelée et boîtier or rose", "Cadran marron texturé, index sertis façon diamant", "Bracelet silicone marron", "Style : classique, pour homme"],
      en: ["Kelex inscription on the dial, Quartz marking", "Rose gold fluted bezel and case", "Textured brown dial, diamond-style set markers", "Brown silicone strap", "Style: classic, for men"],
    },
  }),
  newProduct("watch-homme-bk-bicolore", "watches", {
    name: { fr: "Montre carrée bicolore – Cadran champagne, chiffres romains", en: "Two-tone square watch – Champagne dial, Roman numerals" },
    subcategory: "classic",
    audience: "men",
    price: 6500,
    priceOnRequest: false,
    images: ["/montre-homme-bk-bicolore.jpg"],
    description: {
      fr: "Boîtier carré à vis apparentes, cadran champagne avec grands chiffres romains, date à 6 heures et bracelet bicolore or et acier. Une montre franche, assez habillée.",
      en: "Square case with visible screws, a champagne dial with large Roman numerals, a date at 6 o’clock and a two-tone gold and steel bracelet. A bold watch, fairly dressy.",
    },
    features: {
      fr: ["Logo BK sur le cadran, mention Quartz", "Boîtier carré à vis apparentes, bracelet bicolore or et acier", "Cadran champagne, chiffres romains, date à 6 heures", "Style : classique, pour homme"],
      en: ["BK logo on the dial, Quartz marking", "Square case with visible screws, two-tone gold and steel bracelet", "Champagne dial, Roman numerals, date at 6 o’clock", "Style: classic, for men"],
    },
  }),
  newProduct("watch-homme-bk-noire", "watches", {
    name: { fr: "Montre carrée acier – Cadran noir, chiffres romains", en: "Square steel watch – Black dial, Roman numerals" },
    subcategory: "classic",
    audience: "men",
    price: 6500,
    priceOnRequest: false,
    images: ["/montre-homme-bk-noire.jpg"],
    description: {
      fr: "Boîtier carré à vis apparentes, cadran noir aux grands chiffres romains blancs, bracelet acier assorti. Le contraste noir et blanc la rend facile à lire d’un coup d’œil.",
      en: "Square case with visible screws, a black dial with large white Roman numerals, a matching steel bracelet. The black-and-white contrast makes it easy to read at a glance.",
    },
    features: {
      fr: ["Logo BK sur le cadran", "Boîtier carré à vis apparentes, bracelet acier", "Cadran noir, grands chiffres romains blancs", "Style : classique, pour homme"],
      en: ["BK logo on the dial", "Square case with visible screws, steel bracelet", "Black dial, large white Roman numerals", "Style: classic, for men"],
    },
  }),
  newProduct("watch-homme-boutique-gris", "watches", {
    name: { fr: "Montre chronographe grise – Bracelet effet daim", en: "Grey chronograph-style watch – Suede-effect strap" },
    subcategory: "sports",
    audience: "men",
    price: 4000,
    priceOnRequest: false,
    images: ["/montre-homme-boutique-gris.jpg"],
    description: {
      fr: "Dans l’esprit des montres d’aviateur : boîtier rond en acier poli, cadran gris dégradé à trois compteurs et aiguilles orange, date à 4 heures. Le bracelet gris a un effet daim. Décontractée, avec une pointe de couleur.",
      en: "In the spirit of pilot watches: round polished steel case, a gradient grey dial with three sub-dials and orange hands, a date at 4 o’clock. The grey strap has a suede effect. Relaxed, with a hint of colour.",
    },
    features: {
      fr: ["Inscription Boutique sur le cadran, mention Quartz", "Boîtier rond en acier poli", "Cadran gris dégradé, trois compteurs, date", "Bracelet gris effet daim", "Style : sportive, pour homme"],
      en: ["Boutique inscription on the dial, Quartz marking", "Round polished steel case", "Gradient grey dial, three sub-dials, date", "Grey suede-effect strap", "Style: sports, for men"],
    },
  }),
  newProduct("watch-land-dweller-doree-verte", "watches", {
    name: { fr: "Land-Dweller dorée – Cadran vert alvéolé", en: "Gold-tone Land-Dweller – Honeycomb green dial" },
    subcategory: "classic",
    audience: "unisex",
    price: 12500,
    priceOnRequest: false,
    images: ["/montre-land-dweller-doree-verte.jpg"],
    description: {
      fr: "Cadran vert à motif alvéolé, lunette cannelée dorée et bracelet doré aux maillons polis. La date est à 3 heures. Inscription Rolex sur le cadran, modèle Land-Dweller. Le vert la distingue des cadrans dorés habituels.",
      en: "Green honeycomb-pattern dial, a gold-tone fluted bezel and a gold-tone bracelet with polished links. The date is at 3 o’clock. Rolex inscription on the dial, Land-Dweller model. The green sets it apart from the usual gold dials.",
    },
    features: {
      fr: ["Inscription Rolex sur le cadran, modèle Land-Dweller", "Lunette cannelée, boîtier et bracelet dorés", "Cadran vert à motif alvéolé, date à 3 heures", "Style : classique"],
      en: ["Rolex inscription on the dial, Land-Dweller model", "Gold-tone fluted bezel, case and bracelet", "Green honeycomb-pattern dial, date at 3 o’clock", "Style: classic"],
    },
  }),
  newProduct("watch-datejust-doree-champagne", "watches", {
    name: { fr: "Datejust dorée – Cadran champagne alvéolé", en: "Gold-tone Datejust – Honeycomb champagne dial" },
    subcategory: "classic",
    audience: "unisex",
    price: 12500,
    priceOnRequest: false,
    images: ["/montre-datejust-doree-champagne.jpg"],
    description: {
      fr: "Cadran champagne finement alvéolé avec anneau blanc, lunette cannelée dorée et bracelet doré aux maillons brillants. Date à 3 heures. Inscription Rolex sur le cadran, modèle Datejust. Une montre dorée dans un style classique.",
      en: "Finely honeycombed champagne dial with a white ring, a gold-tone fluted bezel and a gold-tone bracelet with shiny links. Date at 3 o’clock. Rolex inscription on the dial, Datejust model. A gold watch in a classic style.",
    },
    features: {
      fr: ["Inscription Rolex sur le cadran, modèle Datejust", "Lunette cannelée, boîtier et bracelet dorés", "Cadran champagne alvéolé, anneau blanc, date à 3 heures", "Style : classique"],
      en: ["Rolex inscription on the dial, Datejust model", "Gold-tone fluted bezel, case and bracelet", "Honeycomb champagne dial, white ring, date at 3 o’clock", "Style: classic"],
    },
  }),
  newProduct("watch-datejust-acier-blanc", "watches", {
    name: { fr: "Datejust acier – Cadran blanc texturé", en: "Steel Datejust – Textured white dial" },
    subcategory: "classic",
    audience: "unisex",
    price: 12500,
    priceOnRequest: false,
    images: ["/montre-datejust-acier-blanc.jpg"],
    description: {
      fr: "Cadran blanc à motif texturé, lunette cannelée, date à 3 heures, bracelet acier à maillons polis. Inscription Rolex sur le cadran, modèle Datejust. Claire, elle va avec presque tout, des cours aux occasions plus habillées.",
      en: "White dial with a textured pattern, a fluted bezel, a date at 3 o’clock, a steel bracelet with polished links. Rolex inscription on the dial, Datejust model. Light in colour, it goes with almost everything, from class to dressier occasions.",
    },
    features: {
      fr: ["Inscription Rolex sur le cadran, modèle Datejust", "Lunette cannelée, boîtier et bracelet en acier", "Cadran blanc texturé, date à 3 heures", "Style : classique"],
      en: ["Rolex inscription on the dial, Datejust model", "Fluted bezel, steel case and bracelet", "Textured white dial, date at 3 o’clock", "Style: classic"],
    },
  }),
  newProduct("watch-land-dweller-acier-noire", "watches", {
    name: { fr: "Land-Dweller acier – Cadran noir alvéolé", en: "Steel Land-Dweller – Honeycomb black dial" },
    subcategory: "classic",
    audience: "unisex",
    price: 12500,
    priceOnRequest: false,
    images: ["/montre-land-dweller-acier-noire.jpg"],
    description: {
      fr: "Cadran noir à motif alvéolé, lunette cannelée en acier, bracelet acier brillant, date à 3 heures. Inscription Rolex sur le cadran, modèle Land-Dweller. La version sobre, tout en acier et en noir.",
      en: "Black honeycomb-pattern dial, a steel fluted bezel, a shiny steel bracelet, a date at 3 o’clock. Rolex inscription on the dial, Land-Dweller model. The understated version, all steel and black.",
    },
    features: {
      fr: ["Inscription Rolex sur le cadran, modèle Land-Dweller", "Lunette cannelée, boîtier et bracelet en acier", "Cadran noir à motif alvéolé, date à 3 heures", "Style : classique"],
      en: ["Rolex inscription on the dial, Land-Dweller model", "Fluted bezel, steel case and bracelet", "Black honeycomb-pattern dial, date at 3 o’clock", "Style: classic"],
    },
  }),
  newProduct("watch-land-dweller-acier-champagne-bleu", "watches", {
    name: { fr: "Land-Dweller acier – Cadran champagne, anneau bleu clair", en: "Steel Land-Dweller – Champagne dial, light blue ring" },
    subcategory: "classic",
    audience: "unisex",
    price: 12500,
    priceOnRequest: false,
    images: ["/montre-land-dweller-acier-champagne-bleu.jpg"],
    description: {
      fr: "Un anneau bleu clair entoure le cadran champagne alvéolé : c’est ce détail qui la distingue. Lunette cannelée en acier, bracelet acier brillant, date à 3 heures. Inscription Rolex sur le cadran, modèle Land-Dweller.",
      en: "A light blue ring surrounds the honeycomb champagne dial: that’s the detail that sets it apart. Steel fluted bezel, shiny steel bracelet, date at 3 o’clock. Rolex inscription on the dial, Land-Dweller model.",
    },
    features: {
      fr: ["Inscription Rolex sur le cadran, modèle Land-Dweller", "Lunette cannelée, boîtier et bracelet en acier", "Cadran champagne alvéolé, anneau bleu clair, date à 3 heures", "Style : classique"],
      en: ["Rolex inscription on the dial, Land-Dweller model", "Fluted bezel, steel case and bracelet", "Honeycomb champagne dial, light blue ring, date at 3 o’clock", "Style: classic"],
    },
  }),
  newProduct("watch-acier-motif-logo-president", "watches", {
    name: { fr: "Montre acier – Cadran motif logo, index façon diamant", en: "Steel watch – Logo-pattern dial, diamond-style markers" },
    subcategory: "classic",
    audience: "unisex",
    price: 12500,
    priceOnRequest: false,
    images: ["/montre-acier-motif-logo-president.jpg"],
    description: {
      fr: "Le fond champagne est couvert d’un motif graphique, avec des index sertis façon diamant et une date à 3 heures. Lunette cannelée, bracelet President en acier poli. Couronne Rolex sur le cadran. Un cadran à regarder de près.",
      en: "The champagne background is covered in a graphic pattern, with diamond-style set markers and a date at 3 o’clock. Fluted bezel, polished steel President bracelet. Rolex crown on the dial. A dial worth a closer look.",
    },
    features: {
      fr: ["Couronne Rolex sur le cadran", "Lunette cannelée, boîtier et bracelet President en acier poli", "Cadran champagne à motif graphique, index façon diamant, date à 3 heures", "Style : classique"],
      en: ["Rolex crown on the dial", "Fluted bezel, polished steel case and President bracelet", "Champagne dial with graphic pattern, diamond-style markers, date at 3 o’clock", "Style: classic"],
    },
  }),
  newProduct("cosmetique-brosse-cosmia-demelante-creme", "cosmetics", {
    name: { fr: "Brosse à cheveux Cosmia démêlante – Crème", en: "Cosmia detangling hairbrush – Cream" },
    subcategory: "hairbrush",
    audience: "unisex",
    price: 2580,
    priceOnRequest: false,
    images: ["/cosmetique-brosse-cosmia-demelante-creme.jpg"],
    description: {
      fr: "Brosse ovale à picots arrondis, pour démêler en douceur. Elle convient à tous les types de cheveux. Poignée crème, picots noirs.",
      en: "Oval brush with rounded pins, for gentle detangling. Suitable for all hair types. Cream handle, black pins.",
    },
    features: {
      fr: ["Marque : Cosmia", "Brosse à cheveux démêlante, démêlage facile et doux", "Convient à tous types de cheveux", "Coloris : crème et noir"],
      en: ["Brand: Cosmia", "Detangling hairbrush, easy and gentle", "Suitable for all hair types", "Colour: cream and black"],
    },
  }),
  newProduct("cosmetique-brosse-cosmia-corail-cheveux-longs", "cosmetics", {
    name: { fr: "Brosse à cheveux Cosmia – Corail, cheveux longs ou épais", en: "Cosmia hairbrush – Coral, long or thick hair" },
    subcategory: "hairbrush",
    audience: "unisex",
    price: 2580,
    priceOnRequest: false,
    images: ["/cosmetique-brosse-cosmia-corail-cheveux-longs.jpg"],
    description: {
      fr: "Grande brosse (taille L) pour les cheveux longs ou épais, annoncée pour un démêlage en profondeur. Poignée corail, picots noirs à bouts rouges.",
      en: "Large brush (size L) for long or thick hair, stated for deep detangling. Coral handle, black pins with red tips.",
    },
    features: {
      fr: ["Marque : Cosmia", "Brosse à cheveux, démêlage en profondeur", "Pour cheveux longs ou épais (taille L)", "Coloris : corail"],
      en: ["Brand: Cosmia", "Hairbrush, deep detangling", "For long or thick hair (size L)", "Colour: coral"],
    },
  }),
  newProduct("cosmetique-brosse-cosmia-demele-lisse-rose", "cosmetics", {
    name: { fr: "Brosse à cheveux Cosmia Démêle & Lisse – Rose", en: "Cosmia Detangle & Smooth hairbrush – Pink" },
    subcategory: "hairbrush",
    audience: "unisex",
    price: 2580,
    priceOnRequest: false,
    images: ["/cosmetique-brosse-cosmia-demele-lisse-rose.jpg"],
    description: {
      fr: "Brosse taille L qui démêle et lisse, pour tous types de cheveux. Finition rose poudré, picots noirs à bouts roses.",
      en: "Size L brush that detangles and smooths, for all hair types. Powder-pink finish, black pins with pink tips.",
    },
    features: {
      fr: ["Marque : Cosmia", "Brosse à cheveux qui démêle et lisse (taille L)", "Convient à tous types de cheveux", "Coloris : rose poudré"],
      en: ["Brand: Cosmia", "Hairbrush that detangles and smooths (size L)", "Suitable for all hair types", "Colour: powder pink"],
    },
  }),
  newProduct("cosmetique-mennen-baume-apaisant-apres-rasage", "cosmetics", {
    name: { fr: "Mennen – Baume apaisant après-rasage + soin visage 2 en 1", en: "Mennen – Soothing aftershave balm + face care 2-in-1" },
    subcategory: "balm",
    audience: "men",
    price: 1550,
    priceOnRequest: false,
    images: ["/cosmetique-mennen-baume-apaisant-apres-rasage.jpg"],
    description: {
      fr: "Un baume pour après le rasage qui sert aussi de soin visage. Avec de la provitamine B5, pour les peaux sensibles, sans alcool, sans paraben et sans colorant.",
      en: "An aftershave balm that doubles as a face care. With provitamin B5, for sensitive skin, alcohol-free, paraben-free and colourant-free.",
    },
    features: {
      fr: ["Marque : Mennen", "Baume apaisant après-rasage + soin visage 2 en 1", "Provitamine B5, pour peaux sensibles", "Sans alcool, sans paraben, sans colorant"],
      en: ["Brand: Mennen", "Soothing aftershave balm + face care 2-in-1", "Provitamin B5, for sensitive skin", "Alcohol-free, paraben-free, colourant-free"],
    },
  }),
  newProduct("cosmetique-ideal-men-gel-douche-energisant-3en1", "cosmetics", {
    name: { fr: "Ideal Men – Gel douche énergisant 3 en 1", en: "Ideal Men – Energising 3-in-1 shower gel" },
    subcategory: "shower-gel",
    audience: "men",
    price: 1270,
    priceOnRequest: false,
    images: ["/cosmetique-ideal-men-gel-douche-energisant-3en1.jpg"],
    description: {
      fr: "Un seul flacon pour le corps, le visage et les cheveux. Le parfum frais est annoncé pour 24 h.",
      en: "One bottle for body, face and hair. The fresh fragrance is stated to last 24 hours.",
    },
    features: {
      fr: ["Marque : Ideal Men", "Gel douche énergisant 3 en 1 : corps, visage, cheveux", "Parfum fraîcheur 24 h", "Pour homme"],
      en: ["Brand: Ideal Men", "Energising 3-in-1 shower gel: body, face, hair", "24-hour freshness fragrance", "For men"],
    },
  }),
  newProduct("cosmetique-felce-azzurra-uomo-fresh-ice", "cosmetics", {
    name: { fr: "Felce Azzurra Uomo – Fresh Ice, douche & shampoing (maxi format)", en: "Felce Azzurra Uomo – Fresh Ice shower shampoo (maxi size)" },
    subcategory: "shower-gel",
    audience: "men",
    price: 3790,
    priceOnRequest: false,
    images: ["/cosmetique-felce-azzurra-uomo-fresh-ice.jpg"],
    description: {
      fr: "Gel douche et shampoing en un, à la senteur Fresh Ice, rafraîchissante. En format maxi, il dure plus longtemps.",
      en: "Shower gel and shampoo in one, with a refreshing Fresh Ice scent. In maxi size, so it lasts longer.",
    },
    features: {
      fr: ["Marque : Felce Azzurra, gamme Uomo", "Gel douche et shampoing, senteur Fresh Ice rafraîchissante", "Maxi format", "Pour homme"],
      en: ["Brand: Felce Azzurra, Uomo range", "Shower gel and shampoo, refreshing Fresh Ice scent", "Maxi size", "For men"],
    },
  }),
  newProduct("cosmetique-cosmia-men-lotion-apres-rasage-actif", "cosmetics", {
    name: { fr: "Cosmia Men – Lotion après-rasage Actif", en: "Cosmia Men – Activ after shave lotion" },
    subcategory: "aftershave",
    audience: "men",
    price: 2790,
    priceOnRequest: false,
    images: ["/cosmetique-cosmia-men-lotion-apres-rasage-actif.jpg"],
    description: {
      fr: "À appliquer après le rasage : cette lotion rafraîchit et apaise la peau. Pour tous types de peaux.",
      en: "To apply after shaving: this lotion refreshes and soothes the skin. For all skin types.",
    },
    features: {
      fr: ["Marque : Cosmia Men", "Lotion après-rasage Actif, rafraîchit et apaise", "Tous types de peaux", "Pour homme"],
      en: ["Brand: Cosmia Men", "Activ after shave lotion, refreshes and soothes", "All skin types", "For men"],
    },
  }),
  newProduct("cosmetique-cosmia-men-deodorant-seduction", "cosmetics", {
    name: { fr: "Cosmia Men – Déodorant spray Seduction anti-traces", en: "Cosmia Men – Seduction no-marks deodorant spray" },
    subcategory: "deodorant",
    audience: "men",
    price: 1845,
    priceOnRequest: false,
    images: ["/cosmetique-cosmia-men-deodorant-seduction.jpg"],
    description: {
      fr: "Spray déodorant avec une efficacité annoncée de 24 h. La formule anti-traces est pensée pour éviter les marques sur les vêtements. Fabriqué en France.",
      en: "Deodorant spray with 24-hour effectiveness stated. The no-marks formula is designed to avoid marks on clothes. Made in France.",
    },
    features: {
      fr: ["Marque : Cosmia Men", "Déodorant spray Seduction, efficacité 24 h", "Anti-traces", "Fabriqué en France", "Pour homme"],
      en: ["Brand: Cosmia Men", "Seduction deodorant spray, 24-hour effectiveness", "No marks", "Made in France", "For men"],
    },
  }),
  newProduct("cosmetique-cosmia-men-baume-apres-rasage-sensible", "cosmetics", {
    name: { fr: "Cosmia Men – Baume après-rasage Sensible", en: "Cosmia Men – Sensitive aftershave balm" },
    subcategory: "balm",
    audience: "men",
    price: 2380,
    priceOnRequest: false,
    images: ["/cosmetique-cosmia-men-baume-apres-rasage-sensible.jpg"],
    description: {
      fr: "Un baume après-rasage pour les peaux sensibles, qui hydrate et apaise. Flacon noir mat.",
      en: "An aftershave balm for sensitive skin that moisturises and soothes. Matte black bottle.",
    },
    features: {
      fr: ["Marque : Cosmia Men", "Baume après-rasage Sensible, hydrate et apaise", "Pour peaux sensibles", "Pour homme"],
      en: ["Brand: Cosmia Men", "Sensitive aftershave balm, moisturises and soothes", "For sensitive skin", "For men"],
    },
  }),
  newProduct("cosmetique-clesto-nightfall", "cosmetics", {
    name: { fr: "Clesto – Nightfall", en: "Clesto – Nightfall" },
    subcategory: "perfume",
    audience: "unisex",
    price: 2305,
    priceOnRequest: false,
    images: ["/cosmetique-clesto-nightfall.jpg"],
    description: {
      fr: "Parfum en flacon vaporisateur transparent, bouchon argenté et feuillage bleu nuit dessiné sur le verre. Les notes et la contenance restent à confirmer.",
      en: "Fragrance in a clear spray bottle with a silver cap and midnight-blue foliage drawn on the glass. Notes and size are still to be confirmed.",
    },
    features: {
      fr: ["Marque : Clesto, modèle Nightfall", "Flacon vaporisateur, bouchon argenté", "Contenance et notes à confirmer"],
      en: ["Brand: Clesto, Nightfall", "Spray bottle, silver cap", "Size and notes to be confirmed"],
    },
  }),
  newProduct("cosmetique-cosmia-men-sport-eau-de-toilette", "cosmetics", {
    name: { fr: "Cosmia Men – Sport, eau de toilette boisée", en: "Cosmia Men – Sport woody eau de toilette" },
    subcategory: "edt",
    audience: "men",
    price: 4780,
    priceOnRequest: false,
    images: ["/cosmetique-cosmia-men-sport-eau-de-toilette.jpg"],
    description: {
      fr: "Une eau de toilette au parfum boisé, dans un flacon vert avec bouchon argenté et vaporisateur.",
      en: "A woody eau de toilette in a green bottle with a silver cap and spray.",
    },
    features: {
      fr: ["Marque : Cosmia Men", "Eau de toilette Sport, parfum boisé", "Flacon vaporisateur", "Pour homme"],
      en: ["Brand: Cosmia Men", "Sport eau de toilette, woody fragrance", "Spray bottle", "For men"],
    },
  }),
  newProduct("cosmetique-cosmia-apres-shampooing-force-arginine", "cosmetics", {
    name: { fr: "Cosmia Force + Technique – Après-shampooing à l’arginine", en: "Cosmia Force + Technique – Conditioner with arginine" },
    subcategory: "conditioner",
    audience: "unisex",
    price: 1990,
    priceOnRequest: false,
    images: ["/cosmetique-cosmia-apres-shampooing-force-arginine.jpg"],
    description: {
      fr: "Un soin démêlant à l’arginine, pensé pour les cheveux fragiles et cassants. Il facilite le démêlage après le shampooing.",
      en: "A detangling conditioner with arginine, made for fragile, brittle hair. It makes detangling easier after shampooing.",
    },
    features: {
      fr: ["Marque : Cosmia, gamme Force + Technique", "Soin démêlant à l’arginine", "Pour cheveux fragiles et cassants"],
      en: ["Brand: Cosmia, Force + Technique range", "Detangling conditioner with arginine", "For fragile and brittle hair"],
    },
  }),
  newProduct("cosmetique-cosmia-apres-shampooing-argan", "cosmetics", {
    name: { fr: "Cosmia – Après-shampooing nourrit & répare à l’huile d’argan", en: "Cosmia – Nourishing & repairing argan oil conditioner" },
    subcategory: "conditioner",
    audience: "unisex",
    price: 2490,
    priceOnRequest: false,
    images: ["/cosmetique-cosmia-apres-shampooing-argan.jpg"],
    description: {
      fr: "Après-shampooing à l’huile d’argan pour cheveux secs et abîmés. La formule est enrichie en huile d’argan et annoncée pour nourrir et réparer.",
      en: "Argan oil conditioner for dry and damaged hair. The formula is enriched with argan oil and stated to nourish and repair.",
    },
    features: {
      fr: ["Marque : Cosmia", "Après-shampooing à l’huile d’argan, nourrit et répare", "Pour cheveux secs et abîmés", "Formule enrichie en huile d’argan"],
      en: ["Brand: Cosmia", "Argan oil conditioner, nourishes and repairs", "For dry and damaged hair", "Argan oil enriched formula"],
    },
  }),
  newProduct("cosmetique-cosmia-apres-shampooing-color-uv", "cosmetics", {
    name: { fr: "Cosmia Color + Technique – Après-shampooing au filtre UV", en: "Cosmia Color + Technique – Conditioner with UV filter" },
    subcategory: "conditioner",
    audience: "unisex",
    price: 1990,
    priceOnRequest: false,
    images: ["/cosmetique-cosmia-apres-shampooing-color-uv.jpg"],
    description: {
      fr: "Pour cheveux colorés : un soin démêlant avec filtre UV, annoncé pour protéger et raviver la couleur.",
      en: "For coloured hair: a detangling conditioner with UV filter, stated to protect and brighten the colour.",
    },
    features: {
      fr: ["Marque : Cosmia, gamme Color + Technique", "Soin démêlant au filtre UV", "Protège et ravive la couleur", "Pour cheveux colorés"],
      en: ["Brand: Cosmia, Color + Technique range", "Detangling conditioner with UV filter", "Protects and brightens colour", "For dyed hair"],
    },
  }),
  newProduct("cosmetique-cosmia-shampooing-anti-pelliculaire-500ml", "cosmetics", {
    name: { fr: "Cosmia – Shampooing anti-pelliculaire 500 ml", en: "Cosmia – Anti-dandruff shampoo 500 ml" },
    subcategory: "shampoo",
    audience: "unisex",
    price: 2190,
    priceOnRequest: false,
    images: ["/cosmetique-cosmia-shampooing-anti-pelliculaire-500ml.jpg"],
    description: {
      fr: "Shampooing anti-pelliculaire à usage fréquent, pour cheveux normaux. Le flacon de 500 ml dure longtemps.",
      en: "Anti-dandruff shampoo for frequent use, for normal hair. The 500 ml bottle lasts a long time.",
    },
    features: {
      fr: ["Marque : Cosmia", "Shampooing anti-pelliculaire, usage fréquent", "Pour cheveux normaux", "Contenance : 500 ml"],
      en: ["Brand: Cosmia", "Anti-dandruff shampoo, frequent use", "For normal hair", "Size: 500 ml"],
    },
  }),
  newProduct("cosmetique-cosmia-apres-shampooing-repair-keratine", "cosmetics", {
    name: { fr: "Cosmia Repair + Technique – Après-shampooing à la kératine", en: "Cosmia Repair + Technique – Conditioner with keratin" },
    subcategory: "conditioner",
    audience: "unisex",
    price: 1990,
    priceOnRequest: false,
    images: ["/cosmetique-cosmia-apres-shampooing-repair-keratine.jpg"],
    description: {
      fr: "Soin démêlant à la kératine, pour cheveux secs et abîmés.",
      en: "Detangling conditioner with keratin, for dry and damaged hair.",
    },
    features: {
      fr: ["Marque : Cosmia, gamme Repair + Technique", "Soin démêlant à la kératine", "Pour cheveux secs et abîmés"],
      en: ["Brand: Cosmia, Repair + Technique range", "Detangling conditioner with keratin", "For dry and damaged hair"],
    },
  }),
  newProduct("cosmetique-cosmia-shampooing-amandes-500ml", "cosmetics", {
    name: { fr: "Cosmia – Shampooing aux amandes 500 ml", en: "Cosmia – Almond shampoo 500 ml" },
    subcategory: "shampoo",
    audience: "unisex",
    price: 2190,
    priceOnRequest: false,
    images: ["/cosmetique-cosmia-shampooing-amandes-500ml.jpg"],
    description: {
      fr: "Un shampooing aux amandes pour cheveux normaux, à usage fréquent. Le grand flacon de 500 ml convient à la famille.",
      en: "An almond shampoo for normal hair, for frequent use. The large 500 ml bottle suits the whole household.",
    },
    features: {
      fr: ["Marque : Cosmia", "Shampooing aux amandes, usage fréquent", "Pour cheveux normaux", "Contenance : 500 ml"],
      en: ["Brand: Cosmia", "Almond shampoo, frequent use", "For normal hair", "Size: 500 ml"],
    },
  }),
  newProduct("cosmetique-cosmia-shampooing-extra-doux-argan-jasmin", "cosmetics", {
    name: { fr: "Cosmia – Shampooing extra-doux à l’huile d’argan, parfum jasmin", en: "Cosmia – Extra gentle argan oil shampoo, jasmine fragrance" },
    subcategory: "shampoo",
    audience: "unisex",
    price: 1990,
    priceOnRequest: false,
    images: ["/cosmetique-cosmia-shampooing-extra-doux-argan-jasmin.jpg"],
    description: {
      fr: "Shampooing extra-doux à l’huile d’argan et au parfum de jasmin. Annoncé pour nourrir et protéger les cheveux secs ou abîmés.",
      en: "Extra-gentle shampoo with argan oil and a jasmine fragrance. Stated to nourish and protect dry or damaged hair.",
    },
    features: {
      fr: ["Marque : Cosmia", "Shampooing extra-doux à l’huile d’argan", "Parfum jasmin, nourrit et protège", "Pour cheveux secs ou abîmés"],
      en: ["Brand: Cosmia", "Extra gentle shampoo with argan oil", "Jasmine fragrance, nourishes and protects", "For dry or damaged hair"],
    },
  }),
  newProduct("cosmetique-cosmia-shampooing-color-protection-500ml", "cosmetics", {
    name: { fr: "Cosmia Color + Technique – Shampooing protecteur couleur 500 ml", en: "Cosmia Color + Technique – Colour protection shampoo 500 ml" },
    subcategory: "shampoo",
    audience: "unisex",
    price: 2590,
    priceOnRequest: false,
    images: ["/cosmetique-cosmia-shampooing-color-protection-500ml.jpg"],
    description: {
      fr: "Shampooing protecteur de couleur, pour cheveux colorés et méchés. Grand flacon de 500 ml.",
      en: "Colour-protecting shampoo for coloured and highlighted hair. Large 500 ml bottle.",
    },
    features: {
      fr: ["Marque : Cosmia, gamme Color + Technique", "Shampooing protecteur couleur", "Pour cheveux colorés et méchés", "Contenance : 500 ml"],
      en: ["Brand: Cosmia, Color + Technique range", "Colour protection shampoo", "For coloured and highlighted hair", "Size: 500 ml"],
    },
  }),
  newProduct("cosmetique-cosmia-shampooing-camomille-miel", "cosmetics", {
    name: { fr: "Cosmia – Shampooing extra doux camomille & miel", en: "Cosmia – Extra gentle chamomile & honey shampoo" },
    subcategory: "shampoo",
    audience: "unisex",
    price: 1990,
    priceOnRequest: false,
    images: ["/cosmetique-cosmia-shampooing-camomille-miel.jpg"],
    description: {
      fr: "Shampooing extra doux, parfum camomille et miel. Il hydrate et adoucit, et s’adresse aux cheveux blonds à châtain clair.",
      en: "Extra gentle shampoo with a chamomile and honey fragrance. It moisturises and softens, and is meant for blond to light chestnut hair.",
    },
    features: {
      fr: ["Marque : Cosmia", "Shampooing extra doux, parfum camomille et miel", "Hydrate et adoucit", "Pour cheveux blonds à châtain clair"],
      en: ["Brand: Cosmia", "Extra gentle shampoo, chamomile and honey fragrance", "Moisturises and softens", "For blond to light chestnut hair"],
    },
  }),
  newProduct("sac-rabat-rose-triangle-dore", "bags", {
    name: { fr: "Sac à rabat rose, plaque triangulaire dorée", en: "Pink flap bag, gold triangle plate" },
    subcategory: "crossbody",
    audience: "women",
    price: 7500,
    priceOnRequest: false,
    images: ["/sac-rabat-rose-triangle-dore.jpg"],
    description: {
      fr: "Petit sac à rabat, avec une plaque triangulaire dorée sur le devant et une finition légèrement texturée. La bandoulière fine se fixe par deux attaches dorées. Un rose doux qui va avec les tenues claires comme avec le jean.",
      en: "Small flap bag with a gold triangle plate on the front and a lightly textured finish. The thin strap attaches with two gold clips. A soft pink that works with light outfits as well as denim.",
    },
    features: {
      fr: ["Coloris : rose", "Fermeture à rabat, plaque triangulaire dorée", "Bandoulière fine avec attaches dorées", "Format compact"],
      en: ["Colour: pink", "Flap closure, gold triangle plate", "Thin strap with gold clips", "Compact size"],
    },
  }),
  newProduct("sac-rabat-blanc-triangle-argente", "bags", {
    name: { fr: "Sac à rabat blanc, plaque triangulaire argentée", en: "White flap bag, silver triangle plate" },
    subcategory: "crossbody",
    audience: "women",
    price: 7500,
    priceOnRequest: false,
    images: ["/sac-rabat-blanc-triangle-argente.jpg"],
    description: {
      fr: "Rabat lisse et plaque triangulaire argentée gravée en noir. Le blanc cassé du sac se marie au gris de la bandoulière, et les attaches sont argentées. Un format compact qui se porte facilement en bandoulière.",
      en: "Smooth flap and a silver triangle plate engraved in black. The off-white of the bag pairs with the grey strap, and the hardware is silver. A compact format that is easy to wear crossbody.",
    },
    features: {
      fr: ["Coloris : blanc cassé, bandoulière grise", "Fermeture à rabat, plaque triangulaire argentée", "Attaches argentées", "Format compact"],
      en: ["Colour: off-white, grey strap", "Flap closure, silver triangle plate", "Silver hardware", "Compact size"],
    },
  }),
  newProduct("sac-mini-cabas-caramel-grand-monogramme", "bags", {
    name: { fr: "Mini cabas caramel, grand monogramme blanc", en: "Caramel mini tote, large white monogram" },
    subcategory: "handbags",
    audience: "women",
    price: 8890,
    priceOnRequest: false,
    images: ["/sac-mini-cabas-caramel-grand-monogramme.jpg"],
    description: {
      fr: "Deux anses rondes, une forme trapèze et un grand motif de fleurs et de losanges blanc sur fond caramel, avec les initiales au centre. Les fermoirs sont dorés et une étiquette assortie pend à l’une des anses.",
      en: "Two round handles, a trapezoid shape and a large white flower-and-diamond pattern on a caramel background, with initials in the centre. The hardware is gold-tone and a matching tag hangs from one handle.",
    },
    features: {
      fr: ["Coloris : caramel et blanc", "Deux anses rondes", "Fermoirs dorés, étiquette assortie", "Petit format"],
      en: ["Colour: caramel and white", "Two round handles", "Gold-tone hardware, matching tag", "Small size"],
    },
  }),
  newProduct("sac-sac-bandouliere-bleu-ciel-triangle", "bags", {
    name: { fr: "Sac bandoulière bleu ciel, fermoir triangulaire doré", en: "Sky-blue shoulder bag, gold triangle clasp" },
    subcategory: "crossbody",
    audience: "women",
    price: 7500,
    priceOnRequest: false,
    images: ["/sac-sac-bandouliere-bleu-ciel-triangle.jpg"],
    description: {
      fr: "Bleu ciel uni, avec un fermoir triangulaire doré sur le rabat. La longue bandoulière permet de le porter à l’épaule ou en travers du corps. Le coloris tranche avec les sacs noirs ou marron qu’on voit partout.",
      en: "Plain sky blue, with a gold triangle clasp on the flap. The long strap lets you wear it on the shoulder or across the body. The colour stands out from the black or brown bags you see everywhere.",
    },
    features: {
      fr: ["Coloris : bleu ciel", "Rabat, fermoir triangulaire doré", "Longue bandoulière", "Attaches dorées"],
      en: ["Colour: sky blue", "Flap, gold triangle clasp", "Long strap", "Gold-tone hardware"],
    },
  }),
  newProduct("sac-mini-cabas-beige-grand-monogramme", "bags", {
    name: { fr: "Mini cabas beige, grand monogramme blanc", en: "Beige mini tote, large white monogram" },
    subcategory: "handbags",
    audience: "women",
    price: 8890,
    priceOnRequest: false,
    images: ["/sac-mini-cabas-beige-grand-monogramme.jpg"],
    description: {
      fr: "Fond beige sable, grand motif de fleurs et de losanges blanc et initiales au centre, avec deux anses rondes. Une version plus douce que le caramel, qui va facilement avec des tenues claires. Fermoirs dorés et étiquette assortie.",
      en: "Sandy beige background, a large white flower-and-diamond pattern and initials in the centre, with two round handles. A softer version than caramel that pairs easily with light outfits. Gold-tone hardware and matching tag.",
    },
    features: {
      fr: ["Coloris : beige et blanc", "Deux anses rondes", "Fermoirs dorés, étiquette assortie", "Petit format"],
      en: ["Colour: beige and white", "Two round handles", "Gold-tone hardware, matching tag", "Small size"],
    },
  }),
  newProduct("sac-sac-cognac-losanges-blasons", "bags", {
    name: { fr: "Sac à main cognac, motif losanges et blasons", en: "Cognac handbag, diamond and crest pattern" },
    subcategory: "handbags",
    audience: "women",
    price: 7600,
    priceOnRequest: false,
    images: ["/sac-sac-cognac-losanges-blasons.jpg"],
    description: {
      fr: "Un sac à rabat couleur cognac couvert de losanges noirs et de petits blasons. Fermoir doré à clé au centre, deux boucles sur le devant et une anse rigide sur le dessus. Le motif est très présent : on le choisit pour se faire remarquer.",
      en: "A cognac flap bag covered in black diamonds and small crests. Gold-tone key-style clasp in the centre, two buckles on the front and a rigid top handle. The pattern is bold: you pick it to be noticed.",
    },
    features: {
      fr: ["Coloris : cognac et noir", "Fermoir doré central, deux boucles", "Anse rigide sur le dessus", "Anneaux dorés sur les côtés"],
      en: ["Colour: cognac and black", "Gold-tone central clasp, two buckles", "Rigid top handle", "Gold-tone rings on the sides"],
    },
  }),
  newProduct("sac-sac-monogramme-marron-fermoir-dore", "bags", {
    name: { fr: "Sac à main monogramme marron, fermoir doré", en: "Brown monogram handbag, gold clasp" },
    subcategory: "handbags",
    audience: "women",
    price: 7600,
    priceOnRequest: false,
    images: ["/sac-sac-monogramme-marron-fermoir-dore.jpg"],
    description: {
      fr: "Le rabat est marron foncé à monogramme, la façade caramel porte le même motif à l’envers. Fermoir doré carré, deux boucles en bas, anse rigide sur le dessus et anneaux dorés sur les côtés. Un classique aux tons chauds.",
      en: "The flap is dark brown with a monogram, while the caramel front carries the same pattern reversed. Square gold-tone clasp, two buckles at the bottom, a rigid top handle and gold-tone rings on the sides. A classic in warm tones.",
    },
    features: {
      fr: ["Coloris : marron foncé et caramel", "Fermoir doré carré, deux boucles", "Anse rigide sur le dessus", "Anneaux dorés sur les côtés"],
      en: ["Colour: dark brown and caramel", "Square gold-tone clasp, two buckles", "Rigid top handle", "Gold-tone rings on the sides"],
    },
  }),
  newProduct("sac-duo-matelasse-vert-emeraude", "bags", {
    name: { fr: "Duo de sacs matelassés vert émeraude", en: "Emerald green quilted bag duo" },
    subcategory: "handbags",
    audience: "women",
    price: 8700,
    priceOnRequest: false,
    images: ["/sac-duo-matelasse-vert-emeraude.jpg"],
    description: {
      fr: "La photo présente deux sacs matelassés vert émeraude : un cabas à deux anses chaînes entrelacées et un sac à rabat avec chaîne dorée. Le fermoir doré est formé de deux lettres entrelacées. Le vert profond change du noir qu’on choisit d’habitude.",
      en: "The photo shows two emerald green quilted bags: a tote with two woven chain handles and a flap bag with a gold-tone chain. The gold-tone clasp is made of two interlaced letters. The deep green is a change from the usual black.",
    },
    features: {
      fr: ["Coloris : vert émeraude", "Matelassage en losanges", "Anses et bandoulière en chaîne dorée", "Deux modèles sur la photo : cabas et sac à rabat"],
      en: ["Colour: emerald green", "Diamond quilting", "Gold-tone chain handles and strap", "Two models shown: tote and flap bag"],
    },
  }),
  newProduct("sac-duo-matelasse-jaune", "bags", {
    name: { fr: "Duo de sacs matelassés jaune vif", en: "Bright yellow quilted bag duo" },
    subcategory: "handbags",
    audience: "women",
    price: 8700,
    priceOnRequest: false,
    images: ["/sac-duo-matelasse-jaune.jpg"],
    description: {
      fr: "Un cabas à anses chaînes et un sac à rabat avec chaîne, tous deux matelassés en jaune vif. Les finitions dorées et le fermoir à lettres entrelacées apportent le contraste. Un sac pour qui veut de la couleur.",
      en: "A chain-handle tote and a chain-strap flap bag, both quilted in bright yellow. The gold-tone finishes and the interlaced-letter clasp add contrast. A bag for anyone who wants colour.",
    },
    features: {
      fr: ["Coloris : jaune vif", "Matelassage en losanges", "Anses et bandoulière en chaîne dorée", "Deux modèles sur la photo : cabas et sac à rabat"],
      en: ["Colour: bright yellow", "Diamond quilting", "Gold-tone chain handles and strap", "Two models shown: tote and flap bag"],
    },
  }),
  newProduct("sac-sac-dome-orange-verni-monogramme", "bags", {
    name: { fr: "Sac dôme orange verni, monogramme en relief", en: "Orange patent dome bag, embossed monogram" },
    subcategory: "handbags",
    audience: "women",
    price: 7500,
    priceOnRequest: false,
    images: ["/sac-sac-dome-orange-verni-monogramme.jpg"],
    description: {
      fr: "Le vernis orange brillant est gaufré d’un monogramme de fleurs et de losanges. Forme dôme fermée par un zip, deux anses rondes, attaches argentées et petit cadenas-étiquette. Très brillant, il se remarque de loin.",
      en: "The glossy orange patent finish is embossed with a flower-and-diamond monogram. Dome shape closed with a zip, two round handles, silver-tone hardware and a small tag. Very shiny, it stands out from afar.",
    },
    features: {
      fr: ["Coloris : orange verni", "Forme dôme, fermeture zippée", "Deux anses rondes", "Attaches argentées"],
      en: ["Colour: glossy orange", "Dome shape, zip closure", "Two round handles", "Silver-tone hardware"],
    },
  }),
  newProduct("sac-sac-dome-gris-bleu-bande-fuchsia", "bags", {
    name: { fr: "Sac dôme gris-bleu, anses et bandeau fuchsia", en: "Grey-blue dome bag, fuchsia handles and band" },
    subcategory: "handbags",
    audience: "women",
    price: 7500,
    priceOnRequest: false,
    images: ["/sac-sac-dome-gris-bleu-bande-fuchsia.jpg"],
    description: {
      fr: "Le corps en toile à motif de fleurs, gris clair et bleu nuit, contraste avec les anses et le bandeau fuchsia. Forme dôme à zip, finitions dorées et petit cadenas accroché à la fermeture. Un sac qui mélange le sobre et le très coloré.",
      en: "The canvas body has a light grey and navy flower pattern that contrasts with the fuchsia handles and base band. Dome shape with a zip, gold-tone details and a small padlock on the closure. A bag that mixes understated and very colourful.",
    },
    features: {
      fr: ["Coloris : gris-bleu et fuchsia", "Forme dôme, fermeture zippée", "Deux anses rondes", "Finitions dorées, petit cadenas"],
      en: ["Colour: grey-blue and fuchsia", "Dome shape, zip closure", "Two round handles", "Gold-tone details, small padlock"],
    },
  }),
  newProduct("sac-sac-dome-dore-grain-horizontal", "bags", {
    name: { fr: "Sac dôme doré, grain horizontal", en: "Gold dome bag, horizontal grain" },
    subcategory: "handbags",
    audience: "women",
    price: 7500,
    priceOnRequest: false,
    images: ["/sac-sac-dome-dore-grain-horizontal.jpg"],
    description: {
      fr: "Doré clair, avec un grain en fines lignes horizontales et un bandeau lisse en bas. Forme dôme à zip, deux anses rondes, attaches argentées, logo en relief et étiquette gravée. Un doré doux, pas trop brillant.",
      en: "Light gold with a fine horizontal grain and a smooth band at the bottom. Dome shape with a zip, two round handles, silver-tone hardware, an embossed logo and an engraved tag. A soft gold, not too shiny.",
    },
    features: {
      fr: ["Coloris : doré clair", "Forme dôme, fermeture zippée", "Deux anses rondes", "Attaches argentées, étiquette gravée"],
      en: ["Colour: light gold", "Dome shape, zip closure", "Two round handles", "Silver-tone hardware, engraved tag"],
    },
  }),
  newProduct("sac-sac-dome-orange-grain-cadenas", "bags", {
    name: { fr: "Sac dôme orange texturé, cadenas argenté", en: "Textured orange dome bag, silver padlock" },
    subcategory: "handbags",
    audience: "women",
    price: 7500,
    priceOnRequest: false,
    images: ["/sac-sac-dome-orange-grain-cadenas.jpg"],
    description: {
      fr: "Orange vif à fines lignes horizontales, bandeau lisse assorti et deux anses rondes. Un petit cadenas pend à une chaîne argentée sur le côté de la fermeture zippée.",
      en: "Bright orange with fine horizontal lines, a matching smooth band and two round handles. A small padlock hangs from a silver-tone chain at the side of the zip closure.",
    },
    features: {
      fr: ["Coloris : orange vif", "Forme dôme, fermeture zippée", "Deux anses rondes", "Cadenas sur chaîne argentée"],
      en: ["Colour: bright orange", "Dome shape, zip closure", "Two round handles", "Padlock on a silver-tone chain"],
    },
  }),
  newProduct("sac-sac-dome-dore-miroir-monogramme", "bags", {
    name: { fr: "Sac dôme doré miroir, monogramme en relief", en: "Mirror-gold dome bag, embossed monogram" },
    subcategory: "handbags",
    audience: "women",
    price: 7500,
    priceOnRequest: false,
    images: ["/sac-sac-dome-dore-miroir-monogramme.jpg"],
    description: {
      fr: "Finition dorée effet miroir, très brillante, avec un monogramme en relief sur tout le sac. Forme dôme à zip, deux anses rondes, attaches argentées et étiquette assortie. Pour les soirées plus que pour tous les jours.",
      en: "Mirror-effect gold finish, very shiny, with an embossed monogram all over. Dome shape with a zip, two round handles, silver-tone hardware and a matching tag. Better for evenings than for every day.",
    },
    features: {
      fr: ["Coloris : doré miroir", "Forme dôme, fermeture zippée", "Deux anses rondes", "Attaches argentées"],
      en: ["Colour: mirror gold", "Dome shape, zip closure", "Two round handles", "Silver-tone hardware"],
    },
  }),
  newProduct("sac-cabas-noir-blanc-porte-monnaie", "bags", {
    name: { fr: "Cabas noir et blanc avec porte-monnaie", en: "Black and white tote with coin purse" },
    subcategory: "handbags",
    audience: "women",
    price: 8890,
    priceOnRequest: false,
    images: ["/sac-cabas-noir-blanc-porte-monnaie.jpg"],
    description: {
      fr: "La façade blanche est cernée de noir, avec deux boucles dorées sur les côtés et deux anses. Un petit porte-monnaie zippé noir est présenté devant le sac sur la photo. Le contraste noir et blanc reste facile à assortir.",
      en: "The white front is edged in black, with two gold-tone buckles on the sides and two handles. A small black zipped coin purse is shown in front of the bag in the photo. The black-and-white contrast is easy to match.",
    },
    features: {
      fr: ["Coloris : blanc et noir", "Deux anses, boucles dorées sur les côtés", "Porte-monnaie zippé noir présenté avec le sac (à confirmer)", "Format cabas"],
      en: ["Colour: white and black", "Two handles, gold-tone buckles on the sides", "Black zipped coin purse shown with the bag (to be confirmed)", "Tote format"],
    },
  }),
  newProduct("sac-cabas-noir-poche-rabat", "bags", {
    name: { fr: "Cabas noir uni, poche à rabat", en: "Plain black tote, flap pocket" },
    subcategory: "handbags",
    audience: "women",
    price: 8890,
    priceOnRequest: false,
    images: ["/sac-cabas-noir-poche-rabat.jpg"],
    description: {
      fr: "Noir uni, deux anses, une poche à rabat sur le devant et des sangles sur les côtés. Un sac sobre qui accompagne toutes les tenues, des cours aux sorties.",
      en: "Plain black, two handles, a flap pocket on the front and straps on the sides. An understated bag that goes with every outfit, from class to going out.",
    },
    features: {
      fr: ["Coloris : noir", "Deux anses", "Poche à rabat sur le devant", "Sangles sur les côtés"],
      en: ["Colour: black", "Two handles", "Flap pocket on the front", "Side straps"],
    },
  }),
  newProduct("sac-cabas-denim-bords-caramel-portefeuille", "bags", {
    name: { fr: "Cabas bleu denim et bords caramel, avec portefeuille", en: "Blue denim-look tote with caramel trim, with wallet" },
    subcategory: "handbags",
    audience: "women",
    price: 8890,
    priceOnRequest: false,
    images: ["/sac-cabas-denim-bords-caramel-portefeuille.jpg"],
    description: {
      fr: "La façade bleu denim est bordée de caramel, avec deux boucles dorées sur les côtés et deux anses. Un portefeuille zippé caramel est présenté avec le sac sur la photo. Le bleu et le caramel se marient bien avec le jean.",
      en: "The denim-blue front is trimmed in caramel, with two gold-tone buckles on the sides and two handles. A caramel zipped wallet is shown with the bag in the photo. Blue and caramel work well with jeans.",
    },
    features: {
      fr: ["Coloris : bleu denim et caramel", "Deux anses, boucles dorées sur les côtés", "Portefeuille zippé caramel présenté avec le sac (à confirmer)", "Format cabas"],
      en: ["Colour: denim blue and caramel", "Two handles, gold-tone buckles on the sides", "Caramel zipped wallet shown with the bag (to be confirmed)", "Tote format"],
    },
  }),
  newProduct("sac-sac-seau-noir-anse-lettres-dorees", "bags", {
    name: { fr: "Sac seau noir, anse à lettres dorées", en: "Black bucket bag, gold lettered handle" },
    subcategory: "handbags",
    audience: "women",
    price: 8000,
    priceOnRequest: false,
    images: ["/sac-sac-seau-noir-anse-lettres-dorees.jpg"],
    description: {
      fr: "Un sac seau noir à la forme souple, fermé par un cordon. L’anse est ornée de grandes lettres dorées en relief, et deux petits boutons ferment le côté. Le détail doré lui donne du caractère malgré le noir uni.",
      en: "A black bucket bag with a soft shape, closed with a drawstring. The handle is decorated with large raised gold-tone letters, and two small buttons fasten the side. The gold detail gives character to the plain black.",
    },
    features: {
      fr: ["Coloris : noir", "Forme seau, fermeture par cordon", "Anse ornée de lettres dorées", "Deux boutons sur le côté"],
      en: ["Colour: black", "Bucket shape, drawstring closure", "Handle decorated with gold-tone letters", "Two buttons on the side"],
    },
  }),
];

// Les emplacements vides d'une catégorie disparaissent dès qu'elle contient de vrais produits.
const placeholders = emptySlots.filter((slot) => realProducts[slot.id] || !catalogue.some((item) => item.category === slot.category));
// Prix (FCFA) des coques et des montres. Les coques absentes de cette liste restent « Prix sur demande » tant que leur prix n'est pas confirmé.
// 3900 : coques MagSafe · 3000 : strass · 3500 : strass transparent · 4000 : transparentes MagSafe · 2000 à 2300 : unies et translucides
const casePrices: Record<string, number> = {
  "tech-coque-12pro-magsafe-gris-mat": 3900,
  "tech-coque-14pro-magsafe-bronze": 3900,
  "tech-coque-11-bleue-volet-magsafe": 3900,
  "tech-coque-13promax-menthe-magsafe": 3900,
  "tech-coque-17air-bleu-clair-plaque-verte": 3900,
  "tech-coque-xr-magsafe-duo-lilas": 3900,
  "tech-coque-xr-magsafe-duo-fuchsia": 3900,
  "tech-coque-xr-magsafe-duo-rose": 3900,
  "tech-coque-11-anneau-support-bois": 3900,
  "tech-coque-11-anneau-support-noir": 3900,
  "tech-coque-11promax-magsafe-duo-bleu": 3900,
  "tech-coque-11promax-magsafe-duo-blanc": 3900,
  "tech-coque-11promax-magsafe-duo-lilas": 3900,
  "tech-coque-17pro-rose-degrade": 3900,
  "tech-coque-13promax-strass-vert-dragonne": 3000,
  "tech-coque-14pro-fumee-phone-case": 4000,
  "tech-coque-11-gris-fume-logo": 2000,
  "tech-coque-11-noire-logo": 2000,
  "tech-coque-11-bleu-roi": 2000,
  "tech-coque-15promax-rose": 2000,
  "tech-coque-15-magsafe-transparente": 4000,
  "tech-coque-14pro-magsafe-blanche": 4000,
  "tech-coque-17air-transparente-anneau-noir": 4000,
  "tech-coque-17air-transparente-anneau-bleu": 4000,
  "tech-coque-13promax-strass-papillon": 3500,
  "tech-coque-14plus-alveoles-violet": 3500,
  "tech-coque-13pro-monogramme-marron": 2300,
  "tech-coque-11pro-argent-chrome": 3000,
  "tech-coque-11pro-logo-violet": 2000,
  "tech-coque-11pro-logo-creme": 2000,
  "tech-coque-16pro-orange-tisse": 2500,
  "tech-coque-17pro-noire-tisse": 2500,
  "tech-coque-13pro-fleurs-violet": 3000,
  "tech-coque-14pro-rose-transparente": 2000,
  "tech-coque-14promax-beige": 2000,
  "tech-coque-13promax-alveoles-noire": 2000,
  "tech-coque-12promax-turquoise-pomme": 2000,
  "tech-coque-12promax-silicone-anneau-contraste-sauge": 2000,
  "tech-coque-12promax-silicone-anneau-contraste-mauve": 2000,
  "tech-coque-12promax-silicone-anneau-contraste-pervenche": 2000,
  // Montres
  "watch-day-date-palmier": 14000,
  "watch-datejust-noire": 15000,
  "watch-submariner-bleue": 16000,
  "watch-oyster-perpetual-noire": 12500,
  "watch-submariner-bicolore": 13500,
  "watch-squelette-fashion-noire": 9000,
  "watch-chrono-noire-rouge": 10000,
  "watch-auliter-carbone-rouge": 11000,
};
const withPrice = (item: Product): Product => (casePrices[item.id] ? { ...item, price: casePrices[item.id], priceOnRequest: false } : item);
const products: Product[] = [...placeholders.map((product) => ({ ...product, ...realProducts[product.id] })), ...catalogue.map(withPrice)];

const featuredProducts = products.filter((product) => product.featured);

// Cartes « collection » de l'accueil : un visuel d'ambiance qui mène à la catégorie, sans prix ni produit précis.
// Pour changer la photo : déposer le fichier dans /public et modifier `image` (null = emplacement vide).
type Showcase = {
  id: string;
  category: CategoryId;
  subcategory: string | null;
  audience?: "men" | "women";
  title: Record<Lang, string>;
  image: string | null;
  position?: string;
};

const showcases: Showcase[] = [
  { id: "showcase-jewelry-men", category: "jewelry", subcategory: null, audience: "men", title: { fr: "Bijoux · Homme", en: "Jewellery · Men" }, image: "/bijoux-homme-style.jpg", position: "center 50%" },
  { id: "showcase-jewelry-women", category: "jewelry", subcategory: null, audience: "women", title: { fr: "Bijoux · Femme", en: "Jewellery · Women" }, image: "/bijoux-femme-style.jpg", position: "center 40%" },
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
    moodVisual: "Visuel d’ambiance",
    allAudience: "Tous",
    allSelection: "Toute la sélection",
    noMatch: "Aucun produit pour cette sélection pour le moment.",
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
    moodVisual: "Mood visual",
    allAudience: "All",
    allSelection: "Full selection",
    noMatch: "No products for this selection yet.",
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
// Un produit est dans la sélection choisie s'il porte cet identifiant, ou s'il est un sous-type de ce parent.
const inSubcategory = (productSub: string | null, selected: string, category: Category) =>
  productSub === selected || category.subcategories.find((item) => item.id === productSub)?.parent === selected;
const priceLabel = (product: Product, lang: Lang) =>
  product.price !== null ? `${product.price.toLocaleString("fr-FR")} FCFA` : product.priceOnRequest ? copy[lang].priceOnRequest : copy[lang].pricePending;
// Photos de catalogue (produit + emballage) : on les montre en entier, sur fond blanc, au lieu de les recadrer.
const fitStyle = (product: Product) => (product.imageFit === "contain" ? { objectFit: "contain" as const, background: "#fff" } : undefined);
const audienceLabel = (product: Product, lang: Lang) => (product.audience && product.audience !== "unisex" ? copy[lang][product.audience] : "");
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
  const [audience, setAudience] = useState<"" | "men" | "women">("");
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
    setAudience("");
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
    setAudience(showcase.audience ?? "");
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
      const matchesSubcategory = !subcategory || inSubcategory(product.subcategory, subcategory, activeCategory);
      const matchesAudience = !audience || product.audience === audience || product.audience === "unisex";
      return matchesQuery && matchesSubcategory && matchesAudience;
    });
    if (sort === "low") return [...filtered].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    if (sort === "high") return [...filtered].sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    return filtered;
  }, [page, categoryProducts, activeCategory, query, subcategory, audience, sort, lang]);

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

          <section className="section shell" id="categories"><div className="section-heading"><div><span className="eyebrow">01 — {t.categories}</span><h2>{t.categories}</h2></div><p>{t.categoriesText}</p></div><div className="category-grid six-categories">{categories.map((category, index) => <button className={`category-card cat-${(index % 3) + 1}`} key={category.id} onClick={() => openCategory(category.id)}><span>0{index + 1}</span><div><strong>{category.name[lang]}</strong><small>{category.subcategories.filter((item) => !item.parent).slice(0, 3).map((item) => item.name[lang]).join(" · ")}</small></div><i><Icon name="arrow" /></i></button>)}</div></section>

          <section className="section warm-section"><div className="shell"><div className="section-heading"><div><span className="eyebrow">02 — {t.prestigeEyebrow}</span><h2>{t.prestigeTitle}</h2><p style={{ marginTop: 12, maxWidth: 560, color: "var(--muted)" }}>{t.prestigeText}</p></div><button className="text-link" onClick={() => navigate("shop")}>{t.seeAll}<Icon name="arrow" /></button></div><div className="product-grid home-products">{featuredProducts.map((product) => <ProductCard key={product.id} product={product} lang={lang} onOpen={openProduct} />)}{showcases.map((showcase) => <ShowcaseCard key={showcase.id} showcase={showcase} lang={lang} onOpen={openShowcase} />)}</div></div></section>

          <section className="section shell philosophy"><div className="philosophy-number">03</div><div><span className="eyebrow">{lang === "fr" ? "Notre engagement" : "Our commitment"}</span><h2>{t.philosophy}</h2></div><div><p>{t.philosophyText}</p><button className="text-link" onClick={() => navigate("about")}>{t.nav.about}<Icon name="arrow" /></button></div></section>

          <section className="section shell" id="how"><div className="section-heading"><div><span className="eyebrow">04 — {t.how}</span><h2>{t.how}</h2></div></div><div className="steps">{t.steps.map((step, index) => <article key={step}><span>0{index + 1}</span><div className="step-icon"><Icon name={index === 0 ? "search" : index === 1 ? "check" : "message"} /></div><h3>{step}</h3><p>{t.stepsText[index]}</p></article>)}</div></section>
          <FaqPreview lang={lang} onAll={() => navigate("faq")} />
        </>}

        {(page === "shop" || page === "category") && <CatalogPage lang={lang} isCategory={page === "category"} activeCategory={activeCategory} products={visibleProducts} query={query} setQuery={setQuery} subcategory={subcategory} setSubcategory={setSubcategory} audience={audience} setAudience={setAudience} sort={sort} setSort={setSort} filterOpen={filterOpen} setFilterOpen={setFilterOpen} onShop={() => navigate("shop")} onCategory={openCategory} onProduct={openProduct} onClear={() => { setQuery(""); setSubcategory(""); setAudience(""); }} />}

        {page === "product" && <section className="product-page shell">
          <button className="back-link" onClick={() => openCategory(selectedProduct.category)}><span>←</span>{t.backCategory} · {getCategory(selectedProduct.category).name[lang]}</button>
          <div className="product-detail">
            <div className="product-gallery"><div className="main-image">{selectedProduct.images.length ? <img src={selectedProduct.images[imageIndex] ?? selectedProduct.images[0]} alt={displayName(selectedProduct, lang)} style={fitStyle(selectedProduct)} /> : <><ProductPlaceholder category={selectedProduct.category} /><span className="demo-label">{lang === "fr" ? "Photo réelle à importer" : "Real photo to upload"}</span></>}</div>{selectedProduct.images.length ? <div className="thumbnail-row">{selectedProduct.images.map((src, index) => <button className={index === imageIndex ? "active" : ""} key={src} onClick={() => setImageIndex(index)} aria-label={`${lang === "fr" ? "Angle photo" : "Photo angle"} ${index + 1}`}><img src={src} alt="" style={fitStyle(selectedProduct)} /></button>)}</div> : <><div className="thumbnail-row">{[1, 2, 3, 4].map((item) => <button className={item === 1 ? "active placeholder-thumb" : "placeholder-thumb"} key={item} aria-label={`${lang === "fr" ? "Angle photo" : "Photo angle"} ${item}`}><Icon name="image" /></button>)}</div><p className="photo-guidance">{lang === "fr" ? "Emplacements prévus pour la vue principale, le détail, le profil et la mise en situation. Aucune image illustrative n’est associée au stock." : "Slots for main view, detail, profile and context. No illustrative image is presented as stock photography."}</p></>}</div>
            <div className="product-info"><div className="product-meta"><Status lang={lang} availability={selectedProduct.availability} /><span>{selectedProduct.name ? (audienceLabel(selectedProduct, lang) || getCategory(selectedProduct.category).name[lang]) : lang === "fr" ? "Référence à renseigner" : "Reference to complete"}</span></div><h1>{displayName(selectedProduct, lang)}</h1><div className={selectedProduct.price !== null || selectedProduct.priceOnRequest ? "detail-price" : "detail-price pending-price"}>{selectedProduct.oldPrice && <s className="old-price">{selectedProduct.oldPrice.toLocaleString("fr-FR")} FCFA</s>}{priceLabel(selectedProduct, lang)}</div><p className="detail-description">{selectedProduct.description?.[lang] ?? (lang === "fr" ? "Ajoutez ici une description concise et vérifiée du produit, sans promesse non confirmée." : "Add a concise, verified product description here, without unconfirmed claims.")}</p>
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
  return <article className="product-card placeholder-card" onClick={() => onOpen(product)}><div className="product-image">{product.images[0] ? <img src={product.images[0]} alt={displayName(product, lang)} style={fitStyle(product)} /> : <ProductPlaceholder category={product.category} />}<Status lang={lang} availability={product.availability} /><button aria-label={t.details}><Icon name="arrow" /></button></div><div className="product-card-info"><span>{getCategory(product.category).name[lang]}{product.name ? (audience ? ` · ${audience}` : "") : ` · ${t.placeholder}`}</span><h3>{displayName(product, lang)}</h3><strong className={hasPrice ? "" : "price-placeholder"}>{product.oldPrice && <s className="old-price">{product.oldPrice.toLocaleString("fr-FR")} FCFA</s>}{priceLabel(product, lang)}</strong></div></article>;
}

function ShowcaseCard({ showcase, lang, onOpen }: { showcase: Showcase; lang: Lang; onOpen: (showcase: Showcase) => void }) {
  const t = copy[lang];
  return <article className="product-card placeholder-card" onClick={() => onOpen(showcase)}><div className="product-image">{showcase.image ? <><img src={showcase.image} alt={showcase.title[lang]} style={{ objectPosition: showcase.position ?? "center" }} /><span className="demo-label">{t.moodVisual}</span></> : <ProductPlaceholder category={showcase.category} />}<span className="status confirm"><i />{t.showcaseTag}</span><button aria-label={t.details}><Icon name="arrow" /></button></div><div className="product-card-info"><span>{getCategory(showcase.category).name[lang]}</span><h3>{showcase.title[lang]}</h3><strong>{t.showcaseCta}</strong></div></article>;
}

function CatalogPage({ lang, isCategory, activeCategory, products: visibleProducts, query, setQuery, subcategory, setSubcategory, audience, setAudience, sort, setSort, filterOpen, setFilterOpen, onShop, onCategory, onProduct, onClear }: {
  lang: Lang; isCategory: boolean; activeCategory: Category; products: Product[]; query: string; setQuery: (value: string) => void; subcategory: string; setSubcategory: (value: string) => void; audience: "" | "men" | "women"; setAudience: (value: "" | "men" | "women") => void; sort: string; setSort: (value: string) => void; filterOpen: boolean; setFilterOpen: (value: boolean) => void; onShop: () => void; onCategory: (id: CategoryId) => void; onProduct: (product: Product) => void; onClear: () => void;
}) {
  const t = copy[lang];
  const availablePriceData = visibleProducts.some((product) => product.price !== null);
  const filterCategory = isCategory ? activeCategory : null;
  const selectedSub = activeCategory.subcategories.find((item) => item.id === subcategory);
  const activeTop = selectedSub?.parent ?? selectedSub?.id ?? "";
  const childSubs = activeTop ? activeCategory.subcategories.filter((item) => item.parent === activeTop) : [];
  return <section className="shop-page shell">
    <div className="page-intro">{isCategory && <div className="breadcrumb"><button onClick={onShop}>{t.nav.shop}</button><span>/</span><span>{activeCategory.name[lang]}</span></div>}<span className="eyebrow">{isCategory ? `Collection 0${categories.findIndex((item) => item.id === activeCategory.id) + 1}` : t.catalogReady}</span><h1>{isCategory ? activeCategory.name[lang] : t.shopTitle}</h1><p>{isCategory ? activeCategory.description[lang] : t.shopText}</p>{isCategory && ["watches", "jewelry"].includes(activeCategory.id) && <div className="subcategory-chips audience-chips">{([["", t.allAudience], ["men", t.men], ["women", t.women]] as const).map(([value, label]) => <button className={audience === value ? "active" : ""} key={value} onClick={() => setAudience(value)}>{label}</button>)}</div>}{isCategory && <div className="subcategory-chips">{activeCategory.subcategories.filter((item) => !item.parent).map((item) => <button className={activeTop === item.id ? "active" : ""} key={item.id} onClick={() => setSubcategory(subcategory === item.id ? "" : item.id)}>{item.name[lang]}</button>)}</div>}{isCategory && childSubs.length > 0 && <div className="subcategory-chips child-chips"><button className={subcategory === activeTop ? "active" : ""} onClick={() => setSubcategory(activeTop)}>{t.allSelection}</button>{childSubs.map((item) => <button className={subcategory === item.id ? "active" : ""} key={item.id} onClick={() => setSubcategory(subcategory === item.id ? activeTop : item.id)}>{item.name[lang]}</button>)}</div>}</div>
    {!isCategory && <div className="shop-category-strip">{categories.map((category) => <button key={category.id} onClick={() => onCategory(category.id)}><span>{category.name[lang]}</span><Icon name="arrow" /></button>)}</div>}
    <div className="catalog-toolbar"><label className="search-field"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} /></label><button className="button secondary mobile-filter" onClick={() => setFilterOpen(!filterOpen)}>{t.filters}<span>{filterOpen ? "−" : "+"}</span></button><div className="sort-control"><label>{t.sort}</label><select value={sort} onChange={(event) => setSort(event.target.value)} disabled={!availablePriceData}><option value="newest">{t.newest}</option><option value="low">{t.low}</option><option value="high">{t.high}</option></select></div></div>
    <div className="catalog-layout"><aside className={filterOpen ? "filters open" : "filters"}><div className="filter-head"><strong>{t.filters}</strong><button onClick={onClear}>{t.clear}</button></div>{filterCategory ? <><div className="filter-group"><label>{lang === "fr" ? "Sous-catégorie" : "Subcategory"}</label>{filterCategory.subcategories.filter((item) => !item.parent || item.parent === activeTop).map((item) => <button className={subcategory === item.id ? "filter-option active" : "filter-option"} key={item.id} style={item.parent ? { paddingLeft: 16 } : undefined} onClick={() => setSubcategory(subcategory === item.id ? "" : item.id)}><span>{item.name[lang]}</span><small>—</small></button>)}</div><div className="planned-filters"><label>{lang === "fr" ? "Filtres prévus" : "Planned filters"}</label>{filterCategory.filters[lang].map((filter) => <span key={filter}>{filter}<small>{lang === "fr" ? "À activer avec les données" : "Enable with data"}</small></span>)}</div></> : <div className="filter-group"><label>{lang === "fr" ? "Catégorie" : "Category"}</label>{categories.map((category) => <button className="filter-option" key={category.id} onClick={() => onCategory(category.id)}><span>{category.name[lang]}</span><small>{String(products.filter((item) => item.category === category.id && item.name).length).padStart(2, "0")}</small></button>)}</div>}<div className="pilot-note"><span>i</span><p>{lang === "fr" ? "Le tri par prix et les filtres détaillés s’activent uniquement lorsque les données réelles sont renseignées." : "Price sorting and detailed filters are only enabled once real data is entered."}</p></div></aside><div className="catalog-content"><div className="result-head"><span><strong>{visibleProducts.length}</strong> {t.results}</span><span>{isCategory ? activeCategory.name[lang] : t.shopTitle}</span></div>{visibleProducts.length ? <div className="product-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} lang={lang} onOpen={onProduct} />)}</div> : <div className="empty-state"><div><Icon name="search" size={28} /></div><h2>{t.noResults}</h2><p>{subcategory || audience ? t.noMatch : t.noResultsText}</p><button className="button secondary" onClick={onClear}>{t.clear}</button></div>}</div></div>
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
