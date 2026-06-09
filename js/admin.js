// State Variables
let activeTab = 'hero';
let isConnected = false;
let tabData = {}; // Cache for current tab files data

// Filename mapping for each tab
const TAB_FILES = {
    hero: 'hero.json',
    services: 'services.json',
    events: 'events.json',
    testimonials: 'testimonials.json',
    about: 'about.json',
    resources: 'resources.json',
    glossary: 'glossary.json', // Also handles tips.json inside same tab
    tips: 'tips.json'
};

// Check and apply authentication overlay
function checkAuth() {
    const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
    const overlay = document.getElementById('login-overlay');
    if (isAuth) {
        if (overlay) overlay.style.display = 'none';
    } else {
        if (overlay) overlay.style.display = 'flex';
    }
}

// Handle login submissions
window.handleLogin = function(event) {
    event.preventDefault();
    const passwordInput = document.getElementById('admin-password');
    const errorEl = document.getElementById('login-error');
    if (!passwordInput) return;

    if (passwordInput.value === 'Jita2025') {
        sessionStorage.setItem('admin_authenticated', 'true');
        checkAuth();
        checkConnection().then(() => {
            loadTabData(activeTab);
        });
    } else {
        if (errorEl) errorEl.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
    }
};

// Initialize Admin Portal
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    if (sessionStorage.getItem('admin_authenticated') === 'true') {
        checkConnection().then(() => {
            loadTabData(activeTab);
        });
    }
});

// Check API server connection
async function checkConnection() {
    const statusPill = document.getElementById('serverStatus');
    const statusText = document.getElementById('serverStatusText');
    const offlineNotice = document.getElementById('offlineNotice');

    try {
        const response = await fetch(`/api/data/hero.json?t=${Date.now()}`);
        if (response.ok) {
            isConnected = true;
            if (statusPill) statusPill.className = 'server-status-pill connected';
            if (statusText) statusText.textContent = 'Connected to Local Server';
            if (offlineNotice) offlineNotice.style.display = 'none';
        } else {
            throw new Error('Server returned non-ok response.');
        }
    } catch (e) {
        isConnected = false;
        if (statusPill) statusPill.className = 'server-status-pill';
        if (statusText) statusText.textContent = 'Offline Mode';
        if (offlineNotice) offlineNotice.style.display = 'flex';
    }
}

// Generic function to handle file selection, convert to base64, upload, and update preview/input
async function handleImageUpload(fileInput, targetId) {
    const file = fileInput.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file.', 'error');
        return;
    }

    const previewImg = document.getElementById(`${targetId}-preview`);
    const placeholderIcon = document.getElementById(`${targetId}-placeholder`);
    const pathText = document.getElementById(`${targetId}-path`);
    const hiddenInput = document.getElementById(targetId);

    // Read the file as base64
    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64Data = e.target.result;
        
        // Show local preview immediately before upload is completed
        if (previewImg) {
            previewImg.src = base64Data;
            previewImg.style.display = 'block';
        }
        if (placeholderIcon) {
            placeholderIcon.style.display = 'none';
        }

        if (isConnected) {
            try {
                showLoader(true);
                // Extract file extension
                const extension = file.name.split('.').pop() || 'png';
                
                const response = await fetch('/api/upload-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ base64Data, extension })
                });

                if (!response.ok) throw new Error('Upload failed');
                
                const result = await response.json();
                if (result.success && result.filePath) {
                    if (hiddenInput) {
                        hiddenInput.value = result.filePath;
                        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    if (pathText) {
                        pathText.textContent = result.filePath;
                    }
                    showToast('Image uploaded successfully!', 'success');
                } else {
                    throw new Error(result.error || 'Server rejected image upload.');
                }
            } catch (err) {
                console.error('Error uploading image:', err);
                showToast(`Upload failed: ${err.message}`, 'error');
                // Revert preview if failed and no previous image
                if (!hiddenInput.value && previewImg) {
                    previewImg.style.display = 'none';
                    if (placeholderIcon) placeholderIcon.style.display = 'block';
                }
            } finally {
                showLoader(false);
            }
        } else {
            // Offline fallback: save base64 directly
            if (hiddenInput) {
                hiddenInput.value = base64Data;
                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (pathText) {
                pathText.textContent = `Offline: (Embedded Image)`;
            }
            showToast('Offline Mode: Image saved locally in session.', 'success');
        }
    };
    reader.readAsDataURL(file);
}

// Switch dashboard tabs
function switchTab(tabName) {
    activeTab = tabName;
    
    // Toggle active classes in sidebar
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(tabName)) {
            btn.classList.add('active');
        }
    });

    // Toggle active section panels
    document.querySelectorAll('.tab-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Load tab-specific data
    loadTabData(tabName);
}

