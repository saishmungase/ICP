import { predictEnrich } from "./enrichPredictor.js";
import { crustToken, crustUrl, crustXVersion } from "./libs.js";

export class CrustManager {
    private heads = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${crustToken}`,
        'x-api-version': `${crustXVersion}`
    };

    identify = async (domain: string): Promise<any> => {
        try {
            const res = await fetch(`${crustUrl}/company/identify`, {
                method: 'POST',
                headers: this.heads,
                body: JSON.stringify({ domains: [domain] })
            });

            if (!res.ok) {
                console.error(`Crustdata identify HTTP ${res.status}`);
            }

            const json = await res.json();
            const company = json?.[0]?.matches?.[0]?.company_data;
            if (!company) return {};

            const basic_info = company.basic_info || {};

            const logo = basic_info.logo_permalink
            const linkedin = basic_info.professional_network_url;
            const name = basic_info.name;
            const e_c_r = basic_info.employee_count_range;
            const industries = basic_info.industries || []
            const enriched_insights = predictEnrich(industries, e_c_r)

            return {
                name,
                logo,
                linkedin,
                e_c_r,
                industries,
                enriched_insights
            }
        } catch (e) {
            console.error('CrustManager.identify error:', e);
            return [];
        }
    };

    autocomplete = async (field: string, query: string, limit = 15): Promise<string[]> => {
        try {
            const res = await fetch(`${crustUrl}/company/search/autocomplete`, {
                method: 'POST',
                headers: this.heads,
                body: JSON.stringify({ field, query: query.trim(), limit })
            });

            if (!res.ok) return [];
            const data = await res.json();

            if (data.suggestions && Array.isArray(data.suggestions)) {
                return data.suggestions.map((s: any) => s.value).filter(Boolean);
            }
            return [];
        } catch (e) {
            console.error('CrustManager.autocomplete error:', e);
            return [];
        }
    };
}