/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bug, Search, ShieldAlert, Zap, LifeBuoy, ChevronRight, Info, Globe, ExternalLink } from 'lucide-react';

interface IdentificationMarker {
  text: string;
  iconId: string;
  referenceUrl?: string;
}

interface LifeCycleStage {
  label: string;
  duration: string;
  description: string;
  iconId: 'egg' | 'larva' | 'pupa' | 'adult' | 'nymph';
}

export interface Pest {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  description: string;
  distribution: string;
  mapId: string;
  identification: IdentificationMarker[];
  lifeCycle: string;
  lifeCycleStages: LifeCycleStage[];
  controlMethods: {
    biological: string[];
    chemical: string[];
    cultural: string[];
  };
}

const REGION_MAPS: Record<string, React.ReactNode> = {
  'global': (
    <svg viewBox="0 0 100 50" className="w-full h-auto opacity-60 fill-emerald-600">
      <path d="M10,12 Q15,10 20,12 T30,10 T40,15 T50,12 T65,10 T80,12 T90,15 V30 Q80,40 60,35 T30,40 T10,30 Z" opacity="0.2" />
      <circle cx="20" cy="18" r="1.5" className="animate-pulse" />
      <circle cx="45" cy="15" r="1.5" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
      <circle cx="75" cy="20" r="1.5" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
      <circle cx="30" cy="35" r="1.5" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
      <circle cx="65" cy="32" r="1.5" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
      <circle cx="85" cy="28" r="1.5" className="animate-pulse" style={{ animationDelay: '1s' }} />
    </svg>
  ),
  'temperate': (
    <svg viewBox="0 0 100 50" className="w-full h-auto">
      <path d="M5,10 h90 v8 h-90 z" className="fill-emerald-200/40" /> {/* North Temperate */}
      <path d="M10,32 h80 v6 h-80 z" className="fill-emerald-200/40" /> {/* South Temperate */}
      <rect x="15" y="10" width="10" height="8" className="fill-emerald-600" />
      <rect x="45" y="10" width="15" height="8" className="fill-emerald-600" />
      <rect x="75" y="10" width="10" height="8" className="fill-emerald-600" />
    </svg>
  ),
  'invasive-spread': (
    <svg viewBox="0 0 100 50" className="w-full h-auto">
      <path d="M10,15 Q25,10 25,35 L10,35 Z" className="fill-emerald-800/40" /> {/* Native Range */}
      <g className="fill-emerald-500">
        <circle cx="35" cy="20" r="1.5" className="animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="55" cy="25" r="2" className="animate-ping" style={{ animationDuration: '4s' }} />
        <circle cx="80" cy="18" r="2.5" className="animate-ping" style={{ animationDuration: '5s' }} />
        <path d="M25,25 L40,20 M25,25 L65,30 M25,25 L85,20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="text-emerald-500/30" />
      </g>
    </svg>
  ),
  'tropical-band': (
    <svg viewBox="0 0 100 50" className="w-full h-auto">
      <rect x="0" y="18" width="100" height="14" className="fill-emerald-500/10" />
      <path d="M5,22 Q15,20 25,22 T45,20 T65,22 T85,20 T95,22" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500/40" />
      <rect x="10" y="20" width="15" height="10" rx="1" className="fill-emerald-600" />
      <rect x="40" y="20" width="20" height="10" rx="1" className="fill-emerald-600" />
      <rect x="75" y="20" width="15" height="10" rx="1" className="fill-emerald-600" />
    </svg>
  ),
  'arid-range': (
    <svg viewBox="0 0 100 50" className="w-full h-auto">
      <path d="M35,15 Q50,10 70,18 T85,25 T70,40 T45,35 Z" className="fill-amber-500/20" />
      <path d="M45,22 Q55,18 65,22 T75,28" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-600/40" />
      <circle cx="55" cy="25" r="4" className="fill-amber-600/40 blur-[1px]" />
      <circle cx="68" cy="28" r="3" className="fill-amber-600/30" />
    </svg>
  )
};

