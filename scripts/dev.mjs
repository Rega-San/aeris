import { spawn } from "node:child_process";
const children = ["backend", "frontend"].map((folder) =>
  spawn("npm", ["--prefix", folder, "run", "dev"], { stdio: "inherit" }),
);
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
  process.exitCode = code;
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
for (const child of children) child.on("exit", (code) => stop(code || 0));
