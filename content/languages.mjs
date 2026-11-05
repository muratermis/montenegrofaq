// Planned language routes; Serbian and Montenegrin use Latin writing only.
export const plannedLanguages=[
 ['en','English','en-GB','en'],['tr','Türkçe','tr-TR','tr'],
 ['cnr','Crnogorski','sr-Latn-ME','sr'],['sr','Srpski (latinica)','sr-Latn-RS','sr'],
 ['ru','Русский','ru-RU','ru'],['uk','Українська','uk-UA','uk'],['de','Deutsch','de-DE','de'],['pl','Polski','pl-PL','pl'],['fr','Français','fr-FR','fr'],['it','Italiano','it-IT','it'],['es','Español','es-ES','es'],
 ['sq','Shqip','sq-AL','sq'],['bs','Bosanski','bs-BA','bs'],['hr','Hrvatski','hr-HR','hr'],['sl','Slovenščina','sl-SI','sl'],['mk','Македонски','mk-MK','mk'],['bg','Български','bg-BG','bg'],['ro','Română','ro-RO','ro'],['hu','Magyar','hu-HU','hu'],['cs','Čeština','cs-CZ','cs'],['sk','Slovenčina','sk-SK','sk'],['el','Ελληνικά','el-GR','el'],['pt','Português','pt-PT','pt'],['nl','Nederlands','nl-NL','nl'],
 ['sv','Svenska','sv-SE','sv'],['no','Norsk','nb-NO','no'],['da','Dansk','da-DK','da'],['fi','Suomi','fi-FI','fi'],['is','Íslenska','is-IS','is'],['et','Eesti','et-EE','et'],['lv','Latviešu','lv-LV','lv'],['lt','Lietuvių','lt-LT','lt'],
 ['zh-Hans','简体中文','zh-Hans-CN','zh-CN'],['ja','日本語','ja-JP','ja'],['ko','한국어','ko-KR','ko'],
 ['be','Беларуская','be-BY','be'],['mt','Malti','mt-MT','mt'],['ga','Gaeilge','ga-IE','ga'],['ca','Català','ca-ES','ca'],['eu','Euskara','eu-ES','eu'],['gl','Galego','gl-ES','gl'],['cy','Cymraeg','cy-GB','cy'],['lb','Lëtzebuergesch','lb-LU','lb']
].map(([code,name,locale,target])=>({code,name,locale,target,lang:code==='sr'?'sr-Latn':code}));
const publishedCodes=new Set('en tr cnr sr ru uk de pl fr it es sq bs hr sl mk bg ro hu cs sk el nl sv no pt da fi is'.split(' '));
export const languages=plannedLanguages.filter(l=>publishedCodes.has(l.code));
export const supportedLanguages=languages.map(l=>l.code);
