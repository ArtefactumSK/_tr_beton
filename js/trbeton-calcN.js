jQuery(document).ready(function($) {
    // Funkcia, ktorá sa spustí pri načítaní dokumentu a pri každom vykreslení formulára. TU SA UPRAVUJU CENY PRI ZMENE CIEN DOSIEK - TR BETON!
    
        // Špecifické selektory pre Gravity Forms formulár s ID 5
        const formID = 5;
        const vyskaFieldID = 1;
        const rozmerFieldID = 4;
        const doskyFieldID = 27;
        const hFieldID = 20;
        const uFieldID = 21;
        const vysledokFieldID = 29;

        function extractRozmer(raw) {
            const match = raw.match(/(\d+x\d+x\d+)/);
            return match ? match[1] : null;
        }

        function updatePrice() {
            // Získanie hodnôt pomocou GF API
            const vyska = $('#input_' + formID + '_' + vyskaFieldID).val();
            const rozmerRaw = $('#input_' + formID + '_' + rozmerFieldID).val() || '';
            const rozmer = extractRozmer(rozmerRaw);
            const dosky = parseFloat($('#input_' + formID + '_' + doskyFieldID).val() || 0);
            const h = parseFloat($('#input_' + formID + '_' + hFieldID).val() || 0);
            const u = parseFloat($('#input_' + formID + '_' + uFieldID).val() || 0);

            console.log('Hodnoty pre výpočet:', { vyska, rozmer, dosky, h, u });

            if (!vyska || !rozmer || !pricing[vyska] || !pricing[vyska][rozmer]) {
                console.log('Neplatné hodnoty pre cenu:', { vyska, rozmer });
                return;
            }

            const ceny = pricing[vyska][rozmer];
            const spolu = (dosky * ceny.doska) + (h * ceny.H) + (u * ceny.U);
            const vysledok = spolu.toFixed(2);
            
            console.log('Vypočítaná cena:', vysledok);

            // Kľúčové - nastavenie hidden field pre dynamické populované pole
            $('#input_' + formID + '_' + vysledokFieldID).val(vysledok);
            
            // Pre populated field je potrebné použiť gform.setFieldValue
            if (typeof gform !== 'undefined' && gform.setFieldValue) {
                gform.setFieldValue(formID + '.' + vysledokFieldID, vysledok);
            }
            
            // Pre zobrazenie hodnoty v HTML
            const vysledokElement = $('#input_' + formID + '_' + vysledokFieldID);
            if (vysledokElement.length) {
                vysledokElement.val(vysledok).change();
                // Ak je výsledok vo formulári v inom elemente než input
                $('#field_' + formID + '_' + vysledokFieldID + ' .ginput_container').text(vysledok);
            }
        }

        // Pripojíme event listenery na vstupy
        $('#input_' + formID + '_' + vyskaFieldID).on('change', updatePrice);
        $('#input_' + formID + '_' + rozmerFieldID).on('change', updatePrice);
        $('#input_' + formID + '_' + doskyFieldID).on('input change', updatePrice);
        $('#input_' + formID + '_' + hFieldID).on('input change', updatePrice);
        $('#input_' + formID + '_' + uFieldID).on('input change', updatePrice);

        // Spustíme výpočet hneď
        updatePrice();
    }

    // Inicializácia pri načítaní stránky
    initializeCalculator();

    // Dôležité: Inicializácia po každom vykreslení formulára
    $(document).on('gform_post_render', function() {
        console.log('Form rerendered - reinitializing calculator');
        initializeCalculator();
    });
});