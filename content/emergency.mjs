export const emergencySources = {
  ekip: {
    url: 'https://www.ekip.me/important-numbers',
    en: 'EKIP · official emergency number directory',
    tr: 'EKIP · resmî acil numaralar listesi'
  },
  ministry: {
    url: 'https://www.gov.me/clanak/saopstenje-povodom-evropskog-dana-broja-112',
    en: 'Ministry of the Interior · 112 service',
    tr: 'İçişleri Bakanlığı · 112 hizmeti'
  }
};

export const emergencyServices = [
  {number: '112', icon: 'phone', source: 'ministry', primary: true,
    en: {name: 'General emergency', description: 'Reach police, medical assistance and rescue services through one number.', action: 'Call 112'},
    tr: {name: 'Genel acil yardım', description: 'Polis, acil sağlık ve kurtarma hizmetlerine tek numaradan ulaşın.', action: '112’yi ara'}},
  {number: '122', icon: 'shield', source: 'ekip',
    en: {name: 'Police', description: 'Direct number for police assistance.', action: 'Call 122'},
    tr: {name: 'Polis', description: 'Polis yardımına doğrudan ulaşın.', action: '122’yi ara'}},
  {number: '123', icon: 'flame', source: 'ekip',
    en: {name: 'Fire & rescue', description: 'Direct number for fire and rescue services.', action: 'Call 123'},
    tr: {name: 'İtfaiye ve kurtarma', description: 'İtfaiye ve kurtarma hizmetlerine doğrudan ulaşın.', action: '123’ü ara'}},
  {number: '124', icon: 'medical', source: 'ekip',
    en: {name: 'Ambulance / emergency medical help', description: 'Direct number for emergency medical assistance.', action: 'Call 124'},
    tr: {name: 'Ambulans / acil sağlık', description: 'Acil tıbbi yardım hizmetine doğrudan ulaşın.', action: '124’ü ara'}},
  {number: '129', icon: 'lifebuoy', source: 'ekip',
    en: {name: 'Assistance at sea', description: 'Direct number for assistance at sea.', action: 'Call 129'},
    tr: {name: 'Denizde yardım', description: 'Denizde yardım hizmetine doğrudan ulaşın.', action: '129’u ara'}}
];
