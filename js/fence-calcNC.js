(function($) {
    function formatNumber(number) {
        return number.toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
            .replace('.', ',');
    }

    function roundUpToTenCents(number) {
        return Math.ceil(number * 10) / 10; // Zaokrúhli nahor na najbližších 0,10
    }

    function generateFenceSVG(boardWidth, boardHeight, boardsPerHeight, postHeight) {
        try {
            var totalWidth = boardWidth + 16 + 16; // Šírka dosiek + H stĺp vľavo (16) + H stĺp vpravo (16)
            var svg = `
                <svg width="300" height="219" viewBox="0 0 ${totalWidth} ${postHeight}" preserveAspectRatio="xMidYMid meet">
                    <!-- Ľavý H stĺp -->
                    <rect x="0" y="0" width="16" height="${postHeight}" fill="var(--theme-palette-color-3)" stroke="#000000" stroke-width="0.5"/>
                    <!-- Dosky -->`;
            
            // Generovanie dosiek, prvá začína na y=5
            for (var i = 0; i < boardsPerHeight; i++) {
                var yPos = 5 + i * boardHeight; // Prvá doska na y=5, ďalšie s rozstupom boardHeight
                svg += `
                    <rect x="16" y="${yPos}" width="${boardWidth}" height="${boardHeight}" fill="color-mix(in srgb, var(--theme-palette-color-3) 30%, transparent)" stroke="var(--theme-palette-color-3)" stroke-width="0.5"/>`;
            }

            // Pridanie textu s počtom dosiek v strede SVG
            var textX = totalWidth / 2; // Stred SVG horizontálne
            var textY = postHeight / 2; // Stred SVG vertikálne
            svg += `
                    <!-- Text s počtom dosiek -->
                    <text x="${textX}" y="${textY}" font-size="30" fill="var(--theme-palette-color-1)" font-weight="700" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif">${boardsPerHeight}</text>
                    <!-- Pravý H stĺp -->
                    <rect x="${16 + boardWidth}" y="0" width="16" height="${postHeight}" fill="var(--theme-palette-color-3)" stroke="#000000" stroke-width="0.5"/>
                </svg>`;
            return svg;
        } catch (e) {
            console.error('Chyba pri generovaní SVG:', e);
            return ''; // Vráti prázdny reťazec, aby neblokovalo formulár
        }
    }

    function calculateFence() {
        console.log('calculateFence spustený'); // Debug
        try {
            // Získanie hodnôt
            var heightVal = parseInt($('input[name="input_1"]:checked').val()) || 6; // Počet dosiek na výšku (6, 7, 8, 9)
            var lengthMeters = parseFloat($('input[name="input_3"]').val()) || 0; // Dĺžka plota
            var length = lengthMeters * 100; // Konverzia z metrov na centimetre
            var boardType = '250_30_5'; // Pevne nastavený typ dosky
            var corners = parseInt($('input[name="input_5"]').val()) || 0; // Počet rohov

            // Validácia
            if (length <= 0 || corners < 0) {
                console.warn('Neplatné vstupy:', { length, corners });
                return;
            }

            // Výpočty
            var boardDims = boardType.split('_');
            var boardWidth = parseInt(boardDims[0]); // Šírka dosky (250 cm)
            var fieldWidth = 259.5; // Šírka poľa v cm pre dosky 250 cm
            var totalFields = Math.ceil(length / fieldWidth);

            // Určenie výšky dosky
            var boardHeight = 30; // Výška dosky: 30 cm pre 250 x 30 x 5 cm
            var fenceHeight = heightVal === 6 ? 180 : heightVal === 7 ? 210 : heightVal === 8 ? 240 : 270; // Výška plota v cm
            var boardsPerHeight = Math.ceil(fenceHeight / boardHeight); // Počet dosiek na výšku
            var totalBoards = totalFields * boardsPerHeight; // Celkový počet dosiek

            var totalHPosts = totalFields > 0 ? totalFields - 1 : 0; // H stĺpiky: počet polí - 1
            var totalUPosts = corners + 2; // U stĺpiky: počet rohov + 2

            // Výška stĺpov
            var postHeight = heightVal === 6 ? 260 : heightVal === 7 ? 280 : heightVal === 8 ? 320 : 340;

            // Ceny – AKTUALIZOVANÉ 2026 podľa nového cenníka (bez DPH)
            var boardPrice = 13.50;                     // ← ZMENENÉ: 250_30_5 = 13.50 €

            var hPostPrice = heightVal === 6 ? 22.00    // ← ZMENENÉ: H260 = 22.00 €
                         : heightVal === 7 ? 25.50    // ← ZMENENÉ: H280 = 25.50 €
                         : heightVal === 8 ? 29.50    // ← ZMENENÉ: H320 = 29.50 €
                         : 36.00;                     // ← ZMENENÉ: H340 = 36.00 €

            var uPostPrice = heightVal === 6 ? 12.00    // ← ZMENENÉ: U260 = 12.00 €
                         : heightVal === 7 ? 13.50    // ← ZMENENÉ: U280 = 13.50 €
                         : heightVal === 8 ? 16.50    // ← ZMENENÉ: U320 = 16.50 €
                         : 21.00;                     // ← ZMENENÉ: U340 = 21.00 €

            var totalPriceNoVAT = (totalBoards * boardPrice) + (totalHPosts * hPostPrice) + (totalUPosts * uPostPrice);
            var totalPriceWithVAT = totalPriceNoVAT * 1.23;

            // Zaokrúhľovanie cien nahor na 0,10
            totalPriceNoVAT = roundUpToTenCents(totalPriceNoVAT);
            totalPriceWithVAT = roundUpToTenCents(totalPriceWithVAT);

            // Hmotnosti – BEZ ZMENY
            var boardWeight = 75; // Hmotnosť pre 250_30_5
            var boardsWeight = totalBoards * boardWeight;

            var hPostWeight = heightVal === 6 ? 120 : heightVal === 7 ? 130 : heightVal === 8 ? 130 : 210;
            var hPostsWeight = totalHPosts * hPostWeight;

            var uPostWeight = heightVal === 6 ? 70 : heightVal === 7 ? 75 : heightVal === 8 ? 100 : 110;
            var uPostsWeight = totalUPosts * uPostWeight;

            var totalWeight = boardsWeight + hPostsWeight + uPostsWeight;
            var totalWeightInTons = totalWeight / 1000;

            // Aktualizácia polí
            $('#input_7_18').val(totalFields);
            $('#input_7_19').val(totalBoards);
            $('#input_7_20').val(totalHPosts);
            $('#input_7_21').val(totalUPosts);
            $('#input_7_22').val(formatNumber(totalPriceNoVAT)); // Formát 5 773,00
            $('#input_7_23').val(formatNumber(totalPriceWithVAT)); // Formát 7 100,80

            // Zápis cien do skrytých polí
            if ($('#input_7_47').length) {
                $('#input_7_47').val(totalPriceNoVAT.toFixed(2)); // Cena bez DPH, napr. 5773.00
            } else {
                console.warn('Skryté pole input_7_47 neexistuje');
            }
            if ($('#input_7_48').length) {
                $('#input_7_48').val(totalPriceWithVAT.toFixed(2)); // Cena s DPH, napr. 7100.80
            } else {
                console.warn('Skryté pole input_7_48 neexistuje');
            }

            // Zápis hmotností do skrytých polí
            if ($('#input_7_36').length) {
                $('#input_7_36').val(boardsWeight); // Hmotnosť dosiek (kg)
            } else {
                console.warn('Skryté pole input_7_36 neexistuje');
            }
            if ($('#input_7_37').length) {
                $('#input_7_37').val(hPostsWeight); // Hmotnosť H stĺpov (kg)
            } else {
                console.warn('Skryté pole input_7_37 neexistuje');
            }
            if ($('#input_7_38').length) {
                $('#input_7_38').val(uPostsWeight); // Hmotnosť U stĺpov (kg)
            } else {
                console.warn('Skryté pole input_7_38 neexistuje');
            }
            if ($('#input_7_39').length) {
                $('#input_7_39').val(formatNumber(totalWeightInTons)); // Celková hmotnosť (t)
            } else {
                console.warn('Skryté pole input_7_39 neexistuje');
            }

            // Dynamické popisy
            var heightDesc = `Výška plota ${fenceHeight} cm`;
            if ($('#description_7_18').length) {
                $('#description_7_18').text(heightDesc);
            } else {
                $('#field_7_18').append('<div id="description_7_18" class="custom-description">' + heightDesc + '</div>');
            }

            var boardDesc = `${boardDims[0]} x ${boardDims[1]} x ${boardDims[2]} cm`;
            if ($('#description_7_19').length) {
                $('#description_7_19').text(boardDesc);
            } else {
                $('#field_7_19').append('<div id="description_7_19" class="custom-description">' + boardDesc + '</div>');
            }
            if ($('#input_7_30').length) {
                $('#input_7_30').val(boardDesc);
            } else {
                console.warn('Skryté pole input_7_30 neexistuje');
            }

            var hPostDesc = `16 x 16 x ${postHeight} cm`;
            if ($('#description_7_20').length) {
                $('#description_7_20').text(hPostDesc);
            } else {
                $('#field_7_20').append('<div id="description_7_20" class="custom-description">' + hPostDesc + '</div>');
            }
            if ($('#input_7_31').length) {
                $('#input_7_31').val(hPostDesc);
            } else {
                console.warn('Skryté pole input_7_31 neexistuje');
            }

            var uPostDesc = `16 x 10 x ${postHeight} cm`;
            if ($('#description_7_21').length) {
                $('#description_7_21').text(uPostDesc);
            } else {
                $('#field_7_21').append('<div id="description_7_21" class="custom-description">' + uPostDesc + '</div>');
            }
            if ($('#input_7_32').length) {
                $('#input_7_32').val(uPostDesc);
            } else {
                console.warn('Skryté pole input_7_32 neexistuje');
            }

            // Generovanie SVG nákresu
            if ($('#fence-preview').length) {
                if ($('#gform_page_7_2').length && $('#gform_page_7_2').is(':visible')) {
                    var svgCode = generateFenceSVG(boardWidth, boardHeight, boardsPerHeight, postHeight);
                    $('#fence-preview').html(svgCode);
                } else if ($('#gform_page_7_2').length) {
                    $('#fence-preview').html(''); // Vyčisti, ak nie je krok 2 viditeľný
                } else {
                    // Ak nie je multi-step formulár, vždy generuj SVG
                    var svgCode = generateFenceSVG(boardWidth, boardHeight, boardsPerHeight, postHeight);
                    $('#fence-preview').html(svgCode);
                }
            } else {
                console.warn('Element #fence-preview neexistuje');
            }

            // Debug
            console.log('Výpočty:', {
                totalFields: totalFields,
                boardsPerHeight: boardsPerHeight,
                totalBoards: totalBoards,
                totalHPosts: totalHPosts,
                totalUPosts: totalUPosts,
                totalPriceNoVAT: formatNumber(totalPriceNoVAT),
                totalPriceWithVAT: formatNumber(totalPriceWithVAT),
                rawPriceNoVAT: totalPriceNoVAT.toFixed(2),
                rawPriceWithVAT: totalPriceWithVAT.toFixed(2)
            });
            console.log('Hmotnosti:', {
                boardsWeight: boardsWeight,
                hPostsWeight: hPostsWeight,
                uPostsWeight: uPostsWeight,
                totalWeightInTons: formatNumber(totalWeightInTons)
            });
            console.log('Popisy a skryté polia:', {
                heightDesc: heightDesc,
                boardDesc: boardDesc,
                hPostDesc: hPostDesc,
                uPostDesc: uPostDesc
            });
            console.log('SVG parametre:', {
                boardWidth: boardWidth,
                boardHeight: boardHeight,
                boardsPerHeight: boardsPerHeight,
                postHeight: postHeight,
                totalWidth: boardWidth + 32 // Pre ViewBox (dva H stĺpy)
            });
        } catch (e) {
            console.error('Chyba v calculateFence:', e);
        }
    }

    // Inicializácia event listenerov
    function initFenceCalc() {
        // Odstráni existujúce listenery, aby sa zabránilo duplikácii
        $(document).off('change keyup click', 'input[name="input_1"], input[name="input_3"], input[name="input_5"]');
        // Pridá delegované listenery (už bez input_4)
        $(document).on('change keyup click', 'input[name="input_1"], input[name="input_3"], input[name="input_5"]', calculateFence);
        // Spustí výpočty
        setTimeout(calculateFence, 500);
    }

    // Spustenie pri načítaní
    $(document).ready(function() {
        initFenceCalc();
    });

    // Gravity Forms udalosti
    $(document).on('gform_post_render gform_page_loaded', function(event, form_id) {
        if (form_id == '7') {
            initFenceCalc();
        }
    });

    // Elementor popup
    $(document).on('elementor/popup/show', function() {
        if ($('.gform_wrapper').length) {
            $(document).trigger('gform_post_render');
            initFenceCalc();
        }
    });

    // Prechod na krok 2 alebo späť
    $(document).on('click', '.gform_next_button, .gform_previous_button', function() {
        setTimeout(initFenceCalc, 500); // Spusti po prechode na krok
    });
})(jQuery);