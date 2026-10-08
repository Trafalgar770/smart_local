export interface ServiceDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  active: boolean;
  typicalPriceMin: number;
  typicalPriceMax: number;
  unit: string;
  keywords: string[];
  safetyAdvice: string;
  defaultChecklist: {
    text: string;
    safetyLevel: 'normal' | 'caution' | 'danger';
  }[];
}

export const SERVICES: ServiceDefinition[] = [
  {
    id: '11111111-1111-1111-1111-000000000001',
    name: 'Plumber',
    slug: 'plumber',
    description: 'Pipe leaks, tap replacement, drainage, bathroom fittings & water tank repair',
    icon: 'Wrench',
    active: true,
    typicalPriceMin: 249,
    typicalPriceMax: 899,
    unit: 'visiting & basic fix',
    keywords: ['leak', 'pipe', 'water', 'tap', 'drain', 'flush', 'toilet', 'sink', 'tank', 'overflow', 'faucet', 'seepage', 'choke', 'clog'],
    safetyAdvice: 'If water is pooling near electrical switches or sockets, turn off your main electrical MCB immediately.',
    defaultChecklist: [
      { text: 'Have you turned off the main water valve / overhead stopcock?', safetyLevel: 'normal' },
      { text: 'Is water leaking near any electrical switches or power outlets?', safetyLevel: 'danger' },
      { text: 'Is the leak causing dirty or contaminated water backup?', safetyLevel: 'caution' },
      { text: 'Can you see the exact crack or joint where the water originates?', safetyLevel: 'normal' },
      { text: 'Is this an emergency affecting multiple rooms or neighbors?', safetyLevel: 'caution' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000002',
    name: 'Electrician',
    slug: 'electrician',
    description: 'Short circuits, MCB tripping, fan/switch repair, wiring & inverter setup',
    icon: 'Zap',
    active: true,
    typicalPriceMin: 299,
    typicalPriceMax: 1199,
    unit: 'inspection & repair',
    keywords: ['shock', 'spark', 'current', 'mcb', 'tripping', 'switch', 'socket', 'wire', 'wiring', 'inverter', 'fan', 'light', 'burnt', 'smell', 'fuse', 'power cut'],
    safetyAdvice: 'DO NOT touch exposed copper wires or metal appliances with wet hands or bare feet. Turn off the main switchboard MCB.',
    defaultChecklist: [
      { text: 'Did you hear a pop, see sparks, or smell burning plastic/rubber?', safetyLevel: 'danger' },
      { text: 'Has the main MCB tripped and refuses to reset when turned on?', safetyLevel: 'caution' },
      { text: 'Are other neighboring houses also experiencing a power failure?', safetyLevel: 'normal' },
      { text: 'Is any metal surface or appliance delivering a mild electric shock?', safetyLevel: 'danger' },
      { text: 'Have you disconnected sensitive electronics from the suspect sockets?', safetyLevel: 'normal' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000003',
    name: 'Painter',
    slug: 'painter',
    description: 'Interior/exterior wall painting, waterproofing touch-ups & enamel polishing',
    icon: 'Paintbrush',
    active: true,
    typicalPriceMin: 499,
    typicalPriceMax: 4500,
    unit: 'touch-up / per room',
    keywords: ['paint', 'color', 'whitewash', 'distemper', 'putty', 'primer', 'wall', 'peeling', 'dampness', 'waterproofing', 'stain', 'enamel'],
    safetyAdvice: 'Ensure adequate room ventilation if using solvent-based paint primers or enamel coatings.',
    defaultChecklist: [
      { text: 'Is the wall surface currently damp, leaking, or blistering with moisture?', safetyLevel: 'caution' },
      { text: 'Do you already have the required paint and primer materials on site?', safetyLevel: 'normal' },
      { text: 'Is the work focused on a single wall/patch or an entire room?', safetyLevel: 'normal' },
      { text: 'Is scaffolding or high exterior ladder access required?', safetyLevel: 'caution' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000004',
    name: 'Labour',
    slug: 'labour',
    description: 'Heavy lifting, material shifting, loading/unloading & manual site assistance',
    icon: 'HardHat',
    active: true,
    typicalPriceMin: 450,
    typicalPriceMax: 1200,
    unit: 'half day / full day',
    keywords: ['helper', 'lifting', 'shifting', 'loading', 'unloading', 'heavy', 'boxes', 'cement', 'debris', 'malba', 'manual work', 'porter'],
    safetyAdvice: 'Ensure workers have clear walkways without sharp nails or fragile obstacles during heavy lifting.',
    defaultChecklist: [
      { text: 'Are the items heavier than 40 kg requiring two or more people?', safetyLevel: 'caution' },
      { text: 'Is there a working lift / elevator available, or will stairs be used?', safetyLevel: 'normal' },
      { text: 'Are any items fragile, glass-heavy, or chemical containers?', safetyLevel: 'caution' },
      { text: 'Is this work scheduled for immediate dispatch today?', safetyLevel: 'normal' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000005',
    name: 'Fuel Delivery',
    slug: 'fuel-delivery',
    description: 'Emergency roadside petrol & diesel jerry-can delivery for stranded vehicles',
    icon: 'Fuel',
    active: true,
    typicalPriceMin: 350,
    typicalPriceMax: 850,
    unit: 'delivery fee + fuel cost',
    keywords: ['petrol', 'diesel', 'out of fuel', 'fuel empty', 'gas ran out', 'tank dry', 'stranded highway', 'jerry can'],
    safetyAdvice: 'Turn on hazard warning blinkers and pull your vehicle as far onto the shoulder as safely possible.',
    defaultChecklist: [
      { text: 'Is your vehicle safely parked on the highway shoulder with hazard lights ON?', safetyLevel: 'danger' },
      { text: 'Are you 100% sure of your fuel type (Petrol vs Diesel vs CNG)?', safetyLevel: 'caution' },
      { text: 'Is your fuel gauge showing zero or was there an engine stutter before stopping?', safetyLevel: 'normal' },
      { text: 'Do you know your nearest landmark or highway kilometer milestone?', safetyLevel: 'normal' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000006',
    name: 'Bike Mechanic',
    slug: 'bike-mechanic',
    description: 'Two-wheeler breakdown, clutch cable, engine starting issue & roadside repairs',
    icon: 'Bike',
    active: true,
    typicalPriceMin: 249,
    typicalPriceMax: 799,
    unit: 'roadside assistance',
    keywords: ['bike', 'motorcycle', 'scooter', 'scooty', 'activa', 'pulsar', 'clutch wire', 'kick start', 'spark plug', 'chain', 'gear', 'choke'],
    safetyAdvice: 'Park on flat solid ground away from high-speed traffic. Wear helmet and stay behind guardrail if on an expressway.',
    defaultChecklist: [
      { text: 'Does the self-starter motor make a clicking sound or no sound at all?', safetyLevel: 'normal' },
      { text: 'Is the engine kill switch / side stand sensor in the RUN position?', safetyLevel: 'normal' },
      { text: 'Did the drive chain snap or slip off the sprocket?', safetyLevel: 'caution' },
      { text: 'Is there any fuel or engine oil leaking beneath the motorcycle?', safetyLevel: 'caution' },
      { text: 'Does the kick-starter pedal have firm compression or feel loose?', safetyLevel: 'normal' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000007',
    name: 'Car Mechanic',
    slug: 'car-mechanic',
    description: 'Engine diagnosis, brake failure, radiator overheating, clutch & roadside assistance',
    icon: 'Car',
    active: true,
    typicalPriceMin: 499,
    typicalPriceMax: 1899,
    unit: 'on-spot roadside diagnostic',
    keywords: ['car', 'engine', 'brake', 'radiator', 'steam', 'overheating', 'coolant', 'smoke', 'clutch pedal', 'gear shift', 'alternator', 'car breakdown', 'check engine light'],
    safetyAdvice: 'DO NOT open the radiator cap if the engine is hot! Scalding pressurized steam can cause severe burns.',
    defaultChecklist: [
      { text: 'Is steam or white smoke rising from under the bonnet?', safetyLevel: 'danger' },
      { text: 'Does the brake pedal feel completely soft, sink to the floor, or have no stopping power?', safetyLevel: 'danger' },
      { text: 'Does the engine crank and turn over when you turn the ignition key?', safetyLevel: 'normal' },
      { text: 'Are any warning symbols lit on the dashboard (oil pressure, temperature, check engine)?', safetyLevel: 'caution' },
      { text: 'Is there a puddle of fluid (green coolant, black oil, red transmission) under the vehicle?', safetyLevel: 'caution' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000008',
    name: 'Puncture Repair',
    slug: 'puncture-repair',
    description: 'On-spot tubeless puncture patching, tyre replacement & air inflation',
    icon: 'Disc',
    active: true,
    typicalPriceMin: 149,
    typicalPriceMax: 399,
    unit: 'per puncture / tyre',
    keywords: ['puncture', 'flat tyre', 'flat tire', 'tyre air', 'tube', 'tubeless', 'nail in tyre', 'stepney', 'jack', 'spare wheel', 'low pressure'],
    safetyAdvice: 'Never drive on a completely flat rim; this ruins the alloy wheel and risks catastrophic tyre sidewall blowouts.',
    defaultChecklist: [
      { text: 'Can you see a visible nail, screw, or piece of glass in the tyre tread?', safetyLevel: 'normal' },
      { text: 'Do you have a functional spare wheel (stepney) and wheel jack in the vehicle?', safetyLevel: 'normal' },
      { text: 'Is the tyre rim sitting completely on the road tarmac?', safetyLevel: 'caution' },
      { text: 'Is the vehicle parked on level, firm ground rather than a steep slope?', safetyLevel: 'caution' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000009',
    name: 'Battery / Jump Start',
    slug: 'battery-jump-start',
    description: 'Dead battery jump start, terminal servicing, voltage check & replacement delivery',
    icon: 'BatteryCharging',
    active: true,
    typicalPriceMin: 299,
    typicalPriceMax: 699,
    unit: 'jump start / diagnostic fee',
    keywords: ['battery', 'dead battery', 'jump start', 'jumper cable', 'car wont start', 'clicking sound', 'headlights dim', 'exide', 'amaron', 'alternator'],
    safetyAdvice: 'Keep sparks away from battery terminals. Car batteries emit flammable hydrogen gas during rapid charging.',
    defaultChecklist: [
      { text: 'Do the headlights or dashboard lights dim drastically when attempting to crank?', safetyLevel: 'normal' },
      { text: 'Do you hear rapid clicking from the starter relay without engine turn?', safetyLevel: 'normal' },
      { text: 'Is there white or bluish powdery corrosion buildup on the battery terminals?', safetyLevel: 'caution' },
      { text: 'Has the vehicle been standing idle for more than 7–10 days?', safetyLevel: 'normal' },
      { text: 'Did you accidentally leave the headlights or cabin dome light ON overnight?', safetyLevel: 'normal' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000010',
    name: 'Towing',
    slug: 'towing',
    description: 'Flatbed & wheel-lift emergency breakdown towing to nearest workshop',
    icon: 'Truck',
    active: true,
    typicalPriceMin: 1200,
    typicalPriceMax: 3500,
    unit: 'base fee + per km',
    keywords: ['tow', 'towing', 'tow truck', 'flatbed', 'accident recovery', 'transmission jammed', 'cannot drive', 'haul car', 'breakdown tow'],
    safetyAdvice: 'Place hazard triangles at least 30 meters behind your vehicle if stranded on a fast road or flyover.',
    defaultChecklist: [
      { text: 'Can the vehicle wheels turn freely in neutral, or are the wheels/axle locked?', safetyLevel: 'caution' },
      { text: 'Is this an automatic transmission vehicle requiring flatbed towing?', safetyLevel: 'caution' },
      { text: 'Was the vehicle involved in a collision with severe body or suspension damage?', safetyLevel: 'danger' },
      { text: 'Do you know the target garage or dealer workshop destination address?', safetyLevel: 'normal' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000011',
    name: 'Carpenter',
    slug: 'carpenter',
    description: 'Door hinge repair, lock fixing, furniture assembly & wooden cabinet work',
    icon: 'Hammer',
    active: true,
    typicalPriceMin: 299,
    typicalPriceMax: 1499,
    unit: 'service visit & repair',
    keywords: ['wood', 'door', 'lock', 'hinge', 'cabinet', 'drawer', 'furniture', 'bed', 'wardrobe', 'table', 'plywood', 'latch', 'window frame'],
    safetyAdvice: 'Do not force jammed deadbolts as broken key fragments inside keyholes can make emergency entry difficult.',
    defaultChecklist: [
      { text: 'Is a door or main entrance lock completely jammed preventing entry or exit?', safetyLevel: 'caution' },
      { text: 'Is the wooden frame swollen from rain/humidity or is the hinge loose?', safetyLevel: 'normal' },
      { text: 'Do you have replacement hardware (hinges, screws, handles) ready on hand?', safetyLevel: 'normal' },
      { text: 'Is any heavy hanging cabinet or shelf detached and at risk of falling?', safetyLevel: 'danger' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000012',
    name: 'AC Repair',
    slug: 'ac-repair',
    description: 'Cooling troubleshooting, gas charging, compressor repair, filter & leak fix',
    icon: 'Snowflake',
    active: true,
    typicalPriceMin: 349,
    typicalPriceMax: 2499,
    unit: 'inspection & minor service',
    keywords: ['ac', 'air conditioner', 'split ac', 'window ac', 'not cooling', 'cooling problem', 'gas leak', 'freon', 'compressor', 'water leaking ac', 'ac noise', 'ice forming'],
    safetyAdvice: 'If the AC indoor unit is throwing sparks or smelling like burnt wire, turn off the AC MCB on the switchboard immediately.',
    defaultChecklist: [
      { text: 'Is the outdoor compressor unit turning ON and fan spinning, or only indoor blower?', safetyLevel: 'normal' },
      { text: 'Is the remote set to COOL mode with temperature set below ambient room temp (e.g. 24°C)?', safetyLevel: 'normal' },
      { text: 'Is ice forming visibly on the indoor copper pipes or front cooling coil?', safetyLevel: 'caution' },
      { text: 'Is water leaking continuously from the front indoor unit inside your room?', safetyLevel: 'caution' },
      { text: 'Does the AC unit trip the room MCB as soon as the compressor kicks in?', safetyLevel: 'danger' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000013',
    name: 'Welder',
    slug: 'welder',
    description: 'Iron gate, window grill, metal railing welding & structural fabrication repairs',
    icon: 'Flame',
    active: true,
    typicalPriceMin: 399,
    typicalPriceMax: 1800,
    unit: 'on-site welding fix',
    keywords: ['weld', 'welding', 'iron', 'gate', 'grill', 'railing', 'metal', 'fabrication', 'steel', 'hinge weld', 'broken iron', 'tin shed'],
    safetyAdvice: 'Never look directly at electric welding arcs without dark protective shade goggles to avoid cornea flash burns.',
    defaultChecklist: [
      { text: 'Is an iron gate or balcony safety railing structurally hanging and dangerous?', safetyLevel: 'danger' },
      { text: 'Is there a 15-Amp power point available nearby for the welding machine?', safetyLevel: 'normal' },
      { text: 'Are there flammable items, curtains, or petrol/gas tanks within 5 meters of the work zone?', safetyLevel: 'danger' },
      { text: 'Is the break at a clean joint or is the metal completely rusted through?', safetyLevel: 'normal' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000014',
    name: 'Mason / Construction',
    slug: 'mason-construction',
    description: 'Brickwork, tile repair, plaster patching, concrete repairs & civil restoration',
    icon: 'Layers',
    active: true,
    typicalPriceMin: 599,
    typicalPriceMax: 2800,
    unit: 'daily rate / repair patch',
    keywords: ['mason', 'mistri', 'brick', 'cement', 'tile', 'plaster', 'wall crack', 'concrete', 'flooring', 'grouting', 'parapet', 'civil work'],
    safetyAdvice: 'If wall cracks are wider than 5mm and expanding rapidly, avoid standing underneath structural beams.',
    defaultChecklist: [
      { text: 'Are the cracks hairline surface plaster cracks or deep structural fissures?', safetyLevel: 'caution' },
      { text: 'Are loose tiles or loose balcony plaster pieces in danger of falling from height?', safetyLevel: 'danger' },
      { text: 'Do you have matching spare replacement tiles stored at home?', safetyLevel: 'normal' },
      { text: 'Is the masonry area currently exposed to active rainfall or water leaks?', safetyLevel: 'normal' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000015',
    name: 'Movers',
    slug: 'movers',
    description: 'House shifting, furniture moving, vehicle loading & packing logistics',
    icon: 'Package',
    active: true,
    typicalPriceMin: 1499,
    typicalPriceMax: 9500,
    unit: 'local shifting package',
    keywords: ['packers', 'movers', 'house shifting', 'relocation', 'tempo', 'chhota hathi', 'truck', 'furniture shifting', 'packing boxes'],
    safetyAdvice: 'Keep valuable jewellery, personal identification documents, and laptops with you in your private bag.',
    defaultChecklist: [
      { text: 'Do both your source and destination buildings have working service elevators?', safetyLevel: 'normal' },
      { text: 'Do you have delicate electronics (large OLED TV, desktop monitor) needing bubble wrap?', safetyLevel: 'caution' },
      { text: 'Do you need disassembling of double beds and modular wardrobes?', safetyLevel: 'normal' },
      { text: 'Is vehicle parking available close to the building entrance gate?', safetyLevel: 'normal' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000016',
    name: 'Appliance Repair',
    slug: 'appliance-repair',
    description: 'Refrigerator, microwave, washing machine, geyser & television diagnostics',
    icon: 'Tv',
    active: true,
    typicalPriceMin: 299,
    typicalPriceMax: 1499,
    unit: 'inspection & diagnostic visit',
    keywords: ['fridge', 'refrigerator', 'washing machine', 'microwave', 'oven', 'geyser', 'water heater', 'tv', 'television', 'cooler', 'chimney', 'dishwasher'],
    safetyAdvice: 'Unplug the appliance power cord from the wall socket before inspecting water tanks or rear panels.',
    defaultChecklist: [
      { text: 'Have you unplugged the appliance from the wall socket?', safetyLevel: 'normal' },
      { text: 'Is there water leaking out from the bottom or back of the machine?', safetyLevel: 'caution' },
      { text: 'Did the appliance produce burning smell, smoke, or a loud electrical bang?', safetyLevel: 'danger' },
      { text: 'Is the display panel showing an error code (e.g. E1, dE, 4E)?', safetyLevel: 'normal' },
      { text: 'Is the appliance still covered under manufacturer brand warranty?', safetyLevel: 'normal' }
    ]
  },
  {
    id: '11111111-1111-1111-1111-000000000017',
    name: 'Other Services',
    slug: 'other-services',
    description: 'Specialized on-demand local assistance & custom technician requests',
    icon: 'Wrench',
    active: true,
    typicalPriceMin: 299,
    typicalPriceMax: 1200,
    unit: 'consultation & basic service',
    keywords: ['general repair', 'handyman', 'custom', 'fix', 'miscellaneous', 'other'],
    safetyAdvice: 'Assess if the task involves heights, gas lines, or high voltage before commencing work.',
    defaultChecklist: [
      { text: 'Is the issue urgent and posing an immediate safety hazard?', safetyLevel: 'caution' },
      { text: 'Can the issue be solved with standard household hand tools?', safetyLevel: 'normal' },
      { text: 'Do you need special replacement parts or raw materials to complete this?', safetyLevel: 'normal' }
    ]
  }
];

export const getServiceBySlug = (slug: string): ServiceDefinition | undefined => {
  return SERVICES.find(s => s.slug === slug);
};

export const getServiceById = (id: string): ServiceDefinition | undefined => {
  return SERVICES.find(s => s.id === id);
};
