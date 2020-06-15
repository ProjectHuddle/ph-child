=== ProjectHuddle Client Site ===
Contributors: 2winfactor
Donate link: https://projecthuddle.io
Tags: project, huddle, child, feedback
Requires at least: 4.7
Tested up to: 5.2.2
Stable tag: 1.0.0
Requires PHP: 5.6
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Provides a secure connection between your ProjectHuddle parent site and your client sites, syncing identities so clients can use their WordPress identities for commenting.

== Description ==

This is the Child plugin for [ProjectHuddle](https://projecthuddle.io)

The ProjectHuddle Client Site plugin is used to securely sync multiple WordPress client identities with your ProjectHuddle parent site. This plugin is to be installed on every WordPress site you want to let your clients give feedback.

[ProjectHuddle](https://projecthuddle.io) is a self-hosted client feedback system that allows you to get feedback on an endless amount of client sites from one central dashboard.

**Features include:**

* Connect and sync your client's identities with your ProjectHuddle projects.
* No login or registration is required if your client is logged into their own site.
* Choose which roles you want to allow for commenting.
* Allow non-users (guests) to leave comments.
* Optionally enable commenting on the WordPress admin.

== Installation ==

1. Upload the ProjectHuddle Child folder to the /wp-content/plugins/ directory
2. Activate the ProjectHuddle Child plugin through the 'Plugins' menu in WordPress
3. Use the Settings->Feedback screen to configure plugin options.

== Frequently Asked Questions ==

= What is the purpose of this plugin? =

It allows the connection between the [ProjectHuddle](https://projecthuddle.io) plugin and your clients sites to sync their identities with the system.

== Changelog ==

= 1.0.28 =
* Fix issue with guest commenting sometimes not working.

= 1.0.27 =
* Remove unnecessary admin notices regarding caching for Flywheel and WPEngine.

= 1.0.26 =
* Use localstorage for access token to eliminate issues with client site caching.

= 1.0.25 =
* Fix issue with display names containing apostrophes.

= 1.0.24 =
* Add notices for WPEngine, Flywheel cache exclusions.

= 1.0.23 =
* Fix issue with visiting access links to subpages not storing cookie correctly on other pages.

= 1.0.22 =
* Fix compatibility issue with Elementor.

= 1.0.21 =
* Fix compatibility issue with Divi.

= 1.0.20 =
* Fix compatibility issue with Beaver Builder.

= 1.0.19 =
* Fix compatibility issue with Fusion Builder.

= 1.0.16 =
* Fix issue with author not applying in white label options.

= 1.0.15 =
* Make sure widget only loads once per page in case of duplicate wp_footer calls.

= 1.0.14 =
* Add admin check to gettext filter to scope to plugin page before running function.

= 1.0.13 =
* Fix issue for accounts who's emails contain a "+" sign.

= 1.0.12 =
* Hide on Oxygen builder pages.

= 1.0.11 =
* Scope gettext calls to plugins page only to prevent logging excessive functions.
* Use PH_HIDE_WHITE_LABEL to hide white label tab from plugin settings.

= 1.0.10 =
* Disable comment interface on elementor builder.

= 1.0.9 =
* Fix cookie expiration date

= 1.0.8 =
* Allow access links to load comment interface (must use ProjectHuddle 3.6.17+)

= 1.0.7 =
* Defer script to not interfere with html parser in older browsers

= 1.0.6 =
* Update minimum WordPress requirement
* Make sure it cannot be activated if Parent plugin is activated on same installation.

= 1.0.5 =
* Add white label options.

= 1.0.4 =
* Update readme description and plugin title.

= 1.0.3 =
* Update readme description and plugin title.

= 1.0.2 =
* Fix manual import.

= 1.0.1 =
* Add access token override.

= 1.0.0 =
* Initial release
