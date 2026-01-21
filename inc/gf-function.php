<?php
/**
 * Komplexné riešenie pre odstránenie oddeľovačov tisícov v Gravity Forms
 * Tento kód pridajte do functions.php vašej témy alebo do vlastného plugin súboru
 */

// Odstránenie oddeľovača tisícov pri formátovaní čísiel
add_filter('gform_include_thousands_sep_pre_format_number', '__return_false');
add_filter('gform_include_thousands_sep_pre_format_value', '__return_false');
add_filter('gform_include_thousands_sep_pre_format_price', '__return_false');

// Úprava HTML vstupu pre odstránenie oddeľovačov
add_filter('gform_field_content', 'remove_thousand_separator_from_input', 10, 5);
function remove_thousand_separator_from_input($content, $field, $value, $lead_id, $form_id) {
    // Ak ide o kalkulačné pole alebo číslo
    if ($field->type == 'calculation' || $field->type == 'number') {
        // Použijeme regulárny výraz na nájdenie value atribútu
        $pattern = '/value=[\'"](.*?)[\'"]/';
        if (preg_match($pattern, $content, $matches)) {
            $original_value = $matches[1];
            
            // Odstránime všetky oddeľovače tisícov (bodky aj čiarky)
            $clean_value = str_replace(',', '', $original_value);
            $clean_value = str_replace('.', '', $clean_value);
            
            // Ak hodnota obsahovala desatinnú čiarku alebo bodku, pridáme ju späť
            if (strpos($original_value, ',') !== false && strpos($original_value, '.') !== false) {
                // V prípade, že hodnota obsahuje aj čiarku aj bodku, zachováme len desatinnú časť
                $parts = preg_split('/[,\.]/', $original_value);
                if (count($parts) > 1) {
                    $clean_value = $parts[0] . '.' . $parts[1]; // Použijeme bodku ako štandard
                }
            } else if (strpos($original_value, ',') !== false) {
                // Ak hodnota obsahuje len čiarku, predpokladáme že ide o desatinnú čiarku
                $parts = explode(',', $original_value);
                if (count($parts) > 1) {
                    $clean_value = $parts[0] . '.' . $parts[1]; // Konvertujeme na bodku
                }
            } else if (strpos($original_value, '.') !== false) {
                // Ak hodnota obsahuje len bodku, zachováme ju ako desatinnú bodku
                $parts = explode('.', $original_value);
                if (count($parts) > 1) {
                    $clean_value = $parts[0] . '.' . $parts[1];
                }
            }
            
            // Nahradíme pôvodnú hodnotu vyčistenou hodnotou
            $content = preg_replace($pattern, 'value="' . $clean_value . '"', $content);
        }
    }
    
    return $content;
}

// Odstránenie oddeľovačov tisícov pri odoslaní formulára
add_filter('gform_pre_submission_filter', 'remove_thousand_separator_before_submission');
function remove_thousand_separator_before_submission($form) {
    foreach ($form['fields'] as &$field) {
        // Ak ide o kalkulačné pole alebo číslo
        if ($field->type == 'calculation' || $field->type == 'number') {
            $input_id = $field->id;
            
            // Ak je hodnota nastavená v $_POST
            if (isset($_POST['input_' . $input_id])) {
                $value = $_POST['input_' . $input_id];
                
                // Odstránime oddeľovače tisícov ale zachováme desatinnú čast
                $cleaned_value = preg_replace('/[^\d\.\-]/', '', $value);
                
                // Aktualizujeme hodnotu v $_POST
                $_POST['input_' . $input_id] = $cleaned_value;
            }
        }
    }
    
    return $form;
}

// Pridanie vlastného JavaScript na odstránenie oddeľovačov v reálnom čase
add_action('gform_enqueue_scripts', 'enqueue_thousand_separator_script');
function enqueue_thousand_separator_script() {
    wp_add_inline_script('gform_gravityforms', '
        jQuery(document).ready(function($) {
            // Aplikujeme na všetky kalkulačné polia a čísla
            $(".ginput_container_calculation input, .ginput_container_number input").each(function() {
                var value = $(this).val();
                if(value) {
                    // Zachovajme desatinné miesta, ale odstráňme oddeľovače tisícov
                    var hasDecimal = value.indexOf(".") > -1 || value.indexOf(",") > -1;
                    var cleanValue = value.replace(/[^\d\.\-]/g, "");
                    
                    if(hasDecimal) {
                        // Zabezpečíme, že desatinná časť zostane
                        var parts = value.split(/[\.,]/);
                        if(parts.length > 1) {
                            cleanValue = parts[0].replace(/[^\d\-]/g, "") + "." + parts[1];
                        }
                    }
                    
                    $(this).val(cleanValue);
                }
            });
            
            // Aplikujeme aj na dynamicky aktualizované polia
            $(document).on("gform_post_conditional_logic", function() {
                $(".ginput_container_calculation input, .ginput_container_number input").each(function() {
                    var value = $(this).val();
                    if(value) {
                        // Rovnaká logika ako vyššie
                        var hasDecimal = value.indexOf(".") > -1 || value.indexOf(",") > -1;
                        var cleanValue = value.replace(/[^\d\.\-]/g, "");
                        
                        if(hasDecimal) {
                            var parts = value.split(/[\.,]/);
                            if(parts.length > 1) {
                                cleanValue = parts[0].replace(/[^\d\-]/g, "") + "." + parts[1];
                            }
                        }
                        
                        $(this).val(cleanValue);
                    }
                });
            });
        });
    ');
}

// Upravenie formátu čísla v náhľade odoslania (GP Preview Submission)
add_filter('gpps_field_value', 'remove_thousand_separator_from_preview', 10, 3);
function remove_thousand_separator_from_preview($value, $field, $entry) {
    // Ak ide o kalkulačné pole alebo číslo
    if ($field->type == 'calculation' || $field->type == 'number') {
        // Vyčistíme hodnotu od oddeľovačov tisícov
        if (is_numeric($value) || is_string($value)) {
            // Zachováme desatinnú čast
            $decimal_position = max(strpos($value, '.'), strpos($value, ','));
            
            if ($decimal_position !== false && $decimal_position > 0) {
                // Rozdelíme číslo na celú a desatinnú časť
                $integer_part = substr($value, 0, $decimal_position);
                $decimal_part = substr($value, $decimal_position + 1);
                
                // Odstránime všetky oddeľovače z celej časti
                $clean_integer = preg_replace('/[^\d\-]/', '', $integer_part);
                
                // Spojíme späť s bodkou ako desatinným oddeľovačom
                $value = $clean_integer . '.' . $decimal_part;
            } else {
                // Ak nie je desatinná časť, len odstránime oddeľovače
                $value = preg_replace('/[^\d\-]/', '', $value);
            }
        }
    }
    
    return $value;
}
?>