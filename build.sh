rm -r dist
npm run build
cp manifest.json images/icon.png content-script.js background.js demo.txt dist
