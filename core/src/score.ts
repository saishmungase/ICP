export function scoreCompany(
    settings: any,
    companyData: any,
    cached: boolean
) {
    let score = 0.1;
    const { name, logo, linkedin, e_c_r, industries, enriched_insights } = companyData;
    const { maturity_stage, business_model, target_personas, tech_adoption_propensity } = enriched_insights;
    let total = 0;
    let matched = 0;
    if(settings.industries){
        let iMatched = 0;
        for(let i = 0; i < settings.industries.length; i++){
            for(let j = 0; j < industries.length; j++){
                if(settings.industries[i] === industries[j]){
                    iMatched++;
                    break;
                }
            }
        }
        matched += (iMatched/settings.industries.length)
        total++
    }

    if(settings.e_c_r){
        if(settings.e_c_r == e_c_r){
            matched++
        }
        total++
    }

    if(settings.maturity_stage){
        if(settings.maturity_stage === maturity_stage){
            matched++
        }
        total++
    }

    if(settings.business_model){
        if(settings.business_model === business_model){
            matched++
        }
        total++
    }

    if(settings.tech_adoption_propensity){
        if(settings.tech_adoption_propensity === tech_adoption_propensity){
            matched++
        }
        total++
    }

    score = (matched/total) * 100
        
    return { score, logo, name, linkedin, e_c_r, industries, enriched_insights, cached };
}