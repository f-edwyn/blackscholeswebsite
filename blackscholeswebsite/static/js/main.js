const callValueFeedBackArea = document.querySelector(".callValueFeedback")
const putValueFeedBackArea = document.querySelector(".putValueFeedback")
const callHeatMapFeedBackArea = document.querySelector('.callHeatMapFeedback')
const putHeatMapFeedBackArea = document.querySelector('.putHeatMapFeedback')

function updateModelValue(elementID, updatedValue) {
    const modelElement = "model".concat(elementID.charAt(0).toUpperCase() + elementID.slice(1))
    var existingValue = document.getElementById(modelElement)

    if (elementID.includes('Price')) {
        existingValue.innerHTML = '$' + updatedValue
    } else if (elementID.includes('Rate')) {
        existingValue.innerHTML = updatedValue + '%'
    } else {
        existingValue.innerHTML = updatedValue
    }
}

function calculateModelValuation() {
    fetch("/model/perform-valuation", {
        method: "POST",
        body: JSON.stringify({
            assetPrice: assetPrice.value,
            strikePrice: strikePrice.value,
            time: time.value,
            volatility: volatility.value,
            rfiRate: rfiRate.value
        })
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.calculation_error) {
            console.log(data.calculation_error)
        }
        callValueFeedBackArea.style.display = "block"
        callValueFeedBackArea.innerHTML = `<h4>Call Value</h4><h5>$${data.call_value}</h5>`
        putValueFeedBackArea.style.display = "block"
        putValueFeedBackArea.innerHTML = `<h4>Put Value</h4><h5>$${data.put_value}</h5>`
    })
}

function validHeatParameters(element1, element2, feedBackArea1, feedBackArea2, values) {
    if (element1.value == element2.value) {
        for (var element=0; element < arguments.length - 1; element++) {
            arguments[element].classList.add("is-invalid")
            if (arguments[element].getAttribute("class").includes("Feedback")) {
                arguments[element].style.display = "block"
                arguments[element].innerHTML = `<p>${values} cannot be the same to create heatmap.</p>`
            }
        }
        return false
    }
    return true
}

function removeInvalidParameters(element1, element2, feedBackArea1, feedBackArea2) {
    for(var index=0; index < arguments.length; index++) {
        arguments[index].classList.remove("is-invalid")
        if(arguments[index].getAttribute("class").includes("Feedback")) {
            arguments[index].style.display = "none"
        }
    }
}

function createHeatMap() {
    fetch("/model/create-heatmap", {
        method: "POST",
        body: JSON.stringify({
            strikePrice: strikePrice.value,
            rfiRate: rfiRate.value,
            volatility: volatility.value,
            minSpotPrice: minSpotPrice.value,
            maxSpotPrice: maxSpotPrice.value,
            heatMapMinTime: heatMapMinTime.value,
            heatMapMaxTime: heatMapMaxTime.value
        })
    })
    .then((res) => res.json())
    .then((data) => {
        if (data.heatmap_error) {
            console.log(data.heatmap_error)
        }
        const callBase64String = data.call_uri;
        const callImgSrc = 'data:image/png;base64,' + callBase64String
        callHeatMapFeedBackArea.innerHTML = `<img src="${callImgSrc}" alt="Call Option Heatmap" style="width:100%; max-width:800px;">`;
    
        const putBase64String = data.put_uri;
        const putImgSrc = 'data:image/png;base64,' + putBase64String;
        putHeatMapFeedBackArea.innerHTML = `<img src="${putImgSrc}" alt="Put Option Heatmap" style="width:100%; max-width:800px;">`;
    })
}

