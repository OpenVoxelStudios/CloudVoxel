---
description: Manage the server by using the built-in Command Line Argument (CLI).
icon: terminal
cover: >-
  https://github.com/user-attachments/assets/c75dd325-8a84-4033-a2ee-7f2ebf4f05d6
coverY: 66
layout:
  cover:
    visible: true
    size: full
  title:
    visible: true
  description:
    visible: true
  tableOfContents:
    visible: true
  outline:
    visible: true
  pagination:
    visible: true
---

# CLI

You can run the CLI with the following command (more providers may come later):

{% tabs %}
{% tab title="Bun" %}
```bash
bun cli # or "bun run cli"
```
{% endtab %}
{% endtabs %}

You will be able to navigate using your arrow keys and select using the <kbd>ENTER</kbd> key. This CLI configuration method allows you to edit the config without having to restart the whole server!

When running the CLI, here are all the different options you select from:

{% tabs %}
{% tab title="User management" %}
Manage the users that can access your CloudVoxel instance. You can either create new users or manage the existing ones from this command.

* To create a new user, simply select `Create user` and enter it's email, username and optionally a password that will be encrypted.
* If you want to manage a user, select the desired user using the up and down arrows and press <kbd>ENTER</kbd>. You can then get all infos corresponding to this user, edit it's username, password or delete the user.
{% endtab %}

{% tab title="API key management" %}
Manage the API keys that can access your CloudVoxel instance. You can either create new API keys or manage the existing ones from this command.

* To create a new API key, simply select `Create API key` and enter a name for this API key. It will then ask you to select permissions for this API key. For help with the permissions, check out [api-key-permissions.md](../other/api-key-permissions.md "mention").
* If you want to manage an API key, select the desired key using the up and down arrows and press <kbd>ENTER</kbd>. You can then get all infos corresponding to this API key, edit it's name, permissions or delete the key.
{% endtab %}

{% tab title="Group management" %}
Groups is the way of grouping users for simplified permission management! You can either create new groups or manage the existing ones from this command. To understand and use groups for Partitions access, read [partitions.md](partitions.md "mention").

* To create a new group, simply select `Create group` and you will have to enter a unique lower case group identifier and the group display name.
* If you want to manage a group, select the desired group using the up and down arrows and press <kbd>ENTER</kbd>. You can then get all infos corresponding to this group, edit it's display name, users inside the group (a single user can be in multiple groups) or delete the group.
{% endtab %}

{% tab title="Sync files" %}
This will simply run the `sync` script to synchronize the database and the local storage. This is needed in case of any potential de-sync, bugs or storage reset.

It will delete database files not existing in the folder and create database entries for files existing only in the folder. It will create those files with the "Server Admin" user.
{% endtab %}
{% endtabs %}

{% hint style="info" %}
You can press <kbd>CTRL + C</kbd> at any time to exit the CLI.
{% endhint %}
