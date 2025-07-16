// הדבק את הקוד הזה בקובץ supabase-config.js
const SUPABASE_CONFIG = {
    url: 'URL_של_הפרויקט_שלך',  // החלף עם הProject URL מSupabase
    anonKey: 'הanon_key_שהעתקת'  // החלף עם הanon key שהעתקת
};

const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

const WebMasterAPI = {
    async getTemplates() {
        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('is_active', true);
        if (error) throw error;
        return data;
    },
    
    async testConnection() {
        try {
            const { data, error } = await supabase
                .from('templates')
                .select('count(*)')
                .single();
            if (error) throw error;
            console.log('✅ Supabase connected successfully');
            return true;
        } catch (error) {
            console.error('❌ Supabase connection failed:', error);
            return false;
        }
    }
};

// עדכון הגלריה הראשית
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Loading WebMaster Pro with Supabase...');
    
    const isConnected = await WebMasterAPI.testConnection();
    if (!isConnected) return;
    
    try {
        const templates = await WebMasterAPI.getTemplates();
        console.log('✅ Loaded', templates.length, 'templates from database');
        displayTemplates(templates);
    } catch (error) {
        console.error('❌ Error:', error);
    }
});

function displayTemplates(templates) {
    const container = document.getElementById('templates-container');
    if (!container) return;
    
    container.innerHTML = '';
    templates.forEach(template => {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.innerHTML = `
            <div class="template-preview">
                <div class="template-overlay">
                    <button onclick="window.open('${template.demo_url}', '_blank')" class="btn btn-outline">
                        <i class="fas fa-eye"></i> צפייה
                    </button>
                    <button onclick="selectTemplate('${template.id}')" class="btn btn-primary">
                        <i class="fas fa-check"></i> בחירה
                    </button>
                </div>
            </div>
            <div class="template-info">
                <h3>${template.display_name}</h3>
                <p>${template.description}</p>
                <div class="template-meta">
                    <span class="template-category">${template.category}</span>
                    <span class="template-price">₪${template.price.toLocaleString()}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function selectTemplate(templateId) {
    window.location.href = `editor.html?template=${templateId}`;
}

window.WebMasterAPI = WebMasterAPI;
