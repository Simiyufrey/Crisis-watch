import React, { useMemo, useState } from 'react';
import {
  Building2,
  CircuitBoard,
  Factory,
  Home,
  Landmark,
  Leaf,
  MapPinned,
  Route,
  ShieldAlert,
  Sparkles,
  Tractor,
  TrainFront,
  TrendingUp,
  Trees,
  Zap,
} from 'lucide-react';

type BuildingId =
  | 'residential'
  | 'highrise'
  | 'farm'
  | 'factory'
  | 'commerce'
  | 'power'
  | 'water'
  | 'transit'
  | 'park'
  | 'road';

type BuildingDefinition = {
  id: BuildingId;
  name: string;
  category: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
};

type MarketGood = {
  id: string;
  name: string;
  price: number;
  change: number;
  icon: React.ReactNode;
};

type Policy = {
  id: string;
  name: string;
  description: string;
};

const GRID_SIZE = 10;

const BUILDINGS: BuildingDefinition[] = [
  {
    id: 'residential',
    name: 'Residential Zone',
    category: 'Housing',
    description: '+40 pop, medium demand for utilities.',
    cost: 120,
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: 'highrise',
    name: 'High-Rise Block',
    category: 'Housing',
    description: '+90 pop, higher utility load, boosts downtown.',
    cost: 240,
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: 'farm',
    name: 'Agri Farm',
    category: 'Production',
    description: '+25 food, low jobs, eco-friendly.',
    cost: 90,
    icon: <Tractor className="w-5 h-5" />,
  },
  {
    id: 'factory',
    name: 'Manufacturing Hub',
    category: 'Industry',
    description: '+20 goods, +45 jobs, raises pollution.',
    cost: 220,
    icon: <Factory className="w-5 h-5" />,
  },
  {
    id: 'commerce',
    name: 'Commerce District',
    category: 'Services',
    description: '+35 jobs, +taxes, boosts tourism.',
    cost: 180,
    icon: <Landmark className="w-5 h-5" />,
  },
  {
    id: 'power',
    name: 'Fusion Plant',
    category: 'Utilities',
    description: '+40 power, supports industrial demand.',
    cost: 260,
    icon: <Zap className="w-5 h-5" />,
  },
  {
    id: 'water',
    name: 'Water Treatment',
    category: 'Utilities',
    description: '+30 water, stabilizes public health.',
    cost: 200,
    icon: <Leaf className="w-5 h-5" />,
  },
  {
    id: 'transit',
    name: 'Transit Hub',
    category: 'Mobility',
    description: 'Cuts commute time, reduces traffic.',
    cost: 150,
    icon: <TrainFront className="w-5 h-5" />,
  },
  {
    id: 'park',
    name: 'City Park',
    category: 'Amenities',
    description: '+happiness, +tourism, lowers crime.',
    cost: 110,
    icon: <Trees className="w-5 h-5" />,
  },
  {
    id: 'road',
    name: 'Road Tile',
    category: 'Infrastructure',
    description: 'Improves traffic flow and logistics.',
    cost: 20,
    icon: <Route className="w-5 h-5" />,
  },
];

const POLICIES: Policy[] = [
  {
    id: 'green-grid',
    name: 'Green Grid Incentives',
    description: 'Subsidize clean power, cut pollution growth by 15%.',
  },
  {
    id: 'night-shift',
    name: 'Night Shift Logistics',
    description: 'Factories operate off-peak, reduces traffic by 10%.',
  },
  {
    id: 'tourism',
    name: 'Tourism Campaign',
    description: '+12% visitor revenue, +5% job growth in commerce.',
  },
  {
    id: 'community-policing',
    name: 'Community Policing',
    description: 'Crime incidents drop by 20%, improves resident trust.',
  },
];

