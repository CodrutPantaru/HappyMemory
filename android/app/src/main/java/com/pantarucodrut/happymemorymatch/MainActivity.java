package com.pantarucodrut.happymemorymatch;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    if (getBridge() == null) {
      return;
    }

    WebView webView = getBridge().getWebView();
    if (webView == null) {
      return;
    }

    webView.setLongClickable(false);
    webView.setHapticFeedbackEnabled(false);
    webView.setOnLongClickListener(v -> true);
    webView.setOnCreateContextMenuListener(null);
  }
}

