import { useMemo, useState } from "react";

type Lang = "fr" | "en";
type Page = "home" | "shop" | "category" | "product" | "about" | "faq" | "system";
type CategoryId = "watches" | "jewelry" | "bags" | "scarves" | "fashion" | "tech";

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
const iphoneModels = ["11", "11 Pro", "11 Pro Max", "12", "12 Pro", "12 Pro Max", "13", "13 Pro", "13 Pro Max", "14", "14 Pro", "14 Pro Max", "15", "15 Pro", "15 Pro Max", "16", "16 Pro", "16 Pro Max", "17", "17 Pro", "17 Pro Max"];
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
    subcategory: "classic",
    audience: "unisex", // à remplacer par "men" ou "women" quand le public est décidé
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

// Produits ajoutés en plus des emplacements. Un produit = un objet ci-dessous.
// Les photos sont dans /public. `priceOnRequest: true` est provisoire : remplacer par `price: 5000` (en FCFA)
// quand le prix est connu, et passer `availability` à "available" ou "preorder" pour activer la commande WhatsApp.
const newProduct = (id: string, category: CategoryId, data: Partial<Product>): Product => ({
  id, category, slot: 0, name: null, price: null, description: null, images: [], variants: [],
  availability: "pending", subcategory: null, features: null, addedAt: null, featured: false,
  audience: null, priceOnRequest: true, imageFit: "contain", ...data,
});

