const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName("source")
    .setDescription("Sends the source code page with GitHub information!"),
  async execute(interaction) {
    const repoUrl = "https://github.com/PotassiumSoftware/Oreo";
    const apiUrl = "https://api.github.com/repos/PotassiumSoftware/Oreo";
    const commitsUrl = `${apiUrl}/commits`;
    const contributorsUrl = `${apiUrl}/contributors`;

    let recentCommits = "";
    let contributors = "";
    let repoDescription = "";
    let stars = 0;
    let forks = 0;
    let watchers = 0;
    let lastUpdated = "Unknown";
    let openIssues = 0;
    let openPRs = 0;
    let repoName = "";
    let ownerName = "";
    let ownerAvatar = "";
    let ownerUrl = "";
    let license = "Unknown";

    try {
      const { default: fetch } = await import("node-fetch");

      const repoResponse = await fetch(apiUrl);
      const repoData = await repoResponse.json();
      repoName = repoData.full_name;
      ownerName = repoData.owner.login;
      ownerAvatar = repoData.owner.avatar_url;
      ownerUrl = repoData.owner.html_url;
      repoDescription = repoData.description || "No description available.";
      license = repoData.license ? repoData.license.name : "No license information";
      stars = repoData.stargazers_count;
      forks = repoData.forks_count;
      watchers = repoData.watchers_count;
      lastUpdated = new Date(repoData.updated_at).toLocaleDateString();
      openIssues = repoData.open_issues_count;

      const commitsResponse = await fetch(commitsUrl);
      const commitsData = await commitsResponse.json();
      recentCommits = commitsData
        .slice(0, 5) 
        .map((commit) => {
          const commitMessage = commit.commit.message;
          const url = commit.html_url;
          const [primaryMessage] = commitMessage.split('\n\n');
          const truncatedPrimaryMessage = primaryMessage.length > 100 ? `${primaryMessage.slice(0, 100)}...` : primaryMessage; 
          return `[${truncatedPrimaryMessage}](${url})`;
        })
        .join("\n");

      const contributorsResponse = await fetch(contributorsUrl);
      const contributorsData = await contributorsResponse.json();
      contributors = contributorsData
        .map((contributor) => {
          const url = contributor.html_url;
          const name = contributor.login;
          return `[${name}](${url})`;
        })
        .join("\n");

      const prsResponse = await fetch(`${apiUrl}/pulls?state=open`);
      const prsData = await prsResponse.json();
      openPRs = prsData.length;
    } catch (error) {
      log.error("Error fetching data:", error, killprocess = false);
      recentCommits = "Unable to fetch recent commits.";
      contributors = "Unable to fetch contributors.";
    }

    const embed = new EmbedBuilder()
      .setColor("#3498DB")
      .setTitle(repoName)
      .setURL(repoUrl)
      .setAuthor({ name: ownerName, iconURL: ownerAvatar, url: ownerUrl })
      .setDescription(repoDescription)
      .addFields(
        { name: "License", value: license, inline: true },
        { name: "Stars", value: stars.toString(), inline: true },
        { name: "Forks", value: forks.toString(), inline: true },
        { name: "Watchers", value: watchers.toString(), inline: true },
        { name: "Last Updated", value: lastUpdated, inline: true },
        { name: "Open Issues", value: openIssues.toString(), inline: true },
        { name: "Open PRs", value: openPRs.toString(), inline: true },
        { name: "Recent Commits", value: recentCommits || "No recent commits found.", inline: true },
        { name: "Contributors", value: contributors || "No contributors found.", inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};