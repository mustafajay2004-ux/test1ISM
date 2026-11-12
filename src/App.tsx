import { useEffect, useMemo, useState } from "react";

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
const WHATSAPP_NUMBER = "221706887356";

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
      sub("computer-mac", "MacBook", "MacBook", "computer"),
      sub("computer-gaming", "PC gamer et pro", "Gaming & pro laptops", "computer"),
      sub("computer-office", "PC bureautique", "Everyday laptops", "computer"),
      sub("tablets", "Tablettes", "Tablets"),
      sub("drives", "Disques durs", "Hard drives"),
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
      fr: "Cette montre Day-Date de 36 mm adopte un format classique, facile à porter avec une tenue habillée. Elle est fournie avec sa boîte. À noter : aucun certificat ni facture d’origine n’est fourni.",
      en: "This 36 mm Day-Date watch has a classic size that pairs easily with dressier outfits. It comes with its box. Please note: no original certificate or invoice is supplied.",
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
      fr: "Cette montre est présentée sous le nom Audemars Piguet et fournie avec sa boîte. Le modèle exact et sa référence restent à confirmer avant publication de la fiche.",
      en: "This watch is presented under the Audemars Piguet name and comes with its box. The exact model and reference still need to be confirmed before the listing is published.",
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
  availability: "available", subcategory: null, features: null, addedAt: null, featured: false,
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
      fr: "Pour relier un appareil équipé d’un port Lightning à un chargeur USB-C, ce câble TDKC 313 mesure 1 m. La puissance de 27 W Power Delivery est indiquée sur l’emballage.",
      en: "Connect an iPhone with a Lightning port to a USB-C charger with this 1 m TDKC 313 cable. The packaging lists 27 W Power Delivery.",
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
      fr: "Un câble Apple USB-C vers Lightning de 1 m, présenté dans sa boîte. Un indispensable à garder près du chargeur ou à glisser dans son sac.",
      en: "A 1 m Apple USB-C to Lightning cable, supplied in its box. A useful everyday cable to keep by your charger or carry in your bag.",
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
      fr: "Avec ses 2 m, ce câble Apple USB-C vers USB-C laisse davantage de liberté pour installer son téléphone ou sa tablette pendant la charge. Il est vendu dans sa boîte.",
      en: "At 2 m long, this Apple USB-C to USB-C cable gives you more freedom to use your phone or tablet while it charges. Supplied in its box.",
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
      fr: "Le chargeur secteur USB-C de 45 W annoncé Power Delivery est accompagné d’un câble USB-C vers USB-C de 5 A. Un ensemble prêt à intégrer à son installation de charge.",
      en: "This 45 W USB-C wall charger is marked as Power Delivery and comes with a 5 A USB-C to USB-C cable. A convenient set for your charging setup.",
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
      fr: "Un chargeur secteur USB-A accompagné de son câble USB-A vers Lightning. Il réunit les deux éléments essentiels pour recharger un appareil compatible, avec plusieurs coloris au choix.",
      en: "A USB-A wall charger supplied with a USB-A to Lightning cable. The set brings together the two essentials for charging a compatible device, with several colours to choose from.",
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
      fr: "Ce chargeur orange de 35 W dispose d’une sortie USB-C et est fourni avec un câble USB-C vers Lightning. Le nécessaire pour retrouver chargeur et câble dans un même ensemble.",
      en: "This orange 35 W charger has a USB-C output and comes with a USB-C to Lightning cable. The charger and cable are brought together in one set.",
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
      fr: "Le chargeur TDKC 313 S8 possède une sortie USB-A et porte la mention « Adaptive Fast Charging ». Il est livré avec un câble USB-A vers USB-C pour disposer des deux éléments ensemble.",
      en: "The TDKC 313 S8 charger has a USB-A output and is marked “Adaptive Fast Charging”. It comes with a USB-A to USB-C cable, so both pieces are supplied together.",
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
      fr: "Ce chargeur blanc GRAND S6 est doté d’une sortie USB-A et porte la mention « Adaptive Fast Charging ». Le câble USB-A vers Micro USB est fourni avec le chargeur.",
      en: "This white GRAND S6 charger has a USB-A output and is marked “Adaptive Fast Charging”. A USB-A to Micro USB cable is included.",
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
      fr: "Un câble blanc TDKC313 avec connecteurs USB-A et Micro USB. Il convient à la charge et au transfert de données sur les appareils équipés d’un port Micro USB.",
      en: "A white TDKC313 cable with USB-A and Micro USB connectors. It supports charging and data transfer on devices with a Micro USB port.",
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
      fr: "Un seul câble USB-A réunit trois embouts : USB-C, Lightning et Micro USB. Sa gaine en nylon tressé et sa longueur de 1,2 m en font un compagnon pratique lorsqu’on utilise plusieurs types d’appareils.",
      en: "One USB-A cable comes with three connectors: USB-C, Lightning and Micro USB. Its braided nylon sheath and 1.2 m length make it a practical option when you use different types of devices.",
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
      fr: "Pensé pour garder la charge à portée de main, ce power bank 2SMC de 10 000 mAh se fixe au dos du téléphone grâce à ses ventouses. Ses quatre câbles intégrés couvrent USB-A, USB-C, Lightning et Micro USB ; la dragonne permet aussi de l’attacher à un sac ou de le garder au poignet. Câble USB-A vers USB-C fourni. Garantie annoncée : 365 jours.",
      en: "Designed to keep power close at hand, this 10,000 mAh 2SMC power bank attaches to the back of a phone with suction cups. Its four built-in cables cover USB-A, USB-C, Lightning and Micro USB, while the strap can be attached to a bag or worn around the wrist. USB-A to USB-C cable included. Stated warranty: 365 days.",
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
      fr: "Avec sa capacité indiquée de 10 000 mAh et son boîtier blanc fin, l’Aroimac ARD67 se glisse facilement dans un sac. Quatre câbles de sortie sont intégrés et son port USB-C sert à l’entrée comme à la sortie. Garantie annoncée : 365 jours.",
      en: "With a stated capacity of 10,000 mAh and a slim white body, the Aroimac ARD67 is easy to slip into a bag. It has four built-in output cables and a USB-C port for both input and output. Stated warranty: 365 days.",
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
      fr: "Ce power bank Dakewei de 10 000 mAh affiche le niveau de charge sur son écran LED, par paliers de 25, 50, 75 et 100 %. Quatre câbles intégrés — USB-A, USB-C, Lightning et Micro USB — facilitent la connexion de différents appareils. Un câble USB-A vers USB-C est également fourni ; la charge rapide est annoncée sur l’emballage.",
      en: "This 10,000 mAh Dakewei power bank shows its charge level on an LED display in 25, 50, 75 and 100% increments. Four built-in cables — USB-A, USB-C, Lightning and Micro USB — make it easier to connect different devices. A USB-A to USB-C cable is also included; fast charging is stated on the packaging.",
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
      fr: "Le TDKC313 TDK551 associe une recharge magnétique sans fil annoncée à 15 W à une capacité de 10 000 mAh. Son support intégré permet de poser le téléphone pour regarder une vidéo, tandis que les sorties USB-C et USB-A servent à alimenter d’autres appareils. La puissance de 22,5 W (PD + QC) est indiquée sur le produit. Câble USB-C vers USB-C et dragonne fournis.",
      en: "The TDKC313 TDK551 combines a 10,000 mAh capacity with magnetic wireless charging stated at 15 W. Its built-in stand lets you prop up your phone to watch a video, while the USB-C and USB-A outputs can power other devices. The product lists 22.5 W (PD + QC). USB-C to USB-C cable and strap included.",
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
      fr: "Avec ses 15 000 mAh, ce power bank dispose d’un écran LED qui indique le niveau de charge et de quatre câbles intégrés : USB-A, USB-C, Lightning et Micro USB. Ses quatre sorties permettent de brancher plusieurs appareils selon leurs connecteurs. La charge rapide est mentionnée sur l’emballage.",
      en: "With 15,000 mAh, this power bank features an LED screen showing the charge level and four built-in cables: USB-A, USB-C, Lightning and Micro USB. Its four outputs let you connect several devices with compatible connectors. Fast charging is stated on the packaging.",
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
      fr: "Pour les journées où l’on a besoin de davantage de réserve, ce power bank TDKC313 offre une capacité indiquée de 20 000 mAh. Il réunit une puissance annoncée de 22,5 W (PD, QC3.0), un écran de niveau de charge et un câble USB-C intégré ; un second câble USB-C vers USB-C est fourni. Garantie annoncée : 365 jours.",
      en: "For days when you need more power in reserve, this TDKC313 power bank has a stated capacity of 20,000 mAh. It combines stated 22.5 W output (PD, QC3.0), a charge-level display and a built-in USB-C cable; a second USB-C to USB-C cable is included. Stated warranty: 365 days.",
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
      fr: "Le Dakewei DKW-P26A réunit une capacité indiquée de 20 000 mAh, des câbles intégrés et une dragonne pour le transport. Son écran LED affiche le niveau de charge par paliers de 25, 50, 75 et 100 %. Un format pensé pour garder une réserve d’énergie avec soi au fil de la journée.",
      en: "The Dakewei DKW-P26A combines a stated 20,000 mAh capacity, built-in cables and a carrying strap. Its LED display shows the charge level in 25, 50, 75 and 100% increments. A practical way to keep extra power with you throughout the day.",
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
      fr: "Le format à clip de ces Langeer LGE-NE55 se pose sur l’oreille sans la couvrir. Ils disposent de commandes tactiles et d’un micro HD pour les appels ; le boîtier de charge argenté se recharge en USB-C. Le son Hi-Fi et les basses renforcées sont également annoncés. Câble et embouts fournis.",
      en: "The clip-on design of the Langeer LGE-NE55 sits on the ear without covering it. They feature touch controls and an HD microphone for calls, while the silver charging case uses USB-C. Hi-Fi sound and enhanced bass are also stated. Cable and ear tips included.",
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
      fr: "Avec leur conception open-ear, ces écouteurs noirs se portent sans embout intra-auriculaire. Le boîtier de charge USB-C accompagne les écouteurs, avec le câble de charge et quatre embouts fournis. L’autonomie prolongée est annoncée sur l’emballage.",
      en: "With their open-ear design, these black earbuds sit without an in-ear tip. The USB-C charging case comes with the earbuds, along with a charging cable and four ear tips. Extended battery life is stated on the packaging.",
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
      fr: "Le crochet d’oreille aide à maintenir ces écouteurs Seufre en place, et le Bluetooth 5.3 assure la connexion sans fil. Le boîtier affiche le niveau de batterie par LED. Une pochette avec mousqueton, six embouts et un câble USB-A vers USB-C sont fournis pour le rangement et la recharge.",
      en: "The ear hook helps keep these Seufre earbuds in place, while Bluetooth 5.3 provides the wireless connection. The case displays the battery level with LEDs. A pouch with carabiner, six ear tips and a USB-A to USB-C cable are included for storage and charging.",
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
      fr: "Ces écouteurs Calus M02 PROX adoptent un format à clip et une connexion Bluetooth 5.3. Ils sont présentés pour la musique, les appels et le jeu, avec des basses profondes et une latence annoncée comme nulle sur l’emballage. Le câble de charge et six embouts sont fournis.",
      en: "These Calus M02 PROX earbuds use a clip-on design and Bluetooth 5.3. They are presented for music, calls and gaming, with deep bass and zero latency stated on the packaging. A charging cable and six ear tips are included.",
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
      fr: "Une paire sans fil blanche pour découvrir les écouteurs TWS au quotidien. Chaque écouteur annonce environ 2,5 heures d’autonomie ; le boîtier de 350 mAh est indiqué pour environ quatre recharges. Un modèle simple, accompagné de son câble USB-A vers Micro USB.",
      en: "A white wireless pair for everyday use and an easy introduction to TWS earbuds. Each earbud is rated for around 2.5 hours of use, while the 350 mAh case is stated to provide about four recharges. A straightforward model supplied with a USB-A to Micro USB cable.",
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
      fr: "Ces écouteurs TWS blancs sont accompagnés d’un boîtier de charge compact et d’un micro intégré pour les appels. L’ensemble comprend aussi un étui en silicone avec mousqueton, six embouts et un câble USB-A vers USB-C : de quoi ranger et transporter les accessoires avec les écouteurs.",
      en: "These white TWS earbuds come with a compact charging case and a built-in microphone for calls. The set also includes a silicone case with carabiner, six ear tips and a USB-A to USB-C cable, keeping the accessories together with the earbuds.",
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
      fr: "Une paire d’écouteurs True Wireless blanche avec son boîtier de charge compact. Le modèle est présenté avec une connexion stable, un port confortable et une autonomie prolongée annoncée sur l’emballage. Une silhouette discrète qui s’intègre facilement aux habitudes de tous les jours.",
      en: "A white pair of True Wireless earbuds supplied with a compact charging case. The model is presented with a stable connection, a comfortable fit and extended battery life stated on the packaging. A simple design that fits easily into everyday routines.",
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
      fr: "Avec leur format sans embouts, les AirPods 3 offrent une silhouette légère et se connectent facilement à un iPhone. Le boîtier de charge, le câble USB-C vers Lightning et la notice sont inclus dans la boîte.",
      en: "With their ear-tip-free design, AirPods 3 have a lightweight profile and connect easily to an iPhone. The charging case, USB-C to Lightning cable and instructions are included in the box.",
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
      fr: "Les AirPods Pro sont présentés avec des embouts en silicone pour un maintien ajusté. Le boîtier de charge, le câble USB-C vers USB-C et la notice sont fournis dans la boîte. Les éléments essentiels sont réunis pour retrouver l’ensemble au même endroit.",
      en: "AirPods Pro come with silicone ear tips for an adjusted fit. The charging case, USB-C to USB-C cable and instructions are supplied in the box. The key items are brought together in one package.",
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
      fr: "Ces Free Buds LGE-20 sont des écouteurs intra-auriculaires Bluetooth 5.3 avec micro pour les appels et isolation du bruit annoncée. Le boîtier affiche le niveau de batterie en pourcentage. L’autonomie indiquée peut atteindre 5,5 h par charge et 20 h avec le boîtier ; câble USB-A vers USB-C fourni.",
      en: "These Free Buds LGE-20 are Bluetooth 5.3 in-ear earbuds with a microphone for calls and stated noise isolation. The case displays the battery level as a percentage. Stated battery life is up to 5.5 hours per charge and 20 hours with the case; USB-A to USB-C cable included.",
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
      fr: "Le boîtier en tissu et les finitions brillantes donnent aux Ormushie OMS-FREE une présentation soignée. Leur format à clip se pose sur l’oreille ; le son Hi-Fi, les basses renforcées et la qualité des appels sont annoncés pour ce modèle. Câble USB-A vers USB-C, six embouts et notice fournis.",
      en: "The fabric case and glossy details give the Ormushie OMS-FREE a neat presentation. Their clip-on design sits on the ear; Hi-Fi sound, enhanced bass and call quality are stated for this model. USB-A to USB-C cable, six ear tips and instructions included.",
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
      fr: "Le Sony WH-XM5 associe réduction de bruit active et son 360 Reality Audio. L’autonomie annoncée peut atteindre 30 heures. Pour les déplacements ou les moments d’écoute au calme, il est livré avec un étui de transport, deux câbles, dont un audio jack 3,5 mm, et un adaptateur avion.",
      en: "The Sony WH-XM5 combines active noise cancelling with 360 Reality Audio. Stated battery life is up to 30 hours. For travel or quieter listening moments, it comes with a carrying case, two cables including a 3.5 mm audio cable, and an airplane adapter.",
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
      fr: "Ce casque JBL Pure Bass A18 est Bluetooth, léger et pliable. Son format se range facilement dans la pochette fournie, pratique pour le glisser dans un sac entre deux utilisations. Le son Hi-Fi et les basses marquées font partie des caractéristiques annoncées. Câble USB-A vers Micro USB fourni.",
      en: "The JBL Pure Bass A18 is a lightweight, foldable Bluetooth headset. It fits into the supplied pouch, making it easy to carry in a bag between uses. Hi-Fi sound and pronounced bass are among its stated features. USB-A to Micro USB cable included.",
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
      fr: "Le JBL Live 660NC est équipé d’une réduction de bruit active. L’autonomie pouvant atteindre 50 heures est annoncée sur l’emballage, tout comme la fonction Fast Pair pour faciliter l’appairage avec un téléphone Android. Coloris noir.",
      en: "The JBL Live 660NC features active noise cancelling. Battery life of up to 50 hours is stated on the packaging, along with Fast Pair for easier pairing with an Android phone. Black.",
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
      fr: "Le JBL Super Bass I12 couvre les oreilles avec de grands coussinets et un arceau rembourré. Les commandes placées sur l’oreillette permettent de gérer la musique et les appels sans chercher son téléphone. Un casque Bluetooth noir au style enveloppant.",
      en: "The JBL Super Bass I12 sits over the ears with large cushions and a padded headband. Controls on the earcup let you manage music and calls without reaching for your phone. A black Bluetooth headset with an enveloping fit.",
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
      fr: "Les AirPods Max se distinguent par leur structure en aluminium, leurs mailles et leurs coussinets enveloppants. Ils sont fournis dans leur boîte avec un étui, un câble USB-C vers USB-C et la notice.",
      en: "AirPods Max feature an aluminium structure, mesh and enveloping ear cushions. They are supplied in their box with a case, a USB-C to USB-C cable and the instructions.",
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
      fr: "Le Bose QuietComfort Ultra associe réduction de bruit et coussinets doux, avec une autonomie prolongée annoncée. Il est fourni avec un étui rigide, un câble USB-A vers USB-C et un câble audio jack 3,5 mm. Coloris noir.",
      en: "The Bose QuietComfort Ultra combines noise cancelling with soft ear cushions and extended battery life as stated. It comes with a hard case, a USB-A to USB-C cable and a 3.5 mm audio cable. Black.",
    },
    features: {
      fr: ["Réduction de bruit", "Son premium, longue autonomie (mention de l’emballage)", "Port confortable", "Étui rigide, câble USB-A vers USB-C et câble jack 3,5 mm fournis", "Marque : Bose – modèle QuietComfort Ultra", "Coloris : noir"],
      en: ["Noise cancelling", "Premium sound, long battery life (marked on the packaging)", "Comfortable fit", "Hard case, USB-A to USB-C cable and 3.5 mm audio cable supplied", "Brand: Bose – model QuietComfort Ultra", "Colour: black"],
    },
  }),
  caseProduct("tech-coque-14plus-alveoles-violet", "14 Plus", ["/coque-14plus-alveoles-violet.jpg"],
    ["Coque alvéoles violette – iPhone 14 Plus", "Purple honeycomb case – iPhone 14 Plus"],
    ["Le violet et le motif alvéolé brillant donnent à cette coque un relief graphique sans surcharger le dos du téléphone. Les boutons sont recouverts pour garder une finition uniforme.", "Glossy purple and a honeycomb pattern give this case a graphic look without making the back feel busy. The covered buttons keep the finish consistent."],
    [["Motif alvéoles (hexagones)", "Boutons recouverts", "Coloris : violet"], ["Honeycomb (hexagon) pattern", "Covered buttons", "Colour: purple"]]),
  caseProduct("tech-coque-13pro-monogramme-marron", "13 Pro", ["/coque-13pro-monogramme-marron-1.jpg", "/coque-13pro-monogramme-marron-2.jpg"],
    ["Coque marron à motif monogramme – iPhone 13 Pro", "Brown monogram-pattern case – iPhone 13 Pro"],
    ["Le marron à effet cuir est marqué par un monogramme en relief, encadré de bords noirs. Une coque aux tons classiques, avec un motif qui se remarque de près.", "The brown leather-look finish features a raised monogram framed by black edges. A classic colour combination with a pattern that stands out on closer look."],
    [["Finition aspect cuir, motif monogramme en relief", "Bords noirs", "Coloris : marron"], ["Leather-look finish, embossed monogram pattern", "Black edges", "Colour: brown"]]),
  caseProduct("tech-coque-15-magsafe-transparente", "15", ["/coque-15-magsafe-transparente.jpg"],
    ["Coque transparente MagSafe antichoc – iPhone 15", "Clear shockproof MagSafe case – iPhone 15"],
    ["Son dos transparent laisse apparaître la couleur de l’iPhone, tandis que les coins renforcés et l’anneau MagSafe ajoutent des détails pratiques au quotidien. Elle peut être utilisée avec un chargeur ou un support magnétique compatible.", "The clear back lets the iPhone’s colour show through, while reinforced corners and a MagSafe ring add practical details for everyday use. It can be used with a compatible magnetic charger or mount."],
    [["Transparente", "Coins renforcés antichoc", "Anneau MagSafe visible", "Coloris : transparent"], ["Clear", "Reinforced shockproof corners", "MagSafe ring visible", "Colour: clear"]]),
  caseProduct("tech-coque-12pro-magsafe-gris-mat", "12 Pro", ["/coque-12pro-magsafe-gris-mat.jpg"],
    ["Coque MagSafe gris mat, bord noir – iPhone 12 Pro", "Matte grey MagSafe case with black edge – iPhone 12 Pro"],
    ["Le dos gris mat translucide est souligné par un bord noir et un anneau MagSafe visible. Une combinaison sobre qui laisse deviner le téléphone tout en lui donnant une finition plus contrastée.", "The translucent matte grey back is outlined by a black edge and a visible MagSafe ring. An understated combination that lets the phone show through while adding contrast."],
    [["Dos gris mat, bord noir", "Anneau MagSafe visible", "Coloris : gris / noir"], ["Matte grey back, black edge", "MagSafe ring visible", "Colour: grey / black"]]),
  caseProduct("tech-coque-16pro-orange-tisse", "16 Pro", ["/coque-16pro-orange-tisse.jpg"],
    ["Coque orange motif tissé – iPhone 16 Pro", "Orange woven-pattern case – iPhone 16 Pro"],
    ["L’orange brillant attire le regard, avec un motif tissé noir et beige qui donne du relief au dos. Les contours dorés autour des caméras prolongent les détails de la coque.", "Glossy orange catches the eye, while the black and beige woven pattern adds texture to the back. Gold-tone camera surrounds carry the detailing through the design."],
    [["Finition brillante, motif tissé noir et beige", "Contours dorés autour des caméras", "Coloris : orange"], ["Glossy finish, black and beige woven pattern", "Gold rings around the cameras", "Colour: orange"]]),
  caseProduct("tech-coque-17pro-noire-tisse", "17 Pro", ["/coque-17pro-noire-tisse.jpg"],
    ["Coque noire motif tissé – iPhone 17 Pro", "Black woven-pattern case – iPhone 17 Pro"],
    ["Le noir brillant est travaillé par un motif tissé gris et noir. Les contours argentés autour des caméras apportent un contraste discret à cette coque au style sombre.", "Glossy black is detailed with a grey-and-black woven pattern. Silver-tone camera surrounds add a subtle contrast to this dark design."],
    [["Finition brillante, motif tissé noir et gris", "Contours argentés autour des caméras", "Coloris : noir"], ["Glossy finish, black and grey woven pattern", "Silver rings around the cameras", "Colour: black"]]),
  caseProduct("tech-coque-14pro-magsafe-blanche", "14 Pro", ["/coque-14pro-magsafe-blanche.jpg"],
    ["Coque transparente blanche MagSafe – iPhone 14 Pro", "White-tinted clear MagSafe case – iPhone 14 Pro"],
    ["Le dos blanc cassé transparent laisse entrevoir le téléphone, avec un anneau MagSafe sombre qui ressort au centre. Les coins renforcés complètent cette coque aux tons clairs.", "The translucent off-white back lets the phone show through, with a dark MagSafe ring standing out at the centre. Reinforced corners complete this light-toned case."],
    [["Dos blanc cassé, transparente", "Coins renforcés", "Anneau MagSafe visible", "Coloris : blanc / transparent"], ["Off-white back, clear", "Reinforced corners", "MagSafe ring visible", "Colour: white / clear"]]),
  caseProduct("tech-coque-13pro-fleurs-violet", "13 Pro", ["/coque-13pro-fleurs-violet.jpg"],
    ["Coque violette fleurs et papillon « Smile » – iPhone 13 Pro", "Purple flowers and butterfly “Smile” case – iPhone 13 Pro"],
    ["Fleurs en relief, perles et papillon translucide composent le décor de cette coque violette. Le message « A smile is the prettiest thing you can wear » ajoute une touche personnelle à son style très détaillé.", "Raised flowers, pearls and a translucent butterfly decorate this purple case. The message “A smile is the prettiest thing you can wear” adds a personal touch to its detailed look."],
    [["Décor 3D : fleurs, perles et papillon", "Message « Nice / Smile »", "Coloris : violet"], ["3D decoration: flowers, pearls and butterfly", "“Nice / Smile” message", "Colour: purple"]]),
  caseProduct("tech-coque-14pro-fumee-phone-case", "14 Pro", ["/coque-14pro-fumee-phone-case.jpg"],
    ["Coque fumée transparente – iPhone 14 Pro", "Smoke-tint clear case – iPhone 14 Pro"],
    ["La teinte fumée laisse encore deviner le téléphone, tandis que le motif en relief et les coins renforcés donnent du caractère à la coque. Un choix sombre, sans être complètement opaque.", "The smoke tint still lets the phone show through, while the raised pattern and reinforced corners give the case added character. A dark look without being fully opaque."],
    [["Transparente teintée fumée", "Motif en relief", "Coins renforcés", "Coloris : fumé / noir"], ["Smoke-tinted clear", "Embossed pattern", "Reinforced corners", "Colour: smoke / black"]]),
  caseProduct("tech-coque-14pro-rose-transparente", "14 Pro", ["/coque-14pro-rose-transparente.jpg"],
    ["Coque rose à bord transparent – iPhone 14 Pro", "Pink case with clear edge – iPhone 14 Pro"],
    ["Le rose vif et brillant donne immédiatement le ton. Le bord transparent apporte un contraste léger autour de la coque et les angles sont conçus pour être renforcés.", "Bright glossy pink sets the tone straight away. The clear edge adds a light contrast around the case, with reinforced corners."],
    [["Dos rose brillant, bord transparent", "Coins renforcés", "Coloris : rose"], ["Glossy pink back, clear edge", "Reinforced corners", "Colour: pink"]]),
  caseProduct("tech-coque-14pro-magsafe-bronze", "14 Pro", ["/coque-14pro-magsafe-bronze.jpg"],
    ["Coque MagSafe doré / bronze – iPhone 14 Pro", "Gold / bronze MagSafe case – iPhone 14 Pro"],
    ["Le dos doré translucide rencontre un bord bronze et un anneau MagSafe bien visible. Les tons chauds donnent à cette coque un aspect lumineux tout en laissant apparaître une partie du téléphone.", "The translucent gold back meets a bronze edge and a clearly visible MagSafe ring. Warm tones give this case a bright look while allowing part of the phone to show through."],
    [["Dos doré, bord bronze", "Anneau MagSafe visible", "Coloris : doré / bronze"], ["Gold back, bronze edge", "MagSafe ring visible", "Colour: gold / bronze"]]),
  caseProduct("tech-coque-13promax-strass-papillon", "13 Pro Max", ["/coque-13promax-strass-papillon.jpg"],
    ["Coque transparente strass dorés et papillon – iPhone 13 Pro Max", "Clear case with gold rhinestones and butterfly – iPhone 13 Pro Max"],
    ["Un fond doré pailleté, des strass et un papillon en relief composent le décor de cette coque transparente. Les coins renforcés complètent le modèle, pensé pour celles et ceux qui aiment les détails brillants.", "A glittery gold base, rhinestones and a raised butterfly create the look of this clear case. Reinforced corners complete the design, made for those who enjoy sparkling details."],
    [["Strass et contour doré", "Fond pailleté, papillon décoratif", "Coins renforcés", "Coloris : transparent / doré"], ["Rhinestones and gold frame", "Glitter background, decorative butterfly", "Reinforced corners", "Colour: clear / gold"]]),
  caseProduct("tech-coque-13promax-alveoles-noire", "13 Pro Max", ["/coque-13promax-alveoles-noire.jpg"],
    ["Coque fumée alvéoles antichoc – iPhone 13 Pro Max", "Smoke honeycomb shockproof case – iPhone 13 Pro Max"],
    ["La teinte noire fumée et le motif alvéolé donnent à cette coque un aspect texturé et discret. Les coins renforcés ajoutent un détail fonctionnel à son dessin géométrique.", "The smoked black tint and honeycomb pattern give this case a subtle, textured look. Reinforced corners add a practical detail to its geometric design."],
    [["Motif alvéoles", "Coins renforcés antichoc", "Coloris : noir fumé"], ["Honeycomb pattern", "Reinforced shockproof corners", "Colour: smoke black"]]),
  caseProduct("tech-coque-13promax-strass-vert-dragonne", "13 Pro Max", ["/coque-13promax-strass-vert-dragonne.jpg"],
    ["Coque strass verts avec dragonne et breloques – iPhone 13 Pro Max", "Green rhinestone case with strap and charms – iPhone 13 Pro Max"],
    ["Les strass verts bordent le dos transparent et pailleté, accompagnés d’une dragonne tressée et de petites breloques : trèfle, papillons et médailles. Un modèle décoratif qui permet aussi de garder le téléphone en main grâce à sa dragonne.", "Green rhinestones frame the clear glittery back, alongside a braided strap and small charms: a clover, butterflies and medallions. A decorative design that also gives you a strap to hold the phone."],
    [["Strass verts, fond pailleté", "Dragonne tressée verte et breloques", "Coins renforcés", "Coloris : vert / transparent"], ["Green rhinestones, glitter background", "Green braided strap and charms", "Reinforced corners", "Colour: green / clear"]]),
  caseProduct("tech-coque-15promax-rose", "15 Pro Max", ["/coque-15promax-rose.jpg"],
    ["Coque rose brillant – iPhone 15 Pro Max", "Glossy pink case – iPhone 15 Pro Max"],
    ["Rose vif, finition brillante et légèrement translucide : cette coque mise sur une couleur franche. Son large contour autour des caméras souligne le haut du téléphone.", "Bright pink with a glossy, slightly translucent finish: this case is all about a bold colour. Its wide camera surround draws attention to the top of the phone."],
    [["Finition brillante translucide", "Boutons recouverts", "Coloris : rose"], ["Glossy translucent finish", "Covered buttons", "Colour: pink"]]),
  caseProduct("tech-coque-14promax-beige", "14 Pro Max", ["/coque-14promax-beige.jpg"],
    ["Coque beige à bord transparent – iPhone 14 Pro Max", "Beige case with clear edge – iPhone 14 Pro Max"],
    ["Le dos beige doux contraste avec le bord transparent et le contour crème autour de la caméra. Une association neutre et facile à assortir, sans motif supplémentaire.", "The soft beige back contrasts with the clear edge and cream camera surround. A neutral combination that is easy to pair, without an extra pattern."],
    [["Dos beige, bord transparent", "Contour caméra crème", "Coloris : beige / transparent"], ["Beige back, clear edge", "Cream camera frame", "Colour: beige / clear"]]),
  ...splitColours(caseProduct("tech-coque-11pro-logo", "11 Pro", ["/coque-11pro-violet-logo.jpg", "/coque-11pro-creme-logo.jpg"],
    ["Coque translucide logo pomme – iPhone 11 Pro", "Translucent case with apple logo – iPhone 11 Pro"],
    ["La finition translucide teintée laisse deviner la couleur du téléphone, avec un logo pomme visible au dos. Une coque simple, relevée par ce détail central.", "The tinted translucent finish lets the phone’s colour show through, with an apple logo visible on the back. A simple case highlighted by this central detail."],
    [["Translucide teintée, logo pomme au dos", "Bord transparent", "Coloris : violet clair, crème"], ["Tinted translucent, apple logo on the back", "Clear edge", "Colours: light purple, cream"]]), [
    {"fr": "Violet clair", "en": "Light purple", "slug": "violet", "images": ["/coque-11pro-violet-logo.jpg"]},
    {"fr": "Crème", "en": "Cream", "slug": "creme", "images": ["/coque-11pro-creme-logo.jpg"]},
  ]),
  caseProduct("tech-coque-11-gris-fume-logo", "11", ["/coque-11-gris-fume-logo.jpg"],
    ["Coque gris fumé logo pomme – iPhone 11", "Smoke grey case with apple logo – iPhone 11"],
    ["Le gris fumé translucide donne un aspect discret à cette coque, avec le logo pomme au dos et un contour blanc autour de la caméra. Un modèle sobre avec un contraste clair au niveau de l’objectif.", "The translucent smoke-grey finish gives this case a subtle look, with an apple logo on the back and a white camera surround. An understated design with a light contrast around the camera."],
    [["Translucide gris fumé, logo pomme au dos", "Contour caméra blanc", "Coloris : gris fumé"], ["Translucent smoke grey, apple logo on the back", "White camera frame", "Colour: smoke grey"]]),
  caseProduct("tech-coque-11-noire-logo", "11", ["/coque-11-noire-logo.jpg"],
    ["Coque noire brillante logo pomme – iPhone 11", "Glossy black case with apple logo – iPhone 11"],
    ["Noire, brillante et translucide, cette coque laisse légèrement apparaître le téléphone. Le logo pomme au dos apporte le seul détail graphique à sa finition épurée.", "Glossy, translucent black lets the phone show through slightly. The apple logo on the back is the main graphic detail in this clean finish."],
    [["Noire brillante translucide, logo pomme au dos", "Coloris : noir"], ["Glossy translucent black, apple logo on the back", "Colour: black"]]),
  caseProduct("tech-coque-11-bleu-roi", "11", ["/coque-11-bleu-roi.jpg"],
    ["Coque bleu roi brillant – iPhone 11", "Glossy royal blue case – iPhone 11"],
    ["Un bleu roi profond et brillant, sans motif ni détail superflu. Cette coque mise sur une couleur uniforme pour donner un ton plus marqué au téléphone.", "A deep, glossy royal blue with no pattern or extra detailing. This case relies on a solid colour to give the phone a stronger look."],
    [["Finition brillante unie", "Coloris : bleu roi"], ["Plain glossy finish", "Colour: royal blue"]]),
  caseProduct("tech-coque-11-bleue-volet-magsafe", "11", ["/coque-11-bleue-volet-magsafe.jpg"],
    ["Coque bleue MagSafe avec volet caméra coulissant – iPhone 11", "Blue MagSafe case with sliding camera cover – iPhone 11"],
    ["Cette coque bleue associe un anneau MagSafe au dos à un volet coulissant qui recouvre la caméra lorsqu’elle n’est pas utilisée. Deux détails qui distinguent son design des coques classiques.", "This blue case combines a MagSafe ring on the back with a sliding cover that closes over the camera when it is not in use. Two details that set it apart from a basic case."],
    [["Volet coulissant sur la caméra", "Anneau MagSafe visible", "Coloris : bleu"], ["Sliding camera cover", "MagSafe ring visible", "Colour: blue"]]),
  ...splitColours(newProduct("tech-enceinte-music-x2651", "tech", {
    name: { fr: "Enceinte portable MUSIC X-2651", en: "MUSIC X-2651 portable speaker" },
    subcategory: "speakers",
    images: ["/enceinte-music-x2651-bleu.jpg", "/enceinte-music-x2651-orange.jpg", "/enceinte-music-x2651-vert.jpg", "/enceinte-music-x2651-noir.jpg"],
    variants: ["Bleu clair", "Orange", "Vert", "Noir"],
    description: {
      fr: "Compacte et ronde, l’enceinte MUSIC X-2651 associe une façade en tissu à des commandes placées sur le dessus. Sa dragonne assortie permet de la tenir facilement ou de l’accrocher à un sac. Le câble de charge USB est fourni.",
      en: "Compact and round, the MUSIC X-2651 speaker pairs a fabric front with controls on top. Its matching strap makes it easy to carry by hand or attach to a bag. USB charging cable included.",
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
      fr: "Avec ses barres lumineuses colorées et sa poignée, la Loveyin Ai-176 apporte aussi un effet visuel à l’écoute. Elle propose une connexion Bluetooth, la radio FM et la lecture depuis une carte TF ou une clé USB. Sa puissance de 10 W et sa batterie de 1 200 mAh sont indiquées ; le mode TWS permet de jumeler deux enceintes compatibles.",
      en: "With coloured light bars and a carrying handle, the Loveyin Ai-176 adds a visual element to listening. It offers Bluetooth, FM radio and playback from a TF card or USB drive. Its stated output is 10 W and its battery is 1,200 mAh; TWS mode pairs two compatible speakers.",
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
      fr: "Le cadran noir à motif palmier attire le regard, tandis que les index façon diamant et la lunette cannelée dorée apportent une finition plus habillée. Le bracelet President mêle acier et doré ; l’affichage indique le jour et la date. Une montre qui accompagne aussi bien une chemise qu’une tenue plus soignée.",
      en: "The black palm-pattern dial draws the eye, while the diamond-style markers and gold-tone fluted bezel give it a dressier finish. The President bracelet combines steel and gold tones, and the display shows the day and date. An easy match for a shirt or a more polished outfit.",
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
      fr: "Le boîtier, la lunette cannelée et le bracelet President sont noirs ; le cadran argenté crée un contraste net. La date apparaît à 3 heures. Une combinaison sombre et graphique, avec un cadran qui reste bien visible.",
      en: "The case, fluted bezel and President bracelet are black, set against a contrasting silver dial. The date window sits at 3 o’clock. A dark, graphic look with a dial that stands out clearly.",
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
      fr: "Le bleu électrique habille le boîtier et le bracelet, relevé par un cadran rouge dégradé. La lunette cannelée et la date à 3 heures complètent le modèle. Une montre aux couleurs franches, faite pour ne pas passer inaperçue.",
      en: "Electric blue covers the case and bracelet, balanced by a red gradient dial. A fluted bezel and date window at 3 o’clock complete the design. A bold colour combination that is hard to miss.",
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
      fr: "Le cadran noir et le bracelet en acier donnent à cette montre une allure sobre. La date se lit à 3 heures ; une touche de rouge sur la couronne vient ponctuer l’ensemble. Un modèle facile à associer, du quotidien aux sorties.",
      en: "A black dial and steel bracelet give this watch a clean, understated look. The date sits at 3 o’clock, with a small red detail on the crown. An easy style to pair with everyday outfits or evening looks.",
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
      fr: "La lunette noire graduée et son liseré doré répondent au bracelet Oyster bicolore. Le cadran noir est ponctué d’index façon diamant et d’une date à 3 heures. L’ensemble garde une allure sportive, avec juste ce qu’il faut de doré.",
      en: "The graduated black bezel with its gold-tone edge pairs with a two-tone Oyster bracelet. Diamond-style markers and a date at 3 o’clock detail the black dial. A sporty design with a considered touch of gold.",
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
      fr: "Le cadran squelette dévoile les rouages et donne du relief à la silhouette entièrement noire. Les vis apparentes du boîtier et les grands chiffres renforcent son caractère, tandis que le bracelet en silicone apporte une note plus décontractée. À porter quand on veut sortir du classique.",
      en: "The skeleton dial reveals the inner gears and adds depth to the all-black design. Visible case screws and large numerals give it character, while the silicone strap keeps the look casual. A choice for anyone looking beyond the classic watch.",
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
      fr: "Le boîtier tonneau noir mat accueille un cadran squelette à trois compteurs, animé de détails rouges. La date se trouve à 6 heures et le bracelet est en silicone noir. Une montre au style sportif et affirmé.",
      en: "The matte-black tonneau case frames a skeleton dial with three sub-dials and red accents. The date sits at 6 o’clock, and the strap is black silicone. A watch with a confident, sporty look.",
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
      fr: "L’effet carbone du boîtier donne le ton, accompagné d’un cadran squelette traversé d’aiguilles rouges, vertes et bleues. Le bracelet rouge vif prolonge cette palette contrastée. Un modèle coloré qui assume pleinement son style.",
      en: "The case’s carbon effect sets the tone, alongside a skeleton dial with red, green and blue hands. The bright red strap carries the bold palette through. A colourful model that fully owns its look.",
    },
    features: {
      fr: ["Marque inscrite sur le cadran : AULITER", "Boîtier effet carbone, vis apparentes", "Cadran squelette, aiguilles colorées", "Bracelet silicone rouge", "Style : sportive"],
      en: ["Brand on the dial: AULITER", "Carbon-look case, visible screws", "Skeleton dial, coloured hands", "Red silicone strap", "Style: sports"],
    },
  }),
  caseProduct("tech-coque-11pro-argent-chrome", "11 Pro", ["/coque-11pro-argent-chrome.jpg"],
    ["Coque argent miroir, anneau caméra chromé – iPhone 11 Pro", "Mirror silver case with chrome camera ring – iPhone 11 Pro"],
    ["La finition argentée effet miroir donne à cette coque un aspect métallisé. Un anneau chromé autour de la caméra prolonge le reflet et souligne le haut du téléphone.", "The mirror-effect silver finish gives this case a metallic look. A chrome ring around the camera carries the reflective detail through and highlights the top of the phone."],
    [["Finition argentée effet miroir", "Anneau de caméra chromé", "Coloris : argent"], ["Mirror-effect silver finish", "Chrome camera ring", "Colour: silver"]]),
  caseProduct("tech-coque-13promax-menthe-magsafe", "13 Pro Max", ["/coque-13promax-menthe-magsafe.jpg"],
    ["Coque menthe, plaque MagSafe verte – iPhone 13 Pro Max", "Mint case with green MagSafe panel – iPhone 13 Pro Max"],
    ["Le vert menthe de la coque s’associe à une grande plaque verte et à un anneau MagSafe visible au dos. Un duo de tons doux qui apporte une touche pastel au téléphone.", "The mint shade pairs with a large green panel and a visible MagSafe ring on the back. A soft two-tone combination that gives the phone a pastel accent."],
    [["Duo de couleurs menthe et vert", "Anneau MagSafe visible", "Coloris : menthe / vert"], ["Mint and green two-tone", "MagSafe ring visible", "Colour: mint / green"]]),
  caseProduct("tech-coque-12promax-turquoise-pomme", "12 Pro Max", ["/coque-12promax-turquoise-pomme.jpg"],
    ["Coque turquoise clair, logo pomme – iPhone 12 Pro Max", "Light turquoise case with apple logo – iPhone 12 Pro Max"],
    ["Le turquoise clair habille cette coque unie, avec un logo pomme blanc placé au centre. Une couleur lumineuse pour celles et ceux qui préfèrent un dos sans motif chargé.", "Light turquoise colours this plain case, with a white apple logo at the centre. A bright option for anyone who prefers a back without a busy pattern."],
    [["Logo pomme blanc au centre", "Coloris : turquoise clair"], ["White apple logo in the centre", "Colour: light turquoise"]]),
  ...splitColours(caseProduct("tech-coque-12promax-silicone-anneau-contraste", "12 Pro Max", ["/coque-12promax-silicone-sauge.jpg", "/coque-12promax-silicone-mauve.jpg", "/coque-12promax-silicone-pervenche.jpg"],
    ["Coque unie à anneau caméra contrasté – iPhone 12 Pro Max", "Plain case with contrast camera ring – iPhone 12 Pro Max"],
    ["Une coque unie dont l’anneau autour de la caméra contraste avec la couleur principale. Le détail bicolore reste discret et donne une finition plus travaillée au dos.", "A plain case with a camera ring in a contrasting shade. The two-tone detail stays subtle while giving the back a more considered finish."],
    [["Anneau de caméra contrasté", "Coloris : vert sauge, mauve, bleu pervenche"], ["Contrast camera ring", "Colours: sage green, mauve, periwinkle blue"]]), [
    {"fr": "Vert sauge", "en": "Sage green", "slug": "sauge", "images": ["/coque-12promax-silicone-sauge.jpg"]},
    {"fr": "Mauve", "en": "Mauve", "slug": "mauve", "images": ["/coque-12promax-silicone-mauve.jpg"]},
    {"fr": "Bleu pervenche", "en": "Periwinkle blue", "slug": "pervenche", "images": ["/coque-12promax-silicone-pervenche.jpg"]},
  ]),
  caseProduct("tech-coque-17air-bleu-clair-plaque-verte", "17 Air", ["/coque-17air-bleu-clair-plaque-verte.jpg"],
    ["Coque bleu clair, plaque MagSafe menthe – iPhone 17 Air", "Light blue case with mint MagSafe panel – iPhone 17 Air"],
    ["Le bleu clair rencontre une plaque menthe au dos, traversée par un anneau MagSafe bien visible. Les ouvertures arrondies de la caméra complètent cette association de couleurs fraîches.", "Light blue meets a mint panel on the back, marked by a clearly visible MagSafe ring. Rounded camera openings complete this fresh colour combination."],
    [["Duo de couleurs bleu clair et menthe", "Anneau MagSafe visible", "Coloris : bleu clair / menthe"], ["Light blue and mint two-tone", "MagSafe ring visible", "Colour: light blue / mint"]]),
  caseProduct("tech-coque-17air-transparente-anneau-noir", "17 Air", ["/coque-17air-transparente-anneau-noir.jpg"],
    ["Coque transparente, anneau MagSafe noir – iPhone 17 Air", "Clear case with black MagSafe ring – iPhone 17 Air"],
    ["La transparence laisse le téléphone visible, tandis que l’anneau MagSafe noir crée un contraste net au dos. Les bords renforcés complètent ce modèle au dessin minimal.", "The clear finish keeps the phone visible, while the black MagSafe ring creates a crisp contrast on the back. Reinforced edges complete this minimal design."],
    [["Transparente, bords renforcés", "Anneau MagSafe noir visible", "Coloris : transparent"], ["Clear, reinforced edges", "Black MagSafe ring visible", "Colour: clear"]]),
  caseProduct("tech-coque-17air-transparente-anneau-bleu", "17 Air", ["/coque-17air-transparente-anneau-bleu.jpg"],
    ["Coque transparente, anneau MagSafe bleu – iPhone 17 Air", "Clear case with blue MagSafe ring – iPhone 17 Air"],
    ["Le dos transparent laisse apparaître le téléphone et met en valeur l’anneau MagSafe bleu vif. La large ouverture de caméra conserve un dessin dégagé autour du module photo.", "The clear back lets the phone show through and highlights the bright blue MagSafe ring. A wide camera opening keeps the area around the camera module clear."],
    [["Transparente, bords renforcés", "Anneau MagSafe bleu visible", "Coloris : transparent / bleu"], ["Clear, reinforced edges", "Blue MagSafe ring visible", "Colour: clear / blue"]]),
  ...splitColours(caseProduct("tech-coque-xr-magsafe-duo", "XR", ["/coque-xr-lilas.jpg", "/coque-xr-fuchsia.jpg", "/coque-xr-rose.jpg"],
    ["Coque duo de couleurs, motif MagSafe – iPhone XR", "Two-tone case with MagSafe design – iPhone XR"],
    ["La plaque arrière d’une autre teinte et le motif en anneau inspiré de MagSafe donnent à cette coque un effet bicolore. Un détail graphique simple qui change d’une coque unie.", "A back panel in a contrasting shade and a MagSafe-inspired ring pattern give this case a two-tone look. A simple graphic detail that sets it apart from a plain case."],
    [["Plaque de ton contrasté au dos", "Motif anneau MagSafe visible", "Coloris : lilas, rose fuchsia, rose clair"], ["Contrasting panel on the back", "MagSafe ring design visible", "Colours: lilac, fuchsia pink, light pink"]]), [
    {"fr": "Lilas", "en": "Lilac", "slug": "lilas", "images": ["/coque-xr-lilas.jpg"]},
    {"fr": "Rose fuchsia", "en": "Fuchsia pink", "slug": "fuchsia", "images": ["/coque-xr-fuchsia.jpg"]},
    {"fr": "Rose clair", "en": "Light pink", "slug": "rose", "images": ["/coque-xr-rose.jpg"]},
  ]),
  ...splitColours(caseProduct("tech-coque-11-anneau-support", "11", ["/coque-11-bois-anneau.jpg", "/coque-11-noire-brossee-anneau.jpg"],
    ["Coque anneau MagSafe à support – iPhone 11", "MagSafe ring case with stand – iPhone 11"],
    ["Le grand anneau au dos reprend le motif MagSafe et s’accompagne d’une languette qui sert de support. Une grille ronde décorative complète le dessin et donne à cette coque un aspect original.", "The large ring on the back follows a MagSafe-style design and comes with a stand tab. A decorative round grille completes the look and gives this case a distinctive finish."],
    [["Anneau MagSafe avec languette-support visible", "Grille ronde décorative", "Coloris : marron effet bois, noir brossé"], ["MagSafe ring with visible stand tab", "Decorative round grille", "Colours: brown wood effect, brushed black"]]), [
    {"fr": "Marron effet bois", "en": "Brown wood effect", "slug": "bois", "images": ["/coque-11-bois-anneau.jpg"]},
    {"fr": "Noir brossé", "en": "Brushed black", "slug": "noir", "images": ["/coque-11-noire-brossee-anneau.jpg"]},
  ]),
  ...splitColours(caseProduct("tech-coque-11promax-magsafe-duo", "11 Pro Max", ["/coque-11promax-bleu.jpg", "/coque-11promax-blanc-gris.jpg", "/coque-11promax-lilas.jpg"],
    ["Coque duo de couleurs, motif MagSafe – iPhone 11 Pro Max", "Two-tone case with MagSafe design – iPhone 11 Pro Max"],
    ["Les couleurs douces et la plaque arrière contrastante donnent à cette coque un effet bicolore. Le motif en anneau inspiré de MagSafe apporte un détail graphique au dos, sans charger l’ensemble.", "Soft colours and a contrasting back panel give this case a two-tone look. The MagSafe-inspired ring adds a graphic detail without making the design feel busy."],
    [["Plaque de ton contrasté au dos", "Motif anneau MagSafe visible", "Coloris : bleu, blanc et gris clair, lilas"], ["Contrasting panel on the back", "MagSafe ring design visible", "Colours: blue, white and light grey, lilac"]]), [
    {"fr": "Bleu", "en": "Blue", "slug": "bleu", "images": ["/coque-11promax-bleu.jpg"]},
    {"fr": "Blanc et gris clair", "en": "White and light grey", "slug": "blanc", "images": ["/coque-11promax-blanc-gris.jpg"]},
    {"fr": "Lilas", "en": "Lilac", "slug": "lilas", "images": ["/coque-11promax-lilas.jpg"]},
  ]),
  caseProduct("tech-coque-17pro-rose-degrade", "17 Pro", ["/coque-17pro-rose-degrade.jpg"],
    ["Coque rose dégradé, anneau MagSafe en relief – iPhone 17 Pro", "Gradient pink case with embossed MagSafe ring – iPhone 17 Pro"],
    ["Le rose dégradé apporte une variation de teinte sur le dos, soulignée par un anneau MagSafe en relief. Le grand cadre blanc autour de la caméra crée un contraste supplémentaire.", "The gradient pink finish shifts in tone across the back, highlighted by a raised MagSafe ring. A large white camera frame adds another point of contrast."],
    [["Dégradé rose, cadre caméra blanc", "Anneau MagSafe en relief", "Coloris : rose"], ["Pink gradient, white camera frame", "Embossed MagSafe ring", "Colour: pink"]]),
  newProduct("watch-femme-rado-argent", "watches", {
    name: { fr: "Montre femme acier – Cadran argenté, bracelet maille", en: "Women’s steel watch – Silver dial, link bracelet" },
    subcategory: "classic",
    audience: "women",
    price: 5500,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-rado-argent.jpg"],
    description: {
      fr: "Le boîtier coussin en acier poli et le cadran argenté composent une silhouette lumineuse. Les index façon diamant, la date à 3 heures et le bracelet à maillons arrondis apportent les détails. Une montre sobre qui se porte facilement au quotidien.",
      en: "A polished steel cushion case and silver dial create a bright, clean look. Diamond-style markers, a date at 3 o’clock and rounded bracelet links complete the details. An understated watch that is easy to wear every day.",
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
    price: 4700,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-michael-kors-rose.jpg"],
    description: {
      fr: "Le cadran rose pastel adoucit le boîtier et le bracelet dorés. La lunette facettée et les trois sous-cadrans donnent du relief à l’ensemble. Une montre qui apporte une touche de couleur à une tenue simple, ou qui se glisse facilement dans une idée cadeau.",
      en: "The pastel pink dial softens the gold-tone case and bracelet. A faceted bezel and three sub-dials add detail to the design. It brings a touch of colour to a simple outfit and also makes a considered gift idea.",
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
    price: 4500,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-rado-jubile.jpg"],
    description: {
      fr: "Fine et discrète au poignet, cette montre associe un petit boîtier rond à un bracelet maille bicolore acier et doré. Le cadran champagne est ponctué de quatre index façon diamant. Une pièce délicate qui se porte seule ou avec un bracelet fin.",
      en: "Slim and understated on the wrist, this watch pairs a small round case with a two-tone steel and gold-tone mesh bracelet. Four diamond-style markers punctuate the champagne dial. Wear it on its own or alongside a fine bracelet.",
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
    price: 4000,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-chanel-champagne.jpg"],
    description: {
      fr: "Le cadran champagne, les chiffres dorés et le double C noir créent un contraste graphique. Le boîtier doré et le bracelet maille bicolore prolongent cette association de tons. Une montre qui accompagne aussi bien les couleurs claires qu’une tenue noire.",
      en: "The champagne dial, gold-tone numerals and black double-C create a graphic contrast. A gold-tone case and two-tone mesh bracelet carry the palette through. It works with light colours as easily as with a black outfit.",
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
    price: 3500,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-doree-carree-double-c.jpg"],
    description: {
      fr: "Son boîtier carré doré encadre un cadran champagne marqué par des chiffres arabes et un double C noir. Le dessin reste équilibré : assez présent pour se remarquer, sans multiplier les détails. Elle se porte seule ou avec quelques bracelets fins.",
      en: "Its square gold-tone case frames a champagne dial with Arabic numerals and a black double-C detail. The design feels balanced: noticeable without being overloaded. Wear it on its own or with a few fine bracelets.",
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
    price: 4000,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-doree-strass-octogonale.jpg"],
    description: {
      fr: "La lunette octogonale sertie de strass encadre un cadran blanc à trois sous-cadrans. Le bracelet doré prolonge l’éclat du boîtier. Une montre lumineuse, particulièrement adaptée aux sorties et aux occasions où l’on veut une pièce qui se remarque.",
      en: "A rhinestone-set octagonal bezel frames a white dial with three sub-dials. The gold-tone bracelet carries the shine through. A bright watch, especially suited to outings and occasions when you want a piece that stands out.",
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
    price: 6000,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-acier-chiffres-romains.jpg"],
    description: {
      fr: "Le cadran blanc et ses chiffres romains donnent une lecture classique, relevée par des aiguilles bleues. Le boîtier galbé et le bracelet à maillons arrondis apportent une ligne douce en acier poli. Un modèle facile à porter, avec un détail bleu qui fait la différence.",
      en: "The white dial and Roman numerals give this watch a classic feel, picked out by blue hands. Its curved case and rounded-link bracelet create a soft silhouette in polished steel. An easy-to-wear design with a distinctive blue detail.",
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
    price: 5000,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-acier-rectangulaire-date.jpg"],
    description: {
      fr: "Le boîtier rectangulaire en acier poli donne une ligne nette, prolongée par le bracelet maille brillant. Le cadran blanc texturé et la fenêtre de date ajoutent juste les détails nécessaires. Une montre sobre qui accompagne la journée sans effort.",
      en: "The polished steel rectangular case creates a clean silhouette, continued by the shiny mesh bracelet. A textured white dial and date window add the essential details. An understated watch that fits easily into the day.",
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
    price: 6000,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-doree-bleu-marine.jpg"],
    description: {
      fr: "Le cadran bleu marine satiné contraste avec le boîtier rectangulaire doré et ses petits index dorés. La silhouette reste fine, avec une couleur profonde qui apporte du relief à une tenue simple. Une belle option pour celles qui aiment les montres discrètes, mais pas ordinaires.",
      en: "The satin-finish navy dial contrasts with the gold-tone rectangular case and small gold markers. Its slim silhouette and deep colour add interest to a simple outfit. A good choice for anyone who likes understated watches with a little distinction.",
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
    price: 5000,
    priceOnRequest: false,
    availability: "available",
    images: ["/montre-femme-datejust-doree.jpg"],
    description: {
      fr: "Le cadran champagne lumineux s’accorde à la lunette cannelée et au bracelet maille dorés. Les index bâtons et la date à 3 heures gardent une lecture claire. Une montre dans un registre classique, facile à associer à une tenue habillée comme à un look plus simple.",
      en: "The bright champagne dial pairs with a gold-tone fluted bezel and mesh bracelet. Bar markers and a date at 3 o’clock keep the display clear. A classic-style watch that works with both dressier outfits and simpler looks.",
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
      fr: "Le cadran rouge et noir dégradé attire immédiatement l’œil, avec trois sous-cadrans et une trotteuse rouge. Le boîtier carré en acier brossé et le bracelet silicone noir texturé renforcent son allure sportive. Un modèle pour donner du caractère à une tenue sobre.",
      en: "The red-to-black gradient dial catches the eye, with three sub-dials and a red seconds hand. A brushed-steel square case and textured black silicone strap add to its sporty look. A way to bring character to a simple outfit.",
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
      fr: "Les chiffres arabes orientaux se détachent sur le cadran gris dégradé. Le boîtier carré à lunette texturée et le bracelet en cuir noir surpiqué donnent à la montre une allure classique, avec une touche moins habituelle. La date apparaît à 3 heures.",
      en: "Eastern Arabic numerals stand out against the gradient grey dial. A square case with a textured bezel and a stitched black leather strap give the watch a classic look with a less usual detail. The date appears at 3 o’clock.",
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
      fr: "La lunette sertie de strass taillés en baguettes encadre un cadran scintillant, ponctué de touches rouges. Le boîtier et le bracelet maille argentés prolongent cet effet lumineux. Une montre expressive, pour ceux qui aiment les accessoires qui attirent le regard.",
      en: "A bezel set with baguette-cut rhinestones frames a sparkling dial accented with touches of red. The silver-tone case and mesh bracelet continue the bright finish. An expressive watch for anyone who likes accessories that draw attention.",
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
      fr: "Le cadran dégradé noir et blanc est animé par deux compteurs, tandis que le boîtier rond en acier poli garde une ligne classique. Le bracelet en cuir noir surpiqué complète l’ensemble. Une montre facile à associer, du quotidien aux occasions plus habillées.",
      en: "The black-and-white gradient dial is detailed with two sub-dials, while the round polished-steel case keeps the design classic. A stitched black leather strap completes the look. An easy match for everyday wear and dressier occasions.",
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
      fr: "Le cadran marron texturé et le bracelet assorti donnent une tonalité chaleureuse à cette montre. La lunette cannelée et le boîtier or rose ajoutent du contraste, avec des index façon diamant pour le détail. Une alternative aux associations classiques noir et argent.",
      en: "The textured brown dial and matching strap give this watch a warm tone. A rose-gold-tone fluted bezel and case add contrast, with diamond-style markers for detail. A different take on the usual black-and-silver combinations.",
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
      fr: "Le boîtier carré à vis apparentes affirme la silhouette, tandis que le cadran champagne et ses grands chiffres romains apportent une touche classique. Le bracelet bicolore associe acier et doré ; la date se trouve à 6 heures. Une montre au style habillé et bien marqué.",
      en: "The square case with visible screws gives the watch a distinctive silhouette, while the champagne dial and large Roman numerals add a classic touch. The two-tone bracelet combines steel and gold tones, with the date at 6 o’clock. A clearly defined dress-style watch.",
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
      fr: "Le cadran noir est rythmé par de grands chiffres romains blancs, faciles à repérer. Le boîtier carré à vis apparentes et le bracelet en acier assorti donnent une ligne structurée. Un modèle sobre, avec un contraste qui fait tout son intérêt.",
      en: "Large white Roman numerals stand out against the black dial. The square case with visible screws and matching steel bracelet create a structured look. An understated model whose contrast does the work.",
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
      fr: "Le cadran gris dégradé réunit trois compteurs, des aiguilles orange et une date à 4 heures. Le boîtier rond en acier poli contraste avec le bracelet gris à effet daim. Une montre décontractée, relevée par quelques touches de couleur.",
      en: "The gradient grey dial features three sub-dials, orange hands and a date at 4 o’clock. The round polished-steel case contrasts with the grey suede-effect strap. A relaxed watch with a few well-placed touches of colour.",
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
      fr: "Le cadran vert alvéolé apporte une note originale à l’ensemble doré. La lunette cannelée et le bracelet aux maillons polis encadrent le cadran, avec une date à 3 heures. Une combinaison de couleurs qui change des montres entièrement dorées.",
      en: "The green honeycomb dial gives this gold-tone design a distinctive touch. A fluted bezel and polished-link bracelet frame the dial, with a date at 3 o’clock. A colour combination that offers a change from all-gold watches.",
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
      fr: "Le cadran champagne alvéolé, souligné d’un anneau blanc, s’accorde à la lunette cannelée et au bracelet dorés. La date apparaît à 3 heures. Une montre aux tons chauds, dans un style classique qui se porte facilement.",
      en: "The honeycomb champagne dial, framed by a white ring, pairs with the gold-tone fluted bezel and bracelet. The date appears at 3 o’clock. A warm-toned watch in a classic style that is easy to wear.",
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
      fr: "Le cadran blanc texturé apporte de la lumière au boîtier et au bracelet en acier. La lunette cannelée et la date à 3 heures complètent cette silhouette classique. Une montre facile à assortir, aussi bien avec des couleurs neutres qu’avec une tenue plus habillée.",
      en: "The textured white dial brings brightness to the steel case and bracelet. A fluted bezel and date at 3 o’clock complete the classic silhouette. An easy match for neutral colours or a more dressed-up outfit.",
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
      fr: "Le cadran noir alvéolé contraste avec la finition brillante du bracelet en acier. La lunette cannelée et la date à 3 heures complètent le dessin. Une version sobre, construite autour du duo noir et acier.",
      en: "The black honeycomb dial contrasts with the polished finish of the steel bracelet. A fluted bezel and date at 3 o’clock complete the design. An understated version built around black and steel.",
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
      fr: "Un anneau bleu clair entoure le cadran champagne alvéolé et attire le regard sans surcharger le dessin. La lunette cannelée, le bracelet brillant en acier et la date à 3 heures complètent le modèle. Un détail de couleur qui fait toute la différence.",
      en: "A light-blue ring surrounds the honeycomb champagne dial, adding interest without overcomplicating the design. A fluted bezel, polished steel bracelet and date at 3 o’clock complete the model. One colour detail makes the difference.",
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
      fr: "Le cadran champagne associe un motif graphique à des index façon diamant et une date à 3 heures. La lunette cannelée et le bracelet President en acier poli donnent une finition classique. Un modèle dont le cadran mérite qu’on s’y attarde.",
      en: "The champagne dial combines a graphic pattern with diamond-style markers and a date at 3 o’clock. A fluted bezel and polished-steel President bracelet give it a classic finish. A model whose dial rewards a closer look.",
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
      fr: "Avec sa forme ovale et ses picots arrondis, cette brosse Cosmia accompagne le démêlage en douceur. Son format convient à tous les types de cheveux. La poignée crème et les picots noirs lui donnent une finition sobre.",
      en: "With its oval shape and rounded pins, this Cosmia brush makes everyday detangling gentler. Its design is suitable for all hair types. The cream handle and black pins keep the look simple.",
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
      fr: "En taille L, cette brosse Cosmia est pensée pour les cheveux longs ou épais et aide à démêler sur une plus grande surface. Sa poignée corail et ses picots noirs à bouts rouges lui donnent un coloris facile à repérer dans la salle de bain.",
      en: "This size L Cosmia brush is designed for long or thick hair and helps detangle a wider section at a time. Its coral handle and black pins with red tips make it easy to spot in your bathroom.",
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
      fr: "Cette brosse Cosmia taille L réunit deux gestes du quotidien : démêler et lisser. Elle convient à tous les types de cheveux. Sa finition rose poudré, associée aux picots noirs à bouts roses, apporte une note douce à la routine de coiffage.",
      en: "This size L Cosmia brush brings together two everyday steps: detangling and smoothing. It is suitable for all hair types. Its powder-pink finish and black pins with pink tips add a soft touch to your hair routine.",
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
      fr: "Après le rasage, ce baume Mennen s’utilise aussi comme soin visage. Sa formule à la provitamine B5 est destinée aux peaux sensibles ; elle est indiquée sans alcool, sans parabène et sans colorant. Un seul produit pour réunir ces deux gestes.",
      en: "After shaving, this Mennen balm can also be used as a face-care product. Its provitamin B5 formula is intended for sensitive skin and is labelled alcohol-free, paraben-free and colourant-free. One product for both steps.",
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
      fr: "Un seul flacon pour la douche : ce gel 3-en-1 Ideal Men s’utilise sur le corps, le visage et les cheveux. Son parfum frais est annoncé pour une sensation de fraîcheur pouvant durer jusqu’à 24 heures. Pratique pour simplifier la routine quotidienne.",
      en: "One bottle for the shower: this Ideal Men 3-in-1 gel is made for the body, face and hair. Its fresh fragrance is stated to provide freshness for up to 24 hours. A practical way to keep the daily routine simple.",
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
      fr: "Corps et cheveux : ce soin douche Fresh Ice de la gamme Felce Azzurra Uomo réunit les deux dans un même flacon. Sa senteur fraîche accompagne la douche, et son format maxi permet de l’utiliser plus longtemps avant de le remplacer.",
      en: "For body and hair, this Fresh Ice shower product from Felce Azzurra Uomo brings both steps together in one bottle. Its fresh scent is made for shower time, and the maxi size lasts longer before needing a replacement.",
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
      fr: "À appliquer après le rasage, la lotion Cosmia Men Actif apporte une sensation de fraîcheur et aide à apaiser la peau. Elle est indiquée pour tous les types de peau. Un geste simple à ajouter à la routine après-rasage.",
      en: "Applied after shaving, Cosmia Men Actif lotion leaves a fresh feeling and helps soothe the skin. It is indicated for all skin types. A simple step to add to an aftershave routine.",
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
      fr: "Le spray Cosmia Men Seduction annonce une efficacité de 24 heures et une formule anti-traces conçue pour limiter les marques sur les vêtements. Fabriqué en France, il accompagne facilement la routine du matin.",
      en: "Cosmia Men Seduction spray states 24-hour effectiveness and features a no-marks formula designed to help limit marks on clothing. Made in France, it fits easily into a morning routine.",
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
      fr: "Conçu pour les peaux sensibles, le baume Cosmia Men Sensible s’applique après le rasage pour hydrater et apaiser la peau. Son flacon noir mat complète une présentation sobre. Un soin à garder à portée de main après chaque rasage.",
      en: "Designed for sensitive skin, Cosmia Men Sensible balm is applied after shaving to moisturise and soothe. Its matte black bottle keeps the presentation understated. An aftershave-care step to keep close at hand.",
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
      fr: "Le flacon transparent de Clesto Nightfall se distingue par son bouchon argenté et son décor de feuillage bleu nuit. Les notes olfactives et la contenance restent à confirmer.",
      en: "Clesto Nightfall comes in a clear bottle with a silver cap and a midnight-blue foliage design. The fragrance notes and bottle size are still to be confirmed.",
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
      fr: "Cosmia Men Sport est une eau de toilette aux notes boisées, présentée dans un flacon vert avec vaporisateur et bouchon argenté. Une fragrance à intégrer à la routine du matin ou à garder pour les sorties.",
      en: "Cosmia Men Sport is a woody eau de toilette presented in a green bottle with a spray and silver cap. A fragrance to add to a morning routine or keep for going out.",
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
      fr: "Avec de l’arginine, cet après-shampooing Cosmia Force + Technique est destiné aux cheveux fragiles et cassants. Il aide à démêler les cheveux après le shampooing et complète la routine de soin sans étape compliquée.",
      en: "With arginine, this Cosmia Force + Technique conditioner is intended for fragile, brittle hair. It helps detangle after shampooing and completes a hair-care routine without adding a complicated step.",
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
      fr: "Enrichi en huile d’argan, cet après-shampooing Cosmia est destiné aux cheveux secs et abîmés. Sa formule est annoncée pour nourrir et réparer ; il s’utilise après le shampooing pour faciliter le soin des longueurs.",
      en: "Enriched with argan oil, this Cosmia conditioner is intended for dry and damaged hair. Its formula is stated to nourish and repair; use it after shampooing as part of your lengths-care routine.",
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
      fr: "Pensé pour les cheveux colorés, cet après-shampooing Cosmia Color + Technique associe un soin démêlant à un filtre UV. La formule est annoncée pour aider à protéger et raviver la couleur. À utiliser après le shampooing dans la routine des cheveux colorés.",
      en: "Made for coloured hair, this Cosmia Color + Technique conditioner combines detangling care with a UV filter. The formula is stated to help protect and refresh colour. Use it after shampooing as part of a colour-care routine.",
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
      fr: "Ce shampooing Cosmia anti-pelliculaire est prévu pour un usage fréquent sur cheveux normaux. Son flacon de 500 ml offre un format généreux pour la routine de lavage régulière.",
      en: "This Cosmia anti-dandruff shampoo is intended for frequent use on normal hair. Its 500 ml bottle offers a generous size for a regular washing routine.",
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
      fr: "À la kératine, cet après-shampooing Cosmia Repair + Technique est destiné aux cheveux secs et abîmés. Il s’intègre après le shampooing pour faciliter le démêlage et compléter la routine de soin.",
      en: "With keratin, this Cosmia Repair + Technique conditioner is intended for dry and damaged hair. Use it after shampooing to make detangling easier and complete your hair-care routine.",
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
      fr: "Ce shampooing Cosmia aux amandes est destiné aux cheveux normaux et convient à un usage fréquent. Son format 500 ml est pratique pour une utilisation régulière à la maison.",
      en: "This Cosmia almond shampoo is intended for normal hair and suitable for frequent use. The 500 ml size is practical for regular use at home.",
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
      fr: "L’huile d’argan et le parfum de jasmin caractérisent ce shampooing extra-doux Cosmia. Il est annoncé pour nourrir et protéger les cheveux secs ou abîmés. Une option à intégrer à une routine de lavage tout en douceur.",
      en: "Argan oil and jasmine fragrance define this Cosmia extra-gentle shampoo. It is stated to nourish and protect dry or damaged hair. An option for a gentler hair-washing routine.",
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
      fr: "Destiné aux cheveux colorés ou méchés, ce shampooing Cosmia Color + Technique est formulé pour accompagner l’entretien de la couleur. Son flacon de 500 ml offre un format pratique pour les lavages réguliers.",
      en: "Made for coloured or highlighted hair, this Cosmia Color + Technique shampoo is designed to support colour care. Its 500 ml bottle is a practical size for regular washing.",
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
      fr: "Avec son parfum de camomille et de miel, ce shampooing extra-doux Cosmia est destiné aux cheveux blonds à châtain clair. Il est annoncé pour hydrater et adoucir les cheveux, dans une routine de lavage quotidienne.",
      en: "With a chamomile and honey fragrance, this Cosmia extra-gentle shampoo is intended for blonde to light-brown hair. It is stated to moisturise and soften, making it suited to a regular washing routine.",
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
      fr: "Un rose tout doux et un éclat doré, pour un petit sac qui a du charme !\nEnvie d’un sac discret mais pas banal ? Ce modèle à rabat joue la délicatesse avec son rose tendre, sa finition légèrement texturée et sa plaque triangulaire dorée sur le devant. Compact et fin, il s’intègre à votre quotidien sans encombrer.\n---\nPourquoi vous allez l’adorer\n• Rose tendre : Un coloris doux à la finition légèrement texturée, qui donne du relief sans en faire trop.\n• Détail doré : Une plaque triangulaire dorée sur le devant, le petit plus qui attire le regard.\n• Fermeture à rabat : Un rabat qui referme le sac simplement, pour un rendu net et soigné.\n• Format compact : Une bandoulière fine aux attaches dorées, pour un sac facile à porter en travers du corps.\n\nConseil de style : Avec un jean et un t-shirt blanc, il apporte la touche féminine qu’il faut. Le soir, posez-le sur une robe noire et laissez le doré faire le reste.",
      en: "A soft pink and a golden glint for a little bag with plenty of charm!\nLooking for a bag that is discreet but not ordinary? This flap bag plays the delicate card with its tender pink, its lightly textured finish and a golden triangular plate on the front. Compact and slim, it fits into your daily routine without getting in the way.\n---\nWhy you will love it\n• Tender pink: A soft shade with a lightly textured finish that adds depth without overdoing it.\n• Golden detail: A golden triangular plate on the front, the little extra that catches the eye.\n• Flap closure: A flap that closes the bag simply, for a neat and polished look.\n• Compact size: A thin strap with golden fittings, easy to wear across the body.\n\nStyle tip: With jeans and a white tee, it adds just the right feminine touch. In the evening, pair it with a little black dress and let the gold do the rest.",
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
      fr: "Un blanc cassé tout en retenue, avec le détail qui fait la différence !\nCe sac à rabat mise sur la douceur : le blanc cassé du corps du sac répond à une bandoulière grise et à des attaches argentées. Au centre du rabat, une plaque triangulaire gravée attire l’œil sans rien alourdir.\n---\nPourquoi vous allez l’adorer\n• Duo blanc cassé et gris : Un contraste tout en finesse entre le sac et sa bandoulière grise.\n• Plaque triangulaire gravée : Un détail argenté posé sur le rabat lisse, sobre et reconnaissable.\n• Attaches argentées : Elles reprennent la teinte de la plaque pour un ensemble cohérent.\n• Format compact : Se porte simplement à l’épaule ou en bandoulière, selon votre humeur.\n\nConseil de style : Il s’accorde très bien avec un look total denim ou une tenue claire. Pour un contraste net, essayez-le avec un haut noir ou bordeaux.",
      en: "A restrained off-white with the one detail that makes the difference!\nThis flap bag is all about softness: the off-white of the bag meets a grey strap and silver fittings. In the middle of the flap, an engraved triangular plate draws the eye without weighing anything down.\n---\nWhy you will love it\n• Off-white and grey duo: A subtle contrast between the bag and its grey strap.\n• Engraved triangular plate: A silver detail set on the smooth flap, understated and recognisable.\n• Silver fittings: They echo the colour of the plate for a coherent whole.\n• Compact size: Simply worn on the shoulder or across the body, depending on your mood.\n\nStyle tip: It goes beautifully with an all-denim look or a light outfit. For a sharper contrast, try it with a black or burgundy top.",
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
      fr: "Petit format, grand motif : le mini cabas qui se remarque tout de suite !\nSur un fond caramel chaleureux, un grand motif blanc de fleurs et de losanges s’étale avec les initiales au centre. Sa forme trapèze et ses deux anses rondes lui donnent une silhouette bien à lui.\n---\nPourquoi vous allez l’adorer\n• Caramel et blanc : Un contraste franc entre le fond caramel et le grand motif blanc.\n• Motif fleurs et losanges : Les initiales trônent au centre, pour une pièce facile à reconnaître.\n• Forme trapèze, petit format : Deux anses rondes et un gabarit mini pour un sac qui reste léger à l’œil.\n• Fermoirs dorés : Ils sont accompagnés d’une étiquette assortie qui complète le modèle.\n\nConseil de style : Le caramel adore le blanc, le beige et le denim bleu. Portez-le à la main sur une tenue simple, c’est lui qui racontera le reste.",
      en: "Small size, big pattern: the mini tote that gets noticed right away!\nOn a warm caramel background, a large white pattern of flowers and diamonds spreads out with the initials in the centre. Its trapezoid shape and two round handles give it a silhouette of its own.\n---\nWhy you will love it\n• Caramel and white: A bold contrast between the caramel background and the large white pattern.\n• Flowers and diamonds: The initials sit in the centre, making it an easy piece to recognise.\n• Trapezoid shape, small size: Two round handles and a mini format for a bag that looks neat and light.\n• Golden clasps: Paired with a matching tag that completes the design.\n\nStyle tip: Caramel loves white, beige and blue denim. Carry it by hand with a simple outfit and let the bag do the talking.",
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
      fr: "Un coup de bleu ciel pour sortir des tons neutres !\nCe sac bandoulière a du caractère grâce à sa couleur douce mais bien présente. Son rabat se ferme par un fermoir triangulaire doré, seul détail qu’il lui faut pour briller.\n---\nPourquoi vous allez l’adorer\n• Bleu ciel : Un coloris frais et lumineux qui change des noirs et des beiges habituels.\n• Rabat et fermoir triangulaire doré : Un geste graphique simple, placé juste où il faut.\n• Longue bandoulière : Elle se porte à l’épaule ou en travers du corps, à votre convenance.\n• Attaches dorées : Elles font écho au fermoir et soulignent la couleur.\n\nConseil de style : Pour un look frais, mariez-le à du blanc et du jean clair. Pour oser davantage, associez-le à du beige ou à un ensemble gris perle.",
      en: "A splash of sky blue to step away from neutral tones!\nThis crossbody bag has character thanks to its colour, soft yet clearly present. Its flap closes with a golden triangular clasp, the only detail it needs to shine.\n---\nWhy you will love it\n• Sky blue: A fresh, bright shade that makes a change from the usual blacks and beiges.\n• Flap and golden triangular clasp: A simple graphic touch, placed exactly where it should be.\n• Long strap: Wear it on the shoulder or across the body, as you prefer.\n• Golden fittings: They echo the clasp and highlight the colour.\n\nStyle tip: For a fresh look, team it with white and light denim. To go bolder, pair it with beige or a pearl grey outfit.",
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
      fr: "Le mini cabas version lumière, pour les tenues claires !\nDans un beige sable, il reprend le grand motif blanc de fleurs et de losanges avec les initiales au centre. Deux anses rondes, une forme trapèze et un petit format : tout est là pour une allure soignée.\n---\nPourquoi vous allez l’adorer\n• Beige et blanc : Un camaïeu clair et doux, très facile à porter au quotidien.\n• Grand motif central : Fleurs, losanges et initiales dessinent un décor bien visible.\n• Deux anses rondes : Elles donnent une belle prise en main à ce petit format.\n• Fermoirs dorés : Complétés par une étiquette assortie, ils apportent la touche finale.\n\nConseil de style : Il se marie à merveille avec le blanc, le kaki et les tons terre. Une robe d’été ou un ensemble lin, et le tour est joué.",
      en: "The mini tote in a lighter version, made for bright outfits!\nIn a sandy beige, it features the large white pattern of flowers and diamonds with the initials in the centre. Two round handles, a trapezoid shape and a small size: everything is there for a polished look.\n---\nWhy you will love it\n• Beige and white: A light, soft shade combination that is very easy to wear every day.\n• Large central pattern: Flowers, diamonds and initials make for a clearly visible design.\n• Two round handles: They give this small bag a comfortable grip.\n• Golden clasps: Along with a matching tag, they add the finishing touch.\n\nStyle tip: It pairs wonderfully with white, khaki and earthy tones. A summer dress or a linen set, and you are done.",
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
      fr: "Un sac qui a de l’allure et un motif qui ne passe pas inaperçu !\nDes losanges noirs et de petits blasons habillent tout ce sac à rabat cognac. Fermoir doré à clé, deux boucles sur le devant et anse rigide sur le dessus : sa silhouette est nette et bien construite.\n---\nPourquoi vous allez l’adorer\n• Cognac et noir : Un duo chaud et profond, avec un motif de losanges et de petits blasons sur toute la surface.\n• Fermoir central et deux boucles : Un fermoir doré à clé entouré de deux boucles pour un devant très travaillé.\n• Anse rigide : Posée sur le dessus, elle donne la prise en main et renforce la tenue du sac.\n• Anneaux dorés sur les côtés : Un détail qui prolonge la touche dorée du devant.\n\nConseil de style : Le motif étant déjà très présent, restez sobre sur le reste : un pull noir, un pantalon beige ou un jean brut suffisent.",
      en: "A bag with presence and a pattern that does not go unnoticed!\nBlack diamonds and tiny crests cover this whole cognac flap bag. Golden key-style clasp, two buckles on the front and a rigid top handle: its silhouette is sharp and well built.\n---\nWhy you will love it\n• Cognac and black: A warm, deep pairing, with a pattern of diamonds and tiny crests across the whole surface.\n• Central clasp and two buckles: A golden key-style clasp flanked by two buckles for a richly detailed front.\n• Rigid handle: Set on top, it gives a good grip and reinforces the bag’s structure.\n• Golden rings on the sides: A detail that carries the golden touch of the front further.\n\nStyle tip: Since the pattern is already bold, keep the rest simple: a black sweater, beige trousers or raw denim is enough.",
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
      fr: "Deux tons chauds qui se répondent, pour un sac tout en profondeur !\nMarron foncé et caramel jouent ensemble sur ce sac à monogramme, avec un motif inversé entre le rabat et la façade. Son fermoir carré doré et son anse rigide lui donnent une forme bien structurée.\n---\nPourquoi vous allez l’adorer\n• Marron foncé et caramel : Deux couleurs chaudes qui s’inversent entre le rabat et le devant du sac.\n• Fermoir carré doré : Il accompagne deux boucles dans le bas pour un devant bien dessiné.\n• Anse rigide : Placée sur le dessus, elle maintient la forme et se prend facilement en main.\n• Anneaux dorés sur les côtés : Ils prolongent l’esprit doré du fermoir.\n\nConseil de style : Un manteau camel, un col roulé crème ou une robe chocolat : misez sur les teintes chaudes pour une allure très harmonieuse.",
      en: "Two warm tones in conversation, for a bag full of depth!\nDark brown and caramel play together on this monogram bag, with an inverted pattern between the flap and the front. Its square golden clasp and rigid handle give it a well-structured shape.\n---\nWhy you will love it\n• Dark brown and caramel: Two warm colours that swap places between the flap and the front of the bag.\n• Square golden clasp: Joined by two buckles at the bottom for a nicely drawn front.\n• Rigid handle: Placed on top, it keeps the shape and is easy to hold.\n• Golden rings on the sides: They carry on the golden spirit of the clasp.\n\nStyle tip: A camel coat, a cream turtleneck or a chocolate dress: stick to warm shades for a very harmonious look.",
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
      fr: "Un vert émeraude profond pour sortir de l’ordinaire !\nCe duo réunit deux sacs matelassés : un cabas aux anses en chaînes entrelacées et un sac à rabat avec sa chaîne dorée. Le même fermoir à lettres entrelacées relie les deux pièces.\n---\nPourquoi vous allez l’adorer\n• Vert émeraude : Un coloris riche et profond, loin des classiques noir ou beige.\n• Matelassage en losanges : Il donne du volume et un joli jeu de lignes aux deux modèles.\n• Chaînes dorées : Anses entrelacées pour le cabas, bandoulière en chaîne pour le sac à rabat.\n• Deux modèles sur la photo : Un cabas et un sac à rabat, avec le même fermoir à lettres entrelacées.\n\nConseil de style : Le vert émeraude se marie très bien avec le noir, le blanc et les accents dorés. Une robe noire et quelques bijoux dorés, et l’effet est immédiat.",
      en: "A deep emerald green to step out of the ordinary!\nThis duo brings together two quilted bags: a tote with interlaced chain handles and a flap bag with its golden chain. The same interlaced-letter clasp links the two pieces.\n---\nWhy you will love it\n• Emerald green: A rich, deep shade, far from the usual black or beige.\n• Diamond quilting: It adds volume and a lovely play of lines to both models.\n• Golden chains: Interlaced handles for the tote, a chain strap for the flap bag.\n• Two models in the photo: A tote and a flap bag, sharing the same interlaced-letter clasp.\n\nStyle tip: Emerald green pairs very well with black, white and golden accents. A black dress and a few golden pieces of jewellery, and the effect is instant.",
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
      fr: "Une bouffée de soleil à porter à la main ou à l’épaule !\nDeux formats, une même couleur : cabas à anses chaînes et sac à rabat avec bandoulière chaîne, tous deux matelassés en jaune vif. Les finitions dorées et le fermoir à lettres entrelacées complètent l’ensemble.\n---\nPourquoi vous allez l’adorer\n• Jaune vif : Un coloris franc qui se voit de loin et met de bonne humeur.\n• Matelassage en losanges : Un travail de lignes qui structure l’ensemble des deux pièces.\n• Chaînes dorées : Elles forment les anses du cabas et la bandoulière du sac à rabat.\n• Deux modèles sur la photo : Un cabas et un sac à rabat, le fermoir à lettres entrelacées en commun.\n\nConseil de style : Laissez le jaune tout éclairer : une tenue blanche, un jean ou une robe noire suffisent. Parfait pour égayer une journée de campus ou une sortie entre amies.",
      en: "A burst of sunshine to carry by hand or on the shoulder!\nTwo sizes, one colour: a tote with chain handles and a flap bag with a chain strap, both quilted in bright yellow. The golden finishes and the interlaced-letter clasp complete the set.\n---\nWhy you will love it\n• Bright yellow: A bold shade you can spot from afar that lifts the mood.\n• Diamond quilting: A line pattern that gives structure to both pieces.\n• Golden chains: They form the tote’s handles and the flap bag’s strap.\n• Two models in the photo: A tote and a flap bag, sharing the interlaced-letter clasp.\n\nStyle tip: Let the yellow light up everything: a white outfit, jeans or a black dress is enough. Perfect to brighten up a day on campus or an outing with friends.",
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
      fr: "Orange brillant, monogramme en relief : le sac dôme qui ne passe jamais inaperçu !\nSon vernis orange et son motif en relief lui donnent une vraie présence. Zip, deux anses rondes et attaches argentées dessinent une forme classique, réveillée par la couleur.\n---\nPourquoi vous allez l’adorer\n• Orange verni : Un coloris éclatant à l’aspect brillant, qui capte la lumière.\n• Monogramme en relief : Un motif marqué qui ajoute du volume à la façade.\n• Forme dôme et zip : Une fermeture zippée sur une silhouette arrondie et facile à reconnaître.\n• Anses rondes et attaches argentées : Un petit cadenas-étiquette vient compléter les détails.\n\nConseil de style : Face à une couleur aussi vive, gardez des vêtements simples : blanc, noir ou denim. Il peut aussi illuminer une tenue neutre d’un seul coup.",
      en: "Glossy orange, raised monogram: the dome bag that never goes unnoticed!\nIts orange varnish and raised pattern give it real presence. Zip, two round handles and silver fittings draw a classic shape, brought to life by colour.\n---\nWhy you will love it\n• Glossy orange: A vivid shade with a shiny look that catches the light.\n• Raised monogram: A bold pattern that adds volume to the front.\n• Dome shape and zip: A zip closure on a rounded, easily recognisable silhouette.\n• Round handles and silver fittings: A small padlock-style tag completes the details.\n\nStyle tip: With a colour this bright, keep clothes simple: white, black or denim. It can also light up a neutral outfit in an instant.",
    },

  }),
  newProduct("sac-sac-dome-gris-bleu-bande-fuchsia", "bags", {
    name: { fr: "Sac Dôme Gris-Bleu & Détails Fuchsia – Motif Floral", en: "Grey-Blue Dome Bag & Fuchsia Details – Floral Print" },
    subcategory: "handbags",
    audience: "women",
    price: 7500,
    priceOnRequest: false,
    images: ["/sac-sac-dome-gris-bleu-bande-fuchsia.jpg"],
    description: {
      fr: "L’alliance parfaite entre élégance florale et pop de couleur pour afficher un style unique !\nVous cherchez un sac qui se démarque vraiment de ce que l’on voit partout ? Ce sac dôme associe la douceur d’un motif floral gris clair et bleu nuit à la vivacité de touches fuchsia intenses. Structuré, original et chic, c’est l’accessoire idéal pour apporter du peps et du caractère à vos tenues de cours ou de sorties.\n---\nPourquoi vous allez l’adorer\n• Imprimé floral contrasté : Un motif délicat et tendance en tons gris et bleu nuit, magnifiquement réveillé par des anses et un bandeau fuchsia ultra-gourmand.\n• Silhouette dôme iconique : Une forme classique très élégante qui offre une belle contenance tout en restant compacte et bien tenue.\n• Finitions raffinées & sécurisées : Fermeture zippée fluide agrémentée d’accessoires dorés et d’un petit cadenas décoratif chic pour protéger vos affaires.\n• Porté polyvalent : À porter à la main ou au coude par ses deux anses rigides, ou à l’épaule grâce à sa bandoulière pratique.\n\nConseil de style : Laissez le sac être la pièce maîtresse de votre tenue ! Associez-le avec des vêtements aux tons neutres (un jean, un pull blanc ou un manteau gris) pour faire ressortir son contraste fuchsia.",
      en: "The perfect blend of floral elegance and a pop of colour for a style all your own!\nLooking for a bag that truly stands out from what you see everywhere? This dome bag pairs the softness of a light grey and midnight blue floral print with the punch of vivid fuchsia touches. Structured, original and chic, it is the ideal accessory to add energy and character to your outfits for class or nights out.\n---\nWhy you will love it\n• Contrasting floral print: A delicate, trendy pattern in grey and midnight blue tones, brought to life by fuchsia handles and a bold fuchsia band.\n• Iconic dome shape: A classic, very elegant silhouette with generous room that stays compact and well held.\n• Refined, secure finishing: A smooth zip closure with gold-tone hardware and a small decorative padlock to protect your belongings.\n• Versatile to carry: Carry it by hand or in the crook of your arm by its two rigid handles, or over the shoulder with the practical strap.\n\nStyle tip: Let the bag be the centrepiece of your outfit! Pair it with neutral tones (jeans, a white sweater or a grey coat) to make the fuchsia contrast stand out.",
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
      fr: "Le doré tout en nuances, pour celles qui aiment les détails discrets !\nCe sac dôme joue la subtilité avec son doré clair, ses fines lignes horizontales et son bandeau lisse à la base. Il s’habille de deux anses rondes, d’une fermeture zippée et d’attaches argentées.\n---\nPourquoi vous allez l’adorer\n• Doré clair : Une teinte lumineuse mais douce, loin du clinquant.\n• Grain en lignes horizontales : De fines lignes qui donnent du relief, avec un bandeau lisse à la base.\n• Forme dôme et zip : Une silhouette bien dessinée par ses deux anses rondes et sa fermeture zippée.\n• Logo en relief et étiquette gravée : Des finitions discrètes, avec des attaches argentées.\n\nConseil de style : Il fait merveille avec du beige, du blanc ou du bleu marine. Pour une sortie, une robe unie et des chaussures sobres suffisent.",
      en: "Gold in subtle shades, for those who love discreet details!\nThis dome bag goes for subtlety with its light gold tone, its fine horizontal lines and its smooth band at the base. It comes with two round handles, a zip closure and silver fittings.\n---\nWhy you will love it\n• Light gold: A bright but gentle tone, far from flashy.\n• Horizontal line texture: Fine lines add depth, with a smooth band at the base.\n• Dome shape and zip: A well-drawn silhouette thanks to its two round handles and zip closure.\n• Raised logo and engraved tag: Discreet finishes, with silver fittings.\n\nStyle tip: It works wonders with beige, white or navy. For an outing, a plain dress and simple shoes are all you need.",
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
      fr: "Un orange vif qui donne de l’énergie à toutes les tenues !\nLes fines lignes horizontales ajoutent du relief à la couleur de ce sac dôme. Deux anses rondes, une fermeture zippée et un petit cadenas qui pend à sa chaîne argentée complètent le tableau.\n---\nPourquoi vous allez l’adorer\n• Orange vif : Une couleur franche et gaie qui réveille un look en un instant.\n• Fines lignes horizontales : Une texture qui donne du relief à la façade.\n• Deux anses rondes : Elles se prennent bien en main sur cette forme dôme.\n• Zip et cadenas argenté : Une fermeture zippée, et un petit cadenas suspendu à une chaîne argentée.\n\nConseil de style : Un total look jean ou une tenue blanche lui laisse toute la place. Pour plus de contraste, osez-le avec du bleu marine.",
      en: "A vivid orange that energises any outfit!\nFine horizontal lines add depth to the colour of this dome bag. Two round handles, a zip closure and a small padlock hanging from its silver chain complete the picture.\n---\nWhy you will love it\n• Vivid orange: A bold, cheerful colour that wakes up a look in an instant.\n• Fine horizontal lines: A texture that adds depth to the front.\n• Two round handles: They are comfortable to hold on this dome shape.\n• Zip and silver padlock: A zip closure, plus a small padlock hanging from a silver chain.\n\nStyle tip: An all-denim look or a white outfit gives it all the space. For more contrast, dare to wear it with navy.",
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
      fr: "Un éclat doré effet miroir pour briller de jour comme de nuit !\nCe sac dôme a la lumière pour lui : sa finition dorée reflète tout autour et son monogramme en relief ajoute du caractère. Ses deux anses rondes, sa fermeture zippée et ses attaches argentées équilibrent l’ensemble.\n---\nPourquoi vous allez l’adorer\n• Doré miroir : Une finition brillante qui attire immédiatement le regard.\n• Monogramme en relief : Un motif marqué qui se détache sur la surface dorée.\n• Forme dôme et zip : Une silhouette arrondie fermée par un zip.\n• Anses rondes et attaches argentées : Le contraste des deux métaux équilibre la forme.\n\nConseil de style : Pensé pour les soirées et les grandes occasions : une robe noire ou un ensemble uni, et il devient la pièce maîtresse de votre look.",
      en: "A mirror-effect golden shine to sparkle day and night!\nThis dome bag has light on its side: its golden finish reflects everything around and its raised monogram adds character. Its two round handles, zip closure and silver fittings balance the whole.\n---\nWhy you will love it\n• Mirror gold: A shiny finish that immediately catches the eye.\n• Raised monogram: A bold pattern that stands out on the golden surface.\n• Dome shape and zip: A rounded silhouette closed by a zip.\n• Round handles and silver fittings: The contrast of the two metals balances the shape.\n\nStyle tip: Made for evenings and big occasions: a black dress or a plain set, and it becomes the centrepiece of your look.",
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
      fr: "Noir et blanc, un duo graphique qui va avec tout !\nCe cabas mise sur un contraste net, souligné par deux boucles dorées sur les côtés. Il a deux anses. Un petit porte-monnaie zippé noir figure aussi sur la photo, sa présence dans le lot restant à confirmer.\n---\nPourquoi vous allez l’adorer\n• Blanc et noir : Un contraste graphique et franc qui structure le look du sac.\n• Format cabas : Une forme généreuse à deux anses, pensée pour le quotidien.\n• Boucles dorées : Sur les côtés, elles apportent une touche de chaleur au noir et blanc.\n• Porte-monnaie zippé noir : Visible sur la photo, mais sa présence dans le lot est à confirmer.\n\nConseil de style : Le noir et blanc va avec tout : jean, robe d’été ou ensemble sobre. Une paire de baskets blanches et vous êtes prête.",
      en: "Black and white, a graphic duo that goes with everything!\nThis tote bets on a sharp contrast, highlighted by two golden buckles on the sides. It has two handles. A small black zipped coin purse also appears in the photo, though whether it comes with the bag remains to be confirmed.\n---\nWhy you will love it\n• White and black: A graphic, bold contrast that shapes the look of the bag.\n• Tote format: A generous shape with two handles, made for everyday use.\n• Golden buckles: On the sides, they bring a touch of warmth to the black and white.\n• Black zipped coin purse: Visible in the photo, but its inclusion is still to be confirmed.\n\nStyle tip: Black and white goes with everything: jeans, a summer dress or a simple set. Add white sneakers and you are ready.",
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
      fr: "Tout en noir, tout en simplicité : le cabas sur lequel on peut compter !\nUne ligne sobre, deux anses, une poche à rabat sur le devant et des sangles sur les côtés : ce cabas va droit au but. Sa couleur unie le rend facile à associer avec tout ce que vous portez.\n---\nPourquoi vous allez l’adorer\n• Noir uni : Un coloris sobre et intemporel qui ne se démode jamais.\n• Format cabas : Deux anses pour un port facile, à la main ou à l’épaule.\n• Poche à rabat : Placée sur le devant, elle ajoute un détail pratique et visuel.\n• Sangles latérales : Elles dessinent les côtés du sac et lui donnent du caractère.\n\nConseil de style : Il passe du jean-baskets du quotidien à une chemise blanche et un pantalon droit. Pour un petit effet, ajoutez un foulard coloré à l’anse.",
      en: "All black, all simple: the tote you can count on!\nA clean line, two handles, a flap pocket on the front and straps on the sides: this tote gets straight to the point. Its plain colour makes it easy to match with anything you wear.\n---\nWhy you will love it\n• Plain black: A sober, timeless colour that never goes out of style.\n• Tote format: Two handles for easy carrying, by hand or on the shoulder.\n• Flap pocket: Placed on the front, it adds a practical and visual detail.\n• Side straps: They shape the sides of the bag and give it character.\n\nStyle tip: It goes from everyday jeans and sneakers to a white shirt and straight trousers. For a little flair, tie a colourful scarf to the handle.",
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
      fr: "Le denim version cabas, avec une touche caramel qui change tout !\nVous voulez un sac qui suit le rythme de vos journées sans faire fade ? Ce cabas bleu denim est bordé de caramel et relevé de boucles dorées sur les côtés. Un contraste simple, chaleureux et facile à assortir.\n---\nPourquoi vous allez l’adorer\n• Duo denim et caramel : Le bleu de la façade rencontre des bords caramel pour un contraste doux qui se marie avec beaucoup de couleurs.\n• Format cabas : Une forme de cabas pratique pour les journées bien remplies.\n• Détails dorés : Des boucles dorées de chaque côté apportent une petite touche de brillance sans en faire trop.\n• Deux anses, portefeuille à confirmer : Deux anses pour un port simple. Un portefeuille zippé caramel apparaît sur la photo ; demandez-nous s’il est inclus avant de commander.\n\nConseil de style : Jouez la carte du total look bleu : une chemise claire, un pantalon écru et ce cabas suffisent pour une allure détendue du matin au soir.",
      en: "Denim tote, with a caramel twist that changes everything!\nLooking for a bag that keeps up with your busy days without looking dull? This blue denim tote is edged in caramel and finished with gold buckles on the sides. A simple, warm contrast that is easy to match.\n---\nWhy you will love it\n• Denim and caramel duo: The blue front meets caramel edges for a soft contrast that pairs with plenty of colours.\n• Tote shape: A practical tote format for full days.\n• Gold details: Gold buckles on each side add a little shine without overdoing it.\n• Two handles, wallet to be confirmed: Two handles for easy carrying. A caramel zipped wallet appears in the photo; please ask us whether it is included before ordering.\n\nStyle tip: Go for a shades-of-blue look: a light shirt, ecru trousers and this tote are all you need for a relaxed outfit from morning to evening.",
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
      fr: "Noir, simple, et un détail doré qui fait parler !\nSi vous aimez les sacs faciles à sortir tous les jours mais pas banals, celui-ci va vous plaire. Sa forme seau souple et son noir uni vont avec tout, et les grandes lettres dorées sur l’anse donnent le petit plus qu’on remarque.\n---\nPourquoi vous allez l’adorer\n• Noir uni : Une base neutre qui s’accorde avec toutes vos couleurs, du pantalon clair à la robe sombre.\n• Forme seau souple : Une silhouette arrondie et décontractée, facile à porter.\n• Fermeture par cordon : Un cordon ferme le haut du sac, simple et rapide, et deux boutons retiennent le côté.\n• Anse signature : Une anse ornée de grandes lettres dorées en relief, qui devient le bijou du sac.\n\nConseil de style : Sur un t-shirt blanc et un jean droit, l’anse dorée fait tout le travail. Pour une soirée, une robe noire et des sandales dorées répondent joliment aux lettres.",
      en: "Black, simple, and a gold detail that does the talking!\nIf you like bags that are easy to take out every day but never boring, this one is for you. The soft bucket shape and plain black go with everything, and the big gold letters on the handle add that little something people notice.\n---\nWhy you will love it\n• Plain black: A neutral base that matches all your colours, from light trousers to a dark dress.\n• Soft bucket shape: A rounded, relaxed silhouette that is easy to carry.\n• Drawstring closure: A cord closes the top quickly and simply, and two buttons hold the side.\n• Statement handle: A handle decorated with large raised gold letters, which becomes the bag’s jewel.\n\nStyle tip: On a white tee and straight jeans, the gold handle does all the work. For an evening out, a black dress and gold sandals echo the letters nicely.",
    },

  }),
  newProduct("sac-pochette-matelassee-beige", "bags", {
    name: { fr: "Pochette matelassée beige, lettres dorées", en: "Beige quilted clutch, gold letters" },
    subcategory: "other-bags",
    audience: "women",
    price: 6500,
    priceOnRequest: false,
    images: ["/sac-pochette-matelassee-beige.jpg"],
    description: {
      fr: "Un beige chaud, des chevrons bien nets et un V qui attire l’œil.\nCette pochette a le charme des pièces simples et bien dessinées. Le matelassage trace un grand V sur le rabat, avec des lettres dorées entrelacées au centre, le tout dans un beige chaleureux mais pas trop clair.\n---\nPourquoi vous allez l’adorer\n• Beige chaleureux : Une teinte douce, ni trop claire ni trop sombre, qui va avec les tenues neutres.\n• Matelassage en chevrons : Les chevrons forment un V sur le rabat et donnent du relief à la façade.\n• Lettres dorées : Des lettres entrelacées au centre du rabat, avec des surpiqûres assorties qui gardent le dessin net.\n• Format pochette : Aucune bandoulière n’est visible sur la photo, c’est une pochette à garder en main.\n\nConseil de style : Sortez-la avec une robe fluide couleur crème ou un pantalon large marron pour un ensemble tout en douceur, avec juste ce qu’il faut de doré.",
      en: "Warm beige, crisp chevrons and a V that catches the eye.\nThis clutch has the charm of simple, well-drawn pieces. The quilting traces a big V across the flap, with interlaced gold letters in the centre, all in a warm beige that is not too pale.\n---\nWhy you will love it\n• Warm beige: A soft shade, neither too light nor too dark, that works with neutral outfits.\n• Chevron quilting: The chevrons form a V on the flap and give the front some texture.\n• Gold letters: Interlaced letters in the centre of the flap, with matching stitching that keeps the pattern sharp.\n• Clutch format: No strap is visible in the photo, so this is a clutch to carry in your hand.\n\nStyle tip: Take it out with a flowing cream dress or wide brown trousers for a soft look with just the right amount of gold.",
    },

  }),
  newProduct("sac-pochette-matelassee-gris", "bags", {
    name: { fr: "Pochette matelassée gris anthracite, lettres dorées", en: "Charcoal grey quilted clutch, gold letters" },
    subcategory: "other-bags",
    audience: "women",
    price: 6500,
    priceOnRequest: false,
    images: ["/sac-pochette-matelassee-gris.jpg"],
    description: {
      fr: "Du gris anthracite pour une pochette discrète qui a quand même du style.\nLe rabat en V, matelassé en chevrons, porte des lettres dorées entrelacées qui ressortent très bien sur le fond sombre. C’est le coloris le plus sobre de la série, pour celles qui préfèrent l’élégance tranquille.\n---\nPourquoi vous allez l’adorer\n• Gris anthracite : Un gris foncé sobre, plus discret que les coloris chauds et facile à porter toute l’année.\n• Matelassage en chevrons : Un rabat en V qui structure la façade et lui donne du relief.\n• Doré sur sombre : Les lettres entrelacées au centre du rabat se détachent nettement sur le gris.\n• Pochette à main : Aucune bandoulière n’est visible sur la photo, on la tient à la main.\n\nConseil de style : Elle fait merveille avec du noir et du blanc, par exemple une chemise blanche et un pantalon noir, pour une tenue nette qui garde un éclat doré.",
      en: "Anthracite grey for a discreet clutch that still has style.\nThe V-shaped flap, quilted in chevrons, carries interlaced gold letters that stand out beautifully against the dark background. It is the most understated colour in the series, for those who prefer quiet elegance.\n---\nWhy you will love it\n• Anthracite grey: A sober dark grey, more discreet than the warm shades and easy to wear all year.\n• Chevron quilting: A V-shaped flap that structures the front and adds texture.\n• Gold on dark: The interlaced letters in the centre of the flap stand out clearly against the grey.\n• Hand clutch: No strap is visible in the photo, so you carry it in your hand.\n\nStyle tip: It works wonders with black and white, such as a white shirt and black trousers, for a clean outfit with a golden spark.",
    },

  }),
  newProduct("sac-pochette-matelassee-cognac", "bags", {
    name: { fr: "Pochette matelassée cognac, lettres dorées", en: "Cognac quilted clutch, gold letters" },
    subcategory: "other-bags",
    audience: "women",
    price: 6500,
    priceOnRequest: false,
    images: ["/sac-pochette-matelassee-cognac.jpg"],
    description: {
      fr: "Un cognac lumineux qui réchauffe toute la tenue !\nCette pochette mise sur la couleur : un cognac vif qui met en valeur le rabat en V matelassé en chevrons. Les lettres dorées entrelacées ressortent bien sur ce fond chaud, et les surpiqûres de même teinte donnent une finition soignée.\n---\nPourquoi vous allez l’adorer\n• Cognac lumineux : Une couleur chaude et vivante qui apporte de la lumière à une tenue simple.\n• Rabat en V matelassé : Les chevrons dessinent un V net sur toute la façade.\n• Lettres dorées : Entrelacées au centre du rabat, elles se détachent bien sur la couleur chaude, avec des surpiqûres de la même teinte.\n• Sans bandoulière visible : Aucune bandoulière n’apparaît sur la photo, c’est une pochette à tenir en main.\n\nConseil de style : Parfaite sur une tenue bleu marine ou kaki, où le cognac devient le point chaud. Pour un soir, essayez-la avec du noir pour un contraste très net.",
      en: "A glowing cognac that warms up the whole outfit!\nThis clutch is all about colour: a bright cognac that sets off the V-shaped flap quilted in chevrons. The interlaced gold letters show up well on the warm background, and the same-colour stitching gives a neat finish.\n---\nWhy you will love it\n• Glowing cognac: A warm, lively colour that brings light to a simple outfit.\n• Quilted V flap: The chevrons draw a sharp V across the whole front.\n• Gold letters: Interlaced in the centre of the flap, they stand out well on the warm colour, with stitching in the same shade.\n• No visible strap: No strap appears in the photo, so this is a clutch to hold in your hand.\n\nStyle tip: Perfect with a navy or khaki outfit, where the cognac becomes the warm focal point. For the evening, try it with black for a very crisp contrast.",
    },

  }),
  newProduct("sac-rabat-asymetrique-blanc-cadenas", "bags", {
    name: { fr: "Sac à rabat asymétrique blanc, cadenas doré", en: "White asymmetric flap bag, gold padlock" },
    subcategory: "handbags",
    audience: "women",
    price: 8700,
    priceOnRequest: false,
    images: ["/sac-rabat-asymetrique-blanc-cadenas.jpg"],
    description: {
      fr: "Blanc franc, lignes nettes : le genre de sac qu’on remarque tout de suite.\nSon rabat asymétrique à surpiqûres apparentes et son cadenas doré au centre se détachent joliment sur le blanc. Une anse rigide nouée de chaque côté complète l’ensemble pour un look propre et affirmé.\n---\nPourquoi vous allez l’adorer\n• Blanc éclatant : Un coloris clair qui met chaque détail en valeur et illumine la tenue.\n• Rabat asymétrique : Une ligne en biais soulignée de surpiqûres apparentes, pour une forme qui sort de l’ordinaire.\n• Cadenas et anneaux dorés : Un cadenas doré au centre et des anneaux dorés visibles sur les côtés.\n• Anse rigide nouée : Une anse rigide nouée de chaque côté, pour un port à la main bien tenu.\n\nConseil de style : Le blanc adore les tons profonds : essayez-le avec un ensemble marine, bordeaux ou noir pour un contraste net. Avec une tenue entièrement claire, il donne un look très frais.",
      en: "Crisp white, clean lines: the kind of bag you notice right away.\nThe asymmetric flap with visible stitching and the gold padlock in the centre stand out beautifully against the white. A rigid handle knotted on each side completes the look, which is clean and confident.\n---\nWhy you will love it\n• Bright white: A light colour that shows off every detail and lifts your outfit.\n• Asymmetric flap: A slanted line outlined with visible stitching, for a shape that stands out.\n• Gold padlock and rings: A gold padlock in the centre and gold rings visible on the sides.\n• Knotted rigid handle: A rigid handle knotted on each side, for a well-held carry in the hand.\n\nStyle tip: White loves deep tones: try it with navy, burgundy or black for a sharp contrast. With an all-light outfit, it gives a very fresh look.",
    },

  }),
  newProduct("sac-rabat-asymetrique-bordeaux", "bags", {
    name: { fr: "Sac à rabat asymétrique bordeaux, avec bandoulière", en: "Burgundy asymmetric flap bag, with shoulder strap" },
    subcategory: "handbags",
    audience: "women",
    price: 8700,
    priceOnRequest: false,
    images: ["/sac-rabat-asymetrique-bordeaux.jpg"],
    description: {
      fr: "Un bordeaux profond pour une silhouette qui ne passe pas inaperçue.\nLe rabat asymétrique, souligné d’une double surpiqûre en courbe, donne à ce sac une allure nette et soignée. Avec son anse rigide et sa bandoulière à mousquetons dorés, il passe facilement de la main à l’épaule.\n---\nPourquoi vous allez l’adorer\n• Bordeaux profond : Une couleur de saison, élégante, qui va aussi bien avec le sombre qu’avec les tons clairs.\n• Rabat asymétrique : Une double surpiqûre en courbe souligne le rabat et dessine la forme.\n• Attaches dorées : Des mousquetons et attaches dorées qui contrastent avec le bordeaux.\n• Deux façons de le porter : Une anse rigide pour la main, et une bandoulière fixée par mousquetons pour libérer les mains.\n\nConseil de style : Le bordeaux se marie très bien avec le beige, le camel ou le gris. Un manteau clair et un col roulé, et le sac devient la touche qui donne du caractère.",
      en: "A deep burgundy for a silhouette that does not go unnoticed.\nThe asymmetric flap, outlined with a curved double stitch, gives this bag a sharp, polished look. With its rigid handle and strap on gold clasps, it moves easily from hand to shoulder.\n---\nWhy you will love it\n• Deep burgundy: A colour of the season, elegant, which suits dark and light tones alike.\n• Asymmetric flap: A curved double stitch outlines the flap and draws the shape.\n• Gold fittings: Gold clasps and fastenings that contrast with the burgundy.\n• Two ways to carry it: A rigid handle for the hand, and a strap attached by clasps to keep your hands free.\n\nStyle tip: Burgundy pairs really well with beige, camel or grey. Add a light coat and a turtleneck and the bag becomes the touch that gives the look character.",
    },

  }),
  newProduct("sac-rabat-asymetrique-violet-cadenas", "bags", {
    name: { fr: "Sac à rabat asymétrique violet, cadenas doré", en: "Purple asymmetric flap bag, gold padlock" },
    subcategory: "handbags",
    audience: "women",
    price: 8700,
    priceOnRequest: false,
    images: ["/sac-rabat-asymetrique-violet-cadenas.jpg"],
    description: {
      fr: "Du violet intense pour sortir du noir et du marron !\nLe cadenas doré posé sur le rabat se détache franchement sur cette couleur vive. L’anse fine, nouée et munie d’une boucle dorée, complète le tout, et le rabat asymétrique ajoute une ligne en biais pleine de caractère.\n---\nPourquoi vous allez l’adorer\n• Violet intense : Un coloris profond et sûr de lui, pour celles qui osent la couleur.\n• Cadenas doré : Posé sur le rabat, il attire l’œil et fait ressortir le violet.\n• Rabat asymétrique : Une ligne en biais qui casse la forme classique et donne du mouvement.\n• Anse fine nouée : Une anse fine, nouée et fermée par une boucle dorée, avec d’autres attaches dorées.\n\nConseil de style : Osez le violet avec du gris perle, du blanc ou du noir pour une tenue calme qui laisse le sac chanter. Pour un style plus audacieux, osez le total look en tons sombres avec ce seul éclat de couleur.",
      en: "Intense purple to break away from black and brown!\nThe gold padlock on the flap stands out boldly against this vivid colour. The thin knotted handle with its gold buckle completes the look, and the asymmetric flap adds a slanted line full of character.\n---\nWhy you will love it\n• Intense purple: A deep, confident colour for those who dare to wear colour.\n• Gold padlock: Set on the flap, it draws the eye and makes the purple pop.\n• Asymmetric flap: A slanted line that breaks the classic shape and adds movement.\n• Thin knotted handle: A thin knotted handle closed with a gold buckle, plus other gold fittings.\n\nStyle tip: Wear the purple with pearl grey, white or black for a calm outfit that lets the bag sing. For a bolder style, go all in on dark tones with this one burst of colour.",
    },

  }),
  newProduct("sac-rabat-terracotta-cadenas-pochette", "bags", {
    name: { fr: "Sac à rabat terracotta, cadenas et petite pochette", en: "Terracotta flap bag, padlock and small pouch" },
    subcategory: "handbags",
    audience: "women",
    price: 8500,
    priceOnRequest: false,
    images: ["/sac-rabat-terracotta-cadenas-pochette.jpg"],
    description: {
      fr: "Terracotta chaud, anse rigide : un sac qui sent le soleil.\nSon rabat asymétrique est orné d’un cadenas aux reflets argentés et violet pâle, pour un détail inattendu. La couleur terracotta est chaude et uniforme, et le sac est présenté avec une petite pochette assortie.\n---\nPourquoi vous allez l’adorer\n• Terracotta uniforme : Une couleur chaude et régulière, entre brique et orange doux, facile à porter.\n• Rabat asymétrique : Une forme avec une ligne en biais, et un cadenas aux reflets argentés et violet pâle.\n• Anse rigide, attaches dorées : Une anse rigide pour un port à la main, avec des attaches dorées.\n• Petite pochette, à confirmer : Une petite pochette à rabat fermée par un bouton doré est présentée sur la photo. Demandez-nous si elle est incluse avant de commander.\n\nConseil de style : Le terracotta s’accorde très bien avec le beige, le blanc cassé ou le denim bleu foncé. Une chemise claire et un pantalon droit suffisent pour une tenue chaleureuse.",
      en: "Warm terracotta, rigid handle: a bag that feels like sunshine.\nIts asymmetric flap is decorated with a padlock with silvery and pale purple reflections, a surprising detail. The terracotta colour is warm and even, and the bag is shown with a small pouch.\n---\nWhy you will love it\n• Even terracotta: A warm, consistent colour somewhere between brick and soft orange, easy to wear.\n• Asymmetric flap: A shape with a slanted line, and a padlock with silvery and pale purple reflections.\n• Rigid handle, gold fittings: A rigid handle for carrying in the hand, with gold fittings.\n• Small pouch, to be confirmed: A small flap pouch closed with a gold button is shown in the photo. Please ask us whether it is included before ordering.\n\nStyle tip: Terracotta goes very well with beige, off-white or dark blue denim. A light shirt and straight trousers are enough for a warm, relaxed outfit.",
    },

  }),
  newProduct("sac-rabat-marron-cadenas-pochette", "bags", {
    name: { fr: "Sac à rabat marron foncé, cadenas et petite pochette", en: "Dark brown flap bag, padlock and small pouch" },
    subcategory: "handbags",
    audience: "women",
    price: 8500,
    priceOnRequest: false,
    images: ["/sac-rabat-marron-cadenas-pochette.jpg"],
    description: {
      fr: "Un marron foncé élégant avec une anse qui a du style.\nLa surface à grain fin habille ce sac à rabat asymétrique, dont l’anse est formée de plusieurs lanières nouées. Un cadenas doré orne le devant et une bandoulière est visible sur le côté.\n---\nPourquoi vous allez l’adorer\n• Marron foncé à grain fin : Une couleur profonde et sobre, avec une surface qui donne de la matière à la façade.\n• Anse en lanières nouées : Plusieurs lanières nouées forment l’anse, un détail qui la distingue des anses classiques.\n• Cadenas doré et rabat asymétrique : Un rabat en biais et un cadenas doré sur le devant, pour un style soigné.\n• Bandoulière visible, pochette à confirmer : Une bandoulière apparaît sur le côté. Une petite pochette à bouton doré est présentée sur la photo ; demandez-nous si elle est incluse.\n\nConseil de style : Le marron foncé ressort sur le beige, le blanc et le vert olive. Une chemise crème, un pantalon droit et ce sac, et votre tenue prend un air de rentrée.",
      en: "An elegant dark brown with a handle that has style.\nThe fine-grain surface dresses this asymmetric flap bag, whose handle is made of several knotted straps. A gold padlock decorates the front and a strap is visible on the side.\n---\nWhy you will love it\n• Fine-grain dark brown: A deep, sober colour with a surface that gives the front some texture.\n• Knotted strap handle: Several knotted straps form the handle, a detail that sets it apart from classic handles.\n• Gold padlock and asymmetric flap: A slanted flap and a gold padlock on the front, for a polished style.\n• Visible strap, pouch to be confirmed: A strap appears on the side. A small pouch with a gold button is shown in the photo; please ask us whether it is included.\n\nStyle tip: Dark brown stands out against beige, white and olive green. A cream shirt, straight trousers and this bag give your outfit a back-to-school feel.",
    },

  }),
  newProduct("sac-sac-rouge-bande-tressee-portefeuille", "bags", {
    name: { fr: "Sac rouge à bande tressée, avec portefeuille", en: "Red tote with woven band, with wallet" },
    subcategory: "handbags",
    audience: "women",
    price: 9500,
    priceOnRequest: false,
    images: ["/sac-sac-rouge-bande-tressee-portefeuille.jpg"],
    description: {
      fr: "Rouge vif, tressage et dorures : ce sac ne cherche pas à passer inaperçu.\nUne bande tressée court au bas de la façade, et deux pattes dorées gravées d’un motif de feuille fixent les anses. Le rouge fait le reste, avec beaucoup d’énergie.\n---\nPourquoi vous allez l’adorer\n• Rouge vif : Un coloris franc et lumineux qui donne de l’énergie à la tenue.\n• Bande tressée : Un tressage au bas de la façade qui ajoute du relief.\n• Pattes dorées et anneaux : Des pattes dorées à motif de feuille fixent les anses, et des anneaux dorés sont visibles de part et d’autre.\n• Deux anses, portefeuille à confirmer : Les côtés sont nervurés. Un portefeuille zippé assorti est présenté sur la photo ; demandez-nous s’il est inclus avant de commander.\n\nConseil de style : Le rouge a besoin de calme autour de lui : un jean, un haut blanc ou noir, et le sac fait l’événement. Une bonne idée pour une sortie du soir où l’on veut une touche de couleur.",
      en: "Bright red, braiding and gold: this bag is not trying to go unnoticed.\nA braided band runs along the bottom of the front, and two gold tabs engraved with a leaf motif attach the handles. The red does the rest, with plenty of energy.\n---\nWhy you will love it\n• Bright red: A bold, luminous colour that gives your outfit energy.\n• Braided band: A braid along the bottom of the front that adds texture.\n• Gold tabs and rings: Gold leaf-motif tabs attach the handles, and gold rings are visible on both sides.\n• Two handles, wallet to be confirmed: The sides are ribbed. A matching zipped wallet is shown in the photo; please ask us whether it is included before ordering.\n\nStyle tip: Red needs calm around it: jeans, a white or black top, and the bag makes the statement. A good idea for an evening out when you want a pop of colour.",
    },

  }),
  newProduct("sac-sac-beige-anses-marron-portefeuille", "bags", {
    name: { fr: "Sac beige à anses marron et bande tressée, avec portefeuille", en: "Beige tote with brown handles and woven band, with wallet" },
    subcategory: "handbags",
    audience: "women",
    price: 9500,
    priceOnRequest: false,
    images: ["/sac-sac-beige-anses-marron-portefeuille.jpg"],
    description: {
      fr: "Beige clair, anses marron : l’élégance tranquille version quotidien.\nCe sac joue la douceur avec un beige clair, relevé d’anses marron foncé et d’une bande tressée de la même teinte au bas de la façade. Les détails dorés finissent le tout avec discrétion.\n---\nPourquoi vous allez l’adorer\n• Beige et marron foncé : Un duo doux et classique qui va avec presque toutes les tenues.\n• Bande tressée : Un tressage marron au bas de la façade, assorti aux anses.\n• Pattes dorées et anneaux : Des pattes dorées gravées d’une feuille fixent les anses, avec des anneaux dorés visibles sur les côtés.\n• Deux anses, portefeuille à confirmer : Deux anses marron pour le porter. Un portefeuille zippé beige est présenté sur la photo ; demandez-nous s’il est inclus.\n\nConseil de style : Très à l’aise avec le blanc, le kaki et le camel : un pantalon large kaki et un haut blanc, et le sac donne l’allure d’une tenue pensée jusqu’au bout.",
      en: "Light beige, brown handles: quiet elegance for every day.\nThis bag plays it soft with a light beige, set off by dark brown handles and a braided band in the same shade along the bottom of the front. The gold details finish the look discreetly.\n---\nWhy you will love it\n• Beige and dark brown: A soft, classic duo that goes with almost any outfit.\n• Braided band: A brown braid along the bottom of the front, matching the handles.\n• Gold tabs and rings: Gold tabs engraved with a leaf attach the handles, with gold rings visible on the sides.\n• Two handles, wallet to be confirmed: Two brown handles for carrying. A beige zipped wallet is shown in the photo; please ask us whether it is included.\n\nStyle tip: Very comfortable with white, khaki and camel: wide khaki trousers and a white top, and the bag makes the outfit look thought through to the last detail.",
    },

  }),
  newProduct("sac-sac-jaune-bande-tressee-portefeuille", "bags", {
    name: { fr: "Sac jaune moutarde à bande tressée, avec portefeuille", en: "Mustard yellow tote with woven band, with wallet" },
    subcategory: "handbags",
    audience: "women",
    price: 9500,
    priceOnRequest: false,
    images: ["/sac-sac-jaune-bande-tressee-portefeuille.jpg"],
    description: {
      fr: "Jaune moutarde pour mettre du soleil dans la journée !\nCe sac à deux anses a une bande tressée au bas de la façade et des pattes dorées gravées d’une feuille qui fixent les anses. Le jaune moutarde, chaleureux et franc, fait tout de suite la différence.\n---\nPourquoi vous allez l’adorer\n• Jaune moutarde : Une couleur chaude et franche, qui donne de la bonne humeur à une tenue.\n• Bande tressée : Un tressage au bas de la façade pour casser la couleur unie.\n• Pattes dorées : Des pattes dorées gravées d’une feuille fixent les anses.\n• Deux anses, portefeuille à confirmer : Deux anses pour le port. Un portefeuille zippé jaune assorti est présenté sur la photo ; demandez-nous s’il est inclus avant de commander.\n\nConseil de style : Le jaune moutarde s’adore avec le denim, le blanc ou le marron. Un jean brut, un t-shirt blanc et ce sac, et le tour est joué.",
      en: "Mustard yellow to bring sunshine into your day!\nThis two-handled bag has a braided band along the bottom of the front and gold tabs engraved with a leaf that attach the handles. The warm, bold mustard yellow makes a difference right away.\n---\nWhy you will love it\n• Mustard yellow: A warm, bold colour that adds good cheer to an outfit.\n• Braided band: A braid along the bottom of the front to break up the plain colour.\n• Gold tabs: Gold tabs engraved with a leaf attach the handles.\n• Two handles, wallet to be confirmed: Two handles for carrying. A matching yellow zipped wallet is shown in the photo; please ask us whether it is included before ordering.\n\nStyle tip: Mustard yellow loves denim, white or brown. Raw jeans, a white tee and this bag, and you are done.",
    },

  }),
  newProduct("sac-sac-rouge-surpiqures-geometriques-portefeuille", "bags", {
    name: { fr: "Sac rouge à surpiqûres géométriques, breloque feuille et portefeuille", en: "Red bag with geometric stitching, leaf charm and wallet" },
    subcategory: "handbags",
    audience: "women",
    price: 8900,
    priceOnRequest: false,
    images: ["/sac-sac-rouge-surpiqures-geometriques-portefeuille.jpg"],
    description: {
      fr: "Un rouge qui ne passe pas inaperçu, et des lignes qui font tout le travail !\nSi vous aimez les sacs qui ont du caractère sans en faire trop, celui-ci va vous plaire. Le rouge uni est rythmé par des surpiqûres croisées qui dessinent un motif géométrique, et une petite breloque en forme de feuille se balance à l’anse. Un sac qui attire l’œil dès qu’on le croise.\n---\nPourquoi vous allez l’adorer\n• Rouge et géométrie : Un rouge intense, animé par des surpiqûres en lignes croisées sur toute la façade.\n• Anse ronde : Une anse arrondie, pratique à tenir à la main pour vos sorties en ville.\n• Détails dorés : Une breloque feuille et deux perles dorées pendent à l’anse, avec un discret lettrage doré sur le devant.\n• Côté portefeuille : Un long portefeuille zippé rouge apparaît sur la photo ; sa présence dans la commande reste à confirmer.\n\nConseil de style : Posez-le sur une tenue sobre, noir ou jean, et laissez le rouge parler. Pour une soirée entre amies, une robe noire et des sandales dorées répondent bien aux perles de l’anse.",
      en: "A red that never goes unnoticed, with lines that do all the talking!\nIf you like bags with character but not too much fuss, this one is for you. The solid red is livened up by crisscross stitching that forms a geometric pattern, and a little leaf-shaped charm swings from the handle. A bag that catches the eye as soon as you walk by.\n---\nWhy you will love it\n• Red and geometry: A bold red, brought to life by crisscross stitching across the whole front.\n• Round handle: A rounded handle, easy to carry in your hand for outings around town.\n• Golden details: A leaf charm and two gold beads hang from the handle, with discreet gold lettering on the front.\n• About the wallet: A long red zip wallet appears in the photo; whether it is included in the order is still to be confirmed.\n\nStyle tip: Pair it with a simple outfit, black or denim, and let the red do the talking. For an evening out with friends, a black dress and gold sandals echo the beads on the handle.",
    },

  }),
  newProduct("sac-sac-bleu-surpiqures-geometriques-portefeuille", "bags", {
    name: { fr: "Sac bleu à surpiqûres géométriques, breloque fleur et portefeuille", en: "Blue bag with geometric stitching, flower charm and wallet" },
    subcategory: "handbags",
    audience: "women",
    price: 8900,
    priceOnRequest: false,
    images: ["/sac-sac-bleu-surpiqures-geometriques-portefeuille.jpg"],
    description: {
      fr: "Un bleu tout en douceur qui change des couleurs habituelles !\nCe sac mise sur un seul ton, un bleu moyen, et laisse les détails faire le style. Les surpiqûres croisées animent la façade et une breloque en forme de fleur donne un petit air frais à l’ensemble. Facile à vivre, mais pas banal.\n---\nPourquoi vous allez l’adorer\n• Bleu en un seul ton : Un bleu moyen uni, sur lequel les surpiqûres croisées dessinent un motif géométrique.\n• Anse ronde et fleur : Une anse arrondie à laquelle est accrochée une breloque en forme de fleur.\n• Touches dorées : Deux perles dorées et un petit lettrage doré sur le devant apportent le contraste.\n• Côté portefeuille : Un long portefeuille zippé bleu est présenté sur la photo ; son inclusion est à confirmer.\n\nConseil de style : Le bleu va très bien avec un jean clair et une chemise blanche pour une journée en ville. Pour un look plus habillé, tentez une tenue beige ou crème, le contraste est joli.",
      en: "A soft blue that stands out from the usual colors!\nThis bag sticks to a single shade, a medium blue, and lets the details create the style. Crisscross stitching livens up the front and a flower-shaped charm adds a fresh touch. Easy to wear, yet far from ordinary.\n---\nWhy you will love it\n• One-tone blue: A solid medium blue, on which the crisscross stitching draws a geometric pattern.\n• Round handle and flower: A rounded handle with a flower-shaped charm attached.\n• Golden touches: Two gold beads and a small gold lettering on the front add contrast.\n• About the wallet: A long blue zip wallet is shown in the photo; its inclusion is to be confirmed.\n\nStyle tip: Blue works beautifully with light jeans and a white shirt for a day in town. For a dressier look, try a beige or cream outfit; the contrast is lovely.",
    },

  }),
  newProduct("sac-sac-jaune-surpiqures-geometriques", "bags", {
    name: { fr: "Sac jaune à surpiqûres géométriques, breloque dorée", en: "Yellow bag with geometric stitching, gold charm" },
    subcategory: "handbags",
    audience: "women",
    price: 8900,
    priceOnRequest: false,
    images: ["/sac-sac-jaune-surpiqures-geometriques.jpg"],
    description: {
      fr: "Du jaune vif pour mettre du soleil dans la journée, même quand le ciel est gris !\nVoici la version présentée sans portefeuille, entièrement centrée sur le sac. Les surpiqûres croisées structurent la façade, pendant que les anses texturées et la breloque dorée ajoutent du relief. Pour celles qui assument les couleurs.\n---\nPourquoi vous allez l’adorer\n• Jaune vif : Un coloris franc et lumineux, qui se remarque de loin.\n• Surpiqûres géométriques : Des lignes croisées qui structurent toute la façade.\n• Anses texturées : Des anses à surface texturée, accompagnées d’une breloque dorée métallisée.\n• Version seule : Présenté sans portefeuille, avec un petit lettrage doré discrètement placé sur le devant.\n\nConseil de style : Jaune et denim foncé, c’est un duo qui marche toujours. Sur une tenue toute noire, il devient la touche qui change tout.",
      en: "Bright yellow to bring some sunshine to your day, even when the sky is gray!\nThis is the version shown without a wallet, fully focused on the bag itself. Crisscross stitching structures the front, while the textured handles and the golden charm add some relief. For those who dare to wear color.\n---\nWhy you will love it\n• Bright yellow: A bold, luminous color you can spot from afar.\n• Geometric stitching: Crisscross lines that structure the entire front.\n• Textured handles: Handles with a textured surface, along with a metallic golden charm.\n• Bag only: Shown without a wallet, with a small gold lettering discreetly placed on the front.\n\nStyle tip: Yellow with dark denim is a duo that always works. On an all-black outfit, it becomes the touch that changes everything.",
    },

  }),
  newProduct("sac-sac-a-dos-gris-gaufre", "bags", {
    name: { fr: "Sac à dos gris clair, motif gaufré", en: "Light grey backpack, embossed pattern" },
    subcategory: "mens-bags",
    audience: "men",
    price: 8000,
    priceOnRequest: false,
    images: ["/sac-sac-a-dos-gris-gaufre.jpg"],
    description: {
      fr: "Un sac à dos gris clair qui a du relief, au sens propre !\nFini le sac à dos tout plat et sans histoire : ici, le motif gaufré de fleurs et de lettres couvre toute la surface. C’est sobre de loin, travaillé de près. Il suit son homme du campus aux trajets du quotidien.\n---\nPourquoi vous allez l’adorer\n• Gris clair gaufré : Un motif en relief de fleurs et de lettres sur toute la surface, dans un gris clair discret.\n• Poche à rabat : Une poche à rabat sur le devant, ornée d’un petit logo noir.\n• Zip principal : Une fermeture zippée avec deux curseurs argentés.\n• Porté au dos ou à la main : Larges bretelles noires pour le dos, et une anse de portage pour le prendre à la main.\n\nConseil de style : Le gris clair s’accorde avec tout : jean brut, sweat noir, baskets blanches pour la fac ou le travail. Sur une chemise et un pantalon bien coupé, il donne un air plus décontracté au look.",
      en: "A light gray backpack with real texture, quite literally!\nNo more flat, plain backpacks: here, an embossed pattern of flowers and letters covers the whole surface. Understated from afar, detailed up close. It goes with you from campus to everyday commutes.\n---\nWhy you will love it\n• Embossed light gray: A raised pattern of flowers and letters over the entire surface, in a discreet light gray.\n• Flap pocket: A flap pocket on the front, topped with a small black logo.\n• Main zip: A zip closure with two silver sliders.\n• Back or hand carry: Wide black straps for your back, and a carry handle to hold it by hand.\n\nStyle tip: Light gray goes with everything: raw denim, a black sweatshirt, white sneakers for campus or work. Over a shirt and well-cut trousers, it gives the look a more relaxed feel.",
    },

  }),
  newProduct("sac-sac-a-dos-vert-gaufre", "bags", {
    name: { fr: "Sac à dos vert, motif gaufré", en: "Green backpack, embossed pattern" },
    subcategory: "mens-bags",
    audience: "men",
    price: 8000,
    priceOnRequest: false,
    images: ["/sac-sac-a-dos-vert-gaufre.jpg"],
    description: {
      fr: "Du vert franc pour sortir des sacs noirs et gris qu’on voit partout !\nCe sac à dos ose la couleur, et le motif gaufré sur toute la surface lui donne une vraie allure. Quand on le porte, on ne le confond avec aucun autre. Parfait pour ceux qui aiment avoir un détail à eux.\n---\nPourquoi vous allez l’adorer\n• Vert franc : Un coloris marqué, qui sort des teintes habituelles.\n• Motif gaufré : Un relief qui couvre toute la surface du sac.\n• Poche à rabat : Sur le devant, avec un petit logo noir.\n• Zip en arc : Le zip principal dessine un arc, avec deux curseurs argentés.\n\nConseil de style : Gardez le reste de la tenue simple : t-shirt noir ou blanc, jean ou pantalon sombre, et le vert fait tout. Pour le travail ou les déplacements, il apporte juste ce qu’il faut de personnalité.",
      en: "A bold green to break away from the black and gray bags you see everywhere!\nThis backpack dares to use color, and the embossed pattern across the whole surface gives it real presence. Once you wear it, nobody will mix it up with another. Perfect for those who like having something that is theirs.\n---\nWhy you will love it\n• Bold green: A strong color that steps away from the usual shades.\n• Embossed pattern: A raised texture covering the entire surface of the bag.\n• Flap pocket: On the front, with a small black logo.\n• Arched zip: The main zip follows an arc, with two silver sliders.\n\nStyle tip: Keep the rest of the outfit simple: black or white tee, jeans or dark trousers, and the green does the job. For work or getting around, it adds just the right amount of personality.",
    },

  }),
  newProduct("sac-sac-a-dos-jaune-gaufre", "bags", {
    name: { fr: "Sac à dos jaune, motif gaufré", en: "Yellow backpack, embossed pattern" },
    subcategory: "mens-bags",
    audience: "men",
    price: 8000,
    priceOnRequest: false,
    images: ["/sac-sac-a-dos-jaune-gaufre.jpg"],
    description: {
      fr: "Jaune vif de la tête aux pieds, un sac à dos qui assume !\nLe motif gaufré couvre toute la surface et attrape la lumière, ce qui rend le jaune encore plus vivant. Un sac à dos pour celui qui n’a pas peur qu’on le remarque, entre deux cours ou sur le chemin du boulot.\n---\nPourquoi vous allez l’adorer\n• Jaune vif : Un coloris éclatant, uniforme sur tout le sac.\n• Surface gaufrée : Un motif en relief sur toute la surface.\n• Poche zippée : Sur le devant, ornée d’une plaque gravée.\n• Zip courbe et anse : Le zip principal suit la courbe du dessus avec des curseurs argentés, et une anse de portage surmonte le sac.\n\nConseil de style : Mettez-le avec du noir, du gris ou du denim foncé : le jaune devient la pièce forte du look. Un hoodie sombre et des baskets blanches suffisent pour un style de campus sans effort.",
      en: "Bright yellow from top to bottom, a backpack that owns it!\nThe embossed pattern covers the whole surface and catches the light, making the yellow even more vivid. A backpack for the guy who does not mind being noticed, between classes or on the way to work.\n---\nWhy you will love it\n• Bright yellow: A vivid color, consistent across the whole bag.\n• Embossed surface: A raised pattern over the entire surface.\n• Zip pocket: On the front, decorated with an engraved plate.\n• Curved zip and handle: The main zip follows the curve of the top with silver sliders, and a carry handle sits on top of the bag.\n\nStyle tip: Wear it with black, gray or dark denim: the yellow becomes the star of the look. A dark hoodie and white sneakers are enough for an effortless campus style.",
    },

  }),
  newProduct("sac-quilted-camel-wallet", "bags", {
    name: { fr: "Sac matelassé camel, charm et portefeuille", en: "Camel quilted bag, charm and wallet" },
    subcategory: "handbags",
    audience: "women",
    price: 8500,
    priceOnRequest: false,
    images: ["/sac-quilted-camel-wallet.jpg"],
    description: {
      fr: "Le camel, la couleur qui s’entend avec toute la garde-robe !\nSur ce sac, des surpiqûres claires tracent un réseau de losanges sur toute la façade, et une anse arrondie donne une allure douce et soignée. Un petit charm noir et doré noué à un cordon apporte la touche finale.\n---\nPourquoi vous allez l’adorer\n• Camel facile à porter : Une teinte chaude et neutre qui passe avec presque toutes les tenues.\n• Losanges en surpiqûres : Des coutures claires qui forment un motif en losanges sur toute la façade.\n• Anse arrondie et charm : Une anse arrondie, avec un charm noir et doré noué à un cordon.\n• Côté portefeuille : Un portefeuille zippé assorti figure sur la photo ; à confirmer s’il est inclus.\n\nConseil de style : Camel et blanc cassé, avec un jean droit, donnent un look propre pour un après-midi en ville. Le soir, passez au noir total et laissez le charm doré briller.",
      en: "Camel, the color that gets along with the whole wardrobe!\nOn this bag, light stitching traces a network of diamonds across the front, and a rounded handle gives it a soft, polished look. A little black and gold charm tied to a cord adds the finishing touch.\n---\nWhy you will love it\n• Easy-to-wear camel: A warm, neutral shade that goes with almost any outfit.\n• Diamond stitching: Light seams forming a diamond pattern across the whole front.\n• Rounded handle and charm: A rounded handle, with a black and gold charm tied to a cord.\n• About the wallet: A matching zip wallet appears in the photo; to be confirmed whether it is included.\n\nStyle tip: Camel with off-white and straight-leg jeans makes a clean look for an afternoon in town. In the evening, go all black and let the golden charm shine.",
    },

  }),
  newProduct("sac-quilted-cream-wallet", "bags", {
    name: { fr: "Sac matelassé crème, charm et portefeuille", en: "Cream quilted bag, charm and wallet" },
    subcategory: "handbags",
    audience: "women",
    price: 8500,
    priceOnRequest: false,
    images: ["/sac-quilted-cream-wallet.jpg"],
    description: {
      fr: "Un crème lumineux, tout en finesse, pour les journées où l’on veut paraître soignée sans effort !\nCe sac joue sur le contraste entre le crème de la façade et le noir qui borde l’intérieur de l’anse. Les surpiqûres dessinent des losanges et un charm en fleur noire donne le petit détail qui plaît.\n---\nPourquoi vous allez l’adorer\n• Crème lumineux : Un coloris clair et doux qui éclaire toute la tenue.\n• Anse bordée de noir : L’intérieur de l’anse est bordé de noir, pour un contraste net.\n• Charm fleur noire : Une fleur noire accrochée à un cordon, comme un petit bijou pour le sac.\n• Côté portefeuille : Un portefeuille zippé assorti figure sur la photo ; à confirmer s’il est inclus.\n\nConseil de style : Essayez-le avec une tenue en noir et blanc, ou une robe de couleur vive pour qu’il ressorte. Pour un brunch ou une sortie du week-end, ce crème fait toute la différence.",
      en: "A luminous cream, all in subtlety, for days when you want to look put together without effort!\nThis bag plays on the contrast between the cream front and the black edging inside the handle. The stitching draws diamonds, and a black flower charm gives that little detail everyone loves.\n---\nWhy you will love it\n• Luminous cream: A light, soft color that brightens the entire outfit.\n• Black-edged handle: The inside of the handle is edged in black for a sharp contrast.\n• Black flower charm: A black flower attached to a cord, like a little jewel for the bag.\n• About the wallet: A matching zip wallet appears in the photo; to be confirmed whether it is included.\n\nStyle tip: Try it with a black and white outfit, or a bright-colored dress to make it stand out. For brunch or a weekend outing, this cream makes all the difference.",
    },

  }),
  newProduct("sac-quilted-red", "bags", {
    name: { fr: "Sac à main rouge à surpiqûres en losanges, charm doré", en: "Red handbag with diamond stitching, gold charm" },
    subcategory: "handbags",
    audience: "women",
    price: 7800,
    priceOnRequest: false,
    images: ["/sac-quilted-red.jpg"],
    description: {
      fr: "Un rouge franc, sans détour, pour celles qui aiment qu’on les remarque !\nCe sac à main aligne des surpiqûres assorties qui forment des losanges sur la façade. Au cordon noué sur l’anse, des perles et un charm dorés font briller l’ensemble, et une plaque dorée posée en bas complète le décor.\n---\nPourquoi vous allez l’adorer\n• Rouge franc : Un coloris vif et assumé, avec des surpiqûres assorties au ton du sac.\n• Losanges sur la façade : Un motif de losanges tracé par les coutures.\n• Cordon doré : Deux perles dorées et un charm métallique accrochés au cordon noué sur l’anse.\n• Plaque dorée : Une plaque dorée posée en bas, au centre de la façade.\n\nConseil de style : Avec une robe noire ou un ensemble beige, ce rouge fait toute l’élégance de la tenue. Pour un anniversaire ou un dîner, il remplace très bien un bijou.",
      en: "A straightforward red for those who like to be noticed!\nThis handbag lines up matching stitching that forms diamonds across the front. On the cord tied to the handle, gold beads and a charm make the whole thing sparkle, and a gold plate sits at the bottom to complete the look.\n---\nWhy you will love it\n• Bold red: A vivid, confident color, with stitching that matches the shade of the bag.\n• Diamonds on the front: A diamond pattern traced by the seams.\n• Golden cord: Two gold beads and a metallic charm attached to the cord tied on the handle.\n• Gold plate: A gold plate placed at the bottom, in the center of the front.\n\nStyle tip: With a black dress or a beige set, this red carries the whole outfit. For a birthday or a dinner, it works very well in place of a piece of jewelry.",
    },

  }),
  newProduct("sac-vernis-bordeaux", "bags", {
    name: { fr: "Sac à rabat vernis bordeaux, anse unique", en: "Burgundy patent flap bag, single handle" },
    subcategory: "handbags",
    audience: "women",
    price: 8000,
    priceOnRequest: false,
    images: ["/sac-vernis-bordeaux.jpg"],
    description: {
      fr: "Un bordeaux profond avec un éclat de miroir : le genre de sac qui se remarque dans la lumière !\nLe vernis très brillant couvre tout le rabat, bordé d’une fine surpiqûre en picots. Une anse unique, des anneaux dorés et quatre petits pieds dorés sous le sac complètent un style élégant et affirmé.\n---\nPourquoi vous allez l’adorer\n• Bordeaux verni : Une finition vernie très brillante qui renvoie la lumière sur tout le rabat.\n• Rabat à picots : Un rabat bordé d’une fine surpiqûre en picots, pour un joli détail de finition.\n• Anse et anneaux dorés : Une anse unique fixée par des anneaux dorés, avec des anneaux aussi visibles sur les côtés pour une bandoulière.\n• Pieds dorés : Quatre petits pieds dorés protègent le dessous du sac.\n\nConseil de style : Le bordeaux se marie avec le noir, le camel et le vert foncé. Pour une cérémonie ou un dîner, une tenue unie et ce sac brillant suffisent largement.",
      en: "A deep burgundy with a mirror shine: the kind of bag you notice in the light!\nThe very glossy patent finish covers the whole flap, edged with a fine picot stitch. A single handle, gold rings and four small gold feet under the bag complete a polished, confident style.\n---\nWhy you will love it\n• Patent burgundy: A very glossy patent finish that reflects the light across the whole flap.\n• Picot-stitched flap: A flap edged with a fine picot stitch, a nice finishing detail.\n• Handle and gold rings: A single handle attached with gold rings, with rings also visible on the sides for a shoulder strap.\n• Gold feet: Four small gold feet protect the bottom of the bag.\n\nStyle tip: Burgundy pairs well with black, camel and dark green. For a ceremony or a dinner, a plain outfit and this shiny bag are more than enough.",
    },

  }),
  newProduct("sac-vernis-terracotta", "bags", {
    name: { fr: "Sac à rabat vernis terracotta, anse unique", en: "Terracotta patent flap bag, single handle" },
    subcategory: "handbags",
    audience: "women",
    price: 8000,
    priceOnRequest: false,
    images: ["/sac-vernis-terracotta.jpg"],
    description: {
      fr: "Un terracotta chaud et brillant, à la couleur de la terre au coucher du soleil !\nLe rabat large, traversé d’une couture verticale au centre, donne à ce sac une silhouette nette et sans fioriture. L’anse arrondie est fine et la forme reste basse, allongée et compacte.\n---\nPourquoi vous allez l’adorer\n• Terracotta brillant : Une teinte chaude à la finition vernie brillante.\n• Rabat large : Un grand rabat avec une couture verticale au centre.\n• Anse fine : Une anse unique arrondie et fine, pour un port à la main.\n• Forme compacte : Une silhouette basse et allongée ; aucun fermoir n’apparaît sur la photo.\n\nConseil de style : Le terracotta s’accorde avec le blanc, l’écru et le denim bleu. Pour un déjeuner ou une balade de week-end, une robe légère et des sandales suffisent.",
      en: "A warm, glossy terracotta, the color of earth at sunset!\nThe wide flap, crossed by a vertical seam down the center, gives this bag a clean silhouette with no frills. The rounded handle is slim and the shape stays low, elongated and compact.\n---\nWhy you will love it\n• Glossy terracotta: A warm shade with a shiny patent finish.\n• Wide flap: A large flap with a vertical seam in the center.\n• Slim handle: A single rounded, slim handle for carrying by hand.\n• Compact shape: A low, elongated silhouette; no clasp appears in the photo.\n\nStyle tip: Terracotta goes with white, ecru and blue denim. For lunch or a weekend stroll, a light dress and sandals are all you need.",
    },

  }),
  newProduct("sac-cabas-monogramme-rose", "bags", {
    name: { fr: "Cabas à motifs de fleurs, touches roses, avec pochette", en: "Floral-pattern tote, pink accents, with pouch" },
    subcategory: "handbags",
    audience: "women",
    price: 8500,
    priceOnRequest: false,
    images: ["/sac-cabas-monogramme-rose.jpg"],
    description: {
      fr: "Un cabas qui raconte une histoire, avec ses fleurs, ses losanges et ses touches de rose !\nLe fond marron est entièrement couvert de motifs, rehaussé de rose vif et de grandes initiales blanches. Les anses claires se resserrent sur les côtés grâce à des liens ajustables, et le bord surpiqué de jaune ajoute une pointe de gaieté.\n---\nPourquoi vous allez l’adorer\n• Marron fleuri : Un fond marron couvert de fleurs et de losanges, avec des touches de rose vif.\n• Initiales blanches : De grandes initiales blanches qui signent le motif.\n• Côtés ajustables : Des liens sur les côtés qui permettent de resserrer le cabas à votre goût.\n• Anses claires et pochette : Des anses claires, un bord surpiqué de jaune, et une pochette zippée au même motif sur la photo (à confirmer si elle est incluse).\n\nConseil de style : Gardez la tenue simple : jean blanc, t-shirt uni et sandales, et le sac fait le style. Il est idéal pour les journées chargées, du campus au marché.",
      en: "A tote that tells a story, with its flowers, diamonds and touches of pink!\nThe brown background is entirely covered in patterns, highlighted with bright pink and large white initials. The light-colored handles gather in at the sides thanks to adjustable ties, and the yellow-stitched edge adds a hint of cheer.\n---\nWhy you will love it\n• Floral brown: A brown background covered in flowers and diamonds, with touches of bright pink.\n• White initials: Large white initials that sign the pattern.\n• Adjustable sides: Ties on the sides let you cinch the tote in to your liking.\n• Light handles and pouch: Light-colored handles, a yellow-stitched edge, and a zip pouch in the same pattern shown in the photo (to be confirmed whether it is included).\n\nStyle tip: Keep the outfit simple: white jeans, a plain tee and sandals, and let the bag make the style. It is ideal for busy days, from campus to the market.",
    },

  }),
  newProduct("sac-cabas-gaufre-cognac", "bags", {
    name: { fr: "Cabas cognac à motifs gaufrés, avec pochette", en: "Cognac tote with embossed pattern, with pouch" },
    subcategory: "handbags",
    audience: "women",
    price: 8500,
    priceOnRequest: false,
    images: ["/sac-cabas-gaufre-cognac.jpg"],
    description: {
      fr: "Un cabas cognac tout en nuances, où le motif se lit au toucher autant qu’à l’œil !\nLes fleurs et les initiales sont gaufrées en relief, sans changement de couleur, pour un effet discret et élégant. Les anses plus foncées, les liens latéraux et la petite étiquette reprennent un brun plus profond.\n---\nPourquoi vous allez l’adorer\n• Cognac en relief : Un motif de fleurs et d’initiales gaufré en relief, dans un cognac uni.\n• Anses plus foncées : Des anses d’un brun plus profond, qui contrastent avec le corps du cabas.\n• Liens et étiquette : Des liens latéraux et une petite étiquette fixée à l’anse.\n• Pochette à confirmer : Une pochette zippée à mousqueton est présentée devant ; son inclusion est à confirmer.\n\nConseil de style : Avec une chemise blanche et un pantalon crème, il donne un look chic mais détendu. Pour un week-end, un jean clair et des mocassins s’accordent très bien à ces bruns.",
      en: "A cognac tote full of nuance, where the pattern can be felt as much as seen!\nThe flowers and initials are embossed in relief, with no change of color, for a discreet and elegant effect. The darker handles, side ties and small tag pick up a deeper brown.\n---\nWhy you will love it\n• Embossed cognac: A pattern of flowers and initials embossed in relief, in a solid cognac.\n• Darker handles: Handles in a deeper brown, contrasting with the body of the tote.\n• Ties and tag: Side ties and a small tag attached to the handle.\n• Pouch to be confirmed: A zip pouch with a carabiner clip is shown in front; its inclusion is to be confirmed.\n\nStyle tip: With a white shirt and cream trousers, it makes a look that is chic yet relaxed. For the weekend, light jeans and loafers suit these browns very well.",
    },

  }),
  newProduct("sac-vernis-noir", "bags", {
    name: { fr: "Sac à rabat vernis noir, anse unique", en: "Black patent flap bag, single handle" },
    subcategory: "handbags",
    audience: "women",
    price: 8000,
    priceOnRequest: false,
    images: ["/sac-vernis-noir.jpg"],
    description: {
      fr: "Du noir qui brille, et tout le monde se retourne !\nCe sac à rabat mise tout sur l’éclat de sa finition vernie, sans fioriture. Une seule anse, un rabat replié et une couture au centre : la ligne est simple, mais l’effet est sûr. Vous cherchez une pièce noire qui ne passe pas inaperçue, la voilà.\n---\nPourquoi vous allez l’adorer\n• Noir verni éclatant : Une finition brillante qui capte la lumière et donne tout de suite du relief à votre tenue.\n• Forme large et souple : Le sac est large et se plisse légèrement sur les côtés, ce qui lui donne un côté décontracté et facile à vivre.\n• Détails soignés : Le rabat est replié avec une couture verticale au centre, et l’anse est fixée par des attaches dorées, seule touche de couleur.\n• Porté simple : Une anse unique, pour l’attraper vite et partir sans se poser de question.\n\nConseil de style : Misez sur le contraste avec une robe fluide ou un jean clair et laissez le vernis faire le travail. Une paire de boucles d’oreilles dorées reprendra les attaches de l’anse.",
      en: "Black that shines, and everyone turns to look!\nThis flap bag bets everything on its glossy patent finish, with no fuss. A single handle, a folded-over flap and a seam down the middle: the shape is simple, but the effect is guaranteed. If you want a black piece that doesn’t go unnoticed, this is it.\n---\nWhy you will love it\n• Shiny patent black: A glossy finish that catches the light and instantly adds depth to your outfit.\n• Wide, relaxed shape: The bag is wide and gently creases at the sides, giving it an easygoing, effortless feel.\n• Neat details: The flap is folded over with a vertical seam in the centre, and the handle is attached with gold-tone fittings, the only touch of colour.\n• Easy to carry: One single handle, so you can grab it quickly and go.\n\nStyle tip: Play on contrast with a flowing dress or light jeans and let the patent finish do the talking. A pair of gold earrings will echo the fittings on the handle.",
    },

  }),
  newProduct("sac-tisse-noir", "bags", {
    name: { fr: "Sac à main noir, panneau tissé et fermoir à fleur dorée", en: "Black handbag, woven panel and gold flower clasp" },
    subcategory: "handbags",
    audience: "women",
    price: 9000,
    priceOnRequest: false,
    images: ["/sac-tisse-noir.jpg"],
    description: {
      fr: "Un noir classique avec un petit supplément de caractère !\nSur ce sac à main, le panneau de devant tissé apporte de la matière, encadré par des côtés lisses. Le fermoir doré en forme de fleur à quatre pétales est le détail qui fait la différence. C’est le genre de sac noir que l’on sort sans hésiter, mais qui a sa personnalité.\n---\nPourquoi vous allez l’adorer\n• Noir et matière : Un panneau avant tissé, encadré de côtés lisses, pour un noir qui n’est pas plat.\n• Fermoir fleur dorée : Le rabat se ferme avec un fermoir doré à quatre pétales, joli détail bijou.\n• Anses bien fixées : Deux plaques à clous dorés tiennent les anses, pour un look structuré.\n• Bandoulière possible : Des anneaux dorés sur les côtés permettent d’ajouter une bandoulière si vous voulez les mains libres.\n\nConseil de style : Parfait avec un blazer et un pantalon bien coupé pour une journée chargée, ou avec une petite robe pour un dîner. Les ferrures dorées s’accordent très bien avec un bracelet ou une montre de la même teinte.",
      en: "A classic black with a little extra character!\nOn this handbag, the woven front panel adds texture, framed by smooth sides. The gold flower-shaped clasp with four petals is the detail that makes the difference. It’s the kind of black bag you grab without thinking twice, yet it has its own personality.\n---\nWhy you will love it\n• Black with texture: A woven front panel framed by smooth sides, so your black bag isn’t flat.\n• Gold flower clasp: The flap closes with a four-petal gold-tone clasp, a lovely jewellery-like detail.\n• Well-secured handles: Two gold-tone studded plates hold the handles for a structured look.\n• Strap option: Gold-tone rings on the sides let you add a shoulder strap when you want your hands free.\n\nStyle tip: Perfect with a blazer and tailored trousers for a busy day, or with a little dress for dinner. The gold hardware pairs nicely with a bracelet or watch in the same tone.",
    },

  }),
  newProduct("sac-tisse-violet", "bags", {
    name: { fr: "Sac à main violet, panneau tissé et fermoir doré et noir", en: "Purple handbag, woven panel and gold and black clasp" },
    subcategory: "handbags",
    audience: "women",
    price: 9000,
    priceOnRequest: false,
    images: ["/sac-tisse-violet.jpg"],
    description: {
      fr: "Osez le violet, tout en douceur !\nCe sac à main joue sur deux nuances : un violet tendre pour les côtés et les anses, et un panneau de devant tissé dans une teinte plus grisée. Le résultat est subtil, élégant et vraiment différent des sacs que l’on croise tous les jours.\n---\nPourquoi vous allez l’adorer\n• Violet tout doux : Côtés lisses et anses d’un violet délicat, avec un panneau avant tissé plus grisé.\n• Fermoir bicolore : Un fermoir mêlant or et noir qui ferme le rabat avec élégance.\n• Anses solides : Deux plaques à clous dorés tiennent les anses de chaque côté.\n• Bandoulière en option : Des anneaux dorés sur les flancs peuvent accueillir une bandoulière.\n\nConseil de style : Essayez-le avec une tenue blanche ou crème pour le laisser respirer, ou avec du gris et du noir pour un look plus sage. Il se marie aussi très bien à un foulard ou à un bijou doré.",
      en: "Dare to go purple, in the gentlest way!\nThis handbag plays on two shades: a soft purple for the sides and handles, and a woven front panel in a greyer tone. The result is subtle, elegant and truly different from the bags you see every day.\n---\nWhy you will love it\n• Soft purple: Smooth sides and handles in a delicate purple, with a greyer woven front panel.\n• Two-tone clasp: A clasp combining gold and black closes the flap with elegance.\n• Sturdy handles: Two gold-tone studded plates hold the handles on each side.\n• Optional strap: Gold-tone rings on the sides can take a shoulder strap.\n\nStyle tip: Try it with an all-white or cream outfit to let it stand out, or with grey and black for a calmer look. It also pairs well with a scarf or gold-tone jewellery.",
    },

  }),
  newProduct("sac-tisse-cognac", "bags", {
    name: { fr: "Sac à main cognac, panneau tissé et fermoir doré et noir", en: "Cognac handbag, woven panel and gold and black clasp" },
    subcategory: "handbags",
    audience: "women",
    price: 9000,
    priceOnRequest: false,
    images: ["/sac-tisse-cognac.jpg"],
    description: {
      fr: "Des tons chauds qui donnent envie de sortir !\nSur ce modèle, le tissage prend une teinte paille bien visible sur le devant, alors que les côtés et les anses sont d’un brun roux lisse. Le jeu entre les deux matières donne au sac beaucoup de relief et un charme un peu rétro.\n---\nPourquoi vous allez l’adorer\n• Cognac et brun roux : Un panneau tissé de ton paille chaud, entouré de côtés et d’anses brun roux.\n• Contraste de matières : Le tissé face au lisse crée du relief et donne du caractère au sac.\n• Fermoir soigné : Un fermoir doré à centre noir ferme le rabat, avec deux plaques à clous dorés pour les anses.\n• Anneaux latéraux : Des anneaux dorés sur les côtés permettent d’ajouter une bandoulière.\n\nConseil de style : Très joli avec du denim, une chemise blanche et des sandales pour un look simple mais travaillé. En saison fraîche, il ira bien avec du camel ou du vert olive.",
      en: "Warm tones that make you want to head out!\nOn this version, the weave takes on a visible straw shade at the front, while the sides and handles are in a smooth russet brown. The play between the two textures gives the bag plenty of depth and a slightly retro charm.\n---\nWhy you will love it\n• Cognac and russet brown: A woven panel in a warm straw tone, surrounded by russet brown sides and handles.\n• Contrasting textures: Woven against smooth creates depth and gives the bag character.\n• Neat clasp: A gold-tone clasp with a black centre closes the flap, with two gold-tone studded plates for the handles.\n• Side rings: Gold-tone rings on the sides let you add a shoulder strap.\n\nStyle tip: Lovely with denim, a white shirt and sandals for a look that is simple but put together. When it’s cooler, it goes nicely with camel or olive green.",
    },

  }),
  newProduct("sac-rond-cordon-marron", "bags", {
    name: { fr: "Sac rond marron à cordon, lettres dorées sur sangle", en: "Round brown drawstring bag, gold letters on strap" },
    subcategory: "handbags",
    audience: "women",
    price: 7800,
    priceOnRequest: false,
    images: ["/sac-rond-cordon-marron.jpg"],
    description: {
      fr: "Tout en rondeur, et ça lui va à ravir !\nCe sac rond marron change des formes habituelles avec ses deux lobes lisses réunis par une sangle ornée de lettres dorées. Le haut se resserre avec un cordon, et les trois anses vous laissent choisir comment le porter. Un marron profond et uni, qui va avec presque tout.\n---\nPourquoi vous allez l’adorer\n• Marron profond : Un coloris uni et riche, facile à associer au quotidien.\n• Forme ronde originale : Deux lobes arrondis et lisses séparés par une sangle centrale.\n• Lettres dorées : La sangle porte des lettres métalliques dorées, seul éclat de la façade.\n• Cordon et trois anses : Le haut se resserre par un cordon, entre deux anses principales et une petite anse au centre.\n\nConseil de style : Craquez pour un ensemble beige ou une robe ocre : on reste dans les tons de terre et le sac fait le reste. Avec un jean et un t-shirt blanc, il apporte juste ce qu’il faut de style.",
      en: "All curves, and it suits it perfectly!\nThis round brown bag breaks from the usual shapes, with two smooth lobes joined by a strap decorated with gold lettering. The top gathers with a drawstring, and the three handles let you choose how to carry it. A deep, solid brown that goes with almost everything.\n---\nWhy you will love it\n• Deep brown: A rich, solid colour that’s easy to match every day.\n• Original round shape: Two smooth, rounded lobes separated by a central strap.\n• Gold lettering: The strap carries gold-tone metal letters, the only sparkle on the front.\n• Drawstring and three handles: The top gathers with a drawstring, between two main handles and a small one in the centre.\n\nStyle tip: Go for a beige set or an ochre dress: you stay in earthy tones and the bag does the rest. With jeans and a white tee, it adds just the right amount of style.",
    },

  }),
  newProduct("sac-structure-gris", "bags", {
    name: { fr: "Sac à main gris, panneau tissé et fermoir doré et noir", en: "Grey handbag, woven panel and gold and black clasp" },
    subcategory: "handbags",
    audience: "women",
    price: 9000,
    priceOnRequest: false,
    images: ["/sac-structure-gris.jpg"],
    description: {
      fr: "Un gris taupe tout en nuances, discret mais raffiné !\nCe sac à main associe des côtés lisses et des anses en gris taupe à un panneau de devant tissé dans un gris plus clair. Pas de couleur criarde, juste une élégance posée qui se remarque par les détails.\n---\nPourquoi vous allez l’adorer\n• Gris taupe et gris clair : Côtés et anses lisses en taupe, panneau avant tissé plus clair.\n• Fermoir or et noir : Le rabat se ferme avec un fermoir doré et noir qui réchauffe l’ensemble.\n• Anses tenues par des plaques : Deux plaques à clous dorés fixent les anses solidement.\n• Bandoulière possible : Des anneaux dorés sur les côtés permettent d’ajouter une bandoulière.\n\nConseil de style : Un tailleur, une chemise bleu ciel ou une tenue monochrome grise : ce sac s’y fond avec classe. Pour un soir, ajoutez une touche de rouge à lèvres et laissez-le faire le reste.",
      en: "A taupe grey full of nuance, discreet but refined!\nThis handbag pairs smooth taupe-grey sides and handles with a woven front panel in a lighter grey. No loud colours, just a calm elegance that shows in the details.\n---\nWhy you will love it\n• Taupe and light grey: Smooth taupe sides and handles, with a lighter woven front panel.\n• Gold and black clasp: The flap closes with a gold-and-black clasp that warms up the whole look.\n• Plate-secured handles: Two gold-tone studded plates fix the handles firmly in place.\n• Strap option: Gold-tone rings on the sides let you add a shoulder strap.\n\nStyle tip: A suit, a sky-blue shirt or an all-grey outfit: this bag blends in with class. For an evening out, add a touch of red lipstick and let it do the rest.",
    },

  }),
  newProduct("sac-structure-beige", "bags", {
    name: { fr: "Sac à main beige, côtés tissés et ferrures argentées", en: "Beige handbag, woven sides and silver-tone fittings" },
    subcategory: "handbags",
    audience: "women",
    price: 8600,
    priceOnRequest: false,
    images: ["/sac-structure-beige.jpg"],
    description: {
      fr: "Clair, droit, élégant : le beige qui a de la tenue !\nCe sac à main a une silhouette structurée, avec une partie centrale lisse et deux côtés tissés, clairs et légèrement nacrés. Le lettrage doré posé sur le devant et les attaches argentées gravées d’épis lui donnent un côté soigné.\n---\nPourquoi vous allez l’adorer\n• Beige lumineux : Un centre et un dessus lisses, entourés de côtés tissés clairs et légèrement nacrés.\n• Forme droite et structurée : Une silhouette nette qui garde bien sa tenue.\n• Ferrures argentées gravées : Les attaches des anses sont en métal argenté gravé d’épis.\n• Lettrage doré : Le nom du modèle est posé en lettres dorées sur le devant.\n\nConseil de style : Superbe avec un ensemble en lin, une jupe midi ou un pantalon blanc pour un look d’été très frais. Un beige comme celui-ci aime les couleurs douces comme le rose poudré ou le vert d’eau.",
      en: "Light, upright, elegant: a beige with presence!\nThis handbag has a structured silhouette, with a smooth central section and two woven sides, light and slightly pearly. The gold lettering on the front and the silver-tone fittings engraved with ears of wheat give it a polished touch.\n---\nWhy you will love it\n• Bright beige: A smooth centre and top, framed by light, slightly pearly woven sides.\n• Straight, structured shape: A clean silhouette that holds its form well.\n• Engraved silver-tone fittings: The handle attachments are in silver-tone metal engraved with ears of wheat.\n• Gold lettering: The model name sits in gold letters on the front.\n\nStyle tip: Gorgeous with a linen set, a midi skirt or white trousers for a very fresh summer look. A beige like this loves soft colours such as powder pink or sea green.",
    },

  }),
  newProduct("sac-texture-bleu-ciel", "bags", {
    name: { fr: "Sac à main bleu ciel texturé, anses rigides", en: "Sky-blue textured handbag, rigid handles" },
    subcategory: "handbags",
    audience: "women",
    price: 8600,
    priceOnRequest: false,
    images: ["/sac-texture-bleu-ciel.jpg"],
    description: {
      fr: "Un bleu ciel franc pour mettre de la lumière dans votre journée !\nCe sac à main attire l’œil par sa surface texturée aux petits motifs en relief, que l’on a envie de toucher. Ses anses rigides et ses détails argentés lui donnent une allure nette et fraîche.\n---\nPourquoi vous allez l’adorer\n• Bleu ciel franc : Une couleur lumineuse et vive qui égaye toute la tenue.\n• Surface texturée : De petits motifs en relief sur toute la surface pour un effet original.\n• Anses rigides : Bordées de métal argenté, elles sont fixées de chaque côté.\n• Détails argentés : Deux anneaux argentés sur les flancs et une plaque argentée au centre.\n\nConseil de style : Il est génial avec du blanc, du denim ou un ensemble tout en bleu de différentes nuances. Pour une sortie entre amies, accordez-le à des bijoux argentés.",
      en: "A bright sky blue to bring some light into your day!\nThis handbag catches the eye with its textured surface of small raised patterns you’ll want to touch. Its rigid handles and silver-tone details give it a crisp, fresh look.\n---\nWhy you will love it\n• Bright sky blue: A vivid, luminous colour that lifts the whole outfit.\n• Textured surface: Small raised patterns all over for an original effect.\n• Rigid handles: Edged with silver-tone metal and attached on each side.\n• Silver-tone details: Two silver-tone rings on the sides and a silver-tone plate in the centre.\n\nStyle tip: It’s great with white, denim or an all-blue outfit in different shades. For a night out with friends, match it with silver-tone jewellery.",
    },

  }),
  newProduct("sac-rond-cordon-jaune", "bags", {
    name: { fr: "Sac rond jaune à cordon, lettres dorées sur sangle", en: "Round yellow drawstring bag, gold letters on strap" },
    subcategory: "handbags",
    audience: "women",
    price: 7800,
    priceOnRequest: false,
    images: ["/sac-rond-cordon-jaune.jpg"],
    description: {
      fr: "Un jaune qui fait sourire, même un jour de pluie !\nCe sac rond tout en jaune vif a deux lobes arrondis et une sangle centrale aux grandes lettres dorées. Le haut se resserre par un cordon, avec trois anses pour varier les façons de le porter. Une pièce joyeuse qui n’a pas peur de se montrer.\n---\nPourquoi vous allez l’adorer\n• Jaune vif uni : Un coloris éclatant qui donne instantanément de l’énergie à la tenue.\n• Forme à deux lobes : Une silhouette ronde et ludique, différente des sacs classiques.\n• Grandes lettres dorées : La sangle centrale porte de grandes lettres métalliques dorées.\n• Cordon et trois anses : Fermeture par cordon en haut, deux anses principales et une petite anse centrale.\n\nConseil de style : Osez-le avec un look tout simple, un t-shirt blanc et un jean, pour que le jaune soit la seule star. Il va aussi très bien avec du bleu marine ou du denim foncé.",
      en: "A yellow that makes you smile, even on a rainy day!\nThis round bag in bright yellow has two rounded lobes and a central strap with large gold lettering. The top gathers with a drawstring, with three handles to vary how you carry it. A cheerful piece that isn’t afraid to be seen.\n---\nWhy you will love it\n• Solid bright yellow: A vibrant colour that instantly adds energy to the outfit.\n• Two-lobe shape: A round, playful silhouette, different from classic bags.\n• Large gold lettering: The central strap carries large gold-tone metal letters.\n• Drawstring and three handles: Drawstring closure at the top, two main handles and a small central one.\n\nStyle tip: Dare to wear it with a very simple look, a white tee and jeans, so the yellow is the only star. It also goes very well with navy or dark denim.",
    },

  }),
  newProduct("sac-ensemble-bleu", "bags", {
    name: { fr: "Ensemble sac à main et petit sac, bleu marine et bleu clair", en: "Handbag and small bag set, navy and light blue" },
    subcategory: "handbags",
    audience: "women",
    price: 9000,
    priceOnRequest: false,
    images: ["/sac-ensemble-bleu.jpg"],
    description: {
      fr: "Du bleu en duo, pour celles qui aiment quand tout s’accorde !\nSur la photo, deux sacs assortis sont présentés ensemble : un sac à main à anses rondes et un petit sac à rabat. Ils jouent tous les deux sur le bleu marine, avec des côtés bleu clair et des bandes tissées qui apportent du relief.\n---\nPourquoi vous allez l’adorer\n• Duo bleu marine et bleu clair : Des côtés bleu clair qui adoucissent le bleu marine des deux sacs.\n• Bandes tissées : Des bandes tissées visibles sur les deux sacs, pour un effet travaillé.\n• Grand sac à anses rondes : Il se ferme avec un fermoir doré de forme ovale.\n• Petit sac à rabat : Il se ferme avec une sangle et une plaque dorée. Le contenu exact de l’ensemble est à confirmer, merci de nous contacter avant de commander.\n\nConseil de style : Le bleu marine se porte très bien avec du blanc, du beige ou du rose pâle. Pour une sortie chic, une robe claire et des chaussures dorées feront ressortir le fermoir.",
      en: "Blue in a pair, for those who love it when everything matches!\nIn the photo, two matching bags are shown together: a handbag with rounded handles and a small flap bag. Both play on navy blue, with light blue sides and woven bands that add texture.\n---\nWhy you will love it\n• Navy and light blue duo: Light blue sides soften the navy blue of both bags.\n• Woven bands: Woven bands visible on both bags for a crafted effect.\n• Large bag with rounded handles: It closes with an oval gold-tone clasp.\n• Small flap bag: It closes with a strap and a gold-tone plate. What exactly is included in the set is to be confirmed, so please contact us before ordering.\n\nStyle tip: Navy blue looks great with white, beige or pale pink. For a smart evening out, a light dress and gold-tone shoes will bring out the clasp.",
    },

  }),
  newProduct("sac-polochon-damier-noir-gris", "bags", {
    name: { fr: "Sac polochon à damier noir et gris", en: "Black and grey checkerboard duffel bag" },
    subcategory: "mens-bags",
    audience: "unisex",
    price: 9000,
    priceOnRequest: false,
    images: ["/sac-polochon-damier-noir-gris.jpg"],
    description: {
      fr: "Un polochon qui suit votre rythme, du matin au soir !\nAvec son damier noir et gris, ce sac reste sobre et se marie facilement avec toutes les tenues. Il se ferme par une fermeture éclair sur le dessus et se porte à la main grâce à ses deux anses noires. Les finitions argentées lui donnent juste ce qu’il faut de caractère.\n---\nPourquoi vous allez l’adorer\n• Damier noir et gris : Un motif sobre et masculin, facile à porter avec tout.\n• Forme polochon : Une silhouette allongée, pratique pour embarquer ses affaires.\n• Fermeture éclair sur le dessus : Pour fermer le sac simplement et garder vos affaires bien rangées.\n• Deux anses noires : Pour le porter à la main, avec des finitions argentées.\n\nConseil de style : Idéal pour la salle de sport, un week-end chez un ami ou les déplacements de la semaine. Avec un survêtement ou un jean et des baskets, il fait tout de suite l’affaire.",
      en: "A duffel bag that keeps up with your pace, from morning to night!\nWith its black and grey check pattern, this bag stays understated and goes easily with any outfit. It closes with a zip along the top and is carried by hand with its two black handles. The silver-tone finishes add just the right amount of character.\n---\nWhy you will love it\n• Black and grey check: A sober, easy-to-wear pattern that goes with everything.\n• Duffel shape: An elongated silhouette, handy for carrying your things.\n• Zip on top: A simple closure that keeps your things neatly in place.\n• Two black handles: For carrying by hand, with silver-tone finishes.\n\nStyle tip: Ideal for the gym, a weekend at a friend’s place or the week’s commutes. With a tracksuit, or jeans and sneakers, it does the job right away.",
    },

  }),
  newProduct("sac-rabat-rouge-fermoir-dore", "bags", {
    name: { fr: "Sac à main rouge à rabat, fermoir doré", en: "Red flap handbag with gold clasp" },
    subcategory: "handbags",
    audience: "women",
    price: 13500,
    priceOnRequest: false,
    images: ["/sac-rabat-rouge-fermoir-dore.jpg"],
    description: {
      fr: "Un rouge qui a de la voix, pour celles qui assument !\nCe sac à main structuré s’impose tout de suite, avec ses deux anses rondes et son rabat fermé par une sangle et un fermoir doré. Les surpiqûres apparentes soulignent chaque contour et donnent un aspect très soigné.\n---\nPourquoi vous allez l’adorer\n• Rouge franc : Une couleur intense qui attire le regard et réveille toutes les tenues.\n• Silhouette structurée : Une forme bien tenue qui garde sa ligne.\n• Rabat avec sangle : Le rabat se ferme avec une sangle et un fermoir doré.\n• Surpiqûres visibles : Des coutures apparentes soignées qui soulignent les contours, et deux anses rondes pour le porter à la main.\n\nConseil de style : Pour un look éclatant, associez-le à du noir ou du blanc et laissez le rouge parler. Une robe noire pour une soirée, ou un pantalon crème pour un déjeuner, et le tour est joué.",
      en: "A red with a voice of its own, for those who own it!\nThis structured handbag makes an instant impression, with two rounded handles and a flap closed by a strap and a gold-tone clasp. The visible topstitching outlines every edge and gives a very neat finish.\n---\nWhy you will love it\n• Bold red: An intense colour that draws the eye and wakes up any outfit.\n• Structured silhouette: A well-held shape that keeps its line.\n• Flap with strap: The flap closes with a strap and a gold-tone clasp.\n• Visible topstitching: Neat exposed stitching that outlines the edges, and two rounded handles for carrying it by hand.\n\nStyle tip: For a striking look, pair it with black or white and let the red speak. A black dress for an evening out, or cream trousers for lunch, and you’re set.",
    },

  }),
  newProduct("sac-rabat-beige-fermoir-dore", "bags", {
    name: { fr: "Sac à main beige à rabat, fermoir doré", en: "Beige flap handbag with gold clasp" },
    subcategory: "handbags",
    audience: "women",
    price: 13500,
    priceOnRequest: false,
    images: ["/sac-rabat-beige-fermoir-dore.jpg"],
    description: {
      fr: "Un beige chaud qui va avec tout, sans jamais être banal !\nCe sac à main structuré a deux anses rondes et un rabat fermé par une sangle et un fermoir doré. Ses surpiqûres soignées lui donnent une allure nette, parfaite pour celles qui aiment les tons doux.\n---\nPourquoi vous allez l’adorer\n• Beige chaud : Un coloris doux et lumineux, facile à associer avec le reste de la garde-robe.\n• Forme structurée : Une ligne bien tenue, élégante et nette.\n• Sangle et fermoir doré : Le rabat se ferme avec une sangle, rehaussée d’un fermoir doré.\n• Anses rondes et surpiqûres : Deux anses rondes pour le porter à la main, avec des coutures apparentes bien nettes.\n\nConseil de style : Il s’accorde très bien avec une tenue tout en blanc, ou avec du marron et du kaki pour un style naturel. Un trench léger et ce sac, et vous avez une allure de pro en un instant.",
      en: "A warm beige that goes with everything, without ever being dull!\nThis structured handbag has two rounded handles and a flap closed by a strap and a gold-tone clasp. Its neat topstitching gives it a clean look, perfect for anyone who loves soft tones.\n---\nWhy you will love it\n• Warm beige: A soft, bright colour that’s easy to match with the rest of your wardrobe.\n• Structured shape: A well-held line, elegant and crisp.\n• Strap and gold-tone clasp: The flap closes with a strap, set off by a gold-tone clasp.\n• Rounded handles and stitching: Two rounded handles for carrying by hand, with clean exposed seams.\n\nStyle tip: It goes very well with an all-white outfit, or with brown and khaki for a natural style. A light trench coat and this bag, and you look polished in an instant.",
    },

  }),
  newProduct("sac-rabat-vert-fermoir-dore", "bags", {
    name: { fr: "Sac à main vert émeraude à rabat, fermoir doré", en: "Emerald green flap handbag with gold clasp" },
    subcategory: "handbags",
    audience: "women",
    price: 13500,
    priceOnRequest: false,
    images: ["/sac-rabat-vert-fermoir-dore.jpg"],
    description: {
      fr: "Le vert émeraude, pour sortir du lot avec élégance !\nCe sac à main structuré a un vert vif et profond qui se remarque de loin. Il a deux anses rondes, un rabat fermé par une sangle et un fermoir doré, et des surpiqûres apparentes qui soulignent sa forme.\n---\nPourquoi vous allez l’adorer\n• Vert émeraude vif : Une couleur riche et lumineuse, qui donne de la présence à n’importe quelle tenue.\n• Allure structurée : Une silhouette nette et élégante.\n• Fermoir doré : Le rabat est fermé par une sangle et un fermoir doré qui contraste joliment avec le vert.\n• Finitions soignées : Surpiqûres apparentes et deux anses rondes pour le porter à la main.\n\nConseil de style : Essayez-le avec du noir, du blanc cassé ou du doré pour un contraste chic. Pour une cérémonie ou un dîner, une robe sobre suffit : le vert fait le reste.",
      en: "Emerald green, for standing out with elegance!\nThis structured handbag has a bright, deep green you can spot from afar. It has two rounded handles, a flap closed by a strap and a gold-tone clasp, and visible topstitching that outlines its shape.\n---\nWhy you will love it\n• Vivid emerald green: A rich, luminous colour that gives any outfit presence.\n• Structured look: A clean, elegant silhouette.\n• Gold-tone clasp: The flap is closed by a strap and a gold-tone clasp that contrasts nicely with the green.\n• Neat finishes: Visible topstitching and two rounded handles for carrying by hand.\n\nStyle tip: Try it with black, off-white or gold for a chic contrast. For a ceremony or dinner, a simple dress is enough: the green does the rest.",
    },

  }),
  newProduct("cosmetique-parfum-01-is", "cosmetics", {
    name: { fr: "iS, eau de parfum 100 ml", en: "iS, eau de parfum 100 ml" },
    subcategory: "perfume",
    audience: "women",
    price: 4500,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-01-is.jpg"],
    description: {
      fr: "Une touche de caractère, jusque dans les moindres détails.\n\nIl y a des parfums qu’on choisit simplement pour leur odeur. Et puis il y a ceux qui attirent aussi par leur présentation.\n\nAvec son flacon transparent aux reflets ambrés, son bouchon noir brillant et son coffret aux tons champagne, iS Eau de Parfum affiche une esthétique sobre et raffinée qui ne passe pas inaperçue.\n\nEn provenance directe du Maroc, cette eau de parfum de 100 ml est une belle découverte pour ceux qui apprécient les fragrances présentées avec élégance.\n\nÀ porter pour se faire plaisir ou à offrir à quelqu’un qui apprécie les belles attentions.\n\nLe détail qui fait la différence : un flacon qui trouve naturellement sa place dans votre collection.\n\nDisponible chez Le Coin ISM.",
      en: "A touch of character, right down to the smallest details.\n\nSome fragrances are chosen simply for their scent. And then there are those that also attract by their presentation.\n\nWith its clear bottle with amber reflections, its glossy black cap and its champagne-toned box, iS Eau de Parfum shows a simple, refined look that does not go unnoticed.\n\nComing directly from Morocco, this 100 ml eau de parfum is a lovely discovery for those who appreciate fragrances presented with elegance.\n\nTo wear for your own pleasure or to give to someone who appreciates thoughtful gestures.\n\nThe detail that makes the difference: a bottle that naturally finds its place in your collection.\n\nAvailable at Le Coin ISM.",
    },
    features: {
      fr: ["Eau de parfum, 100 ml", "Pour femme", "Une belle idée cadeau", "Importé directement du Maroc"],
      en: ["Eau de parfum, 100 ml", "For women", "A great gift idea", "Imported directly from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-02-ciiq-pour-homme", "cosmetics", {
    name: { fr: "CIIQ pour homme, eau de parfum 100 ml", en: "CIIQ for men, eau de parfum 100 ml" },
    subcategory: "perfume",
    audience: "men",
    price: 4000,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-02-ciiq-pour-homme.jpg"],
    description: {
      fr: "Laissez votre parfum parler pour vous.\n\nEt si votre parfum devenait l’un des détails qu’on remarque avant même que vous preniez la parole ?\n\nDécouvrez CIIQ, une collection de fragrances en provenance directe du Maroc, sélectionnée pour celles et ceux qui aiment prendre soin de leur image et apporter une touche de caractère à leur présence.\n\nQue vous soyez attiré par les senteurs élégantes, les notes séduisantes ou les fragrances qui affirment votre personnalité, CIIQ vous invite à trouver le parfum qui vous ressemble.\n\nPour vos journées à l’université, vos sorties ou vos occasions spéciales, trouvez une fragrance qui accompagne chaque moment avec style.\n\nPourquoi choisir CIIQ ?\n\n🇲🇦 Des fragrances provenant directement du Maroc.\n✨ Une collection pour affirmer votre personnalité.\n👔 Des parfums pour accompagner votre quotidien comme vos occasions spéciales.\n🎁 Une belle idée pour se faire plaisir ou offrir.\n\nVotre style mérite une signature. Et si c’était CIIQ ?\n\nDisponible chez Le Coin ISM. Découvrez la collection et passez votre commande !",
      en: "Let your fragrance speak for you.\n\nWhat if your fragrance became one of the details people notice before you even say a word?\n\nDiscover CIIQ, a collection of fragrances coming directly from Morocco, selected for those who like to take care of their image and add a touch of character to their presence.\n\nWhether you are drawn to elegant scents, seductive notes or fragrances that assert your personality, CIIQ invites you to find the fragrance that suits you.\n\nFor your days at university, your nights out or your special occasions, find a fragrance that goes with every moment in style.\n\nWhy choose CIIQ?\n\n🇲🇦 Fragrances coming directly from Morocco.\n✨ A collection to assert your personality.\n👔 Fragrances to go with your everyday life as well as your special occasions.\n🎁 A great idea to treat yourself or to give.\n\nYour style deserves a signature. What if it were CIIQ?\n\nAvailable at Le Coin ISM. Discover the collection and place your order!",
    },
    features: {
      fr: ["Eau de parfum pour homme, 100 ml", "Pour la fac, les sorties, les occasions spéciales", "Une belle idée cadeau", "Importé directement du Maroc"],
      en: ["Eau de parfum for men, 100 ml", "For university, nights out, special occasions", "A great gift idea", "Imported directly from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-03-voyager-deep-blue", "cosmetics", {
    name: { fr: "Voyager Deep Blue, eau de parfum 100 ml", en: "Voyager Deep Blue, eau de parfum 100 ml" },
    subcategory: "perfume",
    audience: "men",
    price: 5000,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-03-voyager-deep-blue.jpg"],
    description: {
      fr: "L’esprit libre. Le goût de l’aventure.\n\nInspiré par l’immensité de l’océan, VOYAGER DEEP BLUE évoque une sensation d’évasion et de liberté. Son flacon bleu lumineux, accompagné de son bouchon argenté et de son emblème voilier, annonce une fragrance au caractère affirmé.\n\nAvec son format généreux de 100 ml et son coffret aux nuances profondes de bleu, il apporte une touche de fraîcheur et de distinction à votre collection.\n\nEn provenance directe du Maroc, VOYAGER DEEP BLUE est une invitation à découvrir une nouvelle fragrance et à donner une autre dimension à votre routine.\n\nPour ceux qui aiment sortir du cadre et laisser leur propre empreinte.",
      en: "A free spirit. A taste for adventure.\n\nInspired by the vastness of the ocean, VOYAGER DEEP BLUE evokes a feeling of escape and freedom. Its bright blue bottle, with its silver cap and sailboat emblem, announces a fragrance with a strong character.\n\nWith its generous 100 ml size and its box in deep shades of blue, it brings a touch of freshness and distinction to your collection.\n\nComing directly from Morocco, VOYAGER DEEP BLUE is an invitation to discover a new fragrance and give your routine another dimension.\n\nFor those who like to step outside the lines and leave their own mark.",
    },
    features: {
      fr: ["Eau de parfum, 100 ml", "Univers marin et frais", "Pour homme", "Importé directement du Maroc"],
      en: ["Eau de parfum, 100 ml", "Fresh, ocean-inspired mood", "For men", "Imported directly from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-04-amazing-gold", "cosmetics", {
    name: { fr: "Amazing Gold, eau de parfum 100 ml", en: "Amazing Gold, eau de parfum 100 ml" },
    subcategory: "perfume",
    audience: "women",
    price: 4500,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-04-amazing-gold.jpg"],
    description: {
      fr: "L’éclat d’une présence qui ne passe pas inaperçue.\n\nCertaines fragrances ont ce petit quelque chose qui attire l’attention. AMAZING GOLD s’inscrit dans cet univers où le charme et l’élégance occupent le premier plan.\n\nAvec son nom évocateur, il invite à découvrir une fragrance qui accompagne les moments où l’on souhaite se sentir particulièrement bien dans sa peau. Un choix qui apporte une touche de raffinement à votre collection et qui se prête aussi parfaitement à une belle attention.\n\nSélectionné et acheminé directement depuis le Maroc, AMAZING GOLD rejoint notre collection de fragrances disponibles chez Le Coin ISM.\n\nParce que les belles attentions commencent parfois par un parfum.\n\nDécouvrez AMAZING GOLD chez Le Coin ISM et laissez-vous tenter.",
      en: "The glow of a presence that does not go unnoticed.\n\nSome fragrances have that little something that draws attention. AMAZING GOLD belongs to a world where charm and elegance come first.\n\nWith its evocative name, it invites you to discover a fragrance that goes with the moments when you want to feel particularly good in your own skin. A choice that adds a touch of refinement to your collection and is also perfect for a thoughtful gift.\n\nSelected and shipped directly from Morocco, AMAZING GOLD joins our collection of fragrances available at Le Coin ISM.\n\nBecause thoughtful gestures sometimes start with a fragrance.\n\nDiscover AMAZING GOLD at Le Coin ISM and let yourself be tempted.",
    },
    features: {
      fr: ["Eau de parfum, 100 ml", "Pour femme", "Idée cadeau", "Importé directement du Maroc"],
      en: ["Eau de parfum, 100 ml", "For women", "Gift idea", "Imported directly from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-05-stunner-pour-femme", "cosmetics", {
    name: { fr: "Stunner pour femme, eau de parfum", en: "Stunner for women, eau de parfum" },
    subcategory: "perfume",
    audience: "women",
    price: 5500,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-05-stunner-pour-femme.jpg"],
    description: {
      fr: "Une douceur qui attire. Un charme qui reste.\n\nUne première impression délicate, un charme naturellement affirmé… STUNNER POUR FEMME célèbre une féminité à la fois douce et expressive.\n\nSa composition s’ouvre sur des notes fruitées de fraise, accompagnées de la délicatesse du lys et de la tubéreuse. En cœur, le jasmin et la mandarine apportent une touche florale et lumineuse. Enfin, la vanille et le musc viennent envelopper l’ensemble d’une douceur chaleureuse.\n\nUne fragrance pour celles qui aiment les parfums féminins aux accents floraux et fruités, avec une finition douce et enveloppante.\n\nSélectionné et acheminé directement depuis le Maroc, STUNNER POUR FEMME rejoint la collection de fragrances de Le Coin ISM.",
      en: "A softness that attracts. A charm that stays.\n\nA delicate first impression, a naturally confident charm… STUNNER POUR FEMME celebrates a femininity that is both soft and expressive.\n\nIts composition opens with fruity notes of strawberry, along with the delicacy of lily and tuberose. In the heart, jasmine and mandarin bring a floral, luminous touch. Finally, vanilla and musk wrap everything in a warm softness.\n\nA fragrance for those who love feminine perfumes with floral and fruity accents, with a soft, enveloping finish.\n\nSelected and shipped directly from Morocco, STUNNER POUR FEMME joins the Le Coin ISM fragrance collection.",
    },
    features: {
      fr: ["Notes annoncées : fraise, lys, tubéreuse, jasmin, mandarine, vanille, musc", "Floral et fruité, finition douce", "Pour femme", "Importé directement du Maroc"],
      en: ["Announced notes: strawberry, lily, tuberose, jasmine, mandarin, vanilla, musk", "Floral and fruity, soft finish", "For women", "Imported directly from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-06-black-addiction", "cosmetics", {
    name: { fr: "Black Addiction, eau de parfum 80 ml", en: "Black Addiction, eau de parfum 80 ml" },
    subcategory: "perfume",
    audience: "women",
    price: 4500,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-06-black-addiction.jpg"],
    description: {
      fr: "Le genre de parfum qui ne passe pas inaperçu.\n\nIl y a des fragrances qui attirent l’attention, et d’autres qui éveillent la curiosité. BLACK ADDICTION joue sur cette frontière entre mystère et séduction.\n\nAvec son identité sombre et son nom évocateur, il s’adresse à celles et ceux qui aiment les parfums au caractère affirmé et qui souhaitent ajouter une touche d’audace à leur style.\n\nSon format de 80 ml en fait un compagnon idéal pour intégrer une nouvelle fragrance à votre collection ou faire plaisir à quelqu’un qui apprécie les belles découvertes.\n\nEn provenance directe du Maroc.\n\nBLACK ADDICTION : laissez le mystère faire le reste.",
      en: "The kind of fragrance that does not go unnoticed.\n\nSome fragrances draw attention, and others awaken curiosity. BLACK ADDICTION plays on that line between mystery and seduction.\n\nWith its dark identity and evocative name, it is for those who like fragrances with a strong character and want to add a touch of boldness to their style.\n\nIts 80 ml size makes it an ideal companion to add a new fragrance to your collection or to please someone who appreciates lovely discoveries.\n\nComing directly from Morocco.\n\nBLACK ADDICTION: let the mystery do the rest.",
    },
    features: {
      fr: ["Eau de parfum, 80 ml", "Mystérieux et audacieux", "Pour femme", "Importé directement du Maroc"],
      en: ["Eau de parfum, 80 ml", "Mysterious and bold", "For women", "Imported directly from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-07-sexy-sexy", "cosmetics", {
    name: { fr: "Sexy Sexy, eau de parfum", en: "Sexy Sexy, eau de parfum" },
    subcategory: "perfume",
    audience: "women",
    price: 5500,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-07-sexy-sexy.jpg"],
    description: {
      fr: "Et si le premier pas était un parfum ?\n\nUn dîner qui s’éternise, un sourire échangé, une proximité qui ne laisse personne indifférent… SEXY SEXY trouve sa place dans ces instants où la séduction se joue dans les petits détails.\n\nPensé pour accompagner les moments de flirt et les soirées où l’on soigne particulièrement son allure, ce parfum apporte une dimension supplémentaire à votre préparation.\n\nSon nom ne laisse pas beaucoup de place au doute : ici, on célèbre le charme, l’audace et le plaisir de séduire.\n\nTout droit venu du Maroc.\n\nSEXY SEXY – Parce que certaines histoires commencent par une attirance.\n\nDisponible chez Le Coin ISM.",
      en: "What if the first move was a fragrance?\n\nA dinner that drags on, a smile exchanged, a closeness that leaves no one indifferent… SEXY SEXY finds its place in those moments when seduction plays out in the little details.\n\nDesigned to go with moments of flirting and evenings when you take particular care of your look, this fragrance adds an extra dimension to your getting ready.\n\nIts name leaves little room for doubt: here, we celebrate charm, boldness and the pleasure of seduction.\n\nStraight from Morocco.\n\nSEXY SEXY – Because some stories begin with an attraction.\n\nAvailable at Le Coin ISM.",
    },
    features: {
      fr: ["Eau de parfum", "Pour les soirées et les rendez-vous", "Pour femme", "Importé directement du Maroc"],
      en: ["Eau de parfum", "For evenings and dates", "For women", "Imported directly from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-08-royal-sweety-in-love", "cosmetics", {
    name: { fr: "Royal Sweety In Love, Y.M.LOVE, eau de parfum 100 ml", en: "Royal Sweety In Love, Y.M.LOVE, eau de parfum 100 ml" },
    subcategory: "perfume",
    audience: "women",
    price: 5700,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-08-royal-sweety-in-love.jpg"],
    description: {
      fr: "Le petit plaisir qui fait toujours son effet.\n\nEnvie de découvrir une nouvelle fragrance ou de faire plaisir à quelqu’un ? ROYAL SWEETY IN LOVE est une belle option à ajouter à votre collection.\n\nAvec son format généreux de 100 ml, ce parfum signé Y.M.LOVE est proposé dans un univers qui célèbre la douceur et le romantisme. Son nom et sa présentation en font également une idée cadeau intéressante pour une personne qui compte.\n\nImporté directement du Maroc et disponible chez Le Coin ISM.",
      en: "The little treat that always works.\n\nWant to discover a new fragrance or please someone? ROYAL SWEETY IN LOVE is a great option to add to your collection.\n\nWith its generous 100 ml size, this fragrance by Y.M.LOVE comes in a world that celebrates softness and romance. Its name and presentation also make it an interesting gift idea for someone who matters.\n\nImported directly from Morocco and available at Le Coin ISM.",
    },
    features: {
      fr: ["Eau de parfum, 100 ml", "Douceur et romantisme", "Pour femme, belle idée cadeau", "Importé directement du Maroc"],
      en: ["Eau de parfum, 100 ml", "Softness and romance", "For women, a lovely gift idea", "Imported directly from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-09-stronger-with-you", "cosmetics", {
    name: { fr: "Stronger With You, eau de toilette 100 ml", en: "Stronger With You, eau de toilette 100 ml" },
    subcategory: "edt",
    audience: "men",
    price: 6000,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-09-stronger-with-you.jpg"],
    description: {
      fr: "Une signature masculine au charme addictif.\n\nImaginez une alliance entre la chaleur des épices, la douceur d’une vanille enveloppante et le caractère gourmand de la châtaigne. C’est tout l’univers de STRONGER WITH YOU.\n\nCette fragrance joue sur les contrastes : une ouverture épicée, un cœur aromatique de lavande et de sauge, puis un fond chaleureux et vanillé qui lui donne toute sa personnalité.\n\nC’est le genre de parfum qui trouve naturellement sa place lors d’un dîner, d’un rendez-vous ou d’une soirée où l’on veut soigner chaque détail de son apparence.\n\nSon profil olfactif :\n\n• Tête : cardamome, poivre rose et feuilles de violette.\n• Cœur : lavande et sauge.\n• Fond : vanille et accord de châtaigne.\n\nImporté directement du Maroc.\nSTRONGER WITH YOU : la chaleur d’un parfum, le caractère d’un homme.\n\nDisponible chez Le Coin ISM.\n\nFaites-vous plaisir ou offrez une belle attention.",
      en: "A masculine signature with addictive charm.\n\nImagine an alliance of the warmth of spices, the softness of an enveloping vanilla and the gourmand character of chestnut. That is the whole world of STRONGER WITH YOU.\n\nThis fragrance plays on contrasts: a spicy opening, an aromatic heart of lavender and sage, then a warm, vanilla base that gives it all its personality.\n\nIt is the kind of fragrance that naturally finds its place at a dinner, on a date or at an evening where you want to take care of every detail of your appearance.\n\nIts scent profile:\n\n• Top: cardamom, pink pepper and violet leaves.\n• Heart: lavender and sage.\n• Base: vanilla and chestnut accord.\n\nImported directly from Morocco.\nSTRONGER WITH YOU: the warmth of a fragrance, the character of a man.\n\nAvailable at Le Coin ISM.\n\nTreat yourself or give a thoughtful gift.",
    },
    features: {
      fr: ["Eau de toilette, 100 ml", "Notes annoncées : cardamome, poivre rose, lavande, sauge, vanille, châtaigne", "Pour homme", "Importé directement du Maroc"],
      en: ["Eau de toilette, 100 ml", "Announced notes: cardamom, pink pepper, lavender, sage, vanilla, chestnut", "For men", "Imported directly from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-10-diamant-ambre", "cosmetics", {
    name: { fr: "Diamant Ambré, eau de parfum", en: "Amber Diamond, eau de parfum" },
    subcategory: "perfume",
    audience: "women",
    price: 4000,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-10-diamant-ambre.jpg"],
    description: {
      fr: "Un parfum pour les soirées où l’on a envie de laisser une trace. Diamant Ambré est pensé pour celles qui aiment avoir de la présence, se sentir sûres d’elles et être remarquées. À s’offrir pour une occasion qui compte, ou à offrir à quelqu’un qui aime les belles choses. Importé directement du Maroc.",
      en: "A fragrance for the evenings when you want to leave a trace. Amber Diamond is made for women who like having presence, feeling confident and being noticed. To treat yourself for an occasion that matters, or to give to someone who loves beautiful things. Imported directly from Morocco.",
    },
    features: {
      fr: ["Eau de parfum", "Pour les soirées et les grandes occasions", "Pour femme, idée cadeau", "Importé directement du Maroc"],
      en: ["Eau de parfum", "For evenings and big occasions", "For women, gift idea", "Imported directly from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-11-shining-rock", "cosmetics", {
    name: { fr: "Shining Rock, eau de parfum", en: "Shining Rock, eau de parfum" },
    subcategory: "perfume",
    audience: "unisex",
    price: 4500,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-11-shining-rock.jpg"],
    description: {
      fr: "Two styles. One fragrance. Endless possibilities.\n\nEt si votre prochain parfum n’avait pas besoin d’être classé ?\n\nSHINING ROCK casse les codes traditionnels de la parfumerie avec son positionnement unisexe. Pensé pour les amateurs de fragrances qui aiment choisir selon leurs préférences plutôt que selon une étiquette, il s’adresse aussi bien aux hommes qu’aux femmes.\n\nSon véritable atout ? La liberté de se l’approprier. Portez-le comme votre parfum personnel ou partagez-le avec quelqu’un qui apprécie le même univers olfactif.\n\nUne proposition originale pour ceux qui recherchent autre chose que les fragrances conventionnelles.\n\nImporté directement du Maroc, SHINING ROCK rejoint la sélection exclusive de Le Coin ISM.\n\nSHINING ROCK — Not his. Not hers. Just yours.\n\nCommandez dès maintenant chez Le Coin ISM.",
      en: "Two styles. One fragrance. Endless possibilities.\n\nWhat if your next fragrance did not need to be labelled?\n\nSHINING ROCK breaks the traditional codes of perfumery with its unisex positioning. Designed for fragrance lovers who like to choose by preference rather than by label, it is for men and women alike.\n\nIts real strength? The freedom to make it your own. Wear it as your personal fragrance or share it with someone who enjoys the same scent world.\n\nAn original proposal for those looking for something other than conventional fragrances.\n\nImported directly from Morocco, SHINING ROCK joins the exclusive selection at Le Coin ISM.\n\nSHINING ROCK — Not his. Not hers. Just yours.\n\nOrder now at Le Coin ISM.",
    },
    features: {
      fr: ["Eau de parfum", "Unisexe : pour lui, pour elle, pour vous", "À porter ou à partager", "Importé directement du Maroc"],
      en: ["Eau de parfum", "Unisex: for him, for her, for you", "To wear or to share", "Imported directly from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-12-halle-women", "cosmetics", {
    name: { fr: "Halle Women, eau de parfum 100 ml", en: "Halle Women, eau de parfum 100 ml" },
    subcategory: "perfume",
    audience: "women",
    price: 4000,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-12-halle-women.jpg"],
    description: {
      fr: "Not just a fragrance. A statement of femininity.\n\nCertaines fragrances séduisent par leur douceur. D’autres captivent par la richesse de leur composition. HALLE WOMEN réunit ces deux univers dans une création florale aux accents orientaux.\n\nSon ouverture délicate laisse place à un bouquet floral généreux où le magnolia, la tubéreuse et le muguet composent un accord élégant. En profondeur, le santal, la vanille, l’encens et la myrrhe apportent une dimension chaleureuse et enveloppante.\n\nCe qui distingue HALLE WOMEN, c’est justement ce contraste : la délicatesse des fleurs rencontre la profondeur des matières orientales.\n\nAvec son format de 100 ml, c’est une belle pièce à intégrer à une collection de parfums ou à choisir pour celles qui apprécient les compositions florales avec davantage de caractère.\n\nPROFIL OLFACTIF\n\n• Famille : floral oriental.\n• Notes de tête : violette, accords marins et feuille de bananier.\n• Notes de cœur : magnolia, tubéreuse, muguet et poivre.\n• Notes de fond : santal, vanille, encens et myrrhe.\n\nImporté directement du Maroc.\n\nHALLE WOMEN — Floral in expression. Oriental in character.",
      en: "Not just a fragrance. A statement of femininity.\n\nSome fragrances seduce by their softness. Others captivate by the richness of their composition. HALLE WOMEN brings these two worlds together in a floral creation with oriental accents.\n\nIts delicate opening gives way to a generous floral bouquet where magnolia, tuberose and lily of the valley form an elegant accord. In the depths, sandalwood, vanilla, incense and myrrh bring a warm, enveloping dimension.\n\nWhat sets HALLE WOMEN apart is precisely this contrast: the delicacy of flowers meets the depth of oriental materials.\n\nWith its 100 ml size, it is a lovely piece to add to a perfume collection or to choose for those who appreciate floral compositions with more character.\n\nSCENT PROFILE\n\n• Family: oriental floral.\n• Top notes: violet, marine accords and banana leaf.\n• Heart notes: magnolia, tuberose, lily of the valley and pepper.\n• Base notes: sandalwood, vanilla, incense and myrrh.\n\nImported directly from Morocco.\n\nHALLE WOMEN — Floral in expression. Oriental in character.",
    },
    features: {
      fr: ["Eau de parfum, 100 ml", "Floral oriental", "Notes annoncées : violette, magnolia, tubéreuse, muguet, santal, vanille, encens, myrrhe", "Importé directement du Maroc"],
      en: ["Eau de parfum, 100 ml", "Oriental floral", "Announced notes: violet, magnolia, tuberose, lily of the valley, sandalwood, vanilla, incense, myrrh", "Imported directly from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-13-spark", "cosmetics", {
    name: { fr: "Spark, eau de parfum 100 ml", en: "Spark, eau de parfum 100 ml" },
    subcategory: "perfume",
    audience: "women",
    price: 5000,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-13-spark.jpg"],
    description: {
      fr: "Your next favourite fragrance is waiting.\n\nNe vous contentez pas d’un parfum de plus dans votre collection. Faites place à une nouvelle découverte.\n\nSPARK est une invitation à renouveler votre univers olfactif et à choisir une fragrance qui mérite sa place dans votre quotidien. Que ce soit pour compléter votre collection ou trouver votre prochain coup de cœur, c’est l’occasion de découvrir quelque chose de nouveau.\n\nDirectement importé du Maroc, SPARK rejoint la sélection de parfums proposée par Le Coin ISM.\n\nLes belles découvertes n’attendent pas. Ajoutez SPARK à votre collection dès maintenant.\n\nSPARK — Make your choice. Make it count.\n\nDisponible chez Le Coin ISM. Commandez le vôtre.",
      en: "Your next favourite fragrance is waiting.\n\nDo not settle for one more perfume in your collection. Make room for a new discovery.\n\nSPARK is an invitation to renew your world of scents and to choose a fragrance that deserves its place in your daily life. Whether to complete your collection or to find your next favourite, it is the chance to discover something new.\n\nImported directly from Morocco, SPARK joins the fragrance selection offered by Le Coin ISM.\n\nLovely discoveries do not wait. Add SPARK to your collection now.\n\nSPARK — Make your choice. Make it count.\n\nAvailable at Le Coin ISM. Order yours.",
    },
    features: {
      fr: ["Eau de parfum, 100 ml", "Pour femme", "Pour renouveler sa collection", "Importé directement du Maroc"],
      en: ["Eau de parfum, 100 ml", "For women", "To refresh your collection", "Imported directly from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-14-legende-eternelle", "cosmetics", {
    name: { fr: "Légende Éternelle, eau de toilette 100 ml", en: "Eternal Legend, eau de toilette 100 ml" },
    subcategory: "edt",
    audience: "men",
    price: 4500,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-14-legende-eternelle.jpg"],
    description: {
      fr: "Le caractère d’une fragrance, la subtilité en plus.\n\nLégende Iternelle développe une signature olfactive autour d’un contraste particulièrement intéressant : la fraîcheur des agrumes rencontre la douceur des nuances florales, avant de laisser place à une dimension plus profonde, aux accents terreux.\n\nCet équilibre donne à la fragrance une personnalité à la fois fraîche, délicate et affirmée. Elle s’adresse à ceux qui apprécient les compositions nuancées, capables d’apporter une touche parfumée aussi bien au quotidien que lors d’une occasion particulière.\n\nSon flacon noir, aux lignes sobres, prolonge visuellement cette identité. Une présentation élégante qui trouve naturellement sa place dans une collection de parfums.\n\nLes détails du produit\n\n• Signature olfactive : florale, fraîche et légèrement terreuse.\n• Accord dominant : douceur florale relevée par des nuances d’agrumes.\n• Format : vaporisateur naturel de 90 ml.\n• Concentration : Eau de Toilette.\n• Provenance commerciale : sélectionné au Maroc.\n\nLégende Iternelle : une composition qui joue sur l’équilibre plutôt que sur l’excès.",
      en: "The character of a fragrance, with added subtlety.\n\nLégende Iternelle develops an olfactory signature around a particularly interesting contrast: the freshness of citrus meets the softness of floral nuances, before giving way to a deeper dimension with earthy accents.\n\nThis balance gives the fragrance a personality that is at once fresh, delicate and assertive. It is for those who appreciate nuanced compositions, able to add a scented touch in everyday life as well as on a special occasion.\n\nIts black bottle, with its clean lines, extends this identity visually. An elegant presentation that naturally finds its place in a perfume collection.\n\nProduct details\n\n• Scent signature: floral, fresh and slightly earthy.\n• Dominant accord: floral softness lifted by nuances of citrus.\n• Size: 90 ml natural spray.\n• Concentration: Eau de Toilette.\n• Commercial origin: selected in Morocco.\n\nLégende Iternelle: a composition that plays on balance rather than excess.",
    },
    features: {
      fr: ["Eau de toilette, 100 ml", "Frais, floral, légèrement terreux", "Pour homme", "Sélectionné au Maroc"],
      en: ["Eau de toilette, 100 ml", "Fresh, floral, slightly earthy", "For men", "Selected in Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-15-catch-ss", "cosmetics", {
    name: { fr: "Catch SS, Lovali, eau de parfum 100 ml", en: "Catch SS, Lovali, eau de parfum 100 ml" },
    subcategory: "perfume",
    audience: "women",
    price: 4000,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-15-catch-ss.jpg"],
    description: {
      fr: "Un parfum féminin, doux et fruité, avec cette petite touche florale qui fait toute la différence.\n\nCatch SS de Lovali est une fragrance pensée pour celles qui aiment sentir bon et garder leur parfum avec elles tout au long de la journée. Son mélange fruité et floral apporte une senteur agréable, avec une douceur qui se remarque sans être excessive.\n\nMais son véritable atout, c’est aussi sa tenue : sa fragrance peut rester perceptible pendant plus de 24 heures, selon la peau et les conditions d’utilisation. Quelques vaporisations suffisent pour profiter de son parfum et retrouver son odeur au fil des heures.\n\nPrésenté dans un joli flacon rose de 100 ml, Catch SS est une belle option pour se faire plaisir ou offrir un parfum féminin à quelqu’un.\n\nLes informations essentielles\n\n• Marque : Lovali\n• Type : Eau de Parfum\n• Contenance : 100 ml\n• Univers olfactif : floral, fruité et sucré\n• Provenance : sélectionné et importé du Maroc\n\nCatch SS – Lovali. Un parfum qu’on aime porter, et qu’on prend plaisir à retrouver.",
      en: "A feminine fragrance, soft and fruity, with that little floral touch that makes all the difference.\n\nCatch SS by Lovali is a fragrance designed for women who like to smell good and keep their perfume with them throughout the day. Its fruity and floral blend brings a pleasant scent, with a softness that is noticed without being excessive.\n\nBut its real strength is also its staying power: its fragrance can remain perceptible for more than 24 hours, depending on skin and conditions of use. A few sprays are enough to enjoy its scent and find its smell again as the hours go by.\n\nPresented in a pretty pink 100 ml bottle, Catch SS is a great option to treat yourself or to give a feminine fragrance to someone.\n\nThe essentials\n\n• Brand: Lovali\n• Type: Eau de Parfum\n• Size: 100 ml\n• Scent world: floral, fruity and sweet\n• Origin: selected and imported from Morocco\n\nCatch SS – Lovali. A fragrance you love to wear, and enjoy finding again.",
    },
    features: {
      fr: ["Marque : Lovali", "Eau de parfum, 100 ml", "Floral, fruité, sucré", "Tenue annoncée : plus de 24 h"],
      en: ["Brand: Lovali", "Eau de parfum, 100 ml", "Floral, fruity, sweet", "Announced hold: over 24 h"],
    },
  }),
  newProduct("cosmetique-parfum-16-black-addiction-glitter", "cosmetics", {
    name: { fr: "Black Addiction Glitter, Lovali, eau de parfum 80 ml", en: "Black Addiction Glitter, Lovali, eau de parfum 80 ml" },
    subcategory: "perfume",
    audience: "women",
    price: 5000,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-16-black-addiction-glitter.jpg"],
    description: {
      fr: "Envie d’un parfum qui ne passe pas inaperçu ? Black Addiction Glitter de Lovali associe des notes fruitées et florales à une composition gourmande où le café, la guimauve et la vanille apportent douceur et profondeur.\n\nC’est une fragrance qui se distingue par son côté chaleureux et sensuel. Elle convient particulièrement aux femmes qui aiment les parfums gourmands, avec une présence affirmée, aussi agréables à porter lors d’une sortie que pour une occasion spéciale.\n\nEt pour celles qui accordent beaucoup d’importance à la tenue, Black Addiction Glitter annonce une persistance pouvant dépasser les 24 heures, selon la peau et les conditions d’utilisation.\n\nLes détails du parfum :\n\n• Une signature olfactive gourmande, fruitée et chaleureuse.\n• Des accords de café, de guimauve et de vanille.\n• Une tenue annoncée de plus de 24 heures.\n• Eau de Parfum – 80 ml.\n• Produit approvisionné depuis le Maroc.\n\nBlack Addiction Glitter : une fragrance gourmande qui mérite sa place dans votre collection.",
      en: "Want a fragrance that does not go unnoticed? Black Addiction Glitter by Lovali combines fruity and floral notes with a gourmand composition where coffee, marshmallow and vanilla bring softness and depth.\n\nIt is a fragrance that stands out for its warm, sensual side. It is particularly suited to women who like gourmand fragrances, with a strong presence, as pleasant to wear on a night out as for a special occasion.\n\nAnd for those who care a lot about staying power, Black Addiction Glitter announces a persistence that can exceed 24 hours, depending on skin and conditions of use.\n\nThe fragrance details:\n\n• A gourmand, fruity and warm scent signature.\n• Accords of coffee, marshmallow and vanilla.\n• Announced staying power of over 24 hours.\n• Eau de Parfum – 80 ml.\n• Product sourced from Morocco.\n\nBlack Addiction Glitter: a gourmand fragrance that deserves its place in your collection.",
    },
    features: {
      fr: ["Marque : Lovali", "Eau de parfum, 80 ml", "Gourmand : café, guimauve, vanille", "Tenue annoncée : plus de 24 h"],
      en: ["Brand: Lovali", "Eau de parfum, 80 ml", "Gourmand: coffee, marshmallow, vanilla", "Announced hold: over 24 h"],
    },
  }),
  newProduct("cosmetique-parfum-17-v-v-love", "cosmetics", {
    name: { fr: "V.V.LOVE, coffret eau de parfum et crème corps", en: "V.V.LOVE, eau de parfum and body cream set" },
    subcategory: "perfume",
    audience: "women",
    price: 6000,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-17-v-v-love.jpg"],
    description: {
      fr: "Deux gestes, une même signature parfumée.\n\nPourquoi se contenter de se parfumer quand on peut prolonger ce plaisir avec un soin pour le corps assorti ?\n\nCe coffret V.V.LOVE réunit une Eau de Parfum et une Body Cream dans un ensemble pensé pour celles qui aiment prendre soin d’elles tout en portant une fragrance qui leur ressemble.\n\nLa crème parfumée s’applique sur la peau pour lui apporter douceur et hydratation, tandis que l’Eau de Parfum vient compléter la routine avec une touche parfumée supplémentaire.\n\nUtilisés ensemble, les deux produits permettent de superposer les gestes parfumés et de profiter pleinement de leur univers olfactif.\n\nSélectionné et approvisionné depuis le Maroc, ce coffret est aussi une belle idée cadeau pour faire plaisir sans avoir à chercher deux produits séparément.\n\nLe coffret contient :\n\n• 1 Eau de Parfum V.V.LOVE.\n• 1 Body Cream parfumée.\n\nV.V.LOVE : votre parfum, votre rituel, votre signature.",
      en: "Two gestures, one fragrant signature.\n\nWhy settle for wearing perfume when you can extend that pleasure with a matching body care product?\n\nThis V.V.LOVE set brings together an Eau de Parfum and a Body Cream in a set designed for women who like to take care of themselves while wearing a fragrance that suits them.\n\nThe scented cream is applied to the skin to bring softness and hydration, while the Eau de Parfum completes the routine with an extra scented touch.\n\nUsed together, the two products let you layer scented gestures and fully enjoy their scent world.\n\nSelected and sourced from Morocco, this set is also a lovely gift idea to please someone without having to look for two separate products.\n\nThe set contains:\n\n• 1 V.V.LOVE Eau de Parfum.\n• 1 scented Body Cream.\n\nV.V.LOVE: your fragrance, your ritual, your signature.",
    },
    features: {
      fr: ["Coffret : eau de parfum + crème corps 80 ml", "Douceur et hydratation", "Idée cadeau tout-en-un", "Approvisionné depuis le Maroc"],
      en: ["Set: eau de parfum + 80 ml body cream", "Softness and hydration", "All-in-one gift idea", "Sourced from Morocco"],
    },
  }),
  newProduct("cosmetique-parfum-18-ser-al-lail", "cosmetics", {
    name: { fr: "Ser Al Lail, coffret brume parfumée et gel douche", en: "Ser Al Lail, fragrance mist and shower gel set" },
    subcategory: "perfume",
    audience: "unisex",
    price: 6000,
    priceOnRequest: false,
    images: ["/cosmetique-parfum-18-ser-al-lail.jpg"],
    description: {
      fr: "Un rituel du soir, de la douche au parfum. Ser Al Lail réunit une brume parfumée de 100 ml et un gel douche de 175 ml pour une même signature de bout en bout, avec une touche d’orient. On se parfume après la douche, on garde son odeur toute la soirée. Une idée de cadeau complète, pour lui comme pour elle. Importé directement du Maroc.",
      en: "An evening ritual, from the shower to the fragrance. Ser Al Lail brings together a 100 ml fragrance mist and a 175 ml shower gel for one signature from start to finish, with a touch of the Orient. You scent yourself after the shower and keep the fragrance all evening. A complete gift idea, for him or for her. Imported directly from Morocco.",
    },
    features: {
      fr: ["Coffret : brume parfumée 100 ml + gel douche 175 ml", "Une signature de la douche au parfum", "Pour lui comme pour elle", "Importé directement du Maroc"],
      en: ["Set: 100 ml fragrance mist + 175 ml shower gel", "One signature from shower to fragrance", "For him or for her", "Imported directly from Morocco"],
    },
  }),
  newProduct("tech-ordi-hp-elitebook-840", "tech", {
    name: { fr: "HP EliteBook 840 G6 – Core i5, 8 Go, SSD 256 Go", en: "HP EliteBook 840 G6 – Core i5, 8 GB, 256 GB SSD" },
    subcategory: "computer-office",
    price: 165000,
    priceOnRequest: false,
    images: ["/tech-ordi-hp-elitebook-840.jpg"],
    description: {
      fr: "Le PC sérieux pour les cours, les exposés et le travail de tous les jours. Un Core i5 de 8e génération, 8 Go de RAM et un SSD de 256 Go : il démarre vite, ouvre ses fichiers sans traîner et gère sans problème le Word, l’Excel, le navigateur et les visios. Un bon point de départ pour un budget raisonnable. Livré avec son chargeur et 6 mois de garantie.",
      en: "The no-nonsense laptop for classes, presentations and everyday work. An 8th-generation Core i5, 8 GB of RAM and a 256 GB SSD: it starts fast, opens files without lagging and handles Word, Excel, the browser and video calls without trouble. A good starting point on a reasonable budget. Comes with its charger and a 6-month warranty.",
    },
    features: {
      fr: ["Intel Core i5, 8e génération", "RAM 8 Go · SSD 256 Go", "Carte graphique Intel UHD 620", "Chargeur inclus · Garantie 6 mois"],
      en: ["Intel Core i5, 8th generation", "8 GB RAM · 256 GB SSD", "Intel UHD 620 graphics", "Charger included · 6-month warranty"],
    },
  }),
  newProduct("tech-ordi-lenovo-thinkpad-p16", "tech", {
    name: { fr: "Lenovo ThinkPad P16 – Core i9, 32 Go, SSD 1 To, avec casque et souris gamer", en: "Lenovo ThinkPad P16 – Core i9, 32 GB, 1 TB SSD, with gaming headset and mouse" },
    subcategory: "computer-gaming",
    price: 660000,
    priceOnRequest: false,
    images: ["/tech-ordi-lenovo-thinkpad-p16.jpg"],
    description: {
      fr: "La station de travail pour ceux qui ne veulent aucun compromis. Un Core i9 de 13e génération, 32 Go de RAM, 1 To de SSD et une carte graphique Nvidia RTX : montage vidéo, 3D, programmation lourde ou gaming, elle suit le rythme. Elle arrive avec un casque gamer et une souris gamer, donc tu peux t’y mettre dès le premier jour. Chargeur inclus, 6 mois de garantie.",
      en: "The workstation for those who want no compromise. A 13th-generation Core i9, 32 GB of RAM, a 1 TB SSD and an Nvidia RTX graphics card: video editing, 3D, heavy programming or gaming, it keeps up. It comes with a gaming headset and a gaming mouse, so you can get started on day one. Charger included, 6-month warranty.",
    },
    features: {
      fr: ["Intel Core i9, 13e génération", "RAM 32 Go · SSD 1 To", "Carte graphique Nvidia RTX", "Casque gamer et souris gamer inclus", "Chargeur inclus · Garantie 6 mois"],
      en: ["Intel Core i9, 13th generation", "32 GB RAM · 1 TB SSD", "Nvidia RTX graphics card", "Gaming headset and mouse included", "Charger included · 6-month warranty"],
    },
  }),
  newProduct("tech-ordi-razer-blade-i7-2070", "tech", {
    name: { fr: "Razer Blade – Core i7, 32 Go, SSD 512 Go, Nvidia 2070", en: "Razer Blade – Core i7, 32 GB, 512 GB SSD, Nvidia 2070" },
    subcategory: "computer-gaming",
    price: 365000,
    priceOnRequest: false,
    images: ["/tech-ordi-razer-blade-i7-2070.jpg"],
    description: {
      fr: "Un PC pensé pour jouer le soir et travailler la journée. Avec son Core i7 de 9e génération, ses 32 Go de RAM et sa carte Nvidia 2070 de 8 Go, il fait tourner les jeux récents comme les logiciels de création. Le SSD de 512 Go garde tes projets à portée de main. Chargeur inclus, 6 mois de garantie.",
      en: "A laptop made for gaming in the evening and working during the day. With its 9th-generation Core i7, 32 GB of RAM and 8 GB Nvidia 2070 card, it runs recent games and creative software alike. The 512 GB SSD keeps your projects close at hand. Charger included, 6-month warranty.",
    },
    features: {
      fr: ["Intel Core i7, 9e génération", "RAM 32 Go · SSD 512 Go", "Nvidia 2070, 8 Go", "Chargeur inclus · Garantie 6 mois"],
      en: ["Intel Core i7, 9th generation", "32 GB RAM · 512 GB SSD", "Nvidia 2070, 8 GB", "Charger included · 6-month warranty"],
    },
  }),
  newProduct("tech-ordi-msi-gs66-pack-gamer", "tech", {
    name: { fr: "MSI GS66 – Core i7, 16 Go, SSD 512 Go, RTX 3070 Ti, pack gamer", en: "MSI GS66 – Core i7, 16 GB, 512 GB SSD, RTX 3070 Ti, gamer pack" },
    subcategory: "computer-gaming",
    price: 600000,
    priceOnRequest: false,
    images: ["/tech-ordi-msi-gs66-pack-gamer.jpg"],
    description: {
      fr: "La machine gamer livrée avec tout ce qu’il faut pour jouer. Core i7-12700H, 16 Go de RAM, SSD de 512 Go et une RTX 3070 Ti de 8 Go : les jeux tournent fort, le montage aussi. Dans le pack : un sac, un refroidisseur, un casque gamer et une souris gamer. Chargeur inclus, 6 mois de garantie.",
      en: "The gaming machine delivered with everything you need to play. Core i7-12700H, 16 GB of RAM, a 512 GB SSD and an 8 GB RTX 3070 Ti: games run hard, and so does video editing. In the pack: a bag, a cooling pad, a gaming headset and a gaming mouse. Charger included, 6-month warranty.",
    },
    features: {
      fr: ["Intel Core i7-12700H", "RAM 16 Go · SSD 512 Go", "Nvidia RTX 3070 Ti, 8 Go", "Sac, refroidisseur, casque et souris gamer inclus", "Chargeur inclus · Garantie 6 mois"],
      en: ["Intel Core i7-12700H", "16 GB RAM · 512 GB SSD", "Nvidia RTX 3070 Ti, 8 GB", "Bag, cooling pad, gaming headset and mouse included", "Charger included · 6-month warranty"],
    },
  }),
  newProduct("tech-ordi-macbook-pro-m4-pro", "tech", {
    name: { fr: "MacBook Pro M4 Pro – 24 Go, SSD 512 Go", en: "MacBook Pro M4 Pro – 24 GB, 512 GB SSD" },
    subcategory: "computer-mac",
    price: 1100000,
    priceOnRequest: false,
    images: ["/tech-ordi-macbook-pro-m4-pro.jpg"],
    description: {
      fr: "Pour ceux qui travaillent sur de gros projets : montage, design, code, plusieurs applications ouvertes en même temps. La puce Apple M4 Pro et ses 24 Go de mémoire gardent tout fluide, et le SSD de 512 Go range tes fichiers sans compromis. Livré avec son chargeur et 6 mois de garantie.",
      en: "For people working on big projects: editing, design, code, several apps open at once. The Apple M4 Pro chip and its 24 GB of memory keep everything smooth, and the 512 GB SSD stores your files without compromise. Comes with its charger and a 6-month warranty.",
    },
    features: {
      fr: ["Puce Apple M4 Pro", "RAM 24 Go · SSD 512 Go", "Chargeur inclus · Garantie 6 mois"],
      en: ["Apple M4 Pro chip", "24 GB RAM · 512 GB SSD", "Charger included · 6-month warranty"],
    },
  }),
  newProduct("tech-ordi-macbook-pro-m5-pro", "tech", {
    name: { fr: "MacBook Pro M5 Pro – 24 Go, SSD 1 To", en: "MacBook Pro M5 Pro – 24 GB, 1 TB SSD" },
    subcategory: "computer-mac",
    price: 1600000,
    priceOnRequest: false,
    images: ["/tech-ordi-macbook-pro-m5-pro.jpg"],
    description: {
      fr: "Le plus puissant de notre sélection. La puce Apple M5 Pro, 24 Go de mémoire et 1 To de stockage : de quoi enchaîner les gros fichiers, le montage et les tâches lourdes sans ralentir, et garder tous tes projets sur la machine. Un investissement pour les années à venir. Livré avec son chargeur et 6 mois de garantie.",
      en: "The most powerful in our selection. The Apple M5 Pro chip, 24 GB of memory and 1 TB of storage: enough to handle large files, editing and heavy tasks without slowing down, and to keep all your projects on the machine. An investment for the years ahead. Comes with its charger and a 6-month warranty.",
    },
    features: {
      fr: ["Puce Apple M5 Pro", "RAM 24 Go · SSD 1 To", "Chargeur inclus · Garantie 6 mois"],
      en: ["Apple M5 Pro chip", "24 GB RAM · 1 TB SSD", "Charger included · 6-month warranty"],
    },
  }),
  newProduct("tech-disque-dur-externe-1to", "tech", {
    name: { fr: "Disque dur externe 1 To – USB-C", en: "External hard drive 1 TB – USB-C" },
    subcategory: "drives",
    price: 27500,
    priceOnRequest: false,
    images: ["/tech-disque-dur-externe-1to.jpg"],
    description: {
      fr: "Tes cours, tes photos, tes projets : tout sauvegardé au même endroit. 1 To d’espace pour libérer ton ordinateur ou protéger tes fichiers importants, avec un câble USB-C fourni. Un petit achat qui évite de grosses galères.",
      en: "Your courses, photos and projects: everything saved in one place. 1 TB of space to free up your computer or protect your important files, with a USB-C cable included. A small purchase that saves you from big headaches.",
    },
    features: {
      fr: ["Capacité 1 To", "Connexion USB-C", "Câble fourni"],
      en: ["1 TB capacity", "USB-C connection", "Cable included"],
    },
  }),
  newProduct("tech-ipad-pro-m5-256", "tech", {
    name: { fr: "iPad Pro M5 – 256 Go, Wi-Fi + cellulaire", en: "iPad Pro M5 – 256 GB, Wi-Fi + Cellular" },
    subcategory: "tablets",
    price: 900000,
    priceOnRequest: false,
    images: ["/tech-ipad-pro-m5-256.jpg"],
    description: {
      fr: "La tablette qui peut remplacer l’ordinateur pour beaucoup de choses : prise de notes, dessin, lecture, séries, travail en déplacement. Avec la puce M5, 256 Go de stockage et le Wi-Fi + cellulaire, tu restes connecté même sans réseau Wi-Fi.",
      en: "The tablet that can replace the computer for a lot of things: note-taking, drawing, reading, shows, working on the move. With the M5 chip, 256 GB of storage and Wi-Fi + Cellular, you stay connected even without a Wi-Fi network.",
    },
    features: {
      fr: ["Puce Apple M5", "Stockage 256 Go", "Wi-Fi + cellulaire"],
      en: ["Apple M5 chip", "256 GB storage", "Wi-Fi + Cellular"],
    },
  }),
  newProduct("tech-ordi-macbook-air-m1-2020", "tech", {
    name: { fr: "MacBook Air M1 2020 – SSD 256 Go", en: "MacBook Air M1 2020 – 256 GB SSD" },
    subcategory: "computer-mac",
    price: 295000,
    priceOnRequest: false,
    images: ["/tech-ordi-macbook-air-m1-2020.jpg"],
    description: {
      fr: "Le MacBook pour commencer. Léger, silencieux, avec une bonne autonomie, il suffit largement pour les cours, la recherche, la rédaction et le streaming. La puce Apple M1 le garde rapide au quotidien, et le SSD de 256 Go stocke l’essentiel. Livré avec son chargeur et 6 mois de garantie.",
      en: "The MacBook to start with. Light, quiet, with good battery life, it is more than enough for classes, research, writing and streaming. The Apple M1 chip keeps it fast day to day, and the 256 GB SSD holds the essentials. Comes with its charger and a 6-month warranty.",
    },
    features: {
      fr: ["Puce Apple M1 (2020)", "SSD 256 Go", "Chargeur inclus · Garantie 6 mois"],
      en: ["Apple M1 chip (2020)", "256 GB SSD", "Charger included · 6-month warranty"],
    },
  }),
  newProduct("tech-ordi-razer-blade-tactile", "tech", {
    name: { fr: "Razer Blade – Core 11e génération, SSD 256 Go, écran tactile", en: "Razer Blade – 11th-generation Core, 256 GB SSD, touchscreen" },
    subcategory: "computer-gaming",
    price: 340000,
    priceOnRequest: false,
    images: ["/tech-ordi-razer-blade-tactile.jpg"],
    description: {
      fr: "Un Razer Blade avec écran tactile, pour ceux qui veulent un PC polyvalent et un peu différent. Processeur Intel Core de 11e génération, SSD de 256 Go : on l’utilise pour le travail, les études, le divertissement, et l’écran tactile ajoute un vrai confort au quotidien. Chargeur inclus, 6 mois de garantie.",
      en: "A Razer Blade with a touchscreen, for those who want a versatile and slightly different laptop. 11th-generation Intel Core processor, 256 GB SSD: use it for work, studies and entertainment, and the touchscreen adds real everyday comfort. Charger included, 6-month warranty.",
    },
    features: {
      fr: ["Intel Core, 11e génération", "RAM 6 Go · SSD 256 Go", "Écran tactile", "Chargeur inclus · Garantie 6 mois"],
      en: ["Intel Core, 11th generation", "6 GB RAM · 256 GB SSD", "Touchscreen", "Charger included · 6-month warranty"],
    },
  }),
  newProduct("tech-ordi-msi-katana-15", "tech", {
    name: { fr: "MSI Katana 15 – Core i7, 16 Go, SSD 1 To, RTX 4050", en: "MSI Katana 15 – Core i7, 16 GB, 1 TB SSD, RTX 4050" },
    subcategory: "computer-gaming",
    price: 610000,
    priceOnRequest: false,
    images: ["/tech-ordi-msi-katana-15.jpg"],
    description: {
      fr: "Une machine gamer très puissante, avec le clavier rétroéclairé qui met l’ambiance. Core i7 de 13e génération, 16 Go de RAM, 1 To de SSD et une RTX 4050 : les jeux récents passent, et les logiciels de montage et de création aussi. Chargeur inclus, 6 mois de garantie.",
      en: "A very powerful gaming machine, with the backlit keyboard that sets the mood. 13th-generation Core i7, 16 GB of RAM, a 1 TB SSD and an RTX 4050: recent games run, and so do editing and creative software. Charger included, 6-month warranty.",
    },
    features: {
      fr: ["Intel Core i7, 13e génération", "RAM 16 Go · SSD 1 To", "Nvidia RTX 4050", "Chargeur inclus · Garantie 6 mois"],
      en: ["Intel Core i7, 13th generation", "16 GB RAM · 1 TB SSD", "Nvidia RTX 4050", "Charger included · 6-month warranty"],
    },
  }),
  newProduct("tech-ordi-samsung-galaxy-book2-pro", "tech", {
    name: { fr: "Samsung Galaxy Book2 Pro – Core i5, OLED, 8 Go, 256 Go", en: "Samsung Galaxy Book2 Pro – Core i5, OLED, 8 GB, 256 GB" },
    subcategory: "computer-office",
    price: 300000,
    priceOnRequest: false,
    images: ["/tech-ordi-samsung-galaxy-book2-pro.jpg"],
    description: {
      fr: "Ultra fin, ultra léger, avec un écran OLED qui rend les couleurs vraiment vivantes. Core i5 de 12e génération, 8 Go de RAM et 256 Go de stockage : parfait pour aller en cours avec, travailler au café ou regarder un film le soir. Chargeur inclus, 6 mois de garantie.",
      en: "Ultra slim, ultra light, with an OLED screen that makes colours truly vivid. 12th-generation Core i5, 8 GB of RAM and 256 GB of storage: perfect to take to class, work at a café or watch a movie in the evening. Charger included, 6-month warranty.",
    },
    features: {
      fr: ["Écran OLED, ultra fin", "Intel Core i5, 12e génération", "RAM 8 Go · 256 Go", "Chargeur inclus · Garantie 6 mois"],
      en: ["OLED screen, ultra slim", "Intel Core i5, 12th generation", "8 GB RAM · 256 GB", "Charger included · 6-month warranty"],
    },
  }),
  newProduct("tech-ordi-macbook-m3-pro", "tech", {
    name: { fr: "MacBook M3 Pro – 8 Go, SSD 1 To", en: "MacBook M3 Pro – 8 GB, 1 TB SSD" },
    subcategory: "computer-mac",
    price: 700000,
    priceOnRequest: false,
    images: ["/tech-ordi-macbook-m3-pro.jpg"],
    description: {
      fr: "Un MacBook avec beaucoup de place pour tout garder : 1 To de SSD pour tes projets, tes photos et tes logiciels. La puce Apple M3 Pro le rend rapide pour le travail comme pour les loisirs. Livré avec son chargeur et 6 mois de garantie.",
      en: "A MacBook with plenty of room for everything: a 1 TB SSD for your projects, photos and software. The Apple M3 Pro chip makes it fast for work and leisure alike. Comes with its charger and a 6-month warranty.",
    },
    features: {
      fr: ["Puce Apple M3 Pro", "RAM 8 Go · SSD 1 To", "Chargeur inclus · Garantie 6 mois"],
      en: ["Apple M3 Pro chip", "8 GB RAM · 1 TB SSD", "Charger included · 6-month warranty"],
    },
  }),
];

// Les emplacements vides d'une catégorie disparaissent dès qu'elle contient de vrais produits.
const placeholders = emptySlots.filter((slot) => realProducts[slot.id] || !catalogue.some((item) => item.category === slot.category));
// Prix (FCFA) des coques et des montres. Les coques absentes de cette liste restent « Prix sur demande » tant que leur prix n'est pas confirmé.
// 3900 : coques MagSafe · 3000 : strass · 3500 : strass transparent · 4000 : transparentes MagSafe · 2000 à 2300 : unies et translucides
const casePrices: Record<string, number> = {
  // Câbles, chargeurs, power banks, écouteurs, casques, enceintes
  "tech-cable-tdkc313-lightning": 1000,
  "tech-cable-apple-lightning-1m": 1000,
  "tech-cable-apple-usbc-2m": 1000,
  "tech-chargeur-45w-usbc": 3000,
  "tech-chargeur-iphone-couleurs-blanc": 2000,
  "tech-chargeur-iphone-couleurs-orange": 2000,
  "tech-chargeur-iphone-couleurs-jaune": 2000,
  "tech-chargeur-iphone-couleurs-rose": 2000,
  "tech-chargeur-35w-iphone": 3000,
  "tech-chargeur-tdkc313-s8": 2000,
  "tech-chargeur-grand-s6": 2000,
  "tech-cable-micro-usb": 1000,
  "tech-cable-3-en-1": 1500,
  "tech-powerbank-2smc-m8c70": 5500,
  "tech-powerbank-aroimac-ard67": 5500,
  "tech-powerbank-dakewei-p15": 7000,
  "tech-powerbank-tdk551": 10000,
  "tech-powerbank-15000": 8000,
  "tech-powerbank-tdkc313-20000": 10000,
  "tech-powerbank-dakewei-p26a": 8000,
  "tech-earbuds-langeer-lge-ne55": 8000,
  "tech-earbuds-freeclip-lge-08": 6000,
  "tech-earbuds-seufre": 7000,
  "tech-earbuds-calus-m02-prox": 6000,
  "tech-earbuds-oraimo-i12": 3500,
  "tech-earbuds-tws-blanc-etui": 8000,
  "tech-earbuds-true-wireless-blanc": 8000,
  "tech-earbuds-airpods-3": 8000,
  "tech-earbuds-airpods-pro": 8000,
  "tech-earbuds-free-buds-lge-20": 8000,
  "tech-earbuds-ormushie-oms-free": 7000,
  "tech-casque-sony-wh-xm5-blanc": 10000,
  "tech-casque-sony-wh-xm5-noir": 10000,
  "tech-casque-jbl-pure-bass-a18-orange": 10000,
  "tech-casque-jbl-pure-bass-a18-blanc": 10000,
  "tech-casque-jbl-pure-bass-a18-gris": 10000,
  "tech-casque-jbl-pure-bass-a18-noir": 10000,
  "tech-casque-jbl-live-660nc": 10000,
  "tech-casque-jbl-super-bass-i12": 10000,
  "tech-casque-airpods-max-argent": 8000,
  "tech-casque-airpods-max-vert": 8000,
  "tech-casque-airpods-max-bleu": 8000,
  "tech-casque-airpods-max-rouge": 8000,
  "tech-casque-airpods-max-noir": 8000,
  "tech-enceinte-music-x2651-bleu": 4500,
  "tech-enceinte-music-x2651-orange": 4500,
  "tech-enceinte-music-x2651-vert": 4500,
  "tech-enceinte-music-x2651-noir": 4500,
  "tech-enceinte-loveyin-ai176-violet": 5000,
  "tech-enceinte-loveyin-ai176-noir": 5000,
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
const products: Product[] = [...placeholders.map((product) => ({ ...product, ...(realProducts[product.id] ? { availability: "available" as const } : {}), ...realProducts[product.id] })), ...catalogue.map(withPrice)];

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

const DescriptionBlock = ({ text, lang }: { text: string; lang: Lang }) => {
  const [intro, more] = text.split("\n---\n");
  if (!more) return <p className="detail-description">{text}</p>;
  const lines = more.split("\n");
  const body = lines.slice(1).join("\n").trim();
  return (
    <div className="detail-description">
      <p>{intro}</p>
      <details className="detail-more">
        <summary>{lines[0]}<i aria-hidden="true">+</i></summary>
        <p>{body}</p>
      </details>
    </div>
  );
};

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
    catalogReady: "Produits en boutique",
    catalogPending: "Montres, sacs, parfums, tech",
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
    faqText: "Livraison, paiement, retours et garantie : tout ce qu’il faut savoir avant de commander.",
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
    catalogReady: "Products in store",
    catalogPending: "Watches, bags, perfumes, tech",
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
    faqText: "Delivery, payment, returns and warranty: everything you need to know before ordering.",
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
// Montres proposées avec l'option boîte (+1 000 FCFA)
const BOX_WATCH_IDS = new Set(["watch-femme-rado-argent", "watch-femme-michael-kors-rose", "watch-femme-rado-jubile-bicolore", "watch-femme-chanel-champagne", "watch-femme-doree-carree-double-c", "watch-femme-doree-strass-octogonale", "watch-femme-acier-chiffres-romains", "watch-femme-acier-rectangulaire-date", "watch-femme-doree-bleu-marine", "watch-femme-datejust-doree"]);
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
  const [withBox, setWithBox] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const t = copy[lang];

  const navigate = (next: Page) => {
    if (next !== "product") { try { window.history.replaceState(null, "", window.location.pathname); } catch { /* ignore */ } }
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
    setWithBox(false);
    setImageIndex(0);
    try { window.history.pushState(null, "", `?p=${encodeURIComponent(product.id)}`); } catch { /* ignore */ }
    navigate("product");
  };

  // Lien direct vers une fiche : ?p=<id> ouvre le produit (liens WhatsApp, partage, retour arrière)
  useEffect(() => {
    const syncFromUrl = () => {
      const id = new URLSearchParams(window.location.search).get("p");
      const found = id ? products.find((item) => item.id === id) : undefined;
      if (found) {
        setSelectedProduct(found); setSelectedCategory(found.category); setVariant(""); setQuantity(1); setWithBox(false); setImageIndex(0); setPage("product");
      } else if (!id) {
        setPage((current) => (current === "product" ? "home" : current));
      }
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

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

  const isWatch = BOX_WATCH_IDS.has(selectedProduct.id);
  const boxApplied = isWatch && withBox && selectedProduct.price !== null;
  const shownProduct: Product = boxApplied ? { ...selectedProduct, price: (selectedProduct.price as number) + 1000 } : selectedProduct;
  const productLink = `${window.location.origin}${window.location.pathname}?p=${encodeURIComponent(selectedProduct.id)}`;
  const whatsappMessage = canOrder
    ? lang === "fr"
      ? `Bonjour Le Coin ISM, je souhaite commander : ${selectedProduct.name?.fr}, variante : ${variant || "sans variante"}, quantité : ${quantity},${isWatch ? ` boîte : ${boxApplied ? "avec boîte (+1 000 FCFA)" : "sans boîte"},` : ""} prix affiché : ${priceLabel(shownProduct, "fr")}. Voici le produit : ${productLink}`
      : `Hello Le Coin ISM, I would like to order: ${selectedProduct.name?.en}, variant: ${variant || "no variant"}, quantity: ${quantity},${isWatch ? ` box: ${boxApplied ? "with box (+1,000 FCFA)" : "without box"},` : ""} displayed price: ${priceLabel(shownProduct, "en")}. Product link: ${productLink}`
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
          <section className="hero"><div className="shell hero-grid"><div className="hero-copy"><span className="eyebrow">{t.heroEyebrow}</span><h1>{t.heroTitle}</h1><p>{t.heroText}</p><div className="button-row"><button className="button primary" onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}>{t.discover}<Icon name="arrow" /></button><button className="button tertiary" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>{t.how}</button></div><div className="trust-note"><Icon name="check" /><span>{t.verifiedOnly}</span></div></div><div className="hero-visual"><div className="hero-image-wrap"><img src="/hero-accueil.jpg" alt={lang === "fr" ? "Gourde perlée et accessoires Le Coin ISM" : "Beaded tumbler and Le Coin ISM accessories"} /></div><div className="floating-card"><span>200+</span><strong>{t.catalogReady}</strong><small>{t.catalogPending}</small></div></div></div></section>

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
            <div className="product-info"><div className="product-meta"><Status lang={lang} availability={selectedProduct.availability} /><span>{selectedProduct.name ? (audienceLabel(selectedProduct, lang) || getCategory(selectedProduct.category).name[lang]) : lang === "fr" ? "Référence à renseigner" : "Reference to complete"}</span></div><h1>{displayName(selectedProduct, lang)}</h1><div className={selectedProduct.price !== null || selectedProduct.priceOnRequest ? "detail-price" : "detail-price pending-price"}>{selectedProduct.oldPrice && <s className="old-price">{selectedProduct.oldPrice.toLocaleString("fr-FR")} FCFA</s>}{priceLabel(shownProduct, lang)}</div><DescriptionBlock text={selectedProduct.description?.[lang] ?? (lang === "fr" ? "Ajoutez ici une description concise et vérifiée du produit, sans promesse non confirmée." : "Add a concise, verified product description here, without unconfirmed claims.")} lang={lang} />
              {selectedProduct.features && <div className="data-checklist"><strong>{lang === "fr" ? "Caractéristiques" : "Features"}</strong>{selectedProduct.features[lang].map((item) => <span key={item}><i />{item}</span>)}</div>}
              {missingData.length > 0 && <div className="data-checklist"><strong>{t.addData}</strong>{missingData.map((item) => <span key={item}><i />{item}</span>)}</div>}
              <div className="selection-block"><div className="selection-label"><label>{t.variant}</label></div>{selectedProduct.variants.length ? <div className="variants">{selectedProduct.variants.map((item) => <button className={variant === item ? "active" : ""} key={item} onClick={() => setVariant(item)}>{item}</button>)}</div> : <div className="unconfigured-field">{lang === "fr" ? "Couleurs, tailles ou modèles à renseigner" : "Colours, sizes or models to complete"}</div>}</div>
              {isWatch && selectedProduct.price !== null && <div className="selection-block"><div className="selection-label"><label>{lang === "fr" ? "Boîte" : "Box"}</label></div><div className="variants"><button className={!withBox ? "active" : ""} onClick={() => setWithBox(false)}>{lang === "fr" ? "Sans boîte" : "Without box"}</button><button className={withBox ? "active" : ""} onClick={() => setWithBox(true)}>{lang === "fr" ? "Avec boîte (+1 000 FCFA)" : "With box (+1,000 FCFA)"}</button></div></div>}
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
  fr: [["Comment commander ?", "C’est simple ! Parcourez notre boutique, choisissez le produit qui vous plaît et cliquez sur « Commander sur WhatsApp ». Un message contenant les informations du produit sera automatiquement préparé. Envoyez-le-nous pour que nous puissions organiser votre commande."], ["Les produits sont-ils disponibles ?", "Tous les produits présentés sur notre boutique sont disponibles à la commande. Une fois votre message reçu, nous vous accompagnons pour finaliser votre achat et organiser la livraison."], ["Où livrez-vous et combien coûte la livraison ?", "Nous livrons partout au Sénégal !\n\n• À Dakar : la livraison est gratuite.\n• Dans les autres régions : les frais de livraison sont à la charge du client.\n\nVous pouvez également choisir la remise en main propre selon les modalités convenues avec notre équipe.\n\nLes détails de la livraison sont communiqués lors de la commande."], ["Quels moyens de paiement acceptez-vous ?", "Le paiement s’effectue par Wave, avant la réception du produit. Une fois votre commande organisée, nous vous communiquerons les informations nécessaires pour effectuer le règlement."], ["Les retours et les échanges sont-ils possibles ?", "Oui ! Les retours et les échanges sont possibles. Pour toute demande, contactez-nous directement sur WhatsApp. Notre équipe est disponible pour vous accompagner."], ["Puis-je retourner un produit ou demander un échange si je change d’avis ?", "Oui ! Chez Le Coin ISM, vous pouvez demander un retour ou un échange, même si vous changez simplement d’avis. Il vous suffit de nous contacter sur WhatsApp. Notre équipe est joignable 24h/24 et 7j/7 pour recevoir vos demandes."], ["Les ordinateurs sont-ils garantis ?", "Oui ! Tous nos ordinateurs bénéficient d’une garantie de 6 mois et sont accompagnés d’une facture. Vous disposez ainsi d’une preuve d’achat et d’une garantie en cas de problème couvert par celle-ci."], ["D’où viennent vos parfums ?", "Nos parfums sont importés du Maroc. Nous sélectionnons les références proposées dans notre boutique pour vous offrir une gamme de parfums à découvrir."]],
  en: [["How do I order?", "It’s simple! Browse our shop, choose the product you like and click “Order on WhatsApp”. A message with the product information will be prepared automatically. Send it to us so we can arrange your order."], ["Are the products available?", "All the products shown in our shop are available to order. Once we receive your message, we help you complete your purchase and arrange delivery."], ["Where do you deliver and how much does delivery cost?", "We deliver all over Senegal!\n\n• In Dakar: delivery is free.\n• In other regions: delivery fees are paid by the customer.\n\nYou can also choose hand-over in person, on terms agreed with our team.\n\nDelivery details are shared when you order."], ["Which payment methods do you accept?", "Payment is made through Wave, before you receive the product. Once your order is arranged, we will send you the information needed to make the payment."], ["Are returns and exchanges possible?", "Yes! Returns and exchanges are possible. For any request, contact us directly on WhatsApp. Our team is available to help you."], ["Can I return a product or ask for an exchange if I change my mind?", "Yes! At Le Coin ISM, you can ask for a return or an exchange, even if you simply change your mind. Just contact us on WhatsApp. Our team can be reached 24/7 to receive your requests."], ["Are the computers under warranty?", "Yes! All our computers come with a 6-month warranty and an invoice. You therefore have proof of purchase and a warranty in case of a problem covered by it."], ["Where do your perfumes come from?", "Our perfumes are imported from Morocco. We select the references offered in our shop to give you a range of fragrances to discover."]],
};

function FaqPreview({ lang, onAll }: { lang: Lang; onAll: () => void }) {
  return <section className="section shell faq-preview"><div><span className="eyebrow">FAQ</span><h2>{lang === "fr" ? "Les questions essentielles" : "The essential questions"}</h2><button className="text-link" onClick={onAll}>{lang === "fr" ? "Toutes les réponses" : "All answers"}<Icon name="arrow" /></button></div><div className="accordion">{faqs[lang].slice(0, 3).map(([question, answer], index) => <details key={question} open={index === 0}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}</div></section>;
}

function AboutPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return <><section className="inner-hero"><div className="shell"><span className="eyebrow">{lang === "fr" ? "Notre histoire" : "Our story"}</span><h1>{t.aboutTitle}</h1><p>{t.aboutText}</p></div></section><section className="section shell about-grid"><div className="about-image"><img src="/a-propos.jpg" alt={lang === "fr" ? "Costume, parfum et montre : l’univers Le Coin ISM" : "Suit, fragrance and watch: the Le Coin ISM world"} /></div><div className="about-copy"><span className="eyebrow">01 — {lang === "fr" ? "Notre méthode" : "Our method"}</span><h2>{lang === "fr" ? "Vérifier avant de publier." : "Verify before publishing."}</h2><p>{lang === "fr" ? "Le catalogue est organisé autour de six univers réels. Chaque fiche reste en préparation tant que ses photos, son prix et sa disponibilité ne sont pas confirmés." : "The catalogue is organised around six real collections. Each page remains in preparation until its photos, price and availability are confirmed."}</p><div className="values">{(lang === "fr" ? [["Authenticité", "Pas de marque ou photo trompeuse."], ["Clarté", "Les données manquantes sont visibles."], ["Souplesse", "Le catalogue s’enrichit sans refonte."]] : [["Authenticity", "No misleading brand or photo."], ["Clarity", "Missing data stays visible."], ["Flexibility", "The catalogue grows without redesign."]]).map(([title, text], index) => <div key={title}><span>0{index + 1}</span><strong>{title}</strong><p>{text}</p></div>)}</div></div></section><section className="section shell independence"><span>i</span><div><h2>{lang === "fr" ? "Une identité indépendante" : "An independent identity"}</h2><p>{t.independent}</p></div></section></>;
}

function FaqPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return <section className="faq-page shell"><div className="page-intro"><span className="eyebrow">FAQ & {lang === "fr" ? "informations" : "information"}</span><h1>{t.faqTitle}</h1><p>{t.faqText}</p></div><div className="faq-layout"><aside><strong>{lang === "fr" ? "Sur cette page" : "On this page"}</strong>{faqs[lang].map(([question], index) => <span key={question}>0{index + 1} — {question}</span>)}</aside><div className="faq-list">{faqs[lang].map(([question, answer], index) => <details key={question} open={index === 0}><summary><span>0{index + 1}</span>{question}<i>+</i></summary><p>{answer}</p></details>)}<a className="contact-card" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lang === "fr" ? "Bonjour Le Coin ISM, j’ai une question." : "Hello Le Coin ISM, I have a question.")}`} target="_blank" rel="noopener noreferrer"><Icon name="message" size={28} /><div><h3>{lang === "fr" ? "Besoin d’une précision ?" : "Need more information?"}</h3><p>{lang === "fr" ? "Écris-nous sur WhatsApp, on te répond dès que possible." : "Message us on WhatsApp and we will reply as soon as possible."}</p></div><span className="contact-card-cta">{lang === "fr" ? "Ouvrir WhatsApp" : "Open WhatsApp"} →</span></a></div></div></section>;
}

function DesignSystemPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return <section className="system-page shell"><div className="page-intro"><span className="eyebrow">Le Coin ISM / v1.1</span><h1>{t.dsTitle}</h1><p>{t.dsText}</p></div><div className="system-section"><div className="system-title"><span>01</span><h2>{lang === "fr" ? "Couleurs" : "Colours"}</h2></div><div className="swatches">{[["Nuit","navy"],["Ivoire","cream"],["Or doux","gold"],["Sauge","sage"],["Blanc","white"]].map(([name, token]) => <div key={name}><i className={`swatch-${token}`} /><strong>{name}</strong><span>--{token}</span></div>)}</div></div><div className="system-section"><div className="system-title"><span>02</span><h2>{lang === "fr" ? "Composants catalogue" : "Catalogue components"}</h2></div><div className="component-shelf"><button className="button primary">{lang === "fr" ? "Bouton primaire" : "Primary button"}<Icon name="arrow" /></button><button className="button secondary">{lang === "fr" ? "Secondaire" : "Secondary"}</button><Status lang={lang} /><label className="search-field"><Icon name="search" /><input placeholder={t.search} /></label></div></div></section>;
}
