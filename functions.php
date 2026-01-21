<?php
/*Artefactum read style child theme*/
function child_theme_enqueue_styles() {
    // načítaj štýly trbeton témy
    wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');
    // načíta štýly child témy, pričom závisí od parent-style
    wp_enqueue_style('child-style', get_stylesheet_directory_uri() . '/style.css', array('parent-style'));
}
add_action('wp_enqueue_scripts', 'child_theme_enqueue_styles');

add_action('wp_enqueue_scripts', function() {wp_enqueue_script('jquery');});


/* Artefactum - Gravity Forms Odstránenie oddeľovača tisícov (,) v kalkulačných poliach */
include_once get_stylesheet_directory() . '/inc/gf-function.php';

/*Artefactum support*/
include_once( ARTEFACTUM_COMMON . 'Artefactum-supports.php' );
include_once( ARTEFACTUM_COMMON . 'a-wplogin.php' );

// Remove gravity forms nag
function remove_gravity_forms_nag() {
    update_option( 'rg_gforms_message', '' );
    remove_action( 'after_plugin_row_gravityforms/gravityforms.php', array( 'GFForms', 'plugin_row' ) );
}
add_action( 'admin_init', 'remove_gravity_forms_nag' );

/*Artefactum odstranenie slova Kategoria zo zoznamov*/
add_filter( 'get_the_archive_title', function ( $title ) {
    if ( is_category() ) {
        $title = single_cat_title( '', false );
    } elseif ( is_tag() ) {
        $title = single_tag_title( '', false );
    } elseif ( is_author() ) {
        $title = get_the_author();
    } elseif ( is_post_type_archive() ) {
        $title = post_type_archive_title( '', false );
    }
    return $title;
});



/*=== Capabilities ===*/
if (is_admin()) {
    function allow_editors_capabilities() {
        $role = get_role('editor');
        if ($role) {
            $role->add_cap('edit_ct_content_block');
            $role->add_cap('edit_others_ct_content_blocks');
            $role->add_cap('publish_ct_content_blocks');
            $role->add_cap('read_ct_content_block');
            $role->add_cap('delete_ct_content_blocks');
            $role->add_cap('manage_options');
            $role->add_cap('edit_theme_options');
            $role->add_cap('customize');
            $role->add_cap('gravityforms_view_entries');
            $role->add_cap('gravityforms_edit_entries');
            $role->add_cap('gravityforms_delete_entries');
            $role->add_cap('gravityforms_export_entries');
            $role->remove_cap('update_core');
            $role->remove_cap('update_plugins');
            $role->remove_cap('update_themes');
        }
    }
    add_action('init', 'allow_editors_capabilities');

    function restrict_blocksy_dashboard_for_editors() {
        if (!current_user_can('administrator')) {
            $page = $_GET['page'] ?? '';
            if (in_array($page, ['ct-dashboard', 'ct-dashboard-account'])) {
                wp_die('Nemáte oprávnenie pre vstup do tejto sekcie.');
            }
        }
    }
    add_action('admin_init', 'restrict_blocksy_dashboard_for_editors');

    function my_remove_menu_pages() {
    global $current_user;
    wp_get_current_user();

    // Skryť menu len pre používateľov s nižšími rolami ako Editor alebo Administrator
    if (!current_user_can('editor') && !current_user_can('administrator')) {
        remove_menu_page('index.php'); // Nástenka
        remove_menu_page('blog2social'); // Blog2Social
    }

    // Skrytie menu pre všetkých okrem používateľa 'artefactum'
    if ($current_user->user_login != 'artefactum') {
        $menus_to_remove = [
            'wp-mail-smtp','cerber-security', 'loco', 'litespeed', 'elementor', 'translate-press', 'edit.php?post_type=elementor_library'
        ];

        foreach ($menus_to_remove as $menu) {
            remove_menu_page($menu);
        }

        // Elementor submenus
        $elementor_submenus = [
            'elementor', 'elementor-settings', 'elementor-role-manager',
            'elementor-element-manager', 'elementor-tools', 'elementor-system-info',
            'go_knowledge_base_site', 'e-form-submissions', 'elementor_custom_fonts',
            'elementor_custom_icons', 'elementor_custom_code', 'elementor-apps',
            'go_elementor_pro'
        ];

        foreach ($elementor_submenus as $submenu) {
            remove_submenu_page('elementor', $submenu);
        }

        $gforms_submenus = [
            'gf_settings', 'gf_export', 'gf_update', 'gf_addons', 'gf_help', 'settings', 'gf_new_form', 'gf_system_status', 'gf_edit_forms'
        ];
        foreach ($gforms_submenus as $gfsubmenu) {
            remove_submenu_page('gf_edit_forms', $gfsubmenu);
        }
		
		$options_submenus = ['options-permalink.php','options-media.php','cache-enabler','eml_settings', 'translate-press', 'eml_settings', 'cache-enabler', 'fluent-mail', 'litespeed-cache-options'];
            foreach ($options_submenus as $optsubmenu) {
                remove_submenu_page('options-general.php', $optsubmenu);
            }

    }
}
add_action('admin_menu', 'my_remove_menu_pages', 999);

    // Dodatočná funkcia pre skrytie Blocksy menu s CSS ako záloha
    function hide_blocksy_menu_css() {
    global $current_user;
    wp_get_current_user();

    // Skryť Blog2Social v admin bare len pre používateľov nižších ako Editor alebo Administrator
    if (!current_user_can('editor') && !current_user_can('administrator')) {
        echo '<style>
            #wp-admin-bar-blog2social { display: none !important; }
        </style>';
    }

    // Skrytie ďalších položiek pre všetkých okrem používateľa 'artefactum'
    if ($current_user->user_login != 'artefactum') {
        echo '<style>
            #adminmenu a[href*="ct-dashboard-account"], #adminmenu .wp-first-item a[href*="ct-dashboard"], #adminmenu a[href*="site-editor.php"], #adminmenu a[href*="customize.php?return=%2Fwp-admin%2Fthemes.php"], .theme-actions a[href*="wp-admin%2Fthemes.php"], a.hide-if-no-customize, .ab-submenu li a[href*="options-general.php?page=translate-press"], #wp-admin-bar-elementor-maintenance-on,#wp-admin-bar-litespeed-bar-manage,#wp-admin-bar-litespeed-bar-setting,#wp-admin-bar-litespeed-bar-imgoptm, #wp-admin-bar-litespeed-bar-imgoptm,#new_admin_email, #new_admin_email + p.description, label[for="new_admin_email"] {display: none !important;}
        </style>';
    }
}
    add_action('admin_head', 'hide_blocksy_menu_css');
}






