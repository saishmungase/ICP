import Cache from "./cache.js";
import { CrustManager } from "./crust-manager.js";
import { scoreCompany } from "./score.js";

export default class DataManager {
    private cache = new Cache();
    private crust = new CrustManager();

    score = async (domain: string, settings: any) => {
        let cached = true;
        domain = domain.toLowerCase().trim()
        console.log(domain)
        let companyData = await this.cache.check(domain) as any | null;
        console.log(companyData)
        if (!companyData) {
            console.log("Did not find anything in cache")
            cached = false;
            companyData = await this.crust.identify(domain);
            if (companyData) {
                console.log("We Got it from backend seding it to cache")
                await this.cache.set(domain, companyData);
            }
        }

        return scoreCompany(settings, companyData, cached);
    };

    autocomplete = async (field: string, query: string, limit = 15): Promise<string[]> => {
        return this.crust.autocomplete(field, query, limit);
    };
}