const PEST_ICONS: Record<string, React.ReactNode> = {
  'pear-body': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
    </svg>
  ),
  'antennae': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="m4 12 4-8M20 12l-4-8" />
    </svg>
  ),
  'cornicles': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M7 14l-3 4M17 14l3 4" />
    </svg>
  ),
  'clusters': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="8" cy="8" r="2" />
      <circle cx="16" cy="10" r="2" />
      <circle cx="12" cy="16" r="2" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="18" cy="17" r="1.5" />
    </svg>
  ),
  'inverted-y': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M12 22V12L4 4M12 12L20 4" />
    </svg>
  ),
  'dots-square': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="8" cy="8" r="2" />
      <circle cx="16" cy="8" r="2" />
      <circle cx="8" cy="16" r="2" />
      <circle cx="16" cy="16" r="2" />
    </svg>
  ),
  'stripes': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M4 8h16M4 12h16M4 16h16" />
    </svg>
  ),
  'micro-size': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" strokeDasharray="2 4" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  'webbing': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 4l16 16M20 4L4 20M12 4v16M4 12h16" />
    </svg>
  ),
  'stippling': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="6" cy="6" r="1" />
      <circle cx="12" cy="8" r="1" />
      <circle cx="18" cy="5" r="1" />
      <circle cx="15" cy="14" r="1" />
      <circle cx="5" cy="16" r="1" />
      <circle cx="10" cy="18" r="1" />
      <circle cx="19" cy="17" r="1" />
    </svg>
  ),
  'wings': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m12 12 8-8M12 12l-8-8M12 12l6 10M12 12l-6 10" />
    </svg>
  ),
  'cloud': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19a3.5 3.5 0 1 1 0-7c.3 0 .6 0 .9.1a5 5 0 1 1 9.6 2.4c.1.5.1 1 .1 1.5a6.5 6.5 0 1 1-13 0" />
    </svg>
  ),
  'leaf-yellow': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
      <path d="M11 2s-6 7-6 12a7 7 0 1 0 14 0c0-5-6-12-6-12z" />
    </svg>
  ),
  'locust-shape': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <path d="M4 12s2-4 4-4M16 8s2 4 4 4" />
    </svg>
  ),
  'color-shift': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="12" r="6" stroke="currentColor" strokeOpacity="0.5" />
      <circle cx="15" cy="12" r="6" fill="currentColor" fillOpacity="0.3" />
    </svg>
  ),
  'anatomy': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="m4 18 8-8 8 2" />
    </svg>
  ),
};

const STAGE_ICONS: Record<string, React.ReactNode> = {
  egg: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.69 2 6 4.69 6 8c0 3.31 2.69 6 6 6s6-2.69 6-6c0-3.31-2.69-6-6-6zM12 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" opacity="0.3"/>
      <circle cx="12" cy="10" r="4" />
    </svg>
  ),
  larva: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M3 12c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zM9 12c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zM15 12c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z" />
    </svg>
  ),
  nymph: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14M7 7l10 10M17 7L7 10" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  pupa: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v20M8 6c0 6 8 6 8 12M16 6c0 6-8 6-8 12" />
      <rect x="8" y="2" width="8" height="20" rx="4" opacity="0.2" fill="currentColor" stroke="none" />
    </svg>
  ),
  adult: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12 8 4M12 12l4-8M12 12l8 8M12 12l-8 8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

