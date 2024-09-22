const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const BASE_URL = "http://www.omdbapi.com/";
const API_KEY = global.config.api.omdb.key;

module.exports = {
	cooldown: 30,
	data: new SlashCommandBuilder()
		.setName("movie")
		.setDescription("Fetches movie details.")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("search")
				.setDescription("Search for movies by title")
				.addStringOption((option) => option.setName("title").setDescription("The title of the movie").setRequired(true))
				.addStringOption((option) =>
					option
						.setName("type")
						.setDescription("Type of result to return")
						.addChoices({ name: "Movie", value: "movie" }, { name: "Series", value: "series" }, { name: "Episode", value: "episode" })
				)
				.addStringOption((option) => option.setName("year").setDescription("Year of release"))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("info")
				.setDescription("Fetch detailed information about a specific movie")
				.addStringOption((option) => option.setName("title").setDescription("The title of the movie").setRequired(true))
				.addStringOption((option) =>
					option
						.setName("type")
						.setDescription("Type of result to return")
						.addChoices({ name: "Movie", value: "movie" }, { name: "Series", value: "series" }, { name: "Episode", value: "episode" })
				)
				.addStringOption((option) => option.setName("year").setDescription("Year of release"))
				.addStringOption((option) => option.setName("plot").setDescription("Return short or full plot").addChoices({ name: "Short", value: "short" }, { name: "Full", value: "full" }))
		),
	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand();
		const title = interaction.options.getString("title");
		const type = interaction.options.getString("type") || '';
		const year = interaction.options.getString("year") || '';
		const plot = interaction.options.getString("plot") || "short";
		const url = `${BASE_URL}?apikey=${API_KEY}&t=${encodeURIComponent(title)}${type ? `&type=${type}` : ""}${year ? `&y=${year}` : ""}&plot=${plot}`;

		try {
			if (subcommand === "search") {
				const searchUrl = `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(title)}${type ? `&type=${type}` : ""}${year ? `&y=${year}` : ""}`;
				const response = await axios.get(searchUrl);
				const movies = response.data;

				if (movies.Response === "True") {
					const movieList = movies.Search.map((movie) => `[**__${movie.Title}__**](https://www.imdb.com/title/${movie.imdbID}) (${movie.Year})`).join("\n");
					const embed = new EmbedBuilder().setTitle("Search Results").setDescription(movieList).setColor(global.config.embeds.colors.default); 

					await interaction.reply({ embeds: [embed] });
				} else {
					const embed = new EmbedBuilder().setTitle("Search Results").setDescription(global.config.emotes.fail + ` | No movies found!`).setColor(global.config.embeds.colors.fail);

					await interaction.reply({ embeds: [embed] });
				}
			} else if (subcommand === "info") {
				const response = await axios.get(url);
				const movie = response.data;
				const poster = movie.Poster && movie.Poster !== "N/A" ? movie.Poster : "https://ih1.redbubble.net/image.4905811447.8675/flat,750x,075,f-pad,750x1000,f8f8f8.jpg";
                
				if (movie.Response === "True") {
					const embed = new EmbedBuilder()
						.setTitle(movie.Title + " (" + movie.Year + ")")
						.setURL("https://www.imdb.com/title/" + movie.imdbID)
						.setDescription(`${movie.Plot}`)
						.setThumbnail(poster)
						.addFields(
							{
								name: "Release Date",
								value: movie.Released,
								inline: true,
							},
							{
								name: "Type",
								value: movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1),
								inline: true,
							},
							{
								name: "Genre",
								value: movie.Genre,
								inline: true,
							},
							{
								name: "Country",
								value: movie.Country,
								inline: true,
							},
							{
								name: "Language",
								value: movie.Language,
								inline: true,
							},
							{
								name: "Runtime",
								value: movie.Runtime,
								inline: true,
							},
                            {
                                name: "IMDb",
                                value: movie.Ratings && movie.Ratings[0] ? movie.Ratings[0].Value : "N/A",
                                inline: true,
                            },
                            {
                                name: "Rotten Tomatoes",
                                value: movie.Ratings && movie.Ratings[1] ? movie.Ratings[1].Value : "N/A",
                                inline: true,
                            },
                            {
                                name: "Metacritic",
                                value: movie.Ratings && movie.Ratings[2] ? movie.Ratings[2].Value : "N/A",
                                inline: true,
                            }
						)
						.setColor("#006aff")
						.setFooter({ text: "Powered by OMDB API" });

					await interaction.reply({ embeds: [embed] });
				} else {
					const embed = new EmbedBuilder().setDescription(global.config.emotes.fail + ` | Movie not found!`).setColor(global.config.embeds.colors.fail); 

					await interaction.reply({ embeds: [embed] });
				}
			}
		} catch (error) {
			console.error("Error fetching movie data:", error);
			const embed = new EmbedBuilder().setDescription(global.config.emotes.fail + " | There was an error fetching movie data. Please try again later.").setColor(global.config.embeds.colors.default);

			if (!interaction.replied) {
				await interaction.reply({ embeds: [embed] });
			} else {
				await interaction.followUp({ embeds: [embed] });
			}
		}
	},
};