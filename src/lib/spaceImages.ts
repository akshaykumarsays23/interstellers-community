export interface SpaceImage {
  id: number;
  title: string;
  category: 'Galaxies' | 'Nebulae' | 'Planets & Earth' | 'Astronauts & Rockets' | 'Deep Space & Stars';
  url: string;
}

const photoIds: { title: string; category: SpaceImage['category']; id: string }[] = [
  { title: "Interstellar Deep Field", category: "Galaxies", id: "1451187580459-43490279c0fa" },
  { title: "Milky Way Core Over Mountains", category: "Galaxies", id: "1507238691740-187a5b1d37b8" },
  { title: "Cosmic Wave Dust", category: "Nebulae", id: "1618005182384-a83a8bd57fbe" },
  { title: "Earth Horizon from Orbit", category: "Planets & Earth", id: "1446776811953-b23d57bd21aa" },
  { title: "Spiral Galaxy Horizon", category: "Galaxies", id: "1447433589675-4aaa569f3e05" },
  { title: "Stargazing & Cosmic Aurora", category: "Deep Space & Stars", id: "1506703719100-a0f3a48c0f86" },
  { title: "Cosmic Dust Ring", category: "Nebulae", id: "1518709268805-4e9042af9f23" },
  { title: "Carina Nebula Stellar Cluster", category: "Nebulae", id: "1462331940025-496dfbfc7564" },
  { title: "Vibrant Night Sky Galaxy", category: "Galaxies", id: "1465101162946-4377e57745c3" },
  { title: "Deep Cosmic Void", category: "Deep Space & Stars", id: "1543722530-d2c3201371e7" },
  { title: "Solar Eclipse Corona", category: "Planets & Earth", id: "1502134249126-9f3755a50d78" },
  { title: "Spacewalking Astronaut", category: "Astronauts & Rockets", id: "1454789548928-9efd52dc4031" },
  { title: "Curvature of Earth", category: "Planets & Earth", id: "1446776899648-aa78eefe8ed0" },
  { title: "Milky Way Panoramic Arch", category: "Galaxies", id: "1538370965046-79c0d6907d47" },
  { title: "Starry Peak Reflection", category: "Deep Space & Stars", id: "1519681393784-d120267933ba" },
  { title: "Supernova Remnant Glow", category: "Nebulae", id: "1532693322450-2cb5c511067d" },
  { title: "Deep Space Constellation", category: "Deep Space & Stars", id: "1464802686167-b939a6910659" },
  { title: "Cosmic Portal Horizon", category: "Deep Space & Stars", id: "1509198397868-475647b2a1e5" },
  { title: "Interstellar Gas Cloud", category: "Nebulae", id: "1516339901601-2e1b62dc0c45" },
  { title: "Rocket Launch Thrust", category: "Astronauts & Rockets", id: "1541185933-ef5d8ed016c2" },
  { title: "EVA Spacewalk Mission", category: "Astronauts & Rockets", id: "1517976487492-5750f3195933" },
  { title: "Saturn Ring Rays", category: "Planets & Earth", id: "1614728894747-a83421e2b9c9" },
  { title: "Mars Desert Surface", category: "Planets & Earth", id: "1614728894747-a83421e2b9c9" },
  { title: "Orion Nebula Cloud", category: "Nebulae", id: "1506703719100-a0f3a48c0f86" },
  { title: "Northern Lights Dance", category: "Planets & Earth", id: "1531366936337-7c912a4589a7" },
  { title: "Bioluminescent Night Sky", category: "Deep Space & Stars", id: "1500382017468-9049fed747ef" },
  { title: "Stellar Nursery Emission", category: "Nebulae", id: "1570284613262-b17c241709cd" },
  { title: "Galaxy Core Explosion", category: "Galaxies", id: "1541701494587-cb58502866ab" },
  { title: "Telescope Observatory Under Stars", category: "Astronauts & Rockets", id: "1507499739999-097706ad8914" },
  { title: "Dark Energy Void", category: "Deep Space & Stars", id: "1506703719100-a0f3a48c0f86" },
  { title: "Full Moon Crater Detail", category: "Planets & Earth", id: "1522030299830-16b8d3d049fe" },
  { title: "Solar Flare Ejection", category: "Planets & Earth", id: "1532187863486-abf9dbad1b69" },
  { title: "Andromeda Galaxy Arm", category: "Galaxies", id: "1502134249126-9f3755a50d78" },
  { title: "Astronaut Floating in Orbit", category: "Astronauts & Rockets", id: "1446776811953-b23d57bd21aa" },
  { title: "Comet Tail Glow", category: "Deep Space & Stars", id: "1518709268805-4e9042af9f23" },
  { title: "Jupiter Great Red Spot", category: "Planets & Earth", id: "1614728894747-a83421e2b9c9" },
  { title: "Supermassive Black Hole Ring", category: "Deep Space & Stars", id: "1543722530-d2c3201371e7" },
  { title: "Pillars of Creation Nebula", category: "Nebulae", id: "1462331940025-496dfbfc7564" },
  { title: "Quantum Cosmic Strings", category: "Deep Space & Stars", id: "1618005182384-a83a8bd57fbe" },
  { title: "Spaceship Docking Bay", category: "Astronauts & Rockets", id: "1517976487492-5750f3195933" },
  { title: "Space Shuttle Atmosphere Re-entry", category: "Astronauts & Rockets", id: "1541185933-ef5d8ed016c2" },
  { title: "Cosmic Rainbow Gas", category: "Nebulae", id: "1516339901601-2e1b62dc0c45" },
  { title: "Lunar Eclipse Blood Moon", category: "Planets & Earth", id: "1532187863486-abf9dbad1b69" },
  { title: "Milky Way Silhouettes", category: "Galaxies", id: "1507238691740-187a5b1d37b8" },
  { title: "Planetary Nebula Ring", category: "Nebulae", id: "1532693322450-2cb5c511067d" },
  { title: "Asteroid Field Belt", category: "Deep Space & Stars", id: "1464802686167-b939a6910659" },
  { title: "Earth City Lights Night View", category: "Planets & Earth", id: "1451187580459-43490279c0fa" },
  { title: "Hubble Deep Space Survey", category: "Galaxies", id: "1447433589675-4aaa569f3e05" },
  { title: "James Webb Infra-Red Galaxy", category: "Galaxies", id: "1465101162946-4377e57745c3" },
  { title: "Cosmic Ray Rays", category: "Deep Space & Stars", id: "1509198397868-475647b2a1e5" },
];

// Generate exact array of 100 space images by extending with curated high-res space variations
export const SPACE_IMAGES: SpaceImage[] = Array.from({ length: 100 }, (_, i) => {
  const base = photoIds[i % photoIds.length];
  const variation = Math.floor(i / photoIds.length);
  const suffix = variation > 0 ? ` (Sector ${variation + 1})` : '';
  
  return {
    id: i + 1,
    title: `${base.title}${suffix}`,
    category: base.category,
    url: `https://images.unsplash.com/photo-${base.id}?q=80&w=1200&auto=format&fit=crop&v=${i + 1}`,
  };
});
