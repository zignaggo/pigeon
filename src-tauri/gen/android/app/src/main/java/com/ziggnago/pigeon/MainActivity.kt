package com.ziggnago.pigeon

import android.graphics.Color
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

class MainActivity : TauriActivity() {
  @Volatile
  private var contentReady = false

  override fun onCreate(savedInstanceState: Bundle?) {
    val splashScreen = installSplashScreen()
    val start = System.currentTimeMillis()
    splashScreen.setKeepOnScreenCondition {
      !contentReady && System.currentTimeMillis() - start < 8000L
    }
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    webView.setBackgroundColor(Color.parseColor("#1A1612"))
    webView.addJavascriptInterface(SplashBridge(), "PigeonSplash")
  }

  inner class SplashBridge {
    @JavascriptInterface
    fun ready() {
      contentReady = true
    }
  }
}
