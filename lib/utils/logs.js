const fs = require("fs");
const path = require("path");
const kleur = require("kleur");
const debugEnable = require("../index.js")

const getFormattedTimestamp = () => {
	const now = new Date();
	const dateOptions = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	};
	const timeOptions = {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	};
	const date = now.toLocaleDateString("de-DE", dateOptions);
	const time = now.toLocaleTimeString("de-DE", timeOptions);
	return `${date} ${time}`;
};

const log = {
	start: () => {
		const timestamp = getFormattedTimestamp();
		const logLine = `---------------------------------------- STARTUP - ${timestamp} ----------------------------------------\n`;
		fs.appendFileSync(path.join(__dirname, "../../logs/console.txt"), logLine);
	},
	info: (message) => {
		const timestamp = getFormattedTimestamp();
		const lines = message.split("\n");
		lines.forEach((line) => {
			const logLine = `[ INFO - ${timestamp} ] ${line}\n`;
			console.log(`[ ${kleur.blue("INFO")} - ${kleur.blue(timestamp)} ] ${line}`);
			fs.appendFileSync(path.join(__dirname, "../../logs/console.txt"), logLine);
		});
	},
	warn: (message) => {
		const timestamp = getFormattedTimestamp();
		const lines = message.split("\n");
		lines.forEach((line) => {
			const logLine = `[ WARN - ${timestamp} ] ${line}\n`;
			console.log(`[ ${kleur.yellow("WARN")} - ${kleur.yellow(timestamp)} ] ${line}`);
			fs.appendFileSync(path.join(__dirname, "../../logs/console.txt"), logLine);
		});
	},
	error: (message, killprocess = true) => {
		const timestamp = getFormattedTimestamp();
		const lines = message.split("\n");
		lines.forEach((line) => {
			const logLine = `[ ${killprocess ? "EXIT" : "ERRX"} - ${timestamp} ] ${line}\n`;
			console.log(`[ ${kleur.red(killprocess ? "EXIT" : "ERRX")} - ${kleur.red(timestamp)} ] ${line}`);
			fs.appendFileSync(path.join(__dirname, "../../logs/console.txt"), logLine);
		});
		if (killprocess) {
			process.exit();
		}
	},
	debug: (message) => {
        if (debugEnable) {
            const timestamp = getFormattedTimestamp();
            const lines = message.split("\n");
            lines.forEach((line) => {
                const logLine = `[ DEBG - ${timestamp} ] ${line}\n`;
                console.log(`[ ${kleur.cyan("DEBG")} - ${kleur.cyan(timestamp)} ] ${line}`);
                fs.appendFileSync(path.join(__dirname, "../../logs/console.txt"), logLine);
            });
        } 
	},
};

module.exports = log;
