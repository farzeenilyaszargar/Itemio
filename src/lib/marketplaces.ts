export type Marketplace = {
  name: string;
  domain: string;
  color: string;
};

export const marketplaces: Marketplace[] = [
  { name: "Amazon India", domain: "amazon.in", color: "#ff9900" },
  { name: "Flipkart", domain: "flipkart.com", color: "#2874f0" },
  { name: "Meesho", domain: "meesho.com", color: "#f43397" },
  { name: "Myntra", domain: "myntra.com", color: "#ff3f6c" },
  { name: "AJIO", domain: "ajio.com", color: "#2c4152" },
  { name: "Nykaa", domain: "nykaa.com", color: "#fc2779" },
  { name: "JioMart", domain: "jiomart.com", color: "#0078ad" },
  { name: "Tata CLiQ", domain: "tatacliq.com", color: "#da1c5c" },
  { name: "Snapdeal", domain: "snapdeal.com", color: "#e40046" },
];

export const marketplaceDomains = marketplaces.map((marketplace) => marketplace.domain);

export function marketplaceFromUrl(url: string): Marketplace | undefined {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return marketplaces.find((marketplace) => hostname.includes(marketplace.domain));
  } catch {
    return undefined;
  }
}

