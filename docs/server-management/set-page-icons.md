---
description: >-
  Your website should have an icon. We provide a default icon but it should be
  changed to meet your requirements. Here's how!
icon: icons
---

# Set page icons

Once you have your square icon ready in a current format (like png, jpeg...), visit this favicon generator page and upload it:

{% embed url="https://realfavicongenerator.net" %}
Recommended site for generating all the required icons
{% endembed %}

You can tweak the options and when you are done, click **Next**. Select **Next.js** and download the app files and public files zips. Once both unzipped, move the files from the "app files zip" (<mark style="color:red;">except manifest.json</mark>) and move them to `/src/app`, they should replace the old default icons. Do the same process for the "public files zip" but this time move the generated files to `/public`.

Once all of this is done, copy your initial icon in the `/public` folder under the `siteicon.png` name. And that's it! Rebuild your server if necessary and you are ready to go!
