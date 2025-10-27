function logToTerminal(msg) {
  const terminal = document.getElementById("terminal");
  terminal.textContent += "\n> " + msg;
  terminal.scrollTop = terminal.scrollHeight;
}

function parseDelayInput(delayStr) {
  delayStr = delayStr.trim().toLowerCase();
  let minutes = 0, seconds = 0;
  if (delayStr.includes("m") && delayStr.includes("s")) {
    let [minPart, secPart] = delayStr.split("s")[0].split("m");
    minutes = parseInt(minPart) || 0;
    seconds = parseInt(secPart) || 0;
  } else if (delayStr.includes("m")) {
    minutes = parseInt(delayStr.replace("m", "")) || 0;
  } else if (delayStr.includes("s")) {
    seconds = parseInt(delayStr.replace("s", "")) || 0;
  }
  return [minutes, seconds];
}

function processGcode() {
  const fileInput = document.getElementById("fileInput");
  const delayInput = document.getElementById("delayInput").value;
  const copies = parseInt(document.getElementById("copiesInput").value);
  const height = parseFloat(document.getElementById("heightInput").value);

  if (!fileInput.files.length) {
    logToTerminal("No G-code file selected.");
    return;
  }
  if (isNaN(copies) || copies < 1) {
    logToTerminal("Invalid number of copies.");
    return;
  }
  if (isNaN(height) || height <= 0) {
    logToTerminal("Invalid object height.");
    return;
  }

  const file = fileInput.files[0];
  const originalName = file.name.replace(/\.gcode$/i, "");
  const reader = new FileReader();
  reader.onload = function (e) {
    const originalLines = e.target.result.split("\n");
    const [delayMin, delaySec] = parseDelayInput(delayInput);
    const totalDelay = delayMin * 60 + delaySec;

    let outputLines = [];
    for (let c = 0; c < copies; c++) {
      if (c > 0) outputLines.push(`\n; --- Copy ${c + 1} Start ---\n`);
      outputLines.push(...originalLines);
    }

    const finalBlock = [
      "M17 X0.8 Y0.8 Z0.5 ; lower motor current to 45% power",
      "M960 S5 P0 ; turn off logo lamp",
      "M73 P100 R0",
      "; EXECUTABLE_BLOCK_END",
      "",
      `; Cooldown delay ${delayMin}m ${delaySec}s`,
      `G4 S${totalDelay}`,
      "",
      "; --- PushTerm push-off sequence ---",
      "G90 ; Absolute positioning",
      "G1 Z5.00 F3000 ; Raise bed",
      "G1 Y0.00 F6000 ; Move Y",
      "G1 X220.00 Y0.00 F6000 ; Start push",
      "G4 S1 ; Pause",
      "G1 X250.00 Y0.00 F3000 ; Push",
      "G4 S1 ; Pause",
      "G28 X Y ; Rehome"
    ];

    outputLines.push(...finalBlock);

    const blob = new Blob([outputLines.join("\n")], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = originalName + "_modified.gcode";
    a.click();

    logToTerminal("✅ G-code processed and downloaded as " + a.download);
  };
  reader.readAsText(file);
}
