<?php

function my_theme_enqueue_styles() { 
    $parent_style = 'parent-style'; // This is 'twentyfifteen-style' for the Twenty Fifteen theme.
 
    wp_enqueue_style( $parent_style, get_template_directory_uri() . '/style.css' );
    // wp_enqueue_style( 'child-style',
    //     get_stylesheet_directory_uri() . '/style.css',
    //     array( $parent_style )
    // ); // add version
    wp_enqueue_style( 'fontawesome-fonts-style', get_stylesheet_directory_uri() . '/css/all.min.css');
    wp_enqueue_style( 'main-style', get_stylesheet_directory_uri() . '/css/main.css', array(), '/main.css');
}

function mycustomscript_enqueue() {
    wp_enqueue_script( 'main-scripts', get_stylesheet_directory_uri() . '/js/build.min.js', array( 'jquery' ), 'build.min.js');
}

add_action( 'wp_enqueue_scripts', 'my_theme_enqueue_styles' );

add_action( 'wp_enqueue_scripts', 'mycustomscript_enqueue' );