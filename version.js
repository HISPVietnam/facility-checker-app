import jsonfile from "jsonfile"
import git from "git-last-commit";
import { format } from "date-fns";
import manifest from "./manifest.webapp.json" with { type:"json" }
const newVersion = process.env.VERSION;

git.getLastCommit((err, commit) => {
    const version = {};
    manifest.version = newVersion
    version.version = newVersion
    version.buildDate = format(new Date(), "yyyy-MM-dd HH:mm:ss OOOO")
    version.buildRevision = commit.shortHash
    jsonfile.writeFileSync("./src/assets/version.json", version)
    jsonfile.writeFileSync("./public/manifest.webapp", manifest)
});
