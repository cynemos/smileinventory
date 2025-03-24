export interface ProductCategory {
  id: string;
  name: string;
  description: string;
}

export const productCategories: ProductCategory[] = [
  {
    id: 'implants',
    name: 'Implants dentaires',
    description: 'Dispositifs en titane ou en zircone qui sont insérés dans l\'os de la mâchoire pour remplacer les racines des dents manquantes.'
  },
  {
    id: 'surgical-drills',
    name: 'Forets et fraises chirurgicaux',
    description: 'Utilisés pour préparer le site d\'implantation.'
  },
  {
    id: 'osteotomes',
    name: 'Ostéotomes',
    description: 'Instruments pour élargir ou compacter l\'os.'
  },
  {
    id: 'surgical-tools',
    name: 'Pinces et élévateurs',
    description: 'Pour manipuler les tissus et les implants.'
  },
  {
    id: 'navigation-systems',
    name: 'Systèmes de navigation chirurgicale',
    description: 'Utilisés pour planifier et guider la pose des implants avec précision.'
  },
  {
    id: 'imaging-equipment',
    name: 'Radiographie et imagerie',
    description: 'Équipements pour radiographie panoramique et tomographie volumique à faisceau conique (CBCT) pour des images détaillées.'
  },
  {
    id: 'surgical-motors',
    name: 'Moteurs chirurgicaux',
    description: 'Appareils électriques ou pneumatiques pour entraîner les forets et autres instruments.'
  },
  {
    id: 'suture-materials',
    name: 'Matériaux de suture',
    description: 'Fils de suture résorbables ou non résorbables pour fermer les incisions.'
  },
  {
    id: 'bone-materials',
    name: 'Matériaux de régénération osseuse',
    description: 'Substituts osseux et membranes barrières pour favoriser la régénération osseuse guidée.'
  },
  {
    id: 'anesthetics',
    name: 'Anesthésiques locaux',
    description: 'Pour l\'anesthésie locale pendant la chirurgie.'
  },
  {
    id: 'sterilization',
    name: 'Équipement de stérilisation',
    description: 'Autoclaves et autres dispositifs pour stériliser les instruments.'
  },
  {
    id: 'planning-software',
    name: 'Logiciels de planification',
    description: 'Pour planifier les interventions chirurgicales en utilisant des images 3D.'
  },
  {
    id: 'prosthetic-materials',
    name: 'Matériel de prothèse',
    description: 'Composants prothétiques comme les piliers et les couronnes pour la restauration finale.'
  },
  {
    id: 'surgical-suction',
    name: 'Équipement d\'aspiration chirurgicale',
    description: 'Pour maintenir un champ opératoire propre et sec.'
  },
  {
    id: 'surgical-lighting',
    name: 'Éclairage chirurgical',
    description: 'Lampes spécialisées pour une bonne visibilité pendant l\'intervention.'
  },
  {
    id: 'protective-equipment',
    name: 'Vêtements et équipements de protection',
    description: 'Gants, masques, blouses et lunettes de protection pour le personnel médical.'
  }
];
