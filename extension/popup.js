const content = document.getElementById('content');

function render(data, settings) {
    const { score, logo, name, linkedin, e_c_r, industries, enriched_insights, cached } = data;
    const { maturity_stage, business_model, target_personas, tech_adoption_propensity } = enriched_insights;

    const circumference = 283;
    const offset = circumference - (score / 100) * circumference;

    const checkIndustryMatch = (actualArr, targetArr) => {
        if (!targetArr || targetArr.length === 0) return false;
        return actualArr.some(industry => targetArr.includes(industry));
    };

    const checkMatch = (actual, target) => {
        if (!target) return false;
        return actual === target;
    };

    const isIndustryMatch = checkIndustryMatch(industries, settings.industries);

    content.innerHTML = `
        <div class="hero">
            ${logo ? `<img src="${logo}" class="company-logo">` : ''}
            <div class="score-container">
                <svg width="90" height="90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#27272a" stroke-width="6" />
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#6366f1" stroke-width="6" 
                        stroke-dasharray="283" stroke-dashoffset="${offset}" 
                        stroke-linecap="round" style="transition: stroke-dashoffset 1s ease;" />
                </svg>
                <div class="score-val">${Math.round(score)}%</div>
            </div>
            <div class="company-name">${name}</div>
            <div class="verdict">${score > 65 ? 'High Fit' : 'Neutral Fit'}</div>
        </div>

        <div class="data-list">
            <div class="card">
                <div class="match-indicator ${isIndustryMatch ? 'is-match' : 'is-miss'}"></div>
                <div class="label-row"><span class="label">Industries</span></div>
                <span class="value">${industries.join(', ') || 'Unknown'}</span>
                <div class="target-box">
                    <span class="match-icon">${isIndustryMatch ? '✅' : '⚪'}</span>
                    <span>Target: <span class="target-val">${settings.industries?.length ? settings.industries.join(', ') : 'Any'}</span></span>
                </div>
            </div>

            <div class="card">
                <div class="match-indicator ${checkMatch(business_model, settings.business_model) ? 'is-match' : 'is-miss'}"></div>
                <div class="label-row"><span class="label">Business Model</span><span class="label" style="color:var(--accent)">(✦ Prediction)</span></div>
                <span class="value">${business_model}</span>
                <div class="target-box">
                    <span class="match-icon">${checkMatch(business_model, settings.business_model) ? '✅' : '⚪'}</span>
                    <span>Target: <span class="target-val">${settings.business_model || 'Any'}</span></span>
                </div>
            </div>

            <div class="card">
                <div class="match-indicator ${checkMatch(maturity_stage, settings.maturity_stage) ? 'is-match' : 'is-miss'}"></div>
                <div class="label-row"><span class="label">Maturity</span><span class="label" style="color:var(--accent)">(✦ Prediction)</span></div>
                <span class="value">${maturity_stage} [${e_c_r} emp]</span>
                <div class="target-box">
                    <span class="match-icon">${checkMatch(maturity_stage, settings.maturity_stage) ? '✅' : '⚪'}</span>
                    <span>Target: <span class="target-val">${settings.maturity_stage || 'Any'}</span></span>
                </div>
            </div>

            <div class="card">
                <div class="label-row"><span class="label">Target Personas</span><span class="label" style="color:var(--accent)">(✦ Prediction)</span></div>
                <div class="tags">
                    ${target_personas.map(p => `<span class="tag">${p}</span>`).join('')}
                </div>
            </div>
        </div>

        <div class="ai-box">
            <span class="ai-label">✨ AI Suggestion</span>
            <div class="ai-text">Coming Soon.....</div>
        </div>

        <div class="footer">
            <span>${cached ? 'DATABASE CACHE' : 'LIVE DATA'}</span>
            ${linkedin ? `<a href="${linkedin}" target="_blank" class="ln-btn">LINKEDIN</a>` : ''}
        </div>
    `;
}

(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;
    
    const domain = new URL(tab.url).hostname.replace(/^www\./, '');
    content.innerHTML = `<div style="padding:50px;text-align:center;color:var(--text-dim);font-family:'JetBrains Mono';font-size:10px;">ANALYZING ${domain.toUpperCase()}...</div>`;

    const { icp_settings } = await chrome.storage.local.get(['icp_settings']);
    const safeSettings = icp_settings || {};
    
    try {
        const res = await fetch('http://localhost:3000/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain, settings: safeSettings })
        });
        const data = await res.json();
        render(data, safeSettings);
    } catch (e) {
        content.innerHTML = `<div style="padding:50px;text-align:center;color:#ef4444;font-size:11px;">BACKEND OFFLINE<br>Start localhost:3000</div>`;
    }
})();

document.getElementById('settings-btn').onclick = () => chrome.tabs.create({ url: 'settings.html' });