// For interactive 3D plot and 2D heatmaps
document.addEventListener('DOMContentLoaded', () => {
    function buildPayloadFromSidebar() {
        const yaxis = document.querySelector('input[name="yaxis"]:checked').value;
        return {
            minSpotPrice: parseFloat(document.getElementById('minSpotPrice').value),
            maxSpotPrice: parseFloat(document.getElementById('maxSpotPrice').value),
            heatMapMinTime: parseFloat(document.getElementById('heatMapMinTime').value),
            heatMapMaxTime: parseFloat(document.getElementById('heatMapMaxTime').value),
            strikePrice: parseFloat(document.getElementById('strikePrice').value),
            volatility: parseFloat(document.getElementById('volatility').value),
            rfiRate: parseFloat(document.getElementById('rfiRate').value),
            num: 8,
            y_axis: yaxis,
            rfr_start: document.getElementById('rfrStart').value
        };
    }

    async function fetchHeatmapData() {
        const payload = buildPayloadFromSidebar();
        const resp = await fetch(HEATMAP_DATA_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (!resp.ok) throw new Error('Heatmap data fetch failed');
        return resp.json();
    }

    async function fetchHeatmapImages() {
        const p = buildPayloadFromSidebar();
        const resp = await fetch(CREATE_HEATMAP_URL, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p)
        });
        if (!resp.ok) throw new Error('Heatmap images fetch failed');
        return resp.json();
    }

    const plotEl = document.getElementById('plotly-plot');
    const loader = document.getElementById('heatmap-loader');
    plotEl.style.display = 'none';

    async function setImageDecoded(imgId, base64uri) {
        const img = document.getElementById(imgId);
        img.src = 'data:image/png;base64,' + base64uri;
        if (img.decode) await img.decode();
    }

    async function renderPlotAndImages() {
        document.getElementById('loader').style.display = 'block';
        loader.style.display = 'block';
        plotEl.style.display = 'none';

        const [data3d, images] = await Promise.all([fetchHeatmapData(), fetchHeatmapImages()]);

        if (data3d && data3d.heatmap_error) {
            const msg = 'Heatmap-data error: ' + data3d.heatmap_error;
            console.error(msg);
            loader.textContent = msg;
            loader.style.display = 'block';
            plotEl.style.display = 'block';
            document.getElementById('loader').style.display = 'none';
            return;
        }
        if (images && images.heatmap_error) {
            const msg = 'Heatmap-images error: ' + images.heatmap_error;
            console.error(msg);
            loader.textContent = msg;
            loader.style.display = 'block';
            plotEl.style.display = 'block';
            document.getElementById('loader').style.display = 'none';
            return;
        }

        const yAxisLabel = document.querySelector('input[name="yaxis"]:checked').value === 'time' ? 'Time (yrs)' : 'Risk-free rate';
        const layout = {
            scene: {
                domain: { x: [0, 1], y: [0.06, 1] },
                xaxis: { title: 'Spot Price', titlefont: { size: 14 }, tickfont: { size: 12 }, automargin: true, showbackground: true, backgroundcolor: 'rgba(240, 240, 240, 0.95)' },
                yaxis: { title: yAxisLabel, titlefont: { size: 14 }, tickfont: { size: 12 }, automargin: true, showbackground: true, backgroundcolor: 'rgba(240, 240, 240, 0.95)' },
                zaxis: { title: 'Option Price', titlefont: { size: 14 }, tickfont: { size: 12 }, automargin: true, showbackground: true, backgroundcolor: 'rgba(240, 240, 240, 0.95)' },
                aspectmode: 'auto'
            },
            margin: { l: 10, r: 10, b: 90, t: 30 }
        };
        const config = { responsive: true };
        const trace = {
            x: data3d.x,
            y: data3d.y,
            z: data3d.call,
            type: 'surface',
            colorscale: 'Viridis',
            colorbar: { title: 'Option Price' },
            hovertemplate: 'Spot: %{x}<br>' + yAxisLabel + ': %{y}<br>Price: %{z}<extra></extra>'
        };

        try {
            await Plotly.react('plotly-plot', [trace], layout, config);
            setTimeout(() => {
                try {
                    const width = plotEl.clientWidth || 900;
                    const viewportH = (window.innerHeight || document.documentElement.clientHeight) || 900;
                    let desiredHeight = Math.round(Math.min(1100, Math.max(520, Math.round(width * 0.82))));
                    const maxAllowed = Math.round(viewportH * 0.85);
                    if (desiredHeight > maxAllowed) desiredHeight = maxAllowed;
                    plotEl.style.height = desiredHeight + 'px';

                    const spacer = document.getElementById('plotly-spacer');
                    if (spacer) {
                        const spacerHeight = Math.min(160, Math.max(40, Math.round(desiredHeight * 0.06)));
                        spacer.style.height = spacerHeight + 'px';
                    }

                    if (window.Plotly && typeof Plotly.Plots.resize === 'function') {
                        Plotly.Plots.resize(plotEl);
                    }

                    try {
                        Plotly.relayout(plotEl, {
                            'margin.l': 10,
                            'margin.r': 10,
                            'scene.camera.eye': { x: 1.6, y: 1.3, z: 1.3 },
                            'margin.b': 140,
                            'scene.domain.y': [0.06, 1],
                            'scene.aspectmode': 'auto'
                        });
                    } catch (e) { console.warn('relayout failed', e); }

                    setTimeout(() => {
                        try { Plotly.Plots.resize(plotEl); } catch(e) {}
                        window.dispatchEvent(new Event('resize'));
                    }, 140);

                } catch (err) {
                    console.warn('post-render adjustment failed', err);
                }
            }, 80);
            try {
                if (images && images.call) await setImageDecoded('callImg', images.call);
                if (images && images.put) await setImageDecoded('putImg', images.put);
            } catch (imgErr) {
                console.warn('failed to decode images', imgErr);
            }

            plotEl.style.display = 'block';
            loader.style.display = 'none';
            document.getElementById('loader').style.display = 'none';
        } catch (err) {
            console.error('Plotly render failed', err);
            loader.textContent = 'Plotly render error: ' + (err && err.message ? err.message : String(err));
            loader.style.display = 'block';
            plotEl.style.display = 'block';
            document.getElementById('loader').style.display = 'none';
        }
    }

    let renderTimer = null;
    function scheduleRender(delay = 600) {
        if (renderTimer) clearTimeout(renderTimer);
        renderTimer = setTimeout(() => {
            renderPlotAndImages().catch(e => console.warn('Render failed', e));
        }, delay);
    }

    const watchedIds = ['minSpotPrice','maxSpotPrice','heatMapMinTime','heatMapMaxTime','strikePrice','volatility','rfiRate','rfrStart'];
    watchedIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => scheduleRender(600));
    });
    const radios = document.querySelectorAll('input[name="yaxis"]');
    const rfrStartContainer = document.getElementById('rfrStartContainer');
    const plotHelpText = document.getElementById('plot-help-text');

    function toggleRfrControls() {
        if (document.querySelector('input[name="yaxis"]:checked').value === 'rfr') {
            rfrStartContainer.style.display = 'block';
            plotHelpText.textContent = "Time is held constant at the 'Max Time' value from the main inputs. The Y-axis ranges from the 'RFR Start' value (or 0 if blank) up to the main 'Interest Rate'.";
        } else {
            rfrStartContainer.style.display = 'none';
            plotHelpText.textContent = "The Y-axis uses the 'Min Time' and 'Max Time' values from the main inputs.";
        }
    }

    radios.forEach(r => r.addEventListener('change', () => {
        toggleRfrControls();
        scheduleRender(200);
    }));

    toggleRfrControls();
    renderPlotAndImages().catch(() => {});
});