/* Artefactum custom menu horizontal shortcode */
function custom_wp_menu_shortcode($atts) {
    $atts = shortcode_atts(['menu' => ''], $atts);
    if (empty($atts['menu'])) return 'Zadaj názov menu v shortcóde.';

    ob_start();
    wp_nav_menu([
        'menu' => $atts['menu'],
        'menu_class' => 'custom-horizontal-menu',
        'walker' => new Custom_Walker_Nav_Menu()
    ]);
    return ob_get_clean();
}
add_shortcode('custom_menu', 'custom_wp_menu_shortcode');

class Custom_Walker_Nav_Menu extends Walker_Nav_Menu {
    function start_el(&$output, $item, $depth = 0, $args = null, $id = 0) {
        $classes = empty($item->classes) ? [] : (array) $item->classes;

        // Ak ide o aktuálnu stránku – nenechaj ju zobraziť vôbec
        if (in_array('current-menu-item', $classes, true)) {
            return;
        }

        $class_names = join(' ', array_filter($classes));
        $output .= '<li class="' . esc_attr($class_names) . '">';
        $output .= '<a href="' . esc_url($item->url) . '">' . esc_html($item->title) . '</a>';
        $output .= '</li>';
    }
}


//Artefactum - Gravity Forms currency setting
add_filter('gform_currencies', function($currencies) {
    $currencies['EUR']['thousand_separator'] = ' ';
    $currencies['EUR']['decimal_separator'] = ',';
//	$currencies['EUR']['symbol_right'] = ' €';
    return $currencies;
}, 20);

//Artefactum - Gravity Forms language detection
add_filter( 'gform_pre_render', 'set_language_field' );
add_filter( 'gform_pre_submission_filter', 'set_language_field' );
function set_language_field( $form ) {
    // Získa aktuálny jazyk z TranslatePress (je to prvý segment URI)
    $lang = explode( '/', trim( $_SERVER['REQUEST_URI'], '/' ) )[0];

    // Nastav hodnotu pre každé pole s názvom "language"
    foreach ( $form['fields'] as &$field ) {
        if ( strtolower( $field->label ) === 'language' ) {
            $field->defaultValue = $lang;
        }
    }

    return $form;
}

/*GF7 - kalkulacia*/
add_action('wp_enqueue_scripts', function() {
    // Načítanie skriptu len na stránke s formulárom
    if (is_page('online-kalkulacia') || is_page('calculation-online/') || is_page('calc-test/')) { // Uprav podľa slug-u alebo ID stránky
        wp_enqueue_script(
            'custom-fence-calc', // Unikátny handle
            get_stylesheet_directory_uri() . '/js/fence-calc.js', // Cesta k súboru
            ['jquery', 'gform_gravityforms'], // Závislosti
            '1.0.0', // Verzia (voliteľné)
            true // Načítať v footer-i
        );
    }
});

add_filter('gform_validation_7', function($validation_result) {
    $form = $validation_result['form'];
    foreach ($form['fields'] as &$field) {
        if (in_array($field->id, [22, 23])) {
            $field->failed_validation = false;
            $field->validation_message = '';
        }
    }
    $validation_result['form'] = $form;
    return $validation_result;
});