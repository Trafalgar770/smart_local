-- SMART LOCAL SERVICE: Production Seed Data for India
-- Strictly NO cleaning or cleaner services

-- 1. SEED SERVICES
insert into public.services (id, name, slug, description, icon, active) values
  ('11111111-1111-1111-1111-000000000001', 'Plumber', 'plumber', 'Pipe leaks, tap replacement, drainage, bathroom fittings & water tank repair', 'Wrench', true),
  ('11111111-1111-1111-1111-000000000002', 'Electrician', 'electrician', 'Short circuits, MCB tripping, fan/switch repair, wiring & inverter setup', 'Zap', true),
  ('11111111-1111-1111-1111-000000000003', 'Painter', 'painter', 'Interior/exterior wall painting, waterproofing touch-ups & enamel polishing', 'Paintbrush', true),
  ('11111111-1111-1111-1111-000000000004', 'Labour', 'labour', 'Heavy lifting, material shifting, loading/unloading & manual site assistance', 'HardHat', true),
  ('11111111-1111-1111-1111-000000000005', 'Fuel Delivery', 'fuel-delivery', 'Emergency roadside petrol & diesel jerry-can delivery for stranded vehicles', 'Fuel', true),
  ('11111111-1111-1111-1111-000000000006', 'Bike Mechanic', 'bike-mechanic', 'Two-wheeler breakdown, clutch cable, engine starting issue & roadside repairs', 'Bike', true),
  ('11111111-1111-1111-1111-000000000007', 'Car Mechanic', 'car-mechanic', 'Engine diagnosis, brake failure, radiator overheating, clutch & roadside assistance', 'Car', true),
  ('11111111-1111-1111-1111-000000000008', 'Puncture Repair', 'puncture-repair', 'On-spot tubeless puncture patching, tyre replacement & air inflation', 'Disc', true),
  ('11111111-1111-1111-1111-000000000009', 'Battery / Jump Start', 'battery-jump-start', 'Dead battery jump start, terminal servicing, voltage check & replacement delivery', 'BatteryCharging', true),
  ('11111111-1111-1111-1111-000000000010', 'Towing', 'towing', 'Flatbed & wheel-lift emergency breakdown towing to nearest workshop', 'Truck', true),
  ('11111111-1111-1111-1111-000000000011', 'Carpenter', 'carpenter', 'Door hinge repair, lock fixing, furniture assembly & wooden cabinet work', 'Hammer', true),
  ('11111111-1111-1111-1111-000000000012', 'AC Repair', 'ac-repair', 'Cooling troubleshooting, gas charging, compressor repair, filter & leak fix', 'Snowflake', true),
  ('11111111-1111-1111-1111-000000000013', 'Welder', 'welder', 'Iron gate, window grill, metal railing welding & structural fabrication repairs', 'Flame', true),
  ('11111111-1111-1111-1111-000000000014', 'Mason / Construction', 'mason-construction', 'Brickwork, tile repair, plaster patching, concrete repairs & civil restoration', 'Layers', true),
  ('11111111-1111-1111-1111-000000000015', 'Movers', 'movers', 'House shifting, furniture moving, vehicle loading & packing logistics', 'Package', true),
  ('11111111-1111-1111-1111-000000000016', 'Appliance Repair', 'appliance-repair', 'Refrigerator, microwave, washing machine, geyser & television diagnostics', 'Tv', true),
  ('11111111-1111-1111-1111-000000000017', 'Other Services', 'other-services', 'Specialized on-demand local assistance & custom technician requests', 'Wrench', true)
on conflict (slug) do nothing;
