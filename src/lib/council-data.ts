export interface CouncilPolicy {
  state: string
  council: string
  lga: string
  minLotSize: number // sqm for standard KDR
  maxHeight: number // metres
  minSetbackFront: number // metres
  minSetbackSide: number // metres
  heritageRisk: 'Low' | 'Medium' | 'High'
  floodRisk: 'Low' | 'Medium' | 'High'
  bushfireRisk: 'Low' | 'Medium' | 'High'
  cdcEligible: boolean
  daTimelineWeeks: [number, number] // [min, max]
  avgDemolitionCost: [number, number] // AUD
  avgBuildCostPerSqm: [number, number] // AUD
  notes: string
}

export const COUNCIL_DATA: CouncilPolicy[] = [
  // NSW - Sydney
  {
    state: 'NSW', council: 'Blacktown City Council', lga: 'Blacktown',
    minLotSize: 450, maxHeight: 8.5, minSetbackFront: 6, minSetbackSide: 0.9,
    heritageRisk: 'Low', floodRisk: 'Medium', bushfireRisk: 'Low',
    cdcEligible: true, daTimelineWeeks: [12, 26],
    avgDemolitionCost: [18000, 28000], avgBuildCostPerSqm: [2200, 3200],
    notes: 'CDC available for lots >450sqm in R2 zone. Good for dual occupancy on 600sqm+.'
  },
  {
    state: 'NSW', council: 'Canterbury-Bankstown Council', lga: 'Canterbury-Bankstown',
    minLotSize: 450, maxHeight: 9, minSetbackFront: 4.5, minSetbackSide: 0.9,
    heritageRisk: 'Medium', floodRisk: 'High', bushfireRisk: 'Low',
    cdcEligible: true, daTimelineWeeks: [16, 32],
    avgDemolitionCost: [18000, 30000], avgBuildCostPerSqm: [2300, 3400],
    notes: 'Flood check critical near Georges River. Heritage items scattered across older suburbs.'
  },
  {
    state: 'NSW', council: 'Cumberland Council', lga: 'Cumberland',
    minLotSize: 400, maxHeight: 8.5, minSetbackFront: 4.5, minSetbackSide: 0.9,
    heritageRisk: 'Medium', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: true, daTimelineWeeks: [12, 24],
    avgDemolitionCost: [16000, 26000], avgBuildCostPerSqm: [2200, 3200],
    notes: 'Generally KDR-friendly. Strong demand for new builds in Merrylands, Wentworthville.'
  },
  {
    state: 'NSW', council: 'Georges River Council', lga: 'Georges River',
    minLotSize: 500, maxHeight: 9.5, minSetbackFront: 5.5, minSetbackSide: 0.9,
    heritageRisk: 'Medium', floodRisk: 'High', bushfireRisk: 'Low',
    cdcEligible: true, daTimelineWeeks: [16, 36],
    avgDemolitionCost: [20000, 32000], avgBuildCostPerSqm: [2500, 3800],
    notes: 'Flood overlay affects many lots near waterways. Heritage conservation areas in Hurstville.'
  },
  {
    state: 'NSW', council: 'Hills Shire Council', lga: 'The Hills',
    minLotSize: 450, maxHeight: 9, minSetbackFront: 6, minSetbackSide: 0.9,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'High',
    cdcEligible: true, daTimelineWeeks: [14, 28],
    avgDemolitionCost: [18000, 30000], avgBuildCostPerSqm: [2300, 3500],
    notes: 'Bushfire overlay critical in many parts. Council is responsive but require BAL assessment.'
  },
  {
    state: 'NSW', council: 'Hornsby Shire Council', lga: 'Hornsby',
    minLotSize: 500, maxHeight: 8.5, minSetbackFront: 7.5, minSetbackSide: 1.2,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'High',
    cdcEligible: false, daTimelineWeeks: [20, 40],
    avgDemolitionCost: [20000, 35000], avgBuildCostPerSqm: [2400, 3600],
    notes: 'Bushfire risk significant. Many lots require DA (not CDC). Steep blocks add cost.'
  },
  {
    state: 'NSW', council: 'Inner West Council', lga: 'Inner West',
    minLotSize: 600, maxHeight: 8.5, minSetbackFront: 6, minSetbackSide: 1.2,
    heritageRisk: 'High', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [24, 52],
    avgDemolitionCost: [22000, 38000], avgBuildCostPerSqm: [2800, 4500],
    notes: 'Extensive heritage conservation areas. Nearly all KDR requires DA + Heritage impact statement.'
  },
  {
    state: 'NSW', council: 'Liverpool City Council', lga: 'Liverpool',
    minLotSize: 450, maxHeight: 9, minSetbackFront: 4.5, minSetbackSide: 0.9,
    heritageRisk: 'Low', floodRisk: 'Medium', bushfireRisk: 'Low',
    cdcEligible: true, daTimelineWeeks: [12, 24],
    avgDemolitionCost: [16000, 26000], avgBuildCostPerSqm: [2100, 3100],
    notes: 'Generally KDR-friendly. Some flood-affected areas near Georges River tributaries.'
  },
  {
    state: 'NSW', council: 'Northern Beaches Council', lga: 'Northern Beaches',
    minLotSize: 500, maxHeight: 8.5, minSetbackFront: 6, minSetbackSide: 1.2,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Medium',
    cdcEligible: true, daTimelineWeeks: [20, 40],
    avgDemolitionCost: [22000, 38000], avgBuildCostPerSqm: [3000, 5000],
    notes: 'Premium location = premium build costs. SEPP Coastal Management applies near beaches.'
  },
  {
    state: 'NSW', council: 'North Sydney Council', lga: 'North Sydney',
    minLotSize: 600, maxHeight: 9.5, minSetbackFront: 7.5, minSetbackSide: 1.2,
    heritageRisk: 'High', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [24, 52],
    avgDemolitionCost: [24000, 42000], avgBuildCostPerSqm: [3200, 5500],
    notes: 'Many lots heritage listed. KADS (Knock and Drill) is tightly controlled here.'
  },
  {
    state: 'NSW', council: 'Parramatta City Council', lga: 'Parramatta',
    minLotSize: 400, maxHeight: 9, minSetbackFront: 4.5, minSetbackSide: 0.9,
    heritageRisk: 'Medium', floodRisk: 'Medium', bushfireRisk: 'Low',
    cdcEligible: true, daTimelineWeeks: [14, 28],
    avgDemolitionCost: [18000, 30000], avgBuildCostPerSqm: [2300, 3400],
    notes: 'Good KDR market. Heritage items in older suburbs. Flood check required near river.'
  },
  {
    state: 'NSW', council: 'Penrith City Council', lga: 'Penrith',
    minLotSize: 450, maxHeight: 9, minSetbackFront: 6, minSetbackSide: 0.9,
    heritageRisk: 'Low', floodRisk: 'Medium', bushfireRisk: 'Medium',
    cdcEligible: true, daTimelineWeeks: [12, 22],
    avgDemolitionCost: [16000, 26000], avgBuildCostPerSqm: [2100, 3000],
    notes: 'Floodplain risk in low-lying areas near Nepean River. Bushfire risk to western fringe.'
  },
  {
    state: 'NSW', council: 'Randwick City Council', lga: 'Randwick',
    minLotSize: 450, maxHeight: 9.5, minSetbackFront: 6, minSetbackSide: 1.2,
    heritageRisk: 'Medium', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [20, 42],
    avgDemolitionCost: [22000, 40000], avgBuildCostPerSqm: [3000, 5000],
    notes: 'Strong KDR demand. Some heritage conservation areas. Coastal proximity adds complexity.'
  },
  {
    state: 'NSW', council: 'Ryde City Council', lga: 'Ryde',
    minLotSize: 550, maxHeight: 9, minSetbackFront: 6, minSetbackSide: 0.9,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: true, daTimelineWeeks: [14, 28],
    avgDemolitionCost: [20000, 32000], avgBuildCostPerSqm: [2600, 3800],
    notes: 'Good CDC pathway available. Strong Chinese community = high KDR demand.'
  },
  {
    state: 'NSW', council: 'Strathfield Council', lga: 'Strathfield',
    minLotSize: 650, maxHeight: 9, minSetbackFront: 7.5, minSetbackSide: 1.2,
    heritageRisk: 'High', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: true, daTimelineWeeks: [24, 52],
    avgDemolitionCost: [28000, 50000], avgBuildCostPerSqm: [2800, 4200],
    notes: 'High-value KDR market. Multiple Heritage Conservation Areas (HCAs) — CDC not available in HCA lots. Setback is average of adjacent properties (not fixed 7.5m). Asbestos common in pre-1987 homes — budget $8k-20k for asbestos removal. Section 7.11 contributions ~$12k-18k. OSD stormwater tank required (~$8k-15k). Actual DA processing 6-12 months despite 16-week statutory target.'
  },
  {
    state: 'NSW', council: 'Sutherland Shire Council', lga: 'Sutherland',
    minLotSize: 550, maxHeight: 9, minSetbackFront: 7.5, minSetbackSide: 0.9,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'High',
    cdcEligible: true, daTimelineWeeks: [16, 32],
    avgDemolitionCost: [20000, 34000], avgBuildCostPerSqm: [2500, 3800],
    notes: 'Significant bushfire overlay. BAL assessment required in many areas. Beautiful area = high build quality expected.'
  },
  {
    state: 'NSW', council: 'Waverley Council', lga: 'Waverley',
    minLotSize: 300, maxHeight: 8.5, minSetbackFront: 5.5, minSetbackSide: 0.9,
    heritageRisk: 'High', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [24, 52],
    avgDemolitionCost: [22000, 40000], avgBuildCostPerSqm: [3500, 6000],
    notes: 'Bondi area. Heavy heritage overlay. Nearly all lots require DA. Premium costs.'
  },
  {
    state: 'NSW', council: 'Woollahra Council', lga: 'Woollahra',
    minLotSize: 400, maxHeight: 9, minSetbackFront: 6, minSetbackSide: 1.2,
    heritageRisk: 'High', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [26, 60],
    avgDemolitionCost: [25000, 45000], avgBuildCostPerSqm: [3800, 7000],
    notes: 'Most expensive and most restricted. Double Bay/Paddington. Heritage is near-universal.'
  },
  {
    state: 'NSW', council: 'Ku-ring-gai Council', lga: 'Ku-ring-gai',
    minLotSize: 600, maxHeight: 9.5, minSetbackFront: 8.5, minSetbackSide: 1.5,
    heritageRisk: 'Medium', floodRisk: 'Low', bushfireRisk: 'Medium',
    cdcEligible: false, daTimelineWeeks: [24, 48],
    avgDemolitionCost: [22000, 38000], avgBuildCostPerSqm: [2800, 4500],
    notes: 'Large lot requirements. Tree preservation significant. Bushfire in northern parts.'
  },
  {
    state: 'NSW', council: 'Lane Cove Council', lga: 'Lane Cove',
    minLotSize: 550, maxHeight: 9, minSetbackFront: 7.5, minSetbackSide: 1.2,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: true, daTimelineWeeks: [16, 32],
    avgDemolitionCost: [22000, 36000], avgBuildCostPerSqm: [2800, 4200],
    notes: 'Relatively straightforward KDR. Strong North Shore market.'
  },
  // NSW Regional
  {
    state: 'NSW', council: 'Newcastle City Council', lga: 'Newcastle',
    minLotSize: 400, maxHeight: 8.5, minSetbackFront: 4.5, minSetbackSide: 0.9,
    heritageRisk: 'Medium', floodRisk: 'Medium', bushfireRisk: 'Low',
    cdcEligible: true, daTimelineWeeks: [12, 22],
    avgDemolitionCost: [14000, 24000], avgBuildCostPerSqm: [2000, 2900],
    notes: 'Growing KDR market. Heritage in city core. Storm surge risk near coast.'
  },
  {
    state: 'NSW', council: 'Wollongong City Council', lga: 'Wollongong',
    minLotSize: 400, maxHeight: 9, minSetbackFront: 4.5, minSetbackSide: 0.9,
    heritageRisk: 'Low', floodRisk: 'Medium', bushfireRisk: 'Medium',
    cdcEligible: true, daTimelineWeeks: [14, 26],
    avgDemolitionCost: [14000, 24000], avgBuildCostPerSqm: [2000, 2900],
    notes: 'Escarpment areas have bushfire risk. Coastal flood risk in low areas.'
  },
  // VIC - Melbourne
  {
    state: 'VIC', council: 'Bayside City Council', lga: 'Bayside',
    minLotSize: 500, maxHeight: 9, minSetbackFront: 6, minSetbackSide: 1.2,
    heritageRisk: 'Medium', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [16, 36],
    avgDemolitionCost: [18000, 30000], avgBuildCostPerSqm: [2800, 4500],
    notes: 'Brighton/Sandringham area. Heritage overlays common. Planning Permit required.'
  },
  {
    state: 'VIC', council: 'Boroondara City Council', lga: 'Boroondara',
    minLotSize: 500, maxHeight: 9, minSetbackFront: 7.5, minSetbackSide: 1.2,
    heritageRisk: 'High', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [20, 48],
    avgDemolitionCost: [20000, 35000], avgBuildCostPerSqm: [3000, 5000],
    notes: 'Hawthorn/Camberwell. Very strong heritage controls. Expect significant delays.'
  },
  {
    state: 'VIC', council: 'Casey City Council', lga: 'Casey',
    minLotSize: 300, maxHeight: 9, minSetbackFront: 4.5, minSetbackSide: 0.9,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [10, 20],
    avgDemolitionCost: [14000, 22000], avgBuildCostPerSqm: [1900, 2800],
    notes: 'Newer outer suburb. KDR less common but growing. Straightforward planning process.'
  },
  {
    state: 'VIC', council: 'Darebin City Council', lga: 'Darebin',
    minLotSize: 400, maxHeight: 9, minSetbackFront: 4, minSetbackSide: 1.2,
    heritageRisk: 'Medium', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [14, 30],
    avgDemolitionCost: [16000, 26000], avgBuildCostPerSqm: [2400, 3600],
    notes: 'Preston/Northcote. Heritage overlays in inner streets. Good KDR demand.'
  },
  {
    state: 'VIC', council: 'Glen Eira City Council', lga: 'Glen Eira',
    minLotSize: 400, maxHeight: 9, minSetbackFront: 6, minSetbackSide: 1.2,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [14, 28],
    avgDemolitionCost: [16000, 26000], avgBuildCostPerSqm: [2400, 3600],
    notes: 'Caulfield/Carnegie area. Reasonable KDR environment. Good for townhouse development.'
  },
  {
    state: 'VIC', council: 'Knox City Council', lga: 'Knox',
    minLotSize: 350, maxHeight: 9, minSetbackFront: 5, minSetbackSide: 1.0,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [12, 22],
    avgDemolitionCost: [14000, 22000], avgBuildCostPerSqm: [2000, 2900],
    notes: 'Middle eastern suburbs. Good KDR activity. Straightforward process.'
  },
  {
    state: 'VIC', council: 'Manningham City Council', lga: 'Manningham',
    minLotSize: 500, maxHeight: 9, minSetbackFront: 7.5, minSetbackSide: 1.5,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [16, 32],
    avgDemolitionCost: [18000, 30000], avgBuildCostPerSqm: [2600, 4000],
    notes: 'Doncaster/Templestowe. Vegetated lots may require Arborist report.'
  },
  {
    state: 'VIC', council: 'Melbourne City Council', lga: 'Melbourne',
    minLotSize: 200, maxHeight: 11, minSetbackFront: 3, minSetbackSide: 0,
    heritageRisk: 'High', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [24, 60],
    avgDemolitionCost: [22000, 45000], avgBuildCostPerSqm: [3500, 7000],
    notes: 'Inner city. Most lots are apartments. KDR rare but possible for detached in Parkville etc.'
  },
  {
    state: 'VIC', council: 'Monash City Council', lga: 'Monash',
    minLotSize: 400, maxHeight: 9, minSetbackFront: 5, minSetbackSide: 1.2,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [14, 26],
    avgDemolitionCost: [16000, 26000], avgBuildCostPerSqm: [2300, 3400],
    notes: 'Clayton/Glen Waverley. High KDR activity especially from Asian community.'
  },
  {
    state: 'VIC', council: 'Moonee Valley City Council', lga: 'Moonee Valley',
    minLotSize: 350, maxHeight: 9, minSetbackFront: 4, minSetbackSide: 1.0,
    heritageRisk: 'Medium', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [14, 30],
    avgDemolitionCost: [16000, 26000], avgBuildCostPerSqm: [2400, 3600],
    notes: 'Essendon/Moonee Ponds. Good KDR market. Heritage in some streets.'
  },
  {
    state: 'VIC', council: 'Moreland City Council', lga: 'Moreland',
    minLotSize: 350, maxHeight: 9, minSetbackFront: 4, minSetbackSide: 1.0,
    heritageRisk: 'Medium', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [14, 30],
    avgDemolitionCost: [16000, 26000], avgBuildCostPerSqm: [2400, 3600],
    notes: 'Brunswick/Coburg. Heritage in inner streets. Strong renovation/KDR market.'
  },
  {
    state: 'VIC', council: 'Port Phillip City Council', lga: 'Port Phillip',
    minLotSize: 300, maxHeight: 9.5, minSetbackFront: 4, minSetbackSide: 0.9,
    heritageRisk: 'High', floodRisk: 'Medium', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [20, 48],
    avgDemolitionCost: [20000, 38000], avgBuildCostPerSqm: [3200, 5500],
    notes: 'St Kilda/South Melbourne. Heavy heritage. Sea level rise policy applying in coastal areas.'
  },
  {
    state: 'VIC', council: 'Whitehorse City Council', lga: 'Whitehorse',
    minLotSize: 400, maxHeight: 9, minSetbackFront: 5, minSetbackSide: 1.2,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [14, 28],
    avgDemolitionCost: [16000, 26000], avgBuildCostPerSqm: [2400, 3500],
    notes: 'Box Hill/Nunawading. Very active KDR market. Strong Chinese community. Developer-friendly.'
  },
  // QLD - Brisbane
  {
    state: 'QLD', council: 'Brisbane City Council', lga: 'Brisbane',
    minLotSize: 400, maxHeight: 9.5, minSetbackFront: 6, minSetbackSide: 1.5,
    heritageRisk: 'Medium', floodRisk: 'High', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [16, 36],
    avgDemolitionCost: [16000, 28000], avgBuildCostPerSqm: [2200, 3400],
    notes: 'Flood overlay critical - 2011 and 2022 floods. Character/Heritage overlay in inner suburbs. Pre-lodgement meeting recommended.'
  },
  {
    state: 'QLD', council: 'Gold Coast City Council', lga: 'Gold Coast',
    minLotSize: 400, maxHeight: 9, minSetbackFront: 6, minSetbackSide: 1.5,
    heritageRisk: 'Low', floodRisk: 'Medium', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [14, 28],
    avgDemolitionCost: [15000, 25000], avgBuildCostPerSqm: [2200, 3300],
    notes: 'Growing KDR market. Coastal/canal lots have additional requirements. Wind region considerations.'
  },
  {
    state: 'QLD', council: 'Sunshine Coast Council', lga: 'Sunshine Coast',
    minLotSize: 400, maxHeight: 9, minSetbackFront: 6, minSetbackSide: 1.5,
    heritageRisk: 'Low', floodRisk: 'Medium', bushfireRisk: 'Medium',
    cdcEligible: false, daTimelineWeeks: [14, 28],
    avgDemolitionCost: [14000, 24000], avgBuildCostPerSqm: [2100, 3200],
    notes: 'Coastal development regulations apply near beaches. Bushfire in hinterland.'
  },
  {
    state: 'QLD', council: 'Moreton Bay Regional Council', lga: 'Moreton Bay',
    minLotSize: 400, maxHeight: 8.5, minSetbackFront: 6, minSetbackSide: 1.5,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Medium',
    cdcEligible: false, daTimelineWeeks: [12, 24],
    avgDemolitionCost: [14000, 22000], avgBuildCostPerSqm: [1900, 2800],
    notes: 'Growing area north of Brisbane. Good KDR activity. Relatively straightforward.'
  },
  {
    state: 'QLD', council: 'Logan City Council', lga: 'Logan',
    minLotSize: 400, maxHeight: 8.5, minSetbackFront: 6, minSetbackSide: 1.5,
    heritageRisk: 'Low', floodRisk: 'Medium', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [12, 22],
    avgDemolitionCost: [13000, 22000], avgBuildCostPerSqm: [1800, 2700],
    notes: 'Affordable market. Good KDR opportunity. Some flood risk in low-lying areas.'
  },
  // WA - Perth
  {
    state: 'WA', council: 'City of Canning', lga: 'Canning',
    minLotSize: 350, maxHeight: 9, minSetbackFront: 4, minSetbackSide: 1.0,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [10, 20],
    avgDemolitionCost: [12000, 20000], avgBuildCostPerSqm: [1900, 2800],
    notes: 'South Perth area. Planning through MRS and local scheme. Generally straightforward.'
  },
  {
    state: 'WA', council: 'City of Fremantle', lga: 'Fremantle',
    minLotSize: 260, maxHeight: 10, minSetbackFront: 3, minSetbackSide: 0.9,
    heritageRisk: 'High', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [16, 36],
    avgDemolitionCost: [15000, 26000], avgBuildCostPerSqm: [2500, 4000],
    notes: 'Strong heritage controls in inner Fremantle. Character area requirements in many streets.'
  },
  {
    state: 'WA', council: 'City of Joondalup', lga: 'Joondalup',
    minLotSize: 350, maxHeight: 9, minSetbackFront: 4.5, minSetbackSide: 1.0,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [10, 20],
    avgDemolitionCost: [12000, 20000], avgBuildCostPerSqm: [1900, 2800],
    notes: 'Northern suburbs. Active KDR market. Straightforward approvals.'
  },
  {
    state: 'WA', council: 'City of Melville', lga: 'Melville',
    minLotSize: 350, maxHeight: 9, minSetbackFront: 4, minSetbackSide: 1.0,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [12, 22],
    avgDemolitionCost: [13000, 22000], avgBuildCostPerSqm: [2100, 3200],
    notes: 'Applecross/Mt Pleasant. Popular KDR area. Swan River lots attract premium pricing.'
  },
  {
    state: 'WA', council: 'City of Stirling', lga: 'Stirling',
    minLotSize: 350, maxHeight: 9, minSetbackFront: 4, minSetbackSide: 1.0,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [10, 20],
    avgDemolitionCost: [12000, 20000], avgBuildCostPerSqm: [1900, 2800],
    notes: 'Large north Perth LGA. High KDR volume. Efficient council.'
  },
  {
    state: 'WA', council: 'City of Swan', lga: 'Swan',
    minLotSize: 400, maxHeight: 9, minSetbackFront: 6, minSetbackSide: 1.0,
    heritageRisk: 'Low', floodRisk: 'Medium', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [10, 20],
    avgDemolitionCost: [12000, 20000], avgBuildCostPerSqm: [1800, 2700],
    notes: 'Eastern corridor. Flood risk near Swan River. Affordable KDR market.'
  },
  {
    state: 'WA', council: 'City of Wanneroo', lga: 'Wanneroo',
    minLotSize: 350, maxHeight: 9, minSetbackFront: 4.5, minSetbackSide: 1.0,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Medium',
    cdcEligible: false, daTimelineWeeks: [10, 20],
    avgDemolitionCost: [12000, 20000], avgBuildCostPerSqm: [1800, 2700],
    notes: 'Far north Perth. Growing area. Bushfire considerations on northern fringe.'
  },
  // SA - Adelaide
  {
    state: 'SA', council: 'City of Adelaide', lga: 'Adelaide',
    minLotSize: 200, maxHeight: 10, minSetbackFront: 3, minSetbackSide: 0,
    heritageRisk: 'High', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [16, 36],
    avgDemolitionCost: [14000, 24000], avgBuildCostPerSqm: [2200, 3500],
    notes: 'Inner Adelaide. Heritage state significant areas. Development Plan Consent required.'
  },
  {
    state: 'SA', council: 'City of Marion', lga: 'Marion',
    minLotSize: 300, maxHeight: 9, minSetbackFront: 4.5, minSetbackSide: 1.0,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [10, 20],
    avgDemolitionCost: [12000, 20000], avgBuildCostPerSqm: [1900, 2800],
    notes: 'Southern Adelaide. Active KDR market. Straightforward under new planning code.'
  },
  {
    state: 'SA', council: 'City of Norwood Payneham St Peters', lga: 'Norwood Payneham St Peters',
    minLotSize: 300, maxHeight: 9, minSetbackFront: 4.5, minSetbackSide: 1.0,
    heritageRisk: 'High', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [16, 36],
    avgDemolitionCost: [14000, 24000], avgBuildCostPerSqm: [2500, 4000],
    notes: 'Inner east. Character areas prevalent. Design quality requirements high.'
  },
  {
    state: 'SA', council: 'City of Onkaparinga', lga: 'Onkaparinga',
    minLotSize: 400, maxHeight: 8.5, minSetbackFront: 6, minSetbackSide: 1.0,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'High',
    cdcEligible: false, daTimelineWeeks: [12, 24],
    avgDemolitionCost: [12000, 20000], avgBuildCostPerSqm: [1800, 2800],
    notes: 'Hills fringe has significant bushfire risk (BAL-40 or FZ possible). CFS consultation required.'
  },
  {
    state: 'SA', council: 'City of Unley', lga: 'Unley',
    minLotSize: 280, maxHeight: 9, minSetbackFront: 5.5, minSetbackSide: 1.0,
    heritageRisk: 'High', floodRisk: 'Low', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [18, 40],
    avgDemolitionCost: [16000, 28000], avgBuildCostPerSqm: [2800, 4500],
    notes: 'Premium inner south. Extensive heritage controls. State Heritage area in parts of Millswood.'
  },
  // ACT
  {
    state: 'ACT', council: 'ACT Government', lga: 'Canberra',
    minLotSize: 500, maxHeight: 8.5, minSetbackFront: 6, minSetbackSide: 1.5,
    heritageRisk: 'Low', floodRisk: 'Low', bushfireRisk: 'Medium',
    cdcEligible: false, daTimelineWeeks: [14, 30],
    avgDemolitionCost: [14000, 24000], avgBuildCostPerSqm: [2500, 3800],
    notes: 'Land is leasehold (Crown). Lease variation may be required. ACTPLA manages approvals. Bushfire risk in outer suburbs (Tuggeranong, Belconnen hills).'
  },
  // TAS
  {
    state: 'TAS', council: 'City of Hobart', lga: 'Hobart',
    minLotSize: 350, maxHeight: 8.5, minSetbackFront: 5.5, minSetbackSide: 1.0,
    heritageRisk: 'Medium', floodRisk: 'Medium', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [12, 26],
    avgDemolitionCost: [12000, 20000], avgBuildCostPerSqm: [2100, 3200],
    notes: 'Heritage in Battery Point and Sandy Bay. Flood risk in lower areas. Growing market.'
  },
  {
    state: 'TAS', council: 'Launceston City Council', lga: 'Launceston',
    minLotSize: 350, maxHeight: 8.5, minSetbackFront: 5, minSetbackSide: 1.0,
    heritageRisk: 'Medium', floodRisk: 'Medium', bushfireRisk: 'Low',
    cdcEligible: false, daTimelineWeeks: [10, 22],
    avgDemolitionCost: [10000, 18000], avgBuildCostPerSqm: [1900, 2900],
    notes: 'Flood risk near Tamar River. Heritage in inner city. Smaller market but affordable.'
  },
  // NT
  {
    state: 'NT', council: 'Darwin City Council', lga: 'Darwin',
    minLotSize: 400, maxHeight: 10, minSetbackFront: 4.5, minSetbackSide: 1.0,
    heritageRisk: 'Low', floodRisk: 'Medium', bushfireRisk: 'Medium',
    cdcEligible: false, daTimelineWeeks: [10, 20],
    avgDemolitionCost: [12000, 22000], avgBuildCostPerSqm: [2200, 3500],
    notes: 'Cyclone wind region - C/D rating applies. Higher build costs for cyclone compliance. Wet season flooding risk.'
  },
]