// Load files data from local API server or mock fallbacks
async function loadTabData(tabName) {
    showLoader(true);
    const filename = TAB_FILES[tabName];
    
    try {
        if (isConnected) {
            const response = await fetch(`/api/data/${filename}?t=${Date.now()}`);
            if (!response.ok) throw new Error(`Failed to load ${filename}`);
            tabData[tabName] = await response.json();
            
            // If glossary tab, load tips.json too
            if (tabName === 'glossary') {
                const tipsResponse = await fetch(`/api/data/tips.json?t=${Date.now()}`);
                if (tipsResponse.ok) {
                    tabData['tips'] = await tipsResponse.json();
                }
            }
        } else {
            // Load local templates if server is offline
            tabData[tabName] = await getFallbackMockData(tabName);
            if (tabName === 'glossary') {
                tabData['tips'] = await getFallbackMockData('tips');
            }
        }
        
        renderActiveTab(tabName);
    } catch (err) {
        console.error('Error loading tab data:', err);
        showToast(`Error loading data for ${tabName}`, 'error');
    } finally {
        showLoader(false);
    }
}

// Render dynamic elements for active tab
function renderActiveTab(tabName) {
    const data = tabData[tabName];

    switch (tabName) {
        case 'hero':
            document.getElementById('hero-title').value = data.title || '';
            document.getElementById('hero-lead').value = data.lead || '';
            document.getElementById('hero-primaryText').value = data.primaryCtaText || '';
            document.getElementById('hero-primaryLink').value = data.primaryCtaLink || '';
            document.getElementById('hero-secondaryText').value = data.secondaryCtaText || '';
            document.getElementById('hero-secondaryLink').value = data.secondaryCtaLink || '';
            break;

        case 'services':
            renderServices(data);
            break;

        case 'events':
            renderEvents(data);
            break;

        case 'testimonials':
            renderTestimonials(data);
            break;

        case 'about':
            document.getElementById('about-missionSubtitle').value = data.missionSubtitle || '';
            document.getElementById('about-missionTitle').value = data.missionTitle || '';
            document.getElementById('about-missionDescription').value = data.missionDescription || '';
            document.getElementById('about-founderName').value = data.founderName || '';
            document.getElementById('about-founderTitle').value = data.founderTitle || '';
            document.getElementById('about-founderLocation').value = data.founderLocation || '';
            document.getElementById('about-founderSummary').value = data.founderSummary || '';
            document.getElementById('about-founderBio1').value = data.founderAboutParagraphs?.[0] || '';
            document.getElementById('about-founderBio2').value = data.founderAboutParagraphs?.[1] || '';
            
            // Founder picture preview setup
            const founderImg = data.founderImage || '';
            document.getElementById('about-founderImage').value = founderImg;
            const previewEl = document.getElementById('about-founderImage-preview');
            const placeholderEl = document.getElementById('about-founderImage-placeholder');
            const pathTextEl = document.getElementById('about-founderImage-path');
            if (founderImg) {
                if (previewEl) { previewEl.src = founderImg; previewEl.style.display = 'block'; }
                if (placeholderEl) placeholderEl.style.display = 'none';
                if (pathTextEl) pathTextEl.textContent = founderImg;
            } else {
                if (previewEl) previewEl.style.display = 'none';
                if (placeholderEl) placeholderEl.style.display = 'block';
                if (pathTextEl) pathTextEl.textContent = 'No image uploaded';
            }

            // Accolades list
            const container = document.getElementById('about-accolades-container');
            container.innerHTML = '';
            (data.accolades || []).forEach((item, index) => {
                container.appendChild(createListItemRow('about-accolades', item, index));
            });
            break;

        case 'resources':
            renderResources(data);
            break;

        case 'glossary':
            renderGlossaryAndTips(data, tabData['tips']);
            break;
    }
}

/* ========================================================
   RENDER FUNCTIONS FOR EACH CMS AREA
   ======================================================== */

