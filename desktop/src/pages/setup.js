'use strict';

const params = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);
const urlInput = $('url');

function show(el, text, kind) {
    el.textContent = text;
    el.className = `alert ${kind || ''}`;
    el.hidden = !text;
}

function busy(on) {
    $('test').disabled = on;
    $('save').disabled = on;
    if (on) show($('status'), 'Checking the server…', 'info');
}

async function init() {
    if (params.get('error')) show($('error'), params.get('error'), 'error');

    const config = await window.haatbazar.getConfig();
    urlInput.value = params.get('server') || config.serverUrl || config.presets[0].url;

    for (const preset of config.presets) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'preset';
        button.innerHTML = '<b></b><small></small>';
        button.querySelector('b').textContent = preset.label;
        button.querySelector('small').textContent = preset.url;
        button.addEventListener('click', () => {
            urlInput.value = preset.url;
            show($('status'), '');
        });
        $('presets').append(button);
    }
}

$('test').addEventListener('click', async () => {
    busy(true);
    const result = await window.haatbazar.testServer(urlInput.value);
    busy(false);
    show($('status'), result.message, result.ok ? 'success' : 'error');
});

$('form').addEventListener('submit', async (event) => {
    event.preventDefault();
    busy(true);
    const result = await window.haatbazar.saveServer(urlInput.value);
    busy(false);
    if (!result.ok) show($('status'), result.message, 'error');
});

init();