export const PESTS: Pest[] = [
  {
    id: '1',
    name: 'Aphids',
    scientificName: 'Aphidoidea',
    category: 'Sucking Insects',
    description: 'Small, soft-bodied insects that suck nutrient-rich liquids from plants.',
    distribution: 'Native to temperate Europe and Asia; now cosmopolitan and found worldwide, with highest diversity and impact in temperate zones.',
    mapId: 'global',
    identification: [
      { text: 'Pear-shaped bodies', iconId: 'pear-body', referenceUrl: 'https://www.invasive.org/browse/subthumb.cfm?sub=12141' },
      { text: 'Long antennae', iconId: 'antennae', referenceUrl: 'https://www.aphidsonworldsplants.info/morphology.htm' },
      { text: 'Cornicles (tail-pipe like) rear structures', iconId: 'cornicles', referenceUrl: 'https://bugguide.net/node/view/147' },
      { text: 'Often found in clusters on new growth', iconId: 'clusters', referenceUrl: 'https://extension.umn.edu/yard-and-garden-insects/aphids' }
    ],
    lifeCycle: 'Mostly asexual reproduction (parthenogenesis) during growing season, leading to rapid population explosions. Eggs overwinter in colder climates.',
    lifeCycleStages: [
      { label: 'Egg', duration: 'Overwinter', description: 'Eggs laid in fall, dormant through winter.', iconId: 'egg' },
      { label: 'Nymph', duration: '7-10 Days', description: 'Young aphids (crawlers) that mimic adults.', iconId: 'nymph' },
      { label: 'Adult', duration: '20-30 Days', description: 'Can be winged or wingless depending on density.', iconId: 'adult' }
    ],
    controlMethods: {
      biological: [
        'Release Ladybugs or Lacewings during the Nymph (crawler) stage when populations are small.',
        'Use Parasitic wasps (Aphidius colemani) in greenhouse environments at the first sign of infestation.'
      ],
      chemical: [
        'Apply Neem oil or Insecticidal soap in the early morning or late evening to coat leaf surfaces thoroughly during peak nymph activity.',
        'Pyrethroids should be used as a last resort in high-density professional settings to prevent resistance.'
      ],
      cultural: [
        'Use high-pressure water spray on the Adult clusters to physically dislodge them without damaging new growth.',
        'Apply reflective mulches during early spring planting to repel winged adults.',
        'Limit nitrogen fertilization to avoid lush, high-nutrient growth that attracts dense clusters.'
      ]
    }
  },
  {
    id: '2',
    name: 'Fall Armyworm',
    scientificName: 'Spodoptera frugiperda',
    category: 'Caterpillars',
    description: 'A highly destructive pest that consumes leaves and stems of many crops, especially maize.',
    distribution: 'Native to tropical and subtropical regions of the Americas; since 2016, it has aggressively invaded sub-Saharan Africa, the Middle East, and most of Asia.',
    mapId: 'invasive-spread',
    identification: [
      { text: 'Inverted Y-shape on the head', iconId: 'inverted-y', referenceUrl: 'https://www.invasive.org/browse/detail.cfm?imgnum=5522154' },
      { text: 'Four dark spots arranged in square pattern', iconId: 'dots-square', referenceUrl: 'https://www.cabi.org/isc/datasheet/49830#toIdMarkers' },
      { text: 'Light-colored stripes along the body', iconId: 'stripes', referenceUrl: 'https://bugguide.net/node/view/154708' }
    ],
    lifeCycle: 'Egg, 6 larval instars, pupa, and adult moth. The entire cycle takes about 30 days in summer.',
    lifeCycleStages: [
      { label: 'Egg', duration: '2-3 Days', description: 'Laid in masses of 100-200 on underside of leaves.', iconId: 'egg' },
      { label: 'Larva', duration: '14-22 Days', description: 'Active feeding stage; 6 distinct sub-stages (instars).', iconId: 'larva' },
      { label: 'Pupa', duration: '8-9 Days', description: 'Occurs in the soil, protected by a cocoon.', iconId: 'pupa' },
      { label: 'Adult', duration: '10-21 Days', description: 'Nocturnal moth capable of migrating long distances.', iconId: 'adult' }
    ],
    controlMethods: {
      biological: [
        'Apply Bacillus thuringiensis (Bt) during the early Larval instars (1st-3rd) for maximum ingestion efficacy.',
        'Conserve native Tachinid flies and wasps by minimizing broad-spectrum pesticide use.'
      ],
      chemical: [
        'Treat whorls of maize with Carbamates or Spinosad late in the evening when larvae emerge to feed.',
        'Rotate chemical classes between generations to prevent rapid resistance buildup.'
      ],
      cultural: [
        'Early planting synchronizes crop growth to precede peak migratory adult moth populations.',
        'Use "Push-Pull" strategy by intercropping with Desmodium to repel adults and Napier grass to trap larvae.',
        'Deep plowing after harvest exposes Pupa in the soil to birds and dehydration.'
      ]
    }
  },
  {
    id: '3',
    name: 'Spider Mites',
    scientificName: 'Tetranychidae',
    category: 'Mites',
    description: 'Tiny arachnids that cause stippling and webbing on leaves, often in hot, dry conditions.',
    distribution: 'Ubiquitous worldwide; native origins are obscured due to global trade. Thrives in any environment with prolonged hot, dry meteorological conditions.',
    mapId: 'temperate',
    identification: [
      { text: 'Minute size (barely visible)', iconId: 'micro-size', referenceUrl: 'https://www.invasive.org/browse/subthumb.cfm?sub=12111' },
      { text: 'Fine silky webs on leaf underscores', iconId: 'webbing', referenceUrl: 'https://images.bugwood.org/browse/subthumb.cfm?sub=12111&start=1' },
      { text: 'Yellow or white leaf stippling', iconId: 'stippling', referenceUrl: 'https://extension.unh.edu/resource/spider-mites-fact-sheet' }
    ],
    lifeCycle: 'Extremely fast development; can go from egg to adult in 5-20 days.',
    lifeCycleStages: [
      { label: 'Egg', duration: '3-5 Days', description: 'Microscopic, clear or pale spheres.', iconId: 'egg' },
      { label: 'Larva', duration: '2-3 Days', description: 'Six-legged first stage, often lighter in color.', iconId: 'larva' },
      { label: 'Nymph', duration: '4-7 Days', description: 'Eight-legged stages (protonymph and deuteronymph).', iconId: 'nymph' },
      { label: 'Adult', duration: '10-15 Days', description: 'Mature females can lay hundreds of eggs.', iconId: 'adult' }
    ],
    controlMethods: {
      biological: [
        'Release Predatory mites (Phytoseiulus persimilis) when 1-2 mites are found per leaf; they thrive in high humidity.',
        'Support Minute pirate bugs and Stethorus beetles which predate on all life stages.'
      ],
      chemical: [
        'Apply selective Miticides that target eggs and nymphs while sparing beneficial predators.',
        'Use Horticultural oils or potassium salts of fatty acids during low-uv hours to suffocate adults. Only use when stippling is significant.'
      ],
      cultural: [
        'Maintain high ambient humidity via periodic misting to slow down the egg-to-adult development cycle.',
        'Hydrate plants deeply during hot spells as drought-stressed foliage is highly susceptible.',
        'Keep surrounding areas dust-free as dust particles interfere with predatory insects.'
      ]
    }
  },
  {
    id: '4',
    name: 'Whiteflies',
    scientificName: 'Aleyrodidae',
    category: 'Sucking Insects',
    description: 'Small white insects that congregate on the undersides of leaves, secreting honeydew.',
    distribution: 'Widely distributed across tropical and subtropical latitudes; frequently introduced to temperate climates via greenhouse trade and ornamental plants.',
    mapId: 'tropical-band',
    identification: [
      { text: 'Tiny white moth-like appearance', iconId: 'wings', referenceUrl: 'https://www.invasive.org/browse/detail.cfm?imgnum=5361048' },
      { text: 'Cloud emerges when plant is shaken', iconId: 'cloud', referenceUrl: 'https://extension.umd.edu/resource/whiteflies-vegetables' },
      { text: 'Yellowing or drying of leaves', iconId: 'leaf-yellow', referenceUrl: 'https://www.cabi.org/isc/datasheet/8925#toIdMarkers' }
    ],
    lifeCycle: 'Eggs laid on undersides of leaves. Nymphs are immobile after the first instar.',
    lifeCycleStages: [
      { label: 'Egg', duration: '6-7 Days', description: 'Tiny oval eggs attached to foliage.', iconId: 'egg' },
      { label: 'Nymph', duration: '12-15 Days', description: 'Scalelike appearance; mostly sedentary.', iconId: 'nymph' },
      { label: 'Pupa', duration: '6 Days', description: 'Final nymphal skin hardens into a protector.', iconId: 'pupa' },
      { label: 'Adult', duration: '1-2 Months', description: 'Moth-like insects that vector viruses.', iconId: 'adult' }
    ],
    controlMethods: {
      biological: [
        'Introduce Encarsia formosa parasitic wasps early in the Nymphal stage; they parasitize the larval scales.',
        'Deploy Beauveria bassiana (entomopathogenic fungus) during humid periods for systemic control.'
      ],
      chemical: [
        'Apply Systemic Neonics like Imidacloprid during early growth to protect vascular tissue.',
        'Use Acetamiprid for contact control on adults, targeting the undersides of leaves where clouds congregate.'
      ],
      cultural: [
        'Place Yellow sticky traps at canopy level to monitor and mass-trap adult populations.',
        'Vacuum adults in the early morning when they are sluggish and less likely to take flight.',
        'Clear weeds (alternate hosts) within 5 meters of the crop perimeter to reduce reservoir populations.'
      ]
    }
  },
  {
    id: '5',
    name: 'Desert Locust',
    scientificName: 'Schistocerca gregaria',
    category: 'Swarming Insects',
    description: 'A devastating migratory pest capable of forming massive swarms that consume entire fields.',
    distribution: 'Endemic to the arid and semi-arid regions of Africa, the Middle East, and Southwest Asia; swarms can reach as far as southern Europe and west Africa.',
    mapId: 'arid-range',
    identification: [
      { text: 'Large grasshopper-like appearance', iconId: 'locust-shape', referenceUrl: 'https://www.fao.org/ag/locusts/en/info/info/index.html' },
      { text: 'Color change to bright yellow when gregarious', iconId: 'color-shift', referenceUrl: 'https://images.bugwood.org/browse/subthumb.cfm?sub=11317' },
      { text: 'Powerful hind legs for jumping', iconId: 'anatomy', referenceUrl: 'https://www.cabi.org/isc/datasheet/48757#toIdMarkers' }
    ],
    lifeCycle: 'Three stages: egg, hopper (nymph), and adult. Gregarization occurs under specific moisture and density triggers.',
    lifeCycleStages: [
      { label: 'Egg', duration: '10-65 Days', description: 'Laid in moist sand or soil in pods.', iconId: 'egg' },
      { label: 'Hopper', duration: '24-95 Days', description: 'Flightless nymphal stage; varies in color.', iconId: 'nymph' },
      { label: 'Adult', duration: '2-4 Months', description: 'Fully winged and capable of long flight.', iconId: 'adult' }
    ],
    controlMethods: {
      biological: [
        'Ariel or ground spray of Metarhizium acridum (Bio-pesticide) specifically targeting Hopper bands.',
        'Conserve natural predators such as birds and lizards in breeding areas.'
      ],
      chemical: [
        'Large-scale ariel ULV (Ultra Low Volume) spraying of Organophosphates against Gregarious swarms.',
        'Use Insect growth regulators (IGRs) in breeding zones to disrupt Hopper exoskeleton development.'
      ],
      cultural: [
        'Dig trenches (60cm deep) across known Hopper marching paths to trap and bury flightless nymphs.',
        'Manually expose and bury Egg pods in known sandy breeding grounds after seasonal rains.'
      ]
    }
  },
  {
    id: '6',
    name: 'Japanese Beetle',
    scientificName: 'Popillia japonica',
    category: 'Beetles',
    description: 'A significant pest of over 300 plant species, including roses, grapes, and hops.',
    distribution: 'Native to Japan; highly invasive and established across most of the Eastern and Midwestern United States and parts of Canada.',
    mapId: 'invasive-spread',
    identification: [
      { text: 'Metallic green head and thorax', iconId: 'anatomy', referenceUrl: 'https://www.invasive.org/browse/detail.cfm?imgnum=5288056' },
      { text: 'Copper-colored wing covers', iconId: 'anatomy', referenceUrl: 'https://images.bugwood.org/browse/detail.cfm?imgnum=0001037' },
      { text: 'Five white hair tufts along each side', iconId: 'dots-square', referenceUrl: 'https://extension.unl.edu/statewide/douglas-sarpy/identifying-the-japanese-beetle/' }
    ],
    lifeCycle: 'One generation per year in most areas. Adults emerge in early summer to feed and mate.',
    lifeCycleStages: [
      { label: 'Egg', duration: '10-14 Days', description: 'Laid in moist soil among grass roots.', iconId: 'egg' },
      { label: 'Grub', duration: '10 Months', description: 'C-shaped larvae that feed on turf roots.', iconId: 'larva' },
      { label: 'Pupa', duration: '8-17 Days', description: 'Transform into adults in the soil.', iconId: 'pupa' },
      { label: 'Adult', duration: '30-45 Days', description: 'Active feeding and mating stage above ground.', iconId: 'adult' }
    ],
    controlMethods: {
      biological: [
        'Apply Milky spore (Bacillus popilliae) to lawns to kill Grubs over multiple years; most effective in early fall.',
        'Utilize Parasitic nematodes (Heterorhabditis bacteriophora) in moist soil to target overwintering larvae.'
      ],
      chemical: [
        'Apply Carbaryl or Acephate to foliage in late June when the first Adults emerge.',
        'Use systemic soil drenches in early spring to protect valuable ornamental trees throughout the season.'
      ],
      cultural: [
        'Daily morning hand-picking of Adults into soapy water when they are most lethargic.',
        'Strategic use of Pheromone traps positioned at least 30ft away from host plants to avoid drawing more beetles to foliage.',
        'Reducing lawn irrigation in August during the Egg stage to increase mortality.'
      ]
    }
  },
  {
    id: '7',
    name: 'Emerald Ash Borer',
    scientificName: 'Agrilus planipennis',
    category: 'Beetles',
    description: 'An extremely destructive wood-boring beetle responsible for the death of tens of millions of ash trees.',
    distribution: 'Native to north-eastern Asia (China, Japan, Korea, Russia); since 2002, it has devastated ash forests across North America.',
    mapId: 'temperate',
    identification: [
      { text: 'Bright metallic emerald green body', iconId: 'stripes', referenceUrl: 'https://www.invasive.org/browse/detail.cfm?imgnum=2106098' },
      { text: 'Slender, elongated shape', iconId: 'anatomy', referenceUrl: 'https://images.bugwood.org/browse/detail.cfm?imgnum=5322091' },
      { text: 'D-shaped exit holes in bark', iconId: 'pear-body', referenceUrl: 'https://www.aphis.usda.gov/aphis/ourfocus/planthealth/plant-pest-and-disease-programs/pests-and-diseases/emerald-ash-borer' }
    ],
    lifeCycle: 'One or two-year cycle depending on climate and tree health. Most of the life is spent as larvae under the bark.',
    lifeCycleStages: [
      { label: 'Egg', duration: '7-12 Days', description: 'Laid in bark crevices.', iconId: 'egg' },
      { label: 'Larva', duration: '1-2 Years', description: 'Feed on the phloem, creating serpentine galleries.', iconId: 'larva' },
      { label: 'Pupa', duration: '3-4 Weeks', description: 'Occurs in a chamber just beneath the bark.', iconId: 'pupa' },
      { label: 'Adult', duration: '3-6 Weeks', description: 'Emerge in late spring/early summer.', iconId: 'adult' }
    ],
    controlMethods: {
      biological: [
        'Release Parasitoid wasps (Oobius agrili) to target Eggs and Larvae in forested areas.',
        'Encourage Woodpecker populations who are natural predators of the Larvae under the bark.'
      ],
      chemical: [
        'Trunk injection of Emamectin benzoate by professionals; provides 2 years of protection against Larvae.',
        'Annual soil drench of Imidacloprid for smaller trees before the Adult emergence in spring.'
      ],
      cultural: [
        'Strictly observe Firewood Quarantines to prevent moving Eggs and Larvae to new regions.',
        'Immediate removal and chipping of ash trees showing more than 30% canopy dieback.',
        'Diversify urban forests by reforesting with non-host species to prevent monoculture collapse.'
      ]
    }
  }
];