// 1. SERVICES
function renderServices(services) {
    const container = document.getElementById('services-list');
    container.innerHTML = '';
    
    services.forEach((service, sIndex) => {
        const card = document.createElement('div');
        card.className = 'edit-card';
        card.innerHTML = `
            <h4 class="list-title" style="margin-bottom: 1.5rem; color: var(--color-purple); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">Pillar #${sIndex + 1}: ${service.title || ''}</h4>
            <div class="form-grid">
                <div class="form-group form-full-row">
                    <label class="form-label">Service Title</label>
                    <input type="text" class="form-input service-title" value="${service.title || ''}" required data-index="${sIndex}">
                </div>
                <input type="hidden" class="service-link" value="${service.link || ''}" data-index="${sIndex}">
                <div class="form-group form-full-row">
                    <label class="form-label">Service Picture</label>
                    <div class="image-upload-wrapper">
                        <div class="image-preview-box">
                            <img id="service-image-${sIndex}-preview" src="${service.image || ''}" alt="Service Preview" style="${service.image ? 'display: block;' : 'display: none;'}">
                            <i class="fas fa-handshake" id="service-image-${sIndex}-placeholder" style="${service.image ? 'display: none;' : 'display: block;'}"></i>
                        </div>
                        <div class="image-upload-controls">
                            <input type="file" id="service-image-file-${sIndex}" class="image-upload-input" accept="image/*" onchange="handleImageUpload(this, 'service-image-${sIndex}')">
                            <input type="hidden" class="service-image" id="service-image-${sIndex}" value="${service.image || ''}" data-index="${sIndex}">
                            <div class="image-upload-path" id="service-image-${sIndex}-path">${service.image || 'No image uploaded'}</div>
                        </div>
                    </div>
                </div>
                <div class="form-group form-full-row">
                    <label class="form-label">Service Summary</label>
                    <input type="text" class="form-input service-desc" value="${service.description || ''}" required data-index="${sIndex}">
                </div>
                <div class="form-group form-full-row" style="margin-top: 1rem;">
                    <label class="form-label" style="color: var(--color-purple); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.3rem;">Service Pointers</label>
                    <div id="service-pointers-${sIndex}-container" class="list-manager-container" style="gap: 0.75rem; margin-top: 0.5rem;">
                        <!-- Service pointers will be rendered here dynamically -->
                    </div>
                    <button type="button" class="btn btn-secondary" onclick="addServicePointer(${sIndex})" style="margin-top: 0.75rem; align-self: flex-start;">
                        <i class="fas fa-plus"></i> Add Pointer
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
        renderServicePointers(sIndex);
    });
}

// Render service pointers list inside a specific service card
function renderServicePointers(sIndex) {
    const container = document.getElementById(`service-pointers-${sIndex}-container`);
    if (!container) return;
    container.innerHTML = '';

    const subServices = tabData['services'][sIndex]?.subServices || [];
    if (subServices.length === 0) {
        container.innerHTML = `<div style="color: var(--color-text-muted); font-size: 0.85rem; font-style: italic;">No pointers added.</div>`;
        return;
    }

    subServices.forEach((ptr, pIndex) => {
        const item = document.createElement('div');
        item.className = 'list-item-card';
        item.style.padding = '1rem';
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.style.gap = '0.75rem';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="form-label" style="font-size: 0.8rem; color: var(--color-teal); letter-spacing: 1px;">Pointer #${pIndex + 1}</span>
                <button type="button" class="btn btn-danger btn-icon-only" onclick="deleteServicePointer(${sIndex}, ${pIndex})" title="Delete Pointer">
                    <i class="fas fa-trash" style="font-size: 0.8rem;"></i>
                </button>
            </div>
            <div class="pointer-grid">
                <div class="form-group">
                    <label class="form-label" style="font-size: 0.8rem; letter-spacing: 1px;">Pointer Title</label>
                    <input type="text" class="form-input service-pointer-title" value="${ptr.title || ''}" data-service-index="${sIndex}" data-pointer-index="${pIndex}" placeholder="e.g. Org Architecture" required style="padding: 0.7rem 1rem;">
                </div>
                <div class="form-group">
                    <label class="form-label" style="font-size: 0.8rem; letter-spacing: 1px;">Pointer Description</label>
                    <textarea class="form-input service-pointer-desc" rows="1" data-service-index="${sIndex}" data-pointer-index="${pIndex}" placeholder="Describe details..." required style="padding: 0.7rem 1rem; resize: vertical;">${ptr.description || ''}</textarea>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

// Read current services and pointers data from DOM to synchronize the tabData state
function syncServicesStateFromDOM() {
    if (activeTab !== 'services' || !tabData['services']) return;

    const list = [];
    const titles = document.querySelectorAll('.service-title');
    titles.forEach((el, index) => {
        const sIndex = el.getAttribute('data-index');

        // Extract pointers for this service from current DOM
        const servicePointers = [];
        const pointerTitles = document.querySelectorAll(`.service-pointer-title[data-service-index="${sIndex}"]`);
        const pointerDescs = document.querySelectorAll(`.service-pointer-desc[data-service-index="${sIndex}"]`);
        pointerTitles.forEach((pTitleEl, pIdx) => {
            servicePointers.push({
                title: pTitleEl.value,
                description: pointerDescs[pIdx].value
            });
        });

        list.push({
            id: tabData['services'][sIndex].id,
            title: el.value,
            link: document.querySelectorAll('.service-link')[index].value,
            image: document.querySelectorAll('.service-image')[index].value,
            description: document.querySelectorAll('.service-desc')[index].value,
            subServices: servicePointers
        });
    });

    tabData['services'] = list;
}

// Add a pointer to the subServices array of a specific service
function addServicePointer(sIndex) {
    syncServicesStateFromDOM();
    if (!tabData['services'][sIndex].subServices) {
        tabData['services'][sIndex].subServices = [];
    }
    tabData['services'][sIndex].subServices.push({
        title: 'New Service Pointer',
        description: 'Pointer description details.'
    });
    renderServices(tabData['services']);
}

// Delete a pointer from the subServices array of a specific service
function deleteServicePointer(sIndex, pIndex) {
    syncServicesStateFromDOM();
    if (tabData['services'][sIndex].subServices) {
        tabData['services'][sIndex].subServices.splice(pIndex, 1);
    }
    renderServices(tabData['services']);
}


// 2. EVENTS
function renderEvents(events) {
    const container = document.getElementById('events-list');
    container.innerHTML = '';

    if (events.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding: 2rem; color: var(--color-text-muted);">No events found. Click "Add Event" to create one.</div>';
        return;
    }

    events.forEach((ev, index) => {
        const item = document.createElement('div');
        item.className = 'list-item-card';
        item.innerHTML = `
            <div class="list-item-header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.8rem; margin-bottom: 0.5rem;">
                <span class="list-title" style="color: var(--color-purple); font-weight: 700; font-family: var(--font-heading); font-size: 1.1rem;">Event #${index + 1}</span>
                <button type="button" class="btn btn-danger" onclick="deleteEvent(${index})">
                    <i class="fas fa-trash"></i> Delete Event
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Event Title</label>
                    <input type="text" class="form-input ev-title" value="${ev.title || ''}" required data-index="${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Type of Event</label>
                    <input type="text" class="form-input ev-badge" value="${ev.badge || ''}" required data-index="${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Event Day of Month (e.g. 18)</label>
                    <input type="text" class="form-input ev-day" value="${ev.day || ''}" required data-index="${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Event Month (e.g. Jun)</label>
                    <input type="text" class="form-input ev-month" value="${ev.month || ''}" required data-index="${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Location (e.g. Mumbai, Online)</label>
                    <input type="text" class="form-input ev-location" value="${ev.location || ''}" required data-index="${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Platform / In-Person Mode (e.g. In-Person, Zoom)</label>
                    <input type="text" class="form-input ev-platform" value="${ev.platform || ''}" required data-index="${index}">
                </div>
                <div class="form-group form-full-row">
                    <label class="form-label">Event Banner / Picture</label>
                    <div class="image-upload-wrapper">
                        <div class="image-preview-box">
                            <img id="ev-image-${index}-preview" src="${ev.image || ''}" alt="Event Preview" style="${ev.image ? 'display: block;' : 'display: none;'}">
                            <i class="fas fa-calendar-alt" id="ev-image-${index}-placeholder" style="${ev.image ? 'display: none;' : 'display: block;'}"></i>
                        </div>
                        <div class="image-upload-controls">
                            <input type="file" id="ev-image-file-${index}" class="image-upload-input" accept="image/*" onchange="handleImageUpload(this, 'ev-image-${index}')">
                            <input type="hidden" class="ev-image" id="ev-image-${index}" value="${ev.image || ''}" data-index="${index}">
                            <div class="image-upload-path" id="ev-image-${index}-path">${ev.image || 'No image uploaded'}</div>
                        </div>
                    </div>
                </div>
                <div class="form-group form-full-row">
                    <label class="form-label">Link to sign up</label>
                    <input type="text" class="form-input ev-link" value="${ev.link || ''}" required data-index="${index}">
                </div>
                <div class="form-group form-full-row">
                    <label class="form-label">Event Summary</label>
                    <textarea class="form-input ev-description" rows="2" required data-index="${index}">${ev.description || ''}</textarea>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function addNewEvent() {
    const list = tabData['events'] || [];
    list.unshift({
        id: `event-${Date.now()}`,
        title: 'New Compliance Session',
        badge: 'Workshop',
        day: '15',
        month: 'Oct',
        description: 'Update the topic highlights for this event.',
        location: 'Online',
        platform: 'Zoom Webinar',
        link: '#contact',
        image: 'img/hr_compliance_event.png'
    });
    tabData['events'] = list;
    renderEvents(list);
}

function deleteEvent(index) {
    const list = tabData['events'];
    list.splice(index, 1);
    renderEvents(list);
}

// 3. TESTIMONIALS
function renderTestimonials(testimonials) {
    const container = document.getElementById('testimonials-list');
    container.innerHTML = '';

    testimonials.forEach((test, index) => {
        const item = document.createElement('div');
        item.className = 'list-item-card';
        item.innerHTML = `
            <div class="list-item-header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.8rem; margin-bottom: 0.5rem;">
                <span class="list-title" style="color: var(--color-purple); font-weight: 700; font-family: var(--font-heading); font-size: 1.1rem;">Testimonial #${index + 1}</span>
                <button type="button" class="btn btn-danger" onclick="deleteTestimonial(${index})">
                    <i class="fas fa-trash"></i> Delete Testimonial
                </button>
            </div>
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Reviewer Name</label>
                    <input type="text" class="form-input test-author" value="${test.authorName || ''}" required data-index="${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Designation / Role</label>
                    <input type="text" class="form-input test-designation" value="${test.designation || ''}" required data-index="${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Company / City location</label>
                    <input type="text" class="form-input test-company" value="${test.company || ''}" required data-index="${index}">
                </div>
                <div class="form-group form-full-row">
                    <label class="form-label">Company Logo image</label>
                    <div class="image-upload-wrapper">
                        <div class="image-preview-box">
                            <img id="test-logo-${index}-preview" src="${test.companyLogo || ''}" alt="Logo Preview" style="${test.companyLogo ? 'display: block;' : 'display: none;'}">
                            <i class="fas fa-building" id="test-logo-${index}-placeholder" style="${test.companyLogo ? 'display: none;' : 'display: block;'}"></i>
                        </div>
                        <div class="image-upload-controls">
                            <input type="file" id="test-logo-file-${index}" class="image-upload-input" accept="image/*" onchange="handleImageUpload(this, 'test-logo-${index}')">
                            <input type="hidden" class="test-logo" id="test-logo-${index}" value="${test.companyLogo || ''}" data-index="${index}">
                            <div class="image-upload-path" id="test-logo-${index}-path">${test.companyLogo || 'No image uploaded'}</div>
                        </div>
                    </div>
                </div>
                <div class="form-group form-full-row">
                    <label class="form-label">Reviewer Profile Picture</label>
                    <div class="image-upload-wrapper">
                        <div class="image-preview-box">
                            <img id="test-avatar-${index}-preview" src="${test.authorImage || ''}" alt="Avatar Preview" style="${test.authorImage ? 'display: block;' : 'display: none;'}">
                            <i class="fas fa-user" id="test-avatar-${index}-placeholder" style="${test.authorImage ? 'display: none;' : 'display: block;'}"></i>
                        </div>
                        <div class="image-upload-controls">
                            <input type="file" id="test-avatar-file-${index}" class="image-upload-input" accept="image/*" onchange="handleImageUpload(this, 'test-avatar-${index}')">
                            <input type="hidden" class="test-avatar" id="test-avatar-${index}" value="${test.authorImage || ''}" data-index="${index}">
                            <div class="image-upload-path" id="test-avatar-${index}-path">${test.authorImage || 'No image uploaded'}</div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Video review video link (optional)</label>
                    <input type="text" class="form-input test-video" value="${test.videoUrl || ''}" data-index="${index}">
                </div>
                <div class="form-group form-checkbox-row">
                    <label class="form-label">Highlight as Featured Video Review</label>
                    <label class="switch">
                        <input type="checkbox" class="test-featured" ${test.isFeatured ? 'checked' : ''} data-index="${index}">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="form-group form-full-row">
                    <label class="form-label">Written Review Comments</label>
                    <textarea class="form-input test-quote" rows="3" required data-index="${index}">${test.quote || ''}</textarea>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function addNewTestimonial() {
    const list = tabData['testimonials'] || [];
    list.push({
        id: `testimonial-${Date.now()}`,
        authorName: 'Client Representative',
        designation: 'Director Operations',
        company: 'Partners LLP',
        quote: 'Write down the review comments here.',
        companyLogo: 'img/Amphora.png',
        isFeatured: false,
        videoUrl: '',
        authorImage: ''
    });
    tabData['testimonials'] = list;
    renderTestimonials(list);
}

function deleteTestimonial(index) {
    const list = tabData['testimonials'];
    list.splice(index, 1);
    renderTestimonials(list);
}

// 4. ABOUT: Accolades Row Helper
function createListItemRow(type, val, index) {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.gap = '0.5rem';
    row.style.alignItems = 'center';
    row.innerHTML = `
        <input type="text" class="form-input ${type}-item" value="${val}" required style="flex:1;">
        <button type="button" class="btn btn-danger btn-icon-only" onclick="this.parentElement.remove()">
            <i class="fas fa-trash"></i>
        </button>
    `;
    return row;
}

function addAboutAccolade() {
    const container = document.getElementById('about-accolades-container');
    container.appendChild(createListItemRow('about-accolades', 'New Accolade Title', container.children.length));
}

// 5. RESOURCES
function renderResources(resources) {
    const container = document.getElementById('resources-list');
    container.innerHTML = '';
    
    resources.forEach((res, index) => {
        const item = document.createElement('div');
        item.className = 'edit-card';
        item.innerHTML = `
            <h4 class="list-title" style="margin-bottom: 1.5rem; color: var(--color-purple); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">Resource: ${res.title || ''}</h4>
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Resource Title</label>
                    <input type="text" class="form-input res-title" value="${res.title || ''}" required data-index="${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Resource Type Tag (e.g. Toolkit, Guide)</label>
                    <input type="text" class="form-input res-tag" value="${res.tagline || ''}" required data-index="${index}">
                </div>
                <div class="form-group form-full-row">
                    <label class="form-label">Startup Presentation / PDF document file</label>
                    <input type="text" class="form-input res-file" value="${res.file || ''}" required data-index="${index}">
                </div>
                <div class="form-group form-full-row">
                    <label class="form-label">Description text</label>
                    <textarea class="form-input res-desc" rows="3" required data-index="${index}">${res.description || ''}</textarea>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

// 6. GLOSSARY & TIPS
function renderGlossaryAndTips(glossary, tips) {
    // Render Glossary Array
    const glossContainer = document.getElementById('glossary-items-list');
    glossContainer.innerHTML = '';
    glossary.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'glossary-row';
        row.innerHTML = `
            <input type="text" class="form-input gloss-term" value="${item.term}" required placeholder="Term">
            <textarea class="form-input gloss-definition" rows="1" required placeholder="Definition">${item.definition}</textarea>
            <button type="button" class="btn btn-danger btn-icon-only" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        `;
        glossContainer.appendChild(row);
    });

    // Render Expert Tips Bento
    const tipsContainer = document.getElementById('tips-expert-list');
    tipsContainer.innerHTML = '';
    (tips.expertTips || []).forEach((tip, index) => {
        const item = document.createElement('div');
        item.className = 'list-item-card';
        item.innerHTML = `
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Icon name (e.g. clock, warning)</label>
                    <input type="text" class="form-input tip-icon" value="${tip.icon || ''}" required data-index="${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Tip Title</label>
                    <input type="text" class="form-input tip-title" value="${tip.title || ''}" required data-index="${index}">
                </div>
                <div class="form-group form-full-row">
                    <label class="form-label">Tip Details Description</label>
                    <textarea class="form-input tip-desc" rows="2" required data-index="${index}">${tip.description || ''}</textarea>
                </div>
            </div>
        `;
        tipsContainer.appendChild(item);
    });

    // Render Startup Toolkits Bento
    const toolkitContainer = document.getElementById('tips-toolkit-list');
    toolkitContainer.innerHTML = '';
    (tips.startupToolkits || []).forEach((tool, index) => {
        const item = document.createElement('div');
        item.className = 'list-item-card';
        item.innerHTML = `
            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label">Icon name (e.g. clock, warning)</label>
                    <input type="text" class="form-input tool-icon" value="${tool.icon || ''}" required data-index="${index}">
                </div>
                <div class="form-group">
                    <label class="form-label">Toolkit Title</label>
                    <input type="text" class="form-input tool-title" value="${tool.title || ''}" required data-index="${index}">
                </div>
                <div class="form-group form-full-row">
                    <label class="form-label">Toolkit Details Description</label>
                    <textarea class="form-input tool-desc" rows="2" required data-index="${index}">${tool.description || ''}</textarea>
                </div>
            </div>
        `;
        toolkitContainer.appendChild(item);
    });
}

function addGlossaryItem() {
    const glossContainer = document.getElementById('glossary-items-list');
    const row = document.createElement('div');
    row.className = 'glossary-row';
    row.innerHTML = `
        <input type="text" class="form-input gloss-term" value="" required placeholder="New Term">
        <textarea class="form-input gloss-definition" rows="1" required placeholder="Definition description..."></textarea>
        <button type="button" class="btn btn-danger btn-icon-only" onclick="this.parentElement.remove()">
            <i class="fas fa-trash"></i>
        </button>
    `;
    glossContainer.appendChild(row);
}

/* ========================================================
   SAVE AND SYNC OPERATIONS
   ======================================================== */

// Gather inputs for active tab and save
async function saveActiveTab() {
    showLoader(true);
    let payload = null;
    let filename = TAB_FILES[activeTab];

    try {
        if (activeTab === 'hero') {
            payload = {
                title: document.getElementById('hero-title').value,
                lead: document.getElementById('hero-lead').value,
                primaryCtaText: document.getElementById('hero-primaryText').value,
                primaryCtaLink: document.getElementById('hero-primaryLink').value,
                secondaryCtaText: document.getElementById('hero-secondaryText').value,
                secondaryCtaLink: document.getElementById('hero-secondaryLink').value
            };
        } else if (activeTab === 'services') {
            syncServicesStateFromDOM();
            payload = tabData['services'];
        } else if (activeTab === 'events') {
            const list = [];
            document.querySelectorAll('.ev-title').forEach((el, idx) => {
                list.push({
                    id: tabData['events'][idx]?.id || `event-${Date.now()}-${idx}`,
                    title: el.value,
                    badge: document.querySelectorAll('.ev-badge')[idx].value,
                    day: document.querySelectorAll('.ev-day')[idx].value,
                    month: document.querySelectorAll('.ev-month')[idx].value,
                    description: document.querySelectorAll('.ev-description')[idx].value,
                    location: document.querySelectorAll('.ev-location')[idx].value,
                    platform: document.querySelectorAll('.ev-platform')[idx].value,
                    image: document.querySelectorAll('.ev-image')[idx].value,
                    link: document.querySelectorAll('.ev-link')[idx].value
                });
            });
            payload = list;
        } else if (activeTab === 'testimonials') {
            const list = [];
            document.querySelectorAll('.test-author').forEach((el, idx) => {
                list.push({
                    id: tabData['testimonials'][idx]?.id || `testimonial-${Date.now()}-${idx}`,
                    authorName: el.value,
                    designation: document.querySelectorAll('.test-designation')[idx].value,
                    company: document.querySelectorAll('.test-company')[idx].value,
                    quote: document.querySelectorAll('.test-quote')[idx].value,
                    companyLogo: document.querySelectorAll('.test-logo')[idx].value,
                    isFeatured: document.querySelectorAll('.test-featured')[idx].checked,
                    videoUrl: document.querySelectorAll('.test-video')[idx].value,
                    authorImage: document.querySelectorAll('.test-avatar')[idx].value
                });
            });
            payload = list;
        } else if (activeTab === 'about') {
            const accolades = [];
            document.querySelectorAll('.about-accolades-item').forEach(el => accolades.push(el.value));

            payload = {
                missionSubtitle: document.getElementById('about-missionSubtitle').value,
                missionTitle: document.getElementById('about-missionTitle').value,
                missionDescription: document.getElementById('about-missionDescription').value,
                founderName: document.getElementById('about-founderName').value,
                founderTitle: document.getElementById('about-founderTitle').value,
                founderLocation: document.getElementById('about-founderLocation').value,
                founderSummary: document.getElementById('about-founderSummary').value,
                founderAboutParagraphs: [
                    document.getElementById('about-founderBio1').value,
                    document.getElementById('about-founderBio2').value
                ],
                accolades: accolades,
                founderImage: document.getElementById('about-founderImage').value,
                expertises: tabData['about'].expertises || [] // Keep original links
            };
        } else if (activeTab === 'resources') {
            const list = [];
            document.querySelectorAll('.res-title').forEach((el, idx) => {
                list.push({
                    id: tabData['resources'][idx]?.id || `res-${idx}`,
                    title: el.value,
                    tagline: document.querySelectorAll('.res-tag')[idx].value,
                    file: document.querySelectorAll('.res-file')[idx].value,
                    description: document.querySelectorAll('.res-desc')[idx].value
                });
            });
            payload = list;
        } else if (activeTab === 'glossary') {
            // Read glossary array
            const list = [];
            const terms = document.querySelectorAll('.gloss-term');
            const definitions = document.querySelectorAll('.gloss-definition');
            terms.forEach((el, idx) => {
                list.push({
                    term: el.value,
                    definition: definitions[idx].value
                });
            });
            payload = list;

            // Also build tips payload
            const expertTips = [];
            document.querySelectorAll('.tip-title').forEach((el, idx) => {
                expertTips.push({
                    icon: document.querySelectorAll('.tip-icon')[idx].value,
                    title: el.value,
                    description: document.querySelectorAll('.tip-desc')[idx].value
                });
            });
            const startupToolkits = [];
            document.querySelectorAll('.tool-title').forEach((el, idx) => {
                startupToolkits.push({
                    icon: document.querySelectorAll('.tool-icon')[idx].value,
                    title: el.value,
                    description: document.querySelectorAll('.tool-desc')[idx].value
                });
            });

            const tipsPayload = { expertTips, startupToolkits };

            // Save tips first
            if (isConnected) {
                await fetch('/api/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: 'tips.json', data: tipsPayload })
                });
            } else {
                triggerLocalDownload('tips.json', tipsPayload);
            }
        }

        // Send payload to save API
        if (isConnected) {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, data: payload })
            });

            const result = await response.json();
            if (response.ok && result.success) {
                showToast(`Successfully updated ${filename}!`, 'success');
                // Refresh local cache
                tabData[activeTab] = payload;
            } else {
                throw new Error(result.error || 'Server rejected write operation.');
            }
        } else {
            // Static fallback: download file
            triggerLocalDownload(filename, payload);
            showToast(`Offline Mode: Downloading config file. Please place in data/`, 'success');
        }
    } catch (e) {
        console.error('Error saving tab data:', e);
        showToast(`Failed to save: ${e.message}`, 'error');
    } finally {
        showLoader(false);
    }
}

