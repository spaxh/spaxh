import fetch from "node-fetch";
import fs from "fs";

const GITHUB_USERNAME = "spaxh"; // Substitua pelo seu nome de usuário no GitHub

// Função para pegar todos os repositórios do usuário
async function getRepos() {
  const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos`);
  const repos = await response.json();
  return repos.map(repo => repo.name);
}

// Função para pegar as linguagens usadas em cada repositório
async function getLanguages(repos) {
  let languageStats = {};

  for (const repo of repos) {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo}/languages`);
    const data = await response.json();

    for (const [language, bytes] of Object.entries(data)) {
      languageStats[language] = (languageStats[language] || 0) + bytes;
    }
  }

  return Object.keys(languageStats).sort((a, b) => languageStats[b] - languageStats[a]);
}

// Função para detectar as ferramentas usadas nos repositórios
async function detectTools(repos) {
  let tools = {
    frontend: new Set(),
    backend: new Set(),
    databases: new Set(),
    devOps: new Set(),
    toolchains: new Set(),
    hosting: new Set(),
    operatingSystems: new Set(),
    iot: new Set(),
    editors: new Set(),
  };

  for (const repo of repos) {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repo}/contents/package.json`);
    if (response.status === 200) {
      const packageJson = await response.json();
      const dependencies = JSON.parse(Buffer.from(packageJson.content, 'base64').toString()).dependencies || {};

      // Adicionando dependências como ferramentas
      if (dependencies.react) tools.frontend.add("React");
      if (dependencies.vue) tools.frontend.add("Vue");
      if (dependencies.express) tools.backend.add("Express");
      if (dependencies.mongoose) tools.databases.add("MongoDB");
    }
  }

  return {
    frontend: Array.from(tools.frontend),
    backend: Array.from(tools.backend),
    databases: Array.from(tools.databases),
    devOps: Array.from(tools.devOps),
    toolchains: Array.from(tools.toolchains),
    hosting: Array.from(tools.hosting),
    operatingSystems: Array.from(tools.operatingSystems),
    iot: Array.from(tools.iot),
    editors: Array.from(tools.editors),
  };
}

// Função para atualizar o README com as informações obtidas
async function updateReadme() {
  const repos = await getRepos();
  const languages = await getLanguages(repos);
  const tools = await detectTools(repos);

  const readmeContent = `
\`\`\`js
import Profile from "spaxh";

class Bio extends Profile {
  name    = "Spaxh";
  email   = "hello@spaxh.ga";
  website = "https://spaxh.ga";
}

class Skills extends Profile {
  languages        = ${JSON.stringify(languages, null, 2)};
  frontend         = ${JSON.stringify(tools.frontend, null, 2)};
  backend          = ${JSON.stringify(tools.backend, null, 2)};
  databases        = ${JSON.stringify(tools.databases, null, 2)};
  devOps           = ${JSON.stringify(tools.devOps, null, 2)};
  toolchains       = ${JSON.stringify(tools.toolchains, null, 2)};
  hosting          = ${JSON.stringify(tools.hosting, null, 2)};
  operatingSystems = ${JSON.stringify(tools.operatingSystems, null, 2)};
  iot              = ${JSON.stringify(tools.iot, null, 2)};
  editors          = ${JSON.stringify(tools.editors, null, 2)};
}
\`\`\`

## 📌 Meus repositórios mais recentes:
${repos.map(repo => `- [${repo}](https://github.com/${GITHUB_USERNAME}/${repo})`).join("\n")}`;

  fs.writeFileSync("README.md", readmeContent);
}

updateReadme();
