import { industrySearch } from "./utils.js";

export const predictEnrich = (industries: string[], e_c_r: string) => {
    let maturity_stage;
    let business_model;
    let target_personas = [];
    let tech_adoption_propensity;

    const modelFreq = new Map<string, number>();
    const personaFreq = new Map<string, number>();

    industries.forEach((rawIndustry: string) => {
        const slug = rawIndustry.toLowerCase().trim().replace(/\s+/g, '-');
        const data = industrySearch(slug);

        if (data) {
            data.business_model.forEach((b) => {
                modelFreq.set(b, (modelFreq.get(b) || 0) + 1);
            });
            data.target_personas.forEach((p) => {
                personaFreq.set(p, (personaFreq.get(p) || 0) + 1);
            });
        }
    });

    const modelKeys = Array.from(modelFreq.keys());
    modelKeys.sort((a, b) => (modelFreq.get(b) || 0) - (modelFreq.get(a) || 0));
    business_model = modelKeys[0] || "Unknown";

    const personaKeys = Array.from(personaFreq.keys());
    personaKeys.sort((a, b) => (personaFreq.get(b) || 0) - (personaFreq.get(a) || 0));
    target_personas = personaKeys.slice(0, 3);

    const highAdopters = ["B2B Tech / SaaS", "B2C / Consumer"];
    const lowAdopters = ["Manufacturing / Industrial", "Agriculture & Energy"];
    
    if (highAdopters.includes(business_model)) tech_adoption_propensity = "High";
    else if (lowAdopters.includes(business_model)) tech_adoption_propensity = "Low";
    else tech_adoption_propensity = "Medium";

    switch(e_c_r) {
        case "1-10": maturity_stage = "Seed / Stealth"; break;
        case "11-50": maturity_stage = "Early Stage (Series A)"; break;
        case "51-200": maturity_stage = "Growth Stage (Series B/C)"; break;
        case "201-500": maturity_stage = "Mid-Market"; break;
        case "501-1000": maturity_stage = "Late Stage / Pre-IPO"; break;
        default: maturity_stage = "Enterprise / Public";
    }

    return {
        maturity_stage,
        business_model,
        target_personas,
        tech_adoption_propensity
    };
};