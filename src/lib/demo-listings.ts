import type { ProductListing } from "@/lib/search";

type DemoStoreKey =
  | "amazon"
  | "flipkart"
  | "myntra"
  | "ajio"
  | "nykaa"
  | "jiomart"
  | "tatacliq"
  | "snapdeal"
  | "meesho"
  | "croma"
  | "reliance"
  | "vijaysales"
  | "decathlon";

type DemoProduct = {
  title: string;
  category: string;
  image: string;
  stores: DemoStoreKey[];
};

const imageByCategory = {
  audio: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
  beauty: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
  bottle: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
  clothes: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80",
  electronics: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
  jewellery: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80",
  phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  shoes: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
  stationery: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
  watch: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
} as const;

const storeLinks: Record<DemoStoreKey, { name: string; domain: string; href: (query: string) => string }> = {
  amazon: {
    name: "Amazon.in",
    domain: "amazon.in",
    href: (query) => `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
  },
  flipkart: {
    name: "Flipkart",
    domain: "flipkart.com",
    href: (query) => `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
  },
  myntra: {
    name: "Myntra",
    domain: "myntra.com",
    href: (query) => `https://www.myntra.com/${encodeURIComponent(query)}`,
  },
  ajio: {
    name: "AJIO",
    domain: "ajio.com",
    href: (query) => `https://www.ajio.com/search/?text=${encodeURIComponent(query)}`,
  },
  nykaa: {
    name: "Nykaa",
    domain: "nykaa.com",
    href: (query) => `https://www.nykaa.com/search/result/?q=${encodeURIComponent(query)}`,
  },
  jiomart: {
    name: "JioMart",
    domain: "jiomart.com",
    href: (query) => `https://www.jiomart.com/search/${encodeURIComponent(query)}`,
  },
  tatacliq: {
    name: "Tata CLiQ",
    domain: "tatacliq.com",
    href: (query) => `https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(query)}`,
  },
  snapdeal: {
    name: "Snapdeal",
    domain: "snapdeal.com",
    href: (query) => `https://www.snapdeal.com/search?keyword=${encodeURIComponent(query)}`,
  },
  meesho: {
    name: "Meesho",
    domain: "meesho.com",
    href: (query) => `https://www.meesho.com/search?q=${encodeURIComponent(query)}`,
  },
  croma: {
    name: "Croma",
    domain: "croma.com",
    href: (query) => `https://www.croma.com/search/?text=${encodeURIComponent(query)}`,
  },
  reliance: {
    name: "Reliance Digital",
    domain: "reliancedigital.in",
    href: (query) => `https://www.reliancedigital.in/search?q=${encodeURIComponent(query)}`,
  },
  vijaysales: {
    name: "Vijay Sales",
    domain: "vijaysales.com",
    href: (query) => `https://www.vijaysales.com/search/${encodeURIComponent(query)}`,
  },
  decathlon: {
    name: "Decathlon",
    domain: "decathlon.in",
    href: (query) => `https://www.decathlon.in/search?query=${encodeURIComponent(query)}`,
  },
};

