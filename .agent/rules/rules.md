---
trigger: always_on
---

# Design pattern

- Atomic design

# Vue pattern

order of sections in .vue file order must

<template></template>

<script></script>

<style></style>

# Q/A

- When question start with "Q/A", just anwser user, don't process or plan any thing
- Always answer user in Vietnamese

# Directory structure

```
root/
├── .output/
├── .nuxt/
├── app/                  <-- NEW: Main Vue Application
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── layouts/
│   ├── middleware/
│   ├── pages/
│   ├── plugins/
│   ├── utils/
│   ├── app.vue
│   ├── app.config.ts
│   └── error.vue
├── server/               <-- Nitro Server Engine
│   ├── api/
│   ├── routes/
│   ├── middleware/
│   └── utils/
├── public/               <-- Static Public Assets
├── shared/               <-- NEW: Shared Utils/Types (App + Server)
├── modules/              <-- Local Nuxt Modules
├── nuxt.config.ts
└── tsconfig.json
```