const catalogue: Product[] = [
  newProduct("tech-cable-tdkc313-lightning", "tech", {
    name: { fr: "Câble TDKC 313 USB-C vers Lightning 27 W (1 m)", en: "TDKC 313 USB-C to Lightning cable 27 W (1 m)" },
    subcategory: "cable-usbc-lightning",
    images: ["/cable-tdkc313-lightning.jpg"],
    description: {
      fr: "Câble de charge rapide USB-C vers Lightning, 1 m, avec la mention 27 W Power Delivery sur l’emballage.",
      en: "USB-C to Lightning fast-charging cable, 1 m, marked 27 W Power Delivery on the packaging.",
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
      fr: "Câble Apple USB-C vers Lightning de 1 m, livré dans sa boîte.",
      en: "Apple USB-C to Lightning cable, 1 m, supplied in its box.",
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
      fr: "Câble de charge Apple USB-C vers USB-C de 2 m, livré dans sa boîte.",
      en: "Apple USB-C to USB-C charge cable, 2 m, supplied in its box.",
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
      fr: "Adaptateur secteur 45 W Power Delivery, avec un câble USB-C vers USB-C (5 A) inclus.",
      en: "45 W Power Delivery wall adapter, with a USB-C to USB-C (5 A) cable included.",
    },
    features: {
      fr: ["Puissance indiquée sur l’emballage : 45 W (PD)", "Sortie : USB-C", "Câble USB-C vers USB-C (5 A) inclus", "Prise européenne", "Coloris : noir"],
      en: ["Power marked on the packaging: 45 W (PD)", "Output: USB-C", "USB-C to USB-C (5 A) cable included", "European plug", "Colour: black"],
    },
  }),
  newProduct("tech-chargeur-iphone-couleurs", "tech", {
    name: { fr: "Chargeur secteur + câble USB-A vers Lightning (iPhone)", en: "Wall charger + USB-A to Lightning cable (iPhone)" },
    subcategory: "charger-iphone",
    images: ["/chargeur-iphone-blanc.jpg", "/chargeur-iphone-orange.jpg", "/chargeur-iphone-jaune.jpg", "/chargeur-iphone-rose.jpg"],
    variants: ["Blanc", "Orange", "Jaune", "Rose"],
    description: {
      fr: "Chargeur secteur USB-A livré avec un câble USB-A vers Lightning pour iPhone, en plusieurs coloris : blanc, orange, jaune et rose.",
      en: "USB-A wall charger supplied with a USB-A to Lightning cable for iPhone, in several colours: white, orange, yellow and pink.",
    },
    features: {
      fr: ["Câble : USB-A vers Lightning inclus", "Pour iPhone", "Prise européenne", "Coloris : blanc, orange, jaune, rose"],
      en: ["Cable: USB-A to Lightning included", "For iPhone", "European plug", "Colours: white, orange, yellow, pink"],
    },
  }),
  newProduct("tech-chargeur-35w-iphone", "tech", {
    name: { fr: "Chargeur 35 W USB-C + câble USB-C vers Lightning", en: "35 W USB-C charger + USB-C to Lightning cable" },
    subcategory: "charger-iphone",
    images: ["/chargeur-35w-lightning-orange.jpg"],
    description: {
      fr: "Adaptateur secteur 35 W avec sortie USB-C et câble USB-C vers Lightning inclus, en orange.",
      en: "35 W wall adapter with a USB-C output and a USB-C to Lightning cable included, in orange.",
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
      fr: "Petit chargeur secteur « Adaptive Fast Charging » avec sortie USB-A, livré avec un câble USB-A vers USB-C.",
      en: "Compact “Adaptive Fast Charging” wall charger with a USB-A output, supplied with a USB-A to USB-C cable.",
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
      fr: "Petit chargeur secteur « Adaptive Fast Charging » avec sortie USB-A, livré avec un câble USB-A vers Micro USB, en blanc.",
      en: "Compact “Adaptive Fast Charging” wall charger with a USB-A output, supplied with a USB-A to Micro USB cable, in white.",
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
      fr: "Câble USB-A vers Micro USB pour la charge et le transfert de données, en blanc.",
      en: "USB-A to Micro USB cable for charging and data transfer, in white.",
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
      fr: "Un seul câble USB-A avec trois embouts : USB-C, Lightning et Micro USB. Gaine en nylon tressé, longueur 1,2 m.",
      en: "A single USB-A cable with three tips: USB-C, Lightning and Micro USB. Braided nylon sheath, 1.2 m long.",
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
      fr: "Le power bank qui se fixe à ton téléphone. 10 000 mAh, 4 câbles intégrés (USB-A, USB-C, Lightning, Micro USB) : plus besoin de chercher ton câble, il y a toujours le bon, que tu aies un iPhone, un Samsung ou un autre. Les ventouses au dos le collent au téléphone, la dragonne se glisse au poignet ou au sac. Idéal pour les cours, les trajets et les sorties. Câble USB-A vers USB-C fourni, garantie 365 jours.",
      en: "The power bank that sticks to your phone. 10,000 mAh and 4 built-in cables (USB-A, USB-C, Lightning, Micro USB): always the right cable, whether you have an iPhone, a Samsung or another phone. The suction cups on the back hold it on the phone and the strap clips to your wrist or bag. Ideal for classes, commuting and nights out. USB-A to USB-C cable supplied, 365-day warranty.",
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
      fr: "Un power bank blanc, fin et facile à glisser dans un sac. 10 000 mAh, 4 câbles de sortie intégrés pour charger tes appareils sans rien emporter d’autre, et une entrée/sortie USB-C pour le recharger vite et charger un appareil USB-C. Garantie 365 jours.",
      en: "A slim white power bank that slips easily into a bag. 10,000 mAh, 4 built-in output cables so you carry nothing else, and a USB-C input/output to recharge it quickly and charge USB-C devices. 365-day warranty.",
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
      fr: "Un power bank blanc qui te dit où il en est. 10 000 mAh, écran LED pour voir le niveau de charge d’un coup d’œil (25, 50, 75, 100), et 4 câbles intégrés (USB-A, USB-C, Lightning, Micro USB) pour charger iPhone, Android et accessoires. Câble USB-A vers USB-C fourni, charge rapide annoncée sur l’emballage.",
      en: "A white power bank that shows you where it stands. 10,000 mAh, an LED display for the charge level at a glance (25, 50, 75, 100), and 4 built-in cables (USB-A, USB-C, Lightning, Micro USB) to charge iPhone, Android and accessories. USB-A to USB-C cable supplied, fast charging marked on the packaging.",
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
      fr: "Le power bank sans fil : il se colle au dos de ton téléphone grâce à l’aimant et le recharge sans câble (15 W annoncés), avec un petit support pour regarder tes vidéos. 10 000 mAh, charge rapide 22,5 W (PD + QC), plus une sortie USB-C et une sortie USB-A pour recharger d’autres appareils en même temps. Câble USB-C vers USB-C fourni, dragonne incluse.",
      en: "The wireless power bank: it snaps to the back of your phone with its magnet and charges it without a cable (15 W marked), with a small stand for watching videos. 10,000 mAh, 22.5 W fast charging (PD + QC), plus a USB-C and a USB-A output to charge other devices at the same time. USB-C to USB-C cable supplied, strap included.",
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
      fr: "Plus d’autonomie pour toute la journée. 15 000 mAh, écran LED qui affiche le pourcentage exact de charge, 4 câbles intégrés (USB-A, USB-C, Lightning, Micro USB) et 4 sorties pour charger plusieurs appareils en même temps : téléphone, écouteurs, tablette. Charge rapide annoncée sur l’emballage.",
      en: "More battery for the whole day. 15,000 mAh, an LED screen showing the exact charge percentage, 4 built-in cables (USB-A, USB-C, Lightning, Micro USB) and 4 outputs to charge several devices at once: phone, earbuds, tablet. Fast charging marked on the packaging.",
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
      fr: "La grosse autonomie, en format compact. 20 000 mAh, charge rapide 22,5 W (PD, QC3.0), écran LED du niveau de charge et câble USB-C intégré toujours avec toi, en plus d’un câble USB-C vers USB-C fourni. Parfait pour les longues journées, les voyages et les téléphones récents. Garantie 365 jours.",
      en: "Big battery life in a compact body. 20,000 mAh, 22.5 W fast charging (PD, QC3.0), an LED charge-level display and a built-in USB-C cable always with you, plus a USB-C to USB-C cable supplied. Perfect for long days, travel and recent phones. 365-day warranty.",
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
      fr: "Le grand format pour ne jamais tomber à plat. 20 000 mAh, écran LED du niveau de charge (25, 50, 75, 100), câbles intégrés pour charger sans rien chercher et dragonne pour le transporter facilement. Le bon choix si tu charges plusieurs appareils ou si tu passes de longues journées dehors.",
      en: "The big one, so you never run flat. 20,000 mAh, an LED charge-level display (25, 50, 75, 100), built-in cables so you never have to look for one and a strap to carry it easily. A great choice if you charge several devices or spend long days out.",
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
      fr: "Des écouteurs à clip qui se posent sur l’oreille sans la boucher : tu écoutes ta musique tout en restant attentif à ce qui t’entoure, et ils restent confortables longtemps. Commandes tactiles, micro HD intégré pour les appels, son Hi-Fi avec extra bass, et un boîtier de charge USB-C argenté. Livrés avec câble de charge et embouts.",
      en: "Clip-on earphones that sit on the ear without blocking it: you enjoy your music while staying aware of your surroundings, and they stay comfortable for long. Touch controls, built-in HD microphone for calls, Hi-Fi sound with extra bass, and a silver USB-C charging case. Supplied with a charging cable and ear tips.",
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
      fr: "Des écouteurs open-ear noirs au design léger et original : tu les portes toute la journée sans gêne et tu gardes l’oreille libre. Son Hi-Fi, longue autonomie annoncée et boîtier de charge USB-C. Livrés avec câble de charge et 4 embouts.",
      en: "Black open-ear earbuds with a light, distinctive design: wear them all day without discomfort and keep your ears open. Hi-Fi sound, long battery life as marked, and a USB-C charging case. Supplied with a charging cable and 4 ear tips.",
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
      fr: "Des écouteurs Bluetooth 5.3 à crochet d’oreille, pensés pour rester stables et confortables pendant le sport comme en cours. Son Hi-Fi, boîtier de charge avec affichage LED du niveau de batterie, et une pochette de rangement avec mousqueton fournie.",
      en: "Bluetooth 5.3 earphones with ear hooks, designed to stay stable and comfortable during sport and in class. Hi-Fi sound, a charging case with an LED battery display, and a carry pouch with carabiner included.",
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
      fr: "Des écouteurs Bluetooth 5.3 à clip, noirs, pour la musique, les appels et le jeu. Son Hi-Fi avec basses profondes, latence annoncée nulle, connexion stable et port confortable. Livrés avec câble de charge et 6 embouts.",
      en: "Black Bluetooth 5.3 clip-on earbuds for music, calls and gaming. Hi-Fi sound with deep bass, zero delay as marked, a stable connection and a comfortable fit. Supplied with a charging cable and 6 ear tips.",
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
      fr: "Des écouteurs sans fil blancs, simples et légers, pour écouter ta musique et téléphoner sans fil. Chaque écouteur tient environ 2,5 h, et le boîtier de charge 350 mAh peut les recharger environ 4 fois. Un très bon point d’entrée pour passer au sans fil.",
      en: "Simple, lightweight white wireless earbuds for music and calls without wires. Each earbud lasts about 2.5 h, and the 350 mAh charging case can recharge them about 4 times. A great entry point into wireless audio.",
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
      fr: "Des écouteurs sans fil blancs avec micro intégré pour les appels, un son Hi-Fi et un boîtier de charge compact. Ils sont livrés avec un étui en silicone avec mousqueton, 6 embouts et un câble de charge USB-A vers USB-C : tout est inclus dès l’ouverture de la boîte.",
      en: "White wireless earbuds with a built-in microphone for calls, Hi-Fi sound and a compact charging case. Supplied with a silicone case with carabiner, 6 ear tips and a USB-A to USB-C charging cable: everything is included in the box.",
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
      fr: "Des écouteurs sans fil blancs au port confortable, avec un son de qualité, une longue autonomie annoncée, une connexion stable et un boîtier de charge compact.",
      en: "White wireless earbuds with a comfortable fit, quality sound, long battery life as marked, a stable connection and a compact charging case.",
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
      fr: "Les AirPods 3, livrés dans leur boîte avec le boîtier de charge, un câble USB-C vers Lightning et la notice. Un design sans embouts, léger et facile à porter, qui se connecte facilement à ton iPhone.",
      en: "AirPods 3, supplied in their box with the charging case, a USB-C to Lightning cable and the manual. A lightweight, easy-to-wear design without ear tips that connects easily to your iPhone.",
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
      fr: "Les AirPods Pro avec embouts en silicone pour un port bien ajusté, boîtier de charge et câble USB-C vers USB-C fourni, dans leur boîte avec la notice. Le choix haut de gamme de la sélection.",
      en: "AirPods Pro with silicone ear tips for a snug fit, a charging case and a USB-C to USB-C cable, supplied in their box with the manual. The high-end pick of the selection.",
    },
    features: {
      fr: ["Modèle : AirPods Pro", "Embouts en silicone", "Boîtier de charge inclus", "Câble USB-C vers USB-C fourni", "Avec boîte et notice", "Coloris : blanc"],
      en: ["Model: AirPods Pro", "Silicone ear tips", "Charging case included", "USB-C to USB-C cable supplied", "With box and manual", "Colour: white"],
    },
  }),
];

// Les emplacements vides d'une catégorie disparaissent dès qu'elle contient de vrais produits.
const placeholders = emptySlots.filter((slot) => !catalogue.some((item) => item.category === slot.category));
const products: Product[] = [...placeholders.map((product) => ({ ...product, ...realProducts[product.id] })), ...catalogue];

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
  return <article className="product-card placeholder-card" onClick={() => onOpen(product)}><div className="product-image">{product.images[0] ? <img src={product.images[0]} alt={displayName(product, lang)} style={fitStyle(product)} /> : <ProductPlaceholder category={product.category} />}<Status lang={lang} availability={product.availability} /><button aria-label={t.details}><Icon name="arrow" /></button></div><div className="product-card-info"><span>{getCategory(product.category).name[lang]}{product.name ? (audience ? ` · ${audience}` : "") : ` · ${t.placeholder}`}</span><h3>{displayName(product, lang)}</h3><strong className={hasPrice ? "" : "price-placeholder"}>{priceLabel(product, lang)}</strong></div></article>;
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
