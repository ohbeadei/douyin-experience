package com.yourname.douyin;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WebView webView = this.bridge.getWebView();
        WebSettings settings = webView.getSettings();

        settings.setJavaScriptEnabled(true);                 // 启用 JS
        settings.setDomStorageEnabled(true);                 // 启用本地存储
        settings.setLoadsImagesAutomatically(true);          // ⭐允许加载图片
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
                                                             // ⭐允许 https 加载 http 内容
        settings.setBlockNetworkImage(false);                // 不阻止网络图片
    }
}
