module.exports = {
  token: "",
  debug: false,
  clientId: "",
  prefix: ".",
  ownerId: "", //Required to add developers to the developers.json via a bot command.
  status: {
    statusType: "idle", //online, idle, dnd, invisible
    activityType: "Custom", //Playing, Streaming, Listening, Watching, Competing, Custom
    name: "custom", //This will not be shown in custom statuses.
    state: "Messing around in the console.", //Use for custom statuses. This is what is shown.
    url: "" //For streaming only, pretty much.
  }
}
