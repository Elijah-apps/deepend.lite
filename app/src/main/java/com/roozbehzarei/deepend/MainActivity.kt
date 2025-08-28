package com.roozbehzarei.deepend

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.roozbehzarei.deepend.ui.theme.WebViewTheme

/**
 * Main activity that hosts the WebView application
 */
class MainActivity : ComponentActivity() {

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        
        setContent {
            WebViewTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainScreen()
                }
            }
        }
    }
}

/**
 * Main screen composable containing the WebView and associated UI
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MainScreen() {
    var progress by rememberSaveable { mutableIntStateOf(0) }
    var fullScreenView: View? by remember { mutableStateOf(null) }
    var webView: WebView? by remember { mutableStateOf(null) }
    
    Scaffold(
        modifier = Modifier
            .fillMaxSize()
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            WebViewer(
                updateProgress = { currentProgress -> progress = currentProgress },
                onViewReceived = { fullScreenView = it },
                onWebViewCreated = { webView = it }
            )
            
            ProgressIndicator(progress)
        }
    }

    // Handle fullscreen view (e.g., video player)
    AnimatedVisibility(visible = fullScreenView != null) {
        fullScreenView?.let { view ->
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { view }
            )
        }
    }
}

/**
 * Progress indicator that shows loading progress
 */
@Composable
private fun ProgressIndicator(progress: Int) {
    AnimatedVisibility(
        modifier = Modifier.fillMaxWidth(),
        visible = progress in 1..99
    ) {
        LinearProgressIndicator(
            progress = { progress.toFloat() / 100f },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

/**
 * WebView composable that handles web content display and interactions
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
private fun WebViewer(
    modifier: Modifier = Modifier,
    updateProgress: (Int) -> Unit,
    onViewReceived: (View?) -> Unit,
    onWebViewCreated: (WebView) -> Unit
) {
    var webView: WebView? by remember { mutableStateOf(null) }
    var isBackEnabled by rememberSaveable { mutableStateOf(false) }

    // Override back navigation to load WebView's previous webpage
    BackHandler(enabled = isBackEnabled) {
        webView?.goBack()
    }

    AndroidView(
        modifier = modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                webViewClient = AuthWebViewClient(
                    context = context,
                    onBackStateChanged = { canGoBack ->
                        isBackEnabled = canGoBack
                    }
                )
                
                webChromeClient = object : WebChromeClient() {
                    // Pass up current loading progress to be used by ProgressIndicator
                    override fun onProgressChanged(view: WebView?, newProgress: Int) {
                        super.onProgressChanged(view, newProgress)
                        updateProgress(newProgress)
                    }

                    // Handle fullscreen video playback
                    override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
                        onViewReceived(view)
                        super.onShowCustomView(view, callback)
                    }

                    override fun onHideCustomView() {
                        onViewReceived(null)
                        super.onHideCustomView()
                    }
                }
                
                // Configure WebView settings
                with(settings) {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    databaseEnabled = true
                    setSupportZoom(true)
                    builtInZoomControls = true
                    displayZoomControls = false
                    loadWithOverviewMode = true
                    useWideViewPort = true
                    
                    // Enable modern web features
                    allowContentAccess = true
                    allowFileAccess = true
                    
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        isAlgorithmicDarkeningAllowed = true
                    }
                    
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        safeBrowsingEnabled = true
                    }
                }
                
                // Load initial URL
                loadUrl("file:///android_asset/auth.html")
                webView = this
                onWebViewCreated(this)
            }
        },
        update = { view ->
            webView = view
        }
    )
}

/**
 * Custom WebViewClient to handle authentication and navigation
 */
class AuthWebViewClient(
    private val context: Context,
    private val onBackStateChanged: (Boolean) -> Unit = {}
) : WebViewClient() {

    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url.toString()
        
        return when {
            url.startsWith("file:///android_asset/auth.html") -> {
                // Handle authentication flow
                if (isAuthenticated()) {
                    view?.loadUrl("file:///android_asset/index.html")
                } else {
                    view?.loadUrl("file:///android_asset/login-form.html")
                }
                true
            }
            url.startsWith("file://") -> {
                // Allow local asset files
                false
            }
            else -> {
                // For external URLs, you might want to open in browser
                // or handle differently based on your app's needs
                false
            }
        }
    }

    override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
        super.onPageStarted(view, url, favicon)
        // Update back button state
        onBackStateChanged(view?.canGoBack() == true)
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        // Update back button state
        onBackStateChanged(view?.canGoBack() == true)
    }

    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: WebResourceError?
    ) {
        super.onReceivedError(view, request, error)
        
        // Handle errors gracefully
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val errorCode = error?.errorCode
            val description = error?.description
            
            // You can show custom error page or handle specific errors
            when (errorCode) {
                ERROR_HOST_LOOKUP,
                ERROR_CONNECT,
                ERROR_TIMEOUT -> {
                    // Network related errors
                    view?.loadUrl("file:///android_asset/error_network.html")
                }
                ERROR_FILE_NOT_FOUND -> {
                    // File not found
                    view?.loadUrl("file:///android_asset/error_404.html")
                }
                else -> {
                    // Generic error handling
                    view?.loadUrl("file:///android_asset/error_generic.html")
                }
            }
        }
    }

    /**
     * Check if user is authenticated by looking for stored credentials
     */
    private fun isAuthenticated(): Boolean {
        val sharedPreferences = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        val credentials = sharedPreferences.getString("userCredentials", null)
        return !credentials.isNullOrEmpty()
    }
}