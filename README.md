## ディレクトリ構成
コードは、画面・機能に近い場所を優先し、複数箇所で使う場合は責務に合った共有先へ配置します。

```text
src/
├── app/                  # Next.jsのルートとページ。機能を組み合わせる
├── features/             # 機能単位のUI・Hook・設定・処理
│   └── <feature>/
│       ├── components/   # 機能固有のUI
│       ├── func/         # 機能固有の通常関数・定数
│       ├── hooks/        # 機能固有のカスタムHook
│       └── index.ts      # 機能外へ公開するAPI
├── components/           # 機能に依存しない共有UI
├── hooks/                # 複数機能で使うカスタムHook
├── services/             # Firebaseなど外部サービスとの連携
├── config/               # 複数機能で共有するアプリケーション設定
├── lib/                  # 機能に依存しない処理、外部ライブラリの初期化・薄いラッパー
├── store/                # アプリケーションで共有する状態管理
├── types.ts              # 複数機能で共有する型
└── instrumentation*.ts   # Next.jsの起動時初期化・計測
```

機能固有のコードは `features/<feature>/` にまとめ、UI・通常関数・Hookをそれぞれ `components/`・`func/`・`hooks/` に配置します。ページは機能を組み合わせ、機能外から利用するものは `index.ts` からexportして `@/features/<feature>` 経由でimportします。機能内部では各ファイルから直接importできます。このルールを守るため、ESLintで `@/features/<feature>/...` の深いimportを禁止します。複数機能で使うものだけを共有ディレクトリに置き、ファイルは原則として1つの主な責務に絞ります。
