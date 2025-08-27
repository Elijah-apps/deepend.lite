# Project Documentation: deepend.lite

This document provides a comprehensive overview of the `deepend.lite` project, detailing its file structure, the libraries and packages utilized, and the core functionalities of its components.

## 1. Project Overview

The `deepend.lite` project is an Android application designed to render local HTML pages from the `deepend-main` project. It leverages Android's WebView component to display web content, effectively turning a collection of HTML files into a native Android application.

## 2. File Structure

```
/Users/apple/Documents/GitHub/deepend.lite/
├───.DS_Store
├───build.gradle.kts
├───CODE_OF_CONDUCT.md
├───deepend-main.zip
├───gradle.properties
├───gradlew
├───gradlew.bat
├───LICENSE
├───README.md
├───settings.gradle.kts
├───SuperWebView-master.zip
├───.git/...
├───app/
│   ├───.gitignore
│   ├───build.gradle.kts
│   ├───proguard-rules.pro
│   └───src/
│       └───main/
│           ├───AndroidManifest.xml
│           ├───java/
│           │   └───com/
│           │       └───roozbehzarei/
│           │           └───deepend/
│           │               ├───MainActivity.kt
│           │               └───ui/
│           │                   └───theme/
│           │                       ├───Color.kt
│           │                       ├───Theme.kt
│           │                       └───Type.kt
│           ├───res/
│           │   ├───drawable/...
│           │   ├───drawable-v24/...
│           │   ├───mipmap-anydpi-v26/...
│           │   ├───mipmap-hdpi/...
│           │   ├───mipmap-mdpi/...
│           │   ├───mipmap-xhdpi/...
│           │   ├───mipmap-xxhdpi/...
│           │   ├───mipmap-xxxhdpi/...
│           │   ├───values/
│           │   │   ├───colors.xml
│           │   │   ├───strings.xml
│           │   │   └───themes.xml
│           │   ├───values-night/...
│           │   └───xml/...
│           └───assets/
│               ├───account-settings.html
│               ├───admin-dashboard.html
│               ├───auth.html
│               ├───booking-summary.html
│               ├───cart.html
│               ├───checkout.html
│               ├───edit-payment-method.html
│               ├───equipment-rental.html
│               ├───food.html
│               ├───hotel-booking.html
│               ├───index.html
│               ├───intro.html
│               ├───login-form.html
│               ├───movie-ticketing.html
│               ├───order-history.html
│               ├───order-success.html
│               ├───order-tracking.html
│               ├───profile.html
│               ├───README.md
│               ├───register-form.html
│               ├───studio-booking.html
│               ├───styles.css
│               ├───vr-games.html
│               └───assets/
│                   ├───logo.png
│                   └───fontawesome/
│                       ├───all.css
│                       └───all.js
├───deepend-main/... (Original HTML project source)
└───gradle/...
```

## 3. Libraries and Packages Used

This section details the external libraries and packages used in the Android application, primarily defined in `app/build.gradle.kts`.

### AndroidX Libraries

*   **`androidx.core:core-ktx`**: Kotlin extensions for AndroidX libraries, providing a more idiomatic Kotlin experience.
*   **`androidx.lifecycle:lifecycle-runtime-ktx`**: Kotlin extensions for Lifecycle-aware components.
*   **`androidx.activity:activity-compose`**: Integration of Compose with `ComponentActivity`.
*   **`androidx.compose:compose-bom`**: Bill of Materials for Compose, ensuring version compatibility for Compose libraries.
*   **`androidx.compose.ui:ui`**: Core UI toolkit for Compose.
*   **`androidx.compose.ui:ui-graphics`**: Graphics primitives for Compose UI.
*   **`androidx.compose.ui:ui-tooling-preview`**: Tools for previewing Compose UI in Android Studio.
*   **`androidx.compose.material3:material3`**: Material Design 3 components for Compose.
*   **`androidx.compose.material:material`**: Material Design 2 components for Compose (used for `PullRefreshIndicator`).
*   **`androidx.core:core-splashscreen`**: Library for implementing splash screens.

### Testing Libraries

*   **`junit:junit`**: A popular unit testing framework for Java.
*   **`androidx.test.ext:junit`**: JUnit extensions for AndroidX Test.
*   **`androidx.test.espresso:espresso-core`**: A testing framework for Android UI testing.
*   **`androidx.compose.ui:ui-test-junit4`**: Compose UI testing extensions for JUnit4.
*   **`androidx.compose.ui:ui-tooling`**: Tools for Compose UI development.
*   **`androidx.compose.ui:ui-test-manifest`**: Manifest for Compose UI testing.

## 4. Core Components and Functionality

### `app/src/main/AndroidManifest.xml`

*   **Purpose**: Defines the fundamental characteristics of the app and declares its components.
*   **Key Configurations**:
    *   `package="com.roozbehzarei.deepend"`: The unique package name for the application.
    *   `uses-permission android:name="android.permission.INTERNET"`: Grants the app permission to access the internet, crucial for WebView functionality.
    *   `uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"`: Allows the app to access information about networks.
    *   `android:icon="@mipmap/ic_launcher"`: Specifies the application's icon.
    *   `android:label="depeend"`: Sets the user-visible title of the application.
    *   Declares `MainActivity` as the main entry point with an `intent-filter` for `android.intent.action.MAIN` and `android.intent.category.LAUNCHER`.

### `app/src/main/java/com/roozbehzarei/deepend/MainActivity.kt`

