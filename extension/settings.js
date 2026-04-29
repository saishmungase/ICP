const apiUrl = "https://icp-ybg3.onrender.com"
// apiUrl = "http://localhost:3000"

const industryInput = document.getElementById('industry-input');
const tagsContainer = document.getElementById('industry-tags');
const suggestBox = document.getElementById('suggest-box');
const dropdowns = document.querySelectorAll('select');

async function persistSettings() {
    const settings = {
        industries: targetIndustries,
        e_c_r: document.getElementById('e_c_r').value,
        maturity_stage: document.getElementById('maturity_stage').value,
        business_model: document.getElementById('business_model').value
    };
    
    await chrome.storage.local.set({ icp_settings: settings });
    console.log('Settings Synced:', settings);
}

function renderTags() {
    tagsContainer.innerHTML = targetIndustries.map((name, index) => `
        <div class="tag">
            <span>${name}</span>
            <span class="tag-remove" data-index="${index}">×</span>
        </div>
    `).join('');

    document.querySelectorAll('.tag-remove').forEach(btn => {
        btn.onclick = async (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            targetIndustries.splice(index, 1);
            renderTags();
            await persistSettings();
        };
    });
}

async function searchIndustries(query) {
    if (!query) return;
    
    suggestBox.innerHTML = '<div class="suggest-item">Querying Crustdata...</div>';
    suggestBox.classList.add('open');

    try {
        const res = await fetch(`${apiUrl}/autocomplete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field: "basic_info.industries", query: query })
        });
        const list = await res.json();
        
        if (list.length === 0) {
            suggestBox.innerHTML = '<div class="suggest-item">No official industries found</div>';
            return;
        }

        suggestBox.innerHTML = list.map(val => `<div class="suggest-item" data-val="${val}">${val}</div>`).join('');

        document.querySelectorAll('.suggest-item').forEach(item => {
            item.onclick = async () => {
                const selectedVal = item.getAttribute('data-val');
                if (!targetIndustries.includes(selectedVal)) {
                    targetIndustries.push(selectedVal);
                    renderTags();
                    await persistSettings();
                }
                suggestBox.classList.remove('open');
                industryInput.value = '';
            };
        });
    } catch (e) {
        suggestBox.innerHTML = '<div class="suggest-item" style="color:#f87171">Backend Offline</div>';
    }
}

industryInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        const query = e.target.value.trim();
        if (query) await searchIndustries(query);
    }
});

dropdowns.forEach(el => {
    el.onchange = async () => await persistSettings();
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('#industry-input') && !e.target.closest('#suggest-box')) {
        suggestBox.classList.remove('open');
    }
});

document.getElementById('save-settings').onclick = async () => {
    await persistSettings();
    const btn = document.getElementById('save-settings');
    btn.textContent = '✓ Logic Engine Synced';
    btn.style.background = '#22c55e';
    setTimeout(() => {
        btn.textContent = 'Update Logic Engine';
        btn.style.background = '#6366f1';
    }, 2000);
};

chrome.storage.local.get(['icp_settings'], (result) => {
    if (result.icp_settings) {
        const s = result.icp_settings;
        targetIndustries = s.industries || [];
        
        document.getElementById('e_c_r').value = s.e_c_r || "";
        document.getElementById('maturity_stage').value = s.maturity_stage || "";
        document.getElementById('business_model').value = s.business_model || "";
        
        renderTags();
    }
});