export function findCouncil(query: string): CouncilPolicy | null {
  const q = query.toLowerCase()
  return COUNCIL_DATA.find(c =>
    c.lga.toLowerCase().includes(q) ||
    c.council.toLowerCase().includes(q)
  ) || null
}

export function findCouncilBySuburb(suburb: string, state?: string): CouncilPolicy | null {
  const suburbMap: Record<string, string> = {
    // NSW
    'bondi': 'Waverley', 'bondi beach': 'Waverley', 'coogee': 'Randwick',
    'maroubra': 'Randwick', 'kingsford': 'Randwick', 'randwick': 'Randwick',
    'paddington': 'Woollahra', 'double bay': 'Woollahra', 'edgecliff': 'Woollahra',
    'newtown': 'Inner West', 'leichhardt': 'Inner West', 'balmain': 'Inner West',
    'stanmore': 'Inner West', 'dulwich hill': 'Inner West',
    'strathfield': 'Strathfield', 'burwood': 'Strathfield',
    'parramatta': 'Parramatta', 'westmead': 'Parramatta', 'merrylands': 'Cumberland',
    'auburn': 'Cumberland', 'granville': 'Cumberland',
    'ryde': 'Ryde', 'meadowbank': 'Ryde', 'west ryde': 'Ryde', 'eastwood': 'Ryde',
    'blacktown': 'Blacktown', 'seven hills': 'Blacktown', 'toongabbie': 'Blacktown',
    'castle hill': 'The Hills', 'baulkham hills': 'The Hills', 'norwest': 'The Hills',
    'hornsby': 'Hornsby', 'waitara': 'Hornsby', 'wahroonga': 'Ku-ring-gai',
    'gordon': 'Ku-ring-gai', 'turramurra': 'Ku-ring-gai', 'pymble': 'Ku-ring-gai',
    'lane cove': 'Lane Cove', 'longueville': 'Lane Cove',
    'north sydney': 'North Sydney', 'crows nest': 'North Sydney',
    'dee why': 'Northern Beaches', 'manly': 'Northern Beaches', 'brookvale': 'Northern Beaches',
    'penrith': 'Penrith', 'st marys': 'Penrith', 'kingswood': 'Penrith',
    'liverpool': 'Liverpool', 'moorebank': 'Liverpool', 'casula': 'Liverpool',
    'bankstown': 'Canterbury-Bankstown', 'canterbury': 'Canterbury-Bankstown',
    'hurstville': 'Georges River', 'kogarah': 'Georges River',
    'sutherland': 'Sutherland', 'miranda': 'Sutherland', 'cronulla': 'Sutherland',
    'newcastle': 'Newcastle', 'hamilton': 'Newcastle',
    'wollongong': 'Wollongong', 'thirroul': 'Wollongong',
    // VIC
    'brighton': 'Bayside', 'sandringham': 'Bayside', 'hampton': 'Bayside',
    'hawthorn': 'Boroondara', 'camberwell': 'Boroondara', 'kew': 'Boroondara',
    'box hill': 'Whitehorse', 'nunawading': 'Whitehorse', 'forest hill': 'Whitehorse',
    'doncaster': 'Manningham', 'templestowe': 'Manningham',
    'glen waverley': 'Monash', 'clayton': 'Monash', 'oakleigh': 'Monash',
    'caulfield': 'Glen Eira', 'carnegie': 'Glen Eira', 'elsternwick': 'Glen Eira',
    'brunswick': 'Moreland', 'coburg': 'Moreland', 'preston': 'Darebin',
    'northcote': 'Darebin', 'thornbury': 'Darebin',
    'essendon': 'Moonee Valley', 'moonee ponds': 'Moonee Valley',
    'st kilda': 'Port Phillip', 'south melbourne': 'Port Phillip',
    'melbourne': 'Melbourne', 'cbd': 'Melbourne', 'parkville': 'Melbourne',
    // QLD
    'brisbane': 'Brisbane', 'fortitude valley': 'Brisbane', 'west end': 'Brisbane',
    'surfers paradise': 'Gold Coast', 'broadbeach': 'Gold Coast',
    'noosa': 'Sunshine Coast', 'caloundra': 'Sunshine Coast',
    // WA
    'fremantle': 'Fremantle', 'north fremantle': 'Fremantle',
    'applecross': 'Melville', 'mt pleasant': 'Melville',
    'cannington': 'Canning', 'bentley': 'Canning',
    // SA
    'unley': 'Unley', 'malvern': 'Unley',
    'marion': 'Marion', 'edwardstown': 'Marion',
    'norwood': 'Norwood Payneham St Peters',
    'hobart': 'Hobart', 'sandy bay': 'Hobart',
    // ACT
    'canberra': 'Canberra', 'belconnen': 'Canberra',
    // NT
    'darwin': 'Darwin',
  }

  const key = suburb.toLowerCase().trim()
  const lga = suburbMap[key]
  if (!lga) return null

  return COUNCIL_DATA.find(c =>
    c.lga === lga && (!state || c.state === state.toUpperCase())
  ) || null
}

export const STATE_COST_RANGES: Record<string, { demolition: [number, number], buildPerSqm: [number, number] }> = {
  NSW: { demolition: [15000, 35000], buildPerSqm: [2200, 4500] },
  VIC: { demolition: [14000, 32000], buildPerSqm: [2000, 4200] },
  QLD: { demolition: [13000, 28000], buildPerSqm: [1900, 3500] },
  WA: { demolition: [11000, 22000], buildPerSqm: [1800, 3200] },
  SA: { demolition: [12000, 24000], buildPerSqm: [1900, 3500] },
  ACT: { demolition: [14000, 24000], buildPerSqm: [2500, 3800] },
  TAS: { demolition: [10000, 20000], buildPerSqm: [1900, 3200] },
  NT: { demolition: [12000, 22000], buildPerSqm: [2200, 3500] },
}