*   **Purpose**: The main activity of the Android application, responsible for hosting the WebView and managing its behavior.
*   **Key Functionality**:
    *   **`onCreate`**: Initializes the activity, sets up the Compose UI, and installs the splash screen.
    *   **`MainScreen` Composable**: The main UI component that contains the `WebViewer`. It also manages a progress indicator and a pull-to-refresh mechanism.
    *   **`WebViewer` Composable**:
        *   Hosts the `WebView` instance.
        *   Configures `WebSettings` to enable JavaScript (`javaScriptEnabled = true`) and DOM storage (`domStorageEnabled = true`), which are essential for modern web applications.
        *   Sets a custom `WebViewClient` to control navigation and handle errors.
        *   Sets a custom `WebChromeClient` to handle progress updates and full-screen video.
        *   **`shouldOverrideUrlLoading`**: This method is overridden in `WebViewClient` to control URL loading:
            *   If the URL starts with `file:///android_asset/`, it allows the WebView to load the local HTML file, enabling navigation between the embedded pages.
            *   For any other URL (external links), it opens them in an external web browser using an `Intent`.
        *   **`onReceivedError`**: This method is overridden to handle network errors during page loading. It currently clears the WebView content by loading `about:blank` and can be extended to show custom error messages or retry options.
        *   **`onPageStarted`**: Updates the `isBackEnabled` state based on whether the WebView can go back in its history, enabling the `BackHandler`.
        *   **`onProgressChanged`**: Updates the loading progress for the `LinearProgressIndicator`.
        *   **`onShowCustomView` / `onHideCustomView`**: Handles full-screen video playback.
    *   **`BackHandler`**: Intercepts the back button press to navigate back within the WebView's history if possible.

### `app/src/main/java/com/roozbehzarei/deepend/ui/theme/Color.kt`

*   **Purpose**: Defines the color palette for the Compose Material Design theme.
*   **Content**: Contains `Color` objects representing various shades (e.g., `Purple80`, `Purple40`) used throughout the application's UI.

### `app/src/main/java/com/roozbehzarei/deepend/ui/theme/Theme.kt`

*   **Purpose**: Defines the Compose Material Design theme for the application.
*   **Key Functionality**:
    *   Sets up `DarkColorScheme` and `LightColorScheme` using colors defined in `Color.kt`.
    *   Applies dynamic coloring based on Android version (if available).
    *   Configures the status bar color.
    *   Applies the `MaterialTheme` to the content, providing consistent styling.

### `app/src/main/java/com/roozbehzarei/deepend/ui/theme/Type.kt`

*   **Purpose**: Defines the typography (font styles, sizes, weights) for the Compose Material Design theme.
*   **Content**: Contains `TextStyle` definitions for various text elements, such as `bodyLarge`.

### `app/src/main/res/values/strings.xml`

*   **Purpose**: Stores user-facing strings, allowing for easy localization.
*   **Content**: Defines the application name (`app_name`) and other UI strings like error messages.

### `app/src/main/assets/`

*   **Purpose**: Contains all the static web assets (HTML, CSS, JavaScript, images) that the WebView will render. These files are bundled with the Android application.
*   **Content`:
    *   All `.html` files from the original `deepend-main` project (e.g., `index.html`, `account-settings.html`, `admin-dashboard.html`).
    *   `styles.css`: The main stylesheet for the HTML pages.
    *   `assets/`: A subdirectory containing images (`logo.png`) and Font Awesome assets (`fontawesome/all.css`, `fontawesome/all.js`).
    *   External JavaScript libraries (e.g., Bootstrap, Chart.js, Leaflet.js) are referenced via CDN in the HTML files, but their local copies are not present in this directory.

## 5. Build System Configuration (`build.gradle.kts`)

### `build.gradle.kts` (Project Level)

*   **Purpose**: Configures the build process for the entire project.
*   **Key Configurations**:
    *   Defines repositories for dependencies (e.g., Google's Maven repository, Maven Central).
    *   Declares dependencies for Gradle plugins (e.g., Android Gradle Plugin, Kotlin Gradle Plugin).

### `app/build.gradle.kts` (App Module Level)

*   **Purpose**: Configures the build process specifically for the Android application module.
*   **Key Configurations**:
    *   `plugins`: Applies the Android Application plugin and Kotlin Android plugin.
    *   `android`:
        *   `namespace`: Defines the Kotlin/Java package name for the generated R and BuildConfig classes (`com.roozbehzarei.deepend`).
        *   `compileSdk`: The Android API level to compile against.
        *   `defaultConfig`:
            *   `applicationId`: The unique ID for the application (`com.roozbehzarei.deepend`).
            *   `minSdk`: The minimum Android API level supported.
            *   `targetSdk`: The Android API level the app is designed to run on.
            *   `versionCode` and `versionName`: Versioning information for the app.
            *   `testInstrumentationRunner`: The test runner to use for Android tests.
        *   `buildTypes`: Configures build variants (e.g., `release` for production, `debug` for development).
        *   `compileOptions` and `kotlinOptions`: Specify Java and Kotlin compatibility versions.
        *   `buildFeatures { compose = true }`: Enables Jetpack Compose.
        *   `composeOptions`: Configures Compose compiler extension version.
        *   `packaging`: Configures how resources are packaged.
    *   `dependencies`: Declares all the libraries and modules that the app depends on, including AndroidX, Compose, and testing libraries.

## 6. Original `deepend-main` Project

The `deepend-main` directory contains the original HTML, CSS, and JavaScript files that form the web content of the application. These files are copied into the Android app's `assets` folder. The structure and content of this directory are crucial for the visual and interactive aspects of the Android application.