const INITIAL_MARKET: MarketGood[] = [
  { id: 'food', name: 'Food', price: 18, change: 1.2, icon: <Tractor className="w-4 h-4" /> },
  { id: 'goods', name: 'Goods', price: 32, change: -2.4, icon: <Factory className="w-4 h-4" /> },
  { id: 'power', name: 'Power', price: 14, change: 0.8, icon: <Zap className="w-4 h-4" /> },
  { id: 'tourism', name: 'Tourism', price: 22, change: 3.1, icon: <Sparkles className="w-4 h-4" /> },
  { id: 'research', name: 'Research', price: 28, change: -1.6, icon: <CircuitBoard className="w-4 h-4" /> },
];

const createEmptyGrid = () => Array.from({ length: GRID_SIZE * GRID_SIZE }, () => null as BuildingId | null);

const App: React.FC = () => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<BuildingId>('residential');
  const [grid, setGrid] = useState<(BuildingId | null)[]>(createEmptyGrid());
  const [treasury, setTreasury] = useState(3200);
  const [day, setDay] = useState(12);
  const [taxRate, setTaxRate] = useState(12);
  const [market, setMarket] = useState<MarketGood[]>(INITIAL_MARKET);
  const [activePolicies, setActivePolicies] = useState<string[]>(['green-grid', 'community-policing']);

  const buildingLookup = useMemo(() => {
    const map = new Map<BuildingId, BuildingDefinition>();
    BUILDINGS.forEach((building) => map.set(building.id, building));
    return map;
  }, []);

  const counts = useMemo(() => {
    return grid.reduce<Record<BuildingId, number>>(
      (acc, tile) => {
        if (tile) acc[tile] += 1;
        return acc;
      },
      {
        residential: 0,
        highrise: 0,
        farm: 0,
        factory: 0,
        commerce: 0,
        power: 0,
        water: 0,
        transit: 0,
        park: 0,
        road: 0,
      }
    );
  }, [grid]);

  const population = counts.residential * 40 + counts.highrise * 90;
  const jobs = counts.factory * 45 + counts.commerce * 35 + counts.farm * 8 + counts.transit * 6;
  const jobFill = population === 0 ? 0 : Math.min(100, Math.round((jobs / population) * 100));
  const happiness = Math.min(100, 62 + counts.park * 4 + counts.transit * 2 - counts.factory * 2);
  const crime = Math.max(8, 34 - counts.park * 2 - activePolicies.length * 2 + counts.factory * 1.5);
  const tourism = Math.min(100, 20 + counts.commerce * 3 + counts.park * 4);
  const traffic = Math.max(5, 48 + counts.factory * 2 + counts.commerce * 1.5 - counts.road * 2 - counts.transit * 4);

  const production = {
    power: counts.power * 40 + counts.road * 1,
    water: counts.water * 30,
    food: counts.farm * 25,
    goods: counts.factory * 20,
    research: counts.commerce * 6 + counts.transit * 4,
  };

  const demand = {
    power: Math.round(population * 0.6 + counts.commerce * 8 + counts.factory * 10),
    water: Math.round(population * 0.5 + counts.factory * 6),
    food: Math.round(population * 0.4),
    goods: Math.round(population * 0.3 + counts.commerce * 4),
    research: Math.round(population * 0.2),
  };

  const needs = {
    power: Math.min(100, Math.round((production.power / Math.max(demand.power, 1)) * 100)),
    water: Math.min(100, Math.round((production.water / Math.max(demand.water, 1)) * 100)),
    food: Math.min(100, Math.round((production.food / Math.max(demand.food, 1)) * 100)),
    goods: Math.min(100, Math.round((production.goods / Math.max(demand.goods, 1)) * 100)),
    research: Math.min(100, Math.round((production.research / Math.max(demand.research, 1)) * 100)),
  };

  const objectives = [
    { id: 'objective-1', label: 'Reach 500 population', complete: population >= 500 },
    { id: 'objective-2', label: 'Keep happiness above 70%', complete: happiness >= 70 },
    { id: 'objective-3', label: 'Maintain power coverage above 85%', complete: needs.power >= 85 },
    { id: 'objective-4', label: 'Attract 40+ tourism rating', complete: tourism >= 40 },
  ];

  const handleTileClick = (index: number) => {
    const current = grid[index];
    if (current) {
      return;
    }
    const selectedBuilding = buildingLookup.get(selectedBuildingId);
    if (!selectedBuilding) return;
    if (treasury < selectedBuilding.cost) {
      return;
    }

    setGrid((prev) => {
      const next = [...prev];
      next[index] = selectedBuildingId;
      return next;
    });
    setTreasury((prev) => prev - selectedBuilding.cost);
  };

  const handleAdvanceDay = () => {
    setDay((prev) => prev + 1);
    setTreasury((prev) => prev + Math.round(population * (taxRate / 100) * 2.4));
    setMarket((prev) =>
      prev.map((good) => {
        const swing = (Math.random() * 6 - 3) / 10;
        const nextPrice = Math.max(6, good.price + swing * good.price);
        const nextChange = swing * 10;
        return { ...good, price: Number(nextPrice.toFixed(1)), change: Number(nextChange.toFixed(1)) };
      })
    );
  };

  const togglePolicy = (id: string) => {
    setActivePolicies((prev) =>
      prev.includes(id) ? prev.filter((policy) => policy !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs uppercase tracking-[0.25em]">
              City Builder Sim
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Neo Horizon Metro</h1>
              <p className="text-sm text-slate-400">Day {day} · Scenario: Coastal Logistics Corridor</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
              <p className="text-slate-400">Treasury</p>
              <p className="text-lg font-semibold text-emerald-300">${treasury.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
              <p className="text-slate-400">Population</p>
              <p className="text-lg font-semibold">{population.toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
              <p className="text-slate-400">Employment</p>
              <p className="text-lg font-semibold">{jobFill}%</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2">
              <p className="text-slate-400">Happiness</p>
              <p className="text-lg font-semibold">{happiness}%</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-[260px_1fr_340px] gap-6">
        <section className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Build Menu</h2>
              <MapPinned className="w-4 h-4 text-slate-500" />
            </div>
            <div className="space-y-3">
              {BUILDINGS.map((building) => (
                <button
                  key={building.id}
                  onClick={() => setSelectedBuildingId(building.id)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    selectedBuildingId === building.id
                      ? 'border-emerald-400/70 bg-emerald-500/10 text-emerald-200'
                      : 'border-slate-800 bg-slate-950/30 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-300">{building.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{building.name}</p>
                      <p className="text-xs text-slate-400">{building.description}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">Cost: ${building.cost}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Zoning & Traffic</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Residential Coverage</span>
                <span className="font-semibold text-emerald-300">{counts.residential + counts.highrise} zones</span>
              </div>
              <div className="flex justify-between">
                <span>Industrial Footprint</span>
                <span className="font-semibold">{counts.factory} hubs</span>
              </div>
              <div className="flex justify-between">
                <span>Road Tiles</span>
                <span className="font-semibold">{counts.road}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">Traffic Simulation</p>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, traffic)}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-2">Congestion Index: {Math.round(traffic)}%</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">City Grid</h2>
              <button
                onClick={handleAdvanceDay}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 rounded-full hover:bg-emerald-500/30 transition"
              >
                Advance Day
              </button>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {grid.map((tile, index) => (
                <button
                  key={`tile-${index}`}
                  onClick={() => handleTileClick(index)}
                  className={`h-14 w-full rounded-lg border text-left p-2 transition ${
                    tile ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-800 bg-slate-950/40 hover:border-slate-600'
                  }`}
                >
                  {tile ? (
                    <div className="flex flex-col text-xs text-slate-300">
                      <span className="text-emerald-300">{buildingLookup.get(tile)?.icon}</span>
                      <span className="text-[11px] text-slate-400">{buildingLookup.get(tile)?.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600">Empty</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Click a tile to place the selected building. Road networks and transit hubs reduce commute time and logistics
              costs.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Agents & Needs</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Employment</span>
                  <span className="text-emerald-300">{jobs.toLocaleString()} jobs</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Commute Time</span>
                  <span className="text-amber-300">{Math.max(12, 38 - counts.transit * 3 - counts.road)} min</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Crime Index</span>
                  <span className="text-rose-300">{Math.round(crime)}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Tourism Flow</span>
                  <span className="text-sky-300">{Math.round(tourism)} / 100</span>
                </div>
              </div>
              <div className="space-y-3">
                {Object.entries(needs).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="capitalize">{key} coverage</span>
                      <span>{value}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${value > 80 ? 'bg-emerald-400' : value > 60 ? 'bg-amber-400' : 'bg-rose-400'}`}
                        style={{ width: `${Math.min(100, value)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Supply Chain Flow</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Food</span>
                  <span className="text-emerald-300">{production.food} produced · {demand.food} consumed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Goods</span>
                  <span className="text-emerald-300">{production.goods} produced · {demand.goods} consumed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Power</span>
                  <span className="text-emerald-300">{production.power} generated · {demand.power} used</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Water</span>
                  <span className="text-emerald-300">{production.water} processed · {demand.water} used</span>
                </div>
              </div>
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
                <p>Transport score: {Math.max(40, 70 + counts.road * 2 + counts.transit * 4 - counts.factory * 3)}%</p>
                <p className="mt-1">Logistics bottlenecks appear when traffic exceeds 70%.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Policies & Taxes</h2>
            <div>
              <label className="text-xs text-slate-400">Tax Rate: {taxRate}%</label>
              <input
                type="range"
                min={5}
                max={25}
                value={taxRate}
                onChange={(event) => setTaxRate(Number(event.target.value))}
                className="w-full accent-emerald-400"
              />
            </div>
            <div className="space-y-2">
              {POLICIES.map((policy) => (
                <button
                  key={policy.id}
                  onClick={() => togglePolicy(policy.id)}
                  className={`w-full rounded-xl border p-3 text-left text-xs transition ${
                    activePolicies.includes(policy.id)
                      ? 'border-emerald-400/70 bg-emerald-500/10 text-emerald-200'
                      : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-sm font-semibold">{policy.name}</p>
                  <p>{policy.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Disaster & Safety</h2>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-rose-300" /> Flood Risk</span>
                <span className="text-rose-300">Medium</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-300" /> Power Blackouts</span>
                <span className="text-amber-300">Low</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-sky-300" /> Cyber Attacks</span>
                <span className="text-sky-300">Low</span>
              </div>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
              Emergency response coverage: {Math.min(98, 62 + counts.road * 1.5 + counts.transit * 2)}%
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Tech Tree & Objectives</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><CircuitBoard className="w-4 h-4 text-emerald-300" /> Smart Grid</span>
                <span className="text-emerald-300">Unlocked</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-slate-400" /> Trade Logistics</span>
                <span className="text-slate-400">Researching</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><CircuitBoard className="w-4 h-4 text-slate-500" /> AI Traffic Control</span>
                <span className="text-slate-500">Locked</span>
              </div>
            </div>
            <div className="space-y-2">
              {objectives.map((objective) => (
                <div
                  key={objective.id}
                  className={`flex items-center justify-between text-xs border rounded-lg px-3 py-2 ${
                    objective.complete ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-200' : 'border-slate-800 bg-slate-950/40 text-slate-400'
                  }`}
                >
                  <span>{objective.label}</span>
                  <span>{objective.complete ? 'Complete' : 'In progress'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Market Prices</h2>
            <div className="space-y-3">
              {market.map((good) => (
                <div key={good.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-emerald-300">{good.icon}</span>
                    <span>{good.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${good.price.toFixed(1)}</p>
                    <p className={`text-xs ${good.change >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {good.change >= 0 ? '+' : ''}
                      {good.change.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">Export/import prices fluctuate each day based on global demand.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