const demoProducts: DemoProduct[] = [
  { title: "boAt Airdopes 141", category: "audio", image: imageByCategory.audio, stores: ["amazon", "flipkart", "jiomart"] },
  { title: "OnePlus Bullets Wireless Z2", category: "audio", image: imageByCategory.audio, stores: ["amazon", "flipkart", "croma"] },
  { title: "Sony WH-1000XM5 Headphones", category: "audio", image: imageByCategory.audio, stores: ["amazon", "croma", "reliance"] },
  { title: "JBL Tune 770NC Headphones", category: "audio", image: imageByCategory.audio, stores: ["amazon", "flipkart", "croma"] },
  { title: "Apple AirPods Pro 2nd Generation", category: "audio", image: imageByCategory.audio, stores: ["amazon", "flipkart", "vijaysales"] },
  { title: "Samsung Galaxy Buds2 Pro", category: "audio", image: imageByCategory.audio, stores: ["amazon", "flipkart", "reliance"] },
  { title: "Nothing Ear a Earbuds", category: "audio", image: imageByCategory.audio, stores: ["amazon", "flipkart", "croma"] },
  { title: "Redmi Buds 5", category: "audio", image: imageByCategory.audio, stores: ["amazon", "flipkart", "jiomart"] },
  { title: "Samsung Galaxy Watch6", category: "watch", image: imageByCategory.watch, stores: ["amazon", "flipkart", "croma"] },
  { title: "Apple Watch SE", category: "watch", image: imageByCategory.watch, stores: ["amazon", "flipkart", "vijaysales"] },
  { title: "Titan Karishma Analog Watch", category: "watch", image: imageByCategory.watch, stores: ["amazon", "flipkart", "tatacliq"] },
  { title: "Casio Vintage A168WA Watch", category: "watch", image: imageByCategory.watch, stores: ["amazon", "flipkart", "tatacliq"] },
  { title: "Fastrack Reflex Vox Smartwatch", category: "watch", image: imageByCategory.watch, stores: ["amazon", "flipkart", "tatacliq"] },
  { title: "Noise ColorFit Pro 5", category: "watch", image: imageByCategory.watch, stores: ["amazon", "flipkart", "croma"] },
  { title: "boAt Wave Call 2 Smartwatch", category: "watch", image: imageByCategory.watch, stores: ["amazon", "flipkart", "jiomart"] },
  { title: "Fossil Grant Chronograph Watch", category: "watch", image: imageByCategory.watch, stores: ["amazon", "tatacliq", "flipkart"] },
  { title: "Maybelline SuperStay Matte Ink", category: "beauty", image: imageByCategory.beauty, stores: ["nykaa", "amazon", "jiomart"] },
  { title: "Lakme Eyeconic Kajal", category: "beauty", image: imageByCategory.beauty, stores: ["nykaa", "amazon", "flipkart"] },
  { title: "Nykaa Matte To Last Liquid Lipstick", category: "beauty", image: imageByCategory.beauty, stores: ["nykaa", "amazon", "flipkart"] },
  { title: "L'Oreal Paris Revitalift Serum", category: "beauty", image: imageByCategory.beauty, stores: ["nykaa", "amazon", "jiomart"] },
  { title: "Minimalist 10% Niacinamide Serum", category: "beauty", image: imageByCategory.beauty, stores: ["nykaa", "amazon", "flipkart"] },
  { title: "The Ordinary Glycolic Acid 7% Toning Solution", category: "beauty", image: imageByCategory.beauty, stores: ["nykaa", "amazon", "flipkart"] },
  { title: "Mamaearth Ubtan Face Wash", category: "beauty", image: imageByCategory.beauty, stores: ["nykaa", "amazon", "jiomart"] },
  { title: "Plum Green Tea Toner", category: "beauty", image: imageByCategory.beauty, stores: ["nykaa", "amazon", "flipkart"] },
  { title: "Levi's 511 Slim Jeans", category: "clothes", image: imageByCategory.clothes, stores: ["myntra", "ajio", "amazon"] },
  { title: "Nike Dri-FIT T-Shirt", category: "clothes", image: imageByCategory.clothes, stores: ["myntra", "ajio", "amazon"] },
  { title: "Adidas Essentials Hoodie", category: "clothes", image: imageByCategory.clothes, stores: ["myntra", "ajio", "flipkart"] },
  { title: "Puma Smashic Sneakers", category: "shoes", image: imageByCategory.shoes, stores: ["myntra", "ajio", "amazon"] },
  { title: "H&M Cotton Shirt", category: "clothes", image: imageByCategory.clothes, stores: ["myntra", "ajio", "meesho"] },
  { title: "Roadster Men Black Jeans", category: "clothes", image: imageByCategory.clothes, stores: ["myntra", "flipkart", "meesho"] },
  { title: "Biba Printed Kurta", category: "clothes", image: imageByCategory.clothes, stores: ["myntra", "ajio", "amazon"] },
  { title: "W for Woman Kurta", category: "clothes", image: imageByCategory.clothes, stores: ["myntra", "ajio", "tatacliq"] },
  { title: "Libas Anarkali Kurta", category: "clothes", image: imageByCategory.clothes, stores: ["myntra", "flipkart", "meesho"] },
  { title: "Allen Solly Polo T-Shirt", category: "clothes", image: imageByCategory.clothes, stores: ["myntra", "ajio", "amazon"] },
  { title: "American Tourister Backpack", category: "clothes", image: imageByCategory.clothes, stores: ["amazon", "flipkart", "tatacliq"] },
  { title: "Skybags Brat Backpack", category: "clothes", image: imageByCategory.clothes, stores: ["amazon", "flipkart", "jiomart"] },
  { title: "boAt Stone 650 Bluetooth Speaker", category: "electronics", image: imageByCategory.electronics, stores: ["amazon", "flipkart", "croma"] },
  { title: "Logitech M350 Pebble Mouse", category: "electronics", image: imageByCategory.electronics, stores: ["amazon", "flipkart", "croma"] },
  { title: "HP K500F Gaming Keyboard", category: "electronics", image: imageByCategory.electronics, stores: ["amazon", "flipkart", "reliance"] },
  { title: "Samsung Galaxy M35 5G", category: "phone", image: imageByCategory.phone, stores: ["amazon", "flipkart", "reliance"] },
  { title: "Redmi Note 13 Pro 5G", category: "phone", image: imageByCategory.phone, stores: ["amazon", "flipkart", "croma"] },
  { title: "Apple iPhone 15", category: "phone", image: imageByCategory.phone, stores: ["amazon", "flipkart", "vijaysales"] },
  { title: "OnePlus Nord CE4", category: "phone", image: imageByCategory.phone, stores: ["amazon", "flipkart", "croma"] },
  { title: "Kindle Paperwhite", category: "electronics", image: imageByCategory.electronics, stores: ["amazon", "flipkart", "croma"] },
  { title: "Faber-Castell Brush Pens", category: "stationery", image: imageByCategory.stationery, stores: ["amazon", "flipkart", "jiomart"] },
  { title: "Classmate Pulse Notebook", category: "stationery", image: imageByCategory.stationery, stores: ["amazon", "flipkart", "jiomart"] },
  { title: "Post-it Sticky Notes", category: "stationery", image: imageByCategory.stationery, stores: ["amazon", "flipkart", "jiomart"] },
  { title: "Casio MJ-12D Calculator", category: "electronics", image: imageByCategory.electronics, stores: ["amazon", "flipkart", "jiomart"] },
  { title: "Milton Thermosteel Bottle", category: "bottle", image: imageByCategory.bottle, stores: ["amazon", "flipkart", "jiomart"] },
  { title: "Borosil Hydra Bottle", category: "bottle", image: imageByCategory.bottle, stores: ["amazon", "flipkart", "jiomart"] },
  { title: "GIVA Sterling Silver Ring", category: "jewellery", image: imageByCategory.jewellery, stores: ["amazon", "myntra", "ajio"] },
  { title: "Voylla Oxidised Jhumka Earrings", category: "jewellery", image: imageByCategory.jewellery, stores: ["amazon", "myntra", "meesho"] },
  { title: "Yellow Chimes Charm Bracelet", category: "jewellery", image: imageByCategory.jewellery, stores: ["amazon", "flipkart", "meesho"] },
  { title: "Miniso Sticker Pack", category: "stationery", image: imageByCategory.stationery, stores: ["amazon", "flipkart", "meesho"] },
];

export const demoBrowseListings: ProductListing[] = demoProducts.flatMap((product) =>
  product.stores.map((storeKey, index) => {
    const store = storeLinks[storeKey];

    return {
      id: `demo-${storeKey}-${product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
      title: product.title,
      store: store.name,
      domain: store.domain,
      image: product.image,
      link: store.href(product.title),
      availability: `${product.category} search on ${store.name}`,
      sourceType: "text",
      numericPrice: undefined,
      price: index === 0 ? undefined : undefined,
    };
  }),
);