interface PestDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPest: (pestName: string) => void;
  initialPestId?: string | null;
}

export default function PestDatabaseModal({ isOpen, onClose, onSelectPest, initialPestId }: PestDatabaseModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPestId, setSelectedPestId] = useState<string | null>(null);

  // Set initial pest if provided
  useEffect(() => {
    if (initialPestId && isOpen) {
      setSelectedPestId(initialPestId);
    }
  }, [initialPestId, isOpen]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDistribution, setSelectedDistribution] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(PESTS.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const distributionTypes = ['All', 'Global', 'Temperate', 'Tropical', 'Arid', 'Invasive Spread'];

  const distributionMap: Record<string, string> = {
    'Global': 'global',
    'Temperate': 'temperate',
    'Tropical': 'tropical-band',
    'Arid': 'arid-range',
    'Invasive Spread': 'invasive-spread'
  };

  useEffect(() => {
    const trimmedValue = searchTerm.trim();
    
    // If the trimmed value is exactly what we already have debounced, cancel any pending search
    if (trimmedValue === debouncedSearchTerm) {
      setIsSearching(false);
      return;
    }

    // Immediate update for empty search to feel snappy
    if (!trimmedValue) {
      setDebouncedSearchTerm('');
      setIsSearching(false);
      return;
    }

    // Set searching state and wait for user to finish typing
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(trimmedValue);
      setIsSearching(false);
    }, 300); // 300ms is standard for optimal typing-to-result feel

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  const filteredPests = useMemo(() => {
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return PESTS.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      if (!matchesCategory) return false;

      const matchesDistribution = selectedDistribution === 'All' || p.mapId === distributionMap[selectedDistribution];
      if (!matchesDistribution) return false;

      if (!searchLower) return true;

      return p.name.toLowerCase().includes(searchLower) || 
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower);
    });
  }, [debouncedSearchTerm, selectedCategory, selectedDistribution]);

  const selectedPest = useMemo(() => 
    PESTS.find(p => p.id === selectedPestId)
  , [selectedPestId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-6xl bg-[#FAF9F6] rounded-sm shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh]"
          >
            {/* Left Sidebar - Search & List */}
            <div className="w-full md:w-96 bg-[#2D4635] text-white p-8 flex flex-col border-r border-white/10">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Bug className="w-6 h-6 text-emerald-400" />
                  <h2 className="font-serif text-2xl italic tracking-tight">Pest Archive</h2>
                </div>
                
                <div className="mb-4">
                  <p className="text-[8px] uppercase tracking-widest font-bold text-white/30 mb-3">Filter by Distribution</p>
                  <div className="flex flex-wrap gap-2">
                    {distributionTypes.map(dist => (
                      <button
                        key={dist}
                        onClick={() => setSelectedDistribution(dist)}
                        className={`px-2.5 py-1 text-[7px] uppercase tracking-widest font-bold rounded-sm border transition-all ${
                          selectedDistribution === dist
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform translate-y-[-1px]'
                            : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                        }`}
                      >
                        {dist}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[8px] uppercase tracking-widest font-bold text-white/30 mb-3">Filter by Category</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 text-[8px] uppercase tracking-widest font-bold rounded-sm border transition-all ${
                          selectedCategory === cat
                            ? 'bg-emerald-400 text-[#2D4635] border-emerald-400 shadow-md translate-y-[-1px]'
                            : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative group/search mb-6">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${isSearching ? 'text-emerald-400 animate-pulse' : 'text-white/30'}`} />
                  <input 
                     type="text"
                    placeholder="Search pest records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-sm py-2 pl-10 pr-10 text-sm focus:outline-none focus:border-emerald-400 transition-all placeholder:text-white/20"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {filteredPests.map((pest) => (
                  <div
                    key={pest.id}
                    onClick={() => setSelectedPestId(pest.id)}
                    className={`p-4 rounded-sm border cursor-pointer transition-all ${
                      selectedPestId === pest.id 
                        ? 'bg-emerald-400 text-[#2D4635] border-emerald-400 shadow-lg' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex gap-4 items-center">
                      <div className={`w-10 h-10 shrink-0 rounded-sm flex items-center justify-center transition-colors ${
                        selectedPestId === pest.id ? 'bg-[#2D4635] text-emerald-400' : 'bg-white/10 text-white/40'
                      }`}>
                        {PEST_ICONS[pest.identification[0].iconId] || <Bug className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-serif italic text-base leading-none truncate">{pest.name}</p>
                          <ChevronRight className={`w-4 h-4 transition-transform hidden md:block ${selectedPestId === pest.id ? 'rotate-90' : ''}`} />
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className={`text-[9px] uppercase tracking-widest ${selectedPestId === pest.id ? 'text-[#2D4635]/60' : 'text-white/40'}`}>
                            {pest.category}
                          </p>
                          <span className={`text-[8px] font-serif italic truncate max-w-[120px] ${selectedPestId === pest.id ? 'text-[#2D4635]/50' : 'text-white/20'}`}>
                            {pest.distribution.split(';')[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredPests.length === 0 && (
                  <div className="text-center py-12 opacity-30 italic font-serif">
                    No matching records found.
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane - Details */}
            <div className="flex-1 bg-white overflow-y-auto custom-scrollbar p-8 md:p-16">
              {selectedPest ? (
                <motion.div
                  key={selectedPest.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="max-w-3xl"
                >
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-black/30 block mb-2">Subject Dossier</span>
                      <h3 className="font-serif text-5xl italic text-[#2D4635] mb-2">{selectedPest.name}</h3>
                      <p className="text-lg font-serif italic text-black/40">{selectedPest.scientificName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                      <X className="w-8 h-8 text-black/10" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    <section className="space-y-6">
                      <div>
                        <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/30 mb-4">
                          <Info className="w-3 h-3" /> Description
                        </h4>
                        <p className="text-base text-black/70 leading-relaxed font-serif italic">
                          {selectedPest.description}
                        </p>
                      </div>
                      
                      <div className="p-5 bg-black/[0.02] border border-black/5 rounded-sm">
                        <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/30 mb-4">
                          <Globe className="w-3 h-3" /> Regional Distribution
                        </h4>
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                          <div className="flex-1">
                            <p className="text-sm text-black/60 font-serif italic leading-relaxed">
                              {selectedPest.distribution}
                            </p>
                          </div>
                          <div className="w-full md:w-32 bg-white p-2 rounded-sm border border-black/5 flex-shrink-0">
                            {REGION_MAPS[selectedPest.mapId] || <Globe className="w-full h-full text-black/5" />}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/30 mb-4">
                          <ShieldAlert className="w-3 h-3" /> Identification Markers
                        </h4>
                        <div className="space-y-4">
                          {selectedPest.identification.map((item, i) => (
                            <motion.div 
                              key={i}
                              whileHover={{ x: 5 }}
                              className="group relative"
                            >
                              {item.referenceUrl ? (
                                <a 
                                  href={item.referenceUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-4 p-4 bg-black/[0.02] rounded-sm border border-black/5 hover:border-emerald-500/20 hover:bg-emerald-50/10 transition-all cursor-pointer block"
                                >
                                  <div className="w-11 h-11 shrink-0 bg-white border border-black/5 rounded-full flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 group-hover:shadow-md group-hover:border-emerald-200 transition-all duration-300">
                                    {PEST_ICONS[item.iconId] || <Bug className="w-5 h-5" />}
                                  </div>
                                  <div className="pt-1 flex-1">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm text-black/70 font-serif italic leading-relaxed">{item.text}</p>
                                      <ExternalLink className="w-3 h-3 text-emerald-600/40 group-hover:text-emerald-600" />
                                    </div>
                                    <p className="text-[8px] uppercase tracking-widest font-bold text-emerald-600/60 mt-1">View visual benchmark</p>
                                  </div>
                                </a>
                              ) : (
                                <div className="flex items-start gap-4 p-4 bg-black/[0.02] rounded-sm border border-black/5">
                                  <div className="w-11 h-11 shrink-0 bg-white border border-black/5 rounded-full flex items-center justify-center text-emerald-600 shadow-sm transition-all duration-300">
                                    {PEST_ICONS[item.iconId] || <Bug className="w-5 h-5" />}
                                  </div>
                                  <div className="pt-2">
                                    <p className="text-sm text-black/70 font-serif italic leading-relaxed">{item.text}</p>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <div className="p-6 bg-black/5 rounded-sm border border-black/5">
                        <h4 className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-black/30 mb-8">
                           Biological Life Cycle
                        </h4>
                        
                        <div className="relative pt-4 pb-8">
                          {/* Timeline Line */}
                          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-black/5 -translate-y-1/2" />
                          
                          <div className="relative flex justify-between gap-4">
                            {selectedPest.lifeCycleStages.map((stage, idx) => (
                              <div key={idx} className="relative flex flex-col items-center group/stage">
                                {/* Stage Icon Node */}
                                <motion.div 
                                  whileHover={{ scale: 1.2, backgroundColor: '#10b981', color: '#fff' }}
                                  className="w-10 h-10 rounded-full border-2 border-emerald-500/20 bg-white flex items-center justify-center text-emerald-600 z-10 transition-colors shadow-sm relative cursor-help"
                                >
                                  {STAGE_ICONS[stage.iconId]}
                                  
                                  {/* Tooltip */}
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 opacity-0 group-hover/stage:opacity-100 pointer-events-none transition-all translate-y-2 group-hover/stage:translate-y-0 z-20">
                                    <div className="bg-[#2D4635] text-white p-3 rounded-sm shadow-xl text-left">
                                      <p className="text-[10px] uppercase tracking-widest font-bold mb-1 text-emerald-400">{stage.label}</p>
                                      <p className="text-[9px] opacity-60 mb-2 uppercase tracking-tighter">Duration: {stage.duration}</p>
                                      <p className="text-[11px] font-serif italic leading-relaxed">{stage.description}</p>
                                    </div>
                                    <div className="w-2 h-2 bg-[#2D4635] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                                  </div>
                                </motion.div>
                                
                                {/* Stage Label */}
                                <div className="absolute top-full mt-4 text-center">
                                  <span className="text-[9px] uppercase tracking-widest font-bold text-black/40 block mb-1">{stage.label}</span>
                                  <span className="text-[8px] italic text-black/20 block whitespace-nowrap">{stage.duration}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-16 pt-6 border-t border-black/5">
                          <p className="text-xs text-black/40 leading-relaxed italic font-serif">
                            {selectedPest.lifeCycle}
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-10 border-t border-black/5 pt-12">
                    <h4 className="text-[11px] uppercase tracking-[0.4em] font-bold text-black/30 text-center">Protocol: Control & Mitigation</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600">
                           <Zap className="w-4 h-4" />
                           <span className="text-[10px] uppercase tracking-widest font-bold">Biological</span>
                        </div>
                        <ul className="space-y-2">
                          {selectedPest.controlMethods.biological.map((m, i) => (
                            <li key={i} className="text-xs text-black/60 italic font-serif">• {m}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sky-600">
                           <LifeBuoy className="w-4 h-4" />
                           <span className="text-[10px] uppercase tracking-widest font-bold">Cultural</span>
                        </div>
                        <ul className="space-y-2">
                          {selectedPest.controlMethods.cultural.map((m, i) => (
                            <li key={i} className="text-xs text-black/60 italic font-serif">• {m}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-600">
                           <ShieldAlert className="w-4 h-4" />
                           <span className="text-[10px] uppercase tracking-widest font-bold">Chemical</span>
                        </div>
                        <ul className="space-y-2">
                          {selectedPest.controlMethods.chemical.map((m, i) => (
                            <li key={i} className="text-xs text-black/60 italic font-serif">• {m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-12 flex justify-center">
                      <button 
                        onClick={() => onSelectPest(`Retrieve detailed eradication plan and sustainable management practices for ${selectedPest.name} (${selectedPest.scientificName}).`)}
                        className="flex items-center gap-3 px-10 py-4 bg-[#2D4635] text-white rounded-sm hover:translate-y-[-2px] hover:shadow-xl transition-all group"
                      >
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Consult Intelligence</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-6">
                  <Bug className="w-24 h-24" />
                  <div>
                    <h3 className="font-serif text-3xl italic">Select a record</h3>
                    <p className="text-xs uppercase tracking-widest font-bold mt-2">To view specialized mitigation protocols</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