// Download local JSON file utility
function triggerLocalDownload(filename, data) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Manually download the active configurations
function downloadActiveConfig() {
    saveActiveTab();
}

/* ========================================================
   FEEDBACK ELEMENTS HELPERS
   ======================================================== */

function showLoader(show) {
    const loader = document.getElementById('globalLoader');
    if (show) {
        loader.classList.add('visible');
    } else {
        loader.classList.remove('visible');
    }
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toastAlert');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');

    toastMsg.textContent = msg;
    toast.className = `toast visible ${type}`;
    
    if (type === 'success') {
        toastIcon.className = 'fas fa-check-circle';
        toastIcon.style.color = 'var(--color-success)';
    } else {
        toastIcon.className = 'fas fa-exclamation-circle';
        toastIcon.style.color = 'var(--color-error)';
    }

    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3500);
}

// Fallback mocks if the server runs completely static (e.g. file:/// double click)
async function getFallbackMockData(tabName) {
    try {
        const defaultDataMap = {
            hero: {
                title: "Founded to empower startups and Enterprises to build robust practices and stay compliant as they grow.",
                lead: "From Legal & HR Strategy to IT Modernization—NexusHive is the single partner for all your startup infrastructure needs.",
                primaryCtaText: "Begin Consultation",
                primaryCtaLink: "#contact",
                secondaryCtaText: "Explore Pillars",
                secondaryCtaLink: "services.html"
            },
            services: [
                {
                    id: "hr-strategy",
                    title: "HR Strategy & Operations",
                    description: "Combining HR Strategy with Sourcing to build your team from the ground up.",
                    image: "whatwedocards/hr setup and strategic.png",
                    link: "services.html#hr-strategy",
                    subServices: [
                        { title: "Org Architecture", description: "Custom organizational chart designs and reporting line definitions." },
                        { title: "HR Manuals & Policies", description: "Drafting employee handbooks, code of conduct, and guidelines." },
                        { title: "Audit Readiness", description: "Checks to ensure compliance with human resource operations." }
                    ]
                }
            ],
            events: [
                {
                    id: "event-1",
                    title: "HR Compliance Essentials",
                    badge: "Workshop",
                    day: "18",
                    month: "Jun",
                    description: "Practical session on labour law compliance, statutory audits, and POSH readiness protocols.",
                    location: "Mumbai",
                    platform: "In-Person",
                    link: "#contact",
                    image: "img/hr_compliance_event.png"
                }
            ],
            testimonials: [
                {
                    id: "testimonial-1",
                    authorName: "Alan King",
                    designation: "CEO at Workplace Options",
                    company: "Workplace Options",
                    quote: "Meeting load disappeared because meeting efficiency increased.",
                    companyLogo: "",
                    isFeatured: true,
                    videoUrl: "",
                    authorImage: "img/hero.jpg"
                }
            ],
            about: {
                missionSubtitle: "BUILDING BETTER WORKPLACES TOGETHER",
                missionTitle: "The Nexus Advantage",
                missionDescription: "NexusHive is your single partner for all startup infrastructure needs. We build Audit-ready, Investor-ready systems...",
                founderName: "Adv. Jaya Bhavya",
                founderTitle: "Founding Partner",
                founderLocation: "Bangalore",
                founderSummary: "Qualified Advocate & ISO-certified POSH Practitioner with 15+ years of experience.",
                founderAboutParagraphs: [
                    "Jaya is a founding partner at the firm's Bangalore office...",
                    "As a Qualified Advocate and ISO-certified POSH Practitioner..."
                ],
                accolades: [
                    "Member of Bar Council of India & Karnataka",
                    "60+ POSH trainings conducted across high-growth sectors"
                ],
                expertises: [
                    { title: "Legal Operations", link: "services.html#compliance" },
                    { title: "HR Governance", link: "services.html#hr-strategy" }
                ]
            },
            resources: [
                {
                    id: "compliance-calendar",
                    tagline: "Stay Compliant",
                    title: "India Compliance Calendar",
                    description: "Your complete month-by-month statutory filing guide.",
                    file: "India_Compliance_Calendar_NexusHive.pptx"
                }
            ],
            glossary: [
                { term: "CTC (Cost to Company)", definition: "The total salary package including benefits." }
            ],
            tips: {
                expertTips: [
                    { icon: "fas fa-clock", title: "The 2-Day Buffer Rule", description: "Always file at least 2 days early." }
                ],
                startupToolkits: [
                    { icon: "fas fa-id-card", title: "Company Registration", description: "Choosing between LLP, Private Limited, or OPC." }
                ]
            }
        };
        return defaultDataMap[tabName] || {};
    } catch (e) {
        return {};
    }
}
