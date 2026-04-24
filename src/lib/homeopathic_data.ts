export interface Rubric {
  section: string;
  rubric: string;
  remedies: string[];
}

export interface Remedy {
  name: string;
  type: string;
  keynotes: string;
  modalities: { agg: string; amel: string };
}

export const COMMON_RUBRICS: Rubric[] = [
  { section: "Mind", rubric: "Anger, irascibility", remedies: ["Cham.", "Nux-v.", "Bry.", "Anac.", "Lyc."] },
  { section: "Mind", rubric: "Fear, dark, of", remedies: ["Stram.", "Hyos.", "Lyc.", "Acon.", "Phos."] },
  { section: "Stomach", rubric: "Thirst, large quantities, for", remedies: ["Bry.", "Acon.", "Phos.", "Nat-m.", "Verat."] },
  { section: "Head", rubric: "Pain, sun, from", remedies: ["Glon.", "Nat-c.", "Bell.", "Lach."] },
  { section: "Clinical", rubric: "Injury, mechanical", remedies: ["Arn.", "Hyper.", "Led.", "Calen."] },
  { section: "Mind", rubric: "Restlessness, night", remedies: ["Acon.", "Ars.", "Rhus-t.", "Bell."] },
  { section: "Fever", rubric: "Dry heat, with skin", remedies: ["Acon.", "Bell.", "Bry."] },
  { section: "Respiratory", rubric: "Cough, barking", remedies: ["Spong.", "Hep.", "Acon."] },
];

export const REMEDY_DATABASE: Remedy[] = [
  { 
    name: "Aconitum Napellus", 
    type: "Plant", 
    keynotes: "Sudden onset of symptoms, intense fear of death, restlessness, fever with dry skin.", 
    modalities: { agg: "Cold wind, night, midnight, warm room", amel: "Open air, rest" } 
  },
  { 
    name: "Arsenicum Album", 
    type: "Mineral", 
    keynotes: "Great prostration, burning pains better by heat, anxiety, thirst for small sips frequent.", 
    modalities: { agg: "Midnight (1-2 AM), cold drinks, wet weather", amel: "Heat, hot drinks, elevated head" } 
  },
  { 
    name: "Bryonia Alba", 
    type: "Plant", 
    keynotes: "Worse from least motion, great thirst for large quantities, dry mucous membranes, irritable.", 
    modalities: { agg: "Motion, exertion, morning, swallowing", amel: "Absolute rest, pressure, lying on painful side" } 
  },
  { 
    name: "Lycopodium Clavatum", 
    type: "Plant", 
    keynotes: "Right-sided symptoms, moving to left, flatulence, lacks confidence but boastful, 4-8 PM aggravation.", 
    modalities: { agg: "4-8 PM, right side, warm room, after eating", amel: "Warm drinks, motion, open air" } 
  },
  { 
    name: "Nux Vomica", 
    type: "Plant", 
    keynotes: "Sedentary life, sensitive to noise/light/smell, ineffective desire to stool, thin/irritable.", 
    modalities: { agg: "Morning, after eating, cold, spices, mental strain", amel: "Short sleep, evening, damp weather, pressure" } 
  },
];
