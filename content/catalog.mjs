import {guides as originalGuides} from './guides.mjs';
import {expandGuides} from './expanded-guides.mjs';
import {coastalGuides} from './cities-coast.mjs';
import {centralGuides} from './cities-central.mjs';
import {northernGuides} from './cities-north.mjs';
import {easternGuides} from './cities-east.mjs';

export const municipalities=['Andrijevica','Bar','Berane','Bijelo Polje','Budva','Gusinje','Danilovgrad','Žabljak','Kolašin','Kotor','Mojkovac','Nikšić','Petnjica','Plav','Pljevlja','Plužine','Podgorica','Rožaje','Tivat','Tuzi','Herceg Novi','Cetinje','Šavnik','Ulcinj','Zeta'];
export const cityGuides=[...coastalGuides,...centralGuides,...northernGuides,...easternGuides].sort((a,b)=>a.municipality.localeCompare(b.municipality,'en')||a.slug.localeCompare(b.slug));
export const guides=[...expandGuides(originalGuides.filter(g=>!cityGuides.some(c=>c.slug===g.slug))),...cityGuides];
