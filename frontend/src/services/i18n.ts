import { Language } from '../types';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Top banner
    emergencyHelpline: 'INDIA EMERGENCY HELPLINE: DIAL 112',
    emergencyHelplineSub: 'For immediate police, fire, ambulance or disaster response, dial 112 directly. This cloud platform assists inter-agency coordination.',
    erssExplainerBtn: 'What is 112 ERSS?',
    
    // Nav items
    navCitizen: 'Citizen Portal',
    navAuthority: 'Operations Command',
    navRescue: 'Rescue Ops',
    navShelters: 'Shelters & Supplies',
    navAdmin: 'Admin Panel',
    
    // Actions
    sendSOS: 'SEND SOS DISTRESS',
    reportIncident: 'Report Incident',
    switchRole: 'Switch Role (RBAC)',
    scenarioSelect: 'Regional Disaster Scenario',
    demoBadge: 'DEMO DATA — NOT LIVE EMERGENCY INFORMATION',
    
    // Dashboard Cards
    cardActiveIncidents: 'Active Incidents',
    cardCriticalHazards: 'Critical Attention',
    cardPeopleAffected: 'People Affected',
    cardShelterCapacity: 'Available Shelter Slots',
    cardStockAlerts: 'Low Stock Supplies',
    cardTeamsDeployed: 'Rescue Teams Deployed',
    
    // Map & Feed
    geoVisualization: 'Live Disaster Geo-Visualization',
    incidentsFeed: 'Active Incidents Feed',
    allDisasters: 'All Categories',
    allSeverities: 'All Severities',
    allStatuses: 'All Statuses',
    searchPlaceholder: 'Search incidents by locality, title, or ID...',
    
    // Safety
    safetyTitle: 'Disaster Preparedness & Official Safety Guidelines',
    safetySubtitle: 'Authoritative precautionary guidance aligned with NDMA & SDMA directives',
    floodSafetyTitle: 'Urban Flooding & Waterlogging',
    floodSafetyDesc: 'Disconnect main electric switch if water enters premises. Avoid walking or driving through submerged subways (e.g. Milan, Andheri). Stay clear of open manholes, storm drains, and electric poles.',
    cycloneSafetyTitle: 'Cyclone & Coastal Evacuation',
    cycloneSafetyDesc: 'Anchor loose tin roofs and balcony fixtures. Stock 3 days of potable water, non-perishable dry rations, and battery torches. Relocate to designated cyclone shelters when instructed.',
    landslideSafetyTitle: 'Landslides & Flash Floods',
    landslideSafetyDesc: 'Stay alert during continuous heavy downpours in hilly terrains. Watch for sudden muddy discoloration in streams or cracks in hillsides. Evacuate valley floors immediately upon rumbling sounds.',
    heatwaveSafetyTitle: 'Severe Heatwave Precautions',
    heatwaveSafetyDesc: 'Avoid outdoor exposure between 12:00 PM and 3:30 PM. Drink plenty of water, electral/ORS, and buttermilk. Check on infants and elderly citizens; never leave anyone in parked vehicles.',
    fireSafetyTitle: 'Fire & Industrial Hazmat',
    fireSafetyDesc: 'Crawl low beneath smoke layers using a damp cloth. Never use elevators during a blaze. If toxic chemical gas leak is reported, evacuate immediately perpendicular (crosswind) to wind direction.',
    earthquakeSafetyTitle: 'Earthquake Response',
    earthquakeSafetyDesc: 'Drop, Cover, and Hold On beneath sturdy wooden furniture. Stay away from glass facades, mirrors, and power lines. Once tremors subside, assemble calmly at open maidans or school grounds.',
  },
  mr: {
    // Top banner
    emergencyHelpline: 'भारत राष्ट्रीय आपत्कालीन हेल्पलाइन: ११२ डायल करा',
    emergencyHelplineSub: 'तातडीच्या पोलीस, अग्निशामक, रुग्णवाहिका किंवा आपत्ती व्यवस्थापन मदतीसाठी थेट ११२ वर संपर्क साधा. हे क्लाउड व्यासपीठ आंतर-विभागीय समन्वयासाठी आहे.',
    erssExplainerBtn: '११२ ERSS काय आहे?',
    
    // Nav items
    navCitizen: 'नागरिक पोर्टल',
    navAuthority: 'आपत्ती नियंत्रण कक्ष',
    navRescue: 'बचाव पथके',
    navShelters: 'निवारे आणि मदत साहित्य',
    navAdmin: 'प्रशासन कक्ष',
    
    // Actions
    sendSOS: 'तातडीची SOS मदत मागा',
    reportIncident: 'घटनेची नोंद करा',
    switchRole: 'भूमिका बदला (RBAC)',
    scenarioSelect: 'प्रादेशिक आपत्ती परिस्थिती',
    demoBadge: 'डेमो माहिती — थेट आणीबाणी माहिती नाही',
    
    // Dashboard Cards
    cardActiveIncidents: 'सक्रिय आपत्ती घटना',
    cardCriticalHazards: 'अति-गंभीर घटना',
    cardPeopleAffected: 'बाधित नागरिक',
    cardShelterCapacity: 'उपलब्ध निवारा जागा',
    cardStockAlerts: 'कमी साठा साहित्य',
    cardTeamsDeployed: 'तैनात बचाव पथके',
    
    // Map & Feed
    geoVisualization: 'थेट आपत्ती नकाशा आणि स्थान',
    incidentsFeed: 'सक्रिय घटनांचा प्रवाह',
    allDisasters: 'सर्व आपत्ती प्रकार',
    allSeverities: 'सर्व तीव्रता',
    allStatuses: 'सर्व स्थिती',
    searchPlaceholder: 'परिसर, शीर्षक किंवा आयडीने शोधा...',
    
    // Safety
    safetyTitle: 'आपत्ती पूर्वतयारी आणि अधिकृत सुरक्षा मार्गदर्शक तत्त्वे',
    safetySubtitle: 'NDMA व राज्य आपत्ती व्यवस्थापन प्राधिकरणाच्या मार्गदर्शक सूचनांनुसार',
    floodSafetyTitle: 'शहरी पूर आणि पाणी साचणे',
    floodSafetyDesc: 'घरात पाणी शिरल्यास मुख्य वीज पुरवठा बंद करा. साचलेल्या पाण्यातून (उदा. मिलन/अंधेरी सबवे) चालणे किंवा गाडी चालवणे टाळा. उघडी मॅनहोल्स आणि विजेच्या खांबांपासून सावध रहा.',
    cycloneSafetyTitle: 'चक्रीवादळ आणि किनारपट्टी स्थलांतर',
    cycloneSafetyDesc: 'पत्र्यांची छपरे सुरक्षित बांधा. ३ दिवसांचे पिण्याचे पाणी, सुका खाऊ आणि बॅटरी टॉर्च जवळ ठेवा. प्रशासनाने निर्देश दिल्यास त्वरित जवळच्या अधिकृत निवारामध्ये स्थलांतरित व्हा.',
    landslideSafetyTitle: 'दरड कोसळणे आणि ढगफुटी',
    landslideSafetyDesc: 'डोंगराळ भागात मुसळधार पावसात सतर्क रहा. ओढ्यातील पाण्याचा रंग अचानक गढूळ झाल्यास किंवा डोंगर उताराला तडे दिसल्यास सावध व्हा. गडगडाटाचा आवाज ऐकू आल्यास दरीतून तात्काळ उंच ठिकाणी जा.',
    heatwaveSafetyTitle: 'उष्णतेची लाट खबरदारी',
    heatwaveSafetyDesc: 'दुपारी १२ ते ३:३० दरम्यान थेट उन्हात जाणे टाळा. पुरेसे पाणी, ओआरएस, ताक प्या. लहान मुले व वृद्धांची काळजी घ्या; वाहनांमध्ये कोणालाही बंद ठेवू नका.',
    fireSafetyTitle: 'आग आणि विषारी वायू गळती',
    fireSafetyDesc: 'धुराच्या वेळी ओल्या कापडाने तोंड झाकून वाकून चाला. आगीच्या वेळी लिफ्टचा वापर करू नका. विषारी वायू गळती झाल्यास वाऱ्याच्या दिशेला काटकोनात त्वरित सुरक्षित जागी जा.',
    earthquakeSafetyTitle: 'भूकंप प्रतिसाद',
    earthquakeSafetyDesc: 'जमीनवर बसा, मजबूत टेबलाखाली डोकं लपवा आणि धरून ठेवा. काचेच्या खिडक्या आणि वीज तारांपासून लांब रहा. धक्के थांबल्यावर मोकळ्या मैदानात शांततेने एकत्र या.',
  },
  hi: {
    // Top banner
    emergencyHelpline: 'भारत राष्ट्रीय आपातकालीन हेल्पलाइन: ११२ डायल करें',
    emergencyHelplineSub: 'तत्काल पुलिस, अग्निशमन, एम्बुलेंस या आपदा बचाव सहायता हेतु सीधे 112 डायल करें। यह क्लाउड प्लेटफॉर्म अंतर-विभागीय समन्वय के लिए है।',
    erssExplainerBtn: '112 ERSS क्या है?',
    
    // Nav items
    navCitizen: 'नागरिक पोर्टल',
    navAuthority: 'कंट्रोल रूम कमांड',
    navRescue: 'बचाव अभियान',
    navShelters: 'राहत शिविर एवं सामग्री',
    navAdmin: 'प्रशासन पैनल',
    
    // Actions
    sendSOS: 'आपातकालीन SOS भेजें',
    reportIncident: 'घटना की सूचना दें',
    switchRole: 'भूमिका बदलें (RBAC)',
    scenarioSelect: 'क्षेत्रीय आपदा परिदृश्य',
    demoBadge: 'डेमो डेटा — वास्तविक आपातकालीन सूचना नहीं',
    
    // Dashboard Cards
    cardActiveIncidents: 'सक्रिय घटनाएं',
    cardCriticalHazards: 'अति-गंभीर घटनाएं',
    cardPeopleAffected: 'प्रभावित लोग',
    cardShelterCapacity: 'उपलब्ध शिविर क्षमता',
    cardStockAlerts: 'कम स्टॉक सामग्री',
    cardTeamsDeployed: 'तैनात बचाव दल',
    
    // Map & Feed
    geoVisualization: 'लाइव आपदा मानचित्र व स्थिति',
    incidentsFeed: 'सक्रिय घटनाओं की सूची',
    allDisasters: 'सभी आपदा प्रकार',
    allSeverities: 'सभी गंभीरता स्तर',
    allStatuses: 'सभी स्थितियां',
    searchPlaceholder: 'स्थान, शीर्षक या आईडी द्वारा खोजें...',
    
    // Safety
    safetyTitle: 'आपदा तैयारी एवं आधिकारिक सुरक्षा निर्देश',
    safetySubtitle: 'NDMA एवं राज्य आपदा प्रबंधन प्राधिकरण के दिशा-निर्देशों के अनुरूप',
    floodSafetyTitle: 'शहरी जलभराव एवं बाढ़ सुरक्षा',
    floodSafetyDesc: 'घर में पानी घुसने पर मुख्य बिजली स्विच तुरंत बंद करें। जलमग्न सबवे (मिलन/अंधेरी) में गाड़ी न चलाएं। खुले मैनहोल और बिजली के खंभों से सुरक्षित दूरी बनाए रखें।',
    cycloneSafetyTitle: 'चक्रवात एवं तटीय निकासी',
    cycloneSafetyDesc: 'टीन की छतों को मजबूती से बांधें। 3 दिन का पीने का पानी, सूखा भोजन और टॉर्च तैयार रखें। जिला प्रशासन के निर्देश पर तुरंत पक्के राहत शिविरों में जाएं।',
    landslideSafetyTitle: 'भूस्खलन एवं अचानक बाढ़',
    landslideSafetyDesc: 'पहाड़ी क्षेत्रों में भारी बारिश के दौरान सतर्क रहें। नालों में मटमैला पानी या दरारें दिखने पर सतर्क हों। गड़गड़ाहट की आवाज सुनते ही सुरक्षित ऊंचाई पर जाएं।',
    heatwaveSafetyTitle: 'भीषण लू से बचाव',
    heatwaveSafetyDesc: 'दोपहर 12 से 3:30 के बीच धूप में निकलने से बचें। ओआरएस, नींबू पानी और मट्ठा पिएं। बच्चों और बुजुर्गों का विशेष ध्यान रखें।',
    fireSafetyTitle: 'आग एवं रासायनिक दुर्घटना',
    fireSafetyDesc: 'धुएं में गीले कपड़े से मुंह ढककर झुककर चलें। आग के समय लिफ्ट का प्रयोग न करें। जहरीली गैस रिसाव की स्थिति में हवा के बहाव की विपरीत दिशा में जाएं।',
    earthquakeSafetyTitle: 'भूकंप सुरक्षा',
    earthquakeSafetyDesc: 'झुकें, मजबूत मेज के नीचे सिर ढकें और पकड़े रहें। कांच की खिड़कियों और भारी दीवारों से दूर रहें। झटके रुकने पर खुले मैदान में आएं।',
  },